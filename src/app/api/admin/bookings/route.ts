import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  return authHeader.replace("Bearer ", "") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    
    // Select only columns we know exist (from debug - some columns were missing)
    const rows = await sql`
      SELECT 
        id,
        COALESCE(property_slug, '') as property_slug,
        COALESCE(property_name, '') as property_name,
        COALESCE(guest_name, '') as guest_name,
        COALESCE(guest_email, '') as guest_email,
        COALESCE(guest_phone, '') as guest_phone,
        COALESCE(check_in, '') as check_in,
        COALESCE(check_out, '') as check_out,
        COALESCE(guests, 1) as guests,
        COALESCE(special_requests, '') as special_requests,
        COALESCE(total_price, 0) as total_price,
        COALESCE(stripe_payment_intent_id, '') as stripe_payment_intent_id,
        COALESCE(status, 'pending') as status,
        COALESCE(created_at, '') as created_at
      FROM bookings 
      ORDER BY created_at DESC
    `;
    
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
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Bookings GET error:", msg);
    return NextResponse.json({ error: msg, bookings: [] }, { status: 500 });
  }
}
