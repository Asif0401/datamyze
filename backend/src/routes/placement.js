const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

// GET / — list all active companies (auth + premium required)
router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin && !user?.is_premium) {
    return res.status(403).json({ error: 'Premium membership required', premium_required: true });
  }

  const companies = await all(db, 'SELECT * FROM placement_companies WHERE is_active = 1 ORDER BY name ASC', []);
  res.json({
    companies: companies.map(co => ({
      ...co,
      roles: JSON.parse(co.roles || '[]'),
      interview_rounds: JSON.parse(co.interview_rounds || '[]'),
      key_topics: JSON.parse(co.key_topics || '[]'),
      prep_tips: JSON.parse(co.prep_tips || '[]'),
    })),
  });
});

// GET /:id — get full company detail (auth + premium required)
router.get('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin && !user?.is_premium) {
    return res.status(403).json({ error: 'Premium membership required', premium_required: true });
  }

  const co = await get(db, 'SELECT * FROM placement_companies WHERE id = ? AND is_active = 1', [req.params.id]);
  if (!co) return res.status(404).json({ error: 'Company not found' });

  res.json({
    company: {
      ...co,
      roles: JSON.parse(co.roles || '[]'),
      interview_rounds: JSON.parse(co.interview_rounds || '[]'),
      key_topics: JSON.parse(co.key_topics || '[]'),
      prep_tips: JSON.parse(co.prep_tips || '[]'),
    },
  });
});

// Admin POST / — add company
router.post('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

  const { name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const id = uuidv4();
  await run(db,
    `INSERT INTO placement_companies (id, name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, logo || '🏢', color || '#4A90D9', industry || 'Technology',
     JSON.stringify(roles || []), difficulty || 'Hard',
     JSON.stringify(interview_rounds || []), JSON.stringify(key_topics || []),
     JSON.stringify(prep_tips || []), salary_range || null, success_rate || 20],
  );

  res.json({ success: true, id });
});

// Admin PUT /:id — update company
router.put('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

  const { name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate, is_active } = req.body;
  await run(db,
    `UPDATE placement_companies SET
       name=?, logo=?, color=?, industry=?, roles=?, difficulty=?,
       interview_rounds=?, key_topics=?, prep_tips=?, salary_range=?, success_rate=?, is_active=?
     WHERE id=?`,
    [name, logo, color, industry,
     JSON.stringify(roles || []), difficulty,
     JSON.stringify(interview_rounds || []), JSON.stringify(key_topics || []),
     JSON.stringify(prep_tips || []), salary_range, success_rate,
     is_active !== undefined ? is_active : 1,
     req.params.id],
  );

  res.json({ success: true });
});

module.exports = router;
