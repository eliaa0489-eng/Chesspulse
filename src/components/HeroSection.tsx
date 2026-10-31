import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  Lock,
  Cpu,
  Activity,
  Target,
  Crosshair,
} from 'lucide-react';
import { FAMOUS_PLAYERS } from '../data/chessData';

interface HeroSectionProps {
  onAnalyzeUsername: (username: string) => void;
  onScrollToPuzzles: () => void;
}

interface TelemetryPhasePreset {
  id: 'opening' | 'center' | 'kingsafety' | 'endgame';
  label: string;
  shortLabel: string;
  centipawn: string;
  depth: string;
  nodesPerSec: string;
  winPct: number;
  drawPct: number;
  lossPct: number;
  acpl: string;
  principalVariation: string;
  classificationTag: string;
}

const TELEMETRY_PHASES: TelemetryPhasePreset[] = [
  {
    id: 'center',
    label: 'Center Control',
    shortLabel: 'Center',
    centipawn: '+1.45 eval',
    depth: '1-Ply Heuristic',
    nodesPerSec: 'Pattern Scan',
    winPct: 68.4,
    drawPct: 24.1,
    lossPct: 7.5,
    acpl: '11.2 ACPL',
    principalVariation: '18. Nxd5!! exd5 19. exd5 Qd7',
    classificationTag: 'Brilliant !!',
  },
  {
    id: 'opening',
    label: 'Opening Book',
    shortLabel: 'Opening',
    centipawn: '+0.42 eval',
    depth: '1-Ply Heuristic',
    nodesPerSec: 'Pattern Scan',
    winPct: 54.8,
    drawPct: 36.2,
    lossPct: 9.0,
    acpl: '6.4 ACPL',
    principalVariation: '9. Bg5 h6 10. Bh4 g5 11. Bg3',
    classificationTag: 'Book ★',
  },
  {
    id: 'kingsafety',
    label: 'King Safety',
    shortLabel: 'King Safety',
    centipawn: '+2.85 eval',
    depth: '1-Ply Heuristic',
    nodesPerSec: 'Pattern Scan',
    winPct: 84.2,
    drawPct: 11.5,
    lossPct: 4.3,
    acpl: '9.8 ACPL',
    principalVariation: '24. Bxh7+! Kxh7 25. Qh5+ Kg8',
    classificationTag: 'Best ★',
  },
  {
    id: 'endgame',
    label: 'Endgame Precision',
    shortLabel: 'Endgame',
    centipawn: '+4.60 eval',
    depth: '1-Ply Heuristic',
    nodesPerSec: 'Pattern Scan',
    winPct: 96.4,
    drawPct: 3.1,
    lossPct: 0.5,
    acpl: '4.1 ACPL',
    principalVariation: '41. Ke5! Rf7 42. Rd6+ Ke7',
    classificationTag: 'Winning ★',
  },
];

/**
 * Nameless Sculptural 3D Matte-Black King Centerpiece
 * Purely visual studio-lit 3D Staunton King piece with directional rim lighting,
 * obsidian anodized gradients, and soft floor shadow. No name or character label.
 */
