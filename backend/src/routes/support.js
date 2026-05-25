const express = require('express');
const { get } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { sendNotification } = require('../utils/notify');
const router = express.Router();

const CATEGORIES = [
  'Technical Issue (App not working / Bug)',
  'Course Content Question',
  'Payment Issue',
  'Certificate Problem',
  'Quiz Issue',
  'Job Board Issue',
  'Account / Profile Problem',
  'Feature Request',
  'Resume Review Query',
  'Session Booking Query',
  'Partnership / Collaboration',
  'Other',
];

// GET categories list (no auth needed to display the form)
router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// POST submit support message
router.post('/', authMiddleware, async (req, res) => {
  const { category, subject, message } = req.body;

  if (!category || !message?.trim()) {
    return res.status(400).json({ error: 'Category and message are required.' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is too short. Please describe the issue.' });
  }

  const db = req.app.locals.db;
  const user = get(db, 'SELECT name, email, phone, xp, is_premium FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const premiumBadge = user.is_premium ? '👑 Pro Member' : '🆓 Free User';

  await sendNotification(
    `📩 Support Request — ${category}`,
    `<div style="font-family:sans-serif;max-width:600px">
      <div style="background:linear-gradient(135deg,#4A90D9,#7F77DD);padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0;font-size:20px">📩 New Support Request</h2>
        <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px">${ts}</p>
      </div>

      <div style="background:#f9f9f9;padding:24px 28px;border:1px solid #e5e7eb;border-top:none">
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:8px 0;color:#6b7280;width:130px">User</td>
              <td style="padding:8px 0;font-weight:700;color:#111">${user.name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Email</td>
              <td style="padding:8px 0;color:#111"><a href="mailto:${user.email}" style="color:#4A90D9">${user.email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Phone</td>
              <td style="padding:8px 0;color:#111">${user.phone || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Account</td>
              <td style="padding:8px 0;color:#111">${premiumBadge} · ${user.xp} XP</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Category</td>
              <td style="padding:8px 0"><span style="background:#EEF2FF;color:#4F46E5;padding:3px 10px;border-radius:20px;font-weight:600;font-size:13px">${category}</span></td></tr>
          ${subject ? `<tr><td style="padding:8px 0;color:#6b7280">Subject</td>
              <td style="padding:8px 0;font-weight:600;color:#111">${subject}</td></tr>` : ''}
        </table>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px">
          <div style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Message</div>
          <p style="color:#111;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap">${message.trim()}</p>
        </div>

        <div style="margin-top:20px;padding:12px 16px;background:#FFF7ED;border:1px solid #fed7aa;border-radius:8px;font-size:13px;color:#92400e">
          💡 Reply directly to this email to respond to <strong>${user.name}</strong> at ${user.email}
        </div>
      </div>
    </div>`,
    user.email  // reply-to
  );

  res.json({ message: 'Your message has been sent! We\'ll get back to you within 24 hours.' });
});

module.exports = router;
