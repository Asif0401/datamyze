import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const PyLogo = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{ verticalAlign:'middle', display:'inline-block' }}>
    <path d="M11.914 2c-4.638 0-4.344 2.017-4.344 2.017v2.09h4.413v.626H6.34S3.287 6.386 3.287 10.994c0 4.609 2.697 4.447 2.697 4.447h1.613V13.23s-.088-2.697 2.654-2.697h4.368s2.552.041 2.552-2.467V3.855S17.562 2 11.914 2zm-2.316 1.51c.466 0 .843.377.843.843a.844.844 0 1 1-1.687 0c0-.466.378-.843.844-.843z" fill="#3776AB"/>
    <path d="M12.086 22c4.638 0 4.344-2.017 4.344-2.017v-2.09H12v-.626h5.643s3.053.347 3.053-4.261c0-4.609-2.697-4.447-2.697-4.447h-1.613v2.216s.088 2.697-2.654 2.697H9.364s-2.552-.041-2.552 2.467v4.211S6.422 22 12.086 22zm2.316-1.509a.844.844 0 1 1 0-1.687c.466 0 .843.377.843.843a.844.844 0 0 1-.843.844z" fill="#FFD343"/>
  </svg>
);

/* ── Decorative SVG seal ─────────────────────────────── */
const CertSeal = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F6D365"/>
        <stop offset="100%" stopColor="#E8A838"/>
      </linearGradient>
      <linearGradient id="sealInner" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e3a5f"/>
        <stop offset="100%" stopColor="#0f2744"/>
      </linearGradient>
    </defs>
    {/* Outer star burst ring */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const rad   = (angle * Math.PI) / 180;
      const x1 = 44 + 39 * Math.cos(rad);
      const y1 = 44 + 39 * Math.sin(rad);
      const x2 = 44 + 32 * Math.cos(rad);
      const y2 = 44 + 32 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#sealGold)" strokeWidth="2" strokeLinecap="round"/>;
    })}
    {/* Outer ring */}
    <circle cx="44" cy="44" r="30" fill="url(#sealInner)" stroke="url(#sealGold)" strokeWidth="2.5"/>
    {/* Inner ring */}
    <circle cx="44" cy="44" r="26" fill="none" stroke="url(#sealGold)" strokeWidth="0.8" strokeDasharray="3 2"/>
    {/* AQ monogram */}
    <text x="44" y="40" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="#F6D365" letterSpacing="-0.5">DM</text>
    <text x="44" y="53" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6.5" fill="rgba(246,211,101,0.7)" letterSpacing="1.5">VERIFIED</text>
  </svg>
);

/* ── Corner ornament SVG ─────────────────────────────── */
const Corner = ({ flip }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none"
    style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
    <path d="M4 56 L4 10 Q4 4 10 4 L56 4" stroke="url(#cornerG)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M4 48 L4 16 Q4 10 10 10 L48 10" stroke="url(#cornerG)" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5"/>
    <circle cx="4"  cy="4"  r="3" fill="url(#cornerG)"/>
    <circle cx="56" cy="4"  r="2" fill="url(#cornerG)" opacity="0.6"/>
    <circle cx="4"  cy="56" r="2" fill="url(#cornerG)" opacity="0.6"/>
    <defs>
      <linearGradient id="cornerG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F6D365"/><stop offset="100%" stopColor="#c9853a"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── Datamyze logo for certificate ───────────────────── */
const CertLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
    <div style={{
      width: 32, height: 32,
      background: 'linear-gradient(145deg, #1d4ed8, #0369a1, #06b6d4)',
      borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 3px 12px rgba(6,182,212,0.5)',
    }}>
      <svg viewBox="0 0 22 22" fill="none" width="16" height="16">
        <defs>
          <linearGradient id="cb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0.1"/></linearGradient>
          <linearGradient id="cb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.85"/><stop offset="100%" stopColor="white" stopOpacity="0.12"/></linearGradient>
          <linearGradient id="cb3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9"/><stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12"/></linearGradient>
          <linearGradient id="cb4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="1"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18"/></linearGradient>
          <filter id="cglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <line x1="1" y1="21.5" x2="23" y2="21.5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
        <rect x="1.5" y="17"  width="3.5" height="4.5" rx="1.3" fill="url(#cb1)"/>
        <rect x="6.5" y="13"  width="3.5" height="8.5" rx="1.3" fill="url(#cb2)"/>
        <rect x="11.5" y="9"  width="3.5" height="12.5" rx="1.3" fill="url(#cb3)"/>
        <rect x="16.5" y="5"  width="3.5" height="16.5" rx="1.3" fill="url(#cb4)"/>
        <line x1="3.25" y1="16.5" x2="18.25" y2="4.5" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" filter="url(#cglow)" opacity="0.95"/>
        <path d="M18.25,2 L19.6,4.5 L18.25,7 L16.9,4.5 Z" fill="#22d3ee" filter="url(#cglow)"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.1 }}>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>Data</span>
        <span style={{ color: '#fff', fontWeight: 900 }}>myze</span>
      </div>
      <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
        MASTER DATA. MASTER YOUR FUTURE.
      </div>
    </div>
  </div>
);

