import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

function authenticate(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const blob = await put(`rental-agreements/${file.name}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (error) {
    console.error("Error uploading agreement:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
