import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AthletesPage from './pages/AthletesPage';
import AthleteProfilePage from './pages/AthleteProfilePage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/athletes" element={<AthletesPage />} />
      <Route path="/athletes/:employeeId" element={<AthleteProfilePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}