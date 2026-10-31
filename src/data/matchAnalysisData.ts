import { Chess } from 'chess.js';
import { FullMatchAnalysis, AnalyzedPly, MoveClassification } from '../types/chess';

interface RawPlySeed {
  san: string;
  evalScore: string;
  evalDelta?: string;
  classification: MoveClassification;
  bestAlternative?: string;
  tacticalThreat?: string;
  explanation: string;
}

const rawMoves: RawPlySeed[] = [
  {
    san: 'e4',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'King’s Pawn Opening. Stakes an immediate claim to d5 and f5 while opening diagonals for the Queen and Bishop.',
  },
  {
    san: 'c5',
    evalScore: '+0.2',
    classification: 'book',
    explanation: 'Sicilian Defense. Asymmetrical counter-fight for the d4 square without mirroring White’s structure.',
  },
  {
    san: 'Nf3',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'Develops the kingside knight toward the center and prepares d2-d4.',
  },
  {
    san: 'd6',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'Controls e5 and prepares the flexible Najdorf/Scheveningen pawn structure.',
  },
  {
    san: 'd4',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'Opens the center immediately, trading Black’s c-pawn for White’s d-pawn.',
  },
  {
    san: 'cxd4',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'Captures the central pawn and opens the half-open c-file for Black’s rooks.',
  },
  {
    san: 'Nxd4',
    evalScore: '+0.4',
    classification: 'book',
    explanation: 'Centralizes the knight on an active square with wide influence.',
  },
  {
    san: 'Nf6',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'Develops with tempo by attacking White’s e4 pawn.',
  },
  {
    san: 'Nc3',
    evalScore: '+0.4',
    classification: 'book',
    explanation: 'Defends e4 naturally and increases control over the critical d5 outpost.',
  },
  {
    san: 'a6',
    evalScore: '+0.3',
    classification: 'book',
    explanation: 'The Najdorf signature move (B90): denies Nb5/Bb5 and prepares ...e5 or ...b5 expansion.',
  },
  {
    san: 'Be3',
    evalScore: '+0.4',
    classification: 'book',
    explanation: 'English Attack setup. Reinforces d4 and prepares f3, Qd2, and queenside castling.',
  },
  {
    san: 'e5',
    evalScore: '+0.4',
    classification: 'book',
    explanation: 'Strikes in the center to kick the d4-knight, accepting a backward d6 pawn and hole on d5.',
  },
  {
    san: 'Nb3',
    evalScore: '+0.4',
    classification: 'best',
    explanation: 'Retreats to b3 where the knight eyes c5 and d5 while keeping the f-pawn free to advance.',
  },
  {
    san: 'Be6',
    evalScore: '+0.4',
    classification: 'best',
    explanation: 'Develops the light-squared bishop to contest the critical d5 square.',
  },
  {
    san: 'f3',
    evalScore: '+0.5',
    classification: 'best',
    explanation: 'Blunts Ng4 and prepares the g2-g4 kingside pawn storm.',
  },
  {
    san: 'Be7',
    evalScore: '+0.4',
    classification: 'good',
    explanation: 'Prepares kingside castling; 8...h5 was a sharper modern alternative to slow down g4.',
  },
  {
    san: 'Qd2',
    evalScore: '+0.5',
    classification: 'best',
    explanation: 'Connects the queen and bishop battery and clears d1 for queenside castling.',
  },
  {
    san: 'O-O',
    evalScore: '+0.5',
    classification: 'good',
    explanation: 'Castles into White’s coming kingside storm, committing to a sharp opposite-side race.',
  },
  {
    san: 'O-O-O',
    evalScore: '+0.6',
    classification: 'best',
    explanation: '10. O-O-O! Completes queenside castling and places the rook directly on the half-open d-file.',
  },
  {
    san: 'Nbd7',
    evalScore: '+0.6',
    classification: 'best',
    explanation: 'Completes minor-piece development and supports ...b5 and ...Nb6.',
  },
  {
    san: 'g4',
    evalScore: '+0.7',
    classification: 'best',
    explanation: 'Launches the thematic English Attack bayonet storm against Black’s kingside.',
  },
  {
    san: 'b5',
    evalScore: '+0.6',
    classification: 'best',
    explanation: 'Immediate counterplay on the queenside, threatening ...b4 to dislodge the c3-knight.',
  },
  {
    san: 'g5',
    evalScore: '+0.7',
    classification: 'best',
    explanation: 'Drives Black’s knight away from its best defensive post on f6.',
  },
  {
    san: 'b4',
    evalScore: '+0.7',
    classification: 'best',
    explanation: 'Counter-attacking White’s c3-knight before retreating the f6-knight.',
  },
  {
    san: 'Nd5',
    evalScore: '+0.9',
    classification: 'best',
    explanation: 'Plants the knight powerfully on the d5 outpost.',
  },
  {
    san: 'Nxd5',
    evalScore: '+0.8',
    classification: 'best',
    explanation: 'Eliminates the dominant central knight immediately.',
  },
  {
    san: 'exd5',
    evalScore: '+0.9',
    classification: 'best',
    explanation: 'Recaptures with tempo against the e6-bishop and seals the d5 wedge.',
  },
  {
    san: 'Bf5',
    evalScore: '+0.9',
    classification: 'best',
    explanation: 'Activates the bishop along the h7-b1 diagonal targeting c2.',
  },
  {
    san: 'Kb1',
    evalScore: '+0.9',
    classification: 'best',
    explanation: '15. Kb1! Prophylactic queenside king move stepping off the c-file and defending a2.',
  },
  {
    san: 'a5',
    evalScore: '+0.9',
    classification: 'good',
    explanation: 'Pushes the a-pawn to support ...a4 against the b3-knight.',
  },
  {
    san: 'Bd3',
    evalScore: '+1.0',
    classification: 'best',
    explanation: 'Neutralizes Black’s active light-squared bishop on f5.',
  },
  {
    san: 'Bxd3',
    evalScore: '+0.9',
    classification: 'best',
    explanation: 'Trades off the bishops to relieve pressure.',
  },
  {
    san: 'Qxd3',
    evalScore: '+1.0',
    classification: 'best',
    explanation: 'Centralizes the Queen with eyes on both h7 and the queenside.',
  },
  {
    san: 'Bxg5',
    evalScore: '+1.6',
    evalDelta: '+0.6',
    classification: 'inaccuracy',
    bestAlternative: '17... a4 (+0.9)',
    tacticalThreat: 'Opens the g-file directly against Black’s castled king.',
    explanation: '17...Bxg5?! is greedy—it opens the g-file and surrenders dark-square control around Black’s king.',
  },
  {
    san: 'Bxg5',
    evalScore: '+1.6',
    classification: 'best',
    explanation: 'Draws the Black queen out and loosens the d6 and e5 pawns.',
  },
  {
    san: 'Qxg5',
    evalScore: '+1.6',
    classification: 'best',
    explanation: 'Forced recapture.',
  },
  {
    san: 'Rhg1',
    evalScore: '+1.9',
    classification: 'best',
    explanation: 'Seizes the half-open g-file with tempo against the Black queen.',
  },
  {
    san: 'Qf6',
    evalScore: '+2.4',
    evalDelta: '+0.5',
    classification: 'mistake',
    bestAlternative: '19... Qh6 (+1.8)',
    tacticalThreat: 'Allows White to reroute the b3-knight via d2 to e4 with tempo.',
    explanation: '19...Qf6? steps onto a vulnerable square where White can coordinate Nd2-e4 with tempo.',
  },
  {
    san: 'Nd2',
    evalScore: '+3.1',
    evalDelta: '+0.7',
    classification: 'brilliant',
    explanation: '20. Nd2!! Reroutes the b3-knight toward the dominant e4 outpost while keeping full rook pressure.',
  },
  {
    san: 'Nc5',
    evalScore: '+3.2',
    classification: 'good',
    explanation: 'Attacks the White queen on d3 to gain counter-tempo.',
  },
  {
    san: 'Qe3',
    evalScore: '+3.3',
    classification: 'best',
    explanation: 'Sidesteps the knight attack while maintaining pressure on e5 and g5.',
  },
  {
    san: 'Rfc8',
    evalScore: '+5.9',
    evalDelta: '+2.6',
    classification: 'blunder',
    bestAlternative: '21... Qf4 (+3.1)',
    tacticalThreat: 'Leaves the f6-queen and kingside undefended against 22. Ne4!',
    explanation: '21...Rfc8?? leaves the kingside undefended against 22. Ne4! and a decisive g-file invasion.',
  },
  {
    san: 'Ne4',
    evalScore: '+6.4',
    classification: 'best',
    explanation: '22. Ne4! Jumps into e4 with tempo on the Black queen and c5-knight.',
  },
  {
    san: 'Nxe4',
    evalScore: '+6.5',
    classification: 'best',
    explanation: 'Forced capture to avoid losing material immediately.',
  },
  {
    san: 'fxe4',
    evalScore: '+6.6',
    classification: 'best',
    explanation: 'Opens the f-file for the d1-rook to join the decisive kingside attack.',
  },
];

