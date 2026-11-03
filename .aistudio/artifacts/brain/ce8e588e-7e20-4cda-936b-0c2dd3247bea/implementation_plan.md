# ChessPulse Principal Engine & All-Time Telemetry Architecture Plan

## 1. Root Cause Analysis

### Problem 1: Why `Personal Performance & Rating Analysis` showed `99.4%` over `10 PGN games` & `0.0` Blunders
1. **1-Ply Static Comparison Bug in `analyzeMatchForDashboardFast` (`src/services/pgnAnalyzer.ts`)**:
   - Previously, `analyzeMatchForDashboardFast` compared `evaluateBoardStaticCp` immediately before the user's move (`prevStaticCp`) against `evaluateBoardStaticCp` immediately after the user's 1-ply move (`afterStaticCp`) **before the opponent could recapture or reply**.
   - Because almost any capture or piece development increases static material/PST on ply 1 prior to opponent recaptures, `winLoss` was `0` on ~98% of moves, yielding an artificial `99.4%` CAPS2 accuracy and `0.0` blunders.
2. **10-Game Cap & Unused Archive `accuracies` (`src/services/chessComApi.ts` & `src/components/PerformanceDashboard.tsx`)**:
   - `fetchRealPlayerMatchesWithStatus` defaulted to `limit = 10`, and `scanAllTimePlayerArchives` did not extract `rawGame.accuracies.white` / `rawGame.accuracies.black` across all monthly archives or aggregate all-time accuracy and tactical error rates across the player's career.

