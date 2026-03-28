import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { name, email, phone, message, propertyName, propertySlug } = await request.json();

    if (!email || !phone || !message) {
      return NextResponse.json(
        { error: "Email, phone, and message are required" },
        { status: 400 }
      );
    }

    // Send via Gmail API using stored OAuth tokens
    const { execSync } = await import("child_process");

    const subject = `New Inquiry: ${propertyName} — ${name || "Guest"}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#0f1d3d">New Guest Inquiry — ${propertyName}</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#666;width:120px"><strong>Name</strong></td><td style="padding:8px 0">${name || "Not provided"}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Email</strong></td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Phone</strong></td><td style="padding:8px 0"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Property</strong></td><td style="padding:8px 0">${propertyName}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8f8f8;border-radius:6px">
          <strong style="color:#0f1d3d">Message:</strong>
          <p style="margin:8px 0 0">${message.replace(/\n/g, "<br>")}</p>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#999">Sent from staygdptahoe.com/properties/${propertySlug}</p>
      </div>
    `;

    // Write to temp file and use the Python send script
    const { writeFileSync, unlinkSync } = await import("fs");
    const tmpFile = `/tmp/gdp-inquiry-${Date.now()}.json`;
    writeFileSync(tmpFile, JSON.stringify({ subject, html }));

    try {
      execSync(
        `python3 -c "
import json, sys
sys.path.insert(0, '/Users/andrewvanbark/.openclaw/workspace/scripts')
with open('${tmpFile}') as f:
    data = json.load(f)

import urllib.request, urllib.parse, base64, email.mime.multipart, email.mime.text
def refresh():
    with open('/Users/andrewvanbark/.openclaw/secrets/gdp-gmail-oauth.json') as f:
        creds = json.load(f)['installed']
    with open('/Users/andrewvanbark/.openclaw/secrets/gdp-gmail-token.json') as f:
        token = json.load(f)
    d = urllib.parse.urlencode({'client_id': creds['client_id'], 'client_secret': creds['client_secret'], 'refresh_token': token['refresh_token'], 'grant_type': 'refresh_token'}).encode()
    req = urllib.request.Request(creds['token_uri'], data=d, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    with urllib.request.urlopen(req) as r:
        t = json.loads(r.read())
    token['access_token'] = t['access_token']
    with open('/Users/andrewvanbark/.openclaw/secrets/gdp-gmail-token.json', 'w') as f:
        json.dump(token, f)
    return token['access_token']

tok = refresh()
msg = email.mime.multipart.MIMEMultipart('alternative')
msg['Subject'] = data['subject']
msg['From'] = 'GDP Tahoe <gdpgroup20@gmail.com>'
msg['To'] = 'gdpgroup20@gmail.com'
msg.attach(email.mime.text.MIMEText(data['html'], 'html'))
raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
body = json.dumps({'raw': raw}).encode()
req = urllib.request.Request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', data=body, headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req) as r:
    print(r.read())
"`,
        { timeout: 15000 }
      );
    } finally {
      try { unlinkSync(tmpFile); } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry error:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
