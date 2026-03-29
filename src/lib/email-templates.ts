import { initDb, getDb } from "./db";

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: "booking_confirmed" | "owner_notification" | "pre_checkin" | "post_checkout";
  subject: string;
  body: string;
  daysOffset: number;
  enabled: boolean;
  updatedAt: string;
}

function mapRow(row: Record<string, unknown>): EmailTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    trigger: row.trigger as EmailTemplate["trigger"],
    subject: row.subject as string,
    body: row.body as string,
    daysOffset: Number(row.days_offset),
    enabled: Number(row.enabled) === 1,
    updatedAt: row.updated_at as string,
  };
}

export async function getTemplates(): Promise<EmailTemplate[]> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_templates ORDER BY id`;
  return rows.map(mapRow);
}

export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_templates WHERE id = ${id}`;
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function updateTemplate(
  id: string,
  data: Partial<Pick<EmailTemplate, "subject" | "body" | "daysOffset" | "enabled">>
): Promise<void> {
  await initDb();
  const sql = getDb();
  const now = new Date().toISOString();
  if (data.subject !== undefined) await sql`UPDATE email_templates SET subject = ${data.subject}, updated_at = ${now} WHERE id = ${id}`;
  if (data.body !== undefined) await sql`UPDATE email_templates SET body = ${data.body}, updated_at = ${now} WHERE id = ${id}`;
  if (data.daysOffset !== undefined) await sql`UPDATE email_templates SET days_offset = ${data.daysOffset}, updated_at = ${now} WHERE id = ${id}`;
  if (data.enabled !== undefined) await sql`UPDATE email_templates SET enabled = ${data.enabled ? 1 : 0}, updated_at = ${now} WHERE id = ${id}`;
}
