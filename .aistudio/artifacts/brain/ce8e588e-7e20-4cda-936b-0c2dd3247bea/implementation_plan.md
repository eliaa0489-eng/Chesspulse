# ChessPulse — Architectural & Visual Overhaul Plan

## User Review & Critical Decisions

- **Hero 3D Centerpiece Replacement (Strict Rule)**:
  - **Complete Removal of Habit-Tracker Artifacts**: Strip out all lingering template artifacts inside the iPhone 16 Pro showcase—including the cartoon pear/sprout mascot, any hardcoded personal names (such as `"Elia"` or `"Sam"`), generic mood buttons (`"How are you feeling today?"`), and unrelated `"Food"` or `"Activity"` dashboard cards.
  - **Nameless Sculptural 3D Matte-Black King Centerpiece**: Replace the removed graphic with a sleek, minimalist **3D matte-black King chess piece** rendered with high-end studio rim lighting and soft contact shadows. The centerpiece has **no name or persona label**—it exists purely for visual presence, sculptural character, and brand aesthetics.
  - **Grandmaster-Grade Engine Telemetry**: Surround the 3D matte-black King centerpiece inside the mobile UI with live, grandmaster-grade engine telemetry—specifically **real-time centipawn evaluation (`+1.45 cp`)**, **engine search depth indicators (`Depth 32/40 • NNUE`)**, and **precise win-rate percentages (`Win 68.4% • Draw 24.1% • Loss 7.5%`)** alongside opening book & tactical accuracy cards.
- **Interactive Analyzer Board Behavior**: Dragging or clicking pieces on the match analyzer board will power an **Interactive What-If Sandbox with instant FEN updates and a reset button**, allowing users to explore alternative tactical continuations from any PGN ply while enforcing strict turn-based move rules and legal target indicators.

---

## 1. Overview & Core Concept

**ChessPulse** is a precision chess telemetry and Stockfish-grade match review platform built to Apple and Stripe aesthetic standards. This overhaul eliminates all non-chess template remnants, introduces a nameless sculptural 3D matte-black King centerpiece inside the iPhone 16 Pro hero frame, stabilizes piece rendering and legal move physics across the interactive chessboard, and hardens the Chess.com data ingestion pipeline through a dedicated server-side proxy.

Core pillars of this upgrade:
1. **Nameless 3D Matte-Black King Studio Centerpiece & Live Telemetry**: A pure, sculptural 3D matte-black Staunton King rendered with studio specular lighting and soft floor shadows—carrying no name or text label—paired with real-time centipawn evaluation, Stockfish depth indicators, and W/D/L win-rate percentage telemetry inside the iPhone 16 Pro Titanium showcase.
2. **Zero-Glitch Board Physics & What-If Sandbox**: Rock-solid HTML5 drag-and-drop and click-to-move execution with glowing legal destination dots, capture rings, automatic pawn promotion handling, strict turn-lock enforcement (`White` moves only on White's turn; `Black` moves only on Black's turn), and an instant **What-If Sandbox** mode with one-click reset back to the official PGN game line.
3. **Server-Side Chess.com API Proxy**: An Express backend proxy (`/api/chesscom/...`) that normalizes handles (`.trim().toLowerCase()`), URL-encodes parameters, attaches a compliant `User-Agent: ChessPulse-App/1.0` header, and returns structured status codes (`404` Not Found, `429` Rate Limit) for clean UI error states.
4. **Landing Page & Navigation Polish**: Crisp typographic hierarchy, tabular numerals (`tabular-nums`) across all evaluation metrics, zero navy-blue artifacts, smooth Framer Motion scroll-reveal animations, and instantaneous top-of-page smooth scrolling (`window.scrollTo({ top: 0, behavior: 'smooth' })`) when clicking **Overview** or the **ChessPulse** brand mark.

---

## 2. User Experience & Visual Design

