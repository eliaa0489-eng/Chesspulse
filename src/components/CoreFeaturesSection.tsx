import React, { useState } from 'react';
import { Puzzle, BarChart3, Clock, BookOpen, Check, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { OPENING_AUDIT_DATA } from '../data/chessData';
import { EvalBadge } from './EvalBadge';

export function CoreFeaturesSection({ onTryPuzzle }: { onTryPuzzle: () => void }) {
  // Card 1 interactive state: 'generic' vs 'chesspulse'
  const [puzzleComparisonMode, setPuzzleComparisonMode] = useState<'chesspulse' | 'generic'>('chesspulse');

  // Card 3 interactive slider for moves
  const [simulatedMove, setSimulatedMove] = useState<number>(28);

  // Card 4 interactive opening filter: 'All' | 'White' | 'Black'
  const [openingColorFilter, setOpeningColorFilter] = useState<'All' | 'White' | 'Black'>('All');

  const filteredOpenings = OPENING_AUDIT_DATA.filter((item) =>
    openingColorFilter === 'All' ? true : item.color === openingColorFilter
  );

  // Clock calculation for simulated move
  const secondsLeft = Math.max(8, Math.round(180 - simulatedMove * 4.8));
  const blunderChance = simulatedMove < 15 ? 3 : simulatedMove < 25 ? 9 : simulatedMove < 35 ? 31 : 44;

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="max-w-3xl mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <span>Engine-Powered Training</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Everything you need to stop losing games you should have won.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Most chess software gives you random tactical puzzles from 19th-century Grandmaster archives. ChessPulse extracts the exact positions where you blundered yesterday and forces you to play the winning line.
        </p>
      </div>

      {/* 4 Core Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Personal Blunder Puzzles (Hero Feature) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <Puzzle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Hero Feature</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Don't solve abstract puzzles. Fix your actual mistakes.
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our engine automatically detects moments where you missed a tactical win or blundered a piece on Chess.com. It converts your exact game positions into interactive daily training exercises.
            </p>
          </div>

          {/* Interactive Visual Preview Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Live Comparison</span>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setPuzzleComparisonMode('chesspulse')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    puzzleComparisonMode === 'chesspulse' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                  }`}
                >
                  ChessPulse Method
                </button>
                <button
                  onClick={() => setPuzzleComparisonMode('generic')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    puzzleComparisonMode === 'generic' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                  }`}
                >
                  Generic Puzzle Rush
                </button>
              </div>
            </div>

            {puzzleComparisonMode === 'chesspulse' ? (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Your Actual Match vs. GrandMaster_V
                  </span>
                  <span className="text-emerald-700 font-medium">Blitz 3+2 · Yesterday</span>
                </div>
                <div className="text-xs text-emerald-800 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span>• You played</span>
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded text-slate-800 border border-slate-200">24. Be3</span>
                    <EvalBadge classification="blunder" size="xs" />
                    <span className="text-rose-700 font-semibold font-mono">(-5.4 swing)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>• Winning move:</span>
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded text-slate-800 border border-slate-200">24. Nd5</span>
                    <EvalBadge classification="best" size="xs" />
                    <span className="text-emerald-800 font-semibold font-mono">(+4.6 eval)</span>
                  </div>
                </div>
                <button
                  onClick={onTryPuzzle}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  Solve this real position now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700 block">Typical Chess Site Drill:</span>
                <p>Abstract 1892 Morphy problem that you will never see in your 10-minute online games. Solved once, forgotten 10 minutes later.</p>
                <span className="text-slate-400 block pt-1">0% personalized match context</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Dynamic Performance Dashboard */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Real-Time Sync</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Real-time analytics after every match.
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              No static reports or outdated PDFs. As soon as you complete a game, your dashboard updates automatically with updated win-rates, tactical accuracy scores, and endgame trends.
            </p>
          </div>

          {/* Interactive Visual Preview Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <span className="text-xs font-semibold text-slate-700 block">Game Phase Accuracy Breakdown</span>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Opening (Book Accuracy)</span>
                  <span className="font-bold text-slate-900 tabular-nums">91.4%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91.4%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Middlegame (Tactical Conversion)</span>
                  <span className="font-bold text-slate-900 tabular-nums">78.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '78.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Endgame (Technique & Clock)</span>
                  <span className="font-bold text-amber-600 tabular-nums">64.5%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '64.5%' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Syncs automatically with Chess.com webhook triggers</span>
            </div>
          </div>
        </div>

        {/* Card 3: Time Management & Panic Detector */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 tracking-wide uppercase">Clock Intelligence</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Master your clock before it runs out.
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identify the exact moves where you overthink or freeze under time pressure. Learn how move-time distribution directly impacts your blunder rate in Blitz and Rapid.
            </p>
          </div>

          {/* Interactive Visual Preview Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Simulate Game Move:</span>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                Move {simulatedMove} of 40
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="38"
              value={simulatedMove}
              onChange={(e) => setSimulatedMove(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Est. Time Remaining</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {secondsLeft}s
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${
                blunderChance > 20 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className="text-[11px] text-slate-500 block">Blunder Likelihood</span>
                <span className={`text-base font-bold tabular-nums ${
                  blunderChance > 20 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {blunderChance}%
                </span>
              </div>
            </div>

            {simulatedMove >= 26 && (
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200/80 text-[11px] text-rose-800 flex items-start gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>Panic Zone Active: You are playing moves under 4 seconds without tactical validation.</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Opening Repertoire Audit */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Repertoire Optimization</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                Prune openings that cost you rating points.
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Discover which openings net you victories and which setups bleed ELO. Filter by White vs. Black, move depth, and specific opponent responses.
            </p>
          </div>

          {/* Interactive Visual Preview Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Opening Win-Rate Matrix</span>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                {(['All', 'White', 'Black'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOpeningColorFilter(filter)}
                    className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                      openingColorFilter === filter ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredOpenings.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.eco})</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{item.games} matches analyzed</span>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900 tabular-nums">
                      {item.winRate}% Win
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.verdict === 'High Yield' || item.verdict === 'Strong'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.verdict === 'Bleeding ELO'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.verdict}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
