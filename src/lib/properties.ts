export interface Property {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  nightlyRate: number;
  weeklyDiscount: number;
  cleaningFee: number;
  heroImage: string;
  galleryImages: string[];
  amenities: string[];
  highlights: string[];
  tier: "luxury" | "premium";
}

export const properties: Record<string, Property> = {
  "elevation-estate": {
    slug: "elevation-estate",
    name: "Elevation Estate",
    tagline: "Where luxury meets the lake",
    description:
      "A one-of-a-kind 5,800 sq ft lakefront estate on Agate Bay with 270° panoramic views, a private pier, 24/7 concierge, and award-winning architecture — designed for those who expect the finest.",
    longDescription:
      "Elevation Estate is a truly singular property — 5,800 square feet of award-winning architecture constructed on a hillside spanning 200 feet of elevation above the crystal-clear waters of Agate Bay. Parts of the house float 70 feet above the lake, framing 270-degree unobstructed panoramic views from every angle. Built from locally sourced glacier stone, slate, steel, glass, and redwood, the estate was honored as Tahoe Quarterly's Outstanding Mountain Home of the Year in 2015 and featured in Mountain Living magazine.\n\nComprising a main house, guest house, and studio apartment, the property sleeps up to 12 guests across 7 bedrooms — thoughtfully sectioned to accommodate multiple families or generations in complete privacy. The chef's kitchen features Gaggenau and Sub-Zero appliances throughout, and the formal great room commands sweeping lake views. Multiple decks — including a cocktail deck and a dining deck with built-in gas BBQ — invite you to live outdoors at altitude.\n\nA 24/7 concierge coordinates everything from private chefs and chauffeurs to wakesurf lessons, helicopter tours, and grocery delivery. Your private deep-water pier on one of Tahoe's calmest bays puts boating and watersports steps from your door.",
    sleeps: 12,
    bedrooms: 7,
    bathrooms: 6.5,
    nightlyRate: 5656,
    weeklyDiscount: 10,
    cleaningFee: 500,
    heroImage: "/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg",
    galleryImages: [
      "/images/elevation/1dd91567-0181-4000-b42f-a0dcd0cf3e68.jpeg",
      "/images/elevation/44a72b09-8b5f-430a-a86c-31719c2f0af4.jpeg",
      "/images/elevation/ae06b179-6696-4fcc-8753-8bafbc2a7ddd.jpeg",
      "/images/elevation/ca9ed745-e163-4fba-816f-3a14b397214f.jpeg",
      "/images/elevation/4fe2b174-7a8f-4966-932c-892bc3e4ba68.jpeg",
      "/images/elevation/fd9d9953-faa7-40e4-bf43-0a518420f7d4.jpeg",
    ],
    amenities: [
      "Private deep-water pier",
      "24/7 concierge service",
      "270° panoramic lake views",
      "Chef's kitchen (Gaggenau & Sub-Zero)",
      "Two 3-story elevators",
      "EV charging station",
      "Private patio & cocktail deck",
      "Built-in gas BBQ & outdoor dining",
      "Fire pit",
      "Beach essentials (kayaks, paddleboards, snorkel gear)",
      "High-speed WiFi & Sonos sound system",
      "75\" HDTV",
      "Washer & dryer",
      "Air conditioning",
      "Free parking (garage + driveway)",
    ],
    highlights: [
      "Private lakefront pier on Agate Bay",
      "270° panoramic lake views",
      "24/7 concierge",
      "Award-winning architecture",
    ],
    tier: "luxury",
  },
  turquoise: {
    slug: "turquoise",
    name: "Turquoise",
    tagline: "Mountain charm, lakeside soul",
    description:
      "A beautifully appointed mountain retreat with stunning lake views, a spacious deck, and all the comforts of home — at a price that makes Tahoe accessible.",
    longDescription:
      "Turquoise captures the essence of Lake Tahoe living — warm, inviting, and effortlessly beautiful. This thoughtfully designed retreat balances mountain character with modern comfort, featuring an open-concept living area with a stone fireplace, a fully equipped kitchen, and a wraparound deck with panoramic lake views. The outdoor BBQ area is perfect for summer evenings, while the hot tub and cozy interiors make winter stays equally magical. Located minutes from both ski resorts and lakeside beaches, Turquoise puts the best of Tahoe right at your doorstep. It's the kind of place where you arrive as a guest and leave feeling like you've found your second home.",
    sleeps: 8,
    bedrooms: 3,
    bathrooms: 2,
    nightlyRate: 500,
    weeklyDiscount: 10,
    cleaningFee: 200,
    heroImage: "/images/turquoise/photo_11.png",
    galleryImages: [
      "/images/turquoise/photo_01.png",
      "/images/turquoise/photo_03.png",
      "/images/turquoise/photo_10.png",
      "/images/turquoise/photo_06.png",
      "/images/turquoise/photo_08.png",
      "/images/turquoise/photo_07.png",
    ],
    amenities: [
      "High-speed WiFi",
      "Hot tub",
      "Fireplace",
      "Ski storage",
      "BBQ grill",
      "Lake views",
      "Deck",
      "Fully equipped kitchen",
      "Washer & dryer",
      "Board games",
    ],
    highlights: [
      "Stunning lake views",
      "Hot tub",
      "Stone fireplace",
      "Wraparound deck with BBQ",
    ],
    tier: "premium",
  },
};

export function getProperty(slug: string): Property | undefined {
  return properties[slug];
}

export function getAllProperties(): Property[] {
  return Object.values(properties);
}
