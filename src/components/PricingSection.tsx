import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, ShieldCheck, Users } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planName: string, price: string) => void;
}

interface PlanFeature {
  text: string;
  emphasized?: boolean;
}

interface ChessPricingPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  price: string;
  period: string;
  savingsBadge?: string;
  buttonText: string;
  highlighted: boolean;
  features: PlanFeature[];
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const plans: ChessPricingPlan[] = [
    {
      id: 'starter',
      name: 'Free / Starter',
      description: 'For casual players wanting a quick check.',
      price: '0 €',
      period: '/ forever',
      buttonText: 'Start Free Analysis',
      highlighted: false,
      features: [
        { text: '3 Deep Match Analyses / month' },
        { text: 'Basic Stockfish Evaluation Bar' },
        { text: 'Standard Puzzle Access' },
      ],
    },
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      badge: 'Bestseller',
      description: 'For competitive players serious about raising their Elo.',
      price: '4,99 €',
      period: '/ month',
      buttonText: 'Upgrade to Pro Monthly',
      highlighted: true,
      features: [
        { text: 'Unlimited Deep Match Analyses', emphasized: true },
        { text: 'Personal Blunder Bank & Custom Puzzles', emphasized: true },
        { text: 'Full What-If Sandbox & Move-by-Move Annotations (Brilliant !!, Blunders ??)' },
        { text: 'Priority Stockfish 16.1 Cloud Processing' },
      ],
    },
    {
      id: 'gm-annual',
      name: 'Grandmaster Annual',
      savingsBadge: 'Save 33%',
      description: 'For tournament players and coaches.',
      price: '39,99 €',
      period: '/ year',
      buttonText: 'Select Grandmaster Annual',
      highlighted: false,
      features: [
        { text: 'Everything in Pro Monthly', emphasized: true },
        { text: 'Advanced Opening Repertoire Insights' },
        { text: 'Unlimited PGN Database Export & Multi-Account Sync' },
        { text: 'Early Access to New Training Features' },
      ],
    },
  ];

  const coachFeaturesCol1 = [
    'Custom multi-account licensing',
    'Bulk student management',
  ];
  const coachFeaturesCol2 = [
    'Dedicated coaching dashboard',
    'Automated student blunder reports',
  ];
  const coachFeaturesCol3 = [
    'Priority coach support',
    'Shared club PGN study banks',
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Development Beta • 100% Free Access (0,00 €)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Built for Every Rating Bracket
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Start analyzing your Chess.com archive for free, or unlock unlimited Stockfish 16.1 blunder recovery and custom tactical puzzles.
        </p>
      </div>

      {/* Explicit Development Beta & Zero Real-Money Purchases Banner */}
      <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#059669]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Beta Notice • Free for Development Reasons &amp; Website Adjustments</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            ChessPulse is currently in an active <strong>Beta phase</strong> and is <strong>100% free for development reasons and ongoing adjustments to the website</strong>. Listed subscription prices below are non-binding reference previews—<strong>nothing can be bought with real money</strong> on this website.
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-mono font-bold text-emerald-900 tabular-nums">
          0,00 € • No Real Money
        </span>
      </div>

      {/* 3-Tier ChessPulse Subscription Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-3xl p-8 sm:p-9 flex flex-col justify-between transition-all duration-200 relative ${
              plan.highlighted
                ? 'bg-[#0B1912] text-white border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/20'
                : 'bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {/* Top Bestseller or Save 33% Pill */}
            {plan.badge && (
              <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>{plan.badge}</span>
              </div>
            )}

            <div>
              {/* Plan Title & Subtitle */}
              <div className="space-y-1.5 mb-6">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3
                    className={`text-2xl font-extrabold tracking-tight ${
                      plan.highlighted ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  {plan.savingsBadge && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {plan.savingsBadge}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    plan.highlighted ? 'text-emerald-100/80' : 'text-slate-500'
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price Display with Tabular Nums */}
              <div className="mb-8 pb-6 border-b border-slate-200/15">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums ${
                      plan.highlighted ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      plan.highlighted ? 'text-emerald-200/80' : 'text-slate-500'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                {plan.savingsBadge && (
                  <span className="text-[11px] font-semibold text-emerald-700 block mt-1.5 tabular-nums">
                    0,00 € in Development Beta · Reference tier (no real-money purchase)
                  </span>
                )}
                {plan.highlighted && (
                  <span className="text-[11px] font-medium text-emerald-300/90 block mt-1.5">
                    0,00 € in Development Beta · Nothing can be bought with real money
                  </span>
                )}
                {plan.id === 'starter' && (
                  <span className="text-[11px] font-medium text-slate-400 block mt-1.5">
                    No credit card required · Instant access
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.name, `${plan.price} ${plan.period}`)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                    plan.highlighted
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950 text-white hover:bg-slate-800 border border-slate-900 shadow-xs'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>

              {/* Feature List */}
              <div className="space-y-3.5 text-xs sm:text-sm">
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.highlighted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span
                      className={`leading-snug ${
                        plan.highlighted
                          ? feat.emphasized
                            ? 'font-bold text-white'
                            : 'font-medium text-slate-200'
                          : feat.emphasized
                          ? 'font-bold text-slate-900'
                          : 'font-medium text-slate-700'
                      }`}
                    >
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Card Footer */}
            <div
              className={`mt-8 pt-4 border-t text-[11px] flex items-center gap-1.5 ${
                plan.highlighted
                  ? 'border-white/10 text-emerald-200/70'
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>Free Development Beta • Nothing can be bought with real money</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Banner: Organizations / Coaches Tier */}
      <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title, Description, Contact Coach Support Button */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <Users className="w-3.5 h-3.5" />
              <span>Organizations &amp; Coaches Tier</span>
            </div>
            <h4 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Chess Clubs, Academies &amp; Team Coaching
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Custom multi-account licensing, bulk student management, dedicated coaching dashboard, and priority support.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  onSelectPlan('Chess Clubs, Academies & Team Coaching', 'Custom Licensing')
                }
                className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-300 hover:border-emerald-600/50 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-2xs"
              >
                Contact Coach Support
              </button>
            </div>
          </div>

          {/* Right Column: 3-column feature grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-3">
              {coachFeaturesCol1.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium leading-snug">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {coachFeaturesCol2.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium leading-snug">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {coachFeaturesCol3.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
