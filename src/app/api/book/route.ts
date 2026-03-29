import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProperty } from "@/lib/properties";
import { getPricingForProperty } from "@/lib/pricing";
import { addBooking, generateBookingId } from "@/lib/bookings";
import { differenceInCalendarDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error — Stripe SDK types may not match latest API version
    apiVersion: "2023-10-16",
  });

  const body = await request.json();
  const { propertySlug, guestName, guestEmail, guestPhone, checkIn, checkOut, guests, specialRequests } = body;

  if (!propertySlug || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !guests) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const property = getProperty(propertySlug);
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  // Get live pricing from DB
  const livePricing = await getPricingForProperty(propertySlug);
  const nightlyRate = livePricing?.baseRate ?? property.nightlyRate;
  const cleaningFee = livePricing?.cleaningFee ?? property.cleaningFee;
  const weeklyDiscount = livePricing?.weeklyDiscount ?? property.weeklyDiscount;
  const totRate = livePricing?.totRate ?? 12;

  const nights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  if (nights <= 0) return NextResponse.json({ error: "Invalid dates" }, { status: 400 });

  const subtotal = nights * nightlyRate;
  const discount = nights >= 7 ? Math.round(subtotal * (weeklyDiscount / 100)) : 0;
  const totAmount = Math.round(subtotal * (totRate / 100));
  const total = subtotal - discount + cleaningFee + totAmount;

  const bookingId = generateBookingId();

  // Create Stripe PaymentIntent FIRST
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    metadata: { bookingId, propertySlug, guestEmail },
  });

  // Save booking to DB
  await addBooking({
    id: bookingId,
    propertySlug,
    propertyName: property.name,
    guestName,
    guestEmail,
    guestPhone: guestPhone || "",
    checkIn,
    checkOut,
    guests: Number(guests),
    specialRequests: specialRequests || "",
    totalPrice: total,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    bookingId,
    clientSecret: paymentIntent.client_secret,
    total,
  });
}
