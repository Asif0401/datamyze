const express = require('express');
const { all, get } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

// GET all case studies (locked content not returned for free users, but metadata shown)
router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT email, is_premium, premium_expires_at FROM users WHERE id = ?', [req.user.id]);
  const isPremium = user?.email === ADMIN_EMAIL ||
    (user?.is_premium === 1 && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()));

  const cases = await all(db, 'SELECT * FROM case_studies ORDER BY is_free DESC, created_at ASC');

  // For non-premium, hide detailed content of paid case studies
  const result = cases.map(c => {
    if (!c.is_free && !isPremium) {
      return { id: c.id, title: c.title, company: c.company, company_logo: c.company_logo, difficulty: c.difficulty, tags: c.tags, summary: c.summary, is_free: 0, locked: true };
    }
    return { ...c, tags: c.tags, locked: false };
  });

  res.json({ case_studies: result, is_premium: isPremium });
});

// GET single case study
router.get('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT email, is_premium, premium_expires_at FROM users WHERE id = ?', [req.user.id]);
  const isPremium = user?.email === ADMIN_EMAIL ||
    (user?.is_premium === 1 && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()));

  const cs = await get(db, 'SELECT * FROM case_studies WHERE id = ?', [req.params.id]);
  if (!cs) return res.status(404).json({ error: 'Case study not found' });
  if (!cs.is_free && !isPremium) return res.status(403).json({ error: 'premium_required' });

  res.json({ case_study: { ...cs, tags: cs.tags, locked: false } });
});

module.exports = router;
