import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PRICING_FILE = path.join(process.cwd(), "src", "data", "pricing.json");

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
    const data = await fs.readFile(PRICING_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading pricing:", error);
    return NextResponse.json(
      { error: "Failed to read pricing config" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await fs.writeFile(PRICING_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing pricing:", error);
    return NextResponse.json(
      { error: "Failed to save pricing config" },
      { status: 500 }
    );
  }
}
