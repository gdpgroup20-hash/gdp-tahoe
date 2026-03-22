import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal — Stories & Guides from North Lake Tahoe | GDP Tahoe",
  description:
    "Stories, guides, and local intelligence from North Lake Tahoe. Discover the best dining, activities, and insider tips for your next Tahoe trip.",
  alternates: {
    canonical: "https://www.staygdptahoe.com/blog",
  },
};

const categoryColors: Record<string, string> = {
  "Local Guide": "bg-emerald-600",
  Dining: "bg-amber-600",
  Activities: "bg-sky-600",
  Events: "bg-violet-600",
  Property: "bg-rose-600",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0f1d3d] pt-32 pb-16 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            Journal
          </h1>
          <p className="mt-4 text-lg text-white/60 font-light">
            Stories, guides &amp; local intelligence from North Lake Tahoe
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="mx-auto max-w-6xl px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <article className="overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-5">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span
                      className={`${categoryColors[post.category] ?? "bg-gray-600"} text-white px-2.5 py-0.5 font-medium tracking-wide uppercase text-[10px]`}
                    >
                      {post.category}
                    </span>
                    <span>{post.readTime} min read</span>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-[#0f1d3d] group-hover:opacity-70 transition-opacity leading-snug">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-[#0f1d3d] group-hover:opacity-70 transition-opacity">
                    Read More &rarr;
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
