import { NextResponse } from "next/server";
import { getPublicCategories } from "@/lib/contacts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getPublicCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
