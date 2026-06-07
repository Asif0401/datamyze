import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CompanyLogo from '../components/CompanyLogo';

const ADMIN_EMAIL = 'ak384837@gmail.com';

/* ── All placement data hardcoded — no API needed ───── */
const COMPANIES = [
  {
    id:'flipkart', name:'Flipkart', logo:'🛒', color:'#2874F0', industry:'E-commerce',
    difficulty:'Hard', salary:'8L–18L', successRate:15,
    roles:['Data Analyst','BI Engineer','Product Analyst'],
    rounds:[
      {round:'Online Assessment',duration:'90 min',desc:'SQL on HackerRank — 3 problems covering window functions (RANK, DENSE_RANK, LAG), CTEs, self-joins. Plus 10 aptitude MCQs on data interpretation.'},
      {round:'Technical SQL Round',duration:'60 min',desc:'Deep dive into window functions, query optimisation, indexing. Write and explain GMV trend queries, cohort analysis, top-N per category.'},
      {round:'Technical Python & Analytics',duration:'60 min',desc:'Python/Pandas cohort retention table and a case study on Flipkart mobile app GMV drop — funnel diagnosis using data.'},
      {round:'Hiring Manager Round',duration:'45 min',desc:'Product sense + metric design. "How would you measure the success of Flipkart Big Billion Days?" A/B testing basics, business impact.'},
      {round:'HR Round',duration:'30 min',desc:'Cultural fit, career goals, why Flipkart, and compensation discussion.'},
    ],
    topics:['Window Functions','CTEs','Python Pandas','Cohort Analysis','Funnel Analysis','A/B Testing','GMV Metrics','Query Optimisation'],
    tips:[
      'Master RANK(), DENSE_RANK(), ROW_NUMBER(), LAG(), LEAD() — Flipkart tests these in almost every round. Practice top-N per group using RANK in a CTE.',
      'Study the Big Billion Days funnel: impressions → search → PDP → add-to-cart → checkout → payment. You will be asked to diagnose drops.',
      'Build a cohort retention matrix in Pandas from scratch — convert order_date to cohort_month and build a pivot table.',
      'Know Month-over-Month GMV growth using LAG() window function — near-guaranteed in the SQL round.',
      'Research Flipkart seller ecosystem (marketplace model), Flipkart Wholesale, and logistics arm Ekart — product round grounds in these.',
    ],
  },
  {
    id:'amazon', name:'Amazon India', logo:'📦', color:'#FF9900', industry:'E-commerce',
    difficulty:'Hard', salary:'12L–25L', successRate:12,
    roles:['Business Intelligence Engineer','Data Analyst','Data Engineer'],
    rounds:[
      {round:'Recruiter Screen',duration:'20 min',desc:'Background check, role expectations, location. BIE roles require SQL + Python + basic ETL knowledge.'},
      {round:'Online Assessment',duration:'75 min',desc:'Two problems: one advanced SQL (partitioned ranking, rolling aggregates) and one Python/Pandas (data cleaning, missing values, outlier handling). LeetCode Medium level.'},
      {round:'Technical SQL & Data Modeling',duration:'60 min',desc:'Correlated subqueries, NULL handling, 7-day rolling average, star schema vs snowflake. Prime vs non-Prime purchase frequency analysis.'},
      {round:'Technical Python & ETL',duration:'60 min',desc:'Pandas data pipeline, ETL design for reporting dashboard, AWS concepts (S3, Redshift). Detect SLA breach orders and flag them.'},
      {round:'Bar Raiser Round',duration:'60 min',desc:'Amazon 16 Leadership Principles with STAR-format answers. Every example must be quantified. This is make-or-break — 40% fail here.'},
    ],
    topics:['Window Functions','Data Modeling','ETL Design','Python Pandas','AWS Basics','Leadership Principles','Statistical Analysis','Delivery SLA Metrics'],
    tips:[
      'Prepare 2-3 STAR-format stories for each of Amazon 16 Leadership Principles. Customer Obsession, Dive Deep, and Ownership are tested most. Quantify every result.',
      'The Bar Raiser round eliminates more candidates than technical rounds. Spend 40% of prep time on behavioral answers.',
      'Know SQL window functions plus star schema vs snowflake trade-offs. BIE roles involve heavy data modeling work.',
      'Practice designing ETL pipelines: S3 landing → Glue transform → Redshift. Even basic AWS knowledge differentiates you.',
      'Study Amazon flywheel (Prime ecosystem, delivery network, marketplace). Case questions often involve Prime membership impact on purchase behavior.',
    ],
  },
  {
    id:'swiggy', name:'Swiggy', logo:'🍔', color:'#FC8019', industry:'Food Delivery',
    difficulty:'Hard', salary:'10L–20L', successRate:18,
    roles:['Data Analyst','Product Analyst','Business Analyst'],
    rounds:[
      {round:'Online Test',duration:'60 min',desc:'SQL questions (JOINs, aggregations, basic window functions) + logical reasoning. 20-25 questions.'},
      {round:'Technical Round 1',duration:'60 min',desc:'SQL deep dive + data interpretation. Delivery time analysis, restaurant churn, surge pricing logic.'},
      {round:'Take-Home Assignment',duration:'3-4 days',desc:'Real Swiggy dataset (anonymised). Do EDA, find key insights, build a visualisation, present recommendations.'},
      {round:'Assignment Presentation',duration:'45 min',desc:'Walk through your take-home analysis. Defend every decision — why this metric, why this chart, what are the caveats.'},
      {round:'Culture Round',duration:'30 min',desc:'Swiggy moves fast. They want problem-solvers who communicate clearly and handle ambiguity.'},
    ],
    topics:['SQL Aggregations','Delivery Metrics','Cohort Analysis','Python EDA','Data Visualisation','Surge Pricing Logic','Funnel Analysis','Business Problem Solving'],
    tips:[
      'The take-home is the most important round. Show storytelling — do not just show numbers, explain "so what?"',
      'Know Swiggy business: hyperlocal delivery, dark stores (Instamart), restaurant onboarding metrics, delivery partner efficiency.',
      'For delivery analytics: understand SLA breach, delivery time percentiles (P50/P90/P99), surge multiplier logic.',
      'Use Python (Pandas + Matplotlib/Seaborn) for the take-home — Jupyter Notebook format is expected.',
      'Prepare cohort retention and repeat order rate analysis — these are Swiggy core metrics.',
    ],
  },
  {
    id:'zomato', name:'Zomato', logo:'🍕', color:'#E23744', industry:'Food Delivery',
    difficulty:'Hard', salary:'8L–16L', successRate:20,
    roles:['Data Analyst','Analytics Manager Trainee','Product Analyst'],
    rounds:[
      {round:'Online Assessment',duration:'60 min',desc:'SQL + analytical reasoning. Questions based on restaurant discovery, food delivery funnels, or Gold membership analysis.'},
      {round:'Technical Interview',duration:'60 min',desc:'SQL with business context: "Write a query to find impact of Zomato Gold on order frequency." Before/after analysis patterns.'},
      {round:'Analytical Case Study',duration:'45 min',desc:'Business scenario (e.g. "Zomato Hyperpure GMV declined 10% — diagnose"), structure a data-driven investigation.'},
      {round:'Final Round',duration:'45 min',desc:'Metric design, north star metric discussion. "How would you measure success of Blinkit integration?"'},
    ],
    topics:['Before/After SQL Analysis','Metric Design','Funnel Analysis','North Star Metrics','Python Pandas','A/B Testing','Restaurant Analytics','Cohort Analysis'],
    tips:[
      'Understand Zomato full product suite: food delivery, Hyperpure (B2B supplies), Blinkit (quick commerce), Zomato Gold.',
      'Practice before/after SQL patterns using LAG() — Zomato loves measuring impact of feature launches.',
      'For case studies: always start with "what metric am I trying to move?" before diving into analysis.',
      'Know the difference between leading and lagging indicators — interviews heavily focus on metric design frameworks.',
      'Blinkit acquisition is a hot topic — study quick commerce metrics: inventory turns, slot availability, 10-min delivery SLA.',
    ],
  },
  {
    id:'phonepe', name:'PhonePe', logo:'💸', color:'#5F259F', industry:'Fintech',
    difficulty:'Hard', salary:'9L–18L', successRate:15,
    roles:['Data Analyst','Product Analyst','Risk Analyst'],
    rounds:[
      {round:'Written Test',duration:'45 min',desc:'SQL + basic stats (probability, distributions). Fintech-specific: transaction success rates, payment failure analysis.'},
      {round:'Technical Round 1',duration:'60 min',desc:'SQL: complex queries on transaction data — fraud detection signals, bank success rates, UPI transaction funnel.'},
      {round:'Technical Round 2',duration:'60 min',desc:'Statistics + Python: hypothesis testing, A/B test analysis, time series anomaly detection on payment volumes.'},
      {round:'Senior Manager Round',duration:'45 min',desc:'Root cause analysis: "UPI success rate dropped 3% this week — walk me through your investigation."'},
    ],
    topics:['Payment Analytics','Fraud Detection','SQL Window Functions','Statistical Testing','Time Series Analysis','UPI Transaction Flow','Risk Metrics','Python Pandas'],
    tips:[
      'Understand UPI transaction flow end-to-end: initiation, bank routing, settlement. Know what causes failures at each step.',
      'Study fraud detection signals: velocity checks (too many txns in X min), device fingerprinting, geographic anomalies.',
      'PhonePe asks about precision vs recall in fraud context — know when you prefer one over the other.',
      'For root cause round: always start broad (all banks, all transaction types) then narrow down — show structured thinking.',
      'Know basic payment regulations: RBI guidelines, PCI DSS, UPI interchange fees. Shows genuine fintech interest.',
    ],
  },
  {
    id:'razorpay', name:'Razorpay', logo:'💳', color:'#2962FF', industry:'Fintech',
    difficulty:'Hard', salary:'12L–22L', successRate:13,
    roles:['Data Analyst','Analytics Engineer','Product Analyst'],
    rounds:[
      {round:'Online Screening',duration:'60 min',desc:'SQL + Python on HackerRank. Latency analysis (percentiles), merchant activation funnel queries.'},
      {round:'Technical Round 1',duration:'60 min',desc:'Advanced SQL: P50/P90/P99 latency calculation, chargeback rate analysis, payment gateway performance metrics.'},
      {round:'Technical Round 2',duration:'60 min',desc:'Python + data modelling: ETL pipeline design, dbt concepts, analytical engineering patterns.'},
      {round:'Case Study Round',duration:'45 min',desc:'"Smart routing reduced success rates instead of improving them — diagnose." A/B test analysis + causal reasoning.'},
      {round:'Culture Round',duration:'30 min',desc:'High-ownership culture. They want people who identify problems proactively and ship fast.'},
    ],
    topics:['Payment Latency (P99)','Chargeback Analysis','SQL Percentiles','dbt Analytical Engineering','A/B Testing','Python ETL','Merchant Metrics','Statistical Significance'],
    tips:[
      'Master percentile calculations: PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms). P99 SLA violations are a core metric.',
      'Study dbt fundamentals: staging, intermediate, mart layers. Razorpay has shifted heavily to analytical engineering.',
      'Understand payment routing: how acquirer selection works, why switching acquirers improves success rates.',
      'For A/B tests: know how to calculate statistical significance, lift, and minimum detectable effect (MDE).',
      'PCI DSS and RBI regulations come up — know what they govern (card data security, payment processing rules).',
    ],
  },
  {
    id:'meesho', name:'Meesho', logo:'🛍️', color:'#8B5CF6', industry:'Social Commerce',
    difficulty:'Medium', salary:'7L–14L', successRate:25,
    roles:['Data Analyst','Growth Analyst','Business Analyst'],
    rounds:[
      {round:'Online Test',duration:'45 min',desc:'SQL + basic analytical questions. Focus on e-commerce metrics: GMV, reseller activation, return rates.'},
      {round:'Technical Interview',duration:'60 min',desc:'SQL on reseller data: viral coefficient, activation funnels, Tier-2 city penetration analysis.'},
      {round:'Case Study',duration:'30 min',desc:'Meesho-specific problem: "Return abuse is rising — how do you identify and handle it?" Structured thinking expected.'},
      {round:'HR Round',duration:'30 min',desc:'Meesho values speed and frugality. Show you can work with ambiguity and ship fast with limited resources.'},
    ],
    topics:['Reseller Analytics','Viral Coefficient','Tier-2 City Metrics','Return Abuse Detection','SQL Aggregations','Growth Analytics','Funnel Analysis','Cost Efficiency Metrics'],
    tips:[
      'Understand Meesho unique model: resellers share products on WhatsApp/Facebook and earn margins. Very different from B2C.',
      'Viral coefficient K = (invites sent per user) x (conversion rate). If K > 1, growth is viral. Practice calculating this.',
      'Tier-2/3 city penetration is central — know how to segment by city tier and compare category adoption rates.',
      'Return abuse is a top concern: users with >60% return rate over 90 days with 10+ orders. Practice flagging in SQL.',
      'Meesho is frugal — in case studies, always suggest the lowest-cost solution that achieves the goal.',
    ],
  },
  {
    id:'cred', name:'CRED', logo:'💎', color:'#00C853', industry:'Fintech',
    difficulty:'Hard', salary:'14L–28L', successRate:10,
    roles:['Analytics Engineer','Data Analyst','Product Analyst'],
    rounds:[
      {round:'Technical Screen',duration:'60 min',desc:'Advanced SQL: recursive CTEs, complex window functions, query performance. CRED bar is very high — expect Hard-level questions.'},
      {round:'Analytics Engineering Round',duration:'60 min',desc:'dbt project review or design: staging models, testing, documentation. Data modelling for credit/rewards data.'},
      {round:'Product Analytics Round',duration:'60 min',desc:'Deep product sense + data: "How would you measure CRED coin redemption health?" North star metrics, leading indicators.'},
      {round:'System Design (Data)',duration:'45 min',desc:'Design an event tracking pipeline for CRED Jackpot feature. Handle scale, idempotency, and late-arriving events.'},
      {round:'Director Round',duration:'30 min',desc:'Strategic thinking, past high-impact work, how you handle ambiguity in a fast-moving product.'},
    ],
    topics:['dbt & Analytical Engineering','Recursive CTEs','Credit Score Analytics','Coin/Reward Metrics','Data Pipeline Design','Python Advanced','Statistical Testing','Product Metric Design'],
    tips:[
      'CRED has the highest SQL bar in India — practice recursive CTEs, complex window functions, and query optimisation daily.',
      'Learn dbt deeply: models, tests, docs, snapshots, macros. CRED has one of India most mature dbt implementations.',
      'Understand credit score segmentation: behaviour differs drastically between <650, 650-750, 750-800, 800+ segments.',
      'CRED coin ecosystem is complex: coins earned → redeemed → purchase_completed funnel. Know how to measure each step.',
      'For system design: focus on idempotency, event deduplication, and late-data handling in Kafka/Flink pipelines.',
    ],
  },
  {
    id:'dream11', name:'Dream11', logo:'🏏', color:'#1A73E8', industry:'Gaming',
    difficulty:'Medium', salary:'8L–16L', successRate:22,
    roles:['Data Analyst','Product Analyst','Growth Analyst'],
    rounds:[
      {round:'Online Assessment',duration:'60 min',desc:'SQL + Python. Fantasy sports context: team selection analysis, contest entry patterns, player point distributions.'},
      {round:'Technical Round 1',duration:'60 min',desc:'SQL: team duplication rate, captain/VC selection bias, ARPU by match format (T20 vs ODI vs Test).'},
      {round:'Technical Round 2',duration:'45 min',desc:'Python optimisation: "Build an optimal Dream11 team within Rs 100 credit budget." Linear programming or greedy approach.'},
      {round:'Product & Culture Round',duration:'30 min',desc:'Product instinct, user behaviour. "How would you improve Dream11 retention during off-season?"'},
    ],
    topics:['Fantasy Sports Metrics','SQL Aggregations','Python Optimisation','User Retention','ARPU Analysis','Team Duplication Detection','PuLP Linear Programming','Contest Analytics'],
    tips:[
      'Understand fantasy sports fundamentals: captain (2x points) and VC (1.5x) selection, salary-cap constraints, differential picks.',
      'Practice the team optimiser problem: given player salary and predicted points, maximise total points within Rs 100 budget using PuLP.',
      'Dream11 key metrics: ARPU per match, contest fill rate, team duplication rate (high duplication = low differentiation = bad product).',
      'Off-season retention is a top challenge — prepare ideas around non-cricket content (football, kabaddi) and streak-based rewards.',
      'Contest pricing: multiple price points (Rs 9 to Rs 5000). Know how to segment users by willingness to pay.',
    ],
  },
  {
    id:'walmart', name:'Walmart Global Tech', logo:'🏪', color:'#0071CE', industry:'Retail',
    difficulty:'Hard', salary:'10L–22L', successRate:14,
    roles:['Data Analyst','Business Intelligence Engineer','Data Scientist'],
    rounds:[
      {round:'HackerRank Screen',duration:'90 min',desc:'SQL + Python. Retail context: inventory management, demand forecasting accuracy, supplier performance.'},
      {round:'Technical Round 1',duration:'60 min',desc:'Advanced SQL: inventory turnover ratio, demand forecast MAPE, store performance benchmarking with composite scores.'},
      {round:'Technical Round 2',duration:'60 min',desc:'Statistics + ML: demand forecasting (ARIMA, Prophet), market basket analysis (Apriori), store clustering.'},
      {round:'Case Study — Supply Chain',duration:'45 min',desc:'"A supplier delayed shipment 2 weeks. Model the downstream stockout impact." Quantification + stakeholder communication.'},
      {round:'Hiring Manager',duration:'30 min',desc:'Scale focus: Walmart processes petabytes daily. Show you can think at scale — partitioning, indexing, distributed computing.'},
    ],
    topics:['Inventory Analytics','Demand Forecasting','Market Basket Analysis','SQL at Scale','Python ML','Apriori Algorithm','Supply Chain Metrics','Store Performance'],
    tips:[
      'Inventory turnover = COGS / avg_inventory. Anything < 2 is slow-moving. Know how to calculate this by category and quarter.',
      'MAPE (Mean Absolute Percentage Error) is Walmart primary forecast accuracy metric. Practice implementing in both SQL and Python.',
      'Market basket analysis: implement Apriori using mlxtend. Know support, confidence, and lift — lift > 1 means items are complementary.',
      'Walmart operates at massive scale — always mention partitioning, indexing, and caching when discussing query performance.',
      'Understand shrinkage (theft/damage/admin error). It is a major retail KPI: shrinkage = (expected - actual inventory).',
    ],
  },
];

