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
      "Our flagship lakefront estate offers an unparalleled luxury experience with breathtaking panoramic views of Lake Tahoe, private lake access, and world-class amenities.",
    longDescription:
      "Perched above the crystal-clear waters of Lake Tahoe, Elevation Estate is a masterfully designed retreat that redefines mountain luxury. Every detail has been curated for the discerning traveler — from the chef's kitchen with premium appliances to the expansive great room with floor-to-ceiling windows framing the lake. Step outside to your private deck overlooking the water, soak in the hot tub under the stars, or descend to your own lakefront access with kayaks and paddleboards waiting. Whether you're hosting a family gathering, a corporate retreat, or simply seeking the finest that Tahoe has to offer, Elevation Estate delivers an experience that exceeds expectations.",
    sleeps: 10,
    bedrooms: 4,
    bathrooms: 4,
    nightlyRate: 1200,
    weeklyDiscount: 15,
    cleaningFee: 350,
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
      "High-speed WiFi",
      "EV charging station",
      "Ski storage",
      "Fire pit",
      "Kayaks & paddleboards",
      "Private lake access",
      "Hot tub",
      "Chef's kitchen",
      "Game room",
      "Smart home system",
      "Heated floors",
      "Mountain bikes",
    ],
    highlights: [
      "Private lake access",
      "Hot tub with lake views",
      "Chef's kitchen",
      "Game room",
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
