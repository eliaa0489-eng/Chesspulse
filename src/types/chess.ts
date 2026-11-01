export type CanonicalTacticalTheme =
  | 'Forks'
  | 'Pins'
  | 'Skewers'
  | 'Back-rank Mates'
  | 'Defensive Save';

export type PuzzleDifficultyTier = 'Easy' | 'Medium' | 'Hard';

export interface TacticalPuzzle {
  id: string;
  title: string;
  opening: string;
  playerColor: 'white' | 'black';
  opponentName: string;
  opponentRating: number;
  userRating: number;
  gameType: 'Blitz 3+2' | 'Rapid 10+0' | 'Bullet 1+0' | string;
  gameDate?: string;
  matchUrl?: string;
  moveNumber?: number;
  blunderedMove: string; // e.g. "21. Be3??"
  blunderFromTo?: { from: string; to: string };
  blunderFen?: string;
  winningMove: string;   // e.g. "21. Nd4!"
  blunderEval: string;   // "-2.4"
  bestEval: string;      // "+4.8"
  fen: string;           // Starting FEN before the winning move
  solutionMoves: { from: string; to: string; san?: string }[];
  explanation: string;
  detailedDescription?: {
    matchContext: string;
    blunderAnalysis: string;
    tacticalMotif: string;
    masterLesson: string;
  };
  timeRemainingSeconds: number;
  phase: 'Opening' | 'Middlegame' | 'Endgame';
  tags?: string[];
  difficulty?: PuzzleDifficultyTier;
  difficultyElo?: number;
}

export interface PlayerProfile {
  username: string;
  title?: string;
  avatar?: string;
  country?: string;
  blitzRating: number;
  rapidRating: number;
  bulletRating: number;
  totalGames: number;
  overallWinRate: number;
  blunderRate: number; // e.g. 8.4%
  tacticalAccuracy: number; // e.g. 82.5%
  allTimeWins?: number; // Total verified career wins
  brilliantMovesCount?: number; // Total all-time brilliant moves (!!)
  peakRating?: number; // Peak career ELO rating
  topOpenings: OpeningStat[];
  recentPuzzles: TacticalPuzzle[];
  timeTroubleMoveRange: string; // e.g. "Moves 26–36"
}

export interface OpeningStat {
  name: string;
  eco: string;
  games: number;
  winRate: number;
  lossRate: number;
  drawRate: number;
  verdict: 'High Yield' | 'Strong' | 'Needs Audit' | 'Bleeding ELO';
  color: 'White' | 'Black';
}

export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book';

export interface AnalyzedPly {
  plyIndex: number;
  moveNumber: number;
  color: 'white' | 'black';
  notation: string;
  fromSquare: string;
  toSquare: string;
  fen: string;
  evalScore: string;       // e.g. "+3.4", "-1.8", "0.0"
  evalDelta?: string;      // e.g. "-4.2", "+2.5"
  classification: MoveClassification;
  explanation: string;
  bestAlternative?: string;
  pvLine?: string;
  cpLoss?: number;
  engineSource?: 'lichess-cloud' | 'alpha-beta';
  tacticalThreat?: string;
}

export interface ChessComMatch {
  id: string;
  url: string;
  pgn: string;
  timeControl: string;
  timeClass: 'blitz' | 'rapid' | 'bullet' | 'daily';
  endTime: number;
  dateFormatted: string;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
  userColor: 'white' | 'black';
  userWon: boolean | 'draw';
  userResultText: string;
  eco?: string;
  openingName?: string;
}

export interface CoachReport {
  verdict: string;
  summary: string;
  tacticalLeaks: {
    moveNumber: number;
    color: 'white' | 'black';
    notation: string;
    evalDrop: number;
    classification: MoveClassification;
    motif: string;
    refutation: string;
  }[];
  phaseBreakdown: {
    opening: { accuracy: number; commentary: string };
    middlegame: { accuracy: number; commentary: string };
    endgame: { accuracy: number; commentary: string };
  };
  timeDiscipline: {
    assessment: string;
    timePanicMove?: number;
    advice: string;
  };
  arbiterDirectives: string[];
}

export interface FullMatchAnalysis {
  id: string;
  whitePlayer: { name: string; rating: number; title?: string };
  blackPlayer: { name: string; rating: number; title?: string };
  event: string;
  timeControl: string;
  result: string;
  accuracy: { white: number; black: number };
  plies: AnalyzedPly[];
  detectedPuzzles?: TacticalPuzzle[];
  coachReport?: CoachReport;
}
