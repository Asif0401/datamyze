const express = require('express');
const { get, all, run } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

// ── Seed helper — called on first GET and from /force-seed ──────────
async function runSeed(db) {
  const companies = [
    { id: uuidv4(), name: 'Flipkart',           logo: '🛒', color: '#2874F0', industry: 'E-commerce',    difficulty: 'Medium', qc: 7 },
    { id: uuidv4(), name: 'Amazon India',        logo: '📦', color: '#FF9900', industry: 'E-commerce',    difficulty: 'Hard',   qc: 7 },
    { id: uuidv4(), name: 'Swiggy',              logo: '🍔', color: '#FC8019', industry: 'Food Delivery', difficulty: 'Medium', qc: 6 },
    { id: uuidv4(), name: 'Zomato',              logo: '🍕', color: '#E23744', industry: 'Food Delivery', difficulty: 'Medium', qc: 6 },
    { id: uuidv4(), name: 'PhonePe',             logo: '💸', color: '#5F259F', industry: 'Fintech',       difficulty: 'Medium', qc: 6 },
    { id: uuidv4(), name: 'Razorpay',            logo: '💳', color: '#2962FF', industry: 'Fintech',       difficulty: 'Hard',   qc: 6 },
    { id: uuidv4(), name: 'Meesho',              logo: '🛍️', color: '#8B5CF6', industry: 'Social Commerce', difficulty: 'Easy', qc: 5 },
    { id: uuidv4(), name: 'Walmart Global Tech', logo: '🏪', color: '#0071CE', industry: 'Retail',        difficulty: 'Hard',   qc: 6 },
    { id: uuidv4(), name: 'CRED',                logo: '💎', color: '#00C853', industry: 'Fintech',       difficulty: 'Hard',   qc: 5 },
    { id: uuidv4(), name: 'Dream11',             logo: '🏏', color: '#1A73E8', industry: 'Gaming',        difficulty: 'Medium', qc: 5 },
  ];
  for (const co of companies) {
    try {
      await run(db, `INSERT OR IGNORE INTO company_banks (id,name,logo,color,industry,question_count,difficulty) VALUES (?,?,?,?,?,?,?)`,
        [co.id, co.name, co.logo, co.color, co.industry, co.qc, co.difficulty]);
    } catch(e) {}
  }

  const dbCos = await all(db, 'SELECT id, name FROM company_banks');
  const cmap = {};
  for (const co of dbCos) cmap[co.name] = co.id;

  const qs = [
    ['Flipkart','Top Categories by Revenue','Find the top 3 product categories by total revenue for each quarter in 2023 using window functions.','SQL','Hard','Window Functions','Use RANK() OVER (PARTITION BY quarter ORDER BY SUM(revenue) DESC). Group by quarter+category in a CTE, then rank.',40,1],
    ['Flipkart','Returning vs New Users','Find the count of new vs returning users for each month in 2023.','SQL','Medium','Date Filtering','JOIN orders with MIN(order_date) per user subquery. Users whose MIN date is in target month = new; rest = returning.',30,2],
    ['Flipkart','Month-over-Month GMV Growth','Calculate MoM GMV growth rate. Output: month, GMV, prev_month_GMV, growth_pct.','SQL','Medium','Aggregations','LAG(SUM(order_value),1) OVER (ORDER BY month). growth_pct = (current - prev)/prev * 100.',30,3],
    ['Flipkart','High Return Rate Sellers','Find sellers whose return rate exceeds 20% in the last 6 months.','SQL','Easy','Joins','JOIN orders with returns on order_id. GROUP BY seller_id. HAVING COUNT(returns)/COUNT(orders) > 0.2.',20,4],
    ['Flipkart','Cart Abandonment Funnel','Find cart abandonment rate by device type for the past 30 days.','SQL','Medium','Funnel Analysis','LEFT JOIN cart_events with purchase_events on session_id. Abandonment = sessions with cart add but no purchase / total cart-add sessions.',30,5],
    ['Flipkart','Python: Cohort Retention','Build a monthly cohort retention table using Pandas.','Python','Hard','Cohort Analysis','Create cohort_month from first order date. Merge back to get offset. Pivot to create retention matrix. Normalize by cohort size.',40,6],
    ['Flipkart','Inventory Stockout Prediction','Flag SKUs likely to go out of stock within 7 days.','Analytical','Hard','Business Problem','avg_daily_depletion = sold_units/days. Flag where current_stock/avg_daily < 7. Mention seasonality adjustments.',35,7],
    ['Amazon India','Prime vs Non-Prime Purchase Frequency','Compare average monthly purchase frequency between Prime and non-Prime users.','SQL','Medium','Aggregations','COUNT(orders)/COUNT(DISTINCT months) per user. JOIN users for Prime status. AVG by segment.',30,1],
    ['Amazon India','Delivery SLA Breach','Find % of orders that breached promised delivery SLA, grouped by logistics partner and city tier.','SQL','Medium','Date Functions','ROUND(SUM(CASE WHEN delivered_date > promised_date THEN 1 ELSE 0 END)*100.0/COUNT(*),2) GROUP BY partner, city_tier.',30,2],
    ['Amazon India','Session to Purchase Conversion','Calculate conversion rate from browse session to purchase for each product category.','SQL','Hard','Funnel Analysis','sessions LEFT JOIN orders on session_id. Conversion = orders/sessions per category.',40,3],
    ['Amazon India','Review Sentiment vs Rating','Find products where star rating >= 4 but review text contains negative keywords.','SQL','Medium','String Matching','WHERE stars >= 4 AND LOWER(review_text) LIKE any negative keyword. Flags fake/inconsistent reviews.',30,4],
    ['Amazon India','Python: Price Elasticity','Calculate price elasticity of demand for top 10 categories using weekly price and volume data.','Python','Hard','Statistics','Elasticity = change_qty / change_price. Use pct_change() on grouped data. np.polyfit for regression.',40,5],
    ['Amazon India','Seller Health Score','Design a Seller Health Score combining delivery rate, return rate, rating, and response time.','Analytical','Hard','Metric Design','Normalize each 0-1. Weights: delivery 30%, returns 25%, rating 30%, response 15%. Flag score < 0.6.',40,6],
    ['Amazon India','Cross-sell Opportunities','Find top 10 product pairs frequently bought together with co-occurrence count and lift.','SQL','Hard','Market Basket','Self-join order_items on order_id. Lift = P(A and B)/(P(A)*P(B)).',40,7],
    ['Swiggy','Peak Hour Demand Analysis','Find avg orders per hour by city for weekdays vs weekends. Find top 2 peak hours per city.','SQL','Medium','Date Functions','EXTRACT(HOUR) and DAYOFWEEK. GROUP BY city, hour, day_type. RANK() OVER (PARTITION BY city, day_type ORDER BY avg_orders DESC).',30,1],
    ['Swiggy','Restaurant Churn Prediction','Find restaurants with no orders for 30+ consecutive days after being active.','SQL','Hard','Date Functions','LAG(order_date) OVER (PARTITION BY restaurant_id ORDER BY order_date). Find gaps > 30 days.',40,2],
    ['Swiggy','Delivery Partner Efficiency','Find avg delivery time per partner. Flag partners 20% above city median.','SQL','Medium','Aggregations','City median via PERCENTILE_CONT(0.5). FLAG WHERE partner_avg > city_median * 1.2.',30,3],
    ['Swiggy','Repeat Order Rate by Cuisine','What % of customers who ordered Italian in month 1 also ordered Italian in month 2?','SQL','Medium','Cohort Analysis','Self-join on customer_id for month 1 and month 2 Italian orders. Repeat rate = matched / month1 total.',30,4],
    ['Swiggy','Python: Surge Pricing Model','Write Python to calculate a surge multiplier (1x to 3x) from order volume and driver availability.','Python','Hard','Business Logic','surge = demand/supply ratio. ratio > 2.0 = 3x, > 1.5 = 2x, > 1.2 = 1.5x, else 1x. Smooth with rolling average.',40,5],
    ['Swiggy','7-Day Rolling AOV','Show 7-day rolling average of order value per city. Highlight days AOV dropped 15%+ from rolling avg.','SQL','Medium','Window Functions','AVG(order_value) OVER (PARTITION BY city ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Flag current < rolling * 0.85.',30,6],
    ['Zomato','Gold Membership Impact','Compare order frequency and value between Gold members and non-Gold users pre/post subscription.','SQL','Medium','Aggregations','Compare avg_order_value and orders_per_month before and after subscription_date per user.',35,1],
    ['Zomato','Restaurant Rating Drift','Find restaurants whose avg rating declined by more than 0.5 stars over the last 3 months vs prior 3 months.','SQL','Medium','Date Functions','AVG rating in last 3 months vs prev 3 months. HAVING new_avg < old_avg - 0.5.',30,2],
    ['Zomato','Hyperpure Reorder Frequency','Find ingredient categories with highest reorder frequency and avg days between orders per restaurant.','SQL','Medium','Date Functions','LAG(order_date) OVER (PARTITION BY restaurant_id, category ORDER BY order_date). AVG gap per category.',30,3],
    ['Zomato','Discount vs Net Revenue','Do restaurants offering heavy discounts see higher net revenue? Analyze revenue impact.','SQL','Hard','Business Metric','net_revenue = order_value - discount. Compare avg net_revenue by discount_bracket (0%, 1-10%, 11-20%, 20%+).',40,4],
    ['Zomato','Python: ETA Accuracy','Given predicted vs actual delivery time, calculate ETA accuracy and find key influencing factors.','Python','Hard','Statistics','MAE = mean(|actual-predicted|). Correlation with distance, time_of_day, weather. Group by time buckets.',40,5],
    ['Zomato','RFM User Segmentation','Segment users into High/Medium/Low LTV using RFM model.','SQL','Hard','RFM Analysis','Recency = DATEDIFF(today, MAX(order_date)). Frequency = COUNT(orders). Monetary = SUM(value). NTILE(3) per metric.',40,6],
    ['PhonePe','Transaction Success Rate by Bank','Calculate payment success rate for each bank by transaction type. Flag banks below 95%.','SQL','Medium','Aggregations','SUM(CASE WHEN status=success THEN 1 ELSE 0 END)/COUNT(*) per bank + type. HAVING success_rate < 0.95.',30,1],
    ['PhonePe','Fraud Detection Signals','Flag potentially fraudulent accounts: >10 failed txns in 1 hour, >5 device_ids in a day, or state mismatch.','SQL','Hard','Window Functions','COUNT(*) OVER (PARTITION BY user_id ORDER BY txn_time). Flag users exceeding thresholds.',40,2],
    ['PhonePe','D30 Retention by Channel','Of users who installed in Jan 2024 per channel, what % made at least one txn within 30 days?','SQL','Medium','Cohort Analysis','LEFT JOIN transactions WHERE txn_date <= install_date + 30. Retention = COUNT(txn)/COUNT(install) per channel.',30,3],
    ['PhonePe','Merchant GMV Concentration','Find top 10% merchants by GMV and their % share of total platform GMV (Pareto analysis).','SQL','Medium','Window Functions','NTILE(10) OVER (ORDER BY gmv DESC). Filter NTILE=1. Their GMV / total GMV * 100.',30,4],
    ['PhonePe','Python: Anomaly Detection','Detect anomalous spikes in hourly transaction volume using Python.','Python','Hard','Statistics','Rolling mean +/- 2*std as control limits. Flag hours outside bounds. pandas rolling(24).mean() and .std().',40,5],
    ['PhonePe','UPI Switch Rate Analysis','What % of users switched from a competitor UPI app to PhonePe in Q3? Top reasons?','Analytical','Medium','Business Problem','Join survey_responses with user_acquisition. Count users who reported competitor usage pre-Q3 and are now on PhonePe.',30,6],
    ['Razorpay','Payment Gateway Latency','Find P50, P90, P99 latency by payment method and time of day. Flag if P99 exceeds 3000ms SLA.','SQL','Hard','Percentiles','PERCENTILE_CONT(0.5/0.9/0.99) WITHIN GROUP (ORDER BY latency_ms) per method + time_bucket. Flag P99 > 3000.',40,1],
    ['Razorpay','Merchant Activation Funnel','Track merchants from signup to first live payment. Calculate step-by-step conversion and avg days.','SQL','Hard','Funnel Analysis','LEFT JOIN events in sequence. Conversion = users completing step N / step N-1. DATEDIFF for time between steps.',40,2],
    ['Razorpay','Chargeback Rate by Industry','Find chargeback rate by merchant industry vertical. Flag verticals above RBI threshold of 1%.','SQL','Medium','Aggregations','JOIN chargebacks with transactions. GROUP BY industry_vertical. HAVING chargeback_rate > 0.01.',30,3],
    ['Razorpay','Acquirer Route Optimization','Find best acquirer per card network by combining success rate and latency into a composite score.','SQL','Hard','Multi-metric','COMPOSITE = (success_rate * 0.7) + ((1 - normalized_latency) * 0.3). RANK() per card_network.',40,4],
    ['Razorpay','Python: Revenue Forecasting','Forecast next 3 months of payment volume using Python.','Python','Hard','Forecasting','Use Facebook Prophet or ARIMA. prophet.fit(df). prophet.predict(future). Evaluate with MAPE.',40,5],
    ['Razorpay','A/B Test: Smart Routing Impact','Did smart routing improve success rates? Design an A/B analysis for control vs treatment.','Analytical','Hard','A/B Testing','Chi-square test on success/failure counts. Lift = (treatment - control) / control. Check statistical significance.',40,6],
    ['Meesho','Reseller Activation Time','Find avg days for resellers to make their 3rd sale, grouped by acquisition month.','SQL','Medium','Aggregations','Get 3rd order date per reseller. DATEDIFF(3rd_order_date, registration_date). AVG by acquisition_month.',30,1],
    ['Meesho','Viral Coefficient','Calculate viral coefficient K = (invites sent per user) x (conversion rate of invites).','SQL','Medium','Business Metric','AVG(invites_sent) x (COUNT(successful_referrals) / COUNT(invites_sent)). Single query.',30,2],
    ['Meesho','Return Abuse Detection','Find users with return rate > 60% over last 90 days with at least 10 orders.','SQL','Easy','Aggregations','GROUP BY user_id. HAVING returns/orders > 0.6 AND COUNT(orders) >= 10.',20,3],
    ['Meesho','Category Penetration: Tier-2 Cities','Which categories have highest order penetration in Tier-2/3 vs Tier-1 cities?','SQL','Medium','Segmentation','COUNT(DISTINCT users ordering category) / COUNT(DISTINCT city users). GROUP BY city_tier, category.',30,4],
    ['Meesho','Python: Optimal Price Point','Find the price that maximizes revenue given historical sales at different price points.','Python','Medium','Optimization','Plot price vs revenue. Fit polynomial curve. np.polyfit + np.poly1d. Find maximum.',35,5],
    ['Walmart Global Tech','Inventory Turnover Ratio','Calculate inventory turnover (COGS/avg_inventory) per category per quarter. Flag ratio < 2.','SQL','Medium','Aggregations','AVG((opening+closing)/2) = avg_inventory. turnover = COGS/avg_inventory. HAVING turnover < 2.',30,1],
    ['Walmart Global Tech','Demand Forecast Accuracy','Compare forecasted vs actual demand by SKU. Calculate MAPE per category.','SQL','Hard','Statistics','SUM(ABS(actual-forecast)/actual)*100/COUNT(*) = MAPE per category.',35,2],
    ['Walmart Global Tech','Store Performance Benchmarking','Rank stores by composite score: sales growth 40%, avg transaction value 30%, CSAT 30%.','SQL','Hard','Composite Metric','(value - MIN)/(MAX - MIN) for each metric using window functions. Weighted sum = score. RANK() by score.',40,3],
    ['Walmart Global Tech','Supply Chain Disruption Impact','Quantify stockout rate increase in 2 weeks following a supplier delay event.','SQL','Hard','Impact Analysis','JOIN supplier_delays with stockout_events. DATEDIFF filter 0-14 days post-delay. Compare to baseline.',40,4],
    ['Walmart Global Tech','Python: Market Basket Analysis','Use Apriori algorithm to find frequent itemsets and top 10 association rules by lift.','Python','Hard','ML','from mlxtend import apriori, association_rules. Binary matrix. min_support=0.01. Filter lift > 2.',40,5],
    ['Walmart Global Tech','Shrinkage Analysis','Find top 10 SKUs by shrinkage amount and rate per store cluster.','SQL','Medium','Business Metric','shrinkage = (opening + received - sold) - closing. GROUP BY sku + store_cluster. TOP 10 by SUM(shrinkage).',30,6],
    ['CRED','Credit Score Segmentation','Segment members by credit score bands. Show avg spend, bill payment rate, and product adoption per band.','SQL','Medium','Segmentation','CASE WHEN score < 650 THEN band. GROUP BY band. Multiple aggregations.',30,1],
    ['CRED','Coin Redemption Funnel','Track coins_earned to coins_redeemed to purchase_completed. Drop-off at each stage?','SQL','Medium','Funnel Analysis','LEFT JOIN funnel stages. Conversion at each step. GROUP BY reward_category.',30,2],
    ['CRED','Bill Payment Prediction','Which members are likely to miss their credit card bill payment this month?','Analytical','Hard','ML Design','Features: payment_history, outstanding/limit, income_proxy, utilization. Logistic regression or XGBoost.',40,3],
    ['CRED','Jackpot Feature ROI','Analyze impact of Jackpot spin feature on DAU, session length, and bill payments pre/post launch.','SQL','Hard','Pre-Post Analysis','Pre: 30 days before launch. Post: 30 days after. Compare KPIs. Check statistical significance.',40,4],
    ['CRED','Python: Reward Recommendation','Recommend top 3 rewards for a new member using collaborative filtering.','Python','Hard','ML','User-item matrix of redemptions. cosine_similarity or SVD. k nearest neighbors.',40,5],
    ['Dream11','Contest Entry Optimization','Find avg contests per user per match, segmented by historical win rate.','SQL','Medium','Aggregations','COUNT(contests)/COUNT(DISTINCT matches) per user. NTILE(4) to create win_rate quartiles.',30,1],
    ['Dream11','Team Duplication Rate','What % of teams for a match have identical 11-player selection?','SQL','Hard','String Matching','Hash sorted player list into canonical string per team. COUNT(DISTINCT canonical)/COUNT(total).',40,2],
    ['Dream11','Captain/VC Selection Bias','Which players are most over-selected as C/VC vs their actual fantasy points?','SQL','Medium','Aggregations','selection_rate = COUNT(C or VC) / total_teams. over_selection_ratio = selection_rate / avg_fantasy_pts.',30,3],
    ['Dream11','Revenue per Match Format','Compare ARPU for T20, ODI, and Test matches.','SQL','Easy','Aggregations','SUM(entry_fees) / COUNT(DISTINCT user_id) per match_format. Simple GROUP BY.',20,4],
    ['Dream11','Python: Optimal Team Builder','Select optimal 11 players within a budget to maximize predicted_points.','Python','Hard','Optimization','PuLP linear programming or greedy. Constraints: budget, position requirements. Maximize SUM(predicted_points).',40,5],
  ];

  for (const [coName, title, question, type, diff, topic, approach, xp, order] of qs) {
    const coId = cmap[coName];
    if (!coId) continue;
    try {
      await run(db,
        `INSERT OR IGNORE INTO company_bank_questions (id,company_id,title,question,type,difficulty,topic,approach,xp_reward,order_index) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [uuidv4(), coId, title, question, type, diff, topic, approach, xp, order]
      );
    } catch(e) {}
  }

  // Update question counts
  for (const co of dbCos) {
    try {
      const cnt = await get(db, 'SELECT COUNT(*) as c FROM company_bank_questions WHERE company_id=?', [co.id]);
      await run(db, 'UPDATE company_banks SET question_count=? WHERE id=?', [cnt.c, co.id]);
    } catch(e) {}
  }
}

// GET /api/company-banks — list all companies; auto-seeds on first call if empty
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    let companies = await all(db, `SELECT * FROM company_banks WHERE is_active=1 ORDER BY name ASC`);
    if (companies.length === 0) {
      await runSeed(db);
      companies = await all(db, `SELECT * FROM company_banks WHERE is_active=1 ORDER BY name ASC`);
    }
    res.json({ companies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/company-banks/:id/questions — premium only
router.get('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
    const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
    if (!isAdmin && !user?.is_premium) {
      return res.status(403).json({ error: 'Premium membership required', premium_required: true });
    }
    const company = await get(db, 'SELECT * FROM company_banks WHERE id = ?', [req.params.id]);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const questions = await all(db,
      `SELECT * FROM company_bank_questions WHERE company_id = ? ORDER BY order_index ASC`,
      [req.params.id]
    );
    res.json({ company, questions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin routes ────────────────────────────────────────
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin' && req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

// POST /api/company-banks/force-seed — admin: seed all companies & questions
router.post('/force-seed', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await runSeed(db);
    const companies = await all(db, 'SELECT * FROM company_banks');
    res.json({ success: true, companies: companies.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/company-banks — add company
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, logo, color, industry, difficulty } = req.body;
    const id = uuidv4();
    await run(db, `INSERT INTO company_banks (id,name,logo,color,industry,difficulty) VALUES (?,?,?,?,?,?)`,
      [id, name, logo || '🏢', color || '#4A90D9', industry || 'Technology', difficulty || 'Medium']);
    res.json({ id, success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/company-banks/:id/questions — add question
router.post('/:id/questions', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { title, question, type, difficulty, topic, approach, xp_reward, order_index } = req.body;
    const id = uuidv4();
    await run(db,
      `INSERT INTO company_bank_questions (id,company_id,title,question,type,difficulty,topic,approach,xp_reward,order_index) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, req.params.id, title, question, type || 'SQL', difficulty || 'Medium', topic || 'General', approach || '', xp_reward || 30, order_index || 0]
    );
    // Update question_count
    await run(db, `UPDATE company_banks SET question_count = (SELECT COUNT(*) FROM company_bank_questions WHERE company_id=?) WHERE id=?`,
      [req.params.id, req.params.id]);
    res.json({ id, success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/company-banks/questions/:qid
router.delete('/questions/:qid', authMiddleware, adminOnly, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const q = await get(db, 'SELECT company_id FROM company_bank_questions WHERE id=?', [req.params.qid]);
    if (!q) return res.status(404).json({ error: 'Not found' });
    await run(db, 'DELETE FROM company_bank_questions WHERE id=?', [req.params.qid]);
    await run(db, `UPDATE company_banks SET question_count = (SELECT COUNT(*) FROM company_bank_questions WHERE company_id=?) WHERE id=?`,
      [q.company_id, q.company_id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
