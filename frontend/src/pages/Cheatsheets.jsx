import { useState, useMemo, useCallback } from 'react';

/* ── Course config ────────────────────────────────────────────── */
const COURSES = [
  { id: 'sql',        label: 'SQL',        color: '#38bdf8' },
  { id: 'python',     label: 'Python',     color: '#FFD343' },
  { id: 'statistics', label: 'Statistics', color: '#a78bfa' },
  { id: 'excel',      label: 'Excel',      color: '#5CC8A0' },
  { id: 'tableau',    label: 'Tableau',    color: '#E8762D' },
  { id: 'powerbi',    label: 'Power BI',   color: '#F2C811' },
];

/* ── Cheatsheet data ────────────────────────────────────────────── */
const DATA = {
  sql: [
    {
      title: 'Core Query Syntax',
      content: null,
      code: `SELECT column1, column2
FROM table_name
WHERE condition
GROUP BY column1
HAVING aggregate_condition
ORDER BY column1 DESC
LIMIT 10;`,
      tip: 'ORDER OF EXECUTION: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. WHERE filters rows BEFORE grouping; HAVING filters AFTER grouping.',
    },
    {
      title: 'JOINs',
      content: null,
      table: [
        { col1: 'INNER JOIN',      col2: 'Returns rows that match in BOTH tables' },
        { col1: 'LEFT JOIN',       col2: 'All rows from left + matching from right (NULL if no match)' },
        { col1: 'RIGHT JOIN',      col2: 'All rows from right + matching from left (NULL if no match)' },
        { col1: 'FULL OUTER JOIN', col2: 'All rows from both tables, NULL where no match' },
        { col1: 'SELF JOIN',       col2: 'Join a table with itself — used for org hierarchies, comparing rows' },
        { col1: 'CROSS JOIN',      col2: 'Cartesian product of both tables (every row × every row)' },
      ],
      code: `-- LEFT JOIN example
SELECT e.name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- SELF JOIN — find manager names
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;`,
      tip: 'In interviews, LEFT JOIN is the most common after INNER. Always ask: "Do I want NULL rows?" If yes → LEFT JOIN.',
    },
    {
      title: 'Aggregate Functions',
      content: null,
      code: `-- Core aggregates
COUNT(*)          -- count all rows
COUNT(col)        -- count non-NULL values
SUM(col)          -- total
AVG(col)          -- average
MIN(col)          -- minimum
MAX(col)          -- maximum
GROUP_CONCAT(col) -- concatenate values (MySQL)

-- GROUP BY + HAVING
SELECT dept, COUNT(*) AS headcount, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept
HAVING AVG(salary) > 50000
ORDER BY avg_sal DESC;`,
      tip: 'Use HAVING (not WHERE) to filter aggregated results. COUNT(*) counts all rows including NULLs; COUNT(col) skips NULLs.',
    },
    {
      title: 'Window Functions',
      content: null,
      code: `-- RANK, DENSE_RANK, ROW_NUMBER
SELECT name, dept, salary,
  RANK()       OVER (PARTITION BY dept ORDER BY salary DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY salary DESC)                   AS dense_rank,
  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY hire_date)   AS row_num
FROM employees;

-- LAG and LEAD (access previous/next row)
SELECT name, salary,
  LAG(salary, 1)  OVER (ORDER BY hire_date)          AS prev_salary,
  LEAD(salary, 1) OVER (PARTITION BY dept ORDER BY salary) AS next_salary
FROM employees;

-- Running total
SELECT date, revenue,
  SUM(revenue) OVER (ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM sales;

-- 7-day moving average
SELECT date, revenue,
  AVG(revenue) OVER (ORDER BY date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d
FROM sales;

-- Percentile quartiles with NTILE
SELECT name, salary,
  NTILE(4) OVER (ORDER BY salary DESC) AS quartile
FROM employees;`,
      tip: 'RANK vs DENSE_RANK: if two people tie at rank 1, RANK skips to 3 next; DENSE_RANK goes to 2. ROW_NUMBER always gives unique values regardless of ties.',
    },
    {
      title: 'CTEs (Common Table Expressions)',
      content: null,
      code: `-- Single CTE
WITH dept_avg AS (
  SELECT dept, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY dept
)
SELECT e.name, e.salary, d.avg_sal,
  e.salary - d.avg_sal AS diff_from_avg
FROM employees e
JOIN dept_avg d ON e.dept = d.dept;

-- Multiple CTEs (chained)
WITH
  sales_2024 AS (
    SELECT * FROM sales WHERE YEAR(date) = 2024
  ),
  top_products AS (
    SELECT product_id, SUM(amount) AS total
    FROM sales_2024
    GROUP BY product_id
    ORDER BY total DESC
    LIMIT 10
  )
SELECT p.name, t.total
FROM products p
JOIN top_products t ON p.id = t.product_id;`,
      tip: 'CTEs make queries readable and reusable within the same query. Use them instead of nested subqueries for complex logic.',
    },
    {
      title: 'Subqueries',
      content: null,
      code: `-- Scalar subquery (returns single value)
SELECT name, salary,
  (SELECT AVG(salary) FROM employees) AS company_avg,
  salary - (SELECT AVG(salary) FROM employees) AS diff
FROM employees;

-- IN subquery
SELECT name FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE location = 'Mumbai');

-- Correlated subquery (references outer query)
SELECT name, salary
FROM employees e
WHERE salary > (
  SELECT AVG(salary) FROM employees
  WHERE dept = e.dept   -- references outer e.dept
);

-- EXISTS
SELECT name FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);`,
      tip: 'Correlated subqueries run once per row — they can be slow on large tables. Often replaceable with a JOIN or window function for better performance.',
    },
    {
      title: 'String Functions',
      content: null,
      code: `UPPER('hello')              -- 'HELLO'
LOWER('HELLO')              -- 'hello'
TRIM('  hello  ')           -- 'hello'
LTRIM('  hello')            -- 'hello'
RTRIM('hello  ')            -- 'hello'
LENGTH('hello')             -- 5
SUBSTRING('hello', 2, 3)    -- 'ell' (start=2, len=3)
CONCAT('Data', 'myze')      -- 'Datamyze'
REPLACE('hello', 'l', 'r')  -- 'herro'

-- Pattern matching
WHERE name LIKE 'A%'        -- starts with A
WHERE email LIKE '%@gmail%' -- contains @gmail
WHERE code LIKE '___'       -- exactly 3 chars`,
      tip: "LIKE '%pattern%' cannot use indexes — it's slow on large tables. For full-text search, use MATCH AGAINST or a search engine.",
    },
    {
      title: 'Date Functions',
      content: null,
      code: `-- MySQL / MariaDB
NOW()                          -- current datetime
CURDATE()                      -- current date
YEAR(date), MONTH(date), DAY(date)
DATEDIFF('2024-12-31', '2024-01-01')  -- 364 days
DATE_ADD(date, INTERVAL 7 DAY)
DATE_ADD(date, INTERVAL 1 MONTH)
DATE_FORMAT(date, '%Y-%m')     -- '2024-06'
DATE_FORMAT(date, '%d-%b-%Y')  -- '15-Jun-2024'

-- SQLite
strftime('%Y-%m', date)        -- '2024-06'
strftime('%Y', date)           -- year as text

-- Group by month
SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
       SUM(amount) AS monthly_revenue
FROM orders
GROUP BY month
ORDER BY month;`,
      tip: 'Always store dates in ISO format (YYYY-MM-DD). When grouping by month use DATE_FORMAT or DATE_TRUNC — never group by MONTH() alone (it merges across years).',
    },
    {
      title: 'NULL Handling',
      content: null,
      code: `-- Check for NULL (never use = NULL)
WHERE col IS NULL
WHERE col IS NOT NULL

-- Replace NULL with a default
IFNULL(col, 0)                 -- MySQL: if null return 0
COALESCE(col1, col2, 'N/A')   -- returns first non-NULL
NULLIF(a, b)                   -- returns NULL if a = b, else a

-- Examples
SELECT name, COALESCE(phone, email, 'No contact') AS contact
FROM users;

-- NULLIF to avoid divide-by-zero
SELECT revenue / NULLIF(units, 0) AS avg_price
FROM sales;`,
      tip: 'NULL is not equal to anything — including itself. NULL = NULL is FALSE. Always use IS NULL / IS NOT NULL.',
    },
    {
      title: 'Interview Patterns',
      content: null,
      code: `-- 1. Top N per group (use RANK in CTE)
WITH ranked AS (
  SELECT *, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
  FROM employees
)
SELECT * FROM ranked WHERE rnk <= 3;

-- 2. Running totals
SELECT date, revenue,
  SUM(revenue) OVER (ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative
FROM sales;

-- 3. Month-over-month growth
WITH monthly AS (
  SELECT DATE_FORMAT(date,'%Y-%m') AS month, SUM(revenue) AS rev
  FROM sales GROUP BY month
)
SELECT month, rev,
  LAG(rev) OVER (ORDER BY month) AS prev_month,
  ROUND((rev - LAG(rev) OVER (ORDER BY month)) /
        NULLIF(LAG(rev) OVER (ORDER BY month), 0) * 100, 1) AS pct_growth
FROM monthly;

-- 4. Duplicate detection
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 5. Pivot with CASE WHEN
SELECT
  month,
  SUM(CASE WHEN product = 'A' THEN revenue ELSE 0 END) AS product_A,
  SUM(CASE WHEN product = 'B' THEN revenue ELSE 0 END) AS product_B
FROM sales
GROUP BY month;`,
      tip: 'For "Top N per group" always use a CTE with RANK/DENSE_RANK, not a correlated subquery — it is cleaner and more interview-friendly.',
    },
  ],

  python: [
    {
      title: 'DataFrame Basics',
      content: null,
      code: `import pandas as pd
import numpy as np

# Load data
df = pd.read_csv('file.csv')
df = pd.read_excel('file.xlsx', sheet_name='Sheet1')

# Quick inspection
df.head(5)          # first 5 rows
df.tail(5)          # last 5 rows
df.info()           # dtypes, non-null counts
df.describe()       # summary stats for numeric cols
df.shape            # (rows, cols)
df.columns          # column names
df.dtypes           # data types
df.index            # row index
df.nunique()        # unique values per column
df.value_counts()   # frequency of each unique value`,
      tip: 'Always run df.info() and df.describe() first — they reveal nulls, dtypes, and distribution in seconds.',
    },
    {
      title: 'Selection & Filtering',
      content: null,
      code: `# Single column → Series
df['age']

# Multiple columns → DataFrame
df[['name', 'age', 'city']]

# Label-based selection (loc)
df.loc[0, 'name']             # single cell
df.loc[0:5, 'age':'city']     # row 0-5, cols age to city
df.loc[df['age'] > 30, 'name']  # rows where age>30, name col

# Position-based (iloc) — pure integer indexing
df.iloc[0]          # first row
df.iloc[0:5, 1:3]   # rows 0-4, cols 1-2
df.iloc[-1]         # last row

# Boolean filtering
df[df['age'] > 30]
df[(df['age'] > 30) & (df['city'] == 'Bangalore')]
df[df['city'].isin(['Mumbai', 'Delhi', 'Bangalore'])]
df[~df['name'].str.startswith('A')]  # NOT starts with A

# query() — readable alternative
df.query('age > 30 and city == "Bangalore"')
df.query('salary > @threshold', threshold=50000)`,
      tip: 'Use .loc for label-based and .iloc for position-based. They behave differently with slices — loc includes the end label, iloc does not.',
    },
    {
      title: 'Data Cleaning',
      content: null,
      code: `# Null analysis
df.isnull().sum()               # nulls per column
df.isnull().sum() / len(df)     # null percentage
df.isnull().any(axis=1)         # rows with any null

# Handle nulls
df.dropna()                     # drop rows with any null
df.dropna(subset=['age'])       # drop only if 'age' is null
df.fillna(0)                    # fill all nulls with 0
df['salary'].fillna(df['salary'].mean())  # fill with mean
df['city'].fillna('Unknown')    # fill with string

# Duplicates
df.duplicated().sum()           # count duplicate rows
df[df.duplicated(keep=False)]   # see all duplicates
df.drop_duplicates()            # remove duplicates
df.drop_duplicates(subset=['email'])  # unique on email

# Data type conversion
df['age'] = df['age'].astype(int)
df['date'] = pd.to_datetime(df['date'])
df['price'] = df['price'].str.replace(',','').astype(float)

# Rename and drop
df.rename(columns={'old_name': 'new_name'})
df.drop(columns=['col1', 'col2'])

# String cleaning
df['city'] = df['city'].str.strip().str.title()
df['email'] = df['email'].str.lower()`,
      tip: "After fillna or dropna, always reassign: df = df.dropna() or use inplace=True. Pandas operations return new objects by default.",
    },
    {
      title: 'GroupBy & Aggregation',
      content: null,
      code: `# Basic groupby
df.groupby('dept')['salary'].mean()
df.groupby('dept')['salary'].agg(['mean', 'max', 'min', 'count'])

# Multiple aggregations with dict
df.groupby('dept').agg({
  'salary': ['mean', 'max'],
  'id':     'count',
  'age':    'median'
})

# Multiple group keys
df.groupby(['dept', 'year'])['revenue'].sum().reset_index()

# Transform — keeps original shape (useful for adding group stat back)
df['dept_avg_sal'] = df.groupby('dept')['salary'].transform('mean')
df['rank_in_dept'] = df.groupby('dept')['salary'].rank(ascending=False)

# Named aggregation (clean column names)
df.groupby('dept').agg(
  avg_salary=('salary', 'mean'),
  headcount=('id', 'count'),
  max_salary=('salary', 'max'),
)`,
      tip: 'Use .transform() when you want to add a group-level aggregate BACK to the original DataFrame without collapsing rows — perfect for "% of group total" calculations.',
    },
    {
      title: 'Merge / Join',
      content: null,
      code: `# Merge (like SQL JOINs)
pd.merge(df1, df2, on='id', how='inner')   # INNER JOIN
pd.merge(df1, df2, on='id', how='left')    # LEFT JOIN
pd.merge(df1, df2, on='id', how='right')   # RIGHT JOIN
pd.merge(df1, df2, on='id', how='outer')   # FULL OUTER JOIN

# Different column names
pd.merge(df1, df2, left_on='user_id', right_on='emp_id')

# Merge on multiple keys
pd.merge(df1, df2, on=['dept', 'year'])

# Concatenate (stack rows)
pd.concat([df1, df2], ignore_index=True)          # stack vertically
pd.concat([df1, df2], axis=1)                      # stack horizontally

# Add suffix to avoid column name collision
pd.merge(df1, df2, on='id', suffixes=('_left','_right'))`,
      tip: 'After a merge, always check df.shape before and after — unexpected row count explosion usually means a many-to-many join on a non-unique key.',
    },
    {
      title: 'Apply & Lambda',
      content: null,
      code: `# Apply to a single column
df['double_salary'] = df['salary'].apply(lambda x: x * 2)

# Conditional logic
df['category'] = df['score'].apply(
  lambda x: 'High' if x > 80 else ('Medium' if x > 50 else 'Low')
)

# Apply across rows (axis=1)
df['full_name'] = df.apply(
  lambda row: row['first'] + ' ' + row['last'], axis=1
)

# Using numpy for speed (vectorized — prefer over apply)
df['tax'] = np.where(df['salary'] > 100000, df['salary'] * 0.3, df['salary'] * 0.2)

# Map — for simple value replacement
df['gender'] = df['gender'].map({'M': 'Male', 'F': 'Female'})

# Custom function
def clean_phone(phone):
  return str(phone).replace('-','').replace(' ','').strip()

df['phone'] = df['phone'].apply(clean_phone)`,
      tip: 'apply() is flexible but slow — it runs Python row by row. Prefer vectorized operations (numpy, pandas string methods) for large DataFrames.',
    },
    {
      title: 'Window / Rolling Functions',
      content: null,
      code: `# Cumulative operations
df['running_total']  = df['revenue'].cumsum()
df['running_max']    = df['revenue'].cummax()
df['running_min']    = df['revenue'].cummin()

# Rolling window (moving average)
df['7d_avg']  = df['revenue'].rolling(window=7).mean()
df['30d_std'] = df['revenue'].rolling(window=30).std()

# Shift (lag/lead)
df['prev_month_rev'] = df['revenue'].shift(1)   # LAG(1)
df['next_month_rev'] = df['revenue'].shift(-1)  # LEAD(1)

# Percent change (MoM growth)
df['mom_growth'] = df['revenue'].pct_change() * 100

# Rank
df['salary_rank'] = df['salary'].rank(ascending=False, method='dense')

# Sort first when using rolling or shift
df = df.sort_values('date')
df['7d_avg'] = df['revenue'].rolling(7).mean()`,
      tip: 'Always sort by date before applying rolling() or shift() — otherwise you get incorrect calculations. Add .dropna() after rolling to remove the initial NaN rows.',
    },
    {
      title: 'Pivot Tables',
      content: null,
      code: `# Pivot table — like Excel pivot
df.pivot_table(
  values='revenue',
  index='month',
  columns='category',
  aggfunc='sum',
  fill_value=0
)

# Multiple aggfuncs
df.pivot_table(
  values='revenue',
  index='region',
  columns='year',
  aggfunc=['sum', 'mean']
)

# Melt — wide to long (unpivot)
df_long = df.melt(
  id_vars=['month'],
  value_vars=['cat_A', 'cat_B', 'cat_C'],
  var_name='category',
  value_name='revenue'
)

# Stack / Unstack (multi-level index pivot)
df.set_index(['dept', 'year'])['salary'].unstack('year')`,
      tip: 'pivot_table() is more flexible than pivot() — it handles duplicate values by aggregating, while pivot() fails on duplicates.',
    },
  ],

  statistics: [
    {
      title: 'Descriptive Statistics',
      content: [
        { term: 'Mean', def: 'Average of all values. Sensitive to outliers — use with caution for skewed data.' },
        { term: 'Median', def: 'Middle value when sorted. Robust to outliers. Use for salaries, house prices, income.' },
        { term: 'Mode', def: 'Most frequently occurring value. Useful for categorical data.' },
        { term: 'Variance', def: 'Average squared deviation from the mean. Larger = more spread.' },
        { term: 'Std Dev (σ)', def: 'Square root of variance. Same units as the data — more interpretable.' },
        { term: 'IQR', def: 'Q3 − Q1 (75th percentile minus 25th). The "middle 50%". Robust spread measure.' },
        { term: 'Skewness', def: 'Right-skewed (positive): mean > median, long tail to right (e.g., income). Left-skewed: mean < median.' },
        { term: 'Kurtosis', def: 'Measures tail heaviness. High kurtosis = heavy tails = more outliers.' },
      ],
      tip: 'When data is right-skewed (income, house prices), always report median — not mean. A few billionaires can make the mean misleading.',
    },
    {
      title: 'Probability Fundamentals',
      content: [
        { term: 'P(A and B)', def: 'P(A) × P(B) — only if A and B are INDEPENDENT events' },
        { term: 'P(A or B)', def: 'P(A) + P(B) − P(A and B) — addition rule' },
        { term: 'P(A|B)', def: 'Conditional probability: P(A given B has occurred) = P(A and B) / P(B)' },
        { term: "Bayes' Theorem", def: "P(A|B) = P(B|A) × P(A) / P(B). Update beliefs with new evidence." },
        { term: 'Complement', def: 'P(not A) = 1 − P(A)' },
        { term: 'Mutually exclusive', def: 'P(A and B) = 0. Both cannot happen at same time.' },
      ],
      tip: "Bayes' Theorem is the foundation of spam filters, medical tests, and recommendation systems. Practice the medical diagnosis example: P(disease|positive test).",
    },
    {
      title: 'Probability Distributions',
      content: [
        { term: 'Normal', def: 'Bell curve. Defined by μ (mean) and σ (std dev). 68-95-99.7% rule: 1σ, 2σ, 3σ from mean.' },
        { term: 'Binomial', def: 'n independent trials, each with probability p of success. Discrete outcomes (e.g., coin flips).' },
        { term: 'Poisson', def: 'Count of events in fixed time period. λ = average event rate. (e.g., calls per hour).' },
        { term: 'Uniform', def: 'Equal probability for all values in range. E.g., rolling a fair die.' },
        { term: 'Exponential', def: 'Time between events in a Poisson process. E.g., time until next server request.' },
        { term: 'Central Limit Theorem', def: 'Sample means of ANY distribution approach normal distribution as n increases (n ≥ 30 rule of thumb).' },
      ],
      tip: 'The Central Limit Theorem is why we can use normal distribution tests on non-normal populations — if sample size is large enough. Always check n ≥ 30.',
    },
    {
      title: 'Hypothesis Testing',
      content: [
        { term: 'H₀ (Null hypothesis)', def: 'No effect / no difference. Default assumption to disprove.' },
        { term: 'H₁ (Alternative)', def: 'There IS an effect or difference. What you are trying to prove.' },
        { term: 'p-value', def: 'Probability of seeing this result (or more extreme) IF H₀ is true. Lower = stronger evidence against H₀.' },
        { term: 'α (significance level)', def: 'Threshold for rejecting H₀. Typically 0.05 (5%). Reject H₀ if p-value < α.' },
        { term: 'Type I Error (α)', def: 'False positive — rejecting a TRUE null hypothesis. Controlled by your α level.' },
        { term: 'Type II Error (β)', def: 'False negative — failing to reject a FALSE null hypothesis.' },
        { term: 'Power (1 − β)', def: 'Probability of correctly detecting a real effect. Typical target: 80%.' },
        { term: 'Confidence Interval', def: '95% CI: if we repeated the experiment 100 times, ~95 intervals would contain the true value.' },
      ],
      tip: 'p-value < 0.05 means the result is STATISTICALLY significant — not that it is practically meaningful. A tiny effect can be significant with a huge sample.',
    },
    {
      title: 'A/B Testing',
      content: [
        { term: 'Setup', def: 'Randomly split users into Control (A) and Treatment (B). Change only ONE variable.' },
        { term: 'Sample size', def: 'Calculate BEFORE starting using power analysis. Tool: Evan Miller\'s sample size calculator.' },
        { term: 'Run time', def: 'Run for at least 1–2 full business cycles. Do not stop early when you see significance.' },
        { term: 'Primary metric', def: 'The one metric you are testing. Usually conversion rate, revenue, or engagement.' },
        { term: 'Guard metrics', def: 'Metrics that SHOULD NOT change. E.g., if testing checkout UX, watch session time and bounce rate.' },
        { term: 'Statistical significance', def: 'p-value < 0.05 (or your chosen α). Result is unlikely due to chance.' },
        { term: 'Practical significance', def: 'Is the effect SIZE large enough to matter? A 0.01% conversion lift may not be worth the engineering cost.' },
        { term: 'Novelty effect', def: 'Users behave differently just because something is new. Wait for behavior to stabilize.' },
      ],
      tip: "The #1 A/B test mistake: peeking at results and stopping early when you see p < 0.05. This massively inflates false positives. Fix: set your sample size upfront and don't stop early.",
    },
    {
      title: 'Correlation & Regression',
      content: [
        { term: 'Pearson r', def: 'Measures LINEAR correlation. Range: −1 to +1. 0 = no linear relationship. Sensitive to outliers.' },
        { term: 'Spearman ρ', def: 'Rank-based correlation. Use for non-linear relationships or ordinal data. Robust to outliers.' },
        { term: 'R² (R-squared)', def: 'Proportion of variance in Y explained by the model. R² = 0.75 means model explains 75% of variance.' },
        { term: 'RMSE', def: 'Root Mean Squared Error. Same units as target. Penalizes large errors more heavily.' },
        { term: 'MAE', def: 'Mean Absolute Error. More interpretable than RMSE. Less sensitive to outliers.' },
        { term: 'Multicollinearity', def: 'When independent variables are highly correlated with each other. Check with VIF (Variance Inflation Factor).' },
        { term: 'Overfitting', def: 'Model fits training data too well, performs poorly on new data. Fix: cross-validation, regularization.' },
      ],
      tip: 'CORRELATION ≠ CAUSATION. Always ask: is there a confounding variable? Classic example: ice cream sales and drowning rates are correlated — both caused by summer heat.',
    },
  ],

  excel: [
    {
      title: 'Lookup Functions',
      content: null,
      code: `-- VLOOKUP (V = Vertical)
=VLOOKUP(lookup_val, table_range, col_index, FALSE)
-- FALSE = exact match, TRUE = approximate (sorted data)
=VLOOKUP(A2, $D$2:$F$100, 2, FALSE)

-- HLOOKUP (H = Horizontal)
=HLOOKUP(lookup_val, table_range, row_index, FALSE)

-- INDEX + MATCH (more flexible than VLOOKUP)
=INDEX(return_range, MATCH(lookup_val, lookup_range, 0))
=INDEX($C$2:$C$100, MATCH(A2, $A$2:$A$100, 0))
-- 0 = exact match, 1 = less than, -1 = greater than

-- XLOOKUP (Excel 2019+, most powerful)
=XLOOKUP(lookup_val, lookup_array, return_array)
=XLOOKUP(A2, $A$2:$A$100, $C$2:$C$100, "Not found")
-- 4th arg = if not found value`,
      tip: 'INDEX+MATCH beats VLOOKUP: it can look LEFT, handles inserted columns, and is faster on large datasets. Use it over VLOOKUP in professional work.',
    },
    {
      title: 'Essential Formulas',
      content: null,
      code: `-- Count with conditions
=COUNTIF(range, criteria)
=COUNTIF(A2:A100, "Mumbai")           -- count "Mumbai"
=COUNTIF(B2:B100, ">50000")           -- count >50000
=COUNTIFS(A2:A100,"Mumbai", B2:B100,">50000")  -- multi-criteria

-- Sum with conditions
=SUMIF(range, criteria, sum_range)
=SUMIF(A2:A100, "North", C2:C100)
=SUMIFS(C2:C100, A2:A100,"North", B2:B100,"2024")

-- Average with condition
=AVERAGEIF(range, criteria, avg_range)

-- Conditional logic
=IF(A2>50000, "High", "Low")
=IFS(A2>100000,"Very High", A2>50000,"High", TRUE,"Low")
=IFERROR(VLOOKUP(A2,D:F,2,0), "Not Found")

-- Statistical
=LARGE(range, 2)      -- 2nd largest value
=SMALL(range, 2)      -- 2nd smallest
=RANK(A2, A$2:A$100, 0)  -- rank descending`,
      tip: 'IFERROR is essential in professional dashboards — wrap every VLOOKUP with it to avoid #N/A errors breaking your formulas.',
    },
    {
      title: 'Text Functions',
      content: null,
      code: `=LEFT("Datamyze", 4)         -- "Data"
=RIGHT("Datamyze", 4)        -- "myze"
=MID("Datamyze", 5, 3)       -- "myz" (start=5, len=3)
=LEN("Datamyze")             -- 8
=TRIM("  hello  ")            -- "hello"
=UPPER("hello")              -- "HELLO"
=LOWER("HELLO")              -- "hello"
=PROPER("john doe")          -- "John Doe"

-- Concatenation
=CONCATENATE(A2, " ", B2)
=A2 & " " & B2               -- same, shorter
=TEXTJOIN(", ", TRUE, A2:A10) -- join range with delimiter

-- Extract from text
=FIND("@", A2)               -- position of "@"
=LEFT(A2, FIND("@",A2)-1)    -- extract username from email
=TEXT(B2, "0.00%")           -- format as percentage
=TEXT(A2, "DD-MMM-YYYY")     -- format date as "15-Jun-2024"`,
      tip: 'TEXTJOIN (Excel 2016+) replaces the old CONCATENATE for ranges. The TRUE argument ignores empty cells — very useful for building comma-separated lists.',
    },
    {
      title: 'Date Functions',
      content: null,
      code: `=TODAY()                      -- today's date
=NOW()                        -- current date and time
=YEAR(A2)  =MONTH(A2)  =DAY(A2)
=WEEKDAY(A2, 2)               -- 1=Monday...7=Sunday (mode 2)
=WEEKNUM(A2)                  -- week number of year

-- Date differences
=DATEDIF(start_date, end_date, "D")   -- days
=DATEDIF(start_date, end_date, "M")   -- complete months
=DATEDIF(start_date, end_date, "Y")   -- complete years
=DAYS(end_date, start_date)           -- simpler days diff

-- Date arithmetic
=EDATE(A2, 3)                 -- add 3 months
=EDATE(A2, -1)                -- subtract 1 month
=EOMONTH(A2, 0)               -- last day of same month
=EOMONTH(A2, 1)               -- last day of next month
=NETWORKDAYS(start, end)       -- working days (excl weekends)
=NETWORKDAYS(start, end, holidays)  -- exclude holidays too`,
      tip: 'DATEDIF is an undocumented function — it works but does not appear in autocomplete. Always use "D", "M", or "Y" in CAPS for the unit.',
    },
    {
      title: 'PivotTable Quick Reference',
      content: [
        { term: 'Step 1', def: 'Select any cell in your data → Insert → PivotTable → New Worksheet' },
        { term: 'Step 2', def: 'Drag fields: Rows (categories), Columns (breakdown), Values (numbers), Filters (slice)' },
        { term: 'Step 3', def: 'Right-click a value → Value Field Settings → Summarize by: Sum/Count/Average/Max' },
        { term: 'Step 4', def: 'Show Values As → % of Grand Total / % of Row / Running Total / Rank' },
        { term: 'Step 5', def: 'Insert → Slicer for interactive filtering. Insert → Timeline for date filtering' },
        { term: 'Step 6', def: 'Group dates: Right-click a date → Group → by Month/Quarter/Year' },
        { term: 'Refresh', def: 'PivotTable Analyze → Refresh (or Alt+F5) after source data changes' },
        { term: 'Calculated Field', def: 'PivotTable Analyze → Fields, Items & Sets → Calculated Field' },
      ],
      tip: 'Always format source data as a Table (Ctrl+T) before creating a PivotTable. Tables auto-expand when you add rows, and the PivotTable updates on refresh.',
    },
    {
      title: 'Keyboard Shortcuts',
      content: [
        { term: 'Ctrl+T', def: 'Convert range to Table' },
        { term: 'Ctrl+Shift+L', def: 'Toggle AutoFilter' },
        { term: 'Ctrl+1', def: 'Format Cells dialog' },
        { term: 'Ctrl+;', def: 'Insert today\'s date' },
        { term: 'Ctrl+Shift+;', def: 'Insert current time' },
        { term: 'F4', def: 'Repeat last action / toggle absolute reference ($A$1 → A$1 → $A1 → A1)' },
        { term: 'Ctrl+D', def: 'Fill Down (copy formula from cell above to selection)' },
        { term: 'Ctrl+R', def: 'Fill Right (copy formula from cell left to selection)' },
        { term: 'Alt+Enter', def: 'New line within a cell' },
        { term: 'Ctrl+Shift+End', def: 'Select to last used cell in the spreadsheet' },
        { term: 'Ctrl+Home', def: 'Go to cell A1' },
      ],
      tip: 'F4 is one of the most powerful shortcuts — press it while editing a formula to cycle through absolute/mixed/relative references ($A$1 → A$1 → $A1 → A1).',
    },
  ],

  tableau: [
    {
      title: 'Chart Type Selection Guide',
      content: [
        { term: 'Bar Chart', def: 'Compare categories side by side. Best for ranked data. Use horizontal for long labels.' },
        { term: 'Line Chart', def: 'Trends over time. Only use with time on X-axis. Do NOT connect non-sequential points.' },
        { term: 'Scatter Plot', def: 'Correlation/relationship between 2 measures. Add a trend line for analysis.' },
        { term: 'Heatmap', def: 'Pattern across 2 categorical dimensions. Color shows intensity of a measure.' },
        { term: 'Map', def: 'Geographic data. Use filled map for regions, symbol map for point data.' },
        { term: 'Treemap', def: 'Part-to-whole with hierarchy. Area = size, color = another measure.' },
        { term: 'Box Plot', def: 'Distribution + outliers. Shows median, Q1, Q3, whiskers, and outlier points.' },
        { term: 'Bullet Chart', def: 'KPI vs target. Shows actual, target, and qualitative ranges.' },
        { term: 'Waterfall Chart', def: 'Running total with positive/negative changes. Great for P&L analysis.' },
      ],
      tip: 'The Show Me panel suggests chart types based on what you drag to the view. But always override it with intent — match the chart type to the QUESTION you are answering.',
    },
    {
      title: 'Calculated Fields',
      content: null,
      code: `// Basic arithmetic
[Revenue] - [Cost]
[Sales] / [Target] * 100

// IF / ELSEIF / ELSE
IF [Sales] > 10000 THEN "High"
ELSEIF [Sales] > 5000 THEN "Medium"
ELSE "Low"
END

// IIF (inline if — one liner)
IIF([Sales] > 10000, "High", "Low")

// CASE
CASE [Region]
  WHEN "North" THEN "Zone A"
  WHEN "South" THEN "Zone B"
  ELSE "Other"
END

// Date calculations
DATEDIFF('month', [Order Date], TODAY())
DATETRUNC('month', [Order Date])         -- first day of month
DATENAME('month', [Order Date])          -- "January", "February"
DATEPART('year', [Order Date])           -- 2024 (number)

// String
CONTAINS([Name], "Manager")
LEFT([Product Code], 3)
LEN([Description])
UPPER([Category])`,
      tip: 'Use DATETRUNC to group dates cleanly — it returns the first day of the period (month, quarter, year), making sorting and formatting much easier.',
    },
    {
      title: 'LOD Expressions',
      content: null,
      code: `// FIXED — compute at specified grain, ignores view filters
{ FIXED [Region] : SUM([Sales]) }
{ FIXED [Customer ID] : MIN([Order Date]) }   // first order date

// INCLUDE — adds a dimension to view grain
{ INCLUDE [Customer ID] : SUM([Sales]) }
// use when you need AVG customers per region in a region view

// EXCLUDE — removes a dimension from view grain
{ EXCLUDE [Month] : SUM([Sales]) }
// gives yearly total when viewing monthly data

// % of total (a classic LOD use case)
SUM([Sales]) / { FIXED : SUM([Sales]) }

// Customer acquisition date
{ FIXED [Customer ID] : MIN([Order Date]) }

// Average number of items per order
{ FIXED [Order ID] : SUM([Quantity]) }
// then AVG of the above gives avg items per order`,
      tip: 'LOD expressions are the most powerful and most misunderstood Tableau feature. FIXED ignores view context; INCLUDE adds granularity; EXCLUDE removes it. Practice the "% of total" pattern first.',
    },
    {
      title: 'Table Calculations',
      content: null,
      code: `// Running Total
RUNNING_SUM(SUM([Sales]))

// Percent of Total
SUM([Sales]) / TOTAL(SUM([Sales]))

// Rank
RANK(SUM([Sales]))
RANK_DENSE(SUM([Sales]))

// Difference from previous
SUM([Sales]) - LOOKUP(SUM([Sales]), -1)

// Percent difference (MoM growth)
(SUM([Sales]) - LOOKUP(SUM([Sales]), -1)) /
ABS(LOOKUP(SUM([Sales]), -1))

// Moving average (3-period)
WINDOW_AVG(SUM([Sales]), -2, 0)

// Index (row number)
INDEX()`,
      tip: 'Table calculations compute AFTER the data is aggregated. They can only reference what is in your view — unlike LOD expressions which can reach outside the view.',
    },
    {
      title: 'Dashboard Best Practices',
      content: [
        { term: 'Focus', def: 'Max 3–4 key metrics per dashboard. Every chart should answer ONE specific question.' },
        { term: 'Color', def: 'Use 1 highlight color consistently. Reserve red/green for alerts and positive/negative. Avoid rainbow palettes.' },
        { term: 'Context', def: 'Never show a number alone — add comparison (vs last period, vs target, vs benchmark).' },
        { term: 'Hierarchy', def: 'Most important metric top-left. Audience reads F-pattern: top → left → right.' },
        { term: 'Mobile', def: 'Design for mobile: stack vertically, larger fonts, simple charts only. Test on actual device.' },
        { term: 'Actions', def: 'Use Filter Actions to let charts drive other charts. URL Actions to open external pages.' },
        { term: 'Performance', def: 'Use extracts instead of live connections for large data. Reduce LOD calculations. Limit data source joins.' },
        { term: 'Labels', def: 'Always add: title, date updated, data source note, and units on axes.' },
      ],
      tip: 'Before building: write the 3 questions your dashboard must answer. Every chart that does not answer one of those questions is noise.',
    },
  ],

  powerbi: [
    {
      title: 'DAX Basics',
      content: null,
      code: `-- Calculated Column (computed row by row, stored in model)
Profit = Sales[Revenue] - Sales[Cost]
Full Name = Employees[First Name] & " " & Employees[Last Name]
Year = YEAR(Sales[Order Date])

-- Measure (computed dynamically based on filter context)
Total Sales = SUM(Sales[Revenue])
Avg Order Value = AVERAGE(Sales[Amount])
Count Orders = COUNTROWS(Sales)
Distinct Customers = DISTINCTCOUNT(Sales[Customer ID])

-- Conditional measure
Category =
  IF(Sales[Amount] > 10000, "High",
    IF(Sales[Amount] > 5000, "Medium", "Low")
  )

-- SWITCH (cleaner than nested IF)
Rating Label =
  SWITCH(TRUE(),
    Sales[Score] >= 90, "Excellent",
    Sales[Score] >= 70, "Good",
    Sales[Score] >= 50, "Average",
    "Poor"
  )`,
      tip: 'Measures vs Calculated Columns: Measures recalculate dynamically per filter context (no storage overhead). Columns are computed once and stored. Prefer Measures for aggregations.',
    },
    {
      title: 'Time Intelligence',
      content: null,
      code: `-- Requires a proper Date table marked as Date Table in model!

-- Year to Date
YTD Sales = TOTALYTD(SUM(Sales[Revenue]), 'Date'[Date])

-- Quarter to Date
QTD Sales = TOTALQTD(SUM(Sales[Revenue]), 'Date'[Date])

-- Month to Date
MTD Sales = TOTALMTD(SUM(Sales[Revenue]), 'Date'[Date])

-- Same period last year
PY Sales = CALCULATE(
  SUM(Sales[Revenue]),
  SAMEPERIODLASTYEAR('Date'[Date])
)

-- Year over year growth %
YoY Growth =
  DIVIDE([This Year Sales] - [PY Sales], [PY Sales])

-- Month over month growth
MoM Growth =
  VAR ThisMonth = [Total Sales]
  VAR LastMonth = CALCULATE([Total Sales], PREVIOUSMONTH('Date'[Date]))
  RETURN DIVIDE(ThisMonth - LastMonth, LastMonth)

-- Previous period
Last Month Sales = CALCULATE(
  SUM(Sales[Revenue]),
  PREVIOUSMONTH('Date'[Date])
)`,
      tip: 'Time intelligence functions ONLY work with a proper Date table. Create one with all dates, mark it as a Date Table, and connect it to every fact table on the date key.',
    },
    {
      title: 'CALCULATE & Filter Context',
      content: null,
      code: `-- CALCULATE modifies the filter context
-- Syntax: CALCULATE(expression, filter1, filter2, ...)

-- Filter to specific value
High Value Sales =
  CALCULATE(SUM(Sales[Revenue]), Sales[Amount] > 10000)

North Sales =
  CALCULATE(SUM(Sales[Revenue]), Region[Name] = "North")

-- Remove all filters (grand total)
All Regions Total =
  CALCULATE(SUM(Sales[Revenue]), ALL(Region))

-- Remove filter from one column
All Years Revenue =
  CALCULATE(SUM(Sales[Revenue]), ALL('Date'[Year]))

-- % of total using ALL
% of Total =
  DIVIDE(
    SUM(Sales[Revenue]),
    CALCULATE(SUM(Sales[Revenue]), ALL(Sales))
  )

-- ALLEXCEPT — remove all filters EXCEPT specified columns
Region % of Total =
  DIVIDE(
    SUM(Sales[Revenue]),
    CALCULATE(SUM(Sales[Revenue]), ALLEXCEPT(Sales, Region[Name]))
  )`,
      tip: 'CALCULATE is the most important DAX function. Every measure runs inside a filter context — CALCULATE lets you CHANGE that context. Master this and 80% of DAX problems become solvable.',
    },
    {
      title: 'Data Model & Relationships',
      content: [
        { term: 'Star Schema', def: 'Best practice: one Fact table (transactions) surrounded by Dimension tables (Date, Product, Customer, Region).' },
        { term: 'One-to-Many', def: 'Most common relationship. One row in Dim table → many rows in Fact table. Direction: Dim → Fact.' },
        { term: 'Many-to-Many', def: 'Avoid when possible. Create a bridge table to resolve. Direct M:M requires bidirectional filtering (use with care).' },
        { term: 'Date Table', def: 'Always create a dedicated Date table. All dates from min to max, no gaps. Mark as Date Table.' },
        { term: 'Integer Keys', def: 'Relate tables on integer keys (not strings) — much faster. Avoid GUID or text-based joins.' },
        { term: 'Bidirectional', def: 'Only use when necessary (M:M resolution or role-playing dimensions). Can cause ambiguity.' },
        { term: 'Active vs Inactive', def: 'Only one active relationship between tables. Use USERELATIONSHIP() in measures to activate inactive ones.' },
      ],
      tip: 'A bad data model cannot be fixed by clever DAX. Spend time on the model first — star schema with integer keys transforms performance from minutes to seconds.',
    },
    {
      title: 'Power Query (M Language)',
      content: null,
      code: `// Power Query steps — each becomes a step in Applied Steps

// Filter rows
Table.SelectRows(Source, each [Revenue] > 1000)

// Remove columns
Table.RemoveColumns(Source, {"Column1", "Column2"})

// Rename columns
Table.RenameColumns(Source, {{"Old Name", "New Name"}})

// Change data type
Table.TransformColumnTypes(Source, {{"Date", type date}})

// Add custom column
Table.AddColumn(Source, "Profit", each [Revenue] - [Cost])

// Group by
Table.Group(Source, {"Region"}, {{"Total", each List.Sum([Revenue])}})

// Merge queries (like JOIN)
Table.NestedJoin(Table1, "ID", Table2, "EmpID", "Merged", JoinKind.Left)`,
      tip: 'Use Power Query for all data transformations — never transform data in DAX if you can do it in Power Query. Query-time transforms are faster and cleaner than measure-time transforms.',
    },
    {
      title: 'Visuals Best Practices',
      content: [
        { term: 'KPI Cards', def: 'Always show current value + comparison + trend indicator. Never a bare number.' },
        { term: 'Bar vs Column', def: 'Bar (horizontal) for long category names. Column (vertical) for time series.' },
        { term: 'Slicers', def: 'Use for user filtering. Set "Single select" for mutually exclusive options. Sync across pages.' },
        { term: 'Drill-through', def: 'Right-click on a data point to drill to a detail page. Set up in Page → Drill-through.' },
        { term: 'Bookmarks', def: 'Save view states. Use to create toggle buttons (show/hide visuals, reset filters).' },
        { term: 'Conditional Formatting', def: 'Use on table/matrix values. Background color or data bars make patterns obvious instantly.' },
        { term: 'Report Theme', def: 'Apply a JSON theme for consistent fonts/colors. Avoid the default blue palette.' },
        { term: 'Performance Analyzer', def: 'View → Performance Analyzer to find slow visuals. Check DAX query time vs visual display time.' },
      ],
      tip: 'Use Performance Analyzer before publishing. Any visual taking > 3 seconds to load will frustrate users. Optimize the DAX query first, then check the visual complexity.',
    },
  ],
};

