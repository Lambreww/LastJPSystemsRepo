import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import DoorConfigurator from "./pages/DoorConfigurator";

import './styles/globals.css';
import './styles/animations.css';

import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Gallery from './components/Gallery';
import CallToAction from './components/CallToAction';
import Contact from './components/Contact';
import Footer from './components/Footer';

import Advantages from './pages/Advantages';
import AdminPanel from './components/AdminPanel';
import AdminRoute from './components/AdminRoute';
import CookieBanner from './components/CookieBanner';

import { trackPageview } from './analytics/track';
import HomePage from './pages/HomePage';
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from './utils/cookieConsent';

// ✅ само публични страници (admin не го броим)
function AnalyticsTracker() {
  const location = useLocation();
  const [consentVersion, setConsentVersion] = useState(0);

  useEffect(() => {
    const handleConsentChange = () => {
      setConsentVersion((current) => current + 1);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;

    // изключваме admin и всичко под него
    if (path.startsWith('/admin')) return;
    if (!hasAnalyticsConsent()) return;

    trackPageview(path);
  }, [consentVersion, location.pathname]);

  return null;
}



function App() {
  return (
    <div className="App">
      <Header />

      <main className="app-content">
        {/* ✅ tracking на публичните страници */}
        <AnalyticsTracker />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/advantages" element={<Advantages />} />
          <Route path="/configurator" element={<DoorConfigurator />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;
