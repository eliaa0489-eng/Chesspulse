import React from 'react';

interface AccuracyRingProps {
  score: number;
  label: string;
  sublabel: string;
  color?: string;
  size?: number;
}

export function AccuracyRing({
  score,
  label,
  sublabel,
  color = '#10B981',
  size = 96,
}: AccuracyRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-extrabold text-slate-900 tabular-nums leading-none">
            {score}%
          </span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter mt-0.5">
            Acc.
          </span>
        </div>
      </div>

      <div>
        <h5 className="text-xs font-bold text-slate-900 leading-snug">
          {label}
        </h5>
        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
          {sublabel}
        </p>
      </div>
    </div>
  );
}
