const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');

// Admin is always treated as a Pro user
const ADMIN_EMAIL = 'ak384837@gmail.com';
async function isAdminOrPro(db, userId) {
  const user = await get(db, 'SELECT email, is_premium FROM users WHERE id = ?', [userId]);
  return user?.email === ADMIN_EMAIL || user?.is_premium === 1;
}

// Grant certificates for all 100%-complete courses a user doesn't already have
async function grantPendingCertificates(db, userId) {
  const completed = await all(db,
    "SELECT course_id FROM user_course_progress WHERE user_id = ? AND progress_percent = 100",
    [userId]);
  let granted = 0;
  for (const row of completed) {
    const existing = await get(db, 'SELECT id FROM certificates WHERE user_id = ? AND course_id = ?', [userId, row.course_id]);
    if (!existing) {
      const credId = 'DQ-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      try {
        await run(db, 'INSERT INTO certificates (id, user_id, course_id, credential_id) VALUES (?, ?, ?, ?)',
          [uuidv4(), userId, row.course_id, credId]);
        await run(db, 'UPDATE users SET xp = xp + 500 WHERE id = ?', [userId]);
        granted++;
      } catch (e) {}
    }
  }
  return granted;
}
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendNotification } = require('../utils/notify');
const router = express.Router();

// Resume upload setup
const resumeDir = path.join(__dirname, '../../../uploads/resumes');
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: resumeStorage, limits: { fileSize: 5*1024*1024 }, fileFilter: (req, file, cb) => {
  if (/\.(pdf|doc|docx)$/i.test(file.originalname)) cb(null, true);
  else cb(new Error('Only PDF/DOC/DOCX allowed'));
}});

// Receipt upload setup
const receiptDir = path.join(__dirname, '../../../uploads/receipts');
if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, receiptDir),
  filename: (req, file, cb) => cb(null, `receipt_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const uploadReceipt = multer({ storage: receiptStorage, limits: { fileSize: 10*1024*1024 }, fileFilter: (req, file, cb) => {
  if (/\.(jpg|jpeg|png|pdf|webp|heic)$/i.test(file.originalname)) cb(null, true);
  else cb(new Error('Only JPG, PNG, PDF allowed'));
}});

// Get premium status
router.get('/status', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT email, is_premium, premium_expires_at FROM users WHERE id = ?', [req.user.id]);
  const sub = await get(db, 'SELECT * FROM premium_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.user.id]);
  const isAdmin = user?.email === ADMIN_EMAIL;
  res.json({
    is_premium: isAdmin ? 1 : (user?.is_premium || 0),
    premium_expires_at: isAdmin ? null : user?.premium_expires_at,
    latest_subscription: sub || null,
  });
});

// Submit payment UTR for verification
router.post('/subscribe', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const { utr_number } = req.body;
  if (!utr_number || utr_number.trim().length < 6) return res.status(400).json({ error: 'Valid UTR number required' });

  // Check if already has pending/active
  const existing = await get(db, "SELECT id, status FROM premium_subscriptions WHERE user_id = ? AND status IN ('pending','active')", [req.user.id]);
  if (existing?.status === 'active') return res.status(409).json({ error: 'Already a premium member!' });

  const id = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { receipt_filename, receipt_original } = req.body;
  await run(db, 'INSERT INTO premium_subscriptions (id, user_id, amount, utr_number, status, expires_at, receipt_filename, receipt_original) VALUES (?, ?, 199, ?, ?, ?, ?, ?)',
    [id, req.user.id, utr_number.trim(), 'pending', expiresAt, receipt_filename || null, receipt_original || null]);
  res.status(201).json({ message: 'Payment submitted! Your account will be activated within 2 hours.', status: 'pending' });
});

// Book 1:1 session (premium only)
router.post('/sessions', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  if (!await isAdminOrPro(db, req.user.id)) return res.status(403).json({ error: 'Premium membership required' });
  const { preferred_date, preferred_time, topic, notes } = req.body;
  if (!preferred_date || !preferred_time) return res.status(400).json({ error: 'Date and time required' });
  await run(db, 'INSERT INTO session_bookings (id, user_id, preferred_date, preferred_time, topic, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), req.user.id, preferred_date, preferred_time, topic || '', notes || '']);
  res.status(201).json({ message: 'Session booked! You will receive a confirmation within 24 hours.' });
});

// Get user's sessions
router.get('/sessions', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const sessions = await all(db, 'SELECT * FROM session_bookings WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json({ sessions });
});

// Submit resume for review (premium only)
router.post('/resume', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  if (!await isAdminOrPro(db, req.user.id)) return res.status(403).json({ error: 'Premium membership required' });
  const { linkedin_url, job_target, experience_years, current_role, resume_filename, resume_original } = req.body;
  await run(db, 'INSERT INTO resume_reviews (id, user_id, linkedin_url, job_target, experience_years, current_role, resume_filename, resume_original) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), req.user.id, linkedin_url || '', job_target || '', experience_years || 0, current_role || '', resume_filename || null, resume_original || null]);
  res.status(201).json({ message: 'Resume submitted for review! Feedback within 48 hours.' });
});

// Get user's resume reviews
router.get('/resume', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const reviews = await all(db, 'SELECT * FROM resume_reviews WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json({ reviews });
});

// Upload payment receipt (screenshot/bill)
router.post('/receipt/upload', authMiddleware, uploadReceipt.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, originalname: req.file.originalname, size: req.file.size });
});

// View receipt file
router.get('/receipt/file/:filename', authMiddleware, (req, res) => {
  const file = path.join(receiptDir, path.basename(req.params.filename));
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(file);
});

// Upload resume file
router.post('/resume/upload', authMiddleware, upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, originalname: req.file.originalname, size: req.file.size });
});

// Download resume file
router.get('/resume/file/:filename', authMiddleware, (req, res) => {
  const file = path.join(__dirname, '../../../uploads/resumes', path.basename(req.params.filename));
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'File not found' });
  res.download(file);
});

// ── Cashfree: Create Payment Order ──────────────────────────────────
router.post('/cashfree/create-order', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await get(db, 'SELECT id, name, email, phone FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await get(db, 'SELECT is_premium FROM users WHERE id = ?', [req.user.id]);
    if (existing?.is_premium === 1) return res.status(409).json({ error: 'Already a premium member!' });

    // Coupon validation — simple string check, never trust client-sent amount
    const coupon = String(req.body?.coupon || '').toUpperCase().trim();
    const finalAmount = (coupon === 'SAARANGI50') ? 149 : 199;
    console.log(`[create-order] user=${user.email} coupon="${coupon}" finalAmount=${finalAmount}`);

    const { Cashfree, CFEnvironment } = require('cashfree-pg');
    const cfEnv = process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
    const cfInstance = new Cashfree(cfEnv, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

    const orderId = `DQ-${req.user.id.replace(/-/g,'').slice(0,8)}-${Date.now()}`;
    const orderRequest = {
      order_id:       orderId,
      order_amount:   finalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id:    user.id.replace(/-/g, '').slice(0, 50),
        customer_email: user.email,
        customer_phone: '9999999999',
        customer_name:  user.name,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/premium?order_id=${orderId}&cf_status={order_status}`,
        notify_url: `${process.env.BACKEND_URL}/api/premium/cashfree/webhook`,
      },
      order_note: 'Datamyze Pro — Lifetime Access',
    };

    const response = await cfInstance.PGCreateOrder(orderRequest);
    const { payment_session_id } = response.data;

    // Persist pending order (utr_number column reused to store orderId for lookup)
    await run(db, `INSERT INTO premium_subscriptions (id, user_id, amount, utr_number, status, expires_at)
             VALUES (?, ?, ?, ?, 'cashfree_pending', ?)`,
      [uuidv4(), user.id, finalAmount, orderId, new Date(Date.now() + 365*24*60*60*1000).toISOString()]);

    res.json({ payment_session_id, order_id: orderId, cf_env: process.env.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox' });
  } catch (err) {
    console.error('Cashfree create-order error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Could not create payment order. Please try again.' });
  }
});

