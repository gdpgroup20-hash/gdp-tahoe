import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing authorization header" },
      { status: 401 }
    );
  }

  const password = authHeader.replace("Bearer ", "");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Skip getBookings() - use raw query directly
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    
    const bookings = rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      propertySlug: row.property_slug as string,
      propertyName: row.property_name as string,
      guestName: row.guest_name as string,
      guestEmail: row.guest_email as string,
      guestPhone: (row.guest_phone as string) || "",
      checkIn: row.check_in as string,
      checkOut: row.check_out as string,
      guests: Number(row.guests),
      specialRequests: (row.special_requests as string) || "",
      totalPrice: Number(row.total_price),
      stripePaymentIntentId: (row.stripe_payment_intent_id as string) || "",
      status: row.status as string,
      createdAt: row.created_at as string,
    }));
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch bookings: ${msg}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ") || authHeader.replace("Bearer ", "") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { getDb } = await import("@/lib/db");
  const sql = getDb();
  // Add missing columns
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS property_slug TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS property_name TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guests INTEGER NOT NULL DEFAULT 1`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC NOT NULL DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT NOT NULL DEFAULT ''`; } catch {}
  try { await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL DEFAULT ''`; } catch {}
  
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' ORDER BY ordinal_position`;
  return NextResponse.json({ columns: cols.map((c: Record<string,unknown>) => c.column_name) });
}
