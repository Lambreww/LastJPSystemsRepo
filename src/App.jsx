import { useEffect } from 'react';
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

import { initializeSmoothScroll } from './utils/smoothScroll';
import { trackPageview } from './analytics/track';
import HomePage from './pages/HomePage';

// ✅ само публични страници (admin не го броим)
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // изключваме admin и всичко под него
    if (path.startsWith('/admin')) return;

    trackPageview(path);
  }, [location.pathname]);

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
    </div>
  );
}

export default App;
