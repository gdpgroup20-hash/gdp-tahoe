import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateBookingStatus } from "@/lib/bookings";
import { getTemplate } from "@/lib/email-templates";
import { getPricingForProperty } from "@/lib/pricing";

export const dynamic = "force-dynamic";

async function getGmailAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

async function sendGmail(to: string, subject: string, html: string) {
  const accessToken = await getGmailAccessToken();

  // Build RFC 2822 email
  const emailLines = [
    `From: GDP Tahoe <gdpgroup20@gmail.com>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ];
  const raw = Buffer.from(emailLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Gmail API error: ${JSON.stringify(err)}`);
  }
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch { return dateStr; }
}

function textToHtml(text: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#0f1d3d">
    <div style="border-bottom:2px solid #0f1d3d;padding-bottom:16px;margin-bottom:24px">
      <strong style="font-size:20px">GDP Tahoe</strong>
    </div>
    <div style="line-height:1.8">
      ${text.split("\n").map(line => line.trim() ? `<p style="margin:8px 0">${line}</p>` : "<br/>").join("")}
    </div>
    <div style="border-top:1px solid #ddd;margin-top:32px;padding-top:16px;font-size:12px;color:#666">
      GDP Tahoe · staygdptahoe.com · 603-359-9227
    </div>
  </div>`;
}

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error — Stripe SDK types may not match the latest API version string
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

        if (booking) {
          // Get pricing for rental agreement URL
          let rentalAgreementUrl = "";
          try {
            const pricing = await getPricingForProperty(booking.propertySlug);
            rentalAgreementUrl = pricing?.rentalAgreementUrl ?? "";
          } catch {}

          const vars: Record<string, string> = {
            guest_name: booking.guestName,
            property_name: booking.propertyName,
            check_in: formatDate(booking.checkIn),
            check_out: formatDate(booking.checkOut),
            nights: String(Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000)),
            total: booking.totalPrice.toLocaleString(),
            booking_id: booking.id,
            rental_agreement_url: rentalAgreementUrl || "https://www.staygdptahoe.com",
            recommendations_url: "https://www.staygdptahoe.com/recommendations",
          };

          // 1. Guest confirmation email
          try {
            const tpl = await getTemplate("tpl-booking-confirmed");
            if (tpl && tpl.enabled && booking.guestEmail) {
              const subject = fillTemplate(tpl.subject, vars);
              const bodyText = fillTemplate(tpl.body, vars);
              await sendGmail(booking.guestEmail, subject, textToHtml(bodyText));
              console.log(`[Email] Confirmation sent to ${booking.guestEmail}`);
            }
          } catch (e) { console.error("Guest confirmation email failed:", e); }

          // 2. Owner notification email
          try {
            const tpl = await getTemplate("tpl-owner-notification");
            if (tpl && tpl.enabled) {
              const subject = fillTemplate(tpl.subject, vars);
              const bodyText = fillTemplate(tpl.body, vars);
              await sendGmail("gdpgroup20@gmail.com", subject, textToHtml(bodyText));
              console.log("[Email] Owner notification sent");
            }
          } catch (e) { console.error("Owner notification email failed:", e); }
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
