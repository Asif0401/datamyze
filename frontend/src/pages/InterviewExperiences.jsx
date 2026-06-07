import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';
import CompanyLogo from '../components/CompanyLogo';

// ── Company colour map ───────────────────────────────────────────────
const COMPANY_COLORS = {
  Flipkart:            { bg: 'rgba(40,116,240,0.15)',   border: 'rgba(40,116,240,0.35)',   text: '#2874F0',  emoji: '🛒' },
  'Amazon India':      { bg: 'rgba(255,153,0,0.15)',    border: 'rgba(255,153,0,0.35)',    text: '#FF9900',  emoji: '📦' },
  Amazon:              { bg: 'rgba(255,153,0,0.15)',    border: 'rgba(255,153,0,0.35)',    text: '#FF9900',  emoji: '📦' },
  Swiggy:              { bg: 'rgba(252,128,25,0.15)',   border: 'rgba(252,128,25,0.35)',   text: '#FC8019',  emoji: '🍔' },
  Zomato:              { bg: 'rgba(226,55,68,0.15)',    border: 'rgba(226,55,68,0.35)',    text: '#E23744',  emoji: '🍕' },
  PhonePe:             { bg: 'rgba(95,37,159,0.15)',    border: 'rgba(95,37,159,0.35)',    text: '#5F259F',  emoji: '💸' },
  Razorpay:            { bg: 'rgba(41,98,255,0.15)',    border: 'rgba(41,98,255,0.35)',    text: '#2962FF',  emoji: '💳' },
  Meesho:              { bg: 'rgba(139,92,246,0.15)',   border: 'rgba(139,92,246,0.35)',   text: '#8B5CF6',  emoji: '🛍️' },
  CRED:                { bg: 'rgba(0,200,83,0.12)',     border: 'rgba(0,200,83,0.30)',     text: '#00C853',  emoji: '💎' },
  Dream11:             { bg: 'rgba(26,115,232,0.15)',   border: 'rgba(26,115,232,0.35)',   text: '#1A73E8',  emoji: '🏏' },
  Nykaa:               { bg: 'rgba(252,39,121,0.15)',   border: 'rgba(252,39,121,0.35)',   text: '#FC2779',  emoji: '💄' },
  Paytm:               { bg: 'rgba(0,186,242,0.15)',    border: 'rgba(0,186,242,0.35)',    text: '#00BAF2',  emoji: '💰' },
  Google:              { bg: 'rgba(66,133,244,0.15)',   border: 'rgba(66,133,244,0.35)',   text: '#4285F4',  emoji: '🔍' },
  'Google India':      { bg: 'rgba(66,133,244,0.15)',   border: 'rgba(66,133,244,0.35)',   text: '#4285F4',  emoji: '🔍' },
  'Walmart Global Tech': { bg: 'rgba(0,113,206,0.15)', border: 'rgba(0,113,206,0.35)',   text: '#0071CE',  emoji: '🏪' },
  MakeMyTrip:          { bg: 'rgba(231,76,60,0.15)',    border: 'rgba(231,76,60,0.35)',    text: '#E74C3C',  emoji: '✈️' },
  Ola:                 { bg: 'rgba(255,205,0,0.15)',    border: 'rgba(255,205,0,0.35)',    text: '#FFCD00',  emoji: '🚗' },
};
const DEFAULT_COMPANY_COLOR = { bg: 'rgba(74,144,217,0.15)', border: 'rgba(74,144,217,0.35)', text: '#4A90D9', emoji: '🏢' };

function getCompanyStyle(company) {
  return COMPANY_COLORS[company] || DEFAULT_COMPANY_COLOR;
}
function getCompanyEmoji(company) {
  return (COMPANY_COLORS[company] || DEFAULT_COMPANY_COLOR).emoji;
}
function getInitials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
}

