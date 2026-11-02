import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Clock,
  Sparkles,
  Layers,
  Award,
  Search,
  Swords,
  ChevronDown,
  ShieldAlert,
  Scale,
  Target,
  AlertTriangle,
  Share2,
  FlaskConical,
} from 'lucide-react';
import { FEATURED_MATCH_ANALYSIS } from '../data/matchAnalysisData';
import { AnalyzedPly, MoveClassification, ChessComMatch, FullMatchAnalysis, TacticalPuzzle } from '../types/chess';
import { EvalBadge } from './EvalBadge';
import { ChesscomBoard } from './ChesscomBoard';
import { RealMatchListFeed } from './RealMatchListFeed';
import { AccuracyRing } from './AccuracyRing';
import { PaywallModal } from './PaywallModal';
import { chessAudio } from '../services/chessSound';
import { fetchRealPlayerMatchesWithStatus, ApiErrorCode } from '../services/chessComApi';
import {
  analyzePgnAsync,
  evaluatePositionMultiPly,
  enrichAnalysisWithCloudEval,
} from '../services/pgnAnalyzer';
import { ShareData } from './ShareModal';

interface SandboxState {
  fen: string;
  fromSquare: string;
  toSquare: string;
  notation: string;
  evalScore: string;
  classification: MoveClassification;
  moveCount: number;
  history: string[];
  explanation: string;
}

function evaluateSandboxFen(chess: Chess): { pawns: number; pvLine: string } {
  const res = evaluatePositionMultiPly(chess.fen(), 2);
  return { pawns: res.pawns, pvLine: res.pvLine };
}

interface MoveByMoveAnalyzerProps {
  initialUsername?: string;
  onPuzzlesGenerated?: (puzzles: TacticalPuzzle[]) => void;
  onOpenShare?: (data: ShareData) => void;
  onUsernameChange?: (username: string) => void;
  onOpenProfileStats?: () => void;
}

