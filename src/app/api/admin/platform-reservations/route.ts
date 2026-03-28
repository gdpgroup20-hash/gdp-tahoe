import { NextResponse } from "next/server";
import {
  getPlatformReservations,
  bulkInsertPlatformReservations,
} from "@/lib/platform-reservations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }
  const password = authHeader.replace("Bearer ", "");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reservations = await getPlatformReservations();
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Error fetching platform reservations:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to fetch platform reservations: ${msg}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }
  const password = authHeader.replace("Bearer ", "");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reservations } = body;
    if (!Array.isArray(reservations)) {
      return NextResponse.json({ error: "reservations must be an array" }, { status: 400 });
    }
    const inserted = await bulkInsertPlatformReservations(reservations);
    return NextResponse.json({ inserted });
  } catch (error) {
    console.error("Error inserting platform reservations:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to insert: ${msg}` }, { status: 500 });
  }
}
