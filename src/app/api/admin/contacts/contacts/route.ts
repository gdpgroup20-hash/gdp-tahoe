import { NextResponse } from "next/server";
import { upsertContact, deleteContact, getCategories } from "@/lib/contacts";

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
    const id = body.id || `contact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await upsertContact({
      id,
      vendorId: body.vendorId,
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      role: body.role || "",
    });
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error upserting contact:", error);
    return NextResponse.json({ error: "Failed to save contact" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await deleteContact(body.id);
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
