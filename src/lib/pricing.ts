import { getDb, initDb } from "@/lib/db";

export interface SeasonalRate {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  rate: number;
}

export interface PropertyPricing {
  baseRate: number;
  cleaningFee: number;
  weeklyDiscount: number;
  seasonalRates: SeasonalRate[];
}

export type PricingConfig = Record<string, PropertyPricing>;

function rowToPricing(row: Record<string, unknown>): PropertyPricing {
  return {
    baseRate: Number(row.base_rate),
    cleaningFee: Number(row.cleaning_fee),
    weeklyDiscount: Number(row.weekly_discount),
    seasonalRates: (row.seasonal_rates as SeasonalRate[]) ?? [],
  };
}

export async function getPricingConfig(): Promise<PricingConfig> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM pricing`;
  const config: PricingConfig = {};
  for (const row of rows) {
    config[row.property_slug as string] = rowToPricing(row);
  }
  return config;
}

export async function getPricingForProperty(slug: string): Promise<PropertyPricing | null> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM pricing WHERE property_slug = ${slug}`;
  return rows.length > 0 ? rowToPricing(rows[0]) : null;
}

export async function updatePricing(slug: string, pricing: PropertyPricing): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`
    INSERT INTO pricing (property_slug, base_rate, cleaning_fee, weekly_discount, seasonal_rates)
    VALUES (${slug}, ${pricing.baseRate}, ${pricing.cleaningFee}, ${pricing.weeklyDiscount}, ${JSON.stringify(pricing.seasonalRates)})
    ON CONFLICT (property_slug) DO UPDATE SET
      base_rate = EXCLUDED.base_rate,
      cleaning_fee = EXCLUDED.cleaning_fee,
      weekly_discount = EXCLUDED.weekly_discount,
      seasonal_rates = EXCLUDED.seasonal_rates
  `;
}

export function getSeasonalRate(
  seasonalRates: SeasonalRate[],
  date: string
): number | null {
  for (const sr of seasonalRates) {
    if (date >= sr.startDate && date <= sr.endDate) {
      return sr.rate;
    }
  }
  return null;
}
