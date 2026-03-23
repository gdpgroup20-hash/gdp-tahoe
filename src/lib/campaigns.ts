import { initDb, getDb } from "./db";

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  name: string;
  email: string;
  opened: number;
  clicked: number;
  openedAt: string | null;
  clickedAt: string | null;
}

export interface CampaignWithStats extends Campaign {
  openRate: number;
  clickRate: number;
  grade: string;
  recipients: CampaignRecipient[];
}

function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: row.id as string,
    name: row.name as string,
    subject: row.subject as string,
    status: row.status as string,
    sentAt: (row.sent_at as string) || null,
    recipientCount: Number(row.recipient_count),
    createdAt: row.created_at as string,
  };
}

function mapRecipient(row: Record<string, unknown>): CampaignRecipient {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    name: row.name as string,
    email: row.email as string,
    opened: Number(row.opened),
    clicked: Number(row.clicked),
    openedAt: (row.opened_at as string) || null,
    clickedAt: (row.clicked_at as string) || null,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  await initDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_campaigns ORDER BY created_at DESC`;
  return rows.map(mapCampaign);
}

export async function getCampaignWithStats(id: string): Promise<CampaignWithStats | null> {
  await initDb();
  const sql = getDb();
  const campaigns = await sql`SELECT * FROM email_campaigns WHERE id = ${id}`;
  if (campaigns.length === 0) return null;
  const campaign = mapCampaign(campaigns[0]);
  const recipientRows = await sql`SELECT * FROM email_campaign_recipients WHERE campaign_id = ${id}`;
  const recipients = recipientRows.map(mapRecipient);
  const total = recipients.length;
  const openRate = total > 0 ? (recipients.filter((r) => r.opened).length / total) * 100 : 0;
  const clickRate = total > 0 ? (recipients.filter((r) => r.clicked).length / total) * 100 : 0;
  const grade = calculateGrade(openRate, clickRate);
  return { ...campaign, openRate, clickRate, grade, recipients };
}

export async function createCampaign(data: { name: string; subject: string }): Promise<Campaign> {
  await initDb();
  const sql = getDb();
  const id = `camp-${Date.now()}`;
  const now = new Date().toISOString().split("T")[0];
  await sql`
    INSERT INTO email_campaigns (id, name, subject, status, recipient_count, created_at)
    VALUES (${id}, ${data.name}, ${data.subject}, 'draft', 0, ${now})
  `;
  return { id, name: data.name, subject: data.subject, status: "draft", sentAt: null, recipientCount: 0, createdAt: now };
}

export async function recordSend(campaignId: string, recipients: { name: string; email: string }[]): Promise<void> {
  await initDb();
  const sql = getDb();
  const now = new Date().toISOString();
  for (const r of recipients) {
    const rid = `rcpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await sql`
      INSERT INTO email_campaign_recipients (id, campaign_id, name, email)
      VALUES (${rid}, ${campaignId}, ${r.name}, ${r.email})
    `;
  }
  await sql`
    UPDATE email_campaigns SET status = 'sent', sent_at = ${now}, recipient_count = ${recipients.length}
    WHERE id = ${campaignId}
  `;
}

export async function trackOpen(campaignId: string, recipientId: string): Promise<void> {
  await initDb();
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE email_campaign_recipients SET opened = 1, opened_at = ${now}
    WHERE id = ${recipientId} AND campaign_id = ${campaignId} AND opened = 0
  `;
}

export async function trackClick(campaignId: string, recipientId: string): Promise<void> {
  await initDb();
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE email_campaign_recipients SET clicked = 1, clicked_at = ${now}
    WHERE id = ${recipientId} AND campaign_id = ${campaignId} AND clicked = 0
  `;
}

export function calculateGrade(openRate: number, clickRate: number): string {
  const avg = (openRate + clickRate) / 2;
  if (avg >= 40) return "A";
  if (avg >= 25) return "B";
  if (avg >= 15) return "C";
  if (avg >= 5) return "D";
  return "F";
}

export function getInsight(grade: string, status: string): string {
  if (status === "draft") return "This campaign hasn't been sent yet. Add recipients and send when ready.";
  switch (grade) {
    case "A":
      return "Outstanding engagement! Your audience loved this campaign. Keep up the great work.";
    case "B":
      return "Strong performance. Your subject line and content resonated well with most recipients.";
    case "C":
      return "Decent results. Consider A/B testing subject lines to improve open rates.";
    case "D":
      return "Below average engagement. Try personalizing content and segmenting your audience.";
    case "F":
      return "Very low engagement. Review your recipient list quality and sending time.";
    default:
      return "No engagement data available yet.";
  }
}