// ── Badge configs ────────────────────────────────────────────────────
const OUTCOME_CONFIG = {
  Selected:  { color: '#5CC8A0', bg: 'rgba(92,200,160,0.15)',  border: 'rgba(92,200,160,0.35)',  icon: '✓' },
  Rejected:  { color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.35)', icon: '✗' },
  'On-hold': { color: '#E8A838', bg: 'rgba(232,168,56,0.15)',  border: 'rgba(232,168,56,0.35)',  icon: '⏸' },
};
const DIFFICULTY_CONFIG = {
  Easy:   { color: '#5CC8A0', bg: 'rgba(92,200,160,0.12)',  border: 'rgba(92,200,160,0.25)'  },
  Medium: { color: '#E8A838', bg: 'rgba(232,168,56,0.12)',  border: 'rgba(232,168,56,0.25)'  },
  Hard:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
};

function OutcomeBadge({ outcome, small }) {
  const cfg = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG['On-hold'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: small ? 10 : 11, fontWeight: 700, padding: small ? '2px 7px' : '3px 9px',
      borderRadius: 99,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.icon} {outcome}
    </span>
  );
}
function DifficultyBadge({ difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>{difficulty}</span>
  );
}
function TypeBadge({ type }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
      color: '#38bdf8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.28)',
    }}>{type}</span>
  );
}

// ── Format date ──────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '';
  // YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [y, m] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  }
  return dateStr;
}

// ── Truncate text ────────────────────────────────────────────────────
function truncate(text, len = 160) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
}

// ── Parse JSON rounds ────────────────────────────────────────────────
function parseRounds(rounds_detail) {
  if (!rounds_detail) return [];
  if (Array.isArray(rounds_detail)) return rounds_detail;
  try { return JSON.parse(rounds_detail); } catch { return []; }
}

