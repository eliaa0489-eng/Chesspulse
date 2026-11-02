# ChessPulse Upgrade Plan: Instant Showcase Startup, Unified Single-Source Account Sync & Board Flip + Move Badges

## 1. Architectural & Functional Overview

### A. Eliminate Automatic `@Hikaru` Network & Archive Scanning on Startup
- **Zero Initial API Calls**: On initial page load (`analyzedUser === null` and `loggedInUser === null`), neither `PerformanceDashboard` nor `MoveByMoveAnalyzer` will automatically fetch `@Hikaru`'s 1,000+ historical games or trigger `scanAllTimePlayerArchives`.
- **Instant Showcase Demo Mode**:
  - **`PerformanceDashboard`**: Renders an instant, pre-computed Showcase Demo dataset (ELO trajectory curve, Opening/Middlegame/Endgame CAPS2 accuracy breakdown, W/D/L split by White/Black and termination reason, time-control cards, and Opening Repertoire telemetry) with zero network latency and a clear `"Showcase Demo Data"` status pill.
  - **`MoveByMoveAnalyzer`**: Renders the pre-computed `FEATURED_MATCH_ANALYSIS` and an instant set of showcase demo matches in the match selector feed without calling the Chess.com API until the user explicitly connects their account.

### B. Prominent Top Account Input & Single-Source Synchronization
- **High-Visibility Account Input (`HeroSection` + Section Headers)**:
  - Upgrade the top landing page username form in `HeroSection.tsx` with a clear, high-contrast input and primary CTA button (**"Connect & Load My Account"** / **"Account laden & analysieren"**) plus an active connection badge once a username is loaded.
  - Add an inline account connection bar in both `PerformanceDashboard.tsx` and `MoveByMoveAnalyzer.tsx` so users can also enter or switch their Chess.com username directly in those views.
- **Unified Single-Source Account State (`App.tsx`)**:
  - When a user types their Chess.com username and clicks the submit button in the `HeroSection` (or in the Navbar, Dashboard, or Match Analyzer), `App.tsx` updates the shared `connectedUser` state (`analyzedUser` & `loggedInUser`).
  - All sections (`PerformanceDashboard`, `MoveByMoveAnalyzer`, `Navbar`, and `PersonalPuzzlesPage`) immediately synchronize to that single account and start fetching and analyzing the user's real Chess.com games, career statistics, and tactical blunders/puzzles.

### C. Dedicated Board Flip Control & Top-Right Move Evaluation Badges
- **Dedicated `"Flip Board"` Button & Full Orientation Sync (`MoveByMoveAnalyzer.tsx` & `ChesscomBoard.tsx`)**:
  - Upgrade the board toolbar control to a clearly labeled **"Flip Board"** button (`Flip Board ⇅` showing current perspective `White` / `Black`) and add a quick-flip button directly beside the board header.
  - Synchronize the vertical **Live Evaluation Bar** with `isFlipped` (`flex-col` when White is at the bottom, `flex-col-reverse` when Black is at the bottom) so the white and dark evaluation fill bars always match the top/bottom player orientation on screen.
  - Ensure flipping the board cleanly rotates the 8×8 square order (`a8–h1` vs `h1–a8`), rank numbers (`1–8`), file letters (`a–h`), top/bottom player banners, and interactive legal move highlights without resetting or scrambling the active ply or sandbox state.
- **Move Evaluation Badge Always at Top-Right of Moved Piece (`ChesscomBoard.tsx`)**:
  - After every move (both in game replay and in interactive "What-If" sandbox moves), render the circular move-classification badge (`!!`, `!`, `★`, `👍`, `✓`, `📖`, `?!`, `?`, `✖`, `??`) anchored at the **top-right corner** (`-top-1.5 -right-1.5 z-30`) of the destination square (`toSquare`) right beside the moved piece in both standard and flipped board orientations.

---

## 2. File-by-File Implementation Steps

1. **`/src/App.tsx`**
   - Initialize `analyzedUser` and `loggedInUser` to `null` (removing the `'Hikaru'` fallback prop) so the app starts in instant Showcase Demo Mode.
   - Unify `handleAnalyzeUsername` and `handleLoginSuccess` so submitting a username at the top of the landing page (`HeroSection`) or in any component sets the active account across `PerformanceDashboard`, `MoveByMoveAnalyzer`, `Navbar`, and `PersonalPuzzlesPage`.

2. **`/src/components/HeroSection.tsx`**
   - Enhance the top username input and action button (`"Load My Account"` / `"Account laden"`) for unmistakable visual clarity and show an active synced status badge when an account is connected.

3. **`/src/components/PerformanceDashboard.tsx`**
   - Add a pre-computed `SHOWCASE_DEMO_DASHBOARD` dataset used whenever no username has been connected yet (`!username`), preventing any automatic `@Hikaru` API calls or archive scans on startup.
   - Add a prominent inline username input + **"Load My Stats"** button in the dashboard header so users can also trigger or change the synced account directly from the dashboard.

4. **`/src/components/MoveByMoveAnalyzer.tsx` & `/src/components/ChesscomBoard.tsx`**
   - Skip automatic `fetchRealPlayerMatchesWithStatus` on mount when no account is connected; display `FEATURED_MATCH_ANALYSIS` and showcase demo matches until an account is submitted.
   - Make the **"Flip Board"** button prominent in the board toolbar, rotate the top/bottom player strips and vertical Live Evaluation Bar when `isFlipped` is toggled, and keep the move-evaluation badge (`!!`, `!`, `★`, `👍`, `✓`, `📖`, `?!`, `?`, `✖`, `??`) anchored at the top-right corner next to the moved piece on its destination square.
