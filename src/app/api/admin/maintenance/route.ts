import { NextResponse } from "next/server";
import { getTasks, addTask } from "@/lib/maintenance";

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
    const tasks = await getTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching maintenance tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { property, appliance, task, intervalDays, notes, lastCompleted } = body;

    const now = new Date().toISOString().split("T")[0];
    const id = `mt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    let nextDue: string;
    if (lastCompleted) {
      const d = new Date(lastCompleted);
      d.setDate(d.getDate() + intervalDays);
      nextDue = d.toISOString().split("T")[0];
    } else {
      nextDue = now;
    }

    await addTask({
      id,
      property,
      appliance,
      task,
      intervalDays,
      lastCompleted: lastCompleted || null,
      nextDue,
      notes: notes || "",
      createdAt: now,
    });

    const tasks = await getTasks();
    return NextResponse.json({ tasks }, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
