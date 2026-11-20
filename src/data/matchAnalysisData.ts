import { FullMatchAnalysis } from '../types/chess';
import { parseAndAnalyzePgn } from '../services/pgnAnalyzer';

export const FEATURED_SHOWCASE_PGN = `[Event "Chess.com Rapid Arena • Sicilian Najdorf (B90)"]
[Site "Chess.com"]
[Date "2025.02.18"]
[Round "1"]
[White "Hikaru"]
[Black "viktor_k"]
[Result "1-0"]
[WhiteElo "2875"]
[BlackElo "2690"]
[TimeControl "600"]
[ECO "B90"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5 12. g5 b4 13. Nd5 Nxd5 14. exd5 Bf5 15. Kb1 a5 16. Bd3 Bxd3 17. Qxd3 Bxg5 18. Bxg5 Qxg5 19. Rhg1 Qf6 20. Nd2 Nc5 21. Qe3 Rfc8 22. Ne4 Nxe4 23. fxe4 1-0`;

function buildFeaturedMatchAnalysis(): FullMatchAnalysis {
  const analyzed = parseAndAnalyzePgn(
    FEATURED_SHOWCASE_PGN,
    'featured-najdorf-english-attack'
  );

  if (!analyzed) {
    throw new Error('Failed to build Featured Sicilian Najdorf match analysis via Classification V2 pipeline');
  }

  return {
    ...analyzed,
    whitePlayer: { ...analyzed.whitePlayer, title: 'GM' },
    blackPlayer: { ...analyzed.blackPlayer, title: 'GM' },
    timeControl: 'Rapid 10+0',
  };
}

export const FEATURED_MATCH_ANALYSIS: FullMatchAnalysis = buildFeaturedMatchAnalysis();
export const featuredMatchAnalysis: FullMatchAnalysis = FEATURED_MATCH_ANALYSIS;