// ── Cashfree: Verify Payment (called after return-URL redirect) ──────
router.get('/cashfree/verify/:orderId', authMiddleware, async (req, res) => {
  try {
    const { Cashfree, CFEnvironment } = require('cashfree-pg');
    const cfEnv = process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
    const cfInstance = new Cashfree(cfEnv, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);
    const response = await cfInstance.PGFetchOrder(req.params.orderId);
    const orderStatus = response.data?.order_status;

    if (orderStatus === 'PAID') {
      const db = req.app.locals.db;
      const sub = await get(db, "SELECT * FROM premium_subscriptions WHERE utr_number = ?", [req.params.orderId]);
      if (sub && sub.user_id === req.user.id && sub.status !== 'active') {
        const expiresAt = new Date(Date.now() + 365*24*60*60*1000).toISOString();
        await run(db, "UPDATE premium_subscriptions SET status='active', activated_at=datetime('now'), expires_at=? WHERE utr_number=?",
          [expiresAt, req.params.orderId]);
        await run(db, 'UPDATE users SET is_premium=1, premium_expires_at=? WHERE id=?', [expiresAt, sub.user_id]);
        await grantPendingCertificates(db, sub.user_id);
        console.log(`✅ Cashfree verify: premium activated for ${sub.user_id}`);
      }
    }

    res.json({ status: orderStatus });
  } catch (err) {
    console.error('Cashfree verify error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Could not verify payment' });
  }
});

// Admin: activate premium for any user
router.post('/activate/:userId', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const admin = await get(db, "SELECT role FROM users WHERE id = ?", [req.user.id]);
  if (admin?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { userId } = req.params;
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await run(db, 'UPDATE users SET is_premium = 1, premium_expires_at = ? WHERE id = ?', [expiresAt, userId]);
  await run(db, "UPDATE premium_subscriptions SET status = 'active', activated_at = datetime('now') WHERE user_id = ? AND status = 'pending'", [userId]);
  const granted = await grantPendingCertificates(db, userId);
  res.json({ message: 'Premium activated', certificates_granted: granted });
});

