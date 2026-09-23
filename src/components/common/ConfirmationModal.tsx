import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Lock, X } from 'lucide-react';
import { BrokerAccount } from '../../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  actionType: 'DESTRUCTIVE' | 'CRITICAL' | 'RISK_UPDATE' | 'START';
  description: string;
  account: BrokerAccount | null;
  onConfirm: (idempotencyKey: string) => Promise<void> | void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  actionType,
  description,
  account,
  onConfirm,
  onCancel,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const maskedLogin = account ? `***${String(account.login).slice(-3)}` : 'N/A';
  const isConfirmWordMatch = confirmText.trim().toUpperCase() === 'CONFIRMAR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmWordMatch) return;

    setLoading(true);
    setError(null);
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await onConfirm(idempotencyKey);
      setConfirmText('');
      setLoading(false);
      onCancel();
    } catch (err: any) {
      setError(err?.message || 'Falha na confirmação da operação.');
      setLoading(false);
    }
  };

  const isSevere = actionType === 'DESTRUCTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#202b3d] bg-[#121824] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#1c2536] bg-[#0e141f]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isSevere ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40' : 'bg-[#182633] text-teal-300 border border-teal-800/30'
              }`}
            >
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-slate-400">Confirmação de comando operacional</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Details Box */}
          <div className="p-3.5 rounded-xl border border-[#1e2738] bg-[#0c1017] space-y-2 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Conta Selecionada
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500">Nome: </span>
                <span className="font-semibold text-white">{account?.accountName || 'Nenhuma conta'}</span>
              </div>
              <div>
                <span className="text-slate-500">Login MT5: </span>
                <span className="font-mono font-semibold text-teal-400">{maskedLogin}</span>
              </div>
              <div>
                <span className="text-slate-500">Servidor: </span>
                <span className="font-semibold text-slate-200">{account?.server || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Tipo: </span>
                <span className="font-semibold text-slate-200">
                  {account?.environment === 'LIVE' ? 'Real' : 'Demo'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 rounded-xl border border-[#1e2738] bg-[#0e141f] text-xs leading-relaxed text-slate-300">
            {description}
          </div>

          {/* Mandatory "CONFIRMAR" input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Digite a palavra <span className="font-bold text-teal-400">CONFIRMAR</span> para prosseguir:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CONFIRMAR"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-[#202b3d] text-white font-mono tracking-widest uppercase placeholder-slate-600 focus:outline-none focus:border-teal-500"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl text-xs bg-rose-950/30 border border-rose-800/40 text-rose-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#18202d] hover:bg-[#1f2a3a] rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isConfirmWordMatch || loading}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                isSevere
                  ? 'bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:opacity-40'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Executar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
