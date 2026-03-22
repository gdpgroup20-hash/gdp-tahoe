export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Local Guide" | "Dining" | "Activities" | "Events" | "Property";
  coverImage: string;
  publishedAt: string;
  readTime: number;
  body: string;
}

const posts: BlogPost[] = [
  {
    slug: "north-lake-tahoe-summer-guide",
    title: "The Ultimate North Lake Tahoe Summer Guide",
    excerpt:
      "From hidden beaches to high-alpine hikes, here's everything you need to know to plan the perfect North Shore summer — written by someone who's spent every July here for years.",
    category: "Local Guide",
    coverImage: "/images/elevation/e6ecf408-354c-4c00-9227-7d55280bd66b.jpeg",
    publishedAt: "2025-06-10",
    readTime: 8,
    body: `
<p>There's a moment on a North Lake Tahoe summer morning — usually around 7:30 a.m. — when the lake is so still it looks solid, like a sheet of blue glass laid between the mountains. The air smells like warm pine and wet granite. It's the kind of morning that makes you understand why people never leave.</p>

<p>I've been spending summers on the North Shore for years, and I'm still not over it. If you're planning a trip, here's everything I'd tell a friend.</p>

<h2>The Beaches</h2>

<p>Let's start with what everyone comes for: the water. Lake Tahoe's clarity is almost surreal — you can see 60 feet down in some spots — and the North Shore has the best swimming.</p>

<p><strong>Secret Cove</strong> is, predictably, not much of a secret anymore, but it's still one of the most beautiful stretches of sand in California. The hike down is short and steep, and the water is that impossible turquoise that doesn't look real in photos. Get there before 10 a.m. or don't bother — parking fills fast.</p>

<p><strong>Sand Harbor</strong> is the crown jewel of Nevada's Lake Tahoe State Park. The boulders, the water color, the way the light hits in the afternoon — it's postcard-perfect. In July and August, the Lake Tahoe Shakespeare Festival performs here on an outdoor stage at the water's edge. Bring a blanket, a bottle of wine, and prepare to feel very cultured.</p>

<p><strong>Kings Beach</strong> is the North Shore's public beach, and it's great for families: wide, sandy, with a playground nearby and restaurants within walking distance. The water warms up faster here than almost anywhere else on the lake.</p>

<p>But honestly? The best swimming is in <strong>Agate Bay</strong> and <strong>Carnelian Bay</strong>. The water is calmer, the crowds are thinner, and there's something about floating in that still, clear water with the Sierra ridgeline above you that resets your nervous system entirely.</p>

<h2>On the Water</h2>

<p>If you're not getting on the water at least once, you're missing the point. <strong>Stand-up paddleboarding</strong> is the quintessential Tahoe activity — the lake is so clear you'll watch fish swim beneath your board. Rentals are everywhere, but I like launching from Carnelian Bay where the water is protected and calm in the mornings.</p>

<p><strong>Kayaking</strong> is spectacular along the North Shore, especially paddling east toward the rocky coves between Carnelian Bay and Crystal Bay. Bring a dry bag and pack a lunch — there are tiny pebble beaches you can pull up to that feel completely private.</p>

<p>For something more ambitious, <strong>North Tahoe Marina</strong> rents pontoon boats, ski boats, and jet skis. A half-day on a pontoon with friends, anchored in some quiet cove with sandwiches and cold drinks — that's a perfect Tahoe day.</p>

<h2>The Hikes</h2>

<p><strong>Mount Rose</strong> (10,776 feet) is my favorite summit hike on the North Shore. It's about 10 miles round trip and 2,300 feet of gain, but the wildflower meadows in July are otherworldly, and from the top you can see the entire lake and into Nevada. Start early — afternoon thunderstorms are real up here.</p>

<p><strong>Five Lakes Trail</strong> is shorter, easier, and wildly rewarding. It's about 4.5 miles round trip from the Alpine Meadows trailhead, and you end up at a cluster of pristine alpine lakes surrounded by granite. The swimming is freezing and totally worth it.</p>

<p>For something mellow, the <strong>Tahoe Rim Trail</strong> near Brockway Summit offers rolling ridge walks with panoramic views of the lake. You can do as much or as little as you want — even a two-mile out-and-back is spectacular.</p>

<h2>Dining & Evenings</h2>

<p>Summer evenings on the North Shore are magic. The light goes golden around 7 p.m. and hangs there for what feels like hours. <strong>Garwoods Grill & Pier</strong> in Carnelian Bay is the move for sunset — grab a table on the deck, order a Wet Woody (their signature rum cocktail), and watch the light change over the water.</p>

<p><strong>Tahoe City</strong> has the densest cluster of good restaurants: Wolfdale's for upscale California-Asian fusion, Christy Hill for fine dining with a lake view, and Fat Cat for casual bar food and live music. The farmers' market on Thursday mornings in Commons Beach is also excellent.</p>

<p>For a more low-key evening, there's nothing better than grilling on a big outdoor deck, a fire pit going, the stars coming out one by one. It's the kind of evening you can only really have when you're staying somewhere special — not in a hotel room.</p>

<h2>Why Carnelian Bay Is the Sweet Spot</h2>

<p>After years of exploring every corner of the North Shore, I keep coming back to the Carnelian Bay and Agate Bay area as the ideal base for a summer trip. It's central — 10 minutes to Tahoe City, 10 minutes to Kings Beach and Northstar — but it's quieter, more residential, and right on the most beautiful stretch of the lake. You get the access without the traffic.</p>

<p>Both <a href="/properties/elevation-estate">Elevation Estate</a> and <a href="/properties/turquoise">Turquoise Tavern</a> sit right in this pocket of the North Shore, which means you're never more than a few minutes from the best of everything — and you come home each evening to some of the most beautiful lake views in Tahoe. If you're planning a summer trip, there's no better home base.</p>
`,
  },
  {
    slug: "north-shore-tahoe-dining-guide",
    title: "Where to Eat on the North Shore — Our Honest Guide",
    excerpt:
      "We've eaten our way across the North Shore so you don't have to guess. Here are the restaurants we actually go back to, the ones we skip, and what to cook at home.",
    category: "Dining",
    coverImage: "/images/elevation/44a72b09-8b5f-430a-a86c-31719c2f0af4.jpeg",
    publishedAt: "2025-05-22",
    readTime: 7,
    body: `
<p>One of the best things about the North Shore — and something that separates it from the South Shore — is that the dining scene actually has personality. These aren't chain restaurants in a strip mall. They're places run by people who live here, who know their regulars, who change the menu when the seasons change. Here's where we eat when we're in town.</p>

<h2>The Can't-Miss Spots</h2>

<p><strong>Garwoods Grill & Pier, Carnelian Bay</strong> — This is our number one recommendation, full stop. If you're staying at Turquoise Tavern, it's a five-minute walk. If you're at Elevation Estate, it's a two-minute drive. Garwoods sits right on the water with a huge deck that catches the sunset perfectly. The food is solid American grill — the fish tacos are great, the Ahi poke is excellent, and the burgers are exactly what you want after a day on the lake. But honestly, you go for the <strong>Wet Woody</strong>: their signature frozen rum cocktail that has achieved legitimate cult status around here. It's dangerously good. Get the table on the deck closest to the water and settle in.</p>

<p><strong>Old Post Office Café, Carnelian Bay</strong> — Breakfast here is a North Shore tradition. It's in a converted 1930s post office (hence the name), and it's charming without trying too hard. The huevos rancheros are the move, and the pancakes are massive. There's usually a wait on weekends, but the covered patio is pleasant, and the coffee is hot. This is a 10-minute walk from both GDP Tahoe properties — we've been known to wander over in slippers.</p>

<p><strong>Watermans Landing, Kings Beach</strong> — Right on the beach, casual as it gets, surprisingly good food. The poke bowls are legit, the cocktails are strong, and the vibe is pure summer. On a warm day, there's no better place to eat lunch with your feet practically in the sand.</p>

<h2>Worth the Drive to Tahoe City</h2>

<p><strong>Wolfdale's Cuisine Unique</strong> — This is the North Shore's fine dining gem, and it's been here since 1978. Chef-owner Douglas Dale does this beautiful California-meets-Japan thing: think miso-glazed sea bass, sashimi platters, and delicate preparations that you wouldn't expect to find in a mountain town. It's small, intimate, and very good. Reservations essential.</p>

<p><strong>Christy Hill</strong> — Another upscale option with the best lake view of any restaurant on the North Shore. The menu is seasonal California cuisine — lamb, fresh fish, handmade pastas. The wine list is thoughtful. It's where you go for a special occasion or when you want to feel like you're somewhere truly beautiful while you eat, which, to be fair, you are.</p>

<p><strong>Fat Cat Bar & Grill</strong> — The opposite end of the spectrum from Christy Hill, and equally essential. Fat Cat is the local dive where everyone ends up eventually. Cheap drinks, solid bar food, live music on weekends, and a vibe that's rowdy in the best way. If you've had too much fine dining and just want a beer and a basket of wings, this is your place.</p>

<p><strong>Tahoe City Farmers' Market</strong> — Not a restaurant, but worth mentioning: every Thursday morning in summer on Commons Beach. Local produce, baked goods, prepared foods, and a wonderful community atmosphere. Perfect for stocking up for the week.</p>

<h2>Provisions & Cooking In</h2>

<p>Here's a secret about Tahoe: some of the best meals happen at home. Both <a href="/properties/elevation-estate">Elevation Estate</a> and <a href="/properties/turquoise">Turquoise Tavern</a> have full chef's kitchens — Elevation has a Gaggenau range and double ovens, and Turquoise has a beautifully equipped kitchen with everything you need for real cooking.</p>

<p>For groceries, <strong>Save Mart</strong> in Kings Beach is the closest full-size supermarket. For nicer provisions — good cheese, charcuterie, wine — swing by <strong>New Moon Natural Foods</strong> in Tahoe City. They have an excellent selection of organic and specialty items.</p>

<p>Our ideal Tahoe evening: a trip to the farmers' market for fresh produce, an afternoon on the lake, then back to the house to grill steaks on the deck while the sun sets over the water. Open something nice. Light the fire pit. That's the whole plan, and it never gets old.</p>

<h2>A Few More Quick Picks</h2>

<ul>
<li><strong>Jax at the Tracks (Tahoe City)</strong> — Diner food, massive portions, great for kids.</li>
<li><strong>Char-Pit (Tahoe City)</strong> — Legendary burgers, cash only, zero ambiance, totally worth it.</li>
<li><strong>Za's Lakefront (Tahoe City)</strong> — Wood-fired pizza and Italian fare with a lake view.</li>
<li><strong>CB's Bistro & Creamery (Carnelian Bay)</strong> — Good coffee, pastries, and ice cream. Convenient stop.</li>
</ul>

<p>The North Shore dining scene is small but genuine. You won't find Michelin stars, but you'll find places with soul — and that's better.</p>
`,
  },
  {
    slug: "northstar-vs-palisades-tahoe-skiing",
    title: "Skiing the North Shore — Northstar vs Palisades Tahoe",
    excerpt:
      "Two world-class mountains, twenty minutes apart. Here's our honest take on which one to ski and when — plus tips for making the most of a North Shore ski trip.",
    category: "Activities",
    coverImage: "/images/elevation/8329ea3b-a507-477e-a1f1-805b653d6b53.jpeg",
    publishedAt: "2025-01-15",
    readTime: 7,
    body: `
<p>One of the great luxuries of staying on the North Shore is having two world-class ski resorts within half an hour of your front door. Northstar and Palisades Tahoe (formerly Squaw Valley and Alpine Meadows) are both exceptional — but they're very different mountains. Here's how to decide which one to hit on any given day.</p>

<h2>Northstar California</h2>

<p><strong>The vibe:</strong> Polished, family-friendly, and beautifully groomed. Northstar is where you go when you want a flawless ski day without any drama. The village at the base is charming — think hot chocolate shops, boutiques, ice skating rink — and the mountain itself is immaculately maintained.</p>

<p><strong>The terrain:</strong> 3,170 acres of skiable terrain across 100+ runs. Northstar is famous for its grooming: the corduroy here is some of the best in the Sierra. Intermediate skiers will be in heaven. The backside has some legitimate steeps and tree runs for advanced skiers, but this isn't the place for adrenaline junkies.</p>

<p><strong>Best runs:</strong> Lookout Mountain has the best views and the most varied terrain. For intermediates, the cruisers off the Vista Express are long, wide, and beautifully maintained. For advanced skiers, head to the backside — Lookout, Promised Land, and the Sawtooth Ridge area have genuine challenge.</p>

<p><strong>Getting there:</strong> About 20 minutes from both GDP Tahoe properties. Straightforward drive on Highway 267 — it rarely gets backed up the way 89 can.</p>

<p><strong>Pro tip:</strong> Northstar's terrain parks are among the best in Tahoe. Even if you're not a park skier, it's fun to ride the gondola up and watch from the deck at mid-mountain.</p>

<h2>Palisades Tahoe</h2>

<p><strong>The vibe:</strong> Raw, legendary, and unapologetically big. This is the mountain that hosted the 1960 Winter Olympics, and it still carries that energy. Palisades is where serious skiers come to test themselves. The terrain is steep, the bowls are massive, and on a powder day, there's nowhere better in California.</p>

<p><strong>The terrain:</strong> 6,000 acres across two mountains (Palisades and Alpine Meadows, now connected by a gondola). The numbers tell the story: 70% of the terrain is intermediate to advanced. KT-22 is one of the most famous chairlifts in North American skiing — the steep chutes and exposed lines beneath it are a rite of passage.</p>

<p><strong>Best runs:</strong> On the Palisades side, Granite Chief and the Headwall offer big, sustained steeps. The Silverado area has excellent tree skiing. On the Alpine Meadows side, Sherwood Bowl is wide-open powder heaven after a storm, and the Scott Chair has challenging steeps in a beautiful, less-crowded setting. For intermediates, the Roundhouse Express area at Alpine Meadows has wonderful long cruisers.</p>

<p><strong>Getting there:</strong> About 28 minutes from both properties via Highway 89 through Tahoe City. On big powder mornings, leave early — 89 can get congested and the parking lots fill.</p>

<p><strong>Pro tip:</strong> Take the new Base-to-Base Gondola to Alpine Meadows at least once. The ride itself is scenic, and Alpine Meadows tends to be less crowded, especially on weekends.</p>

<h2>When to Ski Which Mountain</h2>

<p><strong>Powder day:</strong> Palisades, no question. The bowls and steeps hold new snow beautifully, and the mountain is designed for storm skiing. Get there early and head straight to KT-22 or Headwall.</p>

<p><strong>Bluebird groomer day:</strong> Northstar. When the sky is clear and the groomers are fresh, there's no better place to carve long, fast turns.</p>

<p><strong>Family day with mixed abilities:</strong> Northstar. The village, the grooming, the kid-friendly vibe — it's built for families. Plus the gondola from the parking lot to the village makes the logistics painless.</p>

<p><strong>Weekend (avoiding crowds):</strong> Alpine Meadows side of Palisades. It's consistently less crowded than either Northstar's front side or the Palisades base area.</p>

<h2>Lift Tickets & Gear</h2>

<p>Both resorts are on the <strong>Ikon Pass</strong>, which is worth it if you're skiing more than 3 or 4 days. Single-day tickets at the window are expensive (north of $200), so book online in advance for better rates.</p>

<p>For gear rental, <strong>Tahoe Dave's</strong> in Tahoe City is our go-to. They're knowledgeable, fair on pricing, and will let you swap gear if conditions change mid-trip. Several shops in Kings Beach also offer good rental packages.</p>

<h2>Après Ski</h2>

<p><strong>Northstar:</strong> The village has several options right at the base — Rubicon Pizza is popular, and the outdoor fire pits are great for a post-ski beer.</p>

<p><strong>Palisades:</strong> Le Chamois at the base of KT-22 is a Tahoe institution. Cheap pitchers, a crowded deck, and the kind of energy that only happens after a great ski day. It's a dive in the best sense.</p>

<p>Or, do what we usually do: head home, peel off the layers, fire up the hot tub, and debrief the day with something from the bar. Both <a href="/properties/elevation-estate">Elevation Estate</a> and <a href="/properties/turquoise">Turquoise Tavern</a> have ski storage and hot tubs — which, after a day on the mountain, is really all you need.</p>
`,
  },
  {
    slug: "elevation-estate-lake-tahoe",
    title: "Elevation Estate — A Tour of North Tahoe's Most Extraordinary Home",
    excerpt:
      "Glacier stone, old-growth redwood, 270-degree lake views, and a private pier — step inside the Tahoe Quarterly award-winning estate that redefined lakefront living.",
    category: "Property",
    coverImage: "/images/elevation/1dd91567-0181-4000-b42f-a0dcd0cf3e68.jpeg",
    publishedAt: "2025-03-01",
    readTime: 6,
    body: `
<p>Some homes are built on the lake. Elevation Estate was built <em>for</em> it.</p>

<p>Situated on the Agate Bay shoreline of North Lake Tahoe, Elevation Estate is a 5,800-square-foot residence that manages something rare: it feels both monumental and intimate, like a great room designed by nature and finished by an architect who knew when to stop. It won the Tahoe Quarterly Mountain Home Award in 2015, and standing in the great room for the first time, you understand why.</p>

<h2>The Architecture</h2>

<p>The house is defined by three materials: <strong>glacier stone</strong>, <strong>old-growth redwood</strong>, and <strong>steel</strong>. The exterior walls are massive slabs of stone that look like they were placed by a glacier (because, geologically speaking, they were — the stone was sourced locally). Inside, the redwood is warm and rich, with a grain that catches light differently throughout the day. The steel framing creates clean lines and floor-to-ceiling glass walls that dissolve the boundary between interior and landscape.</p>

<p>The result is a home that feels rooted in its site. Not imposed upon it. The architecture doesn't compete with the lake — it frames it.</p>

<h2>The Views</h2>

<p>Let's be direct: the views from Elevation Estate are among the most spectacular of any residential property on Lake Tahoe. The home is positioned on a gentle rise that provides <strong>270-degree panoramic views</strong> — from the Sierra ridgeline to the west, across the full expanse of the lake, to the Carson Range in the east. The main living areas face the water through walls of glass, and the effect is cinematic. At sunrise, the lake turns gold. At sunset, the mountains go violet and the water deepens to indigo. It's a different painting every hour.</p>

<h2>The Great Room</h2>

<p>The heart of the house is a double-height great room with exposed steel trusses, a floor-to-ceiling stone fireplace, and glass on three sides. It's a room that can hold a party of twenty and still feel warm when it's just two people by the fire. The furniture is generous and modern — deep sofas, wide coffee tables, the kind of pieces that invite you to stay awhile. The acoustic guitar on the stand isn't just decorative; the room sounds as good as it looks.</p>

<h2>The Kitchen</h2>

<p>The kitchen is built for someone who actually cooks. <strong>Gaggenau appliances</strong> — the range, the double ovens, the built-in coffee system — are serious professional-grade equipment. The island is massive, with seating for six, and the prep space is generous enough for a catered dinner party. A full-size Sub-Zero refrigerator and a separate wine column keep everything at the right temperature. We've seen guests spend entire afternoons here, cooking together, music playing, lake light streaming through the windows. It's that kind of kitchen.</p>

<h2>The Bedrooms</h2>

<p>Seven bedrooms and six-and-a-half bathrooms spread across three levels. The master suite occupies its own wing and opens to a private balcony overlooking the lake — waking up here is an experience that borders on absurd. The guest rooms are each individually designed, ranging from a bunk room for kids to elegant lake-view suites that would anchor a boutique hotel. Every bathroom features natural stone, heated floors, and oversized rain showers. The house sleeps twelve comfortably, but it never feels crowded.</p>

<h2>The Pier & the Lake</h2>

<p>The private deep-water pier is, for many guests, the defining feature. It extends into the lake and provides direct access for swimming, paddleboarding, and boating. On a summer morning, walking down the stone steps through the native garden to the pier, the lake still and clear, mountains reflected on the surface — it's a private experience that no hotel or resort can offer. There's a boat lift, too, for guests who want to bring or rent a watercraft.</p>

<h2>The Cocktail Deck</h2>

<p>Above the main floor, a cantilevered deck extends out toward the lake. We call it the cocktail deck because that's what ends up happening: someone brings out a tray of drinks, the sun starts going down, and suddenly it's two hours later and no one has moved. The hot tub is up here too, with completely unobstructed lake views. On clear nights, the star field is extraordinary — you're at 6,200 feet, far from major city light pollution, and it shows.</p>

<h2>The Details</h2>

<p>Elevation Estate is full of the kind of details that separate a great property from a good one: a dedicated ski room with boot warmers, Sonos throughout, a game room with a professional billiards table, landscaped grounds with native plantings, an outdoor fire pit with built-in seating, and a two-car heated garage. The Wi-Fi is fast and reliable. The beds are genuinely excellent. The towels are thick. It sounds small, but these things matter when you're spending a week somewhere.</p>

<p>This is not a home you simply stay in. It's a home that stays with you.</p>

<p class="mt-8"><a href="/properties/elevation-estate" class="text-[#0f1d3d] font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity">View Elevation Estate details and availability &rarr;</a></p>
`,
  },
  {
    slug: "things-to-do-carnelian-bay",
    title: "The Best Things to Do in Carnelian Bay",
    excerpt:
      "Carnelian Bay is North Tahoe's sweet spot: beautiful, walkable, and blissfully uncrowded. Here's our insider's guide to this under-the-radar lakeside community.",
    category: "Local Guide",
    coverImage: "/images/elevation/fb6fb60f-ed34-497f-a4e5-b5617239a66a.jpeg",
    publishedAt: "2025-04-18",
    readTime: 6,
    body: `
<p>Most visitors to Lake Tahoe head straight for Tahoe City or South Lake. The ones who've been before — the ones who know — head for Carnelian Bay.</p>

<p>Tucked between Tahoe City and Kings Beach on the North Shore, Carnelian Bay is a small, residential lakeside community that happens to be perfectly positioned for a Tahoe vacation. It's not touristy. There's no main drag of souvenir shops. What there is: a gorgeous stretch of calm water, a handful of genuinely great restaurants, easy access to everything on the North Shore, and a pace of life that feels about three notches slower than everywhere else on the lake.</p>

<p>Here's what to do when you're here.</p>

<h2>Hit the Water at Agate Bay</h2>

<p>Adjacent to Carnelian Bay, <strong>Agate Bay</strong> has what locals consider the calmest, clearest swimming water on the North Shore. The bay is naturally protected, so even on windy afternoons when the rest of the lake is choppy, Agate Bay stays smooth. The water is remarkably clear — that famous Tahoe clarity, but without the crowds of Sand Harbor or Kings Beach.</p>

<p>There's a small public beach access point, and on summer mornings, you might have the entire stretch to yourself. Bring a paddleboard — the calm water makes this an ideal launch point, and paddling along the rocky shoreline toward Crystal Bay is spectacular.</p>

<h2>Carnelian Bay Beach</h2>

<p>The <strong>Carnelian Bay public beach</strong> is small, sandy, and wonderfully mellow. There's a little grassy area for picnics, a few benches, and a wooden pier that's perfect for jumping off (at your own risk, as the signs will tell you). Families love it here because the water is shallow close to shore and there's no boat traffic in the swimming area. In the late afternoon, the light is magical — the sun drops behind the western ridge and the water goes golden.</p>

<h2>Paddleboard Rentals</h2>

<p>Several outfitters operate along the North Shore, but launching from Carnelian Bay is the move. The water is calmer here in the mornings than almost anywhere on the lake, which means you get that glassy, mirror-surface experience that makes Tahoe SUP photos look unreal. Paddle east toward Crystal Bay for rocky coves and incredible water clarity, or west toward Tahoe City for a longer journey with beach stops along the way.</p>

<h2>Garwoods — The Neighborhood Restaurant</h2>

<p><strong>Garwoods Grill & Pier</strong> is Carnelian Bay's anchor restaurant, and it's one of the best spots on the entire North Shore. Built right on the water with a huge lakefront deck, Garwoods does solid American grill food in a setting that's hard to beat. The Wet Woody — their signature frozen rum drink — is famous for good reason. Sunset here is an event. We eat at Garwoods at least twice every trip, and we never regret it.</p>

<h2>Explore Kings Beach (10 Minutes Away)</h2>

<p>A short drive east brings you to <strong>Kings Beach</strong>, which has a totally different energy — more bustling, more shops and restaurants, and a wide sandy public beach that's great for a full beach day. The North Tahoe Event Center hosts concerts and events in summer. Kings Beach is also where you'll find the closest grocery store (Save Mart) and some solid casual dining options.</p>

<h2>Hiking from the Neighborhood</h2>

<p>One of the underrated perks of Carnelian Bay is the access to hiking trails right from the residential neighborhoods. The <strong>North Tahoe Regional Trail</strong> network connects through the area, and you can walk or bike along the lakefront path toward Tahoe City. For more serious hiking, the trailhead for <strong>Brockway Summit</strong> and the Tahoe Rim Trail is a short drive uphill — the ridge views from up there are some of the best on the North Shore.</p>

<h2>The TART Bus</h2>

<p>The <strong>Tahoe Area Regional Transit (TART)</strong> bus runs along the North Shore and it's free in summer. This is a game-changer: you can leave the car at home and bus to Tahoe City for dinner, to Kings Beach for the afternoon, or to Northstar for skiing. A stop runs right through Carnelian Bay. No parking stress, no designated driver debates.</p>

<h2>Evening Bonfire Culture</h2>

<p>There's an unofficial evening ritual in Carnelian Bay that you should know about: the bonfire. As the sun goes down, smoke starts rising from fire pits all along the shoreline. Families, friends, couples — everyone gravitates to the water's edge with a blanket and a drink. The temperature drops, the stars come out, the fire crackles. It's simple and it's perfect. Both of our properties have outdoor fire pits, and we'd argue this nightly ritual is one of the best things about staying here.</p>

<h2>The Sweet Spot</h2>

<p>We call Carnelian Bay the sweet spot of North Tahoe because it genuinely is: close enough to Tahoe City and Kings Beach that you're never far from restaurants, shopping, and nightlife, but quiet enough that it still feels like a neighborhood rather than a tourist destination. The lake access is exceptional, the views are stunning, and the pace is exactly right.</p>

<p>If you're looking for the Tahoe experience that the locals keep to themselves, this is it. And both <a href="/properties/elevation-estate">Elevation Estate</a> and <a href="/properties/turquoise">Turquoise Tavern</a> put you right in the heart of it.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((post) => post.slug);
}
