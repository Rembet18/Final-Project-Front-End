import { lazy, Suspense, useLayoutEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Loading } from './components/Loading';

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Courses = lazy(() => import('./pages/Courses').then((module) => ({ default: module.Courses })));
const Assignments = lazy(() => import('./pages/Assignments').then((module) => ({ default: module.Assignments })));
const Exams = lazy(() => import('./pages/Exams').then((module) => ({ default: module.Exams })));
const Attendance = lazy(() => import('./pages/Attendance').then((module) => ({ default: module.Attendance })));
const Grades = lazy(() => import('./pages/Grades').then((module) => ({ default: module.Grades })));
const Messages = lazy(() => import('./pages/Messages').then((module) => ({ default: module.Messages })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const Architecture = lazy(() => import('./pages/Architecture').then((module) => ({ default: module.Architecture })));
const LecturerPortal = lazy(() => import('./pages/LecturerPortal').then((module) => ({ default: module.LecturerPortal })));
const Archive = lazy(() => import('./pages/Archive').then((module) => ({ default: module.Archive })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then((module) => ({ default: module.Register })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route element={<ProtectedRoute requiredRole="lecturer" />}>
                  <Route path="/lecturer" element={<LecturerPortal />} />
                </Route>
                <Route path="/archive" element={<Archive />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
