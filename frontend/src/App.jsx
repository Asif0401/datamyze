import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
