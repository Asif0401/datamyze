/**
 * pistonExec.js
 * Runs Python code in a sandboxed child_process on the server.
 * - Python 3 is available on Render's free tier (Ubuntu).
 * - A preamble mocks pd.read_csv() with realistic sample DataFrames
 *   and silences matplotlib so plt.show() / plt.savefig() are no-ops.
 * - Hard 8-second timeout kills runaway code.
 */

const { execFile } = require('child_process');
const { writeFileSync, unlinkSync, existsSync } = require('fs');
const { tmpdir } = require('os');
const path = require('path');

/* ── Sample datasets for every CSV the problems reference ─────────────────── */
const SETUP_PREAMBLE = `
import pandas as pd
import numpy as np
import io, os, sys

# ── Silence matplotlib completely ─────────────────────────────────────────────
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.show    = lambda *a, **kw: None
    plt.savefig = lambda *a, **kw: print("[chart saved]")
except Exception:
    pass

# ── Inline CSV datasets ────────────────────────────────────────────────────────
_CSVS = {}

_CSVS['sales_data.csv'] = """order_id,product,category,amount,order_date
1,iPhone 15 Pro,Electronics,89999,2024-01-10
2,Nike Air Max,Footwear,8999,2024-01-11
3,Samsung TV 55,Electronics,45000,2024-01-12
4,Levi 511 Jeans,Clothing,2999,2024-01-13
5,Adidas Ultra Boost,Footwear,7999,2024-01-14
6,OnePlus 12,Electronics,59999,2024-01-15
7,H&M Casual Shirt,Clothing,1299,2024-01-16
8,Sony WH-1000XM5,Electronics,29999,2024-01-17
9,Puma RS-X,Footwear,5999,2024-01-18
10,Apple Watch S9,Electronics,39999,2024-01-19
11,Zara Jacket,Clothing,4999,2024-01-20
12,Boat Airdopes,Electronics,2998,2024-01-21"""

_CSVS['customers.csv'] = """customer_id,name,email,phone,city,total_spent,signup_date
1,Ravi Kumar,ravi@gmail.com,9876543210,Mumbai,125000,2023-01-15
2,Priya Sharma,priya@yahoo.com,9765432109,Bangalore,89000,2023-02-20
3,Amit Singh,amit@gmail.com,9654321098,Delhi,67000,2023-03-10
4,Neha Patel,neha@outlook.com,9543210987,Pune,45000,2023-04-05
5,Raj Mehta,raj@gmail.com,9432109876,Mumbai,210000,2023-05-12
6,Kavya Reddy,kavya@gmail.com,9321098765,Hyderabad,78000,2023-06-18
7,Arjun Nair,arjun@yahoo.com,9210987654,Chennai,92000,2023-07-22
8,Sita Verma,sita@gmail.com,9109876543,Delhi,34000,2023-08-30
9,Mohan Das,mohan@gmail.com,9098765432,Kolkata,56000,2023-09-14
10,Anita Roy,anita@outlook.com,9987654321,Mumbai,145000,2023-10-05
11,Deepak Joshi,deepak@gmail.com,9876501234,Bangalore,32000,2023-11-18
12,Sneha Iyer,sneha@gmail.com,9765012345,Chennai,88000,2023-12-01"""

_CSVS['orders.csv'] = """order_id,customer_id,amount,status,order_date,product_category
1,1,12500,completed,2024-01-10,Electronics
2,2,8200,completed,2024-01-11,Clothing
3,1,15000,completed,2024-01-12,Electronics
4,3,3500,pending,2024-01-13,Footwear
5,4,7800,completed,2024-01-14,Electronics
6,2,1200,cancelled,2024-01-15,Clothing
7,5,22000,completed,2024-01-16,Electronics
8,6,4500,completed,2024-01-17,Footwear
9,3,9800,completed,2024-01-18,Electronics
10,7,2100,pending,2024-01-19,Clothing
11,8,18500,completed,2024-01-20,Electronics
12,1,5600,completed,2024-01-21,Footwear
13,9,3200,completed,2024-01-22,Clothing
14,10,28000,completed,2024-01-23,Electronics
15,5,6700,cancelled,2024-01-24,Footwear"""

_CSVS['products.csv'] = """product_id,name,category,price,stock
1,iPhone 15 Pro,Electronics,89999,50
2,Samsung Galaxy S24,Electronics,74999,35
3,OnePlus 12,Electronics,59999,60
4,Nike Air Max,Footwear,8999,120
5,Adidas Ultra Boost,Footwear,7999,95
6,Puma RS-X,Footwear,5999,80
7,Levi 511 Jeans,Clothing,2999,200
8,H&M Casual Shirt,Clothing,1299,300
9,Zara Jacket,Clothing,4999,75
10,Sony WH-1000XM5,Electronics,29999,40
11,Apple Watch S9,Electronics,39999,25
12,Boat Airdopes 141,Electronics,1299,500"""

_CSVS['users.csv'] = """user_id,name,email,city,signup_date
1,Ravi Kumar,ravi@gmail.com,Mumbai,2023-01-15
2,Priya Sharma,priya@yahoo.com,Bangalore,2023-02-20
3,Amit Singh,amit@gmail.com,Delhi,2023-03-10
4,Neha Patel,neha@outlook.com,Pune,2023-04-05
5,Raj Mehta,raj@gmail.com,Mumbai,2023-05-12
6,Kavya Reddy,kavya@gmail.com,Hyderabad,2023-06-18
7,Arjun Nair,arjun@yahoo.com,Chennai,2023-07-22
8,Sita Verma,sita@gmail.com,Delhi,2023-08-30
9,Mohan Das,mohan@gmail.com,Kolkata,2023-09-14
10,Anita Roy,anita@gmail.com,Mumbai,2023-10-05
6,Kavya Reddy,kavya@gmail.com,Hyderabad,2023-06-18
11,Deepak Joshi,deepak@gmail.com,Bangalore,2023-11-18"""

_CSVS['orders_raw.csv'] = """cust_id,amt,dt,status
1,12500,2024-01-10,completed
2,8200,2024-01-11,completed
3,15000,2024-01-12,completed
4,3500,2024-01-13,pending
5,7800,2024-01-14,completed"""

_CSVS['order_items.csv'] = """order_id,product_id,quantity,unit_price,discount
1,1,1,89999,0
1,10,2,29999,0.1
2,7,3,2999,0.05
3,2,1,74999,0
4,4,2,8999,0
5,3,1,59999,0.15
6,8,5,1299,0
7,11,1,39999,0.1
8,6,2,5999,0.05
9,5,1,7999,0"""

_CSVS['employees.csv'] = """id,name,age,city,salary,department
1,Ravi Kumar,28,Mumbai,75000,Engineering
2,Priya Sharma,32,Bangalore,90000,Data
3,Amit Singh,25,Delhi,,Engineering
4,Neha Patel,30,Pune,85000,Marketing
5,Raj Mehta,45,Mumbai,150000,Management
6,Kavya Reddy,27,,72000,Data
7,Arjun Nair,35,Chennai,95000,Engineering
8,Sita Verma,,Delhi,68000,HR
9,Mohan Das,42,Kolkata,,Management
10,Anita Roy,29,Mumbai,80000,Data"""

_CSVS['messy_data.csv'] = """id,name,age,city,salary,dept,phone,email,score,grade
1,Ravi,28,Mumbai,75000,Engineering,9876543210,ravi@gmail.com,85,A
2,,32,,90000,,9765432109,,72,
3,Amit,,Delhi,,,9654321098,amit@gmail.com,,C
4,Neha,30,Pune,85000,Marketing,,neha@gmail.com,91,A
5,,,,,,,,,
6,Kavya,27,Hyderabad,72000,Data,9321098765,kavya@gmail.com,78,B
7,,35,Chennai,95000,Engineering,9210987654,,88,A
8,Sita,28,,,HR,9109876543,sita@gmail.com,,
9,Mohan,42,Kolkata,,Management,,,65,C
10,Anita,29,Mumbai,80000,Data,9987654321,anita@gmail.com,95,A"""

_CSVS['data.csv'] = _CSVS['sales_data.csv']

_CSVS['daily_sales.csv'] = """date,revenue,orders,customers
2024-01-01,85000,12,10
2024-01-02,92000,15,13
2024-01-03,78000,11,9
2024-01-04,105000,18,16
2024-01-05,98000,14,12
2024-01-06,115000,20,18
2024-01-07,88000,13,11
2024-01-08,125000,22,20
2024-01-09,95000,16,14
2024-01-10,110000,19,17
2024-01-11,130000,24,21
2024-01-12,88000,12,10"""

_CSVS['transactions.csv'] = """txn_id,user_id,amount,type,date,notes
1,1,5000,credit,2024-01-10,salary
2,1,1200,debit,2024-01-11,grocery
3,2,8000,credit,2024-01-12,salary
4,3,-450,debit,2024-01-13,duplicate charge
5,2,2500,debit,2024-01-14,rent
6,4,12000,credit,2024-01-15,salary
7,1,0,debit,2024-01-16,chargeback request
8,3,250,debit,2024-01-17,refund requested
9,5,9000,credit,2024-01-18,salary
10,2,-120,debit,2024-01-19,fraud alert"""

_CSVS['web_logs.csv'] = """session_id,user_id,endpoint,response_time_ms,status_code,date
1,101,/api/checkout,245,200,2024-01-10
2,102,/api/products,89,200,2024-01-10
3,103,/api/checkout,1240,500,2024-01-10
4,104,/api/search,145,200,2024-01-11
5,105,/api/checkout,198,200,2024-01-11
6,106,/api/products,112,200,2024-01-11
7,107,/api/search,380,200,2024-01-12
8,108,/api/checkout,420,200,2024-01-12
9,109,/api/products,95,200,2024-01-12
10,110,/api/checkout,920,500,2024-01-13"""

# ── Mock pd.read_csv to serve inline data ─────────────────────────────────────
_orig_read_csv = pd.read_csv
def _mock_read_csv(path, *args, **kwargs):
    name = os.path.basename(str(path))
    csv_str = _CSVS.get(name) or next((v for k, v in _CSVS.items() if k in str(path)), None)
    if csv_str:
        return _orig_read_csv(io.StringIO(csv_str.strip()), *args, **kwargs)
    fallback = """id,name,category,value,date
1,Item A,Electronics,100,2024-01-01
2,Item B,Clothing,200,2024-01-02
3,Item C,Footwear,150,2024-01-03
4,Item D,Electronics,300,2024-01-04
5,Item E,Clothing,250,2024-01-05"""
    return _orig_read_csv(io.StringIO(fallback.strip()), *args, **kwargs)

pd.read_csv = _mock_read_csv

# ─────────────────────────────────────────────────────────────────────────────
# USER CODE BELOW
# ─────────────────────────────────────────────────────────────────────────────
`;

