import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, SlidersHorizontal, Check, X } from 'lucide-react';
import {
  getCookieConsent,
  setCookieConsent,
  CookieConsentChoice,
} from '../services/analytics';

interface CookieConsentBannerProps {
  onNavigateLegal: (page: 'impressum' | 'datenschutz') => void;
}

export function CookieConsentBanner({ onNavigateLegal }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      const timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 900);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: CookieConsentChoice) => {
    setCookieConsent(choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label="Cookie and Privacy Preferences"
          className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl shadow-slate-950/15 p-4 sm:p-5 text-slate-900 dark:text-slate-100"
        >
          <div className="space-y-3.5">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#059669] dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Privacy &amp; Cookie Preferences
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Zero ad trackers · GDPR / DSGVO compliant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleChoice('essential')}
                aria-label="Decline optional cookies and close"
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Concise Explanation */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We use essential local storage to keep your Chess.com handle synced and optional anonymous telemetry to measure engine load speed. Read our{' '}
              <button
                type="button"
                onClick={() => onNavigateLegal('datenschutz')}
                className="font-semibold text-[#047857] dark:text-emerald-400 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => onNavigateLegal('impressum')}
                className="font-semibold text-slate-700 dark:text-slate-300 underline underline-offset-2 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Impressum
              </button>
              .
            </p>

            {/* Optional Expandable Preferences */}
            {showCustomize && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/70 border border-[#E2E8F0] dark:border-slate-700/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Essential Session Storage
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Required for active handle &amp; puzzle state
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#047857] dark:text-emerald-400">
                    Always Active
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Anonymous Performance Telemetry
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Helps optimize Heuristic Engine load &amp; FCP speed
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsEnabled}
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      analyticsEnabled
                        ? 'bg-[#059669] justify-end'
                        : 'bg-slate-300 dark:bg-slate-600 justify-start'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-white shadow-2xs" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setShowCustomize(!showCustomize)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showCustomize ? 'Hide Options' : 'Customize'}</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() =>
                    handleChoice(
                      showCustomize && analyticsEnabled ? 'all' : 'essential'
                    )
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {showCustomize ? 'Save Choice' : 'Essential Only'}
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice('all')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-950 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
