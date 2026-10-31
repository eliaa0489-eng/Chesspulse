import React from 'react';
import { motion } from 'motion/react';
import { Search, Cpu, Crosshair, ArrowUpRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onSelectStep?: (stepNumber: number) => void;
}

interface WorkflowStep {
  number: number;
  badge: string;
  title: string;
  description: string;
  pillLabel: string;
  pillValue: string;
  icon: React.ReactNode;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: 1,
    badge: '01',
    title: 'Enter Your Handle',
    description:
      'Type your Chess.com username to sync your recent Rapid, Blitz, and Bullet games instantly—zero credentials required.',
    pillLabel: 'Archive Sync',
    pillValue: '@Hikaru • Verified',
    icon: <Search className="w-4 h-4 text-emerald-700" />,
  },
  {
    number: 2,
    badge: '02',
    title: 'Automated Heuristic Scan',
    description:
      'The ChessPulse Tactical Heuristic Engine evaluates your moves in real time to flag critical evaluation swings, blunders, and missed wins.',
    pillLabel: 'Engine Audit',
    pillValue: '24... Qxf2?? → 25. Rxf2!',
    icon: <Cpu className="w-4 h-4 text-emerald-700" />,
  },
  {
    number: 3,
    badge: '03',
    title: 'Custom Tactical Training',
    description:
      'Replay and solve your own real game mistakes on an interactive board until the winning pattern becomes automatic.',
    pillLabel: 'Blunder Recovery',
    pillValue: 'Missed Fork • Solved',
    icon: <Crosshair className="w-4 h-4 text-emerald-700" />,
  },
];

export function HowItWorksSection({ onSelectStep }: HowItWorksSectionProps) {
  return (
    <section
      id="how-it-works"
      className="relative z-20 py-20 sm:py-28 bg-white border-t border-b border-[#E2E8F0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean, Airy Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-center space-y-3 mb-14 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>How ChessPulse Works</span>
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            From Game Archive to Tactical Mastery
          </h2>

          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Three effortless steps to turn your own mistakes into your strongest competitive advantage.
          </p>
        </motion.div>

        {/* Three Minimalist Horizontal Cards with Generous Whitespace & Hover Micro-Interactions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {WORKFLOW_STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.45,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => onSelectStep?.(step.number)}
              className="group bg-white rounded-3xl p-7 sm:p-8 border border-[#E2E8F0] hover:border-slate-300 shadow-2xs hover:shadow-lg hover:shadow-slate-900/[0.03] transition-colors duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Minimalist Step Number & Icon Header */}
                <div className="flex items-center justify-between mb-7">
                  <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-emerald-50/70 group-hover:border-emerald-200 transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-emerald-700 transition-colors tabular-nums">
                    {step.badge}
                  </span>
                </div>

                {/* Concise Step Title & Single-Sentence Copy */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2.5 flex items-center justify-between group-hover:text-emerald-800 transition-colors">
                  <span>{step.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Clean, Single-Line Micro-Status Pill */}
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{step.pillLabel}</span>
                <span className="font-mono text-[11px] font-bold text-slate-800 bg-[#F8FAFC] px-2.5 py-1 rounded-full border border-[#E2E8F0] group-hover:border-emerald-200 group-hover:text-emerald-800 transition-colors">
                  {step.pillValue}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
