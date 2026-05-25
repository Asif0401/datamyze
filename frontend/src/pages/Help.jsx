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
    <div className="page" style={{ maxWidth: 700 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">🙋 Help & Support</div>
        <div className="page-sub">Have a question or facing an issue? We're here to help — usually within 24 hours.</div>
      </div>

      {/* Success state */}
      {sent ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: 56, marginBottom: '1rem' }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: '0.5rem' }}>Message Sent!</div>
          <div style={{ color: 'var(--muted)', fontSize: 15, marginBottom: '2rem', lineHeight: 1.6 }}>
            We've received your message and will get back to you within <strong style={{ color: '#fff' }}>24 hours</strong>.<br />
            Check your email <strong style={{ color: '#4A90D9' }}>{user?.email}</strong> for a response.
          </div>
          <button className="btn-primary" onClick={handleReset}>Send Another Message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '1.8rem' }}>

            {/* Info strip */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
              {[
                { icon: '⚡', label: 'Fast Response', sub: 'Usually within 24h' },
                { icon: '🔒', label: 'Secure',        sub: 'Your data stays private' },
                { icon: '🤝', label: 'Direct Support', sub: 'You talk to the instructor' },
              ].map(i => (
                <div key={i.label} style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(74,144,217,0.07)', border: '1px solid rgba(74,144,217,0.15)',
                  borderRadius: 12, padding: '10px 14px' }}>
                  <span style={{ fontSize: 22 }}>{i.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{i.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{i.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category */}
            <div className="field">
              <label>What do you need help with? <span style={{ color: '#F07B6A' }}>*</span></label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, padding: '11px 14px', color: category ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontSize: 14, width: '100%', outline: 'none', cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                  paddingRight: 40,
                }}
              >
                <option value="" disabled style={{ background: '#1a1f2e', color: 'rgba(255,255,255,0.4)' }}>— Select a category —</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} style={{ background: '#1a1f2e', color: '#fff' }}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Subject (optional) */}
            <div className="field" style={{ marginTop: '1rem' }}>
              <label>Subject <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
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
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Message <span style={{ color: '#F07B6A' }}>*</span></span>
                <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 12 }}>{message.length}/1000</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 1000))}
                placeholder="Describe your issue or question in detail. The more you share, the faster we can help you."
                rows={6}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, padding: '12px 14px', color: '#fff', width: '100%',
                  fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* User info note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: '0.5rem',
              padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              <span>ℹ️</span>
              <span>Your name and registered email will be included so we can respond to you directly. Your email is never shown publicly.</span>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(240,123,106,0.12)',
                border: '1px solid rgba(240,123,106,0.3)', borderRadius: 10, fontSize: 13, color: '#F07B6A' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={sending}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.4rem', fontSize: 15, padding: '13px' }}
            >
              {sending
                ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 10 }} />Sending…</>
                : <><span>📨</span> Send Message</>
              }
            </button>
          </div>
        </form>
      )}

      {/* FAQ section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>Common Questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { q: 'How do I upgrade to Pro?',                  a: 'Go to Pro Hub in the sidebar and click "Get Pro Now". Pay via UPI or card — activation is instant.' },
            { q: 'I paid but my account isn\'t activated.',   a: 'Usually resolves within minutes. If not, use the support form above with "Payment Issue" as category.' },
            { q: 'How do I get my certificate?',              a: 'Complete all lessons in a course. Certificates are issued automatically to Pro members only.' },
            { q: 'Can I book a 1:1 mentoring session?',       a: 'Yes! Go to Pro Hub → Sessions. Available to Pro members.' },
            { q: 'My resume review is taking too long.',      a: 'Reviews are completed within 24 hours. Contact us if it\'s been longer.' },
          ].map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s',
      borderColor: open ? 'rgba(74,144,217,0.3)' : 'rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '13px 16px', background: 'none', border: 'none', color: '#fff',
          fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <span>{q}</span>
        <span style={{ flexShrink: 0, fontSize: 18, color: 'rgba(255,255,255,0.4)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}
