const nodemailer = require('nodemailer');

const NOTIFY_TO = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;

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

async function sendNotification(subject, html) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[Email] SMTP not configured — notification skipped:\n${subject}`);
    return;
  }
  try {
    await transport.sendMail({
      from: `"DataLift Alerts" <${process.env.SMTP_USER}>`,
      to: NOTIFY_TO,
      subject,
      html,
    });
    console.log(`[Email] Notification sent: ${subject}`);
  } catch (e) {
    console.error('[Email] Failed to send:', e.message);
  }
}

module.exports = { sendNotification };
