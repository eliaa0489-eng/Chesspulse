import React from 'react';
import { MoveClassification } from '../types/chess';

interface EvalBadgeProps {
  classification: MoveClassification;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

interface ClassificationStyleMeta {
  symbol: string;
  label: string;
  hexBg: string;
  textColorOnCircle: string;
  pillClasses: string;
  title: string;
}

export const CLASSIFICATION_META: Record<MoveClassification, ClassificationStyleMeta> = {
  brilliant: {
    symbol: '!!',
    label: 'Brilliant',
    hexBg: '#1baca6',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#1baca6]/12 text-[#0f766e] dark:text-[#2dd4bf] border-[#1baca6]/40',
    title: 'Brilliant (!!): Genuine tactical piece sacrifice that is top engine choice (PV1) and maintains/seizes the advantage',
  },
  great: {
    symbol: '!',
    label: 'Great Move',
    hexBg: '#5c8bb0',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#5c8bb0]/15 text-[#2c5282] dark:text-[#90cdf4] border-[#5c8bb0]/45',
    title: 'Great Move (!): Critical "Only Move" where PV1 outperforms PV2 by >= 15% Win Probability or punishes an opponent error',
  },
  best: {
    symbol: '★',
    label: 'Best Move',
    hexBg: '#96bc4b',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#96bc4b]/15 text-[#3f6212] dark:text-[#a3e635] border-[#96bc4b]/45',
    title: 'Best Move (★): Exact top engine recommendation (PV1) with <= 1.5% Win Probability loss',
  },
  excellent: {
    symbol: '👍',
    label: 'Excellent',
    hexBg: '#96bc4b',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#96bc4b]/12 text-[#4d7c0f] dark:text-[#bef264] border-[#96bc4b]/35',
    title: 'Excellent (👍): Strong engine continuation with minimal Win Probability loss (1.5% – 4.2%)',
  },
  good: {
    symbol: '✓',
    label: 'Good',
    hexBg: '#97af8b',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#97af8b]/18 text-[#3f5238] dark:text-[#cbd5e1] border-[#97af8b]/45',
    title: 'Good (✓): Solid playable move with moderate Win Probability loss (4.2% – 8.0%)',
  },
  book: {
    symbol: '📖',
    label: 'Book',
    hexBg: '#a88865',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#a88865]/15 text-[#6b4f35] dark:text-[#d6bc9b] border-[#a88865]/45',
    title: 'Book Move (📖): Verified ECO / Lichess Masters opening theory move',
  },
  inaccuracy: {
    symbol: '?!',
    label: 'Inaccuracy',
    hexBg: '#f7c631',
    textColorOnCircle: '#1e293b',
    pillClasses: 'bg-[#f7c631]/18 text-[#854d0e] dark:text-[#fde047] border-[#f7c631]/55',
    title: 'Inaccuracy (?!): Suboptimal move losing 8.0% – 14.0% Win Probability',
  },
  mistake: {
    symbol: '?',
    label: 'Mistake',
    hexBg: '#e6912c',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#e6912c]/15 text-[#9a3412] dark:text-[#fdba74] border-[#e6912c]/50',
    title: 'Mistake (?): Clear error losing 14.0% – 24.0% Win Probability',
  },
  miss: {
    symbol: '✖',
    label: 'Miss',
    hexBg: '#e06c55',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#e06c55]/15 text-[#991b1b] dark:text-[#fca5a5] border-[#e06c55]/50',
    title: 'Miss (✖): Missed a direct tactical punishment after an opponent error',
  },
  blunder: {
    symbol: '??',
    label: 'Blunder',
    hexBg: '#ca3431',
    textColorOnCircle: '#ffffff',
    pillClasses: 'bg-[#ca3431]/15 text-[#991b1b] dark:text-[#f87171] border-[#ca3431]/55',
    title: 'Blunder (??): Severe blunder losing > 24.0% Win Probability or allowing forced mate',
  },
};

export function EvalBadge({
  classification,
  showLabel = true,
  size = 'sm',
  className = '',
}: EvalBadgeProps) {
  const meta = CLASSIFICATION_META[classification] || CLASSIFICATION_META.good;

  // Compact circular badge rendered directly on the chessboard target square corner
  if (!showLabel) {
    return (
      <span
        style={{ backgroundColor: meta.hexBg, color: meta.textColorOnCircle }}
        title={meta.title}
        className={`inline-flex items-center justify-center rounded-full font-black select-none ring-2 ring-white/95 shadow-md ${
          size === 'xs'
            ? 'w-5 h-5 text-[10px]'
            : size === 'sm'
            ? 'w-6 h-6 text-[11px]'
            : 'w-7 h-7 text-xs'
        } ${className}`}
      >
        {meta.symbol}
      </span>
    );
  }

  return (
    <span
      title={meta.title}
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border select-none transition-all ${
        size === 'xs'
          ? 'px-1.5 py-0.5 text-[10px]'
          : size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : 'px-3 py-1 text-xs'
      } ${meta.pillClasses} ${className}`}
    >
      <span
        style={{ backgroundColor: meta.hexBg, color: meta.textColorOnCircle }}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-2xs"
      >
        {meta.symbol}
      </span>
      <span className="font-extrabold tracking-tight">{meta.label}</span>
    </span>
  );
}
