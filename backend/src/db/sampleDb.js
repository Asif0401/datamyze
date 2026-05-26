/**
 * Creates a fresh in-memory SQLite database with sample data
 * used by the Problems "Run Code" endpoint.
 */
const initSqlJs = require('sql.js');

async function createSampleDb() {
  const SQL = await initSqlJs({ locateFile: file => `${__dirname}/../../../node_modules/sql.js/dist/${file}` });
  const db  = new SQL.Database();

  // ── Existing tables ──────────────────────────────────────────────────
  db.run(`
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT
    );
    INSERT INTO customers VALUES
      (1,'Ravi Kumar','ravi@example.com','Mumbai'),
      (2,'Priya Sharma','priya@example.com','Delhi'),
      (3,'Arjun Mehta','arjun@example.com','Bangalore'),
      (4,'Sneha Patel','sneha@example.com','Ahmedabad'),
      (5,'Vikram Nair','vikram@example.com','Chennai'),
      (6,'Ananya Roy','ananya@example.com','Kolkata'),
      (7,'Karan Singh','karan@example.com','Pune'),
      (8,'Meera Joshi','meera@example.com','Hyderabad'),
      (9,'Rohan Das','rohan@example.com','Jaipur'),
      (10,'Divya Iyer','divya@example.com','Lucknow');

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL,
      status TEXT, order_date TEXT
    );
    INSERT INTO orders VALUES
      (1,1,12500,'completed','2024-01-10'),
      (2,1,8200,'completed','2024-02-14'),
      (3,1,15000,'completed','2024-03-05'),
      (4,2,4500,'completed','2024-01-22'),
      (5,2,9800,'completed','2024-03-18'),
      (6,3,21000,'completed','2024-01-30'),
      (7,3,13400,'completed','2024-02-20'),
      (8,3,7600,'completed','2024-03-25'),
      (9,4,5200,'completed','2024-02-08'),
      (10,4,18900,'completed','2024-03-14'),
      (11,5,3100,'completed','2024-01-17'),
      (12,5,6700,'completed','2024-02-27'),
      (13,6,11200,'completed','2024-01-05'),
      (14,6,9400,'completed','2024-03-30'),
      (15,7,14800,'completed','2024-02-11'),
      (16,7,7300,'completed','2024-03-22'),
      (17,8,2900,'completed','2024-01-28'),
      (18,8,5600,'completed','2024-02-15'),
      (19,9,8100,'completed','2024-03-08'),
      (20,10,16500,'completed','2024-02-03'),
      (21,10,11300,'completed','2024-03-19'),
      (22,1,9700,'completed','2024-04-02'),
      (23,3,18200,'completed','2024-04-11'),
      (24,6,7800,'completed','2024-04-20'),
      (25,10,14100,'completed','2024-04-28');

    CREATE TABLE users (
      id INTEGER PRIMARY KEY, name TEXT, email TEXT
    );
    INSERT INTO users VALUES
      (1,'Ravi Kumar','ravi@example.com'),
      (2,'Priya Sharma','priya@example.com'),
      (3,'Ravi Kumar','ravi@example.com'),
      (4,'Arjun Mehta','arjun@example.com'),
      (5,'Sneha Patel','sneha@example.com'),
      (6,'Priya Sharma','priya@example.com'),
      (7,'Vikram Nair','vikram@example.com'),
      (8,'Ananya Roy','ananya@example.com'),
      (9,'Arjun Mehta','arjun@example.com'),
      (10,'Meera Joshi','meera@example.com');

    CREATE TABLE sales (date TEXT, revenue REAL);
    INSERT INTO sales VALUES
      ('2023-01-01',285000),('2023-02-01',312000),('2023-03-01',298000),
      ('2023-04-01',345000),('2023-05-01',389000),('2023-06-01',421000),
      ('2023-07-01',398000),('2023-08-01',452000),('2023-09-01',487000),
      ('2023-10-01',512000),('2023-11-01',578000),('2023-12-01',634000);

    CREATE TABLE daily_sales (date TEXT, revenue REAL);
    INSERT INTO daily_sales VALUES
      ('2024-01-01',9200),('2024-01-02',11400),('2024-01-03',8700),
      ('2024-01-04',13200),('2024-01-05',10800),('2024-01-06',9500),
      ('2024-01-07',14100),('2024-01-08',12300),('2024-01-09',10200),
      ('2024-01-10',11800),('2024-01-11',9900),('2024-01-12',13600),
      ('2024-01-13',15200),('2024-01-14',10700),('2024-01-15',12100),
      ('2024-01-16',11300),('2024-01-17',9800),('2024-01-18',14500),
      ('2024-01-19',16200),('2024-01-20',13100),('2024-01-21',11700),
      ('2024-01-22',10400),('2024-01-23',12800),('2024-01-24',14900),
      ('2024-01-25',16700),('2024-01-26',13400),('2024-01-27',11200),
      ('2024-01-28',12600),('2024-01-29',15100),('2024-01-30',17300);

    CREATE TABLE user_activity (user_id INTEGER, activity_date TEXT);
    INSERT INTO user_activity VALUES
      (1,'2024-01-05'),(1,'2024-01-15'),(1,'2024-02-03'),
      (2,'2024-01-08'),(2,'2024-02-12'),(2,'2024-03-01'),
      (3,'2024-01-10'),(3,'2024-01-25'),(3,'2024-02-20'),
      (4,'2024-02-05'),(4,'2024-02-18'),(4,'2024-03-10'),
      (5,'2024-01-12'),(5,'2024-02-08'),
      (6,'2024-02-14'),(6,'2024-03-05'),
      (7,'2024-01-18'),(7,'2024-02-22'),(7,'2024-03-15'),
      (8,'2024-01-20'),(8,'2024-02-28'),
      (9,'2024-02-10'),(9,'2024-03-20'),
      (10,'2024-01-22'),(10,'2024-02-16'),(10,'2024-03-25');
  `);

  // ── Extended tables for 100-problem set ──────────────────────────────
  db.run(`
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY, name TEXT, department TEXT,
      salary REAL, manager_id INTEGER, hire_date TEXT, city TEXT
    );
    INSERT INTO employees VALUES
      (1,'Aarav Shah','Engineering',145000,NULL,'2019-03-15','Bangalore'),
      (2,'Kavita Reddy','Engineering',115000,1,'2020-07-01','Bangalore'),
      (3,'Rohit Jain','Engineering',98000,1,'2021-01-20','Hyderabad'),
      (4,'Sunita Mehra','Sales',87000,NULL,'2018-06-10','Mumbai'),
      (5,'Deepak Rao','Sales',72000,4,'2021-09-05','Mumbai'),
      (6,'Pooja Iyer','Sales',68000,4,'2022-03-12','Delhi'),
      (7,'Nikhil Bansal','Marketing',92000,NULL,'2020-02-28','Pune'),
      (8,'Prerna Gupta','Marketing',81000,7,'2021-11-15','Pune'),
      (9,'Vikash Kumar','Finance',110000,NULL,'2017-08-20','Delhi'),
      (10,'Anita Desai','Finance',95000,9,'2019-12-01','Delhi'),
      (11,'Sanjay Pillai','Engineering',125000,1,'2020-04-10','Bangalore'),
      (12,'Lavanya Nair','HR',76000,NULL,'2020-09-30','Chennai');

    CREATE TABLE departments (
      id INTEGER PRIMARY KEY, name TEXT, budget REAL
    );
    INSERT INTO departments VALUES
      (1,'Engineering',5000000),(2,'Sales',2500000),
      (3,'Marketing',1800000),(4,'Finance',2000000),(5,'HR',900000);

    CREATE TABLE products (
      id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER
    );
    INSERT INTO products VALUES
      (1,'iPhone 15 Pro','Electronics',89999,45),
      (2,'Samsung 65" QLED','Electronics',112000,18),
      (3,'Nike Air Max','Footwear',8999,120),
      (4,'Adidas Ultraboost','Footwear',12999,85),
      (5,'Levi Jeans 511','Clothing',3499,200),
      (6,'Kurti Set Ethnic','Clothing',1799,150),
      (7,'Prestige Induction','Kitchen',4299,60),
      (8,'OnePlus Nord 3','Electronics',29999,75),
      (9,'Boat Airdopes 141','Electronics',1499,300),
      (10,'Wildcraft Backpack','Accessories',2499,9),
      (11,'Kent Water Purifier','Appliances',14999,22),
      (12,'Puma Track Pants','Clothing',2199,180);

    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER,
      quantity INTEGER, unit_price REAL
    );
    INSERT INTO order_items VALUES
      (1,1,1,1,89999),(2,1,9,2,1499),
      (3,2,3,2,8999),(4,2,5,1,3499),
      (5,3,8,1,29999),(6,3,9,1,1499),
      (7,4,2,1,112000),
      (8,5,4,2,12999),(9,5,10,1,2499),
      (10,6,1,1,89999),(11,6,11,1,14999),
      (12,7,6,3,1799),(13,7,12,2,2199),
      (14,8,7,2,4299),
      (15,9,3,1,8999),(16,9,5,2,3499),
      (17,10,2,1,112000),(18,10,9,3,1499),
      (19,11,8,2,29999),
      (20,12,4,1,12999),(21,12,6,2,1799),
      (22,13,1,1,89999),
      (23,14,3,3,8999),(24,14,12,1,2199),
      (25,15,11,1,14999),(26,15,7,1,4299);

    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL,
      type TEXT, txn_date TEXT
    );
    INSERT INTO transactions VALUES
      (1,1,1200,'purchase','2024-01-03'),
      (2,1,850,'purchase','2024-01-18'),
      (3,2,3400,'purchase','2024-01-07'),
      (4,2,0,'visit','2024-01-14'),
      (5,3,2100,'purchase','2024-02-05'),
      (6,3,0,'cart','2024-02-09'),
      (7,4,0,'visit','2024-01-20'),
      (8,4,0,'cart','2024-01-21'),
      (9,4,5600,'purchase','2024-01-22'),
      (10,5,0,'visit','2024-02-10'),
      (11,5,0,'visit','2024-02-15'),
      (12,6,1800,'purchase','2024-02-18'),
      (13,6,0,'cart','2024-03-01'),
      (14,7,4200,'purchase','2024-03-05'),
      (15,7,3100,'purchase','2024-03-20'),
      (16,8,0,'visit','2024-01-12'),
      (17,9,7800,'purchase','2024-02-08'),
      (18,10,2400,'purchase','2024-03-14'),
      (19,1,0,'visit','2024-03-22'),
      (20,2,4900,'purchase','2024-04-01');

    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY, user_id INTEGER,
      session_date TEXT, duration_minutes INTEGER, pages_visited INTEGER
    );
    INSERT INTO sessions VALUES
      (1,1,'2024-01-05',12,8),(2,1,'2024-01-15',25,15),(3,1,'2024-02-03',8,5),
      (4,2,'2024-01-08',18,12),(5,2,'2024-02-12',30,22),(6,2,'2024-03-01',15,10),
      (7,3,'2024-01-10',22,14),(8,3,'2024-01-25',35,20),(9,3,'2024-02-20',10,7),
      (10,4,'2024-02-05',14,9),(11,4,'2024-02-18',28,18),(12,4,'2024-03-10',20,13),
      (13,5,'2024-01-12',9,6),(14,5,'2024-02-08',16,11),
      (15,6,'2024-02-14',32,21),(16,6,'2024-03-05',11,8),
      (17,7,'2024-01-18',40,25),(18,7,'2024-02-22',27,17),(19,7,'2024-03-15',18,12),
      (20,8,'2024-01-20',7,5),(21,8,'2024-02-28',19,13),
      (22,9,'2024-02-10',24,16),(23,9,'2024-03-20',33,19),
      (24,10,'2024-01-22',13,9),(25,10,'2024-02-16',21,14),(26,10,'2024-03-25',16,11);

    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY, product_id INTEGER, user_id INTEGER,
      rating INTEGER, review_date TEXT
    );
    INSERT INTO reviews VALUES
      (1,1,1,5,'2024-01-15'),(2,1,2,4,'2024-01-20'),(3,1,3,5,'2024-02-01'),
      (4,2,4,3,'2024-01-25'),(5,2,5,4,'2024-02-10'),
      (6,3,1,5,'2024-01-18'),(7,3,6,4,'2024-02-05'),
      (8,4,2,3,'2024-02-15'),(9,4,7,2,'2024-03-01'),
      (10,5,3,4,'2024-02-20'),(11,5,8,5,'2024-03-05'),
      (12,8,9,5,'2024-02-25'),(13,8,10,4,'2024-03-10'),
      (14,9,1,4,'2024-03-15'),(15,9,4,5,'2024-03-20'),
      (16,11,2,3,'2024-01-30'),(17,11,6,4,'2024-02-28'),
      (18,7,5,5,'2024-03-12'),(19,7,7,4,'2024-04-01'),
      (20,12,8,2,'2024-04-05');

    CREATE TABLE campaigns (
      id INTEGER PRIMARY KEY, name TEXT, channel TEXT,
      spend REAL, revenue REAL, start_date TEXT
    );
    INSERT INTO campaigns VALUES
      (1,'Summer Sale Blast','Email',45000,312000,'2024-01-01'),
      (2,'Metro City Push','Instagram',120000,580000,'2024-01-15'),
      (3,'Diwali Flash','Google Ads',200000,1200000,'2024-02-01'),
      (4,'New Year Promo','Facebook',80000,95000,'2024-02-15'),
      (5,'Product Launch V2','YouTube',150000,720000,'2024-03-01'),
      (6,'Referral Boost','SMS',25000,48000,'2024-03-10'),
      (7,'IPL Season Special','Hotstar',300000,1800000,'2024-03-20'),
      (8,'Weekend Flash','Email',18000,62000,'2024-04-01'),
      (9,'Student Discount','Instagram',55000,185000,'2024-04-10');

    CREATE TABLE inventory (
      id INTEGER PRIMARY KEY, product_id INTEGER, warehouse TEXT, quantity INTEGER
    );
    INSERT INTO inventory VALUES
      (1,1,'Mumbai',15),(2,1,'Delhi',12),(3,1,'Bangalore',18),
      (4,2,'Mumbai',6),(5,2,'Delhi',7),(6,2,'Bangalore',5),
      (7,3,'Mumbai',40),(8,3,'Delhi',35),(9,3,'Bangalore',45),
      (10,4,'Mumbai',28),(11,4,'Delhi',30),(12,4,'Bangalore',27),
      (13,5,'Mumbai',70),(14,5,'Delhi',65),(15,5,'Bangalore',65),
      (16,6,'Mumbai',55),(17,6,'Delhi',50),(18,6,'Bangalore',45),
      (19,7,'Mumbai',20),(20,7,'Delhi',18),(21,7,'Bangalore',22),
      (22,8,'Mumbai',25),(23,8,'Delhi',22),(24,8,'Bangalore',28),
      (25,9,'Mumbai',100),(26,9,'Delhi',95),(27,9,'Bangalore',105),
      (28,10,'Mumbai',3),(29,10,'Delhi',4),(30,10,'Bangalore',2),
      (31,11,'Mumbai',8),(32,11,'Delhi',7),(33,11,'Bangalore',7),
      (34,12,'Mumbai',60),(35,12,'Delhi',55),(36,12,'Bangalore',65);
  `);

  return db;
}

/**
 * Execute SQL against the sample database.
 * Returns { columns, rows } or throws an error.
 */
async function runSql(sql) {
  const db = await createSampleDb();
  try {
    const results = db.exec(sql.trim());
    db.close();
    if (!results || results.length === 0) {
      return { columns: ['Result'], rows: [['Query executed successfully — no rows returned.']] };
    }
    const { columns, values } = results[results.length - 1];
    return { columns, rows: values };
  } catch (err) {
    db.close();
    throw err;
  }
}

module.exports = { runSql };
