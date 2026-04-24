import { useEffect, useState } from "react";
import "./CookieBanner.css";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_SETTINGS_EVENT,
  getStoredConsent,
  saveConsent,
} from "../utils/cookieConsent";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(() => !getStoredConsent());

  useEffect(() => {
    const handleConsentChange = () => {
      setIsVisible(!getStoredConsent());
    };

    const handleSettingsOpen = () => {
      setIsVisible(true);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    window.addEventListener(COOKIE_SETTINGS_EVENT, handleSettingsOpen);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, handleSettingsOpen);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Настройки за бисквитки"
    >
      <div className="cookie-banner__content">
        <p className="cookie-banner__eyebrow">JPSystems</p>
        <h2>Използваме бисквитки и локално съхранение</h2>
        <p>
          Сайтът използва задължителни данни за нормална работа и аналитични
          бисквитки/локално съхранение, за да измерваме посещенията. Аналитиката
          ще се активира само ако я приемеш.
        </p>
      </div>

      <div className="cookie-banner__actions">
        <button
          type="button"
          className="btn btn-outline cookie-banner__button"
          onClick={() => saveConsent({ analytics: false })}
        >
          Само задължителни
        </button>
        <button
          type="button"
          className="btn cookie-banner__button"
          onClick={() => saveConsent({ analytics: true })}
        >
          Приеми всички
        </button>
      </div>
    </aside>
  );
};

export default CookieBanner;
