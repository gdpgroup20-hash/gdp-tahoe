import { getDb, initDb } from "./db";

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  property: string;
  notes: string;
  subject: string;
  gmailId: string;
  createdAt: string;
}

function rowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    vendor: row.vendor as string,
    amount: Number(row.amount),
    date: row.date as string,
    category: row.category as string,
    property: row.property as string,
    notes: row.notes as string,
    subject: row.subject as string,
    gmailId: (row.gmail_id as string) || "",
    createdAt: row.created_at as string,
  };
}

export async function getExpenses(): Promise<Expense[]> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM expenses ORDER BY date DESC`;
  return rows.map(rowToExpense);
}

export async function upsertExpense(e: Expense): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`
    INSERT INTO expenses (id, vendor, amount, date, category, property, notes, subject, gmail_id, created_at)
    VALUES (${e.id}, ${e.vendor}, ${e.amount}, ${e.date}, ${e.category}, ${e.property}, ${e.notes}, ${e.subject}, ${e.gmailId}, ${e.createdAt})
    ON CONFLICT (id) DO UPDATE SET
      vendor = EXCLUDED.vendor,
      amount = EXCLUDED.amount,
      date = EXCLUDED.date,
      category = EXCLUDED.category,
      property = EXCLUDED.property,
      notes = EXCLUDED.notes,
      subject = EXCLUDED.subject,
      gmail_id = EXCLUDED.gmail_id
  `;
}

export async function deleteExpense(id: string): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`DELETE FROM expenses WHERE id = ${id}`;
}

export async function bulkInsertExpenses(expenses: Expense[]): Promise<number> {
  await initDb();
  const sql = getDb();
  const before = await sql`SELECT count(*)::int AS cnt FROM expenses`;
  for (const e of expenses) {
    await sql`
      INSERT INTO expenses (id, vendor, amount, date, category, property, notes, subject, gmail_id, created_at)
      VALUES (${e.id}, ${e.vendor}, ${e.amount}, ${e.date}, ${e.category}, ${e.property}, ${e.notes}, ${e.subject}, ${e.gmailId}, ${e.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  const after = await sql`SELECT count(*)::int AS cnt FROM expenses`;
  return (after[0].cnt as number) - (before[0].cnt as number);
}
