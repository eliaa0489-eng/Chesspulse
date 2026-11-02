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
  Sparkles,
  Layers,
  Award,
  Search,
  Swords,
  ChevronDown,
  ShieldAlert,
  Scale,
  Target,
  Share2,
  FlaskConical,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { FEATURED_MATCH_ANALYSIS } from '../data/matchAnalysisData';
import {
  AnalyzedPly,
  MoveClassification,
  ChessComMatch,
  FullMatchAnalysis,
  TacticalPuzzle,
  DeepAnalysisProgress,
} from '../types/chess';
import { EvalBadge, CLASSIFICATION_META } from './EvalBadge';
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
  computeWinProbability,
} from '../services/pgnAnalyzer';
import { ShareData } from './ShareModal';

interface SandboxState {
  fen: string;
  fromSquare: string;
  toSquare: string;
  notation: string;
  evalScore: string;
  winProb: number;
  classification: MoveClassification;
  moveCount: number;
  history: string[];
  explanation: string;
}

function evaluateSandboxFen(chess: Chess): { pawns: number; winProb: number; pvLine: string } {
  const res = evaluatePositionMultiPly(chess.fen(), 3);
  return {
    pawns: res.pawns,
    winProb: computeWinProbability(res.cp, res.mate),
    pvLine: res.pvLine,
  };
}

interface MoveByMoveAnalyzerProps {
  initialUsername?: string;
  onPuzzlesGenerated?: (puzzles: TacticalPuzzle[]) => void;
  onOpenShare?: (data: ShareData) => void;
  onUsernameChange?: (username: string) => void;
  onOpenProfileStats?: () => void;
}

const SHOWCASE_DEMO_MATCHES: ChessComMatch[] = [
  {
    id: 'demo-match-1',
    url: 'https://www.chess.com/games/hikaru-nakamura',
    white: { username: 'ShowcasePlayer', rating: 1765, result: 'win' },
    black: { username: 'AlpineGrandmaster', rating: 1752, result: 'checkmated' },
    pgn: `[Event "Showcase Demo Rapid"]\n[White "ShowcasePlayer"]\n[Black "AlpineGrandmaster"]\n[Result "1-0"]\n[ECO "C50"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O a6 7. Re1 Ba7 8. h3 O-O 9. Nbd2 Ne7 10. Nf1 Ng6 11. Ng3 c6 12. Bb3 d5 13. exd5 Nxd5 14. Nxe5 Nxe5 15. Rxe5 Bxf2+ 16. Kxf2 Qf6+ 17. Rf5 Bxf5 18. Nxf5 Qxf5+ 19. Kg1 Rae8 20. Bd2 Ne3 21. Bxe3 Rxe3 22. d4 Rfe8 1-0`,
    timeControl: '10+0 Rapid',
    timeClass: 'rapid',
    endTime: 1730541600,
    dateFormatted: 'Nov 02',
    userColor: 'white',
    userWon: true,
    userResultText: 'Won by checkmate',
  },
  {
    id: 'demo-match-2',
    url: 'https://www.chess.com/games/magnus-carlsen',
    white: { username: 'BerlinWall_99', rating: 1724, result: 'resigned' },
    black: { username: 'ShowcasePlayer', rating: 1738, result: 'win' },
    pgn: `[Event "Showcase Demo Blitz"]\n[White "BerlinWall_99"]\n[Black "ShowcasePlayer"]\n[Result "0-1"]\n[ECO "B12"]\n\n1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 Nd7 6. O-O Ne7 7. Nbd2 h6 8. Nb3 g5 9. Bd2 Bg7 10. Rc1 O-O 11. c4 dxc4 12. Bxc4 Nb6 13. Be2 Nbd5 14. Nc5 b6 15. Nb7 Qd7 16. Nd6 Bg6 0-1`,
    timeControl: '3+0 Blitz',
    timeClass: 'blitz',
    endTime: 1730368800,
    dateFormatted: 'Oct 31',
    userColor: 'black',
    userWon: true,
    userResultText: 'Won by resignation',
  },
  {
    id: 'demo-match-3',
    url: 'https://www.chess.com/games/fabiano-caruana',
    white: { username: 'ShowcasePlayer', rating: 1712, result: 'agreed' },
    black: { username: 'SicilianStorm', rating: 1705, result: 'agreed' },
    pgn: `[Event "Showcase Demo Blitz"]\n[White "ShowcasePlayer"]\n[Black "SicilianStorm"]\n[Result "1/2-1/2"]\n[ECO "D02"]\n\n1. d4 d5 2. Nf3 Nf6 3. Bf4 c5 4. e3 Nc6 5. Nbd2 e6 6. c3 Bd6 7. Bg3 O-O 8. Bd3 b6 9. Ne5 Bb7 10. f4 Ne7 11. Qf3 Nf5 12. Bf2 Be7 1/2-1/2`,
    timeControl: '3+0 Blitz',
    timeClass: 'blitz',
    endTime: 1730109600,
    dateFormatted: 'Oct 28',
    userColor: 'white',
    userWon: 'draw',
    userResultText: 'Drawn by agreement',
  },
];

