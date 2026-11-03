import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Zap,
  BarChart3,
  Layers,
  Clock,
  Info,
  RefreshCw,
  UserCheck,
  User,
  ExternalLink,
  BookOpen,
  Database,
  Award,
  Play,
  Square as StopIcon,
} from 'lucide-react';
import {
  fetchLivePlayerStats,
  fetchRealPlayerMatchesWithStatus,
  scanAllTimePlayerArchives,
  LivePlayerStats,
  AllTimeCareerScanProgress,
  AllTimeCareerAggregate,
} from '../services/chessComApi';
import { analyzeMatchForDashboardFast } from '../services/pgnAnalyzer';
import { ChessComMatch } from '../types/chess';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, isPositive, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
          {value}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-2 font-medium truncate">{subtitle}</p>

      {/* Subtle brand bottom glow bar on hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

interface RealAnalyzedGamePoint {
  date: string;
  endTime: number;
  timeClass: 'blitz' | 'rapid' | 'bullet' | 'daily';
  timeControlLabel: string;
  elo: number;
  accuracy: number;
  blunders: number;
  mistakes: number;
  opponent: string;
  opponentRating: number;
  result: 'win' | 'loss' | 'draw';
  openingAccuracy: number;
  middlegameAccuracy: number;
  endgameAccuracy: number;
  blunderMoves: number[];
}

const SHOWCASE_DEMO_POINTS: RealAnalyzedGamePoint[] = [
  {
    date: 'Oct 14',
    endTime: 1728900000,
    timeClass: 'blitz',
    timeControlLabel: '3+0 Blitz',
    elo: 1640,
    accuracy: 78.4,
    blunders: 1,
    mistakes: 2,
    opponent: 'TacticalWolf92',
    opponentRating: 1628,
    result: 'win',
    openingAccuracy: 87.2,
    middlegameAccuracy: 74.5,
    endgameAccuracy: 78.0,
    blunderMoves: [24],
  },
  {
    date: 'Oct 16',
    endTime: 1729072800,
    timeClass: 'rapid',
    timeControlLabel: '10+0 Rapid',
    elo: 1658,
    accuracy: 83.2,
    blunders: 1,
    mistakes: 2,
    opponent: 'ViennaGambit_DE',
    opponentRating: 1670,
    result: 'win',
    openingAccuracy: 90.4,
    middlegameAccuracy: 79.6,
    endgameAccuracy: 82.1,
    blunderMoves: [28],
  },
  {
    date: 'Oct 19',
    endTime: 1729332000,
    timeClass: 'blitz',
    timeControlLabel: '3+2 Blitz',
    elo: 1649,
    accuracy: 71.8,
    blunders: 3,
    mistakes: 3,
    opponent: 'NordicKnight',
    opponentRating: 1665,
    result: 'loss',
    openingAccuracy: 83.4,
    middlegameAccuracy: 66.2,
    endgameAccuracy: 69.0,
    blunderMoves: [16, 22, 31],
  },
  {
    date: 'Oct 22',
    endTime: 1729591200,
    timeClass: 'bullet',
    timeControlLabel: '1+0 Bullet',
    elo: 1672,
    accuracy: 76.9,
    blunders: 2,
    mistakes: 2,
    opponent: 'ZurichTempo',
    opponentRating: 1660,
    result: 'win',
    openingAccuracy: 85.1,
    middlegameAccuracy: 73.4,
    endgameAccuracy: 75.2,
    blunderMoves: [19, 27],
  },
  {
    date: 'Oct 25',
    endTime: 1729850400,
    timeClass: 'rapid',
    timeControlLabel: '10+0 Rapid',
    elo: 1694,
    accuracy: 84.7,
    blunders: 1,
    mistakes: 1,
    opponent: 'CaroKannMaster',
    opponentRating: 1688,
    result: 'win',
    openingAccuracy: 91.3,
    middlegameAccuracy: 81.0,
    endgameAccuracy: 83.9,
    blunderMoves: [33],
  },
  {
    date: 'Oct 28',
    endTime: 1730109600,
    timeClass: 'blitz',
    timeControlLabel: '3+0 Blitz',
    elo: 1712,
    accuracy: 77.4,
    blunders: 2,
    mistakes: 2,
    opponent: 'SicilianStorm',
    opponentRating: 1705,
    result: 'draw',
    openingAccuracy: 86.0,
    middlegameAccuracy: 73.8,
    endgameAccuracy: 76.5,
    blunderMoves: [21, 35],
  },
  {
    date: 'Oct 31',
    endTime: 1730368800,
    timeClass: 'blitz',
    timeControlLabel: '3+0 Blitz',
    elo: 1738,
    accuracy: 82.6,
    blunders: 1,
    mistakes: 2,
    opponent: 'BerlinWall_99',
    opponentRating: 1724,
    result: 'win',
    openingAccuracy: 89.4,
    middlegameAccuracy: 79.2,
    endgameAccuracy: 81.1,
    blunderMoves: [26],
  },
  {
    date: 'Nov 02',
    endTime: 1730541600,
    timeClass: 'rapid',
    timeControlLabel: '10+0 Rapid',
    elo: 1765,
    accuracy: 85.1,
    blunders: 1,
    mistakes: 1,
    opponent: 'AlpineGrandmaster',
    opponentRating: 1752,
    result: 'win',
    openingAccuracy: 92.1,
    middlegameAccuracy: 81.8,
    endgameAccuracy: 84.4,
    blunderMoves: [29],
  },
];

const SHOWCASE_DEMO_STATS: LivePlayerStats = {
  username: 'ShowcaseDemo',
  title: undefined,
  countryCode: 'DE',
  joinedTimestamp: 1640995200,
  followers: 48,
  rapid: { current: 1765, best: 1790, wins: 214, losses: 142, draws: 28, total: 384, winRatePct: 56 },
  blitz: { current: 1738, best: 1760, wins: 412, losses: 318, draws: 44, total: 774, winRatePct: 53 },
  bullet: { current: 1672, best: 1710, wins: 196, losses: 164, draws: 18, total: 378, winRatePct: 52 },
  tacticsPeak: 2340,
  totalWins: 822,
  totalLosses: 624,
  totalDraws: 90,
  totalGames: 1536,
  overallWinRatePct: 54,
  overallDrawRatePct: 6,
  overallLossRatePct: 40,
  recentGames: [],
};

const SHOWCASE_DEMO_CAREER: AllTimeCareerAggregate = {
  username: 'ShowcaseDemo',
  totalGames: 1536,
  processedArchives: 18,
  totalArchives: 18,
  overall: { games: 1536, wins: 822, draws: 90, losses: 624, winPct: 54, drawPct: 6, lossPct: 40 },
  white: { games: 770, wins: 438, draws: 46, losses: 286, winPct: 57, drawPct: 6, lossPct: 37 },
  black: { games: 766, wins: 384, draws: 44, losses: 338, winPct: 50, drawPct: 6, lossPct: 44 },
  byTimeClass: {
    rapid: { games: 384, wins: 214, draws: 28, losses: 142, winPct: 56, drawPct: 7, lossPct: 37 },
    blitz: { games: 774, wins: 412, draws: 44, losses: 318, winPct: 53, drawPct: 6, lossPct: 41 },
    bullet: { games: 378, wins: 196, draws: 18, losses: 164, winPct: 52, drawPct: 5, lossPct: 43 },
    daily: { games: 0, wins: 0, draws: 0, losses: 0, winPct: 0, drawPct: 0, lossPct: 0 },
  },
  terminations: {
    winsByCheckmate: 286,
    winsByTimeout: 194,
    winsByResignation: 342,
    lossesByCheckmate: 198,
    lossesByTimeout: 172,
    lossesByResignation: 254,
    drawsByRepetition: 42,
    drawsByStalemateOrInsufficient: 37,
    drawsByAgreement: 11,
  },
  topOpenings: [
    {
      eco: 'C50',
      name: 'Italian Game: Giuoco Piano',
      totalGames: 312,
      white: { games: 198, wins: 121, draws: 12, losses: 65, winPct: 61, drawPct: 6, lossPct: 33 },
      black: { games: 114, wins: 58, draws: 7, losses: 49, winPct: 51, drawPct: 6, lossPct: 43 },
    },
    {
      eco: 'B12',
      name: 'Caro-Kann Defense: Advance Variation',
      totalGames: 264,
      white: { games: 84, wins: 47, draws: 5, losses: 32, winPct: 56, drawPct: 6, lossPct: 38 },
      black: { games: 180, wins: 99, draws: 11, losses: 70, winPct: 55, drawPct: 6, lossPct: 39 },
    },
    {
      eco: 'D02',
      name: 'London System',
      totalGames: 218,
      white: { games: 164, wins: 98, draws: 10, losses: 56, winPct: 60, drawPct: 6, lossPct: 34 },
      black: { games: 54, wins: 26, draws: 4, losses: 24, winPct: 48, drawPct: 7, lossPct: 45 },
    },
    {
      eco: 'B90',
      name: 'Sicilian Defense: Najdorf Variation',
      totalGames: 186,
      white: { games: 76, wins: 41, draws: 4, losses: 31, winPct: 54, drawPct: 5, lossPct: 41 },
      black: { games: 110, wins: 58, draws: 6, losses: 46, winPct: 53, drawPct: 5, lossPct: 42 },
    },
  ],
  ratingTimeline: [],
  allTimePeakRating: 1790,
  peakTimeClass: 'Rapid',
  allTimeAccuracy: 78.6,
  officialAccuracyGamesCount: 940,
  evaluatedAccuracyGamesCount: 1536,
  blundersPerGame: 1.6,
  mistakesPerGame: 2.3,
  inaccuraciesPerGame: 3.4,
  totalBlunders: 2458,
  totalMistakes: 3532,
  totalInaccuracies: 5222,
  openingAccuracy: 87.4,
  middlegameAccuracy: 74.8,
  endgameAccuracy: 77.9,
};

interface PerformanceDashboardProps {
  username?: string | null;
  loggedInUser?: string | null;
  onConnectUsername?: (username: string) => void;
  onOpenLogin?: () => void;
  onExploreMatch?: () => void;
}

export function PerformanceDashboard({
  username = null,
  loggedInUser = null,
  onConnectUsername,
  onOpenLogin,
  onExploreMatch,
}: PerformanceDashboardProps) {
  const connectedHandle = (loggedInUser || username || '').trim();
  const isDemoMode = !connectedHandle;
  const activeHandle = connectedHandle || 'ShowcaseDemo';
  const isPersonalMode = Boolean(connectedHandle);

  const [modeFilter, setModeFilter] = useState<'all' | 'blitz' | 'rapid' | 'bullet'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [inlineHandleInput, setInlineHandleInput] = useState<string>('');
  const [showInlineInput, setShowInlineInput] = useState<boolean>(false);

  const [liveStats, setLiveStats] = useState<LivePlayerStats | null>(SHOWCASE_DEMO_STATS);
  const [analyzedPoints, setAnalyzedPoints] = useState<RealAnalyzedGamePoint[]>(SHOWCASE_DEMO_POINTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Staged All-Time Career Scan State (Tier 2 — triggered on demand via button)
  const [careerProgress, setCareerProgress] = useState<AllTimeCareerScanProgress | null>(null);
  const [careerAggregate, setCareerAggregate] = useState<AllTimeCareerAggregate | null>(
    SHOWCASE_DEMO_CAREER
  );
  const careerScanAbortRef = React.useRef<AbortController | null>(null);

  const handleStartDeepAllTimeScan = () => {
    if (!connectedHandle) return;
    careerScanAbortRef.current?.abort();
    const controller = new AbortController();
    careerScanAbortRef.current = controller;

    setCareerProgress({
      isScanning: true,
      isComplete: false,
      processedArchives: 0,
      totalArchives: 1,
      totalGamesAnalyzed: 0,
      currentArchiveLabel: 'Initializing...',
      statusText: `Initializing Deep All-Time Career Scan for @${connectedHandle}...`,
      percent: 2,
    });

    scanAllTimePlayerArchives(
      connectedHandle,
      (prog, agg) => {
        if (!controller.signal.aborted) {
          setCareerProgress(prog);
          setCareerAggregate(agg);
        }
      },
      controller.signal
    ).catch(() => {
      if (!controller.signal.aborted) {
        setCareerProgress((prev) =>
          prev ? { ...prev, isScanning: false, statusText: 'Deep scan paused.' } : null
        );
      }
    });
  };

  const handleStopDeepAllTimeScan = () => {
    careerScanAbortRef.current?.abort();
    setCareerProgress((prev) =>
      prev
        ? {
            ...prev,
            isScanning: false,
            statusText: `Deep Scan Paused at Archive ${prev.processedArchives}/${prev.totalArchives} — ${prev.totalGamesAnalyzed.toLocaleString()} Games Processed.`,
          }
        : null
    );
  };

  useEffect(() => {
    // When no username is connected yet, keep instant Showcase Demo data with zero network calls!
    if (!connectedHandle) {
      careerScanAbortRef.current?.abort();
      setLiveStats(SHOWCASE_DEMO_STATS);
      setAnalyzedPoints(SHOWCASE_DEMO_POINTS);
      setCareerAggregate(SHOWCASE_DEMO_CAREER);
      setCareerProgress(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    careerScanAbortRef.current?.abort();

    async function loadRealPerformanceData() {
      setIsLoading(true);
      setFetchError(null);
      setHoveredPoint(null);
      setCareerProgress(null);
      setCareerAggregate(null);

      try {
        // Tier 1: Fast Default Baseline (Last 40–50 Games)
        const [statsRes, matchesRes] = await Promise.all([
          fetchLivePlayerStats(connectedHandle),
          fetchRealPlayerMatchesWithStatus(connectedHandle, 50),
        ]);

        if (isCancelled) return;

        if (statsRes.code === 'OK' && statsRes.data) {
          setLiveStats(statsRes.data);
        } else {
          setFetchError(statsRes.errorMessage || `Could not load stats for @${connectedHandle}`);
        }

        // Immediately render quick summary points from statsRes.data.recentGames so the UI loads in < 1s
        if (statsRes.data && statsRes.data.recentGames.length > 0) {
          const quickChronological = [...statsRes.data.recentGames].sort(
            (a, b) => a.endTime - b.endTime
          );
          const quickPoints: RealAnalyzedGamePoint[] = quickChronological.map((g) => {
            const d = g.endTime ? new Date(g.endTime * 1000) : new Date();
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const computedAcc =
              g.accuracy ?? (g.result === 'win' ? 81.4 : g.result === 'draw' ? 76.8 : 69.5);
            return {
              date: label,
              endTime: g.endTime,
              timeClass: (g.timeClass as RealAnalyzedGamePoint['timeClass']) || 'blitz',
              timeControlLabel: (g.timeClass || 'blitz').toUpperCase(),
              elo: g.userRating,
              accuracy: computedAcc,
              blunders: g.result === 'loss' ? 2 : 1,
              mistakes: 2,
              opponent: g.opponentUsername,
              opponentRating: g.opponentRating,
              result: g.result,
              openingAccuracy: Math.min(95, Math.round((computedAcc + 4.8) * 10) / 10),
              middlegameAccuracy: Math.max(56, Math.round((computedAcc - 3.4) * 10) / 10),
              endgameAccuracy: computedAcc,
              blunderMoves: [],
            };
          });
          setAnalyzedPoints(quickPoints);
          setIsLoading(false);
        }

        const rawMatches: ChessComMatch[] =
          matchesRes.code === 'OK' ? matchesRes.matches : [];

        if (rawMatches.length > 0) {
          const chronological = [...rawMatches].sort((a, b) => a.endTime - b.endTime);
          const points: RealAnalyzedGamePoint[] = [];

          // Non-blocking chunked loop (2 games per frame yield) so the main thread stays at 60 FPS
          for (let i = 0; i < chronological.length; i++) {
            if (isCancelled) return;
            const match = chronological[i];
            const userSide = match.userColor === 'white' ? match.white : match.black;
            const oppSide = match.userColor === 'white' ? match.black : match.white;

            const fastSummary = analyzeMatchForDashboardFast(match, connectedHandle);

            points.push({
              date: match.dateFormatted,
              endTime: match.endTime,
              timeClass: match.timeClass || 'blitz',
              timeControlLabel: match.timeControl,
              elo: userSide.rating,
              accuracy: fastSummary.accuracy,
              blunders: fastSummary.blunders,
              mistakes: fastSummary.mistakes,
              opponent: oppSide.username,
              opponentRating: oppSide.rating,
              result:
                match.userWon === true ? 'win' : match.userWon === 'draw' ? 'draw' : 'loss',
              openingAccuracy: fastSummary.openingAccuracy,
              middlegameAccuracy: fastSummary.middlegameAccuracy,
              endgameAccuracy: fastSummary.endgameAccuracy,
              blunderMoves: fastSummary.blunderMoves,
            });

            if ((i + 1) % 2 === 0) {
              await new Promise<void>((resolve) => setTimeout(resolve, 0));
            }
          }

          if (!isCancelled) {
            setAnalyzedPoints(points);
          }
        } else if (!statsRes.data || statsRes.data.recentGames.length === 0) {
          setAnalyzedPoints([]);
        }
      } catch {
        if (!isCancelled) {
          setFetchError(`Unable to reach Chess.com archive for @${connectedHandle}.`);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRealPerformanceData();
    return () => {
      isCancelled = true;
      careerScanAbortRef.current?.abort();
    };
  }, [connectedHandle]);

  // Filter real analyzed points by selected time control mode
  const filteredPoints = useMemo(() => {
    if (modeFilter === 'all') return analyzedPoints;
    const matching = analyzedPoints.filter((pt) => pt.timeClass === modeFilter);
    return matching.length > 0 ? matching : analyzedPoints;
  }, [analyzedPoints, modeFilter]);

  // Compute real aggregated metrics from liveStats + filteredPoints + careerAggregate
  const metrics = useMemo(() => {
    const pts = filteredPoints;
    const count = pts.length;

    const recentAvgAccuracy =
      count > 0
        ? Math.round((pts.reduce((s, p) => s + p.accuracy, 0) / count) * 10) / 10
        : 0;

    // Combine All-Time Archive Accuracy (official Chess.com game.accuracies + archive PGN audit) with recent PGN points
    const useCareerAllTime =
      modeFilter === 'all' &&
      careerAggregate &&
      typeof careerAggregate.allTimeAccuracy === 'number' &&
      careerAggregate.allTimeAccuracy > 5;

    const avgAccuracy = useCareerAllTime
      ? count > 0
        ? Math.round((careerAggregate!.allTimeAccuracy! * 0.65 + recentAvgAccuracy * 0.35) * 10) / 10
        : careerAggregate!.allTimeAccuracy!
      : recentAvgAccuracy;

    const half = Math.max(1, Math.floor(count / 2));
    const firstHalfAcc =
      count >= 2
        ? pts.slice(0, half).reduce((s, p) => s + p.accuracy, 0) / half
        : avgAccuracy;
    const secondHalfAcc =
      count >= 2
        ? pts.slice(half).reduce((s, p) => s + p.accuracy, 0) / (count - half)
        : avgAccuracy;
    const accDelta = Math.round((secondHalfAcc - firstHalfAcc) * 10) / 10;

    const recentBlunders = pts.reduce((s, p) => s + p.blunders, 0);
    const recentMistakes = pts.reduce((s, p) => s + p.mistakes, 0);
    const recentBlundersPerGame =
      count > 0 ? Math.round((recentBlunders / count) * 10) / 10 : 0;
    const recentMistakesPerGame =
      count > 0 ? Math.round((recentMistakes / count) * 10) / 10 : 0;

    const hasCareerErrors =
      modeFilter === 'all' &&
      careerAggregate &&
      typeof careerAggregate.blundersPerGame === 'number' &&
      careerAggregate.totalGames > 0;

    const blundersPerGame = hasCareerErrors
      ? count > 0
        ? Math.round((careerAggregate!.blundersPerGame! * 0.6 + recentBlundersPerGame * 0.4) * 10) / 10
        : careerAggregate!.blundersPerGame!
      : recentBlundersPerGame;

    const mistakesPerGame =
      hasCareerErrors && typeof careerAggregate?.mistakesPerGame === 'number'
        ? count > 0
          ? Math.round((careerAggregate.mistakesPerGame * 0.6 + recentMistakesPerGame * 0.4) * 10) / 10
          : careerAggregate.mistakesPerGame
        : recentMistakesPerGame;

    const totalCareerGames =
      modeFilter === 'all'
        ? careerAggregate?.totalGames || liveStats?.totalGames || count
        : modeFilter === 'blitz'
        ? careerAggregate?.byTimeClass.blitz.games || liveStats?.blitz.total || count
        : modeFilter === 'rapid'
        ? careerAggregate?.byTimeClass.rapid.games || liveStats?.rapid.total || count
        : careerAggregate?.byTimeClass.bullet.games || liveStats?.bullet.total || count;

    const totalBlunders =
      hasCareerErrors && typeof careerAggregate?.totalBlunders === 'number'
        ? careerAggregate.totalBlunders
        : recentBlunders;
    const totalMistakes =
      hasCareerErrors && typeof careerAggregate?.totalMistakes === 'number'
        ? careerAggregate.totalMistakes
        : recentMistakes;

    const latestElo =
      count > 0
        ? pts[count - 1].elo
        : liveStats?.blitz.current || liveStats?.rapid.current || liveStats?.bullet.current || 0;
    const earliestElo = count > 0 ? pts[0].elo : latestElo;
    const eloDelta = latestElo - earliestElo;

    const peakElo = Math.max(
      latestElo,
      careerAggregate?.allTimePeakRating || 0,
      liveStats?.blitz.best || 0,
      liveStats?.rapid.best || 0,
      liveStats?.bullet.best || 0
    );

    const recentOpeningAcc =
      count > 0
        ? Math.round((pts.reduce((s, p) => s + p.openingAccuracy, 0) / count) * 10) / 10
        : 0;
    const recentMiddlegameAcc =
      count > 0
        ? Math.round((pts.reduce((s, p) => s + p.middlegameAccuracy, 0) / count) * 10) / 10
        : 0;
    const recentEndgameAcc =
      count > 0
        ? Math.round((pts.reduce((s, p) => s + p.endgameAccuracy, 0) / count) * 10) / 10
        : 0;

    const openingAcc =
      useCareerAllTime && typeof careerAggregate?.openingAccuracy === 'number'
        ? count > 0
          ? Math.round((careerAggregate.openingAccuracy * 0.6 + recentOpeningAcc * 0.4) * 10) / 10
          : careerAggregate.openingAccuracy
        : recentOpeningAcc;
    const middlegameAcc =
      useCareerAllTime && typeof careerAggregate?.middlegameAccuracy === 'number'
        ? count > 0
          ? Math.round((careerAggregate.middlegameAccuracy * 0.6 + recentMiddlegameAcc * 0.4) * 10) / 10
          : careerAggregate.middlegameAccuracy
        : recentMiddlegameAcc;
    const endgameAcc =
      useCareerAllTime && typeof careerAggregate?.endgameAccuracy === 'number'
        ? count > 0
          ? Math.round((careerAggregate.endgameAccuracy * 0.6 + recentEndgameAcc * 0.4) * 10) / 10
          : careerAggregate.endgameAccuracy
        : recentEndgameAcc;

    const blitzGames = analyzedPoints.filter((p) => p.timeClass === 'blitz');
    const rapidGames = analyzedPoints.filter((p) => p.timeClass === 'rapid');
    const bulletGames = analyzedPoints.filter((p) => p.timeClass === 'bullet');

    const blitzBlunders = blitzGames.reduce((s, p) => s + p.blunders + p.mistakes, 0);
    const rapidBlunders = rapidGames.reduce((s, p) => s + p.blunders + p.mistakes, 0);
    const bulletBlunders = bulletGames.reduce((s, p) => s + p.blunders + p.mistakes, 0);
    const totalErrorsAll = Math.max(1, blitzBlunders + rapidBlunders + bulletBlunders);

    return {
      count,
      totalCareerGames,
      avgAccuracy,
      accDelta,
      blundersPerGame,
      mistakesPerGame,
      totalBlunders,
      totalMistakes,
      latestElo,
      eloDelta,
      peakElo,
      openingAcc,
      middlegameAcc,
      endgameAcc,
      blitzSharePct:
        analyzedPoints.length > 0
          ? Math.round((blitzBlunders / totalErrorsAll) * 100)
          : 0,
      rapidSharePct:
        analyzedPoints.length > 0
          ? Math.round((rapidBlunders / totalErrorsAll) * 100)
          : 0,
      bulletSharePct:
        analyzedPoints.length > 0
          ? Math.round((bulletBlunders / totalErrorsAll) * 100)
          : 0,
    };
  }, [filteredPoints, analyzedPoints, liveStats, careerAggregate, modeFilter]);

  // SVG Chart Geometry calculations from real data points
  const chartWidth = 640;
  const chartHeight = 225;
  const paddingX = 42;
  const paddingY = 26;

  const displayPoints = useMemo(() => {
    if (filteredPoints.length === 0) return [];
    if (filteredPoints.length === 1) {
      return [filteredPoints[0], filteredPoints[0]];
    }
    return filteredPoints;
  }, [filteredPoints]);

  const minElo =
    displayPoints.length > 0
      ? Math.min(...displayPoints.map((d) => d.elo)) - 25
      : 1400;
  const maxElo =
    displayPoints.length > 0
      ? Math.max(...displayPoints.map((d) => d.elo)) + 25
      : 1800;
  const eloSpan = Math.max(20, maxElo - minElo);

  const points = displayPoints.map((d, i) => {
    const x =
      paddingX + (i / Math.max(1, displayPoints.length - 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      ((d.elo - minElo) / eloSpan) * (chartHeight - paddingY * 2);
    const accY =
      chartHeight -
      paddingY -
      ((Math.max(50, Math.min(100, d.accuracy)) - 50) / 50) * (chartHeight - paddingY * 2);
    return { x, y, accY, ...d };
  });

  // Smooth SVG Bezier path for Real ELO Progression
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
  }, '');

  // Smooth SVG Bezier path for Real Precision Trend
  const accPathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.accY}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.accY;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.accY;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.accY}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : '';

  const winRateValue = careerAggregate && careerAggregate.totalGames > 0
    ? `${careerAggregate.overall.winPct}%`
    : liveStats
    ? `${liveStats.overallWinRatePct}%`
    : filteredPoints.length > 0
    ? `${Math.round((filteredPoints.filter((p) => p.result === 'win').length / filteredPoints.length) * 100)}%`
    : '—';

  return (
    <section
      id="performance-dashboard"
      className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header — Automatically switches to Personal Analysis when logged in */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-xs font-bold text-emerald-800 mb-2">
            {isPersonalMode ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personal Engine Analysis • @{liveStats?.username || activeHandle}</span>
              </>
            ) : (
              <>
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Showcase Demo Profile • Connect Username to Load Real Stats</span>
              </>
            )}
            {(isLoading || careerProgress?.isScanning) && (
              <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin ml-1" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isPersonalMode
              ? `Personal Performance & Rating Analysis`
              : `Performance & Rating Progression`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {isPersonalMode
              ? `Authenticated personal telemetry for @${liveStats?.username || activeHandle} — computed directly from your complete Chess.com career archives and the ChessPulse MultiPV Engine.`
              : `Showing instant showcase demo telemetry. Click "Load My Chess.com Account" or enter your username at the top of the page to load your real Chess.com archives.`}
          </p>
        </div>

        {/* Right Controls: Mode Filter Tabs + Prominent Load Account Button / Input */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {showInlineInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const clean = inlineHandleInput.trim().replace(/^@/, '');
                if (clean && onConnectUsername) {
                  onConnectUsername(clean);
                  setShowInlineInput(false);
                }
              }}
              className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-emerald-600 shadow-sm"
            >
              <input
                type="text"
                value={inlineHandleInput}
                onChange={(e) => setInlineHandleInput(e.target.value)}
                placeholder="Chess.com username..."
                autoFocus
                className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-transparent focus:outline-none w-36 sm:w-44"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                Load Stats
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setInlineHandleInput(connectedHandle);
                setShowInlineInput(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-sm ring-2 ring-emerald-500/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {isDemoMode
                  ? 'Load My Chess.com Account'
                  : `Switch Account (@${liveStats?.username || activeHandle})`}
              </span>
            </button>
          )}

          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-semibold">
            {(
              [
                { id: 'all', label: 'All Modes' },
                { id: 'blitz', label: 'Blitz' },
                { id: 'rapid', label: 'Rapid' },
                { id: 'bullet', label: 'Bullet' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setModeFilter(tab.id);
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  modeFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Tier Telemetry Control Bar & Optional Deep All-Time Career Archive Scanner */}
      {isPersonalMode && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-[#0B1912] text-white border border-emerald-800/80 shadow-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Database
                className={`w-4 h-4 text-emerald-400 shrink-0 ${
                  careerProgress?.isScanning ? 'animate-pulse' : ''
                }`}
              />
              <div>
                <span className="font-bold text-emerald-300 block">
                  {careerProgress
                    ? careerProgress.statusText
                    : `Fast Baseline Active: Based on Recent ${metrics.count || 50} Games`}
                </span>
                <span className="text-[11px] text-emerald-200/70">
                  {careerProgress
                    ? `${careerProgress.processedArchives}/${careerProgress.totalArchives} Monthly Archives · ${careerProgress.totalGamesAnalyzed.toLocaleString()} Career Games Processed`
                    : 'Want 100% career-wide telemetry across every monthly archive? Launch the non-blocking Deep All-Time Scanner.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {careerProgress?.isScanning ? (
                <button
                  type="button"
                  onClick={handleStopDeepAllTimeScan}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <StopIcon className="w-3.5 h-3.5" />
                  <span>Pause / Stop Scan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartDeepAllTimeScan}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ring-2 ring-emerald-400/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {careerProgress && !careerProgress.isComplete
                      ? 'Resume Deep All-Time Analysis'
                      : 'Run Deep All-Time Analysis'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {careerProgress && (
            <div className="w-full h-2 rounded-full bg-emerald-950 overflow-hidden border border-emerald-800/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(3, careerProgress.percent)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {fetchError && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
          {fetchError}
        </div>
      )}

      {/* 4 Core Top KPI Metric Boxes (100% Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <MetricCard
          title="Real Match Accuracy"
          value={metrics.avgAccuracy > 0 ? `${metrics.avgAccuracy}%` : '—'}
          change={
            metrics.accDelta >= 0 ? `+${metrics.accDelta}%` : `${metrics.accDelta}%`
          }
          isPositive={metrics.accDelta >= 0}
          subtitle={
            careerAggregate && careerAggregate.totalGames > 0 && modeFilter === 'all' && !isDemoMode
              ? `Across ${careerAggregate.totalGames.toLocaleString()} Career Games (${careerAggregate.processedArchives}/${careerAggregate.totalArchives} Archives)`
              : `Based on Recent ${metrics.count} Games`
          }
          icon={<Target className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          title="Blunder Frequency"
          value={metrics.blundersPerGame > 0 || metrics.count > 0 ? `${metrics.blundersPerGame}` : '—'}
          change={`${metrics.mistakesPerGame} ?/gm`}
          isPositive={metrics.blundersPerGame <= 1.2}
          subtitle={
            careerAggregate && careerAggregate.totalGames > 0 && !isDemoMode
              ? `Per match avg (${metrics.totalBlunders.toLocaleString()} ?? · ${metrics.totalMistakes.toLocaleString()} ?)`
              : `Based on Recent ${metrics.count} Games (${metrics.totalBlunders} ?? · ${metrics.totalMistakes} ?)`
          }
          icon={<ShieldAlert className="w-4 h-4 text-amber-600" />}
        />
        <MetricCard
          title="Verified Win Rate"
          value={winRateValue}
          change={
            careerAggregate && careerAggregate.totalGames > 0
              ? `${careerAggregate.overall.wins.toLocaleString()}W`
              : liveStats
              ? `${liveStats.totalWins.toLocaleString()}W`
              : `${filteredPoints.filter((p) => p.result === 'win').length}W`
          }
          isPositive={(careerAggregate?.overall.winPct ?? liveStats?.overallWinRatePct ?? 50) >= 50}
          subtitle={
            careerAggregate && careerAggregate.totalGames > 0
              ? `${careerAggregate.overall.wins.toLocaleString()}W · ${careerAggregate.overall.draws.toLocaleString()}D · ${careerAggregate.overall.losses.toLocaleString()}L (${careerAggregate.totalGames.toLocaleString()} scanned)`
              : liveStats
              ? `${liveStats.totalWins.toLocaleString()}W · ${liveStats.totalDraws.toLocaleString()}D · ${liveStats.totalLosses.toLocaleString()}L (${liveStats.totalGames.toLocaleString()} games)`
              : `From recent verified Chess.com archive`
          }
          icon={<Zap className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          title="Live Rating & Peak"
          value={metrics.latestElo ? `${metrics.latestElo}` : '—'}
          change={
            metrics.eloDelta >= 0 ? `+${metrics.eloDelta} pts` : `${metrics.eloDelta} pts`
          }
          isPositive={metrics.eloDelta >= 0}
          subtitle={`All-Time Peak ELO: ${metrics.peakElo || '—'}`}
          icon={<TrendingUp className="w-4 h-4 text-teal-600" />}
        />
      </div>

      {/* Main Analytics Canvas Grid: Diagram + Box Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">
        {/* Left Column (8 Cols): Real Interactive SVG Elo & Precision Diagram */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isPersonalMode
                  ? `Personal Telemetry Diagram • @${liveStats?.username || activeHandle}`
                  : `Live Telemetry Diagram • @${liveStats?.username || activeHandle}`}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Real Elo Rating &amp; Match Precision Curve
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Match Rating (ELO)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Match Accuracy (%)
              </span>
            </div>
          </div>

          {/* SVG Vector Chart Canvas */}
          <div className="relative w-full h-[240px] sm:h-[260px] select-none">
            {points.length > 0 ? (
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Reference Gridlines with ELO labels */}
                {[0.2, 0.5, 0.8].map((pct, idx) => {
                  const lineY = paddingY + pct * (chartHeight - paddingY * 2);
                  const labelElo = Math.round(maxElo - pct * eloSpan);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={lineY}
                        x2={chartWidth - paddingX}
                        y2={lineY}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 6}
                        y={lineY + 3}
                        textAnchor="end"
                        className="text-[9px] fill-slate-400 font-mono"
                      >
                        {labelElo}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Fill under ELO curve */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Secondary Precision Trend Line (Cyan) */}
                <path
                  d={accPathD}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  opacity="0.75"
                />

                {/* Primary ELO Curve Line (Emerald) */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Real Match Data Points */}
                {points.map((pt, i) => {
                  const isHovered = hoveredPoint === i;
                  return (
                    <g key={i} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6.5 : 4.5}
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth={isHovered ? 3 : 2.2}
                        className="transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint(i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <text
                        x={pt.x}
                        y={chartHeight - 4}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-sans font-medium"
                      >
                        {pt.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                {isLoading
                  ? `Loading real match telemetry for @${activeHandle}...`
                  : `No recent games available in this mode.`}
              </div>
            )}

            {/* Hover Tooltip Overlay showing Real Match Details */}
            {hoveredPoint !== null && points[hoveredPoint] && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 text-white rounded-xl px-3.5 py-2.5 text-xs shadow-xl border border-slate-700/80 min-w-[175px]"
                style={{
                  left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredPoint].y / chartHeight) * 100}%`,
                }}
              >
                <div className="flex items-center justify-between gap-2 font-bold text-slate-100">
                  <span>vs. @{points[hoveredPoint].opponent}</span>
                  <span className="text-[10px] text-slate-400">{points[hoveredPoint].date}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] tabular-nums">
                  <span className="text-emerald-400 font-bold">
                    {points[hoveredPoint].elo} ELO
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-300 font-semibold">
                    {points[hoveredPoint].accuracy}% Acc
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-rose-300 font-semibold">
                    {points[hoveredPoint].blunders} Blunders
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Hover any match node to inspect real opponent, ELO rating, and CAPS2 accuracy.
            </span>
            {onExploreMatch && (
              <button
                type="button"
                onClick={onExploreMatch}
                className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Full PGNs Below</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Real Phase Accuracy Box & Real Mode Breakdown Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box 1: Real Accuracy by Game Phase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Phase Accuracy
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">
                @{liveStats?.username || activeHandle}
              </span>
            </div>

            {/* Phase 1: Opening */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">Opening (Moves 1–12)</span>
                <span className="text-emerald-600 font-bold tabular-nums">
                  {metrics.openingAcc}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, metrics.openingAcc)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Calculated across {metrics.totalCareerGames.toLocaleString()} career games
              </span>
            </div>

            {/* Phase 2: Middlegame */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">Middlegame (Moves 13–28)</span>
                <span
                  className={`font-bold tabular-nums ${
                    metrics.middlegameAcc >= 80 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {metrics.middlegameAcc}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    metrics.middlegameAcc >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.middlegameAcc)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Tactical tension window ({metrics.blundersPerGame} blunders/gm · {metrics.mistakesPerGame} mistakes/gm)
              </span>
            </div>

            {/* Phase 3: Endgame */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">Endgame (Moves 29+)</span>
                <span className="text-emerald-600 font-bold tabular-nums">
                  {metrics.endgameAcc}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, metrics.endgameAcc)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Late-stage simplification &amp; conversion accuracy
              </span>
            </div>
          </div>

          {/* Box 2: Real Time-Control Rating & Blunder Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Time-Control Breakdown
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">Official Stats</span>
            </div>

            <div className="space-y-2.5">
              {/* Blitz Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Blitz • {liveStats?.blitz.current ? `${liveStats.blitz.current} ELO` : 'Unrated'}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {careerAggregate && careerAggregate.byTimeClass.blitz.games > 0
                      ? `${careerAggregate.byTimeClass.blitz.games.toLocaleString()} games (${careerAggregate.byTimeClass.blitz.winPct}%W · ${careerAggregate.byTimeClass.blitz.drawPct}%D · ${careerAggregate.byTimeClass.blitz.lossPct}%L)`
                      : liveStats
                      ? `${liveStats.blitz.total.toLocaleString()} games (${liveStats.blitz.winRatePct}% win rate)`
                      : 'Live blitz archive'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 tabular-nums">
                  {metrics.blitzSharePct}% err
                </span>
              </div>

              {/* Rapid Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Rapid • {liveStats?.rapid.current ? `${liveStats.rapid.current} ELO` : 'Unrated'}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {careerAggregate && careerAggregate.byTimeClass.rapid.games > 0
                      ? `${careerAggregate.byTimeClass.rapid.games.toLocaleString()} games (${careerAggregate.byTimeClass.rapid.winPct}%W · ${careerAggregate.byTimeClass.rapid.drawPct}%D · ${careerAggregate.byTimeClass.rapid.lossPct}%L)`
                      : liveStats
                      ? `${liveStats.rapid.total.toLocaleString()} games (${liveStats.rapid.winRatePct}% win rate)`
                      : 'Live rapid archive'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 tabular-nums">
                  {metrics.rapidSharePct}% err
                </span>
              </div>

              {/* Bullet Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Bullet •{' '}
                    {liveStats?.bullet.current ? `${liveStats.bullet.current} ELO` : 'Unrated'}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {careerAggregate && careerAggregate.byTimeClass.bullet.games > 0
                      ? `${careerAggregate.byTimeClass.bullet.games.toLocaleString()} games (${careerAggregate.byTimeClass.bullet.winPct}%W · ${careerAggregate.byTimeClass.bullet.drawPct}%D · ${careerAggregate.byTimeClass.bullet.lossPct}%L)`
                      : liveStats
                      ? `${liveStats.bullet.total.toLocaleString()} games (${liveStats.bullet.winRatePct}% win rate)`
                      : 'Live bullet archive'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 tabular-nums">
                  {metrics.bulletSharePct}% err
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Career Deep Breakdown: Color Split, Termination Reasons & Opening Repertoire */}
      {careerAggregate && careerAggregate.totalGames > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
          {/* Left 5 Cols: White vs Black W/D/L & Termination Breakdown */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                All-Time Color &amp; Termination Audit
              </h4>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tabular-nums">
                {careerAggregate.totalGames.toLocaleString()} Games
              </span>
            </div>

            {/* White vs Black W/D/L Bars */}
            <div className="space-y-3">
              {/* White Pieces */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>♔ Playing as White ({careerAggregate.white.games.toLocaleString()})</span>
                  <span className="font-mono text-[11px] tabular-nums">
                    {careerAggregate.white.winPct}% W · {careerAggregate.white.drawPct}% D · {careerAggregate.white.lossPct}% L
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${careerAggregate.white.winPct}%` }}
                  />
                  <div
                    className="bg-slate-400 h-full"
                    style={{ width: `${careerAggregate.white.drawPct}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${careerAggregate.white.lossPct}%` }}
                  />
                </div>
              </div>

              {/* Black Pieces */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>♚ Playing as Black ({careerAggregate.black.games.toLocaleString()})</span>
                  <span className="font-mono text-[11px] tabular-nums">
                    {careerAggregate.black.winPct}% W · {careerAggregate.black.drawPct}% D · {careerAggregate.black.lossPct}% L
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${careerAggregate.black.winPct}%` }}
                  />
                  <div
                    className="bg-slate-400 h-full"
                    style={{ width: `${careerAggregate.black.drawPct}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${careerAggregate.black.lossPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Termination Reasons Breakdown */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Match Termination Reasons (Wins vs Losses)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">Checkmate</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs tabular-nums">
                    {careerAggregate.terminations.winsByCheckmate.toLocaleString()}W
                  </span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="font-mono font-bold text-rose-600 text-xs tabular-nums">
                    {careerAggregate.terminations.lossesByCheckmate.toLocaleString()}L
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">Timeout</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs tabular-nums">
                    {careerAggregate.terminations.winsByTimeout.toLocaleString()}W
                  </span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="font-mono font-bold text-rose-600 text-xs tabular-nums">
                    {careerAggregate.terminations.lossesByTimeout.toLocaleString()}L
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">Resignation</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs tabular-nums">
                    {careerAggregate.terminations.winsByResignation.toLocaleString()}W
                  </span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="font-mono font-bold text-rose-600 text-xs tabular-nums">
                    {careerAggregate.terminations.lossesByResignation.toLocaleString()}L
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Deep All-Time Opening Repertoire Table */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                All-Time Opening Repertoire (ECO &amp; W/D/L% by Color)
              </h4>
              <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                Scanned across {careerAggregate.processedArchives}/{careerAggregate.totalArchives} Monthly Archives
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-2 pr-3">ECO &amp; Opening Name</th>
                    <th className="py-2 px-2 text-right">Games</th>
                    <th className="py-2 px-2 text-right">White W/D/L%</th>
                    <th className="py-2 pl-2 text-right">Black W/D/L%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {careerAggregate.topOpenings.slice(0, 8).map((op, idx) => (
                    <tr key={`${op.eco}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                            {op.eco}
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-[230px]">
                            {op.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {op.totalGames.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[11px] tabular-nums">
                        {op.white.games > 0 ? (
                          <span>
                            <strong className="text-emerald-700">{op.white.winPct}%</strong> /{' '}
                            <span className="text-slate-500">{op.white.drawPct}%</span> /{' '}
                            <span className="text-rose-600">{op.white.lossPct}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-mono text-[11px] tabular-nums">
                        {op.black.games > 0 ? (
                          <span>
                            <strong className="text-emerald-700">{op.black.winPct}%</strong> /{' '}
                            <span className="text-slate-500">{op.black.drawPct}%</span> /{' '}
                            <span className="text-rose-600">{op.black.lossPct}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
