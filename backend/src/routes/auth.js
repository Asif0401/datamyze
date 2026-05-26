const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const https   = require('https');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware   = require('../middleware/auth');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { sendNotification } = require('../utils/notify');

const router = express.Router();

/* ── Avatar upload ─────────────────────────────────── */
const avatarDir = path.join(__dirname, '../../../uploads/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) =>
    cb(null, `avatar_${req.user.id}${path.extname(file.originalname).toLowerCase()}`),
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only image files (JPG, PNG, WEBP) are allowed'));
  },
});

/* ── Helpers ────────────────────────────────────────── */
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── 2Factor.in OTP sender ──────────────────────────── */
function sendSmsOtp(phone, code) {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  if (!apiKey) {
    console.log(`[SMS] TWOFACTOR_API_KEY not set — OTP for ${phone}: ${code}`);
    return Promise.resolve({ sent: false });
  }

  // Normalise to 10-digit Indian number
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0'))  digits = digits.slice(1);

  console.log(`[SMS] Sending OTP ${code} to ${digits} via 2Factor.in`);

  // 2Factor API: GET /API/V1/{APIKEY}/SMS/{PHONE}/{OTP}
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${digits}/${code}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.Status === 'Success') {
            console.log(`[SMS] OTP sent to ${digits} via 2Factor.in ✓`);
            resolve({ sent: true });
          } else {
            console.error('[SMS] 2Factor error:', body);
            resolve({ sent: false, error: body });
          }
        } catch (e) {
          console.error('[SMS] Parse error:', body);
          resolve({ sent: false, error: body });
        }
      });
    }).on('error', (err) => {
      console.error('[SMS] Request failed:', err.message);
      resolve({ sent: false, error: err.message });
    });
  });
}

function sendWhatsApp(message) {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!apiKey) {
    console.log('[WhatsApp] CALLMEBOT_APIKEY not set — message not sent:', message);
    return;
  }
  const phone   = '919177133236';
  const encoded = encodeURIComponent(message);
  const url     = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;
  https.get(url, (res) => {
    console.log(`[WhatsApp] Notification sent (HTTP ${res.statusCode})`);
  }).on('error', (err) => {
    console.error('[WhatsApp] Failed to send notification:', err.message);
  });
}

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const SAFE_USER_FIELDS = `
  id, name, email, xp, streak, role, last_active, created_at,
  is_premium, premium_expires_at,
  phone, bio, location, website, avatar_color, avatar_url,
  job_title, company, linkedin_url, github_url,
  experience_years, skills, education, target_role, profile_completed
`;

