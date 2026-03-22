import { NextResponse } from "next/server";
import { updateTask, deleteTask, markComplete, getTasks } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.markComplete) {
      await markComplete(id, body.completedDate || new Date().toISOString().split("T")[0]);
    } else {
      await updateTask(id, body);
    }

    const tasks = await getTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error updating maintenance task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await deleteTask(id);
    const tasks = await getTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error deleting maintenance task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
