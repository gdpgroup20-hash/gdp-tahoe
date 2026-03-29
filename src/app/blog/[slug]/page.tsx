import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostDB } from "@/lib/blog-db";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostDB(slug);

  if (!post) {
    return { title: "Post Not Found | GDP Tahoe" };
  }

  return {
    title: `${post.title} | GDP Tahoe Journal`,
    description: post.excerpt,
    alternates: {
      canonical: `https://www.staygdptahoe.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.staygdptahoe.com/blog/${slug}`,
      siteName: "GDP Tahoe",
      images: [
        {
          url: `https://www.staygdptahoe.com${post.coverImage}`,
          width: 1200,
          height: 800,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`https://www.staygdptahoe.com${post.coverImage}`],
    },
  };
}

const categoryColors: Record<string, string> = {
  "Local Guide": "bg-emerald-600",
  Dining: "bg-amber-600",
  Activities: "bg-sky-600",
  Events: "bg-violet-600",
  Property: "bg-rose-600",
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostDB(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `https://www.staygdptahoe.com${post.coverImage}`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "GDP Tahoe",
      url: "https://www.staygdptahoe.com",
    },
    publisher: {
      "@type": "Organization",
      name: "GDP Tahoe",
      url: "https://www.staygdptahoe.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.staygdptahoe.com/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.staygdptahoe.com/blog/${slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Image */}
      <section className="relative h-[60vh] min-h-[400px]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-3xl px-6 pb-12 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f1d3d] transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to Journal
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-10">
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

        {/* Body */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-[#0f1d3d] prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-[1.8] prose-a:text-[#0f1d3d] prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-70 prose-strong:text-[#0f1d3d] prose-li:text-gray-700 prose-li:leading-[1.8] text-[18px]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* CTA Section */}
        <section className="mt-16 border-t border-gray-200 pt-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#0f1d3d] tracking-tight">
              Book Your Stay
            </h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">
              Experience North Lake Tahoe from two exceptional properties in
              Carnelian Bay. Book direct for the best rates — no service fees.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties/elevation-estate"
                className="inline-block bg-[#0f1d3d] text-white text-xs font-semibold uppercase tracking-wider px-8 py-4 hover:bg-[#0f1d3d]/90 transition-colors"
              >
                Elevation Estate
              </Link>
              <Link
                href="/properties/turquoise"
                className="inline-block border border-[#0f1d3d] text-[#0f1d3d] text-xs font-semibold uppercase tracking-wider px-8 py-4 hover:bg-[#0f1d3d] hover:text-white transition-colors"
              >
                Turquoise Tavern
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
