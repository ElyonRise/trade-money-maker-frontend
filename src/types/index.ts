export type EnvironmentMode = 'PAPER' | 'DEMO' | 'LIVE';

export type RobotState =
  | 'STOPPED'
  | 'STARTING'
  | 'RUNNING'
  | 'PAUSED'
  | 'DEGRADED'
  | 'ERROR'
  | 'EMERGENCY_STOP';

export type WorkerStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type MT5Status = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export type OrderType = 'BUY' | 'SELL';

export interface User {
  id: string;
  email: string;
  fullName: string;
  allowRealTrading: boolean;
  createdAt: string;
}

export interface BrokerAccount {
  id: string;
  userId: string;
  accountName: string;
  login: number;
  server: string;
  environment: EnvironmentMode;
  status: MT5Status;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  createdAt: string;
  updatedAt: string;
  assignedWorkerId?: string;
  lastHeartbeat?: string;
}

export interface RobotConfiguration {
  id: string;
  accountId: string;
  userId: string;
  selectedSymbols: string[]; // empty array = all symbols
  fixedLot: number;
  stopLossPoints: number;
  takeProfitPoints: number;
  entryScoreThreshold: number; // default 65 (configurable)
  reversalThreshold: number;
  maxOpenPositions: number;
  dailyLossLimit: number;
  maxConsecutiveLosses: number;
  correlationLimit: number;
  utcSessionStart: string; // "08:00"
  utcSessionEnd: string; // "18:00"
  breakevenTriggerPoints: number;
  trailingStopPoints: number;
  signalConfirmationMinutes: number; // default 2 min
  entryCooldownMinutes: number; // default 15 min
  updatedAt: string;
}

export interface RobotInstance {
  id: string;
  accountId: string;
  currentState: RobotState;
  blockNewEntries: boolean;
  isRealArmed: boolean;
  lastSignal?: StrategySignal;
  lastEntryTime?: string;
  dailyPnL: number;
  totalPnL: number;
  consecutiveLosses: number;
  activePositionsCount: number;
  updatedAt: string;
}

export interface StrategyTimeframeScore {
  timeframe: 'H1' | 'M30' | 'M15' | 'M5' | 'M1';
  weight: number;
  trend: 'BULLISH' | 'BEARISH' | 'RANGE';
  rsi: number;
  ema20: number;
  ema50: number;
  bos: boolean;
  choch: boolean;
  fvg: boolean;
  liquiditySweep: boolean;
  buyScore: number;
  sellScore: number;
}

export interface StrategySignal {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'WAIT';
  totalBuyScore: number;
  totalSellScore: number;
  threshold: number;
  timestamp: string;
  timeframeScores: StrategyTimeframeScore[];
  confirmationTimeRemainingSeconds?: number;
}

export interface Position {
  ticket: number;
  accountId: string;
  symbol: string;
  type: OrderType;
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number;
  swap: number;
  openTime: string;
  reasonScore?: number;
}

export interface PendingOrder {
  ticket: number;
  accountId: string;
  symbol: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP';
  lots: number;
  targetPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  createdTime: string;
}

export interface ExecutedTrade {
  ticket: number;
  accountId: string;
  symbol: string;
  type: OrderType;
  lots: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  commission: number;
  openTime: string;
  closeTime: string;
  durationSeconds: number;
  closeReason: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  userId: string;
  accountId?: string;
  workerId?: string;
  component: string;
  event: string;
  message: string;
  idempotencyKey?: string;
  ipAddress?: string;
}

export interface WorkerNode {
  id: string;
  nodeIdentifier: string;
  status: WorkerStatus;
  lastHeartbeat: string;
  assignedAccountsCount: number;
  hostname: string;
  version: string;
  os: string;
}
