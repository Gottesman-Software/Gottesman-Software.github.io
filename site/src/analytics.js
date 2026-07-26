const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";
const CONSENT_STORAGE_KEY = "gottesman-analytics-consent";

let initialized = false;

function hasWindow() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function hasAnalyticsMeasurementId() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function getAnalyticsConsent() {
  if (!hasWindow()) {
    return "pending";
  }
  return window.localStorage.getItem(CONSENT_STORAGE_KEY) || "pending";
}

export function setAnalyticsConsent(nextChoice) {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(CONSENT_STORAGE_KEY, nextChoice);
}

function canTrack() {
  return hasWindow() && hasAnalyticsMeasurementId() && getAnalyticsConsent() === "accepted";
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
}

export function initializeAnalytics() {
  if (!canTrack() || initialized) {
    return false;
  }

  ensureGtag();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  initialized = true;
  return true;
}

export function trackPageView(route, title) {
  if (!canTrack()) {
    return;
  }

  initializeAnalytics();
  window.gtag("event", "page_view", {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: route,
  });
}

export function trackEvent(name, params = {}) {
  if (!canTrack()) {
    return;
  }

  initializeAnalytics();
  window.gtag("event", name, params);
}
