import { SESSION_KEY, SESSION_LAST_KEY, VISITOR_KEY } from "../analytics/storageKeys";

export const COOKIE_CONSENT_KEY = "jp_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "jp-cookie-consent-changed";
export const COOKIE_SETTINGS_EVENT = "jp-open-cookie-settings";

const defaultConsent = {
  analytics: false,
};

export function getStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultConsent,
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return Boolean(getStoredConsent()?.analytics);
}

export function clearAnalyticsStorage() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(VISITOR_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_LAST_KEY);
}

export function saveConsent(consent) {
  if (typeof window === "undefined") {
    return;
  }

  const nextConsent = {
    ...defaultConsent,
    ...consent,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent));

  if (!nextConsent.analytics) {
    clearAnalyticsStorage();
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: nextConsent }));
}

export function openCookieSettings() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
