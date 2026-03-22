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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Property Summary */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Book Your Stay
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0f1d3d] sm:text-4xl">
            {property.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {property.tagline}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
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
