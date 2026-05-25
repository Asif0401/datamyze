const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { sendNotification } = require('../utils/notify');
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const courses = all(db, 'SELECT * FROM courses ORDER BY rowid');
  const progress = all(db, 'SELECT course_id, progress_percent, completed_lessons, enrolled_at FROM user_course_progress WHERE user_id = ?', [req.user.id]);
  const pMap = {};
  progress.forEach(p => pMap[p.course_id] = p);
  res.json({ courses: courses.map(c => ({ ...c, progress: pMap[c.id] || { progress_percent: 0, completed_lessons: '[]' } })) });
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const course = get(db, 'SELECT * FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const lessons = all(db, 'SELECT id, title, description, content, video_url, duration_minutes, order_index FROM lessons WHERE course_id = ? ORDER BY order_index', [course.id]);
  const progress = get(db, 'SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  const pollRow  = get(db, 'SELECT COUNT(*) as count FROM live_session_polls WHERE course_id = ?', [req.params.id]);
  const userVote = get(db, 'SELECT id FROM live_session_polls WHERE course_id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ course, lessons, progress: progress || null, poll_count: pollRow?.count || 0, user_voted: !!userVote });
});

// Toggle live-session poll vote
router.post('/:id/poll', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { id: courseId } = req.params;
  const userId = req.user.id;
  const existing = get(db, 'SELECT id FROM live_session_polls WHERE course_id = ? AND user_id = ?', [courseId, userId]);
  if (existing) {
    run(db, 'DELETE FROM live_session_polls WHERE course_id = ? AND user_id = ?', [courseId, userId]);
  } else {
    run(db, 'INSERT INTO live_session_polls (id, course_id, user_id) VALUES (?, ?, ?)', [uuidv4(), courseId, userId]);

    // Email notification when a user requests a live session
    const course  = get(db, 'SELECT title FROM courses WHERE id = ?', [courseId]);
    const user    = get(db, 'SELECT name, email, phone FROM users WHERE id = ?', [userId]);
    const total   = get(db, 'SELECT COUNT(*) as count FROM live_session_polls WHERE course_id = ?', [courseId])?.count || 1;
    const ts      = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    sendNotification(
      `🎙️ Live Session Request — ${course?.title}`,
      `<h2 style="color:#4A90D9">Live Session Requested!</h2>
       <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">
         <tr><td style="padding:6px 16px 6px 0;color:#888">User</td><td><strong>${user?.name}</strong></td></tr>
         <tr><td style="padding:6px 16px 6px 0;color:#888">Contact</td><td>${user?.phone || user?.email}</td></tr>
         <tr><td style="padding:6px 16px 6px 0;color:#888">Course</td><td>${course?.title}</td></tr>
         <tr><td style="padding:6px 16px 6px 0;color:#888">Total requests</td><td><strong>${total}</strong> students want this session</td></tr>
         <tr><td style="padding:6px 16px 6px 0;color:#888">Time</td><td>${ts}</td></tr>
       </table>`
    );
  }
  const count = get(db, 'SELECT COUNT(*) as count FROM live_session_polls WHERE course_id = ?', [courseId])?.count || 0;
  res.json({ voted: !existing, count });
});

router.post('/:id/enroll', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const course = get(db, 'SELECT id FROM courses WHERE id = ?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const existing = get(db, 'SELECT id FROM user_course_progress WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  if (existing) return res.json({ message: 'Already enrolled' });
  run(db, "INSERT INTO user_course_progress (id, user_id, course_id, progress_percent, completed_lessons) VALUES (?, ?, ?, 0, '[]')", [uuidv4(), req.user.id, course.id]);
  res.status(201).json({ message: 'Enrolled' });
});

router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const { courseId, lessonId } = req.params;

  let progress = get(db, 'SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
  if (!progress) {
    run(db, "INSERT INTO user_course_progress (id, user_id, course_id, progress_percent, completed_lessons) VALUES (?, ?, ?, 0, '[]')", [uuidv4(), req.user.id, courseId]);
    progress = get(db, 'SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
  }

  const completed = JSON.parse(progress.completed_lessons || '[]');
  if (!completed.includes(lessonId)) completed.push(lessonId);

  const totalRow = all(db, 'SELECT COUNT(*) as count FROM lessons WHERE course_id = ?', [courseId]);
  const total = totalRow[0]?.count || 1;
  const pct = Math.round((completed.length / total) * 100);
  const completedAt = pct === 100 ? new Date().toISOString() : null;

  run(db, 'UPDATE user_course_progress SET completed_lessons = ?, progress_percent = ?, completed_at = ? WHERE user_id = ? AND course_id = ?',
    [JSON.stringify(completed), pct, completedAt, req.user.id, courseId]);

  run(db, 'UPDATE users SET xp = xp + 20 WHERE id = ?', [req.user.id]);

  if (pct === 100) {
    const certUser = get(db, 'SELECT is_premium, premium_expires_at FROM users WHERE id = ?', [req.user.id]);
    const isPremium = certUser?.is_premium === 1 && (!certUser.premium_expires_at || new Date(certUser.premium_expires_at) > new Date());
    if (isPremium) {
      const cert = get(db, 'SELECT id FROM certificates WHERE user_id = ? AND course_id = ?', [req.user.id, courseId]);
      if (!cert) {
        const credId = 'DQ-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        try { run(db, 'INSERT INTO certificates (id, user_id, course_id, credential_id) VALUES (?, ?, ?, ?)', [uuidv4(), req.user.id, courseId, credId]); } catch(e) {}
        run(db, 'UPDATE users SET xp = xp + 500 WHERE id = ?', [req.user.id]);
      }
    }
  }

  res.json({ progress_percent: pct, completed_lessons: completed, xp_added: 20 });
});

module.exports = router;
