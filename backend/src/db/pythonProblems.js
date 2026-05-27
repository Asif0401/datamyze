const PYTHON_PROBLEMS = [

// ── EASY (55) ─────────────────────────────────────────────────────────────

{ title: 'Read CSV and Show Basic Info',
  description: 'Read a CSV file and display: shape, column names, dtypes, and first 5 rows.\n\nFile: sales_data.csv (columns: order_id, product, category, amount, order_date)',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 95,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales_data.csv')\nprint('Shape:', df.shape)\nprint('Columns:', df.columns.tolist())\nprint('\\nDtypes:')\nprint(df.dtypes)\nprint('\\nFirst 5 rows:')\nprint(df.head())" },

{ title: 'Select Specific Columns',
  description: 'From a DataFrame, select only the columns: customer_id, name, city, total_spent.\n\nColumns available: id, customer_id, name, email, phone, city, total_spent, signup_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 96,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\ncols = ['customer_id', 'name', 'city', 'total_spent']\nresult = df[cols]\nprint(result.head(10))" },

{ title: 'Filter Rows By Condition',
  description: 'Filter orders where amount > 1000 AND status == "completed".\n\nColumns: order_id, customer_id, amount, status, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 93,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\nresult = df[(df['amount'] > 1000) & (df['status'] == 'completed')]\nprint(f'Found {len(result)} orders')\nprint(result.head())" },

{ title: 'Sort DataFrame By Multiple Columns',
  description: 'Sort a products DataFrame by category ascending, then by price descending.\n\nColumns: product_id, name, category, price, stock',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 93,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\nresult = df.sort_values(['category', 'price'], ascending=[True, False])\nprint(result.head(10))" },

{ title: 'Drop Duplicate Rows',
  description: 'Remove duplicate rows from a users DataFrame based on email column. Keep the first occurrence.\n\nColumns: user_id, name, email, city, signup_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 91,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('users.csv')\nprint('Before:', len(df))\ndf = df.drop_duplicates(subset='email', keep='first')\nprint('After:', len(df))\nprint(df.head())" },

{ title: 'Rename Columns',
  description: 'Rename columns: "cust_id" → "customer_id", "amt" → "amount", "dt" → "order_date".\n\nDataFrame columns: cust_id, amt, dt, status',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 92,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders_raw.csv')\ndf = df.rename(columns={\n    'cust_id': 'customer_id',\n    'amt': 'amount',\n    'dt': 'order_date'\n})\nprint(df.columns.tolist())\nprint(df.head())" },

{ title: 'Add Calculated Column',
  description: 'Add a revenue column = quantity × unit_price. Also add a discount_applied column (True if discount > 0).\n\nColumns: order_id, product_id, quantity, unit_price, discount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 92,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('order_items.csv')\ndf['revenue'] = df['quantity'] * df['unit_price']\ndf['discount_applied'] = df['discount'] > 0\nprint(df[['order_id', 'quantity', 'unit_price', 'revenue', 'discount_applied']].head())" },

{ title: 'Value Counts For Category Column',
  description: 'Show the count of products in each category, sorted by count descending. Include percentage.\n\nColumns: product_id, name, category, price',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 90,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\ncounts = df['category'].value_counts()\npct = df['category'].value_counts(normalize=True).mul(100).round(1)\nresult = pd.DataFrame({'count': counts, 'pct': pct})\nprint(result)" },

{ title: 'Fill Missing Values',
  description: 'Fill missing numeric columns with median, and missing string columns with "Unknown".\n\nDataFrame may have NaN in: age (numeric), city (string), salary (numeric), department (string)',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 88,
  starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('employees.csv')\nfor col in df.select_dtypes(include=[np.number]).columns:\n    df[col] = df[col].fillna(df[col].median())\nfor col in df.select_dtypes(include='object').columns:\n    df[col] = df[col].fillna('Unknown')\nprint(df.isnull().sum())" },

{ title: 'Drop Rows With Too Many Nulls',
  description: 'Drop rows where more than 50% of columns are null. Print shape before and after.\n\nDataFrame has 10 columns with various missing values.',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 83,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('messy_data.csv')\nthreshold = len(df.columns) * 0.5\nprint('Before:', df.shape)\ndf = df.dropna(thresh=threshold)\nprint('After:', df.shape)" },

{ title: 'String Column: Extract Domain From Email',
  description: 'Extract the domain from an email column (everything after @). Store in a new "domain" column.\n\nColumns: user_id, name, email',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 87,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('users.csv')\ndf['domain'] = df['email'].str.split('@').str[1]\nprint(df[['name', 'email', 'domain']].head(10))" },

{ title: 'Convert String To Datetime',
  description: 'Convert the order_date column from string to datetime, then extract year, month, day_of_week.\n\nColumns: order_id, amount, order_date (string format: YYYY-MM-DD)',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 86,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['year'] = df['order_date'].dt.year\ndf['month'] = df['order_date'].dt.month\ndf['day_of_week'] = df['order_date'].dt.day_name()\nprint(df.head())" },

{ title: 'Simple GroupBy Sum',
  description: 'Group orders by product_category and calculate total_revenue (sum of amount).\n\nColumns: order_id, product_category, amount, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 91,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\nresult = df.groupby('product_category')['amount'].sum().reset_index()\nresult.columns = ['category', 'total_revenue']\nresult = result.sort_values('total_revenue', ascending=False)\nprint(result)" },

{ title: 'Count Non-Null Values Per Column',
  description: 'Print a summary showing column name, total rows, non-null count, and null count for each column.\n\nDataFrame: any CSV with mixed null/non-null values.',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 89,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('data.csv')\nsummary = pd.DataFrame({\n    'total': len(df),\n    'non_null': df.notna().sum(),\n    'null_count': df.isnull().sum(),\n    'null_pct': (df.isnull().sum() / len(df) * 100).round(2)\n})\nprint(summary)" },

{ title: 'Simple Bar Chart: Revenue By Category',
  description: 'Create a bar chart showing total revenue per product category. Add title, axis labels, and save as PNG.\n\nColumns: product_category, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 85,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\nrevenue = df.groupby('product_category')['amount'].sum().sort_values(ascending=False)\n\nplt.figure(figsize=(10, 5))\nrevenue.plot(kind='bar', color='steelblue', edgecolor='white')\nplt.title('Revenue by Product Category')\nplt.xlabel('Category')\nplt.ylabel('Revenue (₹)')\nplt.xticks(rotation=45, ha='right')\nplt.tight_layout()\nplt.savefig('revenue_by_category.png')\nplt.show()" },

{ title: 'Filter With isin()',
  description: 'Filter a customers DataFrame to only include rows where city is in: Mumbai, Bangalore, Delhi, Pune.\n\nColumns: customer_id, name, city, email',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 91,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\ntop_cities = ['Mumbai', 'Bangalore', 'Delhi', 'Pune']\nresult = df[df['city'].isin(top_cities)]\nprint(f'{len(result)} customers in top cities')\nprint(result['city'].value_counts())" },

{ title: 'Reset Index After GroupBy',
  description: 'Group by city and count customers. Ensure the result has a clean numeric index, not city as index.\n\nColumns: customer_id, name, city',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 90,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\nresult = df.groupby('city')['customer_id'].count().reset_index()\nresult.columns = ['city', 'customer_count']\nresult = result.sort_values('customer_count', ascending=False)\nprint(result.head(10))" },

{ title: 'Identify Top 10 Customers By Spend',
  description: 'Find the top 10 customers by total order amount. Return customer_id and total_spend.\n\nColumns: order_id, customer_id, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 89,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ntop10 = (\n    df.groupby('customer_id')['amount']\n    .sum()\n    .reset_index()\n    .rename(columns={'amount': 'total_spend'})\n    .sort_values('total_spend', ascending=False)\n    .head(10)\n)\nprint(top10)" },

{ title: 'Check For Duplicate Customer IDs',
  description: 'Check if customer_id column has any duplicates. Print total rows, unique IDs, and duplicate count.\n\nColumns: customer_id, name, email',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 88,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\nprint('Total rows:', len(df))\nprint('Unique IDs:', df['customer_id'].nunique())\nduplicates = df[df.duplicated('customer_id', keep=False)]\nprint('Duplicate rows:', len(duplicates))\nif len(duplicates) > 0:\n    print(duplicates)" },

{ title: 'Calculate Descriptive Statistics',
  description: 'Print mean, median, std, min, max, and 25th/75th percentiles for the amount column.\n\nColumns: order_id, customer_id, amount, status',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 90,
  starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('orders.csv')\nprint('Mean:   ', round(df['amount'].mean(), 2))\nprint('Median: ', df['amount'].median())\nprint('Std:    ', round(df['amount'].std(), 2))\nprint('Min:    ', df['amount'].min())\nprint('Max:    ', df['amount'].max())\nprint('25th %: ', df['amount'].quantile(0.25))\nprint('75th %: ', df['amount'].quantile(0.75))" },

{ title: 'Create A Salary Bracket Column',
  description: 'Use pd.cut() to add salary_bracket: Low (<40k), Mid (40-80k), High (>80k).\n\nColumns: emp_id, name, department, salary',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 84,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('employees.csv')\ndf['salary_bracket'] = pd.cut(\n    df['salary'],\n    bins=[0, 40000, 80000, float('inf')],\n    labels=['Low', 'Mid', 'High']\n)\nprint(df['salary_bracket'].value_counts())\nprint(df.head())" },

{ title: 'Month Extraction For Sales Trend',
  description: 'Extract year-month from order_date and count orders per month.\n\nColumns: order_id, customer_id, amount, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 87,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['year_month'] = df['order_date'].dt.to_period('M')\nmonthly = df.groupby('year_month').size().reset_index(name='order_count')\nprint(monthly)" },

{ title: 'Find Most Common Value In A Column',
  description: 'Find the most common city, category, and payment_method in the dataset.\n\nColumns: order_id, city, category, payment_method, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 90,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\nfor col in ['city', 'category', 'payment_method']:\n    mode_val = df[col].mode()[0]\n    count = df[col].value_counts().iloc[0]\n    print(f'{col}: {mode_val} ({count} times)')" },

{ title: 'Boolean Masking With Multiple Conditions',
  description: 'Filter products where: category is "Electronics" AND price between 500 and 5000 AND stock > 0.\n\nColumns: product_id, name, category, price, stock',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 89,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\nmask = (\n    (df['category'] == 'Electronics') &\n    (df['price'].between(500, 5000)) &\n    (df['stock'] > 0)\n)\nresult = df[mask]\nprint(f'Found {len(result)} products')\nprint(result)" },

{ title: 'Simple Line Chart: Daily Orders',
  description: 'Plot a line chart of daily order count over time. Add grid and markers.\n\nColumns: order_id, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 83,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndaily = df.groupby('order_date').size().reset_index(name='count')\n\nplt.figure(figsize=(12, 4))\nplt.plot(daily['order_date'], daily['count'], marker='o', markersize=3, linewidth=1.5)\nplt.title('Daily Order Count')\nplt.xlabel('Date')\nplt.ylabel('Orders')\nplt.grid(alpha=0.3)\nplt.tight_layout()\nplt.show()" },

{ title: 'Count Orders By Status',
  description: 'Create a summary table: status, order_count, total_revenue, avg_revenue per status.\n\nColumns: order_id, customer_id, amount, status',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 87,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\nresult = df.groupby('status').agg(\n    order_count=('order_id', 'count'),\n    total_revenue=('amount', 'sum'),\n    avg_revenue=('amount', 'mean')\n).round(2).reset_index()\nprint(result)" },

{ title: 'Standardise String Columns',
  description: 'Clean a city column: strip whitespace, convert to title case, replace common abbreviations (e.g., "BLR" → "Bangalore").\n\nColumns: customer_id, name, city',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 81,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\ndf['city'] = df['city'].str.strip().str.title()\ncity_map = {'Blr': 'Bangalore', 'Mum': 'Mumbai', 'Del': 'Delhi', 'Chn': 'Chennai'}\ndf['city'] = df['city'].replace(city_map)\nprint(df['city'].value_counts().head(10))" },

{ title: 'Percentage Share Calculation',
  description: 'Add a revenue_share column: each row revenue as % of total revenue.\n\nColumns: category, revenue',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 86,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('category_revenue.csv')\ndf['revenue_share'] = (df['revenue'] / df['revenue'].sum() * 100).round(2)\ndf = df.sort_values('revenue_share', ascending=False)\nprint(df)" },

{ title: 'Clip Outlier Values',
  description: 'Clip the salary column to the range [P5, P95] (5th to 95th percentile) to remove extreme outliers.\n\nColumns: emp_id, name, department, salary',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 79,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('employees.csv')\np5 = df['salary'].quantile(0.05)\np95 = df['salary'].quantile(0.95)\ndf['salary_clipped'] = df['salary'].clip(lower=p5, upper=p95)\nprint(f'Original: min={df[\"salary\"].min()}, max={df[\"salary\"].max()}')\nprint(f'Clipped: min={df[\"salary_clipped\"].min()}, max={df[\"salary_clipped\"].max()}')" },

{ title: 'Merge Two DataFrames',
  description: 'Merge orders with customers on customer_id. Keep all orders (left join). Display order_id, customer name, city, amount.\n\norders: order_id, customer_id, amount\ncustomers: customer_id, name, city',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 88,
  starter_code: "import pandas as pd\n\norders = pd.read_csv('orders.csv')\ncustomers = pd.read_csv('customers.csv')\nresult = orders.merge(customers, on='customer_id', how='left')\nprint(result[['order_id', 'name', 'city', 'amount']].head(10))" },

{ title: 'Pivot Table: Revenue By Category And Month',
  description: 'Create a pivot table with categories as rows, months as columns, and sum of revenue as values.\n\nColumns: order_id, category, amount, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 80,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['month'] = df['order_date'].dt.to_period('M')\npivot = df.pivot_table(values='amount', index='category', columns='month', aggfunc='sum', fill_value=0)\nprint(pivot)" },

{ title: 'Apply Lambda For Custom Column',
  description: 'Create a tier column based on amount: <500 → "Bronze", 500-2000 → "Silver", >2000 → "Gold".\n\nColumns: order_id, customer_id, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 85,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['tier'] = df['amount'].apply(\n    lambda x: 'Bronze' if x < 500 else ('Silver' if x <= 2000 else 'Gold')\n)\nprint(df['tier'].value_counts())" },

{ title: 'Correlation Between Price And Sales',
  description: 'Calculate Pearson correlation between unit_price and units_sold. Print correlation and interpret.\n\nColumns: product_id, product_name, unit_price, units_sold',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 83,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('product_sales.csv')\ncorr = df['unit_price'].corr(df['units_sold'])\nprint(f'Pearson correlation: {corr:.4f}')\nif corr < -0.5:\n    print('Strong negative correlation: higher price → lower sales')\nelif corr < 0:\n    print('Weak negative correlation')\nelif corr < 0.5:\n    print('Weak positive correlation')\nelse:\n    print('Strong positive correlation')" },

{ title: 'Detect Negative Values In Numeric Columns',
  description: 'Find all rows where any numeric column has a negative value. Print count and sample rows.\n\nDataFrame has columns: transaction_id, amount, quantity, discount, price',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 84,
  starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('transactions.csv')\nnumeric_cols = df.select_dtypes(include=[np.number]).columns\nneg_mask = (df[numeric_cols] < 0).any(axis=1)\nneg_rows = df[neg_mask]\nprint(f'Rows with negative values: {len(neg_rows)}')\nprint(neg_rows.head())" },

{ title: 'Weekly Order Summary',
  description: 'Resample order data to weekly frequency. Show order_count and total_revenue per week.\n\nColumns: order_id, amount, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 78,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf = df.set_index('order_date')\nweekly = df.resample('W').agg(\n    order_count=('order_id', 'count'),\n    total_revenue=('amount', 'sum')\n)\nprint(weekly.tail(10))" },

{ title: 'Seaborn Countplot By Category',
  description: 'Create a seaborn countplot showing order count per product category, coloured by status.\n\nColumns: order_id, category, status',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 80,
  starter_code: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\nsns.set_theme(style='whitegrid')\nplt.figure(figsize=(12, 5))\nsns.countplot(data=df, x='category', hue='status')\nplt.title('Order Count by Category and Status')\nplt.xticks(rotation=45)\nplt.tight_layout()\nplt.show()" },

{ title: 'Find Rows With Any Null Value',
  description: 'Return all rows that contain at least one null value. Print count and columns affected.\n\nDataFrame: any CSV with mixed nulls.',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 90,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('data.csv')\nrows_with_nulls = df[df.isnull().any(axis=1)]\nprint(f'Rows with nulls: {len(rows_with_nulls)}')\nprint('\\nNull counts per column:')\nprint(df.isnull().sum()[df.isnull().sum() > 0])" },

{ title: 'String Padding and Formatting',
  description: 'Clean a product_code column: uppercase, strip spaces, zero-pad numeric suffix to 4 digits (e.g., "prod-7" → "PROD-0007").\n\nColumns: product_id, product_code, name',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 72,
  starter_code: "import pandas as pd\nimport re\n\ndf = pd.read_csv('products.csv')\ndef clean_code(code):\n    code = code.strip().upper()\n    parts = code.split('-')\n    if len(parts) == 2 and parts[1].isdigit():\n        return f'{parts[0]}-{parts[1].zfill(4)}'\n    return code\n\ndf['product_code'] = df['product_code'].apply(clean_code)\nprint(df.head())" },

{ title: 'Compute Month-over-Month Change',
  description: 'Given monthly revenue data, compute MoM absolute change and MoM % change.\n\nColumns: year_month, revenue',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 82,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('monthly_revenue.csv')\ndf = df.sort_values('year_month')\ndf['prev_revenue'] = df['revenue'].shift(1)\ndf['mom_change'] = df['revenue'] - df['prev_revenue']\ndf['mom_pct'] = (df['mom_change'] / df['prev_revenue'] * 100).round(2)\nprint(df)" },

{ title: 'Drop Columns With High Null Rate',
  description: 'Drop any column where more than 40% of values are null.\n\nDataFrame: any CSV with some sparse columns.',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 86,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('data.csv')\nthreshold = 0.40\nbefore = df.shape[1]\ndf = df.loc[:, df.isnull().mean() < threshold]\nafter = df.shape[1]\nprint(f'Dropped {before - after} columns')\nprint('Remaining columns:', df.columns.tolist())" },

{ title: 'Category Frequency Bar Chart',
  description: 'Create a horizontal bar chart showing frequency of each payment_method. Add value labels.\n\nColumns: order_id, payment_method, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 81,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ncounts = df['payment_method'].value_counts()\n\nfig, ax = plt.subplots(figsize=(8, 5))\nbars = ax.barh(counts.index, counts.values, color='coral')\nfor bar, val in zip(bars, counts.values):\n    ax.text(bar.get_width() + 5, bar.get_y() + bar.get_height()/2, str(val), va='center')\nax.set_title('Orders by Payment Method')\nplt.tight_layout()\nplt.show()" },

{ title: 'Create A Sample Summary Report',
  description: 'Print a formatted summary report: total orders, total revenue, avg order value, top category, top city.\n\nColumns: order_id, customer_id, category, city, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 85,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\nprint('=' * 40)\nprint('  SALES SUMMARY REPORT')\nprint('=' * 40)\nprint(f'Total Orders   : {len(df):,}')\nprint(f'Total Revenue  : ₹{df[\"amount\"].sum():,.0f}')\nprint(f'Avg Order Value: ₹{df[\"amount\"].mean():,.2f}')\nprint(f'Top Category   : {df[\"category\"].mode()[0]}')\nprint(f'Top City       : {df[\"city\"].mode()[0]}')\nprint('=' * 40)" },

{ title: 'Detect Inconsistent Date Formats',
  description: 'Find rows where order_date cannot be parsed as a date (mixed formats). Print count and sample invalid rows.\n\nColumns: order_id, customer_id, order_date, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 73,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders_messy.csv')\ndf['parsed_date'] = pd.to_datetime(df['order_date'], errors='coerce')\ninvalid = df[df['parsed_date'].isna()]\nprint(f'Invalid dates: {len(invalid)}')\nif len(invalid):\n    print(invalid[['order_id', 'order_date']].head())" },

{ title: 'Revenue Per Day of Week',
  description: 'Calculate average revenue per day of week (Monday–Sunday). Plot a bar chart.\n\nColumns: order_id, amount, order_date',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 80,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['day_of_week'] = df['order_date'].dt.day_name()\nday_order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']\navg = df.groupby('day_of_week')['amount'].mean().reindex(day_order)\n\navg.plot(kind='bar', figsize=(10,4), color='teal')\nplt.title('Average Revenue by Day of Week')\nplt.ylabel('Avg Revenue (₹)')\nplt.xticks(rotation=30)\nplt.tight_layout()\nplt.show()" },

{ title: 'Multi-Column GroupBy Aggregation',
  description: 'Group by city and category. For each group compute: order_count, total_revenue, avg_order_value.\n\nColumns: order_id, city, category, amount',
  difficulty: 'Easy', topic: 'Python', xp_reward: 30, acceptance_rate: 84,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\nresult = df.groupby(['city', 'category']).agg(\n    order_count=('order_id', 'count'),\n    total_revenue=('amount', 'sum'),\n    avg_order_value=('amount', 'mean')\n).round(2).reset_index()\nprint(result.head(15))" },


// ── MEDIUM (60) ────────────────────────────────────────────────────────────

{ title: 'Customer Cohort Analysis With Pandas',
  description: 'Build a cohort retention table: group users by signup month (cohort) and track what % are still active each subsequent month.\n\nDataFrames:\n  users: user_id, signup_date\n  orders: user_id, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 38,
  starter_code: "import pandas as pd\n\nusers = pd.read_csv('users.csv')\norders = pd.read_csv('orders.csv')\nusers['signup_date'] = pd.to_datetime(users['signup_date'])\norders['order_date'] = pd.to_datetime(orders['order_date'])\nusers['cohort'] = users['signup_date'].dt.to_period('M')\ndf = orders.merge(users[['user_id','cohort']], on='user_id')\ndf['order_period'] = df['order_date'].dt.to_period('M')\ndf['period_number'] = (df['order_period'] - df['cohort']).apply(lambda x: x.n)\ncohort_data = df.groupby(['cohort','period_number'])['user_id'].nunique().reset_index()\ncohort_sizes = cohort_data[cohort_data['period_number']==0].set_index('cohort')['user_id']\ncohort_data['retention'] = cohort_data.apply(\n    lambda r: r['user_id'] / cohort_sizes[r['cohort']] * 100, axis=1).round(1)\nretention_table = cohort_data.pivot(index='cohort', columns='period_number', values='retention')\nprint(retention_table)" },

{ title: 'RFM Scoring With Pandas',
  description: 'Calculate Recency, Frequency, Monetary for each customer. Score each metric 1–5 using qcut.\n\norders: order_id, customer_id, amount, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 42,
  starter_code: "import pandas as pd\nfrom datetime import datetime\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\nref_date = df['order_date'].max() + pd.Timedelta(days=1)\n\nrfm = df.groupby('customer_id').agg(\n    recency=('order_date', lambda x: (ref_date - x.max()).days),\n    frequency=('order_id', 'count'),\n    monetary=('amount', 'sum')\n).reset_index()\n\nrfm['r_score'] = pd.qcut(rfm['recency'], q=5, labels=[5,4,3,2,1])\nrfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), q=5, labels=[1,2,3,4,5])\nrfm['m_score'] = pd.qcut(rfm['monetary'], q=5, labels=[1,2,3,4,5])\nrfm['rfm_score'] = rfm[['r_score','f_score','m_score']].astype(int).sum(axis=1)\nprint(rfm.sort_values('rfm_score', ascending=False).head(10))" },

{ title: 'A/B Test Analysis With Scipy',
  description: 'Given A/B test results, perform a two-proportion z-test and interpret the result.\n\nab_test.csv: user_id, variant (A/B), converted (0/1)',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 44,
  starter_code: "import pandas as pd\nfrom scipy import stats\nimport numpy as np\n\ndf = pd.read_csv('ab_test.csv')\ngroups = df.groupby('variant').agg(\n    users=('user_id','count'),\n    conversions=('converted','sum')\n).reset_index()\ngroups['conv_rate'] = groups['conversions'] / groups['users']\nprint(groups)\n\nn_a = groups.loc[groups['variant']=='A','users'].values[0]\nn_b = groups.loc[groups['variant']=='B','users'].values[0]\nc_a = groups.loc[groups['variant']=='A','conversions'].values[0]\nc_b = groups.loc[groups['variant']=='B','conversions'].values[0]\n\np_pool = (c_a + c_b) / (n_a + n_b)\nse = np.sqrt(p_pool*(1-p_pool)*(1/n_a + 1/n_b))\nz = (c_b/n_b - c_a/n_a) / se\np_val = 2 * (1 - stats.norm.cdf(abs(z)))\nprint(f'Z-score: {z:.4f}, p-value: {p_val:.4f}')\nprint('Statistically significant!' if p_val < 0.05 else 'Not significant.')" },

{ title: 'Time Series Resampling and Rolling Stats',
  description: 'Resample daily sales to weekly, compute 4-week rolling average, and plot both.\n\ndaily_sales.csv: date, revenue',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 50,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('daily_sales.csv', parse_dates=['date'], index_col='date')\nweekly = df['revenue'].resample('W').sum()\nrolling_4w = weekly.rolling(window=4).mean()\n\nplt.figure(figsize=(12,5))\nplt.plot(weekly.index, weekly, label='Weekly Revenue', alpha=0.6)\nplt.plot(rolling_4w.index, rolling_4w, label='4-Week Rolling Avg', linewidth=2, color='red')\nplt.title('Weekly Revenue with Rolling Average')\nplt.legend()\nplt.grid(alpha=0.3)\nplt.tight_layout()\nplt.show()" },

{ title: 'Customer Churn Feature Engineering',
  description: 'Build features for a churn model: days_since_last_order, order_frequency_30d, avg_order_value, total_spent.\n\norders: order_id, customer_id, amount, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 46,
  starter_code: "import pandas as pd\nfrom datetime import datetime\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\nref = df['order_date'].max()\n\nfeatures = df.groupby('customer_id').agg(\n    days_since_last_order=('order_date', lambda x: (ref - x.max()).days),\n    total_orders=('order_id', 'count'),\n    total_spent=('amount', 'sum'),\n    avg_order_value=('amount', 'mean')\n).reset_index()\n\nrecent = df[df['order_date'] >= ref - pd.Timedelta(days=30)]\nrecent_count = recent.groupby('customer_id').size().reset_index(name='orders_last_30d')\nfeatures = features.merge(recent_count, on='customer_id', how='left').fillna(0)\nprint(features.head(10))" },

{ title: 'Pandas Merge With Indicator',
  description: 'Merge customers and orders. Show which customers have orders and which do not using indicator=True.\n\ncustomers: customer_id, name, city\norders: order_id, customer_id, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 55,
  starter_code: "import pandas as pd\n\ncust = pd.read_csv('customers.csv')\nords = pd.read_csv('orders.csv')[['customer_id']].drop_duplicates()\n\nmerged = cust.merge(ords, on='customer_id', how='left', indicator=True)\nmerged['has_orders'] = merged['_merge'] == 'both'\nmerged.drop('_merge', axis=1, inplace=True)\nprint(merged['has_orders'].value_counts())\nprint('\\nCustomers without orders:')\nprint(merged[~merged['has_orders']].head())" },

{ title: 'Correlation Matrix Heatmap',
  description: 'Compute correlation matrix for numeric columns and display as a seaborn heatmap with annotations.\n\nDataFrame has columns: price, quantity, discount, revenue, sessions, bounce_rate',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 58,
  starter_code: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('metrics.csv')\ncorr = df.select_dtypes(include='number').corr()\n\nplt.figure(figsize=(10, 8))\nsns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm',\n            vmin=-1, vmax=1, square=True, linewidths=0.5)\nplt.title('Correlation Matrix')\nplt.tight_layout()\nplt.show()" },

{ title: 'Pivot Table With Fill and Margins',
  description: 'Create a pivot showing total revenue by region × product_category. Include row/column totals.\n\nColumns: region, product_category, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 52,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('sales.csv')\npivot = pd.pivot_table(\n    df, values='amount',\n    index='region',\n    columns='product_category',\n    aggfunc='sum',\n    fill_value=0,\n    margins=True,\n    margins_name='Total'\n)\nprint(pivot.round(0))" },

{ title: 'Identify Top N Products Per Category',
  description: 'Find the top 3 products by revenue in each category.\n\nColumns: product_id, product_name, category, revenue',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 54,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('product_revenue.csv')\ntop3 = (\n    df.sort_values('revenue', ascending=False)\n    .groupby('category')\n    .head(3)\n    .reset_index(drop=True)\n)\nprint(top3.to_string())" },

{ title: 'Outlier Detection And Removal',
  description: 'For each numeric column, detect outliers using IQR method. Report count and remove them. Print shape before/after.\n\nDataFrame has columns: age, salary, order_count, avg_spend',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 48,
  starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('data.csv')\nprint('Before:', df.shape)\nfor col in df.select_dtypes(include=[np.number]).columns:\n    Q1 = df[col].quantile(0.25)\n    Q3 = df[col].quantile(0.75)\n    IQR = Q3 - Q1\n    lower, upper = Q1 - 1.5*IQR, Q3 + 1.5*IQR\n    removed = len(df[(df[col] < lower) | (df[col] > upper)])\n    if removed: print(f'{col}: {removed} outliers')\n    df = df[(df[col] >= lower) & (df[col] <= upper)]\nprint('After:', df.shape)" },

{ title: 'String Regex Extraction',
  description: 'Extract product SKU (format: SKU-XXXXX, 5 alphanumeric chars) from a product_description column.\n\nColumns: product_id, product_description',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 50,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('products.csv')\ndf['sku'] = df['product_description'].str.extract(r'(SKU-[A-Z0-9]{5})')\nunmatched = df['sku'].isna().sum()\nprint(f'Extracted SKUs: {df[\"sku\"].notna().sum()}')\nprint(f'Unmatched rows: {unmatched}')\nprint(df[['product_id', 'sku']].dropna().head(10))" },

{ title: 'Multi-Merge: Flat Analytics Table',
  description: 'Merge orders, order_items, customers, and products into one flat table. Add revenue column (qty × unit_price).\n\nSchemas provided in file headers.',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 45,
  starter_code: "import pandas as pd\n\norders   = pd.read_csv('orders.csv')\nitems    = pd.read_csv('order_items.csv')\ncust     = pd.read_csv('customers.csv')\nproducts = pd.read_csv('products.csv')\n\nflat = (\n    items\n    .merge(orders[['order_id','customer_id','order_date']], on='order_id')\n    .merge(cust[['customer_id','name','city']], on='customer_id')\n    .merge(products[['product_id','name','category']], on='product_id', suffixes=('_order','_prod'))\n)\nflat['revenue'] = flat['quantity'] * flat['unit_price']\nprint(flat.shape)\nprint(flat.head())" },

{ title: 'Year-over-Year Revenue Growth',
  description: 'Calculate YoY revenue growth for each year. Show year, revenue, prev_year_revenue, growth_pct.\n\nColumns: order_id, amount, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 53,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['year'] = df['order_date'].dt.year\nyearly = df.groupby('year')['amount'].sum().reset_index(name='revenue')\nyearly['prev_revenue'] = yearly['revenue'].shift(1)\nyearly['growth_pct'] = ((yearly['revenue'] - yearly['prev_revenue']) / yearly['prev_revenue'] * 100).round(2)\nprint(yearly)" },

{ title: 'Funnel Analysis Drop-Off',
  description: 'Given a user event log, calculate users at each funnel stage and drop-off % from previous stage.\n\nfunnel_events.csv: user_id, event_type (view, add_to_cart, checkout, purchase)',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 47,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('funnel_events.csv')\nstages = ['view', 'add_to_cart', 'checkout', 'purchase']\ncounts = {s: df[df['event_type']==s]['user_id'].nunique() for s in stages}\nfunnel = pd.DataFrame({'stage': stages, 'users': [counts[s] for s in stages]})\nfunnel['pct_of_top'] = (funnel['users'] / funnel['users'].iloc[0] * 100).round(1)\nfunnel['drop_off_pct'] = (1 - funnel['users'] / funnel['users'].shift(1)).mul(100).round(1)\nprint(funnel)" },

{ title: 'Feature Engineering: Date Parts',
  description: 'From order_date extract: year, quarter, month, week_of_year, day_of_week, is_weekend, is_month_end.\n\nColumns: order_id, customer_id, amount, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 56,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['year']         = df['order_date'].dt.year\ndf['quarter']      = df['order_date'].dt.quarter\ndf['month']        = df['order_date'].dt.month\ndf['week']         = df['order_date'].dt.isocalendar().week\ndf['day_of_week']  = df['order_date'].dt.dayofweek\ndf['is_weekend']   = df['day_of_week'] >= 5\ndf['is_month_end'] = df['order_date'].dt.is_month_end\nprint(df.head())" },

{ title: 'Stacked Bar Chart: Revenue By Region',
  description: 'Create a stacked bar chart: x = month, bars stacked by region, height = revenue.\n\nColumns: order_date, region, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 49,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['month'] = df['order_date'].dt.to_period('M').astype(str)\npivot = df.pivot_table(values='amount', index='month', columns='region', aggfunc='sum', fill_value=0)\n\npivot.plot(kind='bar', stacked=True, figsize=(14,6))\nplt.title('Monthly Revenue by Region')\nplt.xlabel('Month')\nplt.ylabel('Revenue')\nplt.xticks(rotation=45)\nplt.tight_layout()\nplt.show()" },

{ title: 'Pair Plot For Product Metrics',
  description: 'Create a seaborn pair plot for numeric product metrics, colored by category.\n\nColumns: price, units_sold, revenue, avg_rating, category',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 60,
  starter_code: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('product_metrics.csv')\nsns.pairplot(df, vars=['price','units_sold','revenue','avg_rating'],\n             hue='category', plot_kws={'alpha': 0.5})\nplt.suptitle('Product Metrics Pair Plot', y=1.02)\nplt.tight_layout()\nplt.show()" },

{ title: 'Identify Cohort With Best Day-30 Retention',
  description: 'Find which signup cohort has the highest 30-day retention rate.\n\nusers.csv: user_id, signup_date\nsessions.csv: user_id, session_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 40,
  starter_code: "import pandas as pd\n\nusers = pd.read_csv('users.csv')\nsessions = pd.read_csv('sessions.csv')\nusers['signup_date'] = pd.to_datetime(users['signup_date'])\nsessions['session_date'] = pd.to_datetime(sessions['session_date'])\nusers['cohort'] = users['signup_date'].dt.to_period('M')\n\ndf = sessions.merge(users, on='user_id')\ndf['days_since'] = (df['session_date'] - df['signup_date']).dt.days\n\ncohort_sizes = users.groupby('cohort')['user_id'].count()\nd30 = df[(df['days_since'] >= 28) & (df['days_since'] <= 32)]\nretained = d30.groupby('cohort')['user_id'].nunique()\nretention = (retained / cohort_sizes).dropna().mul(100).round(1)\nprint(retention.sort_values(ascending=False).head())" },

{ title: 'Multi-Level GroupBy With Transform',
  description: 'For each order, add a column showing that product category total revenue (for comparison).\n\nColumns: order_id, category, product_id, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 48,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['category_total'] = df.groupby('category')['amount'].transform('sum')\ndf['pct_of_category'] = (df['amount'] / df['category_total'] * 100).round(2)\nprint(df.head(10))" },

{ title: 'Seaborn Box Plot: Distribution By Category',
  description: 'Create a box plot showing order amount distribution per product category. Highlight outliers.\n\nColumns: order_id, category, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 57,
  starter_code: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\nplt.figure(figsize=(12, 6))\nsns.boxplot(data=df, x='category', y='amount',\n            palette='Set2', flierprops={'marker':'o','markersize':4})\nplt.title('Order Amount Distribution by Category')\nplt.xticks(rotation=30)\nplt.ylabel('Amount (₹)')\nplt.tight_layout()\nplt.show()" },

{ title: 'Revenue Decomposition: Price vs Volume Effect',
  description: 'Decompose revenue change MoM into price effect and volume effect.\n\nmonthly_sales.csv: month, units_sold, avg_price, revenue',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 37,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('monthly_sales.csv').sort_values('month')\ndf['prev_units'] = df['units_sold'].shift(1)\ndf['prev_price'] = df['avg_price'].shift(1)\ndf['prev_revenue'] = df['revenue'].shift(1)\n\ndf['volume_effect'] = (df['units_sold'] - df['prev_units']) * df['prev_price']\ndf['price_effect'] = (df['avg_price'] - df['prev_price']) * df['units_sold']\ndf['total_change'] = df['revenue'] - df['prev_revenue']\n\nprint(df[['month','revenue','volume_effect','price_effect','total_change']].dropna())" },

{ title: 'Top N Words In Product Reviews',
  description: 'Find the top 20 most frequently used words in product reviews (exclude stopwords).\n\nreviews.csv: review_id, product_id, review_text, rating',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 50,
  starter_code: "import pandas as pd\nfrom collections import Counter\nimport re\n\ndf = pd.read_csv('reviews.csv')\nstopwords = {'the','a','an','is','are','was','were','in','on','at','of','and','or','to','for','this','that','it','i'}\nall_words = []\nfor text in df['review_text'].dropna():\n    words = re.findall(r'\\b[a-z]+\\b', text.lower())\n    all_words.extend([w for w in words if w not in stopwords and len(w) > 2])\ntop20 = Counter(all_words).most_common(20)\nresult = pd.DataFrame(top20, columns=['word','count'])\nprint(result)" },

{ title: 'Pandas qcut For Revenue Segmentation',
  description: 'Divide customers into 5 equal-frequency revenue segments. Show segment boundaries and customer count.\n\norders: customer_id, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 51,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ntotal = df.groupby('customer_id')['amount'].sum().reset_index(name='total_spent')\ntotal['segment'], bins = pd.qcut(\n    total['total_spent'], q=5,\n    labels=['Tier 1','Tier 2','Tier 3','Tier 4','Tier 5'],\n    retbins=True\n)\nprint('Segment distribution:')\nprint(total['segment'].value_counts().sort_index())\nprint('\\nBin edges:', bins.round(2))" },

{ title: 'Session Funnel With Pandas',
  description: 'Given clickstream data, build a funnel: Homepage → Product → Cart → Checkout → Purchase.\n\nevents.csv: session_id, user_id, page, timestamp',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 43,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('events.csv')\nfunnel_pages = ['Homepage','Product','Cart','Checkout','Purchase']\nresult = []\nfor page in funnel_pages:\n    users = df[df['page'] == page]['user_id'].nunique()\n    result.append({'stage': page, 'users': users})\nfunnel = pd.DataFrame(result)\nfunnel['drop_from_prev'] = (1 - funnel['users'] / funnel['users'].shift(1)).mul(100).round(1)\nfunnel['from_top'] = (funnel['users'] / funnel['users'].iloc[0] * 100).round(1)\nprint(funnel)" },

{ title: 'Z-Score Outlier Detection',
  description: 'Flag rows where z-score of the amount column > 3 (extreme outliers). Print count and rows.\n\nColumns: order_id, customer_id, amount, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 54,
  starter_code: "import pandas as pd\nfrom scipy import stats\nimport numpy as np\n\ndf = pd.read_csv('orders.csv')\ndf['z_score'] = np.abs(stats.zscore(df['amount']))\noutliers = df[df['z_score'] > 3]\nprint(f'Outliers found: {len(outliers)}')\nprint(outliers[['order_id','amount','z_score']].sort_values('z_score', ascending=False))" },

{ title: 'Customer Purchase Interval Distribution',
  description: 'For customers with multiple orders, compute days between each pair of consecutive orders. Plot histogram.\n\norders: customer_id, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 45,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf = df.sort_values(['customer_id','order_date'])\ndf['prev_order'] = df.groupby('customer_id')['order_date'].shift(1)\ndf['gap_days'] = (df['order_date'] - df['prev_order']).dt.days\ngaps = df['gap_days'].dropna()\n\nplt.figure(figsize=(10,5))\nplt.hist(gaps, bins=50, edgecolor='white', color='steelblue')\nplt.title(f'Days Between Orders (median={gaps.median():.0f}d)')\nplt.xlabel('Days')\nplt.ylabel('Frequency')\nplt.axvline(gaps.median(), color='red', linestyle='--', label='Median')\nplt.legend()\nplt.show()" },

{ title: 'Heatmap: Orders By Hour And Day',
  description: 'Create a heatmap showing order count by hour of day (x) and day of week (y).\n\norders: order_id, created_at (datetime)',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 52,
  starter_code: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ndf['created_at'] = pd.to_datetime(df['created_at'])\ndf['hour'] = df['created_at'].dt.hour\ndf['day'] = df['created_at'].dt.day_name()\nday_order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']\nheatmap_data = df.groupby(['day','hour']).size().unstack(fill_value=0).reindex(day_order)\n\nplt.figure(figsize=(14,6))\nsns.heatmap(heatmap_data, cmap='YlOrRd', linewidths=0.5, annot=False)\nplt.title('Order Heatmap: Hour vs Day of Week')\nplt.tight_layout()\nplt.show()" },

{ title: 'Pareto Chart: Revenue Concentration',
  description: 'Create a Pareto chart showing cumulative revenue % by customer (sorted desc). Draw 80% line.\n\norders: customer_id, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 43,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\nspend = df.groupby('customer_id')['amount'].sum().sort_values(ascending=False)\ncumulative = spend.cumsum() / spend.sum() * 100\n\nfig, ax1 = plt.subplots(figsize=(12,5))\nax1.bar(range(len(spend)), spend.values, color='steelblue', alpha=0.7)\nax2 = ax1.twinx()\nax2.plot(range(len(cumulative)), cumulative.values, color='red', linewidth=2)\nax2.axhline(80, color='orange', linestyle='--', label='80%')\nax1.set_xlabel('Customers (sorted by revenue)')\nax1.set_ylabel('Revenue')\nax2.set_ylabel('Cumulative %')\nplt.title('Pareto: Revenue Concentration by Customer')\nplt.tight_layout()\nplt.show()" },

{ title: 'Inventory Aging Analysis',
  description: 'Classify inventory items by age bucket and compute total units and value per bucket.\n\ninventory.csv: product_id, units, unit_cost, received_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 55,
  starter_code: "import pandas as pd\nfrom datetime import date\n\ndf = pd.read_csv('inventory.csv')\ndf['received_date'] = pd.to_datetime(df['received_date'])\ntoday = pd.Timestamp.today()\ndf['age_days'] = (today - df['received_date']).dt.days\ndf['bucket'] = pd.cut(df['age_days'], bins=[0,30,90,180,9999],\n                       labels=['Fresh','Aging','Old','Write-off'])\ndf['value'] = df['units'] * df['unit_cost']\nresult = df.groupby('bucket')[['units','value']].sum().round(2)\nprint(result)" },

{ title: 'Sales Velocity Per Product',
  description: 'Calculate daily sales velocity (units/day) for each product based on first and last sale date.\n\norder_items.csv: product_id, quantity, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 48,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('order_items.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\nstats = df.groupby('product_id').agg(\n    total_units=('quantity', 'sum'),\n    first_sale=('order_date', 'min'),\n    last_sale=('order_date', 'max')\n).reset_index()\nstats['days_active'] = (stats['last_sale'] - stats['first_sale']).dt.days + 1\nstats['daily_velocity'] = (stats['total_units'] / stats['days_active']).round(2)\nprint(stats.sort_values('daily_velocity', ascending=False).head(10))" },

{ title: 'Customer Basket Analysis',
  description: 'Find the most frequent product pairs bought together. Return top 10 pairs.\n\norder_items.csv: order_id, product_id, product_name',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 40,
  starter_code: "import pandas as pd\nfrom itertools import combinations\nfrom collections import Counter\n\ndf = pd.read_csv('order_items.csv')\nbaskets = df.groupby('order_id')['product_name'].apply(list)\npairs = Counter()\nfor items in baskets:\n    if len(items) >= 2:\n        for pair in combinations(sorted(set(items)), 2):\n            pairs[pair] += 1\ntop10 = pd.DataFrame(pairs.most_common(10), columns=['pair', 'count'])\nprint(top10)" },

{ title: 'Multi-Index DataFrame Operations',
  description: 'Create a multi-index DataFrame with (year, quarter) as index. Access Q2 2024 data and reset index.\n\norders: order_id, amount, order_date',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 44,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['year'] = df['order_date'].dt.year\ndf['quarter'] = df['order_date'].dt.quarter\n\nmi = df.groupby(['year','quarter'])['amount'].agg(['sum','count','mean']).round(2)\nprint(mi)\nprint('\\nQ2 2024:')\nprint(mi.loc[(2024, 2)])" },

{ title: 'Apply Custom Function To Groups',
  description: 'For each city group, compute: revenue, orders, churn_rate (customers with only 1 order / total).\n\norders: order_id, customer_id, amount, city',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 42,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\n\ndef city_stats(g):\n    order_counts = g.groupby('customer_id').size()\n    return pd.Series({\n        'revenue': g['amount'].sum(),\n        'orders': len(g),\n        'customers': g['customer_id'].nunique(),\n        'single_order_customers': (order_counts == 1).sum(),\n        'churn_rate': round((order_counts == 1).sum() / len(order_counts) * 100, 1)\n    })\n\nresult = df.groupby('city').apply(city_stats).reset_index()\nprint(result.sort_values('revenue', ascending=False).head(10))" },

{ title: 'Linear Regression For Revenue Forecasting',
  description: 'Fit a simple linear regression on monthly revenue. Predict next 3 months. Plot actual vs predicted.\n\nmonthly_revenue.csv: month_num (1,2,3...), revenue',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 46,
  starter_code: "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.linear_model import LinearRegression\n\ndf = pd.read_csv('monthly_revenue.csv')\nX = df[['month_num']]\ny = df['revenue']\nmodel = LinearRegression().fit(X, y)\ndf['predicted'] = model.predict(X)\n\nfuture = pd.DataFrame({'month_num': [df['month_num'].max()+i for i in range(1,4)]})\nfuture['revenue'] = model.predict(future)\n\nplt.figure(figsize=(12,5))\nplt.plot(df['month_num'], df['revenue'], label='Actual', marker='o')\nplt.plot(df['month_num'], df['predicted'], label='Fitted', linestyle='--')\nplt.plot(future['month_num'], future['revenue'], label='Forecast', marker='s', color='red')\nplt.title('Revenue Forecast')\nplt.legend()\nplt.grid(alpha=0.3)\nplt.show()" },

{ title: 'Identify Missing Date Gaps In Time Series',
  description: 'Find dates missing from daily sales data between first and last date.\n\ndaily_sales.csv: date, revenue',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 53,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('daily_sales.csv')\ndf['date'] = pd.to_datetime(df['date'])\nfull_range = pd.date_range(start=df['date'].min(), end=df['date'].max(), freq='D')\nmissing = full_range.difference(df['date'])\nprint(f'Total missing dates: {len(missing)}')\nif len(missing):\n    print(missing.to_series().reset_index(drop=True).head(10))" },

{ title: 'Campaign ROI Analysis',
  description: 'Calculate ROI = (revenue - cost) / cost × 100 for each campaign. Rank by ROI.\n\ncampaigns.csv: campaign_id, channel, cost\norders.csv: order_id, campaign_id, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 55,
  starter_code: "import pandas as pd\n\ncampaigns = pd.read_csv('campaigns.csv')\norders = pd.read_csv('orders.csv')\nrevenue = orders.groupby('campaign_id')['amount'].sum().reset_index(name='revenue')\nresult = campaigns.merge(revenue, on='campaign_id', how='left').fillna(0)\nresult['roi'] = ((result['revenue'] - result['cost']) / result['cost'] * 100).round(2)\nresult = result.sort_values('roi', ascending=False)\nprint(result)" },

{ title: 'Automate Monthly Report Generation',
  description: 'Generate a formatted text report for a given month: total orders, revenue, top 3 products, new customers.\n\norders.csv with order_date column.',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 58,
  starter_code: "import pandas as pd\n\ndef monthly_report(orders_path, year, month):\n    df = pd.read_csv(orders_path)\n    df['order_date'] = pd.to_datetime(df['order_date'])\n    mask = (df['order_date'].dt.year == year) & (df['order_date'].dt.month == month)\n    m = df[mask]\n    print(f'=== Report: {year}-{month:02d} ===')\n    print(f'Orders: {len(m)}')\n    print(f'Revenue: ₹{m[\"amount\"].sum():,.0f}')\n    print(f'Avg Order: ₹{m[\"amount\"].mean():,.0f}')\n    print('Top 3 Products:', m.groupby('product_name')[\"amount\"].sum().nlargest(3).index.tolist())\n\nmonthly_report('orders.csv', 2024, 3)" },

{ title: 'Detect Duplicate Transactions',
  description: 'Flag potential duplicate transactions: same customer_id, same amount, within 2 minutes.\n\ntransactions.csv: txn_id, customer_id, amount, created_at',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 41,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('transactions.csv')\ndf['created_at'] = pd.to_datetime(df['created_at'])\ndf = df.sort_values(['customer_id', 'amount', 'created_at'])\ndf['prev_customer'] = df['customer_id'].shift(1)\ndf['prev_amount'] = df['amount'].shift(1)\ndf['prev_time'] = df['created_at'].shift(1)\ndf['time_diff'] = (df['created_at'] - df['prev_time']).dt.total_seconds() / 60\nduplicates = df[\n    (df['customer_id'] == df['prev_customer']) &\n    (df['amount'] == df['prev_amount']) &\n    (df['time_diff'] <= 2)\n]\nprint(f'Potential duplicates: {len(duplicates)}')\nprint(duplicates[['txn_id','customer_id','amount','created_at','time_diff']].head())" },

{ title: 'Category Revenue Heatmap By Quarter',
  description: 'Create a heatmap of revenue by category (rows) and quarter (columns).\n\norders.csv: order_date, category, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 50,
  starter_code: "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['quarter'] = 'Q' + df['order_date'].dt.quarter.astype(str) + ' ' + df['order_date'].dt.year.astype(str)\npivot = df.pivot_table(values='amount', index='category', columns='quarter', aggfunc='sum', fill_value=0)\n\nplt.figure(figsize=(12,7))\nsns.heatmap(pivot, annot=True, fmt='.0f', cmap='Blues', linewidths=0.5)\nplt.title('Revenue by Category and Quarter')\nplt.tight_layout()\nplt.show()" },

{ title: 'Product Mix Shift Analysis',
  description: 'Compare product category mix between two years. Show category share % for each year and change.\n\norders: year, category, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 46,
  starter_code: "import pandas as pd\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['year'] = df['order_date'].dt.year\nannual = df.groupby(['year','category'])['amount'].sum().reset_index()\ntotal = annual.groupby('year')['amount'].sum().reset_index(name='total')\nannual = annual.merge(total, on='year')\nannual['share'] = (annual['amount'] / annual['total'] * 100).round(2)\npivot = annual.pivot(index='category', columns='year', values='share')\nif len(pivot.columns) >= 2:\n    pivot['change'] = pivot.iloc[:, 1] - pivot.iloc[:, 0]\nprint(pivot.round(2).sort_values('change', ascending=False))" },

{ title: 'Median Revenue Per City (With GroupBy Aggregation)',
  description: 'Calculate median, mean, std, and count of order amounts per city. Include confidence interval.\n\norders: city, amount',
  difficulty: 'Medium', topic: 'Python', xp_reward: 100, acceptance_rate: 53,
  starter_code: "import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\ndf = pd.read_csv('orders.csv')\nresult = df.groupby('city')['amount'].agg(\n    median='median',\n    mean='mean',\n    std='std',\n    count='count'\n).round(2).reset_index()\nresult['sem'] = (result['std'] / np.sqrt(result['count'])).round(2)\nresult['ci_lower'] = (result['mean'] - 1.96 * result['sem']).round(2)\nresult['ci_upper'] = (result['mean'] + 1.96 * result['sem']).round(2)\nprint(result.sort_values('median', ascending=False))" },


// ── HARD (43) ─────────────────────────────────────────────────────────────

{ title: 'Full EDA Pipeline',
  description: 'Write a complete EDA pipeline: null analysis, outlier detection, distribution plots, correlation heatmap, and a summary of insights.\n\nDataFrame: e-commerce orders with 15+ columns.',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 30,
  starter_code: "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\ndf = pd.read_csv('ecommerce_data.csv')\n\n# 1. Null analysis\nprint('=== NULL ANALYSIS ===')\nprint(df.isnull().mean().sort_values(ascending=False).head(10))\n\n# 2. Outlier summary\nprint('\\n=== OUTLIER SUMMARY ===')\nfor col in df.select_dtypes(include=np.number).columns:\n    Q1, Q3 = df[col].quantile([0.25,0.75])\n    IQR = Q3 - Q1\n    out_count = ((df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)).sum()\n    if out_count: print(f'{col}: {out_count} outliers')\n\n# 3. Correlation heatmap\nfig, ax = plt.subplots(figsize=(12,8))\ncorr = df.select_dtypes(include=np.number).corr()\nsns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)\nplt.title('Correlation Matrix')\nplt.tight_layout()\nplt.savefig('eda_correlation.png')\nplt.show()\nprint('\\n=== BASIC STATS ===')\nprint(df.describe().round(2))" },

{ title: 'Time Series Decomposition',
  description: 'Decompose a monthly revenue time series into trend, seasonal, and residual components using statsmodels.\n\nmonthly_revenue.csv: date, revenue (at least 24 months)',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 33,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\nfrom statsmodels.tsa.seasonal import seasonal_decompose\n\ndf = pd.read_csv('monthly_revenue.csv', parse_dates=['date'], index_col='date')\ndf = df.resample('M').sum()\nresult = seasonal_decompose(df['revenue'], model='additive', period=12)\n\nfig, axes = plt.subplots(4, 1, figsize=(12,10))\nresult.observed.plot(ax=axes[0], title='Observed')\nresult.trend.plot(ax=axes[1], title='Trend')\nresult.seasonal.plot(ax=axes[2], title='Seasonal')\nresult.resid.plot(ax=axes[3], title='Residual')\nplt.tight_layout()\nplt.savefig('decomposition.png')\nplt.show()" },

{ title: 'ARIMA Revenue Forecasting',
  description: 'Fit an ARIMA model on monthly revenue data and forecast the next 6 months with confidence intervals.\n\nmonthly_revenue.csv: date, revenue',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 25,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\nfrom statsmodels.tsa.arima.model import ARIMA\nimport warnings\nwarnings.filterwarnings('ignore')\n\ndf = pd.read_csv('monthly_revenue.csv', parse_dates=['date'], index_col='date')\ndf = df.resample('M').sum()\n\nmodel = ARIMA(df['revenue'], order=(1,1,1))\nfit = model.fit()\nforecast = fit.get_forecast(steps=6)\nmean = forecast.predicted_mean\nci = forecast.conf_int()\n\nplt.figure(figsize=(14,5))\nplt.plot(df.index, df['revenue'], label='Actual')\nplt.plot(mean.index, mean.values, label='Forecast', color='red')\nplt.fill_between(ci.index, ci.iloc[:,0], ci.iloc[:,1], alpha=0.2, color='red')\nplt.title('ARIMA Revenue Forecast')\nplt.legend()\nplt.show()\nprint(mean)" },

{ title: 'Customer Churn Prediction Model',
  description: 'Build a Random Forest classifier to predict customer churn. Use features: days_since_last_order, total_orders, avg_order_value, total_spent.\n\nchurn_data.csv: customer_id, days_since_last_order, total_orders, avg_order_value, total_spent, churned (0/1)',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 35,
  starter_code: "import pandas as pd\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import classification_report, roc_auc_score\n\ndf = pd.read_csv('churn_data.csv')\nfeatures = ['days_since_last_order','total_orders','avg_order_value','total_spent']\nX = df[features]\ny = df['churned']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)\ny_proba = model.predict_proba(X_test)[:,1]\n\nprint(classification_report(y_test, y_pred))\nprint(f'AUC-ROC: {roc_auc_score(y_test, y_proba):.4f}')\nimportance = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)\nprint('\\nFeature importance:')\nprint(importance)" },

{ title: 'Price Elasticity Analysis',
  description: 'Calculate price elasticity of demand for each product category using regression.\n\npricing_data.csv: product_id, category, month, avg_price, units_sold',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 27,
  starter_code: "import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\ndf = pd.read_csv('pricing_data.csv')\nresults = []\nfor cat, g in df.groupby('category'):\n    g = g.sort_values('month')\n    g['price_change'] = g['avg_price'].pct_change()\n    g['demand_change'] = g['units_sold'].pct_change()\n    g = g.dropna()\n    if len(g) > 3:\n        slope, _, r, p, _ = stats.linregress(g['price_change'], g['demand_change'])\n        results.append({'category': cat, 'elasticity': round(slope,3), 'r_squared': round(r**2,3), 'p_value': round(p,4)})\nprint(pd.DataFrame(results).sort_values('elasticity'))" },

{ title: 'K-Means Customer Clustering',
  description: 'Apply K-Means clustering (k=4) on customer RFM features. Label each cluster and describe it.\n\nrfm.csv: customer_id, recency, frequency, monetary',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 38,
  starter_code: "import pandas as pd\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('rfm.csv')\nfeatures = ['recency','frequency','monetary']\nX = df[features]\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n\nkmeans = KMeans(n_clusters=4, random_state=42, n_init=10)\ndf['cluster'] = kmeans.fit_predict(X_scaled)\n\ncluster_summary = df.groupby('cluster')[features].mean().round(2)\nprint(cluster_summary)\nprint('\\nCluster sizes:')\nprint(df['cluster'].value_counts().sort_index())" },

{ title: 'Statistical Hypothesis Test: Revenue By Channel',
  description: 'Test whether revenue differs significantly across 3+ marketing channels using one-way ANOVA.\n\norders.csv: order_id, channel, amount',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 36,
  starter_code: "import pandas as pd\nfrom scipy import stats\n\ndf = pd.read_csv('orders.csv')\ngroups = [g['amount'].values for _, g in df.groupby('channel')]\nf_stat, p_value = stats.f_oneway(*groups)\nprint(f'F-statistic: {f_stat:.4f}')\nprint(f'p-value: {p_value:.4f}')\nprint('\\nGroup means:')\nprint(df.groupby('channel')['amount'].mean().round(2))\nif p_value < 0.05:\n    print('\\n✅ Significant difference across channels (p < 0.05)')\nelse:\n    print('\\n❌ No significant difference (p >= 0.05)')" },

{ title: 'Logistic Regression: Purchase Prediction',
  description: 'Build a logistic regression to predict whether a session converts (1=purchase, 0=no purchase).\n\nsessions.csv: session_duration, pages_viewed, device_type, source, converted',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 32,
  starter_code: "import pandas as pd\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import LabelEncoder, StandardScaler\nfrom sklearn.metrics import classification_report, roc_auc_score\n\ndf = pd.read_csv('sessions.csv')\nfor col in ['device_type','source']:\n    df[col] = LabelEncoder().fit_transform(df[col])\nX = df[['session_duration','pages_viewed','device_type','source']]\ny = df['converted']\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nsc = StandardScaler()\nX_train = sc.fit_transform(X_train)\nX_test = sc.transform(X_test)\nmodel = LogisticRegression(max_iter=500).fit(X_train, y_train)\nprint(classification_report(y_test, model.predict(X_test)))\nprint(f'AUC: {roc_auc_score(y_test, model.predict_proba(X_test)[:,1]):.4f}')" },

{ title: 'Build A Reusable Data Cleaning Pipeline',
  description: 'Write a DataCleaner class with methods: remove_duplicates(), fill_nulls(), fix_dtypes(), remove_outliers(). Chain them in a pipeline.\n\nInput: any CSV with mixed data quality issues.',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 28,
  starter_code: "import pandas as pd\nimport numpy as np\n\nclass DataCleaner:\n    def __init__(self, df):\n        self.df = df.copy()\n    def remove_duplicates(self, subset=None):\n        before = len(self.df)\n        self.df = self.df.drop_duplicates(subset=subset)\n        print(f'Removed {before - len(self.df)} duplicates')\n        return self\n    def fill_nulls(self):\n        for col in self.df.select_dtypes(include=np.number).columns:\n            self.df[col] = self.df[col].fillna(self.df[col].median())\n        for col in self.df.select_dtypes(include='object').columns:\n            self.df[col] = self.df[col].fillna('Unknown')\n        return self\n    def fix_dtypes(self, date_cols=None):\n        if date_cols:\n            for col in date_cols:\n                self.df[col] = pd.to_datetime(self.df[col], errors='coerce')\n        return self\n    def remove_outliers(self, cols):\n        for col in cols:\n            Q1, Q3 = self.df[col].quantile([0.25, 0.75])\n            IQR = Q3 - Q1\n            self.df = self.df[(self.df[col] >= Q1-1.5*IQR) & (self.df[col] <= Q3+1.5*IQR)]\n        return self\n    def result(self): return self.df\n\ndf = pd.read_csv('messy_data.csv')\ncleaned = (DataCleaner(df)\n    .remove_duplicates()\n    .fill_nulls()\n    .fix_dtypes(date_cols=['order_date'])\n    .remove_outliers(['amount'])\n    .result())\nprint(cleaned.shape)" },

{ title: 'Net Promoter Score (NPS) Analysis',
  description: 'Calculate NPS from survey data. Segment into Promoters (9-10), Passives (7-8), Detractors (0-6). Compute NPS = %P - %D. Trend by month.\n\nsurvey.csv: customer_id, score (0-10), survey_date',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 34,
  starter_code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('survey.csv')\ndf['survey_date'] = pd.to_datetime(df['survey_date'])\ndf['segment'] = pd.cut(df['score'], bins=[-1,6,8,10], labels=['Detractor','Passive','Promoter'])\ndf['month'] = df['survey_date'].dt.to_period('M')\n\ndef calc_nps(g):\n    pct = g['segment'].value_counts(normalize=True) * 100\n    return pct.get('Promoter',0) - pct.get('Detractor',0)\n\noverall = calc_nps(df)\nprint(f'Overall NPS: {overall:.1f}')\nprint(df['segment'].value_counts())\nmonthly_nps = df.groupby('month').apply(calc_nps).reset_index(name='nps')\nmonthly_nps.plot(x='month', y='nps', kind='line', marker='o', figsize=(12,4), title='Monthly NPS')\nplt.axhline(0, color='red', linestyle='--')\nplt.tight_layout()\nplt.show()" },

{ title: 'Geographic Sales Dashboard Data',
  description: 'Build a state-level summary: revenue, orders, avg_order, growth vs prior period, top product. Export as JSON for a dashboard.\n\norders: state, city, product_category, amount, order_date',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 29,
  starter_code: "import pandas as pd\nimport json\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ncurrent = df[df['order_date'] >= df['order_date'].max() - pd.DateOffset(months=1)]\nprevious = df[(df['order_date'] >= df['order_date'].max() - pd.DateOffset(months=2)) &\n              (df['order_date'] < df['order_date'].max() - pd.DateOffset(months=1))]\n\ncurr_agg = current.groupby('state').agg(\n    revenue=('amount','sum'), orders=('amount','count')\n)\nprev_agg = previous.groupby('state')['amount'].sum().rename('prev_revenue')\nsummary = curr_agg.join(prev_agg)\nsummary['growth_pct'] = ((summary['revenue'] - summary['prev_revenue']) / summary['prev_revenue'] * 100).round(1)\nsummary['avg_order'] = (summary['revenue'] / summary['orders']).round(2)\nprint(summary.head())" },

{ title: 'Text Analysis: Sentiment of Reviews',
  description: 'Use TextBlob to compute sentiment polarity and subjectivity for product reviews. Summarise by rating band.\n\nreviews.csv: review_id, product_id, review_text, rating',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 36,
  starter_code: "import pandas as pd\nfrom textblob import TextBlob\n\ndf = pd.read_csv('reviews.csv').dropna(subset=['review_text'])\ndf['polarity'] = df['review_text'].apply(lambda x: TextBlob(str(x)).sentiment.polarity)\ndf['subjectivity'] = df['review_text'].apply(lambda x: TextBlob(str(x)).sentiment.subjectivity)\ndf['sentiment'] = pd.cut(df['polarity'], bins=[-1,-0.05,0.05,1], labels=['Negative','Neutral','Positive'])\nprint('Overall sentiment distribution:')\nprint(df['sentiment'].value_counts())\nprint('\\nAvg polarity by rating band:')\ndf['rating_band'] = pd.cut(df['rating'], bins=[0,2,3,5], labels=['Low','Mid','High'])\nprint(df.groupby('rating_band')[['polarity','subjectivity']].mean().round(3))" },

{ title: 'Market Basket Analysis With Apriori',
  description: 'Apply the Apriori algorithm to find frequent itemsets and association rules (lift > 1.5).\n\nbasket.csv: transaction_id, product_name',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 27,
  starter_code: "import pandas as pd\nfrom mlxtend.frequent_patterns import apriori, association_rules\nfrom mlxtend.preprocessing import TransactionEncoder\n\ndf = pd.read_csv('basket.csv')\nbaskets = df.groupby('transaction_id')['product_name'].apply(list).tolist()\nte = TransactionEncoder()\nte_array = te.fit_transform(baskets)\nbasket_df = pd.DataFrame(te_array, columns=te.columns_)\n\nfrequent = apriori(basket_df, min_support=0.01, use_colnames=True)\nrules = association_rules(frequent, metric='lift', min_threshold=1.5)\nrules = rules.sort_values('lift', ascending=False)\nprint(rules[['antecedents','consequents','support','confidence','lift']].head(10))" },

{ title: 'Prophet Time Series Forecasting',
  description: 'Use Facebook Prophet to forecast monthly revenue for 12 months ahead with holiday effects.\n\nrevenue.csv: ds (date), y (revenue)',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 30,
  starter_code: "import pandas as pd\nfrom prophet import Prophet\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('revenue.csv')\ndf['ds'] = pd.to_datetime(df['ds'])\ndf = df.resample('M', on='ds').sum().reset_index()\n\nmodel = Prophet(\n    yearly_seasonality=True,\n    weekly_seasonality=False,\n    changepoint_prior_scale=0.1\n)\nmodel.fit(df)\n\nfuture = model.make_future_dataframe(periods=12, freq='M')\nforecast = model.predict(future)\nprint(forecast[['ds','yhat','yhat_lower','yhat_upper']].tail(12))\nfig = model.plot(forecast)\nplt.title('Prophet Revenue Forecast')\nplt.show()" },

{ title: 'Customer Lifetime Value Prediction',
  description: 'Predict future CLV using BG/NBD model for purchase frequency and Gamma-Gamma for monetary.\n\norders.csv: customer_id, amount, order_date',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 22,
  starter_code: "import pandas as pd\nfrom lifetimes import BetaGeoFitter, GammaGammaFitter\nfrom lifetimes.utils import summary_data_from_transaction_data\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\nsummary = summary_data_from_transaction_data(\n    df, 'customer_id', 'order_date', 'amount',\n    observation_period_end=df['order_date'].max()\n)\nbgf = BetaGeoFitter(penalizer_coef=0.0)\nbgf.fit(summary['frequency'], summary['recency'], summary['T'])\nsummary['predicted_purchases'] = bgf.predict(90, summary['frequency'], summary['recency'], summary['T'])\n\nspending_df = summary[summary['frequency'] > 0]\nggf = GammaGammaFitter(penalizer_coef=0.0)\nggf.fit(spending_df['frequency'], spending_df['monetary_value'])\nspending_df['clv'] = ggf.customer_lifetime_value(bgf, spending_df['frequency'], spending_df['recency'], spending_df['T'], spending_df['monetary_value'], time=12)\nprint(spending_df.sort_values('clv', ascending=False).head(10))" },

{ title: 'Sklearn Pipeline With Feature Engineering',
  description: 'Build a full ML pipeline: impute nulls, encode categoricals, scale numerics, fit gradient boosting.\n\ntrain.csv: age, salary, city, category, purchases, target',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 31,
  starter_code: "import pandas as pd\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import train_test_split, cross_val_score\n\ndf = pd.read_csv('train.csv')\nX = df.drop('target', axis=1)\ny = df['target']\n\nnum_cols = ['age','salary','purchases']\ncat_cols = ['city','category']\n\nnum_pipe = Pipeline([('impute', SimpleImputer(strategy='median')), ('scale', StandardScaler())])\ncat_pipe = Pipeline([('impute', SimpleImputer(strategy='most_frequent')), ('encode', OneHotEncoder(handle_unknown='ignore'))])\npreprocessor = ColumnTransformer([('num', num_pipe, num_cols), ('cat', cat_pipe, cat_cols)])\n\npipeline = Pipeline([('prep', preprocessor), ('model', GradientBoostingClassifier(random_state=42))])\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\npipeline.fit(X_train, y_train)\nprint(f'Test accuracy: {pipeline.score(X_test, y_test):.4f}')\nscores = cross_val_score(pipeline, X, y, cv=5)\nprint(f'CV scores: {scores.round(4)}')" },

{ title: 'Dynamic Excel Report With openpyxl',
  description: 'Generate a multi-sheet Excel report: Sheet1 = monthly summary, Sheet2 = top 10 products, Sheet3 = customer segments. Format headers and add autofilter.\n\norders: order_date, product_name, category, city, customer_id, amount',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 34,
  starter_code: "import pandas as pd\nfrom openpyxl import Workbook\nfrom openpyxl.styles import Font, PatternFill, Alignment\nfrom openpyxl.utils.dataframe import dataframe_to_rows\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['month'] = df['order_date'].dt.to_period('M').astype(str)\n\nmonthly = df.groupby('month')['amount'].agg(['sum','count','mean']).round(2).reset_index()\ntop_products = df.groupby('product_name')['amount'].sum().nlargest(10).reset_index()\n\nwb = Workbook()\nfor sheet_name, data in [('Monthly', monthly), ('Top Products', top_products)]:\n    ws = wb.create_sheet(sheet_name)\n    for r in dataframe_to_rows(data, index=False, header=True):\n        ws.append(r)\n    for cell in ws[1]: cell.font = Font(bold=True)\n    ws.auto_filter.ref = ws.dimensions\n\nif 'Sheet' in wb.sheetnames: del wb['Sheet']\nwb.save('sales_report.xlsx')\nprint('Report saved to sales_report.xlsx')" },

{ title: 'Monte Carlo Revenue Simulation',
  description: 'Simulate 10,000 scenarios for next month revenue based on historical mean and std. Report P10, P50, P90.\n\nmonthly_revenue.csv: month, revenue',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 26,
  starter_code: "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('monthly_revenue.csv')\nmean = df['revenue'].mean()\nstd = df['revenue'].std()\n\nnp.random.seed(42)\nn_simulations = 10000\nsimulations = np.random.normal(loc=mean, scale=std, size=n_simulations)\n\np10, p50, p90 = np.percentile(simulations, [10, 50, 90])\nprint(f'P10 (pessimistic): ₹{p10:,.0f}')\nprint(f'P50 (base case):   ₹{p50:,.0f}')\nprint(f'P90 (optimistic):  ₹{p90:,.0f}')\n\nplt.figure(figsize=(10,5))\nplt.hist(simulations, bins=100, edgecolor='white', color='steelblue', alpha=0.7)\nfor p, label, color in [(p10,'P10','red'),(p50,'P50','orange'),(p90,'P90','green')]:\n    plt.axvline(p, color=color, linestyle='--', label=f'{label}: ₹{p:,.0f}')\nplt.title('Monte Carlo Revenue Simulation')\nplt.legend()\nplt.tight_layout()\nplt.show()" },

{ title: 'Anomaly Detection With Isolation Forest',
  description: 'Apply Isolation Forest to detect anomalous transactions. Flag top anomalies and explain features.\n\ntransactions.csv: amount, hour_of_day, items_count, customer_age_days, is_new_device',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 29,
  starter_code: "import pandas as pd\nfrom sklearn.ensemble import IsolationForest\nfrom sklearn.preprocessing import StandardScaler\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('transactions.csv')\nfeatures = ['amount','hour_of_day','items_count','customer_age_days','is_new_device']\nX = df[features].fillna(0)\nX_scaled = StandardScaler().fit_transform(X)\n\nmodel = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)\ndf['anomaly'] = model.fit_predict(X_scaled)\ndf['anomaly_score'] = model.score_samples(X_scaled)\n\nanomalies = df[df['anomaly'] == -1]\nprint(f'Anomalies detected: {len(anomalies)}')\nprint(anomalies[features + ['anomaly_score']].sort_values('anomaly_score').head(10))" },

{ title: 'Advanced Pandas: Memory Optimisation',
  description: 'Reduce memory footprint of a large DataFrame by optimising dtypes. Report before/after memory usage.\n\nlarge_data.csv with 1M+ rows.',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 38,
  starter_code: "import pandas as pd\nimport numpy as np\n\ndef optimise_dtypes(df):\n    df = df.copy()\n    for col in df.select_dtypes(include=['int64']).columns:\n        df[col] = pd.to_numeric(df[col], downcast='integer')\n    for col in df.select_dtypes(include=['float64']).columns:\n        df[col] = pd.to_numeric(df[col], downcast='float')\n    for col in df.select_dtypes(include='object').columns:\n        if df[col].nunique() / len(df) < 0.1:\n            df[col] = df[col].astype('category')\n    return df\n\ndf = pd.read_csv('large_data.csv')\nbefore_mb = df.memory_usage(deep=True).sum() / 1024**2\ndf_opt = optimise_dtypes(df)\nafter_mb = df_opt.memory_usage(deep=True).sum() / 1024**2\nprint(f'Before: {before_mb:.2f} MB')\nprint(f'After:  {after_mb:.2f} MB')\nprint(f'Saved:  {before_mb - after_mb:.2f} MB ({(1 - after_mb/before_mb)*100:.1f}%)')" },

{ title: 'Build A Sales Dashboard With Plotly',
  description: 'Create an interactive Plotly dashboard: line chart of monthly revenue, bar of top products, scatter of city vs revenue.\n\norders.csv: order_date, product_name, city, amount',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 36,
  starter_code: "import pandas as pd\nimport plotly.graph_objects as go\nfrom plotly.subplots import make_subplots\n\ndf = pd.read_csv('orders.csv')\ndf['order_date'] = pd.to_datetime(df['order_date'])\ndf['month'] = df['order_date'].dt.to_period('M').astype(str)\n\nmonthly = df.groupby('month')['amount'].sum()\ntop_products = df.groupby('product_name')['amount'].sum().nlargest(10)\ncity_rev = df.groupby('city').agg(revenue=('amount','sum'), orders=('amount','count')).reset_index()\n\nfig = make_subplots(rows=2, cols=2,\n    subplot_titles=['Monthly Revenue','Top 10 Products','City vs Revenue',''],\n    specs=[[{'colspan':2},None],[{},{}]])\n\nfig.add_trace(go.Scatter(x=monthly.index, y=monthly.values, mode='lines+markers', name='Revenue'), row=1, col=1)\nfig.add_trace(go.Bar(x=top_products.index, y=top_products.values, name='Products'), row=2, col=1)\nfig.add_trace(go.Scatter(x=city_rev['orders'], y=city_rev['revenue'], mode='markers', text=city_rev['city'], name='Cities'), row=2, col=2)\n\nfig.update_layout(height=700, title_text='Sales Dashboard')\nfig.write_html('sales_dashboard.html')\nfig.show()" },

{ title: 'Multi-Armed Bandit Simulation',
  description: 'Simulate a Thompson Sampling bandit for 4 ad variants. Plot cumulative reward and convergence.\n\nNo file needed — simulate conversion rates: [0.05, 0.08, 0.12, 0.10]',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 24,
  starter_code: "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(42)\ntrue_rates = [0.05, 0.08, 0.12, 0.10]\nn_variants = len(true_rates)\nn_rounds = 5000\nalpha = np.ones(n_variants)\nbeta = np.ones(n_variants)\nchoices, rewards = [], []\n\nfor _ in range(n_rounds):\n    samples = [np.random.beta(alpha[i], beta[i]) for i in range(n_variants)]\n    choice = np.argmax(samples)\n    reward = np.random.binomial(1, true_rates[choice])\n    alpha[choice] += reward\n    beta[choice] += (1 - reward)\n    choices.append(choice)\n    rewards.append(reward)\n\ncumulative = np.cumsum(rewards)\nplt.figure(figsize=(12,5))\nplt.plot(cumulative)\nplt.title('Thompson Sampling: Cumulative Reward')\nplt.xlabel('Round')\nplt.ylabel('Cumulative Conversions')\nplt.grid(alpha=0.3)\nplt.show()\nprint('Arm selection %:', [round(choices.count(i)/n_rounds*100,1) for i in range(n_variants)])" },

{ title: 'End-to-End ETL Pipeline',
  description: 'Build a mini ETL: Extract from CSV, Transform (clean, enrich, aggregate), Load to SQLite.\n\nraw_orders.csv: raw messy data with nulls, wrong types, duplicates.',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 31,
  starter_code: "import pandas as pd\nimport sqlite3\n\n# EXTRACT\ndf = pd.read_csv('raw_orders.csv')\n\n# TRANSFORM\ndf.columns = [c.lower().strip().replace(' ','_') for c in df.columns]\ndf = df.drop_duplicates()\ndf['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')\ndf = df.dropna(subset=['order_date','customer_id','amount'])\ndf['amount'] = pd.to_numeric(df['amount'], errors='coerce').abs()\ndf = df[df['amount'] > 0]\ndf['year'] = df['order_date'].dt.year\ndf['month'] = df['order_date'].dt.month\ndf['revenue_tier'] = pd.qcut(df['amount'], q=3, labels=['Low','Mid','High'])\n\n# LOAD\nconn = sqlite3.connect('analytics.db')\ndf.to_sql('cleaned_orders', conn, if_exists='replace', index=False)\nprint(f'Loaded {len(df)} rows to analytics.db')\nconn.close()" },

{ title: 'Advanced Feature Engineering For ML',
  description: 'Create 15+ features from raw transaction data for a fraud detection model.\n\ntransactions.csv: txn_id, customer_id, amount, merchant, category, hour, day_of_week, is_international',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 33,
  starter_code: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('transactions.csv')\ndf['txn_date'] = pd.to_datetime(df['txn_date'])\ndf = df.sort_values(['customer_id','txn_date'])\n\n# Velocity features\ndf['txn_count_1h'] = df.groupby('customer_id').cumcount()\ndf['amount_z_score'] = df.groupby('customer_id')['amount'].transform(lambda x: (x - x.mean()) / (x.std() + 1e-6))\n\n# Time features\ndf['hour'] = df['txn_date'].dt.hour\ndf['is_night'] = df['hour'].between(22, 6)\ndf['is_weekend'] = df['txn_date'].dt.dayofweek >= 5\n\n# Historical stats per customer\ndf['customer_avg_amount'] = df.groupby('customer_id')['amount'].transform('mean')\ndf['customer_max_amount'] = df.groupby('customer_id')['amount'].transform('max')\ndf['amount_to_max_ratio'] = df['amount'] / df['customer_max_amount']\ndf['days_since_first_txn'] = (df['txn_date'] - df.groupby('customer_id')['txn_date'].transform('min')).dt.days\n\nprint(df.head())\nprint(f'Total features: {df.shape[1]}')" },

{ title: 'Bayesian A/B Test Analysis',
  description: 'Perform a Bayesian A/B test using Beta distributions. Compute P(B > A) and plot posterior distributions.\n\nExperiment: A had 1200 users, 84 conversions. B had 1250 users, 112 conversions.',
  difficulty: 'Hard', topic: 'Python', xp_reward: 200, acceptance_rate: 25,
  starter_code: "import numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy import stats\n\n# Prior: Beta(1,1) - uniform\n# Update with observed data\na_conv, a_total = 84, 1200\nb_conv, b_total = 112, 1250\n\nalpha_a = 1 + a_conv\nbeta_a = 1 + (a_total - a_conv)\nalpha_b = 1 + b_conv\nbeta_b = 1 + (b_total - b_conv)\n\nx = np.linspace(0.04, 0.16, 1000)\nposterior_a = stats.beta(alpha_a, beta_a).pdf(x)\nposterior_b = stats.beta(alpha_b, beta_b).pdf(x)\n\n# Monte Carlo estimate of P(B > A)\nsamples_a = np.random.beta(alpha_a, beta_a, 100000)\nsamples_b = np.random.beta(alpha_b, beta_b, 100000)\nprob_b_wins = (samples_b > samples_a).mean()\n\nprint(f'Conv Rate A: {a_conv/a_total:.3%}')\nprint(f'Conv Rate B: {b_conv/b_total:.3%}')\nprint(f'P(B > A) = {prob_b_wins:.3%}')\n\nplt.figure(figsize=(10,5))\nplt.plot(x, posterior_a, label='Variant A', color='blue')\nplt.plot(x, posterior_b, label='Variant B', color='red')\nplt.title(f'Bayesian A/B Test — P(B>A) = {prob_b_wins:.1%}')\nplt.xlabel('Conversion Rate')\nplt.ylabel('Density')\nplt.legend()\nplt.tight_layout()\nplt.show()" },

];

module.exports = PYTHON_PROBLEMS;
