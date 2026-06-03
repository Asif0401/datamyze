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
  { icon: '🎙️',          label: 'Live Mock Interviews',desc: 'Real sessions with our mentor, with recorded feedback' },
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

/* ── Hero data ─────────────────────────────────── */
const FEATURES = [
  { icon: <SqlLogo />,    color: '#38bdf8', title: '400+ Real Problems',      desc: 'SQL & Python from actual Flipkart, Amazon & Zomato interview rounds' },
  { icon: '🎙️',          color: '#a78bfa', title: 'Live Mock Interviews',    desc: '1:1 sessions with our mentor — full feedback & recording' },
  { icon: '💼',           color: '#5CC8A0', title: '300+ Curated Jobs',       desc: 'Data Analyst, BI & Product Analyst roles updated daily' },
  { icon: '📄',           color: '#f9a825', title: 'Resume Review',           desc: 'ATS-optimised expert feedback delivered within 24 hours' },
  { icon: <PythonLogo />, color: '#FFD343', title: 'Python & Pandas Track',   desc: 'Data wrangling, EDA, GroupBy and real case-study problems' },
  { icon: '🎯',           color: '#f87171', title: '100% Placement Support',  desc: 'We work alongside you until you land your first data role' },
];
const STATS = [
  { val: '400+',  lbl: 'Problems',       color: '#38bdf8' },
  { val: '1:1',   lbl: 'Mentorship',     color: '#a78bfa' },
  { val: '24h',   lbl: 'Resume Review',  color: '#5CC8A0' },
  { val: '₹199',  lbl: 'Lifetime',       color: '#E8A838' },
];
const COMPANIES = ['Flipkart','Amazon','Swiggy','Zomato','PhonePe','Meesho','Razorpay','CRED','Dream11','Walmart'];
const CMP_COLOR = { Flipkart:'#2874F0',Amazon:'#FF9900',Swiggy:'#FC8019',Zomato:'#E23744',PhonePe:'#5F259F',Meesho:'#8B5CF6',Razorpay:'#2962FF',CRED:'#00C853',Dream11:'#1A73E8',Walmart:'#0071CE' };

