const { createClient } = require('@libsql/client');
const { v4: uuidv4 } = require('uuid');

let client;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function run(db, sql, params = []) {
  await getClient().execute({ sql, args: params });
}

async function get(db, sql, params = []) {
  const result = await getClient().execute({ sql, args: params });
  return result.rows[0] || undefined;
}

async function all(db, sql, params = []) {
  const result = await getClient().execute({ sql, args: params });
  return result.rows;
}

async function initDb() {
  const c = getClient();

  await c.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_active TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '📊',
      color TEXT DEFAULT '#7F77DD',
      difficulty TEXT DEFAULT 'Beginner',
      duration TEXT,
      total_lessons INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      video_url TEXT,
      order_index INTEGER DEFAULT 0,
      duration_minutes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migration: add video_url to existing databases that predate this column
  try { await c.execute('ALTER TABLE lessons ADD COLUMN video_url TEXT'); } catch (e) {}

  await c.execute(`
    CREATE TABLE IF NOT EXISTS user_course_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      progress_percent INTEGER DEFAULT 0,
      completed_lessons TEXT DEFAULT '[]',
      completed_at TEXT,
      enrolled_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id)
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Easy',
      topic TEXT DEFAULT 'SQL',
      starter_code TEXT,
      acceptance_rate INTEGER DEFAULT 75,
      xp_reward INTEGER DEFAULT 50,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS user_problem_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      submitted_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      course_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS user_quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      attempted_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      issued_at TEXT DEFAULT (datetime('now')),
      credential_id TEXT UNIQUE NOT NULL,
      UNIQUE(user_id, course_id)
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS daily_streaks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      activity_count INTEGER DEFAULT 1,
      UNIQUE(user_id, date)
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS premium_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER DEFAULT 99,
      utr_number TEXT,
      status TEXT DEFAULT 'pending',
      activated_at TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS job_listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      type TEXT DEFAULT 'Full-time',
      salary TEXT,
      skills TEXT DEFAULT '[]',
      url TEXT NOT NULL,
      source TEXT DEFAULT 'LinkedIn',
      is_active INTEGER DEFAULT 1,
      posted_days_ago INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS session_bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      topic TEXT,
      status TEXT DEFAULT 'pending',
      meeting_link TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS resume_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      linkedin_url TEXT,
      job_target TEXT,
      experience_years INTEGER DEFAULT 0,
      current_role TEXT,
      status TEXT DEFAULT 'pending',
      feedback TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migrations for quiz tables
  try { await c.execute('ALTER TABLE quiz_questions ADD COLUMN course_id TEXT'); } catch(e) {}
  try { await c.execute("ALTER TABLE quiz_questions ADD COLUMN topic TEXT DEFAULT 'General'"); } catch(e) {}
  try { await c.execute('ALTER TABLE quizzes ADD COLUMN course_id TEXT'); } catch(e) {}

  // Migrations for users table
  try { await c.execute('ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN premium_expires_at TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE resume_reviews ADD COLUMN resume_filename TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE resume_reviews ADD COLUMN resume_original TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE premium_subscriptions ADD COLUMN receipt_filename TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE premium_subscriptions ADD COLUMN receipt_original TEXT'); } catch(e) {}

  // Profile / settings migrations
  try { await c.execute('ALTER TABLE users ADD COLUMN phone TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN bio TEXT'); } catch(e) {}
  try { await c.execute("ALTER TABLE users ADD COLUMN location TEXT"); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN website TEXT'); } catch(e) {}
  try { await c.execute("ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT '#4A90D9'"); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN job_title TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN company TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN linkedin_url TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN github_url TEXT'); } catch(e) {}
  try { await c.execute("ALTER TABLE users ADD COLUMN experience_years TEXT DEFAULT ''"); } catch(e) {}
  try { await c.execute("ALTER TABLE users ADD COLUMN skills TEXT DEFAULT '[]'"); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN education TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN target_role TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN avatar_url TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN profile_completed INTEGER DEFAULT 0'); } catch(e) {}
  // Mark all pre-existing users (registered before ProfileCompletion feature) as complete
  // so they don't get the onboarding popup and don't show as Incomplete in admin.
  // Must check IS NULL too — Turso returns NULL (not 0) for rows that existed before the column was added.
  try { await c.execute("UPDATE users SET profile_completed = 1 WHERE (profile_completed IS NULL OR profile_completed = 0) AND name IS NOT NULL AND name != ''"); } catch(e) {}
  try { await c.execute('ALTER TABLE courses ADD COLUMN is_coming_soon INTEGER DEFAULT 0'); } catch(e) {}
  try { await c.execute('ALTER TABLE problems ADD COLUMN hint TEXT'); } catch(e) {}
  try { await c.execute("UPDATE problems SET starter_code = '' WHERE starter_code IS NOT NULL"); } catch(e) {}

  // Replace Dashboard Design with Tableau & Power BI courses
  try {
    await c.execute(`UPDATE courses SET title='Tableau for Analysts', description='Build interactive dashboards and data stories using Tableau Desktop and Tableau Public.', icon='📊', color='#E8762D', duration='6h', total_lessons=4 WHERE title='Dashboard Design'`);
  } catch(e) {}
  try {
    const pbi = await c.execute(`SELECT id FROM courses WHERE title='Power BI'`);
    if (!pbi.rows.length) {
      await c.execute({ sql: `INSERT INTO courses (id, title, description, icon, color, difficulty, duration, total_lessons) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, args: [uuidv4(), 'Power BI', 'Create stunning reports and dashboards with Microsoft Power BI — from data modeling to DAX.', '💡', '#F2C811', 'Beginner', '6h', 4] });
    }
  } catch(e) {}

  // OTP table for signup & phone login verification
  await c.execute(`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT DEFAULT 'email',
      purpose TEXT DEFAULT 'signup',
      verified INTEGER DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS mock_interviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      interview_type TEXT DEFAULT 'SQL Technical',
      difficulty TEXT DEFAULT 'Medium',
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      meeting_link TEXT,
      feedback TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Live session poll
  await c.execute(`
    CREATE TABLE IF NOT EXISTS live_session_polls (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      voted_at TEXT DEFAULT (datetime('now')),
      UNIQUE(course_id, user_id)
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS case_studies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      company_logo TEXT DEFAULT '🏢',
      difficulty TEXT DEFAULT 'Medium',
      tags TEXT DEFAULT '[]',
      summary TEXT,
      problem TEXT,
      data_overview TEXT,
      approach TEXT,
      key_insights TEXT,
      outcome TEXT,
      is_free INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('✅ Database ready');
  return null;
}

module.exports = { initDb, run, get, all };
