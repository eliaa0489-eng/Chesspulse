import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Award,
  ChevronRight,
  Flame,
  Swords,
} from 'lucide-react';
import { SAMPLE_PUZZLES } from '../data/chessData';
import { TacticalPuzzle } from '../types/chess';
import { MoveByMoveAnalyzer } from './MoveByMoveAnalyzer';
import { ChesscomBoard, ChessPieceVector } from './ChesscomBoard';
import { EvalBadge } from './EvalBadge';
import { chessAudio } from '../services/chessSound';
import { ShareData } from './ShareModal';

// Re-export for compatibility
export { ChessPieceVector as ChessPieceIcon };

interface InteractivePuzzlePlaygroundProps {
  externalPuzzles?: TacticalPuzzle[];
  initialUsername?: string;
  onOpenPersonalPuzzles?: () => void;
  onOpenShare?: (data: ShareData) => void;
}

export function InteractivePuzzlePlayground({
  externalPuzzles,
  initialUsername = 'Hikaru',
  onOpenPersonalPuzzles,
  onOpenShare,
}: InteractivePuzzlePlaygroundProps) {
  const [activeMode, setActiveMode] = useState<'analyzer' | 'puzzles'>('analyzer');
  const [puzzleList, setPuzzleList] = useState<TacticalPuzzle[]>(
    externalPuzzles && externalPuzzles.length > 0 ? externalPuzzles : SAMPLE_PUZZLES
  );
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState<number>(0);

  // Update puzzle list if external puzzles change
  useEffect(() => {
    if (externalPuzzles && externalPuzzles.length > 0) {
      setPuzzleList(externalPuzzles);
      setSelectedPuzzleIndex(0);
    }
  }, [externalPuzzles]);

  const currentPuzzle: TacticalPuzzle = puzzleList[selectedPuzzleIndex] || SAMPLE_PUZZLES[0];

  const [currentFen, setCurrentFen] = useState<string>(currentPuzzle.fen);
  const [lastMove, setLastMove] = useState<{ from?: string; to?: string }>({});
  const [status, setStatus] = useState<'idle' | 'blunder_shown' | 'solved' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [currentEval, setCurrentEval] = useState<string>('+0.2');

  // Reset board when puzzle index or puzzle changes
  useEffect(() => {
    setCurrentFen(currentPuzzle.fen);
    setLastMove({});
    setStatus('idle');
    setShowHint(false);
    setCurrentEval('+0.2');
  }, [selectedPuzzleIndex, currentPuzzle.fen]);

  const handleMovePlayed = (from: string, to: string) => {
    if (status === 'solved') return;

    const isWinningMove = currentPuzzle.solutionMoves.some(
      (m) => m.from === from && m.to === to
    );

    if (isWinningMove) {
      setLastMove({ from, to });
      setStatus('solved');
      setCurrentEval(currentPuzzle.bestEval);
      chessAudio.playBrilliant();

      try {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#10B981', '#059669', '#34D399', '#06B6D4'],
        });
      } catch {
        // Safe fallback
      }
    } else {
      setStatus('wrong');
      chessAudio.playMistake();
    }
  };

  const handleShowWinningMove = () => {
    const sol = currentPuzzle.solutionMoves[0];
    if (sol) {
      setLastMove({ from: sol.from, to: sol.to });
      setStatus('solved');
      setCurrentEval(currentPuzzle.bestEval);
    }
  };

  const handleShowBlunder = () => {
    setStatus('blunder_shown');
    setCurrentEval(currentPuzzle.blunderEval);
  };

  const handleReset = () => {
    setCurrentFen(currentPuzzle.fen);
    setLastMove({});
    setStatus('idle');
    setShowHint(false);
    setCurrentEval('+0.2');
  };

  // Called when MoveByMoveAnalyzer extracts blunders from real Chess.com match!
  const handlePuzzlesGeneratedFromRealMatch = (newPuzzles: TacticalPuzzle[]) => {
    if (newPuzzles.length > 0) {
      setPuzzleList((prev) => {
        // Prepend unique new puzzles
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPuzzles.filter((p) => !existingIds.has(p.id));
        return [...filtered, ...prev];
      });
    }
  };

  const isPersonalMatchBlunder = currentPuzzle.id.startsWith('real-blunder');

  return (
    <section id="interactive-puzzles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-[28px] border border-slate-200/90 p-6 sm:p-10 lg:p-14 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Precision Tactical Telemetry &amp; Training Arena</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {activeMode === 'analyzer'
                ? 'Move-by-Move Match Analyzer'
                : 'Personalized Blunder-Based Puzzles'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              {activeMode === 'analyzer'
                ? 'ChessPulse Tactical Heuristic Engine centipawn annotations, custom tournament emerald & alabaster board styling, and real PGN move archives.'
                : 'Puzzles generated strictly from real match mistakes. No two players receive the same generic puzzle bank.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveMode('analyzer')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'analyzer'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Move-by-Move Analyzer</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Engine Badges
              </span>
            </button>
            <button
              onClick={() => setActiveMode('puzzles')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'puzzles'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Personal Blunder Puzzles</span>
              {isPersonalMatchBlunder && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>Real Game</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* View Mode 1: Move-by-Move Match Analyzer */}
        {activeMode === 'analyzer' ? (
          <MoveByMoveAnalyzer
            initialUsername={initialUsername}
            onPuzzlesGenerated={handlePuzzlesGeneratedFromRealMatch}
            onOpenShare={onOpenShare}
          />
        ) : (
          /* View Mode 2: Personalized Blunder Puzzles */
          <div>
            {/* Puzzle selector pills */}
            <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Select Personalized Match Blunder:
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    {puzzleList.length} Custom Drills Available
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPersonalPuzzles) onOpenPersonalPuzzles();
                    else window.location.hash = '#puzzles';
                  }}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open Full Personal Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {puzzleList.slice(0, 5).map((puzzle, idx) => (
                  <button
                    key={puzzle.id}
                    onClick={() => setSelectedPuzzleIndex(idx)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedPuzzleIndex === idx
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {puzzle.id.startsWith('real-blunder') && (
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                    <span>
                      Drill 0{idx + 1}: {puzzle.phase}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Puzzle Board & Control Grid: 60%+ Desktop Width for Board */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Authentic Board + Eval Bar */}
              <div className="lg:col-span-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Engine Eval Bar */}
                <div className="flex sm:flex-col items-center gap-2 order-2 sm:order-1">
                  <div className="w-48 sm:w-5 h-4 sm:h-84 bg-[#262421] rounded-full overflow-hidden flex sm:flex-col justify-end p-0.5 border border-slate-700 shadow-inner">
                    <div
                      className="bg-white rounded-full transition-all duration-400 ease-out"
                      style={{
                        height:
                          status === 'solved'
                            ? '85%'
                            : status === 'blunder_shown'
                            ? '25%'
                            : '52%',
                        width: '100%',
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                    {currentEval}
                  </span>
                </div>

                {/* Pixel-Perfect Chess.com Board Component */}
                <div className="order-1 sm:order-2 w-full flex justify-center">
                  <ChesscomBoard
                    fen={currentFen}
                    fromSquare={lastMove.from}
                    toSquare={lastMove.to}
                    classification={status === 'solved' ? 'best' : undefined}
                    isFlipped={currentPuzzle.playerColor === 'black'}
                    interactive={status !== 'solved'}
                    onMovePlayed={handleMovePlayed}
                  />
                </div>
              </div>

              {/* Right Column: Puzzle Details & Interactive Controls */}
              <div className="lg:col-span-4 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {currentPuzzle.gameType}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {currentPuzzle.opening}
                    </span>
                    {isPersonalMatchBlunder && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        🔥 From Your Actual Match
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {currentPuzzle.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Opponent:{' '}
                    <span className="font-semibold text-slate-800">
                      {currentPuzzle.opponentName}
                    </span>{' '}
                    ({currentPuzzle.opponentRating}) · Clock:{' '}
                    {currentPuzzle.timeRemainingSeconds}s remaining
                  </p>
                </div>

                {/* Turn Prompt */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        currentPuzzle.playerColor === 'white'
                          ? 'bg-white border-slate-400'
                          : 'bg-slate-900 border-slate-800'
                      } shadow-2xs`}
                    />
                    <span className="text-sm font-bold text-slate-800">
                      {currentPuzzle.playerColor === 'white' ? 'White' : 'Black'}{' '}
                      to play and find the win
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Click piece to see legal dots
                  </span>
                </div>

                {/* Status Feedback Banner */}
                {status === 'solved' && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-900 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span>Brilliant Move! Match Mistake Solved (+4.6)</span>
                    </div>
                    <p className="text-xs leading-relaxed text-emerald-800">
                      {currentPuzzle.explanation}
                    </p>
                  </div>
                )}

                {status === 'blunder_shown' && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-300 text-rose-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <span>
                        Actual Move Played in Match: {currentPuzzle.blunderedMove}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      In the actual game, you played a passive move in time trouble, dropping the evaluation from +0.2 to {currentPuzzle.blunderEval}.
                    </p>
                  </div>
                )}

                {status === 'wrong' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 flex items-center justify-between text-xs font-semibold">
                    <span>Not the winning tactical line. Try another move!</span>
                    <button
                      onClick={handleReset}
                      className="underline hover:text-amber-950 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleShowWinningMove}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Solve Move ({currentPuzzle.winningMove})</span>
                  </button>

                  <button
                    onClick={handleShowBlunder}
                    className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>See Real Blunder</span>
                  </button>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="px-3.5 py-2.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-3.5 py-2.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                    title="Reset Position"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
