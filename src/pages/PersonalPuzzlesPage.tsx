import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Target,
  Volume2,
  VolumeX,
  Search,
  RefreshCw,
  Award,
  Clock,
  Layers,
  ExternalLink,
  Eye,
  Compass,
  Filter,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  TacticalPuzzle,
  CanonicalTacticalTheme,
  PuzzleDifficultyTier,
} from '../types/chess';
import { ChesscomBoard } from '../components/ChesscomBoard';
import {
  fetchChessComUserData,
  fetchRealPlayerMatchesWithStatus,
} from '../services/chessComApi';
import {
  generatePersonalizedBlunderBank,
  FALLBACK_BLUNDER_RECOVERY_PUZZLES,
  getCanonicalTacticalTheme,
  getPuzzleDifficultyElo,
  getPuzzleDifficultyTier,
} from '../services/pgnAnalyzer';
import { chessAudio } from '../services/chessSound';

const TACTICAL_THEME_OPTIONS: {
  value: 'ALL' | CanonicalTacticalTheme;
  label: string;
}[] = [
  { value: 'ALL', label: 'All Themes' },
  { value: 'Forks', label: 'Forks' },
  { value: 'Pins', label: 'Pins' },
  { value: 'Skewers', label: 'Skewers' },
  { value: 'Back-rank Mates', label: 'Back-rank Mates' },
  { value: 'Defensive Save', label: 'Defensive Saves' },
];

const DIFFICULTY_OPTIONS: {
  value: 'ALL' | PuzzleDifficultyTier;
  label: string;
  eloHint: string;
}[] = [
  { value: 'ALL', label: 'All Difficulties', eloHint: 'Any ELO' },
  { value: 'Easy', label: 'Easy', eloHint: '<1650 ELO' },
  { value: 'Medium', label: 'Medium', eloHint: '1650–1850' },
  { value: 'Hard', label: 'Hard', eloHint: '1850+ ELO' },
];

interface PersonalPuzzlesPageProps {
  loggedInUser: string | null;
  onLogin: (username: string) => void;
  onLogout: () => void;
  onBackToHome: () => void;
  onOpenShare?: (data: any) => void;
  isPayingUser?: boolean;
}

type PuzzleStatus = 'solving' | 'correct' | 'wrong' | 'showing_blunder';

