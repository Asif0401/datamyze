const { v4: uuidv4 } = require('uuid');
const { all, run } = require('./database');

async function seed(db) {
  const existing = await all(db, 'SELECT COUNT(*) as count FROM courses');
  if (existing[0]?.count > 0) {
    console.log('✅ Already seeded, skipping.');
    return;
  }
  console.log('🌱 Seeding database...');

  const courses = [
    { id: uuidv4(), title: 'SQL for Data Analysis', description: 'Master SQL from basics to advanced window functions, CTEs, and performance tuning.', icon: '🗄️', color: '#7F77DD', difficulty: 'Beginner', duration: '8h', total_lessons: 6 },
    { id: uuidv4(), title: 'Python for Analytics', description: 'Learn pandas, numpy, and matplotlib for end-to-end data analysis workflows.', icon: '🐍', color: '#1D9E75', difficulty: 'Intermediate', duration: '14h', total_lessons: 4 },
    { id: uuidv4(), title: 'Statistics & Probability', description: 'Build statistical intuition with hands-on problems and real datasets.', icon: '📊', color: '#BA7517', difficulty: 'Beginner', duration: '7h', total_lessons: 3 },
    { id: uuidv4(), title: 'Dashboard Design', description: 'Create impactful dashboards with Tableau, Power BI, and best practices.', icon: '📈', color: '#D85A30', difficulty: 'Beginner', duration: '5h', total_lessons: 3 },
    { id: uuidv4(), title: 'Advanced SQL', description: 'Deep dive into query optimization, indexing, and analytics patterns.', icon: '⚡', color: '#534AB7', difficulty: 'Advanced', duration: '11h', total_lessons: 3 },
    { id: uuidv4(), title: 'Excel & Google Sheets', description: 'Power user techniques: XLOOKUP, PivotTables, data validation, and automation.', icon: '📋', color: '#1D9E75', difficulty: 'Beginner', duration: '6h', total_lessons: 3 },
  ];

  for (const c of courses) {
    await run(db, `INSERT INTO courses (id, title, description, icon, color, difficulty, duration, total_lessons) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.title, c.description, c.icon, c.color, c.difficulty, c.duration, c.total_lessons]);
  }

  const sqlCourse = courses[0];
  const lessons = [
    { title: 'Introduction to Databases', content: '# Introduction to Databases\n\nA database is an organized collection of structured data.\n\n## Key Concepts\n- **Table**: Collection of related data\n- **Row**: A single record\n- **Column**: A specific attribute\n- **Primary Key**: Unique row identifier\n\n```sql\nSELECT * FROM employees;\n```', dur: 15 },
    { title: 'SELECT Statements', content: '# SELECT Statements\n\n```sql\nSELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column1 ASC;\n```\n\n## Examples\n```sql\nSELECT name, email FROM customers;\nSELECT name AS customer_name FROM customers;\n```', dur: 20 },
    { title: 'WHERE & Filtering', content: '# WHERE Clause\n\n```sql\nSELECT * FROM orders WHERE amount > 1000;\nSELECT * FROM customers WHERE city = \'Mumbai\';\nSELECT * FROM products WHERE category IN (\'Electronics\', \'Books\');\nSELECT * FROM customers WHERE email LIKE \'%@gmail.com\';\n```', dur: 25 },
    { title: 'JOINs', content: '# SQL JOINs\n\n## INNER JOIN\n```sql\nSELECT o.id, c.name, o.amount\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.id;\n```\n\n## LEFT JOIN\n```sql\nSELECT c.name, COUNT(o.id) as order_count\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id;\n```', dur: 30 },
    { title: 'GROUP BY & Aggregates', content: '# Aggregation\n\n```sql\nSELECT city,\n  COUNT(*) AS customer_count,\n  AVG(order_value) AS avg_order,\n  SUM(order_value) AS total_revenue\nFROM customers\nJOIN orders ON customers.id = orders.customer_id\nGROUP BY city\nHAVING COUNT(*) > 10\nORDER BY total_revenue DESC;\n```', dur: 25 },
    { title: 'Window Functions', content: '# Window Functions\n\n```sql\nSELECT name, salary,\n  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank\nFROM employees;\n\nSELECT month, revenue,\n  LAG(revenue, 1) OVER (ORDER BY month) AS prev_month,\n  revenue - LAG(revenue, 1) OVER (ORDER BY month) AS growth\nFROM monthly_sales;\n```', dur: 35 },
  ];

  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    await run(db, `INSERT INTO lessons (id, course_id, title, content, order_index, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), sqlCourse.id, l.title, l.content, i, l.dur]);
  }

  const problems = [
    { title: 'Find Top 5 Customers by Revenue', description: 'Write a SQL query to find the top 5 customers by total revenue.\n\nSchema:\n  orders(id, customer_id, amount, status)\n  customers(id, name, email)', difficulty: 'Easy', topic: 'SQL', starter_code: 'SELECT \n  c.id, c.name,\n  SUM(o.amount) AS total_revenue\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY total_revenue DESC\nLIMIT 5;', acceptance_rate: 78, xp_reward: 50 },
    { title: 'Month-over-Month Growth', description: 'Calculate month-over-month revenue growth %.\n\nSchema: sales(date, revenue)', difficulty: 'Medium', topic: 'SQL', starter_code: 'SELECT\n  strftime(\'%Y-%m\', date) AS month,\n  SUM(revenue) AS revenue,\n  LAG(SUM(revenue)) OVER (ORDER BY strftime(\'%Y-%m\', date)) AS prev,\n  ROUND((SUM(revenue) - LAG(SUM(revenue)) OVER (ORDER BY strftime(\'%Y-%m\', date)))\n    * 100.0 / LAG(SUM(revenue)) OVER (ORDER BY strftime(\'%Y-%m\', date)), 2) AS growth_pct\nFROM sales\nGROUP BY month;', acceptance_rate: 62, xp_reward: 100 },
    { title: 'Find Duplicate Records', description: 'Find all duplicate emails in the users table.\n\nSchema: users(id, name, email)', difficulty: 'Easy', topic: 'SQL', starter_code: 'SELECT email, COUNT(*) AS count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY count DESC;', acceptance_rate: 85, xp_reward: 50 },
    { title: 'Rolling 7-Day Average', description: 'Calculate 7-day rolling average of daily revenue.\n\nSchema: daily_sales(date, revenue)', difficulty: 'Medium', topic: 'SQL', starter_code: 'SELECT date, revenue,\n  ROUND(AVG(revenue) OVER (\n    ORDER BY date\n    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n  ), 2) AS rolling_7d\nFROM daily_sales\nORDER BY date;', acceptance_rate: 54, xp_reward: 100 },
    { title: 'Cohort Retention Analysis', description: 'Calculate 30-day and 60-day user retention by cohort month.\n\nSchema:\n  users(id, signup_date)\n  user_activity(user_id, activity_date)', difficulty: 'Hard', topic: 'SQL', starter_code: 'WITH cohorts AS (\n  SELECT id AS user_id,\n    strftime(\'%Y-%m\', signup_date) AS cohort_month\n  FROM users\n)\nSELECT\n  cohort_month,\n  COUNT(DISTINCT ua.user_id) AS cohort_size\nFROM cohorts c\nJOIN user_activity ua ON ua.user_id = c.user_id\nGROUP BY cohort_month;', acceptance_rate: 31, xp_reward: 200 },
    { title: 'Pandas: Clean Null Values', description: 'Write Python code using pandas to:\n1. Show null counts per column\n2. Fill numeric nulls with median\n3. Fill text nulls with "Unknown"\n4. Drop rows where >50% columns are null', difficulty: 'Easy', topic: 'Python', starter_code: 'import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("sales_data.csv")\nprint("Null counts:")\nprint(df.isnull().sum())\n\nfor col in df.select_dtypes(include=[np.number]).columns:\n    df[col].fillna(df[col].median(), inplace=True)\n\nfor col in df.select_dtypes(include=[\'object\']).columns:\n    df[col].fillna("Unknown", inplace=True)\n\ndf.dropna(thresh=len(df.columns) * 0.5, inplace=True)\nprint("Cleaned shape:", df.shape)', acceptance_rate: 91, xp_reward: 50 },
    { title: 'GroupBy & Aggregate Sales', description: 'Calculate total sales, avg order value, and order count per category and region.\n\nColumns: order_id, product_category, region, amount', difficulty: 'Easy', topic: 'Python', starter_code: 'import pandas as pd\n\ndf = pd.read_csv("orders.csv")\n\nresult = df.groupby([\'product_category\', \'region\']).agg(\n    total_sales=(\'amount\', \'sum\'),\n    avg_order=(\'amount\', \'mean\'),\n    order_count=(\'order_id\', \'count\')\n).reset_index()\n\nresult = result.sort_values(\'total_sales\', ascending=False)\nprint(result.head(10))', acceptance_rate: 88, xp_reward: 50 },
    { title: 'Detect Outliers (IQR)', description: 'Write a Python function to detect outliers using IQR method and return a summary.', difficulty: 'Medium', topic: 'Python', starter_code: 'import pandas as pd\n\ndef remove_outliers_iqr(df, column):\n    Q1 = df[column].quantile(0.25)\n    Q3 = df[column].quantile(0.75)\n    IQR = Q3 - Q1\n    lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR\n    original = len(df)\n    cleaned = df[(df[column] >= lower) & (df[column] <= upper)]\n    print(f"Removed {original - len(cleaned)} outliers")\n    return cleaned\n\ndf = pd.read_csv("data.csv")\ncleaned = remove_outliers_iqr(df, "revenue")', acceptance_rate: 49, xp_reward: 100 },
  ];

  for (const p of problems) {
    await run(db, `INSERT INTO problems (id, title, description, difficulty, topic, starter_code, acceptance_rate, xp_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), p.title, p.description, p.difficulty, p.topic, p.starter_code, p.acceptance_rate, p.xp_reward]);
  }

  const quizId = uuidv4();
  await run(db, `INSERT INTO quizzes (id, title) VALUES (?, ?)`, [quizId, 'Data Analytics Fundamentals Quiz']);

  const questions = [
    { q: 'Which SQL clause filters aggregated results?', opts: ['WHERE','HAVING','FILTER','GROUP BY'], ans: 1, exp: 'HAVING filters rows after aggregation. WHERE filters before aggregation.' },
    { q: 'In pandas, which method fills missing values?', opts: ['dropna()','fillna()','replace()','clean()'], ans: 1, exp: 'fillna() fills NaN values with a specified value or method like forward fill.' },
    { q: 'What does a LEFT JOIN return?', opts: ['Only matching rows','All right table rows','All left + matching right rows','Only non-matching rows'], ans: 2, exp: 'LEFT JOIN returns all rows from the left table, NULLs where right has no match.' },
    { q: 'Which measure is most resistant to outliers?', opts: ['Mean','Standard Deviation','Median','Variance'], ans: 2, exp: 'Median is unaffected by extreme values; mean can be skewed by a single outlier.' },
    { q: 'What SQL keyword removes duplicate rows?', opts: ['UNIQUE','DISTINCT','FILTER','DEDUPE'], ans: 1, exp: 'SELECT DISTINCT returns only unique rows from the result set.' },
    { q: 'Which pandas method shows summary statistics?', opts: ['df.summary()','df.info()','df.describe()','df.stats()'], ans: 2, exp: 'df.describe() shows count, mean, std, min, quartiles, and max for numeric columns.' },
    { q: 'What does COUNT(*) count?', opts: ['Non-NULL values only','Distinct values only','All rows including NULLs','Numeric columns only'], ans: 2, exp: 'COUNT(*) counts all rows regardless of NULL values in any column.' },
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await run(db, `INSERT INTO quiz_questions (id, quiz_id, question, options, correct_index, explanation, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), quizId, q.q, JSON.stringify(q.opts), q.ans, q.exp, i]);
  }

  console.log('✅ Seed complete!');
}

async function seedVideos(db) {
  // Add video_url to existing SQL lessons by title match
  const sqlVideoMap = {
    'Introduction to Databases':  '27axs9dO7AE', // What is SQL? 4-min explainer
    'SELECT Statements':          'PyYgERKq25I', // Alex the Analyst – SELECT basics
    'WHERE & Filtering':          'A9TOuDZTPDU', // Alex the Analyst – WHERE clause
    'JOINs':                      '9URM1_2S0ho', // Alex the Analyst – JOINs
    'GROUP BY & Aggregates':      'IVMfDpCGwK4', // SQL GROUP BY & aggregation
    'Window Functions':           'Ww71knvhQ-s', // TechTFQ – SQL Window Functions
  };

  for (const [title, vid] of Object.entries(sqlVideoMap)) {
    await run(db, 'UPDATE lessons SET video_url = ? WHERE title = ? AND video_url IS NULL', [vid, title]);
  }

  // Add lessons for courses that have none yet
  const { all: dbAll } = require('./database');
  const courses = await dbAll(db, 'SELECT id, title FROM courses');

  for (const course of courses) {
    const existing = await dbAll(db, 'SELECT COUNT(*) as count FROM lessons WHERE course_id = ?', [course.id]);
    if (existing[0]?.count > 0) continue;

    let lessons = [];

    if (course.title === 'Python for Analytics') {
      lessons = [
        { title: 'Getting Started with Pandas', content: '# Getting Started with Pandas\n\nPandas is the cornerstone library for data analysis in Python.\n\n## Creating DataFrames\n```python\nimport pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())\nprint(df.info())\nprint(df.describe())\n```\n\n## Selecting Data\n```python\ndf["column"]          # single column\ndf[["col1","col2"]]   # multiple columns\ndf.loc[0:5]           # rows by label\ndf.iloc[0:5]          # rows by position\n```', video_url: 'r-uOLxNrNk8', dur: 20 },
        { title: 'NumPy Arrays & Operations', content: '# NumPy Arrays\n\nNumPy provides fast multi-dimensional array operations.\n\n```python\nimport numpy as np\n\narr = np.array([1, 2, 3, 4, 5])\nprint(arr.mean(), arr.std(), arr.sum())\n\n# Vectorized operations (much faster than loops)\nresult = arr * 2 + 10\n\n# 2D arrays\nmatrix = np.zeros((3, 4))\nmatrix = np.random.randn(100, 5)\n```', video_url: 'r-uOLxNrNk8', dur: 18 },
        { title: 'Data Visualization with Matplotlib', content: '# Matplotlib & Seaborn\n\n```python\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Line chart\nplt.plot(df["date"], df["revenue"])\nplt.title("Revenue Over Time")\nplt.show()\n\n# Bar chart\ndf.groupby("category")["sales"].sum().plot(kind="bar")\n\n# Correlation heatmap\nsns.heatmap(df.corr(), annot=True, cmap="coolwarm")\n```', video_url: 'r-uOLxNrNk8', dur: 22 },
        { title: 'Real-World Analysis Workflow', content: '# Full Analysis Workflow\n\n```python\nimport pandas as pd\n\n# 1. Load & inspect\ndf = pd.read_csv("sales.csv")\nprint(df.isnull().sum())\n\n# 2. Clean\ndf.dropna(subset=["revenue"], inplace=True)\ndf["date"] = pd.to_datetime(df["date"])\n\n# 3. Aggregate\nmonthly = df.groupby(df["date"].dt.to_period("M")).agg(\n    revenue=("revenue","sum"), orders=("id","count")\n).reset_index()\n\n# 4. Visualize\nmonthly.plot(x="date", y="revenue")\n```', video_url: 'vmEHCJofslg', dur: 30 }, // Keith Galli Pandas
      ];
    }

    if (course.title === 'Statistics & Probability') {
      lessons = [
        { title: 'Descriptive Statistics', content: '# Descriptive Statistics\n\n## Measures of Central Tendency\n- **Mean**: Average of all values — sensitive to outliers\n- **Median**: Middle value — robust to outliers\n- **Mode**: Most frequent value\n\n## Spread\n- **Variance**: Average squared deviation from mean\n- **Std Dev**: Square root of variance\n- **IQR**: Q3 − Q1 (interquartile range)\n\n```python\nimport pandas as pd\ndf["revenue"].describe()\n# count, mean, std, min, 25%, 50%, 75%, max\n```', video_url: 'xxpc-HPKN28', dur: 20 }, // freeCodeCamp Stats
        { title: 'Probability Fundamentals', content: '# Probability\n\n## Core Rules\n- P(A) is between 0 and 1\n- P(A or B) = P(A) + P(B) − P(A and B)\n- P(A and B) = P(A) × P(B) for independent events\n\n## Distributions\n- **Normal**: Bell curve — mean=0, std=1 for standard form\n- **Binomial**: n trials, p probability of success\n- **Poisson**: Number of events in a fixed interval\n\n```python\nfrom scipy import stats\nstats.norm.cdf(1.96)  # 97.5% — two-tailed 95% CI\n```', video_url: 'xxpc-HPKN28', dur: 22 },
        { title: 'Hypothesis Testing', content: '# Hypothesis Testing\n\n1. State H₀ (null) and H₁ (alternative)\n2. Choose significance level α (typically 0.05)\n3. Compute test statistic & p-value\n4. Reject H₀ if p-value < α\n\n```python\nfrom scipy import stats\n\n# Two-sample t-test\nt_stat, p_value = stats.ttest_ind(group_a, group_b)\nprint(f"p-value: {p_value:.4f}")\nif p_value < 0.05:\n    print("Significant difference — reject H₀")\n```', video_url: 'LZzq1zSL1bs', dur: 25 }, // Krish Naik
      ];
    }

    if (course.title === 'Dashboard Design') {
      lessons = [
        { title: 'Introduction to Tableau', content: '# Getting Started with Tableau\n\nTableau is the industry-standard visual analytics platform.\n\n## Key Concepts\n- **Dimensions**: Categorical fields (region, product)\n- **Measures**: Numeric fields (revenue, quantity)\n- **Marks card**: Controls color, size, shape, tooltip\n- **Filters**: Slice data without changing the source\n\n## First Steps\n1. Connect to your data source\n2. Drag dimensions to Columns, measures to Rows\n3. Tableau auto-selects the best chart type\n4. Use Show Me to explore alternatives', video_url: '6xv1KvCMF1Q', dur: 25 }, // Alex the Analyst
        { title: 'Building Effective Dashboards', content: '# Dashboard Best Practices\n\n## Layout Principles\n- **F-pattern**: Most important info top-left\n- **5-second rule**: Key insight visible in 5 seconds\n- **Limit charts**: 4-6 visuals max per dashboard\n\n## Chart Selection Guide\n| Use case | Chart type |\n|----------|------------|\n| Trend over time | Line chart |\n| Part of whole | Pie / donut |\n| Comparison | Bar chart |\n| Distribution | Histogram |\n| Correlation | Scatter plot |\n| Geography | Map |', video_url: '6xv1KvCMF1Q', dur: 20 },
        { title: 'Power BI Essentials', content: '# Power BI\n\nMicrosoft Power BI integrates tightly with Excel and Azure.\n\n## Power Query (Data Prep)\n```\nHome → Transform Data → Power Query Editor\n- Remove columns\n- Rename, reorder, change types\n- Split columns, merge queries\n```\n\n## DAX Measures\n```dax\nTotal Revenue = SUM(Sales[Amount])\nYoY Growth % =\n  DIVIDE(\n    [Total Revenue] - CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(Dates[Date])),\n    CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(Dates[Date]))\n  )\n```', video_url: 'e6QD8lP-m6E', dur: 30 }, // Pragmatic Works Power BI
      ];
    }

    if (course.title === 'Advanced SQL') {
      lessons = [
        { title: 'Query Optimization Fundamentals', content: '# Query Optimization\n\n## Execution Order\n```\nFROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT\n```\nFilters early in this chain = fewer rows to process downstream.\n\n## Key Rules\n- Filter before JOIN when possible\n- Avoid SELECT * in production queries\n- Use EXISTS instead of IN for large subqueries\n- Push predicates into CTEs\n\n```sql\n-- Slow: scans entire orders, then filters\nSELECT c.name FROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.amount > 1000;\n\n-- Fast: filter orders first\nSELECT c.name FROM customers c\nJOIN (SELECT customer_id FROM orders WHERE amount > 1000) o\n  ON c.id = o.customer_id;\n```', video_url: 'xYg_aycpp2Q', dur: 30 }, // techTFQ Query Opt
        { title: 'Indexing Strategies', content: '# Indexing\n\nIndexes are the single biggest lever for query performance.\n\n## Types\n- **B-Tree**: Default — great for equality and range queries\n- **Hash**: Equality only (some DBs)\n- **Partial**: Index a subset of rows — smaller, faster\n- **Composite**: Multi-column — column order matters\n\n```sql\n-- Create index on frequently filtered column\nCREATE INDEX idx_orders_customer ON orders(customer_id);\n\n-- Composite index (put highest-cardinality first)\nCREATE INDEX idx_sales ON sales(region, date);\n\n-- Check if index is used\nEXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 42;\n```', video_url: 'xYg_aycpp2Q', dur: 25 },
        { title: 'CTEs & Analytic Patterns', content: '# CTEs & Advanced Patterns\n\n## Common Table Expressions\n```sql\nWITH monthly_revenue AS (\n  SELECT DATE_TRUNC(\'month\', date) AS month, SUM(amount) AS rev\n  FROM orders GROUP BY 1\n),\ngrowth AS (\n  SELECT month, rev,\n    LAG(rev) OVER (ORDER BY month) AS prev_rev\n  FROM monthly_revenue\n)\nSELECT month, rev,\n  ROUND((rev - prev_rev) * 100.0 / prev_rev, 1) AS pct_growth\nFROM growth;\n```\n\n## Recursive CTE (org chart / hierarchy)\n```sql\nWITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 0 AS depth FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.depth + 1\n  FROM employees e JOIN org o ON e.manager_id = o.id\n)\nSELECT * FROM org ORDER BY depth;\n```', video_url: 'Ww71knvhQ-s', dur: 35 }, // techTFQ Window Functions
      ];
    }

    if (course.title === 'Excel & Google Sheets') {
      lessons = [
        { title: 'Excel Power Functions', content: '# Excel for Data Analytics\n\n## XLOOKUP (modern VLOOKUP)\n```excel\n=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])\n=XLOOKUP(A2, Products[ID], Products[Price], "Not found")\n```\n\n## Dynamic Arrays\n```excel\n=SORT(range, sort_index, sort_order)\n=FILTER(range, condition)\n=UNIQUE(range)\n=SEQUENCE(rows, cols, start, step)\n```\n\n## Conditional Aggregation\n```excel\n=SUMIFS(sum_range, criteria_range1, criteria1, ...)\n=COUNTIFS(range, ">100", date_range, ">"&TODAY()-30)\n=AVERAGEIFS(avg_range, region_col, "North")\n```', video_url: 'pCJ15nGFgVg', dur: 25 }, // Luke Barousse Excel
        { title: 'PivotTables & Charts', content: '# PivotTables\n\nPivotTables let you summarize thousands of rows in seconds.\n\n## Creating a PivotTable\n1. Click inside your data → Insert → PivotTable\n2. Drag fields to Rows, Columns, Values, Filters\n3. Right-click Values → Summarize by: Sum / Count / Average\n\n## Calculated Fields\n```\nInsert → Fields, Items & Sets → Calculated Field\nName: Profit Margin\nFormula: = Revenue / Cost - 1\n```\n\n## Slicers\nInsert → Slicer — creates clickable visual filters linked to PivotTable.', video_url: 'pCJ15nGFgVg', dur: 20 },
        { title: 'Google Sheets & Automation', content: '# Google Sheets for Analytics\n\n## Unique to Sheets\n```\n=IMPORTRANGE("spreadsheet_url", "Sheet1!A1:D100")  -- pull from another sheet\n=QUERY(A:D, "SELECT A, SUM(D) GROUP BY A")         -- SQL-like queries\n=GOOGLEFINANCE("GOOG", "price")                    -- live stock data\n```\n\n## Apps Script Automation\n```javascript\nfunction sendWeeklyReport() {\n  const sheet = SpreadsheetApp.getActiveSheet();\n  const data = sheet.getDataRange().getValues();\n  // Process data, send email, etc.\n  MailApp.sendEmail("team@co.com", "Weekly Report", JSON.stringify(data));\n}\n```', video_url: 'N2opj8XzYBY', dur: 22 }, // freeCodeCamp Google Sheets
      ];
    }

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      await run(db, `INSERT INTO lessons (id, course_id, title, content, video_url, order_index, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), course.id, l.title, l.content, l.video_url, i, l.dur]);
    }

    if (lessons.length > 0) {
      await run(db, 'UPDATE courses SET total_lessons = ? WHERE id = ?', [lessons.length, course.id]);
    }
  }

  console.log('✅ Video seed complete!');
}

async function seedJobs(db) {
  const { all: dbAll } = require('./database');
  const existing = await dbAll(db, 'SELECT COUNT(*) as count FROM job_listings');
  if (existing[0]?.count > 0) return;

  const jobs = [
    // ── Big Tech / Top Startups ──────────────────────────────────────────────
    { title: 'Data Analyst', company: 'Google India', location: 'Bangalore, Karnataka', type: 'Hybrid', salary: '₹12–18 LPA', skills: '["SQL","Python","BigQuery","Data Studio","Statistics"]', url: 'https://careers.google.com/jobs/results/?q=data+analyst&location=India', source: 'Google Careers', posted_days_ago: 2 },
    { title: 'Business Intelligence Analyst', company: 'Amazon India', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹10–16 LPA', skills: '["SQL","Python","QuickSight","Excel","Tableau"]', url: 'https://www.amazon.jobs/en/search?base_query=business+intelligence&loc_query=India', source: 'Amazon Jobs', posted_days_ago: 1 },
    { title: 'Data Analyst', company: 'Flipkart', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹8–14 LPA', skills: '["SQL","Python","Tableau","Excel","Statistics"]', url: 'https://www.flipkartcareers.com/', source: 'Flipkart Careers', posted_days_ago: 3 },
    { title: 'Analytics Engineer', company: 'Meesho', location: 'Bangalore, Karnataka', type: 'Remote', salary: '₹12–20 LPA', skills: '["dbt","SQL","Python","Airflow","BigQuery"]', url: 'https://meesho.io/careers', source: 'Meesho Careers', posted_days_ago: 1 },
    { title: 'Data Scientist (Analytics)', company: 'Swiggy', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹15–22 LPA', skills: '["Python","SQL","Machine Learning","Statistics","Pandas"]', url: 'https://careers.swiggy.com/', source: 'Swiggy Careers', posted_days_ago: 2 },
    { title: 'Business Analyst', company: 'Zomato', location: 'Gurugram, Haryana', type: 'Full-time', salary: '₹9–15 LPA', skills: '["SQL","Excel","Tableau","Python","Product Analytics"]', url: 'https://www.zomato.com/careers', source: 'Zomato Careers', posted_days_ago: 4 },
    { title: 'Tableau Developer', company: 'TCS', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹6–11 LPA', skills: '["Tableau","SQL","Excel","Python","Power BI"]', url: 'https://ibegin.tcs.com/iBegin/jobs/search', source: 'TCS Careers', posted_days_ago: 6 },
    { title: 'Data Analyst – Payments', company: 'PhonePe', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹10–18 LPA', skills: '["SQL","Python","A/B Testing","Statistics","Spark"]', url: 'https://careers.phonepe.com/', source: 'PhonePe Careers', posted_days_ago: 1 },
    { title: 'Senior BI Analyst', company: 'HDFC Bank', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹15–24 LPA', skills: '["SQL","Power BI","SAS","Excel","Risk Analytics"]', url: 'https://www.hdfcbank.com/content/bbp/repositories/723fb80a/', source: 'HDFC Careers', posted_days_ago: 7 },
    { title: 'SQL Data Analyst', company: 'Nykaa', location: 'Mumbai, Maharashtra', type: 'Hybrid', salary: '₹7–13 LPA', skills: '["SQL","Excel","Tableau","Python","E-commerce Analytics"]', url: 'https://careers.nykaa.com/', source: 'Naukri', posted_days_ago: 3 },
    { title: 'Analytics Manager', company: 'Dream11', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹20–30 LPA', skills: '["SQL","Python","Statistics","A/B Testing","Leadership"]', url: 'https://careers.dream11.com/', source: 'Dream11 Careers', posted_days_ago: 2 },
    { title: 'BI Developer', company: 'MakeMyTrip', location: 'Gurugram, Haryana', type: 'Hybrid', salary: '₹8–14 LPA', skills: '["Power BI","SQL","Python","Tableau","Excel"]', url: 'https://www.makemytrip.com/careers/', source: 'MMT Careers', posted_days_ago: 5 },
    { title: 'Data Analyst – Growth', company: 'Ola', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹9–15 LPA', skills: '["SQL","Python","Looker","Statistics","Product Analytics"]', url: 'https://www.olacabs.com/careers', source: 'Ola Careers', posted_days_ago: 4 },
    { title: 'Marketing Analytics Analyst', company: 'Paytm', location: 'Noida, UP', type: 'Full-time', salary: '₹8–13 LPA', skills: '["SQL","Python","Google Analytics","Excel","Attribution Modeling"]', url: 'https://paytm.com/careers', source: 'Paytm Careers', posted_days_ago: 3 },
    { title: 'Data Analyst – Supply Chain', company: 'Reliance Industries', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹10–18 LPA', skills: '["SQL","Excel","Power BI","Python","SAP Analytics"]', url: 'https://careers.ril.com/', source: 'RIL Careers', posted_days_ago: 6 },
    { title: 'Junior Data Analyst', company: 'Razorpay', location: 'Bangalore, Karnataka', type: 'Hybrid', salary: '₹7–12 LPA', skills: '["SQL","Python","Looker","Excel","Fintech Analytics"]', url: 'https://razorpay.com/jobs/', source: 'Razorpay Careers', posted_days_ago: 1 },
    { title: 'Analytics Consultant', company: 'Deloitte India', location: 'Hyderabad, Telangana', type: 'Hybrid', salary: '₹12–20 LPA', skills: '["SQL","Python","Tableau","Power BI","Client Analytics"]', url: 'https://apply.deloitte.com/', source: 'Deloitte Careers', posted_days_ago: 2 },
    { title: 'Power BI Developer', company: 'Wipro', location: 'Hyderabad, Telangana', type: 'Hybrid', salary: '₹7–12 LPA', skills: '["Power BI","DAX","SQL","Excel","SSRS"]', url: 'https://careers.wipro.com/', source: 'Wipro Careers', posted_days_ago: 5 },
    // ── IT Services ──────────────────────────────────────────────────────────
    { title: 'Data Analyst – Fresher', company: 'Infosys', location: 'Pune, Maharashtra', type: 'Full-time', salary: '₹3.6–5 LPA', skills: '["SQL","Excel","Python","Power BI","Tableau"]', url: 'https://career.infosys.com/jobdesc?jobReferenceCode=INFSYS-EXTERNAL-286022', source: 'Infosys Careers', posted_days_ago: 2 },
    { title: 'Business Intelligence Analyst', company: 'Cognizant', location: 'Chennai, Tamil Nadu', type: 'Full-time', salary: '₹6–11 LPA', skills: '["Power BI","SQL","SSRS","Excel","Cognos"]', url: 'https://careers.cognizant.com/global/en/search-results?keywords=data+analyst', source: 'Cognizant Careers', posted_days_ago: 3 },
    { title: 'Analytics Consultant', company: 'Accenture India', location: 'Hyderabad, Telangana', type: 'Hybrid', salary: '₹10–16 LPA', skills: '["SQL","Python","Tableau","Power BI","Client Consulting"]', url: 'https://www.accenture.com/in-en/careers/jobsearch?jk=data+analytics', source: 'Accenture Careers', posted_days_ago: 1 },
    { title: 'Data Analyst', company: 'Capgemini India', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹7–12 LPA', skills: '["SQL","Python","Excel","Tableau","Alteryx"]', url: 'https://www.capgemini.com/in-en/careers/job-search/?search=data+analyst&country=India', source: 'Capgemini Careers', posted_days_ago: 4 },
    { title: 'Power BI Developer', company: 'HCLTech', location: 'Noida, Uttar Pradesh', type: 'Full-time', salary: '₹8–14 LPA', skills: '["Power BI","DAX","SQL","Power Query","Azure Synapse"]', url: 'https://www.hcltech.com/careers', source: 'HCLTech Careers', posted_days_ago: 2 },
    { title: 'SQL Developer / Data Analyst', company: 'Wipro Technologies', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹6–10 LPA', skills: '["SQL","PL/SQL","Excel","Tableau","ETL"]', url: 'https://careers.wipro.com/careers-home/jobs?keywords=data+analyst', source: 'Wipro Careers', posted_days_ago: 5 },
    { title: 'Data Engineer Analyst', company: 'Tech Mahindra', location: 'Pune, Maharashtra', type: 'Full-time', salary: '₹7–13 LPA', skills: '["Python","SQL","Spark","Kafka","Power BI"]', url: 'https://careers.techmahindra.com/search/?q=data+analyst', source: 'Tech Mahindra Careers', posted_days_ago: 3 },
    { title: 'Analytics Developer', company: 'Mphasis', location: 'Bangalore, Karnataka', type: 'Hybrid', salary: '₹8–13 LPA', skills: '["SQL","Python","Tableau","AWS Redshift","Statistics"]', url: 'https://careers.mphasis.com/search/?q=data+analyst', source: 'Naukri', posted_days_ago: 6 },
    { title: 'Decision Analytics Analyst', company: 'Genpact India', location: 'Gurugram, Haryana', type: 'Full-time', salary: '₹6–10 LPA', skills: '["SQL","Excel","Python","Power BI","Statistical Modeling"]', url: 'https://www.genpact.com/careers/search-jobs?keyword=data+analyst', source: 'Genpact Careers', posted_days_ago: 2 },
    { title: 'Data Analyst – Financial Services', company: 'Coforge', location: 'Noida, Uttar Pradesh', type: 'Full-time', salary: '₹7–12 LPA', skills: '["SQL","Python","Tableau","Banking Analytics","Excel"]', url: 'https://www.coforge.com/careers', source: 'LinkedIn', posted_days_ago: 4 },
    // ── BFSI ─────────────────────────────────────────────────────────────────
    { title: 'Data Analyst – Risk & Analytics', company: 'Bajaj Finserv', location: 'Pune, Maharashtra', type: 'Full-time', salary: '₹9–15 LPA', skills: '["SQL","Python","SAS","Excel","Credit Risk Modeling"]', url: 'https://www.bajajfinserv.in/careers', source: 'Bajaj Finserv Careers', posted_days_ago: 3 },
    { title: 'Analytics Specialist – Retail Banking', company: 'ICICI Bank', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹10–18 LPA', skills: '["SQL","Python","Power BI","SAS","Customer Analytics"]', url: 'https://www.icicicareers.com/', source: 'ICICI Careers', posted_days_ago: 5 },
    { title: 'Data Analyst – Cards & Payments', company: 'Axis Bank', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹8–14 LPA', skills: '["SQL","Python","Excel","Tableau","Fintech Analytics"]', url: 'https://www.axisbank.com/careers', source: 'Axis Bank Careers', posted_days_ago: 1 },
    { title: 'BI Developer – Insurance Analytics', company: 'SBI Life Insurance', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹8–13 LPA', skills: '["Power BI","SQL","Excel","Tableau","Insurance KPIs"]', url: 'https://www.sbilife.co.in/careers', source: 'SBI Life Careers', posted_days_ago: 7 },
    { title: 'Analytics Lead – Consumer Lending', company: 'Kotak Mahindra Bank', location: 'Mumbai, Maharashtra', type: 'Hybrid', salary: '₹14–22 LPA', skills: '["Python","SQL","Machine Learning","Scorecard Modeling","SAS"]', url: 'https://careers.kotak.com/', source: 'Kotak Careers', posted_days_ago: 3 },
    // ── EdTech / SaaS ─────────────────────────────────────────────────────────
    { title: 'Data Analyst – Learner Success', company: 'upGrad', location: 'Mumbai, Maharashtra', type: 'Hybrid', salary: '₹8–14 LPA', skills: '["SQL","Python","Looker","Product Analytics","A/B Testing"]', url: 'https://careers.upgrad.com/', source: 'upGrad Careers', posted_days_ago: 2 },
    { title: 'Business Analyst – Product Growth', company: 'Unacademy', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹9–16 LPA', skills: '["SQL","Python","Google Analytics","Excel","Funnel Analysis"]', url: 'https://unacademy.com/careers', source: 'Unacademy Careers', posted_days_ago: 4 },
    { title: 'Analytics Manager', company: "BYJU'S", location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹16–24 LPA', skills: '["SQL","Python","Tableau","A/B Testing","Leadership"]', url: 'https://byjus.com/careers/', source: "BYJU'S Careers", posted_days_ago: 6 },
    { title: 'Data Analyst – Product', company: 'Freshworks', location: 'Chennai, Tamil Nadu', type: 'Hybrid', salary: '₹12–20 LPA', skills: '["SQL","Python","Amplitude","Mixpanel","Product Analytics"]', url: 'https://www.freshworks.com/company/careers/', source: 'Freshworks Careers', posted_days_ago: 1 },
    { title: 'Business Analyst – Operations', company: 'Zoho Corporation', location: 'Chennai, Tamil Nadu', type: 'Full-time', salary: '₹7–13 LPA', skills: '["SQL","Zoho Analytics","Excel","Python","Reporting"]', url: 'https://www.zohocorp.com/careers/', source: 'Zoho Careers', posted_days_ago: 3 },
    { title: 'Analytics Engineer', company: 'Chargebee', location: 'Chennai, Tamil Nadu', type: 'Remote', salary: '₹14–22 LPA', skills: '["dbt","SQL","Python","Looker","Stripe Analytics"]', url: 'https://www.chargebee.com/jobs/', source: 'Chargebee Careers', posted_days_ago: 2 },
    // ── D2C / Retail ──────────────────────────────────────────────────────────
    { title: 'Data Analyst – Merchandising', company: 'Myntra', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹10–17 LPA', skills: '["SQL","Python","Tableau","Retail Analytics","Demand Forecasting"]', url: 'https://careers.myntra.com/', source: 'Myntra Careers', posted_days_ago: 2 },
    { title: 'Analytics Lead – Fashion', company: 'Nykaa Fashion', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹13–20 LPA', skills: '["SQL","Python","Power BI","Inventory Analytics","Excel"]', url: 'https://careers.nykaa.com/', source: 'Nykaa Careers', posted_days_ago: 5 },
    { title: 'Supply Chain Analyst', company: 'bigbasket', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹8–13 LPA', skills: '["SQL","Python","Excel","Logistics Analytics","Power BI"]', url: 'https://careers.bigbasket.com/', source: 'bigbasket Careers', posted_days_ago: 3 },
    { title: 'Growth & Marketing Analyst', company: 'Mamaearth', location: 'Gurugram, Haryana', type: 'Full-time', salary: '₹7–12 LPA', skills: '["SQL","Excel","Google Analytics","Meta Ads","Attribution Modeling"]', url: 'https://mamaearth.in/careers', source: 'LinkedIn', posted_days_ago: 4 },
    { title: 'Marketing Analytics Analyst', company: 'boAt Lifestyle', location: 'New Delhi, Delhi', type: 'Full-time', salary: '₹6–10 LPA', skills: '["Excel","SQL","Google Analytics","Python","Campaign Analytics"]', url: 'https://www.boat-lifestyle.com/pages/careers', source: 'Naukri', posted_days_ago: 6 },
    // ── Logistics ─────────────────────────────────────────────────────────────
    { title: 'Data Analyst – Last Mile', company: 'Shadowfax Technologies', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹7–12 LPA', skills: '["SQL","Python","Looker","Operations Analytics","Excel"]', url: 'https://shadowfax.in/careers', source: 'LinkedIn', posted_days_ago: 2 },
    { title: 'Analytics Engineer – Logistics', company: 'Delhivery', location: 'Gurugram, Haryana', type: 'Full-time', salary: '₹10–18 LPA', skills: '["SQL","Python","Spark","Airflow","Supply Chain Analytics"]', url: 'https://www.delhivery.com/careers', source: 'Delhivery Careers', posted_days_ago: 3 },
    { title: 'BI Analyst – Freight', company: 'Porter', location: 'Bangalore, Karnataka', type: 'Hybrid', salary: '₹8–14 LPA', skills: '["SQL","Power BI","Python","Tableau","Operations Analytics"]', url: 'https://porter.in/careers', source: 'Porter Careers', posted_days_ago: 1 },
    { title: 'Operations Data Analyst', company: 'DTDC Express', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹5–9 LPA', skills: '["SQL","Excel","Power BI","Logistics KPIs","Python"]', url: 'https://www.dtdc.in/careers.asp', source: 'Naukri', posted_days_ago: 7 },
    // ── Healthcare ────────────────────────────────────────────────────────────
    { title: 'Healthcare Data Analyst', company: 'Apollo Hospitals', location: 'Hyderabad, Telangana', type: 'Full-time', salary: '₹7–13 LPA', skills: '["SQL","Python","Power BI","Clinical Data","HL7/FHIR"]', url: 'https://jobs.apollohospitals.com/', source: 'Apollo Careers', posted_days_ago: 4 },
    { title: 'Analytics Specialist – Operations', company: 'Fortis Healthcare', location: 'Gurugram, Haryana', type: 'Full-time', salary: '₹8–13 LPA', skills: '["SQL","Excel","Tableau","Healthcare KPIs","Python"]', url: 'https://www.fortishealthcare.com/careers', source: 'LinkedIn', posted_days_ago: 5 },
    { title: 'Data Analyst – Pharma & Supply', company: 'PharmEasy', location: 'Mumbai, Maharashtra', type: 'Hybrid', salary: '₹9–15 LPA', skills: '["SQL","Python","Looker","Supply Chain","Statistics"]', url: 'https://pharmeasy.in/careers', source: 'PharmEasy Careers', posted_days_ago: 2 },
    { title: 'Analytics Analyst – Digital Health', company: 'MediBuddy', location: 'Bangalore, Karnataka', type: 'Remote', salary: '₹7–12 LPA', skills: '["SQL","Python","Tableau","Product Analytics","Healthcare"]', url: 'https://medibuddy.in/careers', source: 'Instahyre', posted_days_ago: 3 },
    // ── Consulting ────────────────────────────────────────────────────────────
    { title: 'Data Analytics Associate', company: 'KPMG India', location: 'Bangalore, Karnataka', type: 'Hybrid', salary: '₹9–15 LPA', skills: '["SQL","Python","Power BI","Tableau","Client Analytics"]', url: 'https://home.kpmg/in/en/home/careers.html', source: 'KPMG Careers', posted_days_ago: 2 },
    { title: 'Analytics Consultant', company: 'PwC India', location: 'Mumbai, Maharashtra', type: 'Hybrid', salary: '₹12–20 LPA', skills: '["Python","SQL","Power BI","Tableau","Data Strategy"]', url: 'https://www.pwc.in/careers/', source: 'PwC Careers', posted_days_ago: 4 },
    { title: 'Data Analytics Senior Associate', company: 'EY India', location: 'Hyderabad, Telangana', type: 'Full-time', salary: '₹13–22 LPA', skills: '["SQL","Python","Alteryx","Tableau","Big Data"]', url: 'https://careers.ey.com/ey/search/#q=data+analyst&t=Jobs&sort=relevancy', source: 'EY Careers', posted_days_ago: 1 },
    { title: 'Decision Scientist', company: 'Mu Sigma', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹6–11 LPA', skills: '["R","Python","SQL","Statistics","Machine Learning"]', url: 'https://www.mu-sigma.com/careers/', source: 'Mu Sigma Careers', posted_days_ago: 5 },
    // ── Fresher / Entry-Level ─────────────────────────────────────────────────
    { title: 'Data Analytics Intern', company: 'Internshala', location: 'Remote (India)', type: 'Internship', salary: '₹8,000–15,000/mo', skills: '["Excel","SQL","Python","Tableau","Data Visualization"]', url: 'https://internshala.com/internships/data-analytics-internship', source: 'Internshala', posted_days_ago: 1 },
    { title: 'Business Intelligence Intern', company: 'LinkedIn India', location: 'Bangalore, Karnataka', type: 'Internship', salary: '₹30,000–50,000/mo', skills: '["SQL","Python","Tableau","Excel","LinkedIn Analytics"]', url: 'https://careers.linkedin.com/students', source: 'LinkedIn Careers', posted_days_ago: 3 },
    { title: 'Process Analyst (Fresher)', company: 'Infosys BPM', location: 'Mysore, Karnataka', type: 'Full-time', salary: '₹3–5 LPA', skills: '["Excel","SQL","Power BI","Process Analytics","Reporting"]', url: 'https://career.infosys.com/jobdesc?jobReferenceCode=INFSYS-BPM-FRESHERS', source: 'Infosys Careers', posted_days_ago: 2 },
    { title: 'Data Analyst Associate (Fresher)', company: 'Accenture India', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹4–7 LPA', skills: '["SQL","Excel","Python (Basic)","Power BI","Communication"]', url: 'https://www.accenture.com/in-en/careers/explore-careers/area-of-interest/data-analytics', source: 'Accenture Careers', posted_days_ago: 1 },
    // ── Startups & Emerging ───────────────────────────────────────────────────
    { title: 'Data Analyst – Travel Tech', company: 'Cleartrip (Flipkart)', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹9–15 LPA', skills: '["SQL","Python","Looker","Travel Analytics","A/B Testing"]', url: 'https://www.cleartrip.com/careers', source: 'Cleartrip Careers', posted_days_ago: 4 },
    { title: 'Analytics Lead – Retail', company: 'Lenskart', location: 'New Delhi, Delhi', type: 'Full-time', salary: '₹12–19 LPA', skills: '["SQL","Python","Power BI","Retail Analytics","Product Analytics"]', url: 'https://www.lenskart.com/careers', source: 'LinkedIn', posted_days_ago: 2 },
    { title: 'Data Analyst – Agri Analytics', company: 'WayCool Foods', location: 'Chennai, Tamil Nadu', type: 'Full-time', salary: '₹6–11 LPA', skills: '["SQL","Python","Excel","Tableau","Supply Chain Analytics"]', url: 'https://waycool.in/careers', source: 'Cutshort', posted_days_ago: 5 },
    { title: 'Data Analyst – B2B Commerce', company: 'Udaan', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹10–17 LPA', skills: '["SQL","Python","Looker","B2B Analytics","Statistics"]', url: 'https://udaan.com/career.html', source: 'Instahyre', posted_days_ago: 3 },
    { title: 'Analytics Engineer', company: 'CRED', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹16–26 LPA', skills: '["dbt","SQL","Python","Airflow","Fintech Analytics"]', url: 'https://careers.cred.club/', source: 'CRED Careers', posted_days_ago: 2 },
    { title: 'Data Analyst – Neo Banking', company: 'Slice', location: 'Bangalore, Karnataka', type: 'Hybrid', salary: '₹9–15 LPA', skills: '["SQL","Python","Looker","Credit Analytics","A/B Testing"]', url: 'https://sliceit.com/careers', source: 'Foundit', posted_days_ago: 1 },
    { title: 'Analytics Manager – Quick Commerce', company: 'Zepto', location: 'Mumbai, Maharashtra', type: 'Full-time', salary: '₹18–28 LPA', skills: '["SQL","Python","Tableau","Supply Chain Analytics","Leadership"]', url: 'https://www.zeptonow.com/careers', source: 'LinkedIn', posted_days_ago: 1 },
    { title: 'Data Analyst – Hyperlocal Delivery', company: 'Swiggy Instamart', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹11–18 LPA', skills: '["SQL","Python","Looker","Geo Analytics","A/B Testing"]', url: 'https://careers.swiggy.com/', source: 'Swiggy Careers', posted_days_ago: 2 },
    { title: 'Business Analyst – Climate Tech', company: 'Ather Energy', location: 'Bangalore, Karnataka', type: 'Full-time', salary: '₹8–14 LPA', skills: '["SQL","Python","Tableau","IoT Analytics","Excel"]', url: 'https://atherenergy.com/careers', source: 'Ather Careers', posted_days_ago: 6 },
  ];

  for (const j of jobs) {
    await run(db, `INSERT INTO job_listings (id, title, company, location, type, salary, skills, url, source, posted_days_ago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), j.title, j.company, j.location, j.type, j.salary, j.skills, j.url, j.source, j.posted_days_ago]);
  }

  console.log('✅ Jobs seed complete!');
}

