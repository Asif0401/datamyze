import { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────
   Animated count-up hook
───────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

/* ─────────────────────────────────────────────────────────
   Stat card with animated number
───────────────────────────────────────────────────────── */
function StatCard({ value, suffix = '', label, color, icon, started }) {
  const num = useCountUp(value, 1600, started);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.045)',
      border: `1px solid ${color}33`,
      borderRadius: 16,
      padding: '1.4rem 1.6rem',
      textAlign: 'center',
      backdropFilter: 'blur(14px)',
      position: 'relative',
      overflow: 'hidden',
      flex: '1 1 140px',
      minWidth: 130,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
      <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-1px' }}>
        {num}{suffix}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 5, fontWeight: 500, letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Company timeline item
───────────────────────────────────────────────────── */
function TimelineItem({ company, role, period, desc, color, logo, current = false, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      display: 'flex', gap: '1.2rem', alignItems: 'flex-start',
      opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-30px)',
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    }}>
      {/* Left: dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 6 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `2px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
          boxShadow: current ? `0 0 18px ${color}55` : 'none',
          position: 'relative',
        }}>
          {logo}
          {current && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              border: '2px solid #0d1117',
            }} />
          )}
        </div>
        <div style={{ width: 2, flex: 1, minHeight: 30, background: `linear-gradient(180deg, ${color}44, transparent)`, marginTop: 4 }} />
      </div>

      {/* Right: content */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}22`,
        borderRadius: 14,
        padding: '1rem 1.2rem',
        marginBottom: '1.2rem',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {current && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: '#22c55e22', border: '1px solid #22c55e55',
            color: '#22c55e', fontSize: 9, fontWeight: 700,
            padding: '2px 7px', borderRadius: 20, letterSpacing: 0.5,
          }}>● CURRENT</span>
        )}
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{role}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color }}>{company}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{period}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Skill chip
───────────────────────────────────────────────────── */
function Skill({ label, icon, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px',
        background: hov ? `${color}22` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hov ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 30, fontSize: 12.5, fontWeight: 600,
        color: hov ? color : 'rgba(255,255,255,0.65)',
        cursor: 'default', transition: 'all .2s ease',
        whiteSpace: 'nowrap',
      }}>
      <span>{icon}</span>
      {label}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Education card
───────────────────────────────────────────────────── */
function EduCard({ degree, field, institution, year, color, icon, delay, started }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}33`,
      borderRadius: 18,
      padding: '1.5rem',
      flex: '1 1 260px',
      position: 'relative', overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    }}>
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22, transparent)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
        {degree}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 6 }}>{field}</div>
      <div style={{ fontSize: 13, color, fontWeight: 600, marginBottom: 3 }}>{institution}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{year}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────── */
