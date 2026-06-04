import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const SKILL_LEVELS = [
  { id: 'beginner',     icon: '🌱', label: 'Complete Beginner',     desc: 'Never written SQL before' },
  { id: 'basics',       icon: '📚', label: 'Know the basics',        desc: 'SELECT, WHERE, basic JOINs' },
  { id: 'intermediate', icon: '💪', label: 'Intermediate',           desc: 'GROUP BY, subqueries, some functions' },
  { id: 'advanced',     icon: '🚀', label: 'Advanced',               desc: 'Window functions, CTEs, optimization' },
];

const GOALS = [
  { id: 'first_job',  icon: '💼', label: 'Land my first Data Analyst job',       color: '#4A90D9' },
  { id: 'switch',     icon: '🔄', label: 'Switch careers into data analytics',   color: '#a78bfa' },
  { id: 'improve',    icon: '📈', label: 'Improve my current data skills',        color: '#5CC8A0' },
  { id: 'interviews', icon: '🎯', label: 'Crack specific company interviews',     color: '#E8A838' },
];

// Recommended starting point per skill + goal combination
function getRecommendation(skill, goal) {
  if (skill === 'beginner' || skill === 'basics') {
    return {
      path: '/courses',
      label: 'Start with SQL for Data Analysis →',
      desc: 'Begin from the basics. Master SELECT, JOINs, GROUP BY and window functions — all the patterns companies actually test.',
      color: '#4A90D9',
    };
  }
  if (goal === 'interviews' || goal === 'first_job' || goal === 'switch') {
    return {
      path: '/problems',
      label: 'Jump into Interview Problems →',
      desc: 'You have the foundation. Now practice real SQL problems from Flipkart, Amazon & Zomato interview rounds.',
      color: '#5CC8A0',
    };
  }
  return {
    path: '/courses',
    label: 'Explore Advanced Courses →',
    desc: 'Take your skills further with Advanced SQL, Python for Analytics, Statistics and more.',
    color: '#a78bfa',
  };
}

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=welcome, 2=skill, 3=goal, 4=path
  const [skill, setSkill] = useState('');
  const [goal,  setGoal]  = useState('');
  const [saving, setSaving] = useState(false);

  async function finish(finalGoal) {
    setSaving(true);
    try {
      await api.post('/users/complete-onboarding', { skill_level: skill, learning_goal: finalGoal });
      if (refreshUser) await refreshUser();
    } catch (e) { /* non-fatal */ }
    setSaving(false);
    setGoal(finalGoal);
    setStep(4);
  }

  async function startLearning(path) {
    navigate(path);
  }

  const rec = step === 4 ? getRecommendation(skill, goal) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'linear-gradient(160deg, #0d1428 0%, #0a1020 100%)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(56,189,248,0.18), 0 32px 80px rgba(0,0,0,0.75)',
        animation: 'scaleIn 0.35s ease both',
      }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%',
            width: `${(step / 4) * 100}%`,
            background: 'linear-gradient(90deg, #4A90D9, #38bdf8)',
            transition: 'width 0.4s ease',
            borderRadius: 3,
          }} />
        </div>

        <div style={{ padding: '2rem 2.2rem 2.2rem' }}>

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <>
              <div style={{ fontSize: 40, marginBottom: '1rem', textAlign: 'center' }}>👋</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: '-0.5px', marginBottom: 8 }}>
                Welcome, {user?.name?.split(' ')[0]}!
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.7, marginBottom: '1.8rem' }}>
                Let's personalise your learning path so you know exactly where to start.<br/>
                This takes less than <strong style={{ color: 'rgba(255,255,255,0.65)' }}>30 seconds</strong>.
              </p>

              {/* What you'll get */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2rem' }}>
                {[
                  { icon: '🗺️', text: 'A personalised roadmap based on your level' },
                  { icon: '🎯', text: 'Exactly where to start — no confusion' },
                  { icon: '⚡', text: 'Faster path to your first data analyst job' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 14, background: 'linear-gradient(135deg, #4A90D9, #38bdf8)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(74,144,217,0.40)' }}>
                Let's go →
              </button>
            </>
          )}

          {/* Step 2 — Skill level */}
          {step === 2 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(56,189,248,0.70)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Step 1 of 2</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px', marginBottom: 6 }}>
                What's your current SQL level?
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: '1.4rem' }}>
                Be honest — we'll set the right starting point.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
                {SKILL_LEVELS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSkill(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                      border: `1px solid ${skill === s.id ? 'rgba(56,189,248,0.50)' : 'rgba(255,255,255,0.10)'}`,
                      background: skill === s.id ? 'rgba(56,189,248,0.10)' : 'rgba(255,255,255,0.04)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: skill === s.id ? '#38bdf8' : '#fff', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{s.desc}</div>
                    </div>
                    {skill === s.id && <span style={{ marginLeft: 'auto', color: '#38bdf8', fontSize: 18 }}>✓</span>}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!skill}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 14, background: skill ? 'linear-gradient(135deg,#4A90D9,#38bdf8)' : 'rgba(255,255,255,0.08)', border: 'none', color: skill ? '#fff' : 'rgba(255,255,255,0.30)', fontWeight: 800, fontSize: 15, cursor: skill ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                Continue →
              </button>
            </>
          )}

          {/* Step 3 — Goal */}
          {step === 3 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(167,139,250,0.70)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Step 2 of 2</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.4px', marginBottom: 6 }}>
                What's your main goal?
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: '1.4rem' }}>
                This helps us recommend the right resources.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => finish(g.id)}
                    disabled={saving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                      border: `1px solid ${g.color}28`,
                      background: `${g.color}0c`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${g.color}18`; e.currentTarget.style.borderColor = `${g.color}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${g.color}0c`; e.currentTarget.style.borderColor = `${g.color}28`; }}
                  >
                    <span style={{ fontSize: 22 }}>{g.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{g.label}</span>
                    <span style={{ marginLeft: 'auto', color: `${g.color}`, fontSize: 16 }}>→</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'center', padding: '6px' }}>
                ← Back
              </button>
            </>
          )}

          {/* Step 4 — Personalised path */}
          {step === 4 && rec && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>🎯</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>
                  Your path is ready!
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>
                  Based on your answers, here's exactly where to start.
                </p>
              </div>

              {/* Recommended path card */}
              <div style={{ background: `${rec.color}0d`, border: `1px solid ${rec.color}30`, borderTop: `3px solid ${rec.color}`, borderRadius: 16, padding: '1.4rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: rec.color, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Recommended for you</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px' }}>{rec.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65 }}>{rec.desc}</div>
              </div>

              {/* Quick wins */}
              <div style={{ marginBottom: '1.6rem' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.30)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Your first 3 actions</div>
                {[
                  skill === 'beginner' || skill === 'basics'
                    ? '📚 Complete SQL for Data Analysis — Lesson 1'
                    : '🎯 Solve 5 Easy SQL problems today',
                  '⚡ Take the SQL quiz to earn your first XP',
                  '🔥 Build a 7-day streak to climb the leaderboard',
                ].map((action, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#38bdf8', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{action}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => startLearning(rec.path)}
                style={{ width: '100%', padding: '0.95rem', borderRadius: 14, background: `linear-gradient(135deg, ${rec.color}, ${rec.color}cc)`, border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: `0 4px 20px ${rec.color}40` }}>
                {rec.label}
              </button>

              <button onClick={() => startLearning('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'center', padding: '8px', marginTop: 4 }}>
                Go to Dashboard instead
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
