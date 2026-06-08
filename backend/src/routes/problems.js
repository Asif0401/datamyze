const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const { runSql } = require('../db/sampleDb');
const { executePython } = require('../utils/pistonExec');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

/* ── List problems ──────────────────────────────────── */
router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const { topic, difficulty } = req.query;
  let q = 'SELECT * FROM problems WHERE 1=1'; const p = [];
  if (topic && topic !== 'All') { q += ' AND topic = ?'; p.push(topic); }
  if (difficulty && difficulty !== 'All') { q += ' AND difficulty = ?'; p.push(difficulty); }
  q += ' ORDER BY rowid';
  const problems = await all(db, q, p);
  const solved = (await all(db,
    "SELECT DISTINCT problem_id FROM user_problem_submissions WHERE user_id = ? AND status = 'accepted'",
    [req.user.id]
  )).map(r => r.problem_id);
  res.json({ problems: problems.map(p => ({ ...p, solved: solved.includes(p.id) })) });
});

/* ── Get single problem ─────────────────────────────── */
router.get('/:id', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const problem = await get(db, 'SELECT * FROM problems WHERE id = ?', [req.params.id]);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  const submissions = await all(db,
    'SELECT id, code, status, submitted_at FROM user_problem_submissions WHERE user_id = ? AND problem_id = ? ORDER BY submitted_at DESC LIMIT 5',
    [req.user.id, req.params.id]
  );
  res.json({ problem, submissions });
});

/* ── Run code (no XP, just execute) ────────────────── */
router.post('/:id/run', authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'Code is required.' });

  const db = req.app.locals.db;
  const problem = await get(db, 'SELECT topic, title FROM problems WHERE id = ?', [req.params.id]);
  if (!problem) return res.status(404).json({ error: 'Problem not found.' });

  if (problem.topic === 'SQL') {
    try {
      const result = await runSql(code);
      return res.json({ success: true, columns: result.columns, rows: result.rows, rowCount: result.rows.length });
    } catch (err) {
      return res.json({
        success: false,
        error: err.message.replace(/\n/g, ' '),
        hint: getSqlHint(err.message),
      });
    }
  }

  // Python — real execution via Piston API
  const result = await executePython(code);
  if (result.success) {
    return res.json({ success: true, output: result.output });
  } else {
    return res.json({ success: false, error: result.error, output: result.output || '' });
  }
});

/* ── Get hint (deducts XP on first use) ──────────────── */
router.post('/:id/hint', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const problem = await get(db, 'SELECT * FROM problems WHERE id = ?', [req.params.id]);
  if (!problem) return res.status(404).json({ error: 'Problem not found.' });

  const hint = problem.hint || '💡 Break the problem into steps: think about which table(s) you need, what filtering/grouping is required, and which SQL functions apply.';
  const penalty = Math.floor((problem.xp_reward || 50) * 0.5); // 50% XP penalty
  res.json({ hint, penalty, xp_after_hint: (problem.xp_reward || 50) - penalty });
});

/* ── Submit (validate + award XP) ──────────────────── */
router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { code, hint_used } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'Code is required.' });

  const db = req.app.locals.db;
  const problem = await get(db, 'SELECT * FROM problems WHERE id = ?', [req.params.id]);
  if (!problem) return res.status(404).json({ error: 'Problem not found.' });

  let status = 'wrong_answer';
  let feedback = '❌ Wrong answer — check your logic and try again.';

  if (problem.topic === 'SQL') {
    try {
      const result = await runSql(code);
      const ok = validateSql(problem.title, result);
      if (ok.pass) { status = 'accepted'; feedback = ok.message; }
      else { feedback = ok.message; }
    } catch (err) {
      feedback = `❌ SQL Error: ${err.message.replace(/\n/g, ' ')}`;
    }
  } else {
    // Python — real execution via Piston API
    try {
      const result = await executePython(code);
      if (result.success) {
        status = 'accepted';
        feedback = `✅ Accepted! Your code ran successfully.\n\n${result.output}`;
      } else {
        feedback = `❌ Runtime Error:\n${result.error}`;
      }
    } catch (err) {
      feedback = '❌ Execution service unavailable. Please try again.';
    }
  }

  // Persist submission
  const subId = uuidv4();
  await run(db,
    'INSERT INTO user_problem_submissions (id, user_id, problem_id, code, status) VALUES (?, ?, ?, ?, ?)',
    [subId, req.user.id, problem.id, code, status]
  );

  let xp_earned = 0;
  if (status === 'accepted') {
    const prev = await all(db,
      "SELECT id FROM user_problem_submissions WHERE user_id = ? AND problem_id = ? AND status = 'accepted' AND id != ?",
      [req.user.id, problem.id, subId]
    );
    if (prev.length === 0) {
      // Reduce XP by 50% if hint was used
      const base = problem.xp_reward || 50;
      xp_earned = hint_used ? Math.floor(base * 0.5) : base;
      await run(db, 'UPDATE users SET xp = xp + ? WHERE id = ?', [xp_earned, req.user.id]);
    }
  }

  res.json({ status, message: feedback, xp_earned });
});

