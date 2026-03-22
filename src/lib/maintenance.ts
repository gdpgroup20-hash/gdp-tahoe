import { initDb, getDb } from "./db";

export interface MaintenanceTask {
  id: string;
  property: string;
  appliance: string;
  task: string;
  intervalDays: number;
  lastCompleted: string | null;
  nextDue: string;
  notes: string;
  createdAt: string;
}

export async function getTasks(): Promise<MaintenanceTask[]> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM maintenance_tasks ORDER BY next_due ASC`;
  return rows.map((r) => ({
    id: r.id as string,
    property: r.property as string,
    appliance: r.appliance as string,
    task: r.task as string,
    intervalDays: Number(r.interval_days),
    lastCompleted: (r.last_completed as string) || null,
    nextDue: r.next_due as string,
    notes: r.notes as string,
    createdAt: r.created_at as string,
  }));
}

export async function addTask(task: MaintenanceTask): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`
    INSERT INTO maintenance_tasks (id, property, appliance, task, interval_days, last_completed, next_due, notes, created_at)
    VALUES (${task.id}, ${task.property}, ${task.appliance}, ${task.task}, ${task.intervalDays}, ${task.lastCompleted}, ${task.nextDue}, ${task.notes}, ${task.createdAt})
  `;
}

export async function updateTask(id: string, patch: Partial<MaintenanceTask>): Promise<void> {
  await initDb();
  const sql = getDb();
  const current = await sql`SELECT * FROM maintenance_tasks WHERE id = ${id}`;
  if (current.length === 0) throw new Error("Task not found");
  const row = current[0];

  const property = patch.property ?? row.property;
  const appliance = patch.appliance ?? row.appliance;
  const task = patch.task ?? row.task;
  const intervalDays = patch.intervalDays ?? Number(row.interval_days);
  const lastCompleted = patch.lastCompleted !== undefined ? patch.lastCompleted : row.last_completed;
  const nextDue = patch.nextDue ?? row.next_due;
  const notes = patch.notes ?? row.notes;

  await sql`
    UPDATE maintenance_tasks
    SET property = ${property}, appliance = ${appliance}, task = ${task},
        interval_days = ${intervalDays}, last_completed = ${lastCompleted},
        next_due = ${nextDue}, notes = ${notes}
    WHERE id = ${id}
  `;
}

export async function deleteTask(id: string): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`DELETE FROM maintenance_tasks WHERE id = ${id}`;
}

export async function markComplete(id: string, completedDate: string): Promise<void> {
  await initDb();
  const sql = getDb();
  const current = await sql`SELECT interval_days FROM maintenance_tasks WHERE id = ${id}`;
  if (current.length === 0) throw new Error("Task not found");
  const intervalDays = Number(current[0].interval_days);
  const completed = new Date(completedDate);
  completed.setDate(completed.getDate() + intervalDays);
  const nextDue = completed.toISOString().split("T")[0];

  await sql`
    UPDATE maintenance_tasks
    SET last_completed = ${completedDate}, next_due = ${nextDue}
    WHERE id = ${id}
  `;
}
