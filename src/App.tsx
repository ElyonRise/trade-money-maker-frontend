import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthProvider } from './context/AuthContext';
import { AccountsView } from './views/AccountsView';
import { DashboardView } from './views/DashboardView';
import { LandingView } from './views/LandingView';
import { LogsAuditView } from './views/LogsAuditView';
import { OperationsView } from './views/OperationsView';
import { RobotConfigView } from './views/RobotConfigView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLanding, setIsLanding] = useState<boolean>(false);

  return (
    <AuthProvider>
      {isLanding ? (
        <LandingView onEnterApp={() => setIsLanding(false)} />
      ) : (
        <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
          <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

          <div className="flex-1 flex pb-16 md:pb-0">
            <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

            <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#0a0d14]">
              {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
              {currentTab === 'accounts' && <AccountsView />}
              {currentTab === 'robot' && <RobotConfigView />}
              {currentTab === 'operations' && <OperationsView />}
              {currentTab === 'logs' && <LogsAuditView />}
            </main>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}
