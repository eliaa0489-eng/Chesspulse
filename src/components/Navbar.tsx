import React, { useState, useEffect } from 'react';
import { Menu, X, BarChart2, Lock } from 'lucide-react';
import { fetchLivePlayerStats } from '../services/chessComApi';

interface NavbarProps {
  currentPage: 'home' | 'puzzles' | 'personal-puzzles' | 'impressum' | 'datenschutz' | 'notfound';
  onNavigate: (page: 'home' | 'puzzles' | 'impressum' | 'datenschutz') => void;
  loggedInUser: string | null;
  activeUsername?: string;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenScan: () => void;
  onOpenProfileStats: () => void;
  onOpenShare?: () => void;
  isPayingUser?: boolean;
}

/**
 * Minimalist Staunton King SVG Silhouette
 */
export function StauntonKingMark({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Staunton Finial Cross */}
      <path
        d="M12 2V5.5M10.1 3.6H13.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Sculpted Staunton King Crown & Tapered Body Silhouette */}
      <path
        d="M7.2 8.8C7.2 6.8 9.3 5.6 12 5.6C14.7 5.6 16.8 6.8 16.8 8.8C16.8 10.3 15.6 11.4 14.8 12.6L16.1 17.2H7.9L9.2 12.6C8.4 11.4 7.2 10.3 7.2 8.8Z"
        fill="currentColor"
      />
      {/* Royal Pedestal Collar & Weighted Base */}
      <path
        d="M6.5 19.2H17.5M5.5 21.2H18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar({
  currentPage,
  onNavigate,
  loggedInUser,
  activeUsername = 'Hikaru',
  onOpenLogin,
  onOpenProfileStats,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [liveRating, setLiveRating] = useState<number | null>(null);

  const effectiveHandle = loggedInUser || activeUsername || 'Hikaru';

  // Fetch real player avatar & primary rating for the navbar profile avatar button
  useEffect(() => {
    let cancelled = false;
    fetchLivePlayerStats(effectiveHandle).then((res) => {
      if (cancelled) return;
      if (res.code === 'OK' && res.data) {
        setAvatarUrl(res.data.avatar);
        const primaryRating =
          res.data.blitz.current ??
          res.data.rapid.current ??
          res.data.bullet.current ??
          null;
        setLiveRating(primaryRating);
      } else {
        setAvatarUrl(undefined);
        setLiveRating(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [effectiveHandle]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOverviewClick = () => {
    setMobileMenuOpen(false);
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      // safe fallback
    }
  };

  const handlePuzzleClick = () => {
    setMobileMenuOpen(false);
    if (!loggedInUser) {
      onOpenLogin();
      return;
    }
    onNavigate('puzzles');
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-3 pb-2 px-4 sm:px-6 transition-all pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        {/* 1. Left: Minimalist Staunton King Brand Logo */}
        <button
          type="button"
          onClick={handleOverviewClick}
          className="flex items-center gap-2.5 text-slate-900 group shrink-0 cursor-pointer text-left bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all"
          title="Back to top"
        >
          <div className="relative w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center text-white shadow-2xs transition-transform duration-200 group-hover:scale-105">
            <StauntonKingMark className="w-4 h-4 text-white" />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#059669] border-2 border-white"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center">
            ChessPulse
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#059669] ml-1"
              aria-hidden="true"
            />
          </span>
        </button>

        {/* 2. Center: Clean Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-full px-2 py-1.5 shadow-xs">
          <button
            type="button"
            onClick={handleOverviewClick}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              currentPage === 'home'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => scrollTo('how-it-works')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => scrollTo('performance-dashboard')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
          >
            Telemetry
          </button>

          <button
            type="button"
            onClick={() => scrollTo('analyzer')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
          >
            Move Analyzer
          </button>

          <button
            type="button"
            onClick={() => scrollTo('features')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
          >
            Features
          </button>

          {/* Personal Puzzles (Redirects unauthenticated new users to Sign-In to unlock) */}
          <button
            type="button"
            onClick={handlePuzzleClick}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              currentPage === 'puzzles' || currentPage === 'personal-puzzles'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70'
            }`}
            title={
              loggedInUser
                ? 'Open Personal Puzzles Studio'
                : 'Sign in with your Chess.com handle to unlock Personal Puzzles'
            }
          >
            <span>Personal Puzzles</span>
            {loggedInUser ? (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentPage === 'puzzles' ? 'bg-emerald-400' : 'bg-[#059669]'
                }`}
              />
            ) : (
              <Lock className="w-3 h-3 text-emerald-600/80" />
            )}
          </button>

          <button
            type="button"
            onClick={() => scrollTo('pricing')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
          >
            Pricing
          </button>

          <button
            type="button"
            onClick={() => scrollTo('faq')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer whitespace-nowrap"
          >
            FAQ
          </button>
        </nav>

        {/* 3. Right: Focused Solely on the Clickable Profile Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenProfileStats}
            className="group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-slate-300 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title={`View @${effectiveHandle}'s Live Chess.com Statistics`}
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Chess.com profile avatar for @${effectiveHandle}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={() => setAvatarUrl(undefined)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <StauntonKingMark className="w-3.5 h-3.5 text-white" />
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#059669] ring-1 ring-white" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#059669] transition-colors leading-none">
                  @{effectiveHandle}
                </span>
                {liveRating !== null && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 tabular-nums leading-none">
                    {liveRating}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1 leading-none mt-0.5">
                <BarChart2 className="w-2.5 h-2.5 text-[#059669]" />
                <span>Live Stats</span>
              </span>
            </div>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full bg-white border border-[#E2E8F0] text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] shadow-xl space-y-2 pointer-events-auto max-w-sm mx-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenProfileStats();
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-900 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between"
          >
            <span>@{effectiveHandle} Live Statistics</span>
            <span className="font-mono text-[#059669] tabular-nums">
              {liveRating ? `${liveRating} ELO →` : 'View →'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleOverviewClick}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => scrollTo('how-it-works')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollTo('features')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollTo('performance-dashboard')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            Telemetry &amp; Stats
          </button>
          <button
            type="button"
            onClick={() => scrollTo('analyzer')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            Move Analyzer
          </button>
          <button
            type="button"
            onClick={handlePuzzleClick}
            className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-700 rounded-xl bg-emerald-50 flex items-center justify-between"
          >
            <span>Personal Puzzles Studio</span>
            {loggedInUser ? <span>→</span> : <Lock className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
          <button
            type="button"
            onClick={() => scrollTo('pricing')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            Pricing
          </button>
          <button
            type="button"
            onClick={() => scrollTo('faq')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-800 rounded-xl hover:bg-slate-50"
          >
            FAQ
          </button>
        </div>
      )}
    </header>
  );
}
