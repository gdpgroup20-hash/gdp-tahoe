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
  Download,
  Plus,
  Trash2,
  DollarSign,
  CalendarDays,
  Settings,
  Check,
  X,
  Pencil,
} from "lucide-react";
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

// ─── Main Admin Page ─────────────────────────────────────────────────────────

type Tab = "reservations" | "pricing" | "settings";

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
    { id: "pricing", label: "Pricing", icon: <DollarSign className="h-4 w-4" /> },
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
        {activeTab === "pricing" && <PricingTab authToken={authToken} />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
