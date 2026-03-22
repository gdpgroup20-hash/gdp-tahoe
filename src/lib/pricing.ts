import { promises as fs } from "fs";
import path from "path";

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

const PRICING_FILE = path.join(process.cwd(), "src", "data", "pricing.json");

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const data = await fs.readFile(PRICING_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
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
