import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';
import { Blobs, Particles } from '../components/Background';

/* ── Password strength ─────────────────────────────── */
function pwStrength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s;
}
const strColors = ['#eee', '#E24B4A', '#BA7517', '#1D9E75', '#7F77DD'];
const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/* ── SQL database logo SVG ──────────────────────────── */
const SqlLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    {/* Cylinder body */}
    <path d="M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7" fill="rgba(0,119,190,0.15)" stroke="#0077BE" strokeWidth="1.45" strokeLinejoin="round"/>
    {/* Second data-layer arc */}
    <path d="M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3" fill="none" stroke="#0077BE" strokeWidth="1" opacity="0.5"/>
    {/* Third data-layer arc */}
    <path d="M4 15.5c0 1.05 3.582 2 8 2s8-.95 8-2" fill="none" stroke="#0077BE" strokeWidth="0.8" opacity="0.3"/>
    {/* Top ellipse (lid) — brightest */}
    <ellipse cx="12" cy="7" rx="8" ry="3" fill="rgba(0,149,237,0.28)" stroke="#0095ED" strokeWidth="1.45"/>
    {/* "SQL" label inside top ellipse */}
    <text x="12" y="8.4" textAnchor="middle" fontFamily="'Courier New', Courier, monospace"
      fontWeight="900" fontSize="4.8" fill="#7dd3fc" letterSpacing="0.8">SQL</text>
  </svg>
);

/* ── Python logo SVG ────────────────────────────────── */
const PythonLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    {/* Blue snake — top half */}
    <path d="M11.914 2c-4.638 0-4.344 2.017-4.344 2.017v2.09h4.413v.626H6.34S3.287 6.386 3.287 10.994c0 4.609 2.697 4.447 2.697 4.447h1.613V13.23s-.088-2.697 2.654-2.697h4.368s2.552.041 2.552-2.467V3.855S17.562 2 11.914 2zm-2.316 1.51c.466 0 .843.377.843.843a.844.844 0 1 1-1.687 0c0-.466.378-.843.844-.843z" fill="#3776AB"/>
    {/* Yellow snake — bottom half */}
    <path d="M12.086 22c4.638 0 4.344-2.017 4.344-2.017v-2.09H12v-.626h5.643s3.053.347 3.053-4.261c0-4.609-2.697-4.447-2.697-4.447h-1.613v2.216s.088 2.697-2.654 2.697H9.364s-2.552-.041-2.552 2.467v4.211S6.422 22 12.086 22zm2.316-1.509a.844.844 0 1 1 0-1.687c.466 0 .843.377.843.843a.844.844 0 0 1-.843.844z" fill="#FFD343"/>
  </svg>
);