// Self-activate (owner/dev setup — activates premium for the currently logged-in user)
router.post('/self-activate', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await run(db, 'UPDATE users SET is_premium = 1, premium_expires_at = ?, role = ? WHERE id = ?',
    [expiresAt, 'admin', req.user.id]);
  const granted = await grantPendingCertificates(db, req.user.id);
  res.json({ message: 'Premium + admin activated', expires: expiresAt, certificates_granted: granted });
});

// Book a mock interview (premium only)
router.post('/mock-interview', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  if (!await isAdminOrPro(db, req.user.id)) return res.status(403).json({ error: 'Premium membership required' });
  const { interview_type, difficulty, preferred_date, preferred_time, notes } = req.body;
  if (!preferred_date || !preferred_time) return res.status(400).json({ error: 'Date and time required' });
  if (!interview_type) return res.status(400).json({ error: 'Interview type required' });
  await run(db, 'INSERT INTO mock_interviews (id, user_id, interview_type, difficulty, preferred_date, preferred_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), req.user.id, interview_type, difficulty || 'Medium', preferred_date, preferred_time, notes || '']);

  // Email notification
  const booker = await get(db, 'SELECT name, email, phone FROM users WHERE id = ?', [req.user.id]);
  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  sendNotification(
    `🎙️ Mock Interview Booked — ${booker?.name}`,
    `<h2 style="color:#a78bfa">Mock Interview Booking!</h2>
     <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">
       <tr><td style="padding:6px 16px 6px 0;color:#888">Name</td><td><strong>${booker?.name}</strong></td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Contact</td><td>${booker?.phone || booker?.email}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Type</td><td>${interview_type}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Difficulty</td><td>${difficulty || 'Medium'}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Date</td><td>${preferred_date} at ${preferred_time}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Notes</td><td>${notes || 'None'}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Booked at</td><td>${ts}</td></tr>
     </table>`
  );

  res.status(201).json({ message: 'Mock interview booked! You will receive confirmation within 24 hours.' });
});

// Get user's mock interview bookings
router.get('/mock-interview', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const interviews = await all(db, 'SELECT * FROM mock_interviews WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json({ interviews });
});

// ── Cashfree: Mobile Checkout HTML (served as real HTTPS page for WebView) ──
// No auth needed — the paymentSessionId IS the credential
router.get('/cashfree/mobile-checkout', (req, res) => {
  const { sessionId, orderId, env } = req.query;
  if (!sessionId || !orderId) {
    return res.status(400).send(
      '<html><body><p style="color:#FF4757;font-family:sans-serif;padding:24px;text-align:center">Missing payment parameters. Please go back and try again.</p></body></html>'
    );
  }
  const cfMode = env === 'production' ? 'production' : 'sandbox';
  const frontendUrl = process.env.FRONTEND_URL || 'https://datamyze.in';
  const returnUrl = `${frontendUrl}/payment-complete?order_id=${encodeURIComponent(orderId)}&cf_status={order_status}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
  <title>Datamyze Pro — Checkout</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { height:100%; background:#0f1117; }
    #loading {
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; height:100vh; color:#fff;
      font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      gap:16px;
    }
    .spinner {
      width:40px; height:40px; border:3px solid #2A2A3E;
      border-top-color:#6C63FF; border-radius:50%;
      animation:spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
    .label { font-size:15px; color:#A0A0B0; }
    .amount { font-size:28px; font-weight:800; color:#fff; }
    .sub { font-size:13px; color:#A0A0B0; }
    #error { display:none; color:#FF4757; padding:24px; text-align:center; font-family:sans-serif; }
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <p class="label">Preparing secure checkout…</p>
    <p class="amount">&#8377;199</p>
    <p class="sub">Datamyze Pro — Lifetime Access</p>
  </div>
  <div id="error"></div>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <script>
    function startCheckout() {
      try {
        var cashfree = Cashfree({ mode: "${cfMode}" });
        cashfree.checkout({
          paymentSessionId: "${sessionId}",
          returnUrl: "${returnUrl}",
          redirectTarget: "_self"
        });
      } catch(err) {
        document.getElementById('loading').style.display = 'none';
        var el = document.getElementById('error');
        el.style.display = 'block';
        el.textContent = 'Failed to load payment: ' + err.message;
      }
    }
    if (typeof Cashfree !== 'undefined') {
      startCheckout();
    } else {
      window.onload = startCheckout;
    }
  </script>
</body>
</html>`);
});

// ── Cashfree: Mobile Return URL (intercepted by WebView before it loads) ──
router.get('/cashfree/mobile-return', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Processing Payment…</title>
  <style>
    body { background:#0f1117; display:flex; align-items:center; justify-content:center;
           height:100vh; margin:0; flex-direction:column; gap:16px; }
    .spinner { width:36px; height:36px; border:3px solid #2A2A3E;
               border-top-color:#6C63FF; border-radius:50%; animation:spin 0.8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    p { color:#A0A0B0; font-family:sans-serif; font-size:15px; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Confirming your payment…</p>
</body>
</html>`);
});

module.exports = router;
