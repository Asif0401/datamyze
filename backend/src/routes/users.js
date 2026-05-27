const express = require('express');
const { get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/leaderboard', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const realUsers = await all(db, 'SELECT id, name, xp, streak FROM users ORDER BY xp DESC LIMIT 20');

  // Seed users — make the leaderboard feel active for a new platform.
  // These will naturally get pushed down as real users earn more XP.
  const SEED_USERS = [
    { id: 'seed-01', name: 'Rahul Sharma',    xp: 5840, streak: 28 },
    { id: 'seed-02', name: 'Priya Nair',      xp: 5210, streak: 21 },
    { id: 'seed-03', name: 'Ankit Verma',     xp: 4780, streak: 19 },
    { id: 'seed-04', name: 'Sneha Iyer',      xp: 4350, streak: 16 },
    { id: 'seed-05', name: 'Karthik Menon',   xp: 3990, streak: 14 },
    { id: 'seed-06', name: 'Divya Reddy',     xp: 3650, streak: 12 },
    { id: 'seed-07', name: 'Rohan Gupta',     xp: 3280, streak: 11 },
    { id: 'seed-08', name: 'Meera Pillai',    xp: 2940, streak: 9  },
    { id: 'seed-09', name: 'Aditya Singh',    xp: 2680, streak: 8  },
    { id: 'seed-10', name: 'Pooja Desai',     xp: 2410, streak: 7  },
    { id: 'seed-11', name: 'Vikram Bhat',     xp: 2150, streak: 6  },
    { id: 'seed-12', name: 'Lavanya Rao',     xp: 1920, streak: 5  },
    { id: 'seed-13', name: 'Nikhil Joshi',    xp: 1690, streak: 5  },
    { id: 'seed-14', name: 'Ishita Kapoor',   xp: 1460, streak: 4  },
    { id: 'seed-15', name: 'Suresh Babu',     xp: 1240, streak: 3  },
    { id: 'seed-16', name: 'Tanya Mishra',    xp: 1020, streak: 3  },
    { id: 'seed-17', name: 'Harish Kumar',    xp:  810, streak: 2  },
    { id: 'seed-18', name: 'Pallavi Shah',    xp:  650, streak: 2  },
    { id: 'seed-19', name: 'Deepak Nambiar',  xp:  490, streak: 1  },
    { id: 'seed-20', name: 'Shweta Jain',     xp:  330, streak: 1  },
  ];

  // Merge real users with seeds; real users override by identity
  const realIds = new Set(realUsers.map(u => u.id));
  const combined = [
    ...realUsers,
    ...SEED_USERS.filter(s => !realIds.has(s.id)),
  ]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 20)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  res.json({ leaderboard: combined });
});

