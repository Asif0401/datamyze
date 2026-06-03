import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Background from './Background';
import { useState, useEffect } from 'react';

/* ── Free-user welcome popup ─────────────────────── */
function FreeUserPopup({ onClose, onUpgrade }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 400); return () => clearTimeout(t); }, []);

  const perks = [
    { icon: '🎥', text: 'Live classes every week with the instructor' },
    { icon: '💼', text: '300+ curated job listings: Data Analyst, BI & more' },
    { icon: '🧑‍💼', text: '1:1 live mentorship sessions with an expert' },
    { icon: '📄', text: 'Personalised resume review + mock interviews' },
    { icon: '🏆', text: 'Verified certificates ready for LinkedIn' },
    { icon: '🎯', text: '100% placement assistance till you get hired' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 'clamp(0.75rem, 3vw, 1.5rem)',
      paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
      paddingBottom: 'max(80px, calc(72px + env(safe-area-inset-bottom, 0px)))',
      overflowY: 'auto',
      opacity: visible ? 1 : 0,
      transition: 'opacity .35s ease',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0d1117',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(232,168,56,0.3), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(232,168,56,0.08)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
        transition: 'transform .4s cubic-bezier(.4,0,.2,1)',
      }}>

        {/* ── Gold header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1200 0%, #2a1c00 40%, #1a1200 100%)',
          borderBottom: '1px solid rgba(232,168,56,0.25)',
          padding: '1.8rem 1.8rem 1.5rem',
          position: 'relative', overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* Glow blob */}
          <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,168,56,0.25), transparent)', pointerEvents: 'none' }} />
          {/* Top stripe */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #F5C842, #E8A838, #F07B6A)' }} />

          {/* Close btn */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 14,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: 28, height: 28,
            color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >✕</button>

          <div style={{ fontSize: 44, marginBottom: 10, filter: 'drop-shadow(0 0 16px rgba(232,168,56,0.8))' }}>👑</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(232,168,56,0.12)', border: '1px solid rgba(232,168,56,0.3)',
            borderRadius: 20, padding: '3px 12px', marginBottom: 10,
            fontSize: 10, fontWeight: 700, color: '#E8A838', letterSpacing: 1,
          }}>FREE PLAN</div>

          <h2 style={{
            fontSize: 22, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #f1f5f9 30%, #E8A838 70%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>You're missing the best part</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
            Upgrade to Pro and unlock everything you need to land your first data role.
          </p>
        </div>

        {/* ── Perks list ── */}
        <div style={{ padding: '1.4rem 1.8rem 0' }}>
          {perks.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 0',
              borderBottom: i < perks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 500, lineHeight: 1.4 }}>{p.text}</span>
              <span style={{ marginLeft: 'auto', color: '#5CC8A0', fontSize: 16, flexShrink: 0 }}>✓</span>
            </div>
          ))}
        </div>

        {/* ── Price + CTA ── */}
        <div style={{ padding: '1.4rem 1.8rem 1.8rem' }}>
          {/* Price row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
            marginBottom: '1rem',
            background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.15)',
            borderRadius: 14, padding: '10px 16px',
          }}>
            <span style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #F5C842, #E8A838)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-1px' }}>₹199</span>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹999</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5CC8A0' }}>80% OFF · Lifetime access</div>
            </div>
            <span style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 800, padding: '3px 10px',
              background: 'rgba(92,200,160,0.15)', border: '1px solid rgba(92,200,160,0.35)',
              borderRadius: 20, color: '#5CC8A0', letterSpacing: 0.5,
            }}>ONE-TIME</span>
          </div>

          {/* CTA */}
          <button
            onClick={onUpgrade}
            className="btn-gold"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, borderRadius: 14 }}
          >
            👑 Get Pro Now · ₹199 Lifetime
          </button>

          <button onClick={onClose} style={{
            width: '100%', marginTop: 10,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.28)', fontSize: 12, cursor: 'pointer',
            padding: '6px', fontWeight: 500,
            transition: 'color .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
          >
            Maybe later, continue with free plan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SVG nav icons ─────────────────────────── */
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Courses: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Problems: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Quiz: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Leaderboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Certificates: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Premium: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
  ),
  Jobs: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Admin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  ),
  Instructor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  CaseStudies: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  CompanyQ: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M9 9l2 2 4-4"/>
    </svg>
  ),
  Help: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  SignOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

