const express = require('express');
const { get, all, run } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

// GET /api/company-banks — list all companies (auth required, no premium check)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const companies = await all(db, `SELECT * FROM company_banks WHERE is_active=1 ORDER BY name ASC`);
    res.json({ companies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/company-banks/:id/questions — premium only
router.get('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
    if (!isAdmin && !user?.is_premium) {
      return res.status(403).json({ error: 'Premium membership required', premium_required: true });
    }
    const company = await get(db, 'SELECT * FROM company_banks WHERE id = ?', [req.params.id]);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const questions = await all(db,
      `SELECT * FROM company_bank_questions WHERE company_id = ? ORDER BY order_index ASC`,
      [req.params.id]
    );
    res.json({ company, questions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin routes ────────────────────────────────────────
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin' && req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

// POST /api/company-banks — add company
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, logo, color, industry, difficulty } = req.body;
    const id = uuidv4();
    await run(db, `INSERT INTO company_banks (id,name,logo,color,industry,difficulty) VALUES (?,?,?,?,?,?)`,
      [id, name, logo || '🏢', color || '#4A90D9', industry || 'Technology', difficulty || 'Medium']);
    res.json({ id, success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/company-banks/:id/questions — add question
router.post('/:id/questions', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title, question, type, difficulty, topic, approach, xp_reward, order_index } = req.body;
    const id = uuidv4();
    await run(db,
      `INSERT INTO company_bank_questions (id,company_id,title,question,type,difficulty,topic,approach,xp_reward,order_index) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, req.params.id, title, question, type || 'SQL', difficulty || 'Medium', topic || 'General', approach || '', xp_reward || 30, order_index || 0]
    );
    // Update question_count
    await run(db, `UPDATE company_banks SET question_count = (SELECT COUNT(*) FROM company_bank_questions WHERE company_id=?) WHERE id=?`,
      [req.params.id, req.params.id]);
    res.json({ id, success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/company-banks/questions/:qid
router.delete('/questions/:qid', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const q = await get(db, 'SELECT company_id FROM company_bank_questions WHERE id=?', [req.params.qid]);
    if (!q) return res.status(404).json({ error: 'Not found' });
    await run(db, 'DELETE FROM company_bank_questions WHERE id=?', [req.params.qid]);
    await run(db, `UPDATE company_banks SET question_count = (SELECT COUNT(*) FROM company_bank_questions WHERE company_id=?) WHERE id=?`,
      [q.company_id, q.company_id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
