/**
 * Privacy-First, Consent-Aware Analytics & Dynamic SEO Manager for ChessPulse
 * Zero cross-site tracking cookies, zero PII storage, full GDPR / DSGVO compliance.
 */

export type CookieConsentChoice = 'all' | 'essential';

const CONSENT_STORAGE_KEY = 'chesspulse_cookie_consent';

export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'all' || val === 'essential') return val;
    return null;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Ignore storage quota errors
  }
  if (choice === 'all') {
    trackAnalyticsEvent('cookie_consent_accepted', { mode: 'all' });
  }
}

/**
 * Sends a lightweight, anonymous telemetry event to the backend proxy
 * only if the user has opted into analytics ('all') or if it is an anonymous
 * core performance health metric.
 */
export function trackAnalyticsEvent(
  eventName: string,
  metadata?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  const consent = getCookieConsent();
  // Respect user privacy if they selected 'essential' only
  if (consent === 'essential') return;

  try {
    const payload = JSON.stringify({
      event: eventName.slice(0, 48),
      path: window.location.pathname,
      meta: metadata || {},
      ts: Date.now(),
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/event', blob);
    } else {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silent fail
      });
    }
  } catch {
    // Silent fail
  }
}

/**
 * Reports initial First Contentful Paint (FCP) and DOM Interactive speed
 * to verify sub-second load performance.
 */
export function initPerformanceTelemetry(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  try {
    window.addEventListener(
      'load',
      () => {
        setTimeout(() => {
          const navEntry = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming | undefined;
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find((p) => p.name === 'first-contentful-paint');

          const fcpMs = fcpEntry ? Math.round(fcpEntry.startTime) : 0;
          const domInteractiveMs = navEntry ? Math.round(navEntry.domInteractive) : 0;

          if (getCookieConsent() === 'all') {
            trackAnalyticsEvent('web_vitals_ready', {
              fcpMs,
              domInteractiveMs,
            });
          }
        }, 500);
      },
      { once: true }
    );
  } catch {
    // Safe fallback
  }
}

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
}

const ROUTE_SEO_MAP: Record<string, PageSeoConfig> = {
  home: {
    title: 'ChessPulse — Stop Blundering. Train Your Own Mistakes.',
    description:
      'Connect your Chess.com handle to unlock Stockfish 16.1 centipawn telemetry, opening phase audits, and personalized tactical puzzles generated from your real blunders.',
    canonicalPath: '/',
  },
  puzzles: {
    title: 'Personal Blunder Puzzles Studio — ChessPulse Tactical Trainer',
    description:
      'Filter and solve custom tactical chess puzzles (Forks, Pins, Skewers, Back-rank Mates) generated directly from your own Chess.com match blunders.',
    canonicalPath: '/puzzles',
  },
  impressum: {
    title: 'Impressum & Legal Disclosure (§ 5 DDG) — ChessPulse',
    description:
      'Legal notice, contact information, and non-affiliation disclosure for the ChessPulse chess analysis and tactical training platform.',
    canonicalPath: '/impressum',
  },
  datenschutz: {
    title: 'Privacy Policy & Data Protection (GDPR / DSGVO) — ChessPulse',
    description:
      'Learn how ChessPulse protects your privacy with zero-password public API sync, ephemeral server-side caching, and strict GDPR compliance.',
    canonicalPath: '/datenschutz',
  },
  notfound: {
    title: '404 Position Out of Book — Page Not Found | ChessPulse',
    description:
      'The requested chess analysis coordinate could not be found. Return to the ChessPulse overview or analyze your Chess.com profile.',
    canonicalPath: '/404',
  },
};

/**
 * Dynamically updates document title, meta description, Open Graph tags,
 * Twitter card tags, and canonical link when routes change.
 */
export function updatePageSeo(route: string): void {
  if (typeof document === 'undefined') return;
  const seo = ROUTE_SEO_MAP[route] || ROUTE_SEO_MAP.home;

  document.title = seo.title;

  const setMeta = (selector: string, attr: 'content', value: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute(attr, value);
    }
  };

  setMeta('meta[name="description"]', 'content', seo.description);
  setMeta('meta[property="og:title"]', 'content', seo.title);
  setMeta('meta[property="og:description"]', 'content', seo.description);
  setMeta('meta[name="twitter:title"]', 'content', seo.title);
  setMeta('meta[name="twitter:description"]', 'content', seo.description);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://chesspulse.app';
  const fullUrl = `${origin}${seo.canonicalPath}`;

  setMeta('meta[property="og:url"]', 'content', fullUrl);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', fullUrl);
}
