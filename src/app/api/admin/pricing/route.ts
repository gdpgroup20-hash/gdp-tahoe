import { NextResponse } from "next/server";
import { getPricingConfig, updatePricing, PropertyPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function authenticate(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const config = await getPricingConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading pricing:", error);
    return NextResponse.json({ error: "Failed to read pricing config" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json() as Record<string, PropertyPricing>;
    for (const [slug, pricing] of Object.entries(body)) {
      await updatePricing(slug, pricing);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving pricing:", error);
    return NextResponse.json({ error: "Failed to save pricing config" }, { status: 500 });
  }
}
