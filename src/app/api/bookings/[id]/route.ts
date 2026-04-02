import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

function verifyAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  return token === ADMIN_PASSWORD;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  // Return raw IDs for debugging — list all bookings for Andrew van Bark
  const bookingRows = await db`SELECT id, guest_name, check_in, 'bookings' as tbl FROM bookings ORDER BY created_at DESC LIMIT 20`;
  const platformRows = await db`SELECT id, guest_name, check_in, 'platform_reservations' as tbl FROM platform_reservations ORDER BY created_at DESC LIMIT 20`;
  return NextResponse.json({ query_id: id, bookings: bookingRows, platform_reservations: platformRows });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
    const db = getDb();
    // Try exact match first
    let result = await db`DELETE FROM bookings WHERE id = ${id} RETURNING id`;
    // Fallback: normalize 0↔O confusion (old IDs used toString(36) which mixes digits and letters;
    // monospace font wasn't used so 0 and O look identical to users)
    if (result.length === 0) {
      const normalize = (s: string) => s.toUpperCase().replace(/O/g, '0');
      const normId = normalize(id);
      // Find candidate rows whose normalized ID matches
      const candidates = await db`SELECT id FROM bookings WHERE REPLACE(UPPER(id), 'O', '0') = ${normId}`;
      if (candidates.length === 1) {
        result = await db`DELETE FROM bookings WHERE id = ${candidates[0].id} RETURNING id`;
      }
    }
    console.log(`Delete booking: id=${id}, rows deleted=${result.length}`);
    if (result.length === 0) {
      return NextResponse.json({ error: `No booking found with id: ${id}` }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete booking error:", err);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
