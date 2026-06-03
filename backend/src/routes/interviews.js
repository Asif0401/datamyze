const express = require('express');
const { all, get, run } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

// GET /api/interviews — list all approved experiences (summary, no rounds_detail)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { company, role, outcome, type } = req.query;

    let sql = `SELECT id, user_id, author_name, company, role, experience_type, difficulty,
                      outcome, rounds, overall_experience, tips, interview_date,
                      is_approved, upvotes, created_at
               FROM interview_experiences
               WHERE is_approved = 1`;
    const params = [];

    if (company) { sql += ' AND LOWER(company) LIKE ?'; params.push(`%${company.toLowerCase()}%`); }
    if (role)    { sql += ' AND LOWER(role) LIKE ?';    params.push(`%${role.toLowerCase()}%`); }
    if (outcome) { sql += ' AND outcome = ?';            params.push(outcome); }
    if (type)    { sql += ' AND experience_type = ?';    params.push(type); }

    sql += ' ORDER BY created_at DESC';

    const rows = await all(db, sql, params);
    res.json({ experiences: rows });
  } catch (err) {
    console.error('GET /interviews error:', err);
    res.status(500).json({ error: 'Failed to load experiences' });
  }
});

// GET /api/interviews/:id — full experience with rounds_detail
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const exp = await get(db, 'SELECT * FROM interview_experiences WHERE id = ? AND is_approved = 1', [req.params.id]);
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    res.json({ experience: exp });
  } catch (err) {
    console.error('GET /interviews/:id error:', err);
    res.status(500).json({ error: 'Failed to load experience' });
  }
});

// POST /api/interviews — submit new experience
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await get(db, 'SELECT name FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      company, role, experience_type, difficulty, outcome,
      rounds, rounds_detail, overall_experience, tips, interview_date,
    } = req.body;

    if (!company || !role || !overall_experience) {
      return res.status(400).json({ error: 'company, role, and overall_experience are required' });
    }
    if (overall_experience.length < 50) {
      return res.status(400).json({ error: 'overall_experience must be at least 50 characters' });
    }

    const id = uuidv4();
    const roundsDetailStr = typeof rounds_detail === 'string'
      ? rounds_detail
      : JSON.stringify(rounds_detail || []);

    await run(db, `INSERT INTO interview_experiences
      (id, user_id, author_name, company, role, experience_type, difficulty, outcome,
       rounds, rounds_detail, overall_experience, tips, interview_date, is_approved, upvotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [
        id, req.user.id, user.name,
        company, role,
        experience_type || 'Off-campus',
        difficulty || 'Medium',
        outcome || 'Selected',
        rounds || 1,
        roundsDetailStr,
        overall_experience,
        tips || null,
        interview_date || null,
      ]
    );

    res.status(201).json({ message: 'Experience submitted successfully', id });
  } catch (err) {
    console.error('POST /interviews error:', err);
    res.status(500).json({ error: 'Failed to submit experience' });
  }
});

// POST /api/interviews/:id/upvote — increment upvote count
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const exp = await get(db, 'SELECT id, upvotes FROM interview_experiences WHERE id = ?', [req.params.id]);
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    await run(db, 'UPDATE interview_experiences SET upvotes = upvotes + 1 WHERE id = ?', [req.params.id]);
    res.json({ upvotes: (exp.upvotes || 0) + 1 });
  } catch (err) {
    console.error('POST /interviews/:id/upvote error:', err);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// DELETE /api/interviews/:id — admin only
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await get(db, 'SELECT email, role FROM users WHERE id = ?', [req.user.id]);
    if (!user || (user.email !== ADMIN_EMAIL && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    await run(db, 'DELETE FROM interview_experiences WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /interviews/:id error:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// PATCH /api/interviews/:id/approve — admin toggle approval
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await get(db, 'SELECT email, role FROM users WHERE id = ?', [req.user.id]);
    if (!user || (user.email !== ADMIN_EMAIL && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { is_approved } = req.body;
    await run(db, 'UPDATE interview_experiences SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('PATCH /interviews/:id/approve error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

module.exports = router;
