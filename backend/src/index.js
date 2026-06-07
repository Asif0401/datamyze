require('dotenv').config();
// Render env vars to set:
//   ADZUNA_APP_ID=080e69d1
//   ADZUNA_APP_KEY=2e216e236eb756fc8d4cb45bf866b412
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');
const { seed, seedVideos, seedJobs, seedComingSoonCourses, seedCaseStudies } = require('./db/seed');
const { seedLessonsV2 } = require('./db/seedLessonsV2');
const { seedProblems } = require('./db/seedProblems');
const { seedQuizV2 } = require('./db/seedQuizV2');

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost',                 // Capacitor Android WebView
  'capacitor://localhost',            // Capacitor iOS WebView
  process.env.FRONTEND_URL,          // e.g. https://datamyze.vercel.app
  process.env.FRONTEND_URL_CUSTOM,   // e.g. https://datamyze.in
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Cashfree webhook ─ MUST be before express.json() to get raw body ──
app.post('/api/premium/cashfree/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const { Cashfree, CFEnvironment } = require('cashfree-pg');
    const { v4: uuidv4 } = require('uuid');
    const cfEnv = process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
    const cf = new Cashfree(cfEnv, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody   = req.body.toString('utf8');

    // Throws if signature invalid
    const event = cf.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    const parsed = typeof event === 'string' ? JSON.parse(event) : event;

    const paymentStatus = parsed?.data?.payment?.payment_status;
    const orderId       = parsed?.data?.order?.order_id;

    if (paymentStatus === 'SUCCESS' && orderId) {
      const db = app.locals.db;
      if (db !== undefined) {
        const { run, get, all } = require('./db/database');
        const sub = await get(db, "SELECT * FROM premium_subscriptions WHERE utr_number = ?", [orderId]);
        if (sub && sub.status !== 'active') {
          const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          await run(db, "UPDATE premium_subscriptions SET status='active', activated_at=datetime('now'), expires_at=? WHERE utr_number=?",
            [expiresAt, orderId]);
          await run(db, 'UPDATE users SET is_premium=1, premium_expires_at=? WHERE id=?', [expiresAt, sub.user_id]);

          // Grant any pending certificates for completed courses
          const completed = await all(db,
            "SELECT course_id FROM user_course_progress WHERE user_id = ? AND progress_percent = 100",
            [sub.user_id]);
          for (const row of completed) {
            const existing = await get(db, 'SELECT id FROM certificates WHERE user_id = ? AND course_id = ?', [sub.user_id, row.course_id]);
            if (!existing) {
              const credId = 'DQ-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
              try {
                await run(db, 'INSERT INTO certificates (id, user_id, course_id, credential_id) VALUES (?, ?, ?, ?)',
                  [uuidv4(), sub.user_id, row.course_id, credId]);
                await run(db, 'UPDATE users SET xp = xp + 500 WHERE id = ?', [sub.user_id]);
              } catch (e) {}
            }
          }

          console.log(`✅ Cashfree webhook: premium activated for user ${sub.user_id} (order ${orderId})`);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Cashfree webhook error:', err.message);
    // Still return 200 so Cashfree doesn't retry endlessly on invalid sig
    res.status(200).json({ status: 'ignored' });
  }
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

(async () => {
  const database = await initDb();
  await seed(database);
  await seedVideos(database);
  await seedJobs(database);
  await seedLessonsV2(database);
  await seedProblems(database);
  await seedComingSoonCourses(database);
  await seedCaseStudies(database);
  await seedQuizV2(database);
  app.locals.db = database;

  app.use('/api/auth',     require('./routes/auth'));
  app.use('/api/courses',  require('./routes/courses'));
  app.use('/api/problems', require('./routes/problems'));
  app.use('/api/quiz',     require('./routes/quiz'));
  app.use('/api/users',    require('./routes/users'));
  app.use('/api/admin',    require('./routes/admin'));
  app.use('/api/premium', require('./routes/premium'));
  app.use('/api/jobs',    require('./routes/jobs'));
  app.use('/api/case-studies',  require('./routes/casestudies'));
  app.use('/api/support',       require('./routes/support'));
  app.use('/api/interviews',    require('./routes/interviews'));


  app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), payment_amount: 199, version: 'v3-fixed' }));
  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

  app.listen(PORT, () => console.log(`🚀 DataLift API → http://localhost:${PORT}`));
})();
