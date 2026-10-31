import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { MoveClassification } from '../types/chess';
import { EvalBadge } from './EvalBadge';
import { chessAudio } from '../services/chessSound';

/**
 * Authentic Staunton / Chess.com Vector Pieces
 * Pristine, high-resolution SVG paths with high-DPI vector crispness.
 */
export function ChessPieceVector({ piece, color }: { piece: string; color: 'w' | 'b' }) {
  const isWhite = color === 'w';

  switch (piece.toLowerCase()) {
    case 'k':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className="w-[86%] h-[86%] drop-shadow select-none pointer-events-none">
          <g fill="#ffffff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,11.5 V 6 M 20,8 h 5" stroke="#18181b" strokeWidth="2.2" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,11.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,29 36.5,26 31,24 C 29,23.5 26,24.5 22.5,24.5 C 19,24.5 16,23.5 14,24 C 8.5,26 8.5,29 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" />
            <path d="M 11.5,37 C 17,34 28,34 33.5,37" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className="w-[86%] h-[86%] drop-shadow select-none pointer-events-none">
          <g fill="#18181b" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,11.5 V 6 M 20,8 h 5" stroke="#ffffff" strokeWidth="2.2" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,11.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,29 36.5,26 31,24 C 29,23.5 26,24.5 22.5,24.5 C 19,24.5 16,23.5 14,24 C 8.5,26 8.5,29 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 11.5,37 C 17,34 28,34 33.5,37" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'q':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className="w-[86%] h-[86%] drop-shadow select-none pointer-events-none">
          <g fill="#ffffff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="12" r="2.75" />
            <circle cx="14" cy="9" r="2.75" />
            <circle cx="22.5" cy="8" r="2.75" />
            <circle cx="31" cy="9" r="2.75" />
            <circle cx="39" cy="12" r="2.75" />
            <path d="M 9,26 C 17.5,34 27.5,34 36,26 L 38.5,14.5 L 31,25 L 22.5,12 L 14,25 L 6.5,14.5 Z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 11,39 C 11.5,40.5 33.5,40.5 34,39 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" />
            <path d="M 12,33.5 C 18,31 27,31 33,33.5" />
            <path d="M 11,39 C 17,36.5 28,36.5 34,39" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className="w-[86%] h-[86%] drop-shadow select-none pointer-events-none">
          <g fill="#18181b" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="12" r="2.75" />
            <circle cx="14" cy="9" r="2.75" />
            <circle cx="22.5" cy="8" r="2.75" />
            <circle cx="31" cy="9" r="2.75" />
            <circle cx="39" cy="12" r="2.75" />
            <path d="M 9,26 C 17.5,34 27.5,34 36,26 L 38.5,14.5 L 31,25 L 22.5,12 L 14,25 L 6.5,14.5 Z" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 11,39 C 11.5,40.5 33.5,40.5 34,39 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 12,33.5 C 18,31 27,31 33,33.5" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 11,39 C 17,36.5 28,36.5 34,39" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'r':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className="w-[82%] h-[82%] drop-shadow select-none pointer-events-none">
          <g fill="#ffffff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 Z" />
            <path d="M 12,14 L 33,14 L 31,32 L 14,32 Z" />
            <path d="M 14,29.5 L 31,29.5" />
            <path d="M 14,16.5 L 31,16.5" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className="w-[82%] h-[82%] drop-shadow select-none pointer-events-none">
          <g fill="#18181b" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 Z" />
            <path d="M 12,14 L 33,14 L 31,32 L 14,32 Z" />
            <path d="M 14,29.5 L 31,29.5" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 14,16.5 L 31,16.5" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 12,32 L 33,32" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'b':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className="w-[84%] h-[84%] drop-shadow select-none pointer-events-none">
          <g fill="#ffffff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22.5" cy="8" r="2.5" />
            <path d="M 9,36 C 12.5,35 15,35 18,36.5 L 27,36.5 C 30,35 32.5,35 36,36 L 36,39 L 9,39 Z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,27.5 32,23 32,18 C 32,13 27,9 22.5,9 C 18,9 13,13 13,18 C 13,23 14.5,27.5 15,32 Z" />
            <path d="M 17,21 L 28,21 M 22.5,16 L 22.5,26" stroke="#18181b" strokeWidth="1.6" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className="w-[84%] h-[84%] drop-shadow select-none pointer-events-none">
          <g fill="#18181b" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22.5" cy="8" r="2.5" />
            <path d="M 9,36 C 12.5,35 15,35 18,36.5 L 27,36.5 C 30,35 32.5,35 36,36 L 36,39 L 9,39 Z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,27.5 32,23 32,18 C 32,13 27,9 22.5,9 C 18,9 13,13 13,18 C 13,23 14.5,27.5 15,32 Z" />
            <path d="M 17,21 L 28,21 M 22.5,16 L 22.5,26" stroke="#ffffff" strokeWidth="1.6" />
          </g>
        </svg>
      );

    case 'n':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className="w-[86%] h-[86%] drop-shadow select-none pointer-events-none">
          <g fill="#ffffff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <path d="M 24,18 C 24.3,27 16,34 8,32 C 5.5,25 6.5,19 13,15 C 13,12 18,7 23,7 C 28,7 28,9 22,10" />
            <circle cx="15.5" cy="18.5" r="1.5" fill="#18181b" />
            <path d="M 9.5,25.5 C 11.5,27 13.5,27 15,26.5" />
            <path d="M 15,15.5 A 0.5,1.5 0 1,1 14,15.5 A 0.5,1.5 0 1,1 15,15.5 Z" />
            <path d="M 24.5,10.5 L 23,12 M 28,12 L 26.5,13.5 M 31,14.5 L 29.5,16" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className="w-[86%] h-[86%] drop-shadow select-none pointer-events-none">
          <g fill="#18181b" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <path d="M 24,18 C 24.3,27 16,34 8,32 C 5.5,25 6.5,19 13,15 C 13,12 18,7 23,7 C 28,7 28,9 22,10" />
            <circle cx="15.5" cy="18.5" r="1.5" fill="#ffffff" />
            <path d="M 9.5,25.5 C 11.5,27 13.5,27 15,26.5" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 24.5,10.5 L 23,12 M 28,12 L 26.5,13.5 M 31,14.5 L 29.5,16" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'p':
    default:
      return isWhite ? (
        <svg viewBox="0 0 45 45" className="w-[72%] h-[72%] drop-shadow select-none pointer-events-none">
          <g fill="#ffffff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22.5" cy="12" r="5" />
            <path d="M 12,39 L 33,39 L 33,36 L 12,36 Z" />
            <path d="M 14,36 L 14,32 C 14,28 20,24 20,20 C 20,18 19,18 19,18 C 19,18 26,18 26,18 C 26,18 25,18 25,20 C 25,24 31,28 31,32 L 31,36 Z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className="w-[72%] h-[72%] drop-shadow select-none pointer-events-none">
          <g fill="#18181b" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22.5" cy="12" r="5" />
            <path d="M 12,39 L 33,39 L 33,36 L 12,36 Z" />
            <path d="M 14,36 L 14,32 C 14,28 20,24 20,20 C 20,18 19,18 19,18 C 19,18 26,18 26,18 C 26,18 25,18 25,20 C 25,24 31,28 31,32 L 31,36 Z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </svg>
      );
  }
}

