import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const ADMIN_EMAIL = 'ak384837@gmail.com';

const TOPIC_COLORS = {
  'Window Functions': '#4A90D9',
  'CTEs': '#4A90D9',
  'Query Optimization': '#4A90D9',
  'SQL Aggregations': '#4A90D9',
  'Data Modeling': '#4A90D9',
  'Date Functions': '#4A90D9',
  'Before/After Analysis': '#4A90D9',
  'Percentile': '#4A90D9',
  'Payment Latency Percentiles': '#4A90D9',
  'Python Pandas': '#F59E0B',
  'Python Optimization': '#F59E0B',
  'Python Forecasting': '#F59E0B',
  'Python mlxtend': '#F59E0B',
  'A/B Testing': '#5CC8A0',
  'Cohort Analysis': '#5CC8A0',
  'Funnel Analysis': '#5CC8A0',
  'Cohort Retention': '#5CC8A0',
  'Metric Design': '#a78bfa',
  'Product Sense': '#a78bfa',
  'Storytelling with Data': '#a78bfa',
  'Fantasy Sports Metrics': '#a78bfa',
  'Fraud Detection': '#F07B6A',
  'UPI Metrics': '#F07B6A',
  'Fintech Regulations': '#F07B6A',
  'RFM Analysis': '#F07B6A',
  'dbt Models': '#34D399',
  'Recursive CTEs': '#34D399',
  'Supply Chain Analytics': '#34D399',
  'Inventory Metrics': '#34D399',
};

function getTopicColor(topic) {
  for (const [key, color] of Object.entries(TOPIC_COLORS)) {
    if (topic.includes(key) || key.includes(topic)) return color;
  }
  return '#94a3b8';
}

const DIFFICULTY_CONFIG = {
  Hard:   { color: '#F07B6A', bg: 'rgba(240,123,106,0.12)', border: 'rgba(240,123,106,0.3)' },
  Medium: { color: '#E8A838', bg: 'rgba(232,168,56,0.12)',  border: 'rgba(232,168,56,0.3)' },
  Easy:   { color: '#5CC8A0', bg: 'rgba(92,200,160,0.12)',  border: 'rgba(92,200,160,0.3)' },
};

// Blurred preview company data for paywall
const PREVIEW_COMPANIES = [
  { name: 'Flipkart',            logo: '🛒', color: '#2874F0', industry: 'E-commerce',     roles: ['Data Analyst', 'BI Engineer'],    difficulty: 'Hard',   salary_range: '₹8L–₹18L' },
  { name: 'Amazon India',        logo: '📦', color: '#FF9900', industry: 'E-commerce',     roles: ['BI Engineer', 'Data Analyst'],    difficulty: 'Hard',   salary_range: '₹12L–₹25L' },
  { name: 'Swiggy',              logo: '🍔', color: '#FC8019', industry: 'Food Delivery',  roles: ['Product Analyst', 'Growth Analyst'], difficulty: 'Hard',   salary_range: '₹10L–₹20L' },
  { name: 'Zomato',              logo: '🍕', color: '#E23744', industry: 'Food Delivery',  roles: ['Data Analyst', 'Product Analyst'], difficulty: 'Hard',   salary_range: '₹8L–₹16L' },
  { name: 'PhonePe',             logo: '💸', color: '#5F259F', industry: 'Fintech',        roles: ['Data Analyst', 'Business Analyst'], difficulty: 'Hard',   salary_range: '₹9L–₹18L' },
  { name: 'Razorpay',            logo: '💳', color: '#2962FF', industry: 'Fintech',        roles: ['Analytics Engineer', 'Data Analyst'], difficulty: 'Hard',   salary_range: '₹12L–₹22L' },
];

