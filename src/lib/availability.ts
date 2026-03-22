import { getBookingsByProperty } from "./bookings";
import { getPricingConfig, getSeasonalRate } from "./pricing";

// Static blocked dates for demo purposes.
// In production, these would come from iCal feeds (Airbnb, VRBO, etc.)
const STATIC_BLOCKED_DATES: Record<string, string[]> = {
  "elevation-estate": [
    // Example: block some dates for demo
  ],
  turquoise: [],
};

export interface BlockedDateRange {
  start: string;
  end: string;
  source: string;
}

/**
 * Parse iCal feed URL and extract blocked date ranges.
 * In production, replace the static dates with actual iCal parsing:
 *
 * import ical from 'node-ical';
 * const events = await ical.async.fromURL(icalUrl);
 */
export async function getBlockedDates(
  propertySlug: string
): Promise<string[]> {
  const blocked = new Set<string>(
    STATIC_BLOCKED_DATES[propertySlug] || []
  );

  // Add dates from confirmed bookings
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
