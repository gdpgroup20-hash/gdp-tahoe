import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateBookingStatus } from "@/lib/bookings";
import { getTemplate } from "@/lib/email-templates";
import { getPricingForProperty } from "@/lib/pricing";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return dateStr; }
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

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const booking = await updateBookingStatus(paymentIntent.id, "confirmed");

        if (booking && process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);

          let rentalAgreementUrl = "";
          try {
            const pricing = await getPricingForProperty(booking.propertySlug);
            rentalAgreementUrl = pricing?.rentalAgreementUrl ?? "";
          } catch {}

          const nights = Math.ceil(
            (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000
          );

          const vars: Record<string, string> = {
            guest_name: booking.guestName,
            property_name: booking.propertyName,
            check_in: formatDate(booking.checkIn),
            check_out: formatDate(booking.checkOut),
            nights: String(nights),
            total: booking.totalPrice.toLocaleString(),
            booking_id: booking.id,
            rental_agreement_url: rentalAgreementUrl || "https://www.staygdptahoe.com",
            recommendations_url: "https://www.staygdptahoe.com/recommendations",
          };

          const fromAddr = "GDP Tahoe <bookings@staygdptahoe.com>";

          // 1. Guest confirmation email
          try {
            const tplId = `tpl-booking-confirmed-${booking.propertySlug}`;
            const tpl = await getTemplate(tplId);
            if (tpl?.enabled && booking.guestEmail) {
              await resend.emails.send({
                from: fromAddr,
                to: booking.guestEmail,
                subject: fillTemplate(tpl.subject, vars),
                html: textToHtml(fillTemplate(tpl.body, vars)),
              });
              console.log(`[Email] Confirmation sent to ${booking.guestEmail}`);
            }
          } catch (e) { console.error("[Email] Guest confirmation failed:", e); }

          // 2. Owner notification
          try {
            const tplId = `tpl-owner-notification-${booking.propertySlug}`;
            const tpl = await getTemplate(tplId);
            if (tpl?.enabled) {
              await resend.emails.send({
                from: fromAddr,
                to: "gdpgroup20@gmail.com",
                subject: fillTemplate(tpl.subject, vars),
                html: textToHtml(fillTemplate(tpl.body, vars)),
              });
              console.log("[Email] Owner notification sent");
            }
          } catch (e) { console.error("[Email] Owner notification failed:", e); }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await updateBookingStatus(paymentIntent.id, "cancelled");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