/* ── Paywall view ───────────────────────────────────────────── */
function PaywallView() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🏢 Company Placement Material</div>
        <div className="page-sub">Interview process, prep tips &amp; insider guides for India's top tech companies</div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.8rem', marginBottom: '1.6rem' }}>
        {[
          { icon: '🏢', val: '10',   lbl: 'Companies',       color: '#4A90D9' },
          { icon: '🎯', val: '40+',  lbl: 'Interview Rounds', color: '#5CC8A0' },
          { icon: '💼', val: '4',    lbl: 'Job Types',        color: '#E8A838' },
          { icon: '👑', val: 'Pro',  lbl: 'Members Only',     color: '#E8A838' },
        ].map((s, i) => (
          <div key={s.lbl} style={{
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}28`,
            borderRadius: 14, padding: '1rem', textAlign: 'center',
            animation: `popIn 0.35s ${i * 0.07}s ease both`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Blurred company cards grid */}
      <div style={{ position: 'relative', marginBottom: '1.8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.9rem', filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
          {PREVIEW_COMPANIES.map(co => {
            const diff = DIFFICULTY_CONFIG[co.difficulty] || DIFFICULTY_CONFIG.Hard;
            return (
              <div key={co.name} style={{
                background: 'rgba(20,27,56,0.88)',
                border: `1px solid ${co.color}35`,
                borderRadius: 16, padding: '1.2rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${co.color}20`, border: `1px solid ${co.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                  }}>{co.logo}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{co.name}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{co.industry}</div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '3px 9px',
                    background: diff.bg, border: `1px solid ${diff.border}`,
                    borderRadius: 20, color: diff.color,
                  }}>{co.difficulty}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {co.roles.slice(0, 2).map(r => (
                    <span key={r} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: `${co.color}14`, border: `1px solid ${co.color}30`, color: co.color, fontWeight: 600 }}>{r}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#5CC8A0' }}>{co.salary_range}</span>
                  <button style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, background: `${co.color}18`, border: `1px solid ${co.color}35`, color: co.color, cursor: 'pointer', fontWeight: 600 }}>
                    View Guide →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lock overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(10,14,30,0.65) 35%, rgba(10,14,30,0.97) 100%)',
          borderRadius: 16, zIndex: 2,
        }}>
          <div style={{
            background: 'rgba(232,168,56,0.10)', border: '1px solid rgba(232,168,56,0.3)',
            borderRadius: '50%', width: 64, height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            marginBottom: 14, boxShadow: '0 0 32px rgba(232,168,56,0.22)',
          }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px', textAlign: 'center' }}>
            Unlock placement material for Flipkart,<br />Amazon, Swiggy &amp; 7 more top companies
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 20, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
            Full interview breakdown, round-by-round prep guide, and company-specific insider tips.
          </div>
          <a href="/premium">
            <button className="btn-gold" style={{ fontSize: 15, padding: '13px 32px' }}>
              <span>👑</span> Upgrade to Pro — ₹199
            </button>
          </a>
          <div style={{ marginTop: 10, fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>One-time payment · No subscription · Instant access</div>
        </div>
      </div>

      {/* Benefits list */}
      <div style={{
        background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '1.4rem 1.6rem',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14, textAlign: 'center' }}>
          What's inside
        </div>
        {[
          { icon: '📋', text: 'Full interview process breakdown for each company' },
          { icon: '🎯', text: 'Round-by-round preparation guide with exact question types' },
          { icon: '💡', text: 'Company-specific prep tips mentioning real products and context' },
          { icon: '🔑', text: 'Key topics tested per company — SQL, Python, stats, product sense' },
          { icon: '💰', text: 'Insider salary ranges for data roles at each company' },
        ].map((b, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0',
            borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 500, lineHeight: 1.4 }}>{b.text}</span>
            <span style={{ marginLeft: 'auto', color: '#5CC8A0', fontSize: 16, flexShrink: 0 }}>✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Company detail view ─────────────────────────────────────── */
function CompanyDetail({ company, onBack }) {
  const diff = DIFFICULTY_CONFIG[company.difficulty] || DIFFICULTY_CONFIG.Hard;

  return (
    <div className="page">
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '7px 14px', color: 'rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      >
        ← Back to Companies
      </button>

      {/* Header card */}
      <div style={{
        background: 'rgba(20,27,56,0.88)',
        border: `1px solid ${company.color}40`,
        borderRadius: 18, padding: '1.6rem', marginBottom: '1.4rem',
        boxShadow: `0 4px 32px ${company.color}12`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
            background: `${company.color}20`, border: `2px solid ${company.color}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>{company.logo}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>{company.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>{company.industry}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '4px 12px',
                background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: 20, color: diff.color,
              }}>{company.difficulty}</span>
              <span style={{
                fontSize: 13, fontWeight: 800, color: '#5CC8A0',
                background: 'rgba(92,200,160,0.10)', border: '1px solid rgba(92,200,160,0.25)',
                borderRadius: 20, padding: '4px 12px',
              }}>{company.salary_range}</span>
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '4px 12px',
              }}>~{company.success_rate}% of candidates get an offer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div style={{
        background: 'rgba(20,27,56,0.88)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
        padding: '1.3rem 1.4rem', marginBottom: '1.2rem',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
          Roles They Hire For
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {company.roles.map(role => (
            <span key={role} style={{
              fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 20,
              background: `${company.color}18`, border: `1px solid ${company.color}40`, color: company.color,
            }}>{role}</span>
          ))}
        </div>
      </div>

      {/* Interview Rounds */}
      <div style={{
        background: 'rgba(20,27,56,0.88)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
        padding: '1.3rem 1.4rem', marginBottom: '1.2rem',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14 }}>
          Interview Rounds
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {company.interview_rounds.map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '1rem 1.1rem',
            }}>
              {/* Round number badge */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `${company.color}20`, border: `2px solid ${company.color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: company.color,
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{r.round}</span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.50)',
                  }}>⏱ {r.duration}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)', lineHeight: 1.6 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Topics */}
      <div style={{
        background: 'rgba(20,27,56,0.88)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
        padding: '1.3rem 1.4rem', marginBottom: '1.2rem',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
          Key Topics to Master
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {company.key_topics.map(topic => {
            const tc = getTopicColor(topic);
            return (
              <span key={topic} style={{
                fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                background: `${tc}14`, border: `1px solid ${tc}35`, color: tc,
              }}>{topic}</span>
            );
          })}
        </div>
      </div>

      {/* Prep Tips */}
      <div style={{
        background: 'rgba(20,27,56,0.88)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
        padding: '1.3rem 1.4rem', marginBottom: '1.4rem',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14 }}>
          Preparation Tips
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {company.prep_tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(232,168,56,0.15)', border: '1px solid rgba(232,168,56,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: '#E8A838',
              }}>{i + 1}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, flex: 1 }}>{tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Back button bottom */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 10, padding: '9px 18px', color: 'rgba(255,255,255,0.6)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        ← Back to Companies
      </button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function CompanyPlacement() {
  const { user } = useAuth();
  const isPremium = user?.is_premium === 1 || user?.role === 'admin' || user?.email === ADMIN_EMAIL;

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  function loadData() {
    if (!isPremium) { setLoading(false); return; }
    setLoading(true);
    setError('');
    api.get('/placement')
      .then(r => setCompanies(r.data.companies || []))
      .catch(e => {
        if (e.response?.status === 403) setError('');
        else setError('Backend is warming up — this takes ~30 seconds on first load. Click retry.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [isPremium]);

  if (!isPremium) return <PaywallView />;

  if (loading) return <div className="loading"><div className="spinner" />Loading placement guides...</div>;

  if (selected) {
    return <CompanyDetail company={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.3rem' }}>
          <div className="page-title" style={{ margin: 0 }}>🏢 Company Placement Material</div>
          <span className="premium-badge">👑 Pro</span>
        </div>
        <div className="page-sub">Interview breakdown, prep tips &amp; salary ranges for {companies.length} top companies</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.8rem', marginBottom: '1.6rem' }}>
        {[
          { icon: '🏢', val: `${companies.length}`,  lbl: 'Companies',       color: '#4A90D9' },
          { icon: '🎯', val: '40+',                   lbl: 'Interview Rounds', color: '#5CC8A0' },
          { icon: '💡', val: '50+',                   lbl: 'Prep Tips',        color: '#E8A838' },
          { icon: '💰', val: 'Live',                  lbl: 'Salary Data',      color: '#a78bfa' },
        ].map((s, i) => (
          <div key={s.lbl} style={{
            background: 'rgba(20,27,56,0.88)', border: `1px solid ${s.color}28`,
            borderRadius: 14, padding: '1rem', textAlign: 'center',
            animation: `popIn 0.35s ${i * 0.07}s ease both`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(240,123,106,0.08)', border: '1px solid rgba(240,123,106,0.25)', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ color: '#F07B6A', fontSize: 13 }}>⚠️ {error}</div>
          <button onClick={loadData} style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(240,123,106,0.15)', border: '1px solid rgba(240,123,106,0.35)', color: '#F07B6A', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Company cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {companies.map((co, i) => {
          const diff = DIFFICULTY_CONFIG[co.difficulty] || DIFFICULTY_CONFIG.Hard;
          return (
            <div
              key={co.id}
              style={{
                background: 'rgba(20,27,56,0.88)',
                border: `1px solid ${co.color}35`,
                borderRadius: 16, padding: '1.3rem',
                cursor: 'pointer',
                transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
                animation: `fadeInUp 0.38s ${i * 0.05}s ease both`,
              }}
              onClick={() => setSelected(co)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 32px ${co.color}22`;
                e.currentTarget.style.borderColor = `${co.color}60`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${co.color}35`;
              }}
            >
              {/* Company header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${co.color}20`, border: `1.5px solid ${co.color}45`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{co.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{co.name}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.40)', marginTop: 1 }}>{co.industry}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, flexShrink: 0,
                  background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color,
                }}>{co.difficulty}</span>
              </div>

              {/* Role pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {co.roles.slice(0, 2).map(r => (
                  <span key={r} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: `${co.color}14`, border: `1px solid ${co.color}30`, color: co.color,
                  }}>{r}</span>
                ))}
                {co.roles.length > 2 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '3px 6px' }}>+{co.roles.length - 2} more</span>
                )}
              </div>

              {/* Footer row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#5CC8A0' }}>{co.salary_range}</span>
                <button
                  style={{
                    fontSize: 12, fontWeight: 700, padding: '5px 13px', borderRadius: 8,
                    background: `${co.color}18`, border: `1px solid ${co.color}35`,
                    color: co.color, cursor: 'pointer', transition: 'background .15s',
                  }}
                  onClick={e => { e.stopPropagation(); setSelected(co); }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${co.color}28`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${co.color}18`; }}
                >
                  View Guide →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
