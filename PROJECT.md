# GDP Tahoe — Project Context

## What This Is
A direct booking website for AvB's two Lake Tahoe vacation rental properties. The goal is to move bookings off Airbnb/VRBO (which charge ~15-20% fees) and onto a direct booking platform where GDP Tahoe owns the guest relationship.

## Owner
- **Name:** Andrew (AvB)
- **Current site:** https://gdp-tahoe.com (Lodgify-powered — we are replacing this)
- **Instagram:** https://www.instagram.com/gdp_tahoe/
- **Stripe account:** Exists, keys need to be wired in
- **New domain:** staygdptahoe.com (confirmed available, AvB is registering)

## The Properties

### Elevation Estate (luxury flagship)
- Sleeps 10, 4 bed / 4 bath
- Private lake access, hot tub, chef's kitchen, game room
- Amenities: WiFi, EV charging, ski storage, fire pit, kayaks, paddleboards
- ~$1,200/night base rate
- Target guest: tech executives, wealthy families, discerning travelers

### Turquoise (mid-tier)
- Sleeps 8, 3 bed / 2 bath
- Lake views, deck with BBQ, cozy mountain feel
- Amenities: WiFi, hot tub, fireplace, ski storage
- ~$500/night base rate

## Design Direction
- Clean, minimal, lots of white space — think boutique hotel not VRBO
- Target audience: tech-savvy, affluent, someone who books Four Seasons but wants a private house
- Full-bleed photography, typography-forward
- Deep navy or forest green accent (not generic blue)
- Mobile-first

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Stripe (payments)
- Resend (transactional emails)
- iCal sync (Airbnb/VRBO calendar integration)
- Deploy target: Vercel

## Architecture Decisions
- **One site, two properties** (not separate sites) — easier to manage, cross-sells, builds GDP Tahoe brand
- Simple JSON-based booking store for MVP (can migrate to DB later)
- iCal export so new direct bookings automatically block Airbnb/VRBO calendars
- Password-protected /admin page to view bookings

## What's Been Built
Full Next.js site at ~/Projects/gdp-tahoe including:
- Homepage (hero + both property listings + social proof)
- /properties/elevation-estate
- /properties/turquoise
- /book/[property] — booking flow with calendar + Stripe
- /admin — bookings dashboard
- API routes: availability, book, Stripe webhook, iCal export

## Next Steps
1. AvB registers staygdptahoe.com (Cloudflare or Namecheap recommended)
2. Wire in Stripe keys (test mode first)
3. Set up Resend account for emails
4. Get iCal URLs from Airbnb/VRBO listings for availability sync
5. Preview locally: `npm run dev`
6. Replace placeholder photos with real property photos
7. Deploy to Vercel, point domain

## Environment Variables Needed
See .env.example in the project root for full list. Key ones:
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- ADMIN_PASSWORD
- AIRBNB_ICAL_ELEVATION (iCal URL from Airbnb listing)
- AIRBNB_ICAL_TURQUOISE
- VRBO_ICAL_ELEVATION
- VRBO_ICAL_TURQUOISE
