import React from 'react';
import {
  Bot,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Radio,
  Server,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { activeAccount, robotInstance } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas MT5', icon: Server },
    { id: 'robot', label: 'Configuração do Robô', icon: Bot },
    { id: 'operations', label: 'Operações', icon: History },
    { id: 'logs', label: 'Logs & Auditoria', icon: FileText },
  ];

  return (
    <>
      {/* Desktop Sidebar (Inspired by reference fintech luxury SaaS) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1a2232] bg-[#0a0d14] h-[calc(100vh-4rem)] sticky top-16 select-none">
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#12242e] text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Minimalist MT5 Status Card at the bottom (like wallets/integrations in reference) */}
        <div className="mt-auto p-4 border-t border-[#1a2232]">
          <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1e2738] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                Terminal MT5
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                {activeAccount?.status === 'CONNECTED' ? 'Conectado' : 'Pronto'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {activeAccount?.accountName || 'Nenhuma conta'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Login: ***{String(activeAccount?.login || '000').slice(-3)}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 border-t border-[#1a2232] px-2 py-1.5 backdrop-blur-lg flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                isActive ? 'text-teal-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
