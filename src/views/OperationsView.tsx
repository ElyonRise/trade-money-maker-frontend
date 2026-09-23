import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Download,
  Filter,
  History,
  Search,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

export const OperationsView: React.FC = () => {
  const {
    activeAccount,
    positions,
    pendingOrders,
    trades,
    closePosition,
    closeAllPositions,
    cancelAllOrders,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'positions' | 'pending' | 'history'>('positions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    actionType: 'DESTRUCTIVE' | 'CRITICAL' | 'RISK_UPDATE' | 'START';
    description: string;
    onConfirm: (key: string) => void;
  }>({
    isOpen: false,
    title: '',
    actionType: 'DESTRUCTIVE',
    description: '',
    onConfirm: () => {},
  });

  if (!activeAccount) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Selecione uma conta MetaTrader para visualizar as operações.
      </div>
    );
  }

  const filteredPositions = positions.filter((p) => {
    const matchesSearch = p.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredPending = pendingOrders.filter((p) => {
    const matchesSearch = p.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredTrades = trades.filter((t) => {
    const matchesSearch = t.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCloseAll = () => {
    setModalState({
      isOpen: true,
      title: 'Fechar Todas as Posições',
      actionType: 'DESTRUCTIVE',
      description: 'Todas as posições abertas nesta conta serão fechadas imediatamente a mercado.',
      onConfirm: (key) => {
        closeAllPositions();
      },
    });
  };

  const handleCancelAllPending = () => {
    setModalState({
      isOpen: true,
      title: 'Cancelar Todas as Ordens Pendentes',
      actionType: 'CRITICAL',
      description: 'Todas as ordens de limite e stop serão canceladas no terminal MT5.',
      onConfirm: (key) => {
        cancelAllOrders();
      },
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            Operações no MT5
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoramento em tempo real de posições ativas, ordens pendentes e histórico executado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'positions' && positions.length > 0 && (
            <button
              onClick={handleCloseAll}
              className="px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-[#2a171c] hover:bg-rose-700 border border-rose-800/40 rounded-xl transition cursor-pointer"
            >
              Fechar Todas ({positions.length})
            </button>
          )}

          {activeTab === 'pending' && pendingOrders.length > 0 && (
            <button
              onClick={handleCancelAllPending}
              className="px-3.5 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-[#262115] hover:bg-amber-700 border border-amber-800/40 rounded-xl transition cursor-pointer"
            >
              Cancelar Pendentes ({pendingOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Reference pill style) */}
      <div className="flex items-center justify-between border-b border-[#1c2536] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'positions'
                ? 'bg-[#122420] text-teal-300 border border-teal-800/40'
                : 'text-slate-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            Posições Abertas ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#122420] text-teal-300 border border-teal-800/40'
                : 'text-slate-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            Ordens Pendentes ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#122420] text-teal-300 border border-teal-800/40'
                : 'text-slate-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            Histórico Executado ({trades.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative hidden sm:block w-48">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar por ativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0c1017] border border-[#1e2738] text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738]">
        {/* POSITIONS TAB */}
        {activeTab === 'positions' && (
          <div>
            {filteredPositions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Nenhuma posição aberta no momento para os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1c2536] text-slate-400 font-sans">
                      <th className="pb-3">Ticket</th>
                      <th className="pb-3">Ativo</th>
                      <th className="pb-3">Tipo</th>
                      <th className="pb-3">Lote</th>
                      <th className="pb-3">Abertura</th>
                      <th className="pb-3">Preço Atual</th>
                      <th className="pb-3">Stop Loss</th>
                      <th className="pb-3">Take Profit</th>
                      <th className="pb-3">Resultado</th>
                      <th className="pb-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18202e] text-slate-300">
                    {filteredPositions.map((pos) => (
                      <tr key={pos.ticket}>
                        <td className="py-3 text-slate-400">#{pos.ticket}</td>
                        <td className="py-3 font-bold text-white font-sans">{pos.symbol}</td>
                        <td className="py-3">
                          <Badge type="order" value={pos.type} />
                        </td>
                        <td className="py-3 text-slate-200">{pos.lots.toFixed(2)}</td>
                        <td className="py-3">{pos.openPrice.toFixed(4)}</td>
                        <td className="py-3">{pos.currentPrice.toFixed(4)}</td>
                        <td className="py-3 text-slate-400">{pos.sl.toFixed(4)}</td>
                        <td className="py-3 text-slate-400">{pos.tp.toFixed(4)}</td>
                        <td className="py-3 font-bold">
                          <span className={pos.profit >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                            {pos.profit >= 0 ? '+' : ''}${pos.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 text-right font-sans">
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
        )}

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div>
            {filteredPending.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Nenhuma ordem pendente aguardando execução.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1c2536] text-slate-400 font-sans">
                      <th className="pb-3">Ticket</th>
                      <th className="pb-3">Ativo</th>
                      <th className="pb-3">Tipo</th>
                      <th className="pb-3">Lote</th>
                      <th className="pb-3">Preço Alvo</th>
                      <th className="pb-3">Atual</th>
                      <th className="pb-3">SL</th>
                      <th className="pb-3">TP</th>
                      <th className="pb-3">Criada em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18202e] text-slate-300">
                    {filteredPending.map((p) => (
                      <tr key={p.ticket}>
                        <td className="py-3 text-slate-400">#{p.ticket}</td>
                        <td className="py-3 font-bold text-white font-sans">{p.symbol}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141d2a] text-slate-300 border border-[#202c3e]">
                            {p.type}
                          </span>
                        </td>
                        <td className="py-3 text-slate-200">{p.lots.toFixed(2)}</td>
                        <td className="py-3 text-teal-400 font-semibold">{p.targetPrice.toFixed(4)}</td>
                        <td className="py-3 text-slate-300">{p.currentPrice.toFixed(4)}</td>
                        <td className="py-3 text-slate-400">{p.sl.toFixed(4)}</td>
                        <td className="py-3 text-slate-400">{p.tp.toFixed(4)}</td>
                        <td className="py-3 text-slate-500 text-[11px]">{p.createdTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            {filteredTrades.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Nenhum trade encerrado registrado nesta sessão.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1c2536] text-slate-400 font-sans">
                      <th className="pb-3">Ticket</th>
                      <th className="pb-3">Ativo</th>
                      <th className="pb-3">Tipo</th>
                      <th className="pb-3">Lote</th>
                      <th className="pb-3">Entrada</th>
                      <th className="pb-3">Saída</th>
                      <th className="pb-3">Lucro / PnL</th>
                      <th className="pb-3">Motivo</th>
                      <th className="pb-3">Duração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18202e] text-slate-300">
                    {filteredTrades.map((t) => (
                      <tr key={t.ticket}>
                        <td className="py-3 text-slate-400">#{t.ticket}</td>
                        <td className="py-3 font-bold text-white font-sans">{t.symbol}</td>
                        <td className="py-3">
                          <Badge type="order" value={t.type} />
                        </td>
                        <td className="py-3 text-slate-200">{t.lots.toFixed(2)}</td>
                        <td className="py-3">{t.openPrice.toFixed(4)}</td>
                        <td className="py-3">{t.closePrice.toFixed(4)}</td>
                        <td className="py-3 font-bold">
                          <span className={t.profit >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                            {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 text-[11px] font-sans text-slate-400">{t.closeReason}</td>
                        <td className="py-3 text-[11px] text-slate-500">{t.durationSeconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
