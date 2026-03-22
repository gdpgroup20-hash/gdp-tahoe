import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Users, BedDouble, Bath, Star, ArrowLeft } from "lucide-react";

import { getProperty } from "@/lib/properties";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { GalleryModal } from "@/components/gallery-modal";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [{ slug: "elevation-estate" }, { slug: "turquoise" }];
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);

  if (!property) {
    return { title: "Property Not Found | GDP Tahoe" };
  }

  return {
    title: `${property.name} | GDP Tahoe`,
    description: property.description,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getProperty(slug);

  if (!property) {
    notFound();
  }

  const formattedRate = property.nightlyRate.toLocaleString();

  return (
    <>
      {/* ===== Hero Section ===== */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <Image
          src={property.heroImage}
          alt={property.name}
          fill
          priority
          unoptimized
          className="object-cover"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d3d]/90 via-[#0f1d3d]/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            All Properties
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 md:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/15 text-white backdrop-blur-md"
            >
              {property.tier === "luxury" ? "Luxury Collection" : "Premium Collection"}
            </Badge>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {property.name}
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-white/80 md:text-xl">
              {property.tagline}
            </p>

            {/* Key stats */}
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Sleeps {property.sleeps}
                </span>
              </div>
              <div className="h-5 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {property.bedrooms} Bedrooms
                </span>
              </div>
              <div className="h-5 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {property.bathrooms} Bathrooms
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Main Content ===== */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-20">
        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
          {/* Left column — property info */}
          <div className="space-y-16">
            {/* Image Gallery */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0f1d3d]">
                Gallery
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {property.galleryImages.slice(0, 6).map((src, i) => (
                  <div
                    key={i}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <Image
                      src={src}
                      alt={`${property.name} — photo ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
              <GalleryModal
                images={property.allImages}
                propertyName={property.name}
              />
            </section>

            <Separator />

            {/* Property Description */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0f1d3d]">
                About This Property
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg md:leading-8">
                {property.longDescription}
              </p>
            </section>

            <Separator />

            {/* Highlights */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0f1d3d]">
                Highlights
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {property.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-4 rounded-xl border border-[#0f1d3d]/10 bg-[#0f1d3d]/[0.02] p-5 transition-colors hover:bg-[#0f1d3d]/[0.04]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f1d3d]/10">
                      <Star className="h-5 w-5 text-[#0f1d3d]" />
                    </div>
                    <span className="text-sm font-medium text-[#0f1d3d]">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Amenities Grid */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0f1d3d]">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[#0f1d3d]" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — Pricing Card (sticky on desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-[#0f1d3d]/10">
                {/* Card header */}
                <div className="bg-[#0f1d3d] px-6 py-6 text-white">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${formattedRate}
                    </span>
                    <span className="text-sm text-white/70">/ night</span>
                  </div>
                  {property.weeklyDiscount > 0 && (
                    <p className="mt-1 text-sm text-white/70">
                      {property.weeklyDiscount}% off for weekly stays
                    </p>
                  )}
                </div>

                {/* Card body */}
                <div className="space-y-4 px-6 py-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Nightly rate
                      </span>
                      <span className="font-medium text-[#0f1d3d]">
                        ${formattedRate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Cleaning fee
                      </span>
                      <span className="font-medium text-[#0f1d3d]">
                        ${property.cleaningFee}
                      </span>
                    </div>
                    {property.weeklyDiscount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Weekly discount
                        </span>
                        <span className="font-medium text-emerald-600">
                          -{property.weeklyDiscount}%
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <Link
                    href={`/book/${property.slug}`}
                    className={cn(
                      buttonVariants(),
                      "w-full bg-[#0f1d3d] py-6 text-base font-semibold hover:bg-[#0f1d3d]/90"
                    )}
                  >
                    Book Now
                  </Link>

                  <p className="text-center text-xs text-muted-foreground">
                    No charge until your stay is confirmed
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Sticky Mobile CTA ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="border-t border-[#0f1d3d]/10 bg-white/95 px-5 py-4 backdrop-blur-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#0f1d3d]">
                  ${formattedRate}
                </span>
                <span className="text-sm text-muted-foreground">/ night</span>
              </div>
              {property.weeklyDiscount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {property.weeklyDiscount}% off weekly
                </p>
              )}
            </div>
            <Link
              href={`/book/${property.slug}`}
              className={cn(
                buttonVariants(),
                "bg-[#0f1d3d] px-8 py-5 text-sm font-semibold hover:bg-[#0f1d3d]/90"
              )}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-20 md:hidden" />
    </>
  );
}
