import { getBookingsByProperty } from "./bookings";
import { getPricingConfig, getSeasonalRate } from "./pricing";

export interface BlockedDateRange {
  start: string;
  end: string;
  source: string;
}

export interface BlockedDateWithSource {
  date: string;
  source: "airbnb" | "vrbo" | "direct";
}

// iCal feed URLs tagged with source
const ICAL_FEEDS: Record<string, { url: string; source: "airbnb" | "vrbo" }[]> = {
  "elevation-estate": [
    { url: process.env.ICAL_ELEVATION_LODGIFY || "https://www.lodgify.com/f946c691-e7f0-4fd2-b6d1-acbfd1b40617.ics", source: "airbnb" },
    { url: process.env.ICAL_ELEVATION_VRBO || "http://www.vrbo.com/icalendar/eae21f209cd845b79223ecfa1fa44f89.ics", source: "vrbo" },
  ],
  turquoise: [
    { url: process.env.ICAL_TURQUOISE_LODGIFY || "https://www.lodgify.com/6cf30c20-e52f-42b8-b2ad-d8e94108a3a5.ics", source: "airbnb" },
    { url: process.env.ICAL_TURQUOISE_VRBO || "http://www.vrbo.com/icalendar/8e48b069b0e64f259c5f04f9ffaa3f4d.ics", source: "vrbo" },
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
 * Fetch iCal feeds for a property and return blocked dates with source.
 */
async function getIcalBlockedDates(propertySlug: string): Promise<BlockedDateWithSource[]> {
  const results: BlockedDateWithSource[] = [];
  const feeds = ICAL_FEEDS[propertySlug] || [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, { next: { revalidate: 3600 } }); // cache 1 hour
      if (!res.ok) continue;
      const text = await res.text();
      const ranges = parseIcal(text);
      for (const { start, end } of ranges) {
        const current = new Date(start);
        while (current < end) {
          results.push({
            date: current.toISOString().split("T")[0],
            source: feed.source,
          });
          current.setDate(current.getDate() + 1);
        }
      }
    } catch {
      // Silently fail — calendar will show dates as available if feed is unreachable
    }
  }
  return results;
}

export async function getBlockedDates(
  propertySlug: string
): Promise<BlockedDateWithSource[]> {
  // Fetch from iCal feeds with source tags
  const icalDates = await getIcalBlockedDates(propertySlug);

  // Use a map to deduplicate by date (first source wins)
  const dateMap = new Map<string, BlockedDateWithSource>();
  for (const entry of icalDates) {
    if (!dateMap.has(entry.date)) {
      dateMap.set(entry.date, entry);
    }
  }

  // Also add dates from direct bookings on staygdptahoe.com
  try {
    const bookings = await getBookingsByProperty(propertySlug);
    for (const booking of bookings) {
      if (booking.status === "cancelled") continue;
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const current = new Date(start);
      while (current < end) {
        const dateStr = current.toISOString().split("T")[0];
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { date: dateStr, source: "direct" });
        }
        current.setDate(current.getDate() + 1);
      }
    }
  } catch {
    // DB unavailable — iCal data still works
  }

  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
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
