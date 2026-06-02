import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COURSES = [
  { icon: '🗄️', title: 'SQL for Data Analysis',       desc: 'Write real queries used at Flipkart, Swiggy & more' },
  { icon: '🐍', title: 'Python for Analytics',         desc: 'Pandas, NumPy, real datasets — job-ready fast' },
  { icon: '📊', title: 'Statistics & A/B Testing',     desc: 'Probability, hypothesis testing, business decisions' },
  { icon: '📈', title: 'Tableau for Analysts',         desc: 'Build dashboards that get you hired' },
  { icon: '💡', title: 'Power BI',                     desc: 'India\'s most in-demand BI tool — master it' },
  { icon: '📋', title: 'Excel & Google Sheets',        desc: 'Power functions, pivot tables, dashboards' },
  { icon: '🔍', title: 'Advanced SQL',                 desc: 'Window functions, CTEs, query optimisation' },
];

const FEATURES = [
  { icon: '🎯', text: '300+ curated job listings — updated daily' },
  { icon: '🧑‍💼', text: '1:1 live mentorship with industry experts' },
  { icon: '📝', text: 'Mock interviews + resume review' },
  { icon: '🏆', text: 'Verified certificates ready for LinkedIn' },
  { icon: '💻', text: '500+ practice problems with instant feedback' },
  { icon: '♾️', text: 'Lifetime access — pay once, learn forever' },
];

export default function Instagram() {
  const navigate = useNavigate();
  const ctaRef  = useRef(null);

  // Track UTM source
  useEffect(() => {
    document.title = 'Datamyze — Master Data. Get Placed.';
    window.scrollTo(0, 0);
  }, []);

  const goSignup = () => navigate('/signup');

  return (
    <div style={{
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      background: 'linear-gradient(160deg, #03060f 0%, #070e20 100%)',
      minHeight: '100vh', color: '#e2e8f0',
      overflowX: 'hidden',
    }}>

      {/* ── TOP NAV ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(3,6,15,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0.75rem 1.2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Data</span>
          <span style={{ color: '#22d3ee', fontWeight: 900 }}>myze</span>
        </div>
        <button onClick={goSignup} style={{
          background: 'linear-gradient(135deg, #E8A838, #F07B6A)',
          border: 'none', borderRadius: 20, padding: '0.45rem 1.1rem',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          Start Free →
        </button>
      </div>

      {/* ── HERO ── */}
      <div style={{ padding: '2.8rem 1.4rem 2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(34,211,238,0.1)',
          border: '1px solid rgba(34,211,238,0.25)',
          borderRadius: 20, padding: '4px 14px',
          fontSize: 12, fontWeight: 700, color: '#22d3ee',
          letterSpacing: 1, marginBottom: '1.2rem',
        }}>
          🚀 2000+ STUDENTS LEARNING
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 8vw, 44px)',
          fontWeight: 900, letterSpacing: '-1.5px',
          lineHeight: 1.1, margin: '0 0 0.6rem',
          color: '#fff',
        }}>
          Master Data.<br />
          <span style={{
            background: 'linear-gradient(135deg, #F5C842, #E8A838, #F07B6A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Get Placed.</span>
        </h1>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.50)',
          lineHeight: 1.6, maxWidth: 340, margin: '0 auto 2rem',
        }}>
          SQL, Python, Tableau, Power BI & more — everything you need to land a data job in India.
        </p>

        {/* Price pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14, padding: '0.7rem 1.4rem',
          marginBottom: '1.4rem',
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#E8A838' }}>₹199</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹999</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#5CC8A0' }}>80% OFF · Lifetime</div>
          </div>
        </div>

        <br />
        <button ref={ctaRef} onClick={goSignup} style={{
          background: 'linear-gradient(135deg, #E8A838 0%, #F07B6A 100%)',
          border: 'none', borderRadius: 14, padding: '0.95rem 2.2rem',
          color: '#fff', fontSize: 17, fontWeight: 800,
          cursor: 'pointer', letterSpacing: '-0.3px',
          boxShadow: '0 8px 28px rgba(232,168,56,0.40)',
          width: '100%', maxWidth: 320,
        }}>
          Get Lifetime Access — ₹199 🎯
        </button>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: '0.6rem' }}>
          One-time payment · No subscription · No hidden fees
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 0,
        margin: '0 1.4rem 2.5rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {[
          { val: '2000+', label: 'Students' },
          { val: '7+',    label: 'Courses' },
          { val: '500+',  label: 'Problems' },
          { val: '300+',  label: 'Jobs' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '1rem 0.5rem', textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#22d3ee', letterSpacing: '-0.5px' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── COURSES ── */}
      <div style={{ padding: '0 1.4rem 2.5rem' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.30)',
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem',
          textAlign: 'center',
        }}>
          WHAT YOU'LL LEARN
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {COURSES.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '0.85rem 1rem',
            }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{
        margin: '0 1.4rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.10), rgba(34,211,238,0.06))',
        border: '1px solid rgba(108,99,255,0.20)',
        borderRadius: 18, padding: '1.5rem 1.2rem',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.30)',
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.2rem',
          textAlign: 'center',
        }}>
          EVERYTHING INCLUDED
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING CARD ── */}
      <div style={{
        margin: '0 1.4rem 2.5rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(232,168,56,0.25)',
        borderRadius: 20, padding: '1.8rem 1.4rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: '0.5rem' }}>
          LIMITED TIME OFFER
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 10, marginBottom: '0.4rem' }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: '#E8A838', letterSpacing: '-2px' }}>₹199</span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>₹999</span>
        </div>
        <div style={{ fontSize: 13, color: '#5CC8A0', fontWeight: 700, marginBottom: '1.4rem' }}>
          One-time payment · Lifetime access
        </div>
        <button onClick={goSignup} style={{
          background: 'linear-gradient(135deg, #E8A838 0%, #F07B6A 100%)',
          border: 'none', borderRadius: 14, padding: '1rem 2rem',
          color: '#fff', fontSize: 17, fontWeight: 800,
          cursor: 'pointer', width: '100%',
          boxShadow: '0 8px 28px rgba(232,168,56,0.35)',
        }}>
          🎯 Start Learning Now
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: '0.75rem' }}>
          Join 2000+ students already learning on Datamyze
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        textAlign: 'center', padding: '1.5rem 1.4rem 3rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: '0.4rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Data</span>
          <span style={{ color: '#22d3ee', fontWeight: 900 }}>myze</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          Master Data. Master Your Future.
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '0.8rem 1.2rem',
        background: 'rgba(3,6,15,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        zIndex: 200,
      }}>
        <button onClick={goSignup} style={{
          background: 'linear-gradient(135deg, #E8A838 0%, #F07B6A 100%)',
          border: 'none', borderRadius: 12, padding: '0.85rem',
          color: '#fff', fontSize: 16, fontWeight: 800,
          cursor: 'pointer', width: '100%',
          boxShadow: '0 4px 20px rgba(232,168,56,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>Get Lifetime Access</span>
          <span style={{
            background: 'rgba(255,255,255,0.22)', borderRadius: 20,
            padding: '2px 10px', fontSize: 14, fontWeight: 900,
          }}>₹199</span>
        </button>
      </div>

    </div>
  );
}