const NAV = [
  { to: '/',            Icon: Icons.Dashboard,    label: 'Dashboard',   end: true },
  { to: '/courses',     Icon: Icons.Courses,      label: 'Courses' },
  { to: '/problems',    Icon: Icons.Problems,     label: 'Problems' },
  { to: '/quiz',        Icon: Icons.Quiz,         label: 'Quiz' },
  { to: '/leaderboard', Icon: Icons.Leaderboard,  label: 'Leaderboard' },
  { to: '/certificates',  Icon: Icons.Certificates,  label: 'Certificates' },
  { to: '/case-studies',  Icon: Icons.CaseStudies,   label: 'Case Studies' },
  { to: '/help',          Icon: Icons.Help,           label: 'Help & Support' },
];

const PREMIUM_NAV = [
  { to: '/premium',             Icon: Icons.Premium,   label: 'Pro Hub',              className: 'nav-premium-item' },
  { to: '/jobs',                Icon: Icons.Jobs,      label: 'Job Board',            className: 'nav-premium-item' },
  { to: '/company-questions',   Icon: Icons.CompanyQ,  label: 'Company Q Banks',      className: 'nav-premium-item' },
  { to: '/instructor', Icon: Icons.Instructor, label: 'About Us',           className: 'nav-instructor-item' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials    = user?.name?.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const xpPercent   = Math.min(100, Math.round((user?.xp || 0) / 150));
  const isPremium   = user?.is_premium === 1;
  const isAdmin     = user?.role === 'admin' || user?.email === 'ak384837@gmail.com';
  const avatarColor = user?.avatar_color || '#4A90D9';
  const avatarSrc   = user?.avatar_url ? `/uploads/avatars/${user.avatar_url}` : null;

  /* Mobile "More" sheet */
  const [moreOpen, setMoreOpen] = useState(false);
  // Close sheet on route change
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  /* Show popup once per session for non-premium users */
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (!isPremium && !sessionStorage.getItem('dm_promo_seen')) {
      const t = setTimeout(() => setShowPopup(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isPremium]);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('dm_promo_seen', '1');
  };

  const goUpgrade = () => {
    setShowPopup(false);
    sessionStorage.setItem('dm_promo_seen', '1');
    navigate('/premium');
  };

  return (
    <div className="app-layout">
      <Background />
      <aside className="sidebar">
        {/* ── Brand / Logo ── */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <defs>
                <linearGradient id="dmb1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
                </linearGradient>
                <linearGradient id="dmb2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.85"/>
                  <stop offset="100%" stopColor="white" stopOpacity="0.12"/>
                </linearGradient>
                <linearGradient id="dmb3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12"/>
                </linearGradient>
                <linearGradient id="dmb4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18"/>
                </linearGradient>
                <filter id="dmglow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="1" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {/* Base line */}
              <line x1="1" y1="21.5" x2="23" y2="21.5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
              {/* Bars — gradient fills, taller = more cyan */}
              <rect x="1.5" y="17"  width="3.5" height="4.5" rx="1.3" fill="url(#dmb1)"/>
              <rect x="6.5" y="13"  width="3.5" height="8.5" rx="1.3" fill="url(#dmb2)"/>
              <rect x="11.5" y="9"  width="3.5" height="12.5" rx="1.3" fill="url(#dmb3)"/>
              <rect x="16.5" y="5"  width="3.5" height="16.5" rx="1.3" fill="url(#dmb4)"/>
              {/* Glowing trend line */}
              <line x1="3.25" y1="16.5" x2="18.25" y2="4.5"
                stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"
                filter="url(#dmglow)" opacity="0.95"/>
              {/* Peak star — 4-point diamond */}
              <path d="M18.25,2 L19.6,4.5 L18.25,7 L16.9,4.5 Z"
                fill="#22d3ee" filter="url(#dmglow)"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="logo-text">
              <span className="logo-data">Data</span><span className="logo-lift">myze</span>
            </div>
            <div className="logo-tagline">MASTER DATA. MASTER YOUR FUTURE.</div>
          </div>
        </div>

        {/* ── User Profile Card ── */}
        <div className="sidebar-user">
          <div className="user-row">
            <Link to="/settings" title="Edit profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="avatar"
                  style={{
                    objectFit: 'cover', cursor: 'pointer',
                    boxShadow: `0 0 0 2.5px ${avatarColor}66, 0 3px 14px ${avatarColor}44`,
                    transition: 'transform .2s, opacity .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{
                    background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`,
                    boxShadow: `0 0 0 2.5px ${avatarColor}55, 0 3px 14px ${avatarColor}44`,
                    cursor: 'pointer',
                    transition: 'transform .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >{initials}</div>
              )}
            </Link>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {isPremium
                  ? <span className="premium-badge" style={{ fontSize: 9, padding: '2px 7px', letterSpacing: '0.4px' }}>👑 Pro Member</span>
                  : <span>{user?.job_title || 'Data Enthusiast'}</span>
                }
              </div>
            </div>
          </div>

          {/* XP + Rank row */}
          <div className="xp-row">
            <span>⭐ {(user?.xp || 0).toLocaleString()} XP</span>
            <span style={{ color: 'rgba(255,255,255,0.28)' }}>Rank #{user?.rank || '—'}</span>
          </div>

          {/* XP progress bar */}
          <div className="xp-bar"><div className="xp-fill" style={{ width: `${xpPercent}%` }} /></div>

          {/* Streak */}
          <div className="streak-badge">🔥 {user?.streak || 0}-day streak</div>
        </div>

        {/* Separator line */}
        <div style={{
          height: 1,
          margin: '0.75rem 0.85rem 0',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
        }} />

        <nav className="sidebar-nav">
          <div className="nav-section">Learn</div>
          {NAV.map(({ to, Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Icon /></span>
              {label}
            </NavLink>
          ))}

          <div className="nav-section" style={{ marginTop: '1.2rem' }}>Career</div>
          {PREMIUM_NAV.map(({ to, Icon, label, className }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `nav-item ${className || ''}${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Icon /></span>
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="nav-section" style={{ marginTop: '1.2rem' }}>Admin</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span className="nav-icon"><Icons.Admin /></span>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          {/* Social links */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Instagram */}
            <a href="https://www.instagram.com/datamyze.in/" target="_blank" rel="noreferrer" title="Datamyze on Instagram"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', transition: 'all .2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(225,48,108,0.18)'; e.currentTarget.style.color='#e1306c'; e.currentTarget.style.borderColor='rgba(225,48,108,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/company/123464067/" target="_blank" rel="noreferrer" title="Datamyze on LinkedIn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', transition: 'all .2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(0,119,181,0.18)'; e.currentTarget.style.color='#0077B5'; e.currentTarget.style.borderColor='rgba(0,119,181,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} style={{ marginBottom: 6 }}>
            <span className="nav-icon"><Icons.Settings /></span>
            Settings
          </NavLink>
          <button className="btn-logout" onClick={() => { logout(); navigate('/login'); }}>
            <span style={{ width: 16, height: 16 }}><Icons.SignOut /></span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {/* ── Free user promo popup ── */}
      {showPopup && <FreeUserPopup onClose={closePopup} onUpgrade={goUpgrade} />}

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `mbn-item${isActive ? ' mbn-active' : ''}`}>
          <span className="mbn-icon"><Icons.Dashboard /></span>
          <span className="mbn-label">Home</span>
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => `mbn-item${isActive ? ' mbn-active' : ''}`}>
          <span className="mbn-icon"><Icons.Courses /></span>
          <span className="mbn-label">Courses</span>
        </NavLink>
        <NavLink to="/quiz" className={({ isActive }) => `mbn-item${isActive ? ' mbn-active' : ''}`}>
          <span className="mbn-icon"><Icons.Quiz /></span>
          <span className="mbn-label">Quiz</span>
        </NavLink>
        <NavLink to="/problems" className={({ isActive }) => `mbn-item${isActive ? ' mbn-active' : ''}`}>
          <span className="mbn-icon"><Icons.Problems /></span>
          <span className="mbn-label">Problems</span>
        </NavLink>
        <button className={`mbn-item${moreOpen ? ' mbn-active' : ''}`} onClick={() => setMoreOpen(o => !o)}>
          <span className="mbn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </span>
          <span className="mbn-label">More</span>
        </button>
      </nav>

      {/* ── Mobile "More" slide-up sheet ── */}
      {moreOpen && (
        <>
          <div
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', zIndex:298 }}
            onClick={() => setMoreOpen(false)}
          />
          <div style={{
            position:'fixed', bottom:62, left:0, right:0,
            background:'linear-gradient(180deg, #0c1122 0%, #080e1c 100%)',
            borderRadius:'22px 22px 0 0',
            border:'1px solid rgba(255,255,255,0.10)',
            borderBottom:'none',
            zIndex:299,
            padding:'0 1rem 1rem',
            paddingBottom:`calc(0.8rem + env(safe-area-inset-bottom))`,
            boxShadow:'0 -12px 48px rgba(0,0,0,0.70)',
            animation:'moreSheetUp 0.28s cubic-bezier(.32,1.2,.64,1)',
          }}>
            {/* Drag handle */}
            <div style={{ width:36, height:4, background:'rgba(255,255,255,0.18)', borderRadius:99, margin:'0.7rem auto 1rem' }} />

            {/* User card */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0.75rem 1rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, marginBottom:'1rem' }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${avatarColor},#22d3ee)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, flexShrink:0, color:'#fff', overflow:'hidden' }}>
                {avatarSrc ? <img src={avatarSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.40)', marginTop:1 }}>
                  {isPremium ? '👑 Pro Member' : '⚡ Free Plan'} · {(user?.xp||0).toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* Nav grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.6rem', marginBottom:'0.9rem' }}>
              {[
                { to:'/leaderboard',        icon:<Icons.Leaderboard />,  label:'Leaderboard',  color:'#E8A838' },
                { to:'/certificates',       icon:<Icons.Certificates />, label:'Certificates', color:'#5CC8A0' },
                { to:'/company-questions',  icon:<Icons.CompanyQ />,     label:'Co. Q Banks',  color:'#38bdf8' },
                { to:'/jobs',               icon:<Icons.Jobs />,         label:'Job Board',    color:'#FC8019' },
                { to:'/premium',            icon:<Icons.Premium />,      label:'Pro Hub',      color:'#F6C443' },
                { to:'/settings',           icon:<Icons.Settings />,     label:'Settings',     color:'#94a3b8' },
              ].map(item => (
                <NavLink key={item.to} to={item.to}
                  style={({ isActive }) => ({
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    padding:'0.85rem 0.5rem',
                    background: isActive ? `${item.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? item.color+'40' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius:14, textDecoration:'none',
                    color: isActive ? item.color : 'rgba(255,255,255,0.70)',
                    transition:'all 0.15s',
                  })}
                >
                  <span style={{ width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>{item.icon}</span>
                  <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.2px', textAlign:'center' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Sign out */}
            <button
              onClick={() => { logout(); navigate('/login'); setMoreOpen(false); }}
              style={{ width:'100%', padding:'0.85rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)', borderRadius:12, color:'#f87171', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            >
              <span style={{ width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center' }}><Icons.SignOut /></span>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
