import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import './Header.css';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      logout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // ✅ Работи от всяка страница: /admin, /something -> /#about и т.н.
  const goToSection = (id) => {
    navigate(`/#${id}`);
    setIsMenuOpen(false);
  };

  // ✅ За страници (route-ове): /configurator, /admin и т.н.
  const goToPage = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div
              className="logo"
              onClick={() => goToPage("/")}
              style={{ cursor: 'pointer' }}
            >
              <h1>JP Systems</h1>
              <span>Industrial & Garage Doors</span>
            </div>

            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <a href="#home" onClick={(e) => { e.preventDefault(); goToSection("home"); }}>
                Начало
              </a>
              <a href="#about" onClick={(e) => { e.preventDefault(); goToSection("about"); }}>
                За нас
              </a>
              <a href="#services" onClick={(e) => { e.preventDefault(); goToSection("services"); }}>
                Услуги
              </a>
              <a href="#gallery" onClick={(e) => { e.preventDefault(); goToSection("gallery"); }}>
                Галерия
              </a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); goToSection("contact"); }}>
                Контакти
              </a>

              {/* ✅ НОВО: Конфигуратор като отделна страница */}
              <a
                href="/configurator"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage("/configurator");
                }}
              >
                Конфигуратор
              </a>
            </nav>

            <div className="header-actions">
              {/* ✅ ADMIN BUTTON – вижда се за ВСЕКИ admin */}
              {user?.role === "admin" && (
                <button
                  className="auth-btn"
                  onClick={() => goToPage("/admin")}
                  style={{ marginRight: 10 }}
                >
                  🛠 Админ
                </button>
              )}

              <button className="auth-btn" onClick={handleAuthClick}>
                {user ? (
                  <>
                    <span className="user-icon">👤</span>
                    <span className="user-name">
                      {user.displayName || user.email}
                    </span>
                    <span className="logout-text"> (Изход)</span>
                  </>
                ) : (
                  'Вход'
                )}
              </button>

              <button
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default Header;
