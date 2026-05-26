import { useState } from 'react';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { label: '🐛 Technical Issue (App not working / Bug)',  value: 'Technical Issue (App not working / Bug)' },
  { label: '📚 Course Content Question',                  value: 'Course Content Question' },
  { label: '💳 Payment Issue',                            value: 'Payment Issue' },
  { label: '🎓 Certificate Problem',                      value: 'Certificate Problem' },
  { label: '🧠 Quiz Issue',                               value: 'Quiz Issue' },
  { label: '💼 Job Board Issue',                          value: 'Job Board Issue' },
  { label: '👤 Account / Profile Problem',                value: 'Account / Profile Problem' },
  { label: '💡 Feature Request',                          value: 'Feature Request' },
  { label: '📄 Resume Review Query',                      value: 'Resume Review Query' },
  { label: '📅 Session Booking Query',                    value: 'Session Booking Query' },
  { label: '🤝 Partnership / Collaboration',              value: 'Partnership / Collaboration' },
  { label: '❓ Other',                                    value: 'Other' },
];

const FAQS = [
  { q: 'How do I upgrade to Pro?',                 a: 'Go to Pro Hub in the sidebar and click "Get Pro Now". Pay via UPI or card — activation is instant after payment.' },
  { q: 'I paid but my account isn\'t activated.',  a: 'Usually resolves within minutes. If not, use the support form with "Payment Issue" as the category and share your transaction ID.' },
  { q: 'How do I get my certificate?',             a: 'Complete all lessons in a course. Certificates are issued automatically to Pro members and available in the Certificates page.' },
  { q: 'Can I book a 1:1 mentoring session?',      a: 'Yes! Go to Pro Hub → Sessions. Live sessions are available exclusively for Pro members.' },
  { q: 'My resume review is taking too long.',     a: 'Reviews are completed within 24 hours. Contact us if it\'s been longer and we\'ll prioritise it.' },
  { q: 'How do XP points and streaks work?',       a: 'Earn XP by solving problems, completing lessons, and submitting quizzes. Log in every day to maintain your streak.' },
];

