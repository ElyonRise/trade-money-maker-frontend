import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Check,
  Clock,
  DollarSign,
  Minus,
  Pause,
  Play,
  Plus,
  Radio,
  Sliders,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    user,
    activeAccount,
    activeConfig,
    robotInstance,
    positions,
    pendingOrders,
    trades,
    liveSignal,
    updateRobotConfig,
    executeCommand,
    closePosition,
    closeAllPositions,
  } = useAuth();

  // Quick inputs state for Lot, SL and TP
  const [quickLot, setQuickLot] = useState<number>(activeConfig?.fixedLot || 0.02);
  const [quickSL, setQuickSL] = useState<number>(activeConfig?.stopLossPoints || 250);
  const [quickTP, setQuickTP] = useState<number>(activeConfig?.takeProfitPoints || 500);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Timeframe filter state for chart (Reference style 7D / 1M / 1Y)
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '1M' | '1Y'>('1M');

  // Sync with activeConfig changes
  useEffect(() => {
    if (activeConfig) {
      setQuickLot(activeConfig.fixedLot);
      setQuickSL(activeConfig.stopLossPoints);
      setQuickTP(activeConfig.takeProfitPoints);
    }
  }, [activeConfig?.id, activeConfig?.fixedLot, activeConfig?.stopLossPoints, activeConfig?.takeProfitPoints]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    actionType: 'DESTRUCTIVE' | 'CRITICAL' | 'RISK_UPDATE' | 'START';
    description: string;
    onConfirm: (key: string) => void;
  }>({
    isOpen: false,
    title: '',
    actionType: 'CRITICAL',
    description: '',
    onConfirm: () => {},
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleApplyQuickParams = (lotToUse?: number, slToUse?: number, tpToUse?: number) => {
    const lot = lotToUse !== undefined ? lotToUse : quickLot;
    const sl = slToUse !== undefined ? slToUse : quickSL;
    const tp = tpToUse !== undefined ? tpToUse : quickTP;

    if (!activeAccount || !activeConfig) return;

    updateRobotConfig({
      fixedLot: lot,
      stopLossPoints: sl,
      takeProfitPoints: tp,
    });
    setAppliedNotification(`Parâmetros salvos: Lote ${lot.toFixed(2)} | SL ${sl} pts | TP ${tp} pts`);
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  const handleSelectQuickLot = (lot: number) => {
    setQuickLot(lot);
    handleApplyQuickParams(lot, quickSL, quickTP);
  };

  const handleSelectQuickSL = (sl: number) => {
    setQuickSL(sl);
    handleApplyQuickParams(quickLot, sl, quickTP);
  };

  const handleSelectQuickTP = (tp: number) => {
    setQuickTP(tp);
    handleApplyQuickParams(quickLot, quickSL, tp);
  };

  const adjustLotBy = (delta: number) => {
    const newLot = Math.max(0.01, Math.min(10.0, parseFloat((quickLot + delta).toFixed(2))));
    setQuickLot(newLot);
  };

  const handleStart = () => {
    if (!activeAccount) return;
    const res = executeCommand('START');
    showFeedback(res.message);
  };

  const handlePause = () => {
    const res = executeCommand('PAUSE');
    showFeedback(res.message);
  };

  const handleResume = () => {
    const res = executeCommand('RESUME');
    showFeedback(res.message);
  };

  const handleStop = () => {
    setModalState({
      isOpen: true,
      title: 'Desligar Robô',
      actionType: 'CRITICAL',
      description:
        'O robô interromperá novas ordens e a leitura de sinais. As posições abertas continuarão protegidas por SL e TP.',
      onConfirm: (key) => {
        const res = executeCommand('STOP', key);
        showFeedback(res.message);
      },
    });
  };

  const handleEmergencyStop = () => {
    setModalState({
      isOpen: true,
      title: 'Parada de Emergência',
      actionType: 'DESTRUCTIVE',
      description:
        'Todas as posições abertas serão fechadas imediatamente a mercado e o robô será completamente desarmado.',
      onConfirm: (key) => {
        const res = executeCommand('EMERGENCY_STOP', key);
        showFeedback(res.message);
      },
    });
  };

  const handleCloseAll = () => {
    setModalState({
      isOpen: true,
      title: 'Fechar Todas as Posições',
      actionType: 'DESTRUCTIVE',
      description: 'Todas as posições abertas nesta conta serão encerradas imediatamente a mercado.',
      onConfirm: (key) => {
        const res = executeCommand('CLOSE_ALL', key);
        showFeedback(res.message);
      },
    });
  };

  if (!activeAccount) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-bold text-white">Nenhuma conta cadastrada</h2>
        <p className="text-xs text-slate-400">Adicione uma conta MT5 para visualizar o painel.</p>
        <button
          onClick={() => onNavigate('accounts')}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer"
        >
          Adicionar Conta
        </button>
      </div>
    );
  }

  const isRobotRunning = robotInstance?.currentState === 'RUNNING';
  const isRobotPaused = robotInstance?.currentState === 'PAUSED';

  const netFloatingProfit = positions.reduce((acc, p) => acc + p.profit, 0);
  const totalDailyProfit = (robotInstance?.dailyPnL || 0) + netFloatingProfit;

  const LOT_PRESETS = [0.01, 0.02, 0.03, 0.05, 0.10, 0.20, 0.50, 1.00];
  const SL_PRESETS = [100, 150, 200, 250, 300, 500];
  const TP_PRESETS = [150, 200, 300, 500, 750, 1000];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Greeting Header (Inspired by reference "Hey Mr. Hasan / Welcome back! Here's your financial overview.") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Olá, {user.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão geral da sua operação no MetaTrader 5.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge type="environment" value={activeAccount.environment} />
          <div className="text-xs text-slate-400 font-mono">
            {activeAccount.server}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-[#122420] border border-teal-800/40 text-teal-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {appliedNotification && (
        <div className="p-3 rounded-xl bg-[#14232e] border border-cyan-800/40 text-cyan-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-teal-400" />
          <span>{appliedNotification}</span>
        </div>
      )}

      {/* 4 Financial Metric Cards (Directly matching reference image layout and discrete icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Balance */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Saldo da Conta</span>
            <div className="w-7 h-7 rounded-lg bg-[#142422] border border-[#1e3d36] flex items-center justify-center text-teal-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              ${activeAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-teal-400 font-medium mt-1">
              Alavancagem 1:{activeAccount.leverage}
            </div>
          </div>
        </div>

        {/* Card 2: Equity */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Patrimônio Líquido</span>
            <div className="w-7 h-7 rounded-lg bg-[#141f33] border border-[#1d3356] flex items-center justify-center text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              ${(activeAccount.balance + netFloatingProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Flutuante: <span className={netFloatingProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                {netFloatingProfit >= 0 ? '+' : ''}${netFloatingProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Daily Profit */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resultado do Dia</span>
            <div className="w-7 h-7 rounded-lg bg-[#142422] border border-[#1e3d36] flex items-center justify-center text-teal-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono flex items-center gap-1 text-white">
              <span className={totalDailyProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                {totalDailyProfit >= 0 ? '+' : ''}${totalDailyProfit.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Limite diário: -${activeConfig?.dailyLossLimit.toFixed(2) || '500.00'}
            </div>
          </div>
        </div>

        {/* Card 4: Positions */}
        <div className="p-5 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Posições & Ordens</span>
            <div className="w-7 h-7 rounded-lg bg-[#221c16] border border-[#3d301e] flex items-center justify-center text-amber-400">
              <Sliders className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">
              {positions.length}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {pendingOrders.length} pendentes</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Máx permitido: {activeConfig?.maxOpenPositions || 3}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Robot Cockpit Panel (Clean, Matte Luxury SaaS style) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#1c2536]">
          {/* Status & Label */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  isRobotRunning
                    ? 'bg-[#122622] text-teal-300 border border-teal-800/50'
                    : isRobotPaused
                    ? 'bg-[#262115] text-amber-300 border border-amber-800/50'
                    : 'bg-[#161c28] text-slate-400 border border-[#232d3e]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRobotRunning ? 'bg-teal-400' : isRobotPaused ? 'bg-amber-400' : 'bg-slate-500'
                  }`}
                />
                {isRobotRunning ? 'ROBÔ LIGADO' : isRobotPaused ? 'ROBÔ PAUSADO' : 'ROBÔ DESLIGADO'}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Conta: {activeAccount.accountName}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Controle direto da automação. Altere o lote de entrada, Stop Loss e Take Profit a qualquer instante.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isRobotRunning ? (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                LIGAR ROBÔ
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePause}
                  className="px-4 py-2.5 rounded-xl bg-[#262115] hover:bg-[#332a19] text-amber-300 border border-amber-800/40 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Pausar
                </button>
                <button
                  onClick={handleStop}
                  className="px-4 py-2.5 rounded-xl bg-[#18202d] hover:bg-[#202b3d] text-slate-200 border border-[#263347] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Desligar
                </button>
              </div>
            )}

            {isRobotPaused && (
              <button
                onClick={handleResume}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Retomar
              </button>
            )}

            <button
              onClick={handleEmergencyStop}
              className="px-3.5 py-2.5 rounded-xl bg-[#2a171c] hover:bg-[#3d1e26] text-rose-300 border border-rose-800/40 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Parada Geral
            </button>
          </div>
        </div>

        {/* Quick Order Parameters Inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Parâmetros Rápidos de Entrada</span>
            <button
              onClick={() => handleApplyQuickParams()}
              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition cursor-pointer"
            >
              Salvar Parâmetros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lote de Entrada */}
            <div className="p-4 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Lote de Entrada</span>
                <span className="font-mono font-bold text-teal-400 text-sm">{quickLot.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustLotBy(-0.01)}
                  className="w-8 h-8 rounded-lg bg-[#161c28] border border-[#232d3e] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.0"
                  value={quickLot}
                  onChange={(e) => setQuickLot(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-xs rounded-lg bg-[#121824] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => adjustLotBy(0.01)}
                  className="w-8 h-8 rounded-lg bg-[#161c28] border border-[#232d3e] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1 pt-1">
                {LOT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectQuickLot(preset)}
                    className={`py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                      quickLot === preset
                        ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                        : 'bg-[#121824] text-slate-400 border-[#1e2738] hover:bg-[#1a2333]'
                    }`}
                  >
                    {preset.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss (Pontos) */}
            <div className="p-4 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Stop Loss</span>
                <span className="font-mono font-semibold text-rose-300 text-xs">{quickSL} pts</span>
              </div>
              <input
                type="number"
                step="10"
                min="50"
                max="5000"
                value={quickSL}
                onChange={(e) => setQuickSL(parseInt(e.target.value, 10) || 100)}
                className="w-full px-3 py-1.5 text-center font-mono font-bold text-xs rounded-lg bg-[#121824] border border-[#202b3d] text-rose-300 focus:outline-none focus:border-rose-500"
              />
              <div className="grid grid-cols-3 gap-1 pt-1">
                {SL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectQuickSL(preset)}
                    className={`py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                      quickSL === preset
                        ? 'bg-[#2a171c] text-rose-300 border-rose-800/60 font-semibold'
                        : 'bg-[#121824] text-slate-400 border-[#1e2738] hover:bg-[#1a2333]'
                    }`}
                  >
                    {preset} pts
                  </button>
                ))}
              </div>
            </div>

            {/* Take Profit (Pontos) */}
            <div className="p-4 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Take Profit</span>
                <span className="font-mono font-semibold text-teal-300 text-xs">{quickTP} pts</span>
              </div>
              <input
                type="number"
                step="10"
                min="50"
                max="10000"
                value={quickTP}
                onChange={(e) => setQuickTP(parseInt(e.target.value, 10) || 200)}
                className="w-full px-3 py-1.5 text-center font-mono font-bold text-xs rounded-lg bg-[#121824] border border-[#202b3d] text-teal-300 focus:outline-none focus:border-teal-500"
              />
              <div className="grid grid-cols-3 gap-1 pt-1">
                {TP_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectQuickTP(preset)}
                    className={`py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                      quickTP === preset
                        ? 'bg-[#122622] text-teal-300 border-teal-800/60 font-semibold'
                        : 'bg-[#121824] text-slate-400 border-[#1e2738] hover:bg-[#1a2333]'
                    }`}
                  >
                    {preset} pts
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Growth Chart + Distribution by Category (Reference layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Equity Growth Chart (Matches "Revenue Growth Over Time" from reference) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Evolução do Patrimônio (Equity)</h3>
              <p className="text-[11px] text-slate-400">Curva de rendimento ponderada</p>
            </div>

            {/* Timeframe pills (Matching 7D / 1M / 1Y in reference) */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0c1017] border border-[#1e2738]">
              {(['7D', '1M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition cursor-pointer ${
                    chartTimeframe === tf
                      ? 'bg-[#1a2636] text-teal-300 font-semibold border border-teal-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart (Sleek dark line chart with refined teal accent matching reference) */}
          <div className="w-full h-52 py-2">
            <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="equityStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <linearGradient id="equityFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="35" x2="400" y2="35" stroke="#1c2536" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="#1c2536" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="400" y2="105" stroke="#1c2536" strokeDasharray="3 3" />

              {/* Area */}
              <polygon
                fill="url(#equityFillGrad)"
                points="0,115 35,108 70,112 110,95 150,98 195,78 240,82 285,55 330,58 370,40 400,35 400,140 0,140"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="url(#equityStrokeGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,115 35,108 70,112 110,95 150,98 195,78 240,82 285,55 330,58 370,40 400,35"
              />

              {/* Points */}
              <circle cx="285" cy="55" r="3.5" fill="#14b8a6" />
              <circle cx="400" cy="35" r="4" fill="#0ea5e9" />
            </svg>
          </div>

          {/* Quick Metrics Footer */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#1c2536] text-center text-xs">
            <div>
              <div className="text-slate-500 text-[10px]">Taxa de Acerto</div>
              <div className="font-bold text-white font-mono mt-0.5">68.4%</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">Fator de Lucro</div>
              <div className="font-bold text-teal-400 font-mono mt-0.5">2.14</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">Rebaixamento Máx</div>
              <div className="font-bold text-slate-300 font-mono mt-0.5">3.2%</div>
            </div>
          </div>
        </div>

        {/* Right Card: Exposure by Asset (Matches "Spending by Categories" donut in reference) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Exposição por Ativos</h3>
            <p className="text-[11px] text-slate-400">Distribuição do volume alocado</p>
          </div>

          {/* Donut Chart SVG (Like reference donut) */}
          <div className="relative w-36 h-36 mx-auto my-2">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Segment 1: EURUSD (Teal) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="12"
                strokeDasharray="95 145"
                strokeDashoffset="0"
              />
              {/* Segment 2: GBPUSD (Cyan) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="12"
                strokeDasharray="60 180"
                strokeDashoffset="-95"
              />
              {/* Segment 3: USDJPY (Slate Blue) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#6366f1"
                strokeWidth="12"
                strokeDasharray="45 195"
                strokeDashoffset="-155"
              />
              {/* Segment 4: XAUUSD (Slate) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#334155"
                strokeWidth="12"
                strokeDasharray="39 201"
                strokeDashoffset="-200"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400">Total</span>
              <span className="font-bold text-sm font-mono text-white">100%</span>
            </div>
          </div>

          {/* Asset legend items */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-white font-sans text-xs">EURUSD</span>
              </span>
              <span>40%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-white font-sans text-xs">GBPUSD</span>
              </span>
              <span>25%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-white font-sans text-xs">USDJPY</span>
              </span>
              <span>20%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-white font-sans text-xs">XAUUSD</span>
              </span>
              <span>15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Scoring Matrix (Quantitative Multi-timeframe) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-white">Análise Multi-Timeframe</h3>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Ativo: <span className="font-bold text-teal-300">{liveSignal?.symbol || 'EURUSD'}</span>
          </div>
        </div>

        {/* Scoring Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c2536] text-slate-400">
                <th className="pb-2 font-medium">TF</th>
                <th className="pb-2 font-medium">Peso</th>
                <th className="pb-2 font-medium">Tendência</th>
                <th className="pb-2 font-medium">RSI (14)</th>
                <th className="pb-2 font-medium">Estrutura</th>
                <th className="pb-2 font-medium text-right">Compra</th>
                <th className="pb-2 font-medium text-right">Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202e] font-mono">
              {liveSignal?.timeframeScores.map((tf) => (
                <tr key={tf.timeframe} className="text-slate-300">
                  <td className="py-2.5 font-bold text-teal-400">{tf.timeframe}</td>
                  <td className="py-2.5 text-slate-400">{tf.weight} pts</td>
                  <td className="py-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        tf.trend === 'BULLISH'
                          ? 'bg-[#112420] text-teal-300'
                          : 'bg-[#28151c] text-rose-300'
                      }`}
                    >
                      {tf.trend}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{tf.rsi.toFixed(1)}</td>
                  <td className="py-2.5 text-[10px] font-sans">
                    <div className="flex gap-1 text-slate-400">
                      {tf.bos && <span className="text-teal-400 font-medium">BOS</span>}
                      {tf.choch && <span className="text-indigo-400 font-medium">CHOCH</span>}
                      {tf.fvg && <span className="text-amber-400 font-medium">FVG</span>}
                      {!tf.bos && !tf.choch && !tf.fvg && <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-teal-400">{tf.buyScore}</td>
                  <td className="py-2.5 text-right font-semibold text-rose-400">{tf.sellScore}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#1c2536] font-mono font-bold text-xs">
                <td colSpan={5} className="pt-2 text-right text-slate-400">
                  TOTAL PONDERADO:
                </td>
                <td className="pt-2 text-right text-teal-400">
                  {liveSignal?.totalBuyScore || 0} pts
                </td>
                <td className="pt-2 text-right text-rose-400">
                  {liveSignal?.totalSellScore || 0} pts
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Active Positions Table (Matches "Transactions Overview" in reference) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Posições no MT5 ({positions.length})</h3>
            <p className="text-[11px] text-slate-400">Ordens abertas em negociação</p>
          </div>
          <div className="flex items-center gap-3">
            {positions.length > 0 && (
              <button
                onClick={handleCloseAll}
                className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-white bg-[#28151c] hover:bg-rose-600 border border-rose-800/40 rounded-xl transition cursor-pointer"
              >
                Fechar Todas ({positions.length})
              </button>
            )}
            <button
              onClick={() => onNavigate('operations')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
            >
              Ver Todas &rarr;
            </button>
          </div>
        </div>

        {positions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-[#1e2738] rounded-xl">
            Nenhuma posição aberta no momento. O robô monitora os ativos configurados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1c2536] text-slate-400 font-sans">
                  <th className="pb-2.5">Ticket</th>
                  <th className="pb-2.5">Ativo</th>
                  <th className="pb-2.5">Tipo</th>
                  <th className="pb-2.5">Lote</th>
                  <th className="pb-2.5">Abertura</th>
                  <th className="pb-2.5">Atual</th>
                  <th className="pb-2.5">SL</th>
                  <th className="pb-2.5">TP</th>
                  <th className="pb-2.5">Resultado</th>
                  <th className="pb-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202e] text-slate-300">
                {positions.map((pos) => (
                  <tr key={pos.ticket}>
                    <td className="py-2.5 text-slate-400">#{pos.ticket}</td>
                    <td className="py-2.5 font-bold text-white font-sans">{pos.symbol}</td>
                    <td className="py-2.5">
                      <Badge type="order" value={pos.type} />
                    </td>
                    <td className="py-2.5 text-slate-200">{pos.lots.toFixed(2)}</td>
                    <td className="py-2.5">{pos.openPrice.toFixed(4)}</td>
                    <td className="py-2.5">{pos.currentPrice.toFixed(4)}</td>
                    <td className="py-2.5 text-slate-400">{pos.sl.toFixed(4)}</td>
                    <td className="py-2.5 text-slate-400">{pos.tp.toFixed(4)}</td>
                    <td className="py-2.5 font-bold">
                      <span className={pos.profit >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                        {pos.profit >= 0 ? '+' : ''}${pos.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <button
                        onClick={() => closePosition(pos.ticket)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 bg-[#28151c] hover:bg-rose-700 hover:text-white rounded-lg transition cursor-pointer"
                      >
                        Fechar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        actionType={modalState.actionType}
        description={modalState.description}
        account={activeAccount}
        onConfirm={modalState.onConfirm}
        onCancel={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
