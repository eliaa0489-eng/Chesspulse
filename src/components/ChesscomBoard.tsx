import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { MoveClassification, BoardArrow } from '../types/chess';
import { EvalBadge } from './EvalBadge';
import { chessAudio } from '../services/chessSound';

/**
 * Official Cburnett / Staunton Tournament Standard Inline SVG Pieces (12 Variants: wP..wK, bP..bK)
 * - 100% closed, opaque vector silhouettes (zero external URLs, zero currentColor/transparency)
 * - White pieces ('w'): solid fill="#ffffff" with bold stroke="#1a1a1a" (strokeWidth="1.8")
 * - Black pieces ('b'): solid fill="#222222" with stroke="#000000" (strokeWidth="1.5") and crisp inner highlights (#e5e5e5)
 * - Physical board weight via inline drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45)) and opacity: 1
 */
export function ChessPieceVector({ piece, color }: { piece: string; color: 'w' | 'b' }) {
  const isWhite = color === 'w';
  const fillMain = isWhite ? '#ffffff' : '#222222';
  const strokeMain = isWhite ? '#1a1a1a' : '#000000';
  const strokeWidthMain = isWhite ? 1.8 : 1.5;
  const innerStroke = isWhite ? '#1a1a1a' : '#e5e5e5';

  const svgStyle: React.CSSProperties = {
    filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45))',
    opacity: 1,
    zIndex: 10,
    pointerEvents: 'none',
    width: '86%',
    height: '86%',
    display: 'block',
  };

  const type = piece.toLowerCase();

  switch (type) {
    case 'p':
      // Pawn (wP / bP) — 100% closed opaque Staunton silhouette
      return (
        <svg
          viewBox="0 0 45 45"
          width="100%"
          height="100%"
          style={svgStyle}
          shapeRendering="geometricPrecision"
        >
          <g opacity="1" fillOpacity="1" strokeOpacity="1">
            <path
              d="M 22.5,9 C 19.46,9 17,11.46 17,14.5 C 17,16.58 18.16,18.39 19.86,19.32 C 17.52,20.58 16,23.02 16,25.85 C 16,28.12 17.1,30.12 18.78,31.38 C 14.95,32.68 11.5,35.65 11.5,39.5 L 33.5,39.5 C 33.5,35.65 30.05,32.68 26.22,31.38 C 27.9,30.12 29,28.12 29,25.85 C 29,23.02 27.48,20.58 25.14,19.32 C 26.84,18.39 28,16.58 28,14.5 C 28,11.46 25.54,9 22.5,9 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Collar & Base Detail Lines */}
            <path
              d="M 19.5,19.5 L 25.5,19.5"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <path
              d="M 17.5,31.4 L 27.5,31.4"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <path
              d="M 13.5,36.8 L 31.5,36.8"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'r':
      // Rook (wR / bR) — 100% closed opaque Staunton Battlement Tower
      return (
        <svg
          viewBox="0 0 45 45"
          width="100%"
          height="100%"
          style={svgStyle}
          shapeRendering="geometricPrecision"
        >
          <g
            opacity="1"
            fillOpacity="1"
            strokeOpacity="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Solid Base Plinth */}
            <path
              d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            <path
              d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Solid Tower Pillar */}
            <path
              d="M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Lower Neck Transition */}
            <path
              d="M 14,29.5 L 12,32 L 33,32 L 31,29.5 L 14,29.5 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Upper Crown Transition */}
            <path
              d="M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Crown Battlements */}
            <path
              d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Inner Highlight Contours for Black Rook / Crisp Seams for White Rook */}
            <path
              d="M 12,35.5 L 33,35.5 M 13,31.5 L 32,31.5 M 14,29.5 L 31,29.5 M 14,16.5 L 31,16.5 M 12,14 L 33,14"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.3"
            />
          </g>
        </svg>
      );

    case 'n':
      // Knight (wN / bN) — 100% single closed Cburnett tournament knight silhouette
      return (
        <svg
          viewBox="0 0 45 45"
          width="100%"
          height="100%"
          style={svgStyle}
          shapeRendering="geometricPrecision"
        >
          <g
            opacity="1"
            fillOpacity="1"
            strokeOpacity="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Unified Closed Horse Head + Neck + Base Body */}
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 L 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Eye */}
            <circle
              cx="15.5"
              cy="15.5"
              r="1.4"
              fill={innerStroke}
              stroke={innerStroke}
              strokeWidth="0.6"
            />
            {/* Nostril */}
            <circle
              cx="9.5"
              cy="25.5"
              r="0.9"
              fill={innerStroke}
              stroke={innerStroke}
              strokeWidth="0.5"
            />
            {/* Mane & Base Accent Contour */}
            {!isWhite ? (
              <path
                d="M 24.55,10.4 C 31.8,11.85 36.6,18.4 36.3,36.8 M 16.5,36.8 L 36.3,36.8"
                fill="none"
                stroke="#e5e5e5"
                strokeWidth="1.35"
              />
            ) : (
              <path
                d="M 15.5,36.5 L 37.5,36.5"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="1.4"
              />
            )}
          </g>
        </svg>
      );

    case 'b':
      // Bishop (wB / bB) — 100% closed opaque Staunton mitre + base ribbons
      return (
        <svg
          viewBox="0 0 45 45"
          width="100%"
          height="100%"
          style={svgStyle}
          shapeRendering="geometricPrecision"
        >
          <g
            opacity="1"
            fillOpacity="1"
            strokeOpacity="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Base Ribbons */}
            <path
              d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Mitre Body */}
            <path
              d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Top Orb */}
            <circle
              cx="22.5"
              cy="8"
              r="2.5"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Inner Collar Seams & Cross */}
            <path
              d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.55"
            />
          </g>
        </svg>
      );

    case 'q':
      // Queen (wQ / bQ) — 100% unified closed opaque Staunton Coronet + Base
      return (
        <svg
          viewBox="0 0 45 45"
          width="100%"
          height="100%"
          style={svgStyle}
          shapeRendering="geometricPrecision"
        >
          <g
            opacity="1"
            fillOpacity="1"
            strokeOpacity="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Unified Closed Queen Crown & Base Body */}
            <path
              d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            <path
              d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* 5 Crown Pearls */}
            <circle cx="6" cy="12" r="2.3" fill={fillMain} stroke={strokeMain} strokeWidth={strokeWidthMain} />
            <circle cx="14" cy="9" r="2.3" fill={fillMain} stroke={strokeMain} strokeWidth={strokeWidthMain} />
            <circle cx="22.5" cy="8" r="2.3" fill={fillMain} stroke={strokeMain} strokeWidth={strokeWidthMain} />
            <circle cx="31" cy="9" r="2.3" fill={fillMain} stroke={strokeMain} strokeWidth={strokeWidthMain} />
            <circle cx="39" cy="12" r="2.3" fill={fillMain} stroke={strokeMain} strokeWidth={strokeWidthMain} />
            {/* Crisp Inner Band Highlights (fill="none" so no hollow cutouts) */}
            <path
              d="M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5 M 11,36 C 17.5,35 27.5,35 34,36"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.4"
            />
          </g>
        </svg>
      );

    case 'k':
    default:
      // King (wK / bK) — 100% closed opaque Staunton Royal Crown + Cross
      return (
        <svg
          viewBox="0 0 45 45"
          width="100%"
          height="100%"
          style={svgStyle}
          shapeRendering="geometricPrecision"
        >
          <g
            opacity="1"
            fillOpacity="1"
            strokeOpacity="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Royal Cross */}
            <path
              d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8"
              fill="none"
              stroke={strokeMain}
              strokeWidth="2.4"
            />
            {!isWhite && (
              <path
                d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8"
                fill="none"
                stroke="#e5e5e5"
                strokeWidth="1.2"
              />
            )}
            {/* Center Finial */}
            <path
              d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Main Royal Crown & Base */}
            <path
              d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z"
              fill={fillMain}
              stroke={strokeMain}
              strokeWidth={strokeWidthMain}
            />
            {/* Crisp Inner Band Highlights (fill="none") */}
            <path
              d="M 11.5,30 C 17,27 27,27 32.5,30 M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5 M 11.5,37 C 17,34 27,34 32.5,37"
              fill="none"
              stroke={innerStroke}
              strokeWidth="1.4"
            />
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
  arrows?: BoardArrow[];
  isFlipped?: boolean;
  interactive?: boolean;
  className?: string;
  onMovePlayed?: (from: string, to: string) => void;
  allowedTurnColor?: 'w' | 'b' | null;
}