- **Aesthetic Direction & Color Palette**:
  - **Surfaces**: Pure Alabaster & Crisp White (`#FFFFFF` / `#F8FAFC`) with `1px solid` hairline slate borders (`#E2E8F0`).
  - **Tactical Accents**: Deep Forest Green (`#0B1912`) and Emerald (`#10B981` / `#059669`) for primary actions, engine telemetry badges, and legal move indicators.
  - **Semantic Evaluation Badges**: Cyan (`#06B6D4`) for Brilliant (`!!`), Emerald (`#10B981`) for Best (`★`), Amber (`#F59E0B`) for Inaccuracy (`?!`), Orange (`#F97316`) for Mistake (`?`), and Rose (`#F43F5E`) for Blunder (`??`).
- **iPhone 16 Pro Showcase — 3D Matte-Black King & Engine Telemetry**:
  - **Zero Personal Names or Mascot Labels**: The header displays clean, universal chess telemetry (`Engine Active • Stockfish 16.1 NNUE`, `Depth 32`, and `96.4% Precision` badge) with no user names (`"Elia"`, `"Sam"`, etc.) and no mascot titles.
  - **Sculptural 3D Matte-Black King Stage**: A multi-layered 3D render of a carved obsidian-matte Staunton King piece with studio rim highlights, subtle ambient levitation, and a soft elliptical floor shadow—standing purely as a visual icon for character and craftsmanship.
  - **Live Grandmaster Telemetry Strip**: Directly below the 3D piece, an interactive telemetry panel displays:
    - **Real-Time Centipawn Evaluation**: e.g., `+1.45 cp` with dynamic evaluation bar fill.
    - **Depth & Nodes Indicator**: e.g., `Depth 32/40 • 4.8M nodes/s`.
    - **Precise Win-Rate Percentages**: Segmented W/D/L probability bar (`68.4% White • 24.1% Draw • 7.5% Black`) that updates interactively when switching between critical tactical phases (*Opening Book*, *Center Control*, *King Safety*, *Endgame Tablebase*).
  - **Bottom Telemetry Cards**: Two crisp chess analytics cards—**Centipawn Loss (`11.2 ACPL`)** and **Win Probability (`68.4% W`)**—replacing the old `"Food"` and `"Activity"` placeholders.
- **Interactive Board & What-If Sandbox UX**:
  - Clicking or dragging a piece belonging to the active turn highlights the origin square and renders glowing emerald target dots on empty legal squares and crisp target rings around capturable opponent pieces.
  - Playing a legal move on the analyzer board immediately transitions the board into **What-If Sandbox Mode**, updating the FEN state, recalculating the live centipawn evaluation bar, triggering tactile Web Audio synthesis cues, and displaying an emerald `"What-If Sandbox Active • Reset to Match Line"` control bar.

---

## 3. Key Product Decisions & Trade-Offs

- **Strict Turn-Lock vs. Free-For-All Board Editing**:
  - *Decision*: Enforce strict turn-locking (`cell.color === activeFenTurn`) and remove any fallback that flips the FEN turn token when an out-of-turn piece is clicked.
  - *Rationale*: Flipping the FEN turn token mid-inspection causes illegal pawn states and disappearing pieces when `chess.js` validates moves. In Sandbox mode, once the user plays a legal move for the active side, the sandbox FEN naturally advances the turn so the user can test the opponent's response in sequence.
- **Automatic Queen Promotion on 8th/1st Rank**:
  - *Decision*: Pass `promotion: 'q'` whenever a pawn move lands on rank `8` or `1` in `chess.js`.
  - *Rationale*: Without an explicit promotion piece, `chess.js` rejects 8th-rank pawn moves as invalid, causing dragged pawns to vanish or snap back unexpectedly.
- **Server-Side Express Proxy with Client Fallback**:
  - *Decision*: Route Chess.com requests through `/api/chesscom/player/:username/matches` on the Express server with mandatory `User-Agent: ChessPulse-App/1.0` headers and in-memory short-TTL caching.
  - *Rationale*: Browser `fetch` forbids custom `User-Agent` headers and can trigger `403`/`429` blocks from `api.chess.com`. A server-side proxy guarantees compliant headers and structured error payloads.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        CHESSPULSE CLIENT (React + Vite)                    │
