import { NextResponse } from "next/server";
import { getExpenses, upsertExpense } from "@/lib/expenses";

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
    const expenses = await getExpenses();
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to fetch expenses: ${msg}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await upsertExpense(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error upserting expense:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to upsert expense: ${msg}` }, { status: 500 });
  }
}
