import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const PyLogo = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{ verticalAlign:'middle', display:'inline-block' }}>
    <path d="M11.914 2c-4.638 0-4.344 2.017-4.344 2.017v2.09h4.413v.626H6.34S3.287 6.386 3.287 10.994c0 4.609 2.697 4.447 2.697 4.447h1.613V13.23s-.088-2.697 2.654-2.697h4.368s2.552.041 2.552-2.467V3.855S17.562 2 11.914 2zm-2.316 1.51c.466 0 .843.377.843.843a.844.844 0 1 1-1.687 0c0-.466.378-.843.844-.843z" fill="#3776AB"/>
    <path d="M12.086 22c4.638 0 4.344-2.017 4.344-2.017v-2.09H12v-.626h5.643s3.053.347 3.053-4.261c0-4.609-2.697-4.447-2.697-4.447h-1.613v2.216s.088 2.697-2.654 2.697H9.364s-2.552-.041-2.552 2.467v4.211S6.422 22 12.086 22zm2.316-1.509a.844.844 0 1 1 0-1.687c.466 0 .843.377.843.843a.844.844 0 0 1-.843.844z" fill="#FFD343"/>
  </svg>
);

const UPI_ID = 'asifjupiterr@ybl';
const AMOUNT  = 199;
const QR_URL  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=Datamyze&am=${AMOUNT}&cu=INR&tn=Datamyze%20Premium`)}`;

/* ── Interview Q&A data ──────────────────────────────── */
const INTERVIEW_DATA = {
  SQL: [
    { q: 'What is the difference between WHERE and HAVING?', a: 'WHERE filters rows before grouping; HAVING filters groups after GROUP BY. WHERE cannot reference aggregate functions, HAVING can.', level: 'Easy' },
    { q: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN.', a: 'INNER JOIN: returns only matching rows from both tables.\nLEFT JOIN: returns all rows from left table + matched rows from right (NULLs for no match).\nFULL OUTER JOIN: returns all rows from both tables, NULLs where no match exists.', level: 'Easy' },
    { q: 'What are window functions? Give an example.', a: 'Window functions perform calculations across a set of rows related to the current row without collapsing them.\nExample: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC): ranks employees within each department.', level: 'Medium' },
    { q: 'How would you find the second highest salary in a table?', a: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);\n-- Or using DENSE_RANK:\nSELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees) WHERE rnk = 2;', level: 'Medium' },
    { q: 'What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?', a: 'ROW_NUMBER(): Assigns unique sequential integers. No ties.\nRANK(): Same rank for ties, skips next ranks (1,2,2,4).\nDENSE_RANK(): Same rank for ties, no gaps (1,2,2,3).', level: 'Medium' },
    { q: 'How do you calculate month-over-month growth in SQL?', a: 'Use LAG() window function:\nSELECT month, revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n  ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0 / LAG(revenue) OVER (ORDER BY month), 2) AS mom_growth\nFROM monthly_sales;', level: 'Hard' },
    { q: 'What is a CTE and when would you use it?', a: 'A Common Table Expression (WITH clause) creates a temporary named result set. Use it to:\n1. Break complex queries into readable steps\n2. Avoid repeating subqueries\n3. Enable recursive queries (hierarchical data)', level: 'Medium' },
    { q: 'Explain indexes and when NOT to use them.', a: 'Indexes speed up SELECT queries by creating a lookup structure. Avoid indexes when:\n1. Table is small (full scan is faster)\n2. Column has low cardinality (e.g. boolean)\n3. Table has heavy INSERT/UPDATE loads (indexes slow writes)', level: 'Hard' },
  ],
  Python: [
    { q: 'What is the difference between .loc and .iloc in Pandas?', a: '.loc uses label-based indexing (row/column names).\n.iloc uses integer position-based indexing (0-indexed).\nExample: df.loc["row1", "col1"] vs df.iloc[0, 0]', level: 'Easy' },
    { q: 'How do you handle missing values in a DataFrame?', a: 'Detection: df.isnull().sum()\nDrop: df.dropna() or df.dropna(subset=["col"])\nFill: df.fillna(0) or df["col"].fillna(df["col"].median())\nForward fill: df.fillna(method="ffill")', level: 'Easy' },
    { q: 'Explain groupby().agg() with an example.', a: 'df.groupby("category").agg(\n    total_sales=("amount", "sum"),\n    avg_order=("amount", "mean"),\n    order_count=("id", "count")\n).reset_index()\n\nThis groups by category and calculates multiple aggregations in one step.', level: 'Easy' },
    { q: 'How do you detect and remove outliers using IQR?', a: 'Q1 = df["col"].quantile(0.25)\nQ3 = df["col"].quantile(0.75)\nIQR = Q3 - Q1\nlower = Q1 - 1.5 * IQR\nupper = Q3 + 1.5 * IQR\ndf_clean = df[(df["col"] >= lower) & (df["col"] <= upper)]', level: 'Medium' },
    { q: 'What is the difference between apply(), map(), and applymap()?', a: 'map(): Element-wise on a Series. Great for value replacement.\napply(): Applies function along axis (row/col) on DataFrame or Series.\napplymap(): Element-wise on entire DataFrame (deprecated in newer Pandas: use map()).', level: 'Medium' },
    { q: 'How do you merge two DataFrames and what are the join types?', a: 'pd.merge(df1, df2, on="id", how="inner")  # Only matching\npd.merge(df1, df2, on="id", how="left")   # All left + matched right\npd.merge(df1, df2, on="id", how="outer")  # All rows from both', level: 'Easy' },
    { q: 'How would you create a pivot table in Pandas?', a: 'df.pivot_table(\n    values="sales",\n    index="region",\n    columns="category",\n    aggfunc="sum",\n    fill_value=0\n)\n\nEquivalent to Excel pivot tables: reshapes data from long to wide format.', level: 'Medium' },
  ],
  CaseStudy: [
    { q: 'Swiggy\'s order volume dropped 15% last week. How would you investigate?', a: '1. Segment: Is it all cities or specific ones? All categories or specific cuisines?\n2. Check supply side: Restaurant availability, delivery partner supply\n3. Check demand side: Pricing changes, discount withdrawal, app issues\n4. Check external: Competitor campaigns, weather, local events\n5. Timeline: Did it happen suddenly (tech issue) or gradually (product change)?', level: 'Hard' },
    { q: 'How would you define and measure "user engagement" for an e-learning platform?', a: 'Key metrics:\n• DAU/MAU ratio (stickiness)\n• Lesson completion rate\n• Time spent per session\n• Streak maintenance rate\n• Problem submission rate\n\nNorth Star Metric: "Weekly Active Learners" who complete ≥1 lesson.', level: 'Medium' },
    { q: 'A/B test shows feature X increases CTR by 10% but decreases revenue by 5%. Ship it?', a: 'Do NOT ship immediately. Questions to ask:\n1. What\'s the statistical significance of both metrics?\n2. What\'s the absolute revenue impact?\n3. Is there a long-term vs short-term trade-off?\n4. Can we segment: does X help new users but hurt power users?\nConclusion: Depends on company\'s growth vs revenue stage. Likely investigate more.', level: 'Hard' },
    { q: 'How would you build a churn prediction model for a SaaS product?', a: 'Features: Login frequency, feature usage, support tickets, plan type, contract age\nApproach:\n1. Define churn (e.g. no login for 30 days)\n2. Label historical data\n3. Train classifier (XGBoost/Logistic Regression)\n4. Evaluate with Precision/Recall (cost of false negative > false positive)\n5. Act: trigger retention campaign for high-risk users', level: 'Hard' },
  ],
  HR: [
    { q: 'Tell me about yourself.', a: 'Structure: Present → Past → Future\nExample: "I\'m a data analyst with [X] years working with SQL and Python. I\'ve built dashboards and models at [company]. I\'m now looking to move into a more senior role where I can own end-to-end analytics."\n\nKeep it under 90 seconds. Focus on relevant experience.', level: 'Easy' },
    { q: 'Why do you want to work as a Data Analyst?', a: 'Highlight: Curiosity for data, impact of insights on business decisions, specific projects or moments that drew you to analytics.\nAvoid: "It pays well" or generic answers.\nGood answer: Connect personal interest + a specific example + alignment with the role.', level: 'Easy' },
    { q: 'Describe a time you found an insight that impacted a business decision.', a: 'Use STAR: Situation → Task → Action → Result\nExample: "In my previous role, I noticed our repeat purchase rate was dropping. I dug into cohort data and found a specific product category was driving churn. I presented this to the PM team, they changed the recommendation algorithm and repeat purchases recovered 12% in 6 weeks."', level: 'Medium' },
  ],
};

const COURSE_ROADMAPS = [
  {
    id: 'sql', title: 'SQL for Data Analysis', icon: '🗄️', color: '#7F77DD',
    desc: 'From zero to writing complex business queries with confidence',
    stages: [
      { id: 1, icon: '🌱', title: 'Foundations', outcome: 'Write your first queries and retrieve data from any table', skills: ['SELECT, FROM, WHERE', 'ORDER BY, DISTINCT, LIMIT', 'Filtering with AND, OR, NOT', 'Comparison & BETWEEN operators'], practice: 'Solve 5 Beginner SQL problems on Datamyze' },
      { id: 2, icon: '📦', title: 'Grouping & Aggregation', outcome: 'Summarise and analyse data at the group level', skills: ['GROUP BY & HAVING', 'COUNT, SUM, AVG, MIN, MAX', 'CASE WHEN statements', 'NULL handling with COALESCE'], practice: 'Complete the "Aggregation" problem set' },
      { id: 3, icon: '🔗', title: 'Joining Tables', outcome: 'Combine data from multiple tables for richer insights', skills: ['INNER JOIN', 'LEFT JOIN & RIGHT JOIN', 'FULL OUTER JOIN', 'Self joins & multi-table joins'], practice: 'Solve the "Sales & Customers" join challenge' },
      { id: 4, icon: '🏗️', title: 'Subqueries & CTEs', outcome: 'Write modular, readable SQL for complex logic', skills: ['Scalar & correlated subqueries', 'IN, EXISTS, NOT IN', 'WITH clause (CTEs)', 'Nested CTE patterns'], practice: 'Refactor 3 queries using CTEs' },
      { id: 5, icon: '💼', title: 'Business Analytics Queries', outcome: 'Answer real interview questions with SQL', skills: ['Month-over-month growth', 'Cohort & retention queries', 'Running totals & cumulative sums', 'Top-N per group patterns'], practice: 'Complete 2 Case Study SQL problems' },
    ],
  },
  {
    id: 'excel', title: 'Excel & Sheets', icon: '📋', color: '#1D9E75',
    desc: 'Master spreadsheets for data cleaning, analysis and dashboards',
    stages: [
      { id: 1, icon: '🌱', title: 'Getting Started', outcome: 'Navigate spreadsheets and write your first formulas', skills: ['Cell references (relative & absolute)', 'SUM, AVERAGE, COUNT, MIN, MAX', 'Sorting & basic filtering', 'Formatting cells and tables'], practice: 'Build a simple monthly budget tracker' },
      { id: 2, icon: '🔍', title: 'Lookup & Logic Functions', outcome: 'Pull data from other tables and apply conditional logic', skills: ['VLOOKUP & XLOOKUP', 'IF, AND, OR, nested IF', 'COUNTIF, SUMIF, AVERAGEIF', 'IFERROR & error handling'], practice: 'Solve the "Salary Lookup" exercise' },
      { id: 3, icon: '📊', title: 'Pivot Tables & Charts', outcome: 'Summarise large datasets and create visual reports', skills: ['Creating Pivot Tables', 'Calculated fields in pivots', 'Slicers & timeline filters', 'Bar, Line, Pie & Combo charts'], practice: 'Build a Sales Dashboard with pivot tables' },
      { id: 4, icon: '🧹', title: 'Data Cleaning', outcome: 'Fix messy real-world data professionally', skills: ['TRIM, CLEAN, PROPER, TEXT', 'Remove duplicates & blanks', 'Text to Columns & Flash Fill', 'Data validation rules'], practice: 'Clean a 500-row messy CSV dataset' },
      { id: 5, icon: '🚀', title: 'Dashboard & Reporting', outcome: 'Present insights with a professional interactive dashboard', skills: ['Dynamic charts with named ranges', 'Conditional formatting heatmaps', 'Drop-down list controls', 'Dashboard layout & design'], practice: 'Build a full KPI Dashboard for a sample company' },
    ],
  },
  {
    id: 'python', title: 'Python for Analytics', icon: <PyLogo />, color: '#3CB371',
    desc: 'Write Python code to analyse, clean and visualise data',
    stages: [
      { id: 1, icon: '🌱', title: 'Python Basics', outcome: 'Write clean scripts and understand core Python syntax', skills: ['Variables & data types', 'Lists, dicts, tuples, sets', 'Loops, conditions & functions', 'Reading CSV/JSON files'], practice: 'Write 5 Python scripts from scratch' },
      { id: 2, icon: '🐼', title: 'Pandas & NumPy', outcome: 'Manipulate tabular data like a pro', skills: ['DataFrame creation & indexing', '.loc / .iloc / boolean masks', 'Merging, joining & concat', 'Groupby & aggregations'], practice: 'Analyse a real dataset with Pandas' },
      { id: 3, icon: '🧹', title: 'Data Cleaning', outcome: 'Transform messy raw data into analysis-ready datasets', skills: ['Handle missing values (fillna, dropna)', 'Remove duplicates', 'Fix data types (astype, to_datetime)', 'Outlier detection with IQR'], practice: 'Clean and reshape a raw e-commerce dataset' },
      { id: 4, icon: '🔬', title: 'Exploratory Data Analysis', outcome: 'Surface insights from any dataset systematically', skills: ['.describe() & .info()', 'Correlation matrices', 'Value counts & crosstabs', 'Distribution analysis'], practice: 'Full EDA on the HR dataset: write a summary' },
      { id: 5, icon: '📈', title: 'Data Visualisation', outcome: 'Create clear charts that tell a compelling story', skills: ['Matplotlib: bar, line, scatter', 'Seaborn: heatmap, violin, pairplot', 'Customising styles & themes', 'Saving charts for reports'], practice: 'Build a 5-chart EDA visual report' },
    ],
  },
  {
    id: 'statistics', title: 'Statistics & Probability', icon: '📊', color: '#BA7517',
    desc: 'Understand the math behind data to make better decisions',
    stages: [
      { id: 1, icon: '🌱', title: 'Descriptive Statistics', outcome: 'Describe any dataset with the right metrics', skills: ['Mean, Median, Mode', 'Variance & Standard Deviation', 'Percentiles & IQR', 'Skewness & Kurtosis'], practice: 'Compute descriptive stats on a sales dataset' },
      { id: 2, icon: '🎲', title: 'Probability', outcome: 'Reason about uncertainty like a data scientist', skills: ['Events, outcomes & sample space', 'Conditional probability & Bayes', 'Binomial & Poisson distributions', 'Normal distribution & Z-scores'], practice: 'Solve 5 probability word problems' },
      { id: 3, icon: '🔬', title: 'Inferential Statistics', outcome: 'Draw conclusions from samples with confidence', skills: ['Null & alternative hypothesis', 't-test, chi-square test', 'p-values & significance (α = 0.05)', 'Type I & Type II errors'], practice: 'Conduct a hypothesis test on a dataset' },
      { id: 4, icon: '🧪', title: 'A/B Testing', outcome: 'Design and analyse experiments the way tech companies do', skills: ['Experiment design & control groups', 'Sample size & power calculations', 'Confidence intervals', 'Common pitfalls (p-hacking, novelty effect)'], practice: 'Analyse an A/B test result for a checkout page' },
      { id: 5, icon: '📈', title: 'Business Metrics', outcome: 'Apply stats to real analytics problems', skills: ['Cohort analysis basics', 'Retention & churn rates', 'Conversion funnels', 'MoM / YoY growth calculations'], practice: 'Build a retention metrics report from user data' },
    ],
  },
  {
    id: 'advanced-sql', title: 'Advanced SQL', icon: '⚡', color: '#534AB7',
    desc: 'Master window functions, CTEs and query optimisation',
    stages: [
      { id: 1, icon: '🪟', title: 'Window Functions', outcome: 'Perform calculations across rows without collapsing data', skills: ['ROW_NUMBER, RANK, DENSE_RANK', 'NTILE & PERCENT_RANK', 'OVER (PARTITION BY … ORDER BY)', 'Cumulative SUM & AVG'], practice: 'Solve 5 window function challenges on Datamyze' },
      { id: 2, icon: '🕐', title: 'Lag, Lead & Time Intelligence', outcome: 'Compare current rows to previous or future rows', skills: ['LAG & LEAD with offsets', 'FIRST_VALUE & LAST_VALUE', 'Month-over-month change queries', 'Rolling 7-day & 30-day averages'], practice: 'Build a MoM revenue trend query' },
      { id: 3, icon: '🏗️', title: 'CTEs & Complex Queries', outcome: 'Write clean, modular SQL for complex business logic', skills: ['Common Table Expressions (WITH)', 'Recursive CTEs for hierarchies', 'Multi-step CTE pipelines', 'Replacing subqueries with CTEs'], practice: 'Rewrite 3 complex subqueries as CTEs' },
      { id: 4, icon: '🚀', title: 'Performance & Optimisation', outcome: 'Write fast queries that scale to millions of rows', skills: ['EXPLAIN & query plan reading', 'Indexing strategies', 'Avoiding SELECT *', 'Filtering before joining'], practice: 'Optimise a slow query using EXPLAIN' },
      { id: 5, icon: '💼', title: 'BI-Level Queries', outcome: 'Write analyst-level SQL for real dashboards', skills: ['User retention cohorts', 'Funnel drop-off analysis', 'Top-N per group with RANK', 'Customer segmentation with CASE'], practice: 'Write a full cohort retention query from scratch' },
    ],
  },
  {
    id: 'tableau', title: 'Tableau for Analysts', icon: '📈', color: '#E8762D',
    desc: 'Build interactive dashboards that turn data into decisions',
    stages: [
      { id: 1, icon: '🌱', title: 'Getting Started', outcome: 'Connect data and understand the Tableau interface', skills: ['Connecting to CSV, Excel, SQL', 'Dimensions vs Measures', 'Rows / Columns shelf basics', 'Marks card: color, size, label'], practice: 'Create your first bar chart in Tableau' },
      { id: 2, icon: '📊', title: 'Core Charts', outcome: 'Build the most important charts for analytics reporting', skills: ['Bar, Line & Area charts', 'Scatter plots & bubble charts', 'Heat maps & highlight tables', 'Maps & filled maps'], practice: 'Recreate 4 chart types from a sample dataset' },
      { id: 3, icon: '🖥️', title: 'Dashboards & Filters', outcome: 'Combine multiple views into one interactive dashboard', skills: ['Dashboard layout & sizing', 'Quick filters & filter actions', 'Highlight actions & URL actions', 'Device-specific layouts'], practice: 'Build a Sales Performance Dashboard' },
      { id: 4, icon: '🧮', title: 'Calculated Fields', outcome: 'Create custom metrics and business KPIs', skills: ['Basic calculations & string functions', 'Date calculations (DATEDIFF, DATEPART)', 'IF / CASE logic', 'Level of Detail (LOD) expressions'], practice: 'Create a YoY growth calculated field' },
      { id: 5, icon: '🎨', title: 'Storytelling & Publishing', outcome: 'Deliver polished dashboards stakeholders love', skills: ['Story points for data narratives', 'Formatting & branding', 'Annotations & reference lines', 'Publishing to Tableau Public'], practice: 'Publish a portfolio dashboard to Tableau Public' },
    ],
  },
  {
    id: 'ai', title: 'AI in Analytics', icon: '🤖', color: '#8B5CF6',
    desc: 'Use AI tools to work 10× faster as a data analyst',
    stages: [
      { id: 1, icon: '🌱', title: 'AI Fundamentals', outcome: 'Understand how AI/ML fits into modern analytics', skills: ['AI vs ML vs Data Science', 'How LLMs (ChatGPT, Claude) work', 'Where AI helps vs. where it fails', 'AI ethics & hallucinations'], practice: 'Write a "What is AI in Analytics?" summary' },
      { id: 2, icon: '✍️', title: 'Prompt Engineering', outcome: 'Get better, faster answers from AI for data work', skills: ['Zero-shot vs few-shot prompts', 'Chain-of-thought prompting', 'Prompts for SQL & Python code', 'Prompts for insight summaries'], practice: 'Use ChatGPT to write 5 SQL queries from plain English' },
      { id: 3, icon: '🛠️', title: 'AI-Powered Tools', outcome: 'Supercharge your workflow with AI-native tools', skills: ['GitHub Copilot for Python', 'ChatGPT Advanced Data Analysis', 'Copilot in Excel & Power BI', 'Claude for report writing'], practice: 'Analyse a dataset entirely using ChatGPT Code Interpreter' },
      { id: 4, icon: '🧠', title: 'ML Concepts for Analysts', outcome: 'Work confidently alongside data scientists', skills: ['Supervised vs unsupervised learning', 'Train/test split & overfitting', 'Regression & classification basics', 'Feature importance interpretation'], practice: 'Explain a Random Forest output in plain English' },
      { id: 5, icon: '🚀', title: 'AI-Augmented Workflows', outcome: 'Build an end-to-end AI-assisted analysis pipeline', skills: ['AI-assisted EDA & anomaly detection', 'Automated report generation', 'Natural language to dashboard', 'Staying current with AI tools'], practice: 'Build a full AI-assisted analysis report for a business case' },
    ],
  },
  {
    id: 'ml', title: 'ML for Analysts', icon: '🧠', color: '#EC4899',
    desc: 'Apply machine learning to solve real business problems',
    stages: [
      { id: 1, icon: '🌱', title: 'ML Foundations', outcome: 'Understand when and why to use machine learning', skills: ['Types of ML: supervised, unsupervised', 'Train / Validation / Test split', 'Bias-variance tradeoff', 'scikit-learn basics'], practice: 'Run your first scikit-learn model end-to-end' },
      { id: 2, icon: '📈', title: 'Regression', outcome: 'Predict continuous outcomes like revenue or prices', skills: ['Linear & multiple regression', 'RMSE, MAE, R² metrics', 'Polynomial regression', 'Regularisation (Ridge, Lasso)'], practice: 'Predict house prices with Linear Regression' },
      { id: 3, icon: '🏷️', title: 'Classification', outcome: 'Predict categories like churn, fraud or conversion', skills: ['Logistic regression', 'Decision trees & Random Forest', 'Confusion matrix & accuracy', 'Precision, Recall, F1-score'], practice: 'Build a churn prediction model' },
      { id: 4, icon: '🎯', title: 'Model Evaluation', outcome: 'Choose the best model and validate it properly', skills: ['Cross-validation (k-fold)', 'ROC curve & AUC score', 'Hyperparameter tuning (GridSearch)', 'Feature importance & selection'], practice: 'Compare 3 classifiers and pick the best one' },
      { id: 5, icon: '🚀', title: 'End-to-End ML Pipeline', outcome: 'Deploy a working ML solution for a real business problem', skills: ['Feature engineering pipeline', 'sklearn Pipeline & ColumnTransformer', 'Saving models with joblib/pickle', 'Model monitoring basics'], practice: 'Build and deploy a fraud detection model locally' },
    ],
  },
  {
    id: 'dataeng', title: 'Data Engineering', icon: '⚙️', color: '#F59E0B',
    desc: 'Build the pipelines and infrastructure that power analytics',
    stages: [
      { id: 1, icon: '🌱', title: 'Data Infrastructure', outcome: 'Understand the data stack that powers modern companies', skills: ['OLTP vs OLAP databases', 'Data Warehouse vs Data Lake', 'Star schema & dimensional modeling', 'Modern data stack overview'], practice: 'Design a star schema for an e-commerce company' },
      { id: 2, icon: '🔄', title: 'ETL & ELT Pipelines', outcome: 'Move and transform data between systems reliably', skills: ['Extract: APIs, databases, flat files', 'Transform: clean, reshape, enrich', 'Load: writing to warehouses', 'ELT with dbt basics'], practice: 'Build a simple ETL pipeline with Python' },
      { id: 3, icon: <PyLogo />, title: 'Python for Data Engineering', outcome: 'Automate and schedule data workflows with code', skills: ['pandas for batch processing', 'SQLAlchemy & database connectors', 'File formats: Parquet, JSON, CSV', 'Scheduling with cron & Airflow basics'], practice: 'Automate a daily data refresh script' },
      { id: 4, icon: '☁️', title: 'Cloud Data Platforms', outcome: 'Work with the cloud services used in most data roles', skills: ['BigQuery basics (Google Cloud)', 'AWS S3 & Athena overview', 'Snowflake architecture', 'Loading data to the cloud'], practice: 'Query a public dataset in BigQuery' },
      { id: 5, icon: '🚀', title: 'Building a Data Platform', outcome: 'Design an end-to-end data platform for a real use case', skills: ['Data quality & testing', 'Orchestration with Airflow/Prefect', 'Data cataloging & lineage', 'Cost management & optimisation'], practice: 'Document and present a mini data platform design' },
    ],
  },
];

