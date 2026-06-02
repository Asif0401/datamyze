const express = require('express');
const { get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin && !user?.is_premium) return res.status(403).json({ error: 'Premium membership required', premium_required: true });
  const { search, type, location } = req.query;
  let sql = 'SELECT * FROM job_listings WHERE is_active = 1';
  const params = [];
  if (search) { sql += ' AND (title LIKE ? OR company LIKE ? OR skills LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (type && type !== 'All') { sql += ' AND type = ?'; params.push(type); }
  if (location) { sql += ' AND location LIKE ?'; params.push(`%${location}%`); }
  sql += ' ORDER BY posted_days_ago ASC';
  const jobs = await all(db, sql, params);
  res.json({ jobs: jobs.map(j => ({ ...j, skills: JSON.parse(j.skills || '[]') })) });
});

module.exports = router;
