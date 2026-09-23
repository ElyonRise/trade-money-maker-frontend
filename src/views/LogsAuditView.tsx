import React, { useState } from 'react';
import {
  Clock,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const LogsAuditView: React.FC = () => {
  const { logs, activeAccount } = useAuth();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [componentFilter, setComponentFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const components = Array.from(new Set(logs.map((l) => l.component)));

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesComp = componentFilter === 'ALL' || log.component === componentFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.event.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesComp && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Logs de Execução & Auditoria
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro cronológico de eventos operacionais, ordens e decisões do sistema.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#121824] border border-[#1e2738] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por evento ou mensagem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0c1017] border border-[#1e2738] text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-56 sm:w-64"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Severidade:</span>
            {['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-[#182633] text-teal-300 border border-teal-500/30'
                    : 'bg-[#0c1017] text-slate-400 hover:text-white border border-[#1e2738]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Component Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-[#0c1017] border border-[#1e2738] text-white focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">Todos os Componentes</option>
            {components.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-[#1e2738]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1c2536] text-slate-400 font-sans">
                <th className="pb-3 w-40">Timestamp</th>
                <th className="pb-3 w-24">Nível</th>
                <th className="pb-3 w-32">Componente</th>
                <th className="pb-3 w-36">Evento</th>
                <th className="pb-3">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202e] text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#141b28]/50 transition">
                  <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    <span className="text-[10px] text-slate-500">
                      .{new Date(log.timestamp).getMilliseconds()}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Badge type="severity" value={log.severity} />
                  </td>
                  <td className="py-2.5 text-teal-400 font-semibold">{log.component}</td>
                  <td className="py-2.5 text-slate-300 font-semibold">{log.event}</td>
                  <td className="py-2.5 text-slate-300 font-sans text-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
