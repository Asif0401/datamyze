const { v4: uuidv4 } = require('uuid');
const { all, run } = require('./database');

/* ─────────────────────────────────────────────────────────────────────────
   95 additional problems covering SQL (50) + Python/Pandas (45)
   Designed for data analyst interview prep – Indian company context.
────────────────────────────────────────────────────────────────────────── */

const EXTRA_PROBLEMS = [

  // ════════════════════════════════════════════════════════
  //  SQL — BASIC SELECT (Easy)
  // ════════════════════════════════════════════════════════
  {
    title: 'Select All Active Customers',
    description: `Return all columns for customers whose email ends with '@gmail.com'.\n\nSchema:\n  customers(id, name, email, city)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT *\nFROM customers\nWHERE email LIKE '%@gmail.com';",
    acceptance_rate: 92, xp_reward: 30,
  },
  {
    title: 'Count Orders Per Status',
    description: `Count how many orders exist for each status. Return status and count, ordered by count descending.\n\nSchema:\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT status, COUNT(*) AS order_count\nFROM orders\nGROUP BY status\nORDER BY order_count DESC;",
    acceptance_rate: 90, xp_reward: 30,
  },
  {
    title: 'Second Highest Salary',
    description: `Find the second highest salary from the employees table. Return a single value aliased as 'second_highest'.\n\nSchema:\n  employees(id, name, department, salary, hire_date, city)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);",
    acceptance_rate: 82, xp_reward: 50,
  },
  {
    title: 'Employees Without a Manager',
    description: `Return all employees whose manager_id is NULL (i.e., top-level managers).\n\nSchema:\n  employees(id, name, department, salary, manager_id, hire_date, city)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT id, name, department, salary\nFROM employees\nWHERE manager_id IS NULL;",
    acceptance_rate: 88, xp_reward: 30,
  },
  {
    title: 'Top 3 Products by Revenue',
    description: `Find the top 3 products by total revenue (quantity × unit_price).\n\nSchema:\n  products(id, name, category, price)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT p.name,\n  SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nGROUP BY p.id, p.name\nORDER BY total_revenue DESC\nLIMIT 3;",
    acceptance_rate: 80, xp_reward: 50,
  },
  {
    title: 'Average Order Value by City',
    description: `Calculate the average order amount per city. Return city, avg_order_value rounded to 2 decimal places.\n\nSchema:\n  customers(id, name, email, city)\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT c.city,\n  ROUND(AVG(o.amount), 2) AS avg_order_value\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.city\nORDER BY avg_order_value DESC;",
    acceptance_rate: 85, xp_reward: 50,
  },
  {
    title: 'Products Low in Stock',
    description: `Return all products where stock is below 20. Show name, category, price, and stock.\n\nSchema:\n  products(id, name, category, price, stock)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT name, category, price, stock\nFROM products\nWHERE stock < 20\nORDER BY stock ASC;",
    acceptance_rate: 93, xp_reward: 30,
  },
  {
    title: 'Customers with No Orders',
    description: `Find all customers who have never placed an order using a LEFT JOIN.\n\nSchema:\n  customers(id, name, email, city)\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT c.id, c.name, c.email\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.id IS NULL;",
    acceptance_rate: 77, xp_reward: 50,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — AGGREGATIONS & GROUP BY (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Department Headcount & Avg Salary',
    description: `For each department, return the number of employees and average salary. Only include departments with 2 or more employees.\n\nSchema:\n  employees(id, name, department, salary, manager_id, hire_date, city)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT department,\n  COUNT(*) AS headcount,\n  ROUND(AVG(salary), 0) AS avg_salary\nFROM employees\nGROUP BY department\nHAVING COUNT(*) >= 2\nORDER BY headcount DESC;",
    acceptance_rate: 81, xp_reward: 50,
  },
  {
    title: 'Revenue by Product Category',
    description: `Calculate total revenue and number of orders for each product category.\n\nSchema:\n  products(id, name, category, price)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT p.category,\n  COUNT(DISTINCT oi.order_id) AS order_count,\n  SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY total_revenue DESC;",
    acceptance_rate: 83, xp_reward: 50,
  },
  {
    title: 'Monthly Revenue Trend',
    description: `Show total revenue per month (formatted as YYYY-MM). Order by month ascending.\n\nSchema:\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT strftime('%Y-%m', order_date) AS month,\n  SUM(amount) AS total_revenue\nFROM orders\nGROUP BY month\nORDER BY month ASC;",
    acceptance_rate: 87, xp_reward: 50,
  },
  {
    title: 'Top Spending Customer Per City',
    description: `For each city, find the customer who has spent the most in total.\n\nSchema:\n  customers(id, name, email, city)\n  orders(id, customer_id, amount, status)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "WITH ranked AS (\n  SELECT c.city, c.name,\n    SUM(o.amount) AS total_spent,\n    RANK() OVER (PARTITION BY c.city ORDER BY SUM(o.amount) DESC) AS rnk\n  FROM customers c\n  JOIN orders o ON c.id = o.customer_id\n  GROUP BY c.city, c.name\n)\nSELECT city, name, total_spent\nFROM ranked\nWHERE rnk = 1;",
    acceptance_rate: 52, xp_reward: 100,
  },
  {
    title: 'Percentage of Total Sales',
    description: `For each product category, calculate its revenue as a % of total revenue. Round to 2 decimal places.\n\nSchema:\n  products(id, name, category, price)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "WITH cat_rev AS (\n  SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM products p\n  JOIN order_items oi ON p.id = oi.product_id\n  GROUP BY p.category\n)\nSELECT category, revenue,\n  ROUND(revenue * 100.0 / SUM(revenue) OVER (), 2) AS pct_of_total\nFROM cat_rev\nORDER BY revenue DESC;",
    acceptance_rate: 48, xp_reward: 100,
  },
  {
    title: 'High Value Orders Count',
    description: `Count the number of orders above the average order amount. Return a single row with column 'high_value_count'.\n\nSchema:\n  orders(id, customer_id, amount, status)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT COUNT(*) AS high_value_count\nFROM orders\nWHERE amount > (SELECT AVG(amount) FROM orders);",
    acceptance_rate: 89, xp_reward: 50,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — JOINs (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Customer Order Summary',
    description: `For each customer, return their name, email, total orders, and total amount spent. Include customers with 0 orders.\n\nSchema:\n  customers(id, name, email, city)\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT c.name, c.email,\n  COUNT(o.id) AS total_orders,\n  COALESCE(SUM(o.amount), 0) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.email\nORDER BY total_spent DESC;",
    acceptance_rate: 79, xp_reward: 50,
  },
  {
    title: 'Order Items With Product Details',
    description: `Return order_id, product name, category, quantity, unit_price, and line_total (quantity × unit_price) for all order items.\n\nSchema:\n  products(id, name, category, price)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT oi.order_id,\n  p.name AS product_name,\n  p.category,\n  oi.quantity,\n  oi.unit_price,\n  oi.quantity * oi.unit_price AS line_total\nFROM order_items oi\nJOIN products p ON oi.product_id = p.id\nORDER BY oi.order_id;",
    acceptance_rate: 87, xp_reward: 50,
  },
  {
    title: 'Employees and Their Managers',
    description: `Return each employee's name with their manager's name. Employees without managers should show 'No Manager'.\n\nSchema:\n  employees(id, name, department, salary, manager_id, hire_date, city)\n  (self-join: manager is also an employee)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT e.name AS employee,\n  COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id\nORDER BY e.name;",
    acceptance_rate: 65, xp_reward: 100,
  },
  {
    title: 'Products Never Ordered',
    description: `Find all products that have never appeared in any order_items row.\n\nSchema:\n  products(id, name, category, price, stock)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT p.id, p.name, p.category\nFROM products p\nLEFT JOIN order_items oi ON p.id = oi.product_id\nWHERE oi.id IS NULL;",
    acceptance_rate: 72, xp_reward: 100,
  },
  {
    title: 'Orders With Full Details',
    description: `Join orders with customers and compute each order's line items total. Return order_id, customer name, city, order_date, and total_amount.\n\nSchema:\n  customers(id, name, city)\n  orders(id, customer_id, amount, status, order_date)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT o.id AS order_id,\n  c.name AS customer_name,\n  c.city,\n  o.order_date,\n  SUM(oi.quantity * oi.unit_price) AS total_amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN order_items oi ON o.id = oi.order_id\nGROUP BY o.id, c.name, c.city, o.order_date\nORDER BY o.order_date DESC;",
    acceptance_rate: 57, xp_reward: 100,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — WINDOW FUNCTIONS (Medium/Hard)
  // ════════════════════════════════════════════════════════
  {
    title: 'Rank Customers by Spending',
    description: `Rank all customers by their total spend using DENSE_RANK. Return name, total_spent, and spend_rank.\n\nSchema:\n  customers(id, name, email, city)\n  orders(id, customer_id, amount, status)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT c.name,\n  SUM(o.amount) AS total_spent,\n  DENSE_RANK() OVER (ORDER BY SUM(o.amount) DESC) AS spend_rank\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY spend_rank;",
    acceptance_rate: 60, xp_reward: 100,
  },
  {
    title: 'Running Total of Sales',
    description: `Calculate a cumulative running total of revenue ordered by date.\n\nSchema:\n  daily_sales(date, revenue)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT date, revenue,\n  SUM(revenue) OVER (\n    ORDER BY date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM daily_sales\nORDER BY date;",
    acceptance_rate: 63, xp_reward: 100,
  },
  {
    title: 'Previous Day Revenue Comparison',
    description: `For each day, show the revenue, previous day's revenue (prev_revenue), and the difference.\n\nSchema:\n  daily_sales(date, revenue)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT date, revenue,\n  LAG(revenue, 1) OVER (ORDER BY date) AS prev_revenue,\n  revenue - LAG(revenue, 1) OVER (ORDER BY date) AS diff\nFROM daily_sales\nORDER BY date;",
    acceptance_rate: 67, xp_reward: 100,
  },
  {
    title: 'Top 2 Salaries Per Department',
    description: `Return the top 2 highest-paid employees per department.\n\nSchema:\n  employees(id, name, department, salary, hire_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "WITH ranked AS (\n  SELECT name, department, salary,\n    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn\n  FROM employees\n)\nSELECT name, department, salary\nFROM ranked\nWHERE rn <= 2\nORDER BY department, salary DESC;",
    acceptance_rate: 55, xp_reward: 100,
  },
  {
    title: 'Percentile Rank of Revenue Days',
    description: `Assign a percentile rank to each day's revenue (0 to 1). Return date, revenue, and pct_rank rounded to 2 decimals.\n\nSchema:\n  daily_sales(date, revenue)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "SELECT date, revenue,\n  ROUND(PERCENT_RANK() OVER (ORDER BY revenue), 2) AS pct_rank\nFROM daily_sales\nORDER BY revenue DESC;",
    acceptance_rate: 38, xp_reward: 150,
  },
  {
    title: 'First and Last Order Date Per Customer',
    description: `Using window functions, return each customer's name, first_order_date, last_order_date, and total_orders.\n\nSchema:\n  customers(id, name)\n  orders(id, customer_id, amount, order_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT c.name,\n  MIN(o.order_date) OVER (PARTITION BY c.id) AS first_order_date,\n  MAX(o.order_date) OVER (PARTITION BY c.id) AS last_order_date,\n  COUNT(*) OVER (PARTITION BY c.id) AS total_orders\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name;",
    acceptance_rate: 50, xp_reward: 100,
  },
  {
    title: 'Revenue Quartiles',
    description: `Bucket each day's revenue into 4 quartiles using NTILE. Return date, revenue, and quartile.\n\nSchema:\n  daily_sales(date, revenue)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "SELECT date, revenue,\n  NTILE(4) OVER (ORDER BY revenue) AS quartile\nFROM daily_sales\nORDER BY quartile, revenue;",
    acceptance_rate: 45, xp_reward: 150,
  },
  {
    title: 'Session Duration Moving Average',
    description: `Calculate a 3-day moving average of total session duration per day.\n\nSchema:\n  sessions(id, user_id, session_date, duration_minutes)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "SELECT session_date,\n  SUM(duration_minutes) AS daily_duration,\n  ROUND(AVG(SUM(duration_minutes)) OVER (\n    ORDER BY session_date\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ), 2) AS moving_avg_3d\nFROM sessions\nGROUP BY session_date\nORDER BY session_date;",
    acceptance_rate: 32, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — CTEs & SUBQUERIES (Medium/Hard)
  // ════════════════════════════════════════════════════════
  {
    title: 'Customers Above Average Spend',
    description: `Using a CTE, find customers whose total spend is above the average total spend across all customers.\n\nSchema:\n  customers(id, name, email, city)\n  orders(id, customer_id, amount)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "WITH customer_spend AS (\n  SELECT c.name, SUM(o.amount) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, total_spent\nFROM customer_spend\nWHERE total_spent > (SELECT AVG(total_spent) FROM customer_spend)\nORDER BY total_spent DESC;",
    acceptance_rate: 58, xp_reward: 100,
  },
  {
    title: 'Multi-level CTE: Category Revenue',
    description: `Use two CTEs:\n1. item_revenue: compute line total per order item\n2. category_summary: sum up revenue per category\nReturn category, total_revenue, and avg_item_value.\n\nSchema:\n  products(id, name, category)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "WITH item_revenue AS (\n  SELECT oi.product_id,\n    oi.quantity * oi.unit_price AS line_total\n  FROM order_items oi\n),\ncategory_summary AS (\n  SELECT p.category,\n    SUM(ir.line_total) AS total_revenue,\n    AVG(ir.line_total) AS avg_item_value\n  FROM item_revenue ir\n  JOIN products p ON ir.product_id = p.id\n  GROUP BY p.category\n)\nSELECT * FROM category_summary\nORDER BY total_revenue DESC;",
    acceptance_rate: 44, xp_reward: 150,
  },
  {
    title: 'Identify Churned Users',
    description: `Find users who were active in January 2024 but NOT in March 2024 (churned).\n\nSchema:\n  user_activity(user_id, activity_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "WITH jan_users AS (\n  SELECT DISTINCT user_id FROM user_activity\n  WHERE activity_date LIKE '2024-01%'\n),\nmar_users AS (\n  SELECT DISTINCT user_id FROM user_activity\n  WHERE activity_date LIKE '2024-03%'\n)\nSELECT j.user_id\nFROM jan_users j\nLEFT JOIN mar_users m ON j.user_id = m.user_id\nWHERE m.user_id IS NULL;",
    acceptance_rate: 52, xp_reward: 100,
  },
  {
    title: 'Recursive Employee Hierarchy',
    description: `Using a recursive CTE, return each employee's name, their manager's name, and hierarchy level (1 = top).\n\nSchema:\n  employees(id, name, department, salary, manager_id)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 1 AS level\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.level + 1\n  FROM employees e\n  JOIN org o ON e.manager_id = o.id\n)\nSELECT name, level FROM org ORDER BY level, name;",
    acceptance_rate: 28, xp_reward: 200,
  },
  {
    title: 'Correlated Subquery: Dept Avg Salary',
    description: `Return each employee's name, salary, and whether their salary is above their department average. Use a correlated subquery.\n\nSchema:\n  employees(id, name, department, salary)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "SELECT name, department, salary,\n  CASE WHEN salary > (\n    SELECT AVG(salary) FROM employees e2\n    WHERE e2.department = e1.department\n  ) THEN 'Above Avg' ELSE 'Below Avg' END AS vs_dept_avg\nFROM employees e1\nORDER BY department, salary DESC;",
    acceptance_rate: 40, xp_reward: 150,
  },
  {
    title: 'Funnel Drop-off Analysis',
    description: `Count users at each funnel stage: visited → added to cart → purchased.\n\nSchema:\n  transactions(id, user_id, amount, type, txn_date)\n  types: 'visit', 'cart', 'purchase'`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "SELECT\n  SUM(CASE WHEN type='visit' THEN 1 ELSE 0 END) AS visitors,\n  SUM(CASE WHEN type='cart' THEN 1 ELSE 0 END) AS add_to_cart,\n  SUM(CASE WHEN type='purchase' THEN 1 ELSE 0 END) AS purchases,\n  ROUND(SUM(CASE WHEN type='cart' THEN 1 ELSE 0 END) * 100.0\n    / NULLIF(SUM(CASE WHEN type='visit' THEN 1 ELSE 0 END),0), 2) AS cart_rate_pct,\n  ROUND(SUM(CASE WHEN type='purchase' THEN 1 ELSE 0 END) * 100.0\n    / NULLIF(SUM(CASE WHEN type='cart' THEN 1 ELSE 0 END),0), 2) AS purchase_rate_pct\nFROM transactions;",
    acceptance_rate: 33, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — CASE STATEMENTS (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Salary Bands',
    description: `Categorize each employee's salary into bands: 'Low' (<50000), 'Mid' (50000–100000), 'High' (>100000).\n\nSchema:\n  employees(id, name, department, salary)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT name, department, salary,\n  CASE\n    WHEN salary < 50000 THEN 'Low'\n    WHEN salary <= 100000 THEN 'Mid'\n    ELSE 'High'\n  END AS salary_band\nFROM employees\nORDER BY salary DESC;",
    acceptance_rate: 88, xp_reward: 50,
  },
  {
    title: 'Order Status Classification',
    description: `Add a column 'priority': 'Urgent' if amount > 15000, 'Normal' if 5000–15000, 'Low' if below 5000.\n\nSchema:\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT id, customer_id, amount, status,\n  CASE\n    WHEN amount > 15000 THEN 'Urgent'\n    WHEN amount >= 5000 THEN 'Normal'\n    ELSE 'Low'\n  END AS priority\nFROM orders\nORDER BY amount DESC;",
    acceptance_rate: 91, xp_reward: 30,
  },
  {
    title: 'Pivot Monthly Revenue',
    description: `Pivot monthly sales data to show Jan, Feb, Mar revenue side by side.\n\nSchema:\n  sales(date, revenue)  — date is first day of month`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT\n  SUM(CASE WHEN strftime('%m', date) = '01' THEN revenue ELSE 0 END) AS jan_revenue,\n  SUM(CASE WHEN strftime('%m', date) = '02' THEN revenue ELSE 0 END) AS feb_revenue,\n  SUM(CASE WHEN strftime('%m', date) = '03' THEN revenue ELSE 0 END) AS mar_revenue\nFROM sales;",
    acceptance_rate: 55, xp_reward: 100,
  },
  {
    title: 'Rating Sentiment Labels',
    description: `Label each review: 5 → 'Excellent', 4 → 'Good', 3 → 'Neutral', 1–2 → 'Poor'.\n\nSchema:\n  reviews(id, product_id, user_id, rating, review_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT id, product_id, rating,\n  CASE rating\n    WHEN 5 THEN 'Excellent'\n    WHEN 4 THEN 'Good'\n    WHEN 3 THEN 'Neutral'\n    ELSE 'Poor'\n  END AS sentiment\nFROM reviews\nORDER BY rating DESC;",
    acceptance_rate: 90, xp_reward: 30,
  },
  {
    title: 'Campaign ROI Classification',
    description: `Compute ROI = (revenue - spend) / spend * 100 for each campaign and label it: >200% 'High', 50–200% 'Medium', <50% 'Low'.\n\nSchema:\n  campaigns(id, name, channel, spend, revenue, start_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT name, channel, spend, revenue,\n  ROUND((revenue - spend) * 100.0 / spend, 2) AS roi_pct,\n  CASE\n    WHEN (revenue - spend) * 100.0 / spend > 200 THEN 'High'\n    WHEN (revenue - spend) * 100.0 / spend >= 50 THEN 'Medium'\n    ELSE 'Low'\n  END AS roi_band\nFROM campaigns\nORDER BY roi_pct DESC;",
    acceptance_rate: 61, xp_reward: 100,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — DATE & STRING FUNCTIONS (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Extract Year and Month from Orders',
    description: `Return year, month, order count, and total revenue per year-month from the orders table.\n\nSchema:\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT\n  strftime('%Y', order_date) AS year,\n  strftime('%m', order_date) AS month,\n  COUNT(*) AS order_count,\n  SUM(amount) AS revenue\nFROM orders\nGROUP BY year, month\nORDER BY year, month;",
    acceptance_rate: 84, xp_reward: 50,
  },
  {
    title: 'Customer Name Initials',
    description: `Return each customer's full name and initials (e.g., 'Ravi Kumar' → 'R.K.'). Use string functions.\n\nSchema:\n  customers(id, name, email, city)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT name,\n  UPPER(SUBSTR(name, 1, 1)) || '.' ||\n  UPPER(SUBSTR(name, INSTR(name, ' ') + 1, 1)) || '.' AS initials\nFROM customers;",
    acceptance_rate: 68, xp_reward: 50,
  },
  {
    title: 'Days Since Last Order',
    description: `For each customer, return name and how many days ago they last ordered (from 2024-05-01). Use julianday.\n\nSchema:\n  customers(id, name)\n  orders(id, customer_id, amount, order_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT c.name,\n  MAX(o.order_date) AS last_order_date,\n  CAST(julianday('2024-05-01') - julianday(MAX(o.order_date)) AS INTEGER) AS days_since_last_order\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY days_since_last_order ASC;",
    acceptance_rate: 57, xp_reward: 100,
  },
  {
    title: 'Email Domain Breakdown',
    description: `Count users by email domain (everything after '@'). Return domain and count.\n\nSchema:\n  users(id, name, email)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT\n  SUBSTR(email, INSTR(email, '@') + 1) AS domain,\n  COUNT(*) AS user_count\nFROM users\nGROUP BY domain\nORDER BY user_count DESC;",
    acceptance_rate: 76, xp_reward: 50,
  },
  {
    title: 'Tenure in Years',
    description: `Return each employee's name and years at the company, calculated from hire_date to 2024-01-01.\n\nSchema:\n  employees(id, name, department, salary, hire_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT name, hire_date,\n  CAST((julianday('2024-01-01') - julianday(hire_date)) / 365.25 AS INTEGER) AS tenure_years\nFROM employees\nORDER BY tenure_years DESC;",
    acceptance_rate: 74, xp_reward: 50,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — NULL HANDLING (Easy)
  // ════════════════════════════════════════════════════════
  {
    title: 'COALESCE for Missing Data',
    description: `Replace NULL manager_id with text 'No Manager' using COALESCE. Show name, department, and manager_label.\n\nSchema:\n  employees(id, name, department, salary, manager_id)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT name, department,\n  COALESCE(CAST(manager_id AS TEXT), 'No Manager') AS manager_label\nFROM employees\nORDER BY department;",
    acceptance_rate: 87, xp_reward: 30,
  },
  {
    title: 'NULL-Safe Revenue Aggregation',
    description: `Sum the revenue column, treating NULLs as 0. Return total_revenue and count_with_nulls.\n\nSchema:\n  daily_sales(date, revenue)  — some revenues may be NULL`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT\n  SUM(COALESCE(revenue, 0)) AS total_revenue,\n  SUM(CASE WHEN revenue IS NULL THEN 1 ELSE 0 END) AS null_count\nFROM daily_sales;",
    acceptance_rate: 90, xp_reward: 30,
  },
  {
    title: 'NULLIF to Avoid Division by Zero',
    description: `Calculate conversion rate (purchases / visits) per campaign. Use NULLIF to avoid division by zero. Return campaign name, visits, purchases, and conv_rate.\n\nSchema:\n  campaigns(id, name, channel, spend, revenue)\n  Note: treat spend as visits_proxy, revenue as purchases_proxy for this exercise`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT name, channel,\n  spend AS visits,\n  revenue AS conversions,\n  ROUND(revenue / NULLIF(spend, 0), 4) AS conv_rate\nFROM campaigns\nORDER BY conv_rate DESC;",
    acceptance_rate: 71, xp_reward: 100,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — ADVANCED / HARD
  // ════════════════════════════════════════════════════════
  {
    title: 'New vs Returning Customers Per Month',
    description: `For each month, count new customers (first order that month) and returning customers (had order in previous months).\n\nSchema:\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH first_orders AS (\n  SELECT customer_id,\n    strftime('%Y-%m', MIN(order_date)) AS first_month\n  FROM orders\n  GROUP BY customer_id\n),\nmonthly AS (\n  SELECT strftime('%Y-%m', order_date) AS month, customer_id\n  FROM orders\n  GROUP BY month, customer_id\n)\nSELECT m.month,\n  COUNT(CASE WHEN f.first_month = m.month THEN 1 END) AS new_customers,\n  COUNT(CASE WHEN f.first_month < m.month THEN 1 END) AS returning_customers\nFROM monthly m\nJOIN first_orders f ON m.customer_id = f.customer_id\nGROUP BY m.month\nORDER BY m.month;",
    acceptance_rate: 29, xp_reward: 200,
  },
  {
    title: 'Week-over-Week Revenue Change',
    description: `Group daily_sales by ISO week, then calculate week-over-week revenue change and % change.\n\nSchema:\n  daily_sales(date, revenue)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH weekly AS (\n  SELECT strftime('%W', date) AS week,\n    SUM(revenue) AS week_revenue\n  FROM daily_sales\n  GROUP BY week\n)\nSELECT week, week_revenue,\n  LAG(week_revenue) OVER (ORDER BY week) AS prev_week,\n  week_revenue - LAG(week_revenue) OVER (ORDER BY week) AS change,\n  ROUND((week_revenue - LAG(week_revenue) OVER (ORDER BY week)) * 100.0\n    / LAG(week_revenue) OVER (ORDER BY week), 2) AS pct_change\nFROM weekly\nORDER BY week;",
    acceptance_rate: 34, xp_reward: 200,
  },
  {
    title: 'Product Frequently Bought Together',
    description: `Find pairs of products that appear together in the same order most often. Return product_a, product_b, and co_occurrence count.\n\nSchema:\n  order_items(id, order_id, product_id, quantity, unit_price)\n  products(id, name, category)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "SELECT\n  p1.name AS product_a,\n  p2.name AS product_b,\n  COUNT(*) AS co_occurrences\nFROM order_items oi1\nJOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id < oi2.product_id\nJOIN products p1 ON oi1.product_id = p1.id\nJOIN products p2 ON oi2.product_id = p2.id\nGROUP BY p1.name, p2.name\nORDER BY co_occurrences DESC\nLIMIT 10;",
    acceptance_rate: 24, xp_reward: 200,
  },
  {
    title: 'Customer Lifetime Value (LTV)',
    description: `Calculate average LTV per cohort (month of first order): avg total spend per customer who signed up that month.\n\nSchema:\n  orders(id, customer_id, amount, order_date)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH cohorts AS (\n  SELECT customer_id,\n    strftime('%Y-%m', MIN(order_date)) AS cohort_month\n  FROM orders GROUP BY customer_id\n),\nspend AS (\n  SELECT customer_id, SUM(amount) AS total_spend\n  FROM orders GROUP BY customer_id\n)\nSELECT c.cohort_month,\n  COUNT(DISTINCT c.customer_id) AS customers,\n  ROUND(AVG(s.total_spend), 2) AS avg_ltv\nFROM cohorts c\nJOIN spend s ON c.customer_id = s.customer_id\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;",
    acceptance_rate: 31, xp_reward: 200,
  },
  {
    title: 'Inventory Replenishment Alert',
    description: `For each product, show stock, avg daily order quantity, and days_of_stock_left (stock / avg_daily_qty). Flag products with < 7 days of stock.\n\nSchema:\n  products(id, name, stock)\n  order_items(id, order_id, product_id, quantity, unit_price)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH daily_qty AS (\n  SELECT product_id,\n    SUM(quantity) * 1.0 / 30 AS avg_daily_qty\n  FROM order_items\n  GROUP BY product_id\n)\nSELECT p.name, p.stock,\n  ROUND(dq.avg_daily_qty, 2) AS avg_daily_qty,\n  ROUND(p.stock / NULLIF(dq.avg_daily_qty, 0), 1) AS days_of_stock_left,\n  CASE WHEN p.stock / NULLIF(dq.avg_daily_qty, 0) < 7 THEN 'REORDER NOW' ELSE 'OK' END AS status\nFROM products p\nJOIN daily_qty dq ON p.id = dq.product_id\nORDER BY days_of_stock_left ASC;",
    acceptance_rate: 27, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — ANALYTICS PATTERNS (Medium/Hard)
  // ════════════════════════════════════════════════════════
  {
    title: 'Retention Rate Month 1',
    description: `What % of users who were active in their first month (Jan 2024) were also active in month 2 (Feb 2024)?\n\nSchema:\n  user_activity(user_id, activity_date)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH m1 AS (\n  SELECT DISTINCT user_id FROM user_activity\n  WHERE activity_date LIKE '2024-01%'\n),\nm2 AS (\n  SELECT DISTINCT user_id FROM user_activity\n  WHERE activity_date LIKE '2024-02%'\n)\nSELECT\n  COUNT(DISTINCT m1.user_id) AS m1_users,\n  COUNT(DISTINCT m2.user_id) AS retained,\n  ROUND(COUNT(DISTINCT m2.user_id) * 100.0 / COUNT(DISTINCT m1.user_id), 2) AS retention_pct\nFROM m1\nLEFT JOIN m2 ON m1.user_id = m2.user_id;",
    acceptance_rate: 36, xp_reward: 200,
  },
  {
    title: 'Average Session Duration Per User',
    description: `Return each user_id, their total sessions, total minutes, and average session duration (avg_duration_minutes).\n\nSchema:\n  sessions(id, user_id, session_date, duration_minutes)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT user_id,\n  COUNT(*) AS total_sessions,\n  SUM(duration_minutes) AS total_minutes,\n  ROUND(AVG(duration_minutes), 2) AS avg_duration_minutes\nFROM sessions\nGROUP BY user_id\nORDER BY total_minutes DESC;",
    acceptance_rate: 88, xp_reward: 50,
  },
  {
    title: 'Campaign Channel Performance',
    description: `Compare performance across marketing channels: total spend, total revenue, ROI %, and number of campaigns per channel.\n\nSchema:\n  campaigns(id, name, channel, spend, revenue, start_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT channel,\n  COUNT(*) AS campaigns,\n  SUM(spend) AS total_spend,\n  SUM(revenue) AS total_revenue,\n  ROUND((SUM(revenue) - SUM(spend)) * 100.0 / SUM(spend), 2) AS roi_pct\nFROM campaigns\nGROUP BY channel\nORDER BY roi_pct DESC;",
    acceptance_rate: 67, xp_reward: 100,
  },
  {
    title: 'Product Rating Distribution',
    description: `Show the count and % of reviews for each star rating (1 to 5).\n\nSchema:\n  reviews(id, product_id, user_id, rating, review_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT rating,\n  COUNT(*) AS review_count,\n  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS pct\nFROM reviews\nGROUP BY rating\nORDER BY rating DESC;",
    acceptance_rate: 76, xp_reward: 50,
  },
  {
    title: 'Detect Anomaly: Revenue Spike',
    description: `Flag days where daily revenue is more than 2× the 7-day moving average as 'Spike'.\n\nSchema:\n  daily_sales(date, revenue)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH ma AS (\n  SELECT date, revenue,\n    AVG(revenue) OVER (\n      ORDER BY date\n      ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING\n    ) AS ma7\n  FROM daily_sales\n)\nSELECT date, revenue, ROUND(ma7, 0) AS ma7,\n  CASE WHEN revenue > 2 * ma7 THEN 'Spike' ELSE 'Normal' END AS flag\nFROM ma\nORDER BY date;",
    acceptance_rate: 30, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — DATA CLEANING (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Remove Duplicate Rows',
    description: `Remove duplicate rows from a DataFrame based on all columns. Print the count of duplicates found and return the cleaned df.\n\nColumns: order_id, customer_id, product, amount, date`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: 'import pandas as pd\n\ndf = pd.read_csv("orders.csv")\nprint("Original shape:", df.shape)\nprint("Duplicate rows:", df.duplicated().sum())\n\ndf = df.drop_duplicates()\nprint("Cleaned shape:", df.shape)\ndf.head()',
    acceptance_rate: 94, xp_reward: 30,
  },
  {
    title: 'Standardize Column Names',
    description: `Clean column names: lowercase, replace spaces with underscores, remove special characters.\n\nInput columns: 'Customer ID', 'Total Sales ($)', 'Date Ordered', 'Product Name'`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\nimport re\n\ndf = pd.read_csv('sales.csv')\n# Standardize column names\ndf.columns = (\n    df.columns\n    .str.strip()\n    .str.lower()\n    .str.replace(' ', '_', regex=False)\n    .str.replace(r'[^a-z0-9_]', '', regex=True)\n)\nprint(df.columns.tolist())",
    acceptance_rate: 88, xp_reward: 30,
  },
  {
    title: 'Fix Data Types',
    description: `Convert columns to correct types:\n- 'order_date' → datetime\n- 'amount' → float (has '$' and ',' symbols)\n- 'customer_id' → string`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\n\n# Fix amount: remove $ and commas, convert to float\ndf['amount'] = df['amount'].str.replace('$', '', regex=False).str.replace(',', '', regex=False).astype(float)\n\n# Fix date\ndf['order_date'] = pd.to_datetime(df['order_date'])\n\n# Fix customer_id to string\ndf['customer_id'] = df['customer_id'].astype(str)\n\nprint(df.dtypes)",
    acceptance_rate: 80, xp_reward: 50,
  },
  {
    title: 'Cap Outliers (Winsorization)',
    description: `Winsorize the 'salary' column — cap values below the 5th percentile and above the 95th percentile.\n\nColumns: employee_id, name, department, salary`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('employees.csv')\n\nlow = df['salary'].quantile(0.05)\nhigh = df['salary'].quantile(0.95)\n\ndf['salary_winsorized'] = df['salary'].clip(lower=low, upper=high)\n\nprint(f'Before — min: {df[\"salary\"].min()}, max: {df[\"salary\"].max()}')\nprint(f'After  — min: {df[\"salary_winsorized\"].min()}, max: {df[\"salary_winsorized\"].max()}')",
    acceptance_rate: 55, xp_reward: 100,
  },
  {
    title: 'Impute Missing Values Intelligently',
    description: `For a sales DataFrame:\n- Fill numeric nulls with column median\n- Fill 'region' nulls with mode\n- Fill 'notes' nulls with 'N/A'\n\nColumns: sale_id, product, region, amount, notes`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\n\n# Numeric columns — fill with median\nfor col in df.select_dtypes(include='number').columns:\n    df[col] = df[col].fillna(df[col].median())\n\n# Region — fill with mode\ndf['region'] = df['region'].fillna(df['region'].mode()[0])\n\n# Notes — fill with constant\ndf['notes'] = df['notes'].fillna('N/A')\n\nprint(df.isnull().sum())",
    acceptance_rate: 71, xp_reward: 100,
  },
  {
    title: 'Parse Dates and Extract Features',
    description: `From an order_date column, extract: year, month, day_of_week (name), quarter, is_weekend (bool).\n\nColumns: order_id, order_date, amount`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\n\ndf['year']       = df['order_date'].dt.year\ndf['month']      = df['order_date'].dt.month\ndf['day_of_week'] = df['order_date'].dt.day_name()\ndf['quarter']    = df['order_date'].dt.quarter\ndf['is_weekend'] = df['order_date'].dt.dayofweek >= 5\n\nprint(df[['order_date','year','month','day_of_week','quarter','is_weekend']].head())",
    acceptance_rate: 83, xp_reward: 50,
  },
  {
    title: 'Normalize Numeric Columns (Min-Max)',
    description: `Apply min-max normalization to all numeric columns in the dataset so values fall between 0 and 1.\n\nColumns: product_id, price, stock, sales_count`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\nnum_cols = df.select_dtypes(include='number').columns\n\nfor col in num_cols:\n    min_val = df[col].min()\n    max_val = df[col].max()\n    df[col + '_norm'] = (df[col] - min_val) / (max_val - min_val)\n\nprint(df[[c + '_norm' for c in num_cols]].describe())",
    acceptance_rate: 62, xp_reward: 100,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — DATA MANIPULATION (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Merge DataFrames on Key',
    description: `Merge orders and customers DataFrames on customer_id. Keep only rows with a matching customer. Show the first 5 rows.\n\norders: order_id, customer_id, amount, date\ncustomers: customer_id, name, city, segment`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\norders = pd.read_csv('orders.csv')\ncustomers = pd.read_csv('customers.csv')\n\nmerged = orders.merge(customers, on='customer_id', how='inner')\nprint(f'Rows: {len(merged)}')\nprint(merged.head())",
    acceptance_rate: 89, xp_reward: 50,
  },
  {
    title: 'Pivot Table: Sales by Category and Month',
    description: `Create a pivot table showing total sales by product_category (rows) and month (columns).\n\nColumns: sale_id, product_category, month, amount`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['month'] = df['order_date'].dt.to_period('M').astype(str)\n\npivot = df.pivot_table(\n    values='amount',\n    index='product_category',\n    columns='month',\n    aggfunc='sum',\n    fill_value=0\n)\nprint(pivot)",
    acceptance_rate: 60, xp_reward: 100,
  },
  {
    title: 'Stack and Unstack MultiIndex',
    description: `Given a sales DataFrame with MultiIndex (region, product), unstack the product level to get a wide table, then fill NaN with 0.\n\nColumns: region, product, revenue`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\nsummary = df.groupby(['region','product'])['revenue'].sum()\nwide = summary.unstack(level='product').fillna(0)\nprint(wide)",
    acceptance_rate: 45, xp_reward: 100,
  },
  {
    title: 'Apply Custom Function with Lambda',
    description: `Create a new column 'discount_amount' = amount × discount_rate. Then create 'net_amount' = amount - discount_amount, using .apply() and a lambda.\n\nColumns: order_id, amount, discount_rate`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['discount_amount'] = df.apply(lambda row: row['amount'] * row['discount_rate'], axis=1)\ndf['net_amount'] = df['amount'] - df['discount_amount']\nprint(df[['order_id','amount','discount_rate','discount_amount','net_amount']].head())",
    acceptance_rate: 86, xp_reward: 50,
  },
  {
    title: 'Filter and Sort with Multiple Conditions',
    description: `Filter orders where amount > 5000 AND status == 'completed' AND city is in ['Mumbai', 'Delhi', 'Bangalore']. Sort by amount descending.\n\nColumns: order_id, customer_id, amount, status, city`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ntop_cities = ['Mumbai', 'Delhi', 'Bangalore']\n\nfiltered = df[\n    (df['amount'] > 5000) &\n    (df['status'] == 'completed') &\n    (df['city'].isin(top_cities))\n].sort_values('amount', ascending=False)\n\nprint(f'Filtered rows: {len(filtered)}')\nprint(filtered.head(10))",
    acceptance_rate: 87, xp_reward: 50,
  },
  {
    title: 'Rolling Sales with Shift',
    description: `Calculate a 30-day rolling mean of revenue and a 30-day lag (revenue 30 days ago) to identify trends.\n\nColumns: date (daily), revenue`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('daily_sales.csv')\ndf['date'] = pd.to_datetime(df['date'])\ndf = df.sort_values('date')\n\ndf['rolling_30d'] = df['revenue'].rolling(window=30, min_periods=1).mean().round(2)\ndf['lag_30d']     = df['revenue'].shift(30)\ndf['mom_change']  = ((df['revenue'] - df['lag_30d']) / df['lag_30d'] * 100).round(2)\n\nprint(df.tail(10))",
    acceptance_rate: 50, xp_reward: 100,
  },
  {
    title: 'Top N per Group with nlargest',
    description: `Return the top 2 selling products per category by total revenue.\n\nColumns: sale_id, product, category, revenue`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\nproduct_rev = df.groupby(['category','product'])['revenue'].sum().reset_index()\ntop2 = product_rev.groupby('category').apply(lambda x: x.nlargest(2, 'revenue')).reset_index(drop=True)\nprint(top2)",
    acceptance_rate: 53, xp_reward: 100,
  },
  {
    title: 'Bin Customers by Spend',
    description: `Use pd.cut() to segment customers into spend tiers: 'Bronze' (0–10k), 'Silver' (10k–50k), 'Gold' (50k–100k), 'Platinum' (100k+).\n\nColumns: customer_id, name, total_spent`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\nbins   = [0, 10000, 50000, 100000, float('inf')]\nlabels = ['Bronze', 'Silver', 'Gold', 'Platinum']\n\ndf['tier'] = pd.cut(df['total_spent'], bins=bins, labels=labels)\nprint(df['tier'].value_counts())\nprint(df[['name','total_spent','tier']].head(10))",
    acceptance_rate: 68, xp_reward: 100,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — ANALYSIS & STATISTICS (Medium/Hard)
  // ════════════════════════════════════════════════════════
  {
    title: 'Correlation Matrix',
    description: `Compute the correlation matrix for numeric columns and identify the top 3 pairs with highest absolute correlation.\n\nColumns: price, discount, rating, sales_count, return_rate`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('products.csv')\ncorr = df.select_dtypes(include='number').corr()\n\n# Extract upper triangle\nupper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))\npairs = upper.stack().reset_index()\npairs.columns = ['col1','col2','correlation']\ntop3 = pairs.reindex(pairs['correlation'].abs().sort_values(ascending=False).index).head(3)\nprint(top3)",
    acceptance_rate: 45, xp_reward: 100,
  },
  {
    title: 'A/B Test — Conversion Rate Comparison',
    description: `Given a DataFrame of user experiments (group: 'control'/'test', converted: 0/1), compute conversion rate per group and lift %.\n\nColumns: user_id, group, converted`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('ab_test.csv')\nresult = df.groupby('group').agg(\n    users=('user_id','count'),\n    conversions=('converted','sum')\n).reset_index()\n\nresult['conv_rate'] = (result['conversions'] / result['users'] * 100).round(2)\n\ncontrol_rate = result.loc[result['group']=='control','conv_rate'].values[0]\nresult['lift_pct'] = ((result['conv_rate'] - control_rate) / control_rate * 100).round(2)\n\nprint(result)",
    acceptance_rate: 52, xp_reward: 100,
  },
  {
    title: 'Z-Score Anomaly Detection',
    description: `Detect anomalies in daily revenue using z-scores. Flag rows with |z-score| > 2 as anomalies.\n\nColumns: date, revenue`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('daily_sales.csv')\ndf['z_score'] = stats.zscore(df['revenue'].fillna(df['revenue'].mean()))\ndf['is_anomaly'] = df['z_score'].abs() > 2\n\nprint(f\"Anomalies found: {df['is_anomaly'].sum()}\")\nprint(df[df['is_anomaly']][['date','revenue','z_score']])",
    acceptance_rate: 55, xp_reward: 100,
  },
  {
    title: 'Time Series Decomposition',
    description: `Decompose monthly revenue into trend, seasonality, and residuals using statsmodels. Print the seasonal component.\n\nColumns: date (monthly), revenue`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\nfrom statsmodels.tsa.seasonal import seasonal_decompose\n\ndf = pd.read_csv('monthly_sales.csv', parse_dates=['date'], index_col='date')\nresult = seasonal_decompose(df['revenue'], model='additive', period=12)\n\nprint('Seasonal Component:')\nprint(result.seasonal)",
    acceptance_rate: 35, xp_reward: 150,
  },
  {
    title: 'RFM Segmentation',
    description: `Build an RFM (Recency, Frequency, Monetary) model:\n- Recency: days since last purchase\n- Frequency: total orders\n- Monetary: total spend\nScore each 1-5 and assign segment labels.\n\nColumns: customer_id, order_date, amount`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\nfrom datetime import datetime\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\nsnapshot = datetime(2024, 5, 1)\n\nrfm = df.groupby('customer_id').agg(\n    recency=('order_date', lambda x: (snapshot - x.max()).days),\n    frequency=('order_date', 'count'),\n    monetary=('amount', 'sum')\n).reset_index()\n\n# Score 1-5 (recency: lower is better)\nrfm['r_score'] = pd.qcut(rfm['recency'], 5, labels=[5,4,3,2,1])\nrfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1,2,3,4,5])\nrfm['m_score'] = pd.qcut(rfm['monetary'], 5, labels=[1,2,3,4,5])\nrfm['rfm_score'] = rfm['r_score'].astype(int) + rfm['f_score'].astype(int) + rfm['m_score'].astype(int)\n\nprint(rfm.sort_values('rfm_score', ascending=False).head(10))",
    acceptance_rate: 30, xp_reward: 200,
  },
  {
    title: 'Cohort Analysis with Pandas',
    description: `Calculate retention: for each user cohort (first purchase month), find what % are still active in subsequent months.\n\nColumns: customer_id, order_date, amount`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['order_month'] = df['order_date'].dt.to_period('M')\n\ncohort = df.groupby('customer_id')['order_month'].min().reset_index()\ncohort.columns = ['customer_id', 'cohort_month']\ndf = df.merge(cohort, on='customer_id')\n\ndf['period_number'] = (df['order_month'] - df['cohort_month']).apply(lambda x: x.n)\ncohort_data = df.groupby(['cohort_month','period_number'])['customer_id'].nunique().reset_index()\nbase = cohort_data[cohort_data['period_number'] == 0][['cohort_month','customer_id']].rename(columns={'customer_id':'base'})\ncohort_data = cohort_data.merge(base, on='cohort_month')\ncohort_data['retention'] = (cohort_data['customer_id'] / cohort_data['base'] * 100).round(1)\nprint(cohort_data.head(20))",
    acceptance_rate: 25, xp_reward: 200,
  },
  {
    title: 'Frequency Distribution',
    description: `Compute value counts and percentage distribution for 'region' column. Also compute cumulative percentage.\n\nColumns: sale_id, region, amount`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\ncounts = df['region'].value_counts().reset_index()\ncounts.columns = ['region', 'count']\ncounts['pct'] = (counts['count'] / counts['count'].sum() * 100).round(2)\ncounts['cum_pct'] = counts['pct'].cumsum().round(2)\nprint(counts)",
    acceptance_rate: 85, xp_reward: 50,
  },
  {
    title: 'Churn Prediction Features',
    description: `Engineer churn features from transaction data:\n- days_since_last_txn (from 2024-05-01)\n- total_txns\n- avg_txn_amount\n- std_txn_amount\n- txn_frequency_per_month\n\nColumns: user_id, txn_date, amount`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\nfrom datetime import datetime\nimport numpy as np\n\ndf = pd.read_csv('transactions.csv')\ndf['txn_date'] = pd.to_datetime(df['txn_date'])\nsnapshot = datetime(2024, 5, 1)\n\nfirst_txn = df.groupby('user_id')['txn_date'].min()\ntenure_months = ((snapshot - first_txn).dt.days / 30).clip(lower=1)\n\nfeatures = df.groupby('user_id').agg(\n    days_since_last_txn=('txn_date', lambda x: (snapshot - x.max()).days),\n    total_txns=('txn_date','count'),\n    avg_txn_amount=('amount','mean'),\n    std_txn_amount=('amount','std')\n).reset_index()\n\nfeatures['std_txn_amount'] = features['std_txn_amount'].fillna(0).round(2)\nfeatures['avg_txn_amount'] = features['avg_txn_amount'].round(2)\nfeatures['txn_freq_per_month'] = (features['total_txns'] / tenure_months.values).round(2)\n\nprint(features.head(10))",
    acceptance_rate: 27, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — VISUALIZATION PREP (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Prepare Bar Chart Data',
    description: `Aggregate sales by category and sort descending. Return a DataFrame ready for a bar chart with columns: category, total_sales.\n\nColumns: sale_id, category, amount`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\nbar_data = (\n    df.groupby('category')['amount']\n    .sum()\n    .reset_index()\n    .rename(columns={'amount':'total_sales'})\n    .sort_values('total_sales', ascending=False)\n)\nprint(bar_data)",
    acceptance_rate: 91, xp_reward: 30,
  },
  {
    title: 'Build Heatmap Correlation Matrix',
    description: `Prepare data for a heatmap: compute correlations between price, rating, stock, and sales. Round to 2 decimals.\n\nColumns: product_id, price, rating, stock, sales`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\ncorr = df[['price','rating','stock','sales']].corr().round(2)\nprint('Correlation Matrix:')\nprint(corr)",
    acceptance_rate: 88, xp_reward: 30,
  },
  {
    title: 'Resample Time Series to Weekly',
    description: `Resample daily sales data to weekly (sum). Add a 4-week moving average column.\n\nColumns: date (daily), revenue`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('daily_sales.csv', parse_dates=['date'], index_col='date')\nweekly = df['revenue'].resample('W').sum().reset_index()\nweekly.columns = ['week', 'revenue']\nweekly['ma_4w'] = weekly['revenue'].rolling(4, min_periods=1).mean().round(0)\nprint(weekly)",
    acceptance_rate: 57, xp_reward: 100,
  },
  {
    title: 'Sankey Data Prep: Funnel',
    description: `Transform a funnel table into source/target/value format for a Sankey/flow chart.\n\nInput: stage (visited, cart, checkout, purchased), count\nOutput: rows of (source, target, value) for consecutive stages`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\nfunnel = pd.DataFrame({\n    'stage': ['visited', 'cart', 'checkout', 'purchased'],\n    'count': [10000, 4200, 1800, 900]\n})\n\nrows = []\nfor i in range(len(funnel) - 1):\n    rows.append({\n        'source': funnel.iloc[i]['stage'],\n        'target': funnel.iloc[i+1]['stage'],\n        'value': funnel.iloc[i+1]['count'],\n        'drop_pct': round((1 - funnel.iloc[i+1]['count'] / funnel.iloc[i]['count']) * 100, 1)\n    })\n\nresult = pd.DataFrame(rows)\nprint(result)",
    acceptance_rate: 48, xp_reward: 100,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — STRING OPERATIONS (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'Extract Domain from Email',
    description: `Extract email domain from an 'email' column and count users per domain.\n\nColumns: user_id, name, email`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('users.csv')\ndf['domain'] = df['email'].str.split('@').str[1]\ndomains = df['domain'].value_counts().reset_index()\ndomains.columns = ['domain', 'count']\nprint(domains)",
    acceptance_rate: 90, xp_reward: 30,
  },
  {
    title: 'Flag Fraudulent Transactions via Regex',
    description: `Flag rows in a 'notes' column that contain suspicious keywords ('refund', 'duplicate', 'fraud', 'chargeback') using regex. Return flagged rows.\n\nColumns: txn_id, user_id, amount, notes`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('transactions.csv')\npattern = r'refund|duplicate|fraud|chargeback'\ndf['is_flagged'] = df['notes'].fillna('').str.contains(pattern, case=False, regex=True)\nflagged = df[df['is_flagged']]\nprint(f'{len(flagged)} flagged transactions')\nprint(flagged[['txn_id','amount','notes']].head())",
    acceptance_rate: 66, xp_reward: 100,
  },
  {
    title: 'Tokenize Product Tags',
    description: `A 'tags' column contains comma-separated strings like 'electronics,premium,sale'. Explode into one row per tag and find the top 5 tags by frequency.\n\nColumns: product_id, name, tags`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\ndf['tag_list'] = df['tags'].str.split(',')\nexploded = df.explode('tag_list')\nexploded['tag_list'] = exploded['tag_list'].str.strip().str.lower()\ntop_tags = exploded['tag_list'].value_counts().head(5)\nprint(top_tags)",
    acceptance_rate: 54, xp_reward: 100,
  },
  {
    title: 'Clean Phone Numbers',
    description: `Standardize phone numbers: remove +91, spaces, dashes, brackets. Keep only 10 digits. Flag rows with invalid length.\n\nColumns: user_id, name, phone`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\nimport re\n\ndf = pd.read_csv('users.csv')\ndf['phone_clean'] = (\n    df['phone']\n    .fillna('')\n    .str.replace(r'[\\s\\-\\(\\)\\+]', '', regex=True)\n    .str.replace(r'^91', '', regex=True)\n    .str.strip()\n)\ndf['phone_valid'] = df['phone_clean'].str.len() == 10\nprint(df[~df['phone_valid']][['user_id','phone','phone_clean']].head())",
    acceptance_rate: 75, xp_reward: 50,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — ADVANCED ANALYTICS (Hard)
  // ════════════════════════════════════════════════════════
  {
    title: 'Market Basket Analysis (Association)',
    description: `Find item pairs that appear together in transactions (same basket_id). Compute support = co-occurrence / total baskets. Return top 5 pairs.\n\nColumns: basket_id, product`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\nfrom itertools import combinations\n\ndf = pd.read_csv('baskets.csv')\ntotal_baskets = df['basket_id'].nunique()\n\npairs = []\nfor _, group in df.groupby('basket_id')['product']:\n    items = sorted(group.tolist())\n    for pair in combinations(items, 2):\n        pairs.append(pair)\n\npairs_df = pd.DataFrame(pairs, columns=['item_a','item_b'])\nsupport = (\n    pairs_df.groupby(['item_a','item_b'])\n    .size().reset_index(name='count')\n)\nsupport['support'] = (support['count'] / total_baskets * 100).round(2)\nprint(support.sort_values('support', ascending=False).head(5))",
    acceptance_rate: 22, xp_reward: 200,
  },
  {
    title: 'Linear Regression for Sales Forecast',
    description: `Fit a simple linear regression on day_number vs revenue to forecast the next 7 days.\n\nColumns: date (daily), revenue`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\nimport numpy as np\nfrom sklearn.linear_model import LinearRegression\n\ndf = pd.read_csv('daily_sales.csv')\ndf['day_num'] = range(len(df))\n\nX = df[['day_num']]\ny = df['revenue']\n\nmodel = LinearRegression()\nmodel.fit(X, y)\n\nnext_days = pd.DataFrame({'day_num': range(len(df), len(df)+7)})\nnext_days['forecast'] = model.predict(next_days[['day_num']]).round(0)\nprint(next_days)",
    acceptance_rate: 35, xp_reward: 150,
  },
  {
    title: 'K-Means Customer Segmentation',
    description: `Cluster customers into 3 segments using KMeans on total_spend and order_frequency. Print cluster centers and counts.\n\nColumns: customer_id, total_spend, order_frequency`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\nfrom sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n\ndf = pd.read_csv('customers.csv')\nX = df[['total_spend','order_frequency']]\n\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n\nkmeans = KMeans(n_clusters=3, random_state=42, n_init=10)\ndf['segment'] = kmeans.fit_predict(X_scaled)\n\nprint('Cluster sizes:')\nprint(df['segment'].value_counts())\nprint('\\nCluster centers (original scale):')\ncenters = scaler.inverse_transform(kmeans.cluster_centers_)\nprint(pd.DataFrame(centers, columns=['total_spend','order_frequency']).round(0))",
    acceptance_rate: 30, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  SQL — EXTRA PRACTICE (Easy/Medium)
  // ════════════════════════════════════════════════════════
  {
    title: 'UNION: Combine Two Customer Lists',
    description: `Return a combined unique list of customer names from Mumbai and Delhi using UNION.\n\nSchema:\n  customers(id, name, email, city)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT name, 'Mumbai' AS city FROM customers WHERE city = 'Mumbai'\nUNION\nSELECT name, 'Delhi' FROM customers WHERE city = 'Delhi'\nORDER BY name;",
    acceptance_rate: 85, xp_reward: 50,
  },
  {
    title: 'INTERSECT: Active in Two Months',
    description: `Find users who were active in BOTH January AND March 2024.\n\nSchema:\n  user_activity(user_id, activity_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT user_id FROM user_activity WHERE activity_date LIKE '2024-01%'\nINTERSECT\nSELECT user_id FROM user_activity WHERE activity_date LIKE '2024-03%';",
    acceptance_rate: 70, xp_reward: 100,
  },
  {
    title: 'EXCEPT: Inactive Users',
    description: `Find users who were active in January but NOT in February 2024.\n\nSchema:\n  user_activity(user_id, activity_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT user_id FROM user_activity WHERE activity_date LIKE '2024-01%'\nEXCEPT\nSELECT user_id FROM user_activity WHERE activity_date LIKE '2024-02%';",
    acceptance_rate: 73, xp_reward: 100,
  },
  {
    title: 'Order Totals with Discounts',
    description: `Each order has a discount_pct column. Compute: gross_total, discount_amount, and net_total per order.\n\nSchema:\n  order_items(id, order_id, product_id, quantity, unit_price)\n  orders(id, customer_id, discount_pct, order_date)`,
    difficulty: 'Medium', topic: 'SQL',
    starter_code: "SELECT o.id AS order_id,\n  SUM(oi.quantity * oi.unit_price) AS gross_total,\n  ROUND(SUM(oi.quantity * oi.unit_price) * o.discount_pct / 100.0, 2) AS discount_amount,\n  ROUND(SUM(oi.quantity * oi.unit_price) * (1 - o.discount_pct / 100.0), 2) AS net_total\nFROM orders o\nJOIN order_items oi ON o.id = oi.order_id\nGROUP BY o.id, o.discount_pct\nORDER BY net_total DESC;",
    acceptance_rate: 58, xp_reward: 100,
  },
  {
    title: 'Most Active Users',
    description: `Find the top 5 most active users (most activity records) with their first and last activity dates.\n\nSchema:\n  user_activity(user_id, activity_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT user_id,\n  COUNT(*) AS activity_count,\n  MIN(activity_date) AS first_activity,\n  MAX(activity_date) AS last_activity\nFROM user_activity\nGROUP BY user_id\nORDER BY activity_count DESC\nLIMIT 5;",
    acceptance_rate: 88, xp_reward: 50,
  },
  {
    title: 'Calculate Churn Rate',
    description: `Users are churned if they have no activity in the last 30 days (from 2024-04-01). Compute: total_users, churned_users, churn_rate %.\n\nSchema:\n  user_activity(user_id, activity_date)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH last_active AS (\n  SELECT user_id, MAX(activity_date) AS last_date\n  FROM user_activity\n  GROUP BY user_id\n)\nSELECT\n  COUNT(*) AS total_users,\n  SUM(CASE WHEN julianday('2024-04-01') - julianday(last_date) > 30 THEN 1 ELSE 0 END) AS churned,\n  ROUND(SUM(CASE WHEN julianday('2024-04-01') - julianday(last_date) > 30 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS churn_rate_pct\nFROM last_active;",
    acceptance_rate: 35, xp_reward: 200,
  },
  {
    title: 'Identify Weekend Sales',
    description: `Flag orders placed on weekends (Saturday=6, Sunday=0 in SQLite strftime). Return order_id, order_date, amount, and is_weekend.\n\nSchema:\n  orders(id, customer_id, amount, status, order_date)`,
    difficulty: 'Easy', topic: 'SQL',
    starter_code: "SELECT id AS order_id, order_date, amount,\n  CASE WHEN CAST(strftime('%w', order_date) AS INTEGER) IN (0, 6)\n    THEN 'Yes' ELSE 'No'\n  END AS is_weekend\nFROM orders\nORDER BY order_date;",
    acceptance_rate: 79, xp_reward: 50,
  },
  {
    title: 'Median Salary by Department',
    description: `Compute the median salary per department (SQLite lacks MEDIAN, use PERCENTILE_CONT via window).\n\nSchema:\n  employees(id, name, department, salary)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH ranked AS (\n  SELECT department, salary,\n    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary) AS rn,\n    COUNT(*) OVER (PARTITION BY department) AS cnt\n  FROM employees\n)\nSELECT department,\n  AVG(salary) AS median_salary\nFROM ranked\nWHERE rn IN (CAST((cnt + 1) / 2 AS INT), CAST((cnt + 2) / 2 AS INT))\nGROUP BY department\nORDER BY department;",
    acceptance_rate: 33, xp_reward: 200,
  },
  {
    title: 'Inventory Turnover Rate',
    description: `Compute inventory turnover = units_sold / avg_stock per product. Higher = faster moving.\n\nSchema:\n  order_items(id, order_id, product_id, quantity)\n  inventory(id, product_id, warehouse, quantity)`,
    difficulty: 'Hard', topic: 'SQL',
    starter_code: "WITH units_sold AS (\n  SELECT product_id, SUM(quantity) AS sold\n  FROM order_items GROUP BY product_id\n),\navg_stock AS (\n  SELECT product_id, AVG(quantity) AS avg_qty\n  FROM inventory GROUP BY product_id\n)\nSELECT p.name,\n  COALESCE(us.sold, 0) AS units_sold,\n  ROUND(as2.avg_qty, 0) AS avg_stock,\n  ROUND(COALESCE(us.sold, 0) * 1.0 / NULLIF(as2.avg_qty, 0), 2) AS turnover_rate\nFROM products p\nJOIN avg_stock as2 ON p.id = as2.product_id\nLEFT JOIN units_sold us ON p.id = us.product_id\nORDER BY turnover_rate DESC;",
    acceptance_rate: 28, xp_reward: 200,
  },

  // ════════════════════════════════════════════════════════
  //  PYTHON — EXTRA
  // ════════════════════════════════════════════════════════
  {
    title: 'Monthly Customer Acquisition',
    description: `Calculate how many new customers (first order) were acquired each month.\n\nColumns: customer_id, order_date, amount`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\n\nfirst_purchase = df.groupby('customer_id')['order_date'].min().reset_index()\nfirst_purchase['month'] = first_purchase['order_date'].dt.to_period('M').astype(str)\n\nacquisition = first_purchase.groupby('month').size().reset_index(name='new_customers')\nprint(acquisition)",
    acceptance_rate: 72, xp_reward: 100,
  },
  {
    title: 'Average Response Time Analysis',
    description: `Compute average, p50, p90, and p99 response times from a server log DataFrame.\n\nColumns: request_id, endpoint, response_ms, status_code`,
    difficulty: 'Medium', topic: 'Python',
    starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('server_logs.csv')\nstats = df.groupby('endpoint')['response_ms'].agg(\n    mean='mean',\n    p50=lambda x: np.percentile(x, 50),\n    p90=lambda x: np.percentile(x, 90),\n    p99=lambda x: np.percentile(x, 99)\n).round(2).reset_index()\nstats = stats.sort_values('p99', ascending=False)\nprint(stats)",
    acceptance_rate: 56, xp_reward: 100,
  },
  {
    title: 'Identify Data Quality Issues',
    description: `Write a data quality report for a DataFrame: count nulls, count duplicates, data type mismatches, and out-of-range values for 'age' column (should be 18–100).\n\nColumns: user_id, name, email, age, signup_date`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('users.csv')\n\nprint('=== Data Quality Report ===')\nprint(f'Shape: {df.shape}')\nprint(f'\\nNull counts:\\n{df.isnull().sum()}')\nprint(f'\\nDuplicate rows: {df.duplicated().sum()}')\nprint(f'\\nAge out of range (not 18-100): {((df[\"age\"] < 18) | (df[\"age\"] > 100)).sum()}')\nprint(f'\\nData types:\\n{df.dtypes}')",
    acceptance_rate: 87, xp_reward: 50,
  },
  {
    title: 'Cumulative Revenue with Running Total',
    description: `Sort by date and compute a running cumulative sum of revenue. Also compute % of total achieved so far.\n\nColumns: date (monthly), revenue`,
    difficulty: 'Easy', topic: 'Python',
    starter_code: "import pandas as pd\n\ndf = pd.read_csv('monthly_sales.csv')\ndf['date'] = pd.to_datetime(df['date'])\ndf = df.sort_values('date')\n\ndf['cumulative_revenue'] = df['revenue'].cumsum()\ndf['pct_of_total'] = (df['cumulative_revenue'] / df['revenue'].sum() * 100).round(1)\n\nprint(df[['date','revenue','cumulative_revenue','pct_of_total']])",
    acceptance_rate: 85, xp_reward: 50,
  },
  {
    title: 'Multi-Join Feature Engineering',
    description: `Merge orders, customers, and products to build a flat analytics table. Add columns: customer_city, product_category, revenue (quantity × unit_price).\n\norders: order_id, customer_id, order_date\norder_items: order_id, product_id, quantity, unit_price\ncustomers: customer_id, name, city\nproducts: product_id, name, category`,
    difficulty: 'Hard', topic: 'Python',
    starter_code: "import pandas as pd\n\norders   = pd.read_csv('orders.csv')\nitems    = pd.read_csv('order_items.csv')\ncust     = pd.read_csv('customers.csv')\nproducts = pd.read_csv('products.csv')\n\nflat = (\n    items\n    .merge(orders[['order_id','customer_id','order_date']], on='order_id')\n    .merge(cust[['customer_id','name','city']], on='customer_id')\n    .merge(products[['product_id','name','category']], on='product_id', suffixes=('','_prod'))\n)\nflat['revenue'] = flat['quantity'] * flat['unit_price']\nprint(f'Flat table shape: {flat.shape}')\nprint(flat.head())",
    acceptance_rate: 38, xp_reward: 150,
  },
];

async function seedProblems(db) {
  // Check how many problems already exist
  const existingRows = await all(db, 'SELECT COUNT(*) as count FROM problems');
  const count = existingRows[0]?.count || 0;

  if (count >= 20) {
    console.log(`✅ Problems already seeded (${count} exist), skipping extra seed.`);
    return;
  }

  console.log('🌱 Seeding 95 extra problems...');
  let inserted = 0;
  for (const p of EXTRA_PROBLEMS) {
    try {
      await run(db,
        `INSERT INTO problems (id, title, description, difficulty, topic, starter_code, acceptance_rate, xp_reward)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), p.title, p.description, p.difficulty, p.topic, p.starter_code, p.acceptance_rate, p.xp_reward]
      );
      inserted++;
    } catch (e) {
      // skip on duplicate title or other constraint errors
    }
  }

  // ── Upsert structured schema + examples for key problems ──────────────
  const PROBLEM_DETAILS = [
    {
      title: 'Select All Active Customers',
      clean_desc: "Return all columns for customers whose email ends with **'@gmail.com'**.\n\nReturn the results in any order.",
      table_schema: JSON.stringify([
        { name:'customers', note:'Each row has a unique customer.', columns:[
          {name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'email',type:'varchar(150)'},{name:'city',type:'varchar(50)'}
        ]}
      ]),
      examples: JSON.stringify([{
        input:{ customers:{ headers:['id','name','email','city'], rows:[[1,'Ravi Kumar','ravi@gmail.com','Mumbai'],[2,'Priya Sharma','priya@yahoo.com','Delhi'],[3,'Arjun Mehta','arjun@gmail.com','Bangalore']] } },
        output:{ headers:['id','name','email','city'], rows:[[1,'Ravi Kumar','ravi@gmail.com','Mumbai'],[3,'Arjun Mehta','arjun@gmail.com','Bangalore']] },
        explanation:"Rows 1 and 3 have emails ending in @gmail.com. Row 2 uses @yahoo.com so it is excluded."
      }]),
      constraints_list: JSON.stringify(["1 ≤ id ≤ 10⁶","email is always a valid address","The result table can be returned in any order"]),
    },
    {
      title: 'Count Orders Per Status',
      clean_desc: "Count how many orders exist for each `status`.\n\nReturn `status` and `order_count`, ordered by `order_count` descending.",
      table_schema: JSON.stringify([
        { name:'orders', note:'Each row represents one order.', columns:[
          {name:'id',type:'int',key:'PK'},{name:'customer_id',type:'int'},{name:'amount',type:'decimal(10,2)'},{name:'status',type:'varchar(20)'},{name:'order_date',type:'date'}
        ]}
      ]),
      examples: JSON.stringify([{
        input:{ orders:{ headers:['id','customer_id','amount','status','order_date'], rows:[[1,1,1200,'completed','2024-01-10'],[2,2,800,'pending','2024-01-12'],[3,1,3400,'completed','2024-01-15'],[4,3,500,'cancelled','2024-01-16'],[5,2,1100,'pending','2024-01-17']] } },
        output:{ headers:['status','order_count'], rows:[['completed',2],['pending',2],['cancelled',1]] },
        explanation:"completed and pending both appear 2 times, cancelled appears 1 time. Sorted by count descending."
      }]),
      constraints_list: JSON.stringify(["status is one of: 'completed', 'pending', 'cancelled'","1 ≤ orders.id ≤ 10⁶"]),
    },
    {
      title: 'Second Highest Salary',
      clean_desc: "Find the **second highest** salary from the `employees` table.\n\nReturn a single value aliased as `second_highest`.\n\nIf there is no second highest salary, return `null`.",
      table_schema: JSON.stringify([
        { name:'employees', note:'Each row has a unique employee.', columns:[
          {name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'department',type:'varchar(50)'},{name:'salary',type:'decimal(10,2)'},{name:'hire_date',type:'date'},{name:'city',type:'varchar(50)'}
        ]}
      ]),
      examples: JSON.stringify([
        {
          input:{ employees:{ headers:['id','name','department','salary'], rows:[[1,'Ravi','Engineering',90000],[2,'Priya','Marketing',75000],[3,'Arjun','Engineering',90000],[4,'Sneha','HR',60000]] } },
          output:{ headers:['second_highest'], rows:[[75000]] },
          explanation:"The highest salary is 90000 (Ravi & Arjun). The second highest is 75000 (Priya)."
        },
        {
          input:{ employees:{ headers:['id','name','department','salary'], rows:[[1,'Ravi','Engineering',90000]] } },
          output:{ headers:['second_highest'], rows:[[null]] },
          explanation:"Only one distinct salary exists, so second highest is null."
        }
      ]),
      constraints_list: JSON.stringify(["All salary values are positive","salary values may not be unique","Return null if second highest doesn't exist"]),
    },
    {
      title: 'Employees Without a Manager',
      clean_desc: "Return all employees whose `manager_id` is `NULL` — these are the top-level managers.\n\nReturn `id`, `name`, `department`, and `salary`.",
      table_schema: JSON.stringify([
        { name:'employees', note:'manager_id references another employee id, or is NULL for top-level managers.', columns:[
          {name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'department',type:'varchar(50)'},{name:'salary',type:'decimal(10,2)'},{name:'manager_id',type:'int',note:'FK → employees.id'},{name:'hire_date',type:'date'}
        ]}
      ]),
      examples: JSON.stringify([{
        input:{ employees:{ headers:['id','name','department','salary','manager_id'], rows:[[1,'Ravi','Engineering',90000,null],[2,'Priya','Engineering',75000,1],[3,'Arjun','Marketing',70000,null],[4,'Sneha','HR',60000,3]] } },
        output:{ headers:['id','name','department','salary'], rows:[[1,'Ravi','Engineering',90000],[3,'Arjun','Marketing',70000]] },
        explanation:"Ravi (id=1) and Arjun (id=3) have NULL manager_id, so they are top-level managers. Priya reports to Ravi and Sneha reports to Arjun."
      }]),
      constraints_list: JSON.stringify(["1 ≤ id ≤ 10⁶","manager_id references a valid employee or is NULL","At least one employee has NULL manager_id"]),
    },
    {
      title: 'Customers with No Orders',
      clean_desc: "Find all customers who have **never placed an order**.\n\nUse a LEFT JOIN to identify customers without matching orders.\n\nReturn `id`, `name`, and `email`.",
      table_schema: JSON.stringify([
        { name:'customers', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'email',type:'varchar(150)'},{name:'city',type:'varchar(50)'}]},
        { name:'orders', note:'customer_id references customers.id', columns:[{name:'id',type:'int',key:'PK'},{name:'customer_id',type:'int',note:'FK → customers.id'},{name:'amount',type:'decimal(10,2)'},{name:'status',type:'varchar(20)'},{name:'order_date',type:'date'}]}
      ]),
      examples: JSON.stringify([{
        input:{
          customers:{ headers:['id','name','email'], rows:[[1,'Ravi Kumar','ravi@gmail.com'],[2,'Priya Sharma','priya@gmail.com'],[3,'Arjun Mehta','arjun@gmail.com']] },
          orders:{ headers:['id','customer_id','amount'], rows:[[1,1,1200],[2,1,800],[3,2,3400]] }
        },
        output:{ headers:['id','name','email'], rows:[[3,'Arjun Mehta','arjun@gmail.com']] },
        explanation:"Customers 1 and 2 have orders. Customer 3 (Arjun) has no orders, so is returned."
      }]),
      constraints_list: JSON.stringify(["1 ≤ customers.id ≤ 10⁶","Hint: Use LEFT JOIN + WHERE o.id IS NULL"]),
    },
    {
      title: 'Average Order Value by City',
      clean_desc: "Calculate the **average order amount** per city.\n\nReturn `city` and `avg_order_value` rounded to 2 decimal places, ordered by `avg_order_value` descending.",
      table_schema: JSON.stringify([
        { name:'customers', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'email',type:'varchar(150)'},{name:'city',type:'varchar(50)'}]},
        { name:'orders', columns:[{name:'id',type:'int',key:'PK'},{name:'customer_id',type:'int',note:'FK → customers.id'},{name:'amount',type:'decimal(10,2)'},{name:'status',type:'varchar(20)'},{name:'order_date',type:'date'}]}
      ]),
      examples: JSON.stringify([{
        input:{
          customers:{ headers:['id','name','city'], rows:[[1,'Ravi','Mumbai'],[2,'Priya','Delhi'],[3,'Arjun','Mumbai']] },
          orders:{ headers:['id','customer_id','amount'], rows:[[1,1,1200],[2,1,800],[3,2,3400],[4,3,2000]] }
        },
        output:{ headers:['city','avg_order_value'], rows:[['Delhi',3400.00],['Mumbai',1333.33]] },
        explanation:"Mumbai has 3 orders (1200+800+2000)/3=1333.33. Delhi has 1 order (3400). Sorted by avg descending."
      }]),
      constraints_list: JSON.stringify(["Each customer belongs to exactly one city","Use ROUND(AVG(...), 2)","Order by avg_order_value DESC"]),
    },
    {
      title: 'Products Low in Stock',
      clean_desc: "Return all products where `stock` is **below 20**.\n\nShow `name`, `category`, `price`, and `stock`, ordered by `stock` ascending.",
      table_schema: JSON.stringify([
        { name:'products', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'category',type:'varchar(50)'},{name:'price',type:'decimal(10,2)'},{name:'stock',type:'int'}]}
      ]),
      examples: JSON.stringify([{
        input:{ products:{ headers:['id','name','category','price','stock'], rows:[[1,'SQL Book','Books',499,5],[2,'Laptop Stand','Electronics',1200,50],[3,'Notebook','Stationery',99,12],[4,'Monitor','Electronics',8000,3]] } },
        output:{ headers:['name','category','price','stock'], rows:[['Monitor','Electronics',8000,3],['SQL Book','Books',499,5],['Notebook','Stationery',99,12]] },
        explanation:"Monitor (3), SQL Book (5), Notebook (12) are all below 20. Sorted by stock ascending. Laptop Stand has 50 so is excluded."
      }]),
      constraints_list: JSON.stringify(["stock is always a non-negative integer","Return rows WHERE stock < 20","Order by stock ASC"]),
    },
    {
      title: 'Department Headcount & Avg Salary',
      clean_desc: "For each department, return the **number of employees** and **average salary**.\n\nOnly include departments with **2 or more employees**.\n\nReturn `department`, `headcount`, and `avg_salary` (rounded to 0 decimal places).",
      table_schema: JSON.stringify([
        { name:'employees', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'department',type:'varchar(50)'},{name:'salary',type:'decimal(10,2)'},{name:'manager_id',type:'int'},{name:'hire_date',type:'date'}]}
      ]),
      examples: JSON.stringify([{
        input:{ employees:{ headers:['id','name','department','salary'], rows:[[1,'Ravi','Engineering',90000],[2,'Priya','Engineering',75000],[3,'Arjun','Marketing',70000],[4,'Sneha','HR',60000],[5,'Karan','Engineering',80000]] } },
        output:{ headers:['department','headcount','avg_salary'], rows:[['Engineering',3,81667]] },
        explanation:"Engineering has 3 employees (90000+75000+80000)/3=81667. Marketing and HR each have only 1, so they are excluded by HAVING COUNT(*) >= 2."
      }]),
      constraints_list: JSON.stringify(["Use HAVING COUNT(*) >= 2","avg_salary = ROUND(AVG(salary), 0)","Order by headcount DESC"]),
    },
  ];

  // Additional structured data for popular problems
  const MORE_DETAILS = [
    {
      title: 'Monthly Revenue Trend',
      clean_desc: "Show **total revenue per month** formatted as `YYYY-MM`.\n\nOrder by month ascending.",
      table_schema: JSON.stringify([
        { name:'orders', columns:[{name:'id',type:'int',key:'PK'},{name:'customer_id',type:'int'},{name:'amount',type:'decimal(10,2)'},{name:'status',type:'varchar(20)'},{name:'order_date',type:'date'}]}
      ]),
      examples: JSON.stringify([{
        input:{ orders:{ headers:['id','customer_id','amount','order_date'], rows:[[1,1,1200,'2024-01-10'],[2,2,800,'2024-01-22'],[3,1,3400,'2024-02-05'],[4,3,2100,'2024-02-18']] } },
        output:{ headers:['month','total_revenue'], rows:[['2024-01',2000],['2024-02',5500]] },
        explanation:"January: 1200+800=2000. February: 3400+2100=5500. Use strftime('%Y-%m', order_date) to extract month."
      }]),
      constraints_list: JSON.stringify(["Use strftime('%Y-%m', order_date) AS month","Group by the formatted month string","Order by month ASC"]),
    },
    {
      title: 'Running Total of Sales',
      clean_desc: "Calculate a **cumulative running total** of revenue ordered by date.\n\nReturn `date`, `revenue`, and `running_total`.",
      table_schema: JSON.stringify([
        { name:'daily_sales', note:'One row per day.', columns:[{name:'date',type:'date'},{name:'revenue',type:'decimal(12,2)'}]}
      ]),
      examples: JSON.stringify([{
        input:{ daily_sales:{ headers:['date','revenue'], rows:[['2024-01-01',285000],['2024-01-02',312000],['2024-01-03',298000]] } },
        output:{ headers:['date','revenue','running_total'], rows:[['2024-01-01',285000,285000],['2024-01-02',312000,597000],['2024-01-03',298000,895000]] },
        explanation:"Each row adds the current revenue to all previous rows. Use SUM() OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)."
      }]),
      constraints_list: JSON.stringify(["Use window function: SUM(revenue) OVER (ORDER BY date)","ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW","This is a classic window function pattern"]),
    },
    {
      title: 'Previous Day Revenue Comparison',
      clean_desc: "For each day, show `revenue`, the **previous day's revenue** (`prev_revenue`), and the **difference** (`diff`).\n\nUse the `LAG()` window function.",
      table_schema: JSON.stringify([
        { name:'daily_sales', note:'One row per day.', columns:[{name:'date',type:'date'},{name:'revenue',type:'decimal(12,2)'}]}
      ]),
      examples: JSON.stringify([{
        input:{ daily_sales:{ headers:['date','revenue'], rows:[['2024-01-01',285000],['2024-01-02',312000],['2024-01-03',298000]] } },
        output:{ headers:['date','revenue','prev_revenue','diff'], rows:[['2024-01-01',285000,null,null],['2024-01-02',312000,285000,27000],['2024-01-03',298000,312000,-14000]] },
        explanation:"LAG(revenue, 1) gets the previous row's revenue. First row has null (no prior row). diff = revenue - prev_revenue."
      }]),
      constraints_list: JSON.stringify(["Use LAG(revenue, 1) OVER (ORDER BY date)","First row will have NULL for prev_revenue","diff can be negative (revenue decreased)"]),
    },
    {
      title: 'Top 2 Salaries Per Department',
      clean_desc: "Return the **top 2 highest-paid employees** per department.\n\nUse `ROW_NUMBER()` with a CTE.",
      table_schema: JSON.stringify([
        { name:'employees', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'department',type:'varchar(50)'},{name:'salary',type:'decimal(10,2)'},{name:'hire_date',type:'date'}]}
      ]),
      examples: JSON.stringify([{
        input:{ employees:{ headers:['id','name','department','salary'], rows:[[1,'Ravi','Engineering',90000],[2,'Priya','Engineering',75000],[3,'Arjun','Engineering',80000],[4,'Sneha','Marketing',70000],[5,'Karan','Marketing',65000]] } },
        output:{ headers:['name','department','salary'], rows:[['Ravi','Engineering',90000],['Arjun','Engineering',80000],['Sneha','Marketing',70000],['Karan','Marketing',65000]] },
        explanation:"Engineering top 2: Ravi (90k), Arjun (80k). Marketing top 2: Sneha (70k), Karan (65k). Priya (75k) is 3rd in Engineering so excluded."
      }]),
      constraints_list: JSON.stringify(["Use ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)","Filter WHERE rn <= 2 in the outer query","Use a CTE for clean code"]),
    },
    {
      title: 'Rank Customers by Spending',
      clean_desc: "Rank all customers by their **total spend** using `DENSE_RANK()`.\n\nReturn `name`, `total_spent`, and `spend_rank`.",
      table_schema: JSON.stringify([
        { name:'customers', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'email',type:'varchar(150)'},{name:'city',type:'varchar(50)'}]},
        { name:'orders', columns:[{name:'id',type:'int',key:'PK'},{name:'customer_id',type:'int',note:'FK → customers.id'},{name:'amount',type:'decimal(10,2)'},{name:'status',type:'varchar(20)'}]}
      ]),
      examples: JSON.stringify([{
        input:{
          customers:{ headers:['id','name'], rows:[[1,'Ravi'],[2,'Priya'],[3,'Arjun']] },
          orders:{ headers:['id','customer_id','amount'], rows:[[1,1,5000],[2,1,3000],[3,2,8000],[4,3,8000]] }
        },
        output:{ headers:['name','total_spent','spend_rank'], rows:[['Priya',8000,1],['Arjun',8000,1],['Ravi',8000,2]] },
        explanation:"Priya and Arjun both spent 8000 — they share rank 1. DENSE_RANK skips no ranks, so Ravi is rank 2 (not 3)."
      }]),
      constraints_list: JSON.stringify(["Use DENSE_RANK() not RANK()","DENSE_RANK skips no numbers even with ties","Order result by spend_rank ASC"]),
    },
    {
      title: 'Top 3 Products by Revenue',
      clean_desc: "Find the **top 3 products** by total revenue (quantity × unit_price).\n\nReturn `name` and `total_revenue`, ordered by revenue descending.",
      table_schema: JSON.stringify([
        { name:'products', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'category',type:'varchar(50)'},{name:'price',type:'decimal(10,2)'},{name:'stock',type:'int'}]},
        { name:'order_items', note:'Each row is one line item in an order.', columns:[{name:'id',type:'int',key:'PK'},{name:'order_id',type:'int'},{name:'product_id',type:'int',note:'FK → products.id'},{name:'quantity',type:'int'},{name:'unit_price',type:'decimal(10,2)'}]}
      ]),
      examples: JSON.stringify([{
        input:{
          products:{ headers:['id','name','category'], rows:[[1,'SQL Book','Books'],[2,'Laptop Stand','Electronics'],[3,'Notebook','Stationery'],[4,'Webcam','Electronics']] },
          order_items:{ headers:['id','product_id','quantity','unit_price'], rows:[[1,1,10,499],[2,2,5,1200],[3,3,20,99],[4,4,8,2500],[5,1,5,499]] }
        },
        output:{ headers:['name','total_revenue'], rows:[['Webcam',20000],['Laptop Stand',6000],['SQL Book',7480]] },
        explanation:"Webcam: 8×2500=20000. Laptop Stand: 5×1200=6000. SQL Book: (10+5)×499=7485. Top 3 by SUM(quantity×unit_price) with LIMIT 3."
      }]),
      constraints_list: JSON.stringify(["revenue = SUM(quantity * unit_price)","GROUP BY product, then LIMIT 3","ORDER BY total_revenue DESC LIMIT 3"]),
    },
    {
      title: 'Revenue by Product Category',
      clean_desc: "Calculate **total revenue** and **order count** for each product category.\n\nReturn `category`, `order_count`, and `total_revenue`.",
      table_schema: JSON.stringify([
        { name:'products', columns:[{name:'id',type:'int',key:'PK'},{name:'name',type:'varchar(100)'},{name:'category',type:'varchar(50)'},{name:'price',type:'decimal(10,2)'},{name:'stock',type:'int'}]},
        { name:'order_items', columns:[{name:'id',type:'int',key:'PK'},{name:'order_id',type:'int'},{name:'product_id',type:'int',note:'FK → products.id'},{name:'quantity',type:'int'},{name:'unit_price',type:'decimal(10,2)'}]}
      ]),
      examples: JSON.stringify([{
        input:{
          products:{ headers:['id','name','category'], rows:[[1,'SQL Book','Books'],[2,'Laptop Stand','Electronics'],[3,'Webcam','Electronics']] },
          order_items:{ headers:['id','order_id','product_id','quantity','unit_price'], rows:[[1,101,1,3,499],[2,102,2,2,1200],[3,103,3,1,2500],[4,104,1,5,499]] }
        },
        output:{ headers:['category','order_count','total_revenue'], rows:[['Electronics',2,5900],['Books',2,3992]] },
        explanation:"Electronics: 2 distinct orders, 2×1200+1×2500=5900. Books: 2 distinct orders, (3+5)×499=3992."
      }]),
      constraints_list: JSON.stringify(["COUNT(DISTINCT oi.order_id) for order_count","revenue = SUM(quantity * unit_price)","GROUP BY p.category","ORDER BY total_revenue DESC"]),
    },
  ];

  for (const pd of [...PROBLEM_DETAILS, ...MORE_DETAILS]) {
    try {
      if (pd.clean_desc) {
        await run(db, 'UPDATE problems SET description=? WHERE title=? AND (table_schema IS NULL OR table_schema="")',
          [pd.clean_desc, pd.title]);
      }
      await run(db,
        'UPDATE problems SET table_schema=?, examples=?, constraints_list=? WHERE title=? AND (table_schema IS NULL OR table_schema="")',
        [pd.table_schema, pd.examples, pd.constraints_list, pd.title]
      );
    } catch(e) {}
  }

  console.log(`✅ Seeded ${inserted} extra problems (total now: ${count + inserted})`);
}

module.exports = { seedProblems, EXTRA_PROBLEMS };
