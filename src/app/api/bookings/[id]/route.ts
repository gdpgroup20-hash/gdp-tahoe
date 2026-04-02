import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

function verifyAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  return token === ADMIN_PASSWORD;
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
    const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
    if (!url) throw new Error("No DB URL");
    const sql = neon(url);
    const result = await sql`DELETE FROM bookings WHERE id = ${id} RETURNING id`;
    console.log(`Delete booking: id=${id}, rows deleted=${result.length}`);
    if (result.length === 0) {
      return NextResponse.json({ error: `No booking found with id: ${id}` }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete booking error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
