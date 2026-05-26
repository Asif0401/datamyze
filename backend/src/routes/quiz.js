const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET courses that have quiz questions
router.get('/courses', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const courses = await all(db, `
    SELECT c.id, c.title, c.icon, c.color,
           COUNT(DISTINCT qq.topic) as topic_count,
           COUNT(qq.id) as question_count
    FROM courses c
    JOIN quiz_questions qq ON qq.course_id = c.id
    GROUP BY c.id
    ORDER BY c.rowid
  `);
  res.json({ courses });
});

// GET topics for a course
router.get('/topics/:courseId', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const topics = await all(db, `
    SELECT topic, COUNT(*) as question_count
    FROM quiz_questions
    WHERE course_id = ?
    GROUP BY topic
    ORDER BY topic
  `, [req.params.courseId]);
  res.json({ topics });
});

// GET questions for a course+topic (quiz session)
router.get('/questions', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const { course_id, topic, limit = 5 } = req.query;
  if (!course_id) return res.status(400).json({ error: 'course_id required' });

  let qs;
  if (topic && topic !== 'All') {
    qs = await all(db, 'SELECT id, question, options, explanation, correct_index FROM quiz_questions WHERE course_id = ? AND topic = ? ORDER BY RANDOM() LIMIT ?', [course_id, topic, parseInt(limit)]);
  } else {
    qs = await all(db, 'SELECT id, question, options, explanation, correct_index FROM quiz_questions WHERE course_id = ? ORDER BY RANDOM() LIMIT ?', [course_id, parseInt(limit)]);
  }

  // Send correct_index to frontend for instant feedback
  res.json({ questions: qs.map(q => ({ ...q, options: JSON.parse(q.options) })) });
});

// Submit quiz results
router.post('/submit', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const { course_id, topic, answers, question_ids } = req.body;
  if (!answers || !question_ids) return res.status(400).json({ error: 'answers and question_ids required' });

  const questions = (await Promise.all(question_ids.map(id => get(db, 'SELECT * FROM quiz_questions WHERE id = ?', [id])))).filter(Boolean);
  let score = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correct_index) score++;
  });

  const xpEarned = score * 30;
  // Find or create a quiz record for this course
  let quiz = await get(db, 'SELECT id FROM quizzes WHERE course_id = ?', [course_id]);
  if (!quiz) {
    const qId = uuidv4();
    await run(db, 'INSERT OR IGNORE INTO quizzes (id, title, course_id) VALUES (?, ?, ?)', [qId, topic || 'Quiz', course_id]);
    quiz = { id: qId };
  }

  await run(db, 'INSERT INTO user_quiz_attempts (id, user_id, quiz_id, score, total, xp_earned) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), req.user.id, quiz.id, score, questions.length, xpEarned]);
  await run(db, 'UPDATE users SET xp = xp + ? WHERE id = ?', [xpEarned, req.user.id]);

  res.json({ score, total: questions.length, xp_earned: xpEarned });
});

// Legacy routes for backward compatibility
router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  res.json({ quizzes: await all(db, 'SELECT * FROM quizzes') });
});

router.get('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const quiz = await get(db, 'SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = await all(db, 'SELECT id, question, options, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index', [quiz.id]);
  const attempts = await all(db, 'SELECT score, total, xp_earned, attempted_at FROM user_quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY attempted_at DESC LIMIT 5', [req.user.id, quiz.id]);
  res.json({ quiz, questions: questions.map(q => ({ ...q, options: JSON.parse(q.options) })), attempts });
});

router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'Answers required' });
  const db = req.app.locals.db;
  const quiz = await get(db, 'SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = await all(db, 'SELECT * FROM quiz_questions WHERE quiz_id = ?', [quiz.id]);
  let score = 0;
  const results = questions.map(q => {
    const selected = answers[q.id];
    const correct = selected === q.correct_index;
    if (correct) score++;
    return { question_id: q.id, question: q.question, selected_index: selected, correct_index: q.correct_index, correct, explanation: q.explanation, options: JSON.parse(q.options) };
  });
  const xpEarned = score * 30;
  await run(db, 'INSERT INTO user_quiz_attempts (id, user_id, quiz_id, score, total, xp_earned) VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), req.user.id, quiz.id, score, questions.length, xpEarned]);
  await run(db, 'UPDATE users SET xp = xp + ? WHERE id = ?', [xpEarned, req.user.id]);
  res.json({ score, total: questions.length, xp_earned: xpEarned, results });
});

module.exports = router;