type BoardMatrix = (null | { piece: string; color: 'w' | 'b' })[][];

function fenToMatrix(fen: string): BoardMatrix {
  try {
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    const board: BoardMatrix = [];

    for (let r = 0; r < 8; r++) {
      const rowStr = rows[r] || '8';
      const row: (null | { piece: string; color: 'w' | 'b' })[] = [];
      for (let c = 0; c < rowStr.length; c++) {
        const char = rowStr[c];
        if (char >= '1' && char <= '8') {
          const count = parseInt(char, 10);
          for (let i = 0; i < count; i++) {
            row.push(null);
          }
        } else {
          const isWhite = char === char.toUpperCase();
          row.push({
            piece: char.toLowerCase(),
            color: isWhite ? 'w' : 'b',
          });
        }
      }
      board.push(row);
    }
    return board;
  } catch {
    const startingChess = new Chess();
    return fenToMatrix(startingChess.fen());
  }
}

interface ChesscomBoardProps {
  fen: string;
  fromSquare?: string;
  toSquare?: string;
  classification?: MoveClassification;
  isFlipped?: boolean;
  interactive?: boolean;
  className?: string;
  onMovePlayed?: (from: string, to: string) => void;
  allowedTurnColor?: 'w' | 'b' | null;
}

export function ChesscomBoard({
  fen,
  fromSquare,
  toSquare,
  classification,
  isFlipped = false,
  interactive = false,
  className,
  onMovePlayed,
  allowedTurnColor,
}: ChesscomBoardProps) {
  const [board, setBoard] = useState<BoardMatrix>(() => fenToMatrix(fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ to: string; isCapture: boolean }[]>([]);
  const [draggingSquare, setDraggingSquare] = useState<string | null>(null);

  // Determine current active turn from FEN ('w' or 'b')
  const currentTurn = (fen.split(' ')[1] || 'w') as 'w' | 'b';

  /**
   * Strict Turn-Lock Enforcement:
   * 1. White can ONLY move White pieces on White's turn; Black can ONLY move Black pieces on Black's turn.
   * 2. If `allowedTurnColor` is specified (e.g. locked to player's side), also enforce `cell.color === allowedTurnColor`.
   */
  const canInteractWithCell = (cell: { piece: string; color: 'w' | 'b' } | null): boolean => {
    if (!interactive || !cell) return false;
    if (cell.color !== currentTurn) return false;
    if (allowedTurnColor && cell.color !== allowedTurnColor) return false;
    return true;
  };

  useEffect(() => {
    setBoard(fenToMatrix(fen));
    setSelectedSquare(null);
    setLegalMoves([]);
    setDraggingSquare(null);
  }, [fen]);

  const coordsToSquare = (r: number, c: number): string => {
    const actualR = isFlipped ? 7 - r : r;
    const actualC = isFlipped ? 7 - c : c;
    const file = String.fromCharCode('a'.charCodeAt(0) + actualC);
    const rank = 8 - actualR;
    return `${file}${rank}`;
  };

  /**
   * Computes strictly legal moves for a square on the active turn.
   * Deduplicates promotion variants (e.g. e7->e8=Q/R/B/N) so each target square appears once.
   */
  const computeLegalMoves = (squareName: string): { to: string; isCapture: boolean }[] => {
    try {
      const chess = new Chess(fen);
      const piece = chess.get(squareName as Square);
      if (!piece || piece.color !== currentTurn) return [];

      const moves = chess.moves({ square: squareName as Square, verbose: true });
      const uniqueTargets = new Map<string, { to: string; isCapture: boolean }>();

      for (const m of moves) {
        if (!uniqueTargets.has(m.to)) {
          uniqueTargets.set(m.to, {
            to: m.to,
            isCapture: Boolean(m.captured) || m.flags.includes('e'),
          });
        }
      }

      return Array.from(uniqueTargets.values());
    } catch {
      return [];
    }
  };

  /**
   * Click-to-Move Handler
   */
  const handleSquareClick = (
    squareName: string,
    cell: null | { piece: string; color: 'w' | 'b' }
  ) => {
    if (!interactive) return;

    // 1. If a square is already selected
    if (selectedSquare) {
      if (selectedSquare === squareName) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if clicked square is a legal destination
      const isLegal = legalMoves.some((m) => m.to === squareName);
      if (isLegal && onMovePlayed) {
        const from = selectedSquare;
        setSelectedSquare(null);
        setLegalMoves([]);
        setDraggingSquare(null);
        onMovePlayed(from, squareName);
        return;
      }

      // If clicking another friendly piece of the active turn, switch selection
      if (cell && canInteractWithCell(cell)) {
        const newMoves = computeLegalMoves(squareName);
        setSelectedSquare(squareName);
        setLegalMoves(newMoves);
        chessAudio.playSelect();
        return;
      }

      // Otherwise cancel selection
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // 2. No square selected: select clicked piece if it belongs to active turn
    if (cell && canInteractWithCell(cell)) {
      const moves = computeLegalMoves(squareName);
      setSelectedSquare(squareName);
      setLegalMoves(moves);
      chessAudio.playSelect();
    }
  };

  /**
   * Drag-and-Drop Handlers (Zero Disappearing Pieces)
   */
  const handleDragStart = (
    e: React.DragEvent,
    squareName: string,
    cell: null | { piece: string; color: 'w' | 'b' }
  ) => {
    if (!interactive || !cell || !canInteractWithCell(cell)) {
      e.preventDefault();
      return;
    }

    const moves = computeLegalMoves(squareName);
    setSelectedSquare(squareName);
    setLegalMoves(moves);
    setDraggingSquare(squareName);
    chessAudio.playSelect();

    e.dataTransfer.setData('text/plain', squareName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, squareName: string) => {
    if (!interactive) return;
    e.preventDefault();

    const from = e.dataTransfer.getData('text/plain') || draggingSquare || selectedSquare;
    setDraggingSquare(null);

    if (from && from !== squareName) {
      // Re-verify legality directly from chess.js in case state was mid-update
      const currentLegal =
        legalMoves.length > 0 ? legalMoves : computeLegalMoves(from);
      const isLegal = currentLegal.some((m) => m.to === squareName);
      if (isLegal && onMovePlayed) {
        setSelectedSquare(null);
        setLegalMoves([]);
        onMovePlayed(from, squareName);
        return;
      }
    }
  };

  const handleDragEnd = () => {
    setDraggingSquare(null);
  };

  return (
    <div
      className={`w-full min-w-[270px] sm:min-w-[480px] lg:min-w-[540px] max-w-[720px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-[#262421] bg-[#262421] p-1.5 select-none relative transition-all duration-300 ${
        className || ''
      }`}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden relative">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const actualR = isFlipped ? 7 - r : r;
            const actualC = isFlipped ? 7 - c : c;
            const isDark = (actualR + actualC) % 2 === 1;
            const squareName = coordsToSquare(r, c);

            const isFrom = squareName === fromSquare;
            const isTo = squareName === toSquare;
            const isLastMoveSquare = isFrom || isTo;
            const isSelected = selectedSquare === squareName;
            const isBeingDragged = draggingSquare === squareName;

            const legalMove = legalMoves.find((m) => m.to === squareName);

            // ChessPulse custom tournament board palette: Dark #4B7355, Light #EAEDE8
            let bgClass = isDark ? 'bg-[#4B7355]' : 'bg-[#EAEDE8]';

            if (isSelected) {
              bgClass = 'bg-emerald-300/90 ring-2 ring-inset ring-emerald-600';
            } else if (isLastMoveSquare) {
              bgClass = isDark ? 'bg-[#659B72]' : 'bg-[#CFE7D4]';
            }

            return (
              <div
                key={squareName}
                onClick={() => handleSquareClick(squareName, cell)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, squareName)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
              >
                {/* Authentic Perimeter Coordinates */}
                {c === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-black select-none pointer-events-none ${
                      isDark ? 'text-[#EAEDE8]' : 'text-[#4B7355]'
                    }`}
                  >
                    {isFlipped ? r + 1 : 8 - r}
                  </span>
                )}

                {r === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-black select-none pointer-events-none ${
                      isDark ? 'text-[#EAEDE8]' : 'text-[#4B7355]'
                    }`}
                  >
                    {String.fromCharCode('a'.charCodeAt(0) + (isFlipped ? 7 - c : c))}
                  </span>
                )}

                {/* Legal Move Indicators: Glowing Target Dot on empty, Tactical Capture Ring on occupied */}
                {legalMove && !cell && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/85 ring-4 ring-emerald-400/35 shadow-sm pointer-events-none z-10 transition-transform scale-100" />
                )}

                {legalMove && cell && (
                  <div className="absolute inset-1 rounded-full border-[3.5px] border-emerald-400/90 ring-2 ring-black/25 pointer-events-none z-20" />
                )}

                {/* Engine Annotation Badge on Target Square */}
                {isTo && classification && (
                  <div className="absolute -top-1.5 -right-1.5 z-20 pointer-events-none scale-90">
                    <EvalBadge classification={classification} showLabel={false} size="xs" />
                  </div>
                )}

                {/* Staunton Piece SVG: Always rendered with stable key & zero disappearing state */}
                {cell && (() => {
                  const isMovable = canInteractWithCell(cell);
                  return (
                    <div
                      draggable={isMovable}
                      onDragStart={(e) => handleDragStart(e, squareName, cell)}
                      onDragEnd={handleDragEnd}
                      className={`w-full h-full flex items-center justify-center transition-transform duration-150 ${
                        isMovable
                          ? 'cursor-grab active:cursor-grabbing hover:scale-105'
                          : 'cursor-default select-none'
                      } ${isBeingDragged ? 'scale-105 filter drop-shadow-lg' : ''}`}
                    >
                      <ChessPieceVector piece={cell.piece} color={cell.color} />
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