/**
 * Converts an algebraic square ('a1'..'h8') to SVG center coordinates in an 800x800 grid (100x100 per square),
 * accurately flipping both file and rank when `isFlipped` is true.
 */
function squareToSvgCenter(square: string, isFlipped: boolean): { x: number; y: number } | null {
  if (!square || square.length < 2) return null;
  const fileCode = square.toLowerCase().charCodeAt(0) - 97; // 'a' -> 0 .. 'h' -> 7
  const rankNum = parseInt(square[1], 10); // '1' -> 1 .. '8' -> 8
  if (fileCode < 0 || fileCode > 7 || isNaN(rankNum) || rankNum < 1 || rankNum > 8) {
    return null;
  }
  const actualRow = 8 - rankNum; // 0 (rank 8) .. 7 (rank 1)
  const actualCol = fileCode; // 0 (file a) .. 7 (file h)

  const displayRow = isFlipped ? 7 - actualRow : actualRow;
  const displayCol = isFlipped ? 7 - actualCol : actualCol;

  return {
    x: displayCol * 100 + 50,
    y: displayRow * 100 + 50,
  };
}

/**
 * Returns authentic Chess.com Game Review square highlight tint based on the played move's classification.
 */
function getSquareHighlightRgba(classification?: MoveClassification, isToSquare?: boolean): string {
  const alpha = isToSquare ? 0.52 : 0.42;
  switch (classification) {
    case 'brilliant':
      return `rgba(27, 172, 166, ${alpha})`; // #1baca6 Cyan/Teal
    case 'great':
      return `rgba(92, 139, 176, ${alpha})`; // #5c8bb0 Blue
    case 'best':
      return `rgba(129, 182, 76, ${alpha})`; // #81b64c Classic Chess.com Green
    case 'excellent':
    case 'good':
      return `rgba(150, 188, 75, ${alpha})`; // #96bc4b Soft Green
    case 'inaccuracy':
      return `rgba(247, 198, 49, ${isToSquare ? 0.56 : 0.46})`; // #f7c631 Warm Yellow-Orange
    case 'mistake':
      return `rgba(255, 164, 89, ${isToSquare ? 0.56 : 0.46})`; // #ffa459 Chess.com Orange
    case 'miss':
    case 'blunder':
      return `rgba(250, 65, 45, ${isToSquare ? 0.56 : 0.46})`; // #fa412d Chess.com Crimson Red
    case 'book':
    default:
      return 'rgba(245, 246, 130, 0.55)';
  }
}

