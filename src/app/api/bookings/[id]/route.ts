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
    // Fallback: strip ALL non-alphanumeric chars and compare alphanumeric-only
    // This handles font ambiguity (0/O, I/1, etc.) and any dash variations
    if (result.length === 0) {
      const alphaOnly = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const normId = alphaOnly(id);
      const candidates = await db`
        SELECT id FROM bookings
        WHERE REGEXP_REPLACE(UPPER(id), '[^A-Z0-9]', '', 'g') = ${normId}
      `;
      console.log(`Delete fallback: normId=${normId}, candidates=${JSON.stringify(candidates)}`);
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