function buildFeaturedMatchAnalysis(): FullMatchAnalysis {
  const chess = new Chess();
  const plies: AnalyzedPly[] = [];

  rawMoves.forEach((seed, index) => {
    const moveObj = chess.move(seed.san);
    const fen = chess.fen();
    const moveNumber = Math.floor(index / 2) + 1;
    const color: 'white' | 'black' = index % 2 === 0 ? 'white' : 'black';
    const notation =
      color === 'white' ? `${moveNumber}. ${seed.san}` : `${moveNumber}... ${seed.san}`;

    plies.push({
      plyIndex: index,
      moveNumber,
      color,
      notation,
      fromSquare: moveObj ? moveObj.from : 'e2',
      toSquare: moveObj ? moveObj.to : 'e4',
      fen,
      evalScore: seed.evalScore,
      evalDelta: seed.evalDelta,
      classification: seed.classification,
      explanation: seed.explanation,
      bestAlternative: seed.bestAlternative,
      tacticalThreat: seed.tacticalThreat,
    });
  });

  return {
    id: 'featured-najdorf-english-attack',
    whitePlayer: { name: 'Hikaru', rating: 2875, title: 'GM' },
    blackPlayer: { name: 'viktor_k', rating: 2690, title: 'GM' },
    event: 'Chess.com Rapid Arena • Sicilian Najdorf (B90)',
    timeControl: 'Rapid 10+0',
    result: '1-0',
    accuracy: { white: 94.2, black: 78.4 },
    plies,
    coachReport: {
      verdict: 'Clinical English Attack — Punishing 17...Bxg5?! and 21...Rfc8??',
      summary:
        'White executed a model Sicilian Najdorf English Attack (6. Be3, 8. f3, 10. O-O-O, 15. Kb1!). After Black’s greedy 17...Bxg5?! opened the g-file and 19...Qf6? stepped into a knight tempo, White’s 20. Nd2!! and 22. Ne4! forced a decisive kingside breakthrough.',
      tacticalLeaks: [
        {
          moveNumber: 17,
          color: 'black',
          notation: '17... Bxg5?!',
          evalDrop: 0.6,
          classification: 'inaccuracy',
          motif: 'Opening King-File Line',
          refutation: '17... a4 (+0.9)',
        },
        {
          moveNumber: 19,
          color: 'black',
          notation: '19... Qf6?',
          evalDrop: 0.5,
          classification: 'mistake',
          motif: 'Exposed Queen Target',
          refutation: '19... Qh6 (+1.8)',
        },
        {
          moveNumber: 21,
          color: 'black',
          notation: '21... Rfc8??',
          evalDrop: 2.6,
          classification: 'blunder',
          motif: 'Uncontested Central Outpost (e4)',
          refutation: '21... Qf4 (+3.1)',
        },
      ],
      phaseBreakdown: {
        opening: {
          accuracy: 96.4,
          commentary:
            'Accurate English Attack setup (6. Be3, 8. f3, 10. O-O-O) followed by prophylactic 15. Kb1! stepping off the c-file.',
        },
        middlegame: {
          accuracy: 92.8,
          commentary:
            'Immediate exploitation of the open g-file with 19. Rhg1 and the knight reroute 20. Nd2!! -> 22. Ne4!.',
        },
        endgame: {
          accuracy: 93.5,
          commentary:
            'After 23. fxe4 (+6.6), White commands both the g-file and f-file with an unstoppable heavy-piece attack.',
        },
      },
      timeDiscipline: {
        assessment: 'Balanced move pacing across the critical middlegame transition (Moves 15–23).',
        advice: 'Never capture flank pawns in front of your castled king when it opens a rook file for the opponent.',
      },
      arbiterDirectives: [
        'Play prophylactic king safety moves (15. Kb1!) in opposite-side castling before launching final piece sacrifices.',
        'Reroute passive knights (20. Nd2!! -> 22. Ne4!) once central outposts become available.',
        'Avoid greedy pawn captures like 17...Bxg5?! that open the g-file directly toward your own king.',
      ],
    },
  };
}

export const FEATURED_MATCH_ANALYSIS: FullMatchAnalysis = buildFeaturedMatchAnalysis();
export const featuredMatchAnalysis: FullMatchAnalysis = FEATURED_MATCH_ANALYSIS;
