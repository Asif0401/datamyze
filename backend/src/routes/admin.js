const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { all, get, run } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Instructor photo upload setup
const instructorDir = path.join(__dirname, '../../../uploads/instructor');
if (!fs.existsSync(instructorDir)) fs.mkdirSync(instructorDir, { recursive: true });
const instructorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, instructorDir),
  filename: (req, file, cb) => cb(null, 'photo' + path.extname(file.originalname).toLowerCase()),
});
const uploadInstructorPhoto = multer({
  storage: instructorStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|heic)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP allowed'));
  },
});

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

const ADMIN_EMAIL = 'ak384837@gmail.com';

function adminOnly(req, res, next) {
  if (req.user.email === ADMIN_EMAIL || req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Access denied' });
}

router.get('/overview', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;

  const totalUsers = (await all(db, 'SELECT COUNT(*) as count FROM users'))[0]?.count || 0;
  const totalSolved = (await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions WHERE status='accepted'"))[0]?.count || 0;
  const totalEnrollments = (await all(db, 'SELECT COUNT(*) as count FROM user_course_progress'))[0]?.count || 0;
  const totalQuizAttempts = (await all(db, 'SELECT COUNT(*) as count FROM user_quiz_attempts'))[0]?.count || 0;
  const totalCerts = (await all(db, 'SELECT COUNT(*) as count FROM certificates'))[0]?.count || 0;
  const totalXP = (await all(db, 'SELECT SUM(xp) as total FROM users'))[0]?.total || 0;

  res.json({ totalUsers, totalSolved, totalEnrollments, totalQuizAttempts, totalCerts, totalXP });
});

router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const users = await all(db, `
    SELECT u.id, u.name, u.email, u.xp, u.streak, u.role, u.last_active, u.created_at,
      (SELECT COUNT(*) FROM user_problem_submissions WHERE user_id = u.id AND status='accepted') as problems_solved,
      (SELECT COUNT(*) FROM user_course_progress WHERE user_id = u.id) as courses_enrolled,
      (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) as certs_earned
    FROM users u ORDER BY u.xp DESC
  `);
  res.json({ users });
});

router.get('/courses', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const courses = await all(db, `
    SELECT c.*,
      (SELECT COUNT(*) FROM user_course_progress WHERE course_id = c.id) as enrollments,
      (SELECT COUNT(*) FROM user_course_progress WHERE course_id = c.id AND progress_percent = 100) as completions,
      (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
    FROM courses c ORDER BY enrollments DESC
  `);
  res.json({ courses });
});

router.get('/problems', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const problems = await all(db, `
    SELECT p.*,
      (SELECT COUNT(*) FROM user_problem_submissions WHERE problem_id = p.id) as total_attempts,
      (SELECT COUNT(*) FROM user_problem_submissions WHERE problem_id = p.id AND status='accepted') as accepted
    FROM problems p ORDER BY total_attempts DESC
  `);
  res.json({ problems });
});

router.get('/submissions', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const submissions = await all(db, `
    SELECT s.id, s.status, s.submitted_at,
      u.name as user_name, u.email as user_email,
      p.title as problem_title, p.topic, p.difficulty
    FROM user_problem_submissions s
    JOIN users u ON u.id = s.user_id
    JOIN problems p ON p.id = s.problem_id
    ORDER BY s.submitted_at DESC LIMIT 50
  `);
  res.json({ submissions });
});

router.get('/activity', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const activity = await all(db, `
    SELECT date, COUNT(*) as active_users
    FROM daily_streaks
    GROUP BY date
    ORDER BY date DESC LIMIT 30
  `);
  res.json({ activity });
});

// GET all premium payment submissions
router.get('/payments', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const payments = await all(db, `
    SELECT ps.id, ps.user_id, ps.amount, ps.utr_number, ps.status,
           ps.created_at, ps.activated_at, ps.expires_at,
           ps.receipt_filename, ps.receipt_original,
           u.name as user_name, u.email as user_email, u.is_premium
    FROM premium_subscriptions ps
    JOIN users u ON u.id = ps.user_id
    ORDER BY ps.created_at DESC
  `);
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    active:  payments.filter(p => p.status === 'active').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
    revenue: payments.filter(p => p.status === 'active').reduce((s, p) => s + (p.amount || 99), 0),
  };
  res.json({ payments, stats });
});

// Activate a payment
router.post('/payments/:subId/activate', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const sub = await get(db, 'SELECT * FROM premium_subscriptions WHERE id = ?', [req.params.subId]);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await run(db, "UPDATE premium_subscriptions SET status='active', activated_at=datetime('now'), expires_at=? WHERE id=?", [expiresAt, req.params.subId]);
  await run(db, 'UPDATE users SET is_premium=1, premium_expires_at=? WHERE id=?', [expiresAt, sub.user_id]);
  const granted = await grantPendingCertificates(db, sub.user_id);
  res.json({ message: 'Premium activated for user', certificates_granted: granted });
});

// Reject a payment
router.post('/payments/:subId/reject', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  await run(db, "UPDATE premium_subscriptions SET status='rejected' WHERE id=?", [req.params.subId]);
  res.json({ message: 'Payment rejected' });
});

// ── Instructor Profile ───────────────────────────────────────────────

// GET instructor profile (public — used by Instructor page)
router.get('/instructor', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const admin = await get(db, "SELECT id, name, email, bio, job_title, location, linkedin_url, github_url, skills FROM users WHERE role = 'admin' OR email = ? LIMIT 1", ['ak384837@gmail.com']);

  // Check if photo exists
  const photoExts = ['jpg', 'jpeg', 'png', 'webp'];
  let photoUrl = null;
  for (const ext of photoExts) {
    if (fs.existsSync(path.join(instructorDir, `photo.${ext}`))) {
      photoUrl = `/uploads/instructor/photo.${ext}`;
      break;
    }
  }

  res.json({
    name: admin?.name || 'Asif Khan',
    title: admin?.job_title || 'Lead Instructor · Data Scientist',
    bio: admin?.bio || null,
    location: admin?.location || 'India',
    linkedin_url: admin?.linkedin_url || null,
    github_url: admin?.github_url || null,
    photo_url: photoUrl,
  });
});

// POST upload instructor photo (admin only)
router.post('/instructor/photo', authMiddleware, adminOnly, uploadInstructorPhoto.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoUrl = `/uploads/instructor/${req.file.filename}`;
  res.json({ message: 'Photo uploaded successfully', photo_url: photoUrl });
});

// PUT update instructor profile info (admin only)
router.put('/instructor', authMiddleware, adminOnly, async (req, res) => {
  const db = req.app.locals.db;
  const { name, job_title, bio, location, linkedin_url, github_url } = req.body;
  await run(db, "UPDATE users SET name = ?, job_title = ?, bio = ?, location = ?, linkedin_url = ?, github_url = ? WHERE role = 'admin' OR email = ?",
    [name, job_title, bio, location, linkedin_url, github_url, 'ak384837@gmail.com']);
  res.json({ message: 'Instructor profile updated' });
});

module.exports = router;
