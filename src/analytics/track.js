import { db } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Прост "мини-analytics" (без външни услуги).
 * - visitorId: пазим в localStorage (дълготраен)
 * - sessionId: пазим в sessionStorage (за текущия tab) + session timeout
 * - изпращаме: session_start (веднъж на сесия) + pageview (при route change)
 */

const VISITOR_KEY = "jp_visitor_id_v1";
const SESSION_KEY = "jp_session_id_v1";
const SESSION_LAST_KEY = "jp_session_last_seen_v1";

// 30 мин. inactivity = нова сесия
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function uuid() {
  // достатъчно за идентификатор (не криптографски)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getOrCreateSessionId() {
  const now = Date.now();
  const lastSeen = Number(sessionStorage.getItem(SESSION_LAST_KEY) || "0");
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  const expired = !lastSeen || now - lastSeen > SESSION_TIMEOUT_MS;

  if (!sessionId || expired) {
    sessionId = uuid();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(SESSION_LAST_KEY, String(now));
    return { sessionId, isNew: true };
  }

  sessionStorage.setItem(SESSION_LAST_KEY, String(now));
  return { sessionId, isNew: false };
}

function safeReferrer() {
  try {
    return document.referrer || "";
  } catch {
    return "";
  }
}

function safeUA() {
  try {
    return navigator.userAgent || "";
  } catch {
    return "";
  }
}

async function writeEvent(payload) {
  // ако Firestore е временно недостъпен — да не чупи UX
  try {
    await addDoc(collection(db, "analytics_events"), {
      ...payload,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // без alert — само console
    console.warn("Analytics write failed:", e);
  }
}

/**
 * Извикай при всяко route change (pageview).
 * Автоматично ще запише и session_start ако е нова сесия.
 */
export async function trackPageview(pathname) {
  const visitorId = getVisitorId();
  const { sessionId, isNew } = getOrCreateSessionId();

  // нова сесия -> session_start
  if (isNew) {
    await writeEvent({
      type: "session_start",
      visitorId,
      sessionId,
      path: pathname,
      referrer: safeReferrer(),
      userAgent: safeUA(),
    });
  }

  // pageview
  await writeEvent({
    type: "pageview",
    visitorId,
    sessionId,
    path: pathname,
    referrer: safeReferrer(),
    userAgent: safeUA(),
  });
}