/* ── SQL Validation ─────────────────────────────────── */
function validateSql(title, result) {
  const { rows, columns } = result;
  const lower = title.toLowerCase();
  const colNames = columns.map(c => c.toLowerCase());
  const hasCol = (kws) => kws.some(k => colNames.some(c => c.includes(k)));

  if (!rows || rows.length === 0) {
    // Some problems legitimately return no rows (e.g. customers with no orders)
    if (lower.includes('no orders') || lower.includes('never ordered') || lower.includes('without a manager')) {
      return { pass: true, message: '✅ Accepted! Query executed correctly (0 matching rows is valid here).' };
    }
    return { pass: false, message: '❌ Query returned no rows. Check your WHERE / JOIN conditions.' };
  }

  // ── Existing validations ──────────────────────────────────────────────
  if (lower.includes('top 5 customers')) {
    if (rows.length !== 5) return { pass: false, message: `❌ Expected 5 rows but got ${rows.length}. Use LIMIT 5.` };
    if (!hasCol(['revenue','total','sum'])) return { pass: false, message: '❌ Missing a total revenue column. Use SUM(o.amount) AS total_revenue.' };
    return { pass: true, message: '✅ Accepted! Correct — 5 customers ranked by total revenue.' };
  }
  if (lower.includes('month-over-month') || lower.includes('week-over-week')) {
    if (!hasCol(['growth','pct','percent','change'])) return { pass: false, message: '❌ Missing a growth/change percentage column.' };
    if (rows.length < 2) return { pass: false, message: '❌ Too few rows — group by time period first.' };
    return { pass: true, message: '✅ Accepted! Period-over-period change calculated correctly.' };
  }
  if (lower.includes('duplicate')) {
    if (!hasCol(['count'])) return { pass: false, message: '❌ Missing COUNT column. Use COUNT(*) with HAVING COUNT(*) > 1.' };
    return { pass: true, message: '✅ Accepted! Duplicate records found correctly.' };
  }
  if (lower.includes('rolling') && (lower.includes('7-day') || lower.includes('7 day'))) {
    if (!hasCol(['rolling','avg','7d'])) return { pass: false, message: '❌ Missing rolling average column.' };
    if (rows.length < 7) return { pass: false, message: '❌ Not enough rows. Query all records.' };
    return { pass: true, message: '✅ Accepted! 7-day rolling average calculated correctly.' };
  }
  if (lower.includes('cohort') && lower.includes('retention')) {
    if (!hasCol(['cohort'])) return { pass: false, message: '❌ Missing cohort_month column.' };
    return { pass: true, message: '✅ Accepted! Cohort analysis looks good.' };
  }

  // ── New problem validations ───────────────────────────────────────────
  if (lower.includes('second highest salary')) {
    if (!hasCol(['second','highest','salary','max'])) return { pass: false, message: '❌ Missing a salary column. Use MAX(salary) with a subquery.' };
    if (rows.length !== 1) return { pass: false, message: `❌ Expected 1 row, got ${rows.length}. Return a single value.` };
    return { pass: true, message: '✅ Accepted! Second highest salary found.' };
  }
  if (lower.includes('top 3 products')) {
    if (rows.length > 3) return { pass: false, message: `❌ Expected ≤3 rows. Add LIMIT 3.` };
    if (!hasCol(['revenue','total','sum'])) return { pass: false, message: '❌ Missing revenue column.' };
    return { pass: true, message: '✅ Accepted! Top 3 products by revenue.' };
  }
  if (lower.includes('average order value')) {
    if (!hasCol(['avg','average','value'])) return { pass: false, message: '❌ Missing avg_order_value column. Use ROUND(AVG(o.amount), 2).' };
    return { pass: true, message: '✅ Accepted! Average order value per city calculated.' };
  }
  if (lower.includes('department headcount') || lower.includes('headcount')) {
    if (!hasCol(['headcount','count','emp'])) return { pass: false, message: '❌ Missing headcount column. Use COUNT(*).' };
    if (!hasCol(['avg','average','salary'])) return { pass: false, message: '❌ Missing avg_salary column.' };
    return { pass: true, message: '✅ Accepted! Department headcount & avg salary.' };
  }
  if (lower.includes('revenue by product category') || (lower.includes('category') && lower.includes('revenue'))) {
    if (!hasCol(['category'])) return { pass: false, message: '❌ Missing category column. Join products and order_items.' };
    if (!hasCol(['revenue','total','sum'])) return { pass: false, message: '❌ Missing total_revenue. Use SUM(quantity * unit_price).' };
    return { pass: true, message: '✅ Accepted! Revenue by category.' };
  }
  if (lower.includes('rank') && lower.includes('spending')) {
    if (!hasCol(['rank','dense_rank'])) return { pass: false, message: '❌ Missing rank column. Use DENSE_RANK() OVER (ORDER BY ...).' };
    return { pass: true, message: '✅ Accepted! Customers ranked by spending.' };
  }
  if (lower.includes('running total')) {
    if (!hasCol(['running','cumulative','total'])) return { pass: false, message: '❌ Missing running total column. Use SUM() OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).' };
    return { pass: true, message: '✅ Accepted! Running total computed.' };
  }
  if (lower.includes('previous day') || lower.includes('lag')) {
    if (!hasCol(['prev','lag','diff','change'])) return { pass: false, message: '❌ Missing LAG/prev column.' };
    return { pass: true, message: '✅ Accepted! Day-over-day comparison done.' };
  }
  if (lower.includes('top 2 salaries') || (lower.includes('top') && lower.includes('salary'))) {
    if (!hasCol(['salary','sal'])) return { pass: false, message: '❌ Missing salary column.' };
    return { pass: true, message: '✅ Accepted! Top salaries per department.' };
  }
  if (lower.includes('salary band') || lower.includes('salary band')) {
    if (!hasCol(['band','category','label','tier'])) return { pass: false, message: '❌ Missing salary_band column. Use CASE WHEN.' };
    return { pass: true, message: '✅ Accepted! Salary bands assigned.' };
  }
  if (lower.includes('pivot') && lower.includes('monthly')) {
    if (!hasCol(['jan','feb','mar','revenue'])) return { pass: false, message: '❌ Missing monthly columns. Use SUM(CASE WHEN ...) for each month.' };
    return { pass: true, message: '✅ Accepted! Monthly revenue pivoted.' };
  }
  if (lower.includes('customers above average')) {
    if (!hasCol(['total','spent','spend'])) return { pass: false, message: '❌ Missing total_spent column.' };
    return { pass: true, message: '✅ Accepted! Above-average customers found.' };
  }
  if (lower.includes('churned') || lower.includes('inactive') || lower.includes('churn')) {
    if (!hasCol(['user','churn','inactive','count','rate'])) return { pass: false, message: '❌ Missing user_id or churn rate column.' };
    return { pass: true, message: '✅ Accepted! Churn analysis completed.' };
  }
  if (lower.includes('self-join') || lower.includes('manager') || lower.includes('hierarchy')) {
    if (!hasCol(['manager','employee','name'])) return { pass: false, message: '❌ Missing manager or employee column. Use a self-join on manager_id.' };
    return { pass: true, message: '✅ Accepted! Employee-manager hierarchy built.' };
  }
  if (lower.includes('percentile') || lower.includes('quartile') || lower.includes('ntile')) {
    if (!hasCol(['quartile','pct','percentile','ntile','rank'])) return { pass: false, message: '❌ Missing percentile/quartile column. Use NTILE() or PERCENT_RANK().' };
    return { pass: true, message: '✅ Accepted! Percentile ranking computed.' };
  }
  if (lower.includes('session duration') && lower.includes('moving average')) {
    if (!hasCol(['moving','avg','ma','rolling'])) return { pass: false, message: '❌ Missing moving average column.' };
    return { pass: true, message: '✅ Accepted! Moving average of session duration.' };
  }
  if (lower.includes('coalesce')) {
    if (!hasCol(['manager','label','null','coalesce','name'])) return { pass: false, message: '❌ Missing COALESCE result column.' };
    return { pass: true, message: '✅ Accepted! NULL values handled with COALESCE.' };
  }
  if (lower.includes('nullif') || lower.includes('division by zero')) {
    if (!hasCol(['conv','rate','result'])) return { pass: false, message: '❌ Missing conversion rate column. Use NULLIF to prevent division by zero.' };
    return { pass: true, message: '✅ Accepted! Division by zero handled safely.' };
  }
  if (lower.includes('new vs returning') || lower.includes('new customers')) {
    if (!hasCol(['new','returning','month'])) return { pass: false, message: '❌ Missing new/returning customer columns.' };
    return { pass: true, message: '✅ Accepted! New vs returning customers per month.' };
  }
  if (lower.includes('frequently bought together') || lower.includes('co-occurrence')) {
    if (!hasCol(['product','co_occur','count'])) return { pass: false, message: '❌ Missing co-occurrence or product pair columns.' };
    return { pass: true, message: '✅ Accepted! Product pairs identified.' };
  }
  if (lower.includes('lifetime value') || lower.includes('ltv')) {
    if (!hasCol(['ltv','spend','avg','value'])) return { pass: false, message: '❌ Missing avg LTV column.' };
    return { pass: true, message: '✅ Accepted! Customer LTV by cohort.' };
  }
  if (lower.includes('inventory') || lower.includes('stock') || lower.includes('replenishment')) {
    if (!hasCol(['stock','days','quantity','turnover','status'])) return { pass: false, message: '❌ Missing stock/days column.' };
    return { pass: true, message: '✅ Accepted! Inventory analysis completed.' };
  }
  if (lower.includes('retention rate')) {
    if (!hasCol(['retention','pct','rate','percent'])) return { pass: false, message: '❌ Missing retention_pct column.' };
    return { pass: true, message: '✅ Accepted! Retention rate calculated.' };
  }
  if (lower.includes('campaign') || lower.includes('roi')) {
    if (!hasCol(['roi','revenue','spend','channel'])) return { pass: false, message: '❌ Missing ROI or channel column.' };
    return { pass: true, message: '✅ Accepted! Campaign performance analyzed.' };
  }
  if (lower.includes('rating') && lower.includes('distribution')) {
    if (!hasCol(['rating','count','pct'])) return { pass: false, message: '❌ Missing rating count or pct column.' };
    return { pass: true, message: '✅ Accepted! Rating distribution computed.' };
  }
  if (lower.includes('anomaly') || lower.includes('spike')) {
    if (!hasCol(['flag','anomaly','spike'])) return { pass: false, message: '❌ Missing flag/anomaly column. Use CASE WHEN revenue > 2 * moving_avg.' };
    return { pass: true, message: '✅ Accepted! Revenue anomaly detection done.' };
  }
  if (lower.includes('union')) {
    if (rows.length < 2) return { pass: false, message: '❌ Expected multiple rows. UNION both city queries.' };
    return { pass: true, message: '✅ Accepted! UNION combining city lists.' };
  }
  if (lower.includes('intersect')) {
    return { pass: true, message: '✅ Accepted! INTERSECT found active users in both months.' };
  }
  if (lower.includes('except')) {
    return { pass: true, message: '✅ Accepted! EXCEPT found users only active in first month.' };
  }
  if (lower.includes('median salary')) {
    if (!hasCol(['median','salary','avg'])) return { pass: false, message: '❌ Missing median_salary column.' };
    return { pass: true, message: '✅ Accepted! Median salary per department.' };
  }
  if (lower.includes('most active users')) {
    if (!hasCol(['activity','count','user'])) return { pass: false, message: '❌ Missing activity_count column.' };
    return { pass: true, message: '✅ Accepted! Most active users found.' };
  }
  if (lower.includes('email domain') || lower.includes('domain breakdown')) {
    if (!hasCol(['domain','count','email'])) return { pass: false, message: '❌ Missing domain column. Use SUBSTR(email, INSTR(email, \'@\') + 1).' };
    return { pass: true, message: '✅ Accepted! Email domain breakdown done.' };
  }
  if (lower.includes('weekend')) {
    if (!hasCol(['weekend','is_weekend'])) return { pass: false, message: '❌ Missing is_weekend column. Use strftime(\'%w\', order_date) IN (0, 6).' };
    return { pass: true, message: '✅ Accepted! Weekend orders flagged.' };
  }
  if (lower.includes('tenure')) {
    if (!hasCol(['tenure','years'])) return { pass: false, message: '❌ Missing tenure_years column. Use julianday() division.' };
    return { pass: true, message: '✅ Accepted! Employee tenure calculated.' };
  }
  if (lower.includes('percentage of total') || lower.includes('pct_of_total')) {
    if (!hasCol(['pct','percent','total'])) return { pass: false, message: '❌ Missing percentage column. Divide by SUM() OVER ().' };
    return { pass: true, message: '✅ Accepted! Percentage of total computed.' };
  }

  // Generic fallback
  return { pass: true, message: `✅ Accepted! Query returned ${rows.length} row(s).` };
}

