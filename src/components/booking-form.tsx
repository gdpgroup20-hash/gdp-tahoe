"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, isBefore, startOfDay } from "date-fns";
import { DateRangePicker } from "@/components/date-range-picker";

import type { Property } from "@/lib/properties";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handleSubmit(e: React.FormEvent) {
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
      setBookingId(data.bookingId ?? data.id ?? "confirmed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (bookingId) {
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
              Booking Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Your reservation at <strong>{property.name}</strong> has been
              submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Booking ID:{" "}
              <span className="font-mono font-semibold text-[#0f1d3d]">
                {bookingId}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              A confirmation email will be sent to <strong>{email}</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
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
              "Confirm & Pay"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You won&apos;t be charged yet. We&apos;ll confirm availability
            and send payment instructions.
          </p>
        </div>
      </div>
    </form>
  );
}
