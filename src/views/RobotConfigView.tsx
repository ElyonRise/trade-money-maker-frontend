import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Save,
  ShieldAlert,
  Sliders,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { ALL_SYMBOLS } from '../services/storage';

export const RobotConfigView: React.FC = () => {
  const {
    activeAccount,
    activeConfig,
    robotInstance,
    updateRobotConfig,
  } = useAuth();

  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(
    activeConfig?.selectedSymbols || ['EURUSD', 'GBPUSD'],
  );
  const [fixedLot, setFixedLot] = useState<number>(activeConfig?.fixedLot || 0.1);
  const [stopLoss, setStopLoss] = useState<number>(activeConfig?.stopLossPoints || 250);
  const [takeProfit, setTakeProfit] = useState<number>(activeConfig?.takeProfitPoints || 500);
  const [threshold, setThreshold] = useState<number>(activeConfig?.entryScoreThreshold || 65);
  const [reversalThreshold, setReversalThreshold] = useState<number>(
    activeConfig?.reversalThreshold || 75,
  );
  const [maxPositions, setMaxPositions] = useState<number>(activeConfig?.maxOpenPositions || 3);
  const [dailyLoss, setDailyLoss] = useState<number>(activeConfig?.dailyLossLimit || 500);
  const [maxConsecLosses, setMaxConsecLosses] = useState<number>(
    activeConfig?.maxConsecutiveLosses || 3,
  );
  const [correlationLimit, setCorrelationLimit] = useState<number>(
    activeConfig?.correlationLimit || 0.7,
  );
  const [utcStart, setUtcStart] = useState<string>(activeConfig?.utcSessionStart || '07:00');
  const [utcEnd, setUtcEnd] = useState<string>(activeConfig?.utcSessionEnd || '19:00');
  const [breakeven, setBreakeven] = useState<number>(activeConfig?.breakevenTriggerPoints || 150);
  const [trailing, setTrailing] = useState<number>(activeConfig?.trailingStopPoints || 100);
  const [signalConf, setSignalConf] = useState<number>(
    activeConfig?.signalConfirmationMinutes || 2,
  );
  const [cooldown, setCooldown] = useState<number>(activeConfig?.entryCooldownMinutes || 15);

  const [saveSuccess, setSaveSuccess] = useState(false);

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

  if (!activeAccount || !activeConfig) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Selecione uma conta MetaTrader para editar as configurações.
      </div>
    );
  }

  const toggleSymbol = (sym: string) => {
    if (selectedSymbols.includes(sym)) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
    } else {
      setSelectedSymbols([...selectedSymbols, sym]);
    }
  };

  const handleSelectAllSymbols = () => {
    setSelectedSymbols(ALL_SYMBOLS.map((s) => s.symbol));
  };

  const handleClearSymbols = () => {
    setSelectedSymbols([]);
  };

  const handleSaveConfig = () => {
    commitSave();
  };

  const commitSave = () => {
    updateRobotConfig({
      selectedSymbols,
      fixedLot,
      stopLossPoints: stopLoss,
      takeProfitPoints: takeProfit,
      entryScoreThreshold: threshold,
      reversalThreshold,
      maxOpenPositions: maxPositions,
      dailyLossLimit: dailyLoss,
      maxConsecutiveLosses: maxConsecLosses,
      correlationLimit,
      utcSessionStart: utcStart,
      utcSessionEnd: utcEnd,
      breakevenTriggerPoints: breakeven,
      trailingStopPoints: trailing,
      signalConfirmationMinutes: signalConf,
      entryCooldownMinutes: cooldown,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isAllSelected = selectedSymbols.length === 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            Configuração do Robô
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento de volume, gatilhos técnicos e limites operacionais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Configurações Salvas
            </span>
          )}
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* Account Info Pill */}
      <div className="p-3.5 rounded-2xl bg-[#121824] border border-[#1e2738] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Conta:</span>
          <span className="font-semibold text-white">{activeAccount.accountName}</span>
          <span className="font-mono text-teal-400">***{String(activeAccount.login).slice(-3)}</span>
          <Badge type="environment" value={activeAccount.environment} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Estado:</span>
          <Badge type="robot" value={robotInstance?.currentState || 'STOPPED'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Asset Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Ativos Negociados
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nenhum marcado = opera todos os símbolos disponíveis.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllSymbols}
                  className="px-2.5 py-1 rounded-lg bg-[#18202e] hover:bg-[#202b3d] text-teal-300 font-medium text-[11px] cursor-pointer"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={handleClearSymbols}
                  className="px-2.5 py-1 rounded-lg bg-[#18202e] hover:bg-[#202b3d] text-slate-400 font-medium text-[11px] cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Selection Mode Notice */}
            <div className="p-3 rounded-xl border border-[#1e2738] bg-[#0c1017] text-xs leading-relaxed text-slate-300">
              {isAllSelected ? (
                <span>Modo Aberto: O robô monitorará todos os símbolos disponíveis no MT5.</span>
              ) : (
                <span>
                  Modo Filtrado: Operando exclusivamente os <strong className="text-teal-400">{selectedSymbols.length}</strong> ativos selecionados.
                </span>
              )}
            </div>

            {/* Symbols Checklist */}
            <div className="space-y-2">
              {ALL_SYMBOLS.map((item) => {
                const checked = selectedSymbols.includes(item.symbol);
                return (
                  <div
                    key={item.symbol}
                    onClick={() => toggleSymbol(item.symbol)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer select-none ${
                      checked
                        ? 'bg-[#14232e] border-teal-500/40 text-white'
                        : 'bg-[#0c1017] border-[#1e2738] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          checked ? 'bg-teal-500 border-teal-400 text-slate-950' : 'border-slate-700 bg-[#121824]'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{item.symbol}</div>
                        <div className="text-[10px] text-slate-400">{item.name}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#121824] border border-[#1e2738]">
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Parameters & Risk */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Execution Parameters */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              Parâmetros de Entrada & Execução
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Lote Fixo */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-300">Volume / Lote de Entrada</label>
                  <span className="font-mono font-bold text-teal-400 text-sm">{fixedLot.toFixed(2)} lote</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.0"
                  value={fixedLot}
                  onChange={(e) => setFixedLot(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#121824] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500 font-bold"
                />
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
                  {[0.01, 0.02, 0.03, 0.05, 0.10, 0.20, 0.50, 1.00].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFixedLot(preset)}
                      className={`py-1 rounded text-xs font-mono transition cursor-pointer border ${
                        fixedLot === preset
                          ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                          : 'bg-[#121824] text-slate-300 border-[#1e2738] hover:bg-[#1a2333]'
                      }`}
                    >
                      {preset.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stop Loss Points */}
              <div className="p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-300">Stop Loss (Pontos)</label>
                  <span className="font-mono font-bold text-rose-300 text-xs">{stopLoss} pts</span>
                </div>
                <input
                  type="number"
                  step="10"
                  min="50"
                  max="5000"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#121824] border border-[#202b3d] text-rose-300 focus:outline-none focus:border-rose-500 font-bold"
                />
                <div className="grid grid-cols-3 gap-1">
                  {[100, 150, 200, 250, 300, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStopLoss(preset)}
                      className={`py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                        stopLoss === preset
                          ? 'bg-[#2a171c] text-rose-300 border-rose-800/60 font-bold'
                          : 'bg-[#121824] text-slate-400 border-[#1e2738] hover:bg-[#1a2333]'
                      }`}
                    >
                      {preset} pts
                    </button>
                  ))}
                </div>
              </div>

              {/* Take Profit Points */}
              <div className="p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-300">Take Profit (Pontos)</label>
                  <span className="font-mono font-bold text-teal-300 text-xs">{takeProfit} pts</span>
                </div>
                <input
                  type="number"
                  step="10"
                  min="50"
                  max="10000"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseInt(e.target.value, 10) || 200)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#121824] border border-[#202b3d] text-teal-300 focus:outline-none focus:border-teal-500 font-bold"
                />
                <div className="grid grid-cols-3 gap-1">
                  {[150, 200, 300, 500, 750, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTakeProfit(preset)}
                      className={`py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                        takeProfit === preset
                          ? 'bg-[#122622] text-teal-300 border-teal-800/60 font-bold'
                          : 'bg-[#121824] text-slate-400 border-[#1e2738] hover:bg-[#1a2333]'
                      }`}
                    >
                      {preset} pts
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2738] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-300">Pontuação Mínima de Entrada (Threshold)</label>
                  <span className="font-mono font-bold text-teal-400 text-xs">{threshold} pts</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50 pts (Agressivo)</span>
                  <span className="font-bold text-teal-400">{threshold} pts</span>
                  <span>90 pts (Conservador)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timing & Cooldown */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              Tempo & Intervalos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Confirmação de Sinal (Min)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={signalConf}
                  onChange={(e) => setSignalConf(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#0c1017] border border-[#1e2738] text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Intervalo Pós-Entrada (Min)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={cooldown}
                  onChange={(e) => setCooldown(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#0c1017] border border-[#1e2738] text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738] space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Limites Operacionais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Máx Posições Abertas</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxPositions}
                  onChange={(e) => setMaxPositions(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#0c1017] border border-[#1e2738] text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Limite Diário de Perda ($)</label>
                <input
                  type="number"
                  step="50"
                  value={dailyLoss}
                  onChange={(e) => setDailyLoss(parseFloat(e.target.value) || 100)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#0c1017] border border-[#1e2738] text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Máx Perdas Consecutivas</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxConsecLosses}
                  onChange={(e) => setMaxConsecLosses(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 font-mono rounded-lg bg-[#0c1017] border border-[#1e2738] text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
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