/* ══════════════════════════════════════════════════
   MAIN AUTH PAGE
══════════════════════════════════════════════════ */
export default function AuthPage({ mode: initialMode }) {
  const [panel, setPanel]   = useState(initialMode || 'login');
  const [loginType, setLoginType] = useState('email');
  const { login } = useAuth();
  const navigate  = useNavigate();
  const heroRef   = useRef(null);

  /* Scroll-reveal: add .in class when elements enter the scroll container */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.08, root: hero }
    );
    hero.querySelectorAll('.auth-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* Auto-scroll: slow cinematic scroll, pauses on hover/touch */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let raf;
    let pos = 0;
    let paused = false;
    const SPEED = 0.45; // px per frame

    // Delay start by 3s so user can read the hero first
    const startTimer = setTimeout(() => {
      const tick = () => {
        if (!paused) {
          pos += SPEED;
          if (pos >= hero.scrollHeight - hero.clientHeight) pos = 0;
          hero.scrollTop = pos;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 3000);

    const pause  = () => { paused = true; };
    const resume = () => { paused = false; pos = hero.scrollTop; };

    hero.addEventListener('mouseenter',  pause);
    hero.addEventListener('mouseleave',  resume);
    hero.addEventListener('touchstart',  pause,  { passive: true });
    hero.addEventListener('touchend',    resume, { passive: true });
    hero.addEventListener('wheel',       pause,  { passive: true });

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      hero.removeEventListener('mouseenter',  pause);
      hero.removeEventListener('mouseleave',  resume);
      hero.removeEventListener('touchstart',  pause);
      hero.removeEventListener('touchend',    resume);
      hero.removeEventListener('wheel',       pause);
    };
  }, []);

  return (
    <div className="auth-wrap">
      <Blobs />
      <Particles />

      {/* ═══ LEFT HERO — scrollable ═══ */}
      <div className="auth-hero" ref={heroRef}>

        {/* ══════════════ SECTION 1 — HERO ══════════════ */}
        <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem 4rem 3rem', position:'relative' }}>

          {/* Ambient glows */}
          <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(74,144,217,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'10%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)', pointerEvents:'none' }} />

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'2rem', animation:'fadeInUp 0.4s ease both' }}>
            <div className="auth-logo-icon" style={{ width:44, height:44, borderRadius:12, boxShadow:'0 0 20px rgba(34,211,238,0.4)' }}>
              <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
                <defs>
                  <linearGradient id="ab1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0.1"/></linearGradient>
                  <linearGradient id="ab4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18"/></linearGradient>
                </defs>
                <rect x="1.5" y="17" width="3.5" height="4.5" rx="1.3" fill="url(#ab1)"/>
                <rect x="6.5" y="13" width="3.5" height="8.5" rx="1.3" fill="url(#ab1)"/>
                <rect x="11.5" y="9" width="3.5" height="12.5" rx="1.3" fill="url(#ab1)"/>
                <rect x="16.5" y="5" width="3.5" height="16.5" rx="1.3" fill="url(#ab4)"/>
                <line x1="3.25" y1="16.5" x2="18.25" y2="4.5" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" opacity="0.9"/>
              </svg>
            </div>
            <span style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.4px' }}>
              <span style={{ color:'rgba(255,255,255,0.65)', fontWeight:500 }}>Data</span>
              <span style={{ background:'linear-gradient(135deg,#fff 0%,#22d3ee 60%,#a78bfa 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontWeight:900 }}>myze</span>
            </span>
          </div>

          {/* Headline */}
          <div style={{ marginBottom:'1.2rem' }}>
            <div style={{ fontSize:'clamp(36px,3.8vw,58px)', fontWeight:900, letterSpacing:'-2px', lineHeight:1.05, color:'rgba(255,255,255,0.88)', animation:'fadeInUp 0.5s 0.08s ease both', marginBottom:6 }}>
              The platform that
            </div>
            <div style={{ fontSize:'clamp(36px,3.8vw,58px)', fontWeight:900, letterSpacing:'-2px', lineHeight:1.05, animation:'fadeInUp 0.5s 0.14s ease both', marginBottom:6 }}>
              <span style={{ color:'rgba(255,255,255,0.88)' }}>actually gets you</span>
            </div>
            <div style={{ position:'relative', display:'inline-block', animation:'fadeInUp 0.5s 0.20s ease both' }}>
              <span style={{ fontSize:'clamp(40px,4.2vw,64px)', fontWeight:900, letterSpacing:'-2.5px', lineHeight:1.0, background:'linear-gradient(135deg, #4A90D9 0%, #818cf8 45%, #c084fc 75%, #5CC8A0 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'gradientShift 5s ease infinite' }}>
                hired in data.
              </span>
              <span style={{ position:'absolute', bottom:-6, left:0, right:0, height:4, borderRadius:4, background:'linear-gradient(90deg,#4A90D9,#818cf8,#5CC8A0)', animation:'barIn 0.7s 0.6s ease both', transformOrigin:'left' }} />
            </div>
          </div>

          {/* Subtext */}
          <div style={{ fontSize:'clamp(14px,1.3vw,16px)', color:'rgba(255,255,255,0.48)', lineHeight:1.7, maxWidth:520, marginBottom:'2rem', animation:'fadeInUp 0.5s 0.28s ease both' }}>
            Real SQL &amp; Python problems from India's top companies · 1:1 mentorship · resume review · mock interviews · 100% placement support until you get hired.
          </div>

          {/* Stat chips */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:'2.5rem', animation:'fadeInUp 0.5s 0.34s ease both' }}>
            {STATS.map(s => (
              <div key={s.lbl} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 18px', borderRadius:14, background:`${s.color}0e`, border:`1px solid ${s.color}28`, minWidth:80 }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color, letterSpacing:'-0.5px', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:3 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* "Students placed at" marquee */}
          <div style={{ animation:'fadeInUp 0.5s 0.40s ease both' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>Students placed at</div>
            <div style={{ overflow:'hidden', maskImage:'linear-gradient(to right,transparent,black 8%,black 92%,transparent)', WebkitMaskImage:'linear-gradient(to right,transparent,black 8%,black 92%,transparent)' }}>
              <div className="auth-marquee-track">
                {[...COMPANIES, ...COMPANIES].map((co, i) => (
                  <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', marginRight:8, borderRadius:20, background:`${CMP_COLOR[co]}12`, border:`1px solid ${CMP_COLOR[co]}30`, color:CMP_COLOR[co], fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>
                    {co}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position:'absolute', bottom:'2.5rem', left:'4rem', display:'flex', alignItems:'center', gap:8, animation:'fadeInUp 0.5s 0.8s ease both' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.22)', letterSpacing:1, textTransform:'uppercase' }}>Scroll to explore</div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
        </section>

        {/* ══════════════ SECTION 2 — FEATURES ══════════════ */}
        <section style={{ padding:'5rem 4rem 4rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="auth-reveal" style={{ transitionDelay:'0ms' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'rgba(56,189,248,0.7)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>What you get</div>
            <div style={{ fontSize:'clamp(26px,2.6vw,38px)', fontWeight:900, letterSpacing:'-1.2px', lineHeight:1.1, marginBottom:8 }}>
              <span style={{ color:'rgba(255,255,255,0.88)' }}>Everything you need.</span><br/>
              <span style={{ color:'rgba(255,255,255,0.40)' }}>Nothing you don't.</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', marginTop:'2rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="auth-reveal auth-feat-card" style={{
                transitionDelay:`${i * 70}ms`,
                padding:'1.3rem',
                borderRadius:16,
                background:`linear-gradient(145deg, ${f.color}0d 0%, rgba(255,255,255,0.025) 100%)`,
                border:`1px solid ${f.color}22`,
                borderTop:`2px solid ${f.color}55`,
              }}>
                <div style={{ fontSize:28, marginBottom:'0.6rem', display:'flex', alignItems:'center' }}>
                  {typeof f.icon === 'string' ? f.icon : <span style={{ display:'flex' }}>{f.icon}</span>}
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:5 }}>{f.title}</div>
                <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.42)', lineHeight:1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ SECTION 3 — HOW IT WORKS ══════════════ */}
        <section style={{ padding:'4rem', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.015)' }}>
          <div className="auth-reveal">
            <div style={{ fontSize:11, fontWeight:800, color:'rgba(167,139,250,0.7)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>The process</div>
            <div style={{ fontSize:'clamp(24px,2.4vw,36px)', fontWeight:900, letterSpacing:'-1px', color:'rgba(255,255,255,0.88)', marginBottom:'0.4rem' }}>
              Your roadmap to a data job
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.38)', marginBottom:'2.2rem' }}>Four steps. One destination.</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {[
              { step:'01', icon:'📚', color:'#38bdf8', title:'Learn the fundamentals', desc:'Start with SQL, Python, and data analysis courses built from scratch — beginner friendly, industry relevant.' },
              { step:'02', icon:'🎯', color:'#a78bfa', title:'Practise real interview problems', desc:'Solve 400+ SQL and Python problems directly sourced from top Indian tech company interview rounds.' },
              { step:'03', icon:'🎙️', color:'#5CC8A0', title:'Mock interviews & resume review', desc:'Book 1:1 live mock interviews. Get your resume ATS-optimised with expert feedback in 24 hours.' },
              { step:'04', icon:'💼', color:'#E8A838', title:'Apply & get placed', desc:'Access 300+ curated data roles and lean on our placement support team until you sign your offer letter.' },
            ].map((s, i) => (
              <div key={i} className="auth-reveal" style={{ transitionDelay:`${i * 90}ms`, display:'flex', gap:18, alignItems:'flex-start', paddingBottom: i < 3 ? '1.8rem' : 0 }}>
                {/* Icon + connector */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${s.color}12`, border:`1.5px solid ${s.color}38`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                  {i < 3 && <div style={{ width:2, flexGrow:1, minHeight:24, background:`linear-gradient(180deg, ${s.color}40, transparent)`, marginTop:6, marginBottom:-6 }} />}
                </div>
                {/* Text */}
                <div style={{ paddingTop:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                    <span style={{ fontSize:10, fontWeight:900, color:s.color, letterSpacing:1.5, textTransform:'uppercase' }}>Step {s.step}</span>
                    <div style={{ height:1, flex:1, maxWidth:40, background:`${s.color}30` }} />
                  </div>
                  <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:5, letterSpacing:'-0.3px' }}>{s.title}</div>
                  <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.42)', lineHeight:1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ SECTION 4 — COMPARISON ══════════════ */}
        <section style={{ padding:'4rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="auth-reveal">
            <div style={{ fontSize:11, fontWeight:800, color:'rgba(92,200,160,0.7)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>Why Datamyze?</div>
            <div style={{ fontSize:'clamp(24px,2.4vw,34px)', fontWeight:900, letterSpacing:'-1px', color:'rgba(255,255,255,0.88)', marginBottom:'1.8rem' }}>
              We built what others didn't.
            </div>
          </div>
          <div className="auth-reveal" style={{ transitionDelay:'80ms', borderRadius:18, overflow:'hidden', boxShadow:'0 0 0 1px rgba(127,119,221,0.22)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
              <div style={{ background:'rgba(255,255,255,0.025)', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:1, textTransform:'uppercase' }}>Others</span>
              </div>
              <div style={{ background:'linear-gradient(135deg,rgba(127,119,221,0.18),rgba(56,189,248,0.1))', padding:'10px 16px', borderBottom:'1px solid rgba(127,119,221,0.25)', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#7F77DD,#38bdf8)' }} />
                <span style={{ fontSize:13, fontWeight:800, background:'linear-gradient(135deg,#c4b5fd,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:0.8, textTransform:'uppercase' }}>✦ Datamyze</span>
              </div>
              {[
                { bad:'Only video tutorials',    good:'Real interview Qs from Flipkart, Amazon',  color:'#38bdf8' },
                { bad:'No live sessions',         good:'Live classes every week',                 color:'#F07B6A' },
                { bad:'No mentorship support',    good:'Dedicated 1:1 industry mentor',           color:'#a78bfa' },
                { bad:'No placement support',     good:'100% placement assistance',               color:'#5CC8A0' },
                { bad:'No mock interviews',       good:'Live mock interviews + feedback',          color:'#f9a825' },
                { bad:'No curated job board',     good:'300+ data roles, updated weekly',          color:'#34d399' },
              ].flatMap((row, i) => [
                <div key={`b${i}`} style={{ padding:'9px 16px', borderRight:'1px solid rgba(255,255,255,0.05)', borderBottom:i<5?'1px solid rgba(255,255,255,0.045)':'none', background:i%2===0?'rgba(0,0,0,0.18)':'rgba(0,0,0,0.10)', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:17, height:17, borderRadius:'50%', background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:10, color:'#f87171', fontWeight:900, lineHeight:1 }}>✕</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.32)', lineHeight:1.4 }}>{row.bad}</span>
                </div>,
                <div key={`g${i}`} style={{ padding:'9px 16px', borderBottom:i<5?'1px solid rgba(255,255,255,0.045)':'none', borderLeft:`2px solid ${row.color}45`, background:i%2===0?`linear-gradient(90deg,${row.color}09,rgba(127,119,221,0.06))`:`linear-gradient(90deg,rgba(127,119,221,0.05),${row.color}07)`, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:17, height:17, borderRadius:'50%', background:`${row.color}22`, border:`1px solid ${row.color}55`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:10, color:row.color, fontWeight:900, lineHeight:1 }}>✓</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.9)', lineHeight:1.4 }}>{row.good}</span>
                </div>,
              ])}
            </div>
          </div>
        </section>

        {/* ══════════════ SECTION 5 — PRICING CTA ══════════════ */}
        <section style={{ padding:'4rem 4rem 6rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="auth-reveal" style={{ textAlign:'center', maxWidth:500, margin:'0 auto' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'rgba(232,168,56,0.8)', letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>Pricing</div>
            <div style={{ fontSize:'clamp(24px,2.6vw,38px)', fontWeight:900, letterSpacing:'-1px', color:'rgba(255,255,255,0.88)', marginBottom:6 }}>
              One price.<br/>Everything included.
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.40)', marginBottom:'2rem' }}>Start for free. No credit card needed. Upgrade when ready.</div>

            <div style={{ background:'linear-gradient(145deg,rgba(232,168,56,0.07),rgba(167,139,250,0.05))', border:'1px solid rgba(232,168,56,0.22)', borderRadius:20, padding:'2rem', marginBottom:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:52, fontWeight:900, letterSpacing:'-2px', background:'linear-gradient(135deg,#E8A838,#fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>₹199</span>
                <span style={{ fontSize:16, color:'rgba(255,255,255,0.25)', textDecoration:'line-through' }}>₹999</span>
                <span style={{ fontSize:13, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(92,200,160,0.14)', color:'#5CC8A0', border:'1px solid rgba(92,200,160,0.3)' }}>80% OFF</span>
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.45)', marginBottom:'1.5rem' }}>One-time payment · Lifetime access · No renewals</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, textAlign:'left', marginBottom:'1.5rem' }}>
                {['400+ Problems','1:1 Mock Interviews','Curated Job Board','Resume Review','Verified Certificates','100% Placement Help'].map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.72)' }}>
                    <span style={{ color:'#5CC8A0', fontWeight:900, fontSize:14 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <button onClick={() => setPanel('signup')} style={{ width:'100%', padding:'0.9rem', borderRadius:12, background:'linear-gradient(135deg,#E8A838,#f59e0b)', border:'none', color:'#000', fontWeight:800, fontSize:15, cursor:'pointer' }}>
                👑 Get Full Access — ₹199
              </button>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.22)', marginBottom:'2rem' }}>🔒 Secure payment · Instant access</div>

            {/* Social links */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.22)', fontWeight:500 }}>Follow us</span>
              <a href="https://www.instagram.com/datamyze.in/" target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.40)', transition:'all .2s', textDecoration:'none' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(225,48,108,0.16)'; e.currentTarget.style.color='#e1306c'; e.currentTarget.style.borderColor='rgba(225,48,108,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.40)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/123464067/" target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.40)', transition:'all .2s', textDecoration:'none' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(0,119,181,0.16)'; e.currentTarget.style.color='#0077B5'; e.currentTarget.style.borderColor='rgba(0,119,181,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.40)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* ═══ MOBILE HERO (hidden on desktop) ═══ */}
      <div className="auth-mobile-hero">
        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(145deg,#1e40af,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(34,211,238,0.35)' }}>
            <svg viewBox="0 0 22 22" fill="none" width="20" height="20">
              <defs>
                <linearGradient id="mb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="mb4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18"/></linearGradient>
              </defs>
              <rect x="1.5" y="17" width="3.5" height="4.5" rx="1.3" fill="url(#mb1)"/>
              <rect x="6.5" y="13" width="3.5" height="8.5" rx="1.3" fill="url(#mb1)"/>
              <rect x="11.5" y="9"  width="3.5" height="12.5" rx="1.3" fill="url(#mb1)"/>
              <rect x="16.5" y="5"  width="3.5" height="16.5" rx="1.3" fill="url(#mb4)"/>
              <line x1="3.25" y1="16.5" x2="18.25" y2="4.5" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" opacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.4px' }}>
            <span style={{ color:'rgba(255,255,255,0.70)', fontWeight:600 }}>Data</span>
            <span style={{ background:'linear-gradient(135deg,#fff 0%,#22d3ee 60%,#a78bfa 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontWeight:900 }}>myze</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.8px', lineHeight:1.15, marginBottom:'0.4rem' }}>
          <span style={{ color:'rgba(255,255,255,0.80)' }}>Practice. Get mentored.</span><br/>
          <span style={{ background:'linear-gradient(135deg,#4A90D9 0%,#a78bfa 55%,#5CC8A0 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Get hired.</span>
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.40)', marginBottom:'1.1rem', lineHeight:1.5 }}>
          SQL · Python · 1:1 Mentorship · Resume Review · Mock Interviews
        </div>

        {/* Stats strip */}
        <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0.75rem 0', marginBottom:'1.2rem' }}>
          {[
            { val:'400+', lbl:'Problems'  },
            { val:'1:1',  lbl:'Mentorship'},
            { val:'₹199', lbl:'Lifetime'  },
            { val:'100%', lbl:'Placement' },
          ].map((s, i) => (
            <div key={i} style={{ flex:1, textAlign:'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize:17, fontWeight:800, color:'#fff', letterSpacing:'-0.3px' }}>{s.val}</div>
              <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.3px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {[
            { icon:'🎙️', label:'Live Mock Interviews', color:'#a78bfa' },
            { icon:'💼',  label:'300+ Job Listings',   color:'#38bdf8' },
            { icon:'📄',  label:'Resume Review',       color:'#5CC8A0' },
            { icon:'🏆',  label:'Verified Certs',      color:'#E8A838' },
          ].map(p => (
            <span key={p.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, padding:'5px 10px', borderRadius:20, background:`${p.color}14`, border:`1px solid ${p.color}30`, color:p.color }}>
              <span>{p.icon}</span>{p.label}
            </span>
          ))}
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
              {panel === 'login' ? 'Sign in to continue your journey' : 'Free to join. No credit card needed.'}
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
  const [showPw,   setShowPw]   = useState(false);
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
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', padding:0, cursor:'pointer', color:'rgba(255,255,255,0.38)', lineHeight:1 }} tabIndex={-1}>
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
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
  const [showPw,    setShowPw]    = useState(false);
  const [showConf,  setShowConf]  = useState(false);
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
            <span>✅</span> {identType === 'email' ? 'Email' : 'Phone'} verified: {ident}
          </div>

          <div className="field">
            <label>Create Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', padding:0, cursor:'pointer', color:'rgba(255,255,255,0.38)', lineHeight:1 }} tabIndex={-1}>
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {password && (
              <>
                <div className="strength-bar"><div className="strength-fill" style={{ width: `${str * 25}%`, background: strColors[str] }} /></div>
                <div style={{ fontSize: 11, color: strColors[str], marginTop: 3, fontWeight: 600 }}>{strLabels[str]}</div>
              </>
            )}
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <div style={{ position:'relative' }}>
              <input type={showConf ? 'text' : 'password'} placeholder="••••••••" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowConf(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', padding:0, cursor:'pointer', color:'rgba(255,255,255,0.38)', lineHeight:1 }} tabIndex={-1}>
                {showConf
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
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
