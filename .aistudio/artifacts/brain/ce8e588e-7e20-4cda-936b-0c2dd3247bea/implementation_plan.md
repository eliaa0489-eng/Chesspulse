# ChessPulse — Precision Engine Evaluation & Obsidian-Emerald Dark Mode Upgrade

This upgrade replaces single-ply heuristic estimation with a **Hybrid Lichess Cloud Evaluation + Multi-Ply Alpha-Beta Search Engine** that computes true centipawn deltas, principal variation (PV) continuation lines, and board-fact-grounded tactical explanations without spamming "Best Move". Simultaneously, it introduces a **seamless Light / Dark Mode switch in the Footer**, transforming the interface into a deep obsidian-black (`#050505` / `#111111`) and emerald-green (`#10b981`) aesthetic while preserving 100% of the existing layout, spacing, and component structure.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> Both architectural choices were confirmed during Phase 1 and are locked into this plan:

- **Confirmed Decision 1 — Engine Evaluation Pipeline**: **Hybrid Lichess Cloud Eval + Local Multi-Ply Alpha-Beta Engine**. Every game is evaluated immediately using a deep positional + tactical alpha-beta minimax search with quiescence capture extension, enhanced asynchronously with verified Lichess Cloud Evaluation (`https://lichess.org/api/cloud-eval`) for opening/middlegame positions and critical tactical swings.
- **Confirmed Decision 2 — Theme Initialization & Persistence**: **Default to Light Mode until toggled in the Footer**, persisting the user's explicit choice in `localStorage` (`chesspulse-theme`) across sessions.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **True Move-by-Move Evaluation & Strict Classification**: Evaluates `evalBefore` and `evalAfter` from the moving player's perspective using exact centipawn (`cp`) and forced-mate (`#N`) calculations, comparing the played move against the engine's top Principal Variation (`pv[0]`) and continuation line (2–3 moves deep in legal SAN notation).
  2. **Board-Fact Tactical Explanations**: Inspects the real `chess.js` board state before and after each move to identify concrete tactical reasons (undefended hanging piece, material sacrifice/loss, pin/skewer, missed fork or checkmate sequence, king safety exposure) so the explanation, FEN, and SAN notation match 100%.
  3. **Obsidian & Emerald Dark Mode**: Adds a refined Moon/Sun theme toggle in the bottom Footer bar that switches the entire app between the existing crisp Light Mode and a deep black (`#050505`) / anthracite card (`#111111`–`#161616`) / emerald (`#10b981`) Dark Mode with zero layout shift.
- **Target Audience**: Competitive online chess players analyzing real Chess.com games who expect accurate centipawn evaluations, honest move classifications, and comfortable low-light study sessions.
- **Key Value**: Eliminates false "Best Move" inflation, provides verifiable engine continuation lines, and delivers an executive dark theme tailored for long tactical training sessions.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Accurate Game & Move Inspection**:
   - When a user loads a Chess.com match or steps through moves in the Move-by-Move Analyzer, each ply displays its exact evaluation (`+1.45`, `-0.80`, `#3`), centipawn delta, and strict classification badge (`Brilliant !!`, `Best`, `Good`, `Book`, `Inaccuracy ?!`, `Mistake ?`, `Blunder ??`).
   - Selecting any `Inaccuracy`, `Mistake`, or `Blunder` reveals:
     - The exact move played vs. the engine's best legal SAN move (`pv[0]`).
     - The 2–3 move Principal Variation continuation line (e.g., `14... Nxd4 15. Bxd4 Bc5 +1.8`).
     - A concrete explanation derived from the board state (e.g., *"Leaves the knight on f6 undefended against Qxf6"* or *"Misses a tactical fork with Nc7+ winning the rook on a8"*).
2. **Footer Theme Toggle (`Light Mode` ↔ `Dark Mode`)**:
   - Located in the bottom row of the Footer alongside the legal/compliance links, a sleek pill button displays a `Moon` or `Sun` icon with the label `"Dark Mode"` or `"Light Mode"`.
   - Clicking toggles `.dark` on `document.documentElement`, saves `'dark'` or `'light'` to `localStorage.getItem('chesspulse-theme')`, and smoothly transitions all backgrounds, cards, charts, move tables, and modals without altering any spacing or geometry.

