import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return authHeader.replace("Bearer ", "") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Prefer non-pooling URL for reads to avoid replica lag issues
    const url =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.STORAGE_URL;

    if (!url) {
      return NextResponse.json({ error: "No DB URL found", bookings: [], envKeys: Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATABASE') || k.includes('NEON') || k.includes('STORAGE')) }, { status: 500 });
    }

    const sql = neon(url);
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
    return NextResponse.json({ bookings, _urlPrefix: url.substring(0, 40) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg, bookings: [] }, { status: 500 });
  }
}
