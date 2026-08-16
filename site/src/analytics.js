const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";
const CONSENT_STORAGE_KEY = "gottesman-analytics-consent-v3";
const CONSENT_LIFETIME = 1000 * 60 * 60 * 24 * 180;
const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat"];

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

  try {
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    if (!stored || stored.expiresAt <= Date.now()) {
      return "pending";
    }
    return stored.choice === "accepted" ? "accepted" : "declined";
  } catch {
    return "pending";
  }
}

export function setAnalyticsConsent(nextChoice) {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      choice: nextChoice,
      expiresAt: Date.now() + CONSENT_LIFETIME,
    }),
  );

  if (initialized && window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: nextChoice === "accepted" ? "granted" : "denied",
    });
  }

  if (nextChoice === "declined") {
    clearAnalyticsCookies();
  }
}

function clearAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix)));

  const hostname = window.location.hostname;
  const domains = ["", hostname, `.${hostname}`];

  cookieNames.forEach((name) => {
    domains.forEach((domain) => {
      const domainAttribute = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`;
    });
  });
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

  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    anonymize_ip: true,
    cookie_expires: 60 * 60 * 24 * 180,
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
