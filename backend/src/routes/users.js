const express = require('express');
const { get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/leaderboard', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const users = await all(db, 'SELECT id, name, xp, streak FROM users ORDER BY xp DESC LIMIT 20');
  const lb = users.map((u, i) => ({ ...u, rank: i + 1 }));
  res.json({ leaderboard: lb });
});

router.get('/dashboard', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT id, name, email, xp, streak, role, last_active FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rankRows = await all(db, 'SELECT COUNT(*) as count FROM users WHERE xp > ?', [user.xp]);
  const rank = (rankRows[0]?.count || 0) + 1;

  const solvedRows = await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions WHERE user_id = ? AND status = 'accepted'", [req.user.id]);
  const totalSolved = solvedRows[0]?.count || 0;

  const quizRows = await all(db, 'SELECT COUNT(*) as count FROM user_quiz_attempts WHERE user_id = ?', [req.user.id]);
  const quizzesTaken = quizRows[0]?.count || 0;

  const activeDays = (await all(db, 'SELECT date FROM daily_streaks WHERE user_id = ? ORDER BY date DESC LIMIT 28', [req.user.id])).map(r => r.date);

  const courseProgress = await all(db, `
    SELECT c.id, c.title, c.icon, c.color, ucp.progress_percent
    FROM user_course_progress ucp
    JOIN courses c ON c.id = ucp.course_id
    WHERE ucp.user_id = ? AND ucp.progress_percent > 0
    ORDER BY ucp.enrolled_at DESC`, [req.user.id]);

  res.json({ user: { ...user, rank }, stats: { totalSolved, quizzesTaken, activeDays, rank }, courseProgress });
});

router.get('/certificates', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT is_premium, premium_expires_at FROM users WHERE id = ?', [req.user.id]);
  const isPremium = user?.is_premium === 1 && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date());
  if (!isPremium) return res.status(403).json({ error: 'premium_required', message: 'Certificates are available for Pro members only.' });
  const certs = await all(db, `
    SELECT cert.id, cert.credential_id, cert.issued_at,
           c.title AS course_title, c.icon AS course_icon
    FROM certificates cert
    JOIN courses c ON c.id = cert.course_id
    WHERE cert.user_id = ? ORDER BY cert.issued_at DESC`, [req.user.id]);
  res.json({ certificates: certs });
});

module.exports = router;
