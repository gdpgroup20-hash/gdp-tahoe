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
  const sample = await sql`SELECT id, guest_name, status, check_in FROM bookings LIMIT 5`;
  const count = await sql`SELECT COUNT(*) as c FROM bookings`;
  return NextResponse.json({ sample, count: count[0] });
}
