"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, LogOut, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Auto-refresh every 30 seconds
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900">
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
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Dashboard ---
  const filtered = bookings.filter((b) => {
    if (propertyFilter !== "all" && b.propertySlug !== propertyFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  const totalBookings = filtered.length;
  const confirmedBookings = filtered.filter((b) => b.status === "confirmed").length;
  const pendingBookings = filtered.filter((b) => b.status === "pending").length;
  const totalRevenue = filtered.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight">GDP Tahoe Admin</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchBookings(authToken)}
              disabled={loading}
            >
              <RefreshCw className={cn("mr-1 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
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
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Properties</option>
            <option value="elevation-estate">Elevation Estate</option>
            <option value="turquoise">Turquoise</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Booking ID
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Property
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Guest
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Check-in
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Check-out
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Guests
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        {loading ? "Loading bookings..." : "No bookings found."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                          {booking.id.slice(0, 8)}...
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {booking.propertyName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div>{booking.guestName}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.guestEmail}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {formatDate(booking.checkIn)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {formatDate(booking.checkOut)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          {booking.guests}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                          {formatCurrency(booking.totalPrice)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(booking.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
