import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Waves,
  UtensilsCrossed,
  Flame,
  Mountain,
  Zap,
  ConciergeBell,
} from "lucide-react";

const properties = [
  {
    name: "Elevation Estate",
    slug: "elevation-estate",
    image: "/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg",
    specs: "Sleeps 12 \u00b7 7 Bed \u00b7 6.5 Bath",
    price: "From $5,656/night",
    tier: "Luxury",
    tierColor: "bg-amber-500",
  },
  {
    name: "Turquoise Tavern",
    slug: "turquoise",
    image: "/images/turquoise/photo_11.png",
    specs: "Sleeps 7 \u00b7 3 Bed \u00b7 2.5 Bath",
    price: "From $883/night",
    tier: "Premium",
    tierColor: "bg-sky-500",
  },
];

const experiences = [
  {
    icon: Waves,
    title: "Private Lake Access",
    description:
      "Step from your door to the pristine shores of Lake Tahoe with exclusive private beach and dock access.",
  },
  {
    icon: UtensilsCrossed,
    title: "Chef's Kitchens",
    description:
      "Professional-grade appliances and generous prep space designed for everything from family meals to catered events.",
  },
  {
    icon: Flame,
    title: "Hot Tubs & Spas",
    description:
      "Unwind under the stars in private hot tubs with sweeping mountain and lake views after a day on the slopes.",
  },
  {
    icon: Mountain,
    title: "Ski-In Convenience",
    description:
      "Minutes from world-class resorts. Store your gear in heated mudrooms and hit the mountain effortlessly.",
  },
  {
    icon: Zap,
    title: "EV Charging",
    description:
      "Dedicated Level 2 EV charging stations at every property so your vehicle is ready when you are.",
  },
  {
    icon: ConciergeBell,
    title: "Concierge Service",
    description:
      "From restaurant reservations to private ski instructors, our concierge team handles every detail of your stay.",
  },
];

const testimonials = [
  {
    quote:
      "We've rented luxury homes all over the world, and Elevation Estate is in a class of its own. The attention to detail is remarkable -- every fixture, every view, every amenity has been carefully considered.",
    name: "Sarah M.",
    title: "VP of Product, San Francisco",
  },
  {
    quote:
      "Booked Turquoise for a leadership off-site and it exceeded every expectation. The space was perfect for both focused work sessions and evening relaxation. Already planning our next trip.",
    name: "James K.",
    title: "CTO, Palo Alto",
  },
  {
    quote:
      "The concierge arranged everything from ski passes to a private chef dinner. We didn't have to think about a single logistic. It felt like staying at a five-star hotel with the privacy of your own home.",
    name: "Priya R.",
    title: "Founder & CEO, Seattle",
  },
];

export default function Home() {
  return (
    <main className="bg-white">
      {/* ───────────────────── Hero ───────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg"
          alt="Lake Tahoe panoramic view"
          fill
          priority
          className="object-cover"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d3d]/70 via-[#0f1d3d]/50 to-[#0f1d3d]/80" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/70 uppercase tracking-[0.35em] text-sm mb-6">
            GDP Tahoe
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.1] tracking-tight">
            Your Private
            <br />
            Tahoe Escape
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Curated luxury properties on the shores of Lake Tahoe -- where
            alpine grandeur meets refined modern living.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properties/elevation-estate"
              className="px-8 py-4 bg-white text-[#0f1d3d] text-sm uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors duration-300"
            >
              Explore Properties
            </Link>
            <Link
              href="/book/elevation-estate"
              className="px-8 py-4 border border-white/40 text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-white/10 transition-colors duration-300"
            >
              Book Now
            </Link>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-white/50" />
        </div>
      </section>

      {/* ───────────────────── Properties ───────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#0f1d3d]/50 uppercase tracking-[0.3em] text-sm text-center">
            Portfolio
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-light text-[#0f1d3d] text-center tracking-tight">
            Our Properties
          </h2>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            {properties.map((property) => (
              <Link
                key={property.slug}
                href={`/properties/${property.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-sm"
              >
                <Image
                  src={property.image}
                  alt={property.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d3d]/90 via-[#0f1d3d]/20 to-transparent" />

                {/* tier badge */}
                <span
                  className={cn(
                    "absolute top-6 left-6 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white rounded-sm",
                    property.tierColor
                  )}
                >
                  {property.tier}
                </span>

                {/* info */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                    {property.name}
                  </h3>
                  <p className="mt-2 text-white/70 text-sm tracking-wide">
                    {property.specs}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-white text-lg font-light">
                      {property.price}
                    </span>
                    <span className="text-white/60 text-sm uppercase tracking-[0.15em] group-hover:text-white transition-colors duration-300">
                      View Property &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── Experience ───────────────────── */}
      <section className="py-32 px-6 bg-[#f8f7f5]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#0f1d3d]/50 uppercase tracking-[0.3em] text-sm text-center">
            Amenities
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-light text-[#0f1d3d] text-center tracking-tight">
            The GDP Tahoe Experience
          </h2>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {experiences.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-[#0f1d3d]/5">
                    <Icon className="w-6 h-6 text-[#0f1d3d]/70" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-[#0f1d3d] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[#0f1d3d]/60 leading-relaxed text-sm max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────── Social Proof ───────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#0f1d3d]/50 uppercase tracking-[0.3em] text-sm text-center">
            Guest Stories
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-light text-[#0f1d3d] text-center tracking-tight">
            What Our Guests Say
          </h2>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="border border-[#0f1d3d]/10 rounded-sm p-10 flex flex-col justify-between"
              >
                <blockquote className="text-[#0f1d3d]/70 leading-relaxed text-[15px] italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-8 pt-6 border-t border-[#0f1d3d]/10">
                  <p className="text-[#0f1d3d] font-medium text-sm">
                    {t.name}
                  </p>
                  <p className="text-[#0f1d3d]/50 text-xs mt-1 tracking-wide">
                    {t.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── Final CTA ───────────────────── */}
      <section className="py-32 px-6 bg-[#0f1d3d]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light text-white tracking-tight">
            Ready to Experience Tahoe?
          </h2>
          <p className="mt-6 text-white/60 text-lg font-light leading-relaxed max-w-xl mx-auto">
            Reserve your dates and discover what it means to truly escape.
          </p>
          <Link
            href="/book/elevation-estate"
            className="inline-block mt-12 px-10 py-4 bg-white text-[#0f1d3d] text-sm uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors duration-300"
          >
            Book Your Stay
          </Link>
        </div>
      </section>
    </main>
  );
}