/* ── Animated icons ─────────────────────────────────── */
const AnimatedBars = () => (
  <svg width="30" height="28" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes bar1 { 0%,100%{height:8px;y:20px} 50%{height:16px;y:12px} }
      @keyframes bar2 { 0%,100%{height:14px;y:14px} 50%{height:8px;y:20px} }
      @keyframes bar3 { 0%,100%{height:20px;y:8px} 50%{height:24px;y:4px} }
      @keyframes bar4 { 0%,100%{height:10px;y:18px} 50%{height:18px;y:10px} }
      .b1{animation:bar1 1.4s ease-in-out infinite}
      .b2{animation:bar2 1.4s ease-in-out infinite 0.2s}
      .b3{animation:bar3 1.4s ease-in-out infinite 0.4s}
      .b4{animation:bar4 1.4s ease-in-out infinite 0.6s}
    `}</style>
    <rect className="b1" x="1"  y="20" width="5" height="8"  rx="1.5" fill="#38bdf8" opacity="0.7"/>
    <rect className="b2" x="8"  y="14" width="5" height="14" rx="1.5" fill="#38bdf8" opacity="0.85"/>
    <rect className="b3" x="15" y="8"  width="5" height="20" rx="1.5" fill="#38bdf8"/>
    <rect className="b4" x="22" y="18" width="5" height="10" rx="1.5" fill="#38bdf8" opacity="0.75"/>
  </svg>
);

const AnimatedProLogo = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ringG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#f59e0b"/>
        <stop offset="40%"  stopColor="#fde68a"/>
        <stop offset="70%"  stopColor="#c084fc"/>
        <stop offset="100%" stopColor="#e879f9"/>
      </linearGradient>
      <linearGradient id="crownG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#fef9c3"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
      <filter id="glow3" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <style>{`
      @keyframes spin3 { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes pulse3 {
        0%,100%{opacity:1;transform:scale(1)}
        50%{opacity:0.85;transform:scale(0.96)}
      }
      @keyframes crownBob3 {
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-1.5px)}
      }
      .ring3{animation:spin3 4s linear infinite;transform-origin:22px 22px}
      .inner3{animation:pulse3 2.5s ease-in-out infinite}
      .crown3{animation:crownBob3 2s ease-in-out infinite;transform-origin:22px 22px}
    `}</style>

    {/* Rotating outer ring */}
    <g className="ring3">
      <circle cx="22" cy="22" r="20" stroke="url(#ringG)" strokeWidth="2.5"
        fill="none" strokeDasharray="28 6" strokeLinecap="round"/>
    </g>

    {/* Inner dark circle */}
    <g className="inner3">
      <circle cx="22" cy="22" r="16.5" fill="#0c1729"/>
      <circle cx="22" cy="22" r="16.5" fill="none"
        stroke="rgba(245,158,11,0.18)" strokeWidth="1"/>
    </g>

    {/* Crown — clean minimal */}
    <g className="crown3" filter="url(#glow3)">
      <path d="M13 27 L13 19 L17.5 22.5 L22 15 L26.5 22.5 L31 19 L31 27 Z"
        fill="url(#crownG)" strokeWidth="0"/>
      <rect x="13" y="26" width="18" height="3.5" rx="1" fill="url(#crownG)"/>
      <circle cx="22" cy="15.5" r="1.4" fill="#fff9c4"/>
      <circle cx="13.2" cy="19.5" r="1"   fill="#fff9c4" opacity="0.8"/>
      <circle cx="30.8" cy="19.5" r="1"   fill="#fff9c4" opacity="0.8"/>
    </g>
  </svg>
);

/* ── Track cards ───────────────────────────────────── */
const TRACK_CARDS = [
  {
    emoji: <AnimatedBars />,
    title: 'Analytics Starter',
    sub: 'Free · Beginner Friendly',
    color: '#38bdf8',
    items: ['SQL & Python Problems', 'Course Roadmaps', 'Practice Assessments', 'Community Access'],
  },
  {
    emoji: <AnimatedProLogo />,
    title: 'Pro Track',
    sub: 'Premium · Career Fast-Track',
    color: '#a78bfa',
    items: ['Curated Job Board', '1-on-1 Mock Interviews', 'Resume Review (24h)', 'Verified Certificates'],
  },
];

/* ── Ticker data ───────────────────────────────────── */
const TICKER_ROW1 = [
  { icon: '🗄️', label: 'SQL & Python',    color: '#38bdf8' },
  { icon: '🎙️', label: 'Mock Interviews', color: '#a78bfa' },
  { icon: '💼',  label: 'Job Board',       color: '#5CC8A0' },
  { icon: '📄',  label: 'Resume Review',   color: '#f9a825' },
  { icon: '🗺️', label: 'Course Roadmaps', color: '#f87171' },
];
const TICKER_ROW2 = [
  { icon: '📜',  label: 'Certificates',    color: '#e879f9' },
  { icon: '🤝',  label: 'Referral Network',color: '#38bdf8' },
  { icon: '✉️',  label: 'Cold Email HRs',  color: '#5CC8A0' },
  { icon: '⚡',  label: 'Priority Support', color: '#a78bfa' },
  { icon: '🎯',  label: 'Career Roadmap',  color: '#f9a825' },
];

/* ── Hero data ─────────────────────────────────────── */
const HERO_FEATURES = [
  { icon: <SqlLogo />,    label: '100+ SQL Problems',  desc: 'Window functions, CTEs, real interview patterns' },
  { icon: <PythonLogo />, label: 'Python & Pandas',    desc: 'Data wrangling, EDA, GroupBy deep-dives' },
  { icon: '🎙️',          label: 'Live Mock Interviews',desc: 'Real sessions with our mentor — recorded feedback' },
  { icon: '💼',           label: 'Curated Job Board',  desc: '300+ roles: Data Analyst, BI Engineer, Product Analyst & more' },
  { icon: '📄',           label: 'Resume Review',      desc: 'ATS-optimised expert feedback in 48 hours' },
  { icon: '🗺️',           label: 'Course Roadmaps',    desc: 'Step-by-step learning path for every course' },
];
const HERO_STATS = [
  { val: '1:1',  lbl: 'Mentor Session'  },
  { val: '400+', lbl: 'Problems'        },
  { val: '24h',  lbl: 'Resume Feedback' },
  { val: '100%', lbl: 'Placement Assist' },
];
const TESTIMONIALS = [
  {
    initials: 'PS', color: 'linear-gradient(135deg,#4A90D9,#a78bfa)',
    text: '"Got placed at Meesho as BI Analyst after 2 months on Datamyze. The mock interviews and resume review made all the difference."',
    name: 'Priya Sharma', role: 'BI Analyst, Meesho',
  },
  {
    initials: 'RK', color: 'linear-gradient(135deg,#5CC8A0,#4A90D9)',
    text: '"The SQL problem sets are exactly what Flipkart asked in my interview. Landed the Analytics Engineer role first attempt."',
    name: 'Rahul Kumar', role: 'Analytics Engineer, Flipkart',
  },
];

/* ══════════════════════════════════════════════════
   OTP INPUT  — 6 individual boxes
══════════════════════════════════════════════════ */
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      const next = digits.slice(); next[i] = '';
      onChange(next.join(''));
      if (i > 0) inputs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = digits.slice(); next[i] = e.key;
      onChange(next.join(''));
      if (i < 5) inputs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, '').slice(0, 6)); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '1.2rem 0' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onChange={() => {}}
          style={{
            width: 46, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 800,
            borderRadius: 12, border: `1.5px solid ${d ? 'rgba(74,144,217,0.60)' : 'rgba(255,255,255,0.12)'}`,
            background: d ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.05)',
            color: '#fff', outline: 'none', transition: 'all 0.15s',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(74,144,217,0.70)'; e.target.style.boxShadow = '0 0 0 3px rgba(74,144,217,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = d ? 'rgba(74,144,217,0.60)' : 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN AUTH PAGE
══════════════════════════════════════════════════ */
export default function AuthPage({ mode: initialMode }) {
  const [panel, setPanel]   = useState(initialMode || 'login'); // 'login' | 'signup'
  const [loginType, setLoginType] = useState('email');           // 'email' | 'phone'
  const { login } = useAuth();
  const navigate  = useNavigate();

  return (
    <div className="auth-wrap">
      <Blobs />
      <Particles />

      {/* ═══ LEFT HERO ═══ */}
      <div className="auth-hero">

        {/* ── TOP: Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeInUp 0.4s ease both' }}>
          <div className="auth-logo-icon" style={{ width: 46, height: 46, borderRadius: 13, boxShadow: '0 0 20px rgba(34,211,238,0.4), 0 4px 16px rgba(0,0,0,0.4)' }}>
            <svg viewBox="0 0 22 22" fill="none" width="24" height="24">
              <defs>
                <linearGradient id="ab1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="ab4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="1"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18"/></linearGradient>
                <filter id="aglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect x="1.5" y="17" width="3.5" height="4.5" rx="1.3" fill="url(#ab1)"/>
              <rect x="6.5" y="13" width="3.5" height="8.5" rx="1.3" fill="url(#ab1)"/>
              <rect x="11.5" y="9" width="3.5" height="12.5" rx="1.3" fill="url(#ab1)"/>
              <rect x="16.5" y="5" width="3.5" height="16.5" rx="1.3" fill="url(#ab4)"/>
              <line x1="3.25" y1="16.5" x2="18.25" y2="4.5" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" filter="url(#aglow)" opacity="0.9"/>
              <path d="M18.25,2 L19.6,4.5 L18.25,7 L16.9,4.5 Z" fill="#22d3ee" filter="url(#aglow)"/>
            </svg>
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', filter: 'drop-shadow(0 0 12px rgba(34,211,238,0.35))' }}>
            <span style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>Data</span>
            <span style={{
              background: 'linear-gradient(135deg, #fff 0%, #22d3ee 60%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontWeight: 900,
            }}>myze</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: 'rgba(92,200,160,0.15)', border: '1px solid rgba(92,200,160,0.35)', color: '#5CC8A0', boxShadow: '0 0 8px rgba(92,200,160,0.2)' }}>BETA</span>
        </div>

        {/* ── MIDDLE: Headline + cards + ticker ── */}
        <div style={{ animation: 'fadeInUp 0.45s 0.06s ease both' }}>
          <div className="auth-hero-headline">
            Not just learning.<br />
            <span className="auth-gradient-text">Mentored until you're hired.</span>
          </div>
          <div className="auth-hero-sub">
            Beyond courses — guided mentorship, placement assistance &amp; real-world practice. Everything you need to land a Data Analyst, BI Engineer, Product Analyst or BI Analyst role.
          </div>

          {/* Comparison card */}
          <div style={{ marginTop:'1.2rem', borderRadius:18, overflow:'hidden', position:'relative',
            boxShadow:'0 0 0 1px rgba(127,119,221,0.22), 0 8px 32px rgba(127,119,221,0.1)' }}>

            {/* Column headers */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
              <div style={{ background:'rgba(255,255,255,0.025)', padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.22)', letterSpacing:0.8, textTransform:'uppercase' }}>Others</span>
              </div>
              <div style={{ background:'linear-gradient(135deg, rgba(127,119,221,0.18), rgba(56,189,248,0.1))', padding:'10px 14px', borderBottom:'1px solid rgba(127,119,221,0.25)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#7F77DD,#38bdf8)' }} />
                <div style={{ position:'absolute', bottom:-18, right:-18, width:60, height:60, borderRadius:'50%', background:'radial-gradient(circle,rgba(127,119,221,0.3),transparent)', pointerEvents:'none' }} />
                <span style={{ fontSize:11, fontWeight:800, background:'linear-gradient(135deg,#c4b5fd,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:0.5, textTransform:'uppercase', position:'relative' }}>✦ Datamyze</span>
              </div>
            </div>

            {/* Rows */}
            {[
              { bad:'Generic video tutorials',    good:'Real company interview Qs',  color:'#38bdf8' },
              { bad:'No mentor, you\'re alone',   good:'1-on-1 industry mentor',     color:'#a78bfa' },
              { bad:'Zero placement support',     good:'100% placement assistance',  color:'#5CC8A0' },
              { bad:'No mock interviews',         good:'Live mock + written feedback',color:'#f9a825' },
              { bad:'No job listings',            good:'300+ curated jobs board',    color:'#f87171' },
            ].map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.045)' : 'none' }}>
                {/* Left — dull */}
                <div style={{ padding:'9px 13px', borderRight:'1px solid rgba(255,255,255,0.05)',
                  background: i % 2 === 0 ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.1)',
                  display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:8, color:'#f87171', fontWeight:900, lineHeight:1 }}>✕</span>
                  </div>
                  <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.28)', lineHeight:1.35 }}>{row.bad}</span>
                </div>
                {/* Right — vibrant */}
                <div style={{ padding:'9px 13px',
                  background: i % 2 === 0 ? `linear-gradient(90deg,${row.color}08,rgba(127,119,221,0.06))` : `linear-gradient(90deg,rgba(127,119,221,0.05),${row.color}06)`,
                  display:'flex', alignItems:'center', gap:8,
                  borderLeft:`2px solid ${row.color}40` }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:`${row.color}20`, border:`1px solid ${row.color}50`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:8, color:row.color, fontWeight:900, lineHeight:1 }}>✓</span>
                  </div>
                  <span style={{ fontSize:10.5, fontWeight:600, color:'rgba(255,255,255,0.82)', lineHeight:1.35 }}>{row.good}</span>
                </div>
              </div>
            ))}

            {/* Price footer */}
            <div style={{ background:'linear-gradient(90deg,rgba(10,14,32,0.9),rgba(127,119,221,0.15),rgba(10,14,32,0.9))',
              borderTop:'1px solid rgba(127,119,221,0.22)',
              padding:'11px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>All of this, together —</span>
              <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.22)', textDecoration:'line-through', fontWeight:500 }}>₹999</span>
                <span style={{ fontSize:14, fontWeight:900,
                  background:'linear-gradient(135deg,#E8A838 0%,#fbbf24 40%,#a78bfa 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                  letterSpacing:'-0.3px' }}>₹149 lifetime</span>
              </div>
            </div>
          </div>

          {/* Scrolling feature ticker */}
          <div style={{
            marginTop: '1.3rem',
            display: 'flex', flexDirection: 'column', gap: 10,
            overflow: 'hidden',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}>
            <div className="auth-ticker-track">
              {[...TICKER_ROW1, ...TICKER_ROW1, ...TICKER_ROW1].map((f, i) => (
                <span key={i} className="auth-ticker-chip" style={{ '--tc': f.color }}>
                  <span style={{ fontSize: 14 }}>{f.icon}</span>{f.label}
                </span>
              ))}
            </div>
            <div className="auth-ticker-track auth-ticker-reverse">
              {[...TICKER_ROW2, ...TICKER_ROW2, ...TICKER_ROW2].map((f, i) => (
                <span key={i} className="auth-ticker-chip" style={{ '--tc': f.color }}>
                  <span style={{ fontSize: 14 }}>{f.icon}</span>{f.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM: Stats ── */}
        <div style={{ animation: 'fadeInUp 0.5s 0.18s ease both' }}>
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1rem 0' }}>
            {[
              { val: 'Live',  lbl: '1-on-1 Mentor'   },
              { val: '400+', lbl: 'Problems'         },
              { val: '24h',  lbl: 'Resume Feedback'  },
              { val: '100%', lbl: 'Placement Assist' },
            ].map((s, i) => (
              <div key={s.lbl} style={{ flex: 1, textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 2 }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══ RIGHT CARD ═══ */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Underline tabs */}
          <div className="auth-underline-tabs">
            <button className={`auth-underline-tab${panel === 'login'  ? ' active' : ''}`} onClick={() => setPanel('login')}>Sign in</button>
            <button className={`auth-underline-tab${panel === 'signup' ? ' active' : ''}`} onClick={() => setPanel('signup')}>Create account</button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '1.4rem' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', marginBottom: 4 }}>
              {panel === 'login' ? 'Welcome back 👋' : 'Start your journey 🚀'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
              {panel === 'login' ? 'Sign in to continue your journey' : 'Free to join — no credit card needed'}
            </div>
          </div>

          {panel === 'login'  && <LoginForm loginType={loginType} setLoginType={setLoginType} onSuccess={(tok, usr) => { login(tok, usr); navigate('/'); }} switchToSignup={() => setPanel('signup')} />}
          {panel === 'signup' && <SignupForm onSuccess={(tok, usr) => { login(tok, usr); navigate('/'); }} switchToLogin={() => setPanel('login')} />}

          <div style={{ marginTop: '1rem', fontSize: 11, color: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <span>🔒</span><span>Your data is secure &amp; never shared</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════════════ */
function LoginForm({ loginType, setLoginType, onSuccess, switchToSignup }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [phone,    setPhone]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [otpSent,  setOtpSent]  = useState(false);
  const [devOtp,   setDevOtp]   = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [timer,    setTimer]    = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  async function sendPhoneOtp() {
    if (!phone.trim()) { setError('Enter your phone number'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login-phone', { phone: phone.trim() });
      setOtpSent(true);
      setTimer(60);
      if (r.data.dev_otp) setDevOtp(r.data.dev_otp);
    } catch (e) { setError(e.response?.data?.error || 'Error sending OTP'); }
    finally { setLoading(false); }
  }

  async function submitPhoneLogin() {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login-phone', { phone: phone.trim(), otp_code: otp });
      onSuccess(r.data.token, r.data.user);
    } catch (e) { setError(e.response?.data?.error || 'Invalid OTP'); }
    finally { setLoading(false); }
  }

  async function submitEmailLogin(e) {
    e.preventDefault();
    if (!email || !password) { setError('Email and password required'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login', { email, password });
      onSuccess(r.data.token, r.data.user);
    } catch (e) { setError(e.response?.data?.error || 'Invalid credentials'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      {/* Login method toggle */}
      <div style={{ display: 'flex', gap: 7, marginBottom: '1rem' }}>
        {[
          { id: 'email', label: '✉️ Email'   },
          { id: 'phone', label: '📱 Phone OTP' },
        ].map(m => (
          <button key={m.id} onClick={() => { setLoginType(m.id); setError(''); setOtpSent(false); setOtp(''); }} style={{
            flex: 1, padding: '9px 0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            border: loginType === m.id ? '1px solid rgba(74,144,217,0.50)' : '1px solid rgba(255,255,255,0.10)',
            background: loginType === m.id ? 'rgba(74,144,217,0.14)' : 'rgba(255,255,255,0.04)',
            color: loginType === m.id ? '#4A90D9' : 'rgba(255,255,255,0.45)',
          }}>{m.label}</button>
        ))}
      </div>

      {error && <div style={{ background: 'rgba(240,123,106,0.12)', border: '1px solid rgba(240,123,106,0.30)', borderRadius: 8, padding: '9px 13px', color: '#F07B6A', fontSize: 13, marginBottom: '1rem', fontWeight: 500 }}>⚠ {error}</div>}

      {/* ── Email login ── */}
      {loginType === 'email' && (
        <form onSubmit={submitEmailLogin}>
          <div className="field">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, marginTop: 4 }} disabled={loading}>
            {loading ? 'Logging in…' : 'Login →'}
          </button>
        </form>
      )}

      {/* ── Phone OTP login ── */}
      {loginType === 'phone' && (
        <div>
          <div className="field">
            <label>Phone Number</label>
            <input type="tel" placeholder="+91 98765 43210" value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              disabled={otpSent}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>

          {!otpSent ? (
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={sendPhoneOtp} disabled={loading}>
              {loading ? 'Sending…' : '📱 Send OTP'}
            </button>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>
                  OTP sent to <strong style={{ color: '#e2e8f0' }}>{phone}</strong>
                </div>
                {devOtp && (
                  <div style={{ fontSize: 12, background: 'rgba(232,168,56,0.12)', border: '1px solid rgba(232,168,56,0.25)', borderRadius: 8, padding: '5px 10px', color: '#E8A838', fontFamily: 'monospace', display: 'inline-block' }}>
                    Dev OTP: <strong>{devOtp}</strong>
                  </div>
                )}
              </div>
              <OtpInput value={otp} onChange={setOtp} />
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submitPhoneLogin} disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying…' : '✓ Verify & Login'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                {timer > 0
                  ? `Resend in ${timer}s`
                  : <button onClick={() => { setOtp(''); sendPhoneOtp(); }} style={{ background: 'none', border: 'none', color: '#4A90D9', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Resend OTP</button>
                }
              </div>
            </>
          )}
        </div>
      )}

      <div className="auth-footer" style={{ marginTop: '1.2rem' }}>
        Don't have an account? <button onClick={switchToSignup}>Register free</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SIGNUP FORM  — 3 steps
══════════════════════════════════════════════════ */
function SignupForm({ onSuccess, switchToLogin }) {
  const [step, setStep]         = useState(1); // 1 = identity, 2 = otp, 3 = password
  const [identType, setIdentType] = useState('email'); // 'email' | 'phone'
  const [name,      setName]      = useState('');
  const [ident,     setIdent]     = useState('');
  const [regPhone,  setRegPhone]  = useState('');
  const [otp,       setOtp]       = useState('');
  const [devOtp,    setDevOtp]    = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [timer,     setTimer]     = useState(0);
  const str = pwStrength(password);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  async function sendOtp() {
    if (!name.trim() || name.trim().length < 2) { setError('Enter your full name (at least 2 chars)'); return; }
    if (!ident.trim()) { setError(`Enter your ${identType}`); return; }
    if (identType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ident))  { setError('Enter a valid email'); return; }
    if (identType === 'email') {
      const digits = regPhone.replace(/\D/g, '');
      if (!regPhone.trim()) { setError('Phone number is required'); return; }
      if (digits.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    }
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/send-otp', { identifier: ident.trim(), type: identType, purpose: 'signup' });
      setDevOtp(r.data.dev_otp || '');
      setStep(2);
      setTimer(60);
    } catch (e) { setError(e.response?.data?.error || 'Error sending OTP'); }
    finally { setLoading(false); }
  }

  async function verifyOtp() {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setError('');
    setStep(3);
  }

  async function createAccount() {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/signup', {
        name: name.trim(),
        identifier: ident.trim(),
        type: identType,
        otp_code: otp,
        password,
        phone: identType === 'email' ? regPhone.trim() : ident.trim(),
      });
      onSuccess(r.data.token, r.data.user);
    } catch (e) { setError(e.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  }

  async function resendOtp() {
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/send-otp', { identifier: ident.trim(), type: identType, purpose: 'signup' });
      setDevOtp(r.data.dev_otp || '');
      setOtp('');
      setTimer(60);
    } catch (e) { setError(e.response?.data?.error || 'Error resending'); }
    finally { setLoading(false); }
  }

  /* Step progress indicator */
  const STEPS = ['Identity', 'Verify', 'Password'];

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        {STEPS.map((s, i) => {
          const num  = i + 1;
          const done = step > num;
          const curr = step === num;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, transition: 'all 0.3s',
                  background: done ? '#5CC8A0' : curr ? 'rgba(74,144,217,0.80)' : 'rgba(255,255,255,0.08)',
                  color: done || curr ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: curr ? '2px solid rgba(74,144,217,0.50)' : 'none',
                  boxShadow: curr ? '0 0 10px rgba(74,144,217,0.35)' : 'none',
                }}>
                  {done ? '✓' : num}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: done || curr ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.30)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, margin: '0 8px', background: done ? '#5CC8A0' : 'rgba(255,255,255,0.10)', transition: 'background 0.3s' }} />
              )}
            </div>
          );
        })}
      </div>

      {error && <div style={{ background: 'rgba(240,123,106,0.12)', border: '1px solid rgba(240,123,106,0.30)', borderRadius: 8, padding: '9px 13px', color: '#F07B6A', fontSize: 13, marginBottom: '1rem', fontWeight: 500 }}>⚠ {error}</div>}

      {/* ── Step 1: Name + identifier ── */}
      {step === 1 && (
        <div>
          <div className="field">
            <label>Full Name</label>
            <input type="text" placeholder="Ravi Kumar" value={name} onChange={e => { setName(e.target.value); setError(''); }} />
          </div>

          {/* Email / Phone toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '0.8rem' }}>
            {[{ id: 'email', label: '✉️ Email' }, { id: 'phone', label: '📱 Phone' }].map(m => (
              <button key={m.id} onClick={() => { setIdentType(m.id); setIdent(''); setError(''); }} style={{
                flex: 1, padding: '8px 0', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                border: identType === m.id ? '1px solid rgba(74,144,217,0.50)' : '1px solid rgba(255,255,255,0.10)',
                background: identType === m.id ? 'rgba(74,144,217,0.14)' : 'rgba(255,255,255,0.04)',
                color: identType === m.id ? '#4A90D9' : 'rgba(255,255,255,0.45)',
              }}>{m.label}</button>
            ))}
          </div>

          <div className="field">
            <label>{identType === 'email' ? 'Email Address' : 'Phone Number'}</label>
            <input
              type={identType === 'email' ? 'email' : 'tel'}
              placeholder={identType === 'email' ? 'you@example.com' : '+91 98765 43210'}
              value={ident}
              onChange={e => { setIdent(e.target.value); setError(''); }}
              style={identType === 'phone' ? { fontFamily: 'JetBrains Mono, monospace' } : {}}
            />
          </div>

          {/* Phone field — mandatory for email signups */}
          {identType === 'email' && (
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                📱 Phone Number
                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(240,123,106,0.15)', border: '1px solid rgba(240,123,106,0.3)', color: '#F07B6A', borderRadius: 5, padding: '1px 6px', letterSpacing: '0.3px' }}>REQUIRED</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={regPhone}
                onChange={e => { setRegPhone(e.target.value); setError(''); }}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                Used for account recovery and important updates
              </div>
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }} onClick={sendOtp} disabled={loading}>
            {loading ? 'Sending OTP…' : `Send OTP to my ${identType} →`}
          </button>
        </div>
      )}

      {/* ── Step 2: OTP verification ── */}
      {step === 2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: '0.6rem' }}>📬</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>Enter the verification code</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
            Sent to <strong style={{ color: '#e2e8f0' }}>{ident}</strong>
          </div>
          {devOtp && (
            <div style={{ fontSize: 12, background: 'rgba(232,168,56,0.12)', border: '1px solid rgba(232,168,56,0.25)', borderRadius: 8, padding: '5px 10px', color: '#E8A838', fontFamily: 'monospace', display: 'inline-block', marginBottom: 4 }}>
              Dev OTP: <strong>{devOtp}</strong>
            </div>
          )}

          <OtpInput value={otp} onChange={v => { setOtp(v); setError(''); }} />

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }} onClick={verifyOtp} disabled={otp.length !== 6 || loading}>
            ✓ Verify Code →
          </button>

          <div style={{ marginTop: '0.8rem', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {timer > 0
              ? `Resend in ${timer}s`
              : <button onClick={resendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#4A90D9', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Resend OTP</button>
            }
          </div>
          <button onClick={() => { setStep(1); setOtp(''); setError(''); }} style={{ marginTop: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }}>
            ← Change {identType}
          </button>
        </div>
      )}

      {/* ── Step 3: Set password ── */}
      {step === 3 && (
        <div>
          <div style={{ background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.20)', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#5CC8A0', marginBottom: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✅</span> {identType === 'email' ? 'Email' : 'Phone'} verified — {ident}
          </div>

          <div className="field">
            <label>Create Password</label>
            <input type="password" placeholder="Min 8 characters" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
            {password && (
              <>
                <div className="strength-bar"><div className="strength-fill" style={{ width: `${str * 25}%`, background: strColors[str] }} /></div>
                <div style={{ fontSize: 11, color: strColors[str], marginTop: 3, fontWeight: 600 }}>{strLabels[str]}</div>
              </>
            )}
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} />
            {confirm && password !== confirm && <div className="field-error">⚠ Passwords do not match</div>}
          </div>

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}
            onClick={createAccount}
            disabled={loading || password.length < 8 || password !== confirm}>
            {loading ? 'Creating account…' : '🚀 Create My Account →'}
          </button>
        </div>
      )}

      <div className="auth-footer" style={{ marginTop: '1.2rem' }}>
        Already have an account? <button onClick={switchToLogin}>Login</button>
      </div>
    </div>
  );
}
