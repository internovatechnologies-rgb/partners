import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// nodemailer needs Node's net/tls — force the Node.js runtime (also the default).
export const runtime = "nodejs";

type Payload = {
  name?: string;
  company?: string;
  email?: string;
  network?: string;
  message?: string;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const name = body.name?.trim();
  const email = body.email?.trim();

  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid name and email." },
      { status: 400 },
    );
  }

  const record = {
    name,
    email,
    company: body.company?.trim() ?? "",
    network: body.network?.trim() ?? "",
    message: body.message?.trim() ?? "",
    receivedAt: new Date().toISOString(),
  };

  // Deliver via Zoho Mail (SMTP). To receive submissions set:
  //   ZOHO_SMTP_USER  — your Zoho mailbox, e.g. partners@yourdomain.com
  //   ZOHO_SMTP_PASS  — an app-specific password (accounts.zoho.com → Security → App Passwords)
  //   PARTNER_INBOX   — where applications land (defaults to ZOHO_SMTP_USER)
  //   PARTNER_FROM    — optional From line (defaults to "Theraptly Partners <ZOHO_SMTP_USER>")
  //   ZOHO_SMTP_HOST / ZOHO_SMTP_PORT — optional overrides (default smtp.zoho.com : 465)
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;

  // Not yet configured (e.g. before credentials are added): keep the site working
  // by logging the submission and reporting success, so nothing is lost.
  if (!user || !pass) {
    console.warn(
      "[partner-application] ZOHO_SMTP_USER/ZOHO_SMTP_PASS not set — logging submission instead of emailing:",
      record,
    );
    return NextResponse.json({ ok: true });
  }

  const host = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.com";
  const port = Number(process.env.ZOHO_SMTP_PORT ?? 465);
  const from = process.env.PARTNER_FROM ?? `Theraptly Partners <${user}>`;
  const inbox = process.env.PARTNER_INBOX ?? user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 uses STARTTLS
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to: inbox,
      replyTo: `${record.name} <${record.email}>`,
      subject: `New partner application — ${record.name}`,
      text: [
        `Name: ${record.name}`,
        `Email: ${record.email}`,
        `Consultancy/Company: ${record.company || "—"}`,
        `Facilities in network: ${record.network || "—"}`,
        `Received: ${record.receivedAt}`,
        "",
        record.message || "(no message)",
      ].join("\n"),
    });
  } catch (err) {
    // Configured but delivery failed — surface an error so the applicant can retry
    // (the form shows its "please try again" message) rather than silently dropping it.
    console.error("[partner-application] Zoho SMTP send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not send your application. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