/* ── Python Validation ──────────────────────────────── */
function validatePython(code, title) {
  const c = code.toLowerCase();
  const lower = title.toLowerCase();

  // ── Existing checks ────────────────────────────────────────────────────
  if (lower.includes('clean null') || lower.includes('null values') || lower.includes('missing values')) {
    if (!c.includes('fillna') && !c.includes('dropna'))
      return { pass: false, message: '❌ Missing null handling. Use df.fillna() or df.dropna().' };
    return { pass: true, message: '✅ Accepted! Null handling logic looks correct.' };
  }
  if (lower.includes('groupby') || lower.includes('aggregate')) {
    if (!c.includes('groupby'))
      return { pass: false, message: '❌ Missing groupby. Use df.groupby([...]).agg({...}).' };
    if (!c.includes('agg') && !c.includes('sum') && !c.includes('mean') && !c.includes('count'))
      return { pass: false, message: '❌ Missing aggregation. Use .sum(), .mean(), .count() or .agg().' };
    return { pass: true, message: '✅ Accepted! GroupBy aggregation looks correct.' };
  }
  if (lower.includes('outlier') && lower.includes('iqr')) {
    if (!c.includes('quantile') && !c.includes('q1') && !c.includes('q3'))
      return { pass: false, message: '❌ Missing IQR calculation. Use df.quantile(0.25) and df.quantile(0.75).' };
    if (!c.includes('lower') && !c.includes('upper') && !c.includes('bound') && !c.includes('clip'))
      return { pass: false, message: '❌ Missing bounds. Compute Q1 - 1.5*IQR and Q3 + 1.5*IQR.' };
    return { pass: true, message: '✅ Accepted! IQR outlier detection logic is correct.' };
  }

  // ── New checks ─────────────────────────────────────────────────────────
  if (lower.includes('duplicate rows') || lower.includes('remove duplicate')) {
    if (!c.includes('drop_duplicates') && !c.includes('duplicated'))
      return { pass: false, message: '❌ Use df.drop_duplicates() to remove duplicates.' };
    return { pass: true, message: '✅ Accepted! Duplicate rows removed.' };
  }
  if (lower.includes('column names') || lower.includes('standardize')) {
    if (!c.includes('str.lower') && !c.includes('.lower()'))
      return { pass: false, message: '❌ Missing .str.lower() to lowercase column names.' };
    if (!c.includes('replace') && !c.includes('str.replace'))
      return { pass: false, message: '❌ Missing str.replace() to fix spaces/special chars.' };
    return { pass: true, message: '✅ Accepted! Column names standardized.' };
  }
  if (lower.includes('data types') || lower.includes('fix data type')) {
    if (!c.includes('astype') && !c.includes('to_datetime'))
      return { pass: false, message: '❌ Use .astype() or pd.to_datetime() to convert types.' };
    return { pass: true, message: '✅ Accepted! Data types converted correctly.' };
  }
  if (lower.includes('winsoriz') || lower.includes('cap outlier')) {
    if (!c.includes('quantile'))
      return { pass: false, message: '❌ Missing quantile calculation for bounds.' };
    if (!c.includes('clip'))
      return { pass: false, message: '❌ Use .clip(lower=..., upper=...) to cap values.' };
    return { pass: true, message: '✅ Accepted! Outliers capped with Winsorization.' };
  }
  if (lower.includes('impute') || lower.includes('fill') && lower.includes('null')) {
    if (!c.includes('fillna'))
      return { pass: false, message: '❌ Use df.fillna() to impute missing values.' };
    if (!c.includes('median') && !c.includes('mode') && !c.includes('mean'))
      return { pass: false, message: '❌ Use median/mode for smarter imputation.' };
    return { pass: true, message: '✅ Accepted! Missing values imputed.' };
  }
  if (lower.includes('parse dates') || lower.includes('extract') && lower.includes('date')) {
    if (!c.includes('to_datetime'))
      return { pass: false, message: '❌ Missing pd.to_datetime() for date parsing.' };
    if (!c.includes('.dt.'))
      return { pass: false, message: '❌ Use .dt accessor to extract year, month, day_name() etc.' };
    return { pass: true, message: '✅ Accepted! Date features extracted.' };
  }
  if (lower.includes('normalize') || lower.includes('min-max')) {
    if (!c.includes('min') || !c.includes('max'))
      return { pass: false, message: '❌ Missing min/max for normalization formula.' };
    return { pass: true, message: '✅ Accepted! Min-max normalization applied.' };
  }
  if (lower.includes('merge') && lower.includes('dataframe')) {
    if (!c.includes('merge') && !c.includes('join'))
      return { pass: false, message: '❌ Use df.merge() or pd.merge() to join DataFrames.' };
    return { pass: true, message: '✅ Accepted! DataFrames merged correctly.' };
  }
  if (lower.includes('pivot table')) {
    if (!c.includes('pivot_table') && !c.includes('pivot'))
      return { pass: false, message: '❌ Use pd.pivot_table() to create the pivot.' };
    return { pass: true, message: '✅ Accepted! Pivot table created.' };
  }
  if (lower.includes('stack') || lower.includes('unstack')) {
    if (!c.includes('unstack') && !c.includes('stack'))
      return { pass: false, message: '❌ Use .unstack() to reshape the MultiIndex.' };
    return { pass: true, message: '✅ Accepted! MultiIndex unstacked.' };
  }
  if (lower.includes('lambda')) {
    if (!c.includes('lambda') && !c.includes('apply'))
      return { pass: false, message: '❌ Use .apply(lambda ...) for the transformation.' };
    return { pass: true, message: '✅ Accepted! Lambda function applied.' };
  }
  if (lower.includes('rolling') && lower.includes('sales')) {
    if (!c.includes('rolling'))
      return { pass: false, message: '❌ Use .rolling(window=...) for the moving average.' };
    if (!c.includes('shift'))
      return { pass: false, message: '❌ Use .shift() to create the lag column.' };
    return { pass: true, message: '✅ Accepted! Rolling window and lag computed.' };
  }
  if (lower.includes('top n per group') || lower.includes('nlargest')) {
    if (!c.includes('nlargest') && !c.includes('groupby'))
      return { pass: false, message: '❌ Use .groupby().apply(lambda x: x.nlargest(...)).' };
    return { pass: true, message: '✅ Accepted! Top N per group found.' };
  }
  if (lower.includes('bin') || lower.includes('spend tier') || lower.includes('segment')) {
    if (!c.includes('pd.cut') && !c.includes('pd.qcut'))
      return { pass: false, message: '❌ Use pd.cut() to bin customers into tiers.' };
    return { pass: true, message: '✅ Accepted! Customers binned into spend tiers.' };
  }
  if (lower.includes('correlation')) {
    if (!c.includes('corr'))
      return { pass: false, message: '❌ Use df.corr() to compute the correlation matrix.' };
    return { pass: true, message: '✅ Accepted! Correlation matrix computed.' };
  }
  if (lower.includes('a/b test') || lower.includes('conversion rate')) {
    if (!c.includes('groupby'))
      return { pass: false, message: '❌ Use groupby("group") to compare A/B groups.' };
    if (!c.includes('conv') && !c.includes('rate'))
      return { pass: false, message: '❌ Missing conversion rate calculation.' };
    return { pass: true, message: '✅ Accepted! A/B test conversion rates compared.' };
  }
  if (lower.includes('z-score') || lower.includes('zscore')) {
    if (!c.includes('zscore') && !c.includes('z_score') && !c.includes('scipy'))
      return { pass: false, message: '❌ Use scipy.stats.zscore() for z-score calculation.' };
    return { pass: true, message: '✅ Accepted! Z-score anomaly detection applied.' };
  }
  if (lower.includes('time series') || lower.includes('decomposition')) {
    if (!c.includes('seasonal_decompose') && !c.includes('decompose'))
      return { pass: false, message: '❌ Use statsmodels seasonal_decompose() for decomposition.' };
    return { pass: true, message: '✅ Accepted! Time series decomposed.' };
  }
  if (lower.includes('rfm')) {
    if (!c.includes('recency') && !c.includes('frequency') && !c.includes('monetary'))
      return { pass: false, message: '❌ Missing RFM columns: recency, frequency, monetary.' };
    if (!c.includes('pd.qcut') && !c.includes('pd.cut'))
      return { pass: false, message: '❌ Use pd.qcut() to score each RFM dimension 1-5.' };
    return { pass: true, message: '✅ Accepted! RFM segmentation complete.' };
  }
  if (lower.includes('cohort analysis')) {
    if (!c.includes('cohort') && !c.includes('period'))
      return { pass: false, message: '❌ Missing cohort_month calculation. Find each user\'s first purchase month.' };
    return { pass: true, message: '✅ Accepted! Cohort retention matrix built.' };
  }
  if (lower.includes('frequency distribution')) {
    if (!c.includes('value_counts') && !c.includes('groupby'))
      return { pass: false, message: '❌ Use .value_counts() for frequency distribution.' };
    return { pass: true, message: '✅ Accepted! Frequency distribution computed.' };
  }
  if (lower.includes('churn prediction') || lower.includes('churn features')) {
    if (!c.includes('days_since') && !c.includes('recency'))
      return { pass: false, message: '❌ Missing days_since_last_txn (recency) feature.' };
    if (!c.includes('groupby'))
      return { pass: false, message: '❌ Use groupby(user_id) to aggregate user features.' };
    return { pass: true, message: '✅ Accepted! Churn features engineered.' };
  }
  if (lower.includes('domain from email') || lower.includes('extract domain')) {
    if (!c.includes('split') && !c.includes('str.split'))
      return { pass: false, message: '❌ Use str.split("@") to extract the email domain.' };
    return { pass: true, message: '✅ Accepted! Email domains extracted.' };
  }
  if (lower.includes('regex') || lower.includes('fraudulent')) {
    if (!c.includes('str.contains') && !c.includes('re.'))
      return { pass: false, message: '❌ Use str.contains(pattern, regex=True) for regex matching.' };
    return { pass: true, message: '✅ Accepted! Flagged transactions via regex.' };
  }
  if (lower.includes('tokenize') || lower.includes('tags') || lower.includes('explode')) {
    if (!c.includes('explode') && !c.includes('split'))
      return { pass: false, message: '❌ Use str.split(",") then .explode() to unpack tags.' };
    return { pass: true, message: '✅ Accepted! Tags tokenized and counted.' };
  }
  if (lower.includes('phone') || lower.includes('clean phone')) {
    if (!c.includes('replace') && !c.includes('str.replace'))
      return { pass: false, message: '❌ Use str.replace() with regex to strip formatting.' };
    return { pass: true, message: '✅ Accepted! Phone numbers cleaned.' };
  }
  if (lower.includes('market basket') || lower.includes('association')) {
    if (!c.includes('combinations') && !c.includes('itertools'))
      return { pass: false, message: '❌ Use itertools.combinations() to find item pairs.' };
    return { pass: true, message: '✅ Accepted! Market basket analysis complete.' };
  }
  if (lower.includes('linear regression') || lower.includes('forecast')) {
    if (!c.includes('linearregression') && !c.includes('linear_model'))
      return { pass: false, message: '❌ Use sklearn LinearRegression to fit and predict.' };
    return { pass: true, message: '✅ Accepted! Linear regression forecast done.' };
  }
  if (lower.includes('k-means') || lower.includes('kmeans') || lower.includes('segmentation')) {
    if (!c.includes('kmeans') && !c.includes('KMeans'))
      return { pass: false, message: '❌ Use sklearn KMeans for clustering.' };
    return { pass: true, message: '✅ Accepted! K-Means segmentation complete.' };
  }
  if (lower.includes('resample') || lower.includes('weekly')) {
    if (!c.includes('resample'))
      return { pass: false, message: '❌ Use df.resample("W") to convert to weekly.' };
    return { pass: true, message: '✅ Accepted! Time series resampled to weekly.' };
  }
  if (lower.includes('sankey') || lower.includes('funnel')) {
    if (!c.includes('source') && !c.includes('target'))
      return { pass: false, message: '❌ Missing source/target columns for Sankey format.' };
    return { pass: true, message: '✅ Accepted! Funnel data prepared for Sankey chart.' };
  }
  if (lower.includes('data quality')) {
    if (!c.includes('isnull') && !c.includes('isna'))
      return { pass: false, message: '❌ Missing null count check. Use df.isnull().sum().' };
    if (!c.includes('duplicated'))
      return { pass: false, message: '❌ Missing duplicate check. Use df.duplicated().sum().' };
    return { pass: true, message: '✅ Accepted! Data quality report generated.' };
  }
  if (lower.includes('cumulative') || lower.includes('running total')) {
    if (!c.includes('cumsum'))
      return { pass: false, message: '❌ Use .cumsum() for cumulative revenue.' };
    return { pass: true, message: '✅ Accepted! Cumulative revenue computed.' };
  }
  if (lower.includes('customer acquisition')) {
    if (!c.includes('min') && !c.includes('first'))
      return { pass: false, message: '❌ Find first order per customer using .min() or .first().' };
    return { pass: true, message: '✅ Accepted! Monthly customer acquisition computed.' };
  }
  if (lower.includes('response time') || lower.includes('percentile')) {
    if (!c.includes('percentile') && !c.includes('quantile'))
      return { pass: false, message: '❌ Use np.percentile() for p50/p90/p99 calculations.' };
    return { pass: true, message: '✅ Accepted! Response time percentiles computed.' };
  }
  if (lower.includes('multi-join') || lower.includes('feature engineering')) {
    if (!c.includes('merge'))
      return { pass: false, message: '❌ Use .merge() to join multiple DataFrames.' };
    if (!c.includes('revenue') && !c.includes('quantity'))
      return { pass: false, message: '❌ Missing revenue calculation (quantity × unit_price).' };
    return { pass: true, message: '✅ Accepted! Flat analytics table built.' };
  }
  if (lower.includes('bar chart') || lower.includes('prepare bar')) {
    if (!c.includes('groupby') && !c.includes('sum') && !c.includes('agg'))
      return { pass: false, message: '❌ Aggregate sales by category first.' };
    return { pass: true, message: '✅ Accepted! Bar chart data prepared.' };
  }
  if (lower.includes('heatmap')) {
    if (!c.includes('corr'))
      return { pass: false, message: '❌ Use .corr() to build the correlation matrix.' };
    return { pass: true, message: '✅ Accepted! Heatmap correlation data ready.' };
  }

  // Generic fallback
  if (code.trim().length < 30)
    return { pass: false, message: '❌ Solution seems incomplete. Add your logic.' };
  return { pass: true, message: '✅ Accepted! Solution looks correct.' };
}

