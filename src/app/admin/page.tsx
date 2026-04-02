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
  Receipt,
  Upload,
  FileText,
  BookOpen,
  Eye,
  EyeOff,
  Mail,
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
  totRate: number;
  rentalAgreementUrl: string;
  rentalAgreementName: string;
  cancellationPolicy: string;
  securityDepositPolicy: string;
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

// ─── Platform Reservation Type ──────────────────────────────────────────────

interface PlatformReservation {
  id: string;
  confirmationCode: string;
  source: "airbnb" | "vrbo" | "direct";
  property: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  earnings: string;
  status: string;
  bookedOn: string;
  createdAt: string;
}

// ─── Unified Reservation (merged view) ─────────────────────────────────────

interface UnifiedReservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  property: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: string;
  source: "direct" | "airbnb" | "vrbo";
  confirmationCode: string;
  earnings: string;
  totalPrice: number;
  specialRequests: string;
  stripePaymentIntentId: string;
  createdAt: string;
}

function bookingToUnified(b: Booking): UnifiedReservation {
  return {
    id: b.id,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    guestPhone: b.guestPhone,
    property: b.propertyName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: nightsBetween(b.checkIn, b.checkOut),
    guests: b.guests,
    status: b.status,
    source: "direct",
    confirmationCode: "",
    earnings: "",
    totalPrice: b.totalPrice,
    specialRequests: b.specialRequests,
    stripePaymentIntentId: b.stripePaymentIntentId,
    createdAt: b.createdAt,
  };
}

function platformToUnified(p: PlatformReservation): UnifiedReservation {
  return {
    id: p.id,
    guestName: p.guestName,
    guestEmail: p.guestEmail,
    guestPhone: p.guestPhone,
    property: p.property === "elevation-estate" ? "Elevation Estate" : p.property === "turquoise" ? "Turquoise Tavern" : p.property,
    checkIn: p.checkIn,
    checkOut: p.checkOut,
    nights: p.nights || nightsBetween(p.checkIn, p.checkOut),
    guests: p.adults + p.children,
    status: p.status,
    source: p.source,
    confirmationCode: p.confirmationCode,
    earnings: p.earnings,
    totalPrice: 0,
    specialRequests: "",
    stripePaymentIntentId: "",
    createdAt: p.createdAt,
  };
}

