import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, Mail, Sparkles, AlertCircle, Moon, Sun } from 'lucide-react';

interface FooterProps {
  onOpenCompliance: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onNavigateLegal?: (page: 'impressum' | 'datenschutz') => void;
  onNavigatePage?: (page: 'home' | 'puzzles' | 'impressum' | 'datenschutz', sectionId?: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function Footer({
  onOpenCompliance,
  onOpenPrivacy,
  onOpenTerms,
  onNavigateLegal,
  onNavigatePage,
  theme = 'light',
  onToggleTheme,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [emailInput, setEmailInput] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    const trimmed = emailInput.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmailInput('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const handleSectionLink = (e: React.MouseEvent, sectionId: string) => {
    if (onNavigatePage) {
      e.preventDefault();
      onNavigatePage('home', sectionId);
    }
  };

  return (
    <footer className="w-full bg-[#0F241A] text-slate-300 relative overflow-hidden pt-16 sm:pt-20 pb-12 border-t border-[#1C3D2C]">
      {/* Subtle emerald ambient top gradient glow */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-800/15 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Row: Brand Info + Newsletter Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-[#1C3D2C]/80">
          {/* Brand Presentation */}
          <div className="lg:col-span-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                if (onNavigatePage) {
                  onNavigatePage('home');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="relative w-9 h-9 rounded-2xl bg-slate-950 border border-[#224835] flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2V5.5M10.1 3.6H13.9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7.2 8.8C7.2 6.8 9.3 5.6 12 5.6C14.7 5.6 16.8 6.8 16.8 8.8C16.8 10.3 15.6 11.4 14.8 12.6L16.1 17.2H7.9L9.2 12.6C8.4 11.4 7.2 10.3 7.2 8.8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M6.5 19.2H17.5M5.5 21.2H18.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#059669] border-2 border-[#0F241A]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                ChessPulse
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#059669] ml-1" />
              </span>
            </button>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              The data-driven chess training engine. We turn online blunders into high-retention tactical puzzles and actionable performance analytics using public Chess.com API telemetry.
            </p>

            <div className="pt-1">
              <p className="text-[11px] text-slate-400 leading-normal max-w-sm">
                Independent analytical application. Not affiliated with, endorsed by, or sponsored by Chess.com, LLC.
              </p>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 bg-[#142e22]/90 rounded-3xl p-6 sm:p-7 border border-[#224835] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Stay Ahead of Your Blunders
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Subscribe to Weekly Engine Insights &amp; PGN Audits
              </h4>
              <p className="text-xs text-slate-300">
                Receive new tactical patterns, opening meta shifts, and release notes directly.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              noValidate
              className="w-full sm:w-auto shrink-0 flex flex-col gap-1.5"
            >
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="Enter your email..."
                    aria-invalid={Boolean(emailError)}
                    className="w-full sm:w-60 pl-10 pr-3 py-2.5 min-h-[40px] bg-[#0a1b13] border border-emerald-800/80 rounded-full text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 min-h-[40px] rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-emerald-950/40"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {emailError && (
                <p role="alert" className="text-[11px] text-rose-300 font-medium flex items-center gap-1 pl-2">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {subscribed && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Thank you for subscribing! Your tactical training updates are activated.</span>
          </div>
        )}

        {/* 4 Organized Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-12 border-b border-[#1C3D2C]/80 text-xs">
          {/* Column 1: Solutions */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">
              Solutions
            </h5>
            <ul className="space-y-2.5 text-slate-300">
              <li>
                <a
                  href="#analyzer"
                  onClick={(e) => handleSectionLink(e, 'analyzer')}
                  className="hover:text-white transition-colors"
                >
                  Grandmaster Analysis
                </a>
              </li>
              <li>
                <a
                  href="#analyzer"
                  onClick={(e) => handleSectionLink(e, 'analyzer')}
                  className="hover:text-white transition-colors"
                >
                  Live PGN Sync
                </a>
              </li>
              <li>
                <a
                  href="/puzzles"
                  onClick={(e) => {
                    if (onNavigatePage) {
                      e.preventDefault();
                      onNavigatePage('puzzles');
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Personal Blunder Studio
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleSectionLink(e, 'pricing')}
                  className="hover:text-white transition-colors"
                >
                  Club &amp; Coach Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Free Tools */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">
              Free Tools
            </h5>
            <ul className="space-y-2.5 text-slate-300">
              <li>
                <a
                  href="#performance-dashboard"
                  onClick={(e) => handleSectionLink(e, 'performance-dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Performance Progression
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleSectionLink(e, 'features')}
                  className="hover:text-white transition-colors"
                >
                  Opening Phase Audit
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleSectionLink(e, 'features')}
                  className="hover:text-white transition-colors"
                >
                  Time-Trouble Detector
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleSectionLink(e, 'pricing')}
                  className="hover:text-white transition-colors"
                >
                  3 Free Daily Scans
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">
              Features
            </h5>
            <ul className="space-y-2.5 text-slate-300">
              <li>
                <a
                  href="#analyzer"
                  onClick={(e) => handleSectionLink(e, 'analyzer')}
                  className="hover:text-white transition-colors"
                >
                  Tactical Heuristic Engine
                </a>
              </li>
              <li>
                <a
                  href="#performance-dashboard"
                  onClick={(e) => handleSectionLink(e, 'performance-dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Centipawn Loss Bar
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleSectionLink(e, 'how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  Staunton Vector SVGs
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleSectionLink(e, 'pricing')}
                  className="hover:text-white transition-colors"
                >
                  Free Public Beta Tier
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Legal */}
          <div className="space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">
              Company &amp; Legal
            </h5>
            <ul className="space-y-2.5 text-slate-300">
              <li>
                <a
                  href="/impressum"
                  onClick={(e) => {
                    if (onNavigateLegal) {
                      e.preventDefault();
                      onNavigateLegal('impressum');
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left block"
                >
                  Impressum (§ 5 DDG)
                </a>
              </li>
              <li>
                <a
                  href="/datenschutz"
                  onClick={(e) => {
                    if (onNavigateLegal) {
                      e.preventDefault();
                      onNavigateLegal('datenschutz');
                    } else {
                      e.preventDefault();
                      onOpenPrivacy();
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left block"
                >
                  Datenschutz (DSGVO / GDPR)
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCompliance}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Chess.com API Compliance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service (Beta)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server-Side Read-Only Public API Proxy</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>DSGVO / GDPR Compliant</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
            {/* Minimalist Theme Switcher (Moon/Sun Icon + Label) */}
            {onToggleTheme && (
              <>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#153123] hover:bg-[#1C3D2C] dark:bg-[#111111] dark:hover:bg-[#161616] border border-[#234B37] dark:border-[#222222] text-slate-200 hover:text-white transition-all cursor-pointer font-medium"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <a
              href="/impressum"
              onClick={(e) => {
                if (onNavigateLegal) {
                  e.preventDefault();
                  onNavigateLegal('impressum');
                }
              }}
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Impressum
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/datenschutz"
              onClick={(e) => {
                if (onNavigateLegal) {
                  e.preventDefault();
                  onNavigateLegal('datenschutz');
                }
              }}
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Datenschutz
            </a>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono">
              &copy; {currentYear} ChessPulse (Public Beta)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