export function ChesscomBoard({
  fen,
  fromSquare,
  toSquare,
  classification,
  arrows = [],
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

  const currentTurn = (fen.split(' ')[1] || 'w') as 'w' | 'b';

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

  const handleSquareClick = (
    squareName: string,
    cell: null | { piece: string; color: 'w' | 'b' }
  ) => {
    if (!interactive) return;

    if (selectedSquare) {
      if (selectedSquare === squareName) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const isLegal = legalMoves.some((m) => m.to === squareName);
      if (isLegal && onMovePlayed) {
        const from = selectedSquare;
        setSelectedSquare(null);
        setLegalMoves([]);
        setDraggingSquare(null);
        onMovePlayed(from, squareName);
        return;
      }

      if (cell && canInteractWithCell(cell)) {
        const newMoves = computeLegalMoves(squareName);
        setSelectedSquare(squareName);
        setLegalMoves(newMoves);
        chessAudio.playSelect();
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (cell && canInteractWithCell(cell)) {
      const moves = computeLegalMoves(squareName);
      setSelectedSquare(squareName);
      setLegalMoves(moves);
      chessAudio.playSelect();
    }
  };

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

  // STRICT SINGLE-ARROW RULE: Never render more than ONE arrow on the board at any time
  const singleArrow = arrows.length > 0 ? arrows.slice(0, 1) : [];

  // Detect Check (+) and Checkmate (#) and locate the attacked King's exact square (a1–h8)
  const checkStatus = React.useMemo(() => {
    try {
      const chess = new Chess(fen);
      const isMate = chess.isCheckmate();
      const isChk = !isMate && chess.inCheck();
      if (!isMate && !isChk) {
        return { inCheck: false, isCheckmate: false, kingSquare: null as string | null };
      }
      const attackedColor = chess.turn(); // 'w' | 'b'
      const b = chess.board();
      let kingSq: string | null = null;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = b[r][c];
          if (p && p.type === 'k' && p.color === attackedColor) {
            kingSq = p.square;
            break;
          }
        }
        if (kingSq) break;
      }
      return { inCheck: isChk, isCheckmate: isMate, kingSquare: kingSq };
    } catch {
      return { inCheck: false, isCheckmate: false, kingSquare: null as string | null };
    }
  }, [fen]);

  return (
    <div
      className={`w-full max-w-[min(100%,calc(100dvh-255px))] sm:max-w-[720px] sm:min-w-[480px] lg:min-w-[540px] aspect-square mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-[2.5px] sm:border-4 border-[#262421] bg-[#262421] p-0.5 sm:p-1.5 select-none relative ${
        className || ''
      }`}
      style={{ backgroundColor: '#262421', borderColor: '#262421', opacity: 1, touchAction: 'manipulation' }}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden relative">
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((__, c) => {
            const actualR = isFlipped ? 7 - r : r;
            const actualC = isFlipped ? 7 - c : c;
            const cell = board[actualR]?.[actualC] ?? null;
            const isDark = (actualR + actualC) % 2 === 1;
            const squareName = coordsToSquare(r, c);

            const isFrom = squareName === fromSquare;
            const isTo = squareName === toSquare;
            const isLastMoveSquare = isFrom || isTo;
            const isSelected = selectedSquare === squareName;
            const isBeingDragged = draggingSquare === squareName;

            const isCheckedKingSquare =
              checkStatus.inCheck && checkStatus.kingSquare === squareName;
            const isCheckmatedKingSquare =
              checkStatus.isCheckmate && checkStatus.kingSquare === squareName;

            const legalMove = legalMoves.find((m) => m.to === squareName);

            // Official Tournament Green & Warm Ivory Palette (#739552 dark, #ebecd0 light)
            const squareBgHex = isDark ? '#739552' : '#ebecd0';
            const coordColorHex = isCheckmatedKingSquare
              ? '#ffffff'
              : isDark
              ? '#ebecd0'
              : '#739552';

            return (
              <div
                key={squareName}
                onClick={() => handleSquareClick(squareName, cell)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, squareName)}
                className="relative flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: squareBgHex, opacity: 1 }}
              >
                {/* Authentic Chess.com Square Highlight Tinting on fromSquare & toSquare */}
                {isLastMoveSquare && !isSelected && !isCheckmatedKingSquare && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: getSquareHighlightRgba(classification, isTo),
                      zIndex: 1,
                    }}
                  />
                )}

                {/* CHECK (+) Red Radial Danger Glow Highlight on Attacked King's Square */}
                {isCheckedKingSquare && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(255, 59, 48, 0.88) 0%, rgba(220, 38, 38, 0.62) 58%, rgba(185, 28, 28, 0.14) 100%)',
                      boxShadow: 'inset 0 0 12px rgba(220, 38, 38, 0.78)',
                      zIndex: 2,
                    }}
                  />
                )}

                {/* CHECKMATE (#) Full Solid Crimson Red Square (#dc2626 / #b91c1c) with Pulsing Border */}
                {isCheckmatedKingSquare && (
                  <div
                    className="absolute inset-0 pointer-events-none chess-mate-square-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Selected Square Highlight */}
                {isSelected && (
                  <div
                    className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-black/25"
                    style={{ backgroundColor: 'rgba(186, 202, 43, 0.72)', zIndex: 3 }}
                  />
                )}

                {/* Crisp Tournament Perimeter Coordinates (1–8 on left file, a–h on bottom rank) */}
                {c === 0 && (
                  <span
                    className="absolute top-0.5 left-1 sm:left-1.5 text-[9px] sm:text-[11px] font-extrabold leading-none select-none pointer-events-none"
                    style={{ color: coordColorHex, zIndex: 5, opacity: 1 }}
                  >
                    {8 - actualR}
                  </span>
                )}

                {r === 7 && (
                  <span
                    className="absolute bottom-0.5 right-1 sm:right-1.5 text-[9px] sm:text-[11px] font-extrabold leading-none select-none pointer-events-none"
                    style={{ color: coordColorHex, zIndex: 5, opacity: 1 }}
                  >
                    {String.fromCharCode('a'.charCodeAt(0) + actualC)}
                  </span>
                )}

                {/* Legal Move Indicators: Target Dot on empty, Capture Ring on occupied */}
                {legalMove && !cell && (
                  <div
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full pointer-events-none transition-transform scale-100"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.24)', zIndex: 15 }}
                  />
                )}

                {legalMove && cell && (
                  <div
                    className="absolute inset-1 rounded-full border-[3.5px] sm:border-[4px] pointer-events-none"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.28)', zIndex: 20 }}
                  />
                )}

                {/* Official Circular Move Classification Badge at Top-Right Corner Next to Moved Piece */}
                {isTo && classification && (
                  <div
                    className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 pointer-events-none drop-shadow-md"
                    style={{ zIndex: 30, opacity: 1 }}
                  >
                    <EvalBadge classification={classification} showLabel={false} size="sm" />
                  </div>
                )}

                {/* Official Checkmate (#) Badge at Top-Right Corner of the Checkmated King's Square */}
                {isCheckmatedKingSquare && (
                  <div
                    className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 pointer-events-none drop-shadow-md"
                    style={{ zIndex: 32, opacity: 1 }}
                    title="Checkmate (#)"
                  >
                    <span
                      style={{ backgroundColor: '#991b1b', color: '#ffffff' }}
                      className="inline-flex items-center justify-center rounded-full font-black select-none ring-2 ring-white/95 shadow-md w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-[11px]"
                    >
                      #
                    </span>
                  </div>
                )}

                {/* High-Resolution Staunton Piece SVG Container (with Check Shake & Checkmate Defeated Tilt) */}
                {cell &&
                  (() => {
                    const isMovable = canInteractWithCell(cell);
                    const kingAnimClass = isCheckmatedKingSquare
                      ? 'chess-king-checkmated'
                      : isCheckedKingSquare
                      ? 'chess-king-check-shake'
                      : '';
                    return (
                      <div
                        key={
                          isCheckedKingSquare || isCheckmatedKingSquare
                            ? `${squareName}-${fen}`
                            : squareName
                        }
                        draggable={isMovable}
                        onDragStart={(e) => handleDragStart(e, squareName, cell)}
                        onDragEnd={handleDragEnd}
                        style={{ opacity: 1, zIndex: 10 }}
                        className={`relative w-full h-full flex items-center justify-center transition-transform duration-150 ${kingAnimClass} ${
                          isMovable
                            ? 'cursor-grab active:cursor-grabbing hover:scale-105'
                            : 'cursor-default select-none'
                        } ${isBeingDragged ? 'scale-105' : ''}`}
                      >
                        <ChessPieceVector piece={cell.piece} color={cell.color} />
                      </div>
                    );
                  })()}
              </div>
            );
          })
        )}

        {/* Strict Single-Arrow Chess.com SVG Best-Move Overlay Layer (opacity: 0.64) */}
        {singleArrow.length > 0 && (
          <svg
            viewBox="0 0 800 800"
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            style={{ zIndex: 25 }}
            shapeRendering="geometricPrecision"
          >
            <defs>
              <filter id="chessArrowShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.32" />
              </filter>
            </defs>
            {singleArrow.map((arrow, idx) => {
              const start = squareToSvgCenter(arrow.from, isFlipped);
              const end = squareToSvgCenter(arrow.to, isFlipped);
              if (!start || !end) return null;

              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 10) return null;

              const ux = dx / dist;
              const uy = dy / dist;
              const px = -uy;
              const py = ux;

              // Sleek Chess.com single-arrow geometry stopping short of square edges & top-right badge
              const startOffset = 18;
              const tipOffset = 16;
              const headLength = 34;
              const headHalfWidth = 20.5;
              const shaftHalfWidth = 8.5;

              const x1 = start.x + ux * startOffset;
              const y1 = start.y + uy * startOffset;
              const tipX = end.x - ux * tipOffset;
              const tipY = end.y - uy * tipOffset;
              const neckX = tipX - ux * headLength;
              const neckY = tipY - uy * headLength;

              const polyPoints = [
                `${x1 + px * shaftHalfWidth},${y1 + py * shaftHalfWidth}`,
                `${neckX + px * shaftHalfWidth},${neckY + py * shaftHalfWidth}`,
                `${neckX + px * headHalfWidth},${neckY + py * headHalfWidth}`,
                `${tipX},${tipY}`,
                `${neckX - px * headHalfWidth},${neckY - py * headHalfWidth}`,
                `${neckX - px * shaftHalfWidth},${neckY - py * shaftHalfWidth}`,
                `${x1 - px * shaftHalfWidth},${y1 - py * shaftHalfWidth}`,
              ].join(' ');

              return (
                <g
                  key={`${arrow.from}-${arrow.to}-${idx}`}
                  filter="url(#chessArrowShadow)"
                  opacity={0.64}
                >
                  <polygon
                    points={polyPoints}
                    fill={arrow.color || '#81b64c'}
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