/* ══════════════════════════════════════════════════
   SEND OTP  –  POST /auth/send-otp
   body: { identifier, type: 'email'|'phone', purpose: 'signup'|'login' }
══════════════════════════════════════════════════ */
router.post('/send-otp', async (req, res) => {
  const db = req.app.locals.db;
  const { identifier, type = 'email', purpose = 'signup' } = req.body;

  if (!identifier) return res.status(400).json({ error: 'Email or phone number required' });

  const clean = identifier.trim().toLowerCase();

  // For signup: check not already registered
  if (purpose === 'signup') {
    const field  = type === 'phone' ? 'phone' : 'email';
    const exists = await get(db, `SELECT id FROM users WHERE ${field} = ?`, [clean]);
    if (exists) {
      return res.status(409).json({
        error: type === 'phone' ? 'Phone number already registered' : 'Email already registered',
      });
    }
  }

  // For phone login: check user exists
  if (purpose === 'login' && type === 'phone') {
    const exists = await get(db, 'SELECT id FROM users WHERE phone = ?', [clean]);
    if (!exists) return res.status(404).json({ error: 'No account found with this phone number' });
  }

  // Delete any previous OTPs for this identifier + purpose
  await run(db, 'DELETE FROM otps WHERE identifier = ? AND purpose = ?', [clean, purpose]);

  const code      = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
  await run(db, 'INSERT INTO otps (id, identifier, code, type, purpose, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), clean, code, type, purpose, expiresAt]);

  console.log(`\n🔑 OTP for ${clean} [${purpose}]: ${code}  (expires in 10 min)\n`);

  if (type === 'phone') {
    // Send real SMS via Fast2SMS
    const result = await sendSmsOtp(clean, code);
    const smsSent = result.sent;

    // Only expose dev_otp in the response when SMS wasn't actually delivered
    // (i.e. no API key set yet)
    return res.json({
      message: smsSent ? `OTP sent to ${clean}` : `OTP sent to your phone`,
      ...(!smsSent && { dev_otp: code }),
    });
  }

  // Email OTP — send via Gmail SMTP
  const { sendNotification } = require('../utils/notify');
  await sendNotification(
    `Your Datamyze verification code is ${code}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d1117;border-radius:16px">
       <div style="text-align:center;margin-bottom:24px">
         <div style="font-size:32px">📊</div>
         <h2 style="color:#4A90D9;margin:8px 0 4px;font-size:22px">Datamyze</h2>
         <p style="color:#888;font-size:13px;margin:0">Email Verification</p>
       </div>
       <p style="color:#ccc;font-size:15px">Hi there! Use the code below to verify your email address.</p>
       <div style="text-align:center;margin:28px 0">
         <div style="display:inline-block;background:#1a1f2e;border:1.5px solid rgba(74,144,217,0.4);border-radius:14px;padding:18px 40px">
           <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#fff;font-family:monospace">${code}</div>
         </div>
       </div>
       <p style="color:#666;font-size:13px;text-align:center">This code expires in <strong style="color:#aaa">10 minutes</strong>. Do not share it with anyone.</p>
       <hr style="border:none;border-top:1px solid #222;margin:24px 0"/>
       <p style="color:#444;font-size:11px;text-align:center">If you didn't request this, you can safely ignore this email.</p>
     </div>`
  );

  res.json({ message: `Verification code sent to ${clean}` });
});

/* ══════════════════════════════════════════════════
   SIGN UP  –  POST /auth/signup
   body: { name, identifier, type, otp_code, password }
══════════════════════════════════════════════════ */
router.post('/signup', async (req, res) => {
  const db = req.app.locals.db;
  const { name, identifier, type = 'email', otp_code, password, phone: phoneRaw } = req.body;

  if (!name || !identifier || !otp_code || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (type === 'email' && (!phoneRaw || phoneRaw.replace(/\D/g,'').length < 10))
    return res.status(400).json({ error: 'A valid phone number is required' });
  if (name.trim().length < 2)
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const clean = identifier.trim().toLowerCase();

  // Validate identifier format
  if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
    return res.status(400).json({ error: 'Invalid email address' });
  if (type === 'phone' && !/^\d{10,15}$/.test(clean.replace(/[+\s-]/g, '')))
    return res.status(400).json({ error: 'Invalid phone number' });

  // Verify OTP
  const otp = await get(db,
    `SELECT * FROM otps WHERE identifier = ? AND purpose = 'signup'
     AND verified = 0 AND expires_at > datetime('now')`,
    [clean]
  );
  if (!otp)       return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
  if (otp.code !== otp_code.trim())
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });

  // Mark OTP as used
  await run(db, 'UPDATE otps SET verified = 1 WHERE id = ?', [otp.id]);

  // Check not already registered
  const field   = type === 'phone' ? 'phone' : 'email';
  const existing = await get(db, `SELECT id FROM users WHERE ${field} = ?`, [clean]);
  if (existing) return res.status(409).json({ error: `${type === 'phone' ? 'Phone' : 'Email'} already registered` });

  const passwordHash = await bcrypt.hash(password, 12);
  const id    = uuidv4();
  const today = new Date().toISOString().split('T')[0];

  if (type === 'email') {
    const cleanPhone = phoneRaw ? phoneRaw.trim() : null;
    await run(db,
      'INSERT INTO users (id, name, email, phone, password_hash, xp, streak, last_active, profile_completed) VALUES (?, ?, ?, ?, ?, 0, 1, ?, 0)',
      [id, name.trim(), clean, cleanPhone, passwordHash, today]
    );
  } else {
    // email column is NOT NULL — use a unique placeholder for phone-only signups
    const emailPlaceholder = `phone_${clean}@datamyze.in`;
    await run(db,
      'INSERT INTO users (id, name, email, phone, password_hash, xp, streak, last_active, profile_completed) VALUES (?, ?, ?, ?, ?, 0, 1, ?, 0)',
      [id, name.trim(), emailPlaceholder, clean, passwordHash, today]
    );
  }

  await run(db, 'INSERT OR IGNORE INTO daily_streaks (id, user_id, date) VALUES (?, ?, ?)', [uuidv4(), id, today]);

  // Email notification
  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  sendNotification(
    `🎉 New Datamyze Signup — ${name.trim()}`,
    `<h2 style="color:#4A90D9">New User Registered!</h2>
     <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">
       <tr><td style="padding:6px 16px 6px 0;color:#888">Name</td><td><strong>${name.trim()}</strong></td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">${type === 'email' ? 'Email' : 'Phone'}</td><td>${clean}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Time</td><td>${ts}</td></tr>
       <tr><td style="padding:6px 16px 6px 0;color:#888">Type</td><td>${type} signup</td></tr>
     </table>`
  );

  const token = issueToken({ id, email: clean, name: name.trim() });
  const user  = await get(db, `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [id]);
  res.status(201).json({ token, user });
});

/* ══════════════════════════════════════════════════
   EMAIL LOGIN  –  POST /auth/login
══════════════════════════════════════════════════ */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db   = req.app.locals.db;
  const user = await get(db, 'SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)  return res.status(401).json({ error: 'Invalid email or password' });

  const today = new Date().toISOString().split('T')[0];
  let newStreak = user.streak || 0;
  if (user.last_active) {
    const diff = Math.floor((new Date(today) - new Date(user.last_active)) / 86400000);
    if (diff === 1) newStreak++;
    else if (diff > 1) newStreak = 1;
  } else { newStreak = 1; }

  await run(db, 'UPDATE users SET last_active = ?, streak = ? WHERE id = ?', [today, newStreak, user.id]);
  await run(db, 'INSERT OR IGNORE INTO daily_streaks (id, user_id, date) VALUES (?, ?, ?)', [uuidv4(), user.id, today]);

  const token = issueToken(user);
  const safe  = await get(db, `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [user.id]);
  safe.streak = newStreak;
  res.json({ token, user: safe });
});

