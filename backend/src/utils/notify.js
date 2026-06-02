const nodemailer = require('nodemailer');

const NOTIFY_TO = [
  process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
  'asifkhan040102@gmail.com',
].filter(Boolean).join(',');

function getTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

async function sendNotification(subject, html, replyTo = null) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[Email] SMTP not configured — notification skipped:\n${subject}`);
    return;
  }
  try {
    const mailOptions = {
      from: `"Datamyze Alerts" <${process.env.SMTP_USER}>`,
      to: NOTIFY_TO,
      subject,
      html,
    };
    if (replyTo) mailOptions.replyTo = replyTo;
    await transport.sendMail(mailOptions);
    console.log(`[Email] Notification sent: ${subject}`);
  } catch (e) {
    console.error('[Email] Failed to send:', e.message);
  }
}

// Send email to any recipient (used for OTPs, user-facing emails)
async function sendEmail(to, subject, html) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[Email] SMTP not configured — email to ${to} skipped:\n${subject}`);
    return;
  }
  try {
    await transport.sendMail({
      from: `"Datamyze" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (e) {
    console.error(`[Email] Failed to send to ${to}:`, e.message);
  }
}

module.exports = { sendNotification, sendEmail };
