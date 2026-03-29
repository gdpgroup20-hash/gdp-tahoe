import { notFound } from "next/navigation";
import { getProperty } from "@/lib/properties";
import { BookingForm } from "@/components/booking-form";
import { Separator } from "@/components/ui/separator";

interface BookingPageProps {
  params: { property: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  const property = getProperty(params.property);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Dark header so navbar is visible */}
      <div className="bg-[#0f1d3d] pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-white/50 uppercase tracking-[0.3em] text-xs mb-2">Book Your Stay</p>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">{property.name}</h1>
          <p className="mt-2 text-white/60">{property.tagline}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Property quick stats */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{property.bedrooms} bedrooms</span>
            <span className="text-border">|</span>
            <span>{property.bathrooms} bathrooms</span>
            <span className="text-border">|</span>
            <span>Sleeps {property.sleeps}</span>
          </div>
        </div>

        <Separator className="mb-10" />

        <BookingForm property={property} />
      </div>
    </main>
  );
}
