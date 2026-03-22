import { NextResponse } from "next/server";
import icalGenerator from "ical-generator";
import { getBookingsByProperty } from "@/lib/bookings";
import { getProperty } from "@/lib/properties";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ property: string }> }
) {
  const { property: propertySlug } = await params;

  const property = getProperty(propertySlug);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  try {
    const bookings = await getBookingsByProperty(propertySlug);
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

    const calendar = icalGenerator({
      name: `GDP Tahoe - ${property.name}`,
      prodId: { company: "GDP Tahoe", product: property.name },
    });

    for (const booking of confirmedBookings) {
      calendar.createEvent({
        start: new Date(booking.checkIn),
        end: new Date(booking.checkOut),
        summary: `GDP Tahoe - ${property.name} - Booked`,
        description: `Booking ID: ${booking.id}`,
        allDay: true,
      });
    }

    return new NextResponse(calendar.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${propertySlug}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating iCal feed:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar feed" },
      { status: 500 }
    );
  }
}
