const LESSONS_V2 = {
  'SQL for Data Analysis': [
    {
      title: 'What is a Database & SQL?',
      content: `# What is a Database & SQL?

A **database** is an organised collection of structured data stored and accessed electronically. Think of it as a giant, supercharged Excel spreadsheet — except it can hold millions of rows and let hundreds of people query it simultaneously without slowing down.

**Real-world analogy:** Zomato's backend has databases storing every restaurant, order, delivery partner, and review. When you open the app, SQL queries fire in milliseconds to fetch your personalised feed.

## Key Terms
| Term | Meaning |
|------|---------|
| Table | Rows + columns — like one Excel sheet |
| Row / Record | A single entry (one order, one user) |
| Column / Field | An attribute (order_amount, city) |
| Primary Key | Unique ID for each row — never NULL |
| Foreign Key | Links two tables together |

## Your First SQL Query
\`\`\`sql
-- See all orders from Flipkart's orders table
SELECT order_id, customer_id, amount, status
FROM flipkart_orders
LIMIT 10;
\`\`\`

## SQL Sub-languages
- **DDL** – CREATE, ALTER, DROP (structure)
- **DML** – SELECT, INSERT, UPDATE, DELETE (data)
- **DCL** – GRANT, REVOKE (permissions)

💡 **Interview Tip:** Interviewers at Flipkart and Amazon often start with "Walk me through what happens when you run a SELECT." Know the execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.`,
      video_url: '27axs9dO7AE',
      dur: 15,
    },
    {
      title: 'SELECT & Projections',
      content: `# SELECT & Projections

The SELECT statement is the backbone of every data analyst's toolkit. **Projection** means choosing which columns to return — keeping your result set lean and readable.

**Analogy:** You're a Swiggy analyst. Instead of printing every column in the orders table (50+ columns), you project only what the business question needs.

## Column Selection & Aliases
\`\`\`sql
-- Bad: pulls all 50+ columns — wastes bandwidth
SELECT * FROM swiggy_orders;

-- Good: project only what you need
SELECT
    order_id,
    customer_id,
    restaurant_name,
    total_amount          AS order_value,
    created_at            AS order_time,
    delivery_status
FROM swiggy_orders;
\`\`\`

## Derived Columns
\`\`\`sql
SELECT
    order_id,
    subtotal,
    delivery_fee,
    subtotal + delivery_fee           AS total_paid,
    ROUND(delivery_fee * 100.0 / subtotal, 1) AS delivery_fee_pct
FROM swiggy_orders
LIMIT 100;
\`\`\`

## DISTINCT — Remove Duplicates
\`\`\`sql
-- How many unique cities does Zomato serve?
SELECT COUNT(DISTINCT city) AS cities_served
FROM zomato_restaurants;
\`\`\`

💡 **Interview Tip:** When asked "find all unique customers who ordered last month," always reach for COUNT(DISTINCT customer_id) — not COUNT(*). Interviewers specifically test this distinction.`,
      video_url: 'PyYgERKq25I',
      dur: 20,
    },
    {
      title: 'Filtering with WHERE',
      content: `# Filtering with WHERE

WHERE is your first line of defence against scanning millions of unnecessary rows. Every filter you add early in the query saves compute time downstream.

**Analogy:** PhonePe processes 5 crore+ transactions a day. An analyst querying "failed UPI transactions in Delhi above ₹10,000 in the last 7 days" uses WHERE to narrow billions of rows to a few thousand in milliseconds.

## Core Operators
\`\`\`sql
-- Comparison: failed high-value PhonePe transactions
SELECT txn_id, user_id, amount, failure_reason
FROM phonepe_transactions
WHERE status = 'FAILED'
  AND amount > 10000
  AND city = 'Delhi'
  AND txn_date >= DATE('now', '-7 days');
\`\`\`

## IN, BETWEEN, LIKE
\`\`\`sql
-- IN: multiple values
SELECT * FROM zomato_orders
WHERE city IN ('Mumbai', 'Delhi', 'Bangalore', 'Hyderabad');

-- BETWEEN: inclusive range
SELECT * FROM flipkart_orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31';

-- LIKE: pattern matching
SELECT * FROM users
WHERE email LIKE '%@gmail.com';     -- ends with @gmail.com
WHERE mobile LIKE '98%';            -- Mumbai numbers
\`\`\`

## NULL Handling
\`\`\`sql
-- Always use IS NULL / IS NOT NULL — never = NULL
SELECT order_id FROM deliveries
WHERE delivered_at IS NULL;   -- undelivered orders
\`\`\`

💡 **Interview Tip:** "Why is WHERE executed before SELECT?" — Because SQL execution order is FROM → WHERE → GROUP BY → HAVING → SELECT. WHERE filters raw rows; you cannot use SELECT aliases in WHERE. This trips up many candidates.`,
      video_url: 'A9TOuDZTPDU',
      dur: 20,
    },
    {
      title: 'Sorting & TOP-N Queries',
      content: `# Sorting & TOP-N Queries

Every business report ends with "show me the top 10." Mastering ORDER BY + LIMIT is essential for leaderboard queries, ranking reports, and sampling data.

**Analogy:** Flipkart's category managers want the top 10 best-selling products every Monday. Their analyst runs a simple ORDER BY + LIMIT query on the weekend's sales data.

## ORDER BY Basics
\`\`\`sql
-- Top 10 products by revenue on Flipkart
SELECT
    product_id,
    product_name,
    category,
    SUM(sale_price) AS total_revenue
FROM flipkart_sales
WHERE sale_date >= DATE('now', '-7 days')
GROUP BY product_id, product_name, category
ORDER BY total_revenue DESC
LIMIT 10;
\`\`\`

## Multi-column Sort
\`\`\`sql
-- Sort by city ASC, then revenue DESC within each city
SELECT city, restaurant_id, SUM(order_value) AS revenue
FROM zomato_orders
GROUP BY city, restaurant_id
ORDER BY city ASC, revenue DESC;
\`\`\`

## TOP-N Per Group (Preview of Window Functions)
\`\`\`sql
-- Top 3 restaurants per city (teaser — full version uses RANK())
SELECT city, restaurant_id, revenue
FROM (
    SELECT city, restaurant_id,
           SUM(order_value) AS revenue,
           RANK() OVER (PARTITION BY city ORDER BY SUM(order_value) DESC) AS rnk
    FROM zomato_orders
    GROUP BY city, restaurant_id
) ranked
WHERE rnk <= 3;
\`\`\`

💡 **Interview Tip:** "Find the second highest salary" is a classic. Answer: \`SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)\` — then explain the window function alternative with \`DENSE_RANK()\`.`,
      video_url: 'wyWnJ7QYME4',
      dur: 15,
    },
    {
      title: 'JOINs — The Core Interview Skill',
      content: `# JOINs — The Core Interview Skill

JOINs combine rows from two or more tables based on a related column. 80% of real-world SQL involves JOINs. Get these wrong and your analysis will silently return wrong numbers.

**Analogy:** Zomato's orders table has customer_id but not the customer name. The customers table has the name. JOIN stitches them together — like a VLOOKUP that actually scales.

## INNER JOIN — Only Matching Rows
\`\`\`sql
-- Revenue per customer (only customers who ordered)
SELECT
    c.customer_id,
    c.name,
    c.city,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.order_value)  AS lifetime_value
FROM zomato_customers c
INNER JOIN zomato_orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.city
ORDER BY lifetime_value DESC;
\`\`\`

## LEFT JOIN — All Left Rows + Matching Right
\`\`\`sql
-- Customers who have NEVER ordered (churn analysis)
SELECT c.customer_id, c.name, c.signup_date
FROM zomato_customers c
LEFT JOIN zomato_orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;   -- NULL means no match found
\`\`\`

## Multi-table JOIN
\`\`\`sql
-- Flipkart: order details with product and seller info
SELECT
    o.order_id,
    u.name           AS buyer,
    p.product_name,
    s.seller_name,
    o.amount,
    o.status
FROM flipkart_orders o
JOIN flipkart_users u    ON o.user_id    = u.id
JOIN flipkart_products p ON o.product_id = p.id
JOIN flipkart_sellers s  ON p.seller_id  = s.id
WHERE o.order_date = CURRENT_DATE;
\`\`\`

## JOIN Types Summary
| Type | Returns |
|------|---------|
| INNER | Matching rows only |
| LEFT | All left + matching right (NULL if no match) |
| RIGHT | All right + matching left |
| FULL OUTER | All rows from both, NULLs where no match |
| CROSS | Cartesian product — every combination |

💡 **Interview Tip:** Always clarify "Should we include customers with no orders?" before writing the query. Choosing LEFT vs INNER JOIN is a business decision, not just a technical one. This answer impresses interviewers at product companies like Swiggy and PhonePe.`,
      video_url: '9URM1_2S0ho',
      dur: 35,
    },
    {
      title: 'GROUP BY & Aggregation',
      content: `# GROUP BY & Aggregation

Aggregation answers business questions at scale: "How much revenue per city?", "How many orders per restaurant?", "What's the average delivery time per zone?"

**Analogy:** Paytm's finance team needs daily revenue by payment method. GROUP BY collapses millions of transactions into one summary row per group.

## Core Aggregate Functions
\`\`\`sql
-- Paytm: daily revenue breakdown by payment method
SELECT
    payment_method,
    COUNT(*)                        AS txn_count,
    SUM(amount)                     AS total_revenue,
    ROUND(AVG(amount), 2)           AS avg_txn_value,
    MIN(amount)                     AS min_txn,
    MAX(amount)                     AS max_txn
FROM paytm_transactions
WHERE txn_date = CURRENT_DATE
  AND status = 'SUCCESS'
GROUP BY payment_method
ORDER BY total_revenue DESC;
\`\`\`

## HAVING — Filter After Aggregation
\`\`\`sql
-- Restaurants with avg delivery time > 45 min (SLA breach)
SELECT
    restaurant_id,
    restaurant_name,
    COUNT(*) AS total_orders,
    ROUND(AVG(delivery_minutes), 1) AS avg_delivery_time
FROM swiggy_orders
WHERE order_date >= DATE('now', '-30 days')
GROUP BY restaurant_id, restaurant_name
HAVING AVG(delivery_minutes) > 45
ORDER BY avg_delivery_time DESC;
\`\`\`

## WHERE vs HAVING
\`\`\`sql
-- WHERE filters rows BEFORE grouping
-- HAVING filters groups AFTER aggregation
SELECT city, COUNT(*) AS order_count
FROM zomato_orders
WHERE status = 'DELIVERED'          -- filter rows first
GROUP BY city
HAVING COUNT(*) > 1000              -- then filter groups
ORDER BY order_count DESC;
\`\`\`

💡 **Interview Tip:** "Can you use a WHERE clause with aggregate functions?" — No. Use HAVING. A follow-up: "Which is faster — filtering in WHERE or HAVING?" WHERE is faster because it reduces rows before grouping. Always filter in WHERE when possible.`,
      video_url: 'IVMfDpCGwK4',
      dur: 25,
    },
    {
      title: 'Subqueries & CTEs',
      content: `# Subqueries & CTEs

Complex business questions often require multi-step logic. Subqueries and CTEs let you break problems into readable, testable layers — like writing modular code.

**Analogy:** A Flipkart analyst needs "customers who spent more than average last month." That's a two-step problem: first calculate average, then filter. CTEs make this readable for your team.

## Subquery in WHERE
\`\`\`sql
-- Flipkart: customers with LTV above platform average
SELECT customer_id, name, lifetime_value
FROM (
    SELECT c.customer_id, c.name,
           SUM(o.amount) AS lifetime_value
    FROM flipkart_customers c
    JOIN flipkart_orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.name
) customer_ltv
WHERE lifetime_value > (
    SELECT AVG(total) FROM (
        SELECT SUM(amount) AS total
        FROM flipkart_orders
        GROUP BY customer_id
    )
)
ORDER BY lifetime_value DESC;
\`\`\`

## CTEs — Clean, Readable, Reusable
\`\`\`sql
-- Zomato: month-over-month order growth
WITH monthly_orders AS (
    SELECT
        STRFTIME('%Y-%m', order_date) AS month,
        COUNT(*)                       AS order_count,
        SUM(order_value)               AS revenue
    FROM zomato_orders
    WHERE status = 'DELIVERED'
    GROUP BY 1
),
growth AS (
    SELECT
        month,
        order_count,
        revenue,
        LAG(order_count) OVER (ORDER BY month) AS prev_orders,
        LAG(revenue)     OVER (ORDER BY month) AS prev_revenue
    FROM monthly_orders
)
SELECT
    month,
    order_count,
    revenue,
    ROUND((order_count - prev_orders) * 100.0 / prev_orders, 1) AS order_growth_pct,
    ROUND((revenue     - prev_revenue) * 100.0 / prev_revenue, 1) AS revenue_growth_pct
FROM growth
ORDER BY month;
\`\`\`

💡 **Interview Tip:** At PhonePe and Google, you'll often be asked to "refactor this subquery into a CTE." CTEs are preferred in production because they're easier to debug, test individually, and re-use. If a CTE is referenced more than once, some databases (PostgreSQL) materialise it — always mention this trade-off.`,
      video_url: 'nJIEIzF7tDw',
      dur: 30,
    },
    {
      title: 'Window Functions',
      content: `# Window Functions

Window functions perform calculations across a set of rows related to the current row — without collapsing rows like GROUP BY does. They are the single most-asked advanced SQL topic in data analyst interviews.

**Analogy:** You want each Swiggy order alongside the running total and the rank of that order per customer — GROUP BY would destroy the row-level detail. Window functions keep every row intact.

## ROW_NUMBER, RANK, DENSE_RANK
\`\`\`sql
-- Top order per customer (deduplication pattern)
SELECT *
FROM (
    SELECT
        order_id,
        customer_id,
        order_value,
        order_date,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY order_value DESC
        ) AS rn
    FROM swiggy_orders
) t
WHERE rn = 1;
\`\`\`

## Running Totals & Moving Averages
\`\`\`sql
-- PhonePe: 7-day rolling average transaction volume
SELECT
    txn_date,
    daily_txn_count,
    ROUND(AVG(daily_txn_count) OVER (
        ORDER BY txn_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 0) AS rolling_7d_avg
FROM (
    SELECT DATE(txn_date) AS txn_date, COUNT(*) AS daily_txn_count
    FROM phonepe_transactions
    WHERE status = 'SUCCESS'
    GROUP BY DATE(txn_date)
) daily
ORDER BY txn_date;
\`\`\`

## LAG / LEAD — Period-over-Period
\`\`\`sql
-- Flipkart: weekly revenue vs prior week
SELECT
    week,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY week)  AS prev_week_revenue,
    ROUND(
        (revenue - LAG(revenue, 1) OVER (ORDER BY week)) * 100.0
        / LAG(revenue, 1) OVER (ORDER BY week), 1
    )                                      AS wow_growth_pct
FROM weekly_flipkart_revenue
ORDER BY week;
\`\`\`

## NTILE — Bucket Customers into Quartiles
\`\`\`sql
SELECT
    customer_id,
    lifetime_value,
    NTILE(4) OVER (ORDER BY lifetime_value DESC) AS value_quartile
FROM customer_ltv;
-- quartile 1 = top 25% customers (your VIPs)
\`\`\`

💡 **Interview Tip:** The most common window function question: "Find the 2nd highest salary per department." Use DENSE_RANK() not RANK() — RANK skips numbers after ties, which can cause you to accidentally skip the true 2nd highest. Explaining this difference out loud earns serious brownie points at Amazon and Google interviews.`,
      video_url: 'Ww71knvhQ-s',
      dur: 35,
    },
  ],

  'Python for Analytics': [
    {
      title: 'Python & Pandas: Your First DataFrame',
      content: `# Python & Pandas: Your First DataFrame

Pandas is the Swiss Army knife of data analysis in Python. Every data analyst role in India that mentions Python means pandas — from Flipkart to startups in Bangalore.

**Analogy:** If SQL is querying a database, pandas is querying a file. You load messy CSVs, JSONs, or Excel exports and manipulate them with code.

## Loading & Inspecting Data
\`\`\`python
import pandas as pd

# Load Zomato order export
df = pd.read_csv('zomato_orders.csv')

# First look
print(df.shape)        # (rows, columns)
print(df.head())       # first 5 rows
print(df.dtypes)       # column data types
print(df.info())       # non-null counts + dtypes
print(df.describe())   # stats: mean, std, min, quartiles, max
\`\`\`

## Creating a DataFrame from Scratch
\`\`\`python
data = {
    'city':    ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
    'orders':  [142000, 98000, 187000, 73000],
    'revenue': [4200000, 2900000, 5600000, 2100000]
}
df = pd.DataFrame(data)
df['avg_order_value'] = df['revenue'] / df['orders']
print(df.sort_values('revenue', ascending=False))
\`\`\`

## Key Attributes
\`\`\`python
df.shape        # (rows, cols)
df.columns      # column names
df.index        # row index
df.dtypes       # data types per column
len(df)         # row count
\`\`\`

💡 **Interview Tip:** Interviewers often say "tell me about this dataset" and hand you a CSV. Always start with \`.shape\`, \`.info()\`, \`.describe()\`, and \`.isnull().sum()\` — it shows structured thinking. Analysts at Meesho and Razorpay specifically look for this systematic approach.`,
      video_url: 'ZyhVh-qRZPA',
      dur: 25,
    },
    {
      title: 'Selecting & Filtering Data',
      content: `# Selecting & Filtering Data

Pandas gives you multiple ways to select rows and columns. Understanding loc vs iloc vs boolean indexing is an interview staple.

**Analogy:** In SQL you write WHERE city = 'Mumbai'. In pandas you write \`df[df['city'] == 'Mumbai']\`. Same logic, different syntax — both skills complement each other.

## Column Selection
\`\`\`python
# Single column → Series
df['city']

# Multiple columns → DataFrame
df[['city', 'revenue', 'orders']]

# Column by attribute (works if no spaces in name)
df.city
\`\`\`

## Row Filtering — Boolean Indexing
\`\`\`python
# Flipkart: high-value orders from Delhi
high_value = df[
    (df['city'] == 'Delhi') &
    (df['order_value'] > 5000) &
    (df['status'] == 'DELIVERED')
]

# Zomato: orders NOT from top 4 metro cities
non_metro = df[~df['city'].isin(['Mumbai', 'Delhi', 'Bangalore', 'Chennai'])]
\`\`\`

## loc vs iloc
\`\`\`python
# loc  → label-based (column names, index labels)
df.loc[0:5, ['customer_id', 'amount']]

# iloc → position-based (integers only)
df.iloc[0:5, [0, 3]]      # first 5 rows, columns 0 and 3

# Single value
df.loc[42, 'city']         # row with index 42, city column
df.iloc[42, 2]             # 43rd row, 3rd column
\`\`\`

## query() — Readable Filtering
\`\`\`python
# Readable alternative for complex filters
result = df.query("city == 'Bangalore' and order_value > 1000 and status == 'DELIVERED'")
\`\`\`

💡 **Interview Tip:** "What's the difference between loc and iloc?" — \`loc\` is label-based and inclusive of the end index. \`iloc\` is integer position-based and exclusive of the end (like Python slicing). Getting this right immediately signals pandas proficiency to interviewers.`,
      video_url: 'xzslFdjO0Ts',
      dur: 20,
    },
    {
      title: 'Data Cleaning in Practice',
      content: `# Data Cleaning in Practice

Real-world data is dirty. At Swiggy, 8–12% of rows in raw delivery logs have nulls, duplicates, or wrong data types. Cleaning is where analysts spend 60–70% of their time.

**Analogy:** Before you can calculate average delivery time, you need to handle rows where delivery_time is NULL (cancelled orders), negative (data entry errors), or 999 (system default for unknown).

## Handling Missing Values
\`\`\`python
import pandas as pd

df = pd.read_csv('delivery_data.csv')

# Identify nulls
print(df.isnull().sum())
print(df.isnull().mean().round(3) * 100)  # % missing per column

# Fill numeric: use median (robust to outliers)
df['delivery_minutes'].fillna(df['delivery_minutes'].median(), inplace=True)

# Fill categorical: use mode or a default
df['payment_method'].fillna('Unknown', inplace=True)

# Drop rows where critical column is null
df.dropna(subset=['order_id', 'customer_id'], inplace=True)
\`\`\`

## Removing Duplicates
\`\`\`python
print(f"Before: {len(df)} rows")
df.drop_duplicates(subset=['order_id'], keep='first', inplace=True)
print(f"After:  {len(df)} rows")
\`\`\`

## Fixing Data Types
\`\`\`python
# String dates → datetime
df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')

# String numbers → float
df['amount'] = pd.to_numeric(df['amount'].str.replace(',', ''), errors='coerce')

# Standardise strings
df['city'] = df['city'].str.strip().str.title()
\`\`\`

## Outlier Detection (IQR Method)
\`\`\`python
Q1 = df['delivery_minutes'].quantile(0.25)
Q3 = df['delivery_minutes'].quantile(0.75)
IQR = Q3 - Q1
df = df[(df['delivery_minutes'] >= Q1 - 1.5*IQR) &
        (df['delivery_minutes'] <= Q3 + 1.5*IQR)]
\`\`\`

💡 **Interview Tip:** Always explain WHY you chose a fill strategy. "I used median instead of mean because delivery times are right-skewed — a few 3-hour deliveries would inflate the mean." This shows statistical thinking, not just code knowledge.`,
      video_url: 'bDhvCp3_lYw',
      dur: 30,
    },
    {
      title: 'Aggregation & GroupBy',
      content: `# Aggregation & GroupBy

GroupBy is the pandas equivalent of SQL's GROUP BY. Master this and you can answer 80% of business reporting questions without writing a single SQL query.

**Analogy:** Paytm's product team wants total transaction volume, average transaction value, and failure rate — grouped by city and payment method. GroupBy + agg() answers this in 5 lines.

## Basic GroupBy
\`\`\`python
import pandas as pd

df = pd.read_csv('paytm_transactions.csv')

# Single aggregation
city_revenue = df.groupby('city')['amount'].sum().sort_values(ascending=False)

# Multiple functions on one column
df.groupby('city')['amount'].agg(['sum', 'mean', 'count', 'median'])
\`\`\`

## Named Aggregations (agg with dict)
\`\`\`python
summary = df.groupby(['city', 'payment_method']).agg(
    total_revenue   = ('amount',      'sum'),
    avg_txn         = ('amount',      'mean'),
    txn_count       = ('txn_id',      'count'),
    failure_count   = ('status',      lambda x: (x == 'FAILED').sum()),
).reset_index()

summary['failure_rate'] = (summary['failure_count'] / summary['txn_count'] * 100).round(1)
summary.sort_values('total_revenue', ascending=False, inplace=True)
\`\`\`

## Pivot Tables
\`\`\`python
# Revenue matrix: cities as rows, payment methods as columns
pivot = df.pivot_table(
    values='amount',
    index='city',
    columns='payment_method',
    aggfunc='sum',
    fill_value=0
)
print(pivot)
\`\`\`

## Apply — Custom Logic Per Group
\`\`\`python
# 90th percentile order value per restaurant
p90 = df.groupby('restaurant_id')['order_value'].apply(
    lambda x: x.quantile(0.9)
).reset_index(name='p90_order_value')
\`\`\`

💡 **Interview Tip:** The \`transform()\` method is often tested. Unlike \`agg()\` which reduces rows, \`transform()\` returns a Series of the same length as the original DataFrame — perfect for creating a "group mean" column without merging. E.g., \`df['city_avg'] = df.groupby('city')['revenue'].transform('mean')\`.`,
      video_url: 'txMdrV1Ut64',
      dur: 25,
    },
    {
      title: 'Data Visualization with Matplotlib & Seaborn',
      content: `# Data Visualization with Matplotlib & Seaborn

A chart that tells the wrong story is worse than no chart. Learn to pick the right visualisation and make it clear and presentable for business stakeholders.

**Analogy:** When you present Flipkart's category-wise revenue to the CMO, a well-labelled bar chart closes the meeting faster than a table of numbers ever will.

## Line Chart — Trends Over Time
\`\`\`python
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv('flipkart_daily_revenue.csv')
df['date'] = pd.to_datetime(df['date'])

plt.figure(figsize=(12, 4))
plt.plot(df['date'], df['revenue'], color='#FF6B35', linewidth=2)
plt.title('Flipkart Daily Revenue — Jan to Mar 2024', fontsize=14)
plt.xlabel('Date')
plt.ylabel('Revenue (₹ Crore)')
plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()
\`\`\`

## Bar Chart — Comparison Across Categories
\`\`\`python
import seaborn as sns

city_rev = df.groupby('city')['revenue'].sum().reset_index()
city_rev = city_rev.sort_values('revenue', ascending=False).head(8)

plt.figure(figsize=(10, 5))
sns.barplot(data=city_rev, x='city', y='revenue', palette='viridis')
plt.title('Revenue by City (Top 8)', fontsize=13)
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()
\`\`\`

## Correlation Heatmap
\`\`\`python
numeric_cols = df[['order_value', 'delivery_minutes', 'rating', 'tip_amount']]
plt.figure(figsize=(7, 5))
sns.heatmap(numeric_cols.corr(), annot=True, fmt='.2f', cmap='coolwarm', center=0)
plt.title('Feature Correlation Matrix')
plt.tight_layout()
plt.show()
\`\`\`

## Distribution — Histogram + KDE
\`\`\`python
plt.figure(figsize=(8, 4))
sns.histplot(df['delivery_minutes'], bins=30, kde=True, color='steelblue')
plt.axvline(df['delivery_minutes'].median(), color='red', linestyle='--', label='Median')
plt.title('Delivery Time Distribution — Swiggy')
plt.legend()
plt.tight_layout()
plt.show()
\`\`\`

💡 **Interview Tip:** In a case study, always title your chart with the insight, not just the metric. "Bangalore Drives 34% of Revenue" beats "Revenue by City." Analysts at Zomato and Ola who present to leadership learn this fast.`,
      video_url: 'D5DPZyge31g',
      dur: 30,
    },
    {
      title: 'NumPy & Statistical Operations',
      content: `# NumPy & Statistical Operations

NumPy is the foundation under pandas — it provides fast, vectorised array operations. Understanding it helps you write faster code and pass numerical Python interview questions.

**Analogy:** A delivery routing algorithm at Dunzo processes thousands of distance calculations per second. Loops would take minutes; NumPy vectorisation does it in milliseconds.

## NumPy Arrays — Basics
\`\`\`python
import numpy as np

# Create arrays
arr = np.array([15, 23, 8, 42, 37, 19, 55, 28])

# Vectorised operations — no loops needed
print(arr * 1.18)              # add 18% GST to each amount
print(arr[arr > 25])           # filter: values above 25
print(np.where(arr > 30, 'High', 'Low'))  # conditional

# Stats
print(np.mean(arr), np.median(arr), np.std(arr))
print(np.percentile(arr, [25, 50, 75, 90, 95]))
\`\`\`

## Broadcasting — Operations Without Loops
\`\`\`python
# Normalise delivery times: (x - mean) / std
times = np.array([22, 35, 18, 45, 28, 60, 14, 33])
z_scores = (times - times.mean()) / times.std()
print(z_scores)
# Values > 2 or < -2 are statistical outliers
\`\`\`

## Useful Functions for Analytics
\`\`\`python
orders = np.random.normal(loc=800, scale=250, size=10000)

# Clip outliers to [100, 2000]
orders_clipped = np.clip(orders, 100, 2000)

# Histogram bins
counts, bins = np.histogram(orders_clipped, bins=20)

# Correlation coefficient
ratings = np.random.normal(4.1, 0.5, 10000)
print(np.corrcoef(orders_clipped, ratings)[0, 1])
\`\`\`

💡 **Interview Tip:** "Why use NumPy instead of Python lists?" — NumPy arrays are stored in contiguous memory, allow vectorised C-level operations, and are 10–100x faster for numerical computation. pandas DataFrames are built on NumPy arrays — understanding this link shows depth.`,
      video_url: 'lPPnGYjCSHY',
      dur: 20,
    },
    {
      title: 'End-to-End EDA Workflow',
      content: `# End-to-End EDA Workflow

Exploratory Data Analysis (EDA) is what you do when you get a new dataset before any modelling or reporting. A structured EDA workflow demonstrates analytical maturity — something senior interviewers specifically test for.

**Analogy:** Imagine you join Swiggy's analytics team. On Day 1 you're handed a CSV of 3 months of delivery data and asked: "What's the story?" This is your playbook.

## Step 1 — Load & Understand the Data
\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('swiggy_deliveries_q1.csv')
print(df.shape, df.dtypes, df.head())
print(df.isnull().mean().round(3) * 100)  # % missing
print(df.describe())
\`\`\`

## Step 2 — Clean
\`\`\`python
df['order_time'] = pd.to_datetime(df['order_time'], errors='coerce')
df['delivery_minutes'] = pd.to_numeric(df['delivery_minutes'], errors='coerce')
df.drop_duplicates(subset='order_id', inplace=True)
df.dropna(subset=['customer_id', 'restaurant_id'], inplace=True)

# Remove impossible delivery times
df = df[(df['delivery_minutes'] > 0) & (df['delivery_minutes'] < 180)]
\`\`\`

## Step 3 — Univariate Analysis
\`\`\`python
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
sns.histplot(df['delivery_minutes'], bins=30, kde=True, ax=axes[0])
axes[0].set_title('Delivery Time Distribution')
df['city'].value_counts().head(8).plot(kind='barh', ax=axes[1])
axes[1].set_title('Orders by City')
plt.tight_layout()
plt.show()
\`\`\`

## Step 4 — Bivariate & Insights
\`\`\`python
# Avg delivery time by city — sorted
city_perf = df.groupby('city')['delivery_minutes'].mean().sort_values()
city_perf.plot(kind='barh', figsize=(8, 5), color='steelblue')
plt.title('Avg Delivery Time by City')
plt.xlabel('Minutes')
plt.tight_layout()
plt.show()

# Correlation: order value vs tip
print(df[['order_value', 'tip_amount', 'delivery_minutes', 'rating']].corr())
\`\`\`

## Step 5 — Summarise Findings
\`\`\`python
print("=== EDA SUMMARY ===")
print(f"Date range: {df['order_time'].min()} to {df['order_time'].max()}")
print(f"Total orders: {len(df):,}")
print(f"Unique customers: {df['customer_id'].nunique():,}")
print(f"Avg delivery time: {df['delivery_minutes'].mean():.1f} min")
print(f"Median order value: ₹{df['order_value'].median():,.0f}")
print(f"Top city: {df['city'].value_counts().index[0]}")
\`\`\`

💡 **Interview Tip:** In a 45-minute case interview, spend 5 min on data understanding, 10 min cleaning, 20 min on analysis, and 10 min on storytelling. Analysts who skip to charts without cleaning first get caught by trick questions like "why is your mean so high?" — outliers.`,
      video_url: '3QoEFsbtU0c',
      dur: 45,
    },
  ],

  'Statistics & Probability': [
    {
      title: 'Descriptive Statistics',
      content: `# Descriptive Statistics

Before any analysis, you need to summarise your data. Descriptive statistics give you a one-page "health check" of any dataset — interviewers will ask you to interpret these numbers on the spot.

**Analogy:** You're an analyst at Amazon India. A product manager hands you data on 50,000 delivery times and asks: "Is our delivery performance good?" Descriptive stats give you the answer in 60 seconds.

## Measures of Central Tendency
| Measure | Formula | Use when |
|---------|---------|----------|
| Mean | Sum / Count | Data is symmetric, no extreme outliers |
| Median | Middle value | Skewed data, outliers present |
| Mode | Most frequent | Categorical data, discrete counts |

\`\`\`python
import pandas as pd

df = pd.read_csv('amazon_deliveries.csv')
t = df['delivery_days']

print(f"Mean:   {t.mean():.2f} days")
print(f"Median: {t.median():.2f} days")
print(f"Mode:   {t.mode()[0]:.0f} days")
print(f"Std:    {t.std():.2f} days")
print(f"IQR:    {t.quantile(0.75) - t.quantile(0.25):.2f} days")
\`\`\`

## Spread — Variance, Std Dev, IQR
- **Variance**: Average squared deviation — hard to interpret (units²)
- **Std Dev**: Square root of variance — same unit as data
- **IQR**: Q3 − Q1 — robust to outliers, used for outlier detection

## Skewness
\`\`\`python
print(f"Skewness: {t.skew():.2f}")
# Positive skew → tail on right (most values are low, few are very high)
# e.g., income data — most earn 30–50 LPA, a few earn 5 Cr+
\`\`\`

## The 68-95-99.7 Rule (Normal Distribution)
- 68% of data falls within ±1 std dev from mean
- 95% within ±2 std dev
- 99.7% within ±3 std dev

💡 **Interview Tip:** "If mean delivery time is 3.2 days but median is 2.1 days, what does that tell you?" — The distribution is right-skewed: most deliveries are fast but a few very slow ones pull the mean up. Recommend using median as the KPI metric. This answer shows real analytical thinking.`,
      video_url: 'SplCk-t1BeA',
      dur: 20,
    },
    {
      title: 'Probability & Distributions',
      content: `# Probability & Distributions

Probability is the language of uncertainty. In data analytics, it underpins A/B testing, risk scoring, and forecasting — all common at companies like PhonePe and Razorpay.

**Analogy:** PhonePe's fraud team builds a model that scores each transaction 0–1 for fraud probability. Understanding distributions helps them set the right threshold — too low = annoying false positives; too high = missed fraud.

## Core Probability Rules
\`\`\`
P(A) ∈ [0, 1]
P(A') = 1 − P(A)                          (complement)
P(A ∪ B) = P(A) + P(B) − P(A ∩ B)        (addition)
P(A ∩ B) = P(A) × P(B|A)                  (multiplication)
P(A ∩ B) = P(A) × P(B)  if A,B independent
\`\`\`

## Normal Distribution
\`\`\`python
from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

# PhonePe txn amounts ~ Normal(mean=850, std=300)
mu, sigma = 850, 300

# P(txn > 1500) — probability of high-value txn
p = 1 - stats.norm.cdf(1500, loc=mu, scale=sigma)
print(f"P(amount > 1500): {p:.2%}")

# Value at 95th percentile
print(f"95th percentile: ₹{stats.norm.ppf(0.95, loc=mu, scale=sigma):.0f}")
\`\`\`

## Binomial Distribution
\`\`\`python
# Zomato: 40% orders get 5-star rating. What's P(exactly 7 out of 10)?
n, p = 10, 0.4
prob = stats.binom.pmf(7, n, p)
print(f"P(exactly 7 five-stars) = {prob:.4f}")

# P(at least 5 five-stars)
print(f"P(≥5 five-stars) = {1 - stats.binom.cdf(4, n, p):.4f}")
\`\`\`

## Poisson Distribution
\`\`\`python
# Swiggy: avg 120 orders/hour. P(>150 orders in an hour)?
lam = 120
p_over_150 = 1 - stats.poisson.cdf(150, lam)
print(f"P(>150 orders/hr) = {p_over_150:.4f}")
\`\`\`

💡 **Interview Tip:** "When would you use a Poisson distribution?" — When counting events in a fixed time/space interval where events are rare and independent. Real example: number of fraud transactions per hour, support tickets per day, delivery exceptions per week. Citing a real business example locks in the answer.`,
      video_url: '9wCnvr7Xw4E',
      dur: 25,
    },
    {
      title: 'Sampling & Central Limit Theorem',
      content: `# Sampling & Central Limit Theorem

You almost never have data about every person or event. Sampling lets you draw conclusions about millions of users from a few thousand. The Central Limit Theorem is why this works.

**Analogy:** Flipkart can't survey all 45 crore registered users to understand satisfaction. But a random sample of 2,000 users gives a reliable estimate — that's the power of CLT.

## Types of Sampling
| Type | Method | Best for |
|------|---------|----------|
| Simple Random | Every unit equally likely | General surveys |
| Stratified | Random within groups (city, age) | Balanced representation |
| Systematic | Every Nth record | Log file sampling |
| Cluster | Random groups (cities) | Geographic studies |

\`\`\`python
import pandas as pd
import numpy as np

df = pd.read_csv('flipkart_users.csv')

# Simple random sample (10%)
sample_random = df.sample(frac=0.1, random_state=42)

# Stratified by city (ensures each city is represented)
sample_stratified = df.groupby('city', group_keys=False).apply(
    lambda x: x.sample(frac=0.1, random_state=42)
)
\`\`\`

## Central Limit Theorem in Action
\`\`\`python
population = np.random.exponential(scale=500, size=100000)  # right-skewed
print(f"Population mean: ₹{population.mean():.0f}")

sample_means = [
    np.random.choice(population, size=50).mean()
    for _ in range(1000)
]

import matplotlib.pyplot as plt
plt.hist(sample_means, bins=40, edgecolor='black')
plt.title('CLT: Distribution of 1000 Sample Means (n=50)')
plt.xlabel('Sample Mean (₹)')
plt.axvline(population.mean(), color='red', linestyle='--', label='True Mean')
plt.legend()
plt.show()
# → Even though the population is skewed, sample means form a normal distribution!
\`\`\`

## Standard Error
\`\`\`python
n = 500  # sample size
std = df['order_value'].std()
standard_error = std / np.sqrt(n)
print(f"Standard Error: ₹{standard_error:.2f}")
# SE decreases as n increases — larger samples = more precise estimates
\`\`\`

💡 **Interview Tip:** "Why can we use t-tests even when our data isn't normally distributed?" — Because of CLT. With n ≥ 30, the sampling distribution of the mean is approximately normal regardless of the population distribution. This is why A/B tests work at Flipkart scale.`,
      video_url: 'YAlJCEDH2uY',
      dur: 20,
    },
    {
      title: 'Confidence Intervals',
      content: `# Confidence Intervals

A confidence interval gives a range of plausible values for a population parameter, not just a point estimate. "The average order value is ₹847 ± ₹23 (95% CI)" is far more honest and useful than just "₹847."

**Analogy:** Ola's analytics team measures average wait time from a sample of 300 rides. A CI tells them: "We're 95% confident the true average is between 4.2 and 5.8 minutes" — helping them set realistic SLAs.

## 95% Confidence Interval (Known Population Std)
\`\`\`python
import numpy as np
from scipy import stats

# Ola: sample of 300 ride wait times
sample = np.random.normal(loc=5.0, scale=2.1, size=300)

n = len(sample)
mean = sample.mean()
se = sample.std(ddof=1) / np.sqrt(n)      # standard error
z = stats.norm.ppf(0.975)                  # 1.96 for 95% CI

lower = mean - z * se
upper = mean + z * se
print(f"95% CI: ({lower:.2f}, {upper:.2f}) minutes")
print(f"Sample mean: {mean:.2f} min, Margin of error: ±{z*se:.2f}")
\`\`\`

## t-Distribution (Small Samples, Unknown Std)
\`\`\`python
# Use t-distribution when n < 30 or population std unknown (most real cases)
small_sample = np.random.normal(5.0, 2.1, size=25)
ci = stats.t.interval(
    confidence=0.95,
    df=len(small_sample) - 1,
    loc=np.mean(small_sample),
    scale=stats.sem(small_sample)
)
print(f"95% CI (t-dist): {ci}")
\`\`\`

## Interpreting Confidence Intervals
\`\`\`
CORRECT: "If we repeated this study 100 times, ~95 of the resulting CIs
          would contain the true population mean."

WRONG:   "There's a 95% chance the true mean is in this interval."
          (The true mean is fixed — it either is or isn't in the CI.)
\`\`\`

💡 **Interview Tip:** At Amazon and Google interviews, you may be asked "Your A/B test shows a 5% lift. How confident are you?" Walk through: sample size → standard error → 95% CI. If the CI includes 0, you cannot claim a statistically significant lift. This is the most common trap in analytics case studies.`,
      video_url: 'TqOeMYtOc1w',
      dur: 20,
    },
    {
      title: 'Hypothesis Testing & A/B Tests',
      content: `# Hypothesis Testing & A/B Tests

A/B testing is the bread and butter of product analytics at every major Indian tech company. Swiggy tests new checkout flows, PhonePe tests UI changes, Zomato tests promotional offers — all using hypothesis testing.

**Analogy:** Zomato's product team built a new "reorder" button. Did it increase order rate? They ran an A/B test — 50k users see the old UI (control), 50k see the new UI (treatment). Hypothesis testing tells them if the difference is real or just luck.

## The Framework
\`\`\`
H₀ (Null):        New button has no effect (conversion rate is equal)
H₁ (Alternative): New button increases conversion rate
α (significance):  0.05 (5% false positive tolerance)
Power (1-β):       0.80 (80% chance of detecting a real effect)
\`\`\`

## Two-Proportion Z-Test (Conversion Rates)
\`\`\`python
from scipy import stats
import numpy as np

# Control: 50,000 users, 8,200 converted (16.4%)
# Treatment: 50,000 users, 8,950 converted (17.9%)
n_ctrl, conv_ctrl = 50000, 8200
n_treat, conv_treat = 50000, 8950

p_ctrl  = conv_ctrl / n_ctrl
p_treat = conv_treat / n_treat
p_pool  = (conv_ctrl + conv_treat) / (n_ctrl + n_treat)

se = np.sqrt(p_pool * (1 - p_pool) * (1/n_ctrl + 1/n_treat))
z_stat = (p_treat - p_ctrl) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

print(f"Control CVR:   {p_ctrl:.2%}")
print(f"Treatment CVR: {p_treat:.2%}")
print(f"Lift:          {(p_treat - p_ctrl)/p_ctrl:.2%}")
print(f"Z-stat:        {z_stat:.3f}")
print(f"p-value:       {p_value:.4f}")
print("SIGNIFICANT ✓" if p_value < 0.05 else "NOT SIGNIFICANT ✗")
\`\`\`

## Two-Sample t-Test (Continuous Metrics)
\`\`\`python
# Did the new checkout reduce time-to-complete-payment?
control_times   = np.random.normal(45, 12, 1000)  # seconds
treatment_times = np.random.normal(41, 11, 1000)

t_stat, p_value = stats.ttest_ind(control_times, treatment_times)
print(f"t-statistic: {t_stat:.3f}, p-value: {p_value:.4f}")
\`\`\`

## Common A/B Test Pitfalls
- **Peeking**: Checking results daily and stopping when p < 0.05 inflates false positives
- **Multiple testing**: Testing 10 variants without correction → expect 1 false positive by chance
- **Novelty effect**: Users engage with anything new — wait 2+ weeks for steady state
- **Sample ratio mismatch**: If you expect 50/50 split but get 52/48, your randomisation is broken

💡 **Interview Tip:** Interviewers at product companies love asking "How long should you run an A/B test?" Answer: Use a power analysis. \`n = 2 × (z_α + z_β)² × p(1-p) / (δ)²\` — where δ is the minimum detectable effect. Then: days = required_sample / daily_traffic_per_variant.`,
      video_url: 'VuKIN9S8Ivs',
      dur: 30,
    },
    {
      title: 'Correlation & Regression',
      content: `# Correlation & Regression

Correlation quantifies the relationship between two variables. Regression lets you predict one variable from others. These are the most-used statistical tools in business analytics.

**Analogy:** Flipkart's logistics team wants to know: does the number of warehouses in a region predict delivery speed? Regression answers this and quantifies the relationship.

## Pearson Correlation
\`\`\`python
import pandas as pd
import numpy as np
from scipy import stats
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.read_csv('flipkart_logistics.csv')

# Correlation matrix
corr_matrix = df[['delivery_days', 'warehouses', 'distance_km', 'order_value']].corr()
sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', center=0)
plt.title('Logistics Correlation Matrix')
plt.tight_layout()
plt.show()

# Pearson r + p-value for two columns
r, p = stats.pearsonr(df['warehouses'], df['delivery_days'])
print(f"r = {r:.3f}, p = {p:.4f}")
# r close to -1: strong negative correlation (more warehouses → fewer days)
\`\`\`

## Simple Linear Regression
\`\`\`python
from sklearn.linear_model import LinearRegression
import numpy as np

X = df[['warehouses']].values
y = df['delivery_days'].values

model = LinearRegression()
model.fit(X, y)

print(f"Intercept:  {model.intercept_:.3f}")
print(f"Coefficient: {model.coef_[0]:.3f}")
# "Each additional warehouse reduces delivery time by X days"
print(f"R² Score:   {model.score(X, y):.3f}")
\`\`\`

## Interpreting R²
\`\`\`
R² = 0.72 → "72% of the variation in delivery days is explained by number of warehouses"
R² = 0.10 → "warehouses alone poorly explains delivery time — other factors dominate"
\`\`\`

## Correlation vs Causation
\`\`\`
Classic trap: Ice cream sales correlate with drowning incidents.
Why: Both increase in summer (confounding variable = temperature).
Business example: App rating correlates with revenue, but improving
rating might not increase revenue — the true driver is app quality.
\`\`\`

💡 **Interview Tip:** "What is multicollinearity?" — When two predictor variables are highly correlated with each other (e.g., both "discount_amount" and "final_price" in a model). It inflates standard errors and makes coefficients unstable. Detect with VIF (Variance Inflation Factor). This question comes up at Flipkart and Amazon data science panels.`,
      video_url: 'nk2CQITm_eo',
      dur: 30,
    },
  ],

  'Tableau for Analysts': [
    {
      title: 'Introduction to Tableau',
      content: `# Introduction to Tableau

Tableau is the world's leading data visualisation tool — used by Flipkart, Swiggy, Myntra, CRED, Razorpay, and thousands of Indian analytics teams. It lets you go from raw data to interactive dashboards without writing a single line of code.

## Why Tableau?
| Feature | What it means for you |
|---------|----------------------|
| Drag-and-drop UI | Build charts in seconds, not hours |
| Live & extract connections | Connect to any data source: SQL, Excel, Google Sheets, S3 |
| Interactive dashboards | Filters, drill-downs, tooltips — no coding needed |
| Tableau Public | Free — publish and share your portfolio with employers |
| Industry standard | Listed in 60%+ of Indian BI/analyst job descriptions |

## Tableau Product Family
- **Tableau Desktop** — where you build workbooks (14-day free trial)
- **Tableau Public** — 100% free, save to public cloud, great for portfolio
- **Tableau Server / Cloud** — enterprise sharing within an org

## The Tableau Interface
\`\`\`
┌─────────────────────────────────────────────┐
│ Data Pane    │      Canvas (Sheet view)      │
│ ──────────── │  ┌── Columns shelf ─────────┐ │
│ Dimensions   │  ├── Rows shelf ────────────┤ │
│  • City      │  │                           │ │
│  • Category  │  │      Chart appears here   │ │
│  • Date      │  │                           │ │
│ ──────────── │  └───────────────────────────┘ │
│ Measures     │  Marks card: Color Size Label  │
│  • Revenue   │  Filters pane                  │
│  • Orders    │                                │
└─────────────────────────────────────────────┘
\`\`\`

## Connecting to Data
\`\`\`
1. Open Tableau → Connect → To a File → Excel or CSV
2. Or: Connect → To a Server → MySQL / PostgreSQL / BigQuery
3. Drag tables to canvas to build a JOIN
4. Click "Sheet 1" at the bottom to start building
\`\`\`

## Dimensions vs Measures
- **Dimensions** (blue pills) — categorical: City, Product, Date, Status
- **Measures** (green pills) — numerical: Revenue, Orders, Duration, Rating
- Drag a Dimension to Columns + a Measure to Rows → instant bar chart!

💡 **Interview Tip:** Many analyst interviews at startups ask you to "show us a Tableau dashboard you've built." Having even one clean viz on Tableau Public with a real dataset puts you in the top 20% of applicants.`,
      video_url: 'TPMlZxRRaBQ',
      dur: 15,
    },
    {
      title: 'Tableau: Getting Started',
      content: `# Tableau: Getting Started

Tableau is the most popular BI tool in Indian product and e-commerce companies. If a job description says "data visualisation," 70% of the time they mean Tableau or Power BI.

**Analogy:** SQL gives you the data; Tableau makes it understandable. An analyst at Flipkart writes SQL to pull category-wise GMV, then drags it into Tableau to build the weekly business review deck in 20 minutes.

## Core Concepts
| Term | Meaning |
|------|---------|
| Dimension | Categorical — city, category, date (blue pill) |
| Measure | Numeric — revenue, orders, duration (green pill) |
| Marks card | Controls colour, size, shape, tooltip, detail |
| Rows / Columns shelf | Axes of your chart |
| Pages shelf | Animates the view over a dimension |

## Building Your First Chart (Step-by-Step)
\`\`\`
1. Connect → Text File (CSV) or Database
2. Drag "City" to Columns shelf
3. Drag "Revenue" to Rows shelf
4. Tableau auto-creates a bar chart
5. Drag "Category" to Color mark → stacked bars by category
6. Sort descending by revenue (sort icon on axis)
7. Add a reference line: Analytics pane → Average Line
\`\`\`

## Calculated Fields
\`\`\`
Right-click any measure → Create Calculated Field

Name: Profit Margin %
Formula: SUM([Revenue] - [Cost]) / SUM([Revenue])
Format: Percentage → 2 decimal places

Name: Week over Week Growth
Formula: (SUM([Revenue]) - LOOKUP(SUM([Revenue]), -1))
          / ABS(LOOKUP(SUM([Revenue]), -1))
\`\`\`

## Filters vs Context Filters
\`\`\`
Regular filter: applied AFTER all aggregations (slower for large data)
Context filter: creates a subset first, then other filters apply to it
→ Use context filter on high-cardinality fields (customer_id, date)
   when you also have TOP N filters
\`\`\`

💡 **Interview Tip:** When asked to "build a dashboard in Tableau," always use a Layout Container to align your KPI tiles at the top. This makes dashboards responsive and professional. Mention that you use device-specific layouts (desktop vs tablet) for real deployments.`,
      video_url: 'jEgVto5QME8',
      dur: 30,
    },
    {
      title: 'Tableau: Calculated Fields & Filters',
      content: `# Tableau: Calculated Fields & Filters

Calculated fields and table calculations are what separate beginner Tableau users from intermediate ones. They let you add business logic directly in the viz layer without changing your source data.

**Analogy:** Your SQL query returns raw GMV. The business wants GMV minus returns, minus cancellations, net of discounts — as a single "Net Revenue" number on the dashboard. Calculated fields handle this without touching the database.

## Types of Calculations
\`\`\`
Row-level calculations:
  Applied to each row of the source data
  Example: [Revenue] - [Cost]  →  Profit per row

Aggregate calculations:
  Applied to aggregated measures
  Example: SUM([Revenue]) / COUNT([Order ID])  →  Avg Order Value

Table calculations:
  Applied to the result table in Tableau
  Example: RUNNING_SUM(SUM([Revenue]))  →  Cumulative revenue
           PERCENT_OF_TOTAL(SUM([Revenue]))  →  Share of total
\`\`\`

## Useful Calculated Field Patterns
\`\`\`
// Days since last order (customer recency)
DATEDIFF('day', MAX([Order Date]), TODAY())

// Cohort month
DATETRUNC('month', MIN([Signup Date]))

// If/Else segmentation
IF [Order Value] > 5000 THEN 'High Value'
ELSEIF [Order Value] > 1000 THEN 'Mid Value'
ELSE 'Low Value'
END

// YoY Growth %
(SUM([Revenue]) - LOOKUP(SUM([Revenue]), -1))
/ ABS(LOOKUP(SUM([Revenue]), -1))
\`\`\`

## Quick Filters vs Parameters
\`\`\`
Quick Filter: static dropdown — user picks from existing values
Parameter:    dynamic input — user types a number (e.g., "Top N = 10")

Building a Top-N Parameter:
1. Create Parameter "Top N" (Integer, range 1–20, default 10)
2. Create Calculated Field: RANK(SUM([Revenue])) <= [Top N]
3. Add that field to Filters → True
4. Show parameter control on dashboard
\`\`\`

💡 **Interview Tip:** "What is a Level of Detail (LOD) expression?" — LOD expressions like FIXED, INCLUDE, EXCLUDE let you compute aggregations at a different granularity than the view. FIXED is the most common: \`{FIXED [Customer ID] : MIN([Order Date])}\` gives the first order date per customer — critical for cohort analysis.`,
      video_url: 'yush1yNz9VM',
      dur: 25,
    },
    {
      title: 'Building a Sales Dashboard in Tableau',
      content: `# Building a Sales Dashboard in Tableau

Let's build a real analytics dashboard step by step — the kind you'd build on Day 1 at a startup.

## Dashboard Blueprint
We'll build 4 charts:
1. **KPI Tiles** — Total Revenue, Orders, Avg Order Value
2. **Monthly Trend** — Revenue line chart with targets
3. **Top 5 Cities** — Horizontal bar chart
4. **Category Mix** — Donut / pie chart

## Step 1 — KPI Tiles
\`\`\`
1. New sheet → Drag Revenue to Text mark
2. Add a Reference Line at your target (e.g. ₹10L)
3. Use Calculated Field: IF SUM([Revenue]) >= 1000000 THEN "✅ On Track" ELSE "⚠ Behind" END
\`\`\`

## Step 2 — Monthly Trend Line
\`\`\`
1. Drag Order Date to Columns → right-click → Month (continuous)
2. Drag Revenue to Rows
3. Drag Target to Rows → dual axis → synchronise axes
4. Format: solid line for actual, dashed for target
\`\`\`

## Step 3 — Calculated Fields (Essential!)
\`\`\`tableau
// Month-over-Month Growth %
(SUM([Revenue]) - LOOKUP(SUM([Revenue]), -1))
/ ABS(LOOKUP(SUM([Revenue]), -1))

// Profit Margin
SUM([Profit]) / SUM([Revenue])

// Running Total
RUNNING_SUM(SUM([Revenue]))
\`\`\`

## Dashboard Layout Tips
- Use **containers** (horizontal/vertical) for responsive layout
- Set fixed dashboard size: 1200 × 800 px for desktop
- Add **filter actions**: clicking a city filters all charts
- Add **highlight actions**: hovering highlights related marks

💡 **Interview Tip:** When presenting a Tableau dashboard, always start by stating "This dashboard answers one question: [X]." It shows data storytelling instincts.`,
      video_url: 'TPMlZxRRaBQ',
      dur: 30,
    },
  ],

  'Power BI': [
    {
      title: 'Power BI Basics',
      content: `# Power BI Basics

Microsoft Power BI is the leading BI tool in corporate India — banks, MNCs, and large enterprises use it everywhere. It's free to start with Power BI Desktop.

## Power BI Ecosystem
| Component | Role |
|-----------|------|
| Power BI Desktop | Build reports (free download) |
| Power BI Service | Cloud publishing & sharing |
| Power BI Mobile | View reports on phone |
| Power Query | ETL — clean & transform data |
| DAX | Data Analysis Expressions — formulas |

## The 3-Step Workflow
\`\`\`
1. GET DATA → Connect to Excel, SQL, API, SharePoint
2. TRANSFORM → Power Query Editor (clean, merge, unpivot)
3. VISUALISE → Drag fields onto canvas, choose chart types
\`\`\`

## Key Panels in Power BI Desktop
- **Data pane** — All tables and fields
- **Visualizations pane** — 30+ chart types + custom visuals
- **Filters pane** — Page / Visual / Report level filters
- **Report view** — Canvas for building pages

## Connecting to Data Sources
\`\`\`
Home → Get Data →
  - Excel Workbook
  - SQL Server
  - Web (REST API)
  - Google Analytics
  - SharePoint List
\`\`\`

💡 **Interview Tip:** Many analyst JDs in banks and IT companies say "Power BI preferred." Even knowing the basics (data import, simple DAX, publish to service) puts you ahead of 80% of candidates.`,
      video_url: 'NNSHu0rkew8',
      dur: 20,
    },
    {
      title: 'Power Query — Data Transformation',
      content: `# Power Query — Data Transformation

Power Query is Power BI's built-in ETL engine. Before you visualise, your data needs to be clean and structured.

## Opening Power Query Editor
\`\`\`
Home → Transform Data → Power Query Editor opens
\`\`\`

## Essential Transformations
### 1. Remove Duplicates & Nulls
\`\`\`
Right-click column → Remove Duplicates
Right-click column → Remove Errors
Home → Remove Rows → Remove Blank Rows
\`\`\`

### 2. Change Data Types
\`\`\`
Click column header icon (ABC / 123 / 📅)
Date columns: change to Date type (not Text!)
Revenue columns: change to Decimal Number
\`\`\`

### 3. Split & Merge Columns
\`\`\`
// Split "First Last" into two columns
Transform → Split Column → By Delimiter (Space)

// Merge City + State into one
Add Column → Merge Columns → Separator: ", "
\`\`\`

### 4. Unpivot (Wide → Long format)
\`\`\`
// Before: Jan_Sales | Feb_Sales | Mar_Sales (wide)
// After:  Month | Sales (long — what charts need)
Select month columns → Transform → Unpivot Columns
\`\`\`

### 5. Append & Merge Queries
\`\`\`
// Append = stack tables vertically (UNION ALL)
Home → Append Queries

// Merge = JOIN tables
Home → Merge Queries → choose join key and type
\`\`\`

## M Language (Advanced)
Power Query uses M language under the hood:
\`\`\`m
= Table.SelectRows(Source, each [Revenue] > 0)
= Table.AddColumn(#"Previous Step", "Margin", each [Profit] / [Revenue])
\`\`\`

💡 **Interview Tip:** Knowing Power Query separates you from people who just drag fields. Being able to clean messy Excel data and explain your transformation steps shows maturity.`,
      video_url: 'Dk25lwdTKow',
      dur: 25,
    },
    {
      title: 'DAX — Data Analysis Expressions',
      content: `# DAX — Data Analysis Expressions

DAX is the formula language of Power BI. It's what makes Power BI powerful — think of it as SQL + Excel formulas combined.

## Two Types of DAX Calculations

### Measures (Dynamic — recalculates with filters)
\`\`\`dax
Total Revenue = SUM(Sales[Amount])

Order Count = COUNTROWS(Orders)

Avg Order Value = DIVIDE([Total Revenue], [Order Count])

Revenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[Date]))

YoY Growth % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY])
\`\`\`

### Calculated Columns (Static — computed row by row)
\`\`\`dax
Profit Margin = Sales[Revenue] - Sales[Cost]

City Category = Sales[City] & " - " & Sales[Category]

Is High Value = IF(Sales[Amount] > 10000, "High", "Standard")
\`\`\`

## CALCULATE — The Most Important DAX Function
CALCULATE changes the filter context:
\`\`\`dax
// Revenue for Mumbai only
Mumbai Revenue = CALCULATE([Total Revenue], Sales[City] = "Mumbai")

// Revenue excluding returns
Net Revenue = CALCULATE([Total Revenue], Orders[Status] <> "Returned")

// MTD Revenue
MTD Revenue = CALCULATE([Total Revenue], DATESMTD('Date'[Date]))
\`\`\`

## Time Intelligence Functions
\`\`\`dax
MTD = CALCULATE([Revenue], DATESMTD('Date'[Date]))
QTD = CALCULATE([Revenue], DATESQTD('Date'[Date]))
YTD = CALCULATE([Revenue], DATESYTD('Date'[Date]))
Last 30 Days = CALCULATE([Revenue], DATESINPERIOD('Date'[Date], TODAY(), -30, DAY))
\`\`\`

💡 **Interview Tip:** CALCULATE is asked in almost every Power BI interview. Memorise: "CALCULATE evaluates an expression in a modified filter context." Then give an example.`,
      video_url: 'WmiUdpmrG3g',
      dur: 30,
    },
    {
      title: 'Building Your First Power BI Dashboard',
      content: `# Building Your First Power BI Dashboard

Let's build a real business dashboard — a Sales Performance Report.

## Data Model (Star Schema)
\`\`\`
         [Date Table]
               |
[Products] — [Sales Fact] — [Customers]
               |
          [Stores/Regions]
\`\`\`
Always use a **star schema** — one fact table surrounded by dimension tables.

## Step 1 — Create Date Table
\`\`\`dax
Date Table = CALENDAR(DATE(2023,1,1), DATE(2025,12,31))

// Add columns:
Year = YEAR('Date Table'[Date])
Month = FORMAT('Date Table'[Date], "MMM")
Quarter = "Q" & QUARTER('Date Table'[Date])
\`\`\`

## Step 2 — Build Key Measures
\`\`\`dax
Total Revenue = SUM(Sales[Amount])
Target = SUM(Targets[Monthly_Target])
Achievement % = DIVIDE([Total Revenue], [Target], 0)
Gap to Target = [Target] - [Total Revenue]
\`\`\`

## Step 3 — Choose the Right Visuals
| Question | Best Visual |
|----------|------------|
| Trend over time | Line chart |
| Comparison across categories | Clustered bar |
| Part of a whole | Donut chart |
| Two metrics correlation | Scatter plot |
| Geographical data | Map / Filled map |
| Single KPI + target | Card + Gauge |

## Step 4 — Add Slicers & Interactions
\`\`\`
Insert → Slicer → Drag Date field (get a date range picker)
Insert → Slicer → Drag Region → list slicer for filtering
Format → Edit Interactions → control which visuals filter each other
\`\`\`

## Publishing & Sharing
\`\`\`
1. File → Publish → Power BI Service
2. Service → Create Dashboard → Pin visuals
3. Share → Enter email addresses (needs Pro license for recipients)
4. Schedule Refresh → set daily/hourly data refresh
\`\`\`

💡 **Interview Tip:** Build a portfolio project: connect Power BI to a public dataset (Kaggle sales data), build a 3-page report (Overview, Products, Geography), publish to Power BI Public, and share the link in your resume. This alone gets callbacks.`,
      video_url: 'nn1N0YNx7Uo',
      dur: 35,
    },
  ],

  'Advanced SQL': [
    {
      title: 'SQL Execution Order & EXPLAIN',
      content: `# SQL Execution Order & EXPLAIN

Understanding how the SQL engine executes your query is the difference between writing a query that finishes in 200ms vs one that times out after 30 minutes. Every senior data analyst interview at Flipkart and Amazon tests this.

**Analogy:** You give a chef a recipe (your SQL query). EXPLAIN shows you what the chef actually does — in what order, how many ingredients they process at each step. If they're chopping 10 million onions before discarding 9.9 million, you know to filter earlier.

## Execution Order (Not Writing Order)
\`\`\`
Writing order:  SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
Execution order: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT

Implication: You CANNOT use a SELECT alias in WHERE or GROUP BY — it hasn't been computed yet!
\`\`\`

## EXPLAIN / EXPLAIN QUERY PLAN
\`\`\`sql
-- SQLite / PostgreSQL
EXPLAIN QUERY PLAN
SELECT c.name, SUM(o.amount) AS revenue
FROM flipkart_customers c
JOIN flipkart_orders o ON c.id = o.customer_id
WHERE o.order_date >= '2024-01-01'
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 20;

-- Read output: look for "SCAN TABLE" (bad) vs "SEARCH TABLE USING INDEX" (good)
-- SCAN = full table scan = slow on large tables
-- SEARCH with index = fast lookup
\`\`\`

## Common Query Optimisation Rules
\`\`\`sql
-- ❌ Slow: function on indexed column breaks index usage
WHERE YEAR(order_date) = 2024

-- ✅ Fast: use range instead
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'

-- ❌ Slow: IN with large subquery
WHERE customer_id IN (SELECT id FROM customers WHERE city = 'Mumbai')

-- ✅ Fast: use EXISTS or JOIN instead
WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.city = 'Mumbai')
\`\`\`

💡 **Interview Tip:** "What would you do if your query is slow?" Expected answer: (1) Check EXPLAIN to identify full table scans, (2) verify indexes exist on JOIN keys and WHERE columns, (3) check if aggregation can be pushed down, (4) consider materialising intermediate CTEs. Walking through this systematically shows production SQL experience.`,
      video_url: 'BF2lTLZnCkw',
      dur: 25,
    },
    {
      title: 'Indexing Strategies',
      content: `# Indexing Strategies

Indexes are the single biggest performance lever in SQL. A missing index on a JOIN column can make a 100ms query take 45 seconds. Understanding indexing is essential for senior analytics roles.

**Analogy:** Finding a customer in a 100-million-row table without an index is like finding someone's phone number in a city directory without alphabetical order — you must check every single entry. An index is the alphabetical order.

## How B-Tree Indexes Work
\`\`\`
B-Tree (Balanced Tree) — the default index type:
• Sorted binary tree structure
• O(log n) lookups instead of O(n) full scan
• Supports: =, <, >, BETWEEN, ORDER BY, GROUP BY
• Does NOT help with: LIKE '%pattern' (leading wildcard), functions on column
\`\`\`

## Creating and Analysing Indexes
\`\`\`sql
-- Index on frequently filtered column
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- Composite index — column order matters!
-- Use: (high selectivity first, then join/filter columns)
CREATE INDEX idx_orders_status_date ON orders(status, order_date);
-- Best for: WHERE status = 'DELIVERED' AND order_date >= '2024-01-01'
-- Useless for: WHERE order_date = '2024-01-01'  (skips first column)

-- Partial index — index only a subset of rows
CREATE INDEX idx_pending_orders ON orders(customer_id)
WHERE status = 'PENDING';
-- Smaller index, faster for pending-order queries

-- Check index usage (SQLite)
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 42;
-- Should show: SEARCH TABLE orders USING INDEX idx_orders_customer
\`\`\`

## When NOT to Add an Index
\`\`\`
• Small tables (< 10,000 rows) — full scan is fast, index overhead not worth it
• Columns with very low cardinality (e.g., status with 3 values) — not selective enough
• Tables with heavy INSERT/UPDATE/DELETE — indexes slow down writes
• Columns only used in SELECT, never in WHERE/JOIN/ORDER BY
\`\`\`

## The Covering Index Pattern
\`\`\`sql
-- "Covering index" includes all columns the query needs — no table lookup at all
CREATE INDEX idx_orders_covering
ON orders(customer_id, order_date, amount, status);

-- This query is served entirely from the index:
SELECT order_date, amount, status
FROM orders
WHERE customer_id = 12345
ORDER BY order_date DESC;
\`\`\`

💡 **Interview Tip:** "If you have a slow query and can't add an index, what else can you do?" — (1) Rewrite to filter earlier / reduce rows before JOIN, (2) break into smaller queries and materialise in temp table, (3) add a WHERE clause to partition pruning (Hive/BigQuery), (4) pre-aggregate data into a summary table. This shows you understand trade-offs beyond just "add an index."`,
      video_url: '6bxuu-OQXVw',
      dur: 30,
    },
    {
      title: 'CTEs & Recursive Queries',
      content: `# CTEs & Recursive Queries

CTEs (Common Table Expressions) make complex multi-step queries readable, maintainable, and debuggable. Recursive CTEs solve hierarchical problems — org charts, category trees, referral networks — that regular SQL cannot.

**Analogy:** Swiggy's referral program: User A referred B, B referred C, C referred D. To calculate total referral chain length and reward attribution — you need recursion. No loop structure, no Python — just a recursive CTE.

## CTE Chaining — Multi-Step Analysis
\`\`\`sql
-- Zomato: Identify restaurants at risk of churn
-- (high cancellation rate AND declining revenue)
WITH restaurant_metrics AS (
    SELECT
        restaurant_id,
        COUNT(*)                                    AS total_orders,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancellations,
        SUM(order_value)                            AS total_revenue
    FROM zomato_orders
    WHERE order_date >= DATE('now', '-30 days')
    GROUP BY restaurant_id
),
cancellation_rates AS (
    SELECT *,
           ROUND(cancellations * 100.0 / total_orders, 1) AS cancel_rate
    FROM restaurant_metrics
),
revenue_trend AS (
    SELECT restaurant_id,
           SUM(CASE WHEN order_date >= DATE('now', '-7 days')  THEN order_value END) AS week1_rev,
           SUM(CASE WHEN order_date <  DATE('now', '-7 days')  THEN order_value END) AS prev_rev
    FROM zomato_orders
    WHERE order_date >= DATE('now', '-30 days')
    GROUP BY restaurant_id
)
SELECT cr.restaurant_id, cr.cancel_rate, cr.total_revenue,
       ROUND((rt.week1_rev - rt.prev_rev) / rt.prev_rev * 100, 1) AS revenue_trend_pct
FROM cancellation_rates cr
JOIN revenue_trend rt USING (restaurant_id)
WHERE cr.cancel_rate > 15
  AND rt.week1_rev < rt.prev_rev
ORDER BY cr.cancel_rate DESC;
\`\`\`

## Recursive CTE — Referral Chain
\`\`\`sql
-- PhonePe referral depth analysis
WITH RECURSIVE referral_chain AS (
    -- Base case: first-level referrals (root users)
    SELECT
        referrer_id,
        referred_id,
        1                AS depth,
        CAST(referrer_id AS TEXT) AS chain
    FROM phonepe_referrals
    WHERE referrer_id NOT IN (SELECT referred_id FROM phonepe_referrals)

    UNION ALL

    -- Recursive case: extend chain one level deeper
    SELECT
        r.referrer_id,
        r.referred_id,
        rc.depth + 1,
        rc.chain || ' → ' || CAST(r.referred_id AS TEXT)
    FROM phonepe_referrals r
    JOIN referral_chain rc ON r.referrer_id = rc.referred_id
    WHERE rc.depth < 10  -- prevent infinite loops
)
SELECT referrer_id, MAX(depth) AS max_chain_depth,
       COUNT(DISTINCT referred_id) AS total_referred
FROM referral_chain
GROUP BY referrer_id
ORDER BY total_referred DESC
LIMIT 20;
\`\`\`

💡 **Interview Tip:** "What's the difference between a CTE and a subquery?" — Both create a named result set. But CTEs: (1) can be referenced multiple times in the same query (no repeated computation), (2) support recursion, (3) are more readable for multi-step logic. In PostgreSQL, CTEs are sometimes materialised (computed once and stored) — a trade-off worth mentioning.`,
      video_url: 'BdinyMg4nBY',
      dur: 30,
    },
    {
      title: 'Window Functions Mastery',
      content: `# Window Functions Mastery

Window functions are the most powerful SQL feature for analytics. Every senior data analyst role at Indian product companies tests window functions — and the gap between candidates who know them and those who don't is enormous.

**Analogy:** You need each Flipkart seller's revenue alongside their rank in their category AND the running total for their category. GROUP BY would crush the rows. Window functions maintain row-level detail while adding aggregated context.

## The OVER() Clause Anatomy
\`\`\`sql
function_name() OVER (
    [PARTITION BY column]    -- reset computation per group
    [ORDER BY column]        -- order within partition
    [ROWS/RANGE BETWEEN ...]  -- frame specification
)
\`\`\`

## Ranking Functions
\`\`\`sql
SELECT
    seller_id,
    category,
    revenue,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS row_num,
    RANK()       OVER (PARTITION BY category ORDER BY revenue DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS dense_rank,
    PERCENT_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS pct_rank
FROM flipkart_seller_revenue;
-- ROW_NUMBER: unique — 1,2,3,4 (ties broken arbitrarily)
-- RANK:       gaps after ties — 1,2,2,4 (no 3)
-- DENSE_RANK: no gaps — 1,2,2,3 (most interview-safe)
\`\`\`

## Frames — ROWS BETWEEN
\`\`\`sql
-- 7-day rolling average delivery time
SELECT
    date,
    avg_delivery_time,
    AVG(avg_delivery_time) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg,
    AVG(avg_delivery_time) OVER (
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_avg
FROM daily_delivery_stats;
\`\`\`

## FIRST_VALUE / LAST_VALUE / NTH_VALUE
\`\`\`sql
SELECT
    customer_id,
    order_date,
    order_value,
    FIRST_VALUE(order_value) OVER (
        PARTITION BY customer_id ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS first_order_value,
    LAST_VALUE(order_value) OVER (
        PARTITION BY customer_id ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS latest_order_value
FROM swiggy_orders;
\`\`\`

💡 **Interview Tip:** The classic trap: "List the top 2 orders per customer." Most candidates use ROW_NUMBER. The follow-up: "What if two orders have the same amount — should both appear?" If yes, use DENSE_RANK. If you want exactly 2 rows regardless of ties, use ROW_NUMBER. Always clarify tie-breaking logic — it shows production experience.`,
      video_url: 'o666k19mZwE',
      dur: 35,
    },
    {
      title: 'Cohort & Retention Analysis',
      content: `# Cohort & Retention Analysis

Cohort analysis is one of the most valuable analytical techniques for understanding user behaviour over time. Every growth team at Swiggy, Zepto, and Meesho runs weekly cohort reports — and knowing how to build them is a strong differentiator.

**Analogy:** Zepto launched in Mumbai in Jan 2023 and Delhi in Mar 2023. A cohort analysis tells them: "Of the users who first ordered in Jan, how many are still ordering 30, 60, 90 days later?" Different cohorts reveal whether product-market fit is improving.

## Building a Cohort Retention Table
\`\`\`sql
-- Zepto user retention by signup cohort
WITH cohorts AS (
    -- First order date per user = cohort assignment
    SELECT
        user_id,
        STRFTIME('%Y-%m', MIN(order_date)) AS cohort_month,
        MIN(order_date)                     AS first_order_date
    FROM zepto_orders
    GROUP BY user_id
),
user_activity AS (
    SELECT DISTINCT
        o.user_id,
        c.cohort_month,
        STRFTIME('%Y-%m', o.order_date) AS activity_month,
        -- months since cohort start
        (STRFTIME('%Y', o.order_date) - STRFTIME('%Y', c.first_order_date)) * 12
        + STRFTIME('%m', o.order_date) - STRFTIME('%m', c.first_order_date)
            AS months_since_first
    FROM zepto_orders o
    JOIN cohorts c ON o.user_id = c.user_id
),
cohort_sizes AS (
    SELECT cohort_month, COUNT(DISTINCT user_id) AS cohort_size
    FROM cohorts
    GROUP BY cohort_month
)
SELECT
    ua.cohort_month,
    cs.cohort_size,
    ua.months_since_first       AS period,
    COUNT(DISTINCT ua.user_id)  AS retained_users,
    ROUND(COUNT(DISTINCT ua.user_id) * 100.0 / cs.cohort_size, 1) AS retention_pct
FROM user_activity ua
JOIN cohort_sizes cs ON ua.cohort_month = cs.cohort_month
GROUP BY ua.cohort_month, cs.cohort_size, ua.months_since_first
ORDER BY ua.cohort_month, ua.months_since_first;
\`\`\`

## Day-1 / Day-7 / Day-30 Retention
\`\`\`sql
-- Simplified: retention at specific day milestones
WITH first_orders AS (
    SELECT user_id, MIN(order_date) AS d0 FROM swiggy_orders GROUP BY user_id
)
SELECT
    STRFTIME('%Y-%m', d0) AS cohort,
    COUNT(DISTINCT f.user_id)      AS d0_users,
    COUNT(DISTINCT CASE WHEN JULIANDAY(o.order_date) - JULIANDAY(f.d0) BETWEEN 1  AND 1  THEN f.user_id END) AS d1_retained,
    COUNT(DISTINCT CASE WHEN JULIANDAY(o.order_date) - JULIANDAY(f.d0) BETWEEN 6  AND 8  THEN f.user_id END) AS d7_retained,
    COUNT(DISTINCT CASE WHEN JULIANDAY(o.order_date) - JULIANDAY(f.d0) BETWEEN 29 AND 31 THEN f.user_id END) AS d30_retained
FROM first_orders f
LEFT JOIN swiggy_orders o ON f.user_id = o.user_id
GROUP BY STRFTIME('%Y-%m', d0)
ORDER BY cohort;
\`\`\`

💡 **Interview Tip:** When presenting cohort results, always highlight: (1) the best and worst cohorts and hypothesise why, (2) whether retention is improving over time (product getting better?), (3) the "smile curve" — if Day-7 retention dips but Day-30 is high, you have a re-engagement opportunity. This storytelling layer is what separates good analysts from great ones.`,
      video_url: 'LXqpx9mr0Is',
      dur: 35,
    },
    {
      title: 'Pivot Patterns in SQL',
      content: `# Pivot Patterns in SQL

Pivoting transforms rows into columns — turning a long-format analytics table into a wide business report. SQL doesn't have a built-in PIVOT in most databases, but you can replicate it with CASE WHEN.

**Analogy:** Finance sends you daily revenue by payment method in long format (100 rows). The CFO wants it in wide format: one row per day, one column per payment method. That's a pivot.

## CASE WHEN Pivot (Universal Pattern)
\`\`\`sql
-- PhonePe: Daily revenue by payment method (long → wide)
SELECT
    DATE(txn_date)                                              AS date,
    SUM(CASE WHEN method = 'UPI'         THEN amount ELSE 0 END) AS upi_revenue,
    SUM(CASE WHEN method = 'NEFT'        THEN amount ELSE 0 END) AS neft_revenue,
    SUM(CASE WHEN method = 'IMPS'        THEN amount ELSE 0 END) AS imps_revenue,
    SUM(CASE WHEN method = 'CREDIT_CARD' THEN amount ELSE 0 END) AS cc_revenue,
    SUM(CASE WHEN method = 'WALLET'      THEN amount ELSE 0 END) AS wallet_revenue,
    SUM(amount)                                                 AS total_revenue
FROM phonepe_transactions
WHERE status = 'SUCCESS'
GROUP BY DATE(txn_date)
ORDER BY date;
\`\`\`

## Count Pivot — Orders by Status per City
\`\`\`sql
SELECT
    city,
    COUNT(CASE WHEN status = 'DELIVERED'  THEN 1 END) AS delivered,
    COUNT(CASE WHEN status = 'CANCELLED'  THEN 1 END) AS cancelled,
    COUNT(CASE WHEN status = 'PENDING'    THEN 1 END) AS pending,
    COUNT(CASE WHEN status = 'RETURNED'   THEN 1 END) AS returned,
    COUNT(*)                                           AS total
FROM flipkart_orders
WHERE order_date >= DATE('now', '-30 days')
GROUP BY city
ORDER BY total DESC;
\`\`\`

## Percentage Pivot
\`\`\`sql
SELECT
    city,
    ROUND(COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) * 100.0 / COUNT(*), 1) AS delivery_rate,
    ROUND(COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) * 100.0 / COUNT(*), 1) AS cancel_rate,
    ROUND(COUNT(CASE WHEN status = 'RETURNED'  THEN 1 END) * 100.0 / COUNT(*), 1) AS return_rate
FROM flipkart_orders
GROUP BY city
HAVING COUNT(*) > 500
ORDER BY cancel_rate DESC;
\`\`\`

💡 **Interview Tip:** PostgreSQL has a native CROSSTAB function (from tablefunc extension). MySQL 8+ supports CASE WHEN pivot only. BigQuery supports PIVOT natively. Always clarify the database before writing pivot SQL in an interview — shows platform awareness.`,
      video_url: 'mcyek--CiII',
      dur: 20,
    },
    {
      title: 'Top 10 SQL Interview Patterns',
      content: `# Top 10 SQL Interview Patterns

These are the patterns that appear repeatedly across Flipkart, Amazon, Zomato, PhonePe, and Google interviews. Master these 10 and you can solve 90% of SQL interview questions.

## Pattern 1 — Deduplicate (Keep Latest Record)
\`\`\`sql
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) AS rn
    FROM user_profiles
) WHERE rn = 1;
\`\`\`

## Pattern 2 — Nth Highest Value
\`\`\`sql
-- 2nd highest order value per customer
SELECT * FROM (
    SELECT *, DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS dr
    FROM orders
) WHERE dr = 2;
\`\`\`

## Pattern 3 — Running Total / Cumulative
\`\`\`sql
SELECT date, revenue,
    SUM(revenue) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS cumulative_revenue
FROM daily_sales;
\`\`\`

## Pattern 4 — Period-over-Period (WoW, MoM)
\`\`\`sql
SELECT month, revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_month,
    ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0
          / LAG(revenue) OVER (ORDER BY month), 1) AS mom_growth_pct
FROM monthly_revenue;
\`\`\`

## Pattern 5 — Users Active in Period A but NOT Period B (Churn)
\`\`\`sql
SELECT DISTINCT user_id FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'
EXCEPT
SELECT DISTINCT user_id FROM orders WHERE order_date BETWEEN '2024-02-01' AND '2024-02-28';
\`\`\`

## Pattern 6 — Consecutive Days Active (Streak)
\`\`\`sql
WITH daily AS (SELECT user_id, DATE(login_time) AS d FROM logins GROUP BY 1,2),
     grouped AS (SELECT *, DATE(d, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d) || ' days') AS grp FROM daily)
SELECT user_id, grp, COUNT(*) AS streak_days FROM grouped GROUP BY 1,2 HAVING COUNT(*) >= 7;
\`\`\`

## Pattern 7 — First Purchase per User (New vs Returning)
\`\`\`sql
SELECT o.*, CASE WHEN o.order_date = f.first_date THEN 'New' ELSE 'Returning' END AS customer_type
FROM orders o
JOIN (SELECT user_id, MIN(order_date) AS first_date FROM orders GROUP BY user_id) f ON o.user_id = f.user_id;
\`\`\`

## Pattern 8 — Top N per Group
\`\`\`sql
SELECT * FROM (
    SELECT *, RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
    FROM product_revenue
) WHERE rnk <= 3;
\`\`\`

## Pattern 9 — Gap and Islands (Identify Downtime Windows)
\`\`\`sql
WITH events AS (SELECT timestamp, status,
    LAG(status) OVER (ORDER BY timestamp) AS prev_status FROM server_events)
SELECT * FROM events WHERE status = 'DOWN' AND (prev_status = 'UP' OR prev_status IS NULL);
\`\`\`

## Pattern 10 — Funnel Analysis
\`\`\`sql
SELECT
    COUNT(DISTINCT CASE WHEN event = 'page_view'    THEN user_id END) AS step1_views,
    COUNT(DISTINCT CASE WHEN event = 'add_to_cart'  THEN user_id END) AS step2_cart,
    COUNT(DISTINCT CASE WHEN event = 'checkout'     THEN user_id END) AS step3_checkout,
    COUNT(DISTINCT CASE WHEN event = 'purchase'     THEN user_id END) AS step4_purchase
FROM user_events
WHERE event_date = CURRENT_DATE;
\`\`\`

💡 **Interview Tip:** For each pattern, be able to state: (1) when you'd use it, (2) a real business example, (3) edge cases (ties, NULLs, empty groups). Practise these with Zomato/Flipkart data schemas until you can write them from memory in under 3 minutes. That's interview-ready.`,
      video_url: 'NWV-KgweMKU',
      dur: 30,
    },
  ],

  'Excel & Google Sheets': [
    {
      title: 'Excel Power Shortcuts & Tables',
      content: `# Excel Power Shortcuts & Tables

Excel is still used daily at 90% of Indian companies — from startups to banks. Being a power user means getting to the answer 5x faster than average users, which is immediately visible in interviews and on the job.

**Analogy:** A Nykaa analyst gets a dump of 50,000 transaction rows from finance every Monday morning. A beginner spends 2 hours cleaning and pivoting it. An Excel power user spends 20 minutes using Tables, named ranges, and keyboard shortcuts.

## Essential Keyboard Shortcuts
\`\`\`
Navigation:
  Ctrl + End        → Jump to last used cell
  Ctrl + Home       → Jump to A1
  Ctrl + Arrow      → Jump to last/first filled cell in row/column
  Ctrl + Shift + End → Select to last used cell

Selection & Editing:
  Ctrl + Shift + L  → Toggle AutoFilter
  Ctrl + T          → Create Table from selection
  Alt + =           → AutoSum selected cells
  Ctrl + D          → Fill Down
  Ctrl + R          → Fill Right
  F4                → Repeat last action (also: toggle absolute/relative reference)
  Ctrl + 1          → Format Cells dialog

Data Tools:
  Alt + D + S       → Sort dialog
  Alt + D + F + F   → Advanced Filter
  Alt + N + V + T   → Create PivotTable
\`\`\`

## Excel Tables (Ctrl + T) — The Game Changer
\`\`\`
Why Tables > plain ranges:
✓ Auto-expand when you add rows — formulas update automatically
✓ Structured references: =Table1[Revenue] instead of =$D:$D
✓ Built-in row banding and filter dropdowns
✓ Named range auto-generated — use in VLOOKUP/XLOOKUP

Creating a Table:
1. Click anywhere in your data range
2. Ctrl + T → confirm range → OK
3. Rename in Table Design tab (e.g., "Orders")
4. Now reference as: =SUMIF(Orders[City], "Mumbai", Orders[Revenue])
\`\`\`

## Conditional Formatting for Data Quality
\`\`\`
Home → Conditional Formatting → New Rule

Highlight blanks:    Format only cells that contain → Blanks → Red fill
Highlight outliers:  Use formula → =B2>AVERAGE($B$2:$B$1000)+3*STDEV($B$2:$B$1000)
Data bars:           Whole column → Data Bars → shows relative magnitude visually
Top/Bottom rules:    Top 10% → green; Bottom 10% → red (instant heatmap)
\`\`\`

💡 **Interview Tip:** In Excel skill tests (common at HDFC, TCS, consulting firms), demonstrating keyboard shortcuts signals proficiency faster than any verbal claim. Also: always convert raw data to a Table before any analysis — it prevents the #SPILL! errors and broken formula references that trip up inexperienced users.`,
      video_url: 'YzLdMeFLLhw',
      dur: 20,
    },
    {
      title: 'XLOOKUP & INDEX-MATCH',
      content: `# XLOOKUP & INDEX-MATCH

Lookups are the bread-and-butter of Excel analysis. XLOOKUP replaced VLOOKUP in 2019 and is now the standard. INDEX-MATCH remains important for older files and complex two-way lookups.

**Analogy:** You have a product catalogue sheet and a sales sheet. To bring product name and category into the sales sheet based on product_id — that's a lookup. Flipkart's analyst does 50 of these a day.

## XLOOKUP — The Modern Standard
\`\`\`excel
=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])

-- Basic: find price for product ID in A2
=XLOOKUP(A2, Products[ProductID], Products[Price], "Not found")

-- Lookup to the LEFT (impossible with VLOOKUP)
=XLOOKUP(A2, Products[ProductID], Products[SKU])

-- Return multiple columns at once
=XLOOKUP(A2, Products[ProductID], Products[[Name]:[Category]:[Price]])

-- Approximate match (price tiers)
=XLOOKUP(B2, TierTable[Min], TierTable[Discount], , 1)  -- match_mode=1: next larger
\`\`\`

## INDEX-MATCH — The Power Pattern
\`\`\`excel
=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))

-- Equivalent to XLOOKUP above
=INDEX(Products[Price], MATCH(A2, Products[ProductID], 0))

-- Two-way lookup: find value at intersection of row + column
=INDEX(PivotData,
    MATCH(RowHeader, RowRange, 0),
    MATCH(ColHeader, ColRange, 0))
-- Example: find revenue for "Electronics" in "Bangalore"
=INDEX(B2:E10, MATCH("Electronics", A2:A10, 0), MATCH("Bangalore", B1:E1, 0))
\`\`\`

## XLOOKUP vs VLOOKUP vs INDEX-MATCH
\`\`\`
Feature              VLOOKUP    INDEX-MATCH    XLOOKUP
Left column lookup   No         Yes            Yes
Multiple returns     No         No             Yes (array)
Column insert safe   No         Yes            Yes
Error handling       IFERROR    IFERROR        Built-in
Speed (large data)   Slow       Fast           Fast
Available in         All Excel  All Excel      Excel 365/2019+
\`\`\`

💡 **Interview Tip:** Interviewers at banks and IT firms often test: "VLOOKUP returned the wrong value — why?" Classic answer: VLOOKUP uses approximate match by default (4th argument = TRUE or omitted). Always use FALSE/0 for exact match. Better answer: switch to XLOOKUP which defaults to exact match and has better error handling.`,
      video_url: 'xnLvEhXWSas',
      dur: 25,
    },
    {
      title: 'Dynamic Arrays: FILTER, SORT, UNIQUE',
      content: `# Dynamic Arrays: FILTER, SORT, UNIQUE

Dynamic array functions (Excel 365+) fundamentally change how you work with data. They return arrays that automatically spill into adjacent cells — no Ctrl+Shift+Enter, no formulas in every row.

**Analogy:** Old Excel: write a formula, copy it down 500 rows, hope you didn't miss any. New Excel: write one formula in one cell, it spills to exactly as many rows as needed — even as data grows.

## FILTER — Extract Rows by Condition
\`\`\`excel
-- Extract all Bangalore orders above ₹5000
=FILTER(OrdersTable, (OrdersTable[City]="Bangalore") * (OrdersTable[Amount]>5000))

-- Multiple OR conditions (+ means OR)
=FILTER(A2:D100, (B2:B100="Mumbai") + (B2:B100="Delhi"))

-- With fallback if no matches
=FILTER(A2:D100, C2:C100="CANCELLED", "No cancelled orders")

-- Combine FILTER + SUM for conditional aggregation
=SUM(FILTER(D2:D100, B2:B100="Electronics"))  -- sum of Electronics column only
\`\`\`

## SORT & SORTBY — Dynamic Sorted Views
\`\`\`excel
-- Sort by revenue descending
=SORT(RevenueTable, 3, -1)    -- sort by 3rd column, descending (-1)

-- Sort by multiple columns
=SORTBY(A2:D100, C2:C100, -1, B2:B100, 1)  -- sort by C desc, then B asc

-- Top 10 by revenue (SORT + TAKE)
=TAKE(SORT(OrdersTable, 4, -1), 10)   -- take first 10 rows after sorting
\`\`\`

## UNIQUE — Deduplicated Lists
\`\`\`excel
-- Unique cities from column B
=UNIQUE(B2:B1000)

-- Unique combinations (multi-column)
=UNIQUE(B2:C1000)   -- unique city + category pairs

-- Count unique values without helper column
=ROWS(UNIQUE(B2:B1000))

-- Dynamic dropdown source (used in Data Validation)
Named range → refers to =UNIQUE(Orders[City])
Data Validation → List → Source: =UNIQUE(Orders[City])
\`\`\`

## Combining Functions
\`\`\`excel
-- Top 5 products by revenue in Electronics category
=TAKE(SORTBY(
    FILTER(Products, Products[Category]="Electronics"),
    FILTER(Revenue[Amount], Products[Category]="Electronics"),
    -1
), 5)
\`\`\`

💡 **Interview Tip:** FILTER+SORT+UNIQUE replace 80% of the use cases for helper columns + VLOOKUP + copy-paste workflows. In a live Excel test, using these functions while explaining "this dynamically updates when the data changes" immediately signals modern Excel proficiency.`,
      video_url: 'D0YByKakcSw',
      dur: 20,
    },
    {
      title: 'PivotTables End to End',
      content: `# PivotTables End to End

PivotTables are the fastest way to summarise large datasets in Excel. Every analyst in India — from a fresher at a startup to a VP at Goldman Sachs — uses PivotTables daily. Get very comfortable with every feature.

**Analogy:** You receive 200,000 rows of Paytm transaction data. The CFO wants revenue by city, by month, by payment method — with drill-down capability. Building this in formulas takes 4 hours. A PivotTable takes 4 minutes.

## Creating a PivotTable
\`\`\`
1. Click inside your data → Ctrl + T → make it a Table (call it "Transactions")
2. Insert → PivotTable → From Table → New Worksheet
3. Drag fields:
   Rows:    City
   Columns: Payment Method
   Values:  Amount (Sum)
   Filters: Date (add a Date filter or Timeline slicer)
\`\`\`

## Value Field Settings — Beyond Sum
\`\`\`
Right-click any value → Value Field Settings:
  Sum       → Total revenue
  Count     → Number of transactions
  Average   → Average transaction value
  Max/Min   → Largest/smallest transaction

Show Values As:
  % of Grand Total    → share of total revenue
  % of Column Total   → share within each payment method
  Difference From     → variance vs baseline period
  Running Total In    → cumulative revenue over time
\`\`\`

## Calculated Fields
\`\`\`
PivotTable Analyze → Fields, Items & Sets → Calculated Field
Name: Avg Transaction
Formula: = Amount / Count

Name: Failure Rate
Formula: = Failed_Count / Total_Count
\`\`\`

## Slicers & Timelines (Interactive Filters)
\`\`\`
PivotTable Analyze → Insert Slicer → select: City, Category, Status
PivotTable Analyze → Insert Timeline → select: Order Date

Connect one slicer to multiple PivotTables:
Right-click slicer → Report Connections → check all connected PivotTables
→ One click on slicer updates all charts on the dashboard
\`\`\`

## GetPivotData — Reference Specific Cells
\`\`\`excel
=GETPIVOTDATA("Amount", $A$3, "City", "Mumbai", "Method", "UPI")
-- Returns: Mumbai UPI revenue dynamically (updates when PivotTable refreshes)
\`\`\`

💡 **Interview Tip:** When asked "how would you build this report in Excel?" always say: "I'd start with a Table, then a PivotTable with slicers, then connect charts to the PivotTable." This shows you build for maintainability — not one-off formatting. Analysts who hardcode values vs those who use dynamic PivotTables are evaluated very differently at FMCG and banking interviews.`,
      video_url: 'PdJzy956wo4',
      dur: 30,
    },
    {
      title: 'Excel Dashboard in 30 Minutes',
      content: `# Excel Dashboard in 30 Minutes

Building a polished Excel dashboard is a skill that directly translates to interview success and daily job performance. Many companies include a live Excel task in their analytics interview process.

**Analogy:** You're an analyst at Myntra. The Head of Category wants a single-page Excel dashboard showing GMV by category, MoM trend, and top 10 brands — updating every week when new data drops. This is exactly what this lesson builds.

## Step 1 — Prepare Data (5 min)
\`\`\`
1. Paste raw data → Ctrl + T → Table named "Sales"
2. Add helper columns:
   =MONTH([@OrderDate])     → Month Number
   =TEXT([@OrderDate],"mmm yyyy")  → Month Label
   =YEAR([@OrderDate])      → Year
3. Create a separate "Summary" sheet
\`\`\`

## Step 2 — Build PivotTables (10 min)
\`\`\`
PivotTable 1 — Monthly Revenue Trend:
  Rows: Month Label
  Values: Sum of Amount
  → Copy and Paste Special (Values) to freeze for charting

PivotTable 2 — Revenue by Category:
  Rows: Category
  Values: Sum of Amount, Count of Orders, Avg Amount
  Show Values As: % of Grand Total

PivotTable 3 — Top 10 Brands:
  Rows: Brand → Filter top 10 by revenue
  Values: Sum of Amount
\`\`\`

## Step 3 — Create Charts (10 min)
\`\`\`
Chart 1 — Line chart from PivotTable 1 (monthly trend)
  Insert → Line chart → Format: remove gridlines, add data labels for latest point

Chart 2 — Horizontal bar chart from PivotTable 3 (top brands)
  Sort descending → add data labels → clean up legend

KPI Cards — Use text boxes with large font:
  =TEXT(SUM(Sales[Amount])/10000000, "₹##.0") & " Cr"
  =TEXT(COUNTA(UNIQUE(Sales[CustomerID])), "#,##0") & " Customers"
\`\`\`

## Step 4 — Add Slicers + Polish (5 min)
\`\`\`
Insert Slicer: Category, City, Month
Connect slicers to all 3 PivotTables (Report Connections)
Format slicer: Slicer tab → choose colour matching your brand palette
Final polish:
  → Hide gridlines (View → Gridlines off)
  → Hide row/column headers (View → Headings off)
  → Lock the sheet (Review → Protect Sheet)
\`\`\`

💡 **Interview Tip:** In a live dashboard task, always start by asking: "Should this auto-update when new data is added?" If yes, use Power Query to connect to the source — it's one click to refresh. This single question signals production-ready thinking versus one-time analysis.`,
      video_url: 'oVtf4eQZ9mo',
      dur: 30,
    },
    {
      title: 'Google Sheets & Apps Script',
      content: `# Google Sheets & Apps Script

Google Sheets is the go-to collaboration tool for startups and remote teams across India. Its unique functions — IMPORTRANGE, QUERY, ARRAYFORMULA — are powerful features unavailable in Excel. Apps Script adds automation that rivals Python scripts.

**Analogy:** A Razorpay analyst maintains a real-time dashboard that pulls data from 5 different Google Sheets (owned by different teams), cleans it, and auto-emails a summary to leadership every Monday at 9 AM — entirely in Google Sheets + Apps Script.

## Google Sheets Exclusive Functions
\`\`\`
IMPORTRANGE — Pull data from another spreadsheet
=IMPORTRANGE("spreadsheet_url", "Sheet1!A1:F5000")
→ First use: must click "Allow access"
→ Updates every ~1 hour automatically

QUERY — SQL-like queries on sheet data
=QUERY(A:F, "SELECT A, B, SUM(F) WHERE C='Bangalore' GROUP BY A, B ORDER BY SUM(F) DESC LABEL SUM(F) 'Revenue'")

ARRAYFORMULA — Apply a formula to an entire column at once
=ARRAYFORMULA(IF(B2:B="","", B2:B * C2:C))
→ Single formula in one cell, no copy-paste needed

GOOGLEFINANCE — Live financial data
=GOOGLEFINANCE("NSE:INFY", "price")         -- live Infosys stock price
=GOOGLEFINANCE("CURRENCY:USDINR")           -- USD to INR exchange rate
\`\`\`

## Apps Script — Automation
\`\`\`javascript
// Auto-email weekly summary every Monday
function weeklyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Summary');
  const data = sheet.getRange('A1:D10').getValues();

  // Build HTML email
  let html = '<h2>Weekly Analytics Report</h2><table border="1">';
  data.forEach(row => {
    html += '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>';
  });
  html += '</table>';

  MailApp.sendEmail({
    to: 'team@company.com',
    subject: 'Weekly Report - ' + new Date().toDateString(),
    htmlBody: html
  });
}

// Trigger: Triggers → Time-driven → Weekly → Monday → 8–9 AM
\`\`\`

## Apps Script — Auto-Format New Rows
\`\`\`javascript
// Trigger: onEdit — auto-highlight rows where Amount > 10000
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const row = e.range.getRow();
  const amountCol = 4; // column D

  if (sheet.getRange(row, amountCol).getValue() > 10000) {
    sheet.getRange(row, 1, 1, sheet.getLastColumn())
         .setBackground('#FFEB3B'); // Yellow highlight
  }
}
\`\`\`

💡 **Interview Tip:** For startup analytics roles, mention that you use IMPORTRANGE + QUERY as a lightweight "ETL pipeline" — pulling raw data from ops sheets, transforming it, and displaying it on a management dashboard. This shows you can build practical data infrastructure without needing an engineering team.`,
      video_url: 'Nd3DV_heK2Q',
      dur: 25,
    },
  ],
};