│                                                                            │
│  ┌──────────────────────┐   ┌───────────────────────┐   ┌───────────────┐  │
│  │   HeroSection.tsx    │   │ PerformanceDashboard  │   │ MoveByMove    │  │
│  │  • Nameless 3D       │   │  • Live Handle Search │   │ Analyzer.tsx  │  │
│  │    Matte-Black King  │   │  • Structured Error   │   │  • PGN Ply    │  │
│  │  • Live CP Eval,     │   │    Banner (404 / 429) │   │    Timeline   │  │
│  │    Depth & Win-Rate  │   │  • Accuracy Charts    │   │  • What-If    │  │
│  └──────────────────────┘   └───────────┬───────────┘   │    Sandbox    │  │
│                                         │               └───────┬───────┘  │
│                                         ▼                       ▼          │
│                           ┌───────────────────────────┐ ┌───────────────┐  │
│                           │     chessComApi.ts        │ │ ChesscomBoard │  │
│                           │  • Normalizes username    │ │  • Turn-Lock  │  │
│                           │  • Parses PGN & Eval CP   │ │  • Legal Dots │  │
│                           └─────────────┬─────────────┘ └───────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────┘
                                          │ GET /api/chesscom/player/:user
                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER PROXY (server.ts : 3000)                │
│  • Normalizes: username.trim().toLowerCase() + encodeURIComponent()        │
│  • Injects Header: User-Agent: ChessPulse-App/1.0 (+https://chesspulse.app)│
│  • Maps HTTP 404 -> USER_NOT_FOUND | HTTP 429 -> RATE_LIMITED              │
└─────────────────────────────────────────┬──────────────────────────────────┘
                                          │ HTTPS
                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   CHESS.COM PUBLIC API (api.chess.com/pub)                 │
└────────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models

```typescript
export type ApiErrorCode = 'USER_NOT_FOUND' | 'NO_GAMES_FOUND' | 'RATE_LIMITED' | 'NETWORK_ERROR';

export class ChessComApiError extends Error {
  code: ApiErrorCode;
  status?: number;
}

export interface SandboxState {
  isActive: boolean;
  fen: string;
  lastMove?: { from: string; to: string; notation: string };
  evalScore: string;
  evalCp: number;
  moveHistory: string[];
}
```

### Interactive Component & State Mapping

1. **Server Proxy (`server.ts` & `package.json`)**:
   - Mounts `/api/chesscom/player/:username` and `/api/chesscom/player/:username/matches` before Vite middleware on port `3000`.
   - Fetches player profile, archives list, and latest monthly games JSON from `https://api.chess.com/pub/player/${encodedUsername}/...` with `User-Agent: ChessPulse-App/1.0`.
2. **Nameless 3D Matte-Black King Hero (`HeroSection.tsx`)**:
   - Strips all habit-tracker markup (`"Elia"`, `"Sam"`, pear/sprout mascot, mood buttons, `"Food"`, and `"Activity"` cards) and replaces them with a nameless, studio-lit 3D matte-black Staunton King centerpiece surrounded by live centipawn evaluation (`+1.45 cp`), engine search depth (`Depth 32/40`), and precise win-rate percentages (`68.4% W • 24.1% D • 7.5% L`).
3. **Board Stability & What-If Sandbox (`ChesscomBoard.tsx` & `MoveByMoveAnalyzer.tsx`)**:
   - `ChesscomBoard.tsx`: Computes legal moves strictly from the current `fen` without mutating turn tokens; locks drag/click start to pieces matching the active turn; auto-promotes 8th/1st-rank pawns to Queen; clears drag ghost states cleanly on `onDragEnd` and `onDrop`.
   - `MoveByMoveAnalyzer.tsx`: Tracks `sandboxState: SandboxState | null`. When the user drags or clicks a legal move on the board, `handleSandboxMove(from, to)` updates `sandboxState` with the new `fen`, computes the dynamic material/positional evaluation score, plays the appropriate move/capture/check audio cue, and reveals a `"What-If Sandbox Active • Reset to Match Line"` banner.