### Problem 2: Why the Middlegame Misclassified Trades, Decoys, and Pawn Breaks as Mistakes/Blunders
1. **Odd-Ply (Ply 3) Un-Recaptured Horizon Bug in `computeMultiPvTacticalSearch` (`src/services/pgnAnalyzer.ts`)**:
   - `computeMultiPvTacticalSearch` searched 3 half-moves (`depth = 3`) and stopped immediately after a 3rd-ply capture (`counter`) **without resolving recaptures (Quiescence / Static Exchange Evaluation)**.
   - At `fenBefore` (Mover's turn), the mover got the 3rd-ply un-recaptured capture, inflating `evalBefore` by `+300cp` to `+900cp`.
   - At `fenAfter` (Opponent's turn), the **opponent** got the 3rd-ply un-recaptured capture, shifting `evalAfter` by `-300cp` to `-900cp` in the opponent's favor.
   - This created a false `400cp–800cp` evaluation drop on almost every middlegame move whenever piece tension existed on the board.
2. **Lack of Trade, Decoy/Trap, and Middlegame Pawn-Break Recognition**:
   - `classifyMoveChessCom1To1` and `inspectConcreteBoardFacts` did not check whether a capture sequence was an **Equal Trade** (`N=3 vs N/B=3`, `R=5 vs R=5`, `Q=9 vs Q=9`), a **Tactical Decoy / Deflection** (offering a piece on an attacked square where the engine's PV recaptures or wins material), or a **Positional Pawn Break / File-Opening Capture** in the middlegame.

---

## 2. File-by-File Implementation Plan

### A. `/src/services/pgnAnalyzer.ts` — Quiescence Search, Tactical Recognition & Concrete English Explanations
1. **Replace Odd-Ply Horizon with Full Quiescence Capture Resolution (SEE / Quiescence Search)**:
   - Implement `quiescenceSearchCp(chess, alpha, beta, depthLeft)` so every leaf node of `computeMultiPvTacticalSearch` resolves all forcing capture/recapture chains until the position is tactically quiet.
   - Ensure strict sign normalization so `cp` and `mate` from both Stockfish Web Worker (`stockfishBridge`), Lichess Cloud Eval, and the local Quiescence Alpha-Beta search are 100% consistent from the mover's perspective on every ply.
2. **Explicit Detection of Equal Trades, Decoys/Traps, and Middlegame Pawn Breaks**:
   - **Equal Trade Detection (`isEqualTrade`)**: Detect when a player captures a piece of equal value (`N/B=3`, `R=5`, `Q=9`, `P=1`) or initiates a recaptured exchange where net material after the exchange is equal and `winProbLoss <= 6.0%`. Always classify as `best` (`★`), `excellent` (`👍`), or `good` (`✓`) — never `inaccuracy` or `mistake`.
   - **Tactical Decoy / Deflection / Trap Detection (`isDecoyOrTrap`)**: Detect when a player moves a piece/pawn onto an opponent-attacked square (or leaves a piece en prise) while the post-move Quiescence/Stockfish evaluation holds or improves (`winProbLoss <= 2.5%` and `winProbAfter >= 50%`) because the opponent's capture is refuted by a fork, pin, discovered attack, or recapture in the PV. Classify as `brilliant` (`!!`), `great` (`!`), or `best` (`★`).
   - **Middlegame Positional Pawn Breaks & Tolerance Thresholds**:
     - Recognize central/flank pawn breaks and file-opening pawn captures in the middlegame (moves 11–28).
     - Calibrate middlegame `winProbLoss` thresholds:
       - `best` / `excellent` / `good`: `0%` to `9.0%` Win% Loss (`<= 6.5%` for positional pawn breaks/captures is always at least `good`/`excellent`)
       - `inaccuracy (?!)`: `9.0% < winProbLoss <= 15.0%`
       - `mistake (?)`: `15.0% < winProbLoss <= 26.0%`
       - `blunder (??)`: `winProbLoss > 26.0%` (or uncompensated loss of a piece / stepping into forced mate).
3. **Concrete English Move Explanations with Piece Values (`P=1, N=3, B=3, R=5, Q=9`) & PV Sequences**:
   - Rewrite `buildGroundedMoveExplanation` and `inspectConcreteBoardFacts` in crisp, concrete English:
     - **Equal Trade**: *"Trades the knight on f6 for Black's bishop (3 vs 3 pts), simplifying the position while keeping a balanced evaluation (+0.2)."*
     - **Tactical Decoy / Trap**: *"Strong tactical decoy! Places the knight on d5 where capturing it is met by 15. Bc4, recovering the material with a positional advantage."*
     - **Positional Pawn Break / Capture**: *"Captures with the pawn on d5 (1 pt), opening the c-file for the rooks and gaining active central space."*
     - **Real Mistake / Blunder**: State the exact hanging piece or tactical refutation with point values and the engine's best alternative (`Best was ... followed by ...`).
4. **Fix `analyzeMatchForDashboardFast` with Quiescence-Resolved Multi-Ply Evaluation**:
   - Use Official Chess.com `match.officialAccuracy` when present on the match record, and run Quiescence-resolved multi-ply evaluation across every ply so game accuracy (typically `68%–86%`), phase accuracies (Opening / Middlegame / Endgame), and blunder/mistake counts (`1.2–3.5` per game) are 100% realistic.

### B. `/src/services/chessComApi.ts` & `/src/components/PerformanceDashboard.tsx` — All-Time Career Accuracy & Error Telemetry
1. **Extract Official Chess.com Accuracies & PGN Telemetry Across All Monthly Archives (`src/services/chessComApi.ts`)**:
   - In `parseRawArchiveGameToCompactRecord`, extract `rawGame.accuracies.white` and `rawGame.accuracies.black` (when provided by Chess.com) as well as compact PGN move-quality metrics across archived games.
   - Expand `fetchRealPlayerMatchesWithStatus` default limit from `10` to `50` games across recent monthly archives, and aggregate all-time career accuracy, phase accuracies, and blunder/mistake frequencies in `AllTimeCareerAggregate`.
2. **Update `PerformanceDashboard.tsx` to Display True All-Time Career Metrics**:
   - Remove the `10 PGN games` cap and display the real all-time accuracy and blunder/mistake frequency across all scanned career games (e.g., *"Across 1,842 Career Games"*), updating live as the Staged All-Time Career Archive Scanner progresses.
