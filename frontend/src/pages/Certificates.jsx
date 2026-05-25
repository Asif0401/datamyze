import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

/* ── Decorative SVG seal ─────────────────────────────── */
const CertSeal = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F6D365"/>
        <stop offset="100%" stopColor="#E8A838"/>
      </linearGradient>
      <linearGradient id="sealInner" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e3a5f"/>
        <stop offset="100%" stopColor="#0f2744"/>
      </linearGradient>
    </defs>
    {/* Outer star burst ring */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const rad   = (angle * Math.PI) / 180;
      const x1 = 44 + 39 * Math.cos(rad);
      const y1 = 44 + 39 * Math.sin(rad);
      const x2 = 44 + 32 * Math.cos(rad);
      const y2 = 44 + 32 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#sealGold)" strokeWidth="2" strokeLinecap="round"/>;
    })}
    {/* Outer ring */}
    <circle cx="44" cy="44" r="30" fill="url(#sealInner)" stroke="url(#sealGold)" strokeWidth="2.5"/>
    {/* Inner ring */}
    <circle cx="44" cy="44" r="26" fill="none" stroke="url(#sealGold)" strokeWidth="0.8" strokeDasharray="3 2"/>
    {/* AQ monogram */}
    <text x="44" y="40" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="#F6D365" letterSpacing="-0.5">DM</text>
    <text x="44" y="53" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6.5" fill="rgba(246,211,101,0.7)" letterSpacing="1.5">VERIFIED</text>
  </svg>
);

/* ── Corner ornament SVG ─────────────────────────────── */
const Corner = ({ flip }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none"
    style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
    <path d="M4 56 L4 10 Q4 4 10 4 L56 4" stroke="url(#cornerG)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M4 48 L4 16 Q4 10 10 10 L48 10" stroke="url(#cornerG)" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5"/>
    <circle cx="4"  cy="4"  r="3" fill="url(#cornerG)"/>
    <circle cx="56" cy="4"  r="2" fill="url(#cornerG)" opacity="0.6"/>
    <circle cx="4"  cy="56" r="2" fill="url(#cornerG)" opacity="0.6"/>
    <defs>
      <linearGradient id="cornerG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F6D365"/><stop offset="100%" stopColor="#c9853a"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── Datamyze logo for certificate ───────────────────── */
const CertLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
    <div style={{
      width: 32, height: 32,
      background: 'linear-gradient(145deg, #1d4ed8, #0369a1, #06b6d4)',
      borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 3px 12px rgba(6,182,212,0.5)',
    }}>
      <svg viewBox="0 0 22 22" fill="none" width="16" height="16">
        <defs>
          <linearGradient id="cb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.7"/><stop offset="100%" stopColor="white" stopOpacity="0.1"/></linearGradient>
          <linearGradient id="cb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.85"/><stop offset="100%" stopColor="white" stopOpacity="0.12"/></linearGradient>
          <linearGradient id="cb3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9"/><stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12"/></linearGradient>
          <linearGradient id="cb4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="1"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18"/></linearGradient>
          <filter id="cglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <line x1="1" y1="21.5" x2="23" y2="21.5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
        <rect x="1.5" y="17"  width="3.5" height="4.5" rx="1.3" fill="url(#cb1)"/>
        <rect x="6.5" y="13"  width="3.5" height="8.5" rx="1.3" fill="url(#cb2)"/>
        <rect x="11.5" y="9"  width="3.5" height="12.5" rx="1.3" fill="url(#cb3)"/>
        <rect x="16.5" y="5"  width="3.5" height="16.5" rx="1.3" fill="url(#cb4)"/>
        <line x1="3.25" y1="16.5" x2="18.25" y2="4.5" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" filter="url(#cglow)" opacity="0.95"/>
        <path d="M18.25,2 L19.6,4.5 L18.25,7 L16.9,4.5 Z" fill="#22d3ee" filter="url(#cglow)"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.1 }}>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>Data</span>
        <span style={{ color: '#fff', fontWeight: 900 }}>myze</span>
      </div>
      <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
        MASTER DATA. MASTER YOUR FUTURE.
      </div>
    </div>
  </div>
);