/* ══════════════════════════════════════════════════
   PHONE OTP LOGIN  –  POST /auth/login-phone
   Step 1: { phone } → sends OTP
   Step 2: { phone, otp_code } → logs in
══════════════════════════════════════════════════ */
router.post('/login-phone', async (req, res) => {
  const db = req.app.locals.db;
  const { phone, otp_code } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const clean = phone.trim().replace(/[+\s-]/g, '');

  // Step 1: send OTP
  if (!otp_code) {
    const user = await get(db, 'SELECT id FROM users WHERE phone = ?', [clean]);
    if (!user) return res.status(404).json({ error: 'No account found with this phone number. Please sign up first.' });

    await run(db, "DELETE FROM otps WHERE identifier = ? AND purpose = 'login'", [clean]);
    const code      = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await run(db, 'INSERT INTO otps (id, identifier, code, type, purpose, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), clean, code, 'phone', 'login', expiresAt]);

    console.log(`\n🔑 Login OTP for ${clean}: ${code}\n`);

    const result = await sendSmsOtp(clean, code);
    return res.json({
      message: 'OTP sent to your phone',
      ...(!result.sent && { dev_otp: code }),
    });
  }

  // Step 2: verify OTP and log in
  const otp = await get(db,
    `SELECT * FROM otps WHERE identifier = ? AND purpose = 'login'
     AND verified = 0 AND expires_at > datetime('now')`,
    [clean]
  );
  if (!otp)                   return res.status(400).json({ error: 'OTP expired or not found' });
  if (otp.code !== otp_code.trim()) return res.status(400).json({ error: 'Incorrect OTP' });

  await run(db, 'UPDATE otps SET verified = 1 WHERE id = ?', [otp.id]);

  const user = await get(db, 'SELECT * FROM users WHERE phone = ?', [clean]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const today = new Date().toISOString().split('T')[0];
  let newStreak = user.streak || 0;
  if (user.last_active) {
    const diff = Math.floor((new Date(today) - new Date(user.last_active)) / 86400000);
    if (diff === 1) newStreak++;
    else if (diff > 1) newStreak = 1;
  } else { newStreak = 1; }

  await run(db, 'UPDATE users SET last_active = ?, streak = ? WHERE id = ?', [today, newStreak, user.id]);
  await run(db, 'INSERT OR IGNORE INTO daily_streaks (id, user_id, date) VALUES (?, ?, ?)', [uuidv4(), user.id, today]);

  const token = issueToken(user);
  const safe  = await get(db, `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [user.id]);
  safe.streak = newStreak;
  res.json({ token, user: safe });
});

/* ══════════════════════════════════════════════════
   COMPLETE PROFILE  –  POST /auth/complete-profile
   Saves onboarding fields + marks profile_completed = 1
══════════════════════════════════════════════════ */
router.post('/complete-profile', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const { current_status, job_title, experience_years, target_role, location, phone } = req.body;

  const updates = ['profile_completed = 1'];
  const values  = [];

  if (current_status)   { updates.push('job_title = ?');         values.push(current_status); }
  if (job_title)        { updates.push('job_title = ?');         values.push(job_title); }
  if (experience_years) { updates.push('experience_years = ?');  values.push(experience_years); }
  if (target_role)      { updates.push('target_role = ?');       values.push(target_role); }
  if (location)         { updates.push('location = ?');          values.push(location); }
  if (phone) {
    // Only save phone if not already set
    const u = await get(db, 'SELECT phone FROM users WHERE id = ?', [req.user.id]);
    if (!u?.phone) { updates.push('phone = ?'); values.push(phone.trim()); }
  }

  values.push(req.user.id);
  await run(db, `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

  const user = await get(db, `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
  res.json({ user, message: 'Profile saved!' });
});

/* ══════════════════════════════════════════════════
   GET ME  –  GET /auth/me
══════════════════════════════════════════════════ */
router.get('/me', authMiddleware, async (req, res) => {
  const db   = req.app.locals.db;
  const user = await get(db, `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

/* ══════════════════════════════════════════════════
   UPDATE PROFILE  –  PATCH /auth/profile
══════════════════════════════════════════════════ */
router.patch('/profile', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const ALLOWED = [
    'name', 'phone', 'bio', 'location', 'website', 'avatar_color',
    'job_title', 'company', 'linkedin_url', 'github_url',
    'experience_years', 'skills', 'education', 'target_role',
  ];

  const fields = [];
  const values = [];

  for (const key of ALLOWED) {
    if (req.body[key] !== undefined) {
      if (key === 'name') {
        if (req.body.name.trim().length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
        fields.push('name = ?'); values.push(req.body.name.trim());
      } else if (key === 'skills') {
        const val = typeof req.body.skills === 'string' ? req.body.skills : JSON.stringify(req.body.skills);
        fields.push('skills = ?'); values.push(val);
      } else {
        fields.push(`${key} = ?`); values.push(req.body[key]);
      }
    }
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

  values.push(req.user.id);
  await run(db, `UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  const user = await get(db, `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [req.user.id]);
  res.json({ user, message: 'Profile updated successfully' });
});

/* ── Avatar upload ─────────────────────────────────── */
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const db = req.app.locals.db;
  await run(db, 'UPDATE users SET avatar_url = ? WHERE id = ?', [req.file.filename, req.user.id]);
  res.json({ filename: req.file.filename, message: 'Avatar updated successfully' });
});

router.delete('/avatar', authMiddleware, async (req, res) => {
  const db   = req.app.locals.db;
  const user = await get(db, 'SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
  if (user?.avatar_url) {
    const filePath = path.join(avatarDir, user.avatar_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await run(db, 'UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
  res.json({ message: 'Avatar removed' });
});

/* ── Change password ───────────────────────────────── */
router.patch('/password', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Both current and new password are required' });
  if (new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const db   = req.app.locals.db;
  const user = await get(db, 'SELECT * FROM users WHERE id = ?', [req.user.id]);
  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const newHash = await bcrypt.hash(new_password, 12);
  await run(db, 'UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
