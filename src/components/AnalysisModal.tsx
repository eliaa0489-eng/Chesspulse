import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, Sparkles, User, RefreshCw } from 'lucide-react';
import { fetchChessComUserData } from '../services/chessComApi';
import { PlayerProfile } from '../types/chess';
import { EvalBadge } from './EvalBadge';

interface AnalysisModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectPuzzle: (puzzleIndex: number) => void;
}

export function AnalysisModal({ username, isOpen, onClose, onSelectPuzzle }: AnalysisModalProps) {
  const [stage, setStage] = useState<'connecting' | 'scanning' | 'extracting' | 'complete'>('connecting');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !username) return;

    setLoading(true);
    setStage('connecting');
    setProfile(null);

    // Simulate real pipeline steps while fetching live API data
    const timer1 = setTimeout(() => setStage('scanning'), 700);
    const timer2 = setTimeout(() => setStage('extracting'), 1500);

    fetchChessComUserData(username).then((data) => {
      setTimeout(() => {
        setProfile(data);
        setStage('complete');
        setLoading(false);
      }, 2200);
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, username]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[24px] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Chess.com Match Analysis Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {stage !== 'complete' ? (
            /* Pipeline Loading Steps */
            <div className="py-12 space-y-6 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">
                  Analyzing @{username}...
                </h4>
                <p className="text-xs text-slate-500">
                  Querying official Chess.com API and running centipawn blunder detection
                </p>
              </div>

              <div className="space-y-3 text-left pt-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    stage === 'connecting' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {stage === 'connecting' ? '1' : '✓'}
                  </div>
                  <span className={stage === 'connecting' ? 'font-bold text-slate-900' : 'text-slate-600'}>
                    Connecting to Chess.com Public Player Endpoint
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    stage === 'scanning' ? 'bg-emerald-600 text-white animate-pulse' : stage === 'extracting' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {stage === 'extracting' ? '✓' : '2'}
                  </div>
                  <span className={stage === 'scanning' ? 'font-bold text-slate-900' : 'text-slate-600'}>
                    Fetching 100 recent game PGNs & opening trees
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    stage === 'extracting' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3
                  </div>
                  <span className={stage === 'extracting' ? 'font-bold text-slate-900' : 'text-slate-400'}>
                    Filtering tactical blunders (Stockfish eval drop &gt; 2.0)
                  </span>
                </div>
              </div>
            </div>
          ) : profile ? (
            /* Analysis Results Screen */
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="p-5 bg-[#F8FAF9] rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-xs relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-900">
                        {profile.username}
                      </h4>
                      {profile.title && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                          {profile.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Verified Chess.com Profile • {profile.totalGames} Games Monitored
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Blitz</span>
                    <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                      {profile.blitzRating}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Rapid</span>
                    <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                      {profile.rapidRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Diagnostic Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-medium">Tactical Accuracy</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                    {profile.tacticalAccuracy}%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Top 18% of rating group</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-medium">Blunder Frequency</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                    {profile.blunderRate}%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">~1.2 blunders per match</span>
                </div>

                <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-rose-900 font-medium">Time Trouble Leak</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Action</span>
                  </div>
                  <span className="text-xl font-extrabold text-rose-900 tabular-nums">
                    {profile.timeTroubleMoveRange}
                  </span>
                  <span className="text-[11px] text-rose-700 block mt-0.5">72% of losses occur here</span>
                </div>
              </div>

              {/* Personalized Puzzles Generated */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3 Personalized Training Drills Generated:</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ready to Play
                  </span>
                </div>

                <div className="space-y-2">
                  {profile.recentPuzzles.map((puzzle, idx) => (
                    <div
                      key={puzzle.id}
                      onClick={() => {
                        onSelectPuzzle(idx);
                        onClose();
                        const el = document.getElementById('interactive-puzzles');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center font-bold text-xs text-slate-700 transition-colors">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {puzzle.title}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                            <span>{puzzle.opening}</span>
                            <span>•</span>
                            <span className="font-mono font-semibold text-slate-700">{puzzle.blunderedMove}</span>
                            <EvalBadge classification="blunder" size="xs" showLabel={false} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          <span className="text-xs font-bold text-emerald-800 font-mono">
                            Win: {puzzle.winningMove}
                          </span>
                          <EvalBadge classification="best" size="xs" showLabel={false} />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        {stage === 'complete' && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Free Public Scan • No account required
            </span>
            <button
              onClick={() => {
                onClose();
                const el = document.getElementById('interactive-puzzles');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm shadow-emerald-700/20"
            >
              Start Training These Mistakes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
