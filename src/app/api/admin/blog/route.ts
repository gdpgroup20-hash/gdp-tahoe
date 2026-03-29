import { NextResponse } from "next/server";
import { getAllPostsDB, upsertPost } from "@/lib/blog-db";

export const dynamic = "force-dynamic";

function checkAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getAllPostsDB();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const post = await request.json();
  await upsertPost(post);
  return NextResponse.json({ ok: true });
}
