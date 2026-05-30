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
   FAQ item
───────────────────────────────────────────────────── */
function FAQItem({ q, a, color, delay }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => setOpen(v => !v)}
      style={{
        background: open ? `${color}0a` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${open ? color + '44' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        padding: '1.1rem 1.3rem',
        cursor: 'pointer',
        transition: 'all .25s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transitionProperty: 'opacity, transform, background, border-color',
        transitionDuration: `.5s, .5s, .25s, .25s`,
        transitionDelay: `${delay}ms, ${delay}ms, 0ms, 0ms`,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: open ? color : 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>
          {q}
        </div>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: open ? `${color}22` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? color + '44' : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: open ? color : 'rgba(255,255,255,0.45)',
          flexShrink: 0,
          transition: 'transform .25s ease',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>+</div>
      </div>
      {open && (
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
          marginTop: 10, borderTop: `1px solid ${color}22`, paddingTop: 10,
        }}>
          {a}
        </div>
      )}
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

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────── */
export default function Instructor() {
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem', position: 'relative' }}>

      {/* ── Ambient blobs ──────────────────────────────── */}
      <div style={{ position: 'fixed', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,119,221,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '3%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,200,160,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ════════════════════════════════════════════════
          HERO — Company mission
      ════════════════════════════════════════════════ */}
      <div style={{
        marginBottom: '3rem', position: 'relative', zIndex: 1,
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity .7s ease, transform .7s ease',
      }}>
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
            { icon: '🧑‍💼', title: 'Industry-Led Mentorship', desc: 'Learn directly from practitioners with real startup and product company experience.', color: '#5CC8A0' },
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

      {/* ════════════════════════════════════════════════
          PEOPLE BEHIND DATAMYZE
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="👥" label="People Behind Datamyze" sub="The team that built this and keeps it running" />

        {/* Founder card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(127,119,221,0.25)',
          borderRadius: 20, padding: '1.8rem',
          display: 'flex', gap: '1.8rem', alignItems: 'flex-start', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(127,119,221,0.12), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7F77DD, #5CC8A0, #38bdf8)' }} />

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Glowing ring */}
            <div style={{
              position: 'absolute', inset: -3, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #7F77DD, #5CC8A0, #38bdf8, #7F77DD)',
              opacity: 0.6,
            }} />
            <div style={{ position: 'absolute', inset: -1, borderRadius: '50%', background: '#0d1117' }} />
            <img
              src="/instructor.jpg"
              alt="Asif Khan"
              style={{
                width: 88, height: 88, borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'center top',
                position: 'relative', zIndex: 1,
                border: '2px solid rgba(127,119,221,0.3)',
                display: 'block',
              }}
            />
            {/* Online dot */}
            <div style={{
              position: 'absolute', bottom: 4, right: 4, zIndex: 2,
              width: 14, height: 14, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #0d1117',
              boxShadow: '0 0 8px #22c55e',
            }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            {/* Founder badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(232,168,56,0.12)', border: '1px solid rgba(232,168,56,0.3)',
              borderRadius: 20, padding: '3px 10px', marginBottom: 10,
              fontSize: 10, fontWeight: 700, color: '#E8A838', letterSpacing: 0.8,
            }}>👑 FOUNDER &amp; LEAD MENTOR</div>

            <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.5px' }}>
              Asif Khan
            </div>

            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 16px', maxWidth: 520 }}>
              Data analytics practitioner with hands-on experience at Indian product companies and funded startups.
              Built Datamyze after noticing that most learners were stuck on tutorials but couldn't crack interviews —
              because platforms teach concepts, not how companies actually use data.
              Everything on this platform is designed from real interview experience, not a textbook.
            </p>

            {/* CTA links */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href="https://www.linkedin.com/in/pathan-asif-khan-/"
                target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #0077B5, #005E93)',
                  borderRadius: 30, padding: '7px 16px',
                  color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,119,181,0.3)',
                  transition: 'opacity .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.82'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Connect on LinkedIn
              </a>
              <a
                href="https://www.instagram.com/datamyze.in/"
                target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 30, padding: '7px 16px',
                  color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}
              >
                📸 Follow @datamyze.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(92,200,160,0.3), transparent)', marginBottom: '3rem', position: 'relative', zIndex: 1 }} />

      {/* ════════════════════════════════════════════════
          PLATFORM STATS
      ════════════════════════════════════════════════ */}
      <div ref={statsRef} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: '3.5rem', position: 'relative', zIndex: 1 }}>
        <StatCard value={300}  suffix="+"  label="Curated Job Listings"   color="#7F77DD" icon="💼" started={statsStarted} />
        <StatCard value={92}   suffix="%"  label="Placement Rate"         color="#5CC8A0" icon="🚀" started={statsStarted} />
        <StatCard value={100}  suffix="+"  label="Interview Problems"     color="#38bdf8" icon="💡" started={statsStarted} />
        <StatCard value={6}    suffix=""   label="Courses & Tracks"       color="#f59e0b" icon="📚" started={statsStarted} />
        <StatCard value={199}  suffix="₹"  label="Lifetime · One-Time"   color="#E8A838" icon="👑" started={statsStarted} />
      </div>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS — 3-step process
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="🗺️" label="How It Works" sub="Three steps from zero to your first data role" />

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            {
              step: '01',
              icon: '📖',
              title: 'Learn with Purpose',
              desc: 'Master SQL, Python, Power BI and Excel through real company interview problems — not theory videos. Every lesson is built around what hiring managers actually test.',
              color: '#4A90D9',
              tags: ['SQL', 'Python', 'Power BI', 'Excel'],
            },
            {
              step: '02',
              icon: '🧑‍💼',
              title: 'Get Guided',
              desc: '1:1 live mentorship sessions, personalised resume feedback, and mock interviews with expert feedback — so you\'re never figuring it out alone.',
              color: '#a78bfa',
              tags: ['1:1 Mentorship', 'Mock Interviews', 'Resume Review'],
            },
            {
              step: '03',
              icon: '🎯',
              title: 'Get Hired',
              desc: 'Access 300+ hand-picked job listings at Flipkart, Swiggy, Razorpay and more. We track applications, provide referrals and support you till you get the offer.',
              color: '#5CC8A0',
              tags: ['300+ Jobs', 'Referrals', 'Placement Support'],
            },
          ].map((item, i) => (
            <div key={i} style={{
              flex: '1 1 240px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${item.color}22`,
              borderRadius: 18, padding: '1.6rem',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${item.color}88, transparent)` }} />
              {/* Step number watermark */}
              <div style={{
                position: 'absolute', top: 12, right: 16,
                fontSize: 52, fontWeight: 900, opacity: 0.06,
                color: item.color, lineHeight: 1, letterSpacing: '-2px',
              }}>{item.step}</div>

              <div style={{ fontSize: 30, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 14 }}>{item.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px',
                    background: `${item.color}15`, border: `1px solid ${item.color}33`,
                    borderRadius: 20, color: item.color,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          WHAT'S INSIDE — Platform features
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="📦" label="What's Inside Pro" sub="Everything bundled in your ₹199 lifetime membership" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {[
            { icon: '🗄️', title: 'SQL Mastery Track', desc: 'Window functions, CTEs, subqueries, joins — from basics to advanced interview level.', color: '#0095ED' },
            { icon: '🐍', title: 'Python for Data', desc: 'Pandas, NumPy, data cleaning, EDA and visualisation using real datasets.', color: '#3776AB' },
            { icon: '📊', title: 'Power BI & Excel', desc: 'Dashboards, DAX, pivot tables and reporting — tools companies actually use.', color: '#F2C811' },
            { icon: '🏆', title: 'Verified Certificates', desc: 'Course certificates with credential IDs, shareable directly to LinkedIn.', color: '#5CC8A0' },
            { icon: '💼', title: '300+ Job Listings', desc: 'Hand-curated openings at Flipkart, Swiggy, Razorpay, Meesho, PhonePe and more.', color: '#E8A838' },
            { icon: '📄', title: 'Resume & Mock Prep', desc: 'Personalised resume reviews and live mock interviews with structured feedback.', color: '#F07B6A' },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${f.color}22`,
              borderRadius: 16, padding: '1.2rem 1.3rem',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: f.color, borderRadius: '3px 0 0 3px', opacity: 0.7 }} />
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${f.color}18`, border: `1px solid ${f.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="💬" label="What Students Say" sub="Real results, real placements" />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { name: 'Priya S.', role: 'Data Analyst', text: 'The SQL problems here are exactly what I was asked in my Flipkart interview. Got an offer within 3 months of joining Datamyze.', color: '#5CC8A0', avatar: 'PS' },
            { name: 'Rahul M.', role: 'Analytics Engineer', text: 'The real-world examples made everything click. The cohort analysis module alone landed me 2 interviews in the same week.', color: '#7F77DD', avatar: 'RM' },
            { name: 'Ananya K.', role: 'BI Developer', text: 'Best investment I made. The course content is way ahead of any YouTube tutorial — it teaches you how companies actually use data.', color: '#38bdf8', avatar: 'AK' },
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
          FAQ
      ════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <SectionHeader icon="❓" label="Frequently Asked Questions" sub="Quick answers to what most people ask before joining" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FAQItem
            q="Is ₹199 really a one-time payment with no hidden fees?"
            a="Yes, 100%. You pay ₹199 once and get lifetime access to everything — all courses, job listings, mentorship sessions, certificates, and future updates. No subscription, no renewal, no surprise charges."
            color="#5CC8A0"
            delay={0}
          />
          <FAQItem
            q="Do I need prior data or coding experience to start?"
            a="Not at all. Our SQL and Python tracks start from absolute zero. If you know what a spreadsheet is, you're ready. We've designed every module to be beginner-friendly while still being interview-ready."
            color="#4A90D9"
            delay={80}
          />
          <FAQItem
            q="How does 1:1 mentorship actually work?"
            a="Once you're a Pro member, you can book live video sessions with our mentors. Sessions cover anything from course doubts and mock interviews to resume feedback and career planning. You schedule at your convenience."
            color="#a78bfa"
            delay={160}
          />
          <FAQItem
            q="What kind of jobs are in the 300+ listings?"
            a="All roles are hand-curated for data careers — Data Analyst, BI Analyst, BI Engineer, Product Analyst, Analytics Engineer, and more. We focus on Indian companies: Flipkart, Swiggy, Meesho, Razorpay, PhonePe, and funded startups."
            color="#E8A838"
            delay={240}
          />
          <FAQItem
            q="How is Datamyze different from free YouTube tutorials?"
            a="YouTube teaches concepts. Datamyze gets you hired. We focus on company-specific interview problems, structured roadmaps, hands-on projects for your portfolio, and active placement support — things no free tutorial can give you."
            color="#F07B6A"
            delay={320}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <div style={{
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
          Join Datamyze Pro for ₹199 — one payment, lifetime access. Start learning today, get placed tomorrow.
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
          >👑 Go Pro — ₹199</a>
        </div>
      </div>

      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes shimmer { from { left: -100%; } to { left: 100%; } }
      `}</style>
    </div>
  );
}
