import React from 'react';
import { Sparkles, Star, AlertTriangle, AlertOctagon, HelpCircle, BookOpen, Check } from 'lucide-react';
import { MoveClassification } from '../types/chess';

interface EvalBadgeProps {
  classification: MoveClassification;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function EvalBadge({
  classification,
  showLabel = true,
  size = 'sm',
  className = '',
}: EvalBadgeProps) {
  switch (classification) {
    case 'brilliant':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full select-none transition-all ${
            size === 'xs'
              ? 'px-1.5 py-0.5 text-[10px]'
              : size === 'sm'
              ? 'px-2 py-0.5 text-xs'
              : 'px-3 py-1 text-xs'
          } bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-xs hover:border-cyan-400 ${className}`}
          title="Brilliant (!!): Exceptional tactical sacrifice creating a decisive advantage"
        >
          {/* 💎 Brilliant: Vibrant Cyan (#26C281 / text-cyan-500), sparkling diamond icon + !! */}
          <span className="w-4 h-4 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-xs">
            !!
          </span>
          {showLabel && (
            <span className="flex items-center gap-1 text-cyan-900 font-extrabold">
              <Sparkles className="w-3 h-3 text-cyan-600 fill-cyan-400" />
              <span>Brilliant</span>
            </span>
          )}
        </span>
      );

    case 'best':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full select-none transition-all ${
            size === 'xs'
              ? 'px-1.5 py-0.5 text-[10px]'
              : size === 'sm'
              ? 'px-2 py-0.5 text-xs'
              : 'px-3 py-1 text-xs'
          } bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs hover:border-emerald-400 ${className}`}
          title="Best Move (★): Engine's highest depth choice"
        >
          {/* ⭐ Best Move: Emerald Green (#589632), checkmark/star icon */}
          <span className="w-4 h-4 rounded-full bg-[#589632] text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-xs">
            ★
          </span>
          {showLabel && (
            <span className="flex items-center gap-1 text-emerald-900 font-extrabold">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>Best</span>
            </span>
          )}
        </span>
      );

    case 'good':
    case 'inaccuracy':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full select-none transition-all ${
            size === 'xs'
              ? 'px-1.5 py-0.5 text-[10px]'
              : size === 'sm'
              ? 'px-2 py-0.5 text-xs'
              : 'px-3 py-1 text-xs'
          } bg-amber-50 text-amber-900 border border-amber-300 shadow-xs hover:border-amber-400 ${className}`}
          title="Inaccuracy (?!): Suboptimal move dropping 0.3-0.7 pawns"
        >
          {/* ⚠️ Good / Inaccuracy: Golden Amber (#F1C40F), question mark over exclamation mark ?! */}
          <span className="w-4 h-4 rounded-full bg-[#F1C40F] text-slate-900 flex items-center justify-center text-[9px] font-black shrink-0 shadow-xs">
            ?!
          </span>
          {showLabel && (
            <span className="flex items-center gap-1 text-amber-900 font-extrabold">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Inaccuracy</span>
            </span>
          )}
        </span>
      );

    case 'mistake':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full select-none transition-all ${
            size === 'xs'
              ? 'px-1.5 py-0.5 text-[10px]'
              : size === 'sm'
              ? 'px-2 py-0.5 text-xs'
              : 'px-3 py-1 text-xs'
          } bg-orange-50 text-orange-900 border border-orange-300 shadow-xs hover:border-orange-400 ${className}`}
          title="Mistake (?): Tactically flawed move creating a notable disadvantage"
        >
          {/* ⚡ Mistake: Bright Orange (#E67E22), single question mark icon */}
          <span className="w-4 h-4 rounded-full bg-[#E67E22] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
            ?
          </span>
          {showLabel && (
            <span className="flex items-center gap-1 text-orange-900 font-extrabold">
              <HelpCircle className="w-3 h-3 text-orange-600" />
              <span>Mistake</span>
            </span>
          )}
        </span>
      );

    case 'blunder':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full select-none transition-all ${
            size === 'xs'
              ? 'px-1.5 py-0.5 text-[10px]'
              : size === 'sm'
              ? 'px-2 py-0.5 text-xs'
              : 'px-3 py-1 text-xs'
          } bg-rose-50 text-rose-900 border border-rose-300 shadow-xs hover:border-rose-400 animate-pulse ${className}`}
          title="Blunder (??): Critical tactical error severely worsening the position"
        >
          {/* ❌ Blunder: Deep Crimson Red (#C0392B), alert/cross icon + double question mark ?? */}
          <span className="w-4 h-4 rounded-full bg-[#C0392B] text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-xs">
            ??
          </span>
          {showLabel && (
            <span className="flex items-center gap-1 text-rose-900 font-extrabold">
              <AlertOctagon className="w-3 h-3 text-rose-600 fill-rose-100" />
              <span>Blunder</span>
            </span>
          )}
        </span>
      );

    case 'book':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full select-none transition-all ${
            size === 'xs'
              ? 'px-1.5 py-0.5 text-[10px]'
              : size === 'sm'
              ? 'px-2 py-0.5 text-xs'
              : 'px-3 py-1 text-xs'
          } bg-slate-100 text-slate-800 border border-slate-200 ${className}`}
          title="Book Move: Standard opening theory"
        >
          <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0">
            📖
          </span>
          {showLabel && (
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>Book</span>
            </span>
          )}
        </span>
      );
  }
}
