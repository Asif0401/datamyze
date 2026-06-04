import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

/* Always load synchronously — needed before any auth check */
import Layout from './components/Layout';

/* Lazy-load all pages — each becomes its own JS chunk */
const AuthPage            = lazy(() => import('./pages/AuthPage'));
const Instagram           = lazy(() => import('./pages/Instagram'));
const Dashboard           = lazy(() => import('./pages/Dashboard'));
const Courses             = lazy(() => import('./pages/Courses'));
const Problems            = lazy(() => import('./pages/Problems'));
const Quiz                = lazy(() => import('./pages/Quiz'));
const Leaderboard         = lazy(() => import('./pages/Leaderboard'));
const Certificates        = lazy(() => import('./pages/Certificates'));
const Admin               = lazy(() => import('./pages/Admin'));
const Premium             = lazy(() => import('./pages/Premium'));
const Jobs                = lazy(() => import('./pages/Jobs'));
const Settings            = lazy(() => import('./pages/Settings'));
const Instructor          = lazy(() => import('./pages/Instructor'));
const ProfileCompletion   = lazy(() => import('./pages/ProfileCompletion'));
const Onboarding          = lazy(() => import('./pages/Onboarding'));
const CaseStudies         = lazy(() => import('./pages/CaseStudies'));
const Help                = lazy(() => import('./pages/Help'));
const InterviewExperiences = lazy(() => import('./pages/InterviewExperiences'));

/* Fallback shown while a chunk loads */
const PageLoader = () => (
  <div className="loading"><div className="spinner" />Loading...</div>
);

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      {/* Profile completion — shown once right after signup */}
      {user && user.profile_completed === 0 && <ProfileCompletion />}
      {/* Onboarding — shown once after profile is complete, guides user on where to start */}
      {user && user.profile_completed === 1 && user.onboarding_completed === 0 && <Onboarding />}

      <Routes>
        {/* Public pages */}
        <Route path="/instagram" element={<Instagram />} />
        <Route path="/login"  element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage mode="signup" />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index                              element={<Dashboard />} />
          <Route path="courses"                    element={<Courses />} />
          <Route path="problems"                   element={<Problems />} />
          <Route path="quiz"                       element={<Quiz />} />
          <Route path="leaderboard"                element={<Leaderboard />} />
          <Route path="certificates"               element={<Certificates />} />
          <Route path="admin"                      element={<Admin />} />
          <Route path="premium"                    element={<Premium />} />
          <Route path="jobs"                       element={<Jobs />} />
          <Route path="settings"                   element={<Settings />} />
          <Route path="instructor"                 element={<Instructor />} />
          <Route path="case-studies"               element={<CaseStudies />} />
          <Route path="help"                       element={<Help />} />
          <Route path="interview-experiences"      element={<InterviewExperiences />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}
