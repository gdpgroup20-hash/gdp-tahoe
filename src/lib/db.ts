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
      created_at TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT ''
    )
  `;
  await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT ''
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
      ('cat-adventure', 'Adventure & Tours', 12)
    ON CONFLICT (id) DO NOTHING
  `;

  // Mark guest-facing categories as public by default
  await sql`UPDATE service_categories SET is_public = 1 WHERE id IN ('cat-watersports', 'cat-chef', 'cat-adventure')`;

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


  // Relax + Dining + Hike categories
  await sql`
    INSERT INTO service_categories (id, name, sort_order, is_public) VALUES
      ('cat-relax', 'Relax', 20, 1),
      ('cat-dining', 'Lakeside Dining', 21, 1),
      ('cat-hike', 'Hiking', 22, 1)
    ON CONFLICT (id) DO NOTHING
  `;

  // Hiking spots
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-waterfalls', 'cat-hike', 'Tahoe Waterfalls', 'tahoerim.org', 'Due to an abundant amount of spring runoff, there are quite a few incredible waterfalls in Lake Tahoe. Best time to visit is late spring and early summer when they are at their peak. Well-known waterfalls such as Eagle Falls and Glen Alpine Falls are easily accessible via a short hike. Also check out the waterfalls on the Tahoe Rim Trail, a 165-mile loop around Lake Tahoe.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-eaglefalls', 'vendor-hike-waterfalls', 'Eagle Falls Trail', '', '', 'https://www.fs.usda.gov/recarea/ltbmu/recarea/?recid=11783')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-tahoewaterfalls', 'vendor-hike-waterfalls', 'Tahoe Rim Trail Waterfalls', '', '', 'https://tahoerimtrail.org/trail-conditions/')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-emerald', 'cat-hike', 'Emerald Bay', 'parks.ca.gov/?page_id=507', 'One of the most iconic spots in Lake Tahoe with some of the most beautiful views of the lake. Enjoy the Emerald Bay Overlook or hike down to the beach. From here, check out Vikingsholm Castle, hike to Lower Eagle Falls, pick up the Rubicon Trail, or rent a paddleboard and paddle out to Fannette Island. The Eagle Lake Trail follows Eagle Creek past Eagle Falls to Eagle Lake.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-rubicon', 'vendor-hike-emerald', 'Rubicon Trail', '', '', 'https://www.alltrails.com/trail/us/california/rubicon-trail')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-eaglelake', 'vendor-hike-emerald', 'Eagle Lake Trail', '', '', 'https://www.alltrails.com/trail/us/california/eagle-lake-trail')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-stateline', 'cat-hike', 'State Line Fire Lookout', 'parks.ca.gov', 'Stateline Fire Lookout in Kings Beach is a short hike that offers stunning views overlooking Crystal Bay and the north shore. Gets its name from an old fire lookout tower from the 1930s. Numerous educational plaques with facts about Lake Tahoe and its logging history.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-stateline', 'vendor-hike-stateline', 'Trail Info', '', '', 'https://www.alltrails.com/trail/us/california/stateline-fire-lookout-trail')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-monkeyrock', 'cat-hike', 'Monkey Rock', 'alltrails.com', 'A relatively short but steep hike along the Flume Trail offering stunning views over Incline Village and Tahoe''s east shore. The trailhead is located behind Tunnel Creek Cafe on Highway 28 in Incline Village.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-monkeyrock', 'vendor-hike-monkeyrock', 'Monkey Rock Trail', '', '', 'https://www.alltrails.com/trail/us/nevada/monkey-rock-trail')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-tunnelcreekcafe', 'vendor-hike-monkeyrock', 'Tunnel Creek Cafe (Trailhead)', '', '', 'https://www.tunnelcreekcafe.com')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-caverock', 'cat-hike', 'Cave Rock', 'parks.ca.gov', 'A short hike with beautiful views over South Lake Tahoe — also a prime spot to catch the sunset. The trail takes about 10 minutes and includes some light bouldering to reach the highest viewpoint. Stunning 180-degree views overlooking South Lake Tahoe. Trailhead on Cave Rock Drive right off Highway 50.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-caverock', 'vendor-hike-caverock', 'Cave Rock Trail', '', '', 'https://www.alltrails.com/trail/us/nevada/cave-rock-trail')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-sandharbor', 'cat-hike', 'Sand Harbor Overlook', 'parks.ca.gov', 'Located on Tahoe''s east shore, Sand Harbor Overlook is a short and easy little trail that leads to a beautiful lookout over the north side of Sand Harbor. Can be accessed off State Route 28 or directly from the East Shore Bike Trail.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-sandharbor', 'vendor-hike-sandharbor', 'Sand Harbor Overlook Trail', '', '', 'https://www.alltrails.com/trail/us/nevada/sand-harbor-overlook-trail')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-eastshore', 'vendor-hike-sandharbor', 'East Shore Bike Trail', '', '', 'https://www.tahoeeastshore.com')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-hike-spoonerlake', 'cat-hike', 'Spooner Lake / North Canyon Road', 'parks.ca.gov', 'The trails around Spooner Lake are known for their spectacular displays of fall color. North Canyon Road is a picturesque trail lined on both sides with brilliant yellow and orange aspen trees — the fall colors hit you right at the start. For a longer hike, check out Marlette Lake trail from Spooner Lake.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-spoonerlake', 'vendor-hike-spoonerlake', 'Spooner Lake Trail', '', '', 'https://www.alltrails.com/trail/us/nevada/spooner-lake-loop')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-hike-marlette', 'vendor-hike-spoonerlake', 'Marlette Lake Trail', '', '', 'https://www.alltrails.com/trail/us/nevada/marlette-lake-trail')
    ON CONFLICT (id) DO NOTHING
  `;

  // ─── Expenses ───────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      vendor TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Uncategorized',
      property TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      gmail_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-edgewood', 'cat-relax', 'Edgewood Resort & Spa', 'edgewoodtahoe.com', 'Forbes Travel Guide 4-Star rated spa on the South Shore of Lake Tahoe. Exclusive gemstone rituals, holistic massages using locally-sourced stones such as Smoky Quartz. Full resort with lodging, golf, and fine dining.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-edgewood-res', 'vendor-edgewood', 'Reservations', '', '(888) 881-8659', 'Lodge Reservations')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-edgewood-conc', 'vendor-edgewood', 'Concierge', '', '(844) 548-3446', 'Concierge Services')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-sierrahotsprings', 'cat-relax', 'Sierra Hot Springs', 'sierrahotsprings.org', 'Natural hot springs resort in Sierraville, ~45 min from Tahoe. Hot Pool (105-110°) in a geodesic dome with stained glass skylights. Warm Pool (98-100°), Meditation Pool (outdoor, rock tile), and private Phoenix Baths. Massage available. Clothing optional. Open Wed–Sun for reservations.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-sierrahs-main', 'vendor-sierrahotsprings', 'Reservations', 'info@sierrahotsprings.org', '530-994-3773', '521 Campbell Hot Springs Rd, Sierraville, CA 96126 — Wed–Sun 9:30am–5pm')
    ON CONFLICT (id) DO NOTHING
  `;

  // Lakeside Dining vendors
  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-garwoods', 'cat-dining', 'Gar Woods Grill & Pier', 'garwoods.com', 'The most iconic restaurant on the North Shore. Right on the lake in Carnelian Bay — 5-min walk from Turquoise Tavern. Famous for the Wet Woody cocktail. Lakeside patio, casual-upscale. 5000 N Lake Blvd, Carnelian Bay.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-garwoods-main', 'vendor-garwoods', 'Reservations', '', '530-546-3366', '5000 North Lake Blvd, Carnelian Bay, CA')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-chambers', 'cat-dining', 'Chambers Landing Bar & Grill', 'chamberslanding.com', 'Historic lakeside bar and grill in Tahoma on the West Shore. Famous for the Chambers Punch. One of Tahoe''s most beloved summer spots with a stunning pier over the lake.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-chambers-main', 'vendor-chambers', 'Restaurant', '', '(530) 270-9515', '600 W. Lake Blvd., Tahoma, CA')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-jakes', 'cat-dining', 'Jakes on the Lake', 'jakestahoe.com', 'Lakeside dining in Tahoe City with stunning views, fresh seafood and cocktails. Casual-upscale. Great for dinner with a view of the lake.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-jakes-main', 'vendor-jakes', 'Restaurant', '', '(530) 583-0188', '780 N Lake Blvd, Tahoe City, CA')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-christyhill', 'cat-dining', 'Christy Hill', 'christyhill.com', 'Fine dining overlooking Lake Tahoe in Tahoe City. One of North Tahoe''s premier upscale restaurants. Mediterranean-inspired menu, excellent wine list, romantic atmosphere.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-christyhill-main', 'vendor-christyhill', 'Restaurant', '', '(530) 583-8551', '115 Grove St, Tahoe City, CA')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-sunnyside', 'cat-dining', 'Sunnyside Restaurant & Lodge', 'sunnysidelodge.com', 'Classic lakeside lodge restaurant on the West Shore. One of Tahoe''s most popular spots for lunch and dinner on the water. Known for the best deck on the lake.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-sunnyside-main', 'vendor-sunnyside', 'Restaurant', '', '(530) 583-7200', '1850 West Lake Blvd, Tahoe City, CA')
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO service_vendors (id, category_id, company_name, website, notes, created_at)
    VALUES ('vendor-westshore', 'cat-dining', 'West Shore Cafe & Inn', 'westshorecafe.com', 'Waterfront dining in Homewood on the West Shore. Fresh, locally-sourced cuisine with a beautiful lakeside setting. Perfect for a special dinner or lazy lakeside lunch.', '2026-03-28')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO service_contacts (id, vendor_id, name, email, phone, role)
    VALUES ('contact-westshore-main', 'vendor-westshore', 'Restaurant', '', '(530) 525-5200', '5160 West Lake Blvd., Homewood, CA')
    ON CONFLICT (id) DO NOTHING
  `;
}
