const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../dataquest.db');

let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Auto-save every 5 seconds
setInterval(saveDb, 5000);
process.on('exit', saveDb);
process.on('SIGINT', () => { saveDb(); process.exit(); });

function run(db, sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function get(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

function all(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function initDb() {
  const database = await getDb();

  database.run(`
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

  database.run(`
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

  database.run(`
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
  try { database.run('ALTER TABLE lessons ADD COLUMN video_url TEXT'); } catch (e) {}

  database.run(`
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

  database.run(`
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

  database.run(`
    CREATE TABLE IF NOT EXISTS user_problem_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      submitted_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      course_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
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

  database.run(`
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

  database.run(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      issued_at TEXT DEFAULT (datetime('now')),
      credential_id TEXT UNIQUE NOT NULL,
      UNIQUE(user_id, course_id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS daily_streaks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      activity_count INTEGER DEFAULT 1,
      UNIQUE(user_id, date)
    )
  `);

  database.run(`
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

  database.run(`
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

  database.run(`
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

  database.run(`
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
  try { database.run('ALTER TABLE quiz_questions ADD COLUMN course_id TEXT'); } catch(e) {}
  try { database.run("ALTER TABLE quiz_questions ADD COLUMN topic TEXT DEFAULT 'General'"); } catch(e) {}
  try { database.run('ALTER TABLE quizzes ADD COLUMN course_id TEXT'); } catch(e) {}

  // Migrations for users table
  try { database.run('ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN premium_expires_at TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE resume_reviews ADD COLUMN resume_filename TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE resume_reviews ADD COLUMN resume_original TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE premium_subscriptions ADD COLUMN receipt_filename TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE premium_subscriptions ADD COLUMN receipt_original TEXT'); } catch(e) {}

  // Profile / settings migrations
  try { database.run('ALTER TABLE users ADD COLUMN phone TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN bio TEXT'); } catch(e) {}
  try { database.run("ALTER TABLE users ADD COLUMN location TEXT"); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN website TEXT'); } catch(e) {}
  try { database.run("ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT '#4A90D9'"); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN job_title TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN company TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN linkedin_url TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN github_url TEXT'); } catch(e) {}
  try { database.run("ALTER TABLE users ADD COLUMN experience_years TEXT DEFAULT ''"); } catch(e) {}
  try { database.run("ALTER TABLE users ADD COLUMN skills TEXT DEFAULT '[]'"); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN education TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN target_role TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN avatar_url TEXT'); } catch(e) {}
  try { database.run('ALTER TABLE users ADD COLUMN profile_completed INTEGER DEFAULT 0'); } catch(e) {}
  try { database.run('ALTER TABLE courses ADD COLUMN is_coming_soon INTEGER DEFAULT 0'); } catch(e) {}

  // OTP table for signup & phone login verification
  database.run(`
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

  database.run(`
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
  database.run(`
    CREATE TABLE IF NOT EXISTS live_session_polls (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      voted_at TEXT DEFAULT (datetime('now')),
      UNIQUE(course_id, user_id)
    )
  `);

  database.run(`
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

  saveDb();
  console.log('✅ Database ready');
  return database;
}

module.exports = { getDb, initDb, run, get, all, saveDb };
