import { NextResponse } from "next/server";
import { upsertVendor, deleteVendor, getCategories } from "@/lib/contacts";

export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const id = body.id || `vendor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await upsertVendor({
      id,
      categoryId: body.categoryId,
      companyName: body.companyName || "",
      website: body.website || "",
      notes: body.notes || "",
    });
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error upserting vendor:", error);
    return NextResponse.json({ error: "Failed to save vendor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await deleteVendor(body.id);
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
