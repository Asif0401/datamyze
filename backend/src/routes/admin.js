const express = require('express');
const { all, get, run } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

function adminOnly(req, res, next) {
  if (req.user.email === ADMIN_EMAIL || req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Access denied' });
}

router.get('/overview', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;

  const totalUsers = all(db, 'SELECT COUNT(*) as count FROM users')[0]?.count || 0;
  const totalSolved = all(db, "SELECT COUNT(*) as count FROM user_problem_submissions WHERE status='accepted'")[0]?.count || 0;
  const totalEnrollments = all(db, 'SELECT COUNT(*) as count FROM user_course_progress')[0]?.count || 0;
  const totalQuizAttempts = all(db, 'SELECT COUNT(*) as count FROM user_quiz_attempts')[0]?.count || 0;
  const totalCerts = all(db, 'SELECT COUNT(*) as count FROM certificates')[0]?.count || 0;
  const totalXP = all(db, 'SELECT SUM(xp) as total FROM users')[0]?.total || 0;

  res.json({ totalUsers, totalSolved, totalEnrollments, totalQuizAttempts, totalCerts, totalXP });
});

router.get('/users', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const users = all(db, `
    SELECT u.id, u.name, u.email, u.xp, u.streak, u.role, u.last_active, u.created_at,
      (SELECT COUNT(*) FROM user_problem_submissions WHERE user_id = u.id AND status='accepted') as problems_solved,
      (SELECT COUNT(*) FROM user_course_progress WHERE user_id = u.id) as courses_enrolled,
      (SELECT COUNT(*) FROM certificates WHERE user_id = u.id) as certs_earned
    FROM users u ORDER BY u.xp DESC
  `);
  res.json({ users });
});

router.get('/courses', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const courses = all(db, `
    SELECT c.*,
      (SELECT COUNT(*) FROM user_course_progress WHERE course_id = c.id) as enrollments,
      (SELECT COUNT(*) FROM user_course_progress WHERE course_id = c.id AND progress_percent = 100) as completions,
      (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
    FROM courses c ORDER BY enrollments DESC
  `);
  res.json({ courses });
});

router.get('/problems', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const problems = all(db, `
    SELECT p.*,
      (SELECT COUNT(*) FROM user_problem_submissions WHERE problem_id = p.id) as total_attempts,
      (SELECT COUNT(*) FROM user_problem_submissions WHERE problem_id = p.id AND status='accepted') as accepted
    FROM problems p ORDER BY total_attempts DESC
  `);
  res.json({ problems });
});

router.get('/submissions', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const submissions = all(db, `
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

router.get('/activity', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const activity = all(db, `
    SELECT date, COUNT(*) as active_users
    FROM daily_streaks
    GROUP BY date
    ORDER BY date DESC LIMIT 30
  `);
  res.json({ activity });
});

// GET all premium payment submissions
router.get('/payments', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const payments = all(db, `
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
router.post('/payments/:subId/activate', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  const sub = get(db, 'SELECT * FROM premium_subscriptions WHERE id = ?', [req.params.subId]);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  run(db, "UPDATE premium_subscriptions SET status='active', activated_at=datetime('now'), expires_at=? WHERE id=?", [expiresAt, req.params.subId]);
  run(db, 'UPDATE users SET is_premium=1, premium_expires_at=? WHERE id=?', [expiresAt, sub.user_id]);
  res.json({ message: 'Premium activated for user' });
});

// Reject a payment
router.post('/payments/:subId/reject', authMiddleware, adminOnly, (req, res) => {
  const db = req.app.locals.db;
  run(db, "UPDATE premium_subscriptions SET status='rejected' WHERE id=?", [req.params.subId]);
  res.json({ message: 'Payment rejected' });
});

module.exports = router;
