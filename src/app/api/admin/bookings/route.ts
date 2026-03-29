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
    
    // First ensure all columns exist
    const alters = [
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS property_slug TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS property_name TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guests INTEGER NOT NULL DEFAULT 1`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC NOT NULL DEFAULT 0`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT ''`,
    ];
    for (const alter of alters) {
      try { await sql.unsafe(alter); } catch {}
    }

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
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg, bookings: [] }, { status: 500 });
  }
}
