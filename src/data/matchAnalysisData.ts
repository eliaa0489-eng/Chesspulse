import { FullMatchAnalysis, AnalyzedPly } from '../types/chess';
import { Chess } from 'chess.js';

// Construct match plies with authentic chess logic using chess.js
function buildMatchPlies(): AnalyzedPly[] {
  const chess = new Chess();

  const rawMoves: {
    san: string;
    classification: AnalyzedPly['classification'];
    evalScore: string;
    evalDelta?: string;
    explanation: string;
    bestAlternative?: string;
    tacticalThreat?: string;
  }[] = [
    // Move 1
    {
      san: 'e4',
      classification: 'book',
      evalScore: '+0.2',
      explanation: 'King Pawn Opening: Direct stake in the center, freeing lines for queen and light-squared bishop.',
    },
    {
      san: 'c5',
      classification: 'book',
      evalScore: '+0.2',
      explanation: 'Sicilian Defense: The most combative response to 1.e4, fighting for central asymmetry.',
    },
    // Move 2
    {
      san: 'Nf3',
      classification: 'book',
      evalScore: '+0.2',
      explanation: 'Open Sicilian preparation: Developing towards the center and preparing d4.',
    },
    {
      san: 'd6',
      classification: 'book',
      evalScore: '+0.2',
      explanation: 'Controls e5 and prepares Nf6 without allowing early e5 pawn thrusts.',
    },
    // Move 3
    {
      san: 'd4',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Liquidating central pawns to gain open c and d files for rapid piece activity.',
    },
    {
      san: 'cxd4',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Trading a flank c-pawn for White\'s central d-pawn.',
    },
    // Move 4
    {
      san: 'Nxd4',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Recapturing with the knight on an aggressive central outpost.',
    },
    {
      san: 'Nf6',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Developing with tempo against White\'s undefended e4 pawn.',
    },
    // Move 5
    {
      san: 'Nc3',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Natural defense of e4 while adding a second piece to central influence.',
    },
    {
      san: 'a6',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Najdorf Variation: Denying b5 to White\'s knights and bishops while preparing ...b5.',
    },
    // Move 6
    {
      san: 'Be3',
      classification: 'best',
      evalScore: '+0.4',
      explanation: 'English Attack: White prepares f3, Qd2, and O-O-O for a fierce opposite-side castling race.',
    },
    {
      san: 'e5',
      classification: 'book',
      evalScore: '+0.4',
      explanation: 'Classic Najdorf central strike, kicking the d4 knight at the cost of a backward d6 pawn.',
    },
    // Move 7
    {
      san: 'Nb3',
      classification: 'best',
      evalScore: '+0.4',
      explanation: 'Retreating out of harm\'s way while maintaining surveillance over the c5 and d4 squares.',
    },
    {
      san: 'Be6',
      classification: 'good',
      evalScore: '+0.3',
      explanation: 'Developing the light-squared bishop to reinforce the d5 hole.',
    },
    // Move 8
    {
      san: 'f3',
      classification: 'best',
      evalScore: '+0.4',
      explanation: 'Crucial glue move in the English Attack, guarding g4 against ...Ng4 ideas.',
    },
    {
      san: 'Be7',
      classification: 'book',
      evalScore: '+0.3',
      explanation: 'Preparing kingside castling and keeping options open on the queenside.',
    },
    // Move 9
    {
      san: 'Qd2',
      classification: 'best',
      evalScore: '+0.5',
      explanation: 'Forming a lethal battery on the c1-h6 diagonal and paving the way for queenside castling.',
    },
    {
      san: 'O-O',
      classification: 'best',
      evalScore: '+0.4',
      explanation: 'Getting the Black monarch into safety before the center blows open.',
    },
    // Move 10
    {
      san: 'O-O-O',
      classification: 'best',
      evalScore: '+0.5',
      explanation: 'Opposite-sides castling initiated. The race is on: White storms kingside, Black storms queenside.',
    },
    {
      san: 'Nbd7',
      classification: 'best',
      evalScore: '+0.5',
      explanation: 'Preparing ...b5 and ...Nb6 to generate counterplay along the half-open c-file.',
    },
    // Move 11
    {
      san: 'g4',
      classification: 'best',
      evalScore: '+0.6',
      explanation: 'The pawn storm begins. Threatening g5 to evict Black\'s key defender on f6.',
    },
    {
      san: 'b5',
      classification: 'best',
      evalScore: '+0.5',
      explanation: 'Black counter-strikes immediately on the flank to disturb White\'s c3 knight.',
    },
    // Move 12
    {
      san: 'g5',
      classification: 'best',
      evalScore: '+0.7',
      explanation: 'Pushing the tempo. Evicting the knight from f6 to compromise Black\'s king defenses.',
    },
    {
      san: 'b4',
      classification: 'best',
      evalScore: '+0.7',
      explanation: 'Counter-attack! Ignoring passive defense to dislodge White\'s c3 defender.',
    },
    // Move 13
    {
      san: 'Ne2',
      classification: 'best',
      evalScore: '+0.8',
      explanation: 'Rerouting the knight towards g3 or d4 while keeping the d-file open for the heavy rook.',
    },
    {
      san: 'Ne8',
      classification: 'inaccuracy',
      evalScore: '+1.4',
      evalDelta: '+0.6',
      explanation: 'Inaccuracy (?!): Passive retreat. Stockfish strongly preferred 13... Nh5, blockading White\'s kingside pawn march.',
      bestAlternative: '13... Nh5',
      tacticalThreat: 'White gains uncontested space on the kingside to launch a direct breakthrough.',
    },
    // Move 14
    {
      san: 'h4',
      classification: 'best',
      evalScore: '+1.6',
      explanation: 'Best Move: Reinforcing g5 and opening the rook\'s vertical file for an h5-h6 battering ram.',
    },
    {
      san: 'a5',
      classification: 'best',
      evalScore: '+1.5',
      explanation: 'Black rushes to open lines against the White king with ...a4.',
    },
    // Move 15
    {
      san: 'Kb1',
      classification: 'best',
      evalScore: '+1.8',
      explanation: 'Prophylactic king step stepping off the open c-file before Black\'s rooks arrive.',
    },
    {
      san: 'a4',
      classification: 'best',
      evalScore: '+1.7',
      explanation: 'Pushing White\'s b3 knight out of position.',
    },
    // Move 16
    {
      san: 'Nbd4',
      classification: 'brilliant',
      evalScore: '+3.4',
      evalDelta: '+1.7',
      explanation: 'Brilliant Move (!!): An intuitive piece sacrifice! White sacrifices the knight to shatter Black\'s pawn fortress on e5 and d6, opening highway lines to Black\'s king.',
      bestAlternative: '16. Nbd4 (Only winning sacrifice)',
      tacticalThreat: 'Threatens 17. Nc6 trapping or severely compromising Black\'s queen on d8.',
    },
    {
      san: 'exd4',
      classification: 'best',
      evalScore: '+3.4',
      explanation: 'Forced capture. Allowing 17. Nc6 would have instantly suffocated the position.',
    },
    // Move 17
    {
      san: 'Nxd4',
      classification: 'best',
      evalScore: '+3.6',
      explanation: 'Recapturing with dynamic threats against c6 and e6. Black is hanging on by a thread.',
    },
    {
      san: 'Qc7',
      classification: 'mistake',
      evalScore: '+5.2',
      evalDelta: '+1.6',
      explanation: 'Mistake (?): 17... Qc7 allows White to eliminate the key e6 bishop and infiltrate the light squares.',
      bestAlternative: '17... Ne5 (Defending d7 and covering vital squares)',
      tacticalThreat: 'Weakens Black\'s entire kingside pawn chain and leaves e6 fatally exposed.',
    },
    // Move 18
    {
      san: 'Nxe6',
      classification: 'best',
      evalScore: '+5.4',
      explanation: 'Decimating Black\'s primary defensive anchor and shattering the pawn structure.',
    },
    {
      san: 'fxe6',
      classification: 'best',
      evalScore: '+5.4',
      explanation: 'Only recapture available.',
    },
    // Move 19
    {
      san: 'Bh3',
      classification: 'best',
      evalScore: '+5.8',
      explanation: 'Targeting the isolated, backward e6 pawn with unstoppable pressure.',
    },
    {
      san: 'Rxf3',
      classification: 'inaccuracy',
      evalScore: '+6.6',
      evalDelta: '+0.8',
      explanation: 'Inaccuracy (?!): Desperation counter-strike. Grabbing f3 does not resolve the fatal weaknesses on e6 and d6.',
      bestAlternative: '19... Nc5',
      tacticalThreat: 'White can capture on e6 with check, dismantling Black\'s king completely.',
    },
    // Move 20 - Critical Blunder Moment!
    {
      san: 'Be3',
      classification: 'blunder',
      evalScore: '+1.2',
      evalDelta: '-5.4',
      explanation: 'Blunder (??): Under sudden time pressure (only 14 seconds left on clock), White froze and retreated passively with 20. Be3??, throwing away a +6.6 winning advantage! The decisive blow was 20. Bxe6+! Kh8 21. Bd4! leading to immediate mate.',
      bestAlternative: '20. Bxe6+ Kh8 21. Bd4! (+6.6)',
      tacticalThreat: 'Allows Black to stabilize with ...d5 or ...Ne5, escaping the fatal mating net.',
    },
  ];

  const plies: AnalyzedPly[] = [];

  for (let i = 0; i < rawMoves.length; i++) {
    const raw = rawMoves[i];
    const isWhite = i % 2 === 0;
    const moveNumber = Math.floor(i / 2) + 1;

    try {
      const moveResult = chess.move(raw.san);
      if (moveResult) {
        plies.push({
          plyIndex: i,
          moveNumber,
          color: isWhite ? 'white' : 'black',
          notation: `${moveNumber}${isWhite ? '.' : '...'} ${raw.san}`,
          fromSquare: moveResult.from,
          toSquare: moveResult.to,
          fen: chess.fen(),
          evalScore: raw.evalScore,
          evalDelta: raw.evalDelta,
          classification: raw.classification,
          explanation: raw.explanation,
          bestAlternative: raw.bestAlternative,
          tacticalThreat: raw.tacticalThreat,
        });
      }
    } catch {
      // If move fails validation, skip
    }
  }

  return plies;
}