const STUDY_MATERIALS = [
  {
    id: 'sql', icon: '🗄️', title: 'SQL Interview Mastery', tag: 'PDF Guide', color: '#4A90D9',
    desc: 'Top 50 SQL questions from Google, Amazon & Flipkart hiring rounds with answers',
    pages: 24, level: 'All Levels',
    content: `# SQL Interview Mastery Guide
## Top 50 Questions for Data Analyst Roles

### SECTION 1: BASICS (Questions 1–10)

**Q1. What is the difference between WHERE and HAVING?**
WHERE filters rows BEFORE grouping. HAVING filters groups AFTER GROUP BY.
Rule: WHERE cannot use aggregate functions; HAVING can.
Interview tip: Always mention this distinction, it comes up in 80% of SQL rounds.

**Q2. Write a query to find duplicate emails in a users table.**
\`\`\`sql
SELECT email, COUNT(*) AS count
FROM users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;
\`\`\`

**Q3. What is the difference between DELETE, TRUNCATE, and DROP?**
- DELETE: Removes specific rows (WHERE condition), logged, rollback possible
- TRUNCATE: Removes all rows, faster, cannot be rolled back (DDL)
- DROP: Deletes the entire table structure + data permanently

**Q4. Explain JOINs with a real-world example.**
INNER JOIN: Orders that have matching customers (excludes orphan records)
LEFT JOIN: All customers, even those without orders (NULLs for no match)
RIGHT JOIN: All orders, even with missing customer data
FULL OUTER JOIN: All customers + all orders, NULLs where no match

\`\`\`sql
-- Find all customers and their order totals (including customers with no orders)
SELECT c.name, COALESCE(SUM(o.amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;
\`\`\`

### SECTION 2: INTERMEDIATE (Questions 11–25)

**Q11. What are window functions? Name 5 commonly used ones.**
Window functions perform calculations across a related set of rows WITHOUT collapsing them (unlike GROUP BY).
Common ones: ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), SUM() OVER, AVG() OVER, NTILE()

**Q12. Find the top 3 products by sales in each category.**
\`\`\`sql
SELECT category, product, total_sales FROM (
  SELECT category, product, SUM(amount) AS total_sales,
    RANK() OVER (PARTITION BY category ORDER BY SUM(amount) DESC) AS rnk
  FROM sales GROUP BY category, product
) ranked WHERE rnk <= 3;
\`\`\`

**Q13. Calculate month-over-month growth.**
\`\`\`sql
SELECT month, revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_month,
  ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0 /
        LAG(revenue) OVER (ORDER BY month), 2) AS mom_growth_pct
FROM monthly_sales;
\`\`\`

**Q14. What is a CTE? When to use it vs subquery?**
CTE (WITH clause) = named temporary result set.
Use CTE when: query is referenced multiple times, readability matters, recursive queries needed.
Use subquery when: one-time use, performance-critical (subqueries sometimes optimize better).

### SECTION 3: ADVANCED (Questions 26–40)

**Q26. Explain EXPLAIN ANALYZE and query optimization.**
EXPLAIN ANALYZE shows the query execution plan, how PostgreSQL executes your query.
Optimization tips:
1. Add indexes on columns used in WHERE, JOIN, ORDER BY
2. Avoid SELECT *. specify columns
3. Use EXISTS instead of IN for large subqueries
4. Partition large tables for range queries

**Q27. Write a cohort retention query.**
\`\`\`sql
WITH cohorts AS (
  SELECT user_id,
    DATE_TRUNC('month', signup_date) AS cohort_month
  FROM users
),
activity AS (
  SELECT user_id, DATE_TRUNC('month', activity_date) AS active_month
  FROM user_activity
)
SELECT c.cohort_month,
  COUNT(DISTINCT c.user_id) AS cohort_size,
  COUNT(DISTINCT a.user_id) AS retained,
  ROUND(COUNT(DISTINCT a.user_id) * 100.0 / COUNT(DISTINCT c.user_id), 1) AS retention_pct
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
  AND a.active_month = c.cohort_month + INTERVAL '1 month'
GROUP BY c.cohort_month ORDER BY c.cohort_month;
\`\`\`

### SECTION 4: CRACK THE INTERVIEW (Tips)

1. Think aloud: interviewers want to see your reasoning
2. Ask clarifying questions before writing SQL
3. Start with the simplest query, then optimize
4. Know your NULL handling (IS NULL, COALESCE, IFNULL)
5. Practice on StrataScratch, LeetCode, HackerRank daily`
  },
  {
    id: 'python', icon: <PyLogo />, title: 'Python & Pandas Handbook', tag: 'Cheatsheet', color: '#5CC8A0',
    desc: 'Complete reference for Pandas, NumPy, and data manipulation with interview patterns',
    pages: 18, level: 'Beginner → Advanced',
    content: `# Python & Pandas Data Analyst Handbook

## PANDAS ESSENTIALS

### DataFrame Creation
\`\`\`python
import pandas as pd
import numpy as np

# From dict
df = pd.DataFrame({'name': ['Alice','Bob'], 'age': [25, 30], 'city': ['Delhi','Mumbai']})

# From CSV
df = pd.read_csv('data.csv', parse_dates=['date'], index_col='id')

# Quick checks (always run these first!)
df.shape          # (rows, cols)
df.dtypes         # data types per column
df.info()         # non-null counts + dtypes
df.describe()     # statistical summary
df.head(10)       # first 10 rows
df.isnull().sum() # missing values per column
\`\`\`

### Selecting Data
\`\`\`python
# .loc: label-based
df.loc[0]                    # row by index label
df.loc[0:5, 'name':'city']   # row range + col range
df.loc[df['age'] > 25]       # boolean filter

# .iloc: position-based
df.iloc[0]                   # first row
df.iloc[0:5, 0:2]            # first 5 rows, first 2 cols
df.iloc[-1]                  # last row

# Interview Tip: .loc is inclusive of endpoint; .iloc is exclusive
\`\`\`

### Data Cleaning Patterns
\`\`\`python
# Handle missing values
df.isnull().sum()                          # count nulls
df.dropna(subset=['critical_col'])         # drop rows where critical col is null
df['col'].fillna(df['col'].median())       # fill with median
df.fillna(method='ffill')                 # forward fill

# Remove duplicates
df.duplicated().sum()                      # count duplicates
df.drop_duplicates(subset=['email'])       # dedupe by email

# Fix data types
df['date'] = pd.to_datetime(df['date'])
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
df['category'] = df['category'].astype('category')  # memory efficient

# Strip whitespace from strings
df['name'] = df['name'].str.strip().str.title()
\`\`\`

### GroupBy & Aggregation
\`\`\`python
# Basic groupby
df.groupby('category')['amount'].sum()

# Multiple aggregations (most asked in interviews!)
result = df.groupby('category').agg(
    total_sales=('amount', 'sum'),
    avg_order=('amount', 'mean'),
    order_count=('id', 'count'),
    max_order=('amount', 'max')
).reset_index()

# Groupby multiple columns
df.groupby(['region', 'category'])['revenue'].sum().unstack()
\`\`\`

### Outlier Detection (IQR Method)
\`\`\`python
def remove_outliers_iqr(df, col):
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    print(f"Removing {((df[col] < lower) | (df[col] > upper)).sum()} outliers")
    return df[(df[col] >= lower) & (df[col] <= upper)]

df_clean = remove_outliers_iqr(df, 'revenue')
\`\`\`

### Merging DataFrames
\`\`\`python
# Like SQL JOINs
pd.merge(df1, df2, on='id', how='inner')   # INNER JOIN
pd.merge(df1, df2, on='id', how='left')    # LEFT JOIN
pd.merge(df1, df2, on='id', how='outer')   # FULL OUTER JOIN

# Multiple keys
pd.merge(orders, customers, left_on='customer_id', right_on='id')
\`\`\`

## INTERVIEW PATTERNS

**Pattern 1: Month-over-month analysis**
\`\`\`python
df['month'] = df['date'].dt.to_period('M')
monthly = df.groupby('month')['revenue'].sum().reset_index()
monthly['prev_revenue'] = monthly['revenue'].shift(1)
monthly['mom_growth'] = (monthly['revenue'] - monthly['prev_revenue']) / monthly['prev_revenue'] * 100
\`\`\`

**Pattern 2: Cohort analysis**
\`\`\`python
df['cohort'] = df.groupby('user_id')['date'].transform('min').dt.to_period('M')
df['order_month'] = df['date'].dt.to_period('M')
df['period'] = (df['order_month'] - df['cohort']).apply(lambda x: x.n)
cohort_table = df.groupby(['cohort', 'period'])['user_id'].nunique().unstack()
\`\`\`

**Pattern 3: Running totals**
\`\`\`python
df['running_total'] = df.sort_values('date')['amount'].cumsum()
df['7d_rolling_avg'] = df['revenue'].rolling(window=7, min_periods=1).mean()
\`\`\``
  },
  {
    id: 'stats', icon: '📐', title: 'Statistics for Data Analysts', tag: 'Study Guide', color: '#E8A838',
    desc: 'Essential statistics, probability, and hypothesis testing for analyst interviews',
    pages: 16, level: 'Intermediate',
    content: `# Statistics for Data Analysts

## WHY STATISTICS MATTERS IN INTERVIEWS

Every FAANG-style data analyst interview includes at least 1–2 statistics questions. These can make or break your offer.

## SECTION 1: DESCRIPTIVE STATISTICS

### Measures of Central Tendency
- **Mean**: Sum / Count. Sensitive to outliers. Use for normally distributed data.
- **Median**: Middle value. Robust to outliers. Use for skewed distributions (salaries, house prices).
- **Mode**: Most frequent value. Useful for categorical data.

**Interview Q**: "A product has 100 reviews. 90 are 5-star, 10 are 1-star. Which is a better measure: mean or median rating?"
Answer: Median, because the distribution is bimodal and mean is pulled by extremes.

### Measures of Spread
- **Standard Deviation**: Average distance from the mean. σ for population, s for sample.
- **Variance**: σ²: harder to interpret (different units)
- **IQR (Interquartile Range)**: Q3 - Q1. Robust outlier measure.
- **Coefficient of Variation**: (SD/Mean) × 100. compares variability across different scales

### Distributions
- **Normal Distribution**: Bell curve, mean=median=mode, 68-95-99.7 rule
- **Right-skewed**: Long tail on right (income, revenue). Mean > Median.
- **Left-skewed**: Long tail on left (age at retirement). Mean < Median.
- **Uniform**: Equal probability for all values

## SECTION 2: PROBABILITY

### Key Concepts
- **P(A)**: Probability of event A = favourable outcomes / total outcomes
- **P(A∩B)**: Joint probability. P(A) × P(B) if independent
- **P(A∪B)**: Union. P(A) + P(B) - P(A∩B)
- **P(A|B)**: Conditional probability. P(A∩B) / P(B)
- **Bayes' Theorem**: P(A|B) = P(B|A) × P(A) / P(B)

**Interview Q**: "A model identifies 95% of fraudulent transactions (recall). But 80% of its 'fraud' alerts are actually legitimate (precision = 20%). How do you balance this?"
Answer: Use F1-Score = 2×(Precision×Recall)/(Precision+Recall). Tune threshold based on business cost of false positives vs false negatives.

## SECTION 3: HYPOTHESIS TESTING

### The Framework
1. State H₀ (null) and H₁ (alternative)
2. Choose significance level α (usually 0.05)
3. Calculate test statistic and p-value
4. Reject H₀ if p-value < α

### Common Tests
| Test | When to Use |
|------|-------------|
| One-sample t-test | Compare sample mean to known value |
| Two-sample t-test | Compare means of two independent groups |
| Paired t-test | Before/after same group |
| Chi-square | Independence of categorical variables |
| ANOVA | Compare means of 3+ groups |

### A/B Testing (Most Asked!)
**Setup**: Control (A) vs Treatment (B). Randomly assign users.
**Metrics**: Primary metric (conversion rate) + guardrail metrics (revenue, churn)
**Sample Size**: Calculated before running, based on MDE, α, and power (1-β)
**Duration**: Run for complete business cycles (min. 1–2 weeks)

\`\`\`python
from scipy import stats

# Two-sample t-test
control = [0.05, 0.04, 0.06, 0.05, 0.07]   # conversion rates
treatment = [0.06, 0.07, 0.08, 0.06, 0.09]

t_stat, p_value = stats.ttest_ind(control, treatment)
print(f"p-value: {p_value:.4f}")
print("Significant!" if p_value < 0.05 else "Not significant")
\`\`\`

**Interview Q**: "Your A/B test shows p=0.04. Is this result significant? Should you ship?"
A: p=0.04 < 0.05, so statistically significant. But ALSO check:
- Effect size (is 0.5% CTR lift meaningful for the business?)
- Sample size adequacy
- Whether test ran long enough
- Segment-level effects (novelty effect, Simpson's paradox?)

## SECTION 4: REGRESSION

### Linear Regression
y = β₀ + β₁x₁ + β₂x₂ + ε
- **R²**: % variance explained by the model (higher = better, max 1.0)
- **Adjusted R²**: R² penalised for extra variables (use this for multiple regression)
- **p-values for coefficients**: Are individual predictors significant?
- **Residuals**: Should be normally distributed, no pattern vs fitted values

### Interview Tips
- "Assumptions of linear regression?" → Linearity, independence, normality of errors, homoscedasticity, no multicollinearity
- "What's the difference between correlation and causation?" → Classic question. Correlation is association; causation requires controlled experiments or causal inference methods.`
  },
  {
    id: 'excel', icon: '📊', title: 'Excel Power User Guide', tag: 'Cheatsheet', color: '#a78bfa',
    desc: 'Advanced Excel formulas, pivot tables, and dashboard techniques for analysts',
    pages: 12, level: 'Beginner → Advanced',
    content: `# Excel Power User Guide for Data Analysts

## MUST-KNOW FORMULAS

### Lookup Functions
\`\`\`
VLOOKUP(lookup_value, table_array, col_index, [exact_match])
=VLOOKUP(A2, CustomerTable, 3, FALSE)  -- 3rd column, exact match

XLOOKUP(lookup, lookup_array, return_array, [if_not_found])  -- Excel 365+
=XLOOKUP(A2, B:B, C:C, "Not Found")   -- more flexible than VLOOKUP

INDEX-MATCH (legacy but universal):
=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))
\`\`\`

### Conditional Formulas
\`\`\`
COUNTIF:  =COUNTIF(A:A, ">100")
COUNTIFS: =COUNTIFS(A:A, ">100", B:B, "North")  -- multiple criteria
SUMIF:    =SUMIF(region_col, "North", sales_col)
SUMIFS:   =SUMIFS(sales, region, "North", year, 2024)
AVERAGEIFS, MAXIFS, MINIFS (same pattern)
\`\`\`

### Text Functions
\`\`\`
=LEFT(A2, 5)          -- first 5 characters
=RIGHT(A2, 3)         -- last 3 characters
=MID(A2, 3, 4)        -- 4 chars starting at position 3
=LEN(A2)              -- length
=TRIM(A2)             -- remove extra spaces
=UPPER/LOWER/PROPER   -- case conversion
=CONCATENATE(A2," ",B2) or =A2&" "&B2
=TEXT(A2, "DD-MMM-YYYY") -- format as text
\`\`\`

### Date Functions
\`\`\`
=TODAY()              -- current date
=YEAR(A2), =MONTH(A2), =DAY(A2)
=EOMONTH(A2, 0)       -- last day of month
=DATEDIF(start, end, "M")  -- months between dates
=NETWORKDAYS(start, end)   -- working days (excludes weekends)
=WEEKDAY(A2, 2)       -- 1=Monday, 7=Sunday (mode 2)
\`\`\`

## PIVOT TABLES

### Quick Setup
1. Click anywhere in data → Insert → PivotTable
2. Drag fields: Rows (categories), Columns (secondary split), Values (numbers), Filters (global filter)
3. Right-click value → Summarize by → Sum/Count/Average
4. Show Values As → % of Total, Running Total, Difference From...

### Pro Tips
- **Calculated Fields**: Analyze tab → Fields, Items & Sets → Calculated Field (e.g., Margin = Revenue - Cost)
- **Grouping Dates**: Right-click a date → Group → choose Month/Quarter/Year
- **Slicers**: Insert → Slicer: interactive filters that update pivot and charts
- **Timeline**: Insert → Timeline: filter by date ranges visually

## CHARTS & DASHBOARDS

### Choosing the Right Chart
| Data Type | Best Chart |
|-----------|-----------|
| Trend over time | Line chart |
| Comparison (few items) | Bar/Column chart |
| Part of a whole | Pie (≤5 segments) or 100% stacked bar |
| Distribution | Histogram |
| Correlation | Scatter plot |
| Ranking | Horizontal bar |

### Dashboard Tips
1. Use a single consistent color palette (2–3 colors)
2. Lead with the KPI numbers (big, bold)
3. Use sparklines for space-efficient trends
4. Name ranges → formulas become readable
5. Protect sheets to prevent accidental changes
6. Use slicers linked to multiple charts

## DATA CLEANING IN EXCEL

\`\`\`
Remove duplicates: Data tab → Remove Duplicates
Flash Fill: Ctrl+E: pattern-based fill
Text to Columns: Split on delimiter (comma, space)
Find & Replace: Ctrl+H: bulk replace, including blank cells
Filter then delete: Filter → select blanks → delete visible rows
\`\`\`

## POWER QUERY (Game Changer)

Power Query (Data → Get Data) handles:
- Merging multiple CSV files from a folder
- Pivoting/unpivoting data
- Custom column transformations (M language)
- Connecting to SQL databases, APIs
- Refreshable data pipelines

**Interview tip**: Knowing Power Query puts you ahead of 90% of candidates. Mention it.`
  },
  {
    id: 'casestudies', icon: '🏢', title: 'Analytics Case Study Bank', tag: 'Case Studies', color: '#F07B6A',
    desc: '20 real cases from Swiggy, Zomato, Flipkart, Meesho & CRED with full frameworks',
    pages: 28, level: 'Intermediate → Hard',
    content: `# Analytics Case Study Bank
## 20 Cases from Top Indian Tech Companies

### HOW TO APPROACH ANY CASE STUDY

**The SCQA Framework:**
- **S**ituation: What's the business context?
- **C**omplication: What's the problem/change?
- **Q**uestion: What do we need to find out?
- **A**nswer: Your structured solution

**4-Step Answer Structure:**
1. Clarify the question (ask 2–3 good questions)
2. Break down the problem (segments, metrics, hypotheses)
3. Deep-dive with data approach
4. Recommend action + success metrics

---

### CASE 1: Swiggy Order Drop

**Scenario**: Swiggy's order volume dropped 15% in the last 7 days. CEO asks you to investigate. You have access to all data.

**Step 1: Clarifying Questions to Ask:**
- Is the drop in all cities or specific ones?
- All food categories or specific cuisines?
- Is the app working correctly (no crashes)?
- Did any pricing/discount changes happen?
- Is a competitor running a campaign?

**Step 2: Breakdown Framework:**
Supply side: Restaurant availability ↓ → fewer options shown
Demand side: CTR drop → conversion drop → basket size drop
External: Weather, local holidays, competitor promotions, app store reviews

**Step 3: Analysis Approach:**
\`\`\`sql
-- Check by city
SELECT city,
  SUM(CASE WHEN order_date >= CURRENT_DATE - 7 THEN 1 END) AS last_7d,
  SUM(CASE WHEN order_date BETWEEN CURRENT_DATE - 14 AND CURRENT_DATE - 7 THEN 1 END) AS prior_7d,
  ROUND((SUM(CASE WHEN order_date >= CURRENT_DATE - 7 THEN 1 END) -
         SUM(CASE WHEN order_date BETWEEN CURRENT_DATE-14 AND CURRENT_DATE-7 THEN 1 END)) * 100.0 /
        SUM(CASE WHEN order_date BETWEEN CURRENT_DATE-14 AND CURRENT_DATE-7 THEN 1 END), 1) AS pct_change
FROM orders
GROUP BY city ORDER BY pct_change;
\`\`\`

**Step 4: Recommendation:**
If city-specific: investigate local supply, weather, event
If all cities: check app performance, recent product changes, competitor activity
Metric to watch: Daily Active Users → App Opens → Search → Add to Cart → Order Placed (funnel)

---

### CASE 2: Define North Star Metric for an E-Learning Platform

**Q**: "You've just joined Datamyze as their first data analyst. Define the North Star Metric."

**Framework:**
North Star = the single metric that best captures the value delivered to users AND drives revenue.

**Bad NSMs**: Revenue (lags), DAU (vanity), # courses enrolled (does not = learning)

**Good candidates:**
- Weekly Active Learners who complete ≥1 lesson (engagement + learning)
- Lessons completed per week (activity quality)

**Recommendation**: "Weekly Lesson Completions". captures habit formation, learning progress, and correlates with premium conversion.

**Supporting metrics (health metrics):**
- Completion rate per course (content quality signal)
- Streak maintenance rate (habit signal)
- Problem submission rate (active learning signal)
- NPS / CSAT (satisfaction signal)

---

### CASE 3: A/B Test. 10% CTR Increase But 5% Revenue Drop

**Q**: "Feature X boosts header banner CTR by 10% but revenue is down 5%. Do you ship?"

**Analysis Before Deciding:**
1. Is the revenue drop statistically significant? (run t-test)
2. What's the absolute impact? 10% CTR on 1M users = 100k more clicks. 5% revenue on ₹10Cr = ₹50L loss.
3. Is there a lag effect? Users may be exploring before converting.
4. Segment analysis: Does X help new users but hurt power users?
5. Duration: Run test for ≥2 full business cycles

**Decision Framework:**
- If revenue drop is significant AND absolute loss > CTR gain value → Don't ship
- If revenue drop is not significant → Run longer, then decide
- If only new users affected negatively → Ship with personalization (exclude new users initially)

**Answer**: "I would NOT ship immediately. I'd extend the test, run segment analysis, and quantify the absolute revenue impact before making a final recommendation to the PM team."

---

### CASE 4: Churn Prediction Model for a SaaS Product

**Define Churn**: No login for 30 consecutive days (adjust based on product usage frequency)

**Features to Engineer:**
| Feature | Signal |
|---------|--------|
| Logins in last 14 days | Recency |
| Feature X usage frequency | Depth |
| Support tickets opened | Frustration |
| Days since last payment | Engagement |
| Plan type (free/paid) | Value tier |

**Modelling Approach:**
1. Label: 1 = churned (no login for 30d), 0 = retained
2. Train XGBoost or Logistic Regression (explain to stakeholder: "logistic regression is interpretable")
3. Evaluate with Precision-Recall curve (care more about recall, don't miss churners)
4. Set threshold at F1-optimised point

**Action**: Email campaign for users with churn probability > 0.7. Offer 30% discount. Track recovery rate.

---

*...16 more cases available in the full guide covering:*
*Flipkart search ranking, CRED reward strategy, Meesho seller churn, Zomato restaurant scoring, Urban Company demand forecasting, PhonePe fraud detection, and more.*`
  },
  {
    id: 'viz', icon: '📈', title: 'Data Visualisation Bible', tag: 'Design Guide', color: '#38bdf8',
    desc: 'Chart selection, dashboard design, Tableau & Power BI tips for analyst portfolios',
    pages: 14, level: 'All Levels',
    content: `# Data Visualisation Bible for Data Analysts

## THE GOLDEN RULE: Every chart should answer ONE question

## SECTION 1: CHOOSING THE RIGHT CHART

### Decision Tree
\`\`\`
What do you want to show?
├── Change over time → Line chart (multiple series = multiple lines)
├── Comparison
│   ├── Few categories (≤7) → Bar/Column chart
│   └── Many categories → Dot plot or Horizontal bar (sorted)
├── Distribution
│   ├── Single variable → Histogram
│   ├── Two variables → Scatter plot
│   └── Multiple groups → Box plot
├── Part of a whole
│   ├── ≤5 slices, values very different → Pie chart
│   └── ≥5 slices OR similar values → 100% Stacked bar
├── Correlation → Scatter plot (add trend line)
└── Geography → Choropleth map (colour-coded regions)
\`\`\`

## SECTION 2: DESIGN PRINCIPLES

### The 5 Second Rule
If a chart doesn't communicate its insight within 5 seconds, redesign it.

### Colour Rules
1. Use ONE colour for a single variable (varying shades for magnitude)
2. Use contrasting colours for categories (max 7 distinct colours)
3. Red = bad/negative, Green = good/positive (universal)
4. Grey out unimportant data points, make the insight pop in colour

### Common Mistakes to Avoid
❌ 3D charts: distort perception
❌ Pie charts with >5 slices
❌ Dual-axis charts without clear labelling
❌ Starting the Y-axis at a non-zero value (misleading)
❌ Too many colours on one chart
❌ Chartjunk: unnecessary gridlines, borders, backgrounds

## SECTION 3: TABLEAU ESSENTIALS

### Must-Know Calculated Fields
\`\`\`
// Running total
RUNNING_SUM(SUM([Sales]))

// Year-over-year growth
(SUM([Revenue]) - LOOKUP(SUM([Revenue]), -1)) / ABS(LOOKUP(SUM([Revenue]), -1))

// Rank within group
RANK(SUM([Sales]))  -- use PARTITION for within-category rank
\`\`\`

### Dashboard Best Practices
1. **Z-pattern layout**: Top-left to top-right (headline KPIs) → bottom-left to bottom-right (details)
2. **Use containers**: Horizontal + Vertical for responsive layout
3. **Action filters**: Click one chart → filter related charts
4. **Parameters**: User-controlled inputs (date range, metric toggle)
5. **Mobile layout**: Always create a separate mobile view

## SECTION 4: POWER BI

### DAX Basics
\`\`\`dax
// Total Revenue
Total Revenue = SUM(Sales[Amount])

// Running Total
Running Total = CALCULATE([Total Revenue], FILTER(ALL(Sales[Date]), Sales[Date] <= MAX(Sales[Date])))

// MoM Growth %
MoM Growth = DIVIDE([Total Revenue] - CALCULATE([Total Revenue], PREVIOUSMONTH(Calendar[Date])),
             CALCULATE([Total Revenue], PREVIOUSMONTH(Calendar[Date])))

// Rank
Sales Rank = RANKX(ALL(Products[Category]), [Total Revenue])
\`\`\`

### Star Schema (Critical concept for BI interviews)
Fact Table: transactional data (orders, events): large, numeric
Dimension Tables: descriptive data (customers, products, dates): smaller, categorical
Relationship: Fact.customer_id → Customers.id (many-to-one)

## SECTION 5: PORTFOLIO ADVICE

### What Makes a Great Analyst Portfolio
1. **End-to-end projects**: Raw data → cleaning → analysis → dashboard → insights
2. **Business framing**: Every project answers a real business question
3. **Hosted online**: Tableau Public, GitHub Pages, Streamlit
4. **README**: Problem statement, approach, key findings (3 bullets)
5. **Variety**: 1 SQL project, 1 Python EDA, 1 BI dashboard minimum

### Project Ideas
- Customer segmentation with RFM analysis (any e-commerce dataset)
- Zomato restaurant analysis (Kaggle dataset)
- Stock price EDA with Python
- COVID data dashboard in Tableau
- Cricket IPL analysis with SQL`
  },
  {
    id: 'resume', icon: '📝', title: 'Resume & LinkedIn Playbook', tag: 'Career Guide', color: '#E8A838',
    desc: 'ATS-optimised resume template, LinkedIn keywords, and cold messaging scripts',
    pages: 10, level: 'All Levels',
    content: `# Resume & LinkedIn Playbook for Data Analysts

## THE REALITY: Recruiters spend 6 seconds on your resume

## SECTION 1: THE ATS-OPTIMISED RESUME

### Format Rules
- **Length**: 1 page for <3 years experience, 2 pages max for >3 years
- **Font**: Arial 10–11pt, Calibri, or Garamond. NO fancy fonts.
- **Margins**: 0.5–0.75 inches
- **File format**: PDF (preserves formatting) unless asked for Word
- **File name**: FirstName_LastName_DataAnalyst_Resume.pdf

### The 4-Part Structure
\`\`\`
1. CONTACT INFO
Name | Email | Phone | LinkedIn URL | GitHub (if relevant) | City, State
(No photo, no date of birth, no address)

2. PROFESSIONAL SUMMARY (3 lines, optional for freshers)
"Data Analyst with 2 years of experience in SQL, Python, and Tableau.
Reduced reporting time by 40% through automated dashboards at XYZ Corp.
Seeking Senior Analyst role in a product-first company."

3. SKILLS SECTION (put this high. ATS scans here first)
SQL: Advanced (window functions, CTEs, query optimisation)
Python: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn
BI Tools: Tableau (Public certified), Power BI, Looker, Metabase
Other: Excel (Advanced), Git, Airflow, Jupyter, Databricks

4. EXPERIENCE (reverse chronological)
Company Name | Role | City | Month Year – Month Year
• [Action verb] + [what you did] + [quantified impact]
Example: "Built an automated churn prediction model using XGBoost, reducing
customer churn by 12% and saving ₹45L in annual revenue."
\`\`\`

### The Impact Formula
Every bullet = VERB + ACTION + NUMBER
❌ "Worked on customer analytics"
✅ "Analysed 2M+ customer transactions in SQL to identify top 100 at-risk accounts, enabling targeted campaigns that recovered ₹8.2L in revenue"

### ATS Keywords to Include (2024)
SQL, Python, Pandas, Tableau, Power BI, Data Visualisation,
A/B Testing, Statistical Analysis, Data Cleaning, ETL,
Business Intelligence, Data Pipeline, Cohort Analysis,
Excel, Dashboard, Stakeholder Management, Data Storytelling

## SECTION 2: LINKEDIN OPTIMISATION

### 5 Profile Sections That Get Recruiter Attention

**1. Headline** (most visible part)
❌ "Data Analyst | IIT Delhi 2023"
✅ "Data Analyst | SQL · Python · Tableau | Helped 3 companies reduce churn by 15%+"

**2. About Section** (2–3 short paragraphs)
- Para 1: Who you are + your specialty
- Para 2: Key accomplishments with numbers
- Para 3: What you're looking for

**3. Featured Section**
- Pin your best project (Tableau Public dashboard, GitHub project, Medium article)
- This is the first thing recruiters click, make it count

**4. Skills Section**
Add 10–20 skills, starting with your strongest. Ask connections to endorse.

**5. Open to Work** (Green banner)
Set to "Hiring Managers Only" (not everyone) to avoid current employer seeing it.

## SECTION 3: COLD MESSAGING THAT WORKS

### The Formula for Recruiter Outreach
\`\`\`
Subject: Data Analyst opening at [Company]

Hi [Name],

I noticed [Company] is hiring a Data Analyst for the [team] team.

Quick background: I'm a data analyst with [X] years experience in
[SQL/Python/Tableau]. Recently [one specific achievement. 1 line].

I'd love to learn more about the role. Would you be open to a
5-minute call this week?

[Your name]
\`\`\`

### Connection Request Note (300 chars max)
"Hi [Name], I came across your profile while researching [Company].
I'm a data analyst with strong SQL & Tableau skills exploring opportunities.
Would love to connect and learn from your journey at [Company]."

**Response rate if you do this**: 30–40% (vs <5% for bulk applications)`
  },
  {
    id: 'salary', icon: '🎯', title: 'Salary Negotiation Scripts', tag: 'Negotiation', color: '#5CC8A0',
    desc: 'Exact scripts, market benchmarks, and negotiation tactics for data analyst offers in India',
    pages: 8, level: 'All Levels',
    content: `# Salary Negotiation Scripts for Data Analysts in India

## MARKET BENCHMARKS (2024, India)

### Fresher → 1 Year Experience
| Company Type | Base CTC |
|-------------|----------|
| Startup (Seed/Series A) | ₹4–7 LPA |
| Startup (Series B+) | ₹6–10 LPA |
| Mid-size tech company | ₹5–9 LPA |
| FAANG/top product co. | ₹12–20 LPA |
| Consulting (Big 4) | ₹4–7 LPA |

### 2–4 Years Experience
| Company Type | Base CTC |
|-------------|----------|
| Startup | ₹10–18 LPA |
| Top product company | ₹18–35 LPA |
| FAANG | ₹30–60 LPA |

**Golden rule**: Always have 2 competing offers. It's the best leverage.

## THE 4 RULES OF NEGOTIATION

**Rule 1**: Never give a number first
"I'm open to discussing compensation: what's the budgeted range for this role?"

**Rule 2**: Always negotiate (even if you're happy with the offer)
Companies expect it. 90% will go up at least 10–15%.

**Rule 3**: Negotiate the total package, not just base
Stock options/ESOPs, joining bonus, variable pay, WFH policy, learning budget: all negotiable.

**Rule 4**: Silence is your superpower
After stating your number, stop talking. Let them respond.

## THE EXACT SCRIPTS

### Script 1: Responding to an Offer (Phone Call)
"Thank you so much for the offer. I'm genuinely excited about this opportunity and the team.
I've been doing some market research and looking at my experience with [specific skills],
I was expecting something closer to ₹[X].
Is there flexibility to move towards that range?"

### Script 2: When They Say "This Is Our Maximum"
"I understand there may be budget constraints. Could we explore other components?
For example, a joining bonus, additional ESOPs, or an earlier performance review
at 6 months instead of a year?"

### Script 3: Competing Offer Leverage
"I want to be transparent with you. I do have another offer at ₹[X].
[Company] is my first choice because of [specific reason].
If you can come close to that number, I'm ready to sign today."

### Script 4: Email Follow-up After Verbal Offer
Subject: Re: Job Offer. Data Analyst Role

Dear [Name],

Thank you for the offer. I'm very excited about joining [Company].

After reviewing the offer and considering my market research and
[2-3 years/specific skill] experience, I'd like to respectfully
request a base CTC of ₹[X].

I'm confident I'll add significant value to the team and am
prepared to commit fully. Please let me know if this is feasible.

Looking forward to your response.
[Your name]

## NEGOTIATION CHECKLIST

Before accepting ANY offer, ask about:
☐ Exact base CTC (in-hand calculation after PF/tax)
☐ Variable/bonus structure (realistic vs. promised)
☐ ESOP cliff and vesting schedule
☐ Joining bonus (especially if leaving current company early)
☐ Annual increment cycle (when and how much?)
☐ WFH/hybrid policy (commute cost matters!)
☐ Learning & development budget (₹20–50k/year is reasonable)
☐ Health insurance coverage (self + family?)
☐ Notice period flexibility

## WHEN TO WALK AWAY

Walk away if:
- Offer is >20% below your market value AND they won't budge
- Company says "take it or leave it" on first offer (red flag for culture)
- Role description keeps changing
- No clarity on growth path after 1–2 years`
  },
];

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function Premium() {
  const { user } = useAuth();
  const [status, setStatus]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep]           = useState(1);
  const [utr, setUtr]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [toast, setToast]         = useState('');
  const [cfLoading, setCfLoading]   = useState(false);
  const [coupon, setCoupon]         = useState('');
  const [couponMsg, setCouponMsg]   = useState(''); // '' | 'valid' | 'invalid'
  const VALID_COUPONS               = { 'SAARANGI50': 149 };
  // Only apply discount when coupon is explicitly validated by clicking Apply
  const finalAmount                 = couponMsg === 'valid' ? (VALID_COUPONS[coupon.toUpperCase().trim()] || 199) : 199;

  function applyCoupon() {
    const c = coupon.toUpperCase().trim();
    if (VALID_COUPONS[c]) setCouponMsg('valid');
    else { setCouponMsg('invalid'); setTimeout(() => setCouponMsg(''), 2500); }
  }

  useEffect(() => {
    api.get('/premium/status').then(r => setStatus(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Handle return from Cashfree redirect (fallback if modal closes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId  = params.get('order_id');
    const cfStatus = params.get('cf_status');
    if (orderId) {
      window.history.replaceState({}, '', '/premium');
      api.get(`/premium/cashfree/verify/${orderId}`)
        .then(r => {
          if (r.data.status === 'PAID') {
            api.get('/premium/status').then(sr => setStatus(sr.data));
            setToast('🎉 Payment successful! Premium activated.');
          } else if (cfStatus === 'ACTIVE') {
            setToast('⏳ Payment is being processed. Your account will be activated shortly.');
          }
        })
        .catch(() => {});
    }
  }, []);

  async function handleCashfreePay() {
    setCfLoading(true);
    setToast('');
    try {
      // Create order on backend
      const r = await api.post('/premium/cashfree/create-order', { coupon: couponMsg === 'valid' ? coupon.toUpperCase().trim() : '' });
      const { payment_session_id, order_id, cf_env } = r.data;

      // Load Cashfree JS SDK if not already loaded
      if (!window.Cashfree) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const cashfree = window.Cashfree({ mode: cf_env || 'production' });
      const result = await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: '_modal',
      });

      if (result?.error) {
        setToast('Payment failed: ' + (result.error.message || 'Please try again.'));
        return;
      }

      // Payment completed: verify with backend
      setToast('Verifying payment…');
      const verify = await api.get(`/premium/cashfree/verify/${order_id}`);
      if (verify.data.status === 'PAID') {
        const sr = await api.get('/premium/status');
        setStatus(sr.data);
        setShowModal(false);
        setToast('🎉 Welcome to Pro! Your premium is now active.');
      } else {
        setToast('⏳ Payment is being processed. Refresh in a moment.');
      }
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Something went wrong.';
      setToast('❌ ' + msg);
    } finally {
      setCfLoading(false);
      setTimeout(() => setToast(''), 6000);
    }
  }

  async function submitUTR(receiptFilename = null, receiptOriginal = null) {
    if (!utr.trim() || utr.trim().length < 6) { setToast('Enter a valid UTR / Transaction ID'); return; }
    setSubmitting(true);
    try {
      await api.post('/premium/subscribe', { utr_number: utr.trim(), receipt_filename: receiptFilename, receipt_original: receiptOriginal });
      const r = await api.get('/premium/status');
      setStatus(r.data);
      setShowModal(false); setUtr(''); setStep(1);
      setToast('✅ Payment submitted! Your account will be activated within 2 hours.');
    } catch (e) {
      setToast(e.response?.data?.error || 'Something went wrong.');
    } finally {
      setSubmitting(false); setTimeout(() => setToast(''), 4000);
    }
  }

  function copyUPI() {
    navigator.clipboard.writeText(UPI_ID).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  const isPremium = status?.is_premium === 1;
  const isPending = status?.latest_subscription?.status === 'pending';

  /* ── Premium member hub ─────────────────────────── */
  if (isPremium) {
    return <PremiumHub status={status} user={user} />;
  }

  /* ── Upgrade page (non-premium) ─────────────────── */
  return (
    <UpgradePage
      isPending={isPending} status={status}
      showModal={showModal} setShowModal={setShowModal}
      step={step} setStep={setStep}
      utr={utr} setUtr={setUtr}
      submitting={submitting} submitUTR={submitUTR}
      copied={copied} copyUPI={copyUPI}
      toast={toast}
      cfLoading={cfLoading} handleCashfreePay={handleCashfreePay}
      coupon={coupon} setCoupon={setCoupon}
      couponMsg={couponMsg} applyCoupon={applyCoupon}
      finalAmount={finalAmount}
    />
  );
}

/* ═══════════════════════════════════════════════════
   PREMIUM HUB (what paying members see)
═══════════════════════════════════════════════════ */
const HUB_TABS = [
  { id: 'overview',   icon: '🏠', label: 'Overview'       },
  { id: 'session',    icon: '📅', label: '1:1 Sessions'    },
  { id: 'resume',     icon: '📄', label: 'Resume Review'   },
  { id: 'interview',  icon: '🎓', label: 'Mock Interviews' },
  { id: 'projects',   icon: '🔬', label: 'Real Projects'   },
  { id: 'roadmap',    icon: '🗺️', label: 'Roadmap'         },
  { id: 'resources',  icon: '📚', label: 'Resources'       },
  { id: 'support',    icon: '⭐', label: 'Support'         },
];

function PremiumHub({ status, user }) {
  const [tab, setTab]               = useState('overview');
  const [sessions, setSessions]     = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [mockCount, setMockCount]   = useState(0);
  const [toast, setToast]           = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/premium/sessions').then(r => setSessions(r.data.sessions || [])).catch(() => {});
    api.get('/premium/resume').then(r => setReviews(r.data.reviews || [])).catch(() => {});
    api.get('/premium/mock-interview').then(r => setMockCount((r.data.interviews || []).length)).catch(() => {});
  }, []);

  const expiryDate = status?.premium_expires_at
    ? new Date(status.premium_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <style>{`
        @keyframes goldShimmer { 0%{background-position:-250% center} 100%{background-position:250% center} }
        @keyframes crownGlow   { 0%,100%{box-shadow:0 0 22px rgba(232,168,56,0.28)} 50%{box-shadow:0 0 44px rgba(232,168,56,0.60)} }
        @keyframes activePulse { 0%,100%{opacity:0.75} 50%{opacity:1} }
        @keyframes hubFadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes proCardEnter{ from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes starDrift   { 0%,100%{transform:translateY(0) scale(1);opacity:0.55} 50%{transform:translateY(-6px) scale(1.15);opacity:0.90} }
      `}</style>

      {/* ─── Premium Header ─────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', borderRadius:22, marginBottom:'1.6rem', background:'linear-gradient(145deg, rgba(20,12,2,0.98) 0%, rgba(12,7,1,0.99) 100%)', border:'1px solid rgba(232,168,56,0.24)', padding:'1.8rem 2rem' }}>
        {/* Animated gold shimmer line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent 0%, #a06510 15%, #E8A838 38%, #fde68a 52%, #E8A838 65%, #a06510 85%, transparent 100%)', backgroundSize:'250% 100%', animation:'goldShimmer 3.5s linear infinite' }} />
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:-90, right:-50, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,168,56,0.11) 0%, transparent 68%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-110, left:-70, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(74,144,217,0.07) 0%, transparent 68%)', pointerEvents:'none' }} />
        {/* Floating gold stars */}
        {[{l:'10%',t:'28%',d:'0s'},{l:'87%',t:'62%',d:'0.9s'},{l:'70%',t:'18%',d:'1.6s'},{l:'28%',t:'70%',d:'0.5s'},{l:'52%',t:'82%',d:'1.2s'}].map((s,i)=>(
          <div key={i} style={{ position:'absolute', left:s.l, top:s.t, width:5, height:5, borderRadius:'50%', background:'rgba(232,168,56,0.60)', animation:`starDrift 2.8s ${s.d} ease-in-out infinite`, pointerEvents:'none' }} />
        ))}

        <div style={{ display:'flex', alignItems:'center', gap:22, position:'relative', animation:'hubFadeUp 0.5s ease both' }}>
          {/* Crown avatar with glow */}
          <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg, rgba(232,168,56,0.30), rgba(240,200,100,0.14))', border:'1.5px solid rgba(232,168,56,0.48)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, flexShrink:0, animation:'crownGlow 2.8s ease-in-out infinite' }}>👑</div>

          {/* Title block */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
              <span style={{ fontWeight:900, fontSize:22, color:'#fff', letterSpacing:'-0.4px' }}>Pro Member</span>
              <span style={{ background:'linear-gradient(135deg, rgba(232,168,56,0.22), rgba(240,200,100,0.12))', border:'1px solid rgba(232,168,56,0.44)', color:'#E8A838', fontSize:10, fontWeight:800, padding:'3px 12px', borderRadius:20, letterSpacing:'1px', textTransform:'uppercase', animation:'activePulse 2s ease-in-out infinite' }}>✦ Active</span>
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.52)', lineHeight:1.5, marginBottom:10 }}>
              Welcome back, <strong style={{ color:'rgba(255,255,255,0.92)' }}>{user?.name?.split(' ')[0]}</strong>. All Pro features are unlocked for you.
              {expiryDate && <span style={{ color:'rgba(255,255,255,0.28)', fontSize:12 }}> · Valid until {expiryDate}</span>}
            </div>
            {/* Perks pills */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {[
                {label:'1:1 Sessions',icon:'📅',c:'#4A90D9'},
                {label:'Resume Review',icon:'📄',c:'#E8A838'},
                {label:'Mock Interviews',icon:'🎙️',c:'#a78bfa'},
                {label:'Study Guides',icon:'📚',c:'#5CC8A0'},
                {label:'Priority Support',icon:'⭐',c:'#F07B6A'},
                {label:'Job Board',icon:'💼',c:'#38bdf8'},
              ].map(p=>(
                <span key={p.label} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:p.c+'14', border:`1px solid ${p.c}32`, color:p.c }}>
                  {p.icon} {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Stats block */}
          <div style={{ display:'flex', gap:0, flexShrink:0, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
            {[
              {val:sessions.length, lbl:'Sessions',   icon:'📅', c:'#4A90D9'},
              {val:reviews.length,  lbl:'Reviews',    icon:'📄', c:'#E8A838'},
              {val:mockCount,       lbl:'Interviews', icon:'🎙️', c:'#a78bfa'},
            ].map((s,i)=>(
              <div key={s.lbl} style={{ textAlign:'center', padding:'14px 24px', borderRight:i<2?'1px solid rgba(255,255,255,0.06)':'none' }}>
                <div style={{ fontSize:9, color:s.c, textTransform:'uppercase', letterSpacing:'0.9px', fontWeight:700, marginBottom:6 }}>{s.icon} {s.lbl}</div>
                <div style={{ fontSize:28, fontWeight:900, color:'#fff', lineHeight:1 }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto', paddingBottom: 0 }}>
        {HUB_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', background: tab === t.id ? 'rgba(74,144,217,0.12)' : 'none',
            border: 'none', borderRadius: '8px 8px 0 0',
            borderBottom: tab === t.id ? '2px solid #4A90D9' : '2px solid transparent',
            color: tab === t.id ? '#4A90D9' : 'rgba(255,255,255,0.40)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview'  && <OverviewTab sessions={sessions} reviews={reviews} navigate={navigate} setTab={setTab} />}
      {tab === 'session'   && <SessionTab sessions={sessions} setSessions={setSessions} setToast={setToast} />}
      {tab === 'resume'    && <ResumeTab reviews={reviews} setReviews={setReviews} setToast={setToast} />}
      {tab === 'interview' && <InterviewTab />}
      {tab === 'projects'  && <ProjectsTab />}
      {tab === 'roadmap'   && <RoadmapTab />}
      {tab === 'resources' && <ResourcesTab />}
      {tab === 'support'   && <SupportTab setToast={setToast} user={user} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── Overview tab ──────────────────────────────────── */
function OverviewTab({ sessions, reviews, navigate, setTab }) {
  const quick = [
    { icon: '🎙️', title: 'Book Mock Interview', sub: 'Live 45-min session: SQL, Python, Case Study, or full analytics round. Get real-time feedback on your thinking.', color: '#a78bfa', action: () => setTab('interview'), badge: 'Most Popular' },
    { icon: '📅', title: 'Book 1:1 Session',    sub: '30-minute video call for resume critique, career strategy, code review, or salary negotiation prep.', color: '#4A90D9', action: () => setTab('session'), badge: null },
    { icon: '📄', title: 'Resume Review',        sub: 'Expert ATS-optimised feedback within 48 hours: line-by-line rewrites, keyword gaps, and LinkedIn tips.', color: '#E8A838', action: () => setTab('resume'), badge: '48h Turnaround' },
    { icon: '🗺️', title: 'Course Roadmaps',       sub: 'Interactive step-by-step roadmaps for every course. Know exactly what to learn and in what order.', color: '#F07B6A', action: () => setTab('roadmap'), badge: '9 Courses' },
    { icon: '📚', title: 'Study Materials',       sub: '7 exclusive guides: SQL mastery, Python handbook, resume playbook, salary scripts & more.', color: '#5CC8A0', action: () => setTab('resources'), badge: '7 Guides' },
    { icon: '🔬', title: 'Real-World Projects',    sub: '6 industry-grade projects with real datasets: e-commerce, HR analytics, fintech & more. Build your portfolio.', color: '#f59e0b', action: () => setTab('projects'), badge: '6 Projects' },
    { icon: '🎯', title: '100% Placement Assistance', sub: 'Dedicated job support until you land your first data role: resume, referrals, mock interviews & offer negotiation.', color: '#a78bfa', action: () => setTab('session'), badge: '100% Guaranteed' },
    { icon: '💼', title: 'Job Board',             sub: '300+ roles for Data Analyst, BI Engineer, Product Analyst & BI Analyst at top Indian companies, updated weekly.', color: '#38bdf8', action: () => navigate('/jobs'), badge: '300+ Live Jobs' },
  ];

  const valueProps = [
    { icon: '🚀', stat: '3×', desc: 'faster hiring', sub: 'vs. self-study' },
    { icon: '🎙️', stat: '45 min', desc: 'live mock', sub: 'sessions' },
    { icon: '📄', stat: '48h', desc: 'resume', sub: 'feedback' },
    { icon: '💼', stat: '300+', desc: 'curated', sub: 'live jobs' },
  ];

  return (
    <div style={{ animation:'hubFadeUp 0.4s ease both' }}>

      {/* Value prop strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'1.6rem' }}>
        {valueProps.map((v,i)=>(
          <div key={v.stat} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'0.9rem 1rem', display:'flex', alignItems:'center', gap:12, animation:`hubFadeUp 0.4s ${i*0.06}s ease both` }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{v.icon}</span>
            <div>
              <div style={{ fontWeight:900, fontSize:18, color:'#fff', lineHeight:1 }}>{v.stat}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.40)', marginTop:2 }}>{v.desc} {v.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {quick.map((q,i)=>(
          <div key={q.title} onClick={q.action}
            style={{ borderRadius:18, overflow:'hidden', cursor:'pointer', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', transition:'all 0.25s cubic-bezier(.22,1,.36,1)', animation:`proCardEnter 0.5s ${i*0.07}s cubic-bezier(.22,1,.36,1) both` }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=q.color+'52'; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 18px 44px ${q.color}1e`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            {/* Banner */}
            <div style={{ height:104, background:`linear-gradient(135deg, ${q.color}22, ${q.color}08)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${q.color}, transparent)` }} />
              <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 130%, ${q.color}2a, transparent 65%)` }} />
              {q.badge && (
                <div style={{ position:'absolute', top:10, right:10, fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:20, background:q.color+'28', border:`1px solid ${q.color}44`, color:q.color }}>
                  {q.badge}
                </div>
              )}
              <span style={{ fontSize:42, position:'relative', filter:'drop-shadow(0 4px 16px rgba(0,0,0,0.55))' }}>{q.icon}</span>
            </div>
            {/* Body */}
            <div style={{ padding:'0.9rem 1.1rem 1rem' }}>
              <div style={{ fontWeight:800, fontSize:14, color:'#fff', marginBottom:5, lineHeight:1.3 }}>{q.title}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.40)', lineHeight:1.6, marginBottom:'0.85rem', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{q.sub}</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:q.color, fontWeight:700 }}>
                Open <span style={{ fontSize:14 }}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <div className="card-title">📅 Recent Sessions ({sessions.length})</div>
          {sessions.length === 0
            ? <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>No sessions booked yet</div>
            : sessions.slice(0, 3).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{s.preferred_date} · {s.preferred_time}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.topic || 'General discussion'}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: s.status === 'confirmed' ? 'rgba(92,200,160,0.15)' : 'rgba(232,168,56,0.15)', color: s.status === 'confirmed' ? '#5CC8A0' : '#E8A838', border: `1px solid ${s.status === 'confirmed' ? 'rgba(92,200,160,0.25)' : 'rgba(232,168,56,0.25)'}` }}>{s.status}</span>
              </div>
            ))}
        </div>
        <div className="card">
          <div className="card-title">📄 Resume Reviews ({reviews.length})</div>
          {reviews.length === 0
            ? <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>No reviews submitted yet</div>
            : reviews.slice(0, 3).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,168,56,0.15)', border: '1px solid rgba(232,168,56,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{r.job_target || 'General Review'}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{r.current_role} · {r.experience_years}y exp</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: r.status === 'reviewed' ? 'rgba(92,200,160,0.15)' : 'rgba(232,168,56,0.15)', color: r.status === 'reviewed' ? '#5CC8A0' : '#E8A838', border: `1px solid ${r.status === 'reviewed' ? 'rgba(92,200,160,0.25)' : 'rgba(232,168,56,0.25)'}` }}>{r.status}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ── Session booking tab ────────────────────────────── */
function SessionTab({ sessions, setSessions, setToast }) {
  const [form, setForm] = useState({ preferred_date: '', preferred_time: '', topic: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function book() {
    if (!form.preferred_date || !form.preferred_time) { setToast('Please pick a date and time'); return; }
    setSaving(true);
    try {
      await api.post('/premium/sessions', form);
      const r = await api.get('/premium/sessions');
      setSessions(r.data.sessions || []);
      setForm({ preferred_date: '', preferred_time: '', topic: '', notes: '' });
      setToast('✅ Session requested! You\'ll receive confirmation within 24 hours.');
    } catch (e) { setToast(e.response?.data?.error || 'Error booking session'); }
    finally { setSaving(false); setTimeout(() => setToast(''), 4000); }
  }

  const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];
  const TOPICS = ['Career roadmap & goal setting', 'SQL query review & optimisation', 'Python / Pandas code review', 'Portfolio & project feedback', 'Interview preparation', 'Job application strategy', 'Salary negotiation advice', 'Other (specify below)'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Booking form */}
      <div className="card">
        <div className="card-title">📅 Book a 1:1 Session</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          30-minute live video call with our mentor. Bring your questions, code, resume, or job hunt challenges.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.preferred_date} min={new Date().toISOString().split('T')[0]}
              onChange={e => set('preferred_date', e.target.value)} />
          </div>
          <div className="field">
            <label>Time Slot</label>
            <select value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)}>
              <option value="">Select time</option>
              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Session Topic</label>
          <select value={form.topic} onChange={e => set('topic', e.target.value)}>
            <option value="">Select a topic</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Additional Context (optional)</label>
          <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Share any specific questions, your code snippets, or what you'd like to get out of this session..." style={{ resize: 'vertical' }} />
        </div>

        <button className="btn-primary" onClick={book} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? 'Booking…' : '📅 Request Session'}
        </button>
      </div>

      {/* Past sessions */}
      <div className="card">
        <div className="card-title">📋 My Sessions ({sessions.length})</div>
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.30)' }}>
            <div style={{ fontSize: 36, marginBottom: '0.8rem' }}>📅</div>
            Book your first session!
          </div>
        ) : sessions.map(s => (
          <div key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{s.preferred_date}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 12,
                background: s.status === 'confirmed' ? 'rgba(92,200,160,0.15)' : s.status === 'completed' ? 'rgba(74,144,217,0.15)' : 'rgba(232,168,56,0.15)',
                color: s.status === 'confirmed' ? '#5CC8A0' : s.status === 'completed' ? '#4A90D9' : '#E8A838',
                border: `1px solid ${s.status === 'confirmed' ? 'rgba(92,200,160,0.25)' : s.status === 'completed' ? 'rgba(74,144,217,0.25)' : 'rgba(232,168,56,0.25)'}` }}>
                {s.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{s.preferred_time} · {s.topic || 'General'}</div>
            {s.meeting_link && <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#4A90D9', marginTop: 4, display: 'block' }}>🔗 Join Meeting →</a>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Resume review tab ──────────────────────────────── */
function ResumeTab({ reviews, setReviews, setToast }) {
  const [form, setForm] = useState({ linkedin_url: '', job_target: '', experience_years: 0, current_role: '' });
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = { current: null };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleFile(f) {
    if (!f) return;
    if (!/\.(pdf|doc|docx)$/i.test(f.name)) { setToast('Only PDF, DOC, or DOCX files allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { setToast('File must be under 5MB'); return; }
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function submit() {
    setSaving(true);
    try {
      let resume_filename = null;
      let resume_original = null;
      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append('resume', file);
        const token = localStorage.getItem('token');
        const up = await fetch('/api/premium/resume/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const upData = await up.json();
        setUploading(false);
        if (!up.ok) throw new Error(upData.error || 'Upload failed');
        resume_filename = upData.filename;
        resume_original = upData.originalname;
      }
      await api.post('/premium/resume', { ...form, resume_filename, resume_original });
      const r = await api.get('/premium/resume');
      setReviews(r.data.reviews || []);
      setForm({ linkedin_url: '', job_target: '', experience_years: 0, current_role: '' });
      setFile(null);
      setToast('✅ Submitted! Feedback within 48 hours.');
    } catch (e) { setToast(e.response?.data?.error || e.message || 'Error'); }
    finally { setSaving(false); setUploading(false); setTimeout(() => setToast(''), 4000); }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="card">
        <div className="card-title">📄 Submit for Review</div>
        <div style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: '1.2rem', fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6 }}>
          💡 <strong style={{ color: '#4A90D9' }}>What you get:</strong> Detailed line-by-line feedback, ATS keyword optimisation, impact statement rewrites, and LinkedIn profile suggestions, tailored to your target role.
        </div>

        {/* Drag-and-drop upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current && fileRef.current.click()}
          style={{
            border: '1px dashed rgba(74,144,217,0.40)',
            background: dragOver ? 'rgba(74,144,217,0.12)' : 'rgba(74,144,217,0.06)',
            borderRadius: 14, padding: 24, textAlign: 'center',
            cursor: 'pointer', marginBottom: '1.2rem',
            transition: 'background 0.15s',
          }}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            ref={el => { fileRef.current = el; }}
            onChange={e => handleFile(e.target.files[0])}
          />
          {!file ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
                Drag &amp; drop your resume here
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>PDF, DOC, DOCX · Max 5MB</div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
              <span style={{ fontSize: 22, color: '#5CC8A0' }}>✓</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{file.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>{formatSize(file.size)}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); }}
                style={{ background: 'rgba(240,123,106,0.15)', border: '1px solid rgba(240,123,106,0.30)', borderRadius: 8, color: '#F07B6A', fontSize: 12, fontWeight: 600, padding: '4px 10px', cursor: 'pointer', marginLeft: 8 }}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>LinkedIn Profile URL</label>
            <input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
          </div>
          <div className="field">
            <label>Current Role</label>
            <input value={form.current_role} onChange={e => set('current_role', e.target.value)} placeholder="Fresher / Software Engineer..." />
          </div>
          <div className="field">
            <label>Target Role</label>
            <input value={form.job_target} onChange={e => set('job_target', e.target.value)} placeholder="Data Analyst at Swiggy..." />
          </div>
          <div className="field">
            <label>Years of Experience</label>
            <select value={form.experience_years} onChange={e => set('experience_years', +e.target.value)}>
              <option value={0}>Fresher</option>
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
              <option value={3}>3 years</option>
              <option value={5}>4–5 years</option>
              <option value={7}>6+ years</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={submit} disabled={saving || uploading} style={{ width: '100%', justifyContent: 'center' }}>
          {uploading ? 'Uploading file…' : saving ? 'Submitting…' : '📤 Submit for Review'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">📋 My Reviews ({reviews.length})</div>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.30)' }}>
            <div style={{ fontSize: 36, marginBottom: '0.8rem' }}>📄</div>
            No reviews yet. Submit your profile!
          </div>
        ) : reviews.map(r => (
          <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{r.job_target || 'General Review'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 12,
                background: r.status === 'reviewed' ? 'rgba(92,200,160,0.15)' : 'rgba(232,168,56,0.15)',
                color: r.status === 'reviewed' ? '#5CC8A0' : '#E8A838',
                border: `1px solid ${r.status === 'reviewed' ? 'rgba(92,200,160,0.25)' : 'rgba(232,168,56,0.25)'}` }}>
                {r.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{r.current_role} · {r.experience_years}y exp</div>
            {r.resume_original && (
              <a
                href={`/api/premium/resume/file/${r.resume_filename}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 12, color: '#4A90D9', textDecoration: 'none', fontWeight: 600 }}
              >
                📎 {r.resume_original}
              </a>
            )}
            {r.feedback && (
              <div style={{ marginTop: 8, background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.18)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#5CC8A0', lineHeight: 1.6 }}>
                {r.feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mock Interview tab ─────────────────────────────── */
function InterviewTab() {
  const [subTab, setSubTab] = useState('bank');

  // ── Question Bank state ──
  const [cat, setCat]     = useState('SQL');
  const [open, setOpen]   = useState(null);
  const [level, setLevel] = useState('All');
  const cats = ['SQL', 'Python', 'CaseStudy', 'HR'];
  const questions = INTERVIEW_DATA[cat] || [];
  const filtered  = level === 'All' ? questions : questions.filter(q => q.level === level);

  // ── Booking state ──
  const INTERVIEW_TYPES = [
    { id: 'SQL Technical',       icon: '🗄️', color: '#4A90D9', desc: 'Window functions, CTEs, aggregations, real queries' },
    { id: 'Python Technical',    icon: <PyLogo />, color: '#5CC8A0', desc: 'Pandas, GroupBy, data cleaning, EDA problems' },
    { id: 'Case Study',          icon: '📊', color: '#E8A838', desc: 'Product metrics, root cause analysis, A/B testing' },
    { id: 'Full Analytics Round', icon: '🎓', color: '#a78bfa', desc: 'SQL + Python + Case study: complete interview simulation' },
  ];
  const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'];
  const DIFFICULTIES = [
    { id: 'Easy',   color: '#5CC8A0', desc: 'Fresher to 1 year' },
    { id: 'Medium', color: '#E8A838', desc: '1–3 years experience' },
    { id: 'Hard',   color: '#F07B6A', desc: '3+ years / senior roles' },
  ];

  const [form, setForm] = useState({ interview_type: '', difficulty: 'Medium', preferred_date: '', preferred_time: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [bookToast, setBookToast] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/premium/mock-interview')
      .then(r => setInterviews(r.data.interviews || []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  async function bookInterview() {
    if (!form.interview_type) { setBookToast('Please select an interview type'); setTimeout(() => setBookToast(''), 3000); return; }
    if (!form.preferred_date) { setBookToast('Please select a date'); setTimeout(() => setBookToast(''), 3000); return; }
    if (!form.preferred_time) { setBookToast('Please select a time slot'); setTimeout(() => setBookToast(''), 3000); return; }
    setSaving(true);
    try {
      await api.post('/premium/mock-interview', form);
      const r = await api.get('/premium/mock-interview');
      setInterviews(r.data.interviews || []);
      setForm({ interview_type: '', difficulty: 'Medium', preferred_date: '', preferred_time: '', notes: '' });
      setBookToast('✅ Mock interview booked! You\'ll receive confirmation within 24 hours.');
    } catch (e) {
      setBookToast(e.response?.data?.error || 'Error booking interview');
    } finally {
      setSaving(false);
      setTimeout(() => setBookToast(''), 5000);
    }
  }

  const statusColor = (s) => s === 'confirmed' ? '#5CC8A0' : s === 'completed' ? '#4A90D9' : '#E8A838';
  const statusBg    = (s) => s === 'confirmed' ? 'rgba(92,200,160,0.15)' : s === 'completed' ? 'rgba(74,144,217,0.15)' : 'rgba(232,168,56,0.15)';

  return (
    <div>
      {/* Sub-tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[
          { id: 'bank',   icon: '📚', label: 'Question Bank'      },
          { id: 'book',   icon: '🎙️', label: 'Book Mock Interview' },
          { id: 'booked', icon: '📋', label: `My Interviews (${interviews.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '9px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            border: subTab === t.id ? '1px solid rgba(74,144,217,0.50)' : '1px solid rgba(255,255,255,0.10)',
            background: subTab === t.id ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.04)',
            color: subTab === t.id ? '#4A90D9' : 'rgba(255,255,255,0.45)',
            display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Question Bank ── */}
      {subTab === 'bank' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {cats.map(c => (
              <button key={c} onClick={() => { setCat(c); setOpen(null); }}
                className={cat === c ? 'filter-chip active' : 'filter-chip'}
                style={{ fontWeight: 700 }}>
                {c === 'CaseStudy' ? '📊 Case Studies' : c === 'HR' ? '🧑 HR / Behavioural' : c === 'SQL' ? '🗄️ SQL' : <><PyLogo /> Python</>}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {['All', 'Easy', 'Medium', 'Hard'].map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={level === l ? 'filter-chip active' : 'filter-chip'}
                  style={{ fontSize: 12 }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>
            {filtered.length} questions · Click any to reveal the model answer
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map((q, i) => {
              const isOpen = open === i;
              const lvlColor = q.level === 'Easy' ? '#5CC8A0' : q.level === 'Medium' ? '#E8A838' : '#F07B6A';
              const lvlBg    = q.level === 'Easy' ? 'rgba(92,200,160,0.12)' : q.level === 'Medium' ? 'rgba(232,168,56,0.12)' : 'rgba(240,123,106,0.12)';
              return (
                <div key={i} style={{ background: 'rgba(20,27,56,0.88)', backdropFilter: 'blur(14px)', border: `1px solid ${isOpen ? 'rgba(74,144,217,0.30)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <div onClick={() => setOpen(isOpen ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: lvlBg, border: `1px solid ${lvlColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: lvlColor, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#e2e8f0', lineHeight: 1.4 }}>{q.q}</div>
                    <span style={{ background: lvlBg, color: lvlColor, border: `1px solid ${lvlColor}40`, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, flexShrink: 0 }}>{q.level}</span>
                    <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>✅ Model Answer</div>
                      <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#a6e3a1', whiteSpace: 'pre-wrap', lineHeight: 1.7, background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {q.a}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1.2rem', padding: '12px 16px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)', borderRadius: 12, fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎙️</span>
            <div>Ready to test yourself live? <button onClick={() => setSubTab('book')} style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>Book a mock interview →</button></div>
          </div>
        </div>
      )}

      {/* ── Book Mock Interview ── */}
      {subTab === 'book' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ position: 'relative' }}>
            <div className="card-title">🎙️ Book a Mock Interview</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Live 45-min session with our mentor. Get real-time feedback on your answers, thinking process and communication.
            </p>

            {/* Interview Type selection */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Interview Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {INTERVIEW_TYPES.map(t => {
                  const active = form.interview_type === t.id;
                  return (
                    <div key={t.id} onClick={() => set('interview_type', t.id)} style={{
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      border: `1px solid ${active ? t.color + '55' : 'rgba(255,255,255,0.09)'}`,
                      background: active ? t.color + '14' : 'rgba(255,255,255,0.03)',
                      transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = t.color + '35'; e.currentTarget.style.background = t.color + '08'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
                    >
                      {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${t.color}, transparent)` }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: active ? t.color : '#e2e8f0' }}>{t.id}</span>
                        {active && <span style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#000', fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>{t.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Difficulty Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DIFFICULTIES.map(d => {
                  const active = form.difficulty === d.id;
                  return (
                    <div key={d.id} onClick={() => set('difficulty', d.id)} style={{
                      flex: 1, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                      border: `1px solid ${active ? d.color + '55' : 'rgba(255,255,255,0.09)'}`,
                      background: active ? d.color + '14' : 'rgba(255,255,255,0.03)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = d.color + '35'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: active ? d.color : '#e2e8f0', marginBottom: 2 }}>{d.id}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{d.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date picker */}
            <div className="field">
              <label>Preferred Date</label>
              <input type="date" value={form.preferred_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('preferred_date', e.target.value)} />
            </div>

            {/* Time slot grid */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Time Slot (IST)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                {TIMES.map(t => {
                  const active = form.preferred_time === t;
                  return (
                    <button key={t} onClick={() => set('preferred_time', t)} style={{
                      padding: '8px 4px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      border: `1px solid ${active ? 'rgba(74,144,217,0.55)' : 'rgba(255,255,255,0.09)'}`,
                      background: active ? 'rgba(74,144,217,0.18)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#4A90D9' : 'rgba(255,255,255,0.55)',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(74,144,217,0.28)'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}}
                    >{t}</button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="field">
              <label>Notes for us (optional)</label>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Your experience level, specific areas to focus on, company you're preparing for..."
                style={{ resize: 'vertical' }} />
            </div>

            <button className="btn-primary" onClick={bookInterview} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Booking…' : '🎙️ Request Mock Interview'}
            </button>

            {bookToast && (
              <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: bookToast.startsWith('✅') ? 'rgba(92,200,160,0.12)' : 'rgba(240,123,106,0.12)',
                border: `1px solid ${bookToast.startsWith('✅') ? 'rgba(92,200,160,0.25)' : 'rgba(240,123,106,0.25)'}`,
                color: bookToast.startsWith('✅') ? '#5CC8A0' : '#F07B6A' }}>
                {bookToast}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* What to expect */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💡</span>
                What to Expect
              </div>
              {[
                { icon: '🕐', title: '45 min live session', desc: 'Via Google Meet or Zoom' },
                { icon: '💬', title: 'Real-time feedback', desc: 'Our mentor comments on your approach, speed & accuracy' },
                { icon: '📝', title: 'Written summary', desc: 'Post-session notes on strengths and areas to improve' },
                { icon: '🎯', title: 'Tailored difficulty', desc: 'Questions matched to your experience level' },
                { icon: '📅', title: 'Confirmation in 24h', desc: 'You\'ll get a meeting link on your registered email' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* How to prepare */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(92,200,160,0.15)', border: '1px solid rgba(92,200,160,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚀</span>
                How to Prepare
              </div>
              {[
                'Revise the Question Bank before your session',
                'Have your editor / SQL IDE open and ready',
                'Keep your resume handy, our mentor may ask about projects',
                'Note 2–3 companies you\'re targeting',
                'Join the meeting link 2 minutes early',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.60)', marginBottom: 7, lineHeight: 1.5 }}>
                  <span style={{ color: '#5CC8A0', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── My Bookings ── */}
      {subTab === 'booked' && (
        <div>
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.30)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />Loading your interviews…
            </div>
          ) : interviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎙️</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0', marginBottom: 6 }}>No mock interviews booked yet</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginBottom: '1.5rem' }}>Book your first session with us to practice with real interview conditions</div>
              <button onClick={() => setSubTab('book')} className="btn-primary" style={{ margin: '0 auto' }}>🎙️ Book a Mock Interview</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {interviews.map(iv => {
                const typeData = INTERVIEW_TYPES.find(t => t.id === iv.interview_type) || INTERVIEW_TYPES[0];
                const diffColor = iv.difficulty === 'Easy' ? '#5CC8A0' : iv.difficulty === 'Medium' ? '#E8A838' : '#F07B6A';
                return (
                  <div key={iv.id} style={{ background: 'rgba(20,27,56,0.88)', backdropFilter: 'blur(18px)', border: `1px solid ${statusColor(iv.status)}22`, borderRadius: 16, padding: '1.1rem 1.3rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: typeData.color, borderRadius: '0 3px 3px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: typeData.color + '18', border: `1px solid ${typeData.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{typeData.icon}</div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{iv.interview_type}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: diffColor + '18', color: diffColor, border: `1px solid ${diffColor}35` }}>{iv.difficulty}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 12, background: statusBg(iv.status), color: statusColor(iv.status), border: `1px solid ${statusColor(iv.status)}40`, marginLeft: 'auto' }}>{iv.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span>📅 {iv.preferred_date}</span>
                          <span>🕐 {iv.preferred_time}</span>
                          <span>🕑 Booked {new Date(iv.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        {iv.notes && <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic' }}>"{iv.notes}"</div>}
                        {iv.meeting_link && (
                          <a href={iv.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, color: '#4A90D9', fontWeight: 700, textDecoration: 'none', background: 'rgba(74,144,217,0.10)', border: '1px solid rgba(74,144,217,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                            🔗 Join Meeting →
                          </a>
                        )}
                        {iv.feedback && (
                          <div style={{ marginTop: 10, background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.18)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#5CC8A0', lineHeight: 1.6 }}>
                            <span style={{ fontWeight: 700, display: 'block', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mentor's Feedback</span>
                            {iv.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Real-World Projects tab ────────────────────────── */
const PROJECTS = [
  {
    id: 'ecommerce',
    icon: '🛒',
    title: 'E-Commerce Sales Analysis',
    company: 'Flipkart-style Dataset',
    color: '#4A90D9',
    difficulty: 'Beginner',
    tools: ['SQL', 'Python', 'Tableau'],
    duration: '3–4 hours',
    desc: 'Analyse 50,000+ orders to find top-selling categories, revenue trends, and customer behaviour. Present findings as an executive dashboard.',
    skills: ['Cohort analysis', 'Revenue MoM growth', 'Product ranking', 'SQL window functions', 'Tableau dashboard'],
    deliverables: ['SQL query file (.sql)', 'Python EDA notebook (.ipynb)', 'Tableau dashboard (published on Tableau Public)', 'README with 3 key insights'],
    dataset: 'Provided: ecommerce_orders.csv (50k rows) + products.csv + customers.csv',
    steps: [
      'Load and explore the dataset: check nulls, dtypes, row counts',
      'SQL: Find top 10 products by revenue per quarter using window functions',
      'Python: Plot monthly revenue trend and identify the best/worst months',
      'Python: Cohort analysis, retention rate by signup month',
      'Tableau: Build an interactive dashboard with filters for date & category',
      'Write a 3-bullet insight summary for your README',
    ],
  },
  {
    id: 'hr',
    icon: '👥',
    title: 'HR Attrition Analysis',
    company: 'IBM HR Dataset',
    color: '#a78bfa',
    difficulty: 'Beginner',
    tools: ['Python', 'Pandas', 'Seaborn'],
    duration: '2–3 hours',
    desc: 'Identify why employees leave the company. Explore 1,400+ employee records to find key drivers of attrition using EDA and visualisations.',
    skills: ['EDA', 'Correlation analysis', 'Feature importance', 'Group-by aggregation', 'Data storytelling'],
    deliverables: ['Python notebook (.ipynb)', 'Summary slide (PDF or PowerPoint)', 'Top 5 attrition drivers with charts'],
    dataset: 'IBM HR Analytics Employee Attrition dataset (publicly available on Kaggle)',
    steps: [
      'Load dataset and understand all 35 columns and their meaning',
      'Calculate overall attrition rate and segment by department, role, age',
      'Correlation heatmap: which features correlate most with attrition?',
      'Plot: Attrition rate by overtime, job satisfaction, years at company',
      'Identify the top 3 factors driving attrition with evidence',
      'Create a 5-slide summary: Problem → Data → Findings → Recommendation → Impact',
    ],
  },
  {
    id: 'marketing',
    icon: '📣',
    title: 'Marketing Attribution Analysis',
    company: 'D2C Brand Dataset',
    color: '#5CC8A0',
    difficulty: 'Intermediate',
    tools: ['SQL', 'Python', 'Excel'],
    duration: '4–5 hours',
    desc: 'Figure out which marketing channel drives the most revenue for a D2C brand. Analyse multi-touch attribution, CAC, and ROAS across channels.',
    skills: ['Multi-touch attribution', 'CAC calculation', 'ROAS', 'Funnel analysis', 'SQL CTEs'],
    deliverables: ['SQL attribution queries', 'Python ROAS & CAC analysis', 'Channel performance comparison chart', 'Recommendations doc'],
    dataset: 'Provided: marketing_events.csv + orders.csv + ad_spend.csv',
    steps: [
      'Map the customer journey: first touch, last touch, and linear attribution',
      'SQL CTE: Calculate revenue attributed to each channel per month',
      'Python: Calculate CAC (Cost per Acquisition) and ROAS per channel',
      'Funnel analysis: drop-off rates from ad click to purchase',
      'Identify the highest ROI channel and the most inefficient spend',
      'Write a brief recommendation: where should the brand increase/decrease budget?',
    ],
  },
  {
    id: 'fintech',
    icon: '💳',
    title: 'Fintech Transaction Fraud Detection',
    company: 'PaySim Synthetic Dataset',
    color: '#F07B6A',
    difficulty: 'Intermediate',
    tools: ['Python', 'Scikit-learn', 'Pandas'],
    duration: '5–6 hours',
    desc: 'Build a fraud detection model on 6M+ financial transactions. Apply EDA, feature engineering, and a classification model to flag suspicious activity.',
    skills: ['Imbalanced classification', 'Feature engineering', 'Precision/Recall trade-off', 'XGBoost', 'Confusion matrix'],
    deliverables: ['Python ML notebook (.ipynb)', 'Model performance report (Precision, Recall, F1)', 'Feature importance chart', 'Business impact summary'],
    dataset: 'PaySim financial transactions dataset (available on Kaggle. 6.3M rows)',
    steps: [
      'EDA: Understand transaction types, amounts, fraud distribution (class imbalance)',
      'Feature engineering: create time-based features, amount deviation from mean',
      'Handle class imbalance: use SMOTE or class_weight parameter',
      'Train Logistic Regression baseline → then XGBoost',
      'Evaluate with Precision, Recall, F1, ROC-AUC: explain why accuracy is misleading here',
      'Business framing: what is the cost of a false negative vs false positive?',
    ],
  },
  {
    id: 'product',
    icon: '📱',
    title: 'Product Funnel & Retention Analysis',
    company: 'SaaS App Dataset',
    color: '#38bdf8',
    difficulty: 'Intermediate',
    tools: ['SQL', 'Python', 'Mixpanel-style'],
    duration: '4–5 hours',
    desc: 'Analyse user behaviour in a SaaS app: from signup to activation to retention. Find where users drop off and what drives long-term engagement.',
    skills: ['Funnel analysis', 'Cohort retention', 'DAU/MAU ratio', 'SQL window functions', 'North Star Metric'],
    deliverables: ['SQL funnel queries', 'Python cohort retention heatmap', 'Retention curve chart', 'Drop-off analysis with recommendations'],
    dataset: 'Provided: user_events.csv (signups, activations, feature usage, churns)',
    steps: [
      'Define the activation funnel: Signup → Onboarding → First key action → DAU',
      'SQL: Calculate conversion rate at each funnel step using COUNT + CTEs',
      'Python: Build a cohort retention table (monthly cohorts × retention weeks)',
      'Plot the retention curve: identify the "retention cliff" week',
      'DAU/MAU ratio: is the product sticky enough?',
      'Propose 2 product changes to improve the worst drop-off step',
    ],
  },
  {
    id: 'supply',
    icon: '🏭',
    title: 'Supply Chain Optimisation',
    company: 'Manufacturing Dataset',
    color: '#E8A838',
    difficulty: 'Advanced',
    tools: ['Python', 'SQL', 'Power BI'],
    duration: '6–8 hours',
    desc: 'Optimise inventory levels and identify bottlenecks in a manufacturing supply chain. Analyse lead times, stock-outs, and supplier performance.',
    skills: ['Inventory analysis', 'Lead time optimisation', 'Supplier scorecard', 'Power BI dashboard', 'Root cause analysis'],
    deliverables: ['SQL supplier performance queries', 'Python inventory optimisation notebook', 'Power BI dashboard', 'Executive summary (1 page)'],
    dataset: 'Provided: supply_chain_data.csv (orders, inventory, suppliers, lead times)',
    steps: [
      'Overview: Calculate fill rate, stock-out frequency, average lead time per supplier',
      'SQL: Rank suppliers by on-time delivery rate and defect rate',
      'Python: Identify products at risk of stock-out in the next 30 days',
      'Root cause: Which suppliers are causing the most delays?',
      'Power BI: Build a supply chain KPI dashboard (fill rate, lead time, defects)',
      'Recommendation: Which 2 suppliers should be replaced or renegotiated?',
    ],
  },
];

function ProjectsTab() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('All');
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const diffColor = d => d === 'Beginner' ? '#5CC8A0' : d === 'Intermediate' ? '#E8A838' : '#F07B6A';
  const filtered = filter === 'All' ? PROJECTS : PROJECTS.filter(p => p.difficulty === filter);

  return (
    <div style={{ animation: 'hubFadeUp 0.4s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4 }}>🔬 Real-World Projects</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Industry-grade projects with real datasets: build your portfolio, impress recruiters</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {difficulties.map(d => (
            <button key={d} onClick={() => setFilter(d)}
              className={filter === d ? 'filter-chip active' : 'filter-chip'}
              style={{ fontSize: 12, fontWeight: 700 }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Value banner */}
      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 14, padding: '0.9rem 1.3rem', marginBottom: '1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.60)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>💡</span>
        <div><strong style={{ color: '#f59e0b' }}>Pro tip:</strong> Completing 2–3 of these projects and hosting them on GitHub + Tableau Public is what separates your resume from 95% of applicants. Recruiters love numbers and real data.</div>
      </div>

      {/* Project cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.1rem', marginBottom: '1.5rem' }}>
        {filtered.map((proj, i) => (
          <div key={proj.id}
            onClick={() => setSelected(selected?.id === proj.id ? null : proj)}
            style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(20,27,56,0.88)', border: `1px solid ${selected?.id === proj.id ? proj.color + '55' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', transition: 'all 0.25s cubic-bezier(.22,1,.36,1)', animation: `proCardEnter 0.5s ${i * 0.07}s cubic-bezier(.22,1,.36,1) both`, boxShadow: selected?.id === proj.id ? `0 16px 44px ${proj.color}1e` : 'none' }}
            onMouseEnter={e => { if (selected?.id !== proj.id) { e.currentTarget.style.borderColor = proj.color + '44'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
            onMouseLeave={e => { if (selected?.id !== proj.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; } }}>
            {/* Banner */}
            <div style={{ height: 88, background: `linear-gradient(135deg, ${proj.color}22, ${proj.color}08)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16, padding: '0 1.3rem' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${proj.color}, transparent)` }} />
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 10% 130%, ${proj.color}28, transparent 60%)` }} />
              <span style={{ fontSize: 36, filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.5))', position: 'relative' }}>{proj.icon}</span>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginBottom: 3 }}>{proj.company}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', lineHeight: 1.3 }}>{proj.title}</div>
              </div>
              {/* Difficulty + duration pills */}
              <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', position: 'relative' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: diffColor(proj.difficulty) + '20', border: `1px solid ${diffColor(proj.difficulty)}44`, color: diffColor(proj.difficulty) }}>{proj.difficulty}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', padding: '2px 8px', borderRadius: 20, background: 'rgba(20,27,56,0.88)' }}>⏱ {proj.duration}</span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '0.9rem 1.3rem' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '0.8rem' }}>{proj.desc}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                {proj.tools.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: proj.color + '15', border: `1px solid ${proj.color}30`, color: proj.color }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: proj.color, fontWeight: 700 }}>
                {selected?.id === proj.id ? '▲ Hide details' : '▼ View project guide'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded project detail panel */}
      {selected && (
        <div style={{ background: 'rgba(20,27,56,0.88)', border: `1px solid ${selected.color}40`, borderRadius: 20, padding: '1.8rem 2rem', marginTop: '0.5rem', animation: 'hubFadeUp 0.3s ease both' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${selected.color}, transparent)`, borderRadius: 2 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Steps */}
            <div style={{ gridColumn: '1 / 3' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>📋 Step-by-Step Guide</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: selected.color + '20', border: `1px solid ${selected.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: selected.color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dataset + Skills + Deliverables */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Dataset */}
              <div style={{ background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>📦 Dataset</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5 }}>{selected.dataset}</div>
              </div>
              {/* Skills */}
              <div style={{ background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>🧠 Skills You'll Gain</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selected.skills.map(s => (
                    <span key={s} style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', background: selected.color + '12', border: `1px solid ${selected.color}25`, padding: '2px 8px', borderRadius: 8 }}>{s}</span>
                  ))}
                </div>
              </div>
              {/* Deliverables */}
              <div style={{ background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>✅ Deliverables</div>
                {selected.deliverables.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 5, lineHeight: 1.4 }}>
                    <span style={{ color: selected.color, flexShrink: 0 }}>☐</span>{d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="https://www.kaggle.com/datasets" target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 12, background: selected.color + '18', border: `1px solid ${selected.color}35`, color: selected.color, textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = selected.color + '2e'}
              onMouseLeave={e => e.currentTarget.style.background = selected.color + '18'}>
              📦 Get Dataset
            </a>
            <button onClick={() => setSelected(null)}
              style={{ fontSize: 13, fontWeight: 600, padding: '9px 20px', borderRadius: 12, background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Roadmap tab ────────────────────────────────────── */
function RoadmapTab() {
  const [selected, setSelected] = useState('sql');
  const [expanded, setExpanded] = useState(null);

  const course = COURSE_ROADMAPS.find(c => c.id === selected);

  return (
    <div>
      <style>{`
        @keyframes stageIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.4rem' }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 4 }}>🗺️ Course Roadmaps</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Pick a course: see exactly what to learn, in what order, and why it matters</div>
      </div>

      {/* Course selector pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: '1.6rem', scrollbarWidth: 'none' }}>
        {COURSE_ROADMAPS.map(c => (
          <button
            key={c.id}
            onClick={() => { setSelected(c.id); setExpanded(null); }}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
              background: selected === c.id ? c.color : 'rgba(255,255,255,0.07)',
              color: selected === c.id ? '#fff' : 'rgba(255,255,255,0.50)',
              boxShadow: selected === c.id ? `0 4px 14px ${c.color}40` : 'none',
            }}
          >
            <span style={{ fontSize: 14 }}>{c.icon}</span>{c.title}
          </button>
        ))}
      </div>

      {/* Course header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.6rem',
        background: `linear-gradient(135deg, ${course.color}18, rgba(255,255,255,0.03))`,
        border: `1px solid ${course.color}35`, borderRadius: 18, padding: '1rem 1.3rem',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: course.color + '25', border: `1px solid ${course.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{course.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>{course.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>{course.desc}</div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center', background: course.color + '20', border: `1px solid ${course.color}35`, borderRadius: 14, padding: '10px 18px' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: course.color, lineHeight: 1 }}>{course.stages.length}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', marginTop: 3 }}>Stages</div>
        </div>
      </div>

      {/* Stage flow */}
      <div style={{ position: 'relative', paddingLeft: 0 }}>
        {/* Vertical connector line */}
        <div style={{ position: 'absolute', left: 21, top: 28, bottom: 28, width: 2, background: `linear-gradient(to bottom, ${course.color}70, ${course.color}10)`, borderRadius: 2, zIndex: 0 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {course.stages.map((stage, i) => {
            const isExp = expanded === stage.id;
            return (
              <div key={stage.id} style={{ animation: `stageIn 0.3s ${i * 0.07}s ease both` }}>
                {/* Stage row */}
                <div
                  onClick={() => setExpanded(isExp ? null : stage.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                    background: isExp ? `${course.color}14` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isExp ? course.color + '45' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 14, padding: '0.8rem 1rem 0.8rem 0.7rem',
                    transition: 'all 0.2s', position: 'relative', zIndex: 1,
                  }}
                >
                  {/* Stage circle */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: isExp ? course.color : `${course.color}22`,
                    border: `2px solid ${course.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isExp ? 20 : 15, transition: 'all 0.2s',
                    boxShadow: isExp ? `0 0 18px ${course.color}50` : 'none',
                  }}>
                    {isExp
                      ? <span>{stage.icon}</span>
                      : <span style={{ fontWeight: 900, color: course.color }}>{i + 1}</span>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 5 }}>{stage.title}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {stage.skills.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', background: 'rgba(20,27,56,0.88)', padding: '2px 9px', borderRadius: 8, whiteSpace: 'nowrap' }}>{s}</span>
                      ))}
                      {stage.skills.length > 3 && (
                        <span style={{ fontSize: 11, color: course.color, background: `${course.color}18`, border: `1px solid ${course.color}30`, padding: '2px 9px', borderRadius: 8 }}>+{stage.skills.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <span style={{ color: course.color, fontSize: 16, flexShrink: 0, transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'none' }}>⌄</span>
                </div>

                {/* Expanded detail panel */}
                {isExp && (
                  <div style={{ marginTop: 4, marginLeft: 58, background: 'rgba(20,27,56,0.88)', border: `1px solid ${course.color}22`, borderRadius: 14, padding: '1rem 1.1rem' }}>
                    {/* Outcome */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', padding: '9px 12px', background: `${course.color}14`, border: `1px solid ${course.color}28`, borderRadius: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🎯</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: course.color, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>You'll be able to</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>{stage.outcome}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: '0.9rem' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Topics covered</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {stage.skills.map(s => (
                          <span key={s} style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', background: `${course.color}18`, border: `1px solid ${course.color}35`, padding: '4px 12px', borderRadius: 20 }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Practice */}
                    <div style={{ display: 'flex', gap: 10, padding: '9px 12px', background: 'rgba(20,27,56,0.88)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📌</span>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>Practice task</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{stage.practice}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Resources tab ──────────────────────────────────── */
function ResourcesTab() {
  const [preview, setPreview] = useState(null);
  const [toast, setToastLocal] = useState('');

  function showToast(msg) { setToastLocal(msg); setTimeout(() => setToastLocal(''), 3500); }

  function renderContent(content) {
    const lines = content.split('\n');
    const elements = [];
    let inCode = false;
    let codeLines = [];
    let codeLang = '';

    lines.forEach((line, i) => {
      if (line.startsWith('```')) {
        if (!inCode) { inCode = true; codeLang = line.slice(3); codeLines = []; }
        else {
          elements.push(
            <pre key={`code-${i}`} style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#a6e3a1', whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: '0.6rem 0', overflowX: 'auto' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'block', marginBottom: 6 }}>{codeLang || 'code'}</span>
              {codeLines.join('\n')}
            </pre>
          );
          inCode = false; codeLines = [];
        }
        return;
      }
      if (inCode) { codeLines.push(line); return; }

      if (line.startsWith('# ')) {
        elements.push(<div key={i} style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: '1.2rem 0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>{line.slice(2)}</div>);
      } else if (line.startsWith('## ')) {
        elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', margin: '1rem 0 0.4rem' }}>{line.slice(3)}</div>);
      } else if (line.startsWith('### ')) {
        elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 13, color: '#94a3b8', margin: '0.8rem 0 0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{line.slice(4)}</div>);
      } else if (line.startsWith('| ') && line.endsWith(' |')) {
        if (line.includes('---')) return;
        const cells = line.split('|').filter(c => c.trim());
        const isHeader = lines[i + 1]?.includes('---');
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {cells.map((cell, ci) => (
              <div key={ci} style={{ flex: 1, padding: '5px 10px', fontSize: 12, color: isHeader ? '#e2e8f0' : 'rgba(255,255,255,0.65)', fontWeight: isHeader ? 700 : 400, background: isHeader ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                {cell.trim()}
              </div>
            ))}
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        elements.push(<div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.70)', margin: '2px 0', paddingLeft: 8 }}><span style={{ color: '#4A90D9', flexShrink: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>') }} /></div>);
      } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', margin: '0.5rem 0 0.2rem' }}>{line.slice(2, -2)}</div>);
      } else if (line.trim() === '') {
        elements.push(<div key={i} style={{ height: 6 }} />);
      } else {
        elements.push(<div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>').replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.35);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px;color:#a6e3a1">$1</code>') }} />);
      }
    });
    return elements;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 4 }}>📚 Pro Study Materials</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Exclusive guides, cheatsheets, and playbooks for pro members</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.2rem' }}>
        {STUDY_MATERIALS.map((mat,idx)=>(
          <div key={mat.id}
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden', transition:'all 0.25s cubic-bezier(.22,1,.36,1)', display:'flex', flexDirection:'column', animation:`proCardEnter 0.5s ${idx*0.07}s cubic-bezier(.22,1,.36,1) both` }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=mat.color+'50'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 18px 44px ${mat.color}1c`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            {/* Banner */}
            <div style={{ height:110, background:`linear-gradient(135deg, ${mat.color}24, ${mat.color}0a)`, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', gap:18 }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${mat.color}, transparent)` }} />
              <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 20% 130%, ${mat.color}2e, transparent 60%)` }} />
              {/* Icon */}
              <span style={{ fontSize:46, filter:`drop-shadow(0 4px 18px rgba(0,0,0,0.55))`, position:'relative' }}>{mat.icon}</span>
              {/* Meta pills on right */}
              <div style={{ display:'flex', flexDirection:'column', gap:6, position:'relative' }}>
                <span style={{ background:mat.color+'28', color:mat.color, border:`1px solid ${mat.color}44`, fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:20, letterSpacing:'0.3px' }}>{mat.tag}</span>
                <span style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.10)', fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>{mat.pages} pages</span>
                <span style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.10)', fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>{mat.level}</span>
              </div>
            </div>
            {/* Body */}
            <div style={{ padding:'1rem 1.3rem', flex:1 }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#fff', marginBottom:5, lineHeight:1.3 }}>{mat.title}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{mat.desc}</div>
            </div>
            {/* Buttons */}
            <div style={{ padding:'0 1.3rem 1.2rem', display:'flex', gap:8 }}>
              <button
                onClick={()=>setPreview(mat)}
                style={{ flex:1, background:mat.color+'18', border:`1px solid ${mat.color}38`, borderRadius:11, color:mat.color, fontSize:13, fontWeight:700, padding:'9px 0', cursor:'pointer', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background=mat.color+'2e'}
                onMouseLeave={e=>e.currentTarget.style.background=mat.color+'18'}
              >
                📖 Preview
              </button>
              <button
                onClick={()=>{ setPreview(mat); setTimeout(()=>{ window.print(); },300); showToast("Use 'Save as PDF' in your print dialog"); }}
                style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:11, color:'rgba(255,255,255,0.70)', fontSize:13, fontWeight:700, padding:'9px 0', cursor:'pointer', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              >
                ⬇️ Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.18)', borderRadius: 14, padding: '1rem 1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
        🆕 <strong style={{ color: '#4A90D9' }}>New resources added monthly</strong> · Request a topic via the Support tab
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setPreview(null)}>
          <style>{`@media print { body > *:not(.print-content) { display: none !important; } .print-content { display: block !important; position: fixed; top: 0; left: 0; width: 100%; background: white; color: black; padding: 24px; z-index: 99999; } }`}</style>
          <div className="modal print-content" style={{ maxWidth: 760, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', flexShrink: 0 }}>
              <span style={{ fontSize: 24 }}>{preview.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{preview.title}</div>
                <span style={{ background: preview.color + '20', color: preview.color, border: `1px solid ${preview.color}40`, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10 }}>{preview.tag}</span>
              </div>
              <button
                onClick={() => window.print()}
                style={{ background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.30)', borderRadius: 9, color: '#4A90D9', fontSize: 12, fontWeight: 700, padding: '7px 14px', cursor: 'pointer', flexShrink: 0 }}
              >
                🖨️ Print / Save as PDF
              </button>
              <button className="modal-close" style={{ position: 'static', flexShrink: 0 }} onClick={() => setPreview(null)}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {renderContent(preview.content)}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── Priority support tab ───────────────────────────── */
function SupportTab({ setToast, user }) {
  const [msg, setMsg]     = useState('');
  const [type, setType]   = useState('question');
  const [sending, setSending] = useState(false);

  async function send() {
    if (!msg.trim()) { setToast('Please write your message'); return; }
    setSending(true);
    // Simulate send (in production, wire to email/Slack)
    await new Promise(r => setTimeout(r, 1000));
    setMsg('');
    setSending(false);
    setToast('✅ Message sent! We\'ll reply within 6 hours.');
    setTimeout(() => setToast(''), 4000);
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card">
        <div className="card-title">⭐ Priority Support</div>
        <div style={{ background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.18)', borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem', fontSize: 13, color: '#5CC8A0', lineHeight: 1.6 }}>
          As a pro member you get <strong>6-hour response time</strong>. faster than public support. We personally read every message.
        </div>

        <div className="field">
          <label>Type of Request</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'question', label: '❓ Technical Question' },
              { id: 'career',   label: '🎯 Career Advice'      },
              { id: 'bug',      label: '🐛 Bug Report'         },
              { id: 'request',  label: '💡 Feature Request'    },
            ].map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className={type === t.id ? 'filter-chip active' : 'filter-chip'}
                style={{ fontSize: 12 }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Your Message</label>
          <textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Describe your question or issue in detail. The more context, the better the answer..."
            style={{ resize: 'vertical' }} />
        </div>

        <button className="btn-primary" onClick={send} disabled={sending} style={{ width: '100%', justifyContent: 'center' }}>
          {sending ? 'Sending…' : '📨 Send Message'}
        </button>

        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { icon: '✉️', label: 'Email', val: 'asif@dataquest.in' },
            { icon: '⏱', label: 'Response time', val: 'Within 6 hours' },
          ].map(c => (
            <div key={c.label} style={{ background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 3 }}>{c.icon} {c.label}</div>
              <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   UPGRADE PAGE (non-premium users)
═══════════════════════════════════════════════════ */
const FEATURES = [
  { icon: '🎥', label: 'Live Classes',              desc: 'Weekly live sessions with the instructor. Ask questions in real time, get explanations on the spot.',       color: '#F07B6A', bg: 'rgba(240,123,106,0.12)', border: 'rgba(240,123,106,0.22)' },
  { icon: '🎙️', label: 'Live Mock Interviews',     desc: 'Real 45-min sessions with our mentor. SQL, Python, or full analytics round. Written feedback included.',   color: '#a78bfa', bg: 'rgba(168,139,250,0.12)', border: 'rgba(168,139,250,0.22)' },
  { icon: '👤', label: '1:1 Mentorship Sessions',  desc: 'Book 30-min live sessions for career strategy, code review, or job hunt. Get a personalised action plan.',  color: '#4A90D9', bg: 'rgba(74,144,217,0.12)',  border: 'rgba(74,144,217,0.22)'  },
  { icon: '📄', label: 'Resume Review',            desc: 'Line-by-line expert feedback within 48 hours. ATS keywords, impact rewrites, and LinkedIn optimisation.',  color: '#E8A838', bg: 'rgba(232,168,56,0.12)',  border: 'rgba(232,168,56,0.22)'  },
  { icon: '🗺️', label: 'Course Roadmaps',           desc: 'Interactive learning paths for every course: see each stage, skill and practice task. Never feel lost again.', color: '#F07B6A', bg: 'rgba(240,123,106,0.12)', border: 'rgba(240,123,106,0.22)' },
  { icon: '📚', label: 'Exclusive Study Guides',   desc: '7 premium guides. SQL mastery, Python handbook, resume playbook, salary negotiation scripts, and more.',   color: '#5CC8A0', bg: 'rgba(92,200,160,0.12)',  border: 'rgba(92,200,160,0.22)'  },
  { icon: '💼', label: 'Curated Job Board',        desc: '300+ roles for Data Analyst, BI Engineer, Product Analyst & BI Analyst: updated weekly with direct apply links.', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.22)'  },
  { icon: '🎯', label: '100% Placement Assistance', desc: 'Dedicated job support until you land your first data role: resume, mock interviews, job referrals & offer negotiation.',  color: '#a78bfa', bg: 'rgba(168,139,250,0.12)', border: 'rgba(168,139,250,0.22)' },
  { icon: '⭐', label: 'Priority Support',         desc: '6-hour direct response from us: faster than public support. We personally read every message.',             color: '#5CC8A0', bg: 'rgba(92,200,160,0.12)',  border: 'rgba(92,200,160,0.22)'  },
  { icon: '🔬', label: 'Real-World Projects',      desc: '6 industry-grade projects with real datasets: e-commerce, HR, fintech, marketing & more. Build your portfolio.', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.22)'  },
];

function UpgradePage({ isPending, status, showModal, setShowModal, step, setStep, utr, setUtr, submitting, submitUTR, copied, copyUPI, toast, cfLoading, handleCashfreePay, coupon, setCoupon, couponMsg, applyCoupon, finalAmount }) {
  const [payMethod, setPayMethod] = useState('cashfree');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardToast, setCardToast] = useState('');
  const [receipt, setReceipt] = useState(null); // { file, preview, name }
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const receiptRef = { current: null };
  const setC = (k, v) => setCard(c => ({ ...c, [k]: v }));

  async function handleSubmitWithReceipt() {
    let receiptFilename = null, receiptOriginal = null;
    if (receipt?.file) {
      setUploadingReceipt(true);
      try {
        const fd = new FormData();
        fd.append('receipt', receipt.file);
        const r = await api.post('/premium/receipt/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        receiptFilename = r.data.filename;
        receiptOriginal = r.data.originalname;
      } catch (e) { /* continue without receipt if upload fails */ }
      finally { setUploadingReceipt(false); }
    }
    submitUTR(receiptFilename, receiptOriginal);
  }

  function handleReceiptFile(f) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
    setReceipt({ file: f, preview, name: f.name });
  }

  function formatCardNumber(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(val) {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  }
  function cardBrand(num) {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return 'VISA';
    if (/^5[1-5]/.test(n)) return 'MC';
    return '';
  }

  function handleCardPay() {
    setCardToast('⚙️ Card payments require Razorpay API key configuration. Use UPI for instant payment.');
    setTimeout(() => setCardToast(''), 4000);
  }

  return (
    <div className="page">
      {isPending && (
        <div className="status-banner pending">
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Payment Under Review</div>
            <div style={{ fontSize: 12 }}>We'll activate your account within 2 hours. UTR: {status.latest_subscription?.utr_number}</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heroGlow    { 0%,100%{box-shadow:0 0 60px rgba(232,168,56,0.10)} 50%{box-shadow:0 0 120px rgba(232,168,56,0.22)} }
        @keyframes crownFloat  { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes ringPulse   { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
        @keyframes heroFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes statSlide   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pricingEnter{ from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes marqueeScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes tagFloat1   { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-7px) rotate(2deg)} }
        @keyframes tagFloat2   { 0%,100%{transform:translateY(0) rotate(2deg)}  50%{transform:translateY(-5px) rotate(-2deg)} }
        @keyframes tagFloat3   { 0%,100%{transform:translateY(-4px) rotate(1deg)} 50%{transform:translateY(4px) rotate(-1deg)} }
      `}</style>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', borderRadius:24, marginBottom:'2rem', background:'linear-gradient(145deg, rgba(10,6,1,0.97) 0%, rgba(18,10,2,0.98) 50%, rgba(8,6,14,0.97) 100%)', border:'1px solid rgba(232,168,56,0.20)', padding:'3.5rem 2.5rem', textAlign:'center', animation:'heroGlow 4s ease-in-out infinite' }}>
        {/* Animated shimmer top edge */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent 0%, #a06510 20%, #E8A838 40%, #fde68a 52%, #E8A838 65%, #a06510 82%, transparent 100%)', backgroundSize:'250% 100%', animation:'goldShimmer 3s linear infinite' }} />
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:-120, left:'30%', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,168,56,0.10) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, right:'20%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(74,144,217,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />
        {/* Floating stars */}
        {[{l:'8%',t:'20%',d:'0s'},{l:'92%',t:'30%',d:'1.2s'},{l:'15%',t:'75%',d:'0.6s'},{l:'85%',t:'72%',d:'1.8s'},{l:'50%',t:'88%',d:'0.9s'}].map((s,i)=>(
          <div key={i} style={{ position:'absolute', left:s.l, top:s.t, width:4, height:4, borderRadius:'50%', background:'rgba(232,168,56,0.55)', animation:`starDrift 3s ${s.d} ease-in-out infinite`, pointerEvents:'none' }} />
        ))}

        {/* Social proof badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, background:'rgba(232,168,56,0.10)', border:'1px solid rgba(232,168,56,0.28)', color:'#E8A838', marginBottom:'1.4rem', animation:'heroFadeUp 0.4s ease both' }}>
          <span>⚡</span> One-time payment · Lifetime access · No renewals
        </div>

        {/* Crown */}
        <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
          <div style={{ position:'absolute', inset:'-20px', borderRadius:'50%', border:'1px solid rgba(232,168,56,0.30)', animation:'ringPulse 2s ease-out infinite' }} />
          <div style={{ position:'absolute', inset:'-10px', borderRadius:'50%', border:'1px solid rgba(232,168,56,0.20)', animation:'ringPulse 2s 0.5s ease-out infinite' }} />
          <span style={{ fontSize:64, display:'block', animation:'crownFloat 4s ease-in-out infinite', filter:'drop-shadow(0 8px 28px rgba(232,168,56,0.55))' }}>👑</span>
        </div>

        {/* Title */}
        <div style={{ fontSize:42, fontWeight:900, letterSpacing:'-1px', marginBottom:'0.7rem', background:'linear-gradient(135deg, #fff 0%, #E8A838 45%, #fff 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'shimmer 4s linear infinite, heroFadeUp 0.5s 0.1s ease both' }}>
          Go Pro. Get Hired.
        </div>
        <div style={{ fontSize:16, color:'rgba(255,255,255,0.45)', marginBottom:'1.6rem', animation:'heroFadeUp 0.5s 0.2s ease both' }}>
          Everything you need to land your first Data, BI or Product Analytics role: in one ₹199 membership
        </div>

        {/* Price + CTA */}
        <div style={{ animation:'heroFadeUp 0.5s 0.3s ease both' }}>
          <div style={{ display:'inline-flex', alignItems:'baseline', gap:6, marginBottom:'0.5rem' }}>
            <span style={{ fontSize:58, fontWeight:900, letterSpacing:'-2px', background:'linear-gradient(135deg, #E8A838, #F07B6A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>₹{AMOUNT}</span>
            <span style={{ fontSize:18, color:'rgba(255,255,255,0.35)' }}>lifetime</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:'1.5rem' }}>
            <span style={{ fontSize:14, color:'rgba(255,255,255,0.25)', textDecoration:'line-through' }}>₹999</span>
            <span style={{ fontSize:11, fontWeight:800, padding:'2px 9px', borderRadius:20, background:'rgba(92,200,160,0.15)', border:'1px solid rgba(92,200,160,0.30)', color:'#5CC8A0' }}>80% OFF. Limited Offer</span>
          </div>
          {!isPending && (
            <button className="btn-gold" style={{ fontSize:17, padding:'15px 40px' }} onClick={() => setShowModal(true)}>
              <span>⚡</span> Get Pro Now
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', justifyContent:'center', gap:'1rem', marginTop:'2rem', paddingTop:'1.8rem', borderTop:'1px solid rgba(255,255,255,0.07)', flexWrap:'wrap', animation:'heroFadeUp 0.5s 0.4s ease both' }}>
          {[
            {icon:'📅', val:'1:1', lbl:'Mentor Session',  color:'#4A90D9'},
            {icon:'💼', val:'300+', lbl:'Live Jobs',       color:'#5CC8A0'},
            {icon:'📄', val:'24h', lbl:'Resume Feedback',  color:'#E8A838'},
            {icon:'🎯', val:'100%',lbl:'Placement Assist', color:'#a78bfa'},
          ].map((s,i)=>(
            <div key={s.lbl} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderRadius:16, background:'rgba(255,255,255,0.04)', border:`1px solid ${s.color}28`, animation:`statSlide 0.4s ${0.5+i*0.08}s ease both` }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Placement companies ticker */}
        <div style={{ marginTop:'1.8rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'0.9rem' }}>
            🎯 Prep for roles at
          </div>
          <div style={{ overflow:'hidden', maskImage:'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
            <div style={{ display:'flex', gap:16, width:'max-content', animation:'marqueeScroll 18s linear infinite' }}>
              {['Flipkart','Swiggy','Amazon India','Razorpay','Meesho','Zomato','CRED','Paytm','PhonePe','Nykaa','Dream11','MakeMyTrip','Ola','Deloitte','Wipro',
                'Flipkart','Swiggy','Amazon India','Razorpay','Meesho','Zomato','CRED','Paytm','PhonePe','Nykaa','Dream11','MakeMyTrip','Ola','Deloitte','Wipro'].map((c,i) => (
                <span key={i} style={{ padding:'5px 14px', borderRadius:20, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.45)', whiteSpace:'nowrap' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Mini testimonials */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:'1.5rem', animation:'heroFadeUp 0.5s 0.5s ease both' }}>
          {[
            { text:'"Got my Flipkart offer 3 months after joining. The SQL problems are exactly what they ask."', name:'Priya S.', role:'Data Analyst', color:'#5CC8A0' },
            { text:'"The 1:1 mentor sessions gave me the confidence to crack my Swiggy interview."',             name:'Rahul M.', role:'BI Engineer',    color:'#4A90D9' },
            { text:'"Best ₹199 I ever spent. Resume review alone was worth 10x the price."',                   name:'Ankit V.', role:'Data Analyst',      color:'#a78bfa' },
          ].map(t => (
            <div key={t.name} style={{ padding:'12px 14px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:`1px solid ${t.color}20`, textAlign:'left' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:8, fontStyle:'italic' }}>{t.text}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:t.color+'25', border:`1px solid ${t.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:t.color, flexShrink:0 }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#fff' }}>{t.name}</div>
                  <div style={{ fontSize:10, color:t.color }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="page-header">
        <div className="page-title">Everything in Premium</div>
        <div className="page-sub">Seven high-impact benefits to accelerate your data career</div>
      </div>
      <style>{`
        @keyframes upgCardEnter { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes upgShimmer   { from{background-position:-280% center} to{background-position:280% center} }
      `}</style>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.2rem', marginBottom:'2.5rem' }}>
        {FEATURES.map((f,i) => (
          <div key={f.label}
            style={{ borderRadius:18, overflow:'hidden', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', cursor:'default', transition:'all 0.25s cubic-bezier(.22,1,.36,1)', animation:`upgCardEnter 0.55s ${i*0.07}s cubic-bezier(.22,1,.36,1) both` }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=f.color+'48'; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 20px 48px ${f.color}1e`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>

            {/* Gradient banner */}
            <div style={{ height:110, background:`linear-gradient(135deg, ${f.color}22, ${f.color}08)`, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${f.color}cc, ${f.color}44, transparent)` }} />
              <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 140%, ${f.color}30, transparent 62%)` }} />
              {/* Shimmer sweep on hover */}
              <div className="upg-shimmer" style={{ position:'absolute', inset:0, background:`linear-gradient(105deg, transparent 35%, ${f.color}18 50%, transparent 65%)`, backgroundSize:'280% 100%', backgroundPosition:'-280% center' }} />
              <span style={{ fontSize:44, position:'relative', filter:'drop-shadow(0 4px 18px rgba(0,0,0,0.55))' }}>{f.icon}</span>
            </div>

            {/* Body */}
            <div style={{ padding:'1rem 1.2rem 1.2rem', flex:1, display:'flex', flexDirection:'column' }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#fff', marginBottom:7, lineHeight:1.3 }}>{f.label}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.48)', lineHeight:1.65, flex:1 }}>{f.desc}</div>
              <div style={{ marginTop:'0.9rem', display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:f.color, fontWeight:700 }}>
                Included in Pro <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isPending && (
        <div style={{ position:'relative', overflow:'hidden', borderRadius:24, marginBottom:'2rem', background:'linear-gradient(145deg, rgba(16,10,2,0.98), rgba(10,6,1,0.99))', border:'1px solid rgba(232,168,56,0.25)', boxShadow:'0 32px 80px rgba(232,168,56,0.08), inset 0 0 0 1px rgba(232,168,56,0.06)', animation:'pricingEnter 0.6s 0.2s cubic-bezier(.22,1,.36,1) both' }}>
          {/* Shimmer top edge */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, #a06510 25%, #E8A838 45%, #fde68a 55%, #E8A838 70%, #a06510 85%, transparent)', backgroundSize:'250% 100%', animation:'goldShimmer 3.5s linear infinite' }} />
          {/* Background glow */}
          <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,168,56,0.08), transparent 65%)', pointerEvents:'none' }} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:0, position:'relative' }}>
            {/* Left: Price + CTA */}
            <div style={{ padding:'2.2rem 2rem', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>

              {/* Label */}
              <div style={{ fontSize:11, fontWeight:800, color:'#E8A838', textTransform:'uppercase', letterSpacing:'2px', marginBottom:14 }}>✦ Lifetime Access</div>

              {/* Price */}
              <div style={{ fontSize:72, fontWeight:900, letterSpacing:'-4px', lineHeight:1, background:'linear-gradient(135deg, #F5C842, #E8A838, #F07B6A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4 }}>
                ₹{AMOUNT}
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.30)', marginBottom:14, letterSpacing:'0.3px' }}>one-time · no subscription ever</div>

              {/* Savings badge */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20 }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.22)', textDecoration:'line-through' }}>₹999</span>
                <span style={{ fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20, background:'rgba(92,200,160,0.14)', border:'1px solid rgba(92,200,160,0.30)', color:'#5CC8A0' }}>Save ₹800 (80% OFF)</span>
              </div>

              {/* CTA */}
              <button className="btn-gold" style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'14px 20px' }} onClick={() => setShowModal(true)}>
                <span>👑</span> Get Pro. ₹{AMOUNT}
              </button>

              {/* Trust microcopy */}
              <div style={{ marginTop:10, fontSize:11, color:'rgba(255,255,255,0.20)', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div>🔒 One-time payment • Instant access</div>
                <div>📱 UPI · PhonePe · GPay · Cards</div>
              </div>

              {/* Divider */}
              <div style={{ margin:'1.2rem 0', width:'100%', height:1, background:'rgba(255,255,255,0.07)' }} />

              {/* Why learners choose this */}
              <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:10 }}>Why learners choose this</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', textAlign:'left' }}>
                {[
                  { icon:'🎥', text:'Live classes every week with the instructor' },
                  { icon:'🎯', text:'Interview-ready SQL & Python problems' },
                  { icon:'🧑‍💼', text:'Live 1:1 mentorship with an expert' },
                  { icon:'🏆', text:'Verified certificates on completion' },
                  { icon:'📈', text:'Career roadmap: zero to offer letter' },
                ].map(b => (
                  <div key={b.text} style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <span style={{ fontSize:13, flexShrink:0 }}>{b.icon}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.50)', lineHeight:1.4 }}>{b.text}</span>
                  </div>
                ))}
              </div>

              {/* No-renewal guarantee */}
              <div style={{ marginTop:14, width:'100%', padding:'9px 12px', borderRadius:10, background:'rgba(92,200,160,0.06)', border:'1px solid rgba(92,200,160,0.18)', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <span style={{ fontSize:14 }}>🛡️</span>
                <span style={{ fontSize:11.5, color:'rgba(92,200,160,0.75)' }}>No auto-renewal. No hidden charges. Ever.</span>
              </div>
            </div>

            {/* Right: Feature list */}
            <div style={{ padding:'2rem 1.8rem' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10 }}>Everything included</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {FEATURES.map(f => (
                  <div key={f.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                    <div style={{ width:30, height:30, borderRadius:8, background:f.color+'18', border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{f.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12.5, fontWeight:700, color:'#fff', lineHeight:1.3 }}>{f.label}</div>
                    </div>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:f.color+'20', border:`1px solid ${f.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:f.color, fontWeight:800, flexShrink:0 }}>✓</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}>
            <button className="modal-close" style={{ zIndex: 10 }} onClick={() => { setShowModal(false); setStep(1); setPayMethod('cashfree'); }}>✕</button>

            {/* ── Rich Header ── */}
            <div style={{ background: 'linear-gradient(135deg, rgba(232,168,56,0.18) 0%, rgba(240,123,106,0.12) 60%, rgba(74,144,217,0.10) 100%)', borderBottom: '1px solid rgba(232,168,56,0.18)', padding: '1.6rem 1.8rem 1.3rem', textAlign: 'center', position: 'relative' }}>
              {/* Glow blob */}
              <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,168,56,0.15), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 36, marginBottom: 6 }}>👑</div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #F5C842, #E8A838, #F07B6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 3 }}>
                Datamyze Pro
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginBottom: 14 }}>Unlock your full data analytics career toolkit</div>

              {/* What's included. 3 pills */}
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { icon: '🎓', text: 'All Courses' },
                  { icon: '💼', text: '300+ Jobs' },
                  { icon: '🏆', text: 'Certificates' },
                  { icon: '🧑‍💼', text: '1:1 Mentorship' },
                ].map(f => (
                  <span key={f.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>
                    {f.icon} {f.text}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '1.4rem 1.8rem 1.8rem' }}>

              {/* Coupon code input */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value.toUpperCase()); }}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Have a coupon code?"
                    maxLength={20}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                      background: 'rgba(20,27,56,0.88)',
                      border: couponMsg === 'valid' ? '1px solid rgba(92,200,160,0.50)' : couponMsg === 'invalid' ? '1px solid rgba(240,123,106,0.50)' : '1px solid rgba(255,255,255,0.12)',
                      color: '#fff', outline: 'none', letterSpacing: '0.5px',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  <button onClick={applyCoupon} style={{ padding: '9px 16px', borderRadius: 9, background: 'rgba(74,144,217,0.18)', border: '1px solid rgba(74,144,217,0.35)', color: '#4A90D9', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Apply
                  </button>
                </div>
                {couponMsg === 'valid' && (
                  <div style={{ fontSize: 12, color: '#5CC8A0', marginTop: 5, fontWeight: 600 }}>
                    ✅ Coupon applied! You save ₹{199 - finalAmount}
                  </div>
                )}
                {couponMsg === 'invalid' && (
                  <div style={{ fontSize: 12, color: '#F07B6A', marginTop: 5, fontWeight: 600 }}>
                    ❌ Invalid coupon code
                  </div>
                )}
              </div>

              {/* Price row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '1.2rem' }}>
                <span style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-2px', background: 'linear-gradient(135deg, #F5C842, #E8A838, #F07B6A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>₹{finalAmount}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {finalAmount < 199 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹199</span>}
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>₹999</span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 20, background: 'rgba(92,200,160,0.14)', border: '1px solid rgba(92,200,160,0.30)', color: '#5CC8A0', whiteSpace: 'nowrap' }}>{finalAmount < 199 ? `${Math.round((1-finalAmount/999)*100)}% OFF` : '80% OFF'}</span>
                </div>
              </div>

              {/* Payment method toggle */}
              <div style={{ display: 'flex', gap: 0, marginBottom: '1.2rem', background: 'rgba(20,27,56,0.88)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
                {[{ id: 'cashfree', label: '⚡ Pay Online' }, { id: 'upi', label: '📱 UPI Manual' }].map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      border: 'none',
                      background: payMethod === m.id ? 'rgba(74,144,217,0.22)' : 'transparent',
                      color: payMethod === m.id ? '#fff' : 'rgba(255,255,255,0.40)',
                      boxShadow: payMethod === m.id ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                    {m.label}
                  </button>
                ))}
              </div>

            {payMethod === 'cashfree' && (
              <div style={{ textAlign: 'center' }}>
                {/* Pay button */}
                <button
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '15px 24px', opacity: cfLoading ? 0.7 : 1 }}
                  onClick={handleCashfreePay}
                  disabled={cfLoading}
                >
                  {cfLoading
                    ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing…</>
                    : <><span>⚡</span> Pay ₹{finalAmount} Now</>
                  }
                </button>

                {/* Accepted methods */}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { label: 'UPI',        color: '#4A90D9' },
                    { label: 'PhonePe',    color: '#5F259F' },
                    { label: 'GPay',       color: '#34A853' },
                    { label: 'Paytm',      color: '#00BAF2' },
                    { label: 'Cards',      color: '#E8A838' },
                    { label: 'NetBanking', color: '#5CC8A0' },
                  ].map(m => (
                    <span key={m.label} style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: `${m.color}12`, border: `1px solid ${m.color}30`, color: m.color }}>{m.label}</span>
                  ))}
                </div>

                {/* Trust line */}
                <div style={{ marginTop: '1.1rem', padding: '9px 14px', borderRadius: 10, background: 'rgba(92,200,160,0.05)', border: '1px solid rgba(92,200,160,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Secured by <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Cashfree Payments</strong> · 256-bit SSL</span>
                </div>
              </div>
            )}

            {payMethod === 'upi' && (
              <>
                {step === 1 ? (
                  <div className="payment-step">
                    <div className="phonepe-logo">💜</div>
                    <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Pay via PhonePe / UPI</h2>
                    <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1rem' }}>Scan QR or copy the UPI ID</p>
                    <div className="qr-container"><img src={QR_URL} alt="UPI QR" width={200} height={200} style={{ display: 'block' }} /></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#4A90D9', margin: '0.5rem 0 0.3rem' }}>₹{AMOUNT}</div>
                    <div className="upi-id-box">
                      <span>{UPI_ID}</span>
                      <button className="copy-btn" onClick={copyUPI}>{copied ? '✓ Copied' : 'Copy'}</button>
                    </div>
                    <div className="payment-divider">or open app directly</div>
                    <a href={`upi://pay?pa=${UPI_ID}&pn=Datamyze&am=${AMOUNT}&cu=INR`} style={{ display: 'block', marginBottom: '0.8rem' }}>
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>📱 Open PhonePe / GPay / BHIM</button>
                    </a>
                    <ol className="payment-steps">
                      <li>Open any UPI app and scan the QR or pay to UPI ID</li>
                      <li>Enter ₹{AMOUNT} and complete payment</li>
                      <li>Note the Transaction / UTR ID shown after payment</li>
                    </ol>
                    {/* NetBanking/Wallet extra option */}
                    <div style={{ marginTop: '0.6rem', padding: '8px 12px', background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.40)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>🏦</span>
                      <span>NetBanking / Wallet: use your bank's UPI handle or scan QR above</span>
                    </div>
                    <button className="btn-teal" style={{ width: '100%', justifyContent: 'center', marginTop: '0.8rem' }} onClick={() => setStep(2)}>
                      ✅ I've Paid. Enter UTR →
                    </button>
                  </div>
                ) : (
                  <div className="payment-step">
                    <div style={{ fontSize: 36, marginBottom: '0.8rem' }}>🧾</div>
                    <h2 style={{ fontWeight: 800, marginBottom: 4 }}>Confirm Your Payment</h2>
                    <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.5rem' }}>Enter your UTR and upload the payment screenshot for faster verification</p>

                    {/* UTR field */}
                    <div className="field" style={{ textAlign: 'left' }}>
                      <label>UTR / Transaction ID <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(required)</span></label>
                      <input value={utr} onChange={e => setUtr(e.target.value)} placeholder="e.g. 402911684521"
                        style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }} onKeyDown={e => e.key === 'Enter' && handleSubmitWithReceipt()} />
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>Find this in your PhonePe / GPay / bank SMS after payment</div>
                    </div>

                    {/* Receipt upload */}
                    <div className="field" style={{ textAlign: 'left', marginTop: '0.8rem' }}>
                      <label>Payment Screenshot / Receipt <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(recommended)</span></label>
                      {receipt ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.28)', borderRadius: 10 }}>
                          {receipt.preview
                            ? <img src={receipt.preview} alt="receipt" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
                            : <div style={{ width: 48, height: 48, borderRadius: 7, background: 'rgba(74,144,217,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📄</div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#5CC8A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✅ {receipt.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{receipt.file ? (receipt.file.size / 1024).toFixed(0) + ' KB' : ''}</div>
                          </div>
                          <button onClick={() => setReceipt(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)', cursor: 'pointer', fontSize: 18, padding: '4px 6px', borderRadius: 6, lineHeight: 1 }}>✕</button>
                        </div>
                      ) : (
                        <div
                          onClick={() => receiptRef.current?.click()}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(74,144,217,0.12)'; }}
                          onDragLeave={e => { e.currentTarget.style.background = 'rgba(74,144,217,0.05)'; }}
                          onDrop={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(74,144,217,0.05)'; handleReceiptFile(e.dataTransfer.files[0]); }}
                          style={{ padding: '16px 12px', border: '1.5px dashed rgba(74,144,217,0.38)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: 'rgba(74,144,217,0.05)', transition: 'background 0.2s' }}>
                          <div style={{ fontSize: 26, marginBottom: 4 }}>📷</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Click or drag your payment screenshot here</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 3 }}>JPG, PNG, PDF · Max 10MB</div>
                        </div>
                      )}
                      <input
                        ref={el => { receiptRef.current = el; }}
                        type="file" accept=".jpg,.jpeg,.png,.pdf,.webp,.heic"
                        style={{ display: 'none' }}
                        onChange={e => handleReceiptFile(e.target.files[0])}
                      />
                    </div>

                    <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={handleSubmitWithReceipt} disabled={submitting || uploadingReceipt}>
                      {uploadingReceipt ? '⬆️ Uploading receipt...' : submitting ? 'Submitting...' : '🚀 Submit for Verification'}
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => setStep(1)}>← Back</button>
                  </div>
                )}
              </>
            )}

            </div>{/* end body */}
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
