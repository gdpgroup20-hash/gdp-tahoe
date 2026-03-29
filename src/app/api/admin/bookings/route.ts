import { NextResponse } from "next/server";
import { getBookings } from "@/lib/bookings";

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
    const bookings = await getBookings();
    
    // Debug: also try raw query to see if table exists
    const { getDb } = await import("@/lib/db");
    const sql = getDb();
    const tableCheck = await sql`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'bookings'
    `;
    const rawCount = await sql`SELECT COUNT(*) as total FROM bookings`;
    
    return NextResponse.json({ 
      bookings,
      _debug: {
        tableExists: Number(tableCheck[0]?.count) > 0,
        rawRowCount: Number(rawCount[0]?.total),
      }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch bookings: ${msg}` },
      { status: 500 }
    );
  }
}
