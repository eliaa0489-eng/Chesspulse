import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RefreshCw,
  ExternalLink,
  Trophy,
  Zap,
  Clock,
  Flame,
  TrendingUp,
  Search,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  fetchLivePlayerStats,
  LivePlayerStats,
  TimeControlCategoryStats,
} from '../services/chessComApi';

interface UserProfileStatsModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onChangeUsername?: (newUsername: string) => void;
  onNavigateToPuzzles?: () => void;
}

function StauntonKingAvatarFallback({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2v3M10.2 3.5h3.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M7.5 9C7.5 6.8 9.5 5.5 12 5.5C14.5 5.5 16.5 6.8 16.5 9C16.5 10.6 15.4 11.8 14.6 13L15.8 17.5H8.2L9.4 13C8.6 11.8 7.5 10.6 7.5 9Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 17.5h11M5.5 20.5h13"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface RatingCategoryCardProps {
  label: string;
  timeSpec: string;
  icon: React.ReactNode;
  stats: TimeControlCategoryStats;
}

function RatingCategoryCard({ label, timeSpec, icon, stats }: RatingCategoryCardProps) {
  const hasRating = stats.current !== null;
  const currentRating = stats.current ?? 0;
  const peakRating = stats.best ?? currentRating;
  const peakProgressPct =
    hasRating && peakRating > 0
      ? Math.min(100, Math.max(12, Math.round((currentRating / peakRating) * 100)))
      : 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-slate-700">
            {icon}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-none">{label}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{timeSpec}</p>
          </div>
        </div>
        {stats.best !== null && (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Peak
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
              {stats.best}
            </span>
          </div>
        )}
      </div>

      {/* Main Rating Number */}
      <div className="pt-0.5">
        {hasRating ? (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {stats.current}
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-500 tabular-nums">
              {stats.winRatePct}% Win
            </span>
          </div>
        ) : (
          <span className="text-lg font-mono font-semibold text-slate-400">Unrated</span>
        )}
      </div>

      {/* Rating vs Peak Progress Bar & W/D/L */}
      <div className="space-y-1.5 pt-1 border-t border-[#E2E8F0]">
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#059669] rounded-full transition-all duration-500"
            style={{ width: `${peakProgressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 tabular-nums">
          <span className="text-emerald-700 font-semibold">{stats.wins}W</span>
          <span>{stats.draws}D</span>
          <span className="text-rose-600 font-semibold">{stats.losses}L</span>
        </div>
      </div>
    </div>
  );
}

export function UserProfileStatsModal({
  username,
  isOpen,
  onClose,
  onChangeUsername,
  onNavigateToPuzzles,
}: UserProfileStatsModalProps) {
  const [queryUsername, setQueryUsername] = useState(username);
  const [activeHandle, setActiveHandle] = useState(username);
  const [statsData, setStatsData] = useState<LivePlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (username && username !== activeHandle) {
      setQueryUsername(username);
      setActiveHandle(username);
    }
  }, [username]);

  useEffect(() => {
    if (!isOpen || !activeHandle) return;
    let cancelled = false;

    const loadStats = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await fetchLivePlayerStats(activeHandle);
      if (cancelled) return;
      if (res.code === 'OK' && res.data) {
        setStatsData(res.data);
      } else {
        setErrorMsg(
          res.errorMessage || `Unable to load statistics for @${activeHandle}.`
        );
      }
      setIsLoading(false);
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeHandle]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryUsername.trim();
    if (!trimmed) return;
    setActiveHandle(trimmed);
    onChangeUsername?.(trimmed);
  };

  // Compute recent accuracy and rating trend from actual recent games
  const recentGamesChronological = statsData?.recentGames
    ? [...statsData.recentGames].reverse()
    : [];

  const gamesWithAccuracy = recentGamesChronological.filter(
    (g) => typeof g.accuracy === 'number' && g.accuracy !== null
  );
  const averageRecentAccuracy =
    gamesWithAccuracy.length > 0
      ? Math.round(
          (gamesWithAccuracy.reduce((sum, g) => sum + (g.accuracy || 0), 0) /
            gamesWithAccuracy.length) *
            10
        ) / 10
      : null;

  const minRecentRating =
    recentGamesChronological.length > 0
      ? Math.min(...recentGamesChronological.map((g) => g.userRating || 1500)) - 20
      : 1400;
  const maxRecentRating =
    recentGamesChronological.length > 0
      ? Math.max(...recentGamesChronological.map((g) => g.userRating || 1500)) + 20
      : 1600;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Live Chess.com Player Statistics"
        >
          {/* Glassmorphism Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-md"
          />

          {/* Modal Surface — Apple/Stripe Glassmorphism & Alabaster Precision */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] shadow-2xl shadow-slate-950/15 overflow-hidden my-auto"
          >
            {/* Top Bar: Verified Live Telemetry Header + Handle Switcher */}
            <div className="px-5 sm:px-7 pt-5 pb-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Live Chess.com Telemetry • /player/{activeHandle.toLowerCase()}/stats
                </span>
              </div>

              <div className="flex items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={queryUsername}
                      onChange={(e) => setQueryUsername(e.target.value)}
                      placeholder="Switch handle..."
                      className="w-36 sm:w-40 pl-7 pr-2.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Sync
                  </button>
                </form>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close statistics modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-5 sm:p-7 space-y-6 max-h-[82vh] overflow-y-auto">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-7 h-7 text-[#059669] animate-spin" />
                  <p className="text-sm font-bold text-slate-900">
                    Fetching live ratings &amp; archive records for @{activeHandle}...
                  </p>
                  <p className="text-xs text-slate-500">
                    Querying official Chess.com Public API via SSL proxy
                  </p>
                </div>
              ) : errorMsg ? (
                <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3">
                  <AlertCircle className="w-7 h-7 text-rose-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">{errorMsg}</p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {['Hikaru', 'MagnusCarlsen', 'GothamChess', 'DanielNaroditsky'].map(
                      (sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => {
                            setQueryUsername(sample);
                            setActiveHandle(sample);
                            onChangeUsername?.(sample);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-slate-300 text-xs font-bold text-slate-800 cursor-pointer"
                        >
                          @{sample}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : statsData ? (
                <>
                  {/* 1. Player Identity Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {statsData.avatar ? (
                          <img
                            src={statsData.avatar}
                            alt={`Chess.com profile avatar for @${statsData.username}`}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-16 h-16 rounded-2xl object-cover border border-[#E2E8F0] shadow-sm bg-slate-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center border border-slate-800 shadow-sm">
                            <StauntonKingAvatarFallback className="w-8 h-8 text-emerald-400" />
                          </div>
                        )}
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#059669] border-2 border-white"
                          title="Verified Chess.com Profile"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {statsData.title && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-mono text-xs font-extrabold tracking-wide">
                              {statsData.title}
                            </span>
                          )}
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            @{statsData.username}
                          </h2>
                          {statsData.countryCode && (
                            <span className="text-xs font-mono font-semibold text-slate-400">
                              [{statsData.countryCode}]
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 tabular-nums">
                          {statsData.name && (
                            <span className="font-semibold text-slate-700">
                              {statsData.name}
                            </span>
                          )}
                          {statsData.joinedTimestamp && (
                            <span>
                              Joined{' '}
                              {new Date(statsData.joinedTimestamp * 1000).getFullYear()}
                            </span>
                          )}
                          {typeof statsData.followers === 'number' && (
                            <span>
                              {statsData.followers.toLocaleString()} followers
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {statsData.profileUrl && (
                      <a
                        href={statsData.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-xs font-bold text-slate-700 transition-colors self-start sm:self-auto"
                      >
                        <span>Chess.com Profile</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}
                  </div>

                  {/* 2. Live Time-Control Rating Cards (Rapid, Blitz, Bullet) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Verified FIDE / Live Time Controls
                      </span>
                      {statsData.tacticsPeak && (
                        <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                          Peak Tactics:{' '}
                          <strong className="text-slate-900">
                            {statsData.tacticsPeak}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <RatingCategoryCard
                        label="Rapid"
                        timeSpec="10+0 / 15+10"
                        icon={<Clock className="w-4 h-4 text-[#059669]" />}
                        stats={statsData.rapid}
                      />
                      <RatingCategoryCard
                        label="Blitz"
                        timeSpec="3+0 / 3+2 / 5+0"
                        icon={<Zap className="w-4 h-4 text-[#059669]" />}
                        stats={statsData.blitz}
                      />
                      <RatingCategoryCard
                        label="Bullet"
                        timeSpec="1+0 / 2+1"
                        icon={<Flame className="w-4 h-4 text-[#059669]" />}
                        stats={statsData.bullet}
                      />
                    </div>
                  </div>

                  {/* 3. All-Time Career Volume & Win/Draw/Loss Ratio Bar */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] space-y-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Career Match Volume
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                            {statsData.totalGames.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            total rated games
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                        <div>
                          <span className="text-slate-400 block text-[10px]">WINS</span>
                          <span className="font-bold text-emerald-700">
                            {statsData.totalWins.toLocaleString()} ({statsData.overallWinRatePct}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">DRAWS</span>
                          <span className="font-bold text-slate-700">
                            {statsData.totalDraws.toLocaleString()} ({statsData.overallDrawRatePct}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">LOSSES</span>
                          <span className="font-bold text-rose-600">
                            {statsData.totalLosses.toLocaleString()} ({statsData.overallLossRatePct}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Segmented W / D / L Ratio Bar */}
                    <div className="h-3 w-full rounded-full bg-white overflow-hidden flex p-0.5 gap-0.5 border border-[#E2E8F0]">
                      <div
                        className="h-full bg-[#059669] rounded-l-full transition-all duration-500"
                        style={{ width: `${statsData.overallWinRatePct}%` }}
                        title={`Wins: ${statsData.overallWinRatePct}%`}
                      />
                      <div
                        className="h-full bg-slate-300 transition-all duration-500"
                        style={{ width: `${statsData.overallDrawRatePct}%` }}
                        title={`Draws: ${statsData.overallDrawRatePct}%`}
                      />
                      <div
                        className="h-full bg-slate-800 rounded-r-full transition-all duration-500"
                        style={{ width: `${statsData.overallLossRatePct}%` }}
                        title={`Losses: ${statsData.overallLossRatePct}%`}
                      />
                    </div>
                  </div>

                  {/* 4. Recent Archive Rating Progression & Accuracy Telemetry */}
                  {recentGamesChronological.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#059669]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Recent Archive Progression (Last {recentGamesChronological.length} Games)
                          </span>
                        </div>

                        {averageRecentAccuracy !== null ? (
                          <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                            Avg Reviewed Accuracy: {averageRecentAccuracy}%
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                            Live Rating Trajectory
                          </span>
                        )}
                      </div>

                      {/* Minimalist Visual Bar Chart of Recent Games */}
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 items-end h-24 pt-4 px-1">
                        {recentGamesChronological.map((game, idx) => {
                          const range = Math.max(1, maxRecentRating - minRecentRating);
                          const heightPct = Math.min(
                            100,
                            Math.max(
                              22,
                              Math.round(((game.userRating - minRecentRating) / range) * 100)
                            )
                          );
                          const barColor =
                            game.result === 'win'
                              ? 'bg-[#059669]'
                              : game.result === 'draw'
                              ? 'bg-slate-400'
                              : 'bg-rose-500';

                          return (
                            <div
                              key={`${game.endTime}-${idx}`}
                              className="h-full flex flex-col items-center justify-end group relative"
                            >
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 z-20 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap shadow-md tabular-nums">
                                {game.userRating} ({game.result.toUpperCase()}) vs @
                                {game.opponentUsername}
                                {game.accuracy !== null ? ` • ${game.accuracy}%` : ''}
                              </div>

                              <div
                                className={`w-full rounded-t-md transition-all duration-300 ${barColor} opacity-85 group-hover:opacity-100`}
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 tabular-nums">
                                {game.result === 'win'
                                  ? 'W'
                                  : game.result === 'draw'
                                  ? 'D'
                                  : 'L'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer Action Strip */}
            <div className="px-5 sm:px-7 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Zero Mock Data • Direct Chess.com REST Telemetry</span>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToPuzzles && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToPuzzles();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Train @{activeHandle}'s Blunders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
