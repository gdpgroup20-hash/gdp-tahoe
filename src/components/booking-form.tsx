"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, isBefore, startOfDay } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { DateRangePicker } from "@/components/date-range-picker";

import type { Property } from "@/lib/properties";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BookingFormProps {
  property: Property;
}

interface PriceSummary {
  nights: number;
  subtotal: number;
  discount: number;
  cleaningFee: number;
  total: number;
  hasWeeklyDiscount: boolean;
}

type Step = "details" | "payment" | "success";

function calculatePrice(
  property: Property,
  dateRange: { from: Date | undefined; to: Date | undefined } | undefined
): PriceSummary | null {
  if (!dateRange?.from || !dateRange?.to) return null;

  const nights = differenceInCalendarDays(dateRange.to, dateRange.from);
  if (nights < 2) return null;

  const subtotal = nights * property.nightlyRate;
  const hasWeeklyDiscount = nights >= 7;
  const discount = hasWeeklyDiscount
    ? subtotal * (property.weeklyDiscount / 100)
    : 0;
  const total = subtotal - discount + property.cleaningFee;

  return {
    nights,
    subtotal,
    discount,
    cleaningFee: property.cleaningFee,
    total,
    hasWeeklyDiscount,
  };
}

const cardStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f1d3d",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

/* ─── Payment step (must be inside <Elements>) ─── */

