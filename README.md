# GDP Tahoe - Luxury Lake Tahoe Vacation Rentals

A production-ready vacation rental website for GDP Tahoe, featuring two luxury properties in Lake Tahoe, California. Built with Next.js 14, TypeScript, Tailwind CSS, Stripe payments, and iCal sync.

## Properties

- **Elevation Estate** - Flagship luxury lakefront estate. 4 bed/4 bath, sleeps 10. $1,200/night.
- **Turquoise** - Premium mountain retreat. 3 bed/2 bath, sleeps 8. $500/night.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Payments:** Stripe (PaymentIntents)
- **Email:** Resend (transactional confirmation emails)
- **Calendar:** react-day-picker for date selection, ical-generator for iCal export
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd gdp-tahoe
npm install
```

### Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

| Variable | Description | Where to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| `RESEND_API_KEY` | Resend API key for emails | [Resend Dashboard](https://resend.com/api-keys) |
| `EMAIL_FROM` | Sender email address | Must be verified in Resend |
| `ADMIN_PASSWORD` | Password for the admin dashboard | Choose a strong password |
| `ICAL_ELEVATION_ESTATE_URL` | iCal feed URL from Airbnb/VRBO (optional) | Your Airbnb/VRBO listing settings |
| `ICAL_TURQUOISE_URL` | iCal feed URL from Airbnb/VRBO (optional) | Your Airbnb/VRBO listing settings |
| `NEXT_PUBLIC_SITE_URL` | Your deployed site URL | Your domain |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Site Structure

| Route | Description |
|---|---|
| `/` | Homepage with hero, property cards, features, testimonials |
| `/properties/elevation-estate` | Elevation Estate property page with gallery, amenities, pricing |
| `/properties/turquoise` | Turquoise property page |
| `/book/elevation-estate` | Booking flow for Elevation Estate |
| `/book/turquoise` | Booking flow for Turquoise |
| `/admin` | Password-protected admin dashboard |

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/availability?property=<slug>` | GET | Returns blocked dates for a property |
| `/api/book` | POST | Creates a booking + Stripe PaymentIntent |
| `/api/webhooks/stripe` | POST | Handles Stripe webhook events (payment confirmation) |
| `/api/ical/<property-slug>` | GET | iCal feed export for Airbnb/VRBO sync |
| `/api/admin/bookings` | GET | Returns all bookings (requires `Authorization: Bearer <password>`) |

## Stripe Setup

1. Create a [Stripe account](https://stripe.com) and get your test API keys
2. Add your keys to `.env.local`
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`
5. For production, create a webhook endpoint in the Stripe Dashboard pointing to `https://yourdomain.com/api/webhooks/stripe` with event `payment_intent.succeeded`

## Resend Email Setup

1. Create a [Resend account](https://resend.com)
2. Verify your domain or use the onboarding email
3. Create an API key and add it to `RESEND_API_KEY`
4. Set `EMAIL_FROM` to a verified sender address

## iCal Sync (Airbnb/VRBO)

### Exporting bookings to Airbnb/VRBO

Add these iCal feed URLs to your Airbnb/VRBO listing:

- Elevation Estate: `https://yourdomain.com/api/ical/elevation-estate`
- Turquoise: `https://yourdomain.com/api/ical/turquoise`

### Importing blocked dates from Airbnb/VRBO

1. Get the iCal export URL from your Airbnb/VRBO listing settings
2. Add the URLs to your `.env.local`:
   ```
   ICAL_ELEVATION_ESTATE_URL=https://www.airbnb.com/calendar/ical/xxxxx.ics
   ICAL_TURQUOISE_URL=https://www.airbnb.com/calendar/ical/xxxxx.ics
   ```
3. Update `src/lib/availability.ts` to parse iCal feeds using `node-ical` (already installed)

## Admin Dashboard

Access the admin dashboard at `/admin`. Enter the password configured in `ADMIN_PASSWORD`.

Features:
- View all bookings with status, guest info, and pricing
- Filter by property and booking status
- Real-time revenue summary
- Auto-refreshes every 30 seconds

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in the Vercel project settings
4. Deploy

```bash
npx vercel
```

### Important for production:

- Replace Stripe test keys with live keys
- Set up Stripe webhook endpoint for your production domain
- Verify your email domain in Resend
- Set `NEXT_PUBLIC_SITE_URL` to your production URL
- Set a strong `ADMIN_PASSWORD`
- Replace placeholder images with actual property photos

## Data Storage

Bookings are stored in `data/bookings.json` for the MVP. For production, migrate to a proper database (PostgreSQL, Supabase, etc.). The booking functions in `src/lib/bookings.ts` are the only interface -- swap the implementation without changing the API.

## Project Structure

```
src/
  app/
    page.tsx                    # Homepage
    layout.tsx                  # Root layout with navbar/footer
    admin/page.tsx              # Admin dashboard
    book/[property]/page.tsx    # Booking flow
    properties/[slug]/page.tsx  # Property detail pages
    api/
      availability/route.ts    # Blocked dates API
      book/route.ts            # Booking + payment API
      webhooks/stripe/route.ts # Stripe webhook handler
      ical/[property]/route.ts # iCal export
      admin/bookings/route.ts  # Admin bookings API
  components/
    navbar.tsx                  # Site navigation
    footer.tsx                  # Site footer
    booking-form.tsx            # Booking form client component
    ui/                         # shadcn/ui components
  lib/
    properties.ts               # Property data and types
    bookings.ts                 # Booking CRUD operations
    availability.ts             # Date availability + pricing
    utils.ts                    # Utility functions
```
