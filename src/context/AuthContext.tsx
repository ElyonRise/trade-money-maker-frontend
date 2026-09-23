import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import {
  AuditLog,
  BrokerAccount,
  ExecutedTrade,
  PendingOrder,
  Position,
  RobotConfiguration,
  RobotInstance,
  StrategySignal,
  User,
  WorkerNode,
} from '../types';

interface AuthContextType {
  user: User;
  accounts: BrokerAccount[];
  activeAccount: BrokerAccount | null;
  activeConfig: RobotConfiguration | null;
  robotInstance: RobotInstance | null;
  positions: Position[];
  pendingOrders: PendingOrder[];
  trades: ExecutedTrade[];
  logs: AuditLog[];
  workers: WorkerNode[];
  liveSignal: StrategySignal | null;
  login: (email: string) => void;
  logout: () => void;
  selectAccount: (id: string) => void;
  addAccount: (data: {
    accountName: string;
    login: number;
    passwordMasked: string;
    server: string;
    environment: 'PAPER' | 'DEMO' | 'LIVE';
  }) => BrokerAccount;
  deleteAccount: (id: string) => void;
  toggleConnectAccount: (id: string) => void;
  testAccountConnection: (id: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  updateRobotConfig: (updates: Partial<RobotConfiguration>) => void;
  executeCommand: (
    command:
      | 'START'
      | 'PAUSE'
      | 'RESUME'
      | 'STOP'
      | 'RESTART'
      | 'BLOCK_ENTRIES'
      | 'UNBLOCK_ENTRIES'
      | 'EMERGENCY_STOP'
      | 'CLOSE_ALL'
      | 'CANCEL_PENDING',
    idempotencyKey?: string,
  ) => { success: boolean; message: string };
  closePosition: (ticket: number) => void;
  closeAllPositions: () => number;
  cancelAllOrders: () => number;
  toggleAllowRealTrading: (allow: boolean) => void;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(storageService.getCurrentUser());
  const [accounts, setAccounts] = useState<BrokerAccount[]>(storageService.getAccounts());
  const [activeAccount, setActiveAccount] = useState<BrokerAccount | null>(storageService.getActiveAccount());
  const [activeConfig, setActiveConfig] = useState<RobotConfiguration | null>(null);
  const [robotInstance, setRobotInstance] = useState<RobotInstance | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [trades, setTrades] = useState<ExecutedTrade[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [workers, setWorkers] = useState<WorkerNode[]>(storageService.getWorkers());
  const [liveSignal, setLiveSignal] = useState<StrategySignal | null>(null);

  const refreshData = () => {
    const accs = storageService.getAccounts();
    setAccounts([...accs]);
    const active = storageService.getActiveAccount();
    setActiveAccount(active);

    if (active) {
      const cfg = storageService.getConfiguration(active.id);
      setActiveConfig({ ...cfg });
      const inst = storageService.getInstance(active.id);
      setRobotInstance({ ...inst });
      setPositions([...storageService.getPositions(active.id)]);
      setPendingOrders([...storageService.getPendingOrders(active.id)]);
      setTrades([...storageService.getExecutedTrades(active.id)]);

      const targetSymbol = cfg.selectedSymbols[0] || 'EURUSD';
      const sig = storageService.calculateLiveStrategySignal(targetSymbol, cfg.entryScoreThreshold);
      setLiveSignal(sig);
    } else {
      setActiveConfig(null);
      setRobotInstance(null);
      setPositions([]);
      setPendingOrders([]);
      setTrades([]);
      setLiveSignal(null);
    }

    setLogs([...storageService.getAuditLogs()]);
    setWorkers([...storageService.getWorkers()]);
  };

  useEffect(() => {
    refreshData();
    // Live tick every 4 seconds to simulate heartbeat and market updates
    const interval = setInterval(() => {
      refreshData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const login = (email: string) => {
    const u = storageService.loginUser(email);
    setUser({ ...u });
    refreshData();
  };

  const logout = () => {
    login('trader@trademoneymaker.com');
  };

  const selectAccount = (id: string) => {
    storageService.setActiveAccount(id);
    refreshData();
  };

  const addAccount = (data: {
    accountName: string;
    login: number;
    passwordMasked: string;
    server: string;
    environment: 'PAPER' | 'DEMO' | 'LIVE';
  }) => {
    const acc = storageService.addAccount(data);
    refreshData();
    return acc;
  };

  const deleteAccount = (id: string) => {
    storageService.deleteAccount(id);
    refreshData();
  };

  const toggleConnectAccount = (id: string) => {
    storageService.toggleConnect(id);
    refreshData();
  };

  const testAccountConnection = async (id: string) => {
    const res = await storageService.testConnection(id);
    refreshData();
    return res;
  };

  const updateRobotConfig = (updates: Partial<RobotConfiguration>) => {
    if (!activeAccount) return;
    storageService.updateConfiguration(activeAccount.id, updates);
    refreshData();
  };

  const executeCommand = (
    command:
      | 'START'
      | 'PAUSE'
      | 'RESUME'
      | 'STOP'
      | 'RESTART'
      | 'BLOCK_ENTRIES'
      | 'UNBLOCK_ENTRIES'
      | 'EMERGENCY_STOP'
      | 'CLOSE_ALL'
      | 'CANCEL_PENDING',
    idempotencyKey?: string,
  ) => {
    if (!activeAccount) {
      return { success: false, message: 'Nenhuma conta ativa selecionada.' };
    }
    const res = storageService.executeRobotCommand(activeAccount.id, command, idempotencyKey);
    refreshData();
    return res;
  };

  const closePosition = (ticket: number) => {
    storageService.closePosition(ticket);
    refreshData();
  };

  const closeAllPositions = () => {
    if (!activeAccount) return 0;
    const count = storageService.closeAllPositions(activeAccount.id);
    refreshData();
    return count;
  };

  const cancelAllOrders = () => {
    if (!activeAccount) return 0;
    const count = storageService.cancelAllPendingOrders(activeAccount.id);
    refreshData();
    return count;
  };

  const toggleAllowRealTrading = (allow: boolean) => {
    storageService.toggleAllowRealTrading(allow);
    setUser({ ...storageService.getCurrentUser() });
    refreshData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        activeAccount,
        activeConfig,
        robotInstance,
        positions,
        pendingOrders,
        trades,
        logs,
        workers,
        liveSignal,
        login,
        logout,
        selectAccount,
        addAccount,
        deleteAccount,
        toggleConnectAccount,
        testAccountConnection,
        updateRobotConfig,
        executeCommand,
        closePosition,
        closeAllPositions,
        cancelAllOrders,
        toggleAllowRealTrading,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
