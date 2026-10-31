import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  onResetCredits: () => void;
}

export function PaywallModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  onResetCredits,
}: PaywallModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsUpgraded(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#34D399', '#06B6D4'],
        });
      } catch {
        // Safe fallback
      }
      setTimeout(() => {
        onUpgradeSuccess();
        setIsUpgraded(false);
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-white rounded-[26px] border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 sm:p-8 space-y-6">
          {!isUpgraded ? (
            <>
              {/* Header Icon + Badge */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Free Public Beta • 0,00 € Launch Access</span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  You&apos;ve completed your 3 starter scans.
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  ChessPulse Pro is currently in <span className="font-bold text-slate-900">free public beta</span>. Unlock unlimited Move-by-Move Tactical Heuristic Engine analyses, personalized blunder puzzles, and full repertoire telemetry at <span className="font-bold text-emerald-700">0,00 €</span> during our launch phase—no credit card or payment required.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span className="font-semibold text-slate-900">Unlimited Move-by-Move Tactical Heuristic Evaluations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span>Personalized Tactical Puzzles Generated from Your Real Blunders</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span>Time-Pressure Blunder Detector &amp; Opening Phase Audit</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <span>100% Free Public Beta • Zero Payment Information Collected</span>
                </div>
              </div>

              {/* High-Converting Forest Green Beta CTA */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-700/30"
                >
                  {isProcessing ? (
                    <span>Activating Free Public Beta Access...</span>
                  ) : (
                    <>
                      <span>Unlock Unlimited Beta Access (0,00 €)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    No checkout • Instant beta activation
                  </span>
                  <button
                    onClick={() => {
                      onResetCredits();
                      onClose();
                    }}
                    className="text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset 3 starter scans
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">
                  Public Beta Pro Access Activated!
                </h4>
                <p className="text-xs text-slate-600">
                  Unlimited match analyses and blunder puzzles are now unlocked for your session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