const ORDERED_CLASSIFICATIONS: MoveClassification[] = [
  'brilliant',
  'great',
  'best',
  'excellent',
  'good',
  'book',
  'inaccuracy',
  'mistake',
  'miss',
  'blunder',
];

export function MoveByMoveAnalyzer({
  initialUsername = '',
  onPuzzlesGenerated,
  onOpenShare,
  onUsernameChange,
  onOpenProfileStats,
}: MoveByMoveAnalyzerProps) {
  // Decoupled local username input state for lag-free typing
  const [usernameInput, setUsernameInput] = useState<string>(initialUsername);
  const [activeUsername, setActiveUsername] = useState<string>(initialUsername);
  const [recentMatches, setRecentMatches] = useState<ChessComMatch[]>(SHOWCASE_DEMO_MATCHES);
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

  // Deep Engine Analysis live progress state
  const [deepProgress, setDeepProgress] = useState<DeepAnalysisProgress | null>(null);

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
    } else if (!cleanProp && activeUsername) {
      setUsernameInput('');
      setActiveUsername('');
      setRecentMatches(SHOWCASE_DEMO_MATCHES);
      setMatchAnalysis(FEATURED_MATCH_ANALYSIS);
      setActivePlyIndex(FEATURED_MATCH_ANALYSIS.plies.length - 1);
      setSelectedMatch(null);
    }
  }, [initialUsername, activeUsername]);

  // Cleanup any in-flight async analysis on unmount
  useEffect(() => {
    return () => {
      analysisAbortRef.current?.abort();
    };
  }, []);

  // When a match is selected, analyze its PGN deeply and asynchronously with live progress updates
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
      activeUsername || match.white.username,
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
        matchUrl: match.url,
      },
      controller.signal,
      (prog) => {
        if (!controller.signal.aborted) {
          setDeepProgress(prog);
        }
      }
    )
      .then((analyzed) => {
        if (controller.signal.aborted) return;
        setMatchAnalysis(analyzed);
        setActivePlyIndex(analyzed.plies.length - 1);

        if (analyzed.detectedPuzzles && analyzed.detectedPuzzles.length > 0 && onPuzzlesGenerated) {
          onPuzzlesGenerated(analyzed.detectedPuzzles);
        }

        // Enrich critical positions asynchronously with Lichess Cloud Evaluation MultiPV=3
        return enrichAnalysisWithCloudEval(analyzed, controller.signal).then((enriched) => {
          if (enriched && !controller.signal.aborted) {
            setMatchAnalysis((current) => (current.id === analyzed.id ? enriched : current));
          }
          if (!controller.signal.aborted) {
            setTimeout(() => {
              setDeepProgress((curr) => (curr && curr.percent >= 100 ? null : curr));
            }, 1400);
          }
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDeepProgress(null);
        }
      });
  };

  // Fetch real matches ONLY when a user account has been entered/connected
  useEffect(() => {
    const cleanUser = activeUsername.trim();
    if (!cleanUser) {
      setRecentMatches(SHOWCASE_DEMO_MATCHES);
      setIsLoadingMatches(false);
      setMatchErrorCode(undefined);
      setMatchErrorMessage(undefined);
      return;
    }

    let isCancelled = false;
    setIsLoadingMatches(true);
    setMatchErrorCode(undefined);
    setMatchErrorMessage(undefined);

    fetchRealPlayerMatchesWithStatus(cleanUser)
      .then((result) => {
        if (isCancelled) return;
        setRecentMatches(result.matches);
        setMatchErrorCode(result.code);
        setMatchErrorMessage(result.errorMessage);
        setIsLoadingMatches(false);

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
    if (ply.classification === 'brilliant' || ply.classification === 'great') {
      chessAudio.playBrilliant();
    } else if (ply.classification === 'best' || ply.classification === 'excellent') {
      chessAudio.playBest();
    } else if (ply.classification === 'blunder') {
      chessAudio.playBlunder();
    } else if (ply.classification === 'mistake' || ply.classification === 'miss') {
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
   * Executes a legal move in the Interactive What-If Sandbox and computes its real move classification
   * so the move-evaluation badge renders at the top-right next to the moved piece.
   */
  const handleSandboxMove = (from: string, to: string) => {
    setIsPlaying(false);
    const baseFen =
      sandboxState?.fen ||
      currentPly?.fen ||
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    try {
      const beforeRes = evaluatePositionMultiPly(baseFen, 3);
      const beforeWinProbWhite = computeWinProbability(beforeRes.cp, beforeRes.mate);

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

      const isWhiteMove = moveObj.color === 'w';
      const moverWinBefore = isWhiteMove ? beforeWinProbWhite : 100 - beforeWinProbWhite;
      const moverWinAfter = isWhiteMove ? sandboxEval.winProb : 100 - sandboxEval.winProb;
      const winLoss = Math.max(0, moverWinBefore - moverWinAfter);

      const isEngineBest =
        (beforeRes.bestMoveFrom === moveObj.from && beforeRes.bestMoveTo === moveObj.to) ||
        beforeRes.bestMoveSan === moveObj.san;

      let moveClass: MoveClassification = 'good';
      if (isEngineBest || winLoss <= 1.5) {
        moveClass = 'best';
      } else if (winLoss <= 4.2) {
        moveClass = 'excellent';
      } else if (winLoss <= 8.0) {
        moveClass = 'good';
      } else if (winLoss <= 14.0) {
        moveClass = 'inaccuracy';
      } else if (winLoss <= 24.0) {
        moveClass = 'mistake';
      } else {
        moveClass = 'blunder';
      }

      if (!isMuted) {
        if (moveClass === 'blunder') {
          chessAudio.playBlunder();
        } else if (moveClass === 'mistake') {
          chessAudio.playMistake();
        } else if (chess.inCheck()) {
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
        winProb: sandboxEval.winProb,
        classification: moveClass,
        moveCount: nextHistory.length,
        history: nextHistory,
        explanation: `What-If Sandbox continuation (${nextHistory.join(' → ')}). Evaluated as ${CLASSIFICATION_META[moveClass].label} (${formattedEval} pawns, Win%: ${sandboxEval.winProb.toFixed(
          1
        )}%).${
          sandboxEval.pvLine ? ` Best continuation: ${sandboxEval.pvLine}.` : ''
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

  // Convert eval score or official Win% Sigmoid to percentage height for Live Evaluation Bar
  const getEvalBarHeight = (evalScore: string, winProb?: number) => {
    if (typeof winProb === 'number' && Number.isFinite(winProb)) {
      return Math.max(4, Math.min(96, Math.round(winProb)));
    }
    if (evalScore.includes('M')) {
      return evalScore.startsWith('-') ? 4 : 96;
    }
    const num = parseFloat(evalScore.replace('+', ''));
    if (isNaN(num)) return 50;
    return Math.max(4, Math.min(96, Math.round(computeWinProbability(num * 100))));
  };

  const activeEvalScore = sandboxState?.evalScore || currentPly?.evalScore || '+0.2';
  const evalHeight = getEvalBarHeight(
    activeEvalScore,
    sandboxState ? sandboxState.winProb : currentPly?.winProb
  );
  const whiteAdvantagePct = evalHeight;
  const blackAdvantagePct = 100 - evalHeight;
  const displayedFen =
    sandboxState?.fen ||
    currentPly?.fen ||
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const activeTurnSide = (displayedFen.split(' ')[1] || 'w') === 'w' ? 'White' : 'Black';

  const topPlayer = isFlipped ? matchAnalysis.whitePlayer : matchAnalysis.blackPlayer;
  const bottomPlayer = isFlipped ? matchAnalysis.blackPlayer : matchAnalysis.whitePlayer;
  const topPlayerAccuracy = isFlipped
    ? matchAnalysis.accuracy.white
    : matchAnalysis.accuracy.black;
  const bottomPlayerAccuracy = isFlipped
    ? matchAnalysis.accuracy.black
    : matchAnalysis.accuracy.white;
  const topPlayerColorLabel = isFlipped ? '♔ White' : '♚ Black';
  const bottomPlayerColorLabel = isFlipped ? '♚ Black' : '♔ White';

  return (
    <div className="w-full space-y-7">
      {/* Search Header Bar: Real Chess.com Search + Free Credit System */}
      <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
        {/* Username Search Box */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-emerald-700 font-bold select-none">
              ♟
            </span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter your Chess.com username to load matches..."
              className="w-full pl-8 pr-3 py-2.5 text-xs sm:text-sm bg-white border-2 border-emerald-600/70 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-slate-900 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ring-2 ring-emerald-500/20 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Load My Games &amp; Analyze</span>
          </button>
          {onOpenProfileStats && activeUsername && (
            <button
              type="button"
              onClick={onOpenProfileStats}
              className="px-3 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
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
            <span>
              {activeUsername
                ? `Last 10 Games (${recentMatches.length})`
                : `Showcase Games (${recentMatches.length})`}
            </span>
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
              searchedUsername={activeUsername || 'Showcase Demo'}
              onQuickSelectUsername={(sampleHandle) => {
                userExplicitSearchRef.current = true;
                setUsernameInput(sampleHandle);
                setActiveUsername(sampleHandle);
                onUsernameChange?.(sampleHandle);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Deep Engine Progress Banner (Take Your Time / MultiPV=3 Stockfish & Lichess Cloud) */}
      <AnimatePresence>
        {deepProgress && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-4 rounded-2xl bg-[#0B1912] text-white border border-emerald-800/80 shadow-lg space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>{deepProgress.phaseLabel}</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {deepProgress.percent}% ({deepProgress.currentPly}/{deepProgress.totalPlies} Plies · Depth {deepProgress.depth} · MultiPV {deepProgress.multiPv})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-950 overflow-hidden border border-emerald-800/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-200 rounded-full"
                style={{ width: `${Math.max(4, deepProgress.percent)}%` }}
              />
            </div>
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
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span>{matchAnalysis.event}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">{matchAnalysis.result}</span>
              {matchAnalysis.openingName && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <BookOpen className="w-3 h-3 text-amber-700" />
                    {matchAnalysis.openingEco ? `${matchAnalysis.openingEco}: ` : ''}
                    {matchAnalysis.openingName}
                  </span>
                </>
              )}
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
                  description: `Game Analysis (${matchAnalysis.event}): ${matchAnalysis.result}. Analyzed ${matchAnalysis.plies.length} plies with the ChessPulse MultiPV Engine.`,
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
            {/* Live Evaluation Bar (Win% Sigmoid + Centipawn / Mate Indicator — Rotates with Board Flip) */}
            <div className="flex sm:flex-col items-center gap-2 order-2 sm:order-1">
              <div
                className={`relative w-48 sm:w-6 h-5 sm:h-96 bg-[#262421] rounded-full overflow-hidden flex sm:flex-col ${
                  isFlipped ? 'justify-start' : 'justify-end'
                } p-0.5 border-2 border-slate-700 shadow-xl`}
              >
                {/* Top Side Win% Indicator */}
                <span
                  className={`hidden sm:block absolute top-2 left-0 right-0 text-center font-mono text-[9px] font-bold select-none z-10 tabular-nums ${
                    isFlipped ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {isFlipped ? `${whiteAdvantagePct}%` : `${blackAdvantagePct}%`}
                </span>

                {/* White Smooth Advantage Height Bar */}
                <div
                  className="bg-white rounded-full shadow-md transition-all duration-400 ease-out"
                  style={{
                    height: `${evalHeight}%`,
                    width: '100%',
                  }}
                />

                {/* Bottom Side Win% Indicator */}
                <span
                  className={`hidden sm:block absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] font-bold select-none z-10 tabular-nums ${
                    isFlipped ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {isFlipped ? `${blackAdvantagePct}%` : `${whiteAdvantagePct}%`}
                </span>
              </div>

              {/* Exact Stockfish / Sigmoid Numeric Value */}
              <div className="text-center font-mono text-xs font-bold text-slate-800 tabular-nums bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {activeEvalScore}
              </div>
            </div>

            {/* Pixel-Perfect Tournament Green/Ivory Chessboard Component with Top/Bottom Player Strips */}
            <div className="order-1 sm:order-2 w-full flex flex-col items-center gap-2">
              {/* Top Player Orientation Bar */}
              <div className="w-full max-w-[720px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[11px]">
                    {topPlayerColorLabel}
                  </span>
                  <span>{topPlayer.name}</span>
                  <span className="font-mono text-slate-500 tabular-nums">({topPlayer.rating})</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-700 tabular-nums">
                  CAPS2: {topPlayerAccuracy}%
                </span>
              </div>

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

              {/* Bottom Player Orientation Bar */}
              <div className="w-full max-w-[720px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px]">
                    {bottomPlayerColorLabel}
                  </span>
                  <span>{bottomPlayer.name}</span>
                  <span className="font-mono text-slate-500 tabular-nums">({bottomPlayer.rating})</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-emerald-700 tabular-nums">
                  CAPS2: {bottomPlayerAccuracy}%
                </span>
              </div>
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

              {/* Dedicated Flip Board Button */}
              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                  isFlipped
                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title="Flip Board Perspective (White / Black)"
              >
                <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
                <span>Flip Board ({isFlipped ? 'Black' : 'White'})</span>
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
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
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
                  {!sandboxState && currentPly?.outOfBook && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                      Out of Book
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {!sandboxState && typeof currentPly?.moveAccuracy === 'number' && (
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tabular-nums">
                      CAPS2: {currentPly.moveAccuracy.toFixed(1)}%
                    </span>
                  )}
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tabular-nums">
                    Eval: {activeEvalScore}
                  </span>
                </div>
              </div>

              {/* Crystal-clear Human Language Explanation */}
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {sandboxState ? sandboxState.explanation : currentPly?.explanation}
              </p>

              {/* Tactical Delta Details, Best Alternative, & MultiPV=3 Engine Lines */}
              {!sandboxState &&
                (currentPly?.evalDelta ||
                  currentPly?.bestAlternative ||
                  currentPly?.pvLine ||
                  (currentPly?.multiPv && currentPly.multiPv.length > 0) ||
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

                    {typeof currentPly.winProbLoss === 'number' && currentPly.winProbLoss > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Win-Probability Loss:</span>
                        <span className="font-mono font-bold text-slate-800 tabular-nums">
                          -{currentPly.winProbLoss.toFixed(1)}% Win%
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
                          Best Continuation (PV1):
                        </span>
                        <span className="font-mono text-[11px] text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90">
                          {currentPly.pvLine}
                        </span>
                      </div>
                    )}

                    {currentPly.multiPv && currentPly.multiPv.length > 1 && (
                      <div className="pt-1 border-t border-slate-200/70 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          MultiPV Candidate Lines (Depth {currentPly.engineDepth || 18})
                        </span>
                        {currentPly.multiPv.slice(0, 3).map((cand) => (
                          <div
                            key={cand.multipv}
                            className="flex items-center justify-between gap-2 text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200/70"
                          >
                            <span className="truncate text-slate-700">
                              <strong className="text-emerald-700">PV{cand.multipv}:</strong>{' '}
                              {cand.pvLine || cand.bestMoveSan}
                            </span>
                            <span className="text-slate-500 shrink-0 tabular-nums">
                              {cand.mate
                                ? `M${Math.abs(cand.mate)}`
                                : cand.pawns >= 0
                                ? `+${cand.pawns.toFixed(1)}`
                                : cand.pawns.toFixed(1)}{' '}
                              ({cand.winProb.toFixed(0)}%)
                            </span>
                          </div>
                        ))}
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
                const meta = CLASSIFICATION_META[ply.classification] || CLASSIFICATION_META.good;
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
                          {ply.outOfBook ? 'Out of Book • ' : ''}
                          {meta.label}
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
                <div className="text-xs font-mono font-bold text-emerald-400">
                  Stockfish MultiPV=3 + Lichess Cloud
                </div>
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

      {/* Apple/Stripe-Standard Match Performance Summary (CAPS2 Accuracy + Game Performance Rating + 10-Tier Classification) */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Match Performance Executive Summary (1:1 CAPS2 & Win% Sigmoid)
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              {matchAnalysis.whitePlayer.name} ({matchAnalysis.whitePlayer.rating}) vs {matchAnalysis.blackPlayer.name} ({matchAnalysis.blackPlayer.rating})
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            {matchAnalysis.performanceRating && (
              <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white font-mono font-bold">
                Perf Rating: W {matchAnalysis.performanceRating.white} · B {matchAnalysis.performanceRating.black}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {matchAnalysis.timeControl || 'Standard'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
              Verified Chess.com Archive
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Column 1: Accurate Tactical Accuracy Rings & Performance Ratings */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                CAPS2 Accuracy
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                MultiPV=3 Engine
              </span>
            </div>

            <div className="flex items-center justify-around pt-2">
              <div className="text-center space-y-1.5">
                <AccuracyRing
                  score={matchAnalysis.accuracy.white}
                  label={matchAnalysis.whitePlayer.name}
                  sublabel="White"
                  color="#059669"
                  size={86}
                />
                {matchAnalysis.performanceRating && (
                  <div className="text-[11px] font-mono font-bold text-slate-700">
                    Perf: {matchAnalysis.performanceRating.white} ELO
                  </div>
                )}
              </div>
              <div className="text-center space-y-1.5">
                <AccuracyRing
                  score={matchAnalysis.accuracy.black}
                  label={matchAnalysis.blackPlayer.name}
                  sublabel="Black"
                  color="#26C281"
                  size={86}
                />
                {matchAnalysis.performanceRating && (
                  <div className="text-[11px] font-mono font-bold text-slate-700">
                    Perf: {matchAnalysis.performanceRating.black} ELO
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Complete 10-Category Chess.com Move Classification Breakdown */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                10-Tier Move Classification
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {matchAnalysis.plies.length} Half-Moves
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
              {ORDERED_CLASSIFICATIONS.map((cls) => {
                const meta = CLASSIFICATION_META[cls];
                const count = matchAnalysis.plies.filter((m) => m.classification === cls).length;
                return (
                  <div
                    key={cls}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                      <span
                        className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-extrabold shrink-0"
                        style={{ backgroundColor: meta.hexBg, color: meta.textColorOnCircle }}
                      >
                        {meta.symbol}
                      </span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums text-[11px]">
                      {count}
                    </span>
                  </div>
                );
              })}
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