export const FEATURED_MATCH_ANALYSIS: FullMatchAnalysis = {
  id: 'match-fischer-sicilian-2026',
  whitePlayer: {
    name: 'Alex_Chen',
    rating: 1842,
    title: 'Club Master',
  },
  blackPlayer: {
    name: 'GrandMaster_V',
    rating: 1845,
  },
  event: 'ChessPulse Rated Match · Sicilian Najdorf',
  timeControl: 'Blitz 3+2',
  result: '1-0 (White converted after blunder recovery)',
  accuracy: {
    white: 88.4,
    black: 79.1,
  },
  plies: buildMatchPlies(),
  coachReport: {
    verdict: 'Decisive Tactical Slip on Move 20',
    summary: 'A single severe calculation error on Move 20 (20. Be3??) converted White\'s commanding +6.6 advantage into a precarious +1.2 contest. While White ultimately salvaged the full point through aggressive counterplay, relying on opponent missteps in tournament play is unsustainable.',
    tacticalLeaks: [
      {
        moveNumber: 20,
        color: 'white',
        notation: '20. Be3??',
        evalDrop: 5.4,
        classification: 'blunder',
        motif: 'Overlooked tactical pin and surrendered decisive central knight outpost',
        refutation: '20. Nd5! (+6.6) paralyzed Black\'s position and forced immediate material resignation.',
      },
      {
        moveNumber: 15,
        color: 'white',
        notation: '15. Kh1?!',
        evalDrop: 0.6,
        classification: 'inaccuracy',
        motif: 'Passive king step wasting tempo while king was in no direct diagonal danger',
        refutation: '15. f4! immediately expanded kingside spatial control.',
      },
    ],
    phaseBreakdown: {
      opening: {
        accuracy: 94,
        commentary: 'Mainline Sicilian Najdorf theory executed with high precision.',
      },
      middlegame: {
        accuracy: 78,
        commentary: 'Severe calculation lapse under tactical tension on Move 20.',
      },
      endgame: {
        accuracy: 91,
        commentary: 'Clinical king and rook conversion with zero counterplay allowed.',
      },
    },
    timeDiscipline: {
      assessment: '38.4s freeze on Move 20 followed by instantaneous blunder execution.',
      timePanicMove: 20,
      advice: 'When spending more than 25 seconds in Blitz, enforce a mandatory check: identify candidate move, check checks and captures, and do not execute an uncalculated novelty.',
    },
    arbiterDirectives: [
      'Stop Rushing After Long Thinks: A long think followed by an impulsive move is the #1 rating bleed at the 1800 level.',
      'Audit Loose Pieces: Ensure Be3 is guarded before giving Black d5 counterplay.',
      'Ruthless Conversion: When holding +6.0, play concrete simplifications (Nd5), not ambiguous developing moves.',
    ],
  },
};
