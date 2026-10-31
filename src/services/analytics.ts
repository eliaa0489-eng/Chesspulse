// Privacy-First Telemetry & Dynamic SEO Meta Manager for ChessPulse
// Zero third-party cookies, zero external font/avatar tracking, DSGVO/GDPR compliant.

export type CookieConsentChoice = 'all' | 'essential';

export type AnalyticsEventName =
  | 'page_view'
  | 'profile_scans'
  | 'puzzle_solves'
  | 'user_handle_connected'
  | 'plan_modal_opened'
  | 'cookie_consent_accepted'
  | 'web_vitals_ready'
  | 'beta_waitlist';

const CONSENT_STORAGE_KEY = 'chesspulse_cookie_consent';

export function getCookieConsent(): CookieConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    if (raw === 'all' || raw === 'essential') return raw;
    const parsed = JSON.parse(raw);
    if (parsed?.choice === 'all' || parsed?.choice === 'essential') {
      return parsed.choice;
    }
    return parsed?.accepted ? 'all' : 'essential';
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  try {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        choice,
        accepted: choice === 'all',
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage errors in restricted browsing modes
  }
  if (choice === 'all') {
    trackAnalyticsEvent('cookie_consent_accepted', { choice });
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === 'all';
}

export function trackAnalyticsEvent(
  event: AnalyticsEventName,
  meta?: Record<string, string | number | boolean>
): void {
  if (
    event !== 'cookie_consent_accepted' &&
    event !== 'page_view' &&
    !hasAnalyticsConsent()
  ) {
    return;
  }

  try {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, meta, timestamp: Date.now() }),
      keepalive: true,
    }).catch(() => {
      // Non-blocking telemetry
    });
  } catch {
    // Ignore telemetry network errors
  }
}

export function initPerformanceTelemetry(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  window.addEventListener(
    'load',
    () => {
      setTimeout(() => {
        try {
          const navEntry = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming | undefined;
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(
            (entry) => entry.name === 'first-contentful-paint'
          );

          const fcpMs = fcpEntry ? Math.round(fcpEntry.startTime) : 0;
          const domInteractiveMs = navEntry
            ? Math.round(navEntry.domInteractive)
            : 0;

          if (hasAnalyticsConsent()) {
            trackAnalyticsEvent('web_vitals_ready', {
              fcpMs,
              domInteractiveMs,
            });
          }
        } catch {
          // Safe fallback
        }
      }, 1200);
    },
    { once: true }
  );
}

const PAGE_META: Record<
  'home' | 'puzzles' | 'impressum' | 'datenschutz' | 'notfound',
  { title: string; description: string }
> = {
  home: {
    title: 'ChessPulse — Tactical Chess Analysis & Blunder Recovery',
    description:
      'Connect your Chess.com account to analyze recent matches, uncover tactical blunders with the ChessPulse Tactical Heuristic Engine, and solve personalized puzzles from your own games.',
  },
  puzzles: {
    title: 'Personal Blunder Bank & Tactical Puzzles — ChessPulse',
    description:
      'Train on interactive tactical puzzles generated directly from your own Chess.com mistakes and blunders.',
  },
  impressum: {
    title: 'Impressum & Legal Disclosure (§ 5 DDG) — ChessPulse',
    description:
      'Legal disclosure, maintainer contact details, and non-affiliation notice for the ChessPulse public beta.',
  },
  datenschutz: {
    title: 'Privacy Policy & Data Protection (DSGVO / GDPR) — ChessPulse',
    description:
      'Zero-password architecture, server-side proxy data protection, and GDPR compliance documentation for ChessPulse.',
  },
  notfound: {
    title: 'Page Not Found (404) — ChessPulse',
    description:
      'The requested coordinate or page could not be found on ChessPulse.',
  },
};

export function updatePageSeo(
  view: 'home' | 'puzzles' | 'impressum' | 'datenschutz' | 'notfound'
): void {
  if (typeof document === 'undefined') return;
  const meta = PAGE_META[view] || PAGE_META.home;
  document.title = meta.title;

  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', meta.description);

  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  if (ogTitleEl) ogTitleEl.setAttribute('content', meta.title);

  const ogDescEl = document.querySelector('meta[property="og:description"]');
  if (ogDescEl) ogDescEl.setAttribute('content', meta.description);
}
