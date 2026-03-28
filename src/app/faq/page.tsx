"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

// Property-specific facts shown as cards
const elevationFacts = [
  { label: "Guests", value: "Sleeps up to 12" },
  { label: "Bedrooms", value: "7 bedrooms — 4 kings, bunk room, 2 singles, queen Murphy" },
  { label: "Bathrooms", value: "6.5 baths" },
  { label: "Size", value: "5,800 sq ft across main house, guest house & studio" },
  { label: "Lake Access", value: "Direct lakefront on Agate Bay — private deep-water pier" },
  { label: "Views", value: "270° panoramic lake views from up to 70 feet above the water" },
  { label: "Hot Tub", value: "No hot tub — multiple decks with fireplaces & heaters" },
  { label: "Special Features", value: "Two 3-story elevators, Gaggenau & Sub-Zero kitchen, EV charger, cocktail deck" },
  { label: "Award", value: "Tahoe Quarterly Outstanding Mountain Home of the Year 2015" },
  { label: "Concierge", value: "24/7 on-site concierge (Eli)" },
];

const turquoiseFacts = [
  { label: "Guests", value: "Sleeps up to 7" },
  { label: "Bedrooms", value: "3 bedrooms — 1 king (master, 2nd floor), 2 queens (main floor)" },
  { label: "Bathrooms", value: "2.5 baths" },
  { label: "Size", value: "~2,100 sq ft" },
  { label: "Lake Access", value: "Public beach directly across the street with SUP rentals" },
  { label: "Views", value: "Partial lake views from large porch with firepit" },
  { label: "Hot Tub", value: "Brand new saltwater hot tub" },
  { label: "Special Features", value: "Custom bar, 70\" TV, garage, walk to Garwoods (5 min)" },
  { label: "Rating", value: "Airbnb Guest Favorite — top 10% in area" },
];

const faqSections: FAQSection[] = [
  {
    title: "Booking & Pricing",
    items: [
      {
        q: "How do I book directly?",
        a: "You can book directly on this website at staygdptahoe.com. Direct bookings skip the Airbnb and VRBO service fees, meaning you pay less and we can offer you more. Select your property, choose your dates, and complete checkout securely.",
      },
      {
        q: "What is the minimum stay?",
        a: "Elevation Estate requires a 3-night minimum during off-peak periods and a 5-night minimum during peak summer months (June–August). Turquoise Tavern requires a 2-night minimum.",
      },
      {
        q: "What is the cancellation policy?",
        a: "Bookings made directly on our site include free cancellation within 24 hours of booking. After that, reservations are non-refundable. We strongly recommend travel insurance if your plans might change.",
      },
      {
        q: "Is there a cleaning fee?",
        a: "Yes, a one-time cleaning fee is added at checkout. This covers a full professional cleaning between each stay.",
      },
      {
        q: "Do you offer discounts for longer stays?",
        a: "Yes — stays of 7 nights or more receive a 10% discount off the nightly rate, applied automatically at checkout.",
      },
      {
        q: "What forms of payment do you accept?",
        a: "We accept all major credit cards through our secure checkout.",
      },
      {
        q: "Can I request an early check-in or late checkout?",
        a: "We do our best to accommodate early arrivals and late departures depending on surrounding bookings. Please reach out after booking and we will confirm availability.",
      },
    ],
  },
  {
    title: "Check-In & Your Stay",
    items: [
      {
        q: "What are the check-in and checkout times?",
        a: "Check-in is after 4:00 PM. Checkout is before 10:00 AM. Early check-in and late checkout may be available upon request.",
      },
      {
        q: "How does check-in work?",
        a: "After booking, you will receive a detailed check-in packet by email including door codes, directions, parking instructions, and a welcome guide to the property and the area.",
      },
      {
        q: "Is there parking on site?",
        a: "Yes. Elevation Estate has a one-car garage and covered driveway parking for up to 4 additional cars. Turquoise Tavern has a garage and additional parking on the property.",
      },
      {
        q: "Is there WiFi?",
        a: "Yes, both properties have high-speed WiFi. Details are provided in your check-in packet.",
      },
      {
        q: "Are linens and towels provided?",
        a: "Yes. Both properties are fully stocked with towels, bed linens, toiletries, and kitchen essentials.",
      },
      {
        q: "Are there security cameras?",
        a: "Both properties have exterior security cameras at the front entrance and driveway. There are no cameras inside the properties.",
      },
    ],
  },
  {
    title: "Concierge & Activities",
    items: [
      {
        q: "Does Elevation Estate have concierge service?",
        a: "Yes — Elevation Estate includes 24/7 concierge service. Our concierge can arrange private chefs, chauffeurs, babysitters, grocery and wine delivery, in-home massage and wellness services, wakesurf and waterski lessons, private yoga, snowmobile tours, helicopter tours, horseback riding, mountain bike rentals, dinner reservations, and more.",
      },
      {
        q: "How far are the ski resorts?",
        a: "Northstar California is approximately 19 minutes from both properties. Palisades Tahoe (formerly Squaw Valley / Alpine Meadows) is approximately 28 minutes away. Both properties have ski storage.",
      },
      {
        q: "What summer activities are available nearby?",
        a: "The North Shore of Lake Tahoe offers swimming, paddleboarding, kayaking, boating, hiking, mountain biking, miniature golf, and access to beaches. Kings Beach and Tahoe City are a short drive away. Garwoods Grill & Pier — the most iconic restaurant on the North Shore — is a 5-minute walk from Turquoise Tavern.",
      },
      {
        q: "Can we use the pier at Elevation Estate for our boat?",
        a: "The pier at Elevation Estate is a private shared deep-water pier. It is ideal for loading and unloading boats, swimming, and lounging. A buoy is also available upon request. Our concierge can arrange boat charters and watersports rentals.",
      },
      {
        q: "Is there public transportation?",
        a: "Yes. The Tahoe regional bus system (TART) is easily accessible from both properties. Free casino shuttles also run year-round from the area.",
      },
    ],
  },
  {
    title: "House Rules & Policies",
    items: [
      {
        q: "Are events or parties allowed?",
        a: "No. Neither property permits events, parties, or large gatherings at any time.",
      },
      {
        q: "What are the quiet hours?",
        a: "Quiet hours are 10:00 PM to 7:00 AM daily at both properties, in accordance with Placer County regulations.",
      },
      {
        q: "What is the minimum renter age?",
        a: "Guests must be at least 25 years old to book either property.",
      },
      {
        q: "What happens if something is damaged during our stay?",
        a: "We ask that you notify us immediately of any damage. A security deposit hold is placed at check-in and released after checkout inspection. We understand accidents happen — we just ask for transparency.",
      },
      {
        q: "Do you accept long-term stays?",
        a: "Yes, both properties allow stays of 28 days or more. Please contact us directly to discuss monthly rates.",
      },
    ],
  },
  {
    title: "Contact",
    items: [
      {
        q: "How do I get in touch with a question before booking?",
        a: "Reply to any email from us, or reach out directly at gdpgroup20@gmail.com. We respond within an hour.",
      },
      {
        q: "What if something goes wrong during my stay?",
        a: "Contact us immediately at 603-359-9227. Our concierge team (at Elevation Estate) or our management team is available to assist around the clock.",
      },
    ],
  },
];

