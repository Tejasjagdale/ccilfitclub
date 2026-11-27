import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AthletePortal from './components/AthletePortal';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import AthletesPage from './pages/AthletesPage';
import SignInPage from './pages/SignInPage';
import { AppDataProvider, useAppData } from './context/AppDataContext';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const AthleteProfilePage = lazy(() => import('./pages/AthleteProfilePage'));

function RequireAthlete() {
  const { currentUser } = useAppData();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  if (currentUser.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <AthletePortal />;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser } = useAppData();
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (currentUser.role !== 'ADMIN' || currentUser.status !== 'ACTIVE') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { currentUser } = useAppData();
  return currentUser ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAppData();
  if (loading) return <p role="status">Loading OFF·PACE…</p>;
  return <Routes>
    <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
    <Route element={<RequireAthlete />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<Navigate to="/" replace />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/athletes" element={<AthletesPage />} />
      <Route path="/athletes/:employeeId" element={<Suspense fallback={<p role="status">Loading trophy cabinet…</p>}><AthleteProfilePage /></Suspense>} />
      <Route path="/me" element={<Suspense fallback={<p role="status">Loading trophy cabinet…</p>}><AthleteProfilePage /></Suspense>} />
    </Route>
    <Route path="/admin" element={<RequireAdmin><Suspense fallback={<p role="status">Loading admin workspace…</p>}><AdminPage /></Suspense></RequireAdmin>} />
    <Route path="/register" element={<Navigate to="/signin" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <AppDataProvider><AppRoutes /></AppDataProvider>;
}
