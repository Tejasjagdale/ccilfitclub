import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import AthletesPage from './pages/AthletesPage';
import AthleteProfilePage from './pages/AthleteProfilePage';
import SignInPage from './pages/SignInPage';
import AdminPage from './pages/AdminPage';
import { AppDataProvider, useAppData } from './context/AppDataContext';

function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser } = useAppData();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser } = useAppData();
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (currentUser.role !== 'ADMIN' || currentUser.status !== 'ACTIVE') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { currentUser } = useAppData();
  return currentUser ? <Navigate to={currentUser.role === 'ATHLETE' ? `/athletes/${encodeURIComponent(currentUser.employeeId)}` : '/'} replace /> : <>{children}</>;
}

function RoleLanding() {
  const { currentUser } = useAppData();
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (currentUser.role === 'ATHLETE') return <Navigate to={`/athletes/${encodeURIComponent(currentUser.employeeId)}`} replace />;
  return <HomePage />;
}

function AppRoutes() {
  return <Routes>
    <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
    <Route path="/" element={<RequireAuth><RoleLanding /></RequireAuth>} />
    <Route path="/athletes" element={<RequireAuth><AthletesPage /></RequireAuth>} />
    <Route path="/athletes/:employeeId" element={<RequireAuth><AthleteProfilePage /></RequireAuth>} />
    {/* The event-category index and control room are administrator-only. */}
    <Route path="/events" element={<RequireAdmin><EventsPage /></RequireAdmin>} />
    {/* Athletes can open a competition from the Home live/previous lists to view standings and register. */}
    <Route path="/events/:eventId" element={<RequireAuth><EventDetailPage /></RequireAuth>} />
    <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
    <Route path="/register" element={<Navigate to="/signin" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <AppDataProvider><AppRoutes /></AppDataProvider>;
}
