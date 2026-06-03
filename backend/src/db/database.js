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

  // ── Company Question Banks ─────────────────────────
  await c.execute(`
    CREATE TABLE IF NOT EXISTS company_banks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
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
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed company banks only if empty
  try {
    const existing = await c.execute('SELECT COUNT(*) as cnt FROM company_banks');
    if (existing.rows[0].cnt === 0) {
      const companies = [
        { id: uuidv4(), name: 'Flipkart',           logo: '🛒', color: '#2874F0', industry: 'E-commerce',   difficulty: 'Medium', question_count: 7 },
        { id: uuidv4(), name: 'Amazon India',        logo: '📦', color: '#FF9900', industry: 'E-commerce',   difficulty: 'Hard',   question_count: 7 },
        { id: uuidv4(), name: 'Swiggy',              logo: '🍔', color: '#FC8019', industry: 'Food Delivery', difficulty: 'Medium', question_count: 6 },
        { id: uuidv4(), name: 'Zomato',              logo: '🍕', color: '#E23744', industry: 'Food Delivery', difficulty: 'Medium', question_count: 6 },
        { id: uuidv4(), name: 'PhonePe',             logo: '💸', color: '#5F259F', industry: 'Fintech',       difficulty: 'Medium', question_count: 6 },
        { id: uuidv4(), name: 'Razorpay',            logo: '💳', color: '#2962FF', industry: 'Fintech',       difficulty: 'Hard',   question_count: 6 },
        { id: uuidv4(), name: 'Meesho',              logo: '🛍️', color: '#8B5CF6', industry: 'Social Commerce',difficulty:'Easy',   question_count: 5 },
        { id: uuidv4(), name: 'Walmart Global Tech', logo: '🏪', color: '#0071CE', industry: 'Retail',        difficulty: 'Hard',   question_count: 6 },
        { id: uuidv4(), name: 'CRED',                logo: '💎', color: '#00C853', industry: 'Fintech',       difficulty: 'Hard',   question_count: 5 },
        { id: uuidv4(), name: 'Dream11',             logo: '🏏', color: '#1A73E8', industry: 'Gaming',        difficulty: 'Medium', question_count: 5 },
      ];
      for (const co of companies) {
        await c.execute({ sql: `INSERT INTO company_banks (id,name,logo,color,industry,question_count,difficulty) VALUES (?,?,?,?,?,?,?)`,
          args: [co.id, co.name, co.logo, co.color, co.industry, co.question_count, co.difficulty] });
      }

      // Helper to insert a question
      const q = async (companyName, title, question, type, difficulty, topic, approach, xp, order) => {
        const co = companies.find(c => c.name === companyName);
        if (!co) return;
        await c.execute({ sql: `INSERT INTO company_bank_questions (id,company_id,title,question,type,difficulty,topic,approach,xp_reward,order_index) VALUES (?,?,?,?,?,?,?,?,?,?)`,
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
    }
  } catch(e) { console.log('Company bank seed error:', e.message); }

  // Always ensure admin account has premium access and correct role
  try { await c.execute("UPDATE users SET is_premium=1, role='admin' WHERE email='ak384837@gmail.com'"); } catch(e) {}

  console.log('✅ Database ready');
  return null;
}

module.exports = { initDb, run, get, all };
