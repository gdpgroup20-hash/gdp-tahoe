import { getDb, initDb } from "@/lib/db";

export interface PlatformReservation {
  id: string;
  confirmationCode: string;
  source: "airbnb" | "vrbo" | "direct";
  property: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  earnings: string;
  status: string;
  bookedOn: string;
  createdAt: string;
}

export async function getPlatformReservations(): Promise<PlatformReservation[]> {
  await initDb();
  const sql = getDb();
  const rows = await sql`
    SELECT id, confirmation_code, source, property, guest_name, guest_email, guest_phone,
           check_in, check_out, nights, adults, children, earnings, status, booked_on, created_at
    FROM platform_reservations
    ORDER BY check_in DESC
  `;
  return rows.map((r) => ({
    id: r.id as string,
    confirmationCode: r.confirmation_code as string,
    source: r.source as "airbnb" | "vrbo" | "direct",
    property: r.property as string,
    guestName: r.guest_name as string,
    guestEmail: r.guest_email as string,
    guestPhone: r.guest_phone as string,
    checkIn: r.check_in as string,
    checkOut: r.check_out as string,
    nights: Number(r.nights),
    adults: Number(r.adults),
    children: Number(r.children),
    earnings: r.earnings as string,
    status: r.status as string,
    bookedOn: r.booked_on as string,
    createdAt: r.created_at as string,
  }));
}

export async function bulkInsertPlatformReservations(
  reservations: PlatformReservation[]
): Promise<number> {
  if (reservations.length === 0) return 0;
  await initDb();
  const sql = getDb();
  const before = await sql`SELECT count(*)::int AS cnt FROM platform_reservations`;
  for (const r of reservations) {
    await sql`
      INSERT INTO platform_reservations (id, confirmation_code, source, property, guest_name, guest_email, guest_phone,
        check_in, check_out, nights, adults, children, earnings, status, booked_on, created_at)
      VALUES (${r.id}, ${r.confirmationCode}, ${r.source}, ${r.property}, ${r.guestName}, ${r.guestEmail}, ${r.guestPhone},
        ${r.checkIn}, ${r.checkOut}, ${r.nights}, ${r.adults}, ${r.children}, ${r.earnings}, ${r.status}, ${r.bookedOn}, ${r.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  const after = await sql`SELECT count(*)::int AS cnt FROM platform_reservations`;
  return (after[0].cnt as number) - (before[0].cnt as number);
}
