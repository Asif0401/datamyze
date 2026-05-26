const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('./database');

async function seedQuizV2(db) {
  // Get courses by title to link questions to courses
  const courses = await all(db, 'SELECT id, title FROM courses');
  const courseMap = {};
  courses.forEach(c => { courseMap[c.title] = c.id; });

  // Check if already seeded
  const existing = await all(db, "SELECT COUNT(*) as count FROM quiz_questions WHERE course_id IS NOT NULL");
  if (existing[0]?.count > 20) {
    console.log('✅ QuizV2 already seeded');
    return;
  }

  console.log('🌱 Seeding QuizV2 questions...');

  const allQuestions = [
    // SQL for Data Analysis - Basics topic
    { courseTitle: 'SQL for Data Analysis', topic: 'Basics', q: 'Which SQL clause filters rows BEFORE aggregation?', opts: ['HAVING', 'WHERE', 'FILTER', 'GROUP BY'], ans: 1, exp: 'WHERE filters individual rows before GROUP BY aggregation. HAVING filters after aggregation.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Basics', q: 'What does SELECT DISTINCT do?', opts: ['Sorts results', 'Removes duplicate rows', 'Filters NULL values', 'Counts unique values'], ans: 1, exp: 'SELECT DISTINCT returns only unique rows from the result set, eliminating duplicates.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Basics', q: 'Which JOIN returns ALL rows from the left table?', opts: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'], ans: 2, exp: 'LEFT JOIN returns all rows from the left table, with NULLs where no match exists in the right table.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Basics', q: 'What does COUNT(*) count?', opts: ['Only non-NULL values', 'Only numeric columns', 'All rows including NULLs', 'Only distinct values'], ans: 2, exp: 'COUNT(*) counts ALL rows regardless of NULL values. Use COUNT(column) to count non-NULL values only.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Basics', q: 'Which clause is used to sort query results?', opts: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE BY'], ans: 1, exp: 'ORDER BY sorts results. Use ASC (default) for ascending or DESC for descending order.' },

    // SQL for Data Analysis - Window Functions topic
    { courseTitle: 'SQL for Data Analysis', topic: 'Window Functions', q: 'What is the purpose of PARTITION BY in a window function?', opts: ['Filters rows', 'Divides rows into groups for separate calculations', 'Sorts the result', 'Joins two tables'], ans: 1, exp: 'PARTITION BY divides the result set into partitions. The window function is applied to each partition independently.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Window Functions', q: 'Which window function returns the previous row value?', opts: ['LEAD()', 'FIRST_VALUE()', 'LAG()', 'PREV()'], ans: 2, exp: 'LAG() accesses data from a previous row in the same result set without a self-join. LEAD() does the opposite (next row).' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Window Functions', q: 'What does ROW_NUMBER() do?', opts: ['Counts total rows', 'Assigns a unique sequential number to each row', 'Returns the row rank with gaps', 'Counts rows per group'], ans: 1, exp: 'ROW_NUMBER() assigns a unique sequential integer to each row within its partition, starting from 1.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Window Functions', q: 'What is the difference between RANK() and DENSE_RANK()?', opts: ['No difference', 'RANK() skips numbers after ties; DENSE_RANK() does not', 'DENSE_RANK() skips numbers; RANK() does not', 'RANK() is faster'], ans: 1, exp: 'RANK() leaves gaps after ties (1,2,2,4). DENSE_RANK() never skips (1,2,2,3). Use DENSE_RANK() when you need consecutive ranks.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'Window Functions', q: 'Which clause defines the window for a window function?', opts: ['GROUP BY', 'HAVING', 'OVER()', 'WITH'], ans: 2, exp: 'The OVER() clause defines the window (partition and ordering) for a window function. Without OVER(), it becomes a regular aggregate.' },

    // SQL for Data Analysis - JOINs topic
    { courseTitle: 'SQL for Data Analysis', topic: 'JOINs', q: 'A CROSS JOIN between 5-row and 4-row tables produces how many rows?', opts: ['9', '20', '5', '4'], ans: 1, exp: 'CROSS JOIN produces a Cartesian product — every row from table A combined with every row from table B. 5 × 4 = 20 rows.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'JOINs', q: 'Which join type returns only rows that have matches in BOTH tables?', opts: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN'], ans: 2, exp: 'INNER JOIN returns only rows where the join condition is met in both tables. Non-matching rows from either table are excluded.' },
    { courseTitle: 'SQL for Data Analysis', topic: 'JOINs', q: 'What does a SELF JOIN do?', opts: ['Joins a table with itself', 'Joins without a condition', 'Creates a copy of a table', 'Joins using subquery'], ans: 0, exp: 'A SELF JOIN joins a table with itself using aliases. Useful for hierarchical data like employee-manager relationships.' },

    // Python for Analytics - Pandas topic
    { courseTitle: 'Python for Analytics', topic: 'Pandas', q: 'Which pandas method shows the first 5 rows of a DataFrame?', opts: ['df.first()', 'df.top()', 'df.head()', 'df.show()'], ans: 2, exp: 'df.head(n) shows the first n rows (default 5). df.tail(n) shows the last n rows.' },
    { courseTitle: 'Python for Analytics', topic: 'Pandas', q: 'How do you select multiple columns in pandas?', opts: ['df[col1, col2]', 'df[[col1, col2]]', 'df.select(col1, col2)', 'df.get(col1, col2)'], ans: 1, exp: 'Double brackets df[[col1, col2]] returns a DataFrame with those columns. Single bracket df[col] returns a Series.' },
    { courseTitle: 'Python for Analytics', topic: 'Pandas', q: 'Which method fills missing values in a DataFrame?', opts: ['df.dropna()', 'df.fillna()', 'df.replace()', 'df.clean()'], ans: 1, exp: 'df.fillna(value) replaces NaN values. df.dropna() removes rows/columns with NaN. df.fillna(method="ffill") forward-fills.' },
    { courseTitle: 'Python for Analytics', topic: 'Pandas', q: 'What does df.groupby("city").agg({"sales": "sum"}) return?', opts: ['Total sales per city', 'Average sales per city', 'Sales for one city', 'Number of cities'], ans: 0, exp: 'groupby().agg() applies aggregation functions to groups. This sums the sales column for each unique city.' },
    { courseTitle: 'Python for Analytics', topic: 'Pandas', q: 'Which pandas method merges two DataFrames like a SQL JOIN?', opts: ['df.join()', 'df.concat()', 'df.merge()', 'df.combine()'], ans: 2, exp: 'df.merge() performs SQL-style joins (inner, left, right, outer). df.join() is simpler but joins on index by default.' },

    // Python for Analytics - Data Cleaning topic
    { courseTitle: 'Python for Analytics', topic: 'Data Cleaning', q: 'Which method removes duplicate rows in pandas?', opts: ['df.remove_duplicates()', 'df.drop_duplicates()', 'df.unique()', 'df.distinct()'], ans: 1, exp: 'df.drop_duplicates() removes duplicate rows. Use subset=[cols] to check specific columns only.' },
    { courseTitle: 'Python for Analytics', topic: 'Data Cleaning', q: 'What does df.dtypes show?', opts: ['Missing value count', 'Column data types', 'DataFrame shape', 'Column statistics'], ans: 1, exp: 'df.dtypes returns the data type of each column. Use df.astype() to convert types.' },
    { courseTitle: 'Python for Analytics', topic: 'Data Cleaning', q: 'How do you check the percentage of missing values per column?', opts: ['df.missing()', 'df.isnull().sum() / len(df) * 100', 'df.na_count()', 'df.isna().mean()'], ans: 3, exp: 'df.isna().mean() gives the proportion of missing values per column (same as isnull). Multiply by 100 for percentage.' },

    // Statistics & Probability - Descriptive Stats
    { courseTitle: 'Statistics & Probability', topic: 'Descriptive Stats', q: 'Which measure is most resistant to outliers?', opts: ['Mean', 'Standard Deviation', 'Median', 'Variance'], ans: 2, exp: 'Median is the middle value and is unaffected by extreme outliers. A single outlier can significantly shift the mean.' },
    { courseTitle: 'Statistics & Probability', topic: 'Descriptive Stats', q: 'What does a standard deviation of 0 mean?', opts: ['Data has outliers', 'All values are identical', 'Data is normally distributed', 'Mean is zero'], ans: 1, exp: 'SD = 0 means all data points are exactly equal to the mean — there is zero variability in the dataset.' },
    { courseTitle: 'Statistics & Probability', topic: 'Descriptive Stats', q: 'In a right-skewed distribution, which is typically largest?', opts: ['Mode', 'Median', 'Mean', 'All are equal'], ans: 2, exp: 'In right-skewed (positive skew) data, the mean is pulled up by high-value outliers. Order is Mode < Median < Mean.' },
    { courseTitle: 'Statistics & Probability', topic: 'Descriptive Stats', q: 'What does the IQR (Interquartile Range) measure?', opts: ['Total data range', 'Spread of the middle 50% of data', 'Distance from mean', 'Standard deviation squared'], ans: 1, exp: "IQR = Q3 - Q1, measuring the spread of the middle 50% of data. It's used to detect outliers (values > Q3 + 1.5×IQR)." },
    { courseTitle: 'Statistics & Probability', topic: 'Descriptive Stats', q: 'A dataset has mean=50, median=30. The distribution is likely:', opts: ['Symmetric (normal)', 'Left-skewed', 'Right-skewed', 'Uniform'], ans: 2, exp: 'When mean > median, the distribution is right-skewed. High-value outliers pull the mean up without affecting the median as much.' },

    // Statistics & Probability - Hypothesis Testing
    { courseTitle: 'Statistics & Probability', topic: 'Hypothesis Testing', q: 'A p-value of 0.03 means (at α=0.05):', opts: ['Accept null hypothesis', 'Reject null hypothesis', 'Inconclusive', 'The result is wrong'], ans: 1, exp: 'p-value < α (0.03 < 0.05) means we reject the null hypothesis. The result is statistically significant at the 5% level.' },
    { courseTitle: 'Statistics & Probability', topic: 'Hypothesis Testing', q: 'What is a Type I error?', opts: ['False Negative', 'Accepting a false null hypothesis', 'Rejecting a true null hypothesis', 'Sample too small'], ans: 2, exp: 'Type I error (False Positive) = rejecting a true null hypothesis. Type II error (False Negative) = failing to reject a false null hypothesis.' },
    { courseTitle: 'Statistics & Probability', topic: 'Hypothesis Testing', q: 'What does statistical power measure?', opts: ['Probability of Type I error', 'Probability of correctly rejecting a false null hypothesis', 'Sample size required', 'Effect size'], ans: 1, exp: 'Statistical power = 1 - β (probability of Type II error). Higher power (>0.8) means the test is more likely to detect a real effect.' },

    // Dashboard Design - Best Practices
    { courseTitle: 'Dashboard Design', topic: 'Best Practices', q: 'Which chart type is best for showing trend over time?', opts: ['Pie chart', 'Scatter plot', 'Line chart', 'Bar chart'], ans: 2, exp: 'Line charts are best for continuous time-series data showing trends. Bar charts work better for comparing discrete time periods.' },
    { courseTitle: 'Dashboard Design', topic: 'Best Practices', q: 'What is the "data-ink ratio" principle?', opts: ['Amount of color used', 'Ratio of data-representing ink to total ink', 'Screen resolution', 'Number of charts per page'], ans: 1, exp: "Tufte's data-ink ratio principle: maximize the proportion of ink used to display actual data. Remove chart junk, gridlines, and decorations." },
    { courseTitle: 'Dashboard Design', topic: 'Best Practices', q: 'When should you use a pie chart?', opts: ["Always — it's most intuitive", 'Never — bar charts are always better', 'Only with 2-4 categories that clearly sum to 100%', 'For time-series data'], ans: 2, exp: 'Pie charts work only for part-to-whole relationships with few (2-4) clearly distinct segments. With 5+ segments, bar charts are far easier to read.' },
    { courseTitle: 'Dashboard Design', topic: 'Best Practices', q: 'Which color principle improves dashboard accessibility?', opts: ['Using maximum colors for variety', 'High contrast and colorblind-safe palettes', 'Dark backgrounds always', 'Bright colors for important data'], ans: 1, exp: '8% of men are colorblind. Use high-contrast, colorblind-safe palettes (avoid red-green). Tools: ColorBrewer, Tableau colorblind palette.' },

    // Advanced SQL - Optimization
    { courseTitle: 'Advanced SQL', topic: 'Query Optimization', q: 'What does an index do in SQL?', opts: ['Sorts the table permanently', 'Creates a data structure for faster lookups', 'Removes duplicate values', 'Validates data types'], ans: 1, exp: 'An index creates a separate data structure (B-tree or hash) that allows the database to find rows faster without scanning the entire table.' },
    { courseTitle: 'Advanced SQL', topic: 'Query Optimization', q: 'Which operation is generally slowest in SQL?', opts: ['SELECT with index', 'INSERT', 'Full table scan without index', 'COUNT(*)'], ans: 2, exp: 'Full table scans read every row in a table. On large tables, this is extremely slow. Indexes prevent full scans for WHERE/JOIN conditions.' },
    { courseTitle: 'Advanced SQL', topic: 'Query Optimization', q: 'What is a CTE (Common Table Expression)?', opts: ['A type of index', 'A temporary named result set in a query', 'A stored procedure', 'A table constraint'], ans: 1, exp: 'A CTE (WITH clause) creates a temporary, named result set within a query. It improves readability and can be referenced multiple times.' },
    { courseTitle: 'Advanced SQL', topic: 'Query Optimization', q: 'EXPLAIN in SQL is used to:', opts: ['Create table documentation', 'Show how the query will be executed', 'List all indexes', 'Check for syntax errors'], ans: 1, exp: 'EXPLAIN (or EXPLAIN ANALYZE) shows the query execution plan — which indexes are used, join order, estimated vs actual row counts.' },
  ];

  let inserted = 0;
  for (const q of allQuestions) {
    const courseId = courseMap[q.courseTitle];
    if (!courseId) continue;
    try {
      await run(db, `INSERT INTO quiz_questions (id, quiz_id, question, options, correct_index, explanation, order_index, course_id, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), '', q.q, JSON.stringify(q.opts), q.ans, q.exp, 0, courseId, q.topic]);
      inserted++;
    } catch(e) {}
  }
  console.log(`✅ QuizV2: ${inserted} questions seeded`);
}

module.exports = { seedQuizV2 };
