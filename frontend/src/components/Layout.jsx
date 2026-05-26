import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Background from './Background';

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
  { to: '/premium',    Icon: Icons.Premium,    label: 'Pro Hub',            className: 'nav-premium-item' },
  { to: '/jobs',       Icon: Icons.Jobs,       label: 'Job Board',          className: 'nav-premium-item' },
  { to: '/instructor', Icon: Icons.Instructor, label: 'Meet Your Mentor',   className: 'nav-instructor-item' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials    = user?.name?.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const xpPercent   = Math.min(100, Math.round((user?.xp || 0) / 150));
  const isPremium   = user?.is_premium === 1;
  const isAdmin     = user?.role === 'admin' || user?.email === 'ak384837@gmail.com';
  const avatarColor = user?.avatar_color || '#4A90D9';
  const avatarSrc   = user?.avatar_url ? `/uploads/avatars/${user.avatar_url}` : null;

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
    </div>
  );
}
