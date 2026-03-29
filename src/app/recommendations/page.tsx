import { Metadata } from "next";
import { getPublicCategories } from "@/lib/contacts";

import { VendorCard } from "@/components/vendor-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local Recommendations | GDP Tahoe",
  description:
    "Curated by GDP Tahoe — our favorite experiences, activities, and services on the North Shore of Lake Tahoe.",
};

interface LocalBusiness {
  "@type": "LocalBusiness";
  name: string;
  url?: string;
  telephone?: string;
}

export default async function RecommendationsPage() {
  const categoriesRaw = await getPublicCategories();
  const categories = [...categoriesRaw].sort((a, b) => a.name.localeCompare(b.name));

  // Build JSON-LD for vendors with websites
  const businesses: LocalBusiness[] = [];
  for (const cat of categories) {
    for (const vendor of cat.vendors) {
      if (vendor.website) {
        const biz: LocalBusiness = {
          "@type": "LocalBusiness",
          name: vendor.companyName,
          url: vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`,
        };
        const phone = vendor.contacts.find((c) => c.phone)?.phone;
        if (phone) biz.telephone = phone;
        businesses.push(biz);
      }
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "GDP Tahoe Local Recommendations",
    itemListElement: businesses.map((biz, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: biz,
    })),
  };

  return (
    <>


      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#0f1d3d] pt-28 pb-16 px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white">
            Local Recommendations
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Curated by GDP Tahoe &mdash; our favorite experiences, activities,
            and services on the North Shore
          </p>
        </div>
      </section>

      {/* Categories */}
      <main className="mx-auto max-w-6xl px-6 lg:px-8 py-16 space-y-20">
        {categories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            {/* Section header */}
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f1d3d]/50 mb-8">
              {cat.name}
            </h2>

            {/* Vendor grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="text-center pt-8 pb-4">
          <div className="mx-auto max-w-xl border-t border-gray-200 pt-12">
            <p className="text-base text-gray-600 leading-relaxed">
              Have questions? Reach out to us at{" "}
              <a
                href="mailto:gdpgroup20@gmail.com"
                className="font-medium text-[#0f1d3d] underline underline-offset-2 hover:text-[#0f1d3d]/70 transition-colors"
              >
                gdpgroup20@gmail.com
              </a>{" "}
              &mdash; we&rsquo;re happy to make introductions.
            </p>
          </div>
        </section>
      </main>


    </>
  );
}