export default function Help() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [subject, setSubject]   = useState('');
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!category) { setError('Please select a category.'); return; }
    if (!message.trim() || message.trim().length < 10) { setError('Please write a message (at least 10 characters).'); return; }
    setSending(true);
    try {
      await api.post('/support', { category, subject, message });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleReset() {
    setCategory(''); setSubject(''); setMessage('');
    setError(''); setSent(false);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 3rem' }}>

      {/* ── Hero banner ── */}
      <div style={{
        borderRadius: 20, padding: '2.5rem 2rem', marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(74,144,217,0.15) 0%, rgba(127,119,221,0.12) 50%, rgba(92,200,160,0.08) 100%)',
        border: '1px solid rgba(74,144,217,0.2)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,144,217,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 100, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,119,221,0.10), transparent)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🙋</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#fff' }}>
            Help & Support
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.7 }}>
            Have a question or facing an issue? We're here to help — usually within <strong style={{ color: '#4A90D9' }}>24 hours</strong>. You're talking directly to the instructor, not a bot.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '⚡', label: '< 24h', sub: 'Response time' },
              { icon: '🔒', label: 'Private', sub: 'Data stays secure' },
              { icon: '🤝', label: 'Direct', sub: 'Talk to the instructor' },
              { icon: '✅', label: '100%', sub: 'Issues resolved' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT: Form ── */}
        <div>
          {sent ? (
            <div style={{
              background: 'rgba(92,200,160,0.08)', border: '1px solid rgba(92,200,160,0.25)',
              borderRadius: 20, padding: '3rem 2rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#fff' }}>Message Sent!</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                We've received your message and will respond within <strong style={{ color: '#5CC8A0' }}>24 hours</strong>.<br />
                We'll reply to <strong style={{ color: '#4A90D9' }}>{user?.email}</strong>.
              </div>
              <button className="btn-primary" onClick={handleReset} style={{ fontSize: 14, padding: '10px 24px' }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '1.8rem',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>📨</span> Send us a Message
                </div>

                {/* Category */}
                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                    What do you need help with? <span style={{ color: '#F07B6A' }}>*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, padding: '11px 40px 11px 14px',
                      color: category ? '#fff' : 'rgba(255,255,255,0.35)',
                      fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                    }}
                  >
                    <option value="" disabled style={{ background: '#1a1f2e', color: 'rgba(255,255,255,0.4)' }}>— Select a category —</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value} style={{ background: '#1a1f2e', color: '#fff' }}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="field" style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                    Subject <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    maxLength={120}
                    style={{ fontSize: 14 }}
                  />
                </div>

                {/* Message */}
                <div className="field" style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                    <span>Your Message <span style={{ color: '#F07B6A' }}>*</span></span>
                    <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>{message.length}/1000</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 1000))}
                    placeholder="Describe your issue or question in detail. The more you share, the faster we can help you."
                    rows={7}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, padding: '12px 14px', color: '#fff', width: '100%',
                      fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* User info note */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: '0.8rem',
                  padding: '10px 14px', background: 'rgba(74,144,217,0.06)', borderRadius: 10,
                  border: '1px solid rgba(74,144,217,0.15)', fontSize: 12, color: 'rgba(255,255,255,0.4)',
                }}>
                  <span style={{ marginTop: 1 }}>ℹ️</span>
                  <span>Your name and registered email will be included so we can respond directly. Your email is never shown publicly.</span>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(240,123,106,0.10)', border: '1px solid rgba(240,123,106,0.3)', borderRadius: 10, fontSize: 13, color: '#F07B6A' }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={sending}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1.2rem', fontSize: 15, padding: '13px', borderRadius: 12 }}
                >
                  {sending
                    ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 10 }} />Sending…</>
                    : <><span>📨</span>&nbsp; Send Message</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── RIGHT: FAQ + Contact Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Quick contact card */}
          <div style={{
            background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)',
            borderRadius: 16, padding: '1.4rem',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa', marginBottom: '1rem', letterSpacing: '0.5px' }}>
              📬 OTHER WAYS TO REACH US
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📧', label: 'Email', value: 'support@datamyze.in', href: 'mailto:support@datamyze.in' },
                { icon: '💼', label: 'LinkedIn', value: 'Pathan Asif Khan', href: 'https://www.linkedin.com/in/pathan-asif-khan-/' },
                { icon: '⏱', label: 'Response Time', value: 'Within 24 hours', href: null },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{c.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                    {c.href
                      ? <a href={c.href} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>{c.value}</a>
                      : <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{c.value}</div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ accordion */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{
              padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px',
            }}>
              ❓ COMMON QUESTIONS
            </div>
            <div>
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} last={i === FAQS.length - 1} />
              ))}
            </div>
          </div>

          {/* Pro tip card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,168,56,0.10), rgba(232,168,56,0.05))',
            border: '1px solid rgba(232,168,56,0.2)', borderRadius: 16, padding: '1.2rem',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#E8A838', marginBottom: 4, letterSpacing: '0.5px' }}>PRO TIP</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                For faster help, include your <strong style={{ color: 'rgba(255,255,255,0.8)' }}>registered email</strong> and a <strong style={{ color: 'rgba(255,255,255,0.8)' }}>screenshot</strong> of any error you're seeing. Most issues are resolved in under 2 hours.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function FaqItem({ q, a, last }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: open ? 'rgba(74,144,217,0.06)' : 'none',
          border: 'none', color: '#fff', fontWeight: 600, fontSize: 13,
          cursor: 'pointer', textAlign: 'left', gap: 12, transition: 'background 0.15s',
        }}
      >
        <span style={{ lineHeight: 1.4 }}>{q}</span>
        <span style={{
          flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
          background: open ? 'rgba(74,144,217,0.2)' : 'rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: open ? '#4A90D9' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.2s', transform: open ? 'rotate(180deg)' : 'none',
        }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}
