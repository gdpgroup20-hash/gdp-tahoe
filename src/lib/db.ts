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
    VALUES ('mt-seed-stair-treads', 'turquoise', 'Patio Staircase', 'Sand & re-stain stair treads', 365, '2025-03-22', '2026-05-01', 'Use Armstrong Clark Semi-Transparent oil-based stain. Sand with 80-grit first, clean with deck brightener, apply 2 coats (2nd coat while 1st is tacky). Add aluminum stair nosing strips on tread edges for grip + protection. Verticals/rails only need re-staining every 2 years.', '2026-03-22')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES ('mt-seed-stair-rails', 'turquoise', 'Patio Staircase', 'Stain stair verticals & rails', 730, '2025-03-22', '2027-05-01', 'Armstrong Clark Semi-Transparent oil-based stain. Only needs re-staining every 2 years (less traffic/UV than treads).', '2026-03-22')
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
  await sql`
    CREATE TABLE IF NOT EXISTS email_campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      sent_at TEXT,
      recipient_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS email_campaign_recipients (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      opened INTEGER NOT NULL DEFAULT 0,
      clicked INTEGER NOT NULL DEFAULT 0,
      opened_at TEXT,
      clicked_at TEXT
    )
  `;
  await sql`
    INSERT INTO email_campaigns (id, name, subject, status, recipient_count, created_at)
    VALUES ('camp-staycation-2026', 'Staycation TV Feature', 'Elevation Estate is about to be on TV + a gift for you', 'draft', 0, '2026-03-23')
    ON CONFLICT (id) DO NOTHING
  `;

  // ─── Service contacts ───────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS service_vendors (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      company_name TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS service_contacts (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT ''
    )
  `;
  // Seed default categories
  await sql`
    INSERT INTO service_categories (id, name, sort_order) VALUES
      ('cat-hvac', 'HVAC', 1),
      ('cat-landscaping', 'Landscaping', 2),
      ('cat-electrician', 'Electrician', 3),
      ('cat-cleaning', 'Cleaning', 4),
      ('cat-windows', 'Windows', 5),
      ('cat-pest', 'Pest Control', 6)
    ON CONFLICT (id) DO NOTHING
  `;
  // Seed known vendors
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-athyme', 'cat-landscaping', 'A Thyme to Plant', 'athymetoplanttahoe.com', '', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-mxb', 'cat-windows', 'MXB Windows', 'mxbwindows.net', '', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  // Seed known contacts
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-shana', 'vendor-athyme', 'Shana Behan', 'shana@athymetoplanttahoe.com', '530-448-1440', '')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-juan', 'vendor-athyme', 'Juan Munoz', '', '530-414-6501', '')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-michael', 'vendor-mxb', 'Michael Brown', 'mxbwindows@gmail.com', '530-448-9001', '')
    ON CONFLICT (id) DO NOTHING
  `;

  // Add is_public column to service_categories
  await sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS is_public INTEGER NOT NULL DEFAULT 0`;

  // Guest recommendation categories + vendors
  await sql`
    INSERT INTO service_categories (id, name, sort_order) VALUES
      ('cat-watersports', 'Water Sports', 10),
      ('cat-chef', 'Private Chef / Catering', 11),
      ('cat-adventure', 'Adventure & Tours', 12),
      ('cat-concierge', 'Concierge', 13)
    ON CONFLICT (id) DO NOTHING
  `;

  // Mark guest-facing categories as public by default
  await sql`UPDATE service_categories SET is_public = 1 WHERE id IN ('cat-watersports', 'cat-chef', 'cat-adventure', 'cat-concierge')`;

  // North Tahoe Watersports
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-ntws', 'cat-watersports', 'North Tahoe Watersports Inc', 'northtahoewatersports.com', 'Parasailing, jet ski, kayak, SUP, pedal boats, boat rentals. 3 locations on North Shore. Hours: 9am-5pm Memorial Day–Labor Day. Grace recommends in every guest welcome email.', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-ntws-kingsbeach', 'vendor-ntws', 'Kings Beach Location', '', '530-546-9253', 'Kings Beach State Recreation Area, 8400 N Lake Blvd')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-ntws-tahoeciymarina', 'vendor-ntws', 'Tahoe City Marina Location', '', '530-583-7245', '700 N Lake Boulevard, Tahoe City')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-ntws-tahoeciyrental', 'vendor-ntws', 'Tahoe City Boat & Jet Ski Location', '', '530-583-9253', '120 Grove St, Tahoe City')
    ON CONFLICT (id) DO NOTHING
  `;

  // Truckee River Rafting
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-trr', 'cat-watersports', 'Truckee River Rafting', 'truckeeriverrafting.com', 'Self-guided 5-mile raft float from Tahoe City to River Ranch Pond. Family-friendly, dogs welcome. Grace recommends in every guest welcome email. Season: summer.', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-trr-main', 'vendor-trr', 'Main Office', '', '530-583-1111', '175 W. River Rd., Tahoe City, CA 96145')
    ON CONFLICT (id) DO NOTHING
  `;

  // Private Chefs
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-fedandfull', 'cat-chef', 'Fed and Full', 'fedandfull.com', 'Personal chef, Lake Tahoe. Organic, local ingredients. Experienced with large vacation rental groups. Grace''s top private chef recommendation. Instagram: @FED_AND_FULL', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-amy', 'vendor-fedandfull', 'Amy Lynne Power', 'amy@fedandfull.com', '925-683-0419', 'Chef / Owner')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-asuwish', 'cat-chef', 'As You Wish Catering', 'asuwishcatering.com', 'Tahoe-area catering. Note: website now redirects to Laughing Water Catering — may have rebranded. Verify contact still active. Grace recommended alongside Fed and Full.', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-mike-farrier', 'vendor-asuwish', 'Mike Farrier', '', '530-228-3111', 'Chef / Owner')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-tahoetapas', 'cat-chef', 'Tahoe Mountain Tapas', '', 'Private chef. Charges $200/hr for dinners. Standard 2-hr food service window. Miranda Worrell provided services for Elevation Aug 2025 guest stay.', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-miranda', 'vendor-tahoetapas', 'Miranda Worrell', 'tahoemountaintapas@gmail.com', '', 'Chef / Owner')
    ON CONFLICT (id) DO NOTHING
  `;

  // Paul Hamilton Hang Gliding
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-paulhamilton', 'cat-adventure', 'Paul Hamilton Hang Gliding', '', 'FAA Certified Flight Instructor. 30+ yrs unpowered, 20+ powered hang gliding. Every flight is a hands-on lesson. Flies from Carson City Airport, NV. Morning flights only, weather permitting. Max student weight 250 lbs. Grace recommends in guest emails.', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;

  // Concierge Eli
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-eli', 'cat-concierge', 'Eli (On-Site Concierge)', '', 'On-site concierge for Elevation Estate. Meets guests at check-in, provides house overview. Coordinates all concierge services: private chef, massage, chauffeur, babysitting, grocery delivery, gear rental, activity bookings.', '2026-03-27')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-eli', 'vendor-eli', 'Eli', '', '530-386-5491', 'Concierge — voice + text')
    ON CONFLICT (id) DO NOTHING
  `;
}
