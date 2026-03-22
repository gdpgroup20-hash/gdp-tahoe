import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      property_slug TEXT NOT NULL,
      property_name TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL DEFAULT '',
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      special_requests TEXT NOT NULL DEFAULT '',
      total_price NUMERIC NOT NULL DEFAULT 0,
      stripe_payment_intent_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS pricing (
      property_slug TEXT PRIMARY KEY,
      base_rate NUMERIC NOT NULL,
      cleaning_fee NUMERIC NOT NULL,
      weekly_discount NUMERIC NOT NULL DEFAULT 10,
      seasonal_rates JSONB NOT NULL DEFAULT '[]'
    )
  `;
  // Seed default pricing if empty
  await sql`
    INSERT INTO pricing (property_slug, base_rate, cleaning_fee, weekly_discount, seasonal_rates)
    VALUES ('elevation-estate', 5656, 500, 10, '[]')
    ON CONFLICT (property_slug) DO NOTHING
  `;
  await sql`
    INSERT INTO pricing (property_slug, base_rate, cleaning_fee, weekly_discount, seasonal_rates)
    VALUES ('turquoise', 883, 200, 10, '[]')
    ON CONFLICT (property_slug) DO NOTHING
  `;
}