/* ── Main component ──────────────────────────────────── */
export default function Certificates() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [certs, setCerts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => {
    api.get('/users/certificates')
      .then(r => { setCerts(r.data.certificates); setIsPremium(true); })
      .catch(e => { if (e.response?.data?.error === 'premium_required') setIsPremium(false); })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2800); }

  if (loading) return <div className="loading"><div className="spinner" />Loading certificates...</div>;

  /* ── Premium gate ── */
  if (!isPremium) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 72, marginBottom: '1rem', filter: 'grayscale(0.3)' }}>🎓</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.4px' }}>
          Certificates are a <span style={{ background: 'linear-gradient(135deg,#E8A838,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span> feature
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Complete courses and earn verified, LinkedIn-ready certificates — exclusive to Pro members. Upgrade to unlock yours.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/premium')}
            style={{ background: 'linear-gradient(135deg,#E8A838,#f59e0b)', border: 'none', fontSize: 15, padding: '12px 28px' }}>
            👑 Upgrade to Pro
          </button>
          <button onClick={() => navigate('/courses')}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', borderRadius: 12, fontSize: 14, padding: '12px 24px' }}>
            Browse Courses
          </button>
        </div>
        {/* Feature highlights */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          {['LinkedIn-ready', 'Verified credential ID', 'Shareable link'].map(f => (
            <span key={f} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(232,168,56,0.10)', border: '1px solid rgba(232,168,56,0.25)', color: '#E8A838' }}>✓ {f}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🎓 My Certificates</div>
        <div className="page-sub">Showcase your verified achievements</div>
      </div>

      {certs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 52, marginBottom: '1rem' }}>🎓</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: '0.5rem' }}>No certificates yet</div>
          <div style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Complete any course to earn your verified Pro certificate</div>
          <button className="btn-primary" onClick={() => navigate('/courses')}>Browse Courses →</button>
        </div>
      ) : (
        certs.map(cert => (
          <CertCard key={cert.id} cert={cert} user={user} showToast={showToast} />
        ))
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── Certificate card ────────────────────────────────── */
function CertCard({ cert, user, showToast }) {
  const issued = new Date(cert.issued_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ marginBottom: '2.5rem' }}>

      {/* ── The Certificate ── */}
      <div style={{
        position: 'relative',
        maxWidth: 740,
        background: 'linear-gradient(145deg, #0b1a35 0%, #0f2040 40%, #091628 100%)',
        borderRadius: 20,
        padding: '3px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(246,211,101,0.15)',
      }}>

        {/* Gold gradient border */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: 'linear-gradient(135deg, #F6D365 0%, rgba(246,211,101,0.15) 40%, rgba(200,133,58,0.1) 60%, #E8A838 100%)',
          padding: '1.5px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} />

        {/* Inner card */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1f3c 0%, #0a1628 100%)',
          borderRadius: 18,
          padding: '2.8rem 3rem',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Subtle radial glow background */}
          <div style={{
            position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '60%',
            background: 'radial-gradient(ellipse, rgba(74,144,217,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', right: '-10%',
            width: '50%', height: '50%',
            background: 'radial-gradient(ellipse, rgba(246,211,101,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Corner ornaments */}
          <div style={{ position: 'absolute', top: 10, left: 10, opacity: 0.6 }}><Corner /></div>
          <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.6 }}><Corner flip /></div>
          <div style={{ position: 'absolute', bottom: 10, left: 10, opacity: 0.6, transform: 'scaleY(-1)' }}><Corner /></div>
          <div style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.6, transform: 'scale(-1,-1)' }}><Corner flip /></div>

          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem', position: 'relative', zIndex: 1 }}>
            <CertLogo />
            <div style={{
              marginTop: '1.4rem',
              fontSize: 10, fontWeight: 700, letterSpacing: '4px',
              color: 'rgba(246,211,101,0.6)', textTransform: 'uppercase',
            }}>
              ━━━━━  Certificate of Completion  ━━━━━
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px', marginBottom: 12 }}>
              This is to proudly certify that
            </div>

            {/* Student name */}
            <div style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 34, fontWeight: 700,
              background: 'linear-gradient(135deg, #fff 30%, #a8c8f0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px', lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {user?.name}
            </div>

            {/* Decorative line under name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 18 }}>
              <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, transparent, rgba(246,211,101,0.5))' }} />
              <div style={{ color: 'rgba(246,211,101,0.6)', fontSize: 14 }}>✦</div>
              <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, rgba(246,211,101,0.5), transparent)' }} />
            </div>

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 10 }}>
              has successfully completed the course
            </div>

            {/* Course name */}
            <div style={{
              fontSize: 20, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.3px', lineHeight: 1.3,
              marginBottom: 6,
            }}>
              {cert.course_icon} {cert.course_title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: '2.2rem' }}>
              Datamyze · Verified Learning Programme
            </div>

            {/* ── Footer row ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '1.6rem',
              borderTop: '1px solid rgba(246,211,101,0.12)',
              gap: 16,
            }}>

              {/* Signature left */}
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{
                  fontFamily: 'Georgia, serif', fontStyle: 'italic',
                  fontSize: 18, color: '#a8c8f0', lineHeight: 1, marginBottom: 4,
                }}>
                  Datamyze Team
                </div>
                <div style={{ width: 80, height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' }}>
                  Instructor & Founder, Datamyze
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>
                  Issued: {issued}
                </div>
              </div>

              {/* Seal center */}
              <div style={{ flexShrink: 0 }}>
                <CertSeal />
              </div>

              {/* Credential ID right */}
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '1.5px',
                  color: 'rgba(246,211,101,0.5)', textTransform: 'uppercase', marginBottom: 5,
                }}>
                  Credential ID
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                  color: '#60a5fa', letterSpacing: '1px',
                }}>
                  {cert.credential_id}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '1px',
                    background: 'rgba(92,200,160,0.12)',
                    border: '1px solid rgba(92,200,160,0.3)',
                    color: '#5CC8A0', padding: '2px 8px', borderRadius: 20,
                    textTransform: 'uppercase',
                  }}>✓ Verified</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Actions below certificate ── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, maxWidth: 740 }}>
        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => showToast('🖨️ Use Ctrl+P / Cmd+P to print or save as PDF!')}
        >
          ⬇ Download PDF
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => {
            navigator.clipboard?.writeText(cert.credential_id);
            showToast('✅ Credential ID copied to clipboard!');
          }}
        >
          📋 Copy Credential ID
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => {
            const text = `I just completed "${cert.course_title}" on Datamyze! 🎓\nCredential: ${cert.credential_id}`;
            navigator.clipboard?.writeText(text);
            showToast('✅ Share text copied — paste it on LinkedIn!');
          }}
        >
          🔗 Share on LinkedIn
        </button>
      </div>
    </div>
  );
}