function PaymentStep({
  property,
  price,
  dateRange,
  clientSecret,
  bookingId,
  onSuccess,
  onBack,
}: {
  property: Property;
  price: PriceSummary;
  dateRange: { from: Date; to: Date };
  clientSecret: string;
  bookingId: string;
  onSuccess: (bookingId: string) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        setError(
          stripeError.type === "card_error"
            ? "Your card was declined. Please try a different card."
            : "Something went wrong. Please try again."
        );
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess(bookingId);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handlePay}>
      <div className="mx-auto max-w-lg space-y-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#0f1d3d]">
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property</span>
              <span className="font-medium text-[#0f1d3d]">
                {property.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span>
                {dateRange.from.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span>
                {dateRange.to.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ${property.nightlyRate.toLocaleString()} &times; {price.nights}{" "}
                night{price.nights !== 1 && "s"}
              </span>
              <span>${price.subtotal.toLocaleString()}</span>
            </div>
            {price.hasWeeklyDiscount && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Weekly discount ({property.weeklyDiscount}%)</span>
                <span>&minus;${price.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cleaning fee</span>
              <span>${price.cleaningFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold text-[#0f1d3d]">
              <span>Total</span>
              <span>${price.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#0f1d3d]">
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-input bg-background p-3">
              <CardElement options={cardStyle} />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#0f1d3d] text-base font-semibold hover:bg-[#0f1d3d]/90"
              disabled={!stripe || processing}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
                </span>
              ) : (
                `Pay $${price.total.toLocaleString()} now`
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              You will be charged immediately. Cancellation policy applies.
            </p>
          </CardContent>
        </Card>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={processing}
        >
          &larr; Back to edit details
        </Button>
      </div>
    </form>
  );
}

/* ─── Main BookingForm ─── */

export function BookingForm({ property }: BookingFormProps) {
  const [dateRange, setDateRange] = useState<
    { from: Date | undefined; to: Date | undefined } | undefined
  >();
  const [guests, setGuests] = useState(1);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Fetch unavailable dates
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await fetch(
          `/api/availability?property=${property.slug}`
        );
        if (res.ok) {
          const data = await res.json();
          const dates = (data.blockedDates ?? data.unavailableDates ?? []).map(
            (d: string) => new Date(d)
          );
          setDisabledDates(dates);
        }
      } catch {
        // Silently fail — calendar will show all dates as available
      } finally {
        setLoadingDates(false);
      }
    }
    fetchAvailability();
  }, [property.slug]);

  const today = startOfDay(new Date());

  const disabledMatcher = useCallback(
    (date: Date) => {
      if (isBefore(date, today)) return true;
      return disabledDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
    },
    [disabledDates, today]
  );

  const price = useMemo(
    () => calculatePrice(property, dateRange),
    [property, dateRange]
  );

  const isFormValid =
    price !== null && name.trim() !== "" && email.trim() !== "";

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || !dateRange?.from || !dateRange?.to) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: property.slug,
          checkIn: dateRange.from.toISOString(),
          checkOut: dateRange.to.toISOString(),
          guests,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          specialRequests: specialRequests.trim(),
          total: price!.total,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Booking failed. Please try again.");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId ?? data.id ?? "confirmed");
      setStep("payment");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (step === "success" && bookingId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-[#0f1d3d]">
              Booking Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Booking ID:{" "}
              <span className="font-mono font-semibold text-[#0f1d3d]">
                {bookingId}
              </span>
            </p>
            <Separator />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[#0f1d3d]">{property.name}</p>
              {dateRange?.from && dateRange?.to && (
                <p className="text-muted-foreground">
                  {dateRange.from.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  &mdash;{" "}
                  {dateRange.to.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email at{" "}
              <strong>{email}</strong>.
            </p>
            <Button
              className="mt-4 w-full bg-[#0f1d3d] hover:bg-[#0f1d3d]/90"
              onClick={() => (window.location.href = "/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment step
  if (step === "payment" && clientSecret && bookingId && dateRange?.from && dateRange?.to && price) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentStep
          property={property}
          price={price}
          dateRange={{ from: dateRange.from, to: dateRange.to }}
          clientSecret={clientSecret}
          bookingId={bookingId}
          onSuccess={(id) => {
            setBookingId(id);
            setStep("success");
          }}
          onBack={() => setStep("details")}
        />
      </Elements>
    );
  }

  // Details step (original form)
  return (
    <form onSubmit={handleContinueToPayment}>
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left Column — Calendar & Guests */}
        <div className="space-y-8">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#0f1d3d]">
                Select Dates
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Minimum 2-night stay
              </p>
            </CardHeader>
            <CardContent>
              {loadingDates ? (
                <div className="flex h-[320px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f1d3d]/20 border-t-[#0f1d3d]" />
                </div>
              ) : (
                <DateRangePicker
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={disabledMatcher}
                  minNights={2}
                />
              )}
              {dateRange?.from && dateRange?.to && price && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {dateRange.from.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  &mdash;{" "}
                  {dateRange.to.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  &middot; {price.nights} night{price.nights !== 1 && "s"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Guest Count */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#0f1d3d]">
                Guests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                >
                  <span className="text-lg leading-none">&minus;</span>
                </Button>
                <span className="w-16 text-center text-lg font-semibold text-[#0f1d3d]">
                  {guests}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={guests >= property.sleeps}
                  onClick={() =>
                    setGuests((g) => Math.min(property.sleeps, g + 1))
                  }
                >
                  <span className="text-lg leading-none">+</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {property.sleeps} max
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Pricing & Contact Form */}
        <div className="space-y-8">
          {/* Pricing Summary */}
          <Card
            className={cn(
              "border-[#0f1d3d]/10 transition-opacity",
              !price && "opacity-60"
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg text-[#0f1d3d]">
                Price Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {price ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${property.nightlyRate.toLocaleString()} &times;{" "}
                      {price.nights} night{price.nights !== 1 && "s"}
                    </span>
                    <span>${price.subtotal.toLocaleString()}</span>
                  </div>
                  {price.hasWeeklyDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Weekly discount ({property.weeklyDiscount}%)
                      </span>
                      <span>&minus;${price.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Cleaning fee
                    </span>
                    <span>${price.cleaningFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold text-[#0f1d3d]">
                    <span>Total</span>
                    <span>${price.total.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select your check-in and check-out dates to see pricing.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#0f1d3d]">
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests</Label>
                <Textarea
                  id="requests"
                  placeholder="Early check-in, extra towels, etc."
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#0f1d3d] text-base font-semibold hover:bg-[#0f1d3d]/90"
            disabled={!isFormValid || submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </span>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
