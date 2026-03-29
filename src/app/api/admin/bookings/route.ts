import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return authHeader.replace("Bearer ", "") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    const bookings = rows.map((row: Record<string, unknown>) => ({
      id: String(row.id || ""),
      propertySlug: String(row.property_slug || ""),
      propertyName: String(row.property_name || ""),
      guestName: String(row.guest_name || ""),
      guestEmail: String(row.guest_email || ""),
      guestPhone: String(row.guest_phone || ""),
      checkIn: String(row.check_in || ""),
      checkOut: String(row.check_out || ""),
      guests: Number(row.guests || 0),
      specialRequests: String(row.special_requests || ""),
      totalPrice: Number(row.total_price || 0),
      stripePaymentIntentId: String(row.stripe_payment_intent_id || ""),
      status: String(row.status || "pending"),
      createdAt: String(row.created_at || ""),
    }));
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: String(error), bookings: [] }, { status: 500 });
  }
}
// Sun Mar 29 01:55:10 PDT 2026