// ──────────────────────────────────────────────────────────────────────
// Submit Modal
// ──────────────────────────────────────────────────────────────────────
function SubmitModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    company: '', role: '', experience_type: 'Off-campus', difficulty: 'Medium',
    outcome: 'Selected', rounds: 1, overall_experience: '', tips: '',
    interview_date: '',
  });
  const [roundsDetail, setRoundsDetail] = useState([{ round_name: '', description: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function setRound(i, field, val) {
    setRoundsDetail(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }
  function addRound() {
    if (roundsDetail.length < 8) setRoundsDetail(prev => [...prev, { round_name: '', description: '' }]);
  }
  function removeRound(i) {
    if (roundsDetail.length > 1) setRoundsDetail(prev => prev.filter((_, idx) => idx !== i));
  }

  // Sync round count with rounds number
  useEffect(() => {
    const n = Math.max(1, Math.min(8, parseInt(form.rounds) || 1));
    setRoundsDetail(prev => {
      if (prev.length < n) return [...prev, ...Array(n - prev.length).fill({ round_name: '', description: '' })];
      if (prev.length > n) return prev.slice(0, n);
      return prev;
    });
  }, [form.rounds]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.company.trim()) { setError('Company name is required'); return; }
    if (!form.role.trim()) { setError('Role is required'); return; }
    if (form.overall_experience.length < 50) { setError('Overall experience must be at least 50 characters'); return; }

    setSubmitting(true);
    try {
      await api.post('/interviews', {
        ...form,
        rounds: parseInt(form.rounds) || 1,
        rounds_detail: roundsDetail,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 4, display: 'block' };
  const fieldStyle = { marginBottom: '1rem' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 'clamp(0.75rem,3vw,1.5rem)',
      paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
      overflowY: 'auto',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 600,
        background: 'linear-gradient(145deg, #0d1117, #0a0f1a)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(56,189,248,0.2), 0 32px 80px rgba(0,0,0,0.7)',
        marginBottom: '2rem',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(99,102,241,0.1))',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          padding: '1.4rem 1.6rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Share Your Experience</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Help others prepare for their interviews</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: 32, height: 32, color: 'rgba(255,255,255,0.5)',
            fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.4rem 1.6rem' }}>
          {/* Company + Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Company *</label>
              <input style={inputStyle} placeholder="e.g. Flipkart" value={form.company}
                onChange={e => set('company', e.target.value)} required
                onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Role *</label>
              <input style={inputStyle} placeholder="e.g. Data Analyst" value={form.role}
                onChange={e => set('role', e.target.value)} required
                onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
            </div>
          </div>

          {/* Experience type + Difficulty + Outcome */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {[
              { field: 'experience_type', label: 'How did you apply?', opts: ['Off-campus','On-campus','Referral','LinkedIn','Walk-in'] },
              { field: 'difficulty',      label: 'Difficulty',         opts: ['Easy','Medium','Hard'] },
              { field: 'outcome',         label: 'Outcome',            opts: ['Selected','Rejected','On-hold'] },
            ].map(({ field, label, opts }) => (
              <div key={field}>
                <label style={labelStyle}>{label}</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form[field]}
                  onChange={e => set(field, e.target.value)}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Rounds count + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Number of Rounds (1–8)</label>
              <input style={inputStyle} type="number" min={1} max={8} value={form.rounds}
                onChange={e => set('rounds', e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
            </div>
            <div>
              <label style={labelStyle}>Interview Month/Year</label>
              <input style={inputStyle} type="month" value={form.interview_date}
                onChange={e => set('interview_date', e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
            </div>
          </div>

          {/* Round details */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...labelStyle, marginBottom: 8 }}>Round Details</label>
            {roundsDetail.map((round, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '0.9rem', marginBottom: '0.7rem', position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.4)',
                    color: '#38bdf8', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{i + 1}</span>
                  <input
                    style={{ ...inputStyle, marginBottom: 0 }}
                    placeholder={`Round name (e.g. "Technical Round 1")`}
                    value={round.round_name}
                    onChange={e => setRound(i, 'round_name', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  />
                  {roundsDetail.length > 1 && (
                    <button type="button" onClick={() => removeRound(i)} style={{
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                      borderRadius: 8, color: '#f87171', fontSize: 12, cursor: 'pointer',
                      padding: '4px 8px', flexShrink: 0,
                    }}>✕</button>
                  )}
                </div>
                <textarea
                  style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                  placeholder="Describe the questions asked, topics covered, difficulty level..."
                  value={round.description}
                  onChange={e => setRound(i, 'description', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
              </div>
            ))}
            {roundsDetail.length < 8 && (
              <button type="button" onClick={addRound} style={{
                background: 'rgba(56,189,248,0.08)', border: '1px dashed rgba(56,189,248,0.3)',
                borderRadius: 10, color: '#38bdf8', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', padding: '8px 14px', width: '100%',
              }}>+ Add Round</button>
            )}
          </div>

          {/* Overall experience */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Overall Experience * <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(min 50 chars)</span></label>
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              placeholder="Share your overall interview journey — how the process went, what the interviewers were like, how long the process took, whether the offer was good, etc."
              value={form.overall_experience}
              onChange={e => set('overall_experience', e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            />
            <div style={{ fontSize: 11, color: form.overall_experience.length < 50 ? '#f87171' : '#5CC8A0', marginTop: 3, textAlign: 'right' }}>
              {form.overall_experience.length} chars {form.overall_experience.length < 50 ? `(need ${50 - form.overall_experience.length} more)` : ''}
            </div>
          </div>

          {/* Tips */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Tips for Future Candidates <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              placeholder="What would you tell someone preparing for this interview? Key topics, resources, common mistakes to avoid..."
              value={form.tips}
              onChange={e => set('tips', e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: '1rem',
              fontSize: 13, color: '#f87171',
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{
              flex: 2, padding: '12px', borderRadius: 12,
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              opacity: submitting ? 0.7 : 1, transition: 'opacity .2s',
            }}>
              {submitting ? 'Submitting...' : '🎙️ Submit Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Detail View
// ──────────────────────────────────────────────────────────────────────
function DetailView({ exp, onBack, onUpvote }) {
  const [upvoting, setUpvoting] = useState(false);
  const [upvotes, setUpvotes] = useState(exp.upvotes || 0);
  const rounds = parseRounds(exp.rounds_detail);
  const cs = getCompanyStyle(exp.company);

  async function handleUpvote() {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const { data } = await api.post(`/interviews/${exp.id}/upvote`);
      setUpvotes(data.upvotes);
      if (onUpvote) onUpvote(exp.id, data.upvotes);
    } catch {}
    setUpvoting(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', animation: 'fadeInUp 0.3s ease' }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.7)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem',
        transition: 'all .2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(28,36,68,0.95)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,27,56,0.80)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      >
        ← Back to Experiences
      </button>

      {/* Header card */}
      <div style={{
        background: `linear-gradient(135deg, , rgba(20,27,56,0.92))`,
        border: `1px solid ${cs.border}`,
        borderRadius: 20, padding: '1.6rem', marginBottom: '1.2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <CompanyLogo company={exp.company} size={56} radius={14} color={cs.text} bg={cs.bg} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>{exp.company}</h1>
              <OutcomeBadge outcome={exp.outcome} />
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 8 }}>{exp.role}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {exp.interview_date && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>📅 {fmtDate(exp.interview_date)}</span>
              )}
              <TypeBadge type={exp.experience_type} />
              <DifficultyBadge difficulty={exp.difficulty} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                🔄 {exp.rounds} round{exp.rounds > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button onClick={handleUpvote} disabled={upvoting} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'rgba(92,200,160,0.1)', border: '1px solid rgba(92,200,160,0.3)',
            borderRadius: 12, padding: '10px 14px', color: '#5CC8A0',
            cursor: 'pointer', fontSize: 18, fontWeight: 700,
            transition: 'all .2s', opacity: upvoting ? 0.7 : 1, flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(92,200,160,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(92,200,160,0.1)'; }}
          >
            <span>▲</span>
            <span style={{ fontSize: 12 }}>{upvotes}</span>
          </button>
        </div>
      </div>

      {/* Overall Experience */}
      <div style={{
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: '1.4rem', marginBottom: '1.2rem',
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💬</span> Overall Experience
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
          {exp.overall_experience}
        </p>
      </div>

      {/* Interview Rounds */}
      {rounds.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '1.4rem', marginBottom: '1.2rem',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🔄</span> Interview Rounds ({rounds.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {rounds.map((round, i) => (
              <div key={i} style={{
                background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 12, padding: '1rem 1.1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.4)',
                    color: '#38bdf8', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    {round.round_name || `Round ${i + 1}`}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>
                  {round.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {exp.tips && (
        <div style={{
          background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.2)',
          borderRadius: 16, padding: '1.4rem', marginBottom: '1.2rem',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>💡</span> Tips for Future Candidates
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
            {exp.tips}
          </p>
        </div>
      )}

      {/* Author */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14, padding: '1rem 1.2rem',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: '#fff',
        }}>{getInitials(exp.author_name)}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{exp.author_name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            ✓ Verified Datamyze User {exp.created_at ? `· ${new Date(exp.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Experience Card
// ──────────────────────────────────────────────────────────────────────
function ExpCard({ exp, onClick }) {
  const cs = getCompanyStyle(exp.company);
  const outcomeColor = exp.outcome === 'Selected' ? '#5CC8A0' : exp.outcome === 'Rejected' ? '#f87171' : '#E8A838';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.09)',
        border: `1px solid ${cs.border}`,
        borderTop: `2.5px solid ${cs.text}`,
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.2s ease', animation: 'fadeInUp 0.35s ease both',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.50), 0 0 0 1px ${cs.border}`;
        e.currentTarget.style.background = 'rgba(28,36,68,0.95)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)';
        e.currentTarget.style.background = 'rgba(20,27,56,0.92)';
      }}
    >
      {/* Coloured company header strip */}
      <div style={{ background: `linear-gradient(135deg, ${cs.bg}, rgba(20,27,56,0.60))`, padding: '1rem 1.2rem', borderBottom: `1px solid ${cs.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CompanyLogo company={exp.company} size={44} radius={12} color={cs.text} bg={cs.bg} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{exp.company}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.role}</div>
          </div>
          {/* Outcome pill */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: `${outcomeColor}18`, border: `1px solid ${outcomeColor}35`, color: outcomeColor }}>{exp.outcome}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <TypeBadge type={exp.experience_type} />
          <DifficultyBadge difficulty={exp.difficulty} />
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>🔄 {exp.rounds} rounds</span>
          {exp.interview_date && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)' }}>📅 {fmtDate(exp.interview_date)}</span>}
        </div>

        {/* Excerpt */}
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, margin: '0 0 10px', flex: 1 }}>
          {truncate(exp.overall_experience)}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8, marginTop: 'auto' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${cs.text}80, ${cs.text}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', border: `1px solid ${cs.border}` }}>{getInitials(exp.author_name)}</div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{exp.author_name}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#5CC8A0', fontWeight: 700 }}>▲ {exp.upvotes || 0}</span>
            <span style={{ fontSize: 11, color: cs.text, fontWeight: 700 }}>Read →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────
export default function InterviewExperiences() {
  const { user } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeExp, setActiveExp]     = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');

  // Filters
  const [companyFilter, setCompanyFilter]   = useState('');
  const [roleFilter, setRoleFilter]         = useState('');
  const [outcomeFilter, setOutcomeFilter]   = useState('All');
  const [typeFilter, setTypeFilter]         = useState('All');

  useEffect(() => { fetchExperiences(); }, []);

  async function fetchExperiences() {
    setLoading(true);
    try {
      const params = {};
      if (companyFilter) params.company = companyFilter;
      if (roleFilter)    params.role    = roleFilter;
      if (outcomeFilter !== 'All') params.outcome = outcomeFilter;
      if (typeFilter !== 'All')    params.type    = typeFilter;
      const { data } = await api.get('/interviews', { params });
      setExperiences(data.experiences || []);
    } catch (err) {
      console.error('Failed to load experiences:', err);
    } finally {
      setLoading(false);
    }
  }

  // Derived stats
  const companies  = [...new Set(experiences.map(e => e.company))];
  const roles      = [...new Set(experiences.map(e => e.role))];
  const totalSelected = experiences.filter(e => e.outcome === 'Selected').length;
  const selectRate = experiences.length > 0 ? Math.round((totalSelected / experiences.length) * 100) : 0;

  // Client-side filter (supplemental — server already does heavy filtering)
  const filtered = experiences.filter(e => {
    const cMatch = !companyFilter || e.company.toLowerCase().includes(companyFilter.toLowerCase());
    const rMatch = !roleFilter    || e.role.toLowerCase().includes(roleFilter.toLowerCase());
    const oMatch = outcomeFilter === 'All' || e.outcome === outcomeFilter;
    const tMatch = typeFilter === 'All'    || e.experience_type === typeFilter;
    return cMatch && rMatch && oMatch && tMatch;
  });

  function handleUpvote(id, newCount) {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, upvotes: newCount } : e));
  }

  function handleSubmitSuccess() {
    setShowModal(false);
    setSuccessMsg('Your experience has been shared! Thank you for helping the community.');
    fetchExperiences();
    setTimeout(() => setSuccessMsg(''), 5000);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loading"><div className="spinner" />Loading experiences...</div>
      </div>
    );
  }

  // Detail view
  if (activeExp) {
    return (
      <div style={{ padding: 'clamp(1rem,3vw,2rem)', maxWidth: 1100, margin: '0 auto' }}>
        <DetailView
          exp={activeExp}
          onBack={() => setActiveExp(null)}
          onUpvote={handleUpvote}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(1rem,3vw,2rem)', maxWidth: 1100, margin: '0 auto', animation: 'fadeInUp 0.4s ease' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.6rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎙️</span>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #6366f1 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Interview Experiences</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Real interview experiences shared by the Datamyze community
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            border: 'none', borderRadius: 12, padding: '11px 18px',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(56,189,248,0.3)',
            transition: 'all .2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(56,189,248,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(56,189,248,0.3)'; }}
        >
          + Share Your Experience
        </button>
      </div>

      {/* ── Success message ── */}
      {successMsg && (
        <div style={{
          background: 'rgba(92,200,160,0.1)', border: '1px solid rgba(92,200,160,0.3)',
          borderRadius: 12, padding: '12px 16px', marginBottom: '1.2rem',
          fontSize: 13, color: '#5CC8A0', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ {successMsg}
        </div>
      )}

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.8rem', marginBottom: '1.6rem' }}>
        {[
          { icon: '🎙️', val: experiences.length, lbl: 'Experiences',       color: '#38bdf8' },
          { icon: '🏢', val: companies.length,    lbl: 'Companies',         color: '#6366f1' },
          { icon: '💼', val: roles.length,        lbl: 'Roles',             color: '#a78bfa' },
          { icon: '✅', val: `${selectRate}%`,    lbl: 'Selection Rate',    color: '#5CC8A0' },
        ].map((s, i) => (
          <div key={s.lbl} style={{
            background: 'rgba(255,255,255,0.08)', border: `1px solid ${s.color}28`,
            borderRadius: 14, padding: '1rem', textAlign: 'center',
            animation: `popIn 0.35s ${i * 0.07}s ease both`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16, padding: '1rem 1.2rem', marginBottom: '1.4rem',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
          {/* Company search */}
          <input
            placeholder="Search company..."
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10, fontSize: 13,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', outline: 'none', minWidth: 150, flex: '1 1 140px',
            }}
          />
          {/* Role search */}
          <input
            placeholder="Search role..."
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10, fontSize: 13,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', outline: 'none', minWidth: 140, flex: '1 1 130px',
            }}
          />
          {/* Outcome pills */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['All', 'Selected', 'Rejected', 'On-hold'].map(o => {
              const cfg = o === 'All' ? null : OUTCOME_CONFIG[o];
              const active = outcomeFilter === o;
              return (
                <button key={o} onClick={() => setOutcomeFilter(o)} style={{
                  padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: `1px solid ${active && cfg ? cfg.border : 'rgba(255,255,255,0.12)'}`,
                  background: active && cfg ? cfg.bg : (active ? 'rgba(255,255,255,0.1)' : 'transparent'),
                  color: active && cfg ? cfg.color : (active ? '#fff' : 'rgba(255,255,255,0.45)'),
                  transition: 'all .15s',
                }}>{o}</button>
              );
            })}
          </div>
          {/* Type pills */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['All', 'Off-campus', 'On-campus', 'Referral', 'LinkedIn', 'Walk-in'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${typeFilter === t ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)'}`,
                background: typeFilter === t ? 'rgba(56,189,248,0.12)' : 'transparent',
                color: typeFilter === t ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                transition: 'all .15s',
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cards grid ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎙️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No experiences found</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
            {experiences.length === 0 ? 'Be the first to share your interview experience!' : 'Try adjusting your filters.'}
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            border: 'none', borderRadius: 12, padding: '11px 22px',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>+ Share Your Experience</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(exp => (
            <ExpCard key={exp.id} exp={exp} onClick={() => setActiveExp(exp)} />
          ))}
        </div>
      )}

      {/* ── FAB — mobile share button ── */}
      <button
        onClick={() => setShowModal(true)}
        title="Share your interview experience"
        style={{
          position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
          border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(56,189,248,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >+</button>

      {/* ── Submit Modal ── */}
      {showModal && (
        <SubmitModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
