import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { AceternityPillButton } from './AceternityPillButton';

interface BottomCtaBannerProps {
  onAnalyzeUsername: (username: string) => void;
}

export function BottomCtaBanner({ onAnalyzeUsername }: BottomCtaBannerProps) {
  const [username, setUsername] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    const cleaned = username.trim().replace(/^@/, '');
    if (!cleaned) {
      setErrorMsg('Please enter a Chess.com username (or try Hikaru).');
      return;
    }
    if (!/^[a-zA-Z0-9_-]{2,35}$/.test(cleaned)) {
      setErrorMsg('Enter 2–35 letters, numbers, underscores, or hyphens.');
      return;
    }
    setErrorMsg('');
    onAnalyzeUsername(cleaned);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#0B0F19] text-white rounded-3xl p-8 sm:p-14 lg:p-16 relative overflow-hidden border border-slate-800/80 shadow-2xl">
        {/* Aceternity Subtle Technical Grid Overlay */}
        <div className="absolute inset-0 aceternity-grid opacity-10 pointer-events-none" />

        {/* Ambient Subtle Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121824] border border-slate-800 text-xs font-semibold text-emerald-400">
            <span>Join 45,000+ players converting blunders into Elo gains</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
            Ready to break through your Elo ceiling?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Your Chess.com archives hold hundreds of tactical lessons specific to your playing style.
            Stop guessing why you lost and start fixing your blind spots today.
          </p>

          {/* Interactive Input Box with Aceternity Pill Button */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col sm:flex-row items-stretch justify-center gap-2.5 max-w-md mx-auto pt-2"
          >
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
            <label htmlFor="bottom-cta-username" className="sr-only">
              Enter Chess.com Username
            </label>
            <input
              id="bottom-cta-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter Chess.com Username"
              className="px-4 py-3 min-h-[44px] text-xs sm:text-sm bg-[#121824] text-white placeholder:text-slate-400 rounded-2xl border border-slate-700 focus:outline-none focus:border-emerald-400 transition-all flex-1"
            />
            <AceternityPillButton type="submit" variant="white" className="justify-center whitespace-nowrap">
              Analyze My Games
            </AceternityPillButton>
          </form>

          {errorMsg && (
            <p role="alert" className="text-xs text-rose-400 font-semibold">
              {errorMsg}
            </p>
          )}

          {/* Micro badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Free Scan
            </span>
            <span aria-hidden="true">·</span>
            <span>Zero Password Needed</span>
            <span aria-hidden="true">·</span>
            <span>Live Stockfish 16.1 Calibration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
