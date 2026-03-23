import { NextResponse } from "next/server";
import { getCampaigns, getCampaignWithStats, createCampaign } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaigns = await getCampaigns();
    // Fetch stats for each campaign
    const withStats = await Promise.all(
      campaigns.map((c) => getCampaignWithStats(c.id))
    );
    return NextResponse.json({ campaigns: withStats });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to fetch campaigns: ${msg}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, subject } = body;
    if (!name || !subject) {
      return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });
    }
    const campaign = await createCampaign({ name, subject });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to create campaign: ${msg}` }, { status: 500 });
  }
}