async function seedComingSoonCourses(db) {
  const { all: dbAll } = require('./database');
  const existing = await dbAll(db, "SELECT COUNT(*) as count FROM courses WHERE title = 'AI in Analytics'");
  if (existing[0]?.count > 0) {
    console.log('✅ Coming soon courses already seeded, skipping.');
    return;
  }
  console.log('🌱 Seeding coming soon courses...');

  const comingSoon = [
    {
      id: uuidv4(),
      title: 'AI in Analytics',
      description: 'Learn to integrate ChatGPT, Copilot, and AI tools into your analytics workflow — from prompt engineering to automated insights.',
      icon: '🤖',
      color: '#8B5CF6',
      difficulty: 'Intermediate',
      duration: '10h',
      total_lessons: 0,
    },
    {
      id: uuidv4(),
      title: 'Machine Learning for Analysts',
      description: 'Build predictive models with scikit-learn. Regression, classification, clustering — hands-on with real business datasets.',
      icon: '🧠',
      color: '#EC4899',
      difficulty: 'Advanced',
      duration: '15h',
      total_lessons: 0,
    },
    {
      id: uuidv4(),
      title: 'Data Engineering Fundamentals',
      description: 'ETL pipelines, dbt, Airflow, and cloud data warehouses. Learn how data moves from source to dashboard.',
      icon: '⚙️',
      color: '#F59E0B',
      difficulty: 'Advanced',
      duration: '12h',
      total_lessons: 0,
    },
  ];

  for (const c of comingSoon) {
    await run(db, `INSERT INTO courses (id, title, description, icon, color, difficulty, duration, total_lessons, is_coming_soon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [c.id, c.title, c.description, c.icon, c.color, c.difficulty, c.duration, c.total_lessons]);
  }

  console.log('✅ Coming soon courses seeded!');
}

async function seedCaseStudies(db) {
  const { all: dbAll } = require('./database');
  const existing = await dbAll(db, 'SELECT COUNT(*) as count FROM case_studies');
  if (existing[0]?.count > 0) return;

  console.log('🌱 Seeding case studies...');

  const cases = [
    {
      company: 'Swiggy',
      company_logo: '🍕',
      title: 'Reducing Delivery Time by 23% with Route Optimization',
      difficulty: 'Medium',
      tags: JSON.stringify(['SQL', 'Python', 'Operations']),
      summary: "How Swiggy's data team used clustering algorithms and real-time route analysis to reduce average delivery time from 38 to 29 minutes.",
      problem: 'Average delivery times had increased by 15% over 6 months as order volume scaled, leading to poor ratings and customer churn.',
      data_overview: '6 months of delivery data: 2.3M orders, 45,000 delivery partners, GPS coordinates, restaurant prep times, traffic data.',
      approach: 'Used K-means clustering to group delivery zones, built regression model to predict prep time, redesigned dispatch algorithm.',
      key_insights: 'Top 3 findings: (1) 34% of delays from restaurant prep variance, (2) Hotspot zones needed 2x partner density, (3) Time-of-day batching reduced avg distance by 18%.',
      outcome: '23% reduction in delivery time, NPS score improved by 12 points, ₹2.1Cr monthly saving.',
      is_free: 1,
    },
    {
      company: 'Flipkart',
      company_logo: '🛒',
      title: 'Cart Abandonment Analysis — ₹180Cr Recovery',
      difficulty: 'Medium',
      tags: JSON.stringify(['SQL', 'Funnel Analysis', 'A/B Testing']),
      summary: "Flipkart's growth team identified the exact funnel drop-off points causing ₹180Cr in monthly lost revenue and ran targeted interventions.",
      problem: 'Cart abandonment rate hit 73% during non-sale periods. Mobile checkout had 81% abandonment vs 61% on desktop.',
      data_overview: 'Clickstream data from 14M monthly active users, session recordings, payment failure logs, A/B test results.',
      approach: 'Built cohort-based funnel analysis in SQL, segmented by device/user tier/category, ran 3 simultaneous A/B tests on checkout flow.',
      key_insights: '(1) Payment page had 43% drop — too many steps. (2) Price-sensitive users needed EMI nudge at cart. (3) Push notification at 2hr abandonment = 18% recovery.',
      outcome: 'Reduced mobile abandonment by 14%, recovered ₹180Cr/month equivalent GMV.',
      is_free: 1,
    },
    {
      company: 'Amazon',
      company_logo: '📦',
      title: 'Prime Churn Prediction Model — 91% Accuracy',
      difficulty: 'Hard',
      tags: JSON.stringify(['Machine Learning', 'Python', 'Retention']),
      summary: "Amazon India's retention team built a churn prediction model that identifies at-risk Prime members 30 days before cancellation.",
      problem: 'Prime renewal rate dropped 8% YoY. Reactive retention (post-cancellation) had <12% win-back rate.',
      data_overview: '3 years of Prime member data: usage patterns, purchase frequency, streaming hours, support tickets, price sensitivity signals.',
      approach: 'Feature engineering on 47 behavioral signals, XGBoost model with SHAP explainability, deployed in real-time scoring pipeline.',
      key_insights: '(1) Members who don\'t use video for 45+ days are 3.4x more likely to churn. (2) Last 3 orders being returns = strong churn signal. (3) Price increase notification = 2-week churn spike.',
      outcome: '91% accuracy, 34% reduction in Prime churn, $2.1M ARR impact.',
      is_free: 0,
    },
    {
      company: 'Zomato',
      company_logo: '🍽️',
      title: 'Dynamic Pricing for Surge Demand — Revenue +28%',
      difficulty: 'Hard',
      tags: JSON.stringify(['Python', 'Pricing', 'Real-time Analytics']),
      summary: 'How Zomato built a real-time dynamic pricing engine that balances demand, supply, and customer satisfaction.',
      problem: 'During peak hours, order fulfillment rate dropped to 67% while delivery partners earned sub-optimal. Static pricing failed to manage demand.',
      data_overview: 'Real-time order stream (50K orders/hour peak), partner GPS data, restaurant capacity, weather API, event calendar data.',
      approach: 'Multi-armed bandit algorithm for pricing, real-time Kafka stream processing, gradual rollout with holdout group.',
      key_insights: '(1) Weather + events = 2.8x demand multiplier. (2) ₹15 surge reduces demand by 22% but increases fulfillment to 94%. (3) Partner earnings up 31% during surge.',
      outcome: 'Revenue increased 28% during peak hours, fulfillment rate 67%→91%, partner satisfaction NPS +18.',
      is_free: 0,
    },
    {
      company: 'CRED',
      company_logo: '💳',
      title: 'Credit Score Segmentation for Targeted Offers',
      difficulty: 'Medium',
      tags: JSON.stringify(['SQL', 'Segmentation', 'Python']),
      summary: "CRED's analytics team built a 5-tier member segmentation model that increased offer redemption by 3.2x.",
      problem: 'Generic cashback offers had 8% redemption rate. High CAC with low LTV for certain user segments.',
      data_overview: 'Payment behaviour of 8M members, CIBIL score proxies, spend categories, app engagement, referral data.',
      approach: 'RFM segmentation extended with credit behaviour signals, K-means clustering into 5 tiers, personalised offer engine.',
      key_insights: '(1) Tier-1 users (CIBIL 780+) prefer travel rewards 4x over cashback. (2) Tier-3 churn 60% faster when given generic offers. (3) Bill payment reminders increase retention by 24%.',
      outcome: 'Offer redemption 8%→26%, CAC reduced 34%, LTV increased 2.1x for Tier 1-2 segments.',
      is_free: 0,
    },
    {
      company: 'Meesho',
      company_logo: '🏪',
      title: 'Supplier Quality Score — Reducing Returns by 31%',
      difficulty: 'Medium',
      tags: JSON.stringify(['SQL', 'Scoring Model', 'Operations']),
      summary: 'Meesho built a supplier quality scoring system that reduced return rates from 18% to 12.4% in 90 days.',
      problem: 'Return rate of 18% was 2x industry average, primarily from 340 high-volume suppliers with inconsistent quality.',
      data_overview: '18 months of supplier performance data: 12M orders, product listings, return reasons, customer ratings, dispute history.',
      approach: 'Built composite quality score (returns 40%, ratings 30%, dispute rate 20%, fulfilment speed 10%), automated tier badges, penalisation system.',
      key_insights: '(1) Top 12% of suppliers caused 67% of quality returns. (2) Category-specific score thresholds needed. (3) Supplier dashboard visibility alone improved scores 15%.',
      outcome: 'Return rate 18%→12.4%, supplier NPS improved 22 points, ₹8Cr monthly logistics cost saving.',
      is_free: 0,
    },
  ];

  for (const c of cases) {
    await run(db, `INSERT INTO case_studies (id, title, company, company_logo, difficulty, tags, summary, problem, data_overview, approach, key_insights, outcome, is_free) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), c.title, c.company, c.company_logo, c.difficulty, c.tags, c.summary, c.problem, c.data_overview, c.approach, c.key_insights, c.outcome, c.is_free]);
  }

  console.log('✅ Case studies seed complete!');
}

module.exports = { seed, seedVideos, seedJobs, seedComingSoonCourses, seedCaseStudies };
