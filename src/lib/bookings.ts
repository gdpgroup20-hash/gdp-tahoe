import { getDb } from "@/lib/db";

// Lightweight init — only creates the bookings table, no heavy seeding
async function ensureBookingsTable() {
  const sql = getDb();
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
}

export interface Booking {
  id: string;
  propertySlug: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  totalPrice: number;
  stripePaymentIntentId: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    propertySlug: row.property_slug as string,
    propertyName: row.property_name as string,
    guestName: row.guest_name as string,
    guestEmail: row.guest_email as string,
    guestPhone: row.guest_phone as string,
    checkIn: row.check_in as string,
    checkOut: row.check_out as string,
    guests: Number(row.guests),
    specialRequests: row.special_requests as string,
    totalPrice: Number(row.total_price),
    stripePaymentIntentId: row.stripe_payment_intent_id as string,
    status: row.status as Booking["status"],
    createdAt: row.created_at as string,
  };
}

export async function getBookings(): Promise<Booking[]> {
  await ensureBookingsTable();
  const sql = getDb();
  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
  return rows.map(rowToBooking);
}

export async function addBooking(booking: Booking): Promise<void> {
  await ensureBookingsTable();
  const sql = getDb();
  await sql`
    INSERT INTO bookings (
      id, property_slug, property_name, guest_name, guest_email, guest_phone,
      check_in, check_out, guests, special_requests, total_price,
      stripe_payment_intent_id, status, created_at
    ) VALUES (
      ${booking.id}, ${booking.propertySlug}, ${booking.propertyName},
      ${booking.guestName}, ${booking.guestEmail}, ${booking.guestPhone},
      ${booking.checkIn}, ${booking.checkOut}, ${booking.guests},
      ${booking.specialRequests}, ${booking.totalPrice},
      ${booking.stripePaymentIntentId}, ${booking.status}, ${booking.createdAt}
    )
  `;
}

export async function updateBookingStatus(
  paymentIntentId: string,
  status: Booking["status"]
): Promise<Booking | null> {
  await ensureBookingsTable();
  const sql = getDb();
  const rows = await sql`
    UPDATE bookings SET status = ${status}
    WHERE stripe_payment_intent_id = ${paymentIntentId}
    RETURNING *
  `;
  return rows.length > 0 ? rowToBooking(rows[0]) : null;
}

export async function getBookingsByProperty(propertySlug: string): Promise<Booking[]> {
  await ensureBookingsTable();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM bookings WHERE property_slug = ${propertySlug} ORDER BY created_at DESC
  `;
  return rows.map(rowToBooking);
}

export function generateBookingId(): string {
  return `GDP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
