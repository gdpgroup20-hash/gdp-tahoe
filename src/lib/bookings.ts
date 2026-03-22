import { promises as fs } from "fs";
import path from "path";

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

const BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");

async function ensureDataDir() {
  const dir = path.dirname(BOOKINGS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function getBookings(): Promise<Booking[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addBooking(booking: Booking): Promise<void> {
  const bookings = await getBookings();
  bookings.push(booking);
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

export async function updateBookingStatus(
  paymentIntentId: string,
  status: Booking["status"]
): Promise<Booking | null> {
  const bookings = await getBookings();
  const booking = bookings.find(
    (b) => b.stripePaymentIntentId === paymentIntentId
  );
  if (booking) {
    booking.status = status;
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    return booking;
  }
  return null;
}

export async function getBookingsByProperty(
  propertySlug: string
): Promise<Booking[]> {
  const bookings = await getBookings();
  return bookings.filter((b) => b.propertySlug === propertySlug);
}

export function generateBookingId(): string {
  return `GDP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
