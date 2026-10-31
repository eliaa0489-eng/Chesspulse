import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Compass, Search, AlertCircle } from 'lucide-react';
import { StauntonKingMark } from './Navbar';
import { sanitizeChessHandle } from '../services/chessComApi';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigatePuzzles: () => void;
  onAnalyzeUsername: (username: string) => void;
}

export function NotFoundPage({
  onNavigateHome,
  onNavigatePuzzles,
  onAnalyzeUsername,
}: NotFoundPageProps) {
  const [handleInput, setHandleInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeChessHandle(handleInput);
    if (!cleaned) {
      setErrorMsg('Please enter a valid Chess.com handle (2–35 letters, numbers, _ or -).');
      return;
    }
    setErrorMsg('');
    onAnalyzeUsername(cleaned);
  };

  return (
    <main className="min-h-[82vh] bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-xl shadow-slate-900/5 p-8 sm:p-12 text-center space-y-6"
      >
        {/* Minimalist Staunton King Emblem */}
        <div className="relative w-16 h-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center mx-auto shadow-lg shadow-slate-950/15">
          <StauntonKingMark className="w-8 h-8 text-white" />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#059669] border-2 border-white"
            aria-hidden="true"
          />
        </div>

        {/* Status Coordinate */}
        <div className="space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#047857]">
            Error 404 · Position Out of Book
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            This square doesn&apos;t exist on the board.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The route you requested could not be found in our opening tree. Return to the main telemetry overview or jump directly into a profile scan below.
          </p>
        </div>

        {/* Direct Handle Analyzer Recovery Form */}
        <form onSubmit={handleQuickAnalyze} className="space-y-2 text-left max-w-md mx-auto">
          <label htmlFor="notfound-handle-input" className="sr-only">
            Enter Chess.com Username
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#059669] focus-within:bg-white transition-all">
            <div className="flex items-center gap-2 pl-3 flex-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="notfound-handle-input"
                type="text"
                value={handleInput}
                onChange={(e) => {
                  setHandleInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Analyze Chess.com handle (e.g. Hikaru)..."
                className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pl-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}
        </form>

        {/* Primary Recovery Navigation Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Home Overview</span>
          </button>

          <button
            type="button"
            onClick={onNavigatePuzzles}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-[#E2E8F0] hover:border-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#059669]" />
            <span>Open Blunder Puzzles</span>
          </button>
        </div>
      </motion.div>
    </main>
  );
}