const schemaJson = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqSections.flatMap((s) =>
    s.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#0f1d3d]/10 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-[#0f1d3d]/70"
      >
        <span className="pr-8 text-base font-medium text-[#0f1d3d]">{item.q}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[#0f1d3d]/50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-[#0f1d3d]/70 leading-relaxed">{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 text-center bg-[#0f1d3d]">
        <p className="text-white/50 uppercase tracking-[0.3em] text-sm">Support</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-light text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-6 text-white/60 max-w-xl mx-auto leading-relaxed">
          Everything you need to know about our properties, booking, and your stay. Can&apos;t find an answer?{" "}
          <a href="mailto:gdpgroup20@gmail.com" className="underline underline-offset-2 hover:text-white">
            Get in touch.
          </a>
        </p>
      </section>

      {/* Property Cards */}
      <section className="pt-16 pb-8 px-6 bg-[#f8f7f5]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f1d3d]/40 mb-8 text-center">
            The Properties
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Elevation Estate */}
            <div className="bg-white rounded-sm border border-[#0f1d3d]/10 overflow-hidden">
              <div className="bg-[#0f1d3d] px-6 py-4">
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-1">Luxury Collection</p>
                <h3 className="text-xl font-light text-white">Elevation Estate</h3>
                <a href="/properties/elevation-estate" className="text-xs text-white/60 hover:text-white underline underline-offset-2 mt-1 inline-block">View property →</a>
              </div>
              <div className="divide-y divide-[#0f1d3d]/6">
                {elevationFacts.map((f) => (
                  <div key={f.label} className="px-6 py-3 flex gap-4 text-sm">
                    <span className="text-[#0f1d3d]/40 w-28 shrink-0 font-medium text-xs uppercase tracking-wide pt-0.5">{f.label}</span>
                    <span className="text-[#0f1d3d]/80">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Turquoise Tavern */}
            <div className="bg-white rounded-sm border border-[#0f1d3d]/10 overflow-hidden">
              <div className="bg-[#0ea5e9] px-6 py-4">
                <p className="text-xs text-white/70 uppercase tracking-[0.2em] mb-1">Premium Collection</p>
                <h3 className="text-xl font-light text-white">Turquoise Tavern</h3>
                <a href="/properties/turquoise" className="text-xs text-white/70 hover:text-white underline underline-offset-2 mt-1 inline-block">View property →</a>
              </div>
              <div className="divide-y divide-[#0f1d3d]/6">
                {turquoiseFacts.map((f) => (
                  <div key={f.label} className="px-6 py-3 flex gap-4 text-sm">
                    <span className="text-[#0f1d3d]/40 w-28 shrink-0 font-medium text-xs uppercase tracking-wide pt-0.5">{f.label}</span>
                    <span className="text-[#0f1d3d]/80">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto space-y-16 pt-16">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f1d3d]/40 mb-6">
                {section.title}
              </h2>
              <div className="rounded-sm border border-[#0f1d3d]/10 px-6">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0f1d3d] text-center">
        <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
          Ready to book your stay?
        </h2>
        <p className="mt-4 text-white/60 max-w-md mx-auto">
          Book directly and skip the service fees.
        </p>
        <a
          href="/properties/elevation-estate"
          className="inline-block mt-10 px-10 py-4 bg-white text-[#0f1d3d] text-sm uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors"
        >
          View Properties
        </a>
      </section>
    </>
  );
}
