const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  res.json({ quizzes: all(db, 'SELECT * FROM quizzes') });
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const quiz = get(db, 'SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = all(db, 'SELECT id, question, options, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index', [quiz.id]);
  const attempts = all(db, 'SELECT score, total, xp_earned, attempted_at FROM user_quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY attempted_at DESC LIMIT 5', [req.user.id, quiz.id]);
  res.json({ quiz, questions: questions.map(q => ({ ...q, options: JSON.parse(q.options) })), attempts });
});

router.post('/:id/submit', authMiddleware, (req, res) => {
  const { answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'Answers required' });
  const db = req.app.locals.db;
  const quiz = get(db, 'SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = all(db, 'SELECT * FROM quiz_questions WHERE quiz_id = ?', [quiz.id]);
  let score = 0;
  const results = questions.map(q => {
    const selected = answers[q.id];
    const correct = selected === q.correct_index;
    if (correct) score++;
    return { question_id: q.id, question: q.question, selected_index: selected, correct_index: q.correct_index, correct, explanation: q.explanation, options: JSON.parse(q.options) };
  });
  const xpEarned = score * 30;
  run(db, 'INSERT INTO user_quiz_attempts (id, user_id, quiz_id, score, total, xp_earned) VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), req.user.id, quiz.id, score, questions.length, xpEarned]);
  run(db, 'UPDATE users SET xp = xp + ? WHERE id = ?', [xpEarned, req.user.id]);
  res.json({ score, total: questions.length, xp_earned: xpEarned, results });
});

module.exports = router;
