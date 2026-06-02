import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const STATUS_OPTIONS = [
  { id: 'Student',              icon: '🎓', label: 'Student',              desc: 'Currently in college / university' },
  { id: 'Fresher',              icon: '🌱', label: 'Fresher',              desc: 'Graduated, looking for first job' },
  { id: 'Working Professional', icon: '💼', label: 'Working Professional', desc: 'Currently employed' },
  { id: 'Career Switcher',      icon: '🔄', label: 'Career Switcher',      desc: 'Transitioning into data analytics' },
];

const EXPERIENCE_OPTIONS = [
  { id: '0', label: 'Fresher' },
  { id: '1', label: '< 1 yr'  },
  { id: '2', label: '1–2 yrs' },
  { id: '3', label: '3–5 yrs' },
  { id: '5', label: '5+ yrs'  },
];

const TARGET_ROLES = [
  'Data Analyst', 'Business Analyst', 'Data Scientist',
  'Data Engineer', 'Product Analyst', 'SQL Developer',
  'BI Developer', 'Other',
];

export default function ProfileCompletion() {
  const { user, refreshUser } = useAuth();

  const [status,     setStatus]    = useState('');
  const [jobTitle,   setJobTitle]  = useState('');
  const [expYears,   setExpYears]  = useState('0');
  const [targetRole, setTarget]    = useState('');
  const [city,       setCity]      = useState('');
  const [phone,      setPhone]     = useState('');
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState('');

  const showPhone    = !user?.phone;
  const showJobTitle = status === 'Working Professional' || status === 'Career Switcher';

  async function handleSubmit() {
    if (!status) { setError('Please select your current status'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/complete-profile', {
        current_status:  status,
        job_title:       showJobTitle && jobTitle ? jobTitle : undefined,
        experience_years: expYears,
        target_role:     targetRole || undefined,
        location:        city       || undefined,
        phone:           showPhone && phone ? phone : undefined,
      });
      await refreshUser();
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Try again.');
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      await api.post('/auth/complete-profile', { current_status: 'Not specified' });
      await refreshUser();
    } catch (_) { setLoading(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(7,9,18,0.92)',
      backdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 'clamp(0.75rem, 3vw, 1.5rem)',
      paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
      paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
      overflowY: 'auto',
    }}>
      {/* Ambient glow blobs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%',  width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,144,217,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,0.10) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 560,
        background: 'rgba(255,255,255,0.042)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 24,
        backdropFilter: 'blur(28px)',
        padding: 'clamp(1.2rem, 4vw, 2.4rem) clamp(1rem, 4vw, 2.2rem)',
        animation: 'fadeInUp 0.45s ease both',
        position: 'relative',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ fontSize: 42, marginBottom: '0.4rem' }}>👋</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
            Welcome to Datamyze, {user?.name?.split(' ')[0]}!
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
            Help us personalise your learning path. Takes 30 seconds.
          </p>
          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, marginTop: '1.2rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: status ? (targetRole ? '90%' : '55%') : '15%', background: 'linear-gradient(90deg,#4A90D9,#a78bfa)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(240,123,106,0.12)', border: '1px solid rgba(240,123,106,0.30)', borderRadius: 10, padding: '9px 14px', color: '#F07B6A', fontSize: 13, marginBottom: '1.2rem', fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Status grid ── */}
        <div style={{ marginBottom: '1.4rem' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: '0.6rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Current Status <span style={{ color: '#F07B6A' }}>*</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s.id} onClick={() => { setStatus(s.id); setError(''); }} style={{
                padding: '10px 12px', borderRadius: 13, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                border: status === s.id ? '1.5px solid rgba(74,144,217,0.55)' : '1.5px solid rgba(255,255,255,0.08)',
                background: status === s.id ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'flex-start', gap: 9,
                boxShadow: status === s.id ? '0 0 0 3px rgba(74,144,217,0.10)' : 'none',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: status === s.id ? '#fff' : 'rgba(255,255,255,0.65)' }}>{s.label}</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.30)', marginTop: 1, lineHeight: 1.3 }}>{s.desc}</div>
                </div>
                {status === s.id && (
                  <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: '#4A90D9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 900 }}>✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Job title (conditional) ── */}
        {showJobTitle && (
          <div style={{ marginBottom: '1.2rem', animation: 'fadeInUp 0.25s ease' }}>
            <label style={labelStyle}>Current Job Title / Role</label>
            <input
              type="text"
              placeholder="e.g. Data Analyst at Flipkart"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {/* ── Two-column row: Experience + Target role ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.2rem' }}>
          <div>
            <label style={labelStyle}>Experience</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXPERIENCE_OPTIONS.map(e => (
                <button key={e.id} onClick={() => setExpYears(e.id)} style={{
                  padding: '6px 11px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s',
                  border: expYears === e.id ? '1.5px solid rgba(74,144,217,0.55)' : '1.5px solid rgba(255,255,255,0.08)',
                  background: expYears === e.id ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.04)',
                  color: expYears === e.id ? '#4A90D9' : 'rgba(255,255,255,0.45)',
                }}>{e.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Target Role</label>
            <select value={targetRole} onChange={e => setTarget(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select a role…</option>
              {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* ── City ── */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>City / Location</label>
          <input
            type="text"
            placeholder="e.g. Bangalore, Hyderabad, Mumbai"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* ── Phone (only if not already on profile) ── */}
        {showPhone && (
          <div style={{ marginBottom: '1.2rem', animation: 'fadeInUp 0.25s ease' }}>
            <label style={labelStyle}>
              Phone Number
              <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.28)', marginLeft: 5 }}>(optional, for WhatsApp updates)</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        )}

        {/* ── CTA ── */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 13, fontSize: 15, fontWeight: 800,
            background: loading ? 'rgba(74,144,217,0.30)' : 'linear-gradient(135deg,#4A90D9 0%,#6d6ffa 100%)',
            color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', marginTop: '0.4rem', letterSpacing: '0.2px',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(74,144,217,0.30)',
          }}
        >
          {loading ? 'Saving…' : '🚀 Save & Start Learning →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
          <button
            onClick={handleSkip}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
          >
            Skip for now. I'll fill this in later.
          </button>
        </div>

        {/* Trust note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1rem', fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          <span>🔒</span>
          <span>Your info is private and used only to personalise your experience.</span>
        </div>
      </div>
    </div>
  );
}

/* ── Shared mini-styles ─────────────────────────── */
const labelStyle = {
  display: 'block',
  fontSize: 11.5,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.50)',
  marginBottom: '0.4rem',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 11,
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.09)',
  color: '#fff',
  fontSize: 13.5,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};