function MatteBlack3DKingSculpture() {
  return (
    <div className="relative py-2.5 flex items-center justify-center select-none pointer-events-none">
      {/* Subtle Studio Rim Backlight */}
      <div className="absolute w-40 h-40 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
      <div className="absolute w-28 h-28 rounded-full bg-white/70 blur-xl -top-1 pointer-events-none" />

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <svg
          viewBox="0 0 200 220"
          className="w-[150px] sm:w-[168px] h-auto mx-auto drop-shadow-[0_18px_24px_rgba(15,23,42,0.28)]"
          aria-hidden="true"
        >
          <defs>
            {/* Matte-Black Obsidian Primary Body Shader */}
            <linearGradient id="kingMatteBody" x1="15%" y1="10%" x2="88%" y2="92%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="18%" stopColor="#27272A" />
              <stop offset="52%" stopColor="#141417" />
              <stop offset="85%" stopColor="#09090B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Radial Studio Key Light on Crown & Pedestal */}
            <radialGradient id="kingCrownSpecular" cx="32%" cy="26%" r="65%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="35%" stopColor="#27272A" />
              <stop offset="78%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#09090B" />
            </radialGradient>

            {/* Emerald Tactical Rim Reflection */}
            <linearGradient id="kingEmeraldRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.65" />
              <stop offset="35%" stopColor="#34D399" stopOpacity="0.15" />
              <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.55" />
            </linearGradient>

            {/* Studio Specular Left Highlight */}
            <linearGradient id="kingLeftRimLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.55" />
              <stop offset="35%" stopColor="#94A3B8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </linearGradient>

            {/* Soft Elliptical Contact Shadow */}
            <radialGradient id="kingStudioShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(9, 13, 22, 0.48)" />
              <stop offset="55%" stopColor="rgba(15, 23, 42, 0.20)" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
            </radialGradient>
          </defs>

          {/* Studio Floor Contact Shadow & Subtle Telemetry Ring */}
          <ellipse cx="100" cy="202" rx="64" ry="11" fill="url(#kingStudioShadow)" />
          <ellipse
            cx="100"
            cy="200"
            rx="52"
            ry="7.5"
            fill="none"
            stroke="url(#kingEmeraldRim)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />

          {/* 1. finial Cross on Top of Staunton Crown */}
          <g>
            <rect
              x="95"
              y="12"
              width="10"
              height="28"
              rx="3"
              fill="url(#kingMatteBody)"
              stroke="#475569"
              strokeWidth="0.9"
            />
            <rect
              x="84"
              y="19"
              width="32"
              height="9.5"
              rx="3"
              fill="url(#kingMatteBody)"
              stroke="#475569"
              strokeWidth="0.9"
            />
            {/* Specular highlight on finial cross */}
            <rect x="96.5" y="13.5" width="2.2" height="24" rx="1" fill="#94A3B8" opacity="0.45" />
            <rect x="86" y="20.5" width="12" height="2" rx="1" fill="#CBD5E1" opacity="0.5" />
          </g>

          {/* 2. Crown Pearl / Dome Cap */}
          <ellipse
            cx="100"
            cy="43"
            rx="16"
            ry="7.5"
            fill="url(#kingCrownSpecular)"
            stroke="#3F3F46"
            strokeWidth="0.9"
          />

          {/* 3. Sculpted Flared Crown Body */}
          <path
            d="M 66,49 C 76,43 124,43 134,49 L 124,80 C 114,83 86,83 76,80 Z"
            fill="url(#kingCrownSpecular)"
            stroke="#3F3F46"
            strokeWidth="1"
          />
          {/* Left Studio Rim Highlight on Crown */}
          <path
            d="M 70,50 L 79,78 L 88,79 L 81,48 Z"
            fill="url(#kingLeftRimLight)"
          />
          {/* Crown Top Bevel Lip */}
          <ellipse
            cx="100"
            cy="49"
            rx="34"
            ry="6.5"
            fill="url(#kingMatteBody)"
            stroke="#64748B"
            strokeWidth="1"
          />
          <path
            d="M 70,49 C 85,53.5 115,53.5 130,49"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.1"
            opacity="0.45"
          />

          {/* 4. Royal Collar & Double Torus Ring */}
          <ellipse
            cx="100"
            cy="81"
            rx="31"
            ry="6"
            fill="url(#kingMatteBody)"
            stroke="#52525B"
            strokeWidth="1"
          />
          <ellipse
            cx="100"
            cy="87"
            rx="26"
            ry="4.8"
            fill="url(#kingMatteBody)"
            stroke="#3F3F46"
            strokeWidth="0.9"
          />
          {/* Subtle Emerald Rim Line on Collar */}
          <path
            d="M 73,81 C 88,85.5 112,85.5 127,81"
            fill="none"
            stroke="url(#kingEmeraldRim)"
            strokeWidth="1.5"
          />

          {/* 5. Tapered Column Shaft (Staunton Waist) */}
          <path
            d="M 78,90 C 80,115 72,138 64,158 C 84,164 116,164 136,158 C 128,138 120,115 122,90 Z"
            fill="url(#kingMatteBody)"
            stroke="#27272A"
            strokeWidth="1"
          />
          {/* Studio Specular Vertical Reflection Strip along Left Shaft */}
          <path
            d="M 82,92 C 83,115 77,137 70,156 L 82,159 C 87,138 91,115 90,92 Z"
            fill="url(#kingLeftRimLight)"
          />
          {/* Right Edge Subtle Rim Catchlight */}
          <path
            d="M 120,92 C 119,115 125,137 132,156"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.2"
            opacity="0.4"
          />

          {/* 6. Multi-Tier Weighted Base Pedestal */}
          {/* Upper Base Torus */}
          <ellipse
            cx="100"
            cy="160"
            rx="40"
            ry="8"
            fill="url(#kingMatteBody)"
            stroke="#52525B"
            strokeWidth="1"
          />
          {/* Middle Sculpted Base Curve */}
          <path
            d="M 55,168 C 52,176 48,183 48,189 C 72,198 128,198 152,189 C 152,183 148,176 145,168 C 122,175 78,175 55,168 Z"
            fill="url(#kingCrownSpecular)"
            stroke="#3F3F46"
            strokeWidth="1"
          />
          {/* Upper Base Rim Specular Highlight */}
          <path
            d="M 60,168 C 82,174.5 118,174.5 140,168"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            opacity="0.45"
          />
          {/* Bottom Weighted Plinth Ring */}
          <ellipse
            cx="100"
            cy="190"
            rx="52"
            ry="9.5"
            fill="url(#kingMatteBody)"
            stroke="#52525B"
            strokeWidth="1.1"
          />
          {/* Emerald Precision Accent Line on Base Plinth */}
          <path
            d="M 52,190 C 78,198.5 122,198.5 148,190"
            fill="none"
            stroke="url(#kingEmeraldRim)"
            strokeWidth="1.8"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function HeroSection({ onAnalyzeUsername }: HeroSectionProps) {
  const [username, setUsername] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [inputError, setInputError] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Smooth depth parallax as the user scrolls toward "How ChessPulse Works"
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 56]);

  // Static display preset for the non-interactive iPhone 16 screen
  const activePhase = TELEMETRY_PHASES[0];

  const validateHandle = (raw: string): string | null => {
    const cleaned = raw.trim().replace(/^@/, '');
    if (!cleaned) {
      return 'Please enter your Chess.com username to start analysis.';
    }
    if (cleaned.length < 2 || cleaned.length > 35) {
      return 'Username must be between 2 and 35 characters.';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
      return 'Use only letters, numbers, underscores (_), or hyphens (-).';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Spam bot trap
    const error = validateHandle(username);
    if (error) {
      setInputError(error);
      return;
    }
    setInputError('');
    onAnalyzeUsername(username.trim().replace(/^@/, ''));
  };

  const handleSelectSample = (sample: string) => {
    setUsername(sample);
    setInputError('');
    onAnalyzeUsername(sample);
  };

  return (
    <section
      ref={heroRef}
      className="relative pt-2 sm:pt-5 pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden bg-white"
    >
      {/* Background Subtle Technical Grid Pattern & Soft Warm Radial Glow */}
      <div className="absolute inset-0 aceternity-grid grid-mask-radial pointer-events-none -z-10 opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] hero-warm-glow pointer-events-none -z-10" />

      {/* Top Centered Content Container — Shifted Higher in Viewport */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        {/* Hero Headline (10% Bigger) */}
        <h1 className="text-[44px] sm:text-[66px] md:text-[79px] font-extrabold tracking-tight text-slate-900 leading-[1.04] text-balance">
          Stop Blundering.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#047857]">
            Train Your Own
          </span>{' '}
          Mistakes.
        </h1>

        {/* Shortened Subhead — 10% Bigger & High Contrast */}
        <p className="text-base sm:text-lg md:text-[20px] text-slate-700 max-w-xl mx-auto leading-snug font-medium text-balance">
          Turn your real Chess.com blunders into custom tactical recovery puzzles.
        </p>

        {/* One Clear Primary Call to Action — Chess.com Handle Analyzer */}
        <div className="max-w-xl mx-auto pt-1 space-y-2.5">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-300 shadow-xl shadow-slate-900/5 flex items-center gap-2 transition-all duration-apple ease-apple focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-emerald-100"
          >
            {/* Hidden Honeypot Input for Spam Protection */}
            <input
              type="text"
              name="website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <label htmlFor="hero-chess-username" className="sr-only">
              Chess.com Username
            </label>
            <div className="flex items-center gap-2.5 px-3 flex-1 min-h-[42px]">
              <span className="text-lg text-slate-500 select-none" aria-hidden="true">
                ♟
              </span>
              <input
                id="hero-chess-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (inputError) setInputError('');
                }}
                placeholder="Enter your Chess.com username..."
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? 'hero-username-error' : undefined}
                className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 min-h-[42px] text-xs sm:text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] active:scale-[0.98] rounded-xl flex items-center gap-2 transition-all duration-apple ease-apple cursor-pointer whitespace-nowrap shadow-sm shrink-0"
            >
              <span>Analyze My Games</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {inputError && (
            <p
              id="hero-username-error"
              role="alert"
              className="text-xs text-rose-700 font-semibold"
            >
              {inputError}
            </p>
          )}

          {/* Quick Demo Profile Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-600 text-[11px]">
              Instant GM archives:
            </span>
            {FAMOUS_PLAYERS.map((player) => (
              <button
                key={player.username}
                type="button"
                onClick={() => handleSelectSample(player.username)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold text-[11px] transition-all duration-apple ease-apple cursor-pointer shadow-2xs hover:border-slate-400"
              >
                @{player.username}{' '}
                <span className="text-slate-600 font-normal">({player.title})</span>
              </button>
            ))}
          </div>

          {/* Enterprise Trust Signals */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <Lock className="w-3 h-3 text-[#047857] shrink-0" />
            <span className="font-medium text-slate-600">
              Zero-Password Read-Only Public API Sync • Free Public Beta
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NON-INTERACTIVE iPHONE 16 PRO MOCKUP — 10% BIGGER                         */}
      {/* Strictly non-interactive (pointer-events-none select-none), scaled +10%.  */}
      {/* ========================================================================= */}
      <motion.div
        style={{ y: phoneY }}
        aria-hidden="true"
        className="mt-6 sm:mt-8 -mb-36 sm:-mb-44 max-w-[473px] w-full mx-auto relative pt-1 z-10 pointer-events-none select-none"
      >
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[484px] h-[374px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Outer Titanium Chassis (Realistic iPhone 16 Pro Bezel — 10% Bigger) */}
        <div className="iphone-titanium-bezel rounded-t-[56px] sm:rounded-t-[64px] p-3 sm:p-3.5 relative border-t border-x border-[#52504c] h-[594px] sm:h-[638px] overflow-hidden shadow-2xl">
          {/* Subtle bottom fade right above the section intersection line */}
          <div className="absolute bottom-0 inset-x-0 h-22 bg-gradient-to-t from-white/90 via-white/40 to-transparent z-10 pointer-events-none" />

          {/* Antenna line notches (Apple hardware micro-detail) */}
          <div className="absolute -left-1 top-26 w-1 h-9 bg-[#3d3b38] rounded-r-xs" />
          <div className="absolute -right-1 top-26 w-1 h-9 bg-[#3d3b38] rounded-l-xs" />

          {/* Inner Display Glass Bezel */}
          <div className="bg-black rounded-t-[48px] sm:rounded-t-[54px] p-1 pt-1.5 overflow-hidden iphone-inner-display h-full">
            {/* Screen Canvas: Clean Studio Alabaster & Sage Glass Aesthetic */}
            <div className="bg-gradient-to-b from-[#EFF4F0] via-[#F7F9F7] to-[#FFFFFF] text-slate-900 rounded-t-[44px] sm:rounded-t-[50px] overflow-hidden border border-slate-300/80 h-full flex flex-col relative">
              {/* iPhone 16 Pro Dynamic Island & Status Bar */}
              <div className="pt-2.5 px-7 pb-2 flex items-center justify-between text-xs font-semibold text-slate-800 shrink-0">
                <span className="font-bold tracking-tight text-[13px] tabular-nums">9:41</span>

                {/* Dynamic Island Capsule */}
                <div className="w-28 sm:w-31 h-6 sm:h-6.5 bg-black rounded-full flex items-center justify-between px-3 shadow-inner border border-black mx-auto">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0d0e14] border border-[#232538] flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-[#1b1e38]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-wider">
                      PULSE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-600 font-bold">5G</span>
                  <div className="w-5.5 h-3 rounded-xs border border-slate-600 p-0.5 flex items-center">
                    <div className="h-full w-[90%] bg-slate-800 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* CHESSPULSE GRANDMASTER TELEMETRY MOBILE SCREEN (STATIC / NON-INTERACTIVE) */}
              <div className="px-5 pt-2.5 pb-24 space-y-3 overflow-hidden flex-1 text-left">
                {/* 1. Universal Engine Telemetry Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Tactical Heuristic Engine
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[22px] font-black text-slate-900 tracking-tight font-mono tabular-nums">
                        {activePhase.centipawn}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {activePhase.classificationTag}
                      </span>
                    </div>
                  </div>

                  {/* Top Right: Live Engine Depth & Node Speed Badges */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs text-[11px] font-mono font-bold text-slate-800 tabular-nums">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activePhase.depth}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums pr-1">
                      {activePhase.nodesPerSec}
                    </span>
                  </div>
                </div>

                {/* 2. Nameless Sculptural 3D Matte-Black King Centerpiece */}
                <MatteBlack3DKingSculpture />

                {/* 3. Static Win-Rate Probability & Phase Indicator Card */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Win-Rate Probability</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70 tabular-nums">
                      {activePhase.winPct}% W
                    </span>
                  </div>

                  {/* Segmented W / D / L Telemetry Bar */}
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200/70">
                      <div
                        className="h-full bg-emerald-600 rounded-l-full"
                        style={{ width: `${activePhase.winPct}%` }}
                      />
                      <div
                        className="h-full bg-slate-300"
                        style={{ width: `${activePhase.drawPct}%` }}
                      />
                      <div
                        className="h-full bg-slate-800 rounded-r-full"
                        style={{ width: `${activePhase.lossPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-500 tabular-nums">
                      <span className="text-emerald-700 font-bold">
                        White {activePhase.winPct}%
                      </span>
                      <span>Draw {activePhase.drawPct}%</span>
                      <span className="text-slate-700">Black {activePhase.lossPct}%</span>
                    </div>
                  </div>

                  {/* Static Phase Indicators (Non-Interactive) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {TELEMETRY_PHASES.map((phase) => {
                      const isActive = phase.id === activePhase.id;
                      return (
                        <div
                          key={phase.id}
                          className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border text-center truncate ${
                            isActive
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-slate-50 text-slate-500 border-slate-200/80'
                          }`}
                        >
                          {phase.shortLabel}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Bottom Chess Telemetry Cards (Centipawn Loss & Optimal Line) */}
                <div className="grid grid-cols-2 gap-2.5 text-left">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-900 font-bold truncate">Centipawn Loss</span>
                    </div>
                    <span className="text-[13px] font-mono font-extrabold text-slate-900 block tabular-nums">
                      {activePhase.acpl}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-900 font-bold truncate">Engine PV Line</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 block truncate">
                      {activePhase.principalVariation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
