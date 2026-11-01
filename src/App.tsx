import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { KeyMetricsStrip } from './components/KeyMetricsStrip';
import { CoreFeaturesSection } from './components/CoreFeaturesSection';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { MoveByMoveAnalyzer } from './components/MoveByMoveAnalyzer';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { BottomCtaBanner } from './components/BottomCtaBanner';
import { Footer } from './components/Footer';
import type { ShareData } from './components/ShareModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { sanitizeChessHandle } from './services/chessComApi';
import {
  updatePageSeo,
  trackAnalyticsEvent,
  initPerformanceTelemetry,
} from './services/analytics';

// Code-split secondary routes and modals for fast First Contentful Paint (FCP)
const PersonalPuzzlesPage = lazy(() =>
  import('./pages/PersonalPuzzlesPage').then((m) => ({ default: m.PersonalPuzzlesPage }))
);
const LegalPages = lazy(() =>
  import('./components/LegalPages').then((m) => ({ default: m.LegalPages }))
);
const NotFoundPage = lazy(() =>
  import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const AnalysisModal = lazy(() =>
  import('./components/AnalysisModal').then((m) => ({ default: m.AnalysisModal }))
);
const PlanModal = lazy(() =>
  import('./components/PlanModal').then((m) => ({ default: m.PlanModal }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const PolicyModal = lazy(() =>
  import('./components/PolicyModal').then((m) => ({ default: m.PolicyModal }))
);
const UserProfileStatsModal = lazy(() =>
  import('./components/UserProfileStatsModal').then((m) => ({ default: m.UserProfileStatsModal }))
);
const ShareModal = lazy(() =>
  import('./components/ShareModal').then((m) => ({ default: m.ShareModal }))
);

export type AppRoute = 'home' | 'puzzles' | 'impressum' | 'datenschutz' | 'notfound';

function resolveInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path === '/impressum' || hash === '#impressum') return 'impressum';
  if (path === '/datenschutz' || hash === '#datenschutz') return 'datenschutz';
  if (path === '/puzzles' || hash === '#puzzles' || hash === '#personal-puzzles') {
    return 'puzzles';
  }
  if (path === '/' || path === '/index.html' || path === '') {
    return 'home';
  }
  return 'notfound';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppRoute>(resolveInitialRoute);

  // Theme state (persisted in localStorage under 'chesspulse-theme', defaults to 'light')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('chesspulse-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('chesspulse-theme', theme);
    } catch {
      // safe fallback
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User authentication state (saved in localStorage, strictly sanitized)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('chesspulse_user');
      if (!saved) return null;
      return sanitizeChessHandle(saved) || null;
    } catch {
      return null;
    }
  });

  // Paying subscriber state (saved in localStorage)
  const [isPayingUser, setIsPayingUser] = useState<boolean>(() => {
    try {
      return localStorage.getItem('chesspulse_plan') !== null;
    } catch {
      return false;
    }
  });

  // Modal states
  const [analyzedUser, setAnalyzedUser] = useState<string | null>(loggedInUser || null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTargetRoute, setAuthTargetRoute] = useState<AppRoute>('home');
  const [isProfileStatsModalOpen, setIsProfileStatsModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'compliance' | 'privacy' | 'terms' | null>(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({
    title: 'ChessPulse Verified Record',
    description: 'Track all-time wins, verified ELO, and engine-calculated brilliant moves.',
    type: 'profile',
  });

  // Initialize Web Vitals & Performance Telemetry once on mount
  useEffect(() => {
    initPerformanceTelemetry();
  }, []);

  // Dynamically update SEO meta tags and track anonymous page view on route change
  useEffect(() => {
    updatePageSeo(currentPage);
    trackAnalyticsEvent('page_view', { route: currentPage });
  }, [currentPage]);

  // Sync pathname and hash routing cleanly without hard reload
  useEffect(() => {
    const syncRoute = () => {
      setCurrentPage(resolveInitialRoute());
    };

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const navigateTo = (page: AppRoute, sectionId?: string) => {
    if (page === 'puzzles' && !loggedInUser) {
      setAuthTargetRoute('puzzles');
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentPage(page);
    const targetPath =
      page === 'puzzles'
        ? '/puzzles'
        : page === 'impressum'
        ? '/impressum'
        : page === 'datenschutz'
        ? '/datenschutz'
        : page === 'notfound'
        ? '/404'
        : '/';
    const targetHash =
      page === 'puzzles'
        ? '#puzzles'
        : page === 'impressum'
        ? '#impressum'
        : page === 'datenschutz'
        ? '#datenschutz'
        : sectionId
        ? `#${sectionId}`
        : '';
    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      // safe fallback
    }
    if (targetHash) {
      window.location.hash = targetHash;
    } else if (window.location.hash) {
      try {
        window.history.replaceState(null, '', targetPath);
      } catch {
        // safe fallback
      }
    }
    if (sectionId && page === 'home') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogin = (username: string, targetRoute: AppRoute = authTargetRoute) => {
    const clean = sanitizeChessHandle(username) || 'hikaru';
    setLoggedInUser(clean);
    setAnalyzedUser(clean);
    trackAnalyticsEvent('user_handle_connected', { handleLength: clean.length });
    try {
      localStorage.setItem('chesspulse_user', clean);
    } catch {
      // safe fallback
    }
    if (targetRoute === 'puzzles') {
      setCurrentPage('puzzles');
      try {
        window.history.pushState(null, '', '/puzzles');
      } catch {
        // safe fallback
      }
      window.location.hash = '#puzzles';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById('performance-dashboard');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    try {
      localStorage.removeItem('chesspulse_user');
    } catch {
      // safe fallback
    }
    setCurrentPage('home');
  };

  // Handlers
  const handleAnalyzeUsername = (username: string) => {
    const clean = sanitizeChessHandle(username) || 'hikaru';
    setLoggedInUser(clean);
    setAnalyzedUser(clean);
    trackAnalyticsEvent('profile_scans', { source: currentPage });
    try {
      localStorage.setItem('chesspulse_user', clean);
    } catch {
      // safe fallback
    }
    if (currentPage !== 'home') {
      setCurrentPage('home');
      try {
        window.history.pushState(null, '', '/');
      } catch {
        // safe fallback
      }
    }
    setTimeout(() => {
      const el = document.getElementById('performance-dashboard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleSelectPlan = (planName: string, price: string) => {
    setSelectedPlan({ name: planName, price });
    setIsPlanModalOpen(true);
    trackAnalyticsEvent('plan_modal_opened', { planName });
  };

  const handleStepDemo = (stepNumber: number) => {
    if (stepNumber === 1 || stepNumber === 2) {
      handleAnalyzeUsername(loggedInUser || 'Hikaru');
    } else {
      navigateTo('puzzles');
    }
  };

  const handleOpenShare = (data: ShareData) => {
    setShareData(data);
    setIsShareModalOpen(true);
  };

  const handleDefaultShare = () => {
    handleOpenShare({
      title: loggedInUser ? `@${loggedInUser}'s ChessPulse Record` : 'ChessPulse Chess Record',
      description: 'Verified match analytics, blunder-based puzzles, and lifetime tactical mastery.',
      type: 'profile',
      stats: {
        username: loggedInUser || 'Hikaru',
        elo: 1850,
        allTimeWins: 1842,
        brilliantMoves: 42,
        winRate: 58,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-[#0F172A] dark:text-[#f9fafb] font-sans antialiased selection:bg-[#DCFCE7] selection:text-[#065F46] transition-colors duration-200">
      {/* Sticky Top Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => navigateTo(page)}
        loggedInUser={loggedInUser}
        activeUsername={analyzedUser || loggedInUser || 'Hikaru'}
        onLogout={handleLogout}
        onOpenLogin={() => {
          setAuthTargetRoute('home');
          setIsAuthModalOpen(true);
        }}
        onOpenScan={() => navigateTo('puzzles')}
        onOpenProfileStats={() => setIsProfileStatsModalOpen(true)}
        onOpenShare={handleDefaultShare}
        isPayingUser={isPayingUser}
      />

      {/* Conditional Page Rendering with Code-Splitting Suspense */}
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center bg-[#F8FAFC]">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-ping" />
              <span>Loading ChessPulse Studio...</span>
            </div>
          </div>
        }
      >
        {currentPage === 'puzzles' ? (
          <PersonalPuzzlesPage
            loggedInUser={loggedInUser}
            onLogin={(u) => handleLogin(u, 'puzzles')}
            onLogout={handleLogout}
            onBackToHome={() => navigateTo('home')}
            onOpenShare={handleOpenShare}
            isPayingUser={isPayingUser}
          />
        ) : currentPage === 'impressum' || currentPage === 'datenschutz' ? (
          <LegalPages page={currentPage} onNavigate={(page) => navigateTo(page)} />
        ) : currentPage === 'notfound' ? (
          <NotFoundPage
            onNavigateHome={() => navigateTo('home')}
            onNavigatePuzzles={() => navigateTo('puzzles')}
            onAnalyzeUsername={handleAnalyzeUsername}
          />
        ) : (
          /* Main Marketing & Analyzer Homepage */
          <main className="w-full">
            {/* 1. Hero Section with Search & iPhone 16 Pro 3D King Telemetry Showcase */}
            <HeroSection
              onAnalyzeUsername={handleAnalyzeUsername}
              onScrollToPuzzles={() => navigateTo('puzzles')}
            />

            {/* 2. How ChessPulse Works — 3-Step Introductory Flow */}
            <HowItWorksSection onSelectStep={handleStepDemo} />

            {/* 3. High-End Performance & Progression Analytics Dashboard */}
            <PerformanceDashboard
              username={analyzedUser || loggedInUser || 'Hikaru'}
              loggedInUser={loggedInUser}
              onOpenLogin={() => {
                setAuthTargetRoute('home');
                setIsAuthModalOpen(true);
              }}
              onExploreMatch={() => {
                const el = document.getElementById('analyzer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 4. Real Match Archive & Move-By-Move Engine Analyzer (Zero Hallucination) */}
            <section id="analyzer" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-xs font-bold text-emerald-800 mb-2">
                  <span>Live Chess.com Archives Sync • Zero Mock Opponents</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Grandmaster Match &amp; Move Analyzer
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Inspect actual games played on Chess.com. Move classifications are strictly calculated from the ChessPulse Tactical Heuristic Engine.
                </p>
              </div>

              <MoveByMoveAnalyzer
                initialUsername={analyzedUser || loggedInUser || 'Hikaru'}
                onOpenShare={handleOpenShare}
                onUsernameChange={(u) => setAnalyzedUser(sanitizeChessHandle(u) || u)}
                onOpenProfileStats={() => setIsProfileStatsModalOpen(true)}
              />
            </section>

            {/* 5. Partner / Key Metrics Strip */}
            <KeyMetricsStrip />

            {/* 6. Core Features Section */}
            <CoreFeaturesSection onTryPuzzle={() => navigateTo('puzzles')} />

            {/* 7. ChessPulse Pricing Section */}
            <PricingSection onSelectPlan={handleSelectPlan} />

            {/* 8. Interactive FAQ */}
            <FaqSection />

            {/* 9. Bottom CTA Banner */}
            <BottomCtaBanner onAnalyzeUsername={handleAnalyzeUsername} />
          </main>
        )}
      </Suspense>

      {/* 10. Minimal Footer */}
      <Footer
        onOpenCompliance={() => setPolicyType('compliance')}
        onOpenPrivacy={() => navigateTo('datenschutz')}
        onOpenTerms={() => setPolicyType('terms')}
        onNavigateLegal={(legalPage) => navigateTo(legalPage)}
        onNavigatePage={(page, sectionId) => navigateTo(page, sectionId)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Non-Intrusive Apple/Stripe Cookie Consent Banner */}
      <CookieConsentBanner onNavigateLegal={(legalPage) => navigateTo(legalPage)} />

      {/* Interactive Modals (Lazy-Loaded on Demand) */}
      <Suspense fallback={null}>
        {isAnalysisModalOpen && (
          <AnalysisModal
            username={analyzedUser || loggedInUser || 'Hikaru'}
            isOpen={isAnalysisModalOpen}
            onClose={() => setIsAnalysisModalOpen(false)}
            onSelectPuzzle={() => {
              handleLogin(analyzedUser || 'Hikaru');
            }}
          />
        )}

        {selectedPlan && isPlanModalOpen && (
          <PlanModal
            planName={selectedPlan.name}
            price={selectedPlan.price}
            isOpen={isPlanModalOpen}
            onClose={() => setIsPlanModalOpen(false)}
            onPlanActivated={() => {
              setIsPayingUser(true);
            }}
          />
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={(user) => {
              handleLogin(user);
            }}
          />
        )}

        {policyType && (
          <PolicyModal
            type={policyType}
            onClose={() => setPolicyType(null)}
          />
        )}

        {/* Community Share Modal */}
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            data={shareData}
          />
        )}

        {/* Live Chess.com User Profile Statistics Modal */}
        {isProfileStatsModalOpen && (
          <UserProfileStatsModal
            username={analyzedUser || loggedInUser || 'Hikaru'}
            isOpen={isProfileStatsModalOpen}
            onClose={() => setIsProfileStatsModalOpen(false)}
            onChangeUsername={(newUser) => setAnalyzedUser(newUser)}
            onNavigateToPuzzles={() => navigateTo('puzzles')}
          />
        )}
      </Suspense>
    </div>
  );
}
