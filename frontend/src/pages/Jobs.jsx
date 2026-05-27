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

  if (!isPremium) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">💼 Data Analytics Jobs</div>
          <div className="page-sub">300+ curated roles from top Indian companies</div>
        </div>
        <div className="jobs-paywall">
          <span className="paywall-icon">🔒</span>
          <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: '0.5rem' }}>Pro Feature</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
            Get access to 300+ hand-picked data analytics job listings from Google, Amazon, Flipkart, Swiggy and more — updated regularly.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            {['Google India', 'Amazon', 'Flipkart', 'Meesho', 'Swiggy', 'Zomato', 'PhonePe', 'Dream11'].map(c => (
              <span key={c} className="pill pill-purple" style={{ fontSize: 12 }}>{c}</span>
            ))}
          </div>
          <a href="/premium">
            <button className="btn-gold" style={{ fontSize: 15 }}>
              <span>👑</span> Get Pro — ₹149 lifetime
            </button>
          </a>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Includes 1:1 mentorship, resume review & more</div>
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
        <div className="page-sub">{jobs.length} curated roles from top companies — updated regularly</div>
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
            <div key={job.id} className="job-card" style={{ animationDelay: `${i * 0.04}s` }}>
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