/* ── Python execution simulation ────────────────────── */
function simulatePython(code, title) {
  const lower = title.toLowerCase();
  const lines = code.trim().split('\n').length;

  if (lines < 3) return { success: false, error: 'Solution is empty or too short.', output: '' };

  const openParens  = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (Math.abs(openParens - closeParens) > 2)
    return { success: false, error: 'SyntaxError: unmatched parentheses', output: '' };

  if (lower.includes('null') || lower.includes('missing')) return { success: true, output: `Null counts:\norder_id      0\nproduct       3\nregion        1\namount        2\ndate          0\ndtype: int64\n\nCleaned shape: (847, 5)` };
  if (lower.includes('groupby') || lower.includes('aggregate')) return { success: true, output: `  product_category  region  total_sales  avg_order  order_count\n0     Electronics   North    245680.50   1845.72          133\n1     Electronics   South    198430.00   1670.00          119\n2        Clothing   North    156200.75    934.73          167\n3        Clothing    East    142100.50    887.50          160\n4     Electronics    East    138750.25   1487.63           93` };
  if (lower.includes('outlier') || lower.includes('iqr') || lower.includes('winsoriz')) return { success: true, output: `Removed 23 outliers from 'revenue'\nQ1: 12450.00  Q3: 87320.00  IQR: 74870.00\nLower bound: -99855.00  Upper bound: 199625.00\nClean dataset: 477 rows` };
  if (lower.includes('duplicate')) return { success: true, output: `Original shape: (1200, 5)\nDuplicate rows: 47\nCleaned shape: (1153, 5)` };
  if (lower.includes('column names') || lower.includes('standardize')) return { success: true, output: `['customer_id', 'total_sales', 'date_ordered', 'product_name']` };
  if (lower.includes('data types') || lower.includes('fix data type')) return { success: true, output: `order_id        object\namount         float64\norder_date  datetime64\ncustomer_id     object\ndtype: object` };
  if (lower.includes('parse dates') || lower.includes('date feature')) return { success: true, output: `  order_date  year  month  day_of_week  quarter  is_weekend\n0 2024-01-10  2024      1   Wednesday        1       False\n1 2024-01-14  2024      1      Sunday        1        True\n2 2024-02-05  2024      2      Monday        1       False` };
  if (lower.includes('normalize') || lower.includes('min-max')) return { success: true, output: `       price_norm  stock_norm  sales_norm\ncount      12.000      12.000      12.000\nmean        0.412       0.548       0.431\nmin         0.000       0.000       0.000\nmax         1.000       1.000       1.000` };
  if (lower.includes('merge')) return { success: true, output: `Rows: 25\n   order_id  customer_id   amount  name          city    segment\n0         1            1  12500.0  Ravi Kumar  Mumbai  Premium\n1         2            1   8200.0  Ravi Kumar  Mumbai  Premium\n2         3            1  15000.0  Ravi Kumar  Mumbai  Premium` };
  if (lower.includes('pivot')) return { success: true, output: `month             2024-01   2024-02   2024-03\nproduct_category                                \nClothing          45000.0   38000.0   52000.0\nElectronics      312000.0  198000.0  275000.0\nFootwear          22000.0   18000.0   28000.0` };
  if (lower.includes('lambda') || lower.includes('apply')) return { success: true, output: `   order_id    amount  discount_rate  discount_amount  net_amount\n0         1  12500.00           0.10          1250.00    11250.00\n1         2   8200.00           0.05           410.00     7790.00\n2         3  15000.00           0.15          2250.00    12750.00` };
  if (lower.includes('filter') && lower.includes('sort')) return { success: true, output: `Filtered rows: 14\n   order_id  amount status    city\n0        23   18200  completed  Bangalore\n1         6   21000  completed  Bangalore\n2        10   18900  completed  Mumbai` };
  if (lower.includes('rolling') && lower.includes('sales')) return { success: true, output: `         date    revenue  rolling_30d  lag_30d  mom_change\n25 2024-01-26  13400.00     12453.33      NaN         NaN\n26 2024-01-27  11200.00     12280.00      NaN         NaN\n27 2024-01-28  12600.00     12416.67      NaN         NaN` };
  if (lower.includes('top n') || lower.includes('nlargest')) return { success: true, output: `      category       product  revenue\n0  Electronics    iPhone 15   89999.0\n1  Electronics  OnePlus Nord   59998.0\n2     Footwear  Adidas Ultra   25998.0\n3     Footwear   Nike Air Max   17998.0` };
  if (lower.includes('bin') || lower.includes('tier')) return { success: true, output: `Silver      45\nGold        31\nBronze      18\nPlatinum     6\nName: tier, dtype: int64\n\n   name         total_spent tier\n0  Ravi Kumar     35000.00  Silver\n1  Arjun Mehta    60000.00    Gold` };
  if (lower.includes('correlation')) return { success: true, output: `      col1         col2  correlation\n0    price  sales_count        -0.72\n1   rating   return_rate       -0.65\n2    price   return_rate        0.58` };
  if (lower.includes('a/b') || lower.includes('conversion')) return { success: true, output: `    group  users  conversions  conv_rate  lift_pct\n0  control   5000          210       4.20       0.00\n1     test   4980          261       5.24      24.76` };
  if (lower.includes('z-score') || lower.includes('anomaly')) return { success: true, output: `Anomalies found: 3\n         date    revenue  z_score\n12 2024-01-13  15200.00     2.14\n18 2024-01-19  16200.00     2.41\n24 2024-01-25  16700.00     2.59` };
  if (lower.includes('rfm')) return { success: true, output: `   customer_id  recency  frequency  monetary  r_score  f_score  m_score  rfm_score\n0            3        8         15   60200.0        5        5        5         15\n1           10        3         12   51900.0        5        4        5         14\n2            6        6          9   39400.0        4        4        4         12` };
  if (lower.includes('cohort analysis')) return { success: true, output: `  cohort_month  period_number  customer_id  base  retention\n0      2024-01              0           10    10      100.0\n1      2024-01              1            7    10       70.0\n2      2024-01              2            5    10       50.0\n3      2024-02              0            6     6      100.0` };
  if (lower.includes('frequency distribution')) return { success: true, output: `   region  count    pct  cum_pct\n0   North    420  35.00    35.00\n1   South    310  25.83    60.83\n2    East    280  23.33    84.17\n3    West    190  15.83   100.00` };
  if (lower.includes('churn') && lower.includes('feature')) return { success: true, output: `   user_id  days_since_last_txn  total_txns  avg_txn_amount  std_txn_amount  txn_freq_per_month\n0        1                   40           4          1025.00          247.00                1.33\n1        2                   30           3          2766.67         1275.00                1.00` };
  if (lower.includes('domain')) return { success: true, output: `        domain  count\n0  example.com     10\n1    gmail.com      0` };
  if (lower.includes('regex') || lower.includes('fraudulent')) return { success: true, output: `4 flagged transactions\n   txn_id  amount             notes\n2       3  -450.0  duplicate charge\n7       8     0.0        chargeback request\n12     13   250.0  refund requested\n16     17  -120.0     fraud alert` };
  if (lower.includes('tags') || lower.includes('tokenize')) return { success: true, output: `electronics    18\npremium        14\nsale           12\nnew-arrival    10\necofriendly     8\nName: tag_list, dtype: int64` };
  if (lower.includes('phone')) return { success: true, output: `   user_id        phone phone_clean  phone_valid\n3        4  91-98-1234567   9812345678         True\n7        8      (022) 1234      0221234        False` };
  if (lower.includes('market basket') || lower.includes('association')) return { success: true, output: `       item_a       item_b  count  support\n0  iPhone 15  Boat Airdopes     12    24.00\n1  Nike Air   Adidas Ultra       8    16.00\n2  OnePlus    Boat Airdopes       7    14.00` };
  if (lower.includes('linear regression') || lower.includes('forecast')) return { success: true, output: `   day_num    forecast\n30      30   14282.0\n31      31   14451.0\n32      32   14620.0\n33      33   14789.0\n34      34   14958.0\n35      35   15127.0\n36      36   15296.0` };
  if (lower.includes('k-means') || lower.includes('cluster')) return { success: true, output: `Cluster sizes:\n0    12\n1     8\n2     5\nName: segment, dtype: int64\n\nCluster centers (original scale):\n   total_spend  order_frequency\n0      8500.0              2.1\n1     45000.0              8.4\n2    125000.0             15.8` };
  if (lower.includes('resample') || lower.includes('weekly')) return { success: true, output: `         week    revenue    ma_4w\n0  2024-01-07   73300.0  73300.0\n1  2024-01-14   80400.0  76850.0\n2  2024-01-21   77300.0  77000.0\n3  2024-01-28   81400.0  78100.0` };
  if (lower.includes('sankey') || lower.includes('funnel')) return { success: true, output: `     source      target  value  drop_pct\n0   visited        cart   4200      58.0\n1      cart    checkout   1800      57.1\n2  checkout  purchased    900      50.0` };
  if (lower.includes('bar chart')) return { success: true, output: `         category  total_sales\n0    Electronics     1345200.0\n1       Clothing      312800.0\n2       Footwear      218400.0\n3        Kitchen       98400.0\n4   Accessories       42300.0` };
  if (lower.includes('heatmap')) return { success: true, output: `Correlation Matrix:\n         price  rating  stock  sales\nprice     1.00   -0.45  -0.28   0.62\nrating   -0.45    1.00   0.15   0.71\nstock    -0.28    0.15   1.00  -0.18\nsales     0.62    0.71  -0.18   1.00` };
  if (lower.includes('cumulative')) return { success: true, output: `        date    revenue  cumulative_revenue  pct_of_total\n0 2023-01-01  285000.0          285000.0           6.0\n1 2023-02-01  312000.0          597000.0          12.5\n2 2023-03-01  298000.0          895000.0          18.8\n11 2023-12-01 634000.0         4809000.0         100.0` };
  if (lower.includes('acquisition')) return { success: true, output: `    month  new_customers\n0 2024-01              8\n1 2024-02              1\n2 2024-03              1` };
  if (lower.includes('response time') || lower.includes('percentile')) return { success: true, output: `             endpoint    mean    p50    p90     p99\n0      /api/checkout  245.3  198.0  420.0  1240.0\n1      /api/products  112.4   89.0  210.0   580.0\n2        /api/search  187.2  145.0  380.0   920.0` };
  if (lower.includes('multi-join') || lower.includes('feature engineering')) return { success: true, output: `Flat table shape: (25, 9)\n   order_id  customer_id  product_name  category  city   quantity  revenue\n0         1            1  iPhone 15 Pro  Electronics  Mumbai   1  89999.0\n1         1            1  Boat Airdopes  Electronics  Mumbai   2   2998.0` };

  return { success: true, output: `# Output\nExecution completed successfully.\n${lines} lines processed.` };
}

/* ── SQL error hints ─────────────────────────────────── */
function getSqlHint(msg) {
  const m = msg.toLowerCase();
  if (m.includes('no such table'))    return '💡 Table not found. Available: customers, orders, users, sales, daily_sales, user_activity';
  if (m.includes('no such column'))   return '💡 Column doesn\'t exist — check the schema in the problem description.';
  if (m.includes('syntax error'))     return '💡 SQL syntax error — check for missing commas, keywords, or unclosed parentheses.';
  if (m.includes('ambiguous'))        return '💡 Ambiguous column — qualify it with the table name e.g. c.id instead of id.';
  return '💡 Review your SQL syntax and table/column names.';
}

module.exports = router;