router.get('/dashboard', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT id, name, email, xp, streak, role, last_active, target_role FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rankRows = await all(db, 'SELECT COUNT(*) as count FROM users WHERE xp > ?', [user.xp]);
  const rank = (rankRows[0]?.count || 0) + 1;

  // Problems stats
  const solvedRows = await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions WHERE user_id = ? AND status = 'accepted'", [req.user.id]);
  const totalSolved = solvedRows[0]?.count || 0;

  // SQL vs Python breakdown
  const sqlSolved = (await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions ups JOIN problems p ON p.id = ups.problem_id WHERE ups.user_id = ? AND ups.status = 'accepted' AND p.topic = 'SQL'", [req.user.id]))[0]?.count || 0;
  const pythonSolved = (await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions ups JOIN problems p ON p.id = ups.problem_id WHERE ups.user_id = ? AND ups.status = 'accepted' AND p.topic = 'Python'", [req.user.id]))[0]?.count || 0;

  // This week vs last week problems
  const today = new Date();
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay()); startOfWeek.setHours(0,0,0,0);
  const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const thisWeekSolved = (await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions WHERE user_id = ? AND status = 'accepted' AND submitted_at >= ?", [req.user.id, startOfWeek.toISOString()]))[0]?.count || 0;
  const lastWeekSolved = (await all(db, "SELECT COUNT(*) as count FROM user_problem_submissions WHERE user_id = ? AND status = 'accepted' AND submitted_at >= ? AND submitted_at < ?", [req.user.id, startOfLastWeek.toISOString(), startOfWeek.toISOString()]))[0]?.count || 0;

  // Quiz stats
  const quizRows = await all(db, 'SELECT COUNT(*) as count FROM user_quiz_attempts WHERE user_id = ?', [req.user.id]);
  const quizzesTaken = quizRows[0]?.count || 0;
  const quizScoreRows = await all(db, 'SELECT score, total FROM user_quiz_attempts WHERE user_id = ? AND total > 0', [req.user.id]);
  const avgQuizPct = quizScoreRows.length > 0
    ? Math.round(quizScoreRows.reduce((s, r) => s + (r.score / r.total * 100), 0) / quizScoreRows.length)
    : 0;

  // Course stats
  const totalCoursesRow = await get(db, "SELECT COUNT(*) as count FROM courses WHERE is_coming_soon = 0 OR is_coming_soon IS NULL");
  const totalCourses = totalCoursesRow?.count || 8;
  const activeDays = (await all(db, 'SELECT date FROM daily_streaks WHERE user_id = ? ORDER BY date DESC LIMIT 91', [req.user.id])).map(r => r.date);

  const courseProgress = await all(db, `
    SELECT c.id, c.title, c.icon, c.color, ucp.progress_percent
    FROM user_course_progress ucp
    JOIN courses c ON c.id = ucp.course_id
    WHERE ucp.user_id = ? AND ucp.progress_percent > 0
    ORDER BY ucp.enrolled_at DESC`, [req.user.id]);

  const completedCourses = courseProgress.filter(c => c.progress_percent >= 100).length;

  // Days since last activity
  const lastDate = activeDays[0];
  const daysSinceActive = lastDate
    ? Math.floor((Date.now() - new Date(lastDate + 'T12:00:00').getTime()) / 86400000)
    : 999;

  // ── Interview Readiness Score (0-100) ──────────────────
  const problemScore  = Math.min(totalSolved / 30, 1) * 40;    // 40% weight
  const courseScore   = (completedCourses / Math.max(totalCourses, 1)) * 30; // 30% weight
  const quizScore     = (avgQuizPct / 100) * 15;               // 15% weight
  const streakScore   = Math.min((user.streak || 0) / 14, 1) * 15; // 15% weight
  const readinessScore = Math.round(problemScore + courseScore + quizScore + streakScore);

  // ── Preparation Stage ──────────────────────────────────
  let prepStage, prepStageIdx;
  if (readinessScore <= 20)      { prepStage = 'Just Starting';        prepStageIdx = 0; }
  else if (readinessScore <= 40) { prepStage = 'Building Foundation';  prepStageIdx = 1; }
  else if (readinessScore <= 60) { prepStage = 'Getting Consistent';   prepStageIdx = 2; }
  else if (readinessScore <= 80) { prepStage = 'Interview Prep Mode';  prepStageIdx = 3; }
  else                           { prepStage = 'Job-Ready';            prepStageIdx = 4; }

  // ── Personalized Mentor Message ────────────────────────
  let mentorMessage, mentorAction, mentorActionPath;
  if (daysSinceActive >= 3 && totalSolved > 0) {
    mentorMessage = `You haven't practiced in ${daysSinceActive} days. Consistency is the #1 factor in landing a data job — even 1 problem a day keeps your skills sharp.`;
    mentorAction = 'Solve a Problem Now'; mentorActionPath = '/problems';
  } else if (totalSolved === 0) {
    mentorMessage = `Welcome! The journey to your dream data job starts with one problem. SQL is the most in-demand skill for data analysts — let's begin there.`;
    mentorAction = 'Start with SQL'; mentorActionPath = '/problems';
  } else if (totalSolved < 5) {
    mentorMessage = `Good start! You've solved ${totalSolved} problem${totalSolved > 1 ? 's' : ''}. Aim for at least 5 this week to build your problem-solving muscle. Hiring managers look for consistency.`;
    mentorAction = 'Keep Solving'; mentorActionPath = '/problems';
  } else if (quizzesTaken === 0) {
    mentorMessage = `You're solving problems — great! Now test your conceptual knowledge with a quiz. Companies test theory AND coding. Don't leave points on the table.`;
    mentorAction = 'Take a Quiz'; mentorActionPath = '/quiz';
  } else if (completedCourses === 0 && courseProgress.length === 0) {
    mentorMessage = `Problems alone won't get you hired. Enroll in a course to build structured knowledge. SQL for Data Analysis is the best starting point for most data roles.`;
    mentorAction = 'Browse Courses'; mentorActionPath = '/courses';
  } else if (readinessScore >= 75) {
    mentorMessage = `You're ${readinessScore}% interview-ready! Book a mock interview with your mentor to simulate real data analyst interviews and get feedback on your weak spots.`;
    mentorAction = 'Book Mock Interview'; mentorActionPath = '/help';
  } else if (thisWeekSolved > lastWeekSolved && thisWeekSolved > 0) {
    mentorMessage = `You're ${thisWeekSolved - lastWeekSolved} more problem${thisWeekSolved - lastWeekSolved > 1 ? 's' : ''} ahead of last week — momentum is building! Keep this up and you'll be interview-ready in no time.`;
    mentorAction = 'See Your Progress'; mentorActionPath = '/courses';
  } else {
    mentorMessage = `You're at ${readinessScore}% readiness. Focus on completing a course and solving ${Math.max(5 - thisWeekSolved, 1)} more problems this week to level up your interview score.`;
    mentorAction = 'View Courses'; mentorActionPath = '/courses';
  }

  // ── Next recommended problems (by difficulty) ─────────
  const solvedIds = (await all(db, "SELECT problem_id FROM user_problem_submissions WHERE user_id = ? AND status = 'accepted'", [req.user.id])).map(r => r.problem_id);
  const difficulty = totalSolved < 5 ? 'Easy' : totalSolved < 15 ? 'Medium' : 'Hard';
  const nextProblems = await all(db, `SELECT id, title, difficulty, topic, xp_reward FROM problems WHERE difficulty = ? LIMIT 3`, [difficulty]);

  res.json({
    user: { ...user, rank },
    stats: {
      totalSolved, sqlSolved, pythonSolved,
      quizzesTaken, avgQuizPct,
      activeDays, rank,
      thisWeekSolved, lastWeekSolved,
      completedCourses, totalCourses,
      daysSinceActive,
    },
    readiness: { score: readinessScore, stage: prepStage, stageIdx: prepStageIdx },
    mentor: { message: mentorMessage, action: mentorAction, actionPath: mentorActionPath },
    courseProgress,
    nextProblems,
  });
});

router.get('/certificates', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT email, is_premium, premium_expires_at FROM users WHERE id = ?', [req.user.id]);
  const ADMIN_EMAIL = 'ak384837@gmail.com';
  const isPremium = user?.email === ADMIN_EMAIL ||
    (user?.is_premium === 1 && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date()));
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
