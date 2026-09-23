import React from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  DollarSign,
  Layers,
  Server,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';

interface LandingViewProps {
  onEnterApp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-200 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-[#1a2232] bg-[#0a0d14] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showText={true} />
          </div>
          <button
            onClick={onEnterApp}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            Acessar Painel
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 lg:py-28 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-[#121824] text-teal-300 border border-[#1e2738]">
              Plataforma Profissional SaaS para MetaTrader 5
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Automação de Trading Quantitativo para <span className="text-teal-400">MetaTrader 5</span>
            </h1>

            <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Cockpit centralizado para ligar e pausar robôs com 1 clique, ajustar volume de entrada (a partir de 0.01), Stop Loss e Take Profit em pontos.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={onEnterApp}
                className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Abrir Painel MT5
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid (Reference luxury dark cards) */}
        <section className="py-12 px-6 border-t border-[#1a2232] bg-[#0a0d14]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#142422] border border-[#1e3d36] flex items-center justify-center text-teal-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Ajuste Imediato de Parâmetros</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure lote de entrada, Stop Loss e Take Profit em pontos diretamente pelo painel web e aplique instantaneamente à sua conta.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#141f33] border border-[#1d3356] flex items-center justify-center text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Controle Total do Robô</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Botão em destaque para ligar, pausar ou desligar a automação a qualquer momento, com botão de parada geral integrado.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#221c16] border border-[#3d301e] flex items-center justify-center text-amber-400">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Custódia Direta na Corretora</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O capital permanece integralmente na sua corretora de preferência. O software apenas envia comandos técnicos ao terminal MetaTrader 5.
              </p>
            </div>
          </div>
        </section>

        {/* Regulatory & Disclaimer */}
        <section className="py-12 px-6 border-t border-[#1a2232] bg-[#0c1017]">
          <div className="max-w-4xl mx-auto space-y-3 text-xs text-slate-500 leading-relaxed">
            <div className="font-semibold text-slate-400">Aviso Legal e Gestão de Risco</div>
            <p>
              A negociação de ativos no mercado financeiro envolve risco de perda do capital investido. O Trade Money Maker é um software de automação e interface tecnológica, não constituindo recomendação de investimento.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a2232] py-6 px-6 bg-[#0a0d14] text-center text-xs text-slate-500">
        <p className="font-medium text-slate-400">Trade Money Maker — SaaS para MetaTrader 5</p>
        <p className="mt-1 text-[11px] text-slate-600">Não associado à MetaQuotes Software Corp.</p>
      </footer>
    </div>
  );
};
