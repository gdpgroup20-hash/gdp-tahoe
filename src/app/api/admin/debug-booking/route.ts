import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  try {
    // Check if bookings table exists
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'bookings'
    `;
    
    if (tables.length === 0) {
      // Create it
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          property_slug TEXT NOT NULL,
          property_name TEXT NOT NULL,
          guest_name TEXT NOT NULL,
          guest_email TEXT NOT NULL,
          guest_phone TEXT NOT NULL DEFAULT '',
          check_in TEXT NOT NULL,
          check_out TEXT NOT NULL,
          guests INTEGER NOT NULL DEFAULT 1,
          special_requests TEXT NOT NULL DEFAULT '',
          total_price NUMERIC NOT NULL DEFAULT 0,
          stripe_payment_intent_id TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        )
      `;
      return NextResponse.json({ status: "created_table", tables: [] });
    }

    // Try inserting a test booking
    const testId = `debug-${Date.now()}`;
    await sql`
      INSERT INTO bookings (id, property_slug, property_name, guest_name, guest_email, 
        guest_phone, check_in, check_out, guests, special_requests, total_price, 
        stripe_payment_intent_id, status, created_at)
      VALUES (${testId}, 'turquoise', 'Turquoise Tavern', 'Debug Test', 'debug@test.com',
        '', '2026-05-01', '2026-05-03', 2, '', 2, 'pi_debug', 'pending', '2026-03-29')
    `;

    const count = await sql`SELECT COUNT(*) as c FROM bookings`;
    
    // Clean up test
    await sql`DELETE FROM bookings WHERE id = ${testId}`;

    return NextResponse.json({ 
      status: "success",
      table_exists: true,
      test_insert: "worked",
      total_bookings: count[0].c
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
