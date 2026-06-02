import { useState, useEffect } from 'react';
import api from '../hooks/useApi';

const TYPE_FILTERS = ['All', 'Full-time', 'Remote', 'Hybrid'];

function getInitials(company) {
  return company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const COMPANY_COLORS = {
  'Google India':    '#4285F4', 'Amazon India':  '#FF9900', 'Flipkart':    '#2874F0',
  'Meesho':          '#8B5CF6', 'Wipro':         '#2196F3', 'Swiggy':      '#FC8019',
  'Zomato':          '#E23744', 'TCS':           '#0055A6', 'PhonePe':     '#5F259F',
  'HDFC Bank':       '#0052CC', 'Nykaa':         '#FC2779', 'Dream11':     '#0A1628',
  'MakeMyTrip':      '#E74C3C', 'Ola':           '#FFCD00', 'Paytm':       '#00BAF2',
  'Reliance Industries': '#0064B0', 'Razorpay':  '#072654', 'Deloitte India': '#86BC25',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const r = await api.get('/jobs');
      setJobs(r.data.jobs || []);
      setIsPremium(true);
    } catch (e) {
      if (e.response?.data?.premium_required) { setIsPremium(false); }
      else { setError('Failed to load jobs.'); }
    } finally { setLoading(false); }
  }

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(j.skills) ? j.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) : false);
    const matchType = typeFilter === 'All' || j.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <div className="loading"><div className="spinner" />Loading jobs...</div>;

  const SAMPLE_JOBS = [
    { title:'Data Analyst', company:'Flipkart', location:'Bengaluru', type:'Full-time', salary:'₹8–14 LPA', skills:['SQL','Python','Tableau'] },
    { title:'BI Engineer', company:'Swiggy', location:'Bengaluru', type:'Hybrid', salary:'₹10–18 LPA', skills:['Power BI','SQL','DAX'] },
    { title:'Product Analyst', company:'Razorpay', location:'Remote', type:'Remote', salary:'₹12–20 LPA', skills:['SQL','Python','Mixpanel'] },
    { title:'Analytics Engineer', company:'Meesho', location:'Bengaluru', type:'Full-time', salary:'₹15–24 LPA', skills:['dbt','BigQuery','Python'] },
  ];

  const COMPANIES = [
    { name:'Google India', color:'#4285F4' }, { name:'Amazon India', color:'#FF9900' },
    { name:'Flipkart',     color:'#2874F0' }, { name:'Swiggy',      color:'#FC8019' },
    { name:'Zomato',       color:'#E23744' }, { name:'Razorpay',    color:'#2962FF' },
    { name:'PhonePe',      color:'#5F259F' }, { name:'Meesho',      color:'#8B5CF6' },
    { name:'CRED',         color:'#00C853' }, { name:'Dream11',     color:'#1A73E8' },
    { name:'Nykaa',        color:'#FC2779' }, { name:'Deloitte',    color:'#86BC25' },
  ];

  if (!isPremium) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">💼 Data Analytics Jobs</div>
          <div className="page-sub">300+ curated roles from top Indian companies</div>
        </div>

        {/* Stats bar */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'1.6rem' }}>
          {[
            { icon:'💼', val:'300+', lbl:'Live Jobs',        color:'#4A90D9' },
            { icon:'🏢', val:'50+',  lbl:'Top Companies',    color:'#5CC8A0' },
            { icon:'🔄', val:'Daily', lbl:'Updated',          color:'#E8A838' },
            { icon:'✅', val:'100%', lbl:'Verified Roles',   color:'#a78bfa' },
          ].map((s,i) => (
            <div key={s.lbl} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}28`, borderRadius:14, padding:'1rem', textAlign:'center', animation:`popIn 0.35s ${i*0.07}s ease both` }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Blurred job preview grid */}
        <div style={{ position:'relative', marginBottom:'1.6rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0.9rem', filter:'blur(4px)', pointerEvents:'none', userSelect:'none', opacity:0.55 }}>
            {SAMPLE_JOBS.map(j => (
              <div key={j.title+j.company} className="job-card">
                <div className="job-header">
                  <div className="job-company-logo" style={{ background: (COMPANY_COLORS[j.company]||'#4A90D9')+'18', color: COMPANY_COLORS[j.company]||'#4A90D9' }}>
                    {getInitials(j.company)}
                  </div>
                  <div>
                    <div className="job-title">{j.title}</div>
                    <div className="job-company">{j.company}</div>
                  </div>
                </div>
                <div className="job-meta">
                  <span className="pill pill-purple" style={{ fontSize:11 }}>📍 {j.location}</span>
                  <span className={`pill ${j.type==='Remote'?'pill-teal':j.type==='Hybrid'?'pill-amber':'pill-purple'}`} style={{ fontSize:11 }}>{j.type}</span>
                </div>
                <div className="job-salary">{j.salary}</div>
                <div className="job-skills">
                  {j.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(to bottom, transparent 0%, rgba(15,17,26,0.7) 40%, rgba(15,17,26,0.96) 100%)', borderRadius:16, zIndex:2 }}>
            <div style={{ background:'rgba(232,168,56,0.10)', border:'1px solid rgba(232,168,56,0.25)', borderRadius:'50%', width:64, height:64, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:14, boxShadow:'0 0 32px rgba(232,168,56,0.20)' }}>🔒</div>
            <div style={{ fontSize:20, fontWeight:800, marginBottom:6, letterSpacing:'-0.3px' }}>Unlock 300+ Jobs</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.40)', marginBottom:20, textAlign:'center', maxWidth:320, lineHeight:1.6 }}>
              Curated Data Analyst, BI & Product roles from India's top companies, verified and updated daily.
            </div>
            <a href="/premium">
              <button className="btn-gold" style={{ fontSize:15, padding:'13px 32px' }}>
                <span>👑</span> Get Pro · ₹199 lifetime
              </button>
            </a>
            <div style={{ marginTop:10, fontSize:11.5, color:'rgba(255,255,255,0.25)' }}>One-time payment · No subscription · Instant access</div>
          </div>
        </div>

        {/* What you unlock */}
        <div style={{ marginBottom:'1.4rem' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12, textAlign:'center' }}>What you unlock</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.8rem' }}>
            {[
              { icon:'🎯', title:'Role-Specific Listings', desc:'Data Analyst, BI Engineer, Product Analyst, Analytics Engineer & more', color:'#4A90D9' },
              { icon:'🏢', title:'Top Companies', desc:'Google, Amazon, Flipkart, Swiggy, Razorpay, CRED and 40+ more', color:'#E8A838' },
              { icon:'💰', title:'Salary Ranges', desc:'Transparent compensation data so you always know your worth', color:'#5CC8A0' },
              { icon:'🛠️', title:'Skills Required', desc:'See exactly which skills each role demands: SQL, Python, Power BI', color:'#a78bfa' },
              { icon:'📍', title:'Location & Type', desc:'Filter by city, remote or hybrid. Find what fits your lifestyle.', color:'#F07B6A' },
              { icon:'🔗', title:'Direct Apply Links', desc:'One-click apply to official job pages, no middlemen', color:'#34D399' },
            ].map((f,i) => (
              <div key={f.title} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${f.color}22`, borderRadius:14, padding:'1.1rem 1rem', animation:`fadeInUp 0.4s ${0.1+i*0.07}s ease both` }}>
                <div style={{ fontSize:22, marginBottom:7 }}>{f.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:4 }}>{f.title}</div>
                <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Company badges */}
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'1.2rem 1.4rem', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:12 }}>Companies hiring data talent</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {COMPANIES.map(c => (
              <span key={c.name} style={{ padding:'5px 13px', borderRadius:20, background:`${c.color}14`, border:`1px solid ${c.color}35`, fontSize:12, fontWeight:600, color:c.color }}>
                {c.name}
              </span>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.3rem' }}>
          <div className="page-title" style={{ margin: 0 }}>💼 Data Analytics Jobs</div>
          <span className="premium-badge">👑 Pro</span>
        </div>
        <div className="page-sub">{jobs.length} curated roles: Data Analyst, BI Engineer, Product Analyst, BI Analyst & more</div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by role, company, or skill..." />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {TYPE_FILTERS.map(t => (
          <button key={t} className={`filter-chip${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>
          {filtered.length} of {jobs.length} jobs
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 40, marginBottom: '0.8rem' }}>🔍</div>
          <div style={{ fontWeight: 600 }}>No jobs match your search</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Try a different keyword or filter</div>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job, i) => (
            <div key={job.id} className="job-card" style={{ animation: 'fadeInUp 0.38s ease both', animationDelay: `${i * 0.05}s` }}>
              <div className="job-header">
                <div className="job-company-logo" style={{ background: COMPANY_COLORS[job.company] ? COMPANY_COLORS[job.company] + '18' : undefined, color: COMPANY_COLORS[job.company] || 'var(--primary-dark)' }}>
                  {getInitials(job.company)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.company}</div>
                </div>
              </div>

              <div className="job-meta">
                <span className="pill pill-purple" style={{ fontSize: 11 }}>📍 {job.location?.split(',')[0]}</span>
                <span className={`pill ${job.type === 'Remote' ? 'pill-teal' : job.type === 'Hybrid' ? 'pill-amber' : 'pill-purple'}`} style={{ fontSize: 11 }}>
                  {job.type}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {job.posted_days_ago === 1 ? '1 day ago' : `${job.posted_days_ago} days ago`}
                </span>
              </div>

              <div className="job-salary">{job.salary}</div>

              <div className="job-skills">
                {(Array.isArray(job.skills) ? job.skills : []).slice(0, 5).map(s => (
                  <span key={s} className="skill-chip">{s}</span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span className="job-source">{job.source}</span>
                <a href={job.url} target="_blank" rel="noreferrer">
                  <button className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                    Apply Now →
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="toast">{error}</div>}
    </div>
  );
}
