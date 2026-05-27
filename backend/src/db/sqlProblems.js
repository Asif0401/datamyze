const SQL_PROBLEMS = [

// ── EASY (40) ─────────────────────────────────────────────────────────────

{ title: 'List Customers From Mumbai',
  description: 'Return id, name, email for all customers whose city is Mumbai.\n\nSchema: customers(id, name, email, city, created_at)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 94,
  starter_code: "SELECT id, name, email\nFROM customers\nWHERE city = 'Mumbai';" },

{ title: 'Orders Above Average Amount',
  description: 'Find all orders where amount is greater than the overall average order amount.\n\nSchema: orders(id, customer_id, amount, status, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 82,
  starter_code: "SELECT *\nFROM orders\nWHERE amount > (SELECT AVG(amount) FROM orders);" },

{ title: 'Count Products Per Category',
  description: 'Return category and product count for each category, sorted by count descending.\n\nSchema: products(id, name, category, price, stock)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 91,
  starter_code: "SELECT category, COUNT(*) AS product_count\nFROM products\nGROUP BY category\nORDER BY product_count DESC;" },

{ title: 'Find Users With NULL Phone',
  description: 'Return id and name of all users whose phone column is NULL.\n\nSchema: users(id, name, email, phone, city, created_at)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 93,
  starter_code: "SELECT id, name\nFROM users\nWHERE phone IS NULL;" },

{ title: 'Total Revenue Per Month',
  description: 'Calculate total revenue grouped by year-month. Return month and total_revenue sorted by month.\n\nSchema: orders(id, amount, status, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 85,
  starter_code: "SELECT strftime('%Y-%m', order_date) AS month,\n  SUM(amount) AS total_revenue\nFROM orders\nGROUP BY month\nORDER BY month;" },

{ title: 'Employees Hired in Last 6 Months',
  description: 'Return name, department, hire_date for employees hired in the last 180 days.\n\nSchema: employees(id, name, department, salary, hire_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 80,
  starter_code: "SELECT name, department, hire_date\nFROM employees\nWHERE hire_date >= DATE('now', '-180 days')\nORDER BY hire_date DESC;" },

{ title: 'Products With Low Stock',
  description: 'Find all products where stock is less than 10. Return name, category, stock ordered by stock ascending.\n\nSchema: products(id, name, category, price, stock)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 92,
  starter_code: "SELECT name, category, stock\nFROM products\nWHERE stock < 10\nORDER BY stock ASC;" },

{ title: 'Distinct Cities In Customer Base',
  description: 'Return a unique list of cities where customers are located, sorted alphabetically.\n\nSchema: customers(id, name, email, city)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 95,
  starter_code: "SELECT DISTINCT city\nFROM customers\nORDER BY city;" },

{ title: 'Average Salary By Department',
  description: 'Return department and average salary, rounded to 2 decimal places. Order by avg_salary descending.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 90,
  starter_code: "SELECT department,\n  ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nGROUP BY department\nORDER BY avg_salary DESC;" },

{ title: 'Cancelled Orders Count Per Day',
  description: 'Count how many orders were cancelled on each date. Return order_date and cancel_count.\n\nSchema: orders(id, customer_id, amount, status, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 87,
  starter_code: "SELECT order_date, COUNT(*) AS cancel_count\nFROM orders\nWHERE status = 'cancelled'\nGROUP BY order_date\nORDER BY order_date;" },

{ title: 'Top City By Customer Count',
  description: 'Find the single city with the most customers.\n\nSchema: customers(id, name, email, city)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 84,
  starter_code: "SELECT city, COUNT(*) AS customer_count\nFROM customers\nGROUP BY city\nORDER BY customer_count DESC\nLIMIT 1;" },

{ title: 'Orders Placed On Weekends',
  description: 'Return all orders placed on Saturday (6) or Sunday (0). Use strftime weekday.\n\nSchema: orders(id, customer_id, amount, status, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 72,
  starter_code: "SELECT *\nFROM orders\nWHERE strftime('%w', order_date) IN ('0', '6');" },

{ title: 'Products Priced Between 500 and 2000',
  description: 'List product name and price for items priced between ₹500 and ₹2000 inclusive.\n\nSchema: products(id, name, category, price)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 93,
  starter_code: "SELECT name, price\nFROM products\nWHERE price BETWEEN 500 AND 2000\nORDER BY price;" },

{ title: 'Latest Order Per Customer',
  description: 'Return customer_id and their most recent order_date.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 86,
  starter_code: "SELECT customer_id, MAX(order_date) AS latest_order\nFROM orders\nGROUP BY customer_id;" },

{ title: 'Employees With Salary Above 80000',
  description: 'Return name, department, salary for employees earning more than 80,000 sorted by salary desc.\n\nSchema: employees(id, name, department, salary, hire_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 92,
  starter_code: "SELECT name, department, salary\nFROM employees\nWHERE salary > 80000\nORDER BY salary DESC;" },

{ title: 'Orders With Discount Applied',
  description: 'Find all orders where discount_amount > 0. Return id, amount, discount_amount, net_amount.\n\nSchema: orders(id, customer_id, amount, discount_amount, status, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 88,
  starter_code: "SELECT id, amount, discount_amount,\n  (amount - discount_amount) AS net_amount\nFROM orders\nWHERE discount_amount > 0;" },

{ title: 'Max and Min Product Price Per Category',
  description: 'Return category, max_price, min_price and price_range for each product category.\n\nSchema: products(id, name, category, price)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 83,
  starter_code: "SELECT category,\n  MAX(price) AS max_price,\n  MIN(price) AS min_price,\n  MAX(price) - MIN(price) AS price_range\nFROM products\nGROUP BY category;" },

{ title: 'Users Registered in 2024',
  description: 'Count total users who registered in the year 2024.\n\nSchema: users(id, name, email, created_at)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 89,
  starter_code: "SELECT COUNT(*) AS users_2024\nFROM users\nWHERE strftime('%Y', created_at) = '2024';" },

{ title: 'Products Containing "Pro" In Name',
  description: 'Find all products whose name contains the word "Pro" (case-insensitive).\n\nSchema: products(id, name, category, price)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 88,
  starter_code: "SELECT id, name, category, price\nFROM products\nWHERE name LIKE '%Pro%';" },

{ title: 'Total Orders And Revenue Per Customer',
  description: 'Return customer_id, order_count, and total_spent for every customer.\n\nSchema: orders(id, customer_id, amount, status)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 85,
  starter_code: "SELECT customer_id,\n  COUNT(*) AS order_count,\n  SUM(amount) AS total_spent\nFROM orders\nGROUP BY customer_id\nORDER BY total_spent DESC;" },

{ title: 'Customers Who Ordered In January 2024',
  description: 'Find distinct customer_ids who placed at least one order in January 2024.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 81,
  starter_code: "SELECT DISTINCT customer_id\nFROM orders\nWHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';" },

{ title: 'Department With Most Employees',
  description: 'Return the department name and employee count for the department with the highest headcount.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 82,
  starter_code: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nORDER BY headcount DESC\nLIMIT 1;" },

{ title: 'Products Never Ordered',
  description: 'Find products that have never appeared in any order.\n\nSchema:\n  products(id, name, category)\n  order_items(id, order_id, product_id, quantity)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 74,
  starter_code: "SELECT p.id, p.name, p.category\nFROM products p\nLEFT JOIN order_items oi ON p.id = oi.product_id\nWHERE oi.product_id IS NULL;" },

{ title: 'Sum Revenue For Completed Orders Only',
  description: 'Return total revenue only from orders with status = "completed".\n\nSchema: orders(id, customer_id, amount, status)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 91,
  starter_code: "SELECT SUM(amount) AS completed_revenue\nFROM orders\nWHERE status = 'completed';" },

{ title: 'Order Count By Status',
  description: 'Return each status value and the count of orders with that status, sorted alphabetically by status.\n\nSchema: orders(id, customer_id, amount, status)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 93,
  starter_code: "SELECT status, COUNT(*) AS count\nFROM orders\nGROUP BY status\nORDER BY status;" },

{ title: 'Customer Full Name Concatenation',
  description: 'Return full_name (first_name + space + last_name) and email for all customers.\n\nSchema: customers(id, first_name, last_name, email, city)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 90,
  starter_code: "SELECT (first_name || ' ' || last_name) AS full_name, email\nFROM customers;" },

{ title: 'Find Orders In A Date Range',
  description: 'Return all orders placed between 2024-03-01 and 2024-03-31 inclusive.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 92,
  starter_code: "SELECT *\nFROM orders\nWHERE order_date BETWEEN '2024-03-01' AND '2024-03-31'\nORDER BY order_date;" },

{ title: 'Salary Bracket Classification',
  description: 'Classify employees into Low (<40k), Mid (40k–80k), High (>80k) salary brackets using CASE WHEN.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 77,
  starter_code: "SELECT name, salary,\n  CASE\n    WHEN salary < 40000 THEN 'Low'\n    WHEN salary BETWEEN 40000 AND 80000 THEN 'Mid'\n    ELSE 'High'\n  END AS salary_bracket\nFROM employees;" },

{ title: 'Revenue Contribution Percentage',
  description: 'Return category and its percentage of total revenue.\n\nSchema:\n  products(id, category)\n  order_items(id, product_id, quantity, unit_price)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 71,
  starter_code: "SELECT p.category,\n  ROUND(SUM(oi.quantity * oi.unit_price) * 100.0 /\n    (SELECT SUM(quantity * unit_price) FROM order_items), 2) AS pct\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY pct DESC;" },

{ title: 'Users Who Never Placed An Order',
  description: 'Find all users who have never placed any order.\n\nSchema:\n  users(id, name, email)\n  orders(id, customer_id, amount)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 79,
  starter_code: "SELECT u.id, u.name, u.email\nFROM users u\nLEFT JOIN orders o ON u.id = o.customer_id\nWHERE o.id IS NULL;" },

{ title: 'Count Orders Per Hour Of Day',
  description: 'Count how many orders are placed in each hour of the day (0–23).\n\nSchema: orders(id, customer_id, amount, created_at)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 75,
  starter_code: "SELECT strftime('%H', created_at) AS hour_of_day,\n  COUNT(*) AS order_count\nFROM orders\nGROUP BY hour_of_day\nORDER BY hour_of_day;" },

{ title: 'Top 10 Highest Paid Employees',
  description: 'Return the top 10 employees by salary with their name and department.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 93,
  starter_code: "SELECT name, department, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 10;" },

{ title: 'Count Customers Per City',
  description: 'Return city and customer_count for each city, ordered by count descending.\n\nSchema: customers(id, name, email, city)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 92,
  starter_code: "SELECT city, COUNT(*) AS customer_count\nFROM customers\nGROUP BY city\nORDER BY customer_count DESC;" },

{ title: 'Find High Value Orders',
  description: 'Return orders where amount > 5000 along with customer name.\n\nSchema:\n  orders(id, customer_id, amount, order_date)\n  customers(id, name)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 85,
  starter_code: "SELECT o.id, c.name, o.amount, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.amount > 5000\nORDER BY o.amount DESC;" },

{ title: 'Employee Count By City',
  description: 'Return city and number of employees in that city.\n\nSchema: employees(id, name, department, salary, city)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 91,
  starter_code: "SELECT city, COUNT(*) AS emp_count\nFROM employees\nGROUP BY city\nORDER BY emp_count DESC;" },

{ title: 'Orders With Items Count',
  description: 'Return order_id and the number of distinct items in each order.\n\nSchema: order_items(id, order_id, product_id, quantity)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 84,
  starter_code: "SELECT order_id, COUNT(DISTINCT product_id) AS item_count\nFROM order_items\nGROUP BY order_id\nORDER BY item_count DESC;" },

{ title: 'Average Days Between Signup and First Order',
  description: 'Calculate average number of days between user signup and their first order.\n\nSchema:\n  users(id, created_at)\n  orders(id, customer_id, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 68,
  starter_code: "SELECT ROUND(AVG(\n  julianday(MIN(o.order_date)) - julianday(u.created_at)\n), 1) AS avg_days_to_first_order\nFROM users u\nJOIN orders o ON u.id = o.customer_id\nGROUP BY u.id;" },

{ title: 'Filter Orders Using IN Clause',
  description: 'Return all orders where status is either "pending" or "processing".\n\nSchema: orders(id, customer_id, amount, status, order_date)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 93,
  starter_code: "SELECT *\nFROM orders\nWHERE status IN ('pending', 'processing')\nORDER BY order_date DESC;" },

{ title: 'Revenue Per Delivery City',
  description: 'Sum revenue by delivery_city from orders. Return city and total_revenue.\n\nSchema: orders(id, customer_id, amount, delivery_city, status)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 87,
  starter_code: "SELECT delivery_city, SUM(amount) AS total_revenue\nFROM orders\nGROUP BY delivery_city\nORDER BY total_revenue DESC;" },

{ title: 'Customer Order Summary With Name',
  description: 'Join customers and orders to return customer name, order count, and total spend.\n\nSchema:\n  customers(id, name, email)\n  orders(id, customer_id, amount)',
  difficulty: 'Easy', topic: 'SQL', xp_reward: 30, acceptance_rate: 83,
  starter_code: "SELECT c.name,\n  COUNT(o.id) AS order_count,\n  SUM(o.amount) AS total_spend\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY total_spend DESC;" },


// ── MEDIUM (50) ────────────────────────────────────────────────────────────

{ title: 'Rank Customers By Monthly Spend',
  description: 'Rank customers by their total spend in each month using RANK(). Return month, customer_id, total_spend, rank.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 58,
  starter_code: "SELECT\n  strftime('%Y-%m', order_date) AS month,\n  customer_id,\n  SUM(amount) AS total_spend,\n  RANK() OVER (PARTITION BY strftime('%Y-%m', order_date) ORDER BY SUM(amount) DESC) AS rnk\nFROM orders\nGROUP BY month, customer_id;" },

{ title: 'First And Last Order Per Customer',
  description: 'Return customer_id, first_order_date, last_order_date and days_active (difference) for each customer.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 62,
  starter_code: "SELECT customer_id,\n  MIN(order_date) AS first_order,\n  MAX(order_date) AS last_order,\n  CAST(julianday(MAX(order_date)) - julianday(MIN(order_date)) AS INT) AS days_active\nFROM orders\nGROUP BY customer_id;" },

{ title: 'Running Total Of Daily Revenue',
  description: 'Calculate cumulative revenue day by day using a window function.\n\nSchema: orders(id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 55,
  starter_code: "SELECT order_date,\n  SUM(amount) AS daily_revenue,\n  SUM(SUM(amount)) OVER (ORDER BY order_date) AS cumulative_revenue\nFROM orders\nGROUP BY order_date\nORDER BY order_date;" },

{ title: 'Week Over Week Order Growth',
  description: 'Calculate WoW change in order count using LAG window function.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 49,
  starter_code: "WITH weekly AS (\n  SELECT strftime('%Y-%W', order_date) AS week,\n    COUNT(*) AS order_count\n  FROM orders\n  GROUP BY week\n)\nSELECT week, order_count,\n  LAG(order_count) OVER (ORDER BY week) AS prev_week,\n  ROUND((order_count - LAG(order_count) OVER (ORDER BY week)) * 100.0 /\n    LAG(order_count) OVER (ORDER BY week), 2) AS wow_pct\nFROM weekly;" },

{ title: 'Top Product Per Category',
  description: 'Find the best-selling product (by revenue) in each category using ROW_NUMBER.\n\nSchema:\n  products(id, name, category)\n  order_items(id, product_id, quantity, unit_price)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 51,
  starter_code: "WITH ranked AS (\n  SELECT p.category, p.name,\n    SUM(oi.quantity * oi.unit_price) AS revenue,\n    ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category, p.id\n)\nSELECT category, name, revenue\nFROM ranked WHERE rn = 1;" },

{ title: 'Employee Salary Percentile',
  description: 'Show each employee with their salary percentile within their department using PERCENT_RANK.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 44,
  starter_code: "SELECT name, department, salary,\n  ROUND(PERCENT_RANK() OVER (PARTITION BY department ORDER BY salary) * 100, 1) AS percentile\nFROM employees;" },

{ title: 'Customers With 3+ Orders',
  description: 'Find customers who placed 3 or more orders. Return customer_id and order_count.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 66,
  starter_code: "SELECT customer_id, COUNT(*) AS order_count\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) >= 3\nORDER BY order_count DESC;" },

{ title: 'Month With Peak Sales For Each Year',
  description: 'Find the month with highest revenue for each year.\n\nSchema: orders(id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 47,
  starter_code: "WITH monthly AS (\n  SELECT strftime('%Y', order_date) AS yr,\n    strftime('%m', order_date) AS mo,\n    SUM(amount) AS revenue,\n    RANK() OVER (PARTITION BY strftime('%Y', order_date) ORDER BY SUM(amount) DESC) AS rn\n  FROM orders\n  GROUP BY yr, mo\n)\nSELECT yr, mo, revenue FROM monthly WHERE rn = 1;" },

{ title: 'Year Over Year Revenue Comparison',
  description: 'Return year, total revenue, previous year revenue, and YoY growth %.\n\nSchema: orders(id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 52,
  starter_code: "WITH yr AS (\n  SELECT strftime('%Y', order_date) AS year,\n    SUM(amount) AS revenue\n  FROM orders GROUP BY year\n)\nSELECT year, revenue,\n  LAG(revenue) OVER (ORDER BY year) AS prev_year,\n  ROUND((revenue - LAG(revenue) OVER (ORDER BY year)) * 100.0 /\n    LAG(revenue) OVER (ORDER BY year), 2) AS yoy_pct\nFROM yr;" },

{ title: 'Rolling 30-Day Revenue',
  description: 'Calculate a 30-day rolling sum of revenue for each day.\n\nSchema: daily_sales(date, revenue)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 48,
  starter_code: "SELECT date, revenue,\n  SUM(revenue) OVER (\n    ORDER BY date\n    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW\n  ) AS rolling_30d\nFROM daily_sales\nORDER BY date;" },

{ title: 'Customer Lifetime Value With CTE',
  description: 'Use a CTE to calculate CLV per customer: total_orders, total_spent, avg_order_value.\n\nSchema: orders(id, customer_id, amount)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 60,
  starter_code: "WITH clv AS (\n  SELECT customer_id,\n    COUNT(*) AS total_orders,\n    SUM(amount) AS total_spent,\n    ROUND(AVG(amount), 2) AS avg_order_value\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT * FROM clv\nORDER BY total_spent DESC;" },

{ title: 'Duplicate Email Detection',
  description: 'Find emails that appear more than once in the users table. Return email and count.\n\nSchema: users(id, name, email, created_at)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 67,
  starter_code: "SELECT email, COUNT(*) AS occurrences\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC;" },

{ title: 'Funnel Step Completion Rate',
  description: 'Given a funnel_events table, calculate completion rate for each step as % of step 1 users.\n\nSchema: funnel_events(user_id, step, event_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 42,
  starter_code: "WITH step_counts AS (\n  SELECT step, COUNT(DISTINCT user_id) AS users\n  FROM funnel_events\n  GROUP BY step\n),\nbase AS (SELECT users AS total FROM step_counts WHERE step = 1)\nSELECT s.step, s.users,\n  ROUND(s.users * 100.0 / b.total, 2) AS pct_of_step1\nFROM step_counts s, base b\nORDER BY s.step;" },

{ title: 'Find Gaps In Daily Revenue Data',
  description: 'Identify dates with no revenue using a recursive CTE to generate a date range.\n\nSchema: daily_sales(date, revenue)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 38,
  starter_code: "WITH RECURSIVE dates(d) AS (\n  SELECT MIN(date) FROM daily_sales\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM dates\n  WHERE d < (SELECT MAX(date) FROM daily_sales)\n)\nSELECT d AS missing_date\nFROM dates\nWHERE d NOT IN (SELECT date FROM daily_sales);" },

{ title: 'Customer Segment by Spend Quartile',
  description: 'Assign customers to spend quartiles (Q1–Q4) using NTILE.\n\nSchema: orders(id, customer_id, amount)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 50,
  starter_code: "SELECT customer_id,\n  SUM(amount) AS total_spend,\n  NTILE(4) OVER (ORDER BY SUM(amount)) AS quartile\nFROM orders\nGROUP BY customer_id;" },

{ title: 'Compare Employee Salary To Dept Average',
  description: 'Show each employee with their salary and how it compares to their department average.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 55,
  starter_code: "SELECT name, department, salary,\n  ROUND(AVG(salary) OVER (PARTITION BY department), 2) AS dept_avg,\n  ROUND(salary - AVG(salary) OVER (PARTITION BY department), 2) AS diff_from_avg\nFROM employees;" },

{ title: 'Revenue Per Product With Running Total',
  description: 'For each product, show revenue and cumulative revenue sorted by revenue descending.\n\nSchema:\n  products(id, name)\n  order_items(id, product_id, quantity, unit_price)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 53,
  starter_code: "SELECT p.name,\n  SUM(oi.quantity * oi.unit_price) AS revenue,\n  SUM(SUM(oi.quantity * oi.unit_price)) OVER (\n    ORDER BY SUM(oi.quantity * oi.unit_price) DESC\n  ) AS cumulative\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id, p.name;" },

{ title: 'Days Since Last Order Per Customer',
  description: 'Calculate how many days since each customer last placed an order.\n\nSchema: orders(id, customer_id, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 61,
  starter_code: "SELECT customer_id,\n  MAX(order_date) AS last_order,\n  CAST(julianday('now') - julianday(MAX(order_date)) AS INT) AS days_since\nFROM orders\nGROUP BY customer_id\nORDER BY days_since DESC;" },

{ title: 'Customers At Risk of Churning',
  description: 'Flag customers who have not ordered in the last 90 days as at_risk.\n\nSchema: orders(id, customer_id, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 59,
  starter_code: "SELECT customer_id,\n  MAX(order_date) AS last_order,\n  CAST(julianday('now') - julianday(MAX(order_date)) AS INT) AS inactive_days,\n  CASE WHEN julianday('now') - julianday(MAX(order_date)) > 90 THEN 'at_risk' ELSE 'active' END AS status\nFROM orders\nGROUP BY customer_id;" },

{ title: 'Product Revenue Share Within Category',
  description: 'Show each product revenue as a percentage of its category total.\n\nSchema:\n  products(id, name, category)\n  order_items(id, product_id, quantity, unit_price)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 46,
  starter_code: "SELECT p.name, p.category,\n  SUM(oi.quantity * oi.unit_price) AS revenue,\n  ROUND(SUM(oi.quantity * oi.unit_price) * 100.0 /\n    SUM(SUM(oi.quantity * oi.unit_price)) OVER (PARTITION BY p.category), 2) AS pct_of_category\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.id, p.name, p.category;" },

{ title: 'Lead Time Analysis',
  description: 'For each order, compute days between order_date and delivery_date. Return avg, min, max lead time per city.\n\nSchema: orders(id, customer_id, city, order_date, delivery_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 57,
  starter_code: "SELECT city,\n  ROUND(AVG(julianday(delivery_date) - julianday(order_date)), 1) AS avg_days,\n  MIN(CAST(julianday(delivery_date) - julianday(order_date) AS INT)) AS min_days,\n  MAX(CAST(julianday(delivery_date) - julianday(order_date) AS INT)) AS max_days\nFROM orders\nWHERE delivery_date IS NOT NULL\nGROUP BY city;" },

{ title: 'Monthly Active Users (MAU)',
  description: 'Count distinct users who performed any activity each month.\n\nSchema: user_events(user_id, event_type, event_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 63,
  starter_code: "SELECT strftime('%Y-%m', event_date) AS month,\n  COUNT(DISTINCT user_id) AS mau\nFROM user_events\nGROUP BY month\nORDER BY month;" },

{ title: 'Returning Customers Rate',
  description: 'Calculate the % of customers who placed more than 1 order.\n\nSchema: orders(id, customer_id, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 54,
  starter_code: "SELECT\n  ROUND(\n    COUNT(CASE WHEN order_count > 1 THEN 1 END) * 100.0 / COUNT(*), 2\n  ) AS returning_pct\nFROM (\n  SELECT customer_id, COUNT(*) AS order_count\n  FROM orders GROUP BY customer_id\n);" },

{ title: 'Dense Rank Employees By Salary',
  description: 'Assign DENSE_RANK to employees within each department by salary. Show ties correctly.\n\nSchema: employees(id, name, department, salary)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 60,
  starter_code: "SELECT name, department, salary,\n  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank\nFROM employees;" },

{ title: 'Average Revenue Per User (ARPU)',
  description: 'Calculate total revenue / distinct users who ordered for each month.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 56,
  starter_code: "SELECT strftime('%Y-%m', order_date) AS month,\n  SUM(amount) AS revenue,\n  COUNT(DISTINCT customer_id) AS users,\n  ROUND(SUM(amount) / COUNT(DISTINCT customer_id), 2) AS arpu\nFROM orders\nGROUP BY month\nORDER BY month;" },

{ title: 'Employees Earning More Than Their Manager',
  description: 'Find employees whose salary is higher than their manager salary.\n\nSchema: employees(id, name, salary, manager_id)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 48,
  starter_code: "SELECT e.name AS employee, e.salary,\n  m.name AS manager, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE e.salary > m.salary;" },

{ title: 'Product Return Rate',
  description: 'Calculate return rate (returns / total orders) per product.\n\nSchema:\n  order_items(id, order_id, product_id, quantity)\n  returns(id, order_item_id, reason)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 43,
  starter_code: "SELECT oi.product_id,\n  COUNT(DISTINCT oi.id) AS total_orders,\n  COUNT(DISTINCT r.id) AS returns,\n  ROUND(COUNT(DISTINCT r.id) * 100.0 / COUNT(DISTINCT oi.id), 2) AS return_rate\nFROM order_items oi\nLEFT JOIN returns r ON oi.id = r.order_item_id\nGROUP BY oi.product_id;" },

{ title: 'Revenue Before And After Discount',
  description: 'For each order, show gross_revenue and net_revenue (after discount). Aggregate by month.\n\nSchema: orders(id, amount, discount_amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 65,
  starter_code: "SELECT strftime('%Y-%m', order_date) AS month,\n  SUM(amount) AS gross_revenue,\n  SUM(amount - discount_amount) AS net_revenue,\n  SUM(discount_amount) AS total_discount\nFROM orders\nGROUP BY month;" },

{ title: 'Top 3 Customers Per City',
  description: 'Find the top 3 customers by spend in each city using ROW_NUMBER.\n\nSchema:\n  customers(id, name, city)\n  orders(id, customer_id, amount)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 44,
  starter_code: "WITH ranked AS (\n  SELECT c.city, c.name, SUM(o.amount) AS spend,\n    ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(o.amount) DESC) AS rn\n  FROM customers c\n  JOIN orders o ON c.id = o.customer_id\n  GROUP BY c.city, c.id\n)\nSELECT city, name, spend FROM ranked WHERE rn <= 3;" },

{ title: 'Order Frequency Distribution',
  description: 'Group customers by how many orders they placed (1, 2, 3, 4, 5+). Return bucket and customer_count.\n\nSchema: orders(id, customer_id)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 50,
  starter_code: "WITH counts AS (\n  SELECT customer_id, COUNT(*) AS n\n  FROM orders GROUP BY customer_id\n)\nSELECT\n  CASE WHEN n >= 5 THEN '5+' ELSE CAST(n AS TEXT) END AS order_bucket,\n  COUNT(*) AS customers\nFROM counts\nGROUP BY order_bucket\nORDER BY order_bucket;" },

{ title: 'Monthly Revenue With MoM Delta',
  description: 'Show month, revenue, and absolute MoM change using LAG.\n\nSchema: orders(id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 53,
  starter_code: "WITH m AS (\n  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue\n  FROM orders GROUP BY month\n)\nSELECT month, revenue,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS mom_delta\nFROM m;" },

{ title: 'Category Revenue Trend (Last 6 Months)',
  description: 'Show monthly revenue per product category for the last 6 months.\n\nSchema:\n  products(id, category)\n  order_items(id, product_id, quantity, unit_price, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 48,
  starter_code: "SELECT strftime('%Y-%m', oi.order_date) AS month,\n  p.category,\n  SUM(oi.quantity * oi.unit_price) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nWHERE oi.order_date >= DATE('now', '-6 months')\nGROUP BY month, p.category\nORDER BY month, p.category;" },

{ title: 'New User Acquisition Per Week',
  description: 'Count new users registered each ISO week.\n\nSchema: users(id, name, email, created_at)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 61,
  starter_code: "SELECT strftime('%Y-%W', created_at) AS week,\n  COUNT(*) AS new_users\nFROM users\nGROUP BY week\nORDER BY week;" },

{ title: 'Inventory Reorder Alert',
  description: 'Find products where stock < reorder_level. Join with supplier name.\n\nSchema:\n  products(id, name, stock, reorder_level, supplier_id)\n  suppliers(id, name)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 62,
  starter_code: "SELECT p.name AS product, p.stock, p.reorder_level,\n  s.name AS supplier\nFROM products p\nJOIN suppliers s ON p.supplier_id = s.id\nWHERE p.stock < p.reorder_level\nORDER BY (p.reorder_level - p.stock) DESC;" },

{ title: 'Session Duration Analysis',
  description: 'Calculate average, median-approx, min and max session duration per device_type.\n\nSchema: sessions(id, user_id, device_type, duration_seconds, started_at)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 55,
  starter_code: "SELECT device_type,\n  ROUND(AVG(duration_seconds)/60.0, 2) AS avg_mins,\n  MIN(duration_seconds) AS min_secs,\n  MAX(duration_seconds) AS max_secs,\n  COUNT(*) AS sessions\nFROM sessions\nGROUP BY device_type\nORDER BY avg_mins DESC;" },

{ title: 'Campaign Conversion Rate',
  description: 'Calculate conversion rate (orders / clicks) per campaign.\n\nSchema:\n  campaigns(id, name, clicks, campaign_date)\n  orders(id, campaign_id, amount)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 58,
  starter_code: "SELECT c.name,\n  c.clicks,\n  COUNT(o.id) AS conversions,\n  ROUND(COUNT(o.id) * 100.0 / NULLIF(c.clicks, 0), 2) AS conversion_rate\nFROM campaigns c\nLEFT JOIN orders o ON c.id = o.campaign_id\nGROUP BY c.id, c.name, c.clicks;" },

{ title: 'Identify High Frequency Buyers',
  description: 'Find customers who placed orders in at least 4 out of the last 6 months.\n\nSchema: orders(id, customer_id, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 41,
  starter_code: "SELECT customer_id, COUNT(DISTINCT strftime('%Y-%m', order_date)) AS active_months\nFROM orders\nWHERE order_date >= DATE('now', '-6 months')\nGROUP BY customer_id\nHAVING COUNT(DISTINCT strftime('%Y-%m', order_date)) >= 4;" },

{ title: 'Order Value Decile Analysis',
  description: 'Divide all orders into 10 deciles by amount and show avg order value per decile.\n\nSchema: orders(id, customer_id, amount)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 43,
  starter_code: "SELECT decile, COUNT(*) AS orders,\n  ROUND(AVG(amount), 2) AS avg_amount,\n  ROUND(MIN(amount), 2) AS min_amount,\n  ROUND(MAX(amount), 2) AS max_amount\nFROM (\n  SELECT amount, NTILE(10) OVER (ORDER BY amount) AS decile\n  FROM orders\n)\nGROUP BY decile ORDER BY decile;" },

{ title: 'Customer Purchase Interval',
  description: 'For customers with multiple orders, calculate average days between consecutive orders.\n\nSchema: orders(id, customer_id, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 40,
  starter_code: "WITH intervals AS (\n  SELECT customer_id,\n    julianday(order_date) - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) AS gap\n  FROM orders\n)\nSELECT customer_id,\n  ROUND(AVG(gap), 1) AS avg_days_between_orders\nFROM intervals\nWHERE gap IS NOT NULL\nGROUP BY customer_id;" },

{ title: 'Revenue From New vs Existing Customers',
  description: 'Classify each order as "new" (first order) or "existing" and sum revenue by type per month.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 44,
  starter_code: "WITH ranked AS (\n  SELECT customer_id, amount, order_date,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn\n  FROM orders\n)\nSELECT strftime('%Y-%m', order_date) AS month,\n  SUM(CASE WHEN rn = 1 THEN amount ELSE 0 END) AS new_revenue,\n  SUM(CASE WHEN rn > 1 THEN amount ELSE 0 END) AS existing_revenue\nFROM ranked\nGROUP BY month ORDER BY month;" },

{ title: 'Product Pair Frequency',
  description: 'Find pairs of products that appear together in the same order most frequently.\n\nSchema: order_items(id, order_id, product_id)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 35,
  starter_code: "SELECT a.product_id AS product_a, b.product_id AS product_b,\n  COUNT(*) AS co_occurrences\nFROM order_items a\nJOIN order_items b ON a.order_id = b.order_id AND a.product_id < b.product_id\nGROUP BY a.product_id, b.product_id\nORDER BY co_occurrences DESC\nLIMIT 20;" },

{ title: 'Pivot Orders By Quarter',
  description: 'Show total revenue per category for Q1, Q2, Q3, Q4 using CASE WHEN pivot.\n\nSchema:\n  products(id, category)\n  order_items(id, product_id, quantity, unit_price, order_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 42,
  starter_code: "SELECT p.category,\n  SUM(CASE WHEN strftime('%m',oi.order_date) BETWEEN '01' AND '03' THEN oi.quantity*oi.unit_price ELSE 0 END) AS Q1,\n  SUM(CASE WHEN strftime('%m',oi.order_date) BETWEEN '04' AND '06' THEN oi.quantity*oi.unit_price ELSE 0 END) AS Q2,\n  SUM(CASE WHEN strftime('%m',oi.order_date) BETWEEN '07' AND '09' THEN oi.quantity*oi.unit_price ELSE 0 END) AS Q3,\n  SUM(CASE WHEN strftime('%m',oi.order_date) BETWEEN '10' AND '12' THEN oi.quantity*oi.unit_price ELSE 0 END) AS Q4\nFROM order_items oi JOIN products p ON p.id=oi.product_id\nGROUP BY p.category;" },

{ title: 'Employee Promotion Eligibility',
  description: 'Flag employees with salary below dept median AND tenure > 2 years as eligible for promotion.\n\nSchema: employees(id, name, department, salary, hire_date)',
  difficulty: 'Medium', topic: 'SQL', xp_reward: 100, acceptance_rate: 39,
  starter_code: "WITH dept_median AS (\n  SELECT department,\n    AVG(salary) AS median_approx\n  FROM employees GROUP BY department\n)\nSELECT e.name, e.department, e.salary, e.hire_date,\n  CASE WHEN e.salary < dm.median_approx\n    AND julianday('now') - julianday(e.hire_date) > 730\n  THEN 'Eligible' ELSE 'Not Eligible' END AS promotion_flag\nFROM employees e\nJOIN dept_median dm ON e.department = dm.department;" },


// ── HARD (40) ─────────────────────────────────────────────────────────────

{ title: 'RFM Customer Segmentation',
  description: 'Score customers on Recency (days since last order), Frequency (order count), Monetary (total spend). Score each 1–5 and create an RFM segment.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 28,
  starter_code: "WITH rfm_raw AS (\n  SELECT customer_id,\n    CAST(julianday('now') - julianday(MAX(order_date)) AS INT) AS recency,\n    COUNT(*) AS frequency,\n    SUM(amount) AS monetary\n  FROM orders GROUP BY customer_id\n),\nscored AS (\n  SELECT *,\n    NTILE(5) OVER (ORDER BY recency ASC) AS r_score,\n    NTILE(5) OVER (ORDER BY frequency DESC) AS f_score,\n    NTILE(5) OVER (ORDER BY monetary DESC) AS m_score\n  FROM rfm_raw\n)\nSELECT customer_id, recency, frequency, monetary,\n  r_score, f_score, m_score,\n  (r_score + f_score + m_score) AS rfm_total,\n  CASE\n    WHEN r_score >= 4 AND f_score >= 4 THEN 'Champion'\n    WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal'\n    WHEN r_score >= 4 AND f_score <= 2 THEN 'New Customer'\n    WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'\n    ELSE 'Others'\n  END AS segment\nFROM scored;" },

{ title: 'User Retention Cohort Table',
  description: 'Build a cohort retention table: for each signup cohort, show what % of users were active 1, 2, 3 months later.\n\nSchema:\n  users(id, signup_date)\n  sessions(user_id, session_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 22,
  starter_code: "WITH cohorts AS (\n  SELECT id AS user_id,\n    strftime('%Y-%m', signup_date) AS cohort\n  FROM users\n),\nactivity AS (\n  SELECT c.user_id, c.cohort,\n    CAST((julianday(s.session_date) - julianday(c.cohort || '-01')) / 30 AS INT) AS month_number\n  FROM cohorts c\n  JOIN sessions s ON s.user_id = c.user_id\n)\nSELECT cohort,\n  COUNT(DISTINCT user_id) AS cohort_size,\n  COUNT(DISTINCT CASE WHEN month_number = 1 THEN user_id END) AS m1,\n  COUNT(DISTINCT CASE WHEN month_number = 2 THEN user_id END) AS m2,\n  COUNT(DISTINCT CASE WHEN month_number = 3 THEN user_id END) AS m3\nFROM activity\nGROUP BY cohort ORDER BY cohort;" },

{ title: 'Revenue Waterfall Analysis',
  description: 'Decompose revenue change between two periods into: new customers, churned customers, and upsell/downsell from existing customers.\n\nSchema: orders(id, customer_id, amount, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 19,
  starter_code: "WITH p1 AS (\n  SELECT customer_id, SUM(amount) AS rev\n  FROM orders WHERE strftime('%Y-%m', order_date) = '2024-01'\n  GROUP BY customer_id\n),\np2 AS (\n  SELECT customer_id, SUM(amount) AS rev\n  FROM orders WHERE strftime('%Y-%m', order_date) = '2024-02'\n  GROUP BY customer_id\n)\nSELECT\n  SUM(CASE WHEN p1.customer_id IS NULL THEN p2.rev ELSE 0 END) AS new_revenue,\n  SUM(CASE WHEN p2.customer_id IS NULL THEN -p1.rev ELSE 0 END) AS churned_revenue,\n  SUM(CASE WHEN p1.customer_id IS NOT NULL AND p2.customer_id IS NOT NULL THEN p2.rev - p1.rev ELSE 0 END) AS expansion_revenue\nFROM p1 FULL OUTER JOIN p2 ON p1.customer_id = p2.customer_id;" },

{ title: 'Consecutive Active Days Streak',
  description: 'Find the longest streak of consecutive days each user was active.\n\nSchema: user_activity(user_id, activity_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 21,
  starter_code: "WITH deduped AS (\n  SELECT DISTINCT user_id, activity_date FROM user_activity\n),\ngrp AS (\n  SELECT user_id, activity_date,\n    julianday(activity_date) - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date) AS grp\n  FROM deduped\n)\nSELECT user_id, MAX(streak) AS longest_streak\nFROM (\n  SELECT user_id, grp, COUNT(*) AS streak\n  FROM grp GROUP BY user_id, grp\n)\nGROUP BY user_id\nORDER BY longest_streak DESC;" },

{ title: 'Multi-Touch Attribution Model',
  description: 'Assign equal credit to all touchpoints in a customer journey that ended in a conversion.\n\nSchema:\n  touchpoints(id, customer_id, channel, touched_at)\n  conversions(id, customer_id, amount, converted_at)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 18,
  starter_code: "WITH tp_counts AS (\n  SELECT t.customer_id, t.channel, COUNT(*) AS touches\n  FROM touchpoints t\n  JOIN conversions c ON t.customer_id = c.customer_id\n    AND t.touched_at <= c.converted_at\n  GROUP BY t.customer_id, t.channel\n),\ntotals AS (\n  SELECT customer_id, SUM(touches) AS total FROM tp_counts GROUP BY customer_id\n)\nSELECT tp.channel,\n  SUM(tp.touches * 1.0 / t.total) AS attributed_conversions\nFROM tp_counts tp\nJOIN totals t ON tp.customer_id = t.customer_id\nGROUP BY tp.channel ORDER BY attributed_conversions DESC;" },

{ title: 'Customer Purchase Sequence Analysis',
  description: 'For each customer find the sequence of categories purchased (in order). Return customer_id and their category_path.\n\nSchema:\n  orders(id, customer_id, order_date)\n  order_items(order_id, product_id)\n  products(id, category)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 20,
  starter_code: "WITH ordered AS (\n  SELECT o.customer_id, p.category,\n    ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date) AS seq\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n)\nSELECT customer_id,\n  GROUP_CONCAT(category, ' → ') AS category_path\nFROM ordered\nGROUP BY customer_id;" },

{ title: 'Detect Fraudulent Transactions',
  description: 'Flag transactions where a customer places 5+ orders in a single hour with total amount > 50000.\n\nSchema: orders(id, customer_id, amount, created_at)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 25,
  starter_code: "SELECT customer_id,\n  strftime('%Y-%m-%d %H', created_at) AS hour_bucket,\n  COUNT(*) AS order_count,\n  SUM(amount) AS total_amount\nFROM orders\nGROUP BY customer_id, hour_bucket\nHAVING COUNT(*) >= 5 AND SUM(amount) > 50000\nORDER BY total_amount DESC;" },

{ title: 'Product Affinity Analysis',
  description: 'Find the top 10 product pairs with the highest lift (co-occurrence rate / expected by chance).\n\nSchema: order_items(order_id, product_id)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 17,
  starter_code: "WITH pairs AS (\n  SELECT a.product_id AS p1, b.product_id AS p2,\n    COUNT(DISTINCT a.order_id) AS co_orders\n  FROM order_items a\n  JOIN order_items b ON a.order_id = b.order_id AND a.product_id < b.product_id\n  GROUP BY p1, p2\n),\ntotals AS (\n  SELECT product_id, COUNT(DISTINCT order_id) AS orders\n  FROM order_items GROUP BY product_id\n),\nall_orders AS (SELECT COUNT(DISTINCT order_id) AS n FROM order_items)\nSELECT pr.p1, pr.p2, pr.co_orders,\n  ROUND(pr.co_orders * 1.0 * ao.n / (t1.orders * t2.orders), 3) AS lift\nFROM pairs pr\nJOIN totals t1 ON t1.product_id = pr.p1\nJOIN totals t2 ON t2.product_id = pr.p2\nCROSS JOIN all_orders ao\nORDER BY lift DESC LIMIT 10;" },

{ title: 'Sales Goal Attainment Per Rep',
  description: 'Compare each sales rep actual revenue vs their quarterly target. Show attainment %.\n\nSchema:\n  sales_reps(id, name, quarterly_target)\n  deals(id, rep_id, amount, close_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 30,
  starter_code: "SELECT sr.name,\n  sr.quarterly_target,\n  SUM(d.amount) AS actual,\n  ROUND(SUM(d.amount) * 100.0 / sr.quarterly_target, 1) AS attainment_pct\nFROM sales_reps sr\nLEFT JOIN deals d ON d.rep_id = sr.id\n  AND d.close_date >= DATE('now', 'start of year', 'start of month', '-1 month', '+1 day')\nGROUP BY sr.id, sr.name, sr.quarterly_target\nORDER BY attainment_pct DESC;" },

{ title: 'Customer Segmentation by Activity Score',
  description: 'Build a composite activity score per user: (sessions × 1) + (orders × 3) + (reviews × 2). Segment into tiers.\n\nSchema:\n  sessions(user_id, session_date)\n  orders(customer_id, order_date)\n  reviews(user_id, created_at)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 26,
  starter_code: "WITH s AS (SELECT user_id, COUNT(*) AS s_count FROM sessions GROUP BY user_id),\n     o AS (SELECT customer_id AS user_id, COUNT(*) AS o_count FROM orders GROUP BY customer_id),\n     r AS (SELECT user_id, COUNT(*) AS r_count FROM reviews GROUP BY user_id),\n     all_users AS (SELECT DISTINCT user_id FROM sessions)\nSELECT a.user_id,\n  COALESCE(s.s_count,0) + COALESCE(o.o_count,0)*3 + COALESCE(r.r_count,0)*2 AS score,\n  CASE\n    WHEN COALESCE(s.s_count,0)+COALESCE(o.o_count,0)*3+COALESCE(r.r_count,0)*2 > 50 THEN 'Power User'\n    WHEN COALESCE(s.s_count,0)+COALESCE(o.o_count,0)*3+COALESCE(r.r_count,0)*2 > 20 THEN 'Regular'\n    ELSE 'Casual'\n  END AS tier\nFROM all_users a\nLEFT JOIN s ON a.user_id=s.user_id\nLEFT JOIN o ON a.user_id=o.user_id\nLEFT JOIN r ON a.user_id=r.user_id;" },

{ title: 'Cohort LTV Projection',
  description: 'Calculate average cumulative revenue per cohort across months 1–6 post signup.\n\nSchema:\n  users(id, signup_date)\n  orders(id, customer_id, amount, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 23,
  starter_code: "WITH cohorts AS (\n  SELECT id, strftime('%Y-%m', signup_date) AS cohort\n  FROM users\n),\nmonthly_rev AS (\n  SELECT c.cohort, c.id AS user_id,\n    CAST((julianday(o.order_date) - julianday(c.cohort||'-01')) / 30 AS INT) + 1 AS month_num,\n    o.amount\n  FROM cohorts c\n  JOIN orders o ON o.customer_id = c.id\n  WHERE month_num BETWEEN 1 AND 6\n)\nSELECT cohort, month_num,\n  ROUND(SUM(amount) / COUNT(DISTINCT user_id), 2) AS avg_rev_per_user\nFROM monthly_rev\nGROUP BY cohort, month_num\nORDER BY cohort, month_num;" },

{ title: 'Employee Hierarchy Tree',
  description: 'Use a recursive CTE to build the full org chart showing level depth for each employee.\n\nSchema: employees(id, name, manager_id)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 27,
  starter_code: "WITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 0 AS level, name AS path\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.level + 1,\n    o.path || ' > ' || e.name\n  FROM employees e\n  JOIN org o ON e.manager_id = o.id\n)\nSELECT id, name, level, path FROM org ORDER BY path;" },

{ title: 'Price Elasticity Estimation',
  description: 'Calculate correlation between price changes and quantity changes per product to estimate elasticity.\n\nSchema: product_pricing(product_id, price, valid_from)\n  order_items(product_id, quantity, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 16,
  starter_code: "WITH monthly AS (\n  SELECT oi.product_id,\n    strftime('%Y-%m', oi.order_date) AS month,\n    AVG(pp.price) AS avg_price,\n    SUM(oi.quantity) AS total_qty\n  FROM order_items oi\n  JOIN product_pricing pp ON oi.product_id = pp.product_id\n  GROUP BY oi.product_id, month\n),\nchanges AS (\n  SELECT product_id, month,\n    avg_price - LAG(avg_price) OVER (PARTITION BY product_id ORDER BY month) AS price_delta,\n    total_qty - LAG(total_qty) OVER (PARTITION BY product_id ORDER BY month) AS qty_delta,\n    LAG(avg_price) OVER (PARTITION BY product_id ORDER BY month) AS prev_price,\n    LAG(total_qty) OVER (PARTITION BY product_id ORDER BY month) AS prev_qty\n  FROM monthly\n)\nSELECT product_id,\n  ROUND(AVG((qty_delta*1.0/NULLIF(prev_qty,0)) / NULLIF(price_delta*1.0/NULLIF(prev_price,0),0)), 3) AS elasticity\nFROM changes WHERE price_delta != 0\nGROUP BY product_id;" },

{ title: 'Dynamic Pricing Anomaly Detection',
  description: 'Flag orders where the unit_price in order_items deviates more than 20% from the standard product price.\n\nSchema:\n  products(id, name, price)\n  order_items(id, order_id, product_id, quantity, unit_price)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 31,
  starter_code: "SELECT oi.id, oi.order_id, p.name, p.price AS standard_price,\n  oi.unit_price AS charged_price,\n  ROUND(ABS(oi.unit_price - p.price) * 100.0 / p.price, 2) AS pct_deviation\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nWHERE ABS(oi.unit_price - p.price) > p.price * 0.20\nORDER BY pct_deviation DESC;" },

{ title: 'Subscription Renewal Prediction Features',
  description: 'Build ML-ready features: months_active, avg_monthly_revenue, last_month_revenue, missed_payments.\n\nSchema:\n  subscriptions(id, user_id, start_date, status)\n  payments(id, subscription_id, amount, due_date, paid_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 24,
  starter_code: "SELECT s.user_id,\n  CAST((julianday('now') - julianday(s.start_date)) / 30 AS INT) AS months_active,\n  ROUND(SUM(p.amount) * 30.0 / NULLIF(julianday('now') - julianday(s.start_date), 0), 2) AS avg_monthly_rev,\n  SUM(CASE WHEN strftime('%Y-%m', p.paid_date) = strftime('%Y-%m', 'now', '-1 month') THEN p.amount ELSE 0 END) AS last_month_rev,\n  SUM(CASE WHEN p.paid_date > p.due_date OR p.paid_date IS NULL THEN 1 ELSE 0 END) AS missed_payments\nFROM subscriptions s\nLEFT JOIN payments p ON p.subscription_id = s.id\nGROUP BY s.user_id, s.start_date;" },

{ title: 'Geographic Sales Heat Map Data',
  description: 'Return state, city, total_revenue, order_count, avg_order_value, and rank within state.\n\nSchema:\n  customers(id, city, state)\n  orders(id, customer_id, amount)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 33,
  starter_code: "WITH city_stats AS (\n  SELECT c.state, c.city,\n    SUM(o.amount) AS total_revenue,\n    COUNT(o.id) AS order_count,\n    ROUND(AVG(o.amount), 2) AS avg_order_value\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.state, c.city\n)\nSELECT *,\n  RANK() OVER (PARTITION BY state ORDER BY total_revenue DESC) AS city_rank_in_state\nFROM city_stats\nORDER BY state, city_rank_in_state;" },

{ title: 'Sliding Window Fraud Score',
  description: 'For each transaction, compute a 24-hour sliding window count and amount for the same card. Flag if count > 10 or amount > 100000.\n\nSchema: transactions(id, card_id, amount, txn_time)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 20,
  starter_code: "SELECT t1.id, t1.card_id, t1.amount, t1.txn_time,\n  COUNT(t2.id) AS txn_last_24h,\n  SUM(t2.amount) AS amount_last_24h,\n  CASE WHEN COUNT(t2.id) > 10 OR SUM(t2.amount) > 100000 THEN 1 ELSE 0 END AS fraud_flag\nFROM transactions t1\nJOIN transactions t2\n  ON t1.card_id = t2.card_id\n  AND t2.txn_time BETWEEN DATETIME(t1.txn_time, '-24 hours') AND t1.txn_time\nGROUP BY t1.id, t1.card_id, t1.amount, t1.txn_time;" },

{ title: 'Customer Win-Back Analysis',
  description: 'Identify customers who churned (90+ days inactive) and then came back. Return customer_id, churn_date, reactivation_date, gap_days.\n\nSchema: orders(id, customer_id, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 26,
  starter_code: "WITH order_gaps AS (\n  SELECT customer_id, order_date,\n    LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order\n  FROM orders\n)\nSELECT customer_id,\n  prev_order AS churn_date,\n  order_date AS reactivation_date,\n  CAST(julianday(order_date) - julianday(prev_order) AS INT) AS gap_days\nFROM order_gaps\nWHERE CAST(julianday(order_date) - julianday(prev_order) AS INT) >= 90\nORDER BY gap_days DESC;" },

{ title: 'Inventory Aging Report',
  description: 'Classify inventory by age (days since received): Fresh (<30), Aging (30–90), Old (90–180), Write-off (>180). Sum units and value per bucket.\n\nSchema: inventory(id, product_id, units, unit_cost, received_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 30,
  starter_code: "SELECT\n  CASE\n    WHEN julianday('now') - julianday(received_date) < 30 THEN 'Fresh'\n    WHEN julianday('now') - julianday(received_date) < 90 THEN 'Aging'\n    WHEN julianday('now') - julianday(received_date) < 180 THEN 'Old'\n    ELSE 'Write-off'\n  END AS age_bucket,\n  SUM(units) AS total_units,\n  ROUND(SUM(units * unit_cost), 2) AS inventory_value\nFROM inventory\nGROUP BY age_bucket;" },

{ title: 'SQL-Based A/B Test Significance',
  description: 'Given an A/B experiment table, calculate conversion rate per variant and Z-score for significance test.\n\nSchema: ab_experiment(user_id, variant, converted, experiment_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 22,
  starter_code: "WITH stats AS (\n  SELECT variant,\n    COUNT(*) AS n,\n    SUM(CASE WHEN converted THEN 1 ELSE 0 END) AS conversions,\n    AVG(CASE WHEN converted THEN 1.0 ELSE 0 END) AS conv_rate\n  FROM ab_experiment\n  GROUP BY variant\n),\npooled AS (\n  SELECT SUM(conversions)*1.0/SUM(n) AS p_pool, SUM(n) AS total\n  FROM stats\n)\nSELECT s.variant, s.n, s.conversions, ROUND(s.conv_rate*100,2) AS conv_pct,\n  ROUND((s.conv_rate - LAG(s.conv_rate) OVER (ORDER BY s.variant)) /\n    SQRT(p.p_pool*(1-p.p_pool)*(1.0/s.n + 1.0/LAG(s.n) OVER (ORDER BY s.variant))), 3) AS z_score\nFROM stats s CROSS JOIN pooled p;" },

{ title: 'Supply Chain Bottleneck Query',
  description: 'Find supplier-product combinations where avg fulfillment time > 7 days in the last quarter.\n\nSchema:\n  purchase_orders(id, supplier_id, product_id, ordered_date, received_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 28,
  starter_code: "SELECT supplier_id, product_id,\n  COUNT(*) AS po_count,\n  ROUND(AVG(julianday(received_date) - julianday(ordered_date)), 1) AS avg_days,\n  MAX(CAST(julianday(received_date) - julianday(ordered_date) AS INT)) AS max_days\nFROM purchase_orders\nWHERE ordered_date >= DATE('now', '-3 months')\n  AND received_date IS NOT NULL\nGROUP BY supplier_id, product_id\nHAVING AVG(julianday(received_date) - julianday(ordered_date)) > 7\nORDER BY avg_days DESC;" },

{ title: 'Revenue Concentration (Pareto)',
  description: 'Show the cumulative % of revenue contributed by customers sorted by spend (Pareto 80/20 analysis).\n\nSchema: orders(id, customer_id, amount)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 25,
  starter_code: "WITH spend AS (\n  SELECT customer_id, SUM(amount) AS total\n  FROM orders GROUP BY customer_id\n),\nranked AS (\n  SELECT customer_id, total,\n    ROW_NUMBER() OVER (ORDER BY total DESC) AS rn,\n    COUNT(*) OVER () AS total_customers,\n    SUM(total) OVER () AS grand_total\n  FROM spend\n)\nSELECT customer_id, total,\n  ROUND(rn * 100.0 / total_customers, 1) AS pct_customers,\n  ROUND(SUM(total) OVER (ORDER BY total DESC) * 100.0 / grand_total, 1) AS cumulative_rev_pct\nFROM ranked ORDER BY rn;" },

{ title: 'N-Day Retention By Acquisition Channel',
  description: 'Calculate Day-1, Day-7, Day-30 retention rates for each acquisition channel.\n\nSchema:\n  users(id, signup_date, acquisition_channel)\n  sessions(user_id, session_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 21,
  starter_code: "WITH base AS (\n  SELECT u.id, u.acquisition_channel, u.signup_date,\n    MAX(CASE WHEN CAST(julianday(s.session_date) - julianday(u.signup_date) AS INT) = 1 THEN 1 ELSE 0 END) AS d1,\n    MAX(CASE WHEN CAST(julianday(s.session_date) - julianday(u.signup_date) AS INT) BETWEEN 6 AND 8 THEN 1 ELSE 0 END) AS d7,\n    MAX(CASE WHEN CAST(julianday(s.session_date) - julianday(u.signup_date) AS INT) BETWEEN 29 AND 31 THEN 1 ELSE 0 END) AS d30\n  FROM users u\n  LEFT JOIN sessions s ON u.id = s.user_id\n  GROUP BY u.id\n)\nSELECT acquisition_channel,\n  COUNT(*) AS cohort_size,\n  ROUND(SUM(d1)*100.0/COUNT(*),1) AS d1_retention,\n  ROUND(SUM(d7)*100.0/COUNT(*),1) AS d7_retention,\n  ROUND(SUM(d30)*100.0/COUNT(*),1) AS d30_retention\nFROM base GROUP BY acquisition_channel;" },

{ title: 'Salary Budget Utilisation',
  description: 'Compare each department total salary to budget. Show utilisation %, headcount, and flag overspend.\n\nSchema:\n  employees(id, name, department, salary)\n  dept_budgets(department, annual_budget)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 34,
  starter_code: "SELECT e.department,\n  COUNT(e.id) AS headcount,\n  SUM(e.salary) AS total_salary,\n  db.annual_budget,\n  ROUND(SUM(e.salary) * 100.0 / db.annual_budget, 1) AS utilisation_pct,\n  CASE WHEN SUM(e.salary) > db.annual_budget THEN 'OVERSPEND' ELSE 'OK' END AS budget_status\nFROM employees e\nJOIN dept_budgets db ON e.department = db.department\nGROUP BY e.department, db.annual_budget;" },

{ title: 'Promotion Effectiveness Analysis',
  description: 'Compare average order value and order count during promotion periods vs normal periods per product.\n\nSchema:\n  orders(id, customer_id, amount, order_date)\n  order_items(order_id, product_id, quantity, unit_price)\n  promotions(product_id, start_date, end_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 24,
  starter_code: "WITH classified AS (\n  SELECT oi.product_id, o.amount,\n    CASE WHEN p.product_id IS NOT NULL THEN 'promo' ELSE 'normal' END AS period_type\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  LEFT JOIN promotions p ON oi.product_id = p.product_id\n    AND o.order_date BETWEEN p.start_date AND p.end_date\n)\nSELECT product_id, period_type,\n  COUNT(*) AS order_count,\n  ROUND(AVG(amount), 2) AS avg_order_value,\n  SUM(amount) AS total_revenue\nFROM classified\nGROUP BY product_id, period_type;" },

{ title: 'Multi-Level Product Category Rollup',
  description: 'Rollup revenue to subcategory and category level using UNION to create a totals hierarchy.\n\nSchema:\n  products(id, name, subcategory, category)\n  order_items(product_id, quantity, unit_price)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 29,
  starter_code: "WITH base AS (\n  SELECT p.category, p.subcategory,\n    SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category, p.subcategory\n)\nSELECT category, subcategory, revenue, 'subcategory' AS level FROM base\nUNION ALL\nSELECT category, 'TOTAL', SUM(revenue), 'category'\nFROM base GROUP BY category\nUNION ALL\nSELECT 'GRAND TOTAL', NULL, SUM(revenue), 'total'\nFROM base\nORDER BY category, level DESC;" },

{ title: 'Demand Forecasting Base Table',
  description: 'Build a weekly demand table with lag features (4 prior weeks) for ML forecasting.\n\nSchema: order_items(product_id, quantity, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 19,
  starter_code: "WITH weekly AS (\n  SELECT product_id,\n    strftime('%Y-%W', order_date) AS week,\n    SUM(quantity) AS qty\n  FROM order_items\n  GROUP BY product_id, week\n)\nSELECT product_id, week, qty,\n  LAG(qty,1) OVER (PARTITION BY product_id ORDER BY week) AS lag_1w,\n  LAG(qty,2) OVER (PARTITION BY product_id ORDER BY week) AS lag_2w,\n  LAG(qty,3) OVER (PARTITION BY product_id ORDER BY week) AS lag_3w,\n  LAG(qty,4) OVER (PARTITION BY product_id ORDER BY week) AS lag_4w\nFROM weekly;" },

{ title: 'Customer Journey Funnel Sankey Data',
  description: 'Count how many users move from each event_type to the next event_type (for Sankey/flow diagram).\n\nSchema: user_events(user_id, event_type, event_time)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 22,
  starter_code: "WITH ordered_events AS (\n  SELECT user_id, event_type,\n    LEAD(event_type) OVER (PARTITION BY user_id ORDER BY event_time) AS next_event\n  FROM user_events\n)\nSELECT event_type AS from_event, next_event AS to_event,\n  COUNT(*) AS transitions\nFROM ordered_events\nWHERE next_event IS NOT NULL\nGROUP BY from_event, to_event\nORDER BY transitions DESC;" },

{ title: 'Average Revenue Per Session',
  description: 'Calculate revenue attributed per session for logged-in users who also ordered on the same day.\n\nSchema:\n  sessions(id, user_id, session_date)\n  orders(id, customer_id, amount, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 27,
  starter_code: "SELECT strftime('%Y-%m', s.session_date) AS month,\n  COUNT(DISTINCT s.id) AS total_sessions,\n  COALESCE(SUM(o.amount), 0) AS revenue,\n  ROUND(COALESCE(SUM(o.amount), 0) * 1.0 / NULLIF(COUNT(DISTINCT s.id), 0), 2) AS rev_per_session\nFROM sessions s\nLEFT JOIN orders o\n  ON s.user_id = o.customer_id\n  AND s.session_date = o.order_date\nGROUP BY month ORDER BY month;" },

{ title: 'Incremental Revenue From Promotions',
  description: 'Estimate incremental revenue by comparing promoted customers to a matched control group.\n\nSchema:\n  customers(id, segment)\n  orders(id, customer_id, amount, order_date)\n  promo_recipients(customer_id, promo_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 18,
  starter_code: "WITH promo AS (\n  SELECT o.customer_id, SUM(o.amount) AS revenue\n  FROM orders o\n  JOIN promo_recipients pr ON o.customer_id = pr.customer_id\n  WHERE o.order_date >= pr.promo_date\n    AND o.order_date <= DATE(pr.promo_date, '+30 days')\n  GROUP BY o.customer_id\n),\ncontrol AS (\n  SELECT o.customer_id, SUM(o.amount) AS revenue\n  FROM orders o\n  WHERE o.customer_id NOT IN (SELECT customer_id FROM promo_recipients)\n    AND o.order_date >= DATE('now', '-60 days')\n  GROUP BY o.customer_id\n)\nSELECT 'promoted' AS group_, ROUND(AVG(revenue),2) AS avg_revenue, COUNT(*) AS n FROM promo\nUNION ALL\nSELECT 'control', ROUND(AVG(revenue),2), COUNT(*) FROM control;" },

{ title: 'Top Performing Campaign Attribution',
  description: 'Using last-touch attribution, assign each order revenue to the last marketing touchpoint within 7 days.\n\nSchema:\n  orders(id, customer_id, amount, order_date)\n  marketing_touches(id, customer_id, channel, touch_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 23,
  starter_code: "WITH last_touch AS (\n  SELECT o.id AS order_id, o.amount,\n    mt.channel,\n    ROW_NUMBER() OVER (\n      PARTITION BY o.id\n      ORDER BY mt.touch_date DESC\n    ) AS rn\n  FROM orders o\n  JOIN marketing_touches mt\n    ON mt.customer_id = o.customer_id\n    AND mt.touch_date BETWEEN DATE(o.order_date, '-7 days') AND o.order_date\n)\nSELECT channel,\n  COUNT(*) AS attributed_orders,\n  SUM(amount) AS attributed_revenue\nFROM last_touch WHERE rn = 1\nGROUP BY channel ORDER BY attributed_revenue DESC;" },

{ title: 'Basket Size Distribution By Customer Tier',
  description: 'Compare average items per order and average order value across customer tiers (Bronze, Silver, Gold).\n\nSchema:\n  customers(id, tier)\n  orders(id, customer_id, amount)\n  order_items(order_id, product_id)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 32,
  starter_code: "SELECT c.tier,\n  COUNT(DISTINCT o.id) AS total_orders,\n  ROUND(AVG(o.amount), 2) AS avg_order_value,\n  ROUND(COUNT(oi.product_id) * 1.0 / COUNT(DISTINCT o.id), 2) AS avg_items_per_order\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.tier;" },

{ title: 'Cross-Sell Success Rate',
  description: 'For customers who bought category A, calculate what % also bought category B.\n\nSchema:\n  orders(id, customer_id)\n  order_items(order_id, product_id)\n  products(id, category)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 25,
  starter_code: "WITH cat_a_buyers AS (\n  SELECT DISTINCT o.customer_id\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Electronics'\n),\ncat_b_also AS (\n  SELECT DISTINCT o.customer_id\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE p.category = 'Accessories'\n    AND o.customer_id IN (SELECT customer_id FROM cat_a_buyers)\n)\nSELECT\n  COUNT(*) AS cat_a_buyers,\n  (SELECT COUNT(*) FROM cat_b_also) AS also_bought_b,\n  ROUND((SELECT COUNT(*) FROM cat_b_also) * 100.0 / COUNT(*), 2) AS cross_sell_rate\nFROM cat_a_buyers;" },

{ title: 'Year-to-Date vs Prior Year Comparison',
  description: 'Compare YTD revenue (current year through today) with same period in the prior year.\n\nSchema: orders(id, amount, order_date)',
  difficulty: 'Hard', topic: 'SQL', xp_reward: 200, acceptance_rate: 29,
  starter_code: "WITH ytd_current AS (\n  SELECT SUM(amount) AS revenue\n  FROM orders\n  WHERE order_date BETWEEN\n    strftime('%Y-01-01', 'now') AND DATE('now')\n),\nytd_prior AS (\n  SELECT SUM(amount) AS revenue\n  FROM orders\n  WHERE order_date BETWEEN\n    strftime('%Y', DATE('now', '-1 year')) || '-01-01'\n    AND DATE(DATE('now'), '-1 year')\n)\nSELECT\n  c.revenue AS ytd_current,\n  p.revenue AS ytd_prior,\n  ROUND((c.revenue - p.revenue) * 100.0 / NULLIF(p.revenue, 0), 2) AS yoy_pct\nFROM ytd_current c, ytd_prior p;" },

];

module.exports = SQL_PROBLEMS;