export default function Instructor() {
  const [statsStarted, setStatsStarted] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const statsRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Fetch dynamic instructor profile from admin API
    import('../hooks/useApi').then(m => {
      m.default.get('/admin/instructor').then(r => setProfile(r.data)).catch(() => {});
    });

    // Hero entrance
    const t = setTimeout(() => setHeroVisible(true), 100);

    // Stats trigger on scroll
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);

    return () => { clearTimeout(t); obs.disconnect(); };
  }, []);

  // Derive dynamic values (fall back to static defaults)
  const instructorName  = profile?.name  || 'Asif Khan';
  const instructorTitle = profile?.title || 'Lead Mentor';
  const linkedinUrl = profile?.linkedin_url || 'https://www.linkedin.com/in/pathan-asif-khan-/';
  const instructorPhoto = profile?.photo_url || '/instructor.jpg';

  const SKILLS = [
    { label: 'SQL', icon: '🗄️', color: '#7F77DD' },
    { label: 'Python', icon: '🐍', color: '#5CC8A0' },
    { label: 'Pandas', icon: '🐼', color: '#4A90D9' },
    { label: 'Data Modelling', icon: '🏗️', color: '#F07B6A' },
    { label: 'Growth Analytics', icon: '📈', color: '#22c55e' },
    { label: 'Product Analytics', icon: '🔍', color: '#a78bfa' },
    { label: 'A/B Testing', icon: '🧪', color: '#f59e0b' },
    { label: 'Tableau', icon: '📊', color: '#e8762d' },
    { label: 'Power BI', icon: '💡', color: '#F2C811' },
    { label: 'Machine Learning', icon: '🤖', color: '#38bdf8' },
    { label: 'dbt', icon: '🔧', color: '#FF6B35' },
    { label: 'Mixpanel', icon: '📡', color: '#7c3aed' },
    { label: 'Metabase', icon: '📉', color: '#509EE3' },
    { label: 'Apache Spark', icon: '⚡', color: '#E25A1C' },
    { label: 'Excel', icon: '📋', color: '#1D9E75' },
    { label: 'Statistics', icon: '📐', color: '#F07B6A' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem', position: 'relative' }}>

      {/* ── Ambient blobs ──────────────────────────────── */}
      <div style={{ position: 'fixed', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,119,221,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '3%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,200,160,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ════════════════════════════════════════════════
          ABOUT DATAMYZE — Company mission section
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        {/* Page badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(127,119,221,0.12)', border: '1px solid rgba(127,119,221,0.25)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 16,
          fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: 1,
        }}>ℹ️ ABOUT DATAMYZE</div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.15,
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #f1f5f9 40%, #a78bfa 70%, #5CC8A0)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>More than a course platform.<br />Your career launchpad.</h1>

        <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', maxWidth: 660, lineHeight: 1.8, margin: '0 0 28px' }}>
          Datamyze was built for one purpose — to help people like you land roles in data. Not with generic YouTube-style tutorials, but with
          <strong style={{ color: '#f1f5f9' }}> real interview problems, hands-on projects, and dedicated mentorship</strong> that walks you through every step — from learning SQL to getting your first offer letter.
        </p>

        {/* Value pillars */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { icon: '🎯', title: '100% Placement Assistance', desc: 'We stay with you until you land the role — resume reviews, mock interviews, referrals.', color: '#a78bfa' },
            { icon: '🧑‍💼', title: 'Industry-Led Mentorship', desc: 'Learn directly from practitioners who have worked at CRED, PagarBook, and funded startups.', color: '#5CC8A0' },
            { icon: '🗺️', title: 'Structured Career Paths', desc: 'Custom roadmaps for Data Analyst, BI Engineer, Product Analyst, BI Analyst and more.', color: '#38bdf8' },
            { icon: '💡', title: 'Real-World Problems', desc: 'Every problem mirrors actual company interviews — Flipkart, Swiggy, Razorpay, Amazon India.', color: '#f59e0b' },
          ].map((p, i) => (
            <div key={i} style={{
              flex: '1 1 200px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${p.color}22`,
              borderRadius: 16, padding: '1.2rem',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${p.color}88, transparent)` }} />
              <div style={{ fontSize: 22, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 5 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Roles we target */}
        <div style={{ marginTop: 24, padding: '1.2rem 1.4rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Roles our learners land</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Data Analyst', 'BI Analyst', 'BI Engineer', 'Product Analyst', 'Analytics Engineer', 'SQL Developer', 'Reporting Analyst', 'Growth Analyst', 'Business Analyst'].map(r => (
              <span key={r} style={{
                fontSize: 12, fontWeight: 600, padding: '4px 12px',
                background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.2)',
                borderRadius: 20, color: '#c4b5fd',
              }}>{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(127,119,221,0.3), transparent)', marginBottom: '3rem', position: 'relative', zIndex: 1 }} />

      {/* ── "Meet the Mentor" label ── */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
        <SectionHeader icon="👋" label="Meet the Mentor" sub="The person behind every lesson, every problem, every career conversation" />
      </div>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap',
        marginBottom: '3rem',
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity .7s ease, transform .7s ease',
        position: 'relative', zIndex: 1,
      }}>
        {/* Photo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {/* Rotating ring */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #7F77DD, #5CC8A0, #4A90D9, #F07B6A, #7F77DD)',
            animation: 'spin 6s linear infinite',
            opacity: 0.7,
          }} />
          <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: '#0d1117' }} />
          {(instructorPhoto && !photoError) ? (
            <img
              src={instructorPhoto}
              alt={instructorName}
              onError={() => setPhotoError(true)}
              style={{
                width: 140, height: 140, borderRadius: '50%', objectFit: 'cover',
                position: 'relative', zIndex: 1,
                border: '3px solid rgba(255,255,255,0.1)',
              }}
            />
          ) : (
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7F77DD, #4A90D9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, fontWeight: 800, color: '#fff',
              position: 'relative', zIndex: 1,
              border: '3px solid rgba(255,255,255,0.1)',
            }}>{instructorName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
          )}
        </div>

        {/* Name & bio */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.3)',
            borderRadius: 20, padding: '4px 12px', marginBottom: 10,
            fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: 0.8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            {instructorTitle.toUpperCase()}
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.1,
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #f1f5f9 30%, #a78bfa 70%, #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>{instructorName}</h1>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 16px', lineHeight: 1.6, maxWidth: 480 }}>
            Product & Growth Analyst at PagarBook · Ex-CRED · Masters in Data Science (VIT Vellore) · Teaching real-world analytics that gets you hired.
          </p>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={linkedinUrl} target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #0077B5, #005E93)',
                border: 'none', borderRadius: 30, padding: '8px 18px',
                color: '#fff', fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
                cursor: 'pointer', transition: 'opacity .2s',
                boxShadow: '0 4px 16px rgba(0,119,181,0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a href="#live-session"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.4)',
                borderRadius: 30, padding: '8px 18px',
                color: '#a78bfa', fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
                cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(127,119,221,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(127,119,221,0.15)'; }}
            >📅 Book Live Session</a>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════ */}
      <div ref={statsRef} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: '3.5rem', position: 'relative', zIndex: 1 }}>
        <StatCard value={3}  suffix="+"  label="Years Experience"   color="#7F77DD" icon="⏱️" started={statsStarted} />
        <StatCard value={150} suffix="+"  label="Students Taught"    color="#5CC8A0" icon="🎓" started={statsStarted} />
        <StatCard value={3}  suffix=""   label="Top Companies"       color="#F07B6A" icon="🏢" started={statsStarted} />
        <StatCard value={6}  suffix=""   label="Courses Created"     color="#38bdf8" icon="📚" started={statsStarted} />
        <StatCard value={100} suffix="+"  label="Problems Curated"   color="#f59e0b" icon="💡" started={statsStarted} />
      </div>

      {/* ════════════════════════════════════════════════
          ABOUT / PHILOSOPHY
      ════════════════════════════════════════════════ */}
      <div style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '2rem', marginBottom: '3rem',
        position: 'relative', overflow: 'hidden', zIndex: 1,
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #7F77DD, #5CC8A0, #38bdf8)',
        }} />
        {/* Quote icon */}
        <div style={{ fontSize: 48, opacity: 0.1, position: 'absolute', top: 12, right: 20, fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7F77DD', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>
          👋 A message from your instructor
        </div>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.85, margin: 0, maxWidth: 720 }}>
          I started Datamyze because I noticed a huge gap between what's taught in classrooms and what companies like{' '}
          <strong style={{ color: '#a78bfa' }}>CRED</strong>,{' '}
          <strong style={{ color: '#FF5A30' }}>PagarBook</strong>, and{' '}
          <strong style={{ color: '#5CC8A0' }}>funded startups</strong>{' '}
          actually need from data analysts. Everything here — every SQL problem, every Python exercise, every course module — is based on{' '}
          <em style={{ color: '#f1f5f9' }}>real scenarios I've personally encountered on the job</em>.
          I want you to not just learn SQL syntax, but think like a data analyst from day one.
        </p>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7F77DD, #4A90D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
          }}>AK</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{instructorName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Product & Growth Analyst, PagarBook</div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CAREER TIMELINE
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="💼" label="Career Journey" sub="Real industry experience driving every lesson" />

        <TimelineItem
          company="PagarBook"
          role="Product & Growth Analyst"
          period="2023 – Present"
          desc="Leading all analytics for the product team — from funnel optimisation and feature adoption tracking to growth experiments. Own the company's growth analytics stack including Mixpanel, Metabase, and custom SQL dashboards. Drive A/B testing, cohort analyses, and revenue attribution for India's largest payroll & attendance app."
          color="#FF5A30"
          logo="🧡"
          current={true}
          delay={0}
        />
        <TimelineItem
          company="CRED"
          role="Analytics & Data Science Engineer"
          period="2022 – 2023"
          desc="Built end-to-end analytics pipelines and data science models for CRED's credit intelligence platform. Worked on member segmentation, spend propensity models, and real-time dashboards serving millions of premium users. Deep exposure to large-scale event data and financial product analytics."
          color="#6C63FF"
          logo="💳"
          current={false}
          delay={100}
        />
        <TimelineItem
          company="Analytics Startups"
          role="Data Analyst (Multiple Roles)"
          period="2021 – 2022"
          desc="Worked across multiple early-stage startups in the analytics and data consulting space — building reporting systems from scratch, defining KPI frameworks, setting up data warehouses, and creating business intelligence dashboards for founders and investors."
          color="#38bdf8"
          logo="🚀"
          current={false}
          delay={200}
        />
      </div>

      {/* ════════════════════════════════════════════════
          EDUCATION
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="🎓" label="Education" sub="Strong academic foundation in CS and Data Science" />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <EduCard
            degree="Master's Degree"
            field="Data Science"
            institution="VIT Vellore"
            year="Vellore Institute of Technology, Tamil Nadu"
            color="#a78bfa"
            icon="🔬"
            delay={0}
            started={true}
          />
          <EduCard
            degree="Bachelor's Degree"
            field="Computer Science & Engineering"
            institution="LPU Punjab"
            year="Lovely Professional University, Punjab"
            color="#38bdf8"
            icon="💻"
            delay={150}
            started={true}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          SKILLS
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="⚡" label="Skills & Tools" sub="Everything you'll learn in this platform — and more" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SKILLS.map((s, i) => <Skill key={i} {...s} />)}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          WHAT STUDENTS SAY (static testimonials)
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="💬" label="What Students Say" sub="Real results, real placements" />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { name: 'Priya S.', role: 'Data Analyst @ Flipkart', text: 'The SQL problems here are exactly what I was asked in my Flipkart interview. Got an offer within 3 months of joining Datamyze.', color: '#5CC8A0', avatar: 'PS' },
            { name: 'Rahul M.', role: 'Analytics Engineer @ Swiggy', text: 'The real-world examples from CRED and PagarBook made everything click. The cohort analysis module alone landed me 2 interviews.', color: '#7F77DD', avatar: 'RM' },
            { name: 'Ananya K.', role: 'BI Developer @ Razorpay', text: 'Best investment I made. The course content is way ahead of any YouTube tutorial — it teaches you how companies actually use data.', color: '#38bdf8', avatar: 'AK' },
          ].map((t, i) => (
            <div key={i} style={{
              flex: '1 1 240px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${t.color}22`,
              borderRadius: 16, padding: '1.3rem',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 10, right: 12,
                fontSize: 36, opacity: 0.08, fontFamily: 'Georgia', lineHeight: 1,
              }}>"</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 14 }}>
                "{t.text}"
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}66, ${t.color}33)`,
                  border: `1px solid ${t.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: t.color,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: t.color, fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <div id="live-session" style={{
        background: 'linear-gradient(135deg, rgba(127,119,221,0.15) 0%, rgba(92,200,160,0.1) 50%, rgba(56,189,248,0.1) 100%)',
        border: '1px solid rgba(127,119,221,0.25)',
        borderRadius: 22, padding: '2.5rem',
        textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 1,
      }}>
        {/* Animated shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: '-100%', width: '200%', height: '100%',
          background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)',
          animation: 'shimmer 3s infinite',
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px' }}>
          Ready to fast-track your data career?
        </h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', margin: '0 auto 20px', maxWidth: 460, lineHeight: 1.7 }}>
          Enroll in a course, solve real interview problems, or book a 1:1 live session with us to get personalised guidance on your data analytics journey.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/courses" style={{
            background: 'linear-gradient(135deg, #7F77DD, #5CC8A0)',
            border: 'none', borderRadius: 30, padding: '10px 24px',
            color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(127,119,221,0.35)',
            transition: 'transform .2s, box-shadow .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(127,119,221,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(127,119,221,0.35)'; }}
          >🚀 Start Learning</a>
          <a href="/premium" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 30, padding: '10px 24px',
            color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            cursor: 'pointer', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
          >👑 Go Pro</a>
        </div>
      </div>

      {/* ── CSS keyframes injected inline ── */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { from { left: -100%; } to { left: 100%; } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Section header
───────────────────────────────────────────────────── */
function SectionHeader({ icon, label, sub }) {
  return (
    <div style={{ marginBottom: '1.4rem' }}>
      <h2 style={{
        fontSize: 18, fontWeight: 800, color: '#f1f5f9',
        margin: '0 0 3px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{icon}</span>{label}
      </h2>
      {sub && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}