/* ── CopyButton ─────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      style={{
        position: 'absolute', top: 10, right: 10,
        background: copied ? 'rgba(92,200,160,0.2)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${copied ? 'rgba(92,200,160,0.4)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 6, padding: '3px 10px',
        fontSize: 11, fontWeight: 600,
        color: copied ? '#5CC8A0' : 'rgba(255,255,255,0.45)',
        cursor: 'pointer', transition: 'all .2s',
        fontFamily: 'inherit',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/* ── InterviewTip ───────────────────────────────────────────── */
function InterviewTip({ text }) {
  return (
    <div style={{
      background: 'rgba(245,193,66,0.08)',
      border: '1px solid rgba(245,193,66,0.25)',
      borderLeft: '3px solid #F5C142',
      borderRadius: 8,
      padding: '0.65rem 0.9rem',
      marginTop: '0.75rem',
      display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
      <div>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#F5C142', letterSpacing: 0.5 }}>INTERVIEW TIP &nbsp;</span>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>{text}</span>
      </div>
    </div>
  );
}

/* ── Section Card ───────────────────────────────────────────── */
function SectionCard({ section, accentColor }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 12,
      marginBottom: '0.85rem',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.85rem 1.1rem', textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', letterSpacing: '-0.1px' }}>
          {section.title}
        </span>
        <span style={{
          color: accentColor, fontSize: 16, lineHeight: 1,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s',
          flexShrink: 0,
        }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '0 1.1rem 1rem' }}>
          {/* Table content */}
          {section.table && (
            <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {section.table.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{
                        padding: '7px 12px 7px 0',
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        color: accentColor, fontWeight: 700, whiteSpace: 'nowrap',
                        verticalAlign: 'top', width: '28%',
                      }}>{row.col1}</td>
                      <td style={{ padding: '7px 0', color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{row.col2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Key-value list content */}
          {Array.isArray(section.content) && (
            <div style={{ marginBottom: '0.5rem' }}>
              {section.content.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10,
                  padding: '6px 0',
                  borderBottom: i < section.content.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    color: accentColor, fontWeight: 700, fontSize: 12,
                    flexShrink: 0, minWidth: 160, paddingTop: 1,
                  }}>{item.term}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{item.def}</span>
                </div>
              ))}
            </div>
          )}

          {/* Code block */}
          {section.code && (
            <div style={{ position: 'relative' }}>
              <pre style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10,
                padding: '1rem 1rem 1rem 1rem',
                paddingRight: '3.5rem',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: 12.5,
                color: '#a6e3a1',
                lineHeight: 1.75,
                overflowX: 'auto',
                margin: '0.5rem 0 0',
                whiteSpace: 'pre',
              }}>
                {section.code}
              </pre>
              <CopyButton text={section.code} />
            </div>
          )}

          {/* Interview tip */}
          {section.tip && <InterviewTip text={section.tip} />}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function Cheatsheets() {
  const [activeCourse, setActiveCourse] = useState('sql');
  const [search, setSearch] = useState('');

  const course = COURSES.find(c => c.id === activeCourse);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DATA[activeCourse] || [];
    return (DATA[activeCourse] || []).filter(section => {
      const inTitle = section.title.toLowerCase().includes(q);
      const inCode  = section.code ? section.code.toLowerCase().includes(q) : false;
      const inTip   = section.tip  ? section.tip.toLowerCase().includes(q)  : false;
      const inTable = section.table
        ? section.table.some(r => r.col1.toLowerCase().includes(q) || r.col2.toLowerCase().includes(q))
        : false;
      const inContent = Array.isArray(section.content)
        ? section.content.some(c => c.term.toLowerCase().includes(q) || c.def.toLowerCase().includes(q))
        : false;
      return inTitle || inCode || inTip || inTable || inContent;
    });
  }, [activeCourse, search]);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>

      {/* ── Page Header ─────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
            📋 Cheatsheets
          </h1>
          <span style={{
            background: 'rgba(92,200,160,0.15)',
            border: '1px solid rgba(92,200,160,0.35)',
            color: '#5CC8A0',
            fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
            padding: '3px 10px', borderRadius: 20,
          }}>FREE</span>
        </div>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
          Quick reference for every topic — interview-ready
        </p>
      </div>

      {/* ── Search Bar ──────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search cheatsheets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '0.7rem 1rem 0.7rem 2.5rem',
            fontSize: 14, color: '#e2e8f0',
            outline: 'none',
            transition: 'border-color .2s',
          }}
          onFocus={e => { e.target.style.borderColor = course.color + '80'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.08)', border: 'none',
              borderRadius: '50%', width: 22, height: 22,
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        )}
      </div>

      {/* ── Course Tabs ─────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        marginBottom: '1.5rem',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'linear-gradient(180deg, rgba(8,14,28,0.98) 80%, transparent)',
        paddingBottom: 12, paddingTop: 6,
        backdropFilter: 'blur(8px)',
      }}>
        {COURSES.map(c => {
          const isActive = activeCourse === c.id;
          return (
            <button
              key={c.id}
              onClick={() => { setActiveCourse(c.id); setSearch(''); }}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                border: `1px solid ${isActive ? c.color + '80' : 'rgba(255,255,255,0.10)'}`,
                background: isActive ? c.color + '18' : 'rgba(20,27,56,0.7)',
                color: isActive ? c.color : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all .15s',
                letterSpacing: 0.2,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = c.color + '50';
                  e.currentTarget.style.color = c.color + 'cc';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ─────────────────────────────── */}
      {filteredSections.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          color: 'rgba(255,255,255,0.3)', fontSize: 15,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          No results for "<strong style={{ color: 'rgba(255,255,255,0.5)' }}>{search}</strong>" in {course.label}
          <div style={{ marginTop: 8, fontSize: 13 }}>Try a different keyword or switch course</div>
        </div>
      ) : (
        filteredSections.map((section, i) => (
          <SectionCard key={i} section={section} accentColor={course.color} />
        ))
      )}
    </div>
  );
}