/* ── Main component ──────────────────────────────────── */
export default function Certificates() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [certs, setCerts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => {
    api.get('/users/certificates')
      .then(r => { setCerts(r.data.certificates); setIsPremium(true); })
      .catch(e => { if (e.response?.data?.error === 'premium_required') setIsPremium(false); })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2800); }

  if (loading) return <div className="loading"><div className="spinner" />Loading certificates...</div>;

  /* ── Premium gate ── */
  if (!isPremium) return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.8rem' }}>
        <div className="page-title">🎓 Certificates</div>
        <div className="page-sub" style={{ marginTop: 4 }}>Earn verified credentials that employers actually trust</div>
      </div>

      {/* ── Hero: CTA left + Certificate preview right ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>

        {/* Left */}
        <div style={{ animation: 'slideInLeft 0.45s 0.1s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.28)',
            borderRadius: 20, padding: '4px 12px', marginBottom: '1.1rem',
          }}>
            <span style={{ fontSize: 12 }}>👑</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.4px', color: '#E8A838', textTransform: 'uppercase' }}>Pro Feature</span>
          </div>
          <div style={{ fontSize: 'clamp(22px,2.2vw,32px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
            Earn certificates that<br/>
            <span style={{ background: 'linear-gradient(135deg,#E8A838,#f59e0b 60%,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>get you hired</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.48)', lineHeight: 1.8, marginBottom: '1.6rem', maxWidth: 380 }}>
            Complete any course and instantly receive a verified, LinkedIn-ready certificate with a unique credential ID. Proof of your skills that recruiters can verify.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.4rem' }}>
            <button className="btn-primary" onClick={() => navigate('/premium')}
              style={{ background: 'linear-gradient(135deg,#E8A838,#f59e0b)', border: 'none', fontSize: 14, padding: '11px 22px' }}>
              👑 Upgrade to Pro · ₹199
            </button>
            <button onClick={() => navigate('/courses')}
              style={{ background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', borderRadius: 12, fontSize: 13, padding: '11px 18px', cursor: 'pointer' }}>
              Browse Courses
            </button>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {['LinkedIn-ready', 'Verified credential ID', 'Shareable link', 'Lifetime valid'].map(f => (
              <span key={f} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.22)', color: '#5CC8A0' }}>✓ {f}</span>
            ))}
          </div>
        </div>

        {/* Right: blurred mock certificate with lock overlay */}
        <div style={{ position: 'relative', animation: 'slideInRight 0.45s 0.18s ease both' }}>
          <div style={{
            background: 'linear-gradient(145deg,#0d1f3c,#0a1628)',
            borderRadius: 16, padding: '1.8rem 2rem',
            border: '1px solid rgba(246,211,101,0.22)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            filter: 'blur(2.5px)', userSelect: 'none', pointerEvents: 'none',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 9, letterSpacing: '3px', color: 'rgba(246,211,101,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>━━  Certificate of Completion  ━━</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>This is to proudly certify that</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Your Name Here</div>
              <div style={{ width: 70, height: 1, background: 'rgba(246,211,101,0.3)', margin: '0 auto 10px' }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 5 }}>has successfully completed</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>🗄️ SQL for Data Analytics</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Datamyze · Verified Learning Programme</div>
            </div>
            <div style={{ borderTop: '1px solid rgba(246,211,101,0.1)', paddingTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'rgba(168,200,240,0.5)' }}>Datamyze Team</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', marginTop: 2 }}>Instructor & Founder</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(246,211,101,0.08)', border: '1.5px solid rgba(246,211,101,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'rgba(246,211,101,0.5)', fontWeight: 700, letterSpacing: 1 }}>DM</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, color: 'rgba(246,211,101,0.4)', letterSpacing: '1px', marginBottom: 3 }}>CREDENTIAL ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(96,165,250,0.5)' }}>DM-SQL-XXXX-XXXX</div>
                <div style={{ marginTop: 5, fontSize: 8, fontWeight: 700, color: 'rgba(92,200,160,0.5)', background: 'rgba(92,200,160,0.08)', borderRadius: 10, padding: '1px 6px', display: 'inline-block' }}>✓ VERIFIED</div>
              </div>
            </div>
          </div>
          {/* Lock overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'rgba(5,12,25,0.55)', backdropFilter: 'blur(1px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{ fontSize: 30, filter: 'drop-shadow(0 0 12px rgba(232,168,56,0.4))' }}>🔒</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Unlock with Pro</div>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>How it works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { step: '01', icon: '📚', title: 'Complete a Course', desc: 'Finish any full course on Datamyze with all lessons done and the final assessment passed', color: '#5CC8A0' },
            { step: '02', icon: '🎓', title: 'Get Your Certificate', desc: 'A verified certificate with a unique credential ID is instantly generated for your profile', color: '#38bdf8' },
            { step: '03', icon: '💼', title: 'Add to LinkedIn', desc: 'Share it on LinkedIn, copy your credential ID for applications, or download it as a PDF', color: '#E8A838' },
          ].map((s, idx) => (
            <div key={s.step} style={{
              padding: '1.4rem 1.3rem', borderRadius: 16, position: 'relative', overflow: 'hidden',
              background: 'rgba(20,27,56,0.88)',
              border: `1px solid ${s.color}35`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 ${s.color}20`,
              animation: 'popIn 0.35s ease both', animationDelay: `${idx * 0.09}s`,
            }}>
              {/* Big watermark step number */}
              <div style={{ position: 'absolute', top: -4, right: 10, fontSize: 64, fontWeight: 900, color: `${s.color}18`, fontFamily: 'monospace', lineHeight: 1, userSelect: 'none' }}>{s.step}</div>
              {/* Top color accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}90, transparent)` }} />
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65 }}>{s.desc}</div>
              <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: s.color }}>Step {s.step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Available certificate tracks ── */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Certificate tracks</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.7rem' }}>
          {[
            { icon: '🗄️',      title: 'SQL for Data Analytics',   color: '#4A90D9' },
            { icon: <PyLogo />, title: 'Python for Analytics',     color: '#FFD343' },
            { icon: '📊',       title: 'Power BI Fundamentals',    color: '#F2C811' },
            { icon: '📗',       title: 'Excel for Data Analysis',  color: '#34D399' },
            { icon: '📈',       title: 'Statistics & Probability', color: '#F07B6A' },
            { icon: '🤖',       title: 'Machine Learning Basics',  color: '#a78bfa' },
          ].map((t, idx) => (
            <div key={t.title} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12,
              background: 'rgba(20,27,56,0.88)',
              border: `1px solid ${t.color}35`,
              borderLeft: `3px solid ${t.color}90`,
              boxShadow: `0 2px 12px rgba(0,0,0,0.30)`,
              animation: 'fadeInUp 0.3s ease both', animationDelay: `${idx * 0.05}s`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${t.color}20`, border: `1px solid ${t.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ fontSize: 10, color: t.color, fontWeight: 600, marginTop: 3 }}>Certificate available</div>
              </div>
              <div style={{ fontSize: 13, opacity: 0.45 }}>🔒</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🎓 My Certificates</div>
        <div className="page-sub">Showcase your verified achievements</div>
      </div>

      {certs.length === 0 ? (
        <div>
          {/* Hero */}
          <div style={{ textAlign:'center', padding:'2.2rem 1rem 1.6rem', animation:'fadeInUp 0.4s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, borderRadius:'50%', background:'rgba(232,168,56,0.10)', border:'1px solid rgba(232,168,56,0.25)', marginBottom:'1.2rem', boxShadow:'0 0 40px rgba(232,168,56,0.15)' }}>
              <CertSeal />
            </div>
            <div style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.5px', marginBottom:8 }}>Your first certificate is waiting</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.40)', maxWidth:420, margin:'0 auto 1.6rem', lineHeight:1.7 }}>
              Complete any course to earn a verified Datamyze certificate, shareable on LinkedIn and downloadable as PDF.
            </div>
            <button className="btn-primary" style={{ fontSize:14, padding:'11px 28px' }} onClick={() => navigate('/courses')}>
              Start a Course →
            </button>
          </div>

          {/* Certificate tracks you can earn */}
          <div style={{ marginTop:'0.5rem' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'1rem', textAlign:'center' }}>
              Certificates you can earn
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.85rem' }}>
              {[
                { icon:'🗄️',         title:'SQL for Data Analysis',    color:'#4A90D9', desc:'Master querying, joins, window functions & business analytics' },
                { icon:<PyLogo />,   title:'Python for Analytics',     color:'#FFD343', desc:'Pandas, NumPy, data cleaning, EDA and visualisation' },
                { icon:'📊',         title:'Power BI & Tableau',       color:'#E8A838', desc:'Build interactive dashboards and BI reports' },
                { icon:'📋',         title:'Excel & Sheets',           color:'#34D399', desc:'Pivot tables, lookups, data cleaning and dashboards' },
                { icon:'📈',         title:'Statistics & Probability', color:'#a78bfa', desc:'Hypothesis testing, A/B testing and business metrics' },
                { icon:'⚡',         title:'Advanced SQL',             color:'#5CC8A0', desc:'Window functions, CTEs, performance & BI-level queries' },
              ].map((t, i) => (
                <div key={t.title} onClick={() => navigate('/courses')}
                  style={{
                    background:'rgba(20,27,56,0.88)',
                    border:`1px solid ${t.color}35`,
                    borderTop:`2px solid ${t.color}70`,
                    borderRadius:14, padding:'1.2rem 1rem',
                    cursor:'pointer', transition:'all 0.22s',
                    boxShadow:`0 3px 16px rgba(0,0,0,0.30)`,
                    animation:`fadeInUp 0.4s ${0.05+i*0.06}s ease both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(28,36,68,0.95)'; e.currentTarget.style.borderColor=`${t.color}55`; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 30px rgba(0,0,0,0.40), 0 0 20px ${t.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(20,27,56,0.88)'; e.currentTarget.style.borderColor=`${t.color}35`; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 3px 16px rgba(0,0,0,0.30)'; }}
                >
                  <div style={{ width:40, height:40, borderRadius:11, background:`${t.color}20`, border:`1px solid ${t.color}45`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:10 }}>{t.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:5 }}>{t.title}</div>
                  <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.42)', lineHeight:1.5 }}>{t.desc}</div>
                  <div style={{ marginTop:10, fontSize:11, fontWeight:700, color:t.color }}>Start earning →</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust bar */}
          <div style={{ marginTop:'1.5rem', padding:'1rem 1.4rem', borderRadius:14, background:'rgba(20,27,56,0.88)', border:'1px solid rgba(255,255,255,0.14)', display:'flex', alignItems:'center', justifyContent:'center', gap:'2.5rem', flexWrap:'wrap' }}>
            {[
              { icon:'🏆', text:'Verified by Datamyze' },
              { icon:'💼', text:'Shareable on LinkedIn' },
              { icon:'📄', text:'Downloadable PDF' },
              { icon:'✅', text:'Credential ID included' },
            ].map(f => (
              <div key={f.text} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.40)', fontWeight:600 }}>
                <span>{f.icon}</span>{f.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        certs.map(cert => (
          <CertCard key={cert.id} cert={cert} user={user} showToast={showToast} />
        ))
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── Certificate card ────────────────────────────────── */
function CertCard({ cert, user, showToast }) {
  const issued = new Date(cert.issued_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ marginBottom: '2.5rem' }}>

      {/* ── The Certificate ── */}
      <div style={{
        position: 'relative',
        maxWidth: 740,
        background: 'linear-gradient(145deg, #0b1a35 0%, #0f2040 40%, #091628 100%)',
        borderRadius: 20,
        padding: '3px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(246,211,101,0.15)',
      }}>

        {/* Gold gradient border */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: 'linear-gradient(135deg, #F6D365 0%, rgba(246,211,101,0.15) 40%, rgba(200,133,58,0.1) 60%, #E8A838 100%)',
          padding: '1.5px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} />

        {/* Inner card */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1f3c 0%, #0a1628 100%)',
          borderRadius: 18,
          padding: '2.8rem 3rem',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Subtle radial glow background */}
          <div style={{
            position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '60%',
            background: 'radial-gradient(ellipse, rgba(74,144,217,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', right: '-10%',
            width: '50%', height: '50%',
            background: 'radial-gradient(ellipse, rgba(246,211,101,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: 10, left: 10, opacity: 0.6 }}><Corner /></div>
          <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.6 }}><Corner flip /></div>
          <div style={{ position: 'absolute', bottom: 10, left: 10, opacity: 0.6, transform: 'scaleY(-1)' }}><Corner /></div>
          <div style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.6, transform: 'scale(-1,-1)' }}><Corner flip /></div>

          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem', position: 'relative', zIndex: 1 }}>
            <CertLogo />
            <div style={{
              marginTop: '1.4rem',
              fontSize: 10, fontWeight: 700, letterSpacing: '4px',
              color: 'rgba(246,211,101,0.6)', textTransform: 'uppercase',
            }}>
              ━━━━━  Certificate of Completion  ━━━━━
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px', marginBottom: 12 }}>
              This is to proudly certify that
            </div>

            {/* Student name */}
            <div style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 34, fontWeight: 700,
              background: 'linear-gradient(135deg, #fff 30%, #a8c8f0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px', lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {user?.name}
            </div>

            {/* Decorative line under name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 18 }}>
              <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, transparent, rgba(246,211,101,0.5))' }} />
              <div style={{ color: 'rgba(246,211,101,0.6)', fontSize: 14 }}>✦</div>
              <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, rgba(246,211,101,0.5), transparent)' }} />
            </div>

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 10 }}>
              has successfully completed the course
            </div>

            {/* Course name */}
            <div style={{
              fontSize: 20, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.3px', lineHeight: 1.3,
              marginBottom: 6,
            }}>
              {cert.course_icon} {cert.course_title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: '2.2rem' }}>
              Datamyze · Verified Learning Programme
            </div>

            {/* ── Footer row ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '1.6rem',
              borderTop: '1px solid rgba(246,211,101,0.12)',
              gap: 16,
            }}>

              {/* Signature left */}
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{
                  fontFamily: 'Georgia, serif', fontStyle: 'italic',
                  fontSize: 18, color: '#a8c8f0', lineHeight: 1, marginBottom: 4,
                }}>
                  Datamyze Team
                </div>
                <div style={{ width: 80, height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' }}>
                  Instructor & Founder, Datamyze
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>
                  Issued: {issued}
                </div>
              </div>

              {/* Seal center */}
              <div style={{ flexShrink: 0 }}>
                <CertSeal />
              </div>

              {/* Credential ID right */}
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '1.5px',
                  color: 'rgba(246,211,101,0.5)', textTransform: 'uppercase', marginBottom: 5,
                }}>
                  Credential ID
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                  color: '#60a5fa', letterSpacing: '1px',
                }}>
                  {cert.credential_id}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '1px',
                    background: 'rgba(92,200,160,0.12)',
                    border: '1px solid rgba(92,200,160,0.3)',
                    color: '#5CC8A0', padding: '2px 8px', borderRadius: 20,
                    textTransform: 'uppercase',
                  }}>✓ Verified</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Actions below certificate ── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, maxWidth: 740 }}>
        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => showToast('🖨️ Use Ctrl+P / Cmd+P to print or save as PDF!')}
        >
          ⬇ Download PDF
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => {
            navigator.clipboard?.writeText(cert.credential_id);
            showToast('✅ Credential ID copied to clipboard!');
          }}
        >
          📋 Copy Credential ID
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => {
            const text = `I just completed "${cert.course_title}" on Datamyze! 🎓\nCredential: ${cert.credential_id}`;
            navigator.clipboard?.writeText(text);
            showToast('✅ Share text copied. Paste it on LinkedIn!');
          }}
        >
          🔗 Share on LinkedIn
        </button>
      </div>
    </div>
  );
}
