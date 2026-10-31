import React, { useState } from 'react';
import { X, Check, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanModalProps {
  planName: string;
  price: string;
  isOpen: boolean;
  onClose: () => void;
  onPlanActivated?: (planName: string, handle?: string) => void;
}

export function PlanModal({
  planName,
  price,
  isOpen,
  onClose,
  onPlanActivated,
}: PlanModalProps) {
  const [chessHandle, setChessHandle] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isCoachTier =
    planName.toLowerCase().includes('coach') ||
    planName.toLowerCase().includes('club');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const sanitizedHandle = chessHandle.trim().toLowerCase();

    try {
      await fetch('/api/beta-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: sanitizedHandle,
          planName,
        }),
      });
    } catch {
      // Non-blocking fallback
    }

    try {
      localStorage.setItem('chesspulse_plan', planName);
      if (sanitizedHandle) {
        localStorage.setItem('chesspulse_user', sanitizedHandle);
      }
    } catch {
      // safe fallback
    }

    setIsSubmitting(false);
    setSubmitted(true);

    if (onPlanActivated) {
      onPlanActivated(planName, sanitizedHandle);
    }

    try {
      confetti({
        particleCount: 36,
        spread: 58,
        origin: { y: 0.62 },
        colors: ['#059669', '#10B981', '#0F172A'],
      });
    } catch {
      // Safe fallback
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setChessHandle('');
    setEmail('');
    setOrganizationName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div
        className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {submitted
                ? 'Development Beta Access Unlocked (0,00 €)'
                : `${planName} — Free Development Beta`}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 max-h-[85vh] overflow-y-auto">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Explicit Development Beta & Zero Real-Money Purchases Block */}
              <div className="p-4 sm:p-5 bg-emerald-50/85 rounded-2xl border border-emerald-300/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Beta Phase • Free for Development &amp; Website Adjustments</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 tabular-nums">
                    0,00 € • No Real Money
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                  ChessPulse is currently in a Beta phase and is 100% free for development reasons and ongoing adjustments to the website.
                </p>
                <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/80 text-[11px] sm:text-xs text-slate-700 leading-relaxed space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>Legal &amp; Security Notice: Nothing Can Be Bought With Real Money</span>
                  </p>
                  <p>
                    No real-money purchases, paid subscriptions, or financial transactions are possible on this platform. All displayed prices ({price}) are non-binding preview placeholders. No payment processor, credit card checkout, or billing system is connected.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {isCoachTier && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Chess Club / Academy Name
                    </label>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Berlin Chess Academy"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#059669] transition-all font-medium text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Official Chess.com Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={chessHandle}
                    onChange={(e) => setChessHandle(e.target.value)}
                    placeholder="e.g. Hikaru or YourUsername"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#059669] transition-all font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Waitlist / Release Notification Email{' '}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#059669] transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs text-slate-600">
                {isCoachTier ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Multi-account student roster &amp; PGN blunder recovery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>100% Free for development reasons &amp; website adjustments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Nothing can be bought with real money • Zero payment data</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Unlimited Deep Match Analyses &amp; Personal Blunder Bank</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Free for development reasons &amp; ongoing website adjustments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Nothing can be bought with real money • Zero billing or checkout</span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer border border-slate-900 disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Activating Free Development Beta...'
                    : 'Activate Free Development Beta (0,00 €)'}
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Listed price ({price}) is waived • Nothing can be bought with real money • Legal &amp; GDPR compliant
              </p>
            </form>
          ) : (
            <div className="text-center py-5 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Free Development Beta Activated (0,00 €)
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  ChessPulse is in Beta and completely free for development reasons and ongoing adjustments to the website. Nothing can be bought with real money.
                </p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-left text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Chess.com Handle</span>
                  <span className="font-mono font-bold text-slate-900">
                    @{chessHandle.trim().toLowerCase() || 'player'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Selected Tier</span>
                  <span className="font-semibold text-slate-900">{planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment &amp; Billing Status</span>
                  <span className="font-semibold text-[#059669]">
                    0,00 € • No Real-Money Purchases Possible
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              >
                Continue to ChessPulse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