// ─── Source Badge ────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: "direct" | "airbnb" | "vrbo" }) {
  return (
    <Badge
      className={cn(
        "capitalize",
        source === "airbnb" && "bg-orange-100 text-orange-800 hover:bg-orange-100",
        source === "vrbo" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
        source === "direct" && "bg-[#0f1d3d] text-white hover:bg-[#0f1d3d]"
      )}
    >
      {source === "airbnb" ? "Airbnb" : source === "vrbo" ? "VRBO" : "Direct"}
    </Badge>
  );
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function exportReservationsCSV(reservations: UnifiedReservation[]) {
  const headers = [
    "ID",
    "Confirmation Code",
    "Source",
    "Property",
    "Guest Name",
    "Guest Email",
    "Guest Phone",
    "Check-in",
    "Check-out",
    "Nights",
    "Guests",
    "Total/Earnings",
    "Status",
    "Created",
  ];
  const rows = reservations.map((r) => [
    r.id,
    r.confirmationCode,
    r.source,
    r.property,
    r.guestName,
    r.guestEmail,
    r.guestPhone,
    r.checkIn,
    r.checkOut,
    r.nights.toString(),
    r.guests.toString(),
    r.source === "direct" ? r.totalPrice.toString() : r.earnings,
    r.status,
    r.createdAt,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gdp-tahoe-reservations-${new Date().toISOString().split("T")[0]}.csv`;
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
        onBlur={() => {
          const num = parseFloat(draft);
          if (!isNaN(num) && num !== value) {
            onSave(num);
          }
          setEditing(false);
        }}
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
  authToken,
  onDeleted,
}: {
  bookings: Booking[];
  loading: boolean;
  authToken: string;
  onDeleted: (id: string) => void;
}) {
  const [subTab, setSubTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<"all" | "direct" | "airbnb" | "vrbo">("all");
  const [deleteTarget, setDeleteTarget] = useState<UnifiedReservation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [platformReservations, setPlatformReservations] = useState<PlatformReservation[]>([]);
  const [platformLoading, setPlatformLoading] = useState(true);

  useEffect(() => {
    async function fetchPlatform() {
      try {
        const res = await fetch("/api/admin/platform-reservations", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlatformReservations(data.reservations ?? []);
        }
      } catch {
        // silent
      } finally {
        setPlatformLoading(false);
      }
    }
    fetchPlatform();
  }, [authToken]);

  // Merge bookings + platform reservations into unified list
  const allReservations: UnifiedReservation[] = [
    ...bookings.map(bookingToUnified),
    ...platformReservations.map(platformToUnified),
  ].sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  const today = new Date().toISOString().split("T")[0];

  // Apply source filter
  const filtered = sourceFilter === "all"
    ? allReservations
    : allReservations.filter((r) => r.source === sourceFilter);

  const isCancelled = (r: UnifiedReservation) =>
    r.status === "canceled" || r.status === "cancelled" ||
    r.status.toLowerCase().includes("cancel");

  // Normalize check-in date to ISO YYYY-MM-DD for reliable comparison
  const toISODate = (dateStr: string): string => {
    if (!dateStr) return "";
    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
    // M/D/YYYY or MM/DD/YYYY
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [m, d, y] = parts;
      return `${y.padStart(4,"0")}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
    }
    // Fallback: try Date parse
    try { return new Date(dateStr).toISOString().substring(0, 10); } catch { return dateStr; }
  };

  const cancelled = filtered.filter(isCancelled);
  const upcoming = filtered.filter((r) => !isCancelled(r) && toISODate(r.checkIn) >= today);
  const past = filtered.filter((r) => !isCancelled(r) && toISODate(r.checkIn) < today);
  const displayed = subTab === "upcoming" ? upcoming : subTab === "past" ? past : cancelled;

  const directBookings = bookings.filter((b) => !b.status.toLowerCase().includes("cancel")).length;
  const platformCount = platformReservations.filter((p) => (p.source === "airbnb" || p.source === "vrbo") && !p.status.toLowerCase().includes("cancel")).length;
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const isLoading = loading || platformLoading;

  const showNonDirectDeleteMessage = () => {
    alert(
      "Only direct bookings can be deleted here. Airbnb and VRBO reservations must be managed on their respective platforms."
    );
  };

  const requestDelete = (reservation: UnifiedReservation) => {
    if (reservation.source !== "direct") {
      showNonDirectDeleteMessage();
      return;
    }
    setDeleteTarget(reservation);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.source !== "direct") {
      showNonDirectDeleteMessage();
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok || res.status === 404 || res.status === 500) {
        // Remove from UI regardless — 404/500 means it's already gone or unreachable
        onDeleted(deleteTarget.id);
      }
    } catch {
      alert("Error deleting reservation.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Delete Reservation?</h2>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="rounded-lg border bg-gray-50 p-4 text-sm space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-muted-foreground">Guest</span><span className="font-medium">{deleteTarget.guestName || "Unknown"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span className="font-medium">{deleteTarget.property}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span className="font-medium">{formatDate(deleteTarget.checkIn)} – {formatDate(deleteTarget.checkOut)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{formatCurrency(deleteTarget.totalPrice)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono text-xs">{deleteTarget.id}</span></div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allReservations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Direct Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0f1d3d]">{directBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-700">{platformCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Direct Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs + Filters + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
            <button
              onClick={() => setSubTab("cancelled")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                subTab === "cancelled"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cancelled ({cancelled.length})
            </button>
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="rounded-md border bg-white px-3 py-1.5 text-sm"
          >
            <option value="all">All Sources</option>
            <option value="direct">Direct</option>
            <option value="airbnb">Airbnb</option>
            <option value="vrbo">VRBO</option>
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportReservationsCSV(filtered)}
          disabled={filtered.length === 0}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Reservation list */}
      <Card>
        <CardContent className="p-0">
          {displayed.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              {isLoading ? "Loading reservations..." : `No ${subTab} reservations.`}
            </div>
          ) : (
            <div className="divide-y">
              {displayed.map((res) => {
                const isExpanded = expandedId === res.id;
                return (
                  <div key={res.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : res.id)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 text-sm min-w-0">
                        <span className="font-medium w-32 truncate">{res.guestName || "Guest"}</span>
                        <span className="text-muted-foreground w-36 truncate">
                          {res.property}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(res.checkIn)} - {formatDate(res.checkOut)}
                        </span>
                        <span className="text-muted-foreground">{res.nights}n</span>
                        <SourceBadge source={res.source} />
                        <StatusBadge status={res.status as Booking["status"]} />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t bg-muted/20 px-4 py-4 pl-12">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Guest Name
                            </p>
                            <p>{res.guestName || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Email
                            </p>
                            <p>{res.guestEmail || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Phone
                            </p>
                            <p>{res.guestPhone || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Check-in
                            </p>
                            <p>{formatDate(res.checkIn)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Check-out
                            </p>
                            <p>{formatDate(res.checkOut)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Nights
                            </p>
                            <p>{res.nights}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Guests
                            </p>
                            <p>{res.guests}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              {res.source === "direct" ? "Total Paid" : "Earnings"}
                            </p>
                            <p className="font-semibold">
                              {res.source === "direct" ? formatCurrency(res.totalPrice) : res.earnings || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Source
                            </p>
                            <SourceBadge source={res.source} />
                          </div>
                          {res.source === "direct" && res.specialRequests && (
                            <div className="sm:col-span-2 lg:col-span-3">
                              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                                Special Requests
                              </p>
                              <p className="text-muted-foreground">{res.specialRequests}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              {res.source === "direct" ? "Booking ID" : "Confirmation Code"}
                            </p>
                            <p className="font-mono text-xs">
                              {res.source === "direct" ? res.id : res.confirmationCode || res.id}
                            </p>
                          </div>
                          {res.source === "direct" && res.stripePaymentIntentId && (
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                                Stripe Payment Intent
                              </p>
                              <p className="font-mono text-xs">{res.stripePaymentIntentId}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                              Created
                            </p>
                            <p className="text-xs">{formatDateTime(res.createdAt)}</p>
                          </div>
                        </div>
                        {res.source === "direct" && (
                          <div className="mt-4 pt-4 border-t flex justify-end">
                            <button
                              onClick={() => requestDelete(res)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              🗑️ Delete Reservation
                            </button>
                          </div>
                        )}
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

function RentalAgreementUpload({
  slug,
  url,
  name,
  authToken,
  onUploaded,
  onDeleted,
}: {
  slug: string;
  url: string;
  name: string;
  authToken: string;
  onUploaded: (url: string, name: string) => void;
  onDeleted: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files are allowed."); return; }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("property", slug);
      const res = await fetch("/api/admin/upload-agreement", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onUploaded(data.url, data.name);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (url) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-4">
          {/* PDF preview icon */}
          <div className="flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded border border-red-200 bg-white shadow-sm">
            <div className="w-full rounded-t bg-red-500 px-1 py-0.5 text-center text-[8px] font-bold text-white">PDF</div>
            <FileText className="mt-1 h-6 w-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">✓ Uploaded</span>
            </div>
            <p className="text-sm font-medium text-[#0f1d3d] truncate">{name || "Rental Agreement"}</p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0f1d3d] border border-[#0f1d3d]/20 rounded px-2.5 py-1 hover:bg-[#0f1d3d] hover:text-white transition-colors"
              >
                <FileText className="h-3 w-3" /> View PDF
              </a>
              <button
                type="button"
                onClick={onDeleted}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 border border-red-200 rounded px-2.5 py-1 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#0f1d3d]/30 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-[#0f1d3d] transition-colors">
        <Upload className="h-4 w-4" />
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : "Upload Rental Agreement (PDF)"}
        <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

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

  const updateField = (slug: string, field: keyof PropertyPricing, value: number | string) => {
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
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">
                    Placer County TOT Tax
                  </Label>
                  <InlineEdit
                    value={p.totRate}
                    suffix="%"
                    onSave={(val) => updateField(slug, "totRate", val)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Applied to nightly rate only, not fees.</p>
                </div>
              </div>

              <Separator />

              {/* Rental Agreement */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">Rental Agreement</h4>
                <RentalAgreementUpload
                  slug={slug}
                  url={p.rentalAgreementUrl}
                  name={p.rentalAgreementName}
                  authToken={authToken}
                  onUploaded={(url, name) => {
                    if (!pricing) return;
                    const updated = {
                      ...pricing,
                      [slug]: { ...pricing[slug], rentalAgreementUrl: url, rentalAgreementName: name },
                    };
                    savePricing(updated);
                  }}
                  onDeleted={() => {
                    if (!pricing) return;
                    const updated = {
                      ...pricing,
                      [slug]: { ...pricing[slug], rentalAgreementUrl: "", rentalAgreementName: "" },
                    };
                    savePricing(updated);
                  }}
                />
              </div>

              <Separator />

              {/* Cancellation Policy */}
              <div>
                <Label className="text-xs uppercase text-muted-foreground">
                  Cancellation Policy
                </Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={p.cancellationPolicy}
                  onChange={(e) => {
                    if (!pricing) return;
                    const updated = {
                      ...pricing,
                      [slug]: { ...pricing[slug], cancellationPolicy: e.target.value },
                    };
                    setPricing(updated);
                  }}
                  onBlur={() => {
                    if (pricing) savePricing(pricing);
                  }}
                />
              </div>

              {/* Security Deposit Policy */}
              <div>
                <Label className="text-xs uppercase text-muted-foreground">
                  Security Deposit Policy
                </Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={p.securityDepositPolicy}
                  onChange={(e) => {
                    if (!pricing) return;
                    const updated = {
                      ...pricing,
                      [slug]: { ...pricing[slug], securityDepositPolicy: e.target.value },
                    };
                    setPricing(updated);
                  }}
                  onBlur={() => {
                    if (pricing) savePricing(pricing);
                  }}
                />
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
  body: string;
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

const STAYCATION_DRAFT = `Hi [First Name],

We have some exciting news — Elevation Estate will be featured on an upcoming episode of Staycation, the show that spotlights the world's most extraordinary private homes.

[VIDEO EMBED — paste your video link here]

Watching it back, we were reminded of what makes this place so unique — the 270° views, the pier at sunrise, the way the light hits the lake from the cocktail deck at golden hour. If you've stayed with us before, you know exactly what we mean.

As a past guest, we'd like to offer you 10% off any direct booking at Elevation Estate or Turquoise Tavern — just our way of saying we'd love to have you back.

Book before May 1st to lock in your discount → staygdptahoe.com

Use code STAYCATION10 at checkout, or simply reply to this email and we'll apply it manually.

Summer weekends are booking fast — if you have dates in mind, now's the time.

Talk soon,
Grace & Andrew
GDP Tahoe
gdpgroup20@gmail.com | 603-359-9227`;

function DraftEmailEditor({ campaign, authToken, onSaved }: { campaign: CampaignData; authToken: string; onSaved: () => void }) {
  const [subject, setSubject] = useState(campaign.subject);
  const [body, setBody] = useState(campaign.body || STAYCATION_DRAFT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: campaign.id, subject, body }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Email Draft</span>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-600">Saved ✓</span>}
            <Button size="sm" className="bg-[#0f1d3d] hover:bg-[#1a2d5c]" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Subject Line</Label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#0f1d3d]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Email Body</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#0f1d3d] resize-y"
          />
          <p className="text-xs text-muted-foreground">Plain text — use [First Name] for personalization. When you send, we&apos;ll embed tracking links automatically.</p>
        </div>
      </CardContent>
    </Card>
  );
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

        {/* Draft email editor */}
        {detail.status === "draft" && (
          <DraftEmailEditor campaign={detail} authToken={authToken} onSaved={() => fetchDetail(detail.id)} />
        )}

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
    // Scroll to form
    setTimeout(() => {
      document.getElementById("maintenance-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
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
        <Card id="maintenance-form">
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
  source: "Direct" | "Airbnb" | "VRBO";
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

  // Build events from bookings + iCal blocked dates (with source)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCalLoading(true);
      try {
        // Fetch iCal blocked dates with source for both properties
        const [elevRes, turqRes] = await Promise.all([
          fetch("/api/availability?property=elevation-estate"),
          fetch("/api/availability?property=turquoise"),
        ]);
        const elevData = elevRes.ok ? await elevRes.json() : { blockedDatesWithSource: [] };
        const turqData = turqRes.ok ? await turqRes.json() : { blockedDatesWithSource: [] };

        if (cancelled) return;

        // Build source-tagged blocked date maps: date -> source
        const elevBlocked = new Map<string, "airbnb" | "vrbo" | "direct">();
        for (const entry of (elevData.blockedDatesWithSource ?? [])) {
          if (!elevBlocked.has(entry.date)) elevBlocked.set(entry.date, entry.source);
        }
        const turqBlocked = new Map<string, "airbnb" | "vrbo" | "direct">();
        for (const entry of (turqData.blockedDatesWithSource ?? [])) {
          if (!turqBlocked.has(entry.date)) turqBlocked.set(entry.date, entry.source);
        }

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

        // Remove booking dates from blocked maps (avoid duplicates)
        for (const ev of bookingEvents) {
          const start = new Date(ev.checkIn);
          const end = new Date(ev.checkOut);
          const blocked = ev.property === "elevation" ? elevBlocked : turqBlocked;
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            blocked.delete(toDateStr(d));
          }
        }

        // Convert remaining blocked dates to contiguous events grouped by source
        const blockedToEvents = (
          blocked: Map<string, "airbnb" | "vrbo" | "direct">,
          property: "elevation" | "turquoise"
        ): CalendarEvent[] => {
          const sorted = Array.from(blocked.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          if (sorted.length === 0) return [];
          const result: CalendarEvent[] = [];
          let start = sorted[0][0];
          let prev = sorted[0][0];
          let currentSource = sorted[0][1];
          for (let i = 1; i <= sorted.length; i++) {
            const curr = sorted[i];
            const prevDate = new Date(prev);
            const nextDay = new Date(prevDate);
            nextDay.setDate(nextDay.getDate() + 1);
            // Continue range if next day is contiguous AND same source
            if (i < sorted.length && curr[0] === toDateStr(nextDay) && curr[1] === currentSource) {
              prev = curr[0];
            } else {
              const endDate = new Date(prev);
              endDate.setDate(endDate.getDate() + 1);
              const sourceLabel = currentSource === "airbnb" ? "Airbnb" : currentSource === "vrbo" ? "VRBO" : "Direct";
              result.push({
                id: `blocked-${property}-${currentSource}-${start}`,
                property,
                guestName: sourceLabel,
                source: sourceLabel as "Airbnb" | "VRBO" | "Direct",
                checkIn: start,
                checkOut: toDateStr(endDate),
              });
              if (i < sorted.length) {
                start = curr[0];
                prev = curr[0];
                currentSource = curr[1];
              }
            }
          }
          return result;
        };

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
    <div className="space-y-4 pt-[60px] scroll-mt-[60px]">
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
                              "text-[10px] leading-tight px-1 py-0.5 truncate",
                              // Direct bookings: solid colors
                              ev.source === "Direct" && ev.property === "elevation" && "bg-[#0f1d3d] text-white",
                              ev.source === "Direct" && ev.property === "turquoise" && "bg-[#0ea5e9] text-white",
                              // Airbnb: warm orange tints
                              ev.source === "Airbnb" && ev.property === "elevation" && "bg-amber-400 text-amber-900",
                              ev.source === "Airbnb" && ev.property === "turquoise" && "bg-amber-300 text-amber-900",
                              // VRBO: property-tinted
                              ev.source === "VRBO" && ev.property === "elevation" && "bg-[#0f1d3d]/50 text-[#0f1d3d]",
                              ev.source === "VRBO" && ev.property === "turquoise" && "bg-[#0ea5e9]/50 text-[#0369a1]",
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
                                "text-xs px-2 py-1 rounded truncate",
                                ev.source === "Direct" && ev.property === "elevation" && "bg-[#0f1d3d] text-white",
                                ev.source === "Direct" && ev.property === "turquoise" && "bg-[#0ea5e9] text-white",
                                ev.source === "Airbnb" && ev.property === "elevation" && "bg-amber-400 text-amber-900",
                                ev.source === "Airbnb" && ev.property === "turquoise" && "bg-amber-300 text-amber-900",
                                ev.source === "VRBO" && ev.property === "elevation" && "bg-[#0f1d3d]/50 text-[#0f1d3d]",
                                ev.source === "VRBO" && ev.property === "turquoise" && "bg-[#0ea5e9]/50 text-[#0369a1]"
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
              Elevation (Direct)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0ea5e9]" />
              Turquoise (Direct)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-400" />
              Elevation (Airbnb)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-300" />
              Turquoise (Airbnb)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0f1d3d]/50" />
              Elevation (VRBO)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[#0ea5e9]/50" />
              Turquoise (VRBO)
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
  isPublic: boolean;
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
    const res = await fetch("/api/admin/contacts", {
      method: "DELETE", headers,
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      applyResult(await res.json());
      setCatDeleteWarning(null);
    } else {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (err.error === "Cannot delete category with vendors") {
        setCatDeleteWarning(id);
      } else {
        alert(`Delete category failed: ${err.error || res.status}`);
      }
    }
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    // Optimistic update immediately
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isPublic } : c));
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, isPublic: isPublic }),
      });
      if (res.ok) {
        const data = await res.json();
        // Re-map isPublic from server response, handling both boolean and integer
        const remapped = {
          ...data,
          categories: data.categories?.map((c: Record<string, unknown>) => ({
            ...c,
            isPublic: c.isPublic === true || c.isPublic === 1 || c.isPublic === "1",
          })) ?? data.categories,
        };
        applyResult(remapped);
      } else {
        // Revert on failure
        setCategories(prev => prev.map(c => c.id === id ? { ...c, isPublic: !isPublic } : c));
      }
    } catch {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, isPublic: !isPublic } : c));
    }
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
    if (res.ok) {
      applyResult(await res.json());
    } else {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      alert(`Delete vendor failed: ${err.error || res.status}`);
    }
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
    if (res.ok) {
      applyResult(await res.json());
    } else {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      alert(`Delete contact failed: ${err.error || res.status}`);
    }
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
      {/* Category Quick-Nav — dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground whitespace-nowrap">Jump to:</label>
        <select
          className="h-8 rounded-md border border-input bg-background px-3 text-sm text-[#0f1d3d] focus:outline-none focus:ring-1 focus:ring-[#0f1d3d]"
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            document.getElementById(`cat-${e.target.value}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            e.target.value = "";
          }}
        >
          <option value="">Select category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.isPublic ? "🌐 " : ""}{cat.name}
            </option>
          ))}
        </select>
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
                  type="button"
                  className="text-muted-foreground hover:text-red-600 p-1"
                  onClick={(e) => { e.stopPropagation(); deleteCat(cat.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                {catDeleteWarning === cat.id && (
                  <span className="text-xs text-red-600">Remove all vendors first</span>
                )}
                <button
                  onClick={() => togglePublic(cat.id, !cat.isPublic)}
                  className="ml-3 flex items-center gap-1.5 group"
                  title={cat.isPublic ? "Visible to guests" : "Internal only"}
                >
                  <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${cat.isPublic ? "bg-[#0f1d3d]" : "bg-gray-300"}`}>
                    <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${cat.isPublic ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">Public</span>
                </button>
                {cat.isPublic && <span className="text-[10px] text-emerald-600 ml-1">🌐 Visible to guests</span>}
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
                          {vendor.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{vendor.notes}</p>}
                        </div>
                        <button type="button" className="text-muted-foreground hover:text-red-600 shrink-0 p-1" onClick={(e) => { e.stopPropagation(); removeVendor(vendor.id); }}>
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
                            <button type="button" className="text-muted-foreground hover:text-red-600 ml-2 shrink-0 p-1" onClick={(e) => { e.stopPropagation(); removeContact(contact.id); }}>
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

// ─── Expenses Tab ───────────────────────────────────────────────────────────

interface ExpenseRow {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  property: string;
  notes: string;
  subject: string;
  gmailId: string;
  createdAt: string;
}

const EXPENSE_PROPERTY_OPTIONS = ["", "Elevation Estate", "Turquoise Tavern"];

function ExpensesTab({ authToken }: { authToken: string }) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [sharedCategories, setSharedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ExpenseRow>>({});
  const [page, setPage] = useState(0);
  const [yearFilter, setYearFilter] = useState<string>("All Time");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [propertyFilter, setPropertyFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 50;
  const headers = { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" };

  const fetchExpenses = useCallback(async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        fetch("/api/admin/expenses", { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch("/api/admin/contacts", { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data.expenses ?? []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        const names = (data.categories ?? []).map((c: { name: string }) => c.name).sort();
        setSharedCategories(names);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addCategoryToShared = async (name: string) => {
    const res = await fetch("/api/admin/contacts", {
      method: "POST", headers,
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setSharedCategories(prev => [...prev, name].sort());
    }
  };

  // Derived data
  const years = Array.from(new Set(expenses.map((e) => e.date.substring(0, 4)))).sort().reverse();
  // Merge shared categories with any expense-only categories for the filter dropdown
  const categories = Array.from(new Set([...sharedCategories, ...expenses.map((e) => e.category)])).sort();

  const filtered = expenses.filter((e) => {
    if (yearFilter !== "All Time" && !e.date.startsWith(yearFilter)) return false;
    if (categoryFilter !== "All" && e.category !== categoryFilter) return false;
    if (propertyFilter !== "All" && e.property !== propertyFilter) return false;
    if (search && !e.vendor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSpend = filtered.reduce((s, e) => s + e.amount, 0);
  const txCount = filtered.length;
  const largest = filtered.length > 0 ? Math.max(...filtered.map((e) => e.amount)) : 0;

  // Bar chart data — spend by category for selected year
  const spendByCategory: Record<string, number> = {};
  for (const e of filtered) {
    spendByCategory[e.category] = (spendByCategory[e.category] || 0) + e.amount;
  }
  const chartEntries = Object.entries(spendByCategory).sort((a, b) => b[1] - a[1]);
  const maxSpend = chartEntries.length > 0 ? chartEntries[0][1] : 1;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Inline edit handlers
  const startEdit = (e: ExpenseRow) => {
    setEditingId(e.id);
    setEditDraft({ category: e.category, property: e.property, notes: e.notes });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };



  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchExpenses();
    } catch {
      // silently fail
    }
  };

  // CSV export
  const exportCSV = () => {
    const headers = ["Date", "Vendor", "Amount", "Category", "Property", "Notes", "Subject", "Gmail ID"];
    const rows = filtered.map((e) => [
      e.date,
      `"${e.vendor.replace(/"/g, '""')}"`,
      e.amount.toString(),
      e.category,
      e.property,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
      `"${(e.subject || "").replace(/"/g, '""')}"`,
      e.gmailId,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gdp-tahoe-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0f1d3d]">Expense Analytics</h2>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option>All Time</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-bold text-[#0f1d3d] truncate">${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold text-[#0f1d3d]">{txCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Largest Expense</p>
              <p className="text-lg font-bold text-[#0f1d3d] truncate">${largest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bar chart */}
        {chartEntries.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Spend by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chartEntries.map(([cat, amount], i) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="w-24 sm:w-36 truncate text-xs sm:text-sm font-medium shrink-0">{cat}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="h-5 rounded"
                      style={{
                        width: `${Math.max(2, (amount / maxSpend) * 100)}%`,
                        backgroundColor: "#0f1d3d",
                        opacity: 1 - i * 0.08,
                      }}
                    />
                  </div>
                  <span className="w-20 sm:w-28 text-right text-xs sm:text-sm font-medium tabular-nums shrink-0">
                    ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={yearFilter}
          onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        >
          <option>All Time</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={propertyFilter}
          onChange={(e) => { setPropertyFilter(e.target.value); setPage(0); }}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="All">All Properties</option>
          <option value="Elevation Estate">Elevation Estate</option>
          <option value="Turquoise Tavern">Turquoise Tavern</option>
          <option value="">No Property</option>
        </select>
        <Input
          placeholder="Search vendor..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-48"
        />
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No expenses found.
                </td>
              </tr>
            )}
            {paginated.map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50/50">
                <td className="whitespace-nowrap px-4 py-2">{e.date}</td>
                <td className="px-4 py-2 font-medium">{e.vendor}</td>
                <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">
                  ${e.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                {editingId === e.id ? (
                  <>
                    <td className="px-4 py-2">
                      {editDraft.category === "__new__" ? (
                        <div className="flex gap-1">
                          <Input
                            autoFocus
                            placeholder="New category name..."
                            className="h-8 text-sm"
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter" && ev.currentTarget.value.trim()) {
                                const val = ev.currentTarget.value.trim();
                                addCategoryToShared(val);
                                setEditDraft((d) => ({ ...d, category: val }));
                              }
                              if (ev.key === "Escape") {
                                setEditDraft((d) => ({ ...d, category: e.category }));
                              }
                            }}
                            onBlur={(ev) => {
                              const val = ev.target.value.trim();
                              if (val) {
                                addCategoryToShared(val);
                                setEditDraft((d) => ({ ...d, category: val }));
                              } else {
                                setEditDraft((d) => ({ ...d, category: e.category }));
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <select
                          value={editDraft.category ?? e.category}
                          onChange={(ev) => {
                            const val = ev.target.value;
                            if (val === "__new__") {
                              setEditDraft((d) => ({ ...d, category: "__new__" }));
                            } else {
                              const updated = { ...editDraft, category: val };
                              setEditDraft(updated);
                              // Auto-save immediately
                              fetch(`/api/admin/expenses/${e.id}`, {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                                body: JSON.stringify(updated),
                              }).then(() => { setEditingId(null); setEditDraft({}); fetchExpenses(); });
                            }
                          }}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          autoFocus
                        >
                          {[...categories, "Uncategorized"].filter((v, i, a) => a.indexOf(v) === i).sort().map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__new__">＋ Add new category...</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editDraft.property ?? e.property}
                        onChange={(ev) => {
                          const updated = { ...editDraft, property: ev.target.value };
                          setEditDraft(updated);
                          fetch(`/api/admin/expenses/${e.id}`, {
                            method: "PATCH",
                            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                            body: JSON.stringify(updated),
                          }).then(() => { setEditingId(null); setEditDraft({}); fetchExpenses(); });
                        }}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        {EXPENSE_PROPERTY_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p || "(none)"}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={editDraft.notes ?? e.notes}
                        onChange={(ev) => setEditDraft((d) => ({ ...d, notes: ev.target.value }))}
                        onBlur={(ev) => {
                          const updated = { ...editDraft, notes: ev.target.value };
                          fetch(`/api/admin/expenses/${e.id}`, {
                            method: "PATCH",
                            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                            body: JSON.stringify(updated),
                          }).then(() => { setEditingId(null); setEditDraft({}); fetchExpenses(); });
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") ev.currentTarget.blur();
                          if (ev.key === "Escape") { setEditingId(null); setEditDraft({}); }
                        }}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit} title="Cancel">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => startEdit(e)} title="Click to edit">
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{e.category}</Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => startEdit(e)} title="Click to edit">{e.property || <span className="text-gray-300">—</span>}</td>
                    <td className="max-w-[200px] truncate px-4 py-2 text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => startEdit(e)} title="Click to edit">{e.notes || <span className="text-gray-300">add note</span>}</td>
                    <td className="px-4 py-2 text-right">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Journal Tab ────────────────────────────────────────────────────────────

interface BlogPostAdmin {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  readTime: number;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const BLOG_CATEGORIES = ["Local Guide", "Dining", "Activities", "Events", "Property"];

const AVAILABLE_IMAGES = [
  // Elevation gallery
  "/images/elevation/1dd91567-0181-4000-b42f-a0dcd0cf3e68.jpeg",
  "/images/elevation/44a72b09-8b5f-430a-a86c-31719c2f0af4.jpeg",
  "/images/elevation/ae06b179-6696-4fcc-8753-8bafbc2a7ddd.jpeg",
  "/images/elevation/ca9ed745-e163-4fba-816f-3a14b397214f.jpeg",
  "/images/elevation/4fe2b174-7a8f-4966-932c-892bc3e4ba68.jpeg",
  "/images/elevation/fd9d9953-faa7-40e4-bf43-0a518420f7d4.jpeg",
  // Turquoise
  ...Array.from({ length: 17 }, (_, i) => `/images/turquoise/photo_${String(i + 1).padStart(2, "0")}.png`),
];

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function JournalTab({ authToken }: { authToken: string }) {
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPostAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleNew = () => {
    const now = new Date().toISOString().split("T")[0];
    setTitleTouched(false);
    setEditing({
      slug: "",
      title: "",
      excerpt: "",
      category: "Local Guide",
      coverImage: "",
      publishedAt: now,
      readTime: 5,
      body: "",
      published: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleEdit = (post: BlogPostAdmin) => {
    setTitleTouched(true);
    setEditing({ ...post });
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    fetchPosts();
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editing),
      });
      setEditing(null);
      fetchPosts();
    } catch {
      alert("Failed to save post.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof BlogPostAdmin>(key: K, value: BlogPostAdmin[K]) => {
    if (!editing) return;
    const updated = { ...editing, [key]: value };
    // Auto-generate slug from title if not yet manually edited
    if (key === "title" && !titleTouched) {
      updated.slug = toSlug(value as string);
    }
    if (key === "slug") {
      setTitleTouched(true);
    }
    setEditing(updated);
  };

  // ── Post Editor ──
  if (editing) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All Posts
        </button>

        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Title */}
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="text-lg font-semibold"
                placeholder="Post title"
              />
              <p className="text-xs text-muted-foreground">
                Slug: <code className="bg-gray-100 px-1 rounded">{editing.slug || "auto-generated"}</code>
                {" "}
                <button
                  className="text-blue-600 underline text-xs"
                  onClick={() => {
                    const custom = prompt("Edit slug:", editing.slug);
                    if (custom !== null) {
                      updateField("slug", toSlug(custom));
                    }
                  }}
                >
                  edit
                </button>
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <Label>Excerpt</Label>
              <Textarea
                value={editing.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                rows={3}
                placeholder="Short description for the blog listing"
              />
            </div>

            {/* Category + Date + Read Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Category</Label>
                <select
                  value={editing.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Published Date</Label>
                <Input
                  type="date"
                  value={editing.publishedAt}
                  onChange={(e) => updateField("publishedAt", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Read Time (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.readTime}
                  onChange={(e) => updateField("readTime", parseInt(e.target.value) || 5)}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <Input
                value={editing.coverImage}
                onChange={(e) => updateField("coverImage", e.target.value)}
                placeholder="/images/elevation/abc.jpeg"
              />
              {editing.coverImage && (
                <div className="w-40 h-24 relative rounded overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Pick from property photos:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                {AVAILABLE_IMAGES.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => updateField("coverImage", img)}
                    className={cn(
                      "relative aspect-square rounded overflow-hidden border-2 transition-all",
                      editing.coverImage === img ? "border-blue-600 ring-2 ring-blue-300" : "border-transparent hover:border-gray-300"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3">
              <Label>Published</Label>
              <button
                type="button"
                onClick={() => updateField("published", !editing.published)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  editing.published ? "bg-green-600" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                    editing.published ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {editing.published ? "Public" : "Draft"}
              </span>
            </div>

            {/* Body */}
            <div className="space-y-1">
              <Label>HTML Body — supports full HTML</Label>
              <Textarea
                value={editing.body}
                onChange={(e) => updateField("body", e.target.value)}
                rows={18}
                className="font-mono text-xs"
                placeholder="<p>Write your post content here...</p>"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !editing.title || !editing.slug}
                className="bg-[#0f1d3d] hover:bg-[#1a2d5c]"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save Post
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              {editing.slug && (
                <a
                  href={`/blog/${editing.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline ml-auto"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Post List ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Journal Posts</h2>
        <Button onClick={handleNew} className="bg-[#0f1d3d] hover:bg-[#1a2d5c]">
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No blog posts yet. Click &ldquo;New Post&rdquo; to create one.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Published</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.slug}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(post)}
                  >
                    <td className="px-4 py-3 font-medium">{post.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{post.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(post.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        post.published
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      )}>
                        {post.published ? (
                          <><Eye className="h-3 w-3 mr-1" /> Published</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(post.slug)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Messages Tab ───────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string;
  name: string;
  trigger: "booking_confirmed" | "owner_notification" | "pre_checkin" | "post_checkout";
  subject: string;
  body: string;
  daysOffset: number;
  enabled: boolean;
  updatedAt: string;
  propertySlug: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  booking_confirmed: "On booking",
  owner_notification: "On booking",
  pre_checkin: "Before check-in",
  post_checkout: "After checkout",
};

function getTriggerBadge(tpl: EmailTemplate): string {
  if (tpl.trigger === "pre_checkin") return `${Math.abs(tpl.daysOffset)} day${Math.abs(tpl.daysOffset) !== 1 ? "s" : ""} before check-in`;
  if (tpl.trigger === "post_checkout") return `${tpl.daysOffset} day${tpl.daysOffset !== 1 ? "s" : ""} after checkout`;
  return TRIGGER_LABELS[tpl.trigger] || tpl.trigger;
}

const SAMPLE_DATA: Record<string, string> = {
  guest_name: "Sarah",
  property_name: "Elevation Estate",
  check_in: "June 15, 2026",
  check_out: "June 20, 2026",
  nights: "5",
  total: "28,280",
  booking_id: "GDP-ABC123",
  rental_agreement_url: "https://www.staygdptahoe.com/agreement/GDP-ABC123",
  recommendations_url: "https://www.staygdptahoe.com/recommendations",
};

function renderPreview(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_DATA[key] || `{{${key}}}`);
}

function MessagesTab({ authToken }: { authToken: string }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editDaysOffset, setEditDaysOffset] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>("elevation-estate");

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/email-templates", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const filteredTemplates = templates.filter((t) => t.propertySlug === selectedProperty);

  const handleExpand = (tpl: EmailTemplate) => {
    if (expandedId === tpl.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(tpl.id);
    setEditSubject(tpl.subject);
    setEditBody(tpl.body);
    setEditDaysOffset(tpl.daysOffset);
  };

  const handleToggleEnabled = async (tpl: EmailTemplate) => {
    const newEnabled = !tpl.enabled;
    setTemplates((prev) => prev.map((t) => t.id === tpl.id ? { ...t, enabled: newEnabled } : t));
    await fetch(`/api/admin/email-templates/${tpl.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newEnabled }),
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editSubject,
          body: editBody,
          daysOffset: editDaysOffset,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates((prev) => prev.map((t) => t.id === id ? data.template : t));
        setSavedId(id);
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Automated emails sent at key points in the guest journey</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedProperty("elevation-estate"); setExpandedId(null); }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              selectedProperty === "elevation-estate"
                ? "bg-[#0f1d3d] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Elevation Estate
          </button>
          <button
            onClick={() => { setSelectedProperty("turquoise"); setExpandedId(null); }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              selectedProperty === "turquoise"
                ? "bg-[#0f1d3d] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Turquoise Tavern
          </button>
        </div>
      </div>

      {filteredTemplates.map((tpl) => {
        const isExpanded = expandedId === tpl.id;
        const hasTiming = tpl.trigger === "pre_checkin" || tpl.trigger === "post_checkout";

        return (
          <Card key={tpl.id} className="overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleExpand(tpl)}
            >
              <div className="flex items-center gap-3 min-w-0">
                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className="font-medium truncate">{tpl.name}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{getTriggerBadge(tpl)}</Badge>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleEnabled(tpl); }}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  tpl.enabled ? "bg-[#0f1d3d]" : "bg-gray-200"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
                  tpl.enabled ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="border-t px-4 py-4 space-y-4">
                {/* Subject */}
                <div>
                  <Label className="text-sm font-medium">Subject line</Label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Send timing for pre/post triggers */}
                {hasTiming && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Send</span>
                    <Input
                      type="number"
                      min={1}
                      max={14}
                      value={Math.abs(editDaysOffset)}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(14, parseInt(e.target.value) || 1));
                        setEditDaysOffset(tpl.trigger === "pre_checkin" ? -val : val);
                      }}
                      className="w-16 h-8 text-center"
                    />
                    <span>day{Math.abs(editDaysOffset) !== 1 ? "s" : ""} {tpl.trigger === "pre_checkin" ? "before check-in" : "after checkout"}</span>
                  </div>
                )}

                {/* Editor + Preview side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Editor */}
                  <div>
                    <Label className="text-sm font-medium">Body</Label>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={16}
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Available variables: {"{{guest_name}}"}, {"{{property_name}}"}, {"{{check_in}}"}, {"{{check_out}}"}, {"{{nights}}"}, {"{{total}}"}, {"{{booking_id}}"}, {"{{recommendations_url}}"}, {"{{rental_agreement_url}}"}
                    </p>
                  </div>

                  {/* Preview */}
                  <div>
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="mt-1 rounded-md border bg-white p-4 text-sm min-h-[384px]">
                      <div className="border-b pb-2 mb-3 space-y-1">
                        <div className="text-xs text-muted-foreground">From: GDP Tahoe &lt;gdpgroup20@gmail.com&gt;</div>
                        <div className="text-xs text-muted-foreground">To: {SAMPLE_DATA.guest_name}</div>
                        <div className="font-medium text-sm">{renderPreview(editSubject)}</div>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {renderPreview(editBody)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => handleSave(tpl.id)}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                    Save
                  </Button>
                  {savedId === tpl.id && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

type Tab = "reservations" | "calendar" | "pricing" | "maintenance" | "expenses" | "campaigns" | "messages" | "contacts" | "journal" | "settings";

const VALID_TABS: readonly Tab[] = [
  "reservations",
  "calendar",
  "pricing",
  "maintenance",
  "expenses",
  "campaigns",
  "messages",
  "contacts",
  "journal",
  "settings",
];

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") {
    return "reservations";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");
  return VALID_TABS.includes(tab as Tab) ? (tab as Tab) : "reservations";
}

function getTabHref(tab: Tab): string {
  return `/admin?tab=${tab}`;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(() => getTabFromUrl());

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

  useEffect(() => {
    const syncTabFromUrl = () => {
      setActiveTab(getTabFromUrl());
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const setActiveTabWithUrl = useCallback((tab: Tab) => {
    setActiveTab(tab);
    window.history.pushState({}, "", getTabHref(tab));
  }, []);

  const handleTabClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, tab: Tab) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      setActiveTabWithUrl(tab);
    },
    [setActiveTabWithUrl]
  );

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
    { id: "expenses", label: "Expenses", icon: <Receipt className="h-4 w-4" /> },
    { id: "campaigns", label: "Campaigns", icon: <Send className="h-4 w-4" /> },
    { id: "messages", label: "Messages", icon: <Mail className="h-4 w-4" /> },
    { id: "contacts", label: "Contacts", icon: <Phone className="h-4 w-4" /> },
    { id: "journal", label: "Journal", icon: <BookOpen className="h-4 w-4" /> },
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

      {/* Tab Navigation — Desktop (hidden on mobile) */}
      <div className="hidden md:block border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={getTabHref(tab.id)}
                onClick={(event) => handleTabClick(event, tab.id)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-[#0f1d3d] text-[#0f1d3d]"
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Navigation — Mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={getTabHref(tab.id)}
              onClick={(event) => handleTabClick(event, tab.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] flex-1 py-2 px-1 text-[10px] font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[#0f1d3d]"
                  : "text-muted-foreground"
              )}
            >
              {tab.icon}
              <span className="mt-0.5 truncate">{tab.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-6 sm:px-6">
        {activeTab === "reservations" && (
          <ReservationsTab bookings={bookings} loading={loading} authToken={authToken} onDeleted={(id) => setBookings((prev) => prev.filter((b) => b.id !== id))} />
        )}
        {activeTab === "calendar" && (
          <CalendarTab bookings={bookings} authToken={authToken} />
        )}
        {activeTab === "pricing" && <PricingTab authToken={authToken} />}
        {activeTab === "maintenance" && <MaintenanceTab authToken={authToken} />}
        {activeTab === "expenses" && <ExpensesTab authToken={authToken} />}
        {activeTab === "campaigns" && <CampaignsTab authToken={authToken} />}
        {activeTab === "messages" && <MessagesTab authToken={authToken} />}
        {activeTab === "contacts" && <ContactsTab authToken={authToken} />}
        {activeTab === "journal" && <JournalTab authToken={authToken} />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
