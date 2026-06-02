import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';

const DISMISS_KEY = 'dm_mobile_ok';

function MobileWarning() {
  const [visible, setVisible] = useState(() => {
    // Already dismissed before? Never show again.
    if (localStorage.getItem(DISMISS_KEY) === '1') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    // Re-check on resize only (not on every render)
    const check = () => {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
      setVisible(window.innerWidth < 768);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #03060f 0%, #070e20 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      {/* Logo icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 18, marginBottom: '1.4rem',
        background: 'linear-gradient(145deg, #1e40af 0%, #0369a1 50%, #0891b2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(34,211,238,0.45), 0 0 0 1px rgba(255,255,255,0.12)',
      }}>
        <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
          <rect x="1.5" y="17" width="3.5" height="6" rx="1.3" fill="rgba(255,255,255,0.65)"/>
          <rect x="6.5" y="13" width="3.5" height="10" rx="1.3" fill="rgba(255,255,255,0.75)"/>
          <rect x="11.5" y="9"  width="3.5" height="14" rx="1.3" fill="rgba(103,232,249,0.9)"/>
          <rect x="16.5" y="5"  width="3.5" height="18" rx="1.3" fill="#22d3ee"/>
          <line x1="3.25" y1="16.5" x2="18.25" y2="4.5" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M18.25,2 L19.6,4.5 L18.25,7 L16.9,4.5 Z" fill="#22d3ee"/>
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '1.8rem', lineHeight: 1 }}>
        <span style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>Data</span>
        <span style={{ color: '#22d3ee', fontWeight: 900 }}>myze</span>
      </div>

      {/* Laptop icon */}
      <div style={{ fontSize: 52, marginBottom: '1.2rem', lineHeight: 1 }}>💻</div>

      {/* Heading */}
      <div style={{
        fontSize: 22, fontWeight: 800, color: '#fff',
        letterSpacing: '-0.5px', marginBottom: '0.75rem', lineHeight: 1.25,
      }}>
        Best viewed on a laptop<br />or larger screen
      </div>

      {/* Sub text */}
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.45)',
        maxWidth: 300, lineHeight: 1.6, marginBottom: '2rem',
      }}>
        Datamyze is packed with courses, practice problems, and tools — open it on your laptop or desktop for the full experience.
      </div>

      {/* Desktop view tip */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 12, padding: '0.85rem 1.2rem',
        maxWidth: 310, marginBottom: '1.2rem',
        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
      }}>
        <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          Want to continue on mobile? Tap your browser's{' '}
          <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>menu → Request Desktop Site</span>
          {' '}(or "Desktop View") to proceed.
        </div>
      </div>

      {/* Mobile app coming soon */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(34,211,238,0.08))',
        border: '1px solid rgba(108,99,255,0.28)',
        borderRadius: 12, padding: '0.85rem 1.2rem',
        maxWidth: 310, marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>📱</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
            Datamyze App — Coming Soon
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
            A native mobile app is on the way. Stay tuned!
          </div>
        </div>
      </div>

      {/* Divider + domain */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '1.4rem', width: '100%', maxWidth: 280,
        marginBottom: '1.4rem',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(34,211,238,0.55)', letterSpacing: 1, fontWeight: 600 }}>
          datamyze.in
        </div>
      </div>

      {/* Continue anyway */}
      <button
        onClick={dismiss}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10, padding: '0.6rem 1.4rem',
          color: 'rgba(255,255,255,0.35)', fontSize: 12.5,
          cursor: 'pointer', letterSpacing: 0.3,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
      >
        Continue anyway →
      </button>
    </div>
  );
}
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Problems from './pages/Problems';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import Certificates from './pages/Certificates';
import Admin from './pages/Admin';
import Premium from './pages/Premium';
import Jobs from './pages/Jobs';
import Settings from './pages/Settings';
import Instructor from './pages/Instructor';
import ProfileCompletion from './pages/ProfileCompletion';
import CaseStudies from './pages/CaseStudies';
import Help from './pages/Help';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <>
      {/* Mobile warning — shown on screens < 768px */}
      <MobileWarning />

      {/* Profile completion overlay — shown once after first signup */}
      {user && user.profile_completed === 0 && <ProfileCompletion />}

      <Routes>
        <Route path="/login"  element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage mode="signup" />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index          element={<Dashboard />} />
          <Route path="courses"     element={<Courses />} />
          <Route path="problems"    element={<Problems />} />
          <Route path="quiz"        element={<Quiz />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="certificates"element={<Certificates />} />
          <Route path="admin"       element={<Admin />} />
          <Route path="premium"     element={<Premium />} />
          <Route path="jobs"        element={<Jobs />} />
          <Route path="settings"    element={<Settings />} />
          <Route path="instructor"  element={<Instructor />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="help"         element={<Help />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
