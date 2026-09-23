import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { w: 28, h: 28, box: 'w-7 h-7 text-xs' },
    md: { w: 34, h: 34, box: 'w-8.5 h-8.5 text-sm' },
    lg: { w: 42, h: 42, box: 'w-10.5 h-10.5 text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-End Minimalist Fintech Logo (Lirdgo Reference Style) */}
      <div
        className={`${iconDimensions.box} rounded-xl bg-[#141d2a] border border-[#233147] flex items-center justify-center text-teal-400 font-black shadow-inner`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Minimalist Geometric Trading Mark */}
          <path d="M4 14l5-5 4 4 7-7" className="text-teal-400 stroke-current" />
          <path d="M14 6h6v6" className="text-teal-400 stroke-current" />
          <circle cx="4" cy="14" r="1.5" className="fill-teal-400 text-teal-400" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-extrabold text-white tracking-tight text-base sm:text-lg">
              Trade<span className="text-teal-400 font-bold">Money</span>Maker
            </span>
            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#131a26] border border-[#1e2738]">
              MT5
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans tracking-wide">
            Automação Quantitativa
          </span>
        </div>
      )}
    </div>
  );
};