async function seedLessonsV2(db) {
  const { all: dbAll, run: dbRun } = require('./database');
  const { v4: uuidv4 } = require('uuid');

  console.log('🌱 Running seedLessonsV2...');

  const courses = await dbAll(db, 'SELECT id, title FROM courses');

  if (!courses || courses.length === 0) {
    console.log('⚠️  No courses found — run seed() first.');
    return;
  }

  for (const course of courses) {
    const lessonDefs = LESSONS_V2[course.title];

    if (!lessonDefs || lessonDefs.length === 0) {
      // No V2 content defined for this course — skip
      continue;
    }

    let upsertCount = 0;
    let insertCount = 0;

    for (let idx = 0; idx < lessonDefs.length; idx++) {
      const def = lessonDefs[idx];
      // Check if a lesson with this title already exists for this course
      const existing = await dbAll(
        db,
        'SELECT id FROM lessons WHERE course_id = ? AND title = ?',
        [course.id, def.title]
      );

      if (existing && existing.length > 0) {
        // UPDATE existing lesson
        await dbRun(
          db,
          `UPDATE lessons
             SET content          = ?,
                 video_url        = ?,
                 duration_minutes = ?,
                 order_index      = ?
           WHERE course_id = ?
             AND title     = ?`,
          [def.content, def.video_url, def.dur, idx, course.id, def.title]
        );
        upsertCount++;
      } else {
        // INSERT new lesson
        await dbRun(
          db,
          `INSERT INTO lessons
             (id, course_id, title, content, video_url, order_index, duration_minutes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), course.id, def.title, def.content, def.video_url, idx, def.dur]
        );
        insertCount++;
      }
    }

    // Update total_lessons count on the course to reflect the V2 lesson set
    const totalLessonsRows = await dbAll(
      db,
      'SELECT COUNT(*) AS cnt FROM lessons WHERE course_id = ?',
      [course.id]
    );
    const totalLessons = totalLessonsRows[0]?.cnt || lessonDefs.length;

    await dbRun(
      db,
      'UPDATE courses SET total_lessons = ? WHERE id = ?',
      [totalLessons, course.id]
    );

    console.log(
      `  ✅ "${course.title}": ${insertCount} inserted, ${upsertCount} updated (total_lessons = ${totalLessons})`
    );
  }

  console.log('✅ seedLessonsV2 complete!');
}

module.exports = { seedLessonsV2, LESSONS_V2 };
