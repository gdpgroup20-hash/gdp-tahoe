import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { updateBookingStatus } from "@/lib/bookings";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error — Stripe SDK types may not match the latest API version string
    apiVersion: "2023-10-16",
  });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const booking = await updateBookingStatus(
          paymentIntent.id,
          "confirmed"
        );

        if (booking) {
          // Send confirmation email
          try {
            if (
              process.env.RESEND_API_KEY &&
              process.env.RESEND_API_KEY !== "re_placeholder"
            ) {
              await resend.emails.send({
                from: "GDP Tahoe <bookings@gdptahoe.com>",
                to: booking.guestEmail,
                subject: `Booking Confirmed - ${booking.propertyName}`,
                html: `
                  <h1>Your booking is confirmed!</h1>
                  <p>Thank you, ${booking.guestName}!</p>
                  <p><strong>Property:</strong> ${booking.propertyName}</p>
                  <p><strong>Check-in:</strong> ${booking.checkIn}</p>
                  <p><strong>Check-out:</strong> ${booking.checkOut}</p>
                  <p><strong>Guests:</strong> ${booking.guests}</p>
                  <p><strong>Total:</strong> $${booking.totalPrice.toLocaleString()}</p>
                  <p><strong>Booking ID:</strong> ${booking.id}</p>
                  <br/>
                  <p>We look forward to hosting you at Lake Tahoe!</p>
                  <p>- The GDP Tahoe Team</p>
                `,
              });
            } else {
              console.log(
                `[Email Skipped] Confirmation for booking ${booking.id} to ${booking.guestEmail}`
              );
            }
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't fail the webhook because of email errors
          }
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
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
