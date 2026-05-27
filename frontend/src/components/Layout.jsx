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
  { to: '/instructor', Icon: Icons.Instructor, label: 'About Us',           className: 'nav-instructor-item' },
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
            {/* Radar chart icon */}
            <svg viewBox="0 0 130 130" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              {/* Backing square */}
              <rect x="0" y="0" width="130" height="130" rx="28" fill="#0f172a"/>

              {/* Grid rings */}
              <polygon points="65,14 107,39 107,89 65,114 23,89 23,39" fill="none" stroke="#1e3a8a" strokeWidth="1.2"/>
              <polygon points="65,30 95,47 95,83 65,100 35,83 35,47"   fill="none" stroke="#1e3a8a" strokeWidth="1.2"/>
              <polygon points="65,46 83,56 83,76 65,86 47,76 47,56"    fill="none" stroke="#1e3a8a" strokeWidth="1.2"/>

              {/* Axis lines */}
              <line x1="65" y1="14" x2="65"  y2="114" stroke="#1e3a8a" strokeWidth="1.2"/>
              <line x1="23" y1="39" x2="107" y2="89"  stroke="#1e3a8a" strokeWidth="1.2"/>
              <line x1="107" y1="39" x2="23" y2="89"  stroke="#1e3a8a" strokeWidth="1.2"/>

              {/* Data polygon fill — animated */}
              <polygon className="radar-fill" points="65,18 103,42 101,88 65,108 27,85 29,40" fill="#2563eb" opacity="0.22"/>
              {/* Data polygon stroke — animated */}
              <polygon className="radar-stroke" points="65,18 103,42 101,88 65,108 27,85 29,40" fill="none" stroke="#38bdf8" strokeWidth="2.5"/>

              {/* Vertex dots — staggered pulse */}
              <circle className="radar-dot" style={{ animationDelay: '0s' }}    cx="65"  cy="18"  r="5" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              <circle className="radar-dot" style={{ animationDelay: '0.5s' }}  cx="103" cy="42"  r="5" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              <circle className="radar-dot" style={{ animationDelay: '1s' }}    cx="101" cy="88"  r="5" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              <circle className="radar-dot" style={{ animationDelay: '1.5s' }}  cx="65"  cy="108" r="5" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              <circle className="radar-dot" style={{ animationDelay: '2s' }}    cx="27"  cy="85"  r="5" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              <circle className="radar-dot" style={{ animationDelay: '2.5s' }}  cx="29"  cy="40"  r="5" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>

              {/* Center dot */}
              <circle cx="65" cy="64" r="5"   fill="#2563eb"/>
              <circle cx="65" cy="64" r="2.5" fill="#38bdf8"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="logo-text">
              <span className="logo-data">Data</span><span className="logo-lift">myze</span>
            </div>
            <div className="logo-tagline">YOUR DATA CAREER STARTS HERE.</div>
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
            <a href="https://instagram.com/datamyze" target="_blank" rel="noreferrer" title="Datamyze on Instagram"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', transition: 'all .2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(225,48,108,0.18)'; e.currentTarget.style.color='#e1306c'; e.currentTarget.style.borderColor='rgba(225,48,108,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com/company/datamyze" target="_blank" rel="noreferrer" title="Datamyze on LinkedIn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', transition: 'all .2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(0,119,181,0.18)'; e.currentTarget.style.color='#0077B5'; e.currentTarget.style.borderColor='rgba(0,119,181,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* Twitter/X */}
            <a href="https://twitter.com/datamyze" target="_blank" rel="noreferrer" title="Datamyze on X"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', transition: 'all .2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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
    </div>
  );
}
