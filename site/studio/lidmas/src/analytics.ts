const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";
const CONSENT_STORAGE_KEY = "gottesman-analytics-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function canUseDocument() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function hasConsent() {
  return (
    canUseDocument() &&
    Boolean(GA_MEASUREMENT_ID) &&
    window.localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted"
  );
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

export function initializeStudioAnalytics() {
  if (!hasConsent() || initialized) {
    return false;
  }

  ensureGtag();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  initialized = true;
  return true;
}

export function trackStudioPageView(path: string, title: string) {
  if (!hasConsent()) {
    return;
  }

  initializeStudioAnalytics();
  window.gtag?.("event", "page_view", {
    page_title: title,
    page_location: window.location.href,
    page_path: `/studio/lidmas-app${path}`,
  });
}

export function trackStudioEvent(name: string, params: Record<string, unknown> = {}) {
  if (!hasConsent()) {
    return;
  }

  initializeStudioAnalytics();
  window.gtag?.("event", name, params);
}