### Visual Identity & Dark Mode Color Tokens
- **Existing Layout & Structure**: Preserved 100% unchanged.
- **Dark Mode Palette (Applied when `.dark` is active)**:
  - **Primary Canvas Background**: Deep Obsidian Black (`#050505` / `#0a0a0a`).
  - **Card / Panel / Modal Surfaces**: Layered Anthracite (`#111111` primary cards, `#161616` elevated/secondary panels).
  - **Hairline Borders**: Subtle structural dividers (`#222222` / `rgba(255, 255, 255, 0.08)`).
  - **Primary Emerald Accent**: `#10b981` (Emerald-500) for primary buttons, active tabs, high-accuracy rings, and Best Move indicators; `#059669` (Emerald-600) for hover states; `rgba(16, 185, 129, 0.12)` for subtle active row/badge highlights.
  - **Typography & Contrast**: Crisp off-white primary text (`#f9fafb`), balanced neutral gray secondary labels (`#9ca3af`), and muted slate metadata (`#6b7280`), ensuring WCAG AA legibility across all charts, move lists, and evaluation bars.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Centipawn Loss & PV-Matched Classification Thresholds**
  - *Chosen Approach*:
    - **Book**: Opening theory moves (plies 1–10) with $\le 0.20$ pawn loss.
    - **Brilliant (`!!`)**: Sound tactical sacrifice or forcing check/capture that maintains or seizes a decisive advantage ($\ge +1.50$ swing or top-engine sacrifice).
    - **Best**: Only when the played move matches the engine's `#1` candidate (`pv[0]`) OR loses $\le 0.05$ pawns in a non-trivial position.
    - **Good (Excellent / Solid)**: Small centipawn loss between $0.06$ and $0.29$ pawns where the played move differs from `pv[0]`.
    - **Inaccuracy (`?!`)**: Centipawn loss of $0.30$ to $0.79$ pawns.
    - **Mistake (`?`)**: Centipawn loss of $0.80$ to $1.99$ pawns.
    - **Blunder (`??`)**: Centipawn loss $\ge 2.00$ pawns, or stepping into / missing a forced mate (`#N`).
  - *Why*: Eliminates unrealistic "Best Move" spam on ordinary developing moves while rewarding true top-engine choices.
- **Decision 2: Hybrid Lichess Cloud Eval + Local Alpha-Beta Search with Quiescence**
  - *Chosen Approach*: Combine a multi-ply alpha-beta minimax engine (with piece-square positional tables, mobility, king safety, passed pawn structure, and capture quiescence search to prevent horizon-effect blunders) with non-blocking Lichess Cloud Eval (`https://lichess.org/api/cloud-eval`) lookups proxied and cached cleanly.
  - *Why*: Guarantees 100% legal moves, instant full-game analysis without browser freezing, and Grandmaster-grade cloud depth on known positions and critical tactical turns.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        ChessPulse Application Shell                          │
│         Theme State (localStorage 'chesspulse-theme' -> <html.dark>)         │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │                                      │
                    ▼                                      ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────────┐
│     Hybrid Chess Engine Pipeline      │  │   Obsidian-Emerald Theme System   │
│  ┌─────────────────────────────────┐  │  │  ┌─────────────────────────────┐  │
│  │ 1. Lichess Cloud Eval Lookup    │  │  │  │ Global Dark CSS Variables & │  │
│  │    (/api/chesscom/cloud-eval)   │  │  │  │ Surface/Border Token Pairs  │  │
│  └───────────────┬─────────────────┘  │  │  └──────────────┬──────────────┘  │
│                  ▼                    │  │                 ▼                 │
│  ┌─────────────────────────────────┐  │  │  ┌─────────────────────────────┐  │
│  │ 2. Multi-Ply Alpha-Beta Search  │  │  │  │ Footer Theme Toggle Button  │  │
│  │    + Quiescence + PST Tables    │  │  │  │ (Moon/Sun + Light/Dark)     │  │
│  └───────────────┬─────────────────┘  │  │  └─────────────────────────────┘  │
│                  ▼                    │  └───────────────────────────────────┘
│  ┌─────────────────────────────────┐  │
│  │ 3. Board-Fact Inspector         │  │
│  │    - Exact SAN PV (2-3 plies)   │  │
│  │    - Hanging / Fork / Pin / Mate│  │
│  │    - Strict CP Loss Thresholds  │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### Interactive Component & State Mapping
- **Engine Evaluation & PV Extraction**:
  - For each ply, the engine computes `evalBefore`, `bestMoveSan`, `pvLineSan` (2–3 legal SAN moves ahead), and `evalAfter`.
  - When Lichess Cloud Eval returns a multi-depth evaluation for a position, the ply's `evalScore`, `bestAlternative`, and `pvLine` upgrade seamlessly and re-verify the move classification.
  - The board-fact analyzer inspects captured pieces, undefended squares (`isAttacked`), checks, forks (single move attacking $\ge 2$ higher-value targets), pins, and king-shield pawn advances to produce specific, accurate commentary.
- **Theme State & Persistence**:
  - `theme` state (`'light' | 'dark'`) initializes to `'light'` unless `localStorage.getItem('chesspulse-theme') === 'dark'`.
  - Toggling updates `document.documentElement.classList.toggle('dark', isDark)` and persists to `localStorage`, updating the Footer toggle icon and label immediately.
