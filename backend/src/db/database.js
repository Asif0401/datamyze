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
  try { await c.execute("UPDATE users SET profile_completed = 1 WHERE (profile_completed IS NULL OR profile_completed = 0) AND name IS NOT NULL AND name != ''"); } catch(e) {}
  // Onboarding fields
  try { await c.execute('ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN skill_level TEXT DEFAULT NULL'); } catch(e) {}
  try { await c.execute('ALTER TABLE users ADD COLUMN learning_goal TEXT DEFAULT NULL'); } catch(e) {}
  // Mark existing users as already onboarded so they don't see it
  try { await c.execute("UPDATE users SET onboarding_completed = 1 WHERE (onboarding_completed IS NULL OR onboarding_completed = 0) AND profile_completed = 1"); } catch(e) {}
  try { await c.execute('ALTER TABLE courses ADD COLUMN is_coming_soon INTEGER DEFAULT 0'); } catch(e) {}
  try { await c.execute('ALTER TABLE problems ADD COLUMN hint TEXT'); } catch(e) {}
  try { await c.execute('ALTER TABLE problems ADD COLUMN table_schema TEXT DEFAULT NULL'); } catch(e) {}
  try { await c.execute('ALTER TABLE problems ADD COLUMN examples TEXT DEFAULT NULL'); } catch(e) {}
  try { await c.execute('ALTER TABLE problems ADD COLUMN constraints_list TEXT DEFAULT NULL'); } catch(e) {}
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

  // ── Company Question Banks ─────────────────────────
  await c.execute(`
    CREATE TABLE IF NOT EXISTS company_banks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      logo TEXT DEFAULT '🏢',
      color TEXT DEFAULT '#4A90D9',
      industry TEXT DEFAULT 'Technology',
      question_count INTEGER DEFAULT 0,
      difficulty TEXT DEFAULT 'Medium',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await c.execute(`
    CREATE TABLE IF NOT EXISTS company_bank_questions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      type TEXT DEFAULT 'SQL',
      difficulty TEXT DEFAULT 'Medium',
      topic TEXT DEFAULT 'Joins',
      approach TEXT,
      xp_reward INTEGER DEFAULT 30,
      order_index INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(company_id, title)
    )
  `);

  // Seed company banks — INSERT OR IGNORE so safe to re-run on every restart
  try {
    const companies = [
      { id: uuidv4(), name: 'Flipkart',           logo: '🛒', color: '#2874F0', industry: 'E-commerce',    difficulty: 'Medium', question_count: 7 },
      { id: uuidv4(), name: 'Amazon India',        logo: '📦', color: '#FF9900', industry: 'E-commerce',    difficulty: 'Hard',   question_count: 7 },
      { id: uuidv4(), name: 'Swiggy',              logo: '🍔', color: '#FC8019', industry: 'Food Delivery', difficulty: 'Medium', question_count: 6 },
      { id: uuidv4(), name: 'Zomato',              logo: '🍕', color: '#E23744', industry: 'Food Delivery', difficulty: 'Medium', question_count: 6 },
      { id: uuidv4(), name: 'PhonePe',             logo: '💸', color: '#5F259F', industry: 'Fintech',       difficulty: 'Medium', question_count: 6 },
      { id: uuidv4(), name: 'Razorpay',            logo: '💳', color: '#2962FF', industry: 'Fintech',       difficulty: 'Hard',   question_count: 6 },
      { id: uuidv4(), name: 'Meesho',              logo: '🛍️', color: '#8B5CF6', industry: 'Social Commerce',difficulty: 'Easy',  question_count: 5 },
      { id: uuidv4(), name: 'Walmart Global Tech', logo: '🏪', color: '#0071CE', industry: 'Retail',        difficulty: 'Hard',   question_count: 6 },
      { id: uuidv4(), name: 'CRED',                logo: '💎', color: '#00C853', industry: 'Fintech',       difficulty: 'Hard',   question_count: 5 },
      { id: uuidv4(), name: 'Dream11',             logo: '🏏', color: '#1A73E8', industry: 'Gaming',        difficulty: 'Medium', question_count: 5 },
    ];
    for (const co of companies) {
      await c.execute({ sql: `INSERT OR IGNORE INTO company_banks (id,name,logo,color,industry,question_count,difficulty) VALUES (?,?,?,?,?,?,?)`,
          args: [co.id, co.name, co.logo, co.color, co.industry, co.question_count, co.difficulty] });
    }

      // Helper to insert a question — INSERT OR IGNORE so safe to re-run
      const db_c = c; // alias to avoid shadowing in find() callbacks
      const q = async (companyName, title, question, type, difficulty, topic, approach, xp, order) => {
        const co = companies.find(x => x.name === companyName);
        if (!co) return;
        await db_c.execute({ sql: `INSERT OR IGNORE INTO company_bank_questions (id,company_id,title,question,type,difficulty,topic,approach,xp_reward,order_index) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          args: [uuidv4(), co.id, title, question, type, difficulty, topic, approach, xp, order] });
      };

      // ── Flipkart ──
      await q('Flipkart','Top Categories by Revenue','Write a SQL query to find the top 3 product categories by total revenue for each quarter in 2023. Use window functions to rank categories within each quarter.','SQL','Hard','Window Functions','Use RANK() OVER (PARTITION BY quarter ORDER BY SUM(revenue) DESC). Group by quarter and category first, then apply the window function in a CTE or subquery.',40,1);
      await q('Flipkart','Returning vs New Users','Find the count of new users (first order ever) vs returning users for each month in 2023.','SQL','Medium','Date Filtering','Join orders with a subquery that gets each user\'s MIN(order_date). Users whose MIN date falls in the target month are "new"; all others with orders that month are "returning".',30,2);
      await q('Flipkart','Month-over-Month GMV Growth','Calculate month-over-month GMV growth rate as a percentage. Output: month, GMV, prev_month_GMV, growth_pct.','SQL','Medium','Aggregations','Use LAG(SUM(order_value), 1) OVER (ORDER BY month) to get previous month GMV. Then (current - prev) / prev * 100.',30,3);
      await q('Flipkart','High Return Rate Sellers','Identify sellers whose product return rate exceeds 20% in the last 6 months. Return seller_id, total_orders, returns, return_rate.','SQL','Easy','Joins','JOIN orders with returns table on order_id. GROUP BY seller_id. HAVING COUNT(returns)/COUNT(orders) > 0.2.',20,4);
      await q('Flipkart','Cart Abandonment Funnel','A user adds items to cart but doesn\'t purchase. Write a query to find the cart abandonment rate by device type for the past 30 days.','SQL','Medium','Funnel Analysis','LEFT JOIN cart_events with purchase_events on session_id. Group by device_type. Abandonment = sessions with cart add but no purchase / total sessions with cart add.',30,5);
      await q('Flipkart','Python: Cohort Retention','Using Python/Pandas, build a cohort retention table. Given a transactions dataframe with user_id, order_date — show what % of users from each monthly cohort transact in months 1, 2, 3 after joining.','Python','Hard','Cohort Analysis','Create cohort_month from first order date per user. Merge back to get order_month offset. Pivot to create the retention matrix. Normalize by cohort size.',40,6);
      await q('Flipkart','Inventory Stockout Prediction','How would you build a model or SQL query to flag SKUs likely to go out of stock within the next 7 days?','Analytical','Hard','Business Problem','Calculate daily average depletion rate per SKU (sold_units / days). Compare current_stock / avg_daily_rate. Flag where this ratio < 7. Mention seasonality adjustments.',35,7);

      // ── Amazon India ──
      await q('Amazon India','Prime vs Non-Prime Purchase Frequency','Compare the average purchase frequency per month between Prime and non-Prime users. Include users who made at least one purchase.','SQL','Medium','Aggregations','Group orders by user_id and month. COUNT(orders)/COUNT(DISTINCT months) = frequency. JOIN users table to get Prime status. AVG by segment.',30,1);
      await q('Amazon India','Delivery SLA Breach','Find the percentage of orders that breached the promised delivery SLA (delivered_date > promised_date) grouped by logistics partner and city tier.','SQL','Medium','Date Functions','Use DATEDIFF or date arithmetic. GROUP BY partner, city_tier. ROUND(SUM(CASE WHEN delivered_date > promised_date THEN 1 ELSE 0 END)*100.0/COUNT(*),2).',30,2);
      await q('Amazon India','Session to Purchase Conversion','Given a sessions table and orders table, calculate the conversion rate from browse session to purchase for each product category.','SQL','Hard','Funnel Analysis','sessions left join orders on session_id. Conversion = orders/sessions per category. Handle multi-category sessions carefully.',40,3);
      await q('Amazon India','Review Sentiment vs Rating Correlation','You have a product_reviews table with stars (1-5) and review_text. Write a query to find products where the star rating is high (>=4) but review text contains negative keywords.','SQL','Medium','String Matching','Use LOWER(review_text) LIKE \'%bad%\' OR LIKE \'%poor%\' etc. Filter WHERE stars >= 4. This flags potential fake/inconsistent reviews.',30,4);
      await q('Amazon India','Python: Price Elasticity','Using Python, calculate the price elasticity of demand for top 10 product categories. You have weekly price and sales volume data.','Python','Hard','Statistics','Elasticity = (% change in quantity) / (% change in price). Use .pct_change() on grouped data. np.polyfit or scipy.stats.linregress for regression approach.',40,5);
      await q('Amazon India','Seller Health Score','Design a "Seller Health Score" metric combining: on-time delivery %, return rate, customer rating, and response time. How would you weight and normalize these?','Analytical','Hard','Metric Design','Normalize each metric to 0-1 scale. Assign weights (e.g. delivery 30%, returns 25%, rating 30%, response 15%). Weighted sum = health score. Flag sellers < 0.6.',40,6);
      await q('Amazon India','Cross-sell Opportunity','Find pairs of products that are frequently bought together (market basket analysis). Return top 10 product pairs with their co-occurrence count and lift score.','SQL','Hard','Window Functions','Self-join order_items on order_id. COUNT pairs. Lift = P(A∩B) / (P(A)*P(B)). Requires total order counts per product.',40,7);

      // ── Swiggy ──
      await q('Swiggy','Peak Hour Demand Analysis','Find the average number of orders per hour of day, per city, for weekdays vs weekends. Identify the top 2 peak hours per city.','SQL','Medium','Date Functions','Extract HOUR(order_time) and DAYOFWEEK. GROUP BY city, hour, day_type. Use RANK() OVER (PARTITION BY city, day_type ORDER BY avg_orders DESC) to get top 2.',30,1);
      await q('Swiggy','Restaurant Churn Prediction','A restaurant is considered "churned" if it had no orders for 30+ consecutive days after being active. Write a query to find all churned restaurants.','SQL','Hard','Date Functions','Use LAG(order_date) OVER (PARTITION BY restaurant_id ORDER BY order_date). Find gaps > 30 days. Restaurants with a gap after their last order and no recent activity.',40,2);
      await q('Swiggy','Delivery Partner Efficiency','Calculate the average delivery time and orders per hour for each delivery partner. Flag partners whose avg delivery time is 20% above the city median.','SQL','Medium','Aggregations','City median via PERCENTILE_CONT(0.5) or subquery. JOIN partner metrics. Flag WHERE partner_avg > city_median * 1.2.',30,3);
      await q('Swiggy','Repeat Order Rate by Cuisine','What percentage of customers who ordered Italian food in month 1 also ordered Italian in month 2? Segment by city.','SQL','Medium','Cohort Analysis','Self-join on customer_id. Month 1 Italian orders left join Month 2 Italian orders. Repeat rate = matched / month1 total. GROUP BY city.',30,4);
      await q('Swiggy','Python: Surge Pricing Model','Given historical order_volume and driver_availability data (by 15-min slots), write Python code to calculate a surge multiplier (1x to 3x) and explain your logic.','Python','Hard','Business Logic','surge = demand/supply ratio, capped. If ratio > 2.0 → 3x, > 1.5 → 2x, > 1.2 → 1.5x, else 1x. Smooth with rolling average to avoid sharp spikes.',40,5);
      await q('Swiggy','Average Order Value Trend','Show the 7-day rolling average of order value per city for the last 90 days. Highlight days where AOV dropped more than 15% from the rolling average.','SQL','Medium','Window Functions','AVG(order_value) OVER (PARTITION BY city ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Flag where current < rolling_avg * 0.85.',30,6);

      // ── Zomato ──
      await q('Zomato','Gold Membership Impact','Compare the average order frequency and order value between Gold members and non-Gold users. Did Gold users increase orders after subscribing?','SQL','Medium','Aggregations','Pre/post analysis: JOIN users with gold_subscriptions. Compare avg_order_value and orders_per_month before and after subscription_date per user.',35,1);
      await q('Zomato','Restaurant Rating Drift','Find restaurants whose average rating has declined by more than 0.5 stars over the last 3 months compared to the 3 months before that.','SQL','Medium','Date Functions','AVG rating WHERE order_date in last 3 months vs prev 3 months per restaurant. HAVING new_avg < old_avg - 0.5.',30,2);
      await q('Zomato','Hyperpure Supplier Analysis','Zomato\'s Hyperpure supplies ingredients to restaurants. Find which ingredient categories have the highest reorder frequency and average days between orders per restaurant.','SQL','Medium','Date Functions','LAG(order_date) OVER (PARTITION BY restaurant_id, category ORDER BY order_date). AVG gap days per category. Reorder frequency = COUNT(orders) / date_range_days.',30,3);
      await q('Zomato','Discount Cannibalization','Restaurants that offer heavy discounts — do they actually see higher net revenue or does the discount erode margins? Write a query to find the revenue impact.','SQL','Hard','Business Metric','Compare orders with discount vs without. net_revenue = order_value - discount_amount. AVG net_revenue and total_revenue by discount_bracket (0%, 1-10%, 11-20%, 20%+).',40,4);
      await q('Zomato','Python: ETA Accuracy Model','Given predicted_delivery_time and actual_delivery_time, write Python to calculate ETA accuracy metrics and identify which factors (distance, time_of_day, weather) most affect accuracy.','Python','Hard','Statistics','MAE = mean(|actual-predicted|). Correlation matrix with features. Group by time_of_day buckets. Use seaborn heatmap or pandas corr().',40,5);
      await q('Zomato','User Lifetime Value Segmentation','Segment users into High/Medium/Low LTV based on total spend, recency, and frequency (RFM model). Write the SQL to generate RFM scores.','SQL','Hard','RFM Analysis','Recency = DATEDIFF(today, MAX(order_date)). Frequency = COUNT(orders). Monetary = SUM(order_value). NTILE(3) OVER (ORDER BY each metric) to score 1-3. Sum = RFM segment.',40,6);

      // ── PhonePe ──
      await q('PhonePe','Transaction Success Rate by Bank','Calculate the payment success rate for each bank partner broken down by transaction type (UPI/wallet/card). Flag banks below 95% success rate.','SQL','Medium','Aggregations','SUM(CASE WHEN status=\'success\' THEN 1 ELSE 0 END) / COUNT(*) per bank + type. HAVING success_rate < 0.95.',30,1);
      await q('PhonePe','Fraud Detection Signals','Write a query to flag potentially fraudulent accounts: users with >10 failed transactions in 1 hour, or >5 different device_ids in a day, or transactions from mismatched states.','SQL','Hard','Window Functions','COUNT(*) OVER (PARTITION BY user_id ORDER BY txn_time RANGE BETWEEN INTERVAL \'1\' HOUR PRECEDING AND CURRENT ROW). Flag any user exceeding thresholds.',40,2);
      await q('PhonePe','D30 Retention by Acquisition Channel','Of users who installed PhonePe in Jan 2024 from each acquisition channel (organic/paid/referral), what % made at least one transaction within 30 days?','SQL','Medium','Cohort Analysis','Filter install_date in Jan 2024. LEFT JOIN with transactions WHERE txn_date <= install_date + 30. Retention = COUNT(txn)/COUNT(install) per channel.',30,3);
      await q('PhonePe','Merchant GMV Concentration','Find the top 10% of merchants by GMV and calculate what % of total platform GMV they contribute (Pareto analysis).','SQL','Medium','Window Functions','SUM(gmv) per merchant. NTILE(10) OVER (ORDER BY gmv DESC). Filter NTILE=1. SUM of their GMV / total GMV * 100.',30,4);
      await q('PhonePe','Python: Anomaly Detection','Using Python, detect anomalous spikes in hourly transaction volume. Define what qualifies as an anomaly and write code to flag them.','Python','Hard','Statistics','Rolling mean ± 2*std = control limits. Flag hours outside bounds. Use pandas rolling(24).mean() and rolling(24).std(). Or Z-score method: (x - mean)/std > 3.',40,5);
      await q('PhonePe','Switch Rate Analysis','What % of users who used a competitor UPI app (from survey data) switched to PhonePe in Q3? What were the top reasons?','Analytical','Medium','Business Problem','Join survey_responses with user_acquisition. Filter users who reported competitor usage pre-Q3. Count those now on PhonePe. Analyze switch_reason column frequency.',30,6);

      // ── Razorpay ──
      await q('Razorpay','Payment Gateway Latency','Find the P50, P90, P99 latency (ms) for payment processing by payment method and time of day. Flag if P99 exceeds SLA of 3000ms.','SQL','Hard','Percentiles','PERCENTILE_CONT(0.5/0.9/0.99) WITHIN GROUP (ORDER BY latency_ms) per method + time_bucket. Flag WHERE p99 > 3000.',40,1);
      await q('Razorpay','Merchant Activation Funnel','Track merchants through: signup → API integration → first test payment → first live payment. Calculate conversion rate at each step and avg days to complete.','SQL','Hard','Funnel Analysis','Each step is a separate event table. LEFT JOIN in sequence. Conversion = users completing step N / users completing step N-1. DATEDIFF for time between steps.',40,2);
      await q('Razorpay','Chargeback Rate by Industry','Calculate chargeback rate (chargebacks/total_transactions) by merchant industry vertical. Identify which verticals have rates above the RBI threshold of 1%.','SQL','Medium','Aggregations','JOIN chargebacks with transactions on payment_id. GROUP BY industry_vertical. HAVING chargeback_rate > 0.01.',30,3);
      await q('Razorpay','Route Optimization','Razorpay routes payments through multiple bank acquirers. Write a query to find which acquirer has the best success rate + lowest latency combination for each card network.','SQL','Hard','Multi-metric','Rank acquirers by COMPOSITE_SCORE = (success_rate * 0.7) + ((1 - normalized_latency) * 0.3) per card_network. Use RANK() OVER (PARTITION BY card_network ORDER BY score DESC).',40,4);
      await q('Razorpay','Python: Revenue Forecasting','Using historical monthly payment volume data, forecast next 3 months using Python. Which model would you use and why?','Python','Hard','Forecasting','Use Facebook Prophet or ARIMA. Decompose trend+seasonality. prophet.fit(df). prophet.predict(future). Evaluate with MAPE. Mention handling of festival season spikes.',40,5);
      await q('Razorpay','Smart Routing Impact','After implementing smart routing, did success rates improve? Design a query for an A/B test analysis comparing control (old routing) vs treatment (smart routing).','Analytical','Hard','A/B Testing','Segment transactions by routing_type. Chi-square test on success/failure counts. Calculate lift = (treatment_success - control_success) / control_success. Check statistical significance.',40,6);

      // ── Meesho ──
      await q('Meesho','Reseller Activation','A reseller is "activated" after making 3+ successful sales. Find the time it takes (in days) for resellers to activate, grouped by acquisition month.','SQL','Medium','Aggregations','Get 3rd order date per reseller. DATEDIFF(3rd_order_date, registration_date). AVG by acquisition_month (registration month).',30,1);
      await q('Meesho','Viral Coefficient','Calculate the viral coefficient K = (invites sent per user) × (conversion rate of invites). If K > 1, growth is viral. Query the referral data.','SQL','Medium','Business Metric','AVG(invites_sent) per user × (COUNT(successful_referrals) / COUNT(invites_sent)). A single query with two aggregations.',30,2);
      await q('Meesho','Return Abuse Detection','Find users whose return rate exceeds 60% over last 90 days with at least 10 orders. These are likely return abusers.','SQL','Easy','Aggregations','GROUP BY user_id. HAVING returns/orders > 0.6 AND COUNT(orders) >= 10. WHERE order_date >= TODAY - 90.',20,3);
      await q('Meesho','Category Penetration by Tier-2 Cities','Which product categories have the highest order penetration in Tier-2/3 cities vs Tier-1? (penetration = % of city users who ordered from category)','SQL','Medium','Segmentation','orders JOIN users on city_tier. COUNT(DISTINCT user_id ordering category) / COUNT(DISTINCT users in city_tier). GROUP BY city_tier, category.',30,4);
      await q('Meesho','Python: Price Recommendation','Given a product\'s sales history at different price points, write Python code to recommend the optimal price that maximizes revenue.','Python','Medium','Optimization','Plot price vs revenue. Fit a polynomial curve. Find the maximum. np.polyfit + np.poly1d. Or simple grid search over price points.',35,5);

      // ── Walmart Global Tech ──
      await q('Walmart Global Tech','Inventory Turnover','Calculate inventory turnover ratio (COGS / avg_inventory) per product category per quarter. Flag categories with ratio < 2 (slow-moving inventory).','SQL','Medium','Aggregations','AVG((opening_stock + closing_stock)/2) = avg_inventory per quarter. COGS from sales * cost_price. HAVING turnover < 2.',30,1);
      await q('Walmart Global Tech','Demand Forecasting Accuracy','Compare forecasted demand vs actual demand by SKU. Calculate MAPE (Mean Absolute Percentage Error) per category.','SQL','Hard','Statistics','SUM(ABS(actual-forecast)/actual)*100/COUNT(*) = MAPE per category. Join forecast and actuals tables on sku_id + week.',35,2);
      await q('Walmart Global Tech','Store Performance Benchmarking','Rank stores by composite score: sales_growth (40%), avg_transaction_value (30%), customer_satisfaction_score (30%). Normalize each metric before scoring.','SQL','Hard','Composite Metric','(value - MIN) / (MAX - MIN) for each metric using window functions. Weighted sum = final score. RANK() OVER (ORDER BY score DESC).',40,3);
      await q('Walmart Global Tech','Supply Chain Disruption Impact','When a supplier had a delay, how did it impact in-store availability (stockout rate) downstream? Quantify the stockout increase in the 2 weeks following a supplier delay event.','SQL','Hard','Impact Analysis','JOIN supplier_delays with stockout_events. DATEDIFF(stockout_date, delay_date). Filter 0-14 days post-delay. Compare stockout_rate to baseline (control period).',40,4);
      await q('Walmart Global Tech','Python: Basket Analysis','Implement the Apriori algorithm (or use mlxtend) to find frequent itemsets from Walmart\'s transaction data. Report top 10 association rules by lift.','Python','Hard','ML','from mlxtend.frequent_patterns import apriori, association_rules. Create binary matrix. apriori(df, min_support=0.01). Filter rules by lift > 2.',40,5);
      await q('Walmart Global Tech','Shrinkage Analysis','Shrinkage = (expected_inventory - actual_inventory). Write a query to find the top 10 SKUs by shrinkage amount and shrinkage rate per store cluster.','SQL','Medium','Business Metric','expected = opening_stock + received - sold. actual = closing_stock. shrinkage = expected - actual. GROUP BY sku + store_cluster. TOP 10 by SUM(shrinkage).',30,6);

      // ── CRED ──
      await q('CRED','Credit Score Segmentation','Segment CRED members by credit score bands (<650, 650-750, 750-800, 800+). For each band, show avg spend per month, bill payment rate, and product adoption rate.','SQL','Medium','Segmentation','CASE WHEN score < 650 THEN \'<650\' ... END as band. GROUP BY band. Multiple aggregations per band.',30,1);
      await q('CRED','Coin Redemption Funnel','Track users from: coins_earned → coins_redeemed → purchase_completed. What % drop off at each stage? Which coin reward categories have highest redemption?','SQL','Medium','Funnel Analysis','LEFT JOIN funnel stages. Conversion at each step. GROUP BY reward_category for the last question.',30,2);
      await q('CRED','Bill Payment Prediction','Which members are likely to miss their credit card bill payment this month? What features would you use and how would you model this?','Analytical','Hard','ML Design','Features: payment_history, days_since_last_payment, outstanding_balance/credit_limit, income_proxy, credit_utilization. Logistic regression / XGBoost. Evaluate with precision-recall (class imbalance).',40,3);
      await q('CRED','Jackpot Feature ROI','CRED launched a "Jackpot" spin feature. Analyze its impact on DAU, session length, and bill payments in the 30 days post-launch vs 30 days pre-launch.','SQL','Hard','A/B / Pre-Post','Pre: 30 days before launch_date. Post: 30 days after. Compare DAU, AVG(session_length), bill_payment_rate. Check if difference is statistically meaningful.',40,4);
      await q('CRED','Python: Reward Optimization','Given member profiles and past reward redemptions, write a Python function to recommend the top 3 rewards for a new member using collaborative filtering.','Python','Hard','ML','user-item matrix of redemptions. cosine_similarity or SVD. Find k nearest neighbors. Recommend rewards not yet redeemed by target user. sklearn or surprise library.',40,5);

      // ── Dream11 ──
      await q('Dream11','Contest Entry Optimization','Users can join multiple contests per match. Find the average number of contests per user per match, segmented by user\'s historical win rate.','SQL','Medium','Aggregations','contest_entries JOIN users. COUNT(contests)/COUNT(DISTINCT matches) per user. JOIN with win_history to get win_rate. NTILE(4) to create win_rate quartiles.',30,1);
      await q('Dream11','Team Duplication Rate','What % of teams created for a given match have an identical 11-player selection? High duplication suggests lack of strategy diversity.','SQL','Hard','String/Hash Matching','Hash or sort the 11 players into a canonical string per team. COUNT(DISTINCT canonical_team) / COUNT(total_teams) per match. 1 - this = duplication rate.',40,2);
      await q('Dream11','Captain/VC Selection Bias','Which cricket players are most over-selected as Captain (C) or Vice-Captain (VC) compared to their actual performance (fantasy points scored)?','SQL','Medium','Aggregations','selection_rate = COUNT(teams where player is C or VC) / total_teams. avg_fantasy_pts from player_performance. Rank by selection_rate / avg_pts (over-selection ratio).',30,3);
      await q('Dream11','Revenue per Match Type','Compare average revenue per user (ARPU) for T20, ODI, and Test matches. Which format drives the most monetization?','SQL','Easy','Aggregations','SUM(entry_fees) / COUNT(DISTINCT user_id) per match_format. Simple GROUP BY match_type.',20,4);
      await q('Dream11','Python: Optimal Team Builder','Given a CSV of players with their salary, predicted_points, and position — write a Python function to select an optimal 11-player team within a ₹100 credit budget.','Python','Hard','Optimization','Linear programming with PuLP or greedy approach. Constraints: budget ≤ 100, position requirements (1 WK, 3-5 BAT, etc.). Maximize SUM(predicted_points).',40,5);
  } catch(e) { console.log('Company bank seed error:', e.message); }

  // ── Interview Experiences ──────────────────────────────────────
  await c.execute(`
    CREATE TABLE IF NOT EXISTS interview_experiences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      experience_type TEXT DEFAULT 'Off-campus',
      difficulty TEXT DEFAULT 'Medium',
      outcome TEXT DEFAULT 'Selected',
      rounds INTEGER DEFAULT 1,
      rounds_detail TEXT DEFAULT '[]',
      overall_experience TEXT NOT NULL,
      tips TEXT,
      interview_date TEXT,
      is_approved INTEGER DEFAULT 1,
      upvotes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  try { await c.execute('ALTER TABLE interview_experiences ADD COLUMN upvotes INTEGER DEFAULT 0'); } catch(e) {}

  // Seed realistic interview experiences
  try {
    const interviewSeeds = [
      {
        id: 'ie-001',
        user_id: 'seed-user',
        author_name: 'Priya Sharma',
        company: 'Flipkart',
        role: 'Data Analyst',
        experience_type: 'Off-campus',
        difficulty: 'Hard',
        outcome: 'Selected',
        rounds: 4,
        rounds_detail: JSON.stringify([
          { round_name: 'Online Assessment', description: 'SQL test on HackerRank — 3 questions in 90 minutes. Questions involved window functions (RANK, DENSE_RANK), CTEs, and a tricky self-join for finding order sequences. Also had 10 aptitude MCQs.' },
          { round_name: 'Technical Round 1 — SQL Deep Dive', description: 'Asked to write a query to find the top 3 products by revenue each month using window functions. Follow-up was to optimize it. Also discussed indexing and query plans. They asked me to explain the difference between RANK and DENSE_RANK with examples.' },
          { round_name: 'Technical Round 2 — Product & Analytics', description: 'Case study: "Flipkart is seeing a drop in GMV on mobile app — how would you diagnose this?" I walked through the funnel: impressions → clicks → add-to-cart → purchase. They asked about SQL queries to validate each hypothesis. Also asked about A/B testing basics and how to measure statistical significance.' },
          { round_name: 'HR + Hiring Manager', description: 'Standard behavioral questions — tell me about yourself, why Flipkart, a time you handled a conflict. Hiring manager asked about my Python skills and whether I was comfortable with Tableau. Discussed team structure and expectations.' },
        ]),
        overall_experience: 'The process was very structured and the interviewers were friendly. The SQL rounds were challenging — especially the window functions part. The product case study was the most interesting because it tested real analytical thinking, not just coding. The whole process took about 3 weeks from application to offer. Preparation with LeetCode SQL and practicing case studies helped a lot. The compensation offered was slightly below expectations but the role was great for learning.',
        tips: 'Practice window functions extensively — RANK, DENSE_RANK, ROW_NUMBER, LAG, LEAD. Be comfortable with CTEs. For the product round, always structure your answer using funnels and metric trees. Know the difference between correlation and causation.',
        interview_date: '2024-03',
      },
      {
        id: 'ie-002',
        user_id: 'seed-user',
        author_name: 'Rahul Verma',
        company: 'Amazon India',
        role: 'Business Intelligence Engineer',
        experience_type: 'LinkedIn',
        difficulty: 'Hard',
        outcome: 'Rejected',
        rounds: 5,
        rounds_detail: JSON.stringify([
          { round_name: 'Phone Screen — Recruiter', description: 'Basic background check. Discussed past experience, role expectations, and location preference. The recruiter explained the BIE role involves SQL, Python, and ETL pipeline work.' },
          { round_name: 'Online Assessment', description: 'Two coding questions on LeetCode-style platform — one SQL (finding second highest salary variant with partitioning) and one Python (data manipulation with Pandas). Time limit was 75 minutes.' },
          { round_name: 'Technical Round 1 — SQL + Data Modeling', description: 'Deep SQL questions — correlated subqueries, handling NULLs, writing a query to calculate the 7-day rolling average. Also discussed star schema vs snowflake schema and when to use each.' },
          { round_name: 'Technical Round 2 — Python + ETL', description: 'Wrote Python code to clean a messy dataset — handling missing values, outliers, and date parsing. Discussed how to design an ETL pipeline for a reporting dashboard. AWS Redshift and S3 knowledge was tested.' },
          { round_name: 'Bar Raiser Round', description: 'Amazon leadership principles deep-dive. They kept asking "why" five times for every answer. Got tripped up on "Customer Obsession" and "Dive Deep" examples. This is where I think I lost the opportunity.' },
        ]),
        overall_experience: 'The Amazon interview process is very rigorous and structured. The technical rounds were fair but the Bar Raiser round is really make-or-break. I wish I had prepared more STAR-format answers aligned to Amazon\'s 16 leadership principles. The technical parts went well — SQL and Python questions were of LeetCode medium difficulty. The rejection came specifically from the behavioral round, not technical. The interviewers were professional and gave good hints when I was stuck.',
        tips: 'Prepare 2-3 solid examples for each Amazon leadership principle. STAR format is mandatory — Situation, Task, Action, Result with quantified results. On the technical side, practice SQL window functions and basic ETL design patterns. Know your Pandas well.',
        interview_date: '2024-01',
      },
      {
        id: 'ie-003',
        user_id: 'seed-user',
        author_name: 'Ananya Krishnan',
        company: 'Swiggy',
        role: 'Product Analyst',
        experience_type: 'Referral',
        difficulty: 'Medium',
        outcome: 'Selected',
        rounds: 3,
        rounds_detail: JSON.stringify([
          { round_name: 'Technical Screening', description: 'Sent a take-home assignment — given a CSV of order data, write Python/SQL analysis to find peak hours, top restaurants, and calculate delivery partner efficiency. Had to present findings in a simple slide deck. Took about 4 hours.' },
          { round_name: 'Technical Interview', description: 'Deep dive on the assignment. They challenged my metric choices and asked what I would do differently. Then new SQL questions — finding restaurants with consistently declining orders over 3 months. Also asked about how I would design a dashboard for delivery partner performance.' },
          { round_name: 'Culture + HM Round', description: 'Discussed Swiggy\'s product, what I thought could be improved in the app. Asked about working in a fast-paced environment and handling ambiguous problems. Very conversational — felt more like a discussion than an interview.' },
        ]),
        overall_experience: 'The referral really helped me get into the process faster. The take-home assignment was the most important part — they valued presentation and storytelling over just technical correctness. The panel was genuinely interested in my thought process. Swiggy has a great culture and the interviewers were excited about their products. The whole process was completed in 2 weeks which is fast for a startup of that size. The role involves a lot of cross-functional work with PMs and Engineering.',
        tips: 'For the take-home assignment, focus on clear visualizations and actionable insights — not just raw numbers. They care about "so what?" more than technical perfection. Research Swiggy\'s product deeply before the culture round.',
        interview_date: '2024-04',
      },
      {
        id: 'ie-004',
        user_id: 'seed-user',
        author_name: 'Karthik Menon',
        company: 'Zomato',
        role: 'Data Analyst',
        experience_type: 'Off-campus',
        difficulty: 'Medium',
        outcome: 'Selected',
        rounds: 3,
        rounds_detail: JSON.stringify([
          { round_name: 'Online Test', description: 'Mix of SQL, logical reasoning, and a short data interpretation section. SQL questions tested JOINs, subqueries, and aggregate functions. Logical reasoning was standard aptitude. About 60 questions in 60 minutes — time management was key.' },
          { round_name: 'Technical Interview', description: 'Started with "walk me through your resume," then SQL deep dive. I was asked to calculate the "Gold membership impact on order frequency" — had to write a before/after analysis query. Also discussed how to detect anomalies in order data using statistical methods. They appreciated when I mentioned Z-score and IQR approaches.' },
          { round_name: 'Final Round — Analytics Manager', description: 'Mostly product sense and metric design. "How would you measure the success of Zomato\'s Hyperpure (B2B supply chain) business?" I defined metrics around GMV, delivery SLA, restaurant adoption rate, and reorder rate. Manager seemed pleased with the structured approach.' },
        ]),
        overall_experience: 'Zomato\'s interview process is quite focused on real business problems — every question felt directly relevant to what analysts actually do there. The process was smooth and communication from the HR team was timely. I had to negotiate the salary offer slightly but they were accommodating. The work culture seems data-driven — they use a lot of A/B testing and make decisions based on metrics rather than gut feel.',
        tips: 'Know Zomato\'s products inside out — Zomato app, Hyperpure, Blinkit integration. Practice metric design frameworks: define the metric, leading vs lagging indicators, guardrail metrics. SQL queries for before/after analysis and cohort retention are very common.',
        interview_date: '2024-02',
      },
      {
        id: 'ie-005',
        user_id: 'seed-user',
        author_name: 'Sneha Patel',
        company: 'PhonePe',
        role: 'Data Analyst — Payments',
        experience_type: 'Walk-in',
        difficulty: 'Medium',
        outcome: 'On-hold',
        rounds: 3,
        rounds_detail: JSON.stringify([
          { round_name: 'Written Test', description: 'A 45-minute written test at their Bengaluru office. Included SQL (5 questions), Python (3 questions on Pandas), and 2 case study questions on payment analytics. Questions were fairly straightforward — aggregations, group by, basic Pandas operations.' },
          { round_name: 'Technical Interview', description: 'Discussed my SQL answers from the test first. Then asked about fraud detection — what signals would I look for in transaction data to identify fraudulent accounts. I discussed velocity checks, device fingerprinting patterns in SQL. Also asked about the difference between precision and recall and when you\'d prefer one over the other in a fraud context.' },
          { round_name: 'Senior Manager Round', description: 'Business problem: "UPI transaction success rate has dropped 3% this week — how do you investigate?" I walked through the diagnostic — check by bank, by transaction type, by time of day, by geography. They liked the structured approach but said the position was being reassessed due to a team restructuring.' },
        ]),
        overall_experience: 'The walk-in process at PhonePe was surprisingly well-organized. The technical questions were solid but not super hard. The rejection (or rather "on-hold") came from a non-technical reason — internal restructuring. The interviewers were knowledgeable and the problems were genuinely interesting. PhonePe works with massive scale data which is exciting. If you\'re interested in fintech analytics, this is a great company to target.',
        tips: 'Understand basic fraud detection concepts — velocity checks, device fingerprinting, behavioral anomalies. For the final round, practice root-cause analysis frameworks — start broad, then narrow down with data. Know UPI transaction flow end-to-end.',
        interview_date: '2024-05',
      },
      {
        id: 'ie-006',
        user_id: 'seed-user',
        author_name: 'Arjun Nair',
        company: 'CRED',
        role: 'Analytics Engineer',
        experience_type: 'LinkedIn',
        difficulty: 'Hard',
        outcome: 'Selected',
        rounds: 4,
        rounds_detail: JSON.stringify([
          { round_name: 'Recruiter Screen', description: 'Quick 20-minute call about background and role fitment. CRED was hiring specifically for someone with dbt + SQL + Python experience. The recruiter was straightforward about what they needed.' },
          { round_name: 'Technical Round 1 — Advanced SQL', description: 'The hardest SQL round I\'ve faced. Questions involved recursive CTEs, writing custom aggregation functions conceptually, and a question about finding the top N items across multiple partitions efficiently. Also asked about query optimization strategies — when to use CTEs vs subqueries, index design.' },
          { round_name: 'Technical Round 2 — dbt + Data Modeling', description: 'This was specific to the Analytics Engineer role. Asked to design a dbt model structure for CRED\'s reward system — staging, intermediate, and mart layers. Discussed slowly changing dimensions, snapshot models, and how to handle late-arriving data. Also asked about testing strategies in dbt.' },
          { round_name: 'Leadership + Culture Round', description: 'CRED has a high-bar culture. Asked about times I drove data initiatives without being asked, how I handle pushback from stakeholders, and examples of me simplifying complex problems. They value ownership and first-principles thinking.' },
        ]),
        overall_experience: 'CRED\'s interview process is intense but very well-structured. The Analytics Engineer role is more technical than a typical DA role — you need solid data engineering fundamentals. The dbt round was unique and I had to be really well-prepared. The offer was competitive with good ESOPs. The culture values people who think deeply and communicate clearly. The onboarding process was excellent and the tools are top-notch.',
        tips: 'For Analytics Engineer roles, know dbt deeply — models, tests, sources, snapshots, macros. Understand data modeling for analytics: star schema, Kimball methodology basics. Advanced SQL is non-negotiable. Practice recursive CTEs and query optimization.',
        interview_date: '2024-06',
      },
      {
        id: 'ie-007',
        user_id: 'seed-user',
        author_name: 'Meera Joshi',
        company: 'Meesho',
        role: 'Business Analyst',
        experience_type: 'Off-campus',
        difficulty: 'Easy',
        outcome: 'Rejected',
        rounds: 2,
        rounds_detail: JSON.stringify([
          { round_name: 'Online Assessment', description: 'Standard aptitude + SQL test. SQL questions were basic — simple JOINs, GROUP BY, HAVING. The aptitude section had data interpretation questions with tables and bar charts. Overall not very hard.' },
          { round_name: 'Technical + HR Interview', description: 'Interviewer asked about SQL basics, then pivoted to a product question: "Meesho is trying to improve reseller activation rate — what would you track and how?" I gave a reasonable answer but wasn\'t familiar with Meesho\'s specific product metrics. They also asked about Excel/Sheets skills which I downplayed — mistake.' },
        ]),
        overall_experience: 'The process was quick — only 2 rounds but they moved fast. I was rejected mainly because I didn\'t research Meesho\'s specific business model enough. The BA role at Meesho is very product-focused and they expect you to understand their unique social commerce model deeply. My SQL was fine but the product knowledge gap cost me. Would recommend this as a good first analytics job — the questions weren\'t very hard and the team seemed young and energetic.',
        tips: 'Research Meesho\'s business model thoroughly — social commerce, reseller network, tier-2/3 city focus. Know the key metrics: reseller activation rate, viral coefficient, GMV per reseller. Don\'t underestimate Excel/Sheets — they use it heavily.',
        interview_date: '2024-03',
      },
      {
        id: 'ie-008',
        user_id: 'seed-user',
        author_name: 'Vikram Reddy',
        company: 'Razorpay',
        role: 'Data Analyst — Growth',
        experience_type: 'On-campus',
        difficulty: 'Hard',
        outcome: 'Selected',
        rounds: 4,
        rounds_detail: JSON.stringify([
          { round_name: 'Campus Aptitude Test', description: 'Online test through campus placement portal. 30 aptitude questions + 5 SQL questions + 3 case study questions in 90 minutes. SQL was medium difficulty. Case studies were about payment metrics — calculating transaction success rates and merchant health scores.' },
          { round_name: 'Group Discussion', description: 'Topic: "Should India move to a fully cashless economy?" 8 students participated for 20 minutes. They were evaluating communication, data-driven arguments, and the ability to build on others\' points. I quoted UPI stats which went down well.' },
          { round_name: 'Technical Interview', description: 'Heavy SQL and statistical questions. Asked to write a query for payment gateway latency percentiles (P50, P90, P99). Discussed A/B testing methodology — how to design an experiment to test a new payment routing algorithm. They asked about funnel analysis concepts and merchant activation cohorts.' },
          { round_name: 'HR Interview', description: 'Standard questions about career goals, why Razorpay, strengths and weaknesses. Also asked about my understanding of the fintech regulatory environment — PCI DSS, RBI guidelines. Showed genuine interest in the domain which helped.' },
        ]),
        overall_experience: 'Getting placed from campus at Razorpay felt like a huge win. The process was competitive — over 200 students sat for the test and only 3 offers went out. The technical questions were harder than most campus placements. The group discussion was unexpected but helped them assess communication skills. Razorpay is an incredible company for data analysts — the scale of payment data you work with is massive and the team is top-quality.',
        tips: 'For campus placements, SQL and statistics are the core differentiators. Know basic statistical concepts — hypothesis testing, confidence intervals, p-values. Practice payment-specific case studies. In the group discussion, use specific data points to make your arguments stronger.',
        interview_date: '2023-12',
      },
    ];

    for (const exp of interviewSeeds) {
      await c.execute({
        sql: `INSERT OR IGNORE INTO interview_experiences
          (id, user_id, author_name, company, role, experience_type, difficulty, outcome,
           rounds, rounds_detail, overall_experience, tips, interview_date, is_approved, upvotes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        args: [
          exp.id, exp.user_id, exp.author_name, exp.company, exp.role,
          exp.experience_type, exp.difficulty, exp.outcome, exp.rounds,
          exp.rounds_detail, exp.overall_experience, exp.tips, exp.interview_date,
        ],
      });
    }
  } catch(e) { console.log('Interview experiences seed error:', e.message); }

  // ── Placement Companies ───────────────────────────────────────────
  try { await c.execute(`
    CREATE TABLE IF NOT EXISTS placement_companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT DEFAULT '🏢',
      color TEXT DEFAULT '#4A90D9',
      industry TEXT DEFAULT 'Technology',
      roles TEXT DEFAULT '[]',
      difficulty TEXT DEFAULT 'Hard',
      interview_rounds TEXT DEFAULT '[]',
      key_topics TEXT DEFAULT '[]',
      prep_tips TEXT DEFAULT '[]',
      salary_range TEXT DEFAULT NULL,
      success_rate INTEGER DEFAULT 20,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `); } catch(e) { console.log('placement_companies table error:', e.message); }

  try {
    const placementCompanies = [
      {
        id: 'pc-flipkart',
        name: 'Flipkart',
        logo: '🛒',
        color: '#2874F0',
        industry: 'E-commerce',
        roles: JSON.stringify(['Data Analyst', 'BI Engineer', 'Product Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Online Assessment', duration: '90 min', desc: 'SQL test on HackerRank with 3 problems involving window functions (RANK, DENSE_RANK, LAG), CTEs, and self-joins. Plus 10 aptitude MCQs on data interpretation.' },
          { round: 'Technical SQL Round', duration: '60 min', desc: 'Deep dive into window functions, query optimization, and indexing. Expect to write and explain GMV trend queries, cohort analysis, and top-N problems per category.' },
          { round: 'Technical Python & Analytics', duration: '60 min', desc: 'Python/Pandas data manipulation, cohort retention table using pandas, and a case study on Flipkart\'s mobile app GMV drop — funnel diagnosis using data.' },
          { round: 'Hiring Manager Round', duration: '45 min', desc: 'Product sense + business impact questions. "How would you measure the success of Flipkart\'s Big Billion Days sale?" Metric design and A/B testing basics.' },
          { round: 'HR Round', duration: '30 min', desc: 'Cultural fit, career goals, why Flipkart, and compensation discussion. Discuss team structure and expectations.' },
        ]),
        key_topics: JSON.stringify(['Window Functions', 'CTEs', 'Python Pandas', 'Cohort Analysis', 'Funnel Analysis', 'A/B Testing', 'GMV Metrics', 'Query Optimization']),
        prep_tips: JSON.stringify([
          'Master RANK(), DENSE_RANK(), ROW_NUMBER(), LAG(), LEAD() — Flipkart tests these heavily in Round 1 and Round 2. Practice top-N per group using RANK in a CTE.',
          'Study Flipkart\'s Big Billion Days funnel: impressions → search → PDP view → add-to-cart → checkout → payment. You will be asked to diagnose drops in this funnel.',
          'Build a cohort retention matrix in Python/Pandas from scratch. Flipkart loves this question — practice converting order_date to cohort_month and building a pivot table.',
          'Know how to calculate Month-over-Month GMV growth using LAG() window function. This is a near-guaranteed question in the SQL round.',
          'Research Flipkart\'s seller ecosystem (marketplace model), Flipkart Wholesale, and their logistics arm Ekart — product round questions are often grounded in these.',
        ]),
        salary_range: '₹8L–₹18L',
        success_rate: 15,
      },
      {
        id: 'pc-amazon',
        name: 'Amazon India',
        logo: '📦',
        color: '#FF9900',
        industry: 'E-commerce',
        roles: JSON.stringify(['Business Intelligence Engineer', 'Data Analyst', 'Product Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Recruiter Screen', duration: '20 min', desc: 'Background check, role expectations, and location. BIE roles require SQL + Python + basic ETL knowledge. Recruiter explains the 5-round process.' },
          { round: 'Online Assessment', duration: '75 min', desc: 'Two problems: one advanced SQL (partitioned ranking, rolling aggregates) and one Python/Pandas (data cleaning, missing values, outlier handling). LeetCode Medium difficulty.' },
          { round: 'Technical SQL & Data Modeling', duration: '60 min', desc: 'Correlated subqueries, handling NULLs, 7-day rolling average, star schema vs snowflake schema. Expect a question on Prime vs non-Prime purchase frequency analysis.' },
          { round: 'Technical Python & ETL', duration: '60 min', desc: 'Pandas data pipeline, ETL design for a reporting dashboard, AWS concepts (S3, Redshift). Write code to detect SLA breach orders and flag them.' },
          { round: 'Bar Raiser Round', duration: '60 min', desc: 'Deep dive on Amazon\'s 16 Leadership Principles with STAR format answers. Behavioral examples must be quantified. This round is make-or-break — 40% of candidates fail here.' },
        ]),
        key_topics: JSON.stringify(['Window Functions', 'Data Modeling', 'ETL Design', 'Python Pandas', 'AWS Basics', 'Leadership Principles', 'Statistical Analysis', 'Delivery SLA Metrics']),
        prep_tips: JSON.stringify([
          'Prepare 2–3 STAR-format stories for each of Amazon\'s 16 Leadership Principles. Customer Obsession, Dive Deep, and Ownership are tested most often. Quantify every result.',
          'The Bar Raiser round eliminates more candidates than the technical rounds. Spend at least 40% of your prep time on behavioral answers — not just SQL.',
          'Know SQL window functions inside-out plus star schema vs snowflake schema trade-offs. Amazon BIE roles involve heavy data modeling work.',
          'Practice designing ETL pipelines: S3 landing → Glue transform → Redshift. Even basic AWS knowledge differentiates you from other candidates.',
          'Study Amazon\'s flywheel (Prime ecosystem, delivery network, marketplace). Case questions often involve Prime membership impact on purchase behavior — know the metrics.',
        ]),
        salary_range: '₹12L–₹25L',
        success_rate: 12,
      },
      {
        id: 'pc-swiggy',
        name: 'Swiggy',
        logo: '🍔',
        color: '#FC8019',
        industry: 'Food Delivery',
        roles: JSON.stringify(['Product Analyst', 'Data Analyst', 'Growth Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Take-Home Assignment', duration: '4 hrs', desc: 'Given a CSV of order data, perform Python/SQL analysis to identify peak hours, top restaurants by city, and delivery partner efficiency. Present findings in a 5-slide deck.' },
          { round: 'Assignment Deep Dive', duration: '60 min', desc: 'Interviewers challenge your metric choices: "Why did you pick this as the north star?" New SQL questions on restaurant churn and rolling AOV by city.' },
          { round: 'Technical SQL Round', duration: '45 min', desc: 'Peak hour analysis using window functions, surge pricing logic, and 7-day rolling average of AOV per city. Detecting restaurants with 30+ day gaps in orders.' },
          { round: 'Culture & Hiring Manager', duration: '45 min', desc: 'Swiggy product deep dive — what would you improve in the app? How do you handle ambiguous requirements? Fast-paced startup questions with no right answers.' },
        ]),
        key_topics: JSON.stringify(['Take-Home Assignments', 'Storytelling with Data', 'Window Functions', 'Rolling Averages', 'Surge Pricing Logic', 'Restaurant Metrics', 'Python Pandas', 'Product Sense']),
        prep_tips: JSON.stringify([
          'The take-home assignment is the most critical gate. Focus on clear visualizations and "so what?" insights — Swiggy values analytical storytelling over technical perfection.',
          'Use Swiggy\'s own app before the interview — note the delivery ETA feature, restaurant discovery, and Instamart. Product round questions reference real app features.',
          'Practice writing SQL queries for peak hour analysis: EXTRACT(HOUR FROM order_time) + RANK() OVER (PARTITION BY city, day_type ORDER BY avg_orders DESC).',
          'Know how to detect churned restaurants using LAG window function to find 30+ day gaps between consecutive orders per restaurant_id.',
          'Research Swiggy\'s business model: food delivery, Instamart (quick commerce), Dineout acquisition. Each product line has distinct metrics they might ask you to define.',
        ]),
        salary_range: '₹10L–₹20L',
        success_rate: 18,
      },
      {
        id: 'pc-zomato',
        name: 'Zomato',
        logo: '🍕',
        color: '#E23744',
        industry: 'Food Delivery',
        roles: JSON.stringify(['Data Analyst', 'Product Analyst', 'Analytics Engineer']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Online Test', duration: '60 min', desc: 'Mix of SQL (JOINs, aggregates, subqueries), logical reasoning, and data interpretation. 60 questions in 60 minutes — time management is crucial.' },
          { round: 'Technical SQL Round', duration: '60 min', desc: 'Business problem SQL: Gold membership impact on order frequency (before/after analysis), rating drift detection, Hyperpure reorder frequency. Z-score anomaly detection appreciated.' },
          { round: 'Analytics Manager Round', duration: '45 min', desc: 'Metric design: "How would you measure the success of Blinkit\'s 10-minute delivery promise?" North star, leading vs lagging indicators, guardrail metrics.' },
        ]),
        key_topics: JSON.stringify(['Before/After Analysis', 'Cohort Analysis', 'Metric Design', 'Anomaly Detection', 'RFM Analysis', 'Window Functions', 'Date Functions', 'A/B Testing']),
        prep_tips: JSON.stringify([
          'Know Zomato\'s product portfolio deeply: Zomato food delivery, Blinkit (quick commerce), Hyperpure (B2B ingredients), Zomato Gold. Each has unique metrics you might be asked about.',
          'Practice before/after SQL analysis — comparing avg_order_frequency and avg_order_value before vs after a user subscribed to Gold membership using a date-based JOIN.',
          'Master metric design frameworks: define north star metric, leading indicators, lagging indicators, and guardrail metrics. The manager round is almost entirely metric design.',
          'Study RFM (Recency, Frequency, Monetary) segmentation — Zomato asks about user LTV segmentation. Know how to write NTILE(3) OVER (ORDER BY each metric) in SQL.',
          'The SQL test has a strict time limit. Practice rapid aggregation queries — GROUP BY, HAVING, basic window functions at speed. Don\'t spend too long on any one question.',
        ]),
        salary_range: '₹8L–₹16L',
        success_rate: 20,
      },
      {
        id: 'pc-phonepe',
        name: 'PhonePe',
        logo: '💸',
        color: '#5F259F',
        industry: 'Fintech',
        roles: JSON.stringify(['Data Analyst', 'Product Analyst', 'Business Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Written Test', duration: '45 min', desc: 'On-site or online: 5 SQL questions (aggregations, GROUP BY, subqueries), 3 Python/Pandas questions, and 2 payment analytics case studies.' },
          { round: 'Technical Interview', duration: '60 min', desc: 'Fraud detection SQL — velocity checks, device fingerprinting patterns. Precision vs recall trade-off in fraud context. D30 retention by acquisition channel.' },
          { round: 'Senior Manager Round', duration: '45 min', desc: '"UPI transaction success rate dropped 3% this week — diagnose using data." Walk through breakdown by bank, transaction type, time of day, and geography. Structured diagnosis expected.' },
          { round: 'HR Round', duration: '30 min', desc: 'Career goals, why fintech, salary expectations. May include questions about RBI guidelines and UPI transaction flow understanding.' },
        ]),
        key_topics: JSON.stringify(['Fraud Detection', 'UPI Metrics', 'Cohort Retention', 'Root Cause Analysis', 'Transaction Analytics', 'Velocity Checks', 'Window Functions', 'Python Pandas']),
        prep_tips: JSON.stringify([
          'Understand UPI transaction flow end-to-end: user → NPCI → bank → beneficiary. PhonePe questions often ask you to diagnose success rate drops at specific nodes in this flow.',
          'Study fraud detection signals: velocity checks (>10 failed txns in 1 hour), device fingerprinting anomalies, mismatch between registered state and transaction location.',
          'Know the difference between precision and recall and when to optimize for each in a fraud context — high recall (catch all fraud) vs high precision (minimize false positives for users).',
          'Practice root-cause analysis SQL: break down a metric drop by multiple dimensions simultaneously (bank × transaction_type × time_of_day × geography) to find the root cause.',
          'Research PhonePe\'s products: PhonePe app, PhonePe for Business, Switch (mini-apps), insurance & mutual funds. The manager round often involves measuring adoption of newer products.',
        ]),
        salary_range: '₹9L–₹18L',
        success_rate: 15,
      },
      {
        id: 'pc-razorpay',
        name: 'Razorpay',
        logo: '💳',
        color: '#2962FF',
        industry: 'Fintech',
        roles: JSON.stringify(['Data Analyst', 'Analytics Engineer', 'Growth Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Online Assessment', duration: '90 min', desc: 'SQL + aptitude + case study. SQL tests payment metrics: latency percentiles (P50/P90/P99), transaction success rates, merchant activation cohorts.' },
          { round: 'Technical SQL Round', duration: '60 min', desc: 'Advanced SQL: PERCENTILE_CONT for latency percentiles, merchant funnel (signup → API integration → first live payment), chargeback rate by industry vertical.' },
          { round: 'Technical Analytics Round', duration: '60 min', desc: 'A/B test analysis for smart routing algorithm. Python forecasting with ARIMA or Prophet. Route optimization using composite scoring (success_rate × 0.7 + normalized_latency × 0.3).' },
          { round: 'HR Interview', duration: '30 min', desc: 'Career goals, fintech interest, PCI DSS and RBI guideline awareness. Demonstrating domain knowledge here significantly improves your chance of an offer.' },
        ]),
        key_topics: JSON.stringify(['Payment Latency Percentiles', 'Merchant Funnel', 'A/B Testing', 'Route Optimization', 'Chargeback Analysis', 'Python Forecasting', 'Composite Metrics', 'Fintech Regulations']),
        prep_tips: JSON.stringify([
          'Learn to calculate percentiles in SQL using PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) — Razorpay P50/P90/P99 latency questions appear in almost every technical round.',
          'Understand Razorpay\'s merchant lifecycle: signup → KYC → API integration → test payment → first live transaction. Know how to write funnel conversion rate queries for each step.',
          'Study A/B testing methodology for payment systems: how to set up an experiment on routing algorithms, calculate lift, and check statistical significance using chi-square test.',
          'Know basic fintech regulations: PCI DSS (card data security), RBI guidelines on payment aggregators, chargeback rules. Mentioning these in HR/manager rounds shows domain seriousness.',
          'Research Razorpay\'s product suite: Payment Gateway, RazorpayX (business banking), Capital (lending), Magic Checkout. Case questions often reference merchant pain points across these.',
        ]),
        salary_range: '₹12L–₹22L',
        success_rate: 13,
      },
      {
        id: 'pc-meesho',
        name: 'Meesho',
        logo: '🛍️',
        color: '#8B5CF6',
        industry: 'Social Commerce',
        roles: JSON.stringify(['Business Analyst', 'Data Analyst', 'Product Analyst']),
        difficulty: 'Medium',
        interview_rounds: JSON.stringify([
          { round: 'Online Assessment', duration: '60 min', desc: 'Standard aptitude + SQL test. SQL: simple JOINs, GROUP BY, HAVING. Aptitude: data interpretation tables and bar charts. Not very hard compared to other top companies.' },
          { round: 'Technical + Case Study Round', duration: '60 min', desc: 'SQL basics + a product case: "How would you improve reseller activation rate?" They expect deep knowledge of Meesho\'s unique social commerce model and reseller metrics.' },
          { round: 'HR & Culture Round', duration: '30 min', desc: 'Meesho hires for culture fit strongly — young, fast-paced, tier-2/3 city focus. They ask about comfort with ambiguity, Excel/Sheets skills, and startup mindset.' },
        ]),
        key_topics: JSON.stringify(['Reseller Metrics', 'Viral Coefficient', 'Cohort Analysis', 'Category Penetration', 'Return Rate Analysis', 'SQL Aggregations', 'Excel/Sheets', 'Social Commerce']),
        prep_tips: JSON.stringify([
          'Study Meesho\'s unique business model deeply: social commerce via resellers, not direct-to-consumer. Resellers share products on WhatsApp/Facebook and earn commissions. This is completely different from Amazon/Flipkart.',
          'Know Meesho\'s key metrics: reseller activation rate (reaching 3 sales), viral coefficient K = (invites/user) × (conversion rate), GMV per reseller, and tier-2/3 city penetration.',
          'Don\'t underestimate Excel/Google Sheets proficiency — Meesho BA roles use spreadsheets heavily for day-to-day analysis. Pivot tables, VLOOKUP, and basic formulas are tested.',
          'Practice return abuse detection: users with >60% return rate and ≥10 orders in 90 days. Meesho has a significant challenge with return abuse from low-trust tier-2 markets.',
          'Research Meesho\'s Supplier Hub and how they work directly with manufacturers (cutting out distributors). Product questions often involve supplier onboarding and catalog quality metrics.',
        ]),
        salary_range: '₹7L–₹14L',
        success_rate: 25,
      },
      {
        id: 'pc-cred',
        name: 'CRED',
        logo: '💎',
        color: '#00C853',
        industry: 'Fintech',
        roles: JSON.stringify(['Analytics Engineer', 'Data Analyst', 'Product Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Recruiter Screen', duration: '20 min', desc: 'Quick fitment call — CRED looks for dbt + SQL + Python experience for Analytics Engineer roles. They are very specific about the tech stack required.' },
          { round: 'Advanced SQL Round', duration: '60 min', desc: 'Hardest SQL round in this list — recursive CTEs, custom aggregation logic, top-N across multiple partitions efficiently. Query optimization: CTEs vs subqueries, index design, query plans.' },
          { round: 'dbt & Data Modeling Round', duration: '60 min', desc: 'Design a dbt model for CRED\'s reward coin system: staging → intermediate → mart layers. Slowly changing dimensions, snapshot models, late-arriving data, dbt testing strategies.' },
          { round: 'Leadership & Culture Round', duration: '45 min', desc: 'CRED\'s high bar culture: drive data initiatives without being asked, handle stakeholder pushback, simplify complex problems. Ownership and first-principles thinking are assessed heavily.' },
        ]),
        key_topics: JSON.stringify(['Recursive CTEs', 'dbt Models', 'Data Modeling', 'Query Optimization', 'Funnel Analysis', 'Reward Metrics', 'Credit Score Analytics', 'A/B Testing']),
        prep_tips: JSON.stringify([
          'For Analytics Engineer roles, know dbt deeply: staging/intermediate/mart model layers, ref() and source() macros, dbt tests (unique, not_null, accepted_values), snapshots for SCD Type 2.',
          'Master recursive CTEs — CRED tests these specifically. Practice writing recursive SQL for hierarchical data (e.g., referral chains, bill payment sequences).',
          'Understand CRED\'s reward coin economy: users earn coins by paying bills, redeem coins for rewards (CRED Store, Jackpot, travel). Metrics: coin_earn_rate, coin_redemption_rate, reward_roi.',
          'Study Kimball dimensional modeling: fact tables, dimension tables, slowly changing dimensions (Type 1/2/3). CRED\'s data modeling round tests this directly.',
          'CRED\'s culture values people who proactively find and fix problems. Prepare 2-3 examples of data work you initiated without being asked — this is a strong differentiator in the culture round.',
        ]),
        salary_range: '₹14L–₹28L',
        success_rate: 10,
      },
      {
        id: 'pc-dream11',
        name: 'Dream11',
        logo: '🏏',
        color: '#1A73E8',
        industry: 'Gaming',
        roles: JSON.stringify(['Data Analyst', 'Product Analyst', 'BI Analyst']),
        difficulty: 'Medium',
        interview_rounds: JSON.stringify([
          { round: 'Online Assessment', duration: '60 min', desc: 'SQL + aptitude + analytical reasoning. Fantasy sports context: contest entry rates, player selection stats, match-format revenue. Medium difficulty SQL.' },
          { round: 'Technical SQL Round', duration: '60 min', desc: 'Contest optimization queries, captain/VC selection bias analysis, team duplication rate detection, revenue per match format (T20 vs ODI vs Test).' },
          { round: 'Product Sense Round', duration: '45 min', desc: '"How would you improve Dream11\'s team selection experience?" Metrics for user engagement, ARPU per match format, and defining success for a new feature.' },
          { round: 'HR Round', duration: '30 min', desc: 'Cricket/sports knowledge is a plus. Passion for the gaming domain, comfort with match-day spike analytics, and startup energy are assessed.' },
        ]),
        key_topics: JSON.stringify(['Fantasy Sports Metrics', 'ARPU Analysis', 'Contest Funnel', 'Player Selection Bias', 'Duplication Detection', 'Window Functions', 'SQL Aggregations', 'Python Optimization']),
        prep_tips: JSON.stringify([
          'Understand Dream11\'s business model: users pay entry fees to join contests; Dream11 takes a platform fee (10–15%). Key metrics are ARPU per match, contest_fill_rate, and team diversity.',
          'Know cricket statistics — at minimum understand what Captain/Vice-Captain multipliers mean in fantasy scoring (2x/1.5x). Domain knowledge helps you frame analytical questions contextually.',
          'Practice SQL for sports analytics: contest_entries JOIN users, calculating selection_rate per player, team duplication rate using canonical string hashing of 11-player selections.',
          'Study match-format ARPU differences: T20 (highest volume, most casual users), ODI (medium), Test matches (niche, hardcore users). The product round often asks you to maximize ARPU across formats.',
          'Python optimization question is common — write code to select an optimal 11-player team within a ₹100 budget using linear programming (PuLP) or greedy approach. Practice this.',
        ]),
        salary_range: '₹8L–₹16L',
        success_rate: 22,
      },
      {
        id: 'pc-walmart',
        name: 'Walmart Global Tech',
        logo: '🏪',
        color: '#0071CE',
        industry: 'Retail',
        roles: JSON.stringify(['Data Analyst', 'BI Engineer', 'Supply Chain Analyst']),
        difficulty: 'Hard',
        interview_rounds: JSON.stringify([
          { round: 'Online Assessment', duration: '90 min', desc: 'SQL + verbal + logical reasoning. Retail context: inventory turnover, demand forecasting accuracy, store performance. Questions are harder than average campus tests.' },
          { round: 'Technical SQL Round', duration: '60 min', desc: 'Inventory turnover ratio (COGS/avg_inventory), demand forecasting MAPE calculation, store performance composite scoring with normalized metrics and RANK().' },
          { round: 'Technical Analytics Round', duration: '60 min', desc: 'Supply chain disruption impact analysis, shrinkage analysis (expected vs actual inventory), Python market basket analysis using Apriori algorithm (mlxtend library).' },
          { round: 'Hiring Manager Round', duration: '45 min', desc: 'Retail domain knowledge: how Walmart uses data for replenishment, supplier scorecard design, and impact of supply chain disruptions on in-store availability.' },
          { round: 'HR Round', duration: '30 min', desc: 'Cultural fit for a global tech team under a retail conglomerate. Walmart values scale, process rigor, and global collaboration. Discuss comfort working across US-India time zones.' },
        ]),
        key_topics: JSON.stringify(['Inventory Metrics', 'Demand Forecasting', 'MAPE', 'Supply Chain Analytics', 'Market Basket Analysis', 'Store Performance', 'Composite Scoring', 'Python mlxtend']),
        prep_tips: JSON.stringify([
          'Learn retail-specific metrics: inventory turnover ratio (COGS/avg_inventory), shrinkage rate ((expected-actual)/expected), stockout rate, and days of supply (current_stock/daily_sales_rate).',
          'Understand MAPE (Mean Absolute Percentage Error) for forecasting accuracy: MAPE = mean(|actual-forecast|/actual) × 100. Walmart tests this in the SQL round — know how to write it in SQL.',
          'Study composite scoring in SQL: normalize metrics to 0–1 using (value - MIN) / (MAX - MIN) window functions, then apply weighted sum. Store performance benchmarking uses this pattern.',
          'Practice Python market basket analysis: build a binary item matrix from transactions, use mlxtend\'s apriori() function, filter association rules by lift > 2. Walmart specifically tests this.',
          'Research Walmart\'s India operations (Walmart Global Tech in Bengaluru): they build technology for Walmart US, Sam\'s Club, Flipkart, and PhonePe. Interviews may span retail + ecommerce contexts.',
        ]),
        salary_range: '₹10L–₹22L',
        success_rate: 14,
      },
    ];

    for (const co of placementCompanies) {
      await c.execute({
        sql: `INSERT OR IGNORE INTO placement_companies
          (id, name, logo, color, industry, roles, difficulty, interview_rounds, key_topics, prep_tips, salary_range, success_rate, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        args: [co.id, co.name, co.logo, co.color, co.industry, co.roles, co.difficulty,
               co.interview_rounds, co.key_topics, co.prep_tips, co.salary_range, co.success_rate],
      });
    }
  } catch(e) { console.log('Placement companies seed error:', e.message); }

  // Always ensure admin account has premium access and correct role
  try { await c.execute("UPDATE users SET is_premium=1, role='admin' WHERE email='ak384837@gmail.com'"); } catch(e) {}

  console.log('✅ Database ready');
  return null;
}

module.exports = { initDb, run, get, all };
