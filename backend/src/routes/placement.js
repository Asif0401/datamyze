const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

async function seedPlacementCompanies(db) {
  const companies = [
    {
      name:'Flipkart', logo:'🛒', color:'#2874F0', industry:'E-commerce', difficulty:'Hard', salary_range:'₹8L–₹18L', success_rate:15,
      roles:['Data Analyst','BI Engineer','Product Analyst'],
      interview_rounds:[
        {round:'Online Assessment',duration:'90 min',desc:'SQL + Python aptitude, 25-30 MCQs covering window functions, GROUP BY, Pandas basics. Conducted on HackerRank.'},
        {round:'Technical Round 1 — SQL',duration:'60 min',desc:'Deep SQL dive: window functions (RANK, DENSE_RANK, LAG, LEAD), CTEs, query optimisation. Real Flipkart-context problems like GMV analysis, seller metrics.'},
        {round:'Technical Round 2 — Python & Case',duration:'60 min',desc:'Python/Pandas coding + a mini case study. Expect cohort retention analysis, funnel drop-off, A/B test result interpretation.'},
        {round:'Hiring Manager — Product Sense',duration:'45 min',desc:'Metric design: "How would you measure Flipkart Plus success?" Discussion on Big Billion Days analytics, business understanding.'},
        {round:'HR Round',duration:'30 min',desc:'Salary negotiation, notice period, culture fit. Research Flipkart\'s leadership principles beforehand.'},
      ],
      key_topics:['Window Functions','CTEs','Query Optimisation','Python Pandas','A/B Testing','Funnel Analysis','Cohort Analysis','Metric Design'],
      prep_tips:[
        'Master RANK(), DENSE_RANK(), ROW_NUMBER(), LAG(), LEAD() — they appear in almost every SQL round.',
        'Understand Flipkart\'s core metrics: GMV, NMV, seller conversion rate, return rate, Big Billion Days traffic.',
        'For the case study: structure your answer as "Define → Measure → Diagnose → Recommend". Show business intuition.',
        'Practice CTEs heavily — Flipkart prefers readable, modular SQL over complex nested subqueries.',
        'Prepare 2-3 data projects where you drove a business decision. Be ready to explain methodology and impact.',
      ],
    },
    {
      name:'Amazon India', logo:'📦', color:'#FF9900', industry:'E-commerce', difficulty:'Hard', salary_range:'₹12L–₹25L', success_rate:12,
      roles:['Business Intelligence Engineer','Data Analyst','Data Engineer'],
      interview_rounds:[
        {round:'Phone Screen',duration:'45 min',desc:'1 SQL problem (typically a window function or complex JOIN) + 1-2 Leadership Principles questions. Sets the tone for all rounds.'},
        {round:'Technical BIE Loop 1',duration:'60 min',desc:'Complex SQL: multi-table JOINs, window functions, query performance. Writing production-quality queries for large datasets.'},
        {round:'Technical BIE Loop 2',duration:'60 min',desc:'Data modelling, dimensional modelling (star/snowflake schema), ETL pipeline design + 1 Python/Pandas problem.'},
        {round:'Bar Raiser Round',duration:'60 min',desc:'Mix of technical + deep behavioral. The Bar Raiser is a senior Amazonian from a different team. LP stories must be STAR format, specific, and data-driven.'},
        {round:'Hiring Manager',duration:'45 min',desc:'Business sense, past impact, career goals. "Tell me about a time you influenced without authority using data."'},
      ],
      key_topics:['Window Functions','Dimensional Modelling','ETL/ELT','Python Pandas','Leadership Principles','SQL Optimisation','Statistical Analysis','Business Metrics'],
      prep_tips:[
        'Prepare STAR-format answers for ALL 16 Leadership Principles — Amazon is non-negotiable on these. Each story needs specific metrics.',
        'Study Amazon\'s data stack: Redshift, S3, Glue, QuickSight. Mention familiarity with columnar storage.',
        'For BIE roles, know dimensional modelling cold: fact vs dimension tables, slowly changing dimensions (SCD Type 2).',
        'The Bar Raiser will push back on your answers — stay calm, be specific, use numbers (e.g. "reduced latency by 40%").',
        'Practice writing SQL on a whiteboard or plain text editor — no auto-complete in interviews.',
      ],
    },
    {
      name:'Swiggy', logo:'🍔', color:'#FC8019', industry:'Food Delivery', difficulty:'Hard', salary_range:'₹10L–₹20L', success_rate:18,
      roles:['Data Analyst','Product Analyst','Business Analyst'],
      interview_rounds:[
        {round:'Online Test',duration:'60 min',desc:'SQL questions (JOINs, aggregations, basic window functions) + logical reasoning. 20-25 questions.'},
        {round:'Technical Round 1',duration:'60 min',desc:'SQL deep dive + data interpretation. Expect questions on delivery time analysis, restaurant churn, surge pricing logic.'},
        {round:'Take-Home Assignment',duration:'3-4 days',desc:'A real Swiggy dataset (anonymised). You\'ll do EDA, find key insights, build a dashboard or visualisation, and present recommendations.'},
        {round:'Assignment Presentation',duration:'45 min',desc:'Walk through your take-home analysis. Be ready to defend every decision — why this metric, why this chart type, what are the caveats.'},
        {round:'Hiring Manager — Culture',duration:'30 min',desc:'Swiggy moves fast. They want problem-solvers who communicate clearly and handle ambiguity well.'},
      ],
      key_topics:['SQL Aggregations','Delivery Metrics','Cohort Analysis','Python EDA','Data Visualisation','Surge Pricing Logic','Funnel Analysis','Business Problem Solving'],
      prep_tips:[
        'The take-home is the most important round. Show storytelling ability — don\'t just show numbers, explain "so what?"',
        'Know Swiggy\'s business: hyperlocal delivery, dark stores (Instamart), restaurant onboarding metrics, delivery partner efficiency.',
        'For delivery analytics: understand SLA breach, delivery time percentiles (P50/P90/P99), surge multiplier logic.',
        'Use Python (Pandas + Matplotlib/Seaborn) for the take-home — Jupyter Notebook format is expected.',
        'Prepare cohort retention and repeat order rate analysis — these are Swiggy\'s bread and butter metrics.',
      ],
    },
    {
      name:'Zomato', logo:'🍕', color:'#E23744', industry:'Food Delivery', difficulty:'Hard', salary_range:'₹8L–₹16L', success_rate:20,
      roles:['Data Analyst','Analytics Manager Trainee','Product Analyst'],
      interview_rounds:[
        {round:'Online Assessment',duration:'60 min',desc:'SQL + analytical reasoning. Questions are often based on restaurant discovery, food delivery funnels, or Gold membership analysis.'},
        {round:'Technical Interview',duration:'60 min',desc:'SQL with business context: "Write a query to find the impact of Zomato Gold on order frequency." Expect before/after analysis patterns.'},
        {round:'Analytical Case Study',duration:'45 min',desc:'Given a business scenario (e.g. "Zomato Hyperpure GMV declined 10% — diagnose"), structure a data-driven investigation.'},
        {round:'Final / Managerial Round',duration:'45 min',desc:'Metric design, north star metric discussion, product understanding. "How would you measure success of Blinkit integration?"'},
      ],
      key_topics:['Before/After SQL Analysis','Metric Design','Funnel Analysis','North Star Metrics','Python Pandas','A/B Testing','Restaurant Analytics','Cohort Analysis'],
      prep_tips:[
        'Understand Zomato\'s full product suite: food delivery, Hyperpure (B2B supplies), Blinkit (quick commerce), Zomato Gold.',
        'Practice "before vs after" SQL patterns using LAG() — Zomato loves measuring impact of feature launches.',
        'For case studies: always start with "what metric am I trying to move?" before diving into analysis.',
        'Know the difference between leading and lagging indicators — Zomato interviews heavily on metric design frameworks.',
        'Blinkit acquisition is a hot topic — study quick commerce metrics: inventory turns, slot availability, 10-min delivery SLA.',
      ],
    },
    {
      name:'PhonePe', logo:'💸', color:'#5F259F', industry:'Fintech', difficulty:'Hard', salary_range:'₹9L–₹18L', success_rate:15,
      roles:['Data Analyst','Product Analyst','Risk Analyst'],
      interview_rounds:[
        {round:'Written Test',duration:'45 min',desc:'SQL + basic stats (probability, distributions). Fintech-specific: transaction success rates, payment failure analysis.'},
        {round:'Technical Round 1',duration:'60 min',desc:'SQL: complex queries on transaction data — fraud detection signals, bank success rates, UPI transaction funnel.'},
        {round:'Technical Round 2',duration:'60 min',desc:'Statistics + Python: hypothesis testing, A/B test analysis, time series anomaly detection on payment volumes.'},
        {round:'Senior Manager Round',duration:'45 min',desc:'Root cause analysis of business problems: "UPI success rate dropped 3% this week — walk me through your investigation."'},
      ],
      key_topics:['Payment Analytics','Fraud Detection','SQL Window Functions','Statistical Testing','Time Series Analysis','UPI Transaction Flow','Risk Metrics','Python Pandas'],
      prep_tips:[
        'Understand UPI transaction flow end-to-end: initiation, bank routing, settlement. Know what causes failures at each step.',
        'Study fraud detection signals: velocity checks (too many txns in X min), device fingerprinting, geographic anomalies.',
        'PhonePe asks about precision vs recall in fraud context — know when you prefer one over the other.',
        'For the root cause round: always start broad (all banks, all transaction types) then narrow down — show structured thinking.',
        'Know basic payment regulations: RBI guidelines, PCI DSS, UPI interchange fees. Shows genuine fintech interest.',
      ],
    },
    {
      name:'Razorpay', logo:'💳', color:'#2962FF', industry:'Fintech', difficulty:'Hard', salary_range:'₹12L–₹22L', success_rate:13,
      roles:['Data Analyst','Analytics Engineer','Product Analyst'],
      interview_rounds:[
        {round:'Online Screening',duration:'60 min',desc:'SQL + Python on HackerRank. Latency analysis (percentiles), merchant activation funnel queries.'},
        {round:'Technical Round 1',duration:'60 min',desc:'Advanced SQL: P50/P90/P99 latency calculation, chargeback rate analysis, payment gateway performance metrics.'},
        {round:'Technical Round 2',duration:'60 min',desc:'Python + data modelling: ETL pipeline design, dbt concepts, analytical engineering patterns.'},
        {round:'Case Study Round',duration:'45 min',desc:'"Smart routing reduced success rates instead of improving them — diagnose." A/B test analysis + causal reasoning.'},
        {round:'Leadership & Culture',duration:'30 min',desc:'High-ownership culture. They want people who identify problems proactively and ship fast.'},
      ],
      key_topics:['Payment Latency (P99)','Chargeback Analysis','SQL Percentiles','dbt/Analytical Engineering','A/B Testing','Python ETL','Merchant Metrics','Statistical Significance'],
      prep_tips:[
        'Master percentile calculations: PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms). P99 SLA violations are a core Razorpay metric.',
        'Study dbt fundamentals: staging → intermediate → mart layers. Razorpay has shifted heavily to analytical engineering.',
        'Understand payment routing: how acquirer selection works, why switching acquirers improves success rates.',
        'For A/B tests: know how to calculate statistical significance, lift, and minimum detectable effect (MDE).',
        'PCI DSS and RBI regulations come up — at least know what they govern (card data security, payment processing rules).',
      ],
    },
    {
      name:'Meesho', logo:'🛍️', color:'#8B5CF6', industry:'Social Commerce', difficulty:'Medium', salary_range:'₹7L–₹14L', success_rate:25,
      roles:['Data Analyst','Growth Analyst','Business Analyst'],
      interview_rounds:[
        {round:'Online Test',duration:'45 min',desc:'SQL + basic analytical questions. Focus on e-commerce metrics: GMV, reseller activation, return rates.'},
        {round:'Technical Interview',duration:'60 min',desc:'SQL on reseller data: viral coefficient, activation funnels, Tier-2 city penetration analysis.'},
        {round:'Case Study',duration:'30 min',desc:'Meesho-specific problem: "Return abuse is rising — how do you identify and handle it?" Structured thinking expected.'},
        {round:'Culture & HR Round',duration:'30 min',desc:'Meesho values speed and frugality. Show you can work with ambiguity and ship fast with limited resources.'},
      ],
      key_topics:['Reseller Analytics','Viral Coefficient','Tier-2 City Metrics','Return Abuse Detection','SQL Aggregations','Growth Analytics','Funnel Analysis','Cost Efficiency Metrics'],
      prep_tips:[
        'Understand Meesho\'s unique model: resellers share products on WhatsApp/Facebook and earn margins. The data model is very different from B2C.',
        'Viral coefficient K = (invites sent per user) × (conversion rate). If K > 1, growth is viral. Practice calculating this.',
        'Tier-2/3 city penetration is central — know how to segment by city tier and compare category adoption rates.',
        'Return abuse is a top concern: users with >60% return rate over 90 days with 10+ orders. Practice flagging this in SQL.',
        'Meesho is frugal — in case studies, always suggest the lowest-cost solution that achieves the goal.',
      ],
    },
    {
      name:'CRED', logo:'💎', color:'#00C853', industry:'Fintech', difficulty:'Hard', salary_range:'₹14L–₹28L', success_rate:10,
      roles:['Analytics Engineer','Data Analyst','Product Analyst'],
      interview_rounds:[
        {round:'Technical Screen',duration:'60 min',desc:'Advanced SQL: recursive CTEs, complex window functions, query performance. CRED\'s bar is very high — expect Hard-level questions.'},
        {round:'Analytics Engineering Round',duration:'60 min',desc:'dbt project review (or design one): staging models, testing, documentation. Data modelling principles for credit/rewards data.'},
        {round:'Product Analytics Round',duration:'60 min',desc:'Deep product sense + data: "How would you measure CRED\'s coin redemption health?" North star metrics, leading indicators.'},
        {round:'System Design (Data)',duration:'45 min',desc:'Design an event tracking pipeline for CRED\'s Jackpot feature. Handle scale, idempotency, and late-arriving events.'},
        {round:'Director Round',duration:'30 min',desc:'Strategic thinking, past high-impact work, how you handle ambiguity in a fast-moving product.'},
      ],
      key_topics:['dbt & Analytical Engineering','Recursive CTEs','Credit Score Analytics','Coin/Reward Metrics','Data Pipeline Design','Python Advanced','Statistical Testing','Product Metric Design'],
      prep_tips:[
        'CRED has the highest SQL bar in India — practice recursive CTEs, complex window functions, and query optimisation daily.',
        'Learn dbt deeply: models, tests, docs, snapshots, macros. CRED has one of India\'s most mature dbt implementations.',
        'Understand credit score segmentation: behaviour differs drastically between <650, 650-750, 750-800, 800+ segments.',
        'CRED\'s coin ecosystem is complex: coins earned → redeemed → purchase_completed funnel. Know how to measure each step.',
        'For system design: focus on idempotency, event deduplication, and late-data handling in Kafka/Flink pipelines.',
      ],
    },
    {
      name:'Dream11', logo:'🏏', color:'#1A73E8', industry:'Gaming', difficulty:'Medium', salary_range:'₹8L–₹16L', success_rate:22,
      roles:['Data Analyst','Product Analyst','Growth Analyst'],
      interview_rounds:[
        {round:'Online Assessment',duration:'60 min',desc:'SQL + Python. Fantasy sports context: team selection analysis, contest entry patterns, player point distributions.'},
        {round:'Technical Round 1',duration:'60 min',desc:'SQL: team duplication rate, captain/VC selection bias, ARPU by match format (T20 vs ODI vs Test).'},
        {round:'Technical Round 2',duration:'45 min',desc:'Python optimisation problem: "Build an optimal Dream11 team within ₹100 credit budget." Linear programming or greedy approach.'},
        {round:'Product & Culture Round',duration:'30 min',desc:'Product instinct, user behaviour understanding. How would you improve Dream11\'s retention during off-season?'},
      ],
      key_topics:['Fantasy Sports Metrics','SQL Aggregations','Python Optimisation','User Retention','ARPU Analysis','Team Duplication Detection','PuLP Linear Programming','Contest Analytics'],
      prep_tips:[
        'Understand fantasy sports fundamentals: captain (2x points) and VC (1.5x) selection, salary-cap constraints, differential picks.',
        'Practice the team optimiser problem: given player salary and predicted points, maximise total points within ₹100 budget using PuLP or greedy.',
        'Dream11\'s key metrics: ARPU per match, contest fill rate, team duplication rate (high duplication = low differentiation = bad product).',
        'Off-season retention is a top challenge — prepare ideas around non-cricket content (football, kabaddi) and streak-based rewards.',
        'Contest pricing strategy matters: they have multiple price points (₹9 to ₹5000 contests). Know how to segment users by willingness to pay.',
      ],
    },
    {
      name:'Walmart Global Tech', logo:'🏪', color:'#0071CE', industry:'Retail', difficulty:'Hard', salary_range:'₹10L–₹22L', success_rate:14,
      roles:['Data Analyst','Business Intelligence Engineer','Data Scientist'],
      interview_rounds:[
        {round:'HackerRank Screen',duration:'90 min',desc:'SQL + Python. Retail context: inventory management, demand forecasting accuracy, supplier performance.'},
        {round:'Technical Round 1 — SQL/Python',duration:'60 min',desc:'Advanced SQL: inventory turnover ratio, demand forecast MAPE, store performance benchmarking with composite scores.'},
        {round:'Technical Round 2 — ML/Stats',duration:'60 min',desc:'Statistics + ML: demand forecasting (ARIMA, Prophet), market basket analysis (Apriori), store clustering.'},
        {round:'Case Study — Supply Chain',duration:'45 min',desc:'"A supplier delayed shipment by 2 weeks. Model the downstream stockout impact." Quantification + stakeholder communication.'},
        {round:'Hiring Manager',duration:'30 min',desc:'Scale focus: Walmart processes petabytes daily. Show you can think at scale — partitioning, indexing, distributed computing.'},
      ],
      key_topics:['Inventory Analytics','Demand Forecasting','Market Basket Analysis','SQL at Scale','Python ML (scikit-learn)','Apriori Algorithm','Supply Chain Metrics','Store Performance'],
      prep_tips:[
        'Inventory turnover = COGS / avg_inventory. Anything < 2 is slow-moving. Know how to calculate this by category and quarter.',
        'MAPE (Mean Absolute Percentage Error) is Walmart\'s primary forecast accuracy metric. Practice implementing it in both SQL and Python.',
        'Market basket analysis: implement Apriori using mlxtend. Know support, confidence, and lift — lift > 1 means items are complementary.',
        'Walmart operates at massive scale — always mention partitioning, indexing, and caching when discussing query performance.',
        'Understand shrinkage (theft/damage/admin error). It\'s a major retail KPI: shrinkage = (expected - actual inventory).',
      ],
    },
  ];

  for (const co of companies) {
    try {
      await run(db,
        `INSERT OR IGNORE INTO placement_companies (id,name,logo,color,industry,difficulty,salary_range,success_rate,roles,interview_rounds,key_topics,prep_tips) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [uuidv4(), co.name, co.logo, co.color, co.industry, co.difficulty, co.salary_range, co.success_rate,
         JSON.stringify(co.roles), JSON.stringify(co.interview_rounds), JSON.stringify(co.key_topics), JSON.stringify(co.prep_tips)]
      );
    } catch(e) {}
  }
}

// GET / — list all active companies (auth + premium required)
router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
    if (!isAdmin && !user?.is_premium) {
      return res.status(403).json({ error: 'Premium membership required', premium_required: true });
    }

    // Ensure table exists + auto-seed if empty
    await run(db, `CREATE TABLE IF NOT EXISTS placement_companies (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT DEFAULT '🏢',
      color TEXT DEFAULT '#4A90D9', industry TEXT DEFAULT 'Technology',
      roles TEXT DEFAULT '[]', difficulty TEXT DEFAULT 'Hard',
      interview_rounds TEXT DEFAULT '[]', key_topics TEXT DEFAULT '[]',
      prep_tips TEXT DEFAULT '[]', salary_range TEXT DEFAULT NULL,
      success_rate INTEGER DEFAULT 20, is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`);

    let companies = await all(db, 'SELECT * FROM placement_companies WHERE is_active = 1 ORDER BY name ASC', []);
    if (companies.length === 0) {
      await seedPlacementCompanies(db);
      companies = await all(db, 'SELECT * FROM placement_companies WHERE is_active = 1 ORDER BY name ASC', []);
    }

    res.json({
      companies: companies.map(co => ({
        ...co,
        roles: JSON.parse(co.roles || '[]'),
        interview_rounds: JSON.parse(co.interview_rounds || '[]'),
        key_topics: JSON.parse(co.key_topics || '[]'),
        prep_tips: JSON.parse(co.prep_tips || '[]'),
      })),
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /:id — get full company detail (auth + premium required)
router.get('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin && !user?.is_premium) {
    return res.status(403).json({ error: 'Premium membership required', premium_required: true });
  }

  const co = await get(db, 'SELECT * FROM placement_companies WHERE id = ? AND is_active = 1', [req.params.id]);
  if (!co) return res.status(404).json({ error: 'Company not found' });

  res.json({
    company: {
      ...co,
      roles: JSON.parse(co.roles || '[]'),
      interview_rounds: JSON.parse(co.interview_rounds || '[]'),
      key_topics: JSON.parse(co.key_topics || '[]'),
      prep_tips: JSON.parse(co.prep_tips || '[]'),
    },
  });
});

// Admin POST / — add company
router.post('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

  const { name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const id = uuidv4();
  await run(db,
    `INSERT INTO placement_companies (id, name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, logo || '🏢', color || '#4A90D9', industry || 'Technology',
     JSON.stringify(roles || []), difficulty || 'Hard',
     JSON.stringify(interview_rounds || []), JSON.stringify(key_topics || []),
     JSON.stringify(prep_tips || []), salary_range || null, success_rate || 20],
  );

  res.json({ success: true, id });
});

// Admin PUT /:id — update company
router.put('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

  const { name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate, is_active } = req.body;
  await run(db,
    `UPDATE placement_companies SET
       name=?, logo=?, color=?, industry=?, roles=?, difficulty=?,
       interview_rounds=?, key_topics=?, prep_tips=?, salary_range=?, success_rate=?, is_active=?
     WHERE id=?`,
    [name, logo, color, industry,
     JSON.stringify(roles || []), difficulty,
     JSON.stringify(interview_rounds || []), JSON.stringify(key_topics || []),
     JSON.stringify(prep_tips || []), salary_range, success_rate,
     is_active !== undefined ? is_active : 1,
     req.params.id],
  );

  res.json({ success: true });
});

module.exports = router;
