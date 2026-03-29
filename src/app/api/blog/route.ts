import { NextResponse } from "next/server";
import { getPublishedPostsDB } from "@/lib/blog-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPublishedPostsDB();
  return NextResponse.json(posts);
}
