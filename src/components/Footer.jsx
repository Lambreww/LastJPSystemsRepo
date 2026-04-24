import './Footer.css';
import { openCookieSettings } from '../utils/cookieConsent';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="footer-copy">
            &copy; 2024 JP Systems - Industrial & Garage Doors
          </p>
          <button
            type="button"
            className="footer-cookie-button"
            onClick={openCookieSettings}
          >
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
