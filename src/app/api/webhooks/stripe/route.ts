import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateBookingStatus } from "@/lib/bookings";
import { getTemplate } from "@/lib/email-templates";
import { getPricingForProperty } from "@/lib/pricing";

export const dynamic = "force-dynamic";

async function sendGmail(to: string, subject: string, html: string) {
  const { execSync } = await import("child_process");
  const { writeFileSync, unlinkSync } = await import("fs");
  const tmpFile = `/tmp/gdp-email-${Date.now()}.json`;
  writeFileSync(tmpFile, JSON.stringify({ to, subject, html }));
  try {
    execSync(
      `python3 -c "
import json, urllib.request, urllib.parse, base64, email.mime.multipart, email.mime.text
with open('${tmpFile}') as f:
    data = json.load(f)
def refresh():
    with open('/Users/andrewvanbark/.openclaw/secrets/gdp-gmail-oauth.json') as f:
        creds = json.load(f)['installed']
    with open('/Users/andrewvanbark/.openclaw/secrets/gdp-gmail-token.json') as f:
        token = json.load(f)
    d = urllib.parse.urlencode({'client_id': creds['client_id'], 'client_secret': creds['client_secret'], 'refresh_token': token['refresh_token'], 'grant_type': 'refresh_token'}).encode()
    req = urllib.request.Request(creds['token_uri'], data=d, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    with urllib.request.urlopen(req) as r: t = json.loads(r.read())
    token['access_token'] = t['access_token']
    with open('/Users/andrewvanbark/.openclaw/secrets/gdp-gmail-token.json', 'w') as f: json.dump(token, f)
    return token['access_token']
tok = refresh()
msg = email.mime.multipart.MIMEMultipart('alternative')
msg['Subject'] = data['subject']
msg['From'] = 'GDP Tahoe <gdpgroup20@gmail.com>'
msg['To'] = data['to']
msg.attach(email.mime.text.MIMEText(data['html'], 'html'))
raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
body = json.dumps({'raw': raw}).encode()
req = urllib.request.Request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', data=body, headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req) as r: print(r.read())
"`,
      { timeout: 15000 }
    );
  } finally {
    try { unlinkSync(tmpFile); } catch {}
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
