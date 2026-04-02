import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getTemplate, findTemplateIdForProperty } from "@/lib/email-templates";
import { getProperty } from "@/lib/properties";
import { getPricingForProperty } from "@/lib/pricing";
import { addBooking, generateBookingId } from "@/lib/bookings";
import { differenceInCalendarDays } from "date-fns";

export const dynamic = "force-dynamic";

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function textToHtml(text: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f1d3d">
    <div style="border-bottom:2px solid #0f1d3d;padding-bottom:16px;margin-bottom:24px">
      <strong style="font-size:20px;letter-spacing:0.1em;text-transform:uppercase">GDP Tahoe</strong>
    </div>
    <div style="line-height:1.8;font-size:15px">
      ${text.split("\n").map(line =>
        line.trim() ? `<p style="margin:8px 0">${line}</p>` : "<br/>"
      ).join("")}
    </div>
    <div style="border-top:1px solid #ddd;margin-top:32px;padding-top:16px;font-size:12px;color:#888">
      GDP Tahoe · staygdptahoe.com · 603-359-9227
    </div>
  </div>`;
}

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

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddr = "GDP Tahoe <bookings@staygdptahoe.com>";
    const fallbackSuffix = propertySlug === "elevation-estate" ? "elevation" : propertySlug;
    const vars: Record<string, string> = {
      guest_name: guestName,
      property_name: property.name,
      check_in: formatDate(checkIn),
      check_out: formatDate(checkOut),
      nights: String(nights),
      total: total.toLocaleString(),
      booking_id: bookingId,
      rental_agreement_url: livePricing?.rentalAgreementUrl || "https://www.staygdptahoe.com",
      recommendations_url: "https://www.staygdptahoe.com/recommendations",
    };

    void (async () => {
      try {
        const guestTemplateId = await findTemplateIdForProperty(
          propertySlug,
          ["booking", "on_booking", "booking_confirmed"],
          [`tpl-booking-confirmed-${propertySlug}`, `tpl-booking-confirmed-${fallbackSuffix}`]
        );

        if (guestTemplateId) {
          try {
            const tpl = await getTemplate(guestTemplateId);
            if (tpl?.enabled && guestEmail) {
              await resend.emails.send({
                from: fromAddr,
                to: guestEmail,
                subject: fillTemplate(tpl.subject, vars),
                html: textToHtml(fillTemplate(tpl.body, vars)),
              });
              console.log(`[Email] Confirmation sent to ${guestEmail}`);
            }
          } catch (error) {
            console.error("[Email] Guest confirmation failed:", error);
          }
        }

        const ownerTemplateId = await findTemplateIdForProperty(
          propertySlug,
          ["on_booking", "owner_notification"],
          [`tpl-owner-notification-${propertySlug}`, `tpl-owner-notification-${fallbackSuffix}`]
        );

        if (ownerTemplateId) {
          try {
            const tpl = await getTemplate(ownerTemplateId);
            if (tpl?.enabled) {
              await resend.emails.send({
                from: fromAddr,
                to: "gdpgroup20@gmail.com",
                subject: fillTemplate(tpl.subject, vars),
                html: textToHtml(fillTemplate(tpl.body, vars)),
              });
              console.log("[Email] Owner notification sent");
            }
          } catch (error) {
            console.error("[Email] Owner notification failed:", error);
          }
        }
      } catch (error) {
        console.error("[Email] Booking submission email flow failed:", error);
      }
    })();
  }

  return NextResponse.json({
    bookingId,
    clientSecret: paymentIntent.client_secret,
    total,
  });
}
