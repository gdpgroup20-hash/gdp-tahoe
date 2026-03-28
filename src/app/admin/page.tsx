"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Lock,
  LogOut,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  Plus,
  Trash2,
  DollarSign,
  CalendarDays,
  Calendar,
  Settings,
  Check,
  X,
  Pencil,
  Wrench,
  Send,
  ArrowLeft,
  Loader2,
  Phone,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  propertySlug: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  totalPrice: number;
  stripePaymentIntentId: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

interface SeasonalRate {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  rate: number;
}

interface PropertyPricing {
  baseRate: number;
  cleaningFee: number;
  weeklyDiscount: number;
  seasonalRates: SeasonalRate[];
}

type PricingConfig = Record<string, PropertyPricing>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  return (
    <Badge
      className={cn(
        "capitalize",
        status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-100",
        status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        status === "cancelled" && "bg-red-100 text-red-800 hover:bg-red-100"
      )}
    >
      {status}
    </Badge>
  );
}

function isSeasonalRateActive(sr: SeasonalRate): boolean {
  const today = new Date().toISOString().split("T")[0];
  return today >= sr.startDate && today <= sr.endDate;
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function exportBookingsCSV(bookings: Booking[]) {
  const headers = [
    "Booking ID",
    "Property",
    "Guest Name",
    "Guest Email",
    "Guest Phone",
    "Check-in",
    "Check-out",
    "Nights",
    "Guests",
    "Total",
    "Status",
    "Stripe Payment Intent",
    "Special Requests",
    "Created",
  ];
  const rows = bookings.map((b) => [
    b.id,
    b.propertyName,
    b.guestName,
    b.guestEmail,
    b.guestPhone,
    b.checkIn,
    b.checkOut,
    nightsBetween(b.checkIn, b.checkOut).toString(),
    b.guests.toString(),
    b.totalPrice.toString(),
    b.status,
    b.stripePaymentIntentId,
    `"${(b.specialRequests || "").replace(/"/g, '""')}"`,
    b.createdAt,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gdp-tahoe-bookings-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Inline Editable Field ──────────────────────────────────────────────────

function InlineEdit({
  value,
  onSave,
  prefix = "",
  suffix = "",
  type = "number",
}: {
  value: number;
  onSave: (val: number) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toString());

  useEffect(() => {
    setDraft(value.toString());
  }, [value]);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="group flex items-center gap-1.5 rounded px-2 py-1 hover:bg-muted transition-colors"
      >
        <span className="text-lg font-semibold">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-8 w-28"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const num = parseFloat(draft);
            if (!isNaN(num)) {
              onSave(num);
              setEditing(false);
            }
          }
          if (e.key === "Escape") {
            setDraft(value.toString());
            setEditing(false);
          }
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={() => {
          const num = parseFloat(draft);
          if (!isNaN(num)) {
            onSave(num);
            setEditing(false);
          }
        }}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={() => {
          setDraft(value.toString());
          setEditing(false);
        }}
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

// ─── Reservations Tab ────────────────────────────────────────────────────────

function ReservationsTab({
  bookings,
  loading,
}: {
  bookings: Booking[];
  loading: boolean;
}) {
  const [subTab, setSubTab] = useState<"upcoming" | "past">("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter((b) => b.checkIn >= today);
  const past = bookings.filter((b) => b.checkIn < today);
  const displayed = subTab === "upcoming" ? upcoming : past;

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{confirmedBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{pendingBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs + Export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setSubTab("upcoming")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              subTab === "upcoming"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setSubTab("past")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              subTab === "past"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Past ({past.length})
          </button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportBookingsCSV(bookings)}
          disabled={bookings.length === 0}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Booking list */}
      <Card>
        <CardContent className="p-0">
          {displayed.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              {loading ? "Loading bookings..." : `No ${subTab} bookings.`}
            </div>
          ) : (
            <div className="divide-y">
              {displayed.map((booking) => {
                const isExpanded = expandedId === booking.id;
                const nights = nightsBetween(booking.checkIn, booking.checkOut);
                return (
                  <div key={booking.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 text-sm min-w-0">
                        <span className="font-medium w-32 truncate">{booking.guestName}</span>
                        <span className="text-muted-foreground w-36 truncate">
                          {booking.propertyName}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </span>
                        <span className="font-medium">{formatCurrency(booking.totalPrice)}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t bg-muted/20 px-4 py-4 pl-12">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Guest Name
                            </p>
                            <p>{booking.guestName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Email
                            </p>
                            <p>{booking.guestEmail}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Phone
                            </p>
                            <p>{booking.guestPhone || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Check-in
                            </p>
                            <p>{formatDate(booking.checkIn)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Check-out
                            </p>
                            <p>{formatDate(booking.checkOut)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Nights
                            </p>
                            <p>{nights}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Guests
                            </p>
                            <p>{booking.guests}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Total Paid
                            </p>
                            <p className="font-semibold">{formatCurrency(booking.totalPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Status
                            </p>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Special Requests
                            </p>
                            <p className="text-muted-foreground">
                              {booking.specialRequests || "None"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Booking ID
                            </p>
                            <p className="font-mono text-xs">{booking.id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Stripe Payment Intent
                            </p>
                            <p className="font-mono text-xs">{booking.stripePaymentIntentId}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Created
                            </p>
                            <p className="text-xs">{formatDateTime(booking.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Pricing Tab ─────────────────────────────────────────────────────────────

const PROPERTY_LABELS: Record<string, string> = {
  "elevation-estate": "Elevation Estate",
  turquoise: "Turquoise Tavern",
};

function PricingTab({ authToken }: { authToken: string }) {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New seasonal rate form state
  const [newRate, setNewRate] = useState<Record<string, { label: string; startDate: string; endDate: string; rate: string }>>({});

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setPricing(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const savePricing = async (updated: PricingConfig) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setPricing(updated);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const updateField = (slug: string, field: keyof PropertyPricing, value: number) => {
    if (!pricing) return;
    const updated = {
      ...pricing,
      [slug]: { ...pricing[slug], [field]: value },
    };
    savePricing(updated);
  };

  const addSeasonalRate = (slug: string) => {
    if (!pricing) return;
    const form = newRate[slug];
    if (!form || !form.label || !form.startDate || !form.endDate || !form.rate) return;
    const rate: SeasonalRate = {
      id: `sr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: form.label,
      startDate: form.startDate,
      endDate: form.endDate,
      rate: parseFloat(form.rate),
    };
    const updated = {
      ...pricing,
      [slug]: {
        ...pricing[slug],
        seasonalRates: [...pricing[slug].seasonalRates, rate],
      },
    };
    savePricing(updated);
    setNewRate((prev) => ({ ...prev, [slug]: { label: "", startDate: "", endDate: "", rate: "" } }));
  };

  const deleteSeasonalRate = (slug: string, rateId: string) => {
    if (!pricing) return;
    const updated = {
      ...pricing,
      [slug]: {
        ...pricing[slug],
        seasonalRates: pricing[slug].seasonalRates.filter((r) => r.id !== rateId),
      },
    };
    savePricing(updated);
  };

  if (loading || !pricing) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading pricing configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {saving && (
        <div className="rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Saving changes...
        </div>
      )}
      {Object.entries(PROPERTY_LABELS).map(([slug, label]) => {
        const p = pricing[slug];
        if (!p) return null;
        const form = newRate[slug] || { label: "", startDate: "", endDate: "", rate: "" };
        return (
          <Card key={slug}>
            <CardHeader>
              <CardTitle className="text-lg">{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base fields */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">
                    Base Nightly Rate
                  </Label>
                  <InlineEdit
                    value={p.baseRate}
                    prefix="$"
                    onSave={(val) => updateField(slug, "baseRate", val)}
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">
                    Cleaning Fee
                  </Label>
                  <InlineEdit
                    value={p.cleaningFee}
                    prefix="$"
                    onSave={(val) => updateField(slug, "cleaningFee", val)}
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">
                    Weekly Discount
                  </Label>
                  <InlineEdit
                    value={p.weeklyDiscount}
                    suffix="%"
                    onSave={(val) => updateField(slug, "weeklyDiscount", val)}
                  />
                </div>
              </div>

              <Separator />

              {/* Seasonal Rates */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">Seasonal Rates</h4>
                {p.seasonalRates.length > 0 ? (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Label
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Start Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            End Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Rate
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {p.seasonalRates.map((sr) => (
                          <tr key={sr.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{sr.label}</td>
                            <td className="px-3 py-2">{sr.startDate}</td>
                            <td className="px-3 py-2">{sr.endDate}</td>
                            <td className="px-3 py-2 font-medium">
                              {formatCurrency(sr.rate)}/night
                            </td>
                            <td className="px-3 py-2">
                              {isSeasonalRateActive(sr) ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Inactive
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteSeasonalRate(slug, sr.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-muted-foreground">
                    No seasonal rates configured.
                  </p>
                )}

                {/* Add Seasonal Rate Form */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h5 className="mb-3 text-sm font-medium flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Seasonal Rate
                  </h5>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="e.g. Summer Peak"
                        value={form.label}
                        onChange={(e) =>
                          setNewRate((prev) => ({
                            ...prev,
                            [slug]: { ...form, label: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) =>
                          setNewRate((prev) => ({
                            ...prev,
                            [slug]: { ...form, startDate: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) =>
                          setNewRate((prev) => ({
                            ...prev,
                            [slug]: { ...form, endDate: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Nightly Rate ($)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 7500"
                        value={form.rate}
                        onChange={(e) =>
                          setNewRate((prev) => ({
                            ...prev,
                            [slug]: { ...form, rate: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => addSeasonalRate(slug)}
                    disabled={!form.label || !form.startDate || !form.endDate || !form.rate}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Rate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Campaigns Tab ──────────────────────────────────────────────────────────

interface CampaignData {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
  openRate: number;
  clickRate: number;
  grade: string;
  recipients: {
    id: string;
    campaignId: string;
    name: string;
    email: string;
    opened: number;
    clicked: number;
    openedAt: string | null;
    clickedAt: string | null;
  }[];
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "bg-green-100 text-green-800";
    case "B": return "bg-blue-100 text-blue-800";
    case "C": return "bg-yellow-100 text-yellow-800";
    case "D": return "bg-orange-100 text-orange-800";
    case "F": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function campaignInsight(grade: string, status: string): string {
  if (status === "draft") return "This campaign hasn't been sent yet. Add recipients and send when ready.";
  switch (grade) {
    case "A": return "Outstanding engagement! Your audience loved this campaign.";
    case "B": return "Strong performance. Subject line and content resonated well.";
    case "C": return "Decent results. Consider A/B testing subject lines to improve open rates.";
    case "D": return "Below average engagement. Try personalizing content and segmenting your audience.";
    case "F": return "Very low engagement. Review your recipient list quality and sending time.";
    default: return "No engagement data available yet.";
  }
}

function CampaignsTab({ authToken }: { authToken: string }) {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CampaignData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDetail(data.campaign);
      }
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  }, [authToken]);

  const handleCreate = async () => {
    if (!formName.trim() || !formSubject.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, subject: formSubject }),
      });
      if (res.ok) {
        setFormName("");
        setFormSubject("");
        setShowForm(false);
        await fetchCampaigns();
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedId(id);
    fetchDetail(id);
  };

  // Detail view
  if (selectedId && detail) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedId(null); setDetail(null); }}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to campaigns
        </Button>

        <div>
          <h2 className="text-xl font-bold">{detail.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{detail.subject}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={cn("capitalize", detail.status === "sent" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                {detail.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{detail.recipientCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{detail.openRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={cn("text-lg px-3 py-1", gradeColor(detail.grade))}>{detail.grade}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground italic">{campaignInsight(detail.grade, detail.status)}</p>
          </CardContent>
        </Card>

        {detail.recipients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">Email</th>
                      <th className="px-4 py-2 text-center font-medium">Opened</th>
                      <th className="px-4 py-2 text-center font-medium">Clicked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detail.recipients.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.email}</td>
                        <td className="px-4 py-2 text-center">
                          {r.opened ? <Check className="inline h-4 w-4 text-green-600" /> : <X className="inline h-4 w-4 text-gray-300" />}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {r.clicked ? <Check className="inline h-4 w-4 text-green-600" /> : <X className="inline h-4 w-4 text-gray-300" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (selectedId && detailLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading campaign details...</div>;
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Email Campaigns</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1.5 h-4 w-4" /> New Campaign
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="camp-name">Campaign Name</Label>
                <Input id="camp-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Spring Newsletter" />
              </div>
              <div>
                <Label htmlFor="camp-subject">Subject Line</Label>
                <Input id="camp-subject" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="e.g. Your spring getaway awaits" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={creating || !formName.trim() || !formSubject.trim()}>
                {creating ? "Creating..." : "Create Campaign"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setFormName(""); setFormSubject(""); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="px-4 py-12 text-center text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">No campaigns yet. Create your first one!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Subject</th>
                    <th className="px-4 py-2 text-center font-medium">Status</th>
                    <th className="px-4 py-2 text-center font-medium">Sent</th>
                    <th className="px-4 py-2 text-center font-medium">Recipients</th>
                    <th className="px-4 py-2 text-center font-medium">Open %</th>
                    <th className="px-4 py-2 text-center font-medium">Click %</th>
                    <th className="px-4 py-2 text-center font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {campaigns.map((c) => (
                    <tr key={c.id} onClick={() => handleRowClick(c.id)} className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{c.subject}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn("capitalize", c.status === "sent" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {c.sentAt ? formatDate(c.sentAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">{c.recipientCount}</td>
                      <td className="px-4 py-3 text-center">{c.recipientCount > 0 ? `${c.openRate.toFixed(1)}%` : "—"}</td>
                      <td className="px-4 py-3 text-center">{c.recipientCount > 0 ? `${c.clickRate.toFixed(1)}%` : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn(gradeColor(c.recipientCount > 0 ? c.grade : ""), c.recipientCount === 0 && "bg-gray-100 text-gray-500")}>
                          {c.recipientCount > 0 ? c.grade : "—"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Additional settings will be available in a future update.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Maintenance Tab ─────────────────────────────────────────────────────────

interface MaintenanceTask {
  id: string;
  property: string;
  appliance: string;
  task: string;
  intervalDays: number;
  lastCompleted: string | null;
  nextDue: string;
  notes: string;
  createdAt: string;
}

const PROPERTY_OPTIONS = [
  { value: "elevation-estate", label: "Elevation Estate" },
  { value: "turquoise", label: "Turquoise Tavern" },
  { value: "both", label: "Both" },
];

function propertyLabel(value: string) {
  return PROPERTY_OPTIONS.find((p) => p.value === value)?.label ?? value;
}

function daysFromNow(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function relativeDue(dateStr: string): string {
  const days = daysFromNow(dateStr);
  const date = new Date(dateStr);
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  const dateFormatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(dateYear !== currentYear ? { year: "numeric" } : {}),
  });
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} (${dateFormatted})`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 30) return `Due in ${days} days — ${dateFormatted}`;
  return `Due in ${days} days — ${dateFormatted}`;
}

function intervalLabel(days: number): string {
  if (days % 365 === 0) return `Every ${days / 365} year${days / 365 !== 1 ? "s" : ""}`;
  if (days % 30 === 0) return `Every ${days / 30} month${days / 30 !== 1 ? "s" : ""}`;
  if (days % 7 === 0) return `Every ${days / 7} week${days / 7 !== 1 ? "s" : ""}`;
  return `Every ${days} day${days !== 1 ? "s" : ""}`;
}

function MaintenanceTab({ authToken }: { authToken: string }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formProperty, setFormProperty] = useState("elevation-estate");
  const [formAppliance, setFormAppliance] = useState("");
  const [formTask, setFormTask] = useState("");
  const [formIntervalNum, setFormIntervalNum] = useState(6);
  const [formIntervalUnit, setFormIntervalUnit] = useState<"days" | "weeks" | "months">("months");
  const [formLastCompleted, setFormLastCompleted] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/maintenance", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const resetForm = () => {
    setFormProperty("elevation-estate");
    setFormAppliance("");
    setFormTask("");
    setFormIntervalNum(6);
    setFormIntervalUnit("months");
    setFormLastCompleted(new Date().toISOString().split("T")[0]);
    setFormNotes("");
    setEditingId(null);
  };

  const intervalToDays = () => {
    if (formIntervalUnit === "weeks") return formIntervalNum * 7;
    if (formIntervalUnit === "months") return formIntervalNum * 30;
    return formIntervalNum;
  };

  const handleSave = async () => {
    const intervalDays = intervalToDays();
    if (editingId) {
      const res = await fetch(`/api/admin/maintenance/${editingId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ property: formProperty, appliance: formAppliance, task: formTask, intervalDays, notes: formNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } else {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          property: formProperty,
          appliance: formAppliance,
          task: formTask,
          intervalDays,
          lastCompleted: formLastCompleted || null,
          notes: formNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    }
    resetForm();
    setShowForm(false);
  };

  const handleMarkComplete = async (id: string) => {
    const res = await fetch(`/api/admin/maintenance/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ markComplete: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/maintenance/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    }
  };

  const handleEdit = (t: MaintenanceTask) => {
    setFormProperty(t.property);
    setFormAppliance(t.appliance);
    setFormTask(t.task);
    setFormNotes(t.notes);
    // Reverse interval
    if (t.intervalDays % 30 === 0) {
      setFormIntervalNum(t.intervalDays / 30);
      setFormIntervalUnit("months");
    } else if (t.intervalDays % 7 === 0) {
      setFormIntervalNum(t.intervalDays / 7);
      setFormIntervalUnit("weeks");
    } else {
      setFormIntervalNum(t.intervalDays);
      setFormIntervalUnit("days");
    }
    setFormLastCompleted(t.lastCompleted || "");
    setEditingId(t.id);
    setShowForm(true);
  };

  const sortByDue = (a: MaintenanceTask, b: MaintenanceTask) =>
    new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
  const overdue = tasks.filter((t) => daysFromNow(t.nextDue) < 0).sort(sortByDue);
  const dueSoon = tasks.filter((t) => { const d = daysFromNow(t.nextDue); return d >= 0 && d <= 30; }).sort(sortByDue);
  const upcoming = tasks.filter((t) => daysFromNow(t.nextDue) > 30).sort(sortByDue);

  const statusGroups = [
    { label: "Overdue", emoji: "\uD83D\uDD34", tasks: overdue, color: "text-red-600" },
    { label: "Due Soon", emoji: "\uD83D\uDFE1", tasks: dueSoon, color: "text-yellow-600" },
    { label: "Upcoming", emoji: "\uD83D\uDFE2", tasks: upcoming, color: "text-green-600" },
  ];

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading maintenance tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Maintenance Schedule</h2>
        <Button
          size="sm"
          className="bg-[#0f1d3d] hover:bg-[#1a2d5c]"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-xs">Property</Label>
                <select
                  value={formProperty}
                  onChange={(e) => setFormProperty(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PROPERTY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Appliance / System</Label>
                <Input
                  placeholder="e.g. Ice Maker, HVAC, Hot Tub"
                  value={formAppliance}
                  onChange={(e) => setFormAppliance(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Task</Label>
                <Input
                  placeholder="e.g. Clean filter, Replace filter"
                  value={formTask}
                  onChange={(e) => setFormTask(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Interval</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    min={1}
                    value={formIntervalNum}
                    onChange={(e) => setFormIntervalNum(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <select
                    value={formIntervalUnit}
                    onChange={(e) => setFormIntervalUnit(e.target.value as "days" | "weeks" | "months")}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              {!editingId && (
                <div>
                  <Label className="text-xs">Last Completed</Label>
                  <Input
                    type="date"
                    value={formLastCompleted}
                    onChange={(e) => setFormLastCompleted(e.target.value)}
                  />
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-3">
                <Label className="text-xs">Notes (optional)</Label>
                <textarea
                  placeholder="Optional notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#0f1d3d] hover:bg-[#1a2d5c]"
                onClick={handleSave}
                disabled={!formAppliance || !formTask}
              >
                {editingId ? "Update Task" : "Save Task"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { resetForm(); setShowForm(false); }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task groups */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No maintenance tasks yet. Add one to get started.
          </CardContent>
        </Card>
      ) : (
        statusGroups.map((group) => {
          if (group.tasks.length === 0) return null;
          return (
            <div key={group.label}>
              <h3 className={cn("mb-3 text-sm font-semibold flex items-center gap-2", group.color)}>
                <span>{group.emoji}</span> {group.label} ({group.tasks.length})
              </h3>
              <div className="space-y-3">
                {group.tasks.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="py-4 px-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{t.appliance}</span>
                            <span className="text-muted-foreground">&mdash;</span>
                            <span>{t.task}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{propertyLabel(t.property)}</Badge>
                            <span className={cn(
                              daysFromNow(t.nextDue) < 0 && "text-red-600 font-medium",
                              daysFromNow(t.nextDue) >= 0 && daysFromNow(t.nextDue) <= 14 && "text-yellow-600 font-medium"
                            )}>
                              {relativeDue(t.nextDue)}
                            </span>
                            <span>{intervalLabel(t.intervalDays)}</span>
                          </div>
                          {t.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{t.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-200 hover:bg-green-50"
                            onClick={() => handleMarkComplete(t.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(t)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Calendar Tab ───────────────────────────────────────────────────────────

type PropertyFilter = "both" | "elevation" | "turquoise";

interface CalendarEvent {
  id: string;
  property: "elevation" | "turquoise";
  guestName: string;
  source: "Direct" | "Airbnb" | "VRBO" | "Blocked";
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const days: Date[] = [];
  // fill from Sunday before month start
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function CalendarTab({
  bookings,
  authToken,
}: {
  bookings: Booking[];
  authToken: string;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<PropertyFilter>("both");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calLoading, setCalLoading] = useState(false);

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Build events from bookings + iCal blocked dates
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCalLoading(true);
      try {
        // Fetch iCal blocked dates for both properties
        const [elevRes, turqRes] = await Promise.all([
          fetch("/api/availability?property=elevation-estate"),
          fetch("/api/availability?property=turquoise"),
        ]);
        const elevData = elevRes.ok ? await elevRes.json() : { blockedDates: [] };
        const turqData = turqRes.ok ? await turqRes.json() : { blockedDates: [] };

        if (cancelled) return;

        const elevBlocked: Set<string> = new Set(elevData.blockedDates ?? []);
        const turqBlocked: Set<string> = new Set(turqData.blockedDates ?? []);

        // Build events from confirmed bookings
        const bookingEvents: CalendarEvent[] = bookings
          .filter((b) => b.status === "confirmed")
          .map((b) => ({
            id: b.id,
            property: b.propertySlug.includes("turquoise")
              ? ("turquoise" as const)
              : ("elevation" as const),
            guestName: b.guestName?.split(" ")[0] || "Booked",
            source: "Direct" as const,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
          }));

        // Remove booking dates from blocked sets (avoid duplicates)
        for (const ev of bookingEvents) {
          const start = new Date(ev.checkIn);
          const end = new Date(ev.checkOut);
          const blocked = ev.property === "elevation" ? elevBlocked : turqBlocked;
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            blocked.delete(toDateStr(d));
          }
        }

        // Convert remaining blocked dates to contiguous events
        const blockedToEvents = (
          blocked: Set<string>,
          property: "elevation" | "turquoise"
        ): CalendarEvent[] => {
          const sorted = Array.from(blocked).sort();
          if (sorted.length === 0) return [];
          const result: CalendarEvent[] = [];
          let start = sorted[0];
          let prev = sorted[0];
          for (let i = 1; i <= sorted.length; i++) {
            const curr = sorted[i];
            const prevDate = new Date(prev);
            const nextDay = new Date(prevDate);
            nextDay.setDate(nextDay.getDate() + 1);
            if (i < sorted.length && curr === toDateStr(nextDay)) {
              prev = curr;
            } else {
              const endDate = new Date(prev);
              endDate.setDate(endDate.getDate() + 1);
              result.push({
                id: `blocked-${property}-${start}`,
                property,
                guestName: "Airbnb/VRBO",
                source: "Blocked",
                checkIn: start,
                checkOut: toDateStr(endDate),
              });
              if (i < sorted.length) {
                start = curr;
                prev = curr;
              }
            }
          }
          return result;
        }

        const allEvents = [
          ...bookingEvents,
          ...blockedToEvents(elevBlocked, "elevation"),
          ...blockedToEvents(turqBlocked, "turquoise"),
        ];

        if (!cancelled) setEvents(allEvents);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setCalLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookings, month, year, authToken]);

  const days = getMonthDays(year, month);
  const todayStr = toDateStr(today);

  // Filter events by property
  const filtered = events.filter((ev) => {
    if (filter === "both") return true;
    return ev.property === filter;
  });

  // Get events that overlap a given date
  function eventsForDate(dateStr: string): CalendarEvent[] {
    return filtered.filter((ev) => dateStr >= ev.checkIn && dateStr < ev.checkOut);
  }

  const hasAnyEvents = filtered.length > 0;

  // Mobile: build week rows
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {monthLabel}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="ml-2">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {(
            [
              { id: "both", label: "Both" },
              { id: "elevation", label: "Elevation Estate" },
              { id: "turquoise", label: "Turquoise Tavern" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === opt.id
                  ? "bg-[#0f1d3d] text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {calLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Desktop Calendar Grid */}
      {!calLoading && (
        <>
          <div className="hidden md:block rounded-lg border bg-white overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b bg-gray-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dateStr = toDateStr(day);
                const isCurrentMonth = day.getMonth() === month;
                const isToday = dateStr === todayStr;
                const isPast = dateStr < todayStr;
                const dayEvents = eventsForDate(dateStr);

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[90px] border-b border-r p-1 relative",
                      !isCurrentMonth && "bg-gray-50/50",
                      isPast && isCurrentMonth && "bg-gray-50/30",
                      isToday && "ring-2 ring-inset ring-[#0f1d3d]/30"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium",
                        !isCurrentMonth && "text-muted-foreground/40",
                        isPast && isCurrentMonth && "text-muted-foreground/60",
                        isToday &&
                          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0f1d3d] text-white"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => {
                        const isStart = dateStr === ev.checkIn;
                        return (
                          <div
                            key={ev.id}
                            title={`${ev.guestName} (${ev.source}) — ${ev.checkIn} to ${ev.checkOut}`}
                            className={cn(
                              "text-[10px] leading-tight px-1 py-0.5 truncate text-white",
                              ev.source === "Blocked"
                                ? ev.property === "elevation"
                                  ? "bg-[#0f1d3d]/40 text-[#0f1d3d]"
                                  : "bg-[#0ea5e9]/40 text-[#0369a1]"
                                : ev.property === "elevation"
                                  ? "bg-[#0f1d3d]"
                                  : "bg-[#0ea5e9]",
                              isStart ? "rounded-l" : "",
                              dateStr ===
                                toDateStr(
                                  new Date(
                                    new Date(ev.checkOut).getTime() - 86400000
                                  )
                                )
                                ? "rounded-r"
                                : ""
                            )}
                          >
                            {isStart
                              ? `${ev.guestName} · ${ev.source}`
                              : ""}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-muted-foreground px-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: scrollable week list */}
          <div className="md:hidden space-y-3">
            {weeks.map((week, wi) => {
              const weekHasEvents = week.some(
                (d) => eventsForDate(toDateStr(d)).length > 0
              );
              return (
                <div key={wi} className="rounded-lg border bg-white overflow-hidden">
                  <div className="grid grid-cols-7 border-b bg-gray-50">
                    {week.map((d, di) => {
                      const ds = toDateStr(d);
                      const isToday2 = ds === todayStr;
                      return (
                        <div key={di} className="text-center py-1">
                          <div className="text-[10px] text-muted-foreground">
                            {["S", "M", "T", "W", "T", "F", "S"][di]}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-medium",
                              isToday2 &&
                                "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0f1d3d] text-white",
                              d.getMonth() !== month &&
                                "text-muted-foreground/40"
                            )}
                          >
                            {d.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {weekHasEvents && (
                    <div className="p-2 space-y-1">
                      {week.flatMap((d) => {
                        const ds = toDateStr(d);
                        return eventsForDate(ds)
                          .filter((ev) => ev.checkIn === ds)
                          .map((ev) => (
                            <div
                              key={ev.id}
                              className={cn(
                                "text-xs px-2 py-1 rounded text-white truncate",
                                ev.source === "Blocked"
                                  ? ev.property === "elevation"
                                    ? "bg-[#0f1d3d]/40 text-[#0f1d3d]"
                                    : "bg-[#0ea5e9]/40 text-[#0369a1]"
                                  : ev.property === "elevation"
                                    ? "bg-[#0f1d3d]"
                                    : "bg-[#0ea5e9]"
                              )}
                            >
                              {ev.guestName} · {ev.source} ·{" "}
                              {new Date(ev.checkIn).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                              {" - "}
                              {new Date(ev.checkOut).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          ));
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {!hasAnyEvents && !calLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No bookings this month
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0f1d3d]" />
              Elevation Estate (direct)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0ea5e9]" />
              Turquoise Tavern (direct)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0f1d3d]/40" />
              Elevation (Airbnb/VRBO)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0ea5e9]/40" />
              Turquoise (Airbnb/VRBO)
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Contacts Tab ───────────────────────────────────────────────────────────

interface SvcContact {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface SvcVendor {
  id: string;
  categoryId: string;
  companyName: string;
  website: string;
  notes: string;
  createdAt: string;
  contacts: SvcContact[];
}

interface SvcCategory {
  id: string;
  name: string;
  sortOrder: number;
  vendors: SvcVendor[];
}

function ContactsTab({ authToken }: { authToken: string }) {
  const [categories, setCategories] = useState<SvcCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState({ companyName: "", website: "", notes: "", categoryId: "" });
  const [addingVendorTo, setAddingVendorTo] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState({ companyName: "", website: "", notes: "" });
  const [addingContactTo, setAddingContactTo] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", role: "" });
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [catDeleteWarning, setCatDeleteWarning] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/contacts", { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Failed to fetch contacts:", e);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const applyResult = (data: { categories: SvcCategory[] }) => {
    setCategories(data.categories);
  };

  const saveVendor = async (vendor: SvcVendor) => {
    const res = await fetch("/api/admin/contacts/vendors", {
      method: "POST", headers,
      body: JSON.stringify({ id: vendor.id, categoryId: vendorForm.categoryId || vendor.categoryId, companyName: vendorForm.companyName, website: vendorForm.website, notes: vendorForm.notes }),
    });
    if (res.ok) applyResult(await res.json());
    setEditingVendor(null);
  };

  const renameCat = async (id: string) => {
    if (!editCatName.trim()) return;
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH", headers,
      body: JSON.stringify({ id, name: editCatName.trim() }),
    });
    if (res.ok) applyResult(await res.json());
    setEditingCat(null);
  };

  const deleteCat = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat.vendors.length > 0) {
      setCatDeleteWarning(id);
      return;
    }
    const res = await fetch("/api/admin/contacts", {
      method: "DELETE", headers,
      body: JSON.stringify({ id }),
    });
    if (res.ok) applyResult(await res.json());
  };

  const addVendor = async (categoryId: string) => {
    const res = await fetch("/api/admin/contacts/vendors", {
      method: "POST", headers,
      body: JSON.stringify({ categoryId, ...newVendor }),
    });
    if (res.ok) applyResult(await res.json());
    setAddingVendorTo(null);
    setNewVendor({ companyName: "", website: "", notes: "" });
  };

  const removeVendor = async (id: string) => {
    const res = await fetch("/api/admin/contacts/vendors", {
      method: "DELETE", headers,
      body: JSON.stringify({ id }),
    });
    if (res.ok) applyResult(await res.json());
  };

  const addContact = async (vendorId: string) => {
    const res = await fetch("/api/admin/contacts/contacts", {
      method: "POST", headers,
      body: JSON.stringify({ vendorId, ...contactForm }),
    });
    if (res.ok) applyResult(await res.json());
    setAddingContactTo(null);
    setContactForm({ name: "", email: "", phone: "", role: "" });
  };

  const removeContact = async (id: string) => {
    const res = await fetch("/api/admin/contacts/contacts", {
      method: "DELETE", headers,
      body: JSON.stringify({ id }),
    });
    if (res.ok) applyResult(await res.json());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    const res = await fetch("/api/admin/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ name: newCatName.trim() }),
    });
    if (res.ok) {
      await fetchCategories();
      setNewCatName("");
      setShowCatForm(false);
    }
    setAddingCat(false);
  };

  return (
    <div className="space-y-8">
      {/* Category Quick-Nav */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="shrink-0 rounded-full border border-[#0f1d3d]/20 px-3 py-1 text-xs text-[#0f1d3d] hover:bg-[#0f1d3d] hover:text-white transition"
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Add Category */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} service categories, sorted A–Z</p>
        {showCatForm ? (
          <div className="flex items-center gap-2">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name..."
              className="h-8 w-48 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              autoFocus
            />
            <Button size="sm" onClick={handleAddCategory} disabled={addingCat} className="h-8 bg-[#0f1d3d] hover:bg-[#1a2d5c]">
              {addingCat ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowCatForm(false); setNewCatName(""); }} className="h-8">
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowCatForm(true)} className="h-8">
            <Plus className="h-3 w-3 mr-1" /> Add Category
          </Button>
        )}
      </div>

      {categories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`}>
          <div className="flex items-center justify-between mb-3">
            {editingCat === cat.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="h-7 w-48 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && renameCat(cat.id)}
                  autoFocus
                />
                <Button size="sm" className="h-7 text-xs bg-[#0f1d3d] hover:bg-[#1a2d5c]" onClick={() => renameCat(cat.id)}>Save</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingCat(null)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat.name}</h3>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); }}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  className="text-muted-foreground hover:text-red-600"
                  onClick={() => deleteCat(cat.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                {catDeleteWarning === cat.id && (
                  <span className="text-xs text-red-600">Remove all vendors first</span>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setAddingVendorTo(addingVendorTo === cat.id ? null : cat.id); setNewVendor({ companyName: "", website: "", notes: "" }); }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Vendor
            </Button>
          </div>

          {addingVendorTo === cat.id && (
            <Card className="mb-3 border-dashed">
              <CardContent className="pt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Company Name</Label>
                    <Input value={newVendor.companyName} onChange={(e) => setNewVendor({ ...newVendor, companyName: e.target.value })} placeholder="Company name" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Website</Label>
                    <Input value={newVendor.website} onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })} placeholder="example.com" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={newVendor.notes} onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })} placeholder="Optional notes" className="mt-1" rows={2} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs bg-[#0f1d3d] hover:bg-[#1a2d5c]" onClick={() => addVendor(cat.id)} disabled={!newVendor.companyName.trim()}>
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingVendorTo(null)}>
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {cat.vendors.length === 0 && addingVendorTo !== cat.id && (
            <p
              className="text-sm text-muted-foreground italic cursor-pointer hover:text-foreground py-2"
              onClick={() => { setAddingVendorTo(cat.id); setNewVendor({ companyName: "", website: "", notes: "" }); }}
            >
              No vendor added yet — click to add
            </p>
          )}

          <div className="space-y-3">
            {cat.vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="pt-4">
                  {editingVendor === vendor.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs">Company Name</Label>
                          <Input value={vendorForm.companyName} onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Website</Label>
                          <Input value={vendorForm.website} onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })} className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Notes</Label>
                        <Textarea value={vendorForm.notes} onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })} className="mt-1" rows={2} />
                      </div>
                      <div>
                        <Label className="text-xs">Category</Label>
                        <select
                          value={vendorForm.categoryId}
                          onChange={(e) => setVendorForm({ ...vendorForm, categoryId: e.target.value })}
                          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs bg-[#0f1d3d] hover:bg-[#1a2d5c]" onClick={() => saveVendor(vendor)}>
                          <Check className="h-3 w-3 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingVendor(null)}>
                          <X className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold">{vendor.companyName}</span>
                            <button
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => { setEditingVendor(vendor.id); setVendorForm({ companyName: vendor.companyName, website: vendor.website, notes: vendor.notes, categoryId: vendor.categoryId }); }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {vendor.website && (
                            <a
                              href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              {vendor.website} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {vendor.notes && <p className="text-xs text-muted-foreground mt-1">{vendor.notes}</p>}
                        </div>
                        <button className="text-muted-foreground hover:text-red-600" onClick={() => removeVendor(vendor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        {vendor.contacts.map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-medium">{contact.name}</span>
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-xs">{contact.email}</a>
                              )}
                              {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-foreground text-xs">{contact.phone}</a>
                              )}
                              {contact.role && <Badge variant="secondary" className="text-[10px] h-5">{contact.role}</Badge>}
                            </div>
                            <button className="text-muted-foreground hover:text-red-600 ml-2 shrink-0" onClick={() => removeContact(contact.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        {addingContactTo === vendor.id ? (
                          <div className="border rounded-md p-3 mt-2 space-y-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">Name</Label>
                                <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Contact name" className="mt-1 h-8 text-sm" />
                              </div>
                              <div>
                                <Label className="text-xs">Role</Label>
                                <Input value={contactForm.role} onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })} placeholder="e.g. Owner, Technician" className="mt-1 h-8 text-sm" />
                              </div>
                              <div>
                                <Label className="text-xs">Email</Label>
                                <Input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="email@example.com" className="mt-1 h-8 text-sm" />
                              </div>
                              <div>
                                <Label className="text-xs">Phone</Label>
                                <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="530-555-0000" className="mt-1 h-8 text-sm" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs bg-[#0f1d3d] hover:bg-[#1a2d5c]" onClick={() => addContact(vendor.id)} disabled={!contactForm.name.trim()}>
                                <Check className="h-3 w-3 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingContactTo(null)}>
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground mt-1"
                            onClick={() => { setAddingContactTo(vendor.id); setContactForm({ name: "", email: "", phone: "", role: "" }); }}
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Add Contact
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

type Tab = "reservations" | "calendar" | "pricing" | "maintenance" | "campaigns" | "contacts" | "settings";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("reservations");

  const fetchBookings = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setAuthToken(null);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings ?? data);
      }
    } catch {
      // silently fail on refresh
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;
    fetchBookings(authToken);
    const interval = setInterval(() => fetchBookings(authToken), 30000);
    return () => clearInterval(interval);
  }, [authToken, fetchBookings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setLoginError("Invalid password. Please try again.");
      } else if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings ?? data);
        setAuthToken(password);
      } else {
        setLoginError("Something went wrong. Please try again.");
      }
    } catch {
      setLoginError("Unable to connect. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setPassword("");
    setBookings([]);
  };

  // --- Login Screen ---
  if (!authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1d3d] px-4">
        <Card className="w-full max-w-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f1d3d]">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-xl">GDP Tahoe Admin</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your admin password to continue
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-[#0f1d3d] hover:bg-[#1a2d5c]"
                disabled={loginLoading}
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Dashboard ---
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "reservations", label: "Reservations", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
    { id: "pricing", label: "Pricing", icon: <DollarSign className="h-4 w-4" /> },
    { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
    { id: "campaigns", label: "Campaigns", icon: <Send className="h-4 w-4" /> },
    { id: "contacts", label: "Contacts", icon: <Phone className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-[#0f1d3d] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight">GDP Tahoe Admin</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchBookings(authToken)}
              disabled={loading}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("mr-1 h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-[#0f1d3d] text-[#0f1d3d]"
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "reservations" && (
          <ReservationsTab bookings={bookings} loading={loading} />
        )}
        {activeTab === "calendar" && (
          <CalendarTab bookings={bookings} authToken={authToken} />
        )}
        {activeTab === "pricing" && <PricingTab authToken={authToken} />}
        {activeTab === "maintenance" && <MaintenanceTab authToken={authToken} />}
        {activeTab === "campaigns" && <CampaignsTab authToken={authToken} />}
        {activeTab === "contacts" && <ContactsTab authToken={authToken} />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