export function MoveByMoveAnalyzer({
  initialUsername = 'Hikaru',
  onPuzzlesGenerated,
  onOpenShare,
  onUsernameChange,
  onOpenProfileStats,
}: MoveByMoveAnalyzerProps) {
  // Decoupled local username input state for lag-free typing
  const [usernameInput, setUsernameInput] = useState<string>(initialUsername);
  const [activeUsername, setActiveUsername] = useState<string>(initialUsername);
  const [recentMatches, setRecentMatches] = useState<ChessComMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [matchErrorCode, setMatchErrorCode] = useState<ApiErrorCode | undefined>(undefined);
  const [matchErrorMessage, setMatchErrorMessage] = useState<string | undefined>(undefined);
  const [selectedMatch, setSelectedMatch] = useState<ChessComMatch | null>(null);
  const [isMatchFeedOpen, setIsMatchFeedOpen] = useState<boolean>(true);

  // Active match analysis state (initialized with instant pre-computed featured match)
  const [matchAnalysis, setMatchAnalysis] = useState<FullMatchAnalysis>(FEATURED_MATCH_ANALYSIS);
  const [activePlyIndex, setActivePlyIndex] = useState<number>(FEATURED_MATCH_ANALYSIS.plies.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Interactive What-If Sandbox state when user drags/clicks legal moves on the board
  const [sandboxState, setSandboxState] = useState<SandboxState | null>(null);

  // Free Credit System (⚡ 3 / 3 Free Analysen verfügbar)
  const [credits, setCredits] = useState<number>(3);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isProSubscriber, setIsProSubscriber] = useState<boolean>(false);

  const activeMoveRowRef = useRef<HTMLButtonElement | null>(null);
  const moveFeedContainerRef = useRef<HTMLDivElement | null>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const userExplicitSearchRef = useRef<boolean>(false);

  const currentPly: AnalyzedPly = matchAnalysis.plies[activePlyIndex] || matchAnalysis.plies[0];

  // Sync with prop updates when user searches from HeroSection or Navbar
  useEffect(() => {
    const cleanProp = (initialUsername || '').trim();
    if (cleanProp && cleanProp.toLowerCase() !== activeUsername.toLowerCase()) {
      userExplicitSearchRef.current = true;
      setUsernameInput(cleanProp);
      setActiveUsername(cleanProp);
    }
  }, [initialUsername, activeUsername]);

  // Cleanup any in-flight async analysis on unmount
  useEffect(() => {
    return () => {
      analysisAbortRef.current?.abort();
    };
  }, []);

  // When a match is selected, analyze its PGN asynchronously in non-blocking chunks
  const handleSelectMatch = (match: ChessComMatch, shouldScrollToBoard = true) => {
    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;

    setSelectedMatch(match);
    setIsPlaying(false);
    setSandboxState(null);

    if (match.userColor === 'black') {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }

    if (shouldScrollToBoard) {
      setTimeout(() => {
        const el = document.getElementById('analyzer-board-view');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    analyzePgnAsync(
      match.pgn,
      activeUsername,
      {
        whiteName: match.white.username,
        whiteRating: match.white.rating,
        blackName: match.black.username,
        blackRating: match.black.rating,
        event: `Chess.com Live · ${match.timeControl}`,
        timeControl: match.timeControl,
        result:
          match.white.result === 'win'
            ? '1-0'
            : match.black.result === 'win'
            ? '0-1'
            : '1/2-1/2',
        dateFormatted: match.dateFormatted,
      },
      controller.signal
    )
      .then((analyzed) => {
        if (controller.signal.aborted) return;
        setMatchAnalysis(analyzed);
        setActivePlyIndex(analyzed.plies.length - 1);

        if (analyzed.detectedPuzzles && analyzed.detectedPuzzles.length > 0 && onPuzzlesGenerated) {
          onPuzzlesGenerated(analyzed.detectedPuzzles);
        }

        // Enrich critical positions asynchronously with Lichess Cloud Evaluation
        return enrichAnalysisWithCloudEval(analyzed, controller.signal).then((enriched) => {
          if (enriched && !controller.signal.aborted) {
            setMatchAnalysis((current) => (current.id === analyzed.id ? enriched : current));
          }
        });
      })
      .catch(() => {
        // Ignore aborted analysis
      });
  };

  // Fetch real matches when username changes via server-side proxy
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingMatches(true);
    setMatchErrorCode(undefined);
    setMatchErrorMessage(undefined);

    fetchRealPlayerMatchesWithStatus(activeUsername)
      .then((result) => {
        if (isCancelled) return;
        setRecentMatches(result.matches);
        setMatchErrorCode(result.code);
        setMatchErrorMessage(result.errorMessage);
        setIsLoadingMatches(false);

        // Only auto-analyze the first match if the user explicitly searched a username;
        // on initial page load, keep FEATURED_MATCH_ANALYSIS ready with 0ms main-thread work!
        if (result.matches.length > 0 && userExplicitSearchRef.current) {
          userExplicitSearchRef.current = false;
          handleSelectMatch(result.matches[0], false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsLoadingMatches(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeUsername]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = usernameInput.trim().replace(/^@/, '');
    if (!clean) return;
    userExplicitSearchRef.current = true;
    setActiveUsername(clean);
    setIsMatchFeedOpen(true);
    onUsernameChange?.(clean);
  };

  // Play audio on active move change
  const playMoveAudio = (ply: AnalyzedPly) => {
    if (isMuted) return;
    if (ply.classification === 'brilliant') {
      chessAudio.playBrilliant();
    } else if (ply.classification === 'best') {
      chessAudio.playBest();
    } else if (ply.classification === 'blunder') {
      chessAudio.playBlunder();
    } else if (ply.classification === 'mistake') {
      chessAudio.playMistake();
    } else if (ply.notation.includes('x')) {
      chessAudio.playCapture();
    } else {
      chessAudio.playMove();
    }
  };

  const handleSelectPly = (index: number) => {
    setIsPlaying(false);
    setSandboxState(null);
    const targetPly = matchAnalysis.plies[index];
    setActivePlyIndex(index);
    if (targetPly) playMoveAudio(targetPly);
  };

  /**
   * Executes a legal move in the Interactive What-If Sandbox.
   * Automatically handles pawn promotion to Queen ('q') so pawns never disappear on the 8th/1st rank.
   */
  const handleSandboxMove = (from: string, to: string) => {
    setIsPlaying(false);
    const baseFen =
      sandboxState?.fen ||
      currentPly?.fen ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    try {
      const chess = new Chess(baseFen);
      const piece = chess.get(from as Square);
      if (!piece) return;

      const isPromotion =
        piece.type === 'p' &&
        ((piece.color === 'w' && to.endsWith('8')) ||
          (piece.color === 'b' && to.endsWith('1')));

      const moveObj = chess.move({
        from,
        to,
        ...(isPromotion ? { promotion: 'q' } : {}),
      });

      if (!moveObj) return;

      const sandboxEval = evaluateSandboxFen(chess);
      const newEvalNum = sandboxEval.pawns;
      const formattedEval =
        newEvalNum > 0 ? `+${newEvalNum.toFixed(1)}` : newEvalNum.toFixed(1);

      if (!isMuted) {
        if (chess.inCheck()) {
          chessAudio.playCheck();
        } else if (moveObj.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }
      }

      const nextHistory = [...(sandboxState?.history || []), moveObj.san];
      setSandboxState({
        fen: chess.fen(),
        fromSquare: moveObj.from,
        toSquare: moveObj.to,
        notation: `${moveObj.color === 'w' ? 'White' : 'Black'}: ${moveObj.san}`,
        evalScore: formattedEval,
        classification: 'best',
        moveCount: nextHistory.length,
        history: nextHistory,
        explanation: `What-If Sandbox continuation (${nextHistory.join(' → ')}). Live evaluation: ${formattedEval} pawns.${
          sandboxEval.pvLine ? ` Best reply line: ${sandboxEval.pvLine}.` : ''
        } Click "Reset to Match Line" to return to the recorded game.`,
      });
    } catch {
      // Ignore illegal moves
    }
  };

  // Auto-play timer with configurable speed
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const baseDelay = 1400 / playSpeed;
      interval = setInterval(() => {
        setActivePlyIndex((prev) => {
          if (prev >= matchAnalysis.plies.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          const nextPly = matchAnalysis.plies[nextIndex];
          if (nextPly) playMoveAudio(nextPly);
          return nextIndex;
        });
      }, baseDelay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playSpeed, matchAnalysis.plies]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        setIsPlaying(false);
        setActivePlyIndex((prev) => {
          const next = Math.max(0, prev - 1);
          if (matchAnalysis.plies[next]) playMoveAudio(matchAnalysis.plies[next]);
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        setIsPlaying(false);
        setActivePlyIndex((prev) => {
          const next = Math.min(matchAnalysis.plies.length - 1, prev + 1);
          if (matchAnalysis.plies[next]) playMoveAudio(matchAnalysis.plies[next]);
          return next;
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matchAnalysis.plies, isMuted]);

  // Auto-scroll active move row smoothly into view
  useEffect(() => {
    if (activeMoveRowRef.current && moveFeedContainerRef.current) {
      activeMoveRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activePlyIndex]);

  // Decrement credit on scan trigger
  const handleTriggerDeepScan = () => {
    if (isProSubscriber) {
      handleSelectPly(0);
      setIsPlaying(true);
      return;
    }

    if (credits <= 1) {
      setCredits(0);
      setIsPaywallOpen(true);
    } else {
      setCredits((prev) => prev - 1);
      handleSelectPly(0);
      setIsPlaying(true);
    }
  };

  // Convert eval score to percentage for eval bar
  const getEvalBarHeight = (evalScore: string) => {
    const num = parseFloat(evalScore.replace('+', ''));
    if (isNaN(num)) return 50;
    const clamped = Math.max(-6, Math.min(6, num));
    return Math.round(50 + (clamped / 6) * 40);
  };

  const activeEvalScore = sandboxState?.evalScore || currentPly?.evalScore || '+0.2';
  const evalHeight = getEvalBarHeight(activeEvalScore);
  const whiteAdvantagePct = evalHeight;
  const blackAdvantagePct = 100 - evalHeight;
  const displayedFen =
    sandboxState?.fen ||
    currentPly?.fen ||
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const activeTurnSide = (displayedFen.split(' ')[1] || 'w') === 'w' ? 'White' : 'Black';

  return (
    <div className="w-full space-y-7">
      {/* Search Header Bar: Real Chess.com Search + Free Credit System */}
      <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
        {/* Username Search Box */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 select-none">
              ♟
            </span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Search Chess.com handle (e.g. Hikaru)..."
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-900 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Fetch Matches</span>
          </button>
          {onOpenProfileStats && (
            <button
              type="button"
              onClick={onOpenProfileStats}
              className="px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title={`View @${activeUsername} Live Stats`}
            >
              @{activeUsername} Stats
            </button>
          )}
        </form>

        {/* Free Credit System & Paywall Trigger Badge */}
        <div className="flex items-center gap-3">
          {isProSubscriber ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>∞ Unlimited Pro Active</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (credits === 0) setIsPaywallOpen(true);
                else handleTriggerDeepScan();
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                credits > 1
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                  : credits === 1
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 animate-pulse'
              }`}
              title="Trigger Deep Engine Scan"
            >
              <Zap className={`w-3.5 h-3.5 ${credits > 0 ? 'text-amber-500 fill-amber-500' : 'text-rose-600'}`} />
              <span>
                {credits > 0 ? `⚡ ${credits} / 3 Free Scans Available` : '⚡ 0 / 3 Free Scans Remaining'}
              </span>
            </button>
          )}

          {/* Toggle Last 10 Matches List */}
          <button
            onClick={() => setIsMatchFeedOpen(!isMatchFeedOpen)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <Swords className="w-3.5 h-3.5 text-emerald-600" />
            <span>Last 10 Games ({recentMatches.length})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMatchFeedOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Last 10 Matches Drawer */}
      <AnimatePresence>
        {isMatchFeedOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <RealMatchListFeed
              matches={recentMatches}
              selectedMatchId={selectedMatch?.id || null}
              onSelectMatch={(m) => {
                handleSelectMatch(m);
                setIsMatchFeedOpen(false);
              }}
              isLoading={isLoadingMatches}
              errorCode={matchErrorCode}
              errorMessage={matchErrorMessage}
              searchedUsername={activeUsername}
              onQuickSelectUsername={(sampleHandle) => {
                setUsernameInput(sampleHandle);
                setActiveUsername(sampleHandle);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Match Banner */}
      <div id="analyzer-board-view" className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 scroll-mt-24">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            ♟
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span>{matchAnalysis.whitePlayer.name} ({matchAnalysis.whitePlayer.rating})</span>
              <span className="text-slate-400 font-normal">vs</span>
              <span>{matchAnalysis.blackPlayer.name} ({matchAnalysis.blackPlayer.rating})</span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{matchAnalysis.event}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">{matchAnalysis.result}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium hidden sm:inline">Turn:</span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              {activeTurnSide} to move
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium hidden sm:inline">Plies:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
              {matchAnalysis.plies.length} moves
            </span>
          </div>

          {onOpenShare && (
            <button
              onClick={() =>
                onOpenShare({
                  title: `${matchAnalysis.whitePlayer.name} vs ${matchAnalysis.blackPlayer.name}`,
                  description: `Game Analysis (${matchAnalysis.event}): ${matchAnalysis.result}. Analyzed ${matchAnalysis.plies.length} plies with the ChessPulse Tactical Heuristic Engine.`,
                  type: 'match',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              title="Share Game Analysis"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Screen Dashboard: Left Column (Pixel-Perfect Board) & Right Column (AI Coach) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (lg:col-span-8): Eval Bar, Board, Sandbox Bar, Toolbar */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Live Evaluation Bar (Advantage Bar) */}
            <div className="flex sm:flex-col items-center gap-2 order-2 sm:order-1">
              <div className="relative w-48 sm:w-6 h-5 sm:h-96 bg-[#262421] rounded-full overflow-hidden flex sm:flex-col justify-end p-0.5 border-2 border-slate-700 shadow-xl">
                {/* Black Side Percentage Indicator (Top) */}
                <span className="hidden sm:block absolute top-2 left-0 right-0 text-center font-mono text-[9px] font-bold text-slate-300 select-none z-10 tabular-nums">
                  {blackAdvantagePct}%
                </span>

                {/* White Smooth Advantage Height Bar */}
                <div
                  className="bg-white rounded-full shadow-md transition-all duration-400 ease-out"
                  style={{
                    height: `${evalHeight}%`,
                    width: '100%',
                  }}
                />

                {/* White Side Percentage Indicator (Bottom) */}
                <span className="hidden sm:block absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] font-bold text-slate-700 select-none z-10 tabular-nums">
                  {whiteAdvantagePct}%
                </span>
              </div>

              {/* Exact Stockfish Numeric Value */}
              <div className="text-center font-mono text-xs font-bold text-slate-800 tabular-nums bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {activeEvalScore}
              </div>
            </div>

            {/* Pixel-Perfect Chess.com Board Component with Interactive What-If Sandbox */}
            <div className="order-1 sm:order-2 w-full flex justify-center">
              <ChesscomBoard
                fen={displayedFen}
                fromSquare={sandboxState?.fromSquare || currentPly?.fromSquare}
                toSquare={sandboxState?.toSquare || currentPly?.toSquare}
                classification={sandboxState ? sandboxState.classification : currentPly?.classification}
                isFlipped={isFlipped}
                interactive={true}
                allowedTurnColor={null}
                onMovePlayed={handleSandboxMove}
              />
            </div>
          </div>

          {/* Interactive What-If Sandbox Status Bar & Instant Reset Button */}
          <div
            className={`px-4 py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-all ${
              sandboxState
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-white border-slate-200/80 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <FlaskConical
                className={`w-4 h-4 shrink-0 ${
                  sandboxState ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              {sandboxState ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-emerald-900">
                    What-If Sandbox Active ({sandboxState.moveCount}{' '}
                    {sandboxState.moveCount === 1 ? 'move' : 'moves'})
                  </span>
                  <span className="text-emerald-300">•</span>
                  <span className="font-mono font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {sandboxState.history.join(' → ')}
                  </span>
                </div>
              ) : (
                <span>
                  <strong className="text-slate-800">Interactive What-If Sandbox:</strong> Click or
                  drag any <strong className="text-emerald-700">{activeTurnSide}</strong> piece to
                  test alternative continuations with glowing legal move targets.
                </span>
              )}
            </div>

            {sandboxState && (
              <button
                type="button"
                onClick={() => setSandboxState(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Match Line</span>
              </button>
            )}
          </div>

          {/* Move-Control Toolbar Underneath */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Step & Play Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSelectPly(0)}
                disabled={activePlyIndex === 0 && !sandboxState}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="First Move (|◀)"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSelectPly(Math.max(0, activePlyIndex - 1))}
                disabled={activePlyIndex === 0 && !sandboxState}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Move (◀ or Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (sandboxState) setSandboxState(null);
                  setIsPlaying((prev) => !prev);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-700/20'
                }`}
                title="Auto Play / Pause (Spacebar)"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => handleSelectPly(Math.min(matchAnalysis.plies.length - 1, activePlyIndex + 1))}
                disabled={activePlyIndex === matchAnalysis.plies.length - 1 && !sandboxState}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Move (▶ or Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSelectPly(matchAnalysis.plies.length - 1)}
                disabled={activePlyIndex === matchAnalysis.plies.length - 1 && !sandboxState}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Last Move (▶|)"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Selector & Audio / Flip Toggles */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] font-bold">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaySpeed(spd)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      playSpeed === spd
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  chessAudio.setMuted(nextMuted);
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={isMuted ? 'Enable Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Flip Board Perspective */}
              <button
                onClick={() => setIsFlipped((prev) => !prev)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer transition-colors"
                title="Flip Board Perspective (White / Black)"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-4): The AI Coach Feed & Interactive Move Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Interactive Move Inspector (The Explanation Card) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={sandboxState ? `sandbox-${sandboxState.moveCount}` : currentPly?.plyIndex ?? 0}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
            >
              {/* Card Header with Official Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {sandboxState ? sandboxState.notation : currentPly?.notation}
                  </span>
                  {sandboxState ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      What-If Line
                    </span>
                  ) : (
                    currentPly && (
                      <EvalBadge classification={currentPly.classification} size="sm" />
                    )
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tabular-nums">
                  Eval: {activeEvalScore}
                </span>
              </div>

              {/* Crystal-clear Human Language Explanation */}
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {sandboxState ? sandboxState.explanation : currentPly?.explanation}
              </p>

              {/* Tactical Delta Details, Best Alternative & Principal Variation */}
              {!sandboxState &&
                (currentPly?.evalDelta ||
                  currentPly?.bestAlternative ||
                  currentPly?.pvLine ||
                  currentPly?.tacticalThreat) && (
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    {currentPly.evalDelta && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Evaluation Swing:</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            currentPly.evalDelta.startsWith('+') ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {currentPly.evalDelta} Swing
                        </span>
                      </div>
                    )}

                    {currentPly.bestAlternative && (
                      <div className="text-slate-800 flex items-center justify-between gap-2 pt-0.5">
                        <span className="font-semibold text-slate-700">Best Engine Move:</span>
                        <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          {currentPly.bestAlternative}
                        </span>
                      </div>
                    )}

                    {currentPly.pvLine && (
                      <div className="text-slate-800 flex flex-col gap-1 pt-0.5">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Principal Variation (PV):
                        </span>
                        <span className="font-mono text-[11px] text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90">
                          {currentPly.pvLine}
                        </span>
                      </div>
                    )}

                    {currentPly.tacticalThreat && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
                        • {currentPly.tacticalThreat}
                      </div>
                    )}
                  </div>
                )}
            </motion.div>
          </AnimatePresence>

          {/* The AI Coach Move Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Move History & Classification Feed</span>
              </span>
              <span className="text-slate-400 text-[11px] tabular-nums">
                {matchAnalysis.plies.length} plies
              </span>
            </div>

            <div
              ref={moveFeedContainerRef}
              className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1.5 scroll-smooth"
            >
              {matchAnalysis.plies.map((ply, idx) => {
                const isActive = activePlyIndex === idx && !sandboxState;
                return (
                  <button
                    key={idx}
                    ref={isActive ? activeMoveRowRef : null}
                    onClick={() => handleSelectPly(idx)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-xs transition-all cursor-pointer text-left rounded-xl ${
                      isActive
                        ? 'bg-emerald-50/90 border border-emerald-300/80 font-bold text-slate-900 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-[11px] text-slate-400 font-mono tabular-nums">
                        {ply.color === 'white' ? `${ply.moveNumber}.` : '...'}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-slate-900 mr-2">
                          {ply.notation}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                          {ply.classification === 'blunder'
                            ? 'Critical blunder'
                            : ply.classification === 'brilliant'
                            ? 'Brilliant sacrifice'
                            : ply.classification === 'mistake'
                            ? 'Tactical mistake'
                            : ply.classification === 'inaccuracy'
                            ? 'Inaccuracy'
                            : ply.classification === 'book'
                            ? 'Opening book'
                            : ply.classification === 'good'
                            ? 'Solid practical move'
                            : 'Top engine move'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <EvalBadge classification={ply.classification} size="xs" />
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums w-10 text-right">
                        {ply.evalScore}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FIDE Master & Arbiter Technical Review (Zero Flattery Policy) */}
      {matchAnalysis.coachReport && (
        <div className="p-6 md:p-8 bg-[#0B1912] text-white rounded-3xl border border-emerald-950/90 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/50 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-emerald-400">
                  <Scale className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  FIDE Master & Arbiter Technical Review
                </span>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/70">
                  Zero Flattery Policy
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {matchAnalysis.coachReport.verdict}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Engine</div>
                <div className="text-xs font-mono font-bold text-emerald-400">ChessPulse Tactical Heuristic Engine</div>
              </div>
            </div>
          </div>

          {/* Unvarnished Master Summary */}
          <div className="p-4 bg-black/35 rounded-2xl border border-emerald-900/40 text-sm text-slate-200 leading-relaxed font-normal">
            <p>{matchAnalysis.coachReport.summary}</p>
          </div>

          {/* 3-Phase Precision Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Opening */}
            <div className="p-4 bg-black/30 rounded-2xl border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 uppercase tracking-wider">Opening Phase</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  {matchAnalysis.coachReport.phaseBreakdown.opening.accuracy}%
                </span>
              </div>
              <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${matchAnalysis.coachReport.phaseBreakdown.opening.accuracy}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {matchAnalysis.coachReport.phaseBreakdown.opening.commentary}
              </p>
            </div>

            {/* Middlegame */}
            <div className="p-4 bg-black/30 rounded-2xl border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 uppercase tracking-wider">Middlegame Phase</span>
                <span className="font-mono text-amber-400 tabular-nums">
                  {matchAnalysis.coachReport.phaseBreakdown.middlegame.accuracy}%
                </span>
              </div>
              <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${matchAnalysis.coachReport.phaseBreakdown.middlegame.accuracy}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {matchAnalysis.coachReport.phaseBreakdown.middlegame.commentary}
              </p>
            </div>

            {/* Endgame */}
            <div className="p-4 bg-black/30 rounded-2xl border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 uppercase tracking-wider">Endgame Phase</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {matchAnalysis.coachReport.phaseBreakdown.endgame.accuracy}%
                </span>
              </div>
              <div className="w-full bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{ width: `${matchAnalysis.coachReport.phaseBreakdown.endgame.accuracy}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {matchAnalysis.coachReport.phaseBreakdown.endgame.commentary}
              </p>
            </div>
          </div>

          {/* Tactical Leaks Table (Click to jump to board) */}
          {matchAnalysis.coachReport.tacticalLeaks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tactical Leaks & Centipawn Bleed</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Click leak to jump to move</span>
              </div>

              <div className="divide-y divide-emerald-900/40 rounded-2xl border border-emerald-900/50 bg-black/35 overflow-hidden">
                {matchAnalysis.coachReport.tacticalLeaks.map((leak, lIdx) => {
                  const targetIdx = matchAnalysis.plies.findIndex(
                    (p) => p.moveNumber === leak.moveNumber && p.color === leak.color
                  );

                  return (
                    <div
                      key={lIdx}
                      onClick={() => {
                        if (targetIdx !== -1) handleSelectPly(targetIdx);
                      }}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-950/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <EvalBadge classification={leak.classification} size="sm" />
                        <div>
                          <div className="font-mono font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                            {leak.notation}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {leak.motif}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end text-xs">
                        <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/50 tabular-nums">
                          -{leak.evalDrop.toFixed(1)} Pawns
                        </span>
                        <div className="text-right hidden md:block">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Refutation</span>
                          <span className="text-[11px] text-slate-200 font-mono">{leak.refutation}</span>
                        </div>
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold text-emerald-300 border border-emerald-800/60 transition-colors cursor-pointer"
                        >
                          Jump ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Arbiter Directives */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Arbiter Directives for Tournament Rating Growth</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {matchAnalysis.coachReport.arbiterDirectives.map((directive, dIdx) => (
                <div
                  key={dIdx}
                  className="p-3.5 bg-black/30 rounded-xl border border-emerald-900/40 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {dIdx + 1}
                  </span>
                  <span>{directive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simplified Apple/Stripe-Standard Match Performance Summary (Essential Data Only) */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Match Performance Executive Summary
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              {matchAnalysis.whitePlayer.name} ({matchAnalysis.whitePlayer.rating}) vs {matchAnalysis.blackPlayer.name} ({matchAnalysis.blackPlayer.rating})
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {matchAnalysis.timeControl || 'Standard'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
              Verified Chess.com Archive
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Column 1: Accurate Tactical Accuracy Rings */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Accuracy Metrics
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Hybrid Cloud + Alpha-Beta
              </span>
            </div>

            <div className="flex items-center justify-around pt-2">
              <AccuracyRing
                score={matchAnalysis.accuracy.white}
                label={matchAnalysis.whitePlayer.name}
                sublabel="White"
                color="#059669"
                size={86}
              />
              <AccuracyRing
                score={matchAnalysis.accuracy.black}
                label={matchAnalysis.blackPlayer.name}
                sublabel="Black"
                color="#26C281"
                size={86}
              />
            </div>
          </div>

          {/* Column 2: Move Classification Breakdown */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Engine Annotations
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {matchAnalysis.plies.length} Half-Moves
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <span>★</span> Best / Good
                </span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {matchAnalysis.plies.filter(m => m.classification === 'best' || m.classification === 'good' || m.classification === 'brilliant').length}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-amber-600">
                  <span>?!</span> Inaccuracies
                </span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {matchAnalysis.plies.filter(m => m.classification === 'inaccuracy').length}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-orange-600">
                  <span>?</span> Mistakes
                </span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {matchAnalysis.plies.filter(m => m.classification === 'mistake').length}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-rose-600">
                  <span>??</span> Blunders
                </span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">
                  {matchAnalysis.plies.filter(m => m.classification === 'blunder').length}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Tactical Action Directive */}
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-2xl border border-emerald-200/80 space-y-3 flex flex-col justify-between h-full">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personalized Puzzles</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Turn your specific game mistakes into high-retention spaced repetition tactical puzzles.
              </p>
            </div>

            <a
              href="/puzzles"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold text-center block transition-all shadow-sm cursor-pointer"
            >
              Train Blunders From This Match →
            </a>
          </div>
        </div>
      </div>

      {/* The 100x High-Converting Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUpgradeSuccess={() => {
          setIsProSubscriber(true);
        }}
        onResetCredits={() => {
          setCredits(3);
        }}
      />
    </div>
  );
}
