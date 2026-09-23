import React from 'react';
import { EnvironmentMode, MT5Status, RobotState } from '../../types';

interface BadgeProps {
  type: 'environment' | 'robot' | 'mt5' | 'order' | 'severity';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  if (type === 'environment') {
    const env = value as EnvironmentMode;
    if (env === 'LIVE') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#16202e] text-slate-200 border border-[#25354c] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          CONTA REAL
        </span>
      );
    }
    if (env === 'DEMO') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#141c28] text-slate-300 border border-[#202c3e] ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          DEMO
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-[#121822] text-slate-400 border border-[#1c2433] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        SIMULAÇÃO
      </span>
    );
  }

  if (type === 'robot') {
    const state = value as RobotState;
    if (state === 'RUNNING') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#112420] text-teal-300 border border-teal-800/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          LIGADO (OPERANDO)
        </span>
      );
    }
    if (state === 'PAUSED') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#262115] text-amber-300 border border-amber-800/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          PAUSADO
        </span>
      );
    }
    if (state === 'EMERGENCY_STOP') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2a171c] text-rose-300 border border-rose-800/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          PARADA ACIONADA
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#141a24] text-slate-400 border border-[#1f2838] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        DESLIGADO
      </span>
    );
  }

  if (type === 'mt5') {
    const ms = value as MT5Status;
    if (ms === 'CONNECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          Conectado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Desconectado
      </span>
    );
  }

  if (type === 'order') {
    if (value === 'BUY') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#112420] text-teal-300 border border-teal-800/50">
          BUY
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#28151c] text-rose-300 border border-rose-800/50">
        SELL
      </span>
    );
  }

  if (type === 'severity') {
    if (value === 'CRITICAL') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2a171c] text-rose-300 border border-rose-800/50">CRÍTICO</span>;
    }
    if (value === 'ERROR') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#2a171c] text-rose-300 border border-rose-800/40">ERRO</span>;
    }
    if (value === 'WARNING') {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#262115] text-amber-300 border border-amber-800/40">ALERTA</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#141a24] text-slate-300 border border-[#1f2838]">INFO</span>;
  }

  return <span className={className}>{value}</span>;
};
