import { NextResponse } from "next/server";
import { updateTemplate, getTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await updateTemplate(params.id, {
      subject: body.subject,
      body: body.body,
      daysOffset: body.daysOffset,
      enabled: body.enabled,
    });
    const updated = await getTemplate(params.id);
    return NextResponse.json({ template: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
