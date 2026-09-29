import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ThreeDOceanPage } from './pages/ThreeDOceanPage';
import FisheriesPage from './pages/FisheriesPage';
import { MarineRoutesPage } from './pages/MarineRoutesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/3d" element={<ThreeDOceanPage />} />
          <Route path="/fisheries" element={<FisheriesPage />} />
          <Route path="/routes" element={<MarineRoutesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

