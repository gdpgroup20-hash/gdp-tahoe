import { getDb, initDb } from "@/lib/db";

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
  const sql = getDb();
  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
  return rows.map(rowToBooking);
}

export async function addBooking(booking: Booking): Promise<void> {
  await initDb();
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
  const sql = getDb();
  const rows = await sql`
    UPDATE bookings SET status = ${status}
    WHERE stripe_payment_intent_id = ${paymentIntentId}
    RETURNING *
  `;
  return rows.length > 0 ? rowToBooking(rows[0]) : null;
}

export async function getBookingsByProperty(propertySlug: string): Promise<Booking[]> {
  await initDb();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM bookings WHERE property_slug = ${propertySlug} ORDER BY created_at DESC
  `;
  return rows.map(rowToBooking);
}

export function generateBookingId(): string {
  return `GDP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
