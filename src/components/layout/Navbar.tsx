import React from 'react';
import {
  Bell,
  ChevronDown,
  Radio,
  Search,
  Server,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { Badge } from '../common/Badge';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTab }) => {
  const { user, accounts, activeAccount, selectAccount, robotInstance } = useAuth();

  return (
    <header className="h-16 border-b border-[#1a2232] bg-[#0a0d14] sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand Logo & Account Switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <AppLogo size="sm" showText={true} />
        </button>

        {/* Account Quick Switcher */}
        {activeAccount && (
          <div className="hidden md:flex items-center ml-2 pl-4 border-l border-[#1a2232]">
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121824] border border-[#1e2738] hover:border-slate-600 transition text-xs cursor-pointer">
                <Server className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-medium text-slate-200">{activeAccount.accountName}</span>
                <span className="font-mono text-[11px] text-slate-400">
                  (***{String(activeAccount.login).slice(-3)})
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-[#121824] border border-[#202b3d] shadow-2xl p-1.5 hidden group-hover:block z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contas MetaTrader 5
                </div>
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => selectAccount(acc.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      acc.id === activeAccount.id
                        ? 'bg-[#182633] text-teal-300 font-semibold'
                        : 'text-slate-300 hover:bg-[#18202e]'
                    }`}
                  >
                    <div>
                      <div className="truncate max-w-[140px]">{acc.accountName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ***{String(acc.login).slice(-3)} • {acc.server}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="pt-1.5 mt-1 border-t border-[#1e2738]">
                  <button
                    onClick={() => onSelectTab('accounts')}
                    className="w-full text-center py-1 text-xs text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                  >
                    + Gerenciar Contas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Search Input (Directly inspired by reference screenshot) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ativos, ordens, tickets..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-[#121824] border border-[#1e2738] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
          />
        </div>
      </div>

      {/* Right Controls (Reference style: rounded icon buttons + profile pill) */}
      <div className="flex items-center gap-2.5">
        {/* MT5 Status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121824] border border-[#1e2738] text-[11px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span>MT5 Conectado</span>
        </div>

        {/* Robot State Badge */}
        {robotInstance && (
          <div className="hidden lg:flex items-center">
            <Badge type="robot" value={robotInstance.currentState} />
          </div>
        )}

        {/* Notifications Icon (Reference button) */}
        <button
          onClick={() => onSelectTab('logs')}
          title="Notificações & Logs"
          className="w-8 h-8 rounded-full bg-[#121824] border border-[#1e2738] hover:border-slate-600 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* Settings Icon (Reference button) */}
        <button
          onClick={() => onSelectTab('robot')}
          title="Configurações do Robô"
          className="w-8 h-8 rounded-full bg-[#121824] border border-[#1e2738] hover:border-slate-600 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Avatar (Reference style) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1a2232]">
          <div className="w-8 h-8 rounded-full bg-[#141e2e] border border-[#26354d] flex items-center justify-center text-teal-400 font-bold text-xs">
            {user.fullName.charAt(0)}
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-semibold text-slate-200">{user.fullName}</div>
            <div className="text-[10px] text-slate-500 font-mono">Trader MT5</div>
          </div>
        </div>
      </div>
    </header>
  );
};
