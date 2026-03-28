import { NextResponse } from "next/server";
import { bulkInsertExpenses } from "@/lib/expenses";

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
    const { expenses } = body;
    if (!Array.isArray(expenses)) {
      return NextResponse.json({ error: "expenses must be an array" }, { status: 400 });
    }
    const inserted = await bulkInsertExpenses(expenses);
    return NextResponse.json({ inserted });
  } catch (error) {
    console.error("Error bulk inserting expenses:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to bulk insert: ${msg}` }, { status: 500 });
  }
}
