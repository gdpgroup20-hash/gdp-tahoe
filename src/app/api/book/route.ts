import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProperty } from "@/lib/properties";
import { calculatePriceWithSeasonalRates } from "@/lib/availability";
import { addBooking, generateBookingId } from "@/lib/bookings";
import { getPricingForProperty } from "@/lib/pricing";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error — Stripe SDK types may not match the latest API version string
    apiVersion: "2023-10-16",
  });
  try {
    const body = await request.json();
    const {
      propertySlug,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      specialRequests,
    } = body;

    // Validate required fields
    if (
      !propertySlug ||
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !checkIn ||
      !checkOut ||
      !guests
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: propertySlug, guestName, guestEmail, guestPhone, checkIn, checkOut, guests",
        },
        { status: 400 }
      );
    }

    // Validate property exists
    const property = getProperty(propertySlug);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get live pricing from DB (overrides hardcoded property values)
    const livePricing = await getPricingForProperty(propertySlug);
    const nightlyRate = livePricing?.baseRate ?? property.nightlyRate;
    const weeklyDiscount = livePricing?.weeklyDiscount ?? property.weeklyDiscount;
    const cleaningFee = livePricing?.cleaningFee ?? property.cleaningFee;

    // Calculate price (with seasonal rate support)
    const pricing = await calculatePriceWithSeasonalRates(
      propertySlug,
      nightlyRate,
      weeklyDiscount,
      cleaningFee,
      checkIn,
      checkOut
    );

    if (pricing.nights <= 0) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    const bookingId = generateBookingId();

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pricing.total * 100, // cents
      currency: "usd",
      metadata: { bookingId, propertySlug, guestEmail },
    });

    // Save booking with status "pending"
    try {
      await addBooking({
        id: bookingId,
        propertySlug,
        propertyName: property.name,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        guests,
        specialRequests: specialRequests || "",
        totalPrice: pricing.total,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      console.log(`[Book] Booking saved: ${bookingId}`);
    } catch (dbErr) {
      const errMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error(`[Book] DB save failed for ${bookingId}:`, errMsg);
      // Return the error so we can debug
      return NextResponse.json({
        bookingId,
        clientSecret: paymentIntent.client_secret,
        total: pricing.total,
        dbError: errMsg, // temporary debug field
      });
    }

    return NextResponse.json({
      bookingId,
      clientSecret: paymentIntent.client_secret,
      total: pricing.total,
    });
  } catch (error) {
    console.error("Booking error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