/**
 * Strip line numbers from Python tracebacks that reference the preamble,
 * and adjust line numbers to match the user's code.
 */
const PREAMBLE_LINES = SETUP_PREAMBLE.split('\n').length;

function cleanTraceback(stderr) {
  if (!stderr) return '';
  return stderr
    .split('\n')
    .map(line => {
      // Adjust "line N" references to subtract preamble lines
      return line.replace(/line (\d+)/g, (_, n) => {
        const adjusted = parseInt(n) - PREAMBLE_LINES;
        return adjusted > 0 ? `line ${adjusted}` : 'line 1';
      });
    })
    .join('\n')
    .trim();
}

/**
 * Execute Python code in a child process.
 * Returns { success, output, error, exitCode }
 */
function executePython(userCode, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const tmpFile = path.join(tmpdir(), `dm_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);
    const fullCode = SETUP_PREAMBLE + '\n' + userCode;

    try {
      writeFileSync(tmpFile, fullCode, 'utf8');
    } catch (e) {
      return resolve({ success: false, output: '', error: 'Could not create temp file: ' + e.message, exitCode: 1 });
    }

    const child = execFile(
      'python3', [tmpFile],
      { timeout: timeoutMs, maxBuffer: 1024 * 512 }, // 512KB output cap
      (err, stdout, stderr) => {
        // Clean up temp file
        try { if (existsSync(tmpFile)) unlinkSync(tmpFile); } catch (_) {}

        const out = (stdout || '').trim();
        const errText = cleanTraceback(stderr || '');

        if (err) {
          if (err.killed || err.signal === 'SIGTERM') {
            return resolve({ success: false, output: out, error: '⏱ Execution timed out (8s limit). Check for infinite loops.', exitCode: 1 });
          }
          return resolve({ success: false, output: out, error: errText || err.message, exitCode: err.code || 1 });
        }

        resolve({ success: true, output: out || '(no output)', error: '', exitCode: 0 });
      }
    );
  });
}

module.exports = { executePython };
