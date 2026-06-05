const express = require('express');
const { all, get, run } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

async function seedInterviewExperiences(db) {
  const seeds = [
    { id:'ie-001', author:'Priya Nair', company:'Flipkart', role:'Data Analyst', type:'Off-campus', diff:'Hard', outcome:'Selected', rounds:4, date:'2024-03', upvotes:18,
      rounds_detail: JSON.stringify([
        {round_name:'Online Assessment',description:'HackerRank — 3 SQL problems (window functions, CTEs) + 10 aptitude MCQs in 90 minutes. The window function problem asked for running revenue totals.'},
        {round_name:'Technical SQL Round',description:'60-minute deep dive. Wrote a query for month-over-month GMV growth using LAG(). Also asked about query optimisation — when to use indexes vs CTEs.'},
        {round_name:'Python & Analytics Round',description:'Built a cohort retention table using Pandas. Then a case study: app GMV dropped 18% — diagnose the funnel. I used DAU, session length, cart abandon rate to structure my answer.'},
        {round_name:'Hiring Manager',description:'Product sense + metrics design. "How would you measure success of Flipkart Plus?" Discussed north star metrics vs leading indicators. Very conversational.'},
      ]),
      overall:'Flipkart has a high SQL bar. The preparation time I spent on window functions paid off heavily. The most important thing was structuring case study answers clearly — define the metric, segment the data, diagnose. Overall a great process and the team was welcoming throughout.',
      tips:'Practice RANK(), DENSE_RANK(), LAG(), LEAD() daily. Study Flipkart Big Billion Days funnel. For case rounds — always start with "what metric am I trying to move?"',
    },
    { id:'ie-002', author:'Rahul Mehta', company:'Amazon India', role:'Business Intelligence Engineer', type:'Referral', diff:'Hard', outcome:'Selected', rounds:5, date:'2024-01', upvotes:24,
      rounds_detail: JSON.stringify([
        {round_name:'Recruiter Call',description:'20 minutes — role expectations, SQL + Python + ETL background check. Recruiter explained the 5-round Bar Raiser loop.'},
        {round_name:'Online Assessment',description:'75 minutes on HackerRank. Two problems: advanced SQL with partitioned ranking and a Pandas problem on data cleaning with missing values. LeetCode Medium difficulty.'},
        {round_name:'Technical SQL & Data Modeling',description:'Star schema vs snowflake trade-offs, 7-day rolling average query, handling NULLs in outer joins. Prime vs non-Prime purchase frequency analysis.'},
        {round_name:'Technical Python & ETL',description:'Design an ETL pipeline for a reporting dashboard: S3 → Glue → Redshift. Wrote Python to detect SLA breaches. Basic AWS knowledge helped a lot here.'},
        {round_name:'Bar Raiser',description:'40 minutes of deep behavioral probing on Leadership Principles. STAR format, every answer pushed 4-5 levels deep. "What exactly was YOUR contribution vs team?" Make-or-break round.'},
      ]),
      overall:'Amazon is genuinely the hardest interview process I went through. The Bar Raiser round was intense — they push until you run out of details. My advice: spend 40% of prep time on LP stories, not just SQL. The technical bar is high but manageable. LP answers need real numbers and genuine ownership.',
      tips:'Prepare 2-3 STAR stories per Leadership Principle with exact metrics. Customer Obsession, Dive Deep, and Ownership come up most. Know star schema vs snowflake cold. Even basic AWS (S3, Glue, Redshift) differentiates candidates.',
    },
    { id:'ie-003', author:'Anjali Reddy', company:'Swiggy', role:'Product Analyst', type:'Off-campus', diff:'Medium', outcome:'Selected', rounds:3, date:'2024-04', upvotes:15,
      rounds_detail: JSON.stringify([
        {round_name:'SQL Online Test',description:'45 minutes, 4 questions: restaurant repeat order rate, 7-day rolling AOV by city, delivery partner efficiency flag (>20% above city median), customer churn using LAG. All window functions or aggregations.'},
        {round_name:'Take-Home Assignment',description:'Swiggy gave an anonymised 50k-row orders dataset — 3 days to analyse. I used Python + Seaborn for EDA, found top 5 underperforming cities by repeat rate, modelled demand forecasting features. Submitted a Jupyter notebook + slide deck.'},
        {round_name:'Assignment Review',description:'Two interviewers. Data lead went deep on methodology — "why this metric for churn?" "What changes with real-time data?" Product manager asked how I would present insights to non-technical stakeholders. Very engaging.'},
      ]),
      overall:'Swiggy is practical — they want to see how you actually work with data, not just if you can pass tests. The take-home was the real interview. I put 12 hours into it and focused heavily on the storytelling layer — insights and recommendations, not just charts. That made all the difference.',
      tips:'For the take-home: tell a story with your findings. Use a clean slide deck with "so what?" for each insight. The product round tests communication — practice translating SQL results into business recommendations.',
    },
    { id:'ie-004', author:'Karthik Menon', company:'Zomato', role:'Data Analyst', type:'Off-campus', diff:'Medium', outcome:'Selected', rounds:3, date:'2024-02', upvotes:12,
      rounds_detail: JSON.stringify([
        {round_name:'Online Test',description:'SQL + analytical reasoning. 60 minutes. Questions based on restaurant discovery funnel, before/after Gold membership analysis, and a repeat order rate calculation.'},
        {round_name:'Technical Interview',description:'SQL with business context. "Write a query to find impact of Zomato Gold on order frequency" — needed before/after analysis using LAG(). Also discussed how to measure Hyperpure GMV health.'},
        {round_name:'Analytics Manager Round',description:'Metric design. "How would you measure success of Blinkit integration into Zomato?" Discussed north star metrics, leading indicators, and guardrail metrics. Very product-sense focused.'},
      ]),
      overall:'Zomato focuses heavily on real business problems — every question tied directly to their products (Gold, Hyperpure, Blinkit). Knowing their business model inside out was what set me apart. The process was smooth and communication was timely.',
      tips:'Know Zomato full product suite: food delivery, Hyperpure, Blinkit, Zomato Gold. Practice before/after SQL patterns using LAG(). For case rounds, always define the metric before diving into analysis.',
    },
    { id:'ie-005', author:'Sneha Patel', company:'PhonePe', role:'Data Analyst — Payments', type:'Walk-in', diff:'Medium', outcome:'On-hold', rounds:3, date:'2024-05', upvotes:9,
      rounds_detail: JSON.stringify([
        {round_name:'Written Test',description:'45-minute test at their Bangalore office. SQL (5 questions), Python (3 Pandas questions), and 2 payment analytics case studies. Questions on transaction success rates and merchant health scores.'},
        {round_name:'Technical Interview',description:'Fraud detection signals in SQL — velocity checks, device fingerprinting patterns. Difference between precision and recall in a fraud context. When would you prefer one over the other?'},
        {round_name:'Senior Manager Round',description:'Root cause analysis: "UPI success rate dropped 3% this week — walk me through your investigation." I went broad first (all banks, all transaction types, all geographies) then narrowed. They liked the structured approach but the position was paused due to team restructuring.'},
      ]),
      overall:'The walk-in process at PhonePe was surprisingly well-organised. My rejection was non-technical — internal restructuring. The interviewers were sharp and the problems genuinely interesting. If you are into fintech analytics, this is a great company to target.',
      tips:'Understand UPI transaction flow end-to-end. Know fraud detection signals: velocity checks, device fingerprinting, geographic anomalies. For root cause rounds: start broad then narrow with data.',
    },
    { id:'ie-009', author:'Priya Sharma', company:'CRED', role:'Analytics Engineer', type:'LinkedIn', diff:'Hard', outcome:'Selected', rounds:4, date:'2024-03', upvotes:21,
      rounds_detail: JSON.stringify([
        {round_name:'Technical Screen — SQL',description:'90 minutes on HackerRank. Two Hard SQL problems: recursive CTE for org hierarchy reporting chains, and a complex window function on credit score movement over time. Highest bar I have seen.'},
        {round_name:'dbt & Analytics Engineering Round',description:'Given a messy raw data model, I had to design staging, intermediate, and mart layers in dbt. Explain tests, documentation, and how to handle slowly changing dimensions. Knowing dbt deeply was non-negotiable.'},
        {round_name:'Product Analytics Round',description:'Case study: "CRED Coin redemption rate dropped 18% — diagnose." I built a metric tree, identified leading indicators, segmented by coin type and user segment, and wrote a before/after query. The interviewer pushed back on every assumption.'},
        {round_name:'Director Round',description:'Strategic conversation about career goals, building data culture in product teams, and a past project where data directly influenced a business decision. They want strong opinions and business intuition.'},
      ]),
      overall:'CRED has the highest SQL bar in India. The dbt round caught me off-guard — I had to be honest about my gaps and explain how I would learn. They appreciated the honesty. The compensation was the best I received. Demanding work but equally rewarding team.',
      tips:'Practice recursive CTEs until they feel natural. Do at least one real dbt project before interviewing. For product rounds use the metric tree framework: north star → leading indicators → root causes.',
    },
    { id:'ie-010', author:'Rahul Verma', company:'Swiggy', role:'Data Analyst', type:'Off-campus', diff:'Medium', outcome:'Selected', rounds:3, date:'2024-01', upvotes:13,
      rounds_detail: JSON.stringify([
        {round_name:'SQL Online Test',description:'45 minutes, 4 SQL questions: customers who ordered 3+ different cuisines, restaurant repeat order rate, 7-day rolling average of orders per city, restaurants with delivery time >20% above city median.'},
        {round_name:'Take-Home Assignment',description:'Anonymised Swiggy dataset — 3 days. Identify top 5 underperforming cities by repeat order rate, optimal delivery slot for demand, churn prediction feature list. Used Python Pandas + Seaborn, submitted Jupyter notebook + slide deck.'},
        {round_name:'Assignment Review + Culture Round',description:'Data interviewer went deep on methodology. Product interviewer asked how I would present findings to non-technical audience. Culture questions around handling ambiguity.'},
      ]),
      overall:'Swiggy interview is practical — they want to see how you work with data. The take-home was the core. I spent 12 hours on it with real effort on the presentation layer — not just analysis but insights and recommendations.',
      tips:'For the take-home: tell a story with findings. Use dashboard or slide deck. The product round tests whether you can communicate data to non-technical stakeholders.',
    },
    { id:'ie-011', author:'Meena Krishnan', company:'Amazon India', role:'Business Intelligence Engineer', type:'Referral', diff:'Hard', outcome:'Rejected', rounds:5, date:'2023-09', upvotes:19,
      rounds_detail: JSON.stringify([
        {round_name:'Recruiter Call',description:'Standard 20-minute screen. Recruiter explained the 5-round loop and that one round would be with a Bar Raiser from a different team.'},
        {round_name:'Online Assessment',description:'Two coding problems: SQL for 3rd highest salary per department using DENSE_RANK, and Python rolling 7-day retention rate. I missed an edge case on the Python problem.'},
        {round_name:'Technical SQL + Data Modeling',description:'Design a data model for Amazon Prime Video watch history. SQL for finding users who started but did not complete a show in 7 days. Handling NULLs in OUTER JOINs. Felt good about this round.'},
        {round_name:'Bar Raiser — Leadership Principles',description:'The hardest round. Bar Raiser asked deeply probing follow-ups on every STAR answer. I felt unprepared for the level of scrutiny and ran out of specific details on two answers.'},
        {round_name:'Hiring Manager',description:'Discussed past projects and data infrastructure. Manager was impressed technically but mentioned looking for stronger ownership stories — aligned with rejection feedback received later.'},
      ]),
      overall:'I came close — the rejection was around Leadership Principles depth, not technical skills. Amazon evaluates LPs with a completely different intensity. I reapplied 8 months later with much stronger LP stories and cleared. The lesson: prepare behavioral stories with the same rigor as SQL.',
      tips:'Do not underestimate Amazon Leadership Principles. Prepare STAR stories with specific metrics for every principle. The Bar Raiser will probe until you have no more detail — go 4-5 levels deep on every story.',
    },
  ];

  for (const s of seeds) {
    try {
      await run(db,
        `INSERT OR IGNORE INTO interview_experiences
         (id, user_id, author_name, company, role, experience_type, difficulty, outcome,
          rounds, rounds_detail, overall_experience, tips, interview_date, is_approved, upvotes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)`,
        [s.id, 'seed-user', s.author, s.company, s.role, s.type, s.diff, s.outcome,
         s.rounds, s.rounds_detail, s.overall, s.tips, s.date, s.upvotes]
      );
    } catch(e) {}
  }
}

// GET /api/interviews — list all approved experiences; auto-seeds if empty
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;

    // Auto-seed on first call if table is empty
    const countRow = await get(db, 'SELECT COUNT(*) as cnt FROM interview_experiences WHERE user_id = "seed-user"');
    if (!countRow || countRow.cnt === 0) {
      await seedInterviewExperiences(db);
    }

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
