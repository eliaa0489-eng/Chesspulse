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
  Copy,
  Check,
  X,
} from 'lucide-react';
import { FEATURED_MATCH_ANALYSIS } from '../data/matchAnalysisData';
import {
  AnalyzedPly,
  MoveClassification,
  ChessComMatch,
  FullMatchAnalysis,
  TacticalPuzzle,
  DeepAnalysisProgress,
  BoardArrow,
} from '../types/chess';
import { EvalBadge, CLASSIFICATION_META } from './EvalBadge';
import { ChesscomBoard } from './ChesscomBoard';
import { RealMatchListFeed } from './RealMatchListFeed';
import { AccuracyRing } from './AccuracyRing';
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
    eco: 'C50',
    openingName: 'Italian Game: Giuoco Pianissimo',
    moveCount: 22,
    officialAccuracy: { white: 88.4, black: 74.2 },
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
    eco: 'B12',
    openingName: 'Caro-Kann Defense: Advance Variation',
    moveCount: 16,
    officialAccuracy: { white: 76.1, black: 86.9 },
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
    eco: 'D02',
    openingName: 'London System',
    moveCount: 12,
    officialAccuracy: { white: 84.5, black: 83.8 },
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
  // On mobile (< 1024px), collapse the match list drawer by default so the chessboard fits 100dvh immediately
  const [isMatchFeedOpen, setIsMatchFeedOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // Active match analysis state (initialized with instant pre-computed featured match)
  const [matchAnalysis, setMatchAnalysis] = useState<FullMatchAnalysis>(FEATURED_MATCH_ANALYSIS);
  const [activePlyIndex, setActivePlyIndex] = useState<number>(FEATURED_MATCH_ANALYSIS.plies.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => chessAudio.getVolume() <= 0);
  const [volumePct, setVolumePct] = useState<number>(() =>
    Math.round(chessAudio.getVolume() * 100)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLogSuccess, setCopiedLogSuccess] = useState<boolean>(false);

  // Deep Engine Analysis live progress state
  const [deepProgress, setDeepProgress] = useState<DeepAnalysisProgress | null>(null);

  // Interactive What-If Sandbox state when user drags/clicks legal moves on the board
  const [sandboxState, setSandboxState] = useState<SandboxState | null>(null);

  // Toggleable / hoverable Next-Turn Best-Move preview arrow state (still strictly 1 arrow at a time)
  const [showFollowUpArrow, setShowFollowUpArrow] = useState<boolean>(false);
  const [hoverFollowUpArrow, setHoverFollowUpArrow] = useState<boolean>(false);

  const activeMoveRowRef = useRef<HTMLButtonElement | null>(null);
  const moveFeedContainerRef = useRef<HTMLDivElement | null>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const userExplicitSearchRef = useRef<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

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
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
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

  // Fetch lightweight match metadata ONLY when a user account has been entered/connected.
  // Full move-by-move PGN Game Review runs lazily ONLY when the user clicks a specific match.
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
    setIsMatchFeedOpen(true);

    fetchRealPlayerMatchesWithStatus(cleanUser, 25)
      .then((result) => {
        if (isCancelled) return;
        setRecentMatches(result.matches);
        setMatchErrorCode(result.code);
        setMatchErrorMessage(result.errorMessage);
        setIsLoadingMatches(false);
        userExplicitSearchRef.current = false;
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

  // Play Web Audio API sound on active move change (checkmate, check, castle, capture, brilliant, blunder, mistake, best, move)
  const playMoveAudio = (ply: AnalyzedPly) => {
    if (isMuted || volumePct <= 0) return;

    let isMate = ply.notation.includes('#');
    let isChk = !isMate && ply.notation.includes('+');
    if (!isMate && !isChk && ply.fen) {
      try {
        const c = new Chess(ply.fen);
        isMate = c.isCheckmate();
        isChk = !isMate && c.inCheck();
      } catch {
        // Ignore FEN parse fallback
      }
    }

    if (isMate) {
      chessAudio.playCheckmate();
    } else if (isChk) {
      chessAudio.playCheck();
    } else if (ply.classification === 'brilliant' || ply.classification === 'great') {
      chessAudio.playBrilliant();
    } else if (ply.classification === 'blunder') {
      chessAudio.playBlunder();
    } else if (ply.classification === 'mistake' || ply.classification === 'miss') {
      chessAudio.playMistake();
    } else if (ply.notation.includes('O-O')) {
      chessAudio.playCastle();
    } else if (ply.notation.includes('x')) {
      chessAudio.playCapture();
    } else if (ply.classification === 'best' || ply.classification === 'excellent') {
      chessAudio.playBest();
    } else {
      chessAudio.playMove();
    }
  };

  const applyVolumePct = (nextPct: number, showToast = false) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextPct)));
    setVolumePct(clamped);
    chessAudio.setVolume(clamped / 100);
    if (clamped === 0) {
      setIsMuted(true);
      chessAudio.setMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
      chessAudio.setMuted(false);
    }
    if (showToast) {
      triggerToast(`Move Sound Volume: ${clamped}%`);
      if (clamped > 0) {
        chessAudio.playSelect();
      }
    }
  };

  /**
   * Formats and copies the complete Game Log (Match Header, PGN, and Move-by-Move Evaluation & Best-Move Summary)
   * to the system clipboard.
   */
  const copyFormattedGameLog = () => {
    const headerLines = [
      `=== ChessPulse Game Review & Engine Log ===`,
      `White: ${matchAnalysis.whitePlayer.name} (${matchAnalysis.whitePlayer.rating}) — CAPS2 Accuracy: ${matchAnalysis.accuracy.white}%`,
      `Black: ${matchAnalysis.blackPlayer.name} (${matchAnalysis.blackPlayer.rating}) — CAPS2 Accuracy: ${matchAnalysis.accuracy.black}%`,
      `Event: ${matchAnalysis.event} | Result: ${matchAnalysis.result}${
        matchAnalysis.openingName
          ? ` | Opening: ${matchAnalysis.openingEco ? `${matchAnalysis.openingEco} ` : ''}${matchAnalysis.openingName}`
          : ''
      }`,
      ``,
    ];

    if (selectedMatch?.pgn) {
      headerLines.push(`--- Full PGN ---`, selectedMatch.pgn.trim(), ``);
    }

    headerLines.push(`--- Move-by-Move Engine Evaluation & Best-Move Log ---`);
    const moveLines = matchAnalysis.plies.map((p) => {
      const meta = CLASSIFICATION_META[p.classification] || CLASSIFICATION_META.good;
      const movePrefix = p.color === 'white' ? `${p.moveNumber}.` : `${p.moveNumber}...`;
      const bestStr = p.bestAlternative ? ` | Best Move: ${p.bestAlternative}` : '';
      return `${movePrefix} ${p.notation} [${meta.symbol} ${meta.label}] (Eval: ${p.evalScore}${bestStr}) — ${p.explanation}`;
    });

    const fullLogText = [...headerLines, ...moveLines].join('\n');

    navigator.clipboard
      .writeText(fullLogText)
      .then(() => {
        setCopiedLogSuccess(true);
        triggerToast('Game Log & Analysis copied to clipboard (⌘C)');
        setTimeout(() => setCopiedLogSuccess(false), 2000);
      })
      .catch(() => {
        triggerToast('Game Log & Analysis copied to clipboard (⌘C)');
      });
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

      if (!isMuted && volumePct > 0) {
        if (chess.isCheckmate()) {
          chessAudio.playCheckmate();
        } else if (chess.inCheck()) {
          chessAudio.playCheck();
        } else if (moveClass === 'blunder') {
          chessAudio.playBlunder();
        } else if (moveClass === 'mistake') {
          chessAudio.playMistake();
        } else if (moveObj.san.includes('O-O')) {
          chessAudio.playCastle();
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

  // Global Keyboard Controller:
  // - ArrowLeft / ArrowRight: instant 0ms half-move stepping with move sound
  // - ArrowUp / + / = and ArrowDown / - / _: ±10% sound volume control
  // - Cmd+C / Ctrl+C: native selection copy when text is highlighted, or Full Game Log & PGN export when no text is selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Cmd+C / Ctrl+C Game Log Copy (when no specific text is highlighted)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        const selectedText = window.getSelection()?.toString().trim() || '';
        if (!selectedText) {
          e.preventDefault();
          copyFormattedGameLog();
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setSandboxState(null);
        setActivePlyIndex((prev) => {
          const next = Math.max(0, prev - 1);
          if (next !== prev && matchAnalysis.plies[next]) {
            playMoveAudio(matchAnalysis.plies[next]);
          }
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setSandboxState(null);
        setActivePlyIndex((prev) => {
          const next = Math.min(matchAnalysis.plies.length - 1, prev + 1);
          if (next !== prev && matchAnalysis.plies[next]) {
            playMoveAudio(matchAnalysis.plies[next]);
          }
          return next;
        });
      } else if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
        e.preventDefault();
        applyVolumePct(volumePct + 10, true);
      } else if (e.key === 'ArrowDown' || e.key === '-' || e.key === '_') {
        e.preventDefault();
        applyVolumePct(volumePct - 10, true);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matchAnalysis, selectedMatch, isMuted, volumePct]);

  // Mobile Collapsible Move List / PGN Bottom Drawer state (keeps mobile review on a single 100dvh screen with zero scroll jumps)
  const [isMobileMoveListOpen, setIsMobileMoveListOpen] = useState<boolean>(false);

  // Strictly scroll ONLY the internal move-feed container's scrollTop when visible (NEVER call element.scrollIntoView or window.scrollTo!)
  useEffect(() => {
    const row = activeMoveRowRef.current;
    const container = moveFeedContainerRef.current;
    if (row && container && container.offsetParent !== null) {
      const rowTop = row.offsetTop - container.offsetTop;
      const rowBottom = rowTop + row.offsetHeight;
      const viewTop = container.scrollTop;
      const viewBottom = viewTop + container.clientHeight;

      if (rowTop < viewTop) {
        container.scrollTop = Math.max(0, rowTop - 8);
      } else if (rowBottom > viewBottom) {
        container.scrollTop = rowBottom - container.clientHeight + 8;
      }
    }
  }, [activePlyIndex, isMobileMoveListOpen]);

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

  // Detect Check (+) and Checkmate (#) for the active board position
  const positionCheckState = React.useMemo(() => {
    const activeNotation = sandboxState ? sandboxState.notation : currentPly?.notation || '';
    try {
      const chess = new Chess(displayedFen);
      const isMate = chess.isCheckmate() || activeNotation.includes('#');
      const isChk = !isMate && (chess.inCheck() || activeNotation.includes('+'));
      const turnColor = chess.turn(); // side that is checkmated or in check
      const winnerSide: 'White' | 'Black' | null = isMate
        ? turnColor === 'w'
          ? 'Black'
          : 'White'
        : null;
      return {
        inCheck: isChk,
        isCheckmate: isMate,
        winnerSide,
      };
    } catch {
      const isMate = activeNotation.includes('#');
      const isChk = !isMate && activeNotation.includes('+');
      return {
        inCheck: isChk,
        isCheckmate: isMate,
        winnerSide: isMate ? (activeTurnSide === 'White' ? 'Black' : 'White') : null,
      };
    }
  }, [displayedFen, sandboxState, currentPly, activeTurnSide]);

  /**
   * STRICT SINGLE-ARROW SYSTEM (NO DUAL/MULTI-ARROWS):
   * 1. Zero arrows during opening `book` moves (and quiet initial transitions out of book).
   * 2. Never render an arrow for the played move itself (represented purely via Square Highlights + top-right Badge).
   * 3. Render at most ONE single sleek Chess.com Green (`#81b64c`) arrow showing the Engine's Best Move
   *    (`bestMoveFrom` -> `bestMoveTo`), or when previewing the upcoming turn, the next Best Move (`followUpFrom` -> `followUpTo`).
   */
  const boardArrows: BoardArrow[] = React.useMemo(() => {
    if (sandboxState) {
      return [
        {
          from: sandboxState.fromSquare,
          to: sandboxState.toSquare,
          color: '#81b64c',
          variant: 'best',
        },
      ];
    }

    if (!currentPly) return [];

    // 1. No arrows on Opening Book moves or quiet initial transitions out of book
    const isQuietOutOfBookTransition =
      Boolean(currentPly.outOfBook) &&
      (currentPly.classification === 'good' || currentPly.classification === 'excellent') &&
      (currentPly.winProbLoss ?? 0) < 3.5;

    if (currentPly.classification === 'book' || isQuietOutOfBookTransition) {
      return [];
    }

    // 2. If user toggles/hovers Next-Turn Best-Move preview, show ONLY that 1 single arrow
    if (
      (showFollowUpArrow || hoverFollowUpArrow) &&
      currentPly.followUpFrom &&
      currentPly.followUpTo
    ) {
      return [
        {
          from: currentPly.followUpFrom,
          to: currentPly.followUpTo,
          color: '#81b64c',
          variant: 'best',
        },
      ];
    }

    // 3. Otherwise show ONLY the 1 single Engine Best Move arrow for the current position
    const bestFrom = currentPly.bestMoveFrom || currentPly.fromSquare;
    const bestTo = currentPly.bestMoveTo || currentPly.toSquare;

    if (!bestFrom || !bestTo) return [];

    return [
      {
        from: bestFrom,
        to: bestTo,
        color: '#81b64c',
        variant: 'best',
      },
    ];
  }, [currentPly, sandboxState, showFollowUpArrow, hoverFollowUpArrow]);

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

  const moveDisplaySan = sandboxState
    ? sandboxState.notation
    : currentPly
    ? `${currentPly.color === 'white' ? `${currentPly.moveNumber}.` : `${currentPly.moveNumber}...`} ${currentPly.notation}`
    : '';

  return (
    <div
      className="w-full space-y-2.5 sm:space-y-7 relative"
      style={{ overflowAnchor: 'none' }}
    >
      {/* Floating Keyboard Shortcut / Clipboard Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/40 shadow-2xl flex items-center gap-2.5 text-xs font-bold pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Header Bar: Ultra-Compact on Mobile (< 640px), Full Header on Desktop */}
      <div className="p-2 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Username Search Box */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[200px] max-w-lg">
          <div className="relative flex-1">
            <span className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-emerald-700 font-bold select-none">
              ♟
            </span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Chess.com username..."
              className="w-full pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-white border-2 border-emerald-600/70 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-slate-900 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-sm ring-2 ring-emerald-500/20 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="sm:hidden">Load</span>
            <span className="hidden sm:inline">Load My Games &amp; Analyze</span>
          </button>
          {onOpenProfileStats && activeUsername && (
            <button
              type="button"
              onClick={onOpenProfileStats}
              className="hidden sm:inline-flex px-3 py-2 sm:py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title={`View @${activeUsername} Live Stats`}
            >
              @{activeUsername} Stats
            </button>
          )}
        </form>

        {/* Arrow Legend, Keyboard Shortcuts & Recent Matches List Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-[11px] font-semibold text-slate-600 shadow-2xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#81b64c]" />
              <span>Single Best-Move Arrow</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[10px] text-slate-500">
              ←/→ Step · ↑/↓ Vol · ⌘C Copy Log
            </span>
          </div>

          {/* Toggle Recent Matches List */}
          <button
            type="button"
            onClick={() => setIsMatchFeedOpen(!isMatchFeedOpen)}
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap active:scale-[0.96]"
          >
            <Swords className="w-3.5 h-3.5 text-emerald-600" />
            <span className="sm:hidden">
              Games ({recentMatches.length})
            </span>
            <span className="hidden sm:inline">
              {activeUsername
                ? `Recent Matches (${recentMatches.length})`
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
            className="p-3 sm:p-4 rounded-2xl bg-[#0B1912] text-white border border-emerald-800/80 shadow-lg space-y-2"
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

      {/* Scroll Anchor for Board Review View (Active on both Mobile & Desktop) */}
      <div id="analyzer-board-view" className="scroll-mt-12 sm:scroll-mt-24" />

      {/* Active Match Banner (Hidden on small mobile screens during single-screen review so the board fits 100dvh, visible on sm+) */}
      <div className="hidden sm:flex p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex-wrap items-center justify-between gap-4">
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
              type="button"
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

      {/* Main Split-Screen Dashboard: Left Column (Locked 100dvh Mobile App Viewport / Pixel-Perfect Board) & Right Column (AI Coach) */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6 lg:gap-8 items-start"
        style={{ overflowAnchor: 'none' }}
      >
        {/* Left Column (lg:col-span-8): Locked Mobile Coach Banner + Eval Bar + 1:1 Board + Pinned Thumb Dock */}
        <div
          className="lg:col-span-8 flex flex-col gap-1.5 sm:gap-3.5"
          style={{ overflowAnchor: 'none' }}
        >
          {/* 1:1 CHESS.COM FIXED-HEIGHT COMPACT MOVE COACH BANNER (Visible on < 1024px directly above the board; strictly h-[68px] so it NEVER shifts the board by even 1px) */}
          <div
            className="lg:hidden h-[68px] px-2.5 py-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between select-text overflow-hidden shrink-0"
            style={{ overflowAnchor: 'none' }}
          >
            {/* Row 1: Single-line Header with Badge, Move SAN, Check/Checkmate Alert, Best Alternative & Eval Score */}
            <div className="h-[24px] flex items-center justify-between gap-1.5 overflow-x-auto whitespace-nowrap shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                {sandboxState ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    What-If
                  </span>
                ) : (
                  currentPly && <EvalBadge classification={currentPly.classification} size="xs" />
                )}

                <span className="font-mono text-xs font-extrabold text-slate-900">
                  {moveDisplaySan}
                </span>

                {positionCheckState.isCheckmate && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white text-[10px] font-black tracking-wide uppercase shadow-2xs">
                    # Checkmate · {positionCheckState.winnerSide} Wins
                  </span>
                )}

                {positionCheckState.inCheck && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#dc2626] text-white text-[10px] font-black tracking-wide uppercase shadow-2xs">
                    + Check
                  </span>
                )}

                {!sandboxState && currentPly?.bestAlternative && (
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Best: {currentPly.bestAlternative}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 tabular-nums">
                  {activeEvalScore}
                </span>
              </div>
            </div>

            {/* Row 2: Fixed-height Explanation Box (scrolls internally if longer than 2 lines so container height never changes) */}
            <div className="h-[34px] overflow-y-auto overscroll-contain pr-1 text-[11px] leading-[16px] text-slate-600 font-normal select-text">
              {sandboxState ? sandboxState.explanation : currentPly?.explanation}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
            {/* Live Evaluation Bar (Slim Horizontal Bar Above Board on Mobile, Vertical Bar on sm+) */}
            <div className="w-full sm:w-auto flex sm:flex-col items-center justify-between sm:justify-center gap-2 order-1 sm:order-1">
              <div
                className={`relative flex-1 sm:flex-none w-full sm:w-6 h-2.5 sm:h-96 bg-[#262421] rounded-full overflow-hidden flex sm:flex-col ${
                  isFlipped ? 'justify-start' : 'justify-end'
                } p-0.5 border border-slate-700 sm:border-2 shadow-xs sm:shadow-xl`}
              >
                {/* Top Side Win% Indicator (Desktop Vertical) */}
                <span
                  className={`hidden sm:block absolute top-2 left-0 right-0 text-center font-mono text-[9px] font-bold select-none z-10 tabular-nums ${
                    isFlipped ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {isFlipped ? `${whiteAdvantagePct}%` : `${blackAdvantagePct}%`}
                </span>

                {/* Desktop Vertical Fill */}
                <div
                  className="hidden sm:block bg-white rounded-full shadow-md transition-all duration-150 ease-out"
                  style={{
                    height: `${evalHeight}%`,
                    width: '100%',
                  }}
                />

                {/* Mobile Horizontal Fill */}
                <div
                  className="sm:hidden bg-white h-full rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${evalHeight}%`,
                  }}
                />

                {/* Bottom Side Win% Indicator (Desktop Vertical) */}
                <span
                  className={`hidden sm:block absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] font-bold select-none z-10 tabular-nums ${
                    isFlipped ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {isFlipped ? `${blackAdvantagePct}%` : `${whiteAdvantagePct}%`}
                </span>
              </div>

              {/* Exact Stockfish / Sigmoid Numeric Value (Visible on sm+ since Mobile Coach Banner already displays it right above) */}
              <div className="hidden sm:block text-center font-mono text-xs font-bold text-slate-800 tabular-nums bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                {activeEvalScore}
              </div>
            </div>

            {/* Pixel-Perfect Tournament Green/Ivory Chessboard Component with Top/Bottom Player Strips */}
            <div className="order-2 sm:order-2 w-full flex flex-col items-center gap-1 sm:gap-2">
              {/* Top Player Orientation Bar */}
              <div className="w-full max-w-[min(100%,calc(100dvh-255px))] sm:max-w-[720px] flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-slate-800 truncate">
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[10px] sm:text-[11px]">
                    {topPlayerColorLabel}
                  </span>
                  <span className="truncate">{topPlayer.name}</span>
                  <span className="font-mono text-slate-500 tabular-nums">({topPlayer.rating})</span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-700 tabular-nums shrink-0">
                  CAPS2: {topPlayerAccuracy}%
                </span>
              </div>

              <ChesscomBoard
                fen={displayedFen}
                fromSquare={sandboxState?.fromSquare || currentPly?.fromSquare}
                toSquare={sandboxState?.toSquare || currentPly?.toSquare}
                classification={sandboxState ? sandboxState.classification : currentPly?.classification}
                arrows={boardArrows}
                isFlipped={isFlipped}
                interactive={true}
                allowedTurnColor={null}
                onMovePlayed={handleSandboxMove}
              />

              {/* Bottom Player Orientation Bar */}
              <div className="w-full max-w-[min(100%,calc(100dvh-255px))] sm:max-w-[720px] flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-slate-800 truncate">
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] sm:text-[11px]">
                    {bottomPlayerColorLabel}
                  </span>
                  <span className="truncate">{bottomPlayer.name}</span>
                  <span className="font-mono text-slate-500 tabular-nums">({bottomPlayer.rating})</span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-700 tabular-nums shrink-0">
                  CAPS2: {bottomPlayerAccuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Pinned Thumb-Friendly Control Dock Directly Underneath the Board (48px–50px Mobile Touch Targets, 0ms Response, Zero Focus Scroll Jumps) */}
          <div
            className="p-1.5 sm:p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-1.5 sm:gap-3 select-none"
            style={{ touchAction: 'manipulation', overflowAnchor: 'none' }}
          >
            {/* Primary Thumb-Friendly Step, Play & Flip Navigation Dock */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectPly(0)}
                disabled={activePlyIndex === 0 && !sandboxState}
                style={{ touchAction: 'manipulation' }}
                className="min-h-[48px] sm:min-h-0 px-2.5 sm:p-2 rounded-xl bg-white sm:bg-transparent border border-slate-200/90 sm:border-transparent text-slate-700 hover:bg-slate-200 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-transform flex items-center justify-center shadow-2xs sm:shadow-none"
                title="First Move (|◀)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectPly(Math.max(0, activePlyIndex - 1))}
                disabled={activePlyIndex === 0 && !sandboxState}
                style={{ touchAction: 'manipulation' }}
                className="flex-1 sm:flex-none min-h-[48px] sm:min-h-0 px-3 sm:p-2 rounded-xl bg-white sm:bg-transparent border border-slate-200/90 sm:border-transparent text-slate-900 hover:bg-slate-200 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-transform flex items-center justify-center gap-1 font-extrabold text-xs shadow-2xs sm:shadow-none select-none"
                title="Previous Move (◀ or Left Arrow Key)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="sm:hidden">Prev</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (sandboxState) setSandboxState(null);
                  setIsPlaying((prev) => !prev);
                }}
                style={{ touchAction: 'manipulation' }}
                className={`min-h-[48px] sm:min-h-0 px-3.5 sm:px-4 py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.96] cursor-pointer shadow-xs select-none ${
                  isPlaying
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-700/20'
                }`}
                title="Auto Play / Pause (Spacebar)"
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Play className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectPly(Math.min(matchAnalysis.plies.length - 1, activePlyIndex + 1))}
                disabled={activePlyIndex === matchAnalysis.plies.length - 1 && !sandboxState}
                style={{ touchAction: 'manipulation' }}
                className="flex-1 sm:flex-none min-h-[48px] sm:min-h-0 px-3 sm:p-2 rounded-xl bg-white sm:bg-transparent border border-slate-200/90 sm:border-transparent text-slate-900 hover:bg-slate-200 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-transform flex items-center justify-center gap-1 font-extrabold text-xs shadow-2xs sm:shadow-none select-none"
                title="Next Move (▶ or Right Arrow Key)"
              >
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectPly(matchAnalysis.plies.length - 1)}
                disabled={activePlyIndex === matchAnalysis.plies.length - 1 && !sandboxState}
                style={{ touchAction: 'manipulation' }}
                className="min-h-[48px] sm:min-h-0 px-2.5 sm:p-2 rounded-xl bg-white sm:bg-transparent border border-slate-200/90 sm:border-transparent text-slate-700 hover:bg-slate-200 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-transform flex items-center justify-center shadow-2xs sm:shadow-none"
                title="Last Move (▶|)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Mobile-Inline Flip Board Button inside the 48px Thumb Dock */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsFlipped((prev) => !prev)}
                style={{ touchAction: 'manipulation' }}
                className={`sm:hidden min-h-[48px] px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-[0.96] shadow-2xs ${
                  isFlipped
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white border-slate-200/90 text-slate-800'
                }`}
                title="Flip Board Perspective"
              >
                <RotateCcw className={`w-4 h-4 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Secondary Controls Row: Speed Selector, Volume Control, Desktop Flip & Mobile PGN Drawer Button */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
              <div className="hidden sm:flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] font-bold">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    type="button"
                    key={spd}
                    onMouseDown={(e) => e.preventDefault()}
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

              {/* Sound Volume Control Pill (Mute Toggle + 0–100% Slider + ↑/↓/+/- Shortcut Support) */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs"
                title="Move Sound Volume (Use ↑/↓ or +/- keys to adjust by ±10%)"
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const nextMuted = !isMuted;
                    setIsMuted(nextMuted);
                    chessAudio.setMuted(nextMuted);
                    if (!nextMuted && volumePct === 0) {
                      applyVolumePct(80, true);
                    } else {
                      triggerToast(nextMuted ? 'Move Audio Muted' : `Move Sound Volume: ${volumePct}%`);
                    }
                  }}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    isMuted || volumePct === 0
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                  title={isMuted || volumePct === 0 ? 'Unmute Move Audio' : 'Mute Move Audio'}
                >
                  {isMuted || volumePct === 0 ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={isMuted ? 0 : volumePct}
                  onChange={(e) => applyVolumePct(Number(e.target.value), false)}
                  className="w-14 sm:w-16 h-1.5 accent-emerald-600 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Move Sound Volume"
                />
                <span className="font-mono text-[10px] font-bold text-slate-600 tabular-nums w-7 text-right">
                  {isMuted ? '0%' : `${volumePct}%`}
                </span>
              </div>

              {/* Dedicated Flip Board Button (Desktop & Tablet sm+) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsFlipped((prev) => !prev)}
                className={`hidden sm:flex px-3 py-1.5 rounded-xl border text-xs font-bold items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-[0.96] ${
                  isFlipped
                    ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title="Flip Board Perspective (White / Black)"
              >
                <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
                <span>Flip ({isFlipped ? 'B' : 'W'})</span>
              </button>

              {/* Mobile-Only Toggle for Collapsible Bottom PGN / Move History Sheet */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setIsMobileMoveListOpen((prev) => !prev)}
                style={{ touchAction: 'manipulation' }}
                className="lg:hidden px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:scale-[0.96] text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-transform"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  PGN Moves ({activePlyIndex + 1}/{matchAnalysis.plies.length})
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isMobileMoveListOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Interactive What-If Sandbox Status Bar & Instant Reset Button */}
          <div
            className={`${
              sandboxState ? 'flex' : 'hidden sm:flex'
            } px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs transition-all ${
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSandboxState(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Match Line</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Backdrop Scrim when Bottom PGN Move Drawer is Open (< 1024px) */}
        {isMobileMoveListOpen && (
          <div
            onClick={() => setIsMobileMoveListOpen(false)}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Right Column (lg:col-span-4 on Desktop, Collapsible Bottom Drawer Sheet on Mobile < 1024px so it NEVER pushes the board off-screen) */}
        <div
          className={`${
            isMobileMoveListOpen
              ? 'fixed inset-x-0 bottom-0 z-50 max-h-[76dvh] overflow-y-auto overscroll-contain bg-white dark:bg-[#111111] rounded-t-3xl border-t border-slate-200 shadow-2xl p-4 block'
              : 'hidden lg:block'
          } lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:bg-transparent lg:rounded-none lg:border-none lg:shadow-none lg:p-0 lg:col-span-4 space-y-4`}
          style={{ overflowAnchor: 'none' }}
        >
          {/* Mobile Drawer Handle & Close Header (< 1024px) */}
          <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                PGN Move History &amp; Engine Lines
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMoveListOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
              title="Close Move Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Move Inspector (Instant 0ms Updates with Zero Unmount/Remount Layout Jitter) */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3 select-text">
            {/* Decisive Checkmate Banner inside Move Coach Card */}
            {positionCheckState.isCheckmate && (
              <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#b91c1c] font-black text-[11px]">
                    #
                  </span>
                  <span>Checkmate — {positionCheckState.winnerSide} Wins</span>
                </span>
                <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded">
                  {matchAnalysis.result}
                </span>
              </div>
            )}

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
                {positionCheckState.inCheck && (
                  <span className="px-2 py-0.5 rounded-full bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    CHECK +
                  </span>
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
            <p className="text-xs text-slate-600 leading-relaxed font-normal select-text">
              {sandboxState ? sandboxState.explanation : currentPly?.explanation}
            </p>

            {/* Tactical Delta Details, Best Alternative, & MultiPV=3 Engine Lines */}
            {!sandboxState &&
              (currentPly?.evalDelta ||
                currentPly?.bestAlternative ||
                currentPly?.pvLine ||
                (currentPly?.multiPv && currentPly.multiPv.length > 0) ||
                currentPly?.tacticalThreat) && (
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2 text-xs select-text">
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
                    <div
                      className="text-slate-800 flex flex-col gap-1.5 pt-0.5"
                      onMouseEnter={() => setHoverFollowUpArrow(true)}
                      onMouseLeave={() => setHoverFollowUpArrow(false)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Best Continuation (PV1):
                        </span>
                        {currentPly.followUpFrom && currentPly.followUpTo && (
                          <button
                            type="button"
                            onClick={() => setShowFollowUpArrow((prev) => !prev)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                              showFollowUpArrow
                                ? 'bg-[#81b64c] text-white border-[#6ea03c]'
                                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            {showFollowUpArrow ? 'Showing Next Best Move' : 'Preview Next Best Move'}
                          </button>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90 select-text">
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
                          className="flex items-center justify-between gap-2 text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200/70 select-text"
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
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight select-text">
                      • {currentPly.tacticalThreat}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* The AI Coach Move Feed with Dedicated Copy Game Log Button */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden select-text">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Move History &amp; Log</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyFormattedGameLog}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    copiedLogSuccess
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Copy Full PGN + Move-by-Move Evaluation Log (⌘C / Ctrl+C)"
                >
                  {copiedLogSuccess ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-600" />
                      <span>Copy Game Log (⌘C)</span>
                    </>
                  )}
                </button>
                <span className="text-slate-400 text-[11px] tabular-nums hidden sm:inline">
                  {matchAnalysis.plies.length} plies
                </span>
              </div>
            </div>

            <div
              ref={moveFeedContainerRef}
              className="max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain divide-y divide-slate-100 p-1.5 select-text relative"
            >
              {matchAnalysis.plies.map((ply, idx) => {
                const isActive = activePlyIndex === idx && !sandboxState;
                const meta = CLASSIFICATION_META[ply.classification] || CLASSIFICATION_META.good;
                return (
                  <button
                    type="button"
                    key={idx}
                    ref={isActive ? activeMoveRowRef : null}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectPly(idx)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer text-left rounded-xl ${
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
    </div>
  );
}
