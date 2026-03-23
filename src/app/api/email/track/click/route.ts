import { NextResponse } from "next/server";
import { trackClick } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get("cid");
  const rid = searchParams.get("rid");
  const url = searchParams.get("url");

  if (cid && rid) {
    try {
      await trackClick(cid, rid);
    } catch {
      // silently fail
    }
  }

  if (url) {
    return NextResponse.redirect(url);
  }

  return new NextResponse("Missing url parameter", { status: 400 });
}
