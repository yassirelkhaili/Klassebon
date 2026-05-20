import nodemailer from "nodemailer";

export type PasswordResetEmailPayload = {
  to: string;
  url: string;
  token: string;
};

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

// SMTP_HOST: Mailpit in dev (`docker compose up` → localhost:1025).
export async function sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    throw new Error("SMTP_HOST is not set");
  }

  const port = Number(process.env.SMTP_PORT ?? "1025");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "KlasseBon Dev <noreply@localhost>",
    to: payload.to,
    subject: "Passwort zurücksetzen (Development)",
    text: `Passwort zurücksetzen: ${payload.url}\n\nToken: ${payload.token}`,
    html: `<p><a href="${payload.url}">Passwort zurücksetzen</a></p><p style="color:#666;font-size:12px">Dev (Mailpit)</p>`,
  });
}
