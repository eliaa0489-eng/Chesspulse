import React from 'react';

export interface AceternityPillButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'black' | 'white';
}

export function AceternityPillButton({
  children,
  icon,
  variant = 'black',
  className = '',
  ...props
}: AceternityPillButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-full px-6 py-3 font-semibold flex items-center gap-3 shadow-lg active:scale-98 transition-all cursor-pointer ${
        variant === 'black'
          ? 'bg-black text-white hover:bg-slate-900 border border-slate-800 shadow-slate-900/15'
          : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-slate-900/5'
      } ${className}`}
    >
      <div className="w-5 h-5 rounded-full bg-[#00C853] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
        {icon || '✓'}
      </div>
      <span>{children}</span>
    </button>
  );
}
