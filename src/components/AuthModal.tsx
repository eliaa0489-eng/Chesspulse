import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = username.trim().replace(/^@/, '');
    if (!cleaned) return;
    setIsLoggedIn(true);
    setTimeout(() => {
      onSuccess(cleaned);
      setIsLoggedIn(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-bold tracking-tight uppercase text-slate-800">
              Sign In to ChessPulse
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {!isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Welcome back
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your Chess.com handle to access your personalized blunder drills and tactical archive.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Chess.com Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 select-none">♟</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Hikaru or MagnusCarlsen"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Zero-Password & SSL Trust reassurance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 block">Zero-Password Public API Sync</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Verified via public Chess.com read-only archives. ChessPulse is an independent third-party platform—your password is never needed or requested.
                  </p>
                </div>
              </div>

              {/* Aceternity Pill Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer border border-slate-800"
              >
                <div className="w-4 h-4 rounded-full bg-[#00C853] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Read-Only Public API Sync • Independent Analysis Platform</span>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Opening session for @{username}...
              </h4>
              <p className="text-xs text-slate-500">
                Syncing latest game data and daily blunder queue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
