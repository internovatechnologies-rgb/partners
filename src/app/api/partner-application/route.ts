import { NextResponse } from "next/server";

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

  // Deliver via Resend if configured, otherwise log the submission (still 200).
  // To receive submissions: set RESEND_API_KEY + PARTNER_INBOX (+ a verified
  // sender domain) — or swap this block for your own webhook/CRM.
  const apiKey = process.env.RESEND_API_KEY;
  const inbox = process.env.PARTNER_INBOX;
  const from = process.env.PARTNER_FROM ?? "Theraptly Partners <onboarding@resend.dev>";

  if (apiKey && inbox) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: inbox,
          reply_to: email,
          subject: `New partner application — ${name}`,
          text: [
            `Name: ${record.name}`,
            `Email: ${record.email}`,
            `Consultancy/Company: ${record.company || "—"}`,
            `Facilities in network: ${record.network || "—"}`,
            "",
            record.message || "(no message)",
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        console.error("[partner-application] email send failed", res.status);
      }
    } catch (err) {
      console.error("[partner-application] email error", err);
    }
  } else {
    console.log("[partner-application] new submission:", record);
  }

  return NextResponse.json({ ok: true });
}
