import { getBookingsByProperty } from "./bookings";
import { getPricingConfig, getSeasonalRate } from "./pricing";

export interface BlockedDateRange {
  start: string;
  end: string;
  source: string;
}

// iCal feed URLs from Lodgify (syncs Airbnb + VRBO bookings)
const ICAL_FEEDS: Record<string, string[]> = {
  "elevation-estate": [
    process.env.ICAL_ELEVATION_URL_1 || "https://www.lodgify.com/6cf30c20-e52f-42b8-b2ad-d8e94108a3a5.ics",
  ],
  turquoise: [
    process.env.ICAL_TURQUOISE_URL_1 || "https://www.lodgify.com/f946c691-e7f0-4fd2-b6d1-acbfd1b40617.ics",
  ],
};

/**
 * Parse iCal text and extract all blocked date ranges.
 * Handles DTSTART/DTEND with VALUE=DATE and datetime formats.
 */
function parseIcal(text: string): { start: Date; end: Date }[] {
  const ranges: { start: Date; end: Date }[] = [];
  const events = text.split("BEGIN:VEVENT");
  for (const event of events.slice(1)) {
    const startMatch = event.match(/DTSTART(?:;[^:]+)?:(\d{8})/);
    const endMatch = event.match(/DTEND(?:;[^:]+)?:(\d{8})/);
    if (startMatch && endMatch) {
      const parseDate = (s: string) =>
        new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
      ranges.push({ start: parseDate(startMatch[1]), end: parseDate(endMatch[1]) });
    }
  }
  return ranges;
}

/**
 * Fetch iCal feeds for a property and return blocked dates.
 */
async function getIcalBlockedDates(propertySlug: string): Promise<Set<string>> {
  const blocked = new Set<string>();
  const feeds = ICAL_FEEDS[propertySlug] || [];

  for (const url of feeds) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
      if (!res.ok) continue;
      const text = await res.text();
      const ranges = parseIcal(text);
      for (const { start, end } of ranges) {
        const current = new Date(start);
        while (current < end) {
          blocked.add(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
      }
    } catch {
      // Silently fail — calendar will show dates as available if feed is unreachable
    }
  }
  return blocked;
}

export async function getBlockedDates(
  propertySlug: string
): Promise<string[]> {
  // Fetch from iCal feeds (Lodgify syncs Airbnb + VRBO)
  const blocked = await getIcalBlockedDates(propertySlug);

  // Also add dates from direct bookings on staygdptahoe.com
  try {
    const bookings = await getBookingsByProperty(propertySlug);
    for (const booking of bookings) {
      if (booking.status === "cancelled") continue;
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const current = new Date(start);
      while (current < end) {
        blocked.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }
  } catch {
    // DB unavailable — iCal data still works
  }

  return Array.from(blocked).sort();
}

export function calculatePrice(
  nightlyRate: number,
  weeklyDiscount: number,
  cleaningFee: number,
  checkIn: string,
  checkOut: string
): {
  nights: number;
  subtotal: number;
  discount: number;
  cleaningFee: number;
  total: number;
} {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const subtotal = nights * nightlyRate;
  const discount =
    nights >= 7 ? Math.round(subtotal * (weeklyDiscount / 100)) : 0;
  const total = subtotal - discount + cleaningFee;

  return { nights, subtotal, discount, cleaningFee, total };
}

export async function calculatePriceWithSeasonalRates(
  propertySlug: string,
  nightlyRate: number,
  weeklyDiscount: number,
  cleaningFee: number,
  checkIn: string,
  checkOut: string
): Promise<{
  nights: number;
  subtotal: number;
  discount: number;
  cleaningFee: number;
  total: number;
}> {
  const pricingConfig = await getPricingConfig();
  const propertyPricing = pricingConfig[propertySlug];
  const seasonalRates = propertyPricing?.seasonalRates ?? [];

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  let subtotal = 0;
  const current = new Date(start);
  for (let i = 0; i < nights; i++) {
    const dateStr = current.toISOString().split("T")[0];
    const seasonalRate = getSeasonalRate(seasonalRates, dateStr);
    subtotal += seasonalRate ?? nightlyRate;
    current.setDate(current.getDate() + 1);
  }

  const effectiveWeeklyDiscount = propertyPricing?.weeklyDiscount ?? weeklyDiscount;
  const effectiveCleaningFee = propertyPricing?.cleaningFee ?? cleaningFee;

  const discount =
    nights >= 7 ? Math.round(subtotal * (effectiveWeeklyDiscount / 100)) : 0;
  const total = subtotal - discount + effectiveCleaningFee;

  return { nights, subtotal, discount, cleaningFee: effectiveCleaningFee, total };
}
