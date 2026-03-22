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
  await sql`
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
      id TEXT PRIMARY KEY,
      property TEXT NOT NULL,
      appliance TEXT NOT NULL,
      task TEXT NOT NULL,
      interval_days INTEGER NOT NULL,
      last_completed TEXT,
      next_due TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `;
  // Seed maintenance tasks
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-ice-maker', 'elevation-estate', 'Ice Maker', 'Clean ice maker', 180, '2026-03-22', '2026-09-22', 'IcePure HBZB-36F. Installed 2026-03-22.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-deck-oil', 'elevation-estate', 'Decks', 'Oil decks', 365, '2026-03-22', '2027-03-22', 'Previously oiled Apr 1 2025. Oiled again Mar 22 2026.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-deck-sand', 'elevation-estate', 'Decks', 'Sand decks', 730, '2025-04-01', '2027-04-01', 'Sanded and oiled Apr 1 2025. Next sanding due Apr 2027.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-windows', 'elevation-estate', 'Windows', 'Clean windows', 365, '2024-05-01', '2026-05-01', 'MXB Windows — Michael Brown 530-448-9001. Cleaned May 2023 (Invoice 3837 $3,400) and May 2024. Missed 2025.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-landscaping-spring', 'both', 'Landscaping', 'Spring clean-up & irrigation activation', 365, '2025-05-08', '2026-05-01', 'A Thyme to Plant — Shana Behan 530-448-1440 shana@athymetoplanttahoe.com. Both 6229 NLB and 5233 Turquoise. Spring clean-up + pine needles + irrigation on. She emailed Mar 22 2026 touching base for this season.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-landscaping-fall', 'both', 'Landscaping', 'Fall winterization & irrigation off', 365, '2025-10-01', '2026-10-01', 'A Thyme to Plant — Shana Behan 530-448-1440 shana@athymetoplanttahoe.com. Both properties. Irrigation winterization + fall garden clean-up.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
}
