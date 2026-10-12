import nodemailer from "nodemailer";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
  });
}

// This is intentionally best-effort: a temporary SMTP issue must not prevent
// a student from creating an account that was already saved successfully.
export async function sendRegistrationEmail({ name, email }) {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "SMTP is not configured" };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const safeName = escapeHtml(name);
  await transporter.sendMail({
    from,
    to: email,
    subject: "Welcome to Balanga Kalinga",
    text: `Hello ${name},\n\nYour Balanga Kalinga student wellness account has been created successfully. You can now sign in and use the wellness check, counseling, self-care, and safety-plan features.\n\nTake care,\nBalanga Kalinga`,
    html: `<p>Hello ${safeName},</p><p>Your <strong>Balanga Kalinga</strong> student wellness account has been created successfully.</p><p>You can now sign in and use the wellness check, counseling, self-care, and safety-plan features.</p><p>Take care,<br/>Balanga Kalinga</p>`,
  });

  return { sent: true };
}