const DIFF_COLOR = { Easy:'#5CC8A0', Medium:'#E8A838', Hard:'#F07B6A' };
const TOPIC_COLOR = (t) => {
  if (/sql|cte|window|query|join/i.test(t)) return '#38bdf8';
  if (/python|pandas|ml|model/i.test(t)) return '#FFD343';
  if (/a\/b|test|stat/i.test(t)) return '#a78bfa';
  if (/metric|funnel|cohort|analysis/i.test(t)) return '#5CC8A0';
  return '#E8A838';
};

/* ── Paywall ─────────────────────────────────────── */
function PaywallView({ navigate }) {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🏢 Company Placement Material</div>
        <div className="page-sub">Interview breakdown, prep tips and salary ranges for top companies</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'1.6rem' }}>
        {[{icon:'🏢',val:'10',lbl:'Companies',color:'#4A90D9'},{icon:'📋',val:'40+',lbl:'Interview Rounds',color:'#5CC8A0'},{icon:'💡',val:'50+',lbl:'Prep Tips',color:'#E8A838'},{icon:'💰',val:'Live',lbl:'Salary Data',color:'#a78bfa'}].map((s,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,0.08)',border:`1px solid ${s.color}28`,borderRadius:14,padding:'1rem',textAlign:'center'}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:3}}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{position:'relative',marginBottom:'1.6rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.9rem',filter:'blur(5px)',pointerEvents:'none',userSelect:'none',opacity:0.5}}>
          {COMPANIES.slice(0,6).map(co=>(
            <div key={co.id} style={{background:'rgba(255,255,255,0.08)',border:`1px solid ${co.color}28`,borderTop:`2px solid ${co.color}55`,borderRadius:16,padding:'1.2rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <CompanyLogo company={co.name} size={36} radius={10} color={co.color} />
                <div><div style={{fontWeight:800,fontSize:14,color:'#fff'}}>{co.name}</div><div style={{fontSize:11,color:'rgba(255,255,255,0.38)'}}>{co.industry}</div></div>
              </div>
              <div style={{display:'flex',gap:5}}><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${co.color}18`,color:co.color}}>{co.rounds.length} Rounds</span><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.45)'}}>{co.difficulty}</span></div>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(to bottom,transparent,rgba(4,6,14,0.80) 40%,rgba(4,6,14,0.97) 100%)',borderRadius:16,zIndex:2}}>
          <div style={{textAlign:'center',padding:'2rem 1.5rem'}}>
            <div style={{fontSize:40,marginBottom:'0.8rem'}}>🔒</div>
            <div style={{fontSize:20,fontWeight:900,color:'#fff',marginBottom:6}}>Premium Feature</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.50)',marginBottom:'1.4rem',maxWidth:340}}>Unlock full interview guides for Flipkart, Amazon, Swiggy, Zomato and 6 more companies.</div>
            {['Full interview process breakdown (4-5 rounds per company)','Round-by-round preparation guide','Company-specific insider prep tips','Key topics tested per company','Realistic salary ranges'].map(b=>(
              <div key={b} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:8,textAlign:'left'}}><span style={{color:'#5CC8A0',fontWeight:900}}>✓</span>{b}</div>
            ))}
            <button onClick={()=>navigate('/premium')} style={{marginTop:'0.8rem',padding:'0.75rem 2rem',borderRadius:12,background:'linear-gradient(135deg,#E8A838,#f59e0b)',border:'none',color:'#000',fontWeight:800,fontSize:15,cursor:'pointer'}}>
              👑 Upgrade to Pro — ₹199
            </button>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:8}}>One-time payment · Lifetime access</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Company Detail ───────────────────────────────── */
function CompanyDetail({ co, onBack }) {
  const diffColor = DIFF_COLOR[co.difficulty];

  return (
    <div className="page">
      <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:10,padding:'7px 16px',color:'rgba(255,255,255,0.70)',fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:'1.4rem',transition:'all .15s'}}
        onMouseEnter={e=>{e.currentTarget.style.background='rgba(28,36,68,0.95)';e.currentTarget.style.color='#fff';}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(20,27,56,0.88)';e.currentTarget.style.color='rgba(255,255,255,0.70)';}}>
        ← Back
      </button>

      {/* Hero Header */}
      <div style={{background:`linear-gradient(135deg, ${co.color}22 0%, rgba(20,27,56,0.96) 100%)`,border:`1px solid ${co.color}40`,borderTop:`3px solid ${co.color}`,borderRadius:20,padding:'1.8rem',marginBottom:'1.4rem',boxShadow:`0 8px 32px rgba(0,0,0,0.40), 0 0 0 1px ${co.color}18`}}>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:'1.2rem'}}>
          {/* Logo */}
          <CompanyLogo company={co.name} size={64} radius={18} color={co.color} />
          <div style={{flex:1}}>
            <div style={{fontSize:24,fontWeight:900,color:'#fff',marginBottom:6,letterSpacing:'-0.5px'}}>{co.name}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.50)',background:'rgba(255,255,255,0.06)',padding:'2px 10px',borderRadius:20,border:'1px solid rgba(255,255,255,0.10)'}}>{co.industry}</span>
              <span style={{fontSize:12,fontWeight:800,padding:'2px 10px',borderRadius:20,background:`${diffColor}15`,border:`1px solid ${diffColor}35`,color:diffColor}}>{co.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.6rem',marginBottom:'1.1rem'}}>
          {[{icon:'💰',label:'Salary Range',val:`₹${co.salary} LPA`},{icon:'🎯',label:'Offer Rate',val:`~${co.successRate}%`},{icon:'📋',label:'Interview Rounds',val:`${co.rounds.length} rounds`}].map(s=>(
            <div key={s.label} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:12,padding:'0.75rem',textAlign:'center'}}>
              <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
              <div style={{fontSize:14,fontWeight:900,color:'#fff',letterSpacing:'-0.3px'}}>{s.val}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2,textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div>
          <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.30)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:8}}>Roles they hire</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {co.roles.map(r=><span key={r} style={{fontSize:12,fontWeight:700,padding:'5px 14px',borderRadius:20,background:`${co.color}20`,border:`1px solid ${co.color}45`,color:co.color}}>{r}</span>)}
          </div>
        </div>
      </div>

      {/* Interview Rounds */}
      <div style={{marginBottom:'1.2rem'}}>
        <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'0.8rem'}}>📋 Interview Process</div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.7rem'}}>
          {co.rounds.map((r,i)=>(
            <div key={i} style={{display:'flex',gap:0,alignItems:'stretch'}}>
              {/* Number column + connector */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:44,flexShrink:0}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:`${co.color}20`,border:`2px solid ${co.color}60`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,color:co.color,flexShrink:0}}>{i+1}</div>
                {i < co.rounds.length-1 && <div style={{width:2,flex:1,minHeight:12,background:`linear-gradient(${co.color}40, transparent)`,marginTop:4}} />}
              </div>
              {/* Card */}
              <div style={{flex:1,background:'rgba(255,255,255,0.08)',border:`1px solid ${co.color}22`,borderLeft:`3px solid ${co.color}60`,borderRadius:'0 14px 14px 0',padding:'0.9rem 1.1rem',marginBottom: i < co.rounds.length-1 ? 0 : 0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                  <span style={{fontSize:13,fontWeight:800,color:'#fff'}}>{r.round}</span>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${co.color}15`,border:`1px solid ${co.color}30`,color:co.color,whiteSpace:'nowrap'}}>{r.duration}</span>
                </div>
                <div style={{fontSize:12.5,color:'rgba(255,255,255,0.62)',lineHeight:1.70}}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Topics */}
      <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:16,padding:'1.3rem',marginBottom:'1.2rem'}}>
        <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'0.9rem'}}>🏷️ Key Topics to Master</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {co.topics.map(t=>{const c=TOPIC_COLOR(t);return(
            <span key={t} style={{fontSize:12,fontWeight:700,padding:'6px 14px',borderRadius:20,background:`${c}15`,border:`1px solid ${c}35`,color:c}}>{t}</span>
          );})}
        </div>
      </div>

      {/* Prep Tips */}
      <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:16,padding:'1.3rem'}}>
        <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'0.9rem'}}>💡 Preparation Tips</div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.65rem'}}>
          {co.tips.map((tip,i)=>(
            <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',background:'rgba(14,20,40,0.70)',border:'1px solid rgba(232,168,56,0.15)',borderLeft:'3px solid rgba(232,168,56,0.55)',borderRadius:'0 12px 12px 0',padding:'0.8rem 1rem'}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(232,168,56,0.15)',border:'1px solid rgba(232,168,56,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,color:'#E8A838',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.78)',lineHeight:1.70}}>{tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function CompanyPlacement() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const isPremium = user?.is_premium === 1 || user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  const [selected, setSelected] = useState(null);

  if (!isPremium) return <PaywallView navigate={navigate} />;
  if (selected)   return <CompanyDetail co={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:'1.6rem'}}>
        <div>
          <div className="page-title">🏢 Company Placement Material</div>
          <div className="page-sub">Interview breakdown, prep tips and salary ranges for {COMPANIES.length} top companies</div>
        </div>
        <span style={{fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'rgba(232,168,56,0.15)',border:'1px solid rgba(232,168,56,0.30)',color:'#E8A838'}}>👑 Pro</span>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.8rem',marginBottom:'1.6rem'}}>
        {[{icon:'🏢',val:COMPANIES.length,lbl:'Companies',color:'#4A90D9'},{icon:'📋',val:`${COMPANIES.reduce((s,c)=>s+c.rounds.length,0)}+`,lbl:'Interview Rounds',color:'#5CC8A0'},{icon:'💡',val:`${COMPANIES.reduce((s,c)=>s+c.tips.length,0)}+`,lbl:'Prep Tips',color:'#E8A838'},{icon:'💰',val:'Live',lbl:'Salary Data',color:'#a78bfa'}].map((s,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,0.08)',border:`1px solid ${s.color}28`,borderTop:`2px solid ${s.color}60`,borderRadius:14,padding:'1rem',textAlign:'center',animation:`popIn 0.35s ${i*0.07}s ease both`}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:3}}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Company grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1rem'}}>
        {COMPANIES.map((co,i)=>(
          <div key={co.id} onClick={()=>setSelected(co)}
            style={{background:'rgba(255,255,255,0.08)',border:`1px solid ${co.color}28`,borderTop:`2px solid ${co.color}60`,borderRadius:16,padding:'1.3rem',cursor:'pointer',transition:'all 0.2s',animation:`popIn 0.35s ${i*0.05}s ease both`}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,0.40), 0 0 0 1px ${co.color}35`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'0.9rem'}}>
              <CompanyLogo company={co.name} size={42} radius={12} color={co.color} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:15,color:'#fff',marginBottom:2}}>{co.name}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.40)'}}>{co.industry}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'0.8rem'}}>
              <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:`${co.color}14`,color:co.color}}>{co.rounds.length} Rounds</span>
              <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:`${DIFF_COLOR[co.difficulty]}14`,color:DIFF_COLOR[co.difficulty]}}>{co.difficulty}</span>
              <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20,background:'rgba(92,200,160,0.12)',color:'#5CC8A0'}}>₹{co.salary}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>~{co.successRate}% offer rate</span>
              <span style={{fontSize:12,color:co.color,fontWeight:700}}>View Guide →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
