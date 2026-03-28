import { NextResponse } from "next/server";
import { getCategories, createCategory, renameCategory, deleteCategory, updateCategoryVisibility } from "@/lib/contacts";

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
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const category = await createCategory(name.trim());
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, name, isPublic } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (typeof isPublic === "boolean") {
      await updateCategoryVisibility(id, isPublic);
    }
    if (name?.trim()) {
      await renameCategory(id, name.trim());
    }
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error renaming category:", error);
    return NextResponse.json({ error: "Failed to rename category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteCategory(id);
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete category";
    const status = msg === "Cannot delete category with vendors" ? 400 : 500;
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: msg }, { status });
  }
}