export function PersonalPuzzlesPage({
  loggedInUser,
  onLogin,
  onLogout,
  onBackToHome,
}: PersonalPuzzlesPageProps) {
  const [usernameInput, setUsernameInput] = useState(loggedInUser || '');
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [puzzles, setPuzzles] = useState<TacticalPuzzle[]>(FALLBACK_BLUNDER_RECOVERY_PUZZLES);
  const [isPersonalSet, setIsPersonalSet] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Tactical Theme & Difficulty Filter State
  const [selectedTheme, setSelectedTheme] = useState<'ALL' | CanonicalTacticalTheme>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | PuzzleDifficultyTier>('ALL');

  // Interactive Board & Puzzle State
  const [status, setStatus] = useState<PuzzleStatus>('solving');
  const [boardFen, setBoardFen] = useState<string>(FALLBACK_BLUNDER_RECOVERY_PUZZLES[0].fen);
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from?: string; to?: string }>({});
  const [wrongAttemptSan, setWrongAttemptSan] = useState<string | null>(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => !chessAudio.getMuted());

  const snapbackTimerRef = useRef<number | null>(null);

  // Filtered puzzle list based on active Tactical Theme & Difficulty pills
  const filteredPuzzles = puzzles.filter((puzzle) => {
    const matchesTheme =
      selectedTheme === 'ALL' || getCanonicalTacticalTheme(puzzle) === selectedTheme;
    const matchesDifficulty =
      selectedDifficulty === 'ALL' || getPuzzleDifficultyTier(puzzle) === selectedDifficulty;
    return matchesTheme && matchesDifficulty;
  });

  const safeActiveIndex =
    filteredPuzzles.length > 0 ? Math.min(activeIndex, filteredPuzzles.length - 1) : 0;
  const activePuzzle = filteredPuzzles[safeActiveIndex] || puzzles[0];
  const hasActiveFilters = selectedTheme !== 'ALL' || selectedDifficulty !== 'ALL';

  // Clear pending snapback timer on unmount
  useEffect(() => {
    return () => {
      if (snapbackTimerRef.current) {
        window.clearTimeout(snapbackTimerRef.current);
      }
    };
  }, []);

  // Load real player blunders automatically when loggedInUser changes
  useEffect(() => {
    if (loggedInUser) {
      setUsernameInput(loggedInUser);
      loadPlayerBlunders(loggedInUser);
    }
  }, [loggedInUser]);

  // Reset board & timer whenever switching to a new puzzle
  useEffect(() => {
    if (!activePuzzle) return;
    if (snapbackTimerRef.current) {
      window.clearTimeout(snapbackTimerRef.current);
    }
    setBoardFen(activePuzzle.fen);
    setStatus('solving');
    setLastMoveSquares({});
    setWrongAttemptSan(null);
    setShowHint(false);
    setIsBoardShaking(false);
    setElapsedSeconds(0);
  }, [activeIndex, activePuzzle?.id]);

  // Live puzzle timer (pauses once solved)
  useEffect(() => {
    if (status === 'correct') return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [status, activeIndex]);

  const loadPlayerBlunders = async (targetUser: string) => {
    const clean = targetUser.trim();
    if (!clean) return;

    setIsLoading(true);
    setSyncError(null);

    try {
      const [profileData, matchesRes] = await Promise.all([
        fetchChessComUserData(clean),
        fetchRealPlayerMatchesWithStatus(clean),
      ]);

      if (matchesRes.code !== 'OK' || matchesRes.matches.length === 0) {
        setSyncError(
          matchesRes.errorMessage ||
            `No recent games found for "@${clean}". Showing verified Blunder Recovery set.`
        );
        setPuzzles(FALLBACK_BLUNDER_RECOVERY_PUZZLES);
        setIsPersonalSet(false);
        setActiveIndex(0);
        return;
      }

      const rating =
        profileData.blitzRating || profileData.rapidRating || profileData.bulletRating || 1750;
      const generated = generatePersonalizedBlunderBank(
        profileData.username,
        matchesRes.matches,
        rating
      );

      if (generated.length > 0) {
        setPuzzles(generated);
        const hasRealMatchId = generated.some((p) => !p.id.startsWith('fallback-'));
        setIsPersonalSet(hasRealMatchId);
        setActiveIndex(0);
      } else {
        setPuzzles(FALLBACK_BLUNDER_RECOVERY_PUZZLES);
        setIsPersonalSet(false);
        setActiveIndex(0);
      }
    } catch (err: any) {
      setSyncError(
        err?.message ||
          `Could not fetch games for "${clean}". Showing curated Blunder Recovery set.`
      );
      setPuzzles(FALLBACK_BLUNDER_RECOVERY_PUZZLES);
      setIsPersonalSet(false);
      setActiveIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    onLogin(trimmed);
    loadPlayerBlunders(trimmed);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    chessAudio.setMuted(!next);
    if (next) chessAudio.playSelect();
  };

  /**
   * Strict Turn-Lock & Move Validation using chess.js
   * - Validates legality via chess.js on activePuzzle.fen
   * - If correct: executes the move on the board, plays brilliant chime, marks solved
   * - If incorrect: briefly shows attempted move, plays blunder tone, shakes board,
   *   and snaps the piece smoothly back to its original square so the user can retry immediately.
   */
  const handleMovePlayed = (from: string, to: string) => {
    if (!activePuzzle || status === 'correct') return;

    if (snapbackTimerRef.current) {
      window.clearTimeout(snapbackTimerRef.current);
    }

    const startFen = activePuzzle.fen;
    const game = new Chess(startFen);

    // Ensure strict turn lock: user can only move pieces for the active puzzle turn
    const turnColor = game.turn(); // 'w' | 'b'
    const pieceAtSource = game.get(from as any);
    if (!pieceAtSource || pieceAtSource.color !== turnColor) {
      return;
    }

    // Validate move legality via chess.js
    let moveObj: ReturnType<Chess['move']> = null;
    try {
      moveObj = game.move({ from, to, promotion: 'q' });
    } catch {
      moveObj = null;
    }

    if (!moveObj) return;

    const expectedMove = activePuzzle.solutionMoves[0];
    const cleanWinningSan = activePuzzle.winningMove
      .replace(/^\d+\.{1,3}\s*/, '')
      .replace(/[!?+#]/g, '')
      .trim();
    const cleanPlayedSan = moveObj.san.replace(/[!?+#]/g, '').trim();

    const isExpectedMatch =
      (expectedMove && expectedMove.from === from && expectedMove.to === to) ||
      cleanPlayedSan === cleanWinningSan ||
      game.isCheckmate();

    if (isExpectedMatch) {
      // Correct Move! Keep piece on destination square and lock solved state
      setBoardFen(game.fen());
      setLastMoveSquares({ from, to });
      setStatus('correct');
      setWrongAttemptSan(null);
      setIsBoardShaking(false);
      chessAudio.playBrilliant();

      if (!solvedIds.includes(activePuzzle.id)) {
        setSolvedIds((prev) => [...prev, activePuzzle.id]);
      }
      setStreakCount((prev) => prev + 1);
    } else {
      // Incorrect Move — Smooth Snap-Back with Audio-Visual Cue
      setBoardFen(game.fen());
      setLastMoveSquares({ from, to });
      setStatus('wrong');
      setWrongAttemptSan(moveObj.san);
      setIsBoardShaking(true);
      setStreakCount(0);
      chessAudio.playBlunder();

      snapbackTimerRef.current = window.setTimeout(() => {
        setBoardFen(startFen);
        setLastMoveSquares({});
        setIsBoardShaking(false);
      }, 360);
    }
  };

  const handleToggleBlunderPreview = () => {
    if (!activePuzzle) return;
    if (status === 'showing_blunder') {
      setBoardFen(activePuzzle.fen);
      setLastMoveSquares({});
      setStatus('solving');
      chessAudio.playMove();
    } else {
      // Compute or use blunderFen
      let previewFen = activePuzzle.blunderFen;
      if (!previewFen && activePuzzle.blunderFromTo) {
        try {
          const temp = new Chess(activePuzzle.fen);
          temp.move({
            from: activePuzzle.blunderFromTo.from,
            to: activePuzzle.blunderFromTo.to,
            promotion: 'q',
          });
          previewFen = temp.fen();
        } catch {
          previewFen = activePuzzle.fen;
        }
      }
      setBoardFen(previewFen || activePuzzle.fen);
      setLastMoveSquares({
        from: activePuzzle.blunderFromTo?.from,
        to: activePuzzle.blunderFromTo?.to,
      });
      setStatus('showing_blunder');
      chessAudio.playCapture();
    }
  };

  const handleResetPuzzle = () => {
    if (!activePuzzle) return;
    if (snapbackTimerRef.current) {
      window.clearTimeout(snapbackTimerRef.current);
    }
    setBoardFen(activePuzzle.fen);
    setLastMoveSquares({});
    setStatus('solving');
    setWrongAttemptSan(null);
    setShowHint(false);
    setIsBoardShaking(false);
    chessAudio.playMove();
  };

  const handleNextPuzzle = () => {
    if (filteredPuzzles.length === 0) return;
    const nextIdx = (safeActiveIndex + 1) % filteredPuzzles.length;
    setActiveIndex(nextIdx);
    chessAudio.playSelect();
  };

  const handleSelectTheme = (theme: 'ALL' | CanonicalTacticalTheme) => {
    setSelectedTheme(theme);
    setActiveIndex(0);
    chessAudio.playSelect();
  };

  const handleSelectDifficulty = (diff: 'ALL' | PuzzleDifficultyTier) => {
    setSelectedDifficulty(diff);
    setActiveIndex(0);
    chessAudio.playSelect();
  };

  const handleResetFilters = () => {
    setSelectedTheme('ALL');
    setSelectedDifficulty('ALL');
    setActiveIndex(0);
    chessAudio.playSelect();
  };

  // Determine active side to move from puzzle's starting FEN
  const activeTurnCode = ((activePuzzle?.fen.split(' ')[1] || 'w') as 'w' | 'b');
  const activeSideLabel = activeTurnCode === 'w' ? 'White' : 'Black';
  const isBoardFlipped = activeTurnCode === 'b';

  // Calculate puzzle difficulty rating & tier (tabular-nums)
  const puzzleDifficulty = activePuzzle ? getPuzzleDifficultyElo(activePuzzle) : 1750;
  const puzzleDifficultyTier = activePuzzle ? getPuzzleDifficultyTier(activePuzzle) : 'Medium';

  const activeTheme =
    activePuzzle?.detailedDescription?.tacticalMotif ||
    activePuzzle?.tags?.[0] ||
    'Tactical Refutation';
  const activeCanonicalTheme = activePuzzle
    ? getCanonicalTacticalTheme(activePuzzle)
    : 'Defensive Save';

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =====================================================================
            1. HEADER SECTION: Breadcrumb, Title, Subtitle & Live Player Sync
           ===================================================================== */}
        <header className="mb-8 pb-7 border-b border-slate-200/90">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 mb-3"
          >
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-[#064E3B] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#064E3B] font-bold">Tactical Puzzles</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Your Custom Blunder Recovery
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Puzzles automatically generated from your actual game history mistakes. Solve them to
                master your tactical blind spots.
              </p>
            </div>

            {/* Inline Chess.com Username Sync Control */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <form onSubmit={handleSyncSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Chess.com username..."
                    className="w-full sm:w-56 pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-700 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-emerald-900 disabled:opacity-60 text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <span>Load My Games</span>
                  )}
                </button>
              </form>

              {loggedInUser && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setUsernameInput('');
                    setPuzzles(FALLBACK_BLUNDER_RECOVERY_PUZZLES);
                    setIsPersonalSet(false);
                    setActiveIndex(0);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Handle
                </button>
              )}
            </div>
          </div>

          {/* Error / Fallback Notification Banner */}
          {syncError && (
            <div className="mt-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{syncError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncError(null)}
                className="text-amber-700 hover:text-amber-950 font-bold text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Telemetry Strip (Strictly Tabular Numerals) */}
          <div className="mt-6 pt-5 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Active Queue
                </p>
                <p className="text-lg font-black text-slate-900 tabular-nums mt-0.5">
                  {filteredPuzzles.length > 0 ? safeActiveIndex + 1 : 0}{' '}
                  <span className="text-slate-400 font-semibold">/ {filteredPuzzles.length}</span>
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  isPersonalSet
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {isPersonalSet ? `@${loggedInUser || usernameInput}` : 'Recovery Set'}
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Puzzles Solved
                </p>
                <p className="text-lg font-black text-emerald-700 tabular-nums mt-0.5">
                  {solvedIds.length}{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({Math.round((solvedIds.length / Math.max(1, puzzles.length)) * 100)}%)
                  </span>
                </p>
              </div>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current Streak
                </p>
                <p className="text-lg font-black text-slate-900 tabular-nums mt-0.5">
                  {streakCount} <span className="text-xs font-semibold text-slate-400">in a row</span>
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Elapsed Time
                </p>
                <p className="text-lg font-black text-slate-900 font-mono tabular-nums mt-0.5">
                  {formatTimer(elapsedSeconds)}
                </p>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* =================================================================
              TACTICAL THEME & DIFFICULTY PILL FILTER GROUPS
             ================================================================= */}
          <div className="mt-4 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* 1. Tactical Motif Pill Filter Group */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#064E3B]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Tactical Theme
                  </span>
                </div>
                <div
                  role="group"
                  aria-label="Filter blunders by tactical motif"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {TACTICAL_THEME_OPTIONS.map((opt) => {
                    const isSelected = selectedTheme === opt.value;
                    const count = puzzles.filter((p) => {
                      const matchesDiff =
                        selectedDifficulty === 'ALL' ||
                        getPuzzleDifficultyTier(p) === selectedDifficulty;
                      const matchesMotif =
                        opt.value === 'ALL' || getCanonicalTacticalTheme(p) === opt.value;
                      return matchesDiff && matchesMotif;
                    }).length;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectTheme(opt.value)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-2xs'
                            : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span
                          className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full tabular-nums ${
                            isSelected
                              ? 'bg-emerald-800/90 text-emerald-100'
                              : 'bg-white text-slate-500 border border-slate-200/80'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vertical Divider on Desktop */}
              <div className="hidden lg:block w-px self-stretch bg-slate-200/80" />

              {/* 2. Difficulty Tier Pill Filter Group */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#064E3B]" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Difficulty Tier
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-950 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
                <div
                  role="group"
                  aria-label="Filter blunders by difficulty level"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {DIFFICULTY_OPTIONS.map((diff) => {
                    const isSelected = selectedDifficulty === diff.value;
                    const count = puzzles.filter((p) => {
                      const matchesMotif =
                        selectedTheme === 'ALL' ||
                        getCanonicalTacticalTheme(p) === selectedTheme;
                      const matchesDiff =
                        diff.value === 'ALL' || getPuzzleDifficultyTier(p) === diff.value;
                      return matchesMotif && matchesDiff;
                    }).length;

                    return (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => handleSelectDifficulty(diff.value)}
                        title={diff.eloHint}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                        }`}
                      >
                        <span>{diff.label}</span>
                        {diff.value !== 'ALL' && (
                          <span
                            className={`hidden sm:inline text-[10px] font-normal ${
                              isSelected ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {diff.eloHint}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full tabular-nums ${
                            isSelected
                              ? 'bg-slate-700 text-slate-100'
                              : 'bg-white text-slate-500 border border-slate-200/80'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Empty Filter Combination Notice */}
        {filteredPuzzles.length === 0 && (
          <div className="mb-8 bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-5 h-5 text-[#064E3B]" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              No Blunders Match This Exact Filter Combination
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              There are currently 0 positions tagged with{' '}
              <span className="font-bold text-slate-900">
                {selectedTheme === 'ALL' ? 'Any Theme' : selectedTheme}
              </span>{' '}
              at{' '}
              <span className="font-bold text-slate-900">
                {selectedDifficulty === 'ALL' ? 'Any Difficulty' : `${selectedDifficulty} Difficulty`}
              </span>
              . Reset filters to continue training.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {selectedDifficulty !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => handleSelectDifficulty('ALL')}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Show All Difficulties
                </button>
              )}
              {selectedTheme !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => handleSelectTheme('ALL')}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Show All Themes
                </button>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-full bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            2. TWO-COLUMN SPLIT LAYOUT (Desktop) / STACKED (Mobile)
           ===================================================================== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePuzzle.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* -----------------------------------------------------------------
                LEFT COLUMN (7 Cols): Large 1:1 Interactive Chessboard
               ----------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
                {/* Top Opponent Context Strip */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3.5 h-3.5 rounded-sm border ${
                        activeTurnCode === 'w'
                          ? 'bg-slate-900 border-slate-900'
                          : 'bg-white border-slate-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          @{activePuzzle.opponentName}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
                          ({activePuzzle.opponentRating})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {activePuzzle.opening} · {activePuzzle.gameType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold tabular-nums">
                      Move {activePuzzle.moveNumber || 18}
                    </span>
                    {activePuzzle.matchUrl && (
                      <a
                        href={activePuzzle.matchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="View source game on Chess.com"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 1:1 Crystal-Clear Chessboard Container with Snap-Back Shake */}
                <motion.div
                  animate={
                    isBoardShaking
                      ? { x: [0, -8, 8, -6, 6, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.32 }}
                  className="w-full flex justify-center"
                >
                  <ChesscomBoard
                    fen={boardFen}
                    fromSquare={
                      lastMoveSquares.from ||
                      (showHint ? activePuzzle.solutionMoves[0]?.from : undefined)
                    }
                    toSquare={lastMoveSquares.to}
                    classification={
                      status === 'correct'
                        ? 'brilliant'
                        : status === 'showing_blunder' || status === 'wrong'
                        ? 'blunder'
                        : undefined
                    }
                    isFlipped={isBoardFlipped}
                    interactive={status === 'solving' || status === 'wrong'}
                    allowedTurnColor={activeTurnCode}
                    onMovePlayed={handleMovePlayed}
                    className="!min-w-0 !max-w-[580px] w-full shadow-md border-2 border-slate-800"
                  />
                </motion.div>

                {/* Bottom Player Turn & Action Controls Bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-sm border ${
                        activeTurnCode === 'w'
                          ? 'bg-white border-slate-400'
                          : 'bg-slate-900 border-slate-900'
                      }`}
                    />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      {activeSideLabel} to Move
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-emerald-700">
                      Turn-Locked ({activeSideLabel} Only)
                    </span>
                  </div>

                  {/* Interactive Board Utilities */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleBlunderPreview}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        status === 'showing_blunder'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {status === 'showing_blunder'
                          ? 'Back to Puzzle'
                          : `See Blunder (${activePuzzle.blunderedMove})`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowHint((prev) => !prev);
                        chessAudio.playSelect();
                      }}
                      disabled={status === 'correct'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                        showHint
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>{showHint ? `Hint: Move from ${activePuzzle.solutionMoves[0]?.from.toUpperCase()}` : 'Hint'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPuzzle}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Reset board position"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleSound}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/90 transition-colors cursor-pointer"
                      title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------------
                RIGHT COLUMN (5 Cols): Puzzle Control Panel & Explanation Hub
               ----------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* 1. Active Puzzle Status Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#064E3B] text-xs font-extrabold tracking-wide">
                      <Target className="w-3.5 h-3.5 text-emerald-700" />
                      {activeTheme}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-600">
                      {activeCanonicalTheme}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                        puzzleDifficultyTier === 'Easy'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : puzzleDifficultyTier === 'Medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {puzzleDifficultyTier}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-black text-slate-900 tabular-nums">
                      {puzzleDifficulty} ELO
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {activePuzzle.title}
                </h2>

                {/* Evaluation Comparison Strip */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl px-3.5 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                      Played in Match (??)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-black font-mono text-rose-900">
                        {activePuzzle.blunderedMove}
                      </span>
                      <span className="text-xs font-bold font-mono text-rose-700 tabular-nums">
                        Eval {activePuzzle.blunderEval}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl px-3.5 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Target Recovery Eval
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-black font-mono text-emerald-950">
                        {status === 'correct' ? activePuzzle.winningMove : 'Find Best Move'}
                      </span>
                      <span className="text-xs font-bold font-mono text-emerald-700 tabular-nums">
                        Eval {activePuzzle.bestEval}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Feedback Box */}
              <AnimatePresence mode="wait">
                {status === 'correct' && (
                  <motion.div
                    key="feedback-solved"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="bg-[#064E3B] text-white rounded-2xl p-6 border border-emerald-800 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-300 mb-1">
                          Correct Move! 🌟
                        </span>
                        <h3 className="text-xl font-black tracking-tight">
                          Puzzle Solved Successfully 🎉
                        </h3>
                      </div>
                      <CheckCircle2 className="w-7 h-7 text-emerald-300 shrink-0" />
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                      You found{' '}
                      <span className="font-mono font-bold text-white underline decoration-emerald-400">
                        {activePuzzle.winningMove}
                      </span>
                      , recovering the position to{' '}
                      <span className="font-mono font-bold tabular-nums text-emerald-300">
                        {activePuzzle.bestEval}
                      </span>
                      .
                    </p>

                    <button
                      type="button"
                      onClick={handleNextPuzzle}
                      className="mt-5 w-full py-3 px-4 rounded-xl bg-white hover:bg-emerald-50 text-[#064E3B] font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Next Personal Puzzle →</span>
                    </button>
                  </motion.div>
                )}

                {status === 'wrong' && (
                  <motion.div
                    key="feedback-wrong"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="bg-amber-50 border border-amber-300/90 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-amber-950">
                        Incorrect — Try again ⚠️
                      </span>
                      {wrongAttemptSan && (
                        <span className="px-2 py-0.5 rounded bg-amber-200/70 text-amber-950 font-mono text-xs font-bold">
                          Played: {wrongAttemptSan}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-amber-900/90 leading-relaxed">
                      The piece has been reset to its starting square. Look closely at forcing
                      checks, undefended enemy pieces, or how to neutralize the immediate threat on
                      Move {activePuzzle.moveNumber || 18}.
                    </p>
                  </motion.div>
                )}

                {status === 'showing_blunder' && (
                  <motion.div
                    key="feedback-blunder-preview"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="bg-rose-50 border border-rose-200 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-rose-950">
                        Inspecting Game Blunder ({activePuzzle.blunderedMove})
                      </span>
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="mt-1.5 text-xs text-rose-800 leading-relaxed">
                      This is the board state right after your actual game mistake. Click{' '}
                      <button
                        type="button"
                        onClick={handleToggleBlunderPreview}
                        className="font-bold underline cursor-pointer"
                      >
                        Back to Puzzle
                      </button>{' '}
                      to play the winning alternative instead.
                    </p>
                  </motion.div>
                )}

                {status === 'solving' && (
                  <motion.div
                    key="feedback-solving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                        <Compass className="w-5 h-5 text-[#064E3B]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Your Turn — Find the Best Move for {activeSideLabel}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Drag or click any {activeSideLabel} piece to execute the tactical recovery.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3. Step-by-Step Tactical Explanations Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Step-by-Step Tactical Breakdown
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {activePuzzle.phase} Phase
                  </span>
                </div>

                {/* Step 1: Why the previous move was a blunder */}
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                      Why {activePuzzle.blunderedMove} Was a Blunder
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activePuzzle.detailedDescription?.blunderAnalysis ||
                        activePuzzle.explanation}
                    </p>
                  </div>
                </div>

                {/* Step 2: Positional Context */}
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                      Critical Position Pattern ({activeTheme})
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activePuzzle.detailedDescription?.matchContext ||
                        `On Move ${activePuzzle.moveNumber || 18} against @${activePuzzle.opponentName}, the position demanded an active tactical response.`}
                    </p>
                  </div>
                </div>

                {/* Step 3: Tactical Principle (Reveals full move notation once solved or hinted) */}
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-[#064E3B] font-black text-xs flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#064E3B]">
                      Guiding Tactical Principle
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {status === 'correct' || showHint
                        ? activePuzzle.detailedDescription?.masterLesson || activePuzzle.explanation
                        : `Look for a forcing move (${activeTheme}) that directly addresses the most vulnerable square on the board before making routine developing moves.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Personal Blunder Queue Selector */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#064E3B]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Blunder Recovery Queue
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400 tabular-nums">
                    {filteredPuzzles.length} of {puzzles.length} Positions
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {filteredPuzzles.map((item, idx) => {
                    const isCurrent = idx === safeActiveIndex;
                    const isItemSolved = solvedIds.includes(item.id);
                    const motifLabel = getCanonicalTacticalTheme(item);
                    const itemDiffTier = getPuzzleDifficultyTier(item);
                    const itemDiffElo = getPuzzleDifficultyElo(item);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveIndex(idx);
                          chessAudio.playSelect();
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-50/80 border-emerald-600/50 text-slate-900'
                            : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-md text-[11px] font-black tabular-nums flex items-center justify-center shrink-0 ${
                              isItemSolved
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-[#064E3B] text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                          >
                            {isItemSolved ? '✓' : idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              vs. @{item.opponentName} · Move {item.moveNumber || 18}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {motifLabel} · {itemDiffTier} ({itemDiffElo}) · {item.blunderedMove}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono font-bold text-rose-600 tabular-nums">
                            {item.blunderEval}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
