import { NextResponse } from "next/server";
import { getTemplates } from "@/lib/email-templates";

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
    const templates = await getTemplates();
    // Group by property
    const grouped: Record<string, typeof templates> = {};
    for (const tpl of templates) {
      const key = tpl.propertySlug;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(tpl);
    }
    return NextResponse.json({ templates, grouped });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
