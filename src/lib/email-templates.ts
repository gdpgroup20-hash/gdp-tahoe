import { getDb } from "./db";

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: "booking" | "on_booking" | "booking_confirmed" | "owner_notification" | "pre_checkin" | "post_checkout";
  subject: string;
  body: string;
  daysOffset: number;
  enabled: boolean;
  updatedAt: string;
  propertySlug: string;
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
    propertySlug: (row.property_slug as string) || "both",
  };
}

export async function getTemplates(): Promise<EmailTemplate[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_templates ORDER BY property_slug, id`;
  return rows.map(mapRow);
}

export async function getTemplate(id: string): Promise<EmailTemplate | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_templates WHERE id = ${id}`;
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function getTemplatesForProperty(propertySlug: string): Promise<EmailTemplate[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_templates WHERE property_slug = ${propertySlug} ORDER BY id`;
  return rows.map(mapRow);
}

export async function findTemplateIdForProperty(
  propertySlug: string,
  triggers: EmailTemplate["trigger"][],
  fallbackIds: string[] = []
): Promise<string | null> {
  const templates = await getTemplatesForProperty(propertySlug);
  const template = templates.find((tpl) => triggers.includes(tpl.trigger));
  if (template) return template.id;

  for (const id of fallbackIds) {
    const fallback = await getTemplate(id);
    if (fallback?.propertySlug === propertySlug) return fallback.id;
  }

  return null;
}

export async function updateTemplate(
  id: string,
  data: Partial<Pick<EmailTemplate, "subject" | "body" | "daysOffset" | "enabled" | "propertySlug">>
): Promise<void> {
  const sql = getDb();
  const now = new Date().toISOString();
  if (data.subject !== undefined) await sql`UPDATE email_templates SET subject = ${data.subject}, updated_at = ${now} WHERE id = ${id}`;
  if (data.body !== undefined) await sql`UPDATE email_templates SET body = ${data.body}, updated_at = ${now} WHERE id = ${id}`;
  if (data.daysOffset !== undefined) await sql`UPDATE email_templates SET days_offset = ${data.daysOffset}, updated_at = ${now} WHERE id = ${id}`;
  if (data.enabled !== undefined) await sql`UPDATE email_templates SET enabled = ${data.enabled ? 1 : 0}, updated_at = ${now} WHERE id = ${id}`;
  if (data.propertySlug !== undefined) await sql`UPDATE email_templates SET property_slug = ${data.propertySlug}, updated_at = ${now} WHERE id = ${id}`;
}
