import React, { useState } from 'react';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { EvalBadge } from './EvalBadge';

interface DashboardPreviewCardProps {
  onTryInteractivePuzzle?: () => void;
}

export function DashboardPreviewCard({ onTryInteractivePuzzle }: DashboardPreviewCardProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'panic' | 'puzzle'>('trends');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(4);

  const ratingPoints = [
    { day: 'Day 1', rating: 1680, blunders: 8 },
    { day: 'Day 7', rating: 1715, blunders: 6 },
    { day: 'Day 14', rating: 1740, blunders: 5 },
    { day: 'Day 21', rating: 1790, blunders: 3 },
    { day: 'Day 30', rating: 1820, blunders: 2 },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden transition-all">
      {/* Top Application Bar */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
              ♟
            </div>
            <span className="font-semibold text-slate-800">app.chesspulse.com/dashboard</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200/60">
              Live Sync
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'trends' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Performance Trend
          </button>
          <button
            onClick={() => setActiveTab('panic')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'panic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Panic Detector
          </button>
          <button
            onClick={() => setActiveTab('puzzle')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'puzzle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blunder Drill
          </button>
        </div>
      </div>

      {/* Main Dashboard Canvas */}
      <div className="p-6">
        {/* User Mini Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                ♟
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">alex_grandmaster</h4>
                <span className="text-[11px] font-semibold text-slate-500">Chess.com</span>
              </div>
              <p className="text-xs text-slate-500">
                Blitz <span className="font-semibold text-slate-800 tabular-nums">1,820 ELO</span> · Rapid <span className="font-semibold text-slate-800 tabular-nums">1,940 ELO</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">30-Day Rating Gain</span>
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-base tabular-nums">
                <TrendingUp className="w-4 h-4" />
                +140 ELO
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Tactical Accuracy</span>
              <div className="font-bold text-slate-900 text-base tabular-nums">
                86.4%
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Interactive Rating Trend Chart */}
        {activeTab === 'trends' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Rating Progression & Blunder Reduction</span>
              <span className="text-slate-500">100 matches analyzed</span>
            </div>

            {/* SVG Trend Graph */}
            <div className="relative h-44 w-full bg-slate-50/70 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
              <div className="absolute inset-0 px-6 py-4 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 h-0" />
                <div className="border-b border-dashed border-slate-200 h-0" />
                <div className="border-b border-dashed border-slate-200 h-0" />
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area */}
                <path
                  d="M 10 100 Q 100 80, 190 60 T 390 15 L 390 120 L 10 120 Z"
                  fill="url(#chartGradient)"
                />

                {/* Main line */}
                <path
                  d="M 10 100 Q 100 80, 190 60 T 390 15"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data points */}
                {[
                  { cx: 10, cy: 100, val: '1,680' },
                  { cx: 105, cy: 78, val: '1,715' },
                  { cx: 200, cy: 58, val: '1,740' },
                  { cx: 295, cy: 32, val: '1,790' },
                  { cx: 390, cy: 15, val: '1,820' },
                ].map((pt, i) => (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredDataPoint(i)}>
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r={hoveredDataPoint === i ? 6 : 4}
                      className="fill-white stroke-emerald-600 transition-all"
                      strokeWidth={hoveredDataPoint === i ? 3 : 2}
                    />
                  </g>
                ))}
              </svg>

              {/* X Axis */}
              <div className="flex justify-between text-[11px] text-slate-500 pt-2 font-medium">
                {ratingPoints.map((pt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHoveredDataPoint(idx)}
                    className={`cursor-pointer transition-colors ${hoveredDataPoint === idx ? 'text-emerald-700 font-bold' : 'hover:text-slate-800'}`}
                  >
                    {pt.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro stats pill row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Avg. Blunders / Game</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">1.2 <span className="text-xs font-normal text-emerald-600">-64%</span></span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Opening Advantage</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">+0.82 <span className="text-xs font-normal text-emerald-600">Eval</span></span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Endgame Conversion</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">78.5% <span className="text-xs font-normal text-emerald-600">+19%</span></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Panic Detector Heatmap */}
        {activeTab === 'panic' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Move-Time & Blunder Distribution
              </div>
              <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Panic Zone: Move 26–35
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Opening (Moves 1–15) · 6.4s avg per move</span>
                  <span className="font-semibold text-emerald-600">2.8% Blunders</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Middlegame (Moves 16–25) · 18.2s avg per move</span>
                  <span className="font-semibold text-amber-600">6.4% Blunders</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/60">
                <div className="flex justify-between text-xs text-slate-800 mb-1 font-semibold">
                  <span className="text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Time Trouble (Moves 26–35) · 3.1s scramble
                  </span>
                  <span className="font-bold text-rose-700">29.7% Blunders</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-rose-200">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '78%' }} />
                </div>
                <p className="text-[11px] text-rose-700 mt-2 font-medium">
                  Insight: You lose 74% of your blitz games when your clock dips under 40 seconds. Practice fast 3-move calculation drills to stabilize.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Blunder Drill */}
        {activeTab === 'puzzle' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Your Actual Chess.com Match · Blitz 3+2</span>
              <span className="text-slate-500">Opponent: GrandMaster_V (1845)</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 bg-emerald-950 rounded-lg flex flex-col justify-between p-2 shadow-inner text-white shrink-0 relative overflow-hidden">
                <div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-full h-full opacity-80">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={(Math.floor(i / 4) + (i % 4)) % 2 === 0 ? 'bg-emerald-800' : 'bg-emerald-200/30'}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-emerald-300 drop-shadow">
                  ♞
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/80 px-1 py-0.5 rounded text-emerald-400 font-mono">
                  d5!
                </span>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800">24. Be3</span>
                    <EvalBadge classification="blunder" size="xs" />
                  </div>
                  <span className="text-slate-300">vs</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800">24. Nd5</span>
                    <EvalBadge classification="best" size="xs" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In move 24, you missed a crushing central fork on Black's queen and bishop. Our engine extracted this moment into a playable drill with official Chess.com/Lichess evaluation tags.
                </p>
                {onTryInteractivePuzzle && (
                  <button
                    onClick={onTryInteractivePuzzle}
                    className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    Open Move-by-Move Analysis Arena <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Micro Bar */}
      <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Continuous Background Engine
        </span>
        <span className="font-mono text-[11px] text-slate-400">STOCKFISH 16.1 EVAL</span>
      </div>
    </div>
  );
}
