import { Chess } from 'chess.js';
import { FullMatchAnalysis, AnalyzedPly, MoveClassification } from '../types/chess';

interface RawPlySeed {
  san: string;
  evalScore: string;
  evalDelta?: string;
  classification: MoveClassification;
  bestAlternative?: string;
  pvLine?: string;
  tacticalThreat?: string;
  explanation: string;
}

const rawMoves: RawPlySeed[] = [
  {
    san: 'e4',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '1. e4 c5 2. Nf3 d6',
    explanation: '1. e4 — King’s Pawn Opening. Stakes an immediate claim to d5 and f5 while opening diagonals for the Queen and Bishop (+0.3).',
  },
  {
    san: 'c5',
    evalScore: '+0.2',
    classification: 'book',
    pvLine: '1... c5 2. Nf3 d6 3. d4',
    explanation: '1... c5 — Sicilian Defense. Asymmetrical counter-fight for the d4 square without mirroring White’s structure (+0.2).',
  },
  {
    san: 'Nf3',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '2. Nf3 d6 3. d4 cxd4',
    explanation: '2. Nf3 — Develops the kingside knight toward the center and prepares the d2-d4 central break (+0.3).',
  },
  {
    san: 'd6',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '2... d6 3. d4 cxd4 4. Nxd4',
    explanation: '2... d6 — Controls e5 and prepares the flexible Najdorf/Scheveningen pawn structure (+0.3).',
  },
  {
    san: 'd4',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '3. d4 cxd4 4. Nxd4 Nf6',
    explanation: '3. d4 — Opens the center immediately, trading Black’s c-pawn for White’s d-pawn (+0.3).',
  },
  {
    san: 'cxd4',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '3... cxd4 4. Nxd4 Nf6 5. Nc3',
    explanation: '3... cxd4 — Captures the central pawn and opens the half-open c-file for Black’s rooks (+0.3).',
  },
  {
    san: 'Nxd4',
    evalScore: '+0.4',
    classification: 'book',
    pvLine: '4. Nxd4 Nf6 5. Nc3 a6',
    explanation: '4. Nxd4 — Centralizes the knight on d4 with active influence across the board (+0.4).',
  },
  {
    san: 'Nf6',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '4... Nf6 5. Nc3 a6 6. Be3',
    explanation: '4... Nf6 — Develops with tempo by attacking White’s e4 pawn (+0.3).',
  },
  {
    san: 'Nc3',
    evalScore: '+0.4',
    classification: 'book',
    pvLine: '5. Nc3 a6 6. Be3 e5',
    explanation: '5. Nc3 — Defends e4 naturally and increases control over the critical d5 outpost (+0.4).',
  },
  {
    san: 'a6',
    evalScore: '+0.3',
    classification: 'book',
    pvLine: '5... a6 6. Be3 e5 7. Nb3',
    explanation: '5... a6 — The Najdorf signature move (B90): denies Nb5/Bb5 and prepares ...e5 or ...b5 expansion (+0.3).',
  },
  {
    san: 'Be3',
    evalScore: '+0.4',
    classification: 'book',
    pvLine: '6. Be3 e5 7. Nb3 Be6',
    explanation: '6. Be3 — English Attack setup. Reinforces d4 and prepares f3, Qd2, and queenside castling (+0.4).',
  },
  {
    san: 'e5',
    evalScore: '+0.4',
    classification: 'book',
    pvLine: '6... e5 7. Nb3 Be6 8. f3',
    explanation: '6... e5 — Strikes in the center to kick the d4-knight, accepting a backward d6 pawn and hole on d5 (+0.4).',
  },
  {
    san: 'Nb3',
    evalScore: '+0.4',
    classification: 'best',
    pvLine: '7. Nb3 Be6 8. f3 Be7',
    explanation: '7. Nb3 is the engine’s top choice, retreating to b3 where the knight eyes c5 and d5 while keeping the f-pawn free (+0.4).',
  },
  {
    san: 'Be6',
    evalScore: '+0.4',
    classification: 'good',
    pvLine: '7... Be7 8. f3 Be6 9. Qd2',
    explanation: '7... Be6 is a solid developing move contesting d5 (+0.4, -0.06 CP loss).',
  },
  {
    san: 'f3',
    evalScore: '+0.5',
    classification: 'best',
    pvLine: '8. f3 h5 9. Qd2 Nbd7',
    explanation: '8. f3 blunts ...Ng4 and prepares the g2-g4 kingside pawn storm (+0.5).',
  },
  {
    san: 'Be7',
    evalScore: '+0.4',
    classification: 'good',
    bestAlternative: '8... h5 (+0.3)',
    pvLine: '8... h5 9. Nd5 Nxd5 10. exd5',
    explanation: '8... Be7 prepares kingside castling (-0.12 CP loss); 8... h5 was the sharper engine alternative to slow down g4.',
  },
  {
    san: 'Qd2',
    evalScore: '+0.5',
    classification: 'good',
    pvLine: '9. Qd2 O-O 10. O-O-O Nbd7',
    explanation: '9. Qd2 connects the queen and bishop battery on the c1-h6 diagonal and clears d1 for queenside castling (+0.5).',
  },
  {
    san: 'O-O',
    evalScore: '+0.5',
    classification: 'good',
    bestAlternative: '9... Nbd7 (+0.4)',
    pvLine: '9... Nbd7 10. g4 b5 11. O-O-O',
    explanation: '9... O-O castles into White’s coming kingside storm (-0.10 CP loss), committing to a sharp opposite-side race.',
  },
  {
    san: 'O-O-O',
    evalScore: '+0.6',
    classification: 'best',
    pvLine: '10. O-O-O Nbd7 11. g4 b5',
    explanation: '10. O-O-O completes queenside castling and places the rook directly on the half-open d-file (+0.6).',
  },
  {
    san: 'Nbd7',
    evalScore: '+0.6',
    classification: 'good',
    pvLine: '10... a5 11. Bb5 Nbd7 12. g4',
    explanation: '10... Nbd7 completes minor-piece development and supports ...b5 and ...Nb6 (+0.6).',
  },
  {
    san: 'g4',
    evalScore: '+0.7',
    classification: 'best',
    pvLine: '11. g4 b5 12. g5 Nh5',
    explanation: '11. g4 launches the thematic English Attack bayonet storm against Black’s castled king (+0.7).',
  },
  {
    san: 'b5',
    evalScore: '+0.6',
    classification: 'good',
    pvLine: '11... b5 12. g5 b4 13. Ne2',
    explanation: '11... b5 creates immediate counterplay on the queenside, threatening ...b4 to dislodge the c3-knight (+0.6).',
  },
  {
    san: 'g5',
    evalScore: '+0.7',
    classification: 'best',
    pvLine: '12. g5 b4 13. Ne2 Nh5',
    explanation: '12. g5 drives Black’s knight away from its best defensive post on f6 (+0.7).',
  },
  {
    san: 'b4',
    evalScore: '+0.7',
    classification: 'good',
    pvLine: '12... Nh5 13. Kb1 Nb6 14. Nd5',
    explanation: '12... b4 counter-attacks White’s c3-knight before retreating the f6-knight (+0.7).',
  },
  {
    san: 'Nd5',
    evalScore: '+0.9',
    classification: 'best',
    pvLine: '13. Nd5 Nxd5 14. exd5 Bf5',
    explanation: '13. Nd5 plants the knight powerfully on the d5 outpost (+0.9).',
  },
  {
    san: 'Nxd5',
    evalScore: '+0.8',
    classification: 'good',
    pvLine: '13... Nxd5 14. exd5 Bf5 15. Kb1',
    explanation: '13... Nxd5 eliminates the dominant central knight immediately (+0.8).',
  },
  {
    san: 'exd5',
    evalScore: '+0.9',
    classification: 'best',
    pvLine: '14. exd5 Bf5 15. Bd3 Bxd3',
    explanation: '14. exd5 recaptures with tempo against the e6-bishop and seals the d5 wedge (+0.9).',
  },
  {
    san: 'Bf5',
    evalScore: '+0.9',
    classification: 'good',
    pvLine: '14... Bf5 15. Kb1 a5 16. Bd3',
    explanation: '14... Bf5 activates the bishop along the h7-b1 diagonal targeting c2 (+0.9).',
  },
  {
    san: 'Kb1',
    evalScore: '+0.9',
    classification: 'best',
    pvLine: '15. Kb1 a5 16. Bd3 Bxd3',
    explanation: '15. Kb1! Prophylactic queenside king move stepping off the c-file and defending a2 (+0.9).',
  },
  {
    san: 'a5',
    evalScore: '+0.9',
    classification: 'good',
    pvLine: '15... a5 16. Bd3 Bxd3 17. Qxd3',
    explanation: '15... a5 pushes the a-pawn to support ...a4 against the b3-knight (+0.9).',
  },
  {
    san: 'Bd3',
    evalScore: '+1.0',
    classification: 'good',
    pvLine: '16. Bd3 Bxd3 17. Qxd3 a4',
    explanation: '16. Bd3 neutralizes Black’s active light-squared bishop on f5 (+1.0).',
  },
  {
    san: 'Bxd3',
    evalScore: '+0.9',
    classification: 'good',
    pvLine: '16... Bxd3 17. Qxd3 a4 18. Nc1',
    explanation: '16... Bxd3 trades off the bishops to relieve pressure (+0.9).',
  },
  {
    san: 'Qxd3',
    evalScore: '+1.0',
    classification: 'best',
    pvLine: '17. Qxd3 a4 18. Nd2 Bxg5',
    explanation: '17. Qxd3 centralizes the Queen with eyes on both h7 and the queenside (+1.0).',
  },
  {
    san: 'Bxg5',
    evalScore: '+1.6',
    evalDelta: '+0.6',
    classification: 'inaccuracy',
    bestAlternative: '17... a4 (+0.9)',
    pvLine: '17... a4 18. Nd2 Re8 19. Ne4',
    tacticalThreat: 'Opens the g-file directly against Black’s castled king.',
    explanation: '17... Bxg5?! — Positional inaccuracy (-0.65 pawns). Capturing on g5 opens the g-file directly against Black’s king. Best was 17... a4. Principal Variation: 17... a4 18. Nd2 Re8 19. Ne4.',
  },
  {
    san: 'Bxg5',
    evalScore: '+1.6',
    classification: 'best',
    pvLine: '18. Bxg5 Qxg5 19. Rhg1 Qh6',
    explanation: '18. Bxg5 draws the Black queen out and loosens the d6 and e5 pawns (+1.6).',
  },
  {
    san: 'Qxg5',
    evalScore: '+1.6',
    classification: 'good',
    pvLine: '18... Qxg5 19. Rhg1 Qh6 20. Nd2',
    explanation: '18... Qxg5 recaptures the bishop on g5 (+1.6).',
  },
  {
    san: 'Rhg1',
    evalScore: '+1.9',
    classification: 'best',
    pvLine: '19. Rhg1 Qh6 20. Nd2 Nc5',
    explanation: '19. Rhg1 seizes the half-open g-file with tempo against the Black queen (+1.9).',
  },
  {
    san: 'Qf6',
    evalScore: '+2.8',
    evalDelta: '+0.9',
    classification: 'mistake',
    bestAlternative: '19... Qh6 (+1.8)',
    pvLine: '19... Qh6 20. Nd2 Nc5 21. Qe2',
    tacticalThreat: 'Allows White to reroute the b3-knight via d2 to e4 with tempo on the exposed queen.',
    explanation: '19... Qf6? — Tactical mistake (-0.95 pawns). Placing the queen on f6 steps directly into a knight tempo on e4. Best was 19... Qh6. Principal Variation: 19... Qh6 20. Nd2 Nc5 21. Qe2.',
  },
  {
    san: 'Nd2',
    evalScore: '+3.1',
    evalDelta: '+0.3',
    classification: 'brilliant',
    pvLine: '20. Nd2 Nc5 21. Qe3 Qf4',
    explanation: '20. Nd2!! reroutes the b3-knight toward the dominant e4 outpost while keeping full rook pressure along the g-file (+3.1).',
  },
  {
    san: 'Nc5',
    evalScore: '+3.2',
    classification: 'good',
    pvLine: '20... Nc5 21. Qe3 Qf4 22. Qe2',
    explanation: '20... Nc5 attacks the White queen on d3 to gain counter-tempo (+3.2).',
  },
  {
    san: 'Qe3',
    evalScore: '+3.3',
    classification: 'good',
    pvLine: '21. Qe3 Qf4 22. Qe2 g6',
    explanation: '21. Qe3 sidesteps the knight attack while maintaining pressure on e5 and g5 (+3.3).',
  },
  {
    san: 'Rfc8',
    evalScore: '+5.9',
    evalDelta: '+2.6',
    classification: 'blunder',
    bestAlternative: '21... Qf4 (+3.1)',
    pvLine: '21... Qf4 22. Qe2 g6 23. Ne4',
    tacticalThreat: 'Leaves the f6-queen and kingside undefended against 22. Ne4!',
    explanation: '21... Rfc8?? — Critical blunder (-2.60 pawns). Moving the rook to c8 leaves the f6-queen and kingside undefended against 22. Ne4!. Best was 21... Qf4. Principal Variation: 21... Qf4 22. Qe2 g6 23. Ne4.',
  },
  {
    san: 'Ne4',
    evalScore: '+6.4',
    classification: 'best',
    pvLine: '22. Ne4 Nxe4 23. fxe4 Qf4',
    explanation: '22. Ne4! jumps into e4 with tempo on the Black queen and c5-knight (+6.4).',
  },
  {
    san: 'Nxe4',
    evalScore: '+6.5',
    classification: 'good',
    pvLine: '22... Nxe4 23. fxe4 Qf4 24. Qe2',
    explanation: '22... Nxe4 captures the knight on e4 to avoid immediate material loss (+6.5).',
  },
  {
    san: 'fxe4',
    evalScore: '+6.6',
    classification: 'best',
    pvLine: '23. fxe4 Qf4 24. Qe2 g6',
    explanation: '23. fxe4 opens the f-file for the d1-rook to join the decisive kingside attack (+6.6).',
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
    const symbolSuffix =
      seed.classification === 'blunder'
        ? '??'
        : seed.classification === 'mistake'
        ? '?'
        : seed.classification === 'inaccuracy'
        ? '?!'
        : seed.classification === 'brilliant'
        ? '!!'
        : '';
    const notation =
      color === 'white'
        ? `${moveNumber}. ${seed.san}${symbolSuffix}`
        : `${moveNumber}... ${seed.san}${symbolSuffix}`;

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
      pvLine: seed.pvLine,
      engineSource: 'lichess-cloud',
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
