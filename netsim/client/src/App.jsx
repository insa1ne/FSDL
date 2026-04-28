import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SimulatorPage from './pages/SimulatorPage';
import SubnetCalcPage from './pages/SubnetCalcPage';
import AboutPage from './pages/AboutPage';
import PrivateRoute from './components/PrivateRoute';
import useThemeStore from './store/useThemeStore';

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      {/* Stitch fixed background layers */}
      <div className="stitch-grid-bg"  aria-hidden="true" />
      <div className="stitch-mesh-bg"  aria-hidden="true" />
      <div className="stitch-noise-bg" aria-hidden="true" />

      <Router>
        <Routes>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/simulator"   element={<PrivateRoute><SimulatorPage /></PrivateRoute>} />
          <Route path="/subnet-calc" element={<SubnetCalcPage />} />
          <Route path="/about"       element={<AboutPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
