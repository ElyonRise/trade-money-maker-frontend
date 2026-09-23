import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  Wifi,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    activeAccount,
    selectAccount,
    addAccount,
    deleteAccount,
    toggleConnectAccount,
    testAccountConnection,
  } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string; success: boolean } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('ICMarketsSC-Demo');
  const [env, setEnv] = useState<'PAPER' | 'DEMO' | 'LIVE'>('DEMO');
  const [formError, setFormError] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await testAccountConnection(id);
      setTestResult({ id, msg: res.message, success: res.success });
    } catch (e: any) {
      setTestResult({ id, msg: 'Falha de comunicação com o terminal MT5.', success: false });
    } finally {
      setTestingId(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !login.trim() || !password.trim() || !server.trim()) {
      setFormError('Preencha todos os campos obrigatórios.');
      return;
    }

    const numLogin = parseInt(login.trim(), 10);
    if (isNaN(numLogin)) {
      setFormError('O Login MT5 deve ser estritamente numérico.');
      return;
    }

    addAccount({
      accountName: name.trim(),
      login: numLogin,
      passwordMasked: password,
      server: server.trim(),
      environment: env,
    });

    setName('');
    setLogin('');
    setPassword('');
    setFormError(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-400" />
            Contas MetaTrader 5
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie suas credenciais e conexões com corretoras MT5.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Conta MT5
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const isActive = activeAccount?.id === acc.id;
          const isConnected = acc.status === 'CONNECTED';

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl bg-[#121824] border transition space-y-4 ${
                isActive
                  ? 'border-teal-500/50 shadow-sm'
                  : 'border-[#1e2738] hover:border-slate-700'
              }`}
            >
              {/* Account Title & Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{acc.accountName}</h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Servidor: {acc.server}
                  </div>
                </div>
                <Badge type="environment" value={acc.environment} />
              </div>

              {/* Account Details Box */}
              <div className="p-3 rounded-xl bg-[#0c1017] border border-[#1e2738] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Login MT5</span>
                  <span className="font-mono font-bold text-white">***{String(acc.login).slice(-3)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Status</span>
                  <Badge type="mt5" value={acc.status} />
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Saldo</span>
                  <span className="font-mono font-bold text-white">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Alavancagem</span>
                  <span className="font-mono text-slate-300">1:{acc.leverage}</span>
                </div>
              </div>

              {/* Connection test result banner */}
              {testResult && testResult.id === acc.id && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                    testResult.success
                      ? 'bg-[#122420] border-teal-800/40 text-teal-300'
                      : 'bg-[#2a171c] border-rose-800/40 text-rose-300'
                  }`}
                >
                  <span className="text-[11px]">{testResult.msg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => selectAccount(acc.id)}
                  disabled={isActive}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition text-center cursor-pointer ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-[#18202d] hover:bg-[#202b3d] text-slate-200'
                  }`}
                >
                  {isActive ? 'Ativa' : 'Selecionar'}
                </button>

                <button
                  onClick={() => handleTest(acc.id)}
                  disabled={testingId === acc.id}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-[#18202d] hover:bg-[#202b3d] text-slate-200 transition text-center flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {testingId === acc.id ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wifi className="w-3 h-3 text-teal-400" />
                  )}
                  Testar
                </button>

                <button
                  onClick={() => toggleConnectAccount(acc.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1 cursor-pointer ${
                    isConnected
                      ? 'bg-[#262115] hover:bg-[#332a19] text-amber-300 border border-amber-800/30'
                      : 'bg-[#122420] hover:bg-[#1a332c] text-teal-300 border border-teal-800/30'
                  }`}
                >
                  {isConnected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>

              {/* Delete Button */}
              {accounts.length > 1 && (
                <div className="text-right pt-1">
                  <button
                    onClick={() => {
                      if (confirm(`Deseja remover a conta ${acc.accountName}?`)) {
                        deleteAccount(acc.id);
                      }
                    }}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[#202b3d] bg-[#121824] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#1c2536] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Adicionar Conta MT5</h3>
                <p className="text-xs text-slate-400">Conecte sua conta DEMO ou REAL</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl text-xs bg-[#2a171c] border border-rose-800/40 text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Robô Principal - IC Markets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Login MT5</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 5092184"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#0c1017] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Conta</label>
                  <select
                    value={env}
                    onChange={(e) => setEnv(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="DEMO">DEMO (Demonstrativa)</option>
                    <option value="LIVE">REAL (Negociação Real)</option>
                    <option value="PAPER">SIMULAÇÃO (Papel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Senha de Trading MT5</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Senha da conta na corretora"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0c1017] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Servidor MT5</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ICMarketsSC-Demo ou Pepperstone-Edge01"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#0c1017] border border-[#202b3d] text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1c2536]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer shadow-sm"
                >
                  Cadastrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
