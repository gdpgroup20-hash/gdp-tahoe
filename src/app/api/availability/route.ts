import { NextResponse } from "next/server";
import { getBlockedDates } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const property = searchParams.get("property");

  if (!property) {
    return NextResponse.json(
      { error: "Missing required query parameter: property" },
      { status: 400 }
    );
  }

  try {
    const blockedDatesWithSource = await getBlockedDates(property);
    // Return both formats: string[] for backward compat, and full objects for calendar
    const blockedDates = blockedDatesWithSource.map((d) => d.date);
    return NextResponse.json({ blockedDates, blockedDatesWithSource });
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
