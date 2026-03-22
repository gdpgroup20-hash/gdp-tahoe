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
  allImages: string[];
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
    allImages: [
      "/images/elevation/004744af-5136-4bf3-be8f-1e6f21e50c2e.jpeg",
      "/images/elevation/02f9c58b-4290-4b1e-bf3f-f1bd7fa6c0cb.jpeg",
      "/images/elevation/03553cd9-08a7-4aab-9558-f35bb59d1cb5.jpeg",
      "/images/elevation/05799d89-597a-4916-a614-22947a6c3b9f.jpeg",
      "/images/elevation/078e6924-ace8-4476-be1c-3e45428b19b6.jpeg",
      "/images/elevation/08fd0e79-fe04-4729-8e19-a88375ca9393.jpeg",
      "/images/elevation/0b21d863-1752-42f1-8d5f-91574afd895b.jpeg",
      "/images/elevation/12e7cc7b-15e1-44be-bd6c-ec2029b33b76.jpg",
      "/images/elevation/14ae01d0-d0c4-4422-88e5-e3358c2c4823.jpeg",
      "/images/elevation/150046c4-f414-40d6-8650-e3aa2dd4dd85.jpeg",
      "/images/elevation/18195d7f-8f3c-4bc5-9af6-2181b8e4fd73.jpeg",
      "/images/elevation/1dd91567-0181-4000-b42f-a0dcd0cf3e68.jpeg",
      "/images/elevation/1e98f0fa-ba15-463d-a438-94defa106aac.jpeg",
      "/images/elevation/21e8e7f7-74f8-4b51-8860-af824d62c8f0.jpg",
      "/images/elevation/24d602b9-f17e-4609-8ec6-30b78d5c39fb.jpg",
      "/images/elevation/2ac37b65-ffe0-4dc4-9bf9-dfe4d0bee22f.jpg",
      "/images/elevation/2f7413ab-c59a-42c7-9122-40399dd01848.jpeg",
      "/images/elevation/3555fcad-2931-4a9a-89bf-72d5abb48b5e.jpeg",
      "/images/elevation/3b076107-d93a-4ebb-9ba3-a8a02139946e.jpeg",
      "/images/elevation/3d497a9f-e617-4424-91dc-a5f5b80c946d.jpeg",
      "/images/elevation/3d6406a1-972b-4c26-888a-05c3bf11bf64.jpeg",
      "/images/elevation/44a72b09-8b5f-430a-a86c-31719c2f0af4.jpeg",
      "/images/elevation/4fe2b174-7a8f-4966-932c-892bc3e4ba68.jpeg",
      "/images/elevation/50373b1d-3c8a-448b-94f5-e1b243dc59e4.jpeg",
      "/images/elevation/5b068d25-3e2b-47fc-bddc-7d141d1ccd9e.jpeg",
      "/images/elevation/5df5bb6e-c998-4d3d-aa51-ecd327593cfd.jpeg",
      "/images/elevation/5f83cb8d-cd06-4ada-bbc6-26d58ee3aafa.jpeg",
      "/images/elevation/64199874-f35c-4476-8a8c-23e01c3926ac.jpeg",
      "/images/elevation/6519ced5-739c-4d3d-b8bd-fd4938952636.jpeg",
      "/images/elevation/6841e405-9b78-4be8-ad45-f9f0aa60c6fc.jpeg",
      "/images/elevation/6b4d9b3b-542d-4fae-afd5-00bed9f0908a.jpeg",
      "/images/elevation/6b7911cd-ae71-4a56-802a-6795c85fe8e0.jpeg",
      "/images/elevation/6d1cdc58-4efd-4da1-8b0a-c0494c0e86ed.jpeg",
      "/images/elevation/6fbf7693-e27a-4b50-a856-51506138803d.jpg",
      "/images/elevation/7671f87e-30d6-4acb-b46d-d895ffa5e9b7.jpeg",
      "/images/elevation/76eaadaf-5ca4-4033-b0d6-53acf2f50ff3.jpeg",
      "/images/elevation/7dac01b8-c47d-46ac-a061-402dadd0b08a.jpg",
      "/images/elevation/8329ea3b-a507-477e-a1f1-805b653d6b53.jpeg",
      "/images/elevation/84ab3ad8-eaf9-4a5f-9fc6-303bc705b4c4.jpeg",
      "/images/elevation/87f1c49f-37b2-4541-a6eb-727aaa29e026.jpeg",
      "/images/elevation/88ef2d18-0b28-4c53-8036-942a67e52ad0.jpeg",
      "/images/elevation/92037473-c8fd-4a06-bc5d-82d30e26ccdf.jpeg",
      "/images/elevation/925bd05c-7ea7-40b1-a799-c379de8f9f0d.jpeg",
      "/images/elevation/92af1b76-228a-4ef4-94bc-da83d4a2ea30.jpeg",
      "/images/elevation/92f41c94-0a8e-43f9-b858-44cb1cecbf21.jpeg",
      "/images/elevation/9566d90a-c1be-41ef-ac3f-84386898cbfb.jpeg",
      "/images/elevation/96ee371a-620f-4c0a-aef5-1e06208a24b7.jpg",
      "/images/elevation/97a4c7cb-a624-4eb6-9999-193cfdd82cbd.jpeg",
      "/images/elevation/991e750e-b726-48f9-9263-d4d8d4ab65c9.jpeg",
      "/images/elevation/9de2d26b-12fb-4108-b69d-6ced01fdefa4.jpeg",
      "/images/elevation/a507fc00-f18b-4db8-8110-5db86ac6558c.jpg",
      "/images/elevation/ab4a2f6f-da46-41c8-a57b-ec3faaa11186.jpeg",
      "/images/elevation/ae06b179-6696-4fcc-8753-8bafbc2a7ddd.jpeg",
      "/images/elevation/afb478fa-bb60-4f87-928a-5382625f10de.jpeg",
      "/images/elevation/b646f14d-472f-4887-845b-818cb78dd42e.jpeg",
      "/images/elevation/b7951382-ac59-4295-971a-4f805f34025b.jpeg",
      "/images/elevation/b961b7d0-73b8-411f-a069-e0078eb0e5fd.jpeg",
      "/images/elevation/b9fd9cdc-a512-4874-9424-51c893363d64.jpeg",
      "/images/elevation/c166a424-8d0b-4237-9dd4-8e8aeb66a943.jpeg",
      "/images/elevation/c2a4dd79-f7a7-4ad1-80bd-7f4c359f93aa.jpeg",
      "/images/elevation/c9cf1de2-4696-432f-8aa7-9b70927d2b1a.jpeg",
      "/images/elevation/ca9ed745-e163-4fba-816f-3a14b397214f.jpeg",
      "/images/elevation/d705bf53-5a84-4432-8a53-4349b93e10aa.jpeg",
      "/images/elevation/d7ae2607-f16e-4644-8bc6-015fb96f65be.jpg",
      "/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg",
      "/images/elevation/e866835f-f9b7-45c7-b987-9e637ef51361.jpeg",
      "/images/elevation/eb16193a-a7b1-42e5-b607-e524e0912587.jpeg",
      "/images/elevation/ec0e1ff7-851a-4f62-8202-448c20a3f1b2.jpeg",
      "/images/elevation/ecca6eb9-5bb7-4dfa-ba12-ab20baee2e25.jpeg",
      "/images/elevation/f2d3b48b-173c-4e5e-b8c0-65de1112cdd1.jpeg",
      "/images/elevation/f5d26c1c-e5fb-4d7e-b0eb-2b30a714f42d.jpeg",
      "/images/elevation/f864cfdf-93cd-42ce-990e-7faddb5fd8cc.jpeg",
      "/images/elevation/fb6fb60f-ed34-497f-a4e5-b5617239a66a.jpeg",
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
    name: "Turquoise Tavern",
    tagline: "Walk to the beach. Soak in the hot tub. Stay a while.",
    description:
      "An Airbnb Guest Favorite on the North Shore — 2,000 sq ft with partial lake views, a saltwater hot tub, custom bar, and a 5-minute walk to Garwoods and the beach.",
    longDescription:
      "Turquoise Tavern is the kind of place that earns 34 five-star reviews for a reason. Recently updated with hardwood floors, a custom bar, and a brand new saltwater hot tub, this 2,000 sq ft home on the North Shore puts you steps from everything Tahoe has to offer.\n\nCross the street and you're on a beautiful public beach with paddleboard rentals. Walk five minutes and you're at Garwoods Bar & Grill — the most iconic spot in North Lake Tahoe (don't miss the Wet Woody). In winter, Northstar and Palisades Tahoe are an easy drive away.\n\nThe home sleeps 7 across three bedrooms, with a king master suite upstairs and two queens on the main floor. Kick back in the open living area, catch the game on the 70\" TV, or fire up the porch firepit with a drink from the custom bar. It's the kind of place where you arrive for a long weekend and start planning your return before you leave.",
    sleeps: 7,
    bedrooms: 3,
    bathrooms: 2.5,
    nightlyRate: 883,
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
    allImages: [
      "/images/turquoise/photo_01.png",
      "/images/turquoise/photo_02.png",
      "/images/turquoise/photo_03.png",
      "/images/turquoise/photo_04.png",
      "/images/turquoise/photo_05.png",
      "/images/turquoise/photo_06.png",
      "/images/turquoise/photo_07.png",
      "/images/turquoise/photo_08.png",
      "/images/turquoise/photo_09.png",
      "/images/turquoise/photo_10.png",
      "/images/turquoise/photo_11.png",
      "/images/turquoise/photo_12.png",
      "/images/turquoise/photo_13.png",
      "/images/turquoise/photo_14.png",
      "/images/turquoise/photo_15.png",
      "/images/turquoise/photo_16.png",
      "/images/turquoise/photo_17.png",
    ],
    amenities: [
      "Saltwater hot tub",
      "Partial lake views",
      "Enormous porch with firepit",
      "Custom bar",
      "Beach across the street",
      "70\" TV & family room",
      "Fully equipped kitchen",
      "High-speed WiFi",
      "Washer & dryer",
      "Free parking",
      "Board games",
      "Beach essentials (towels, umbrella, snorkel gear)",
    ],
    highlights: [
      "Beach across the street",
      "Saltwater hot tub",
      "5 min walk to Garwoods",
      "Airbnb Guest Favorite",
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
