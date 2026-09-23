import {
  AuditLog,
  BrokerAccount,
  ExecutedTrade,
  PendingOrder,
  Position,
  RobotConfiguration,
  RobotInstance,
  StrategySignal,
  StrategyTimeframeScore,
  User,
  WorkerNode,
} from '../types';

export const ALL_SYMBOLS = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'Forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex' },
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Metals' },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'Crypto' },
  { symbol: 'US30', name: 'Dow Jones Industrial', category: 'Indices' },
  { symbol: 'NAS100', name: 'Nasdaq 100 Index', category: 'Indices' },
];

const INITIAL_USER: User = {
  id: 'usr_demo_88291',
  email: 'trader@trademoneymaker.com',
  fullName: 'Operador Principal',
  allowRealTrading: false,
  createdAt: new Date().toISOString(),
};

const INITIAL_ACCOUNT: BrokerAccount = {
  id: 'acc_demo_01',
  userId: INITIAL_USER.id,
  accountName: 'Robo Alpha - IC Markets Demo',
  login: 5092184,
  server: 'ICMarketsSC-Demo',
  environment: 'DEMO',
  status: 'CONNECTED',
  currency: 'USD',
  balance: 10000.0,
  equity: 10185.5,
  margin: 120.4,
  freeMargin: 10065.1,
  leverage: 500,
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date().toISOString(),
  assignedWorkerId: 'worker_win_vps_01',
  lastHeartbeat: new Date().toISOString(),
};

const INITIAL_CONFIG: RobotConfiguration = {
  id: 'cfg_01',
  accountId: INITIAL_ACCOUNT.id,
  userId: INITIAL_USER.id,
  selectedSymbols: ['EURUSD', 'GBPUSD', 'XAUUSD'],
  fixedLot: 0.1,
  stopLossPoints: 250,
  takeProfitPoints: 500,
  entryScoreThreshold: 65,
  reversalThreshold: 75,
  maxOpenPositions: 3,
  dailyLossLimit: 500.0,
  maxConsecutiveLosses: 3,
  correlationLimit: 0.7,
  utcSessionStart: '07:00',
  utcSessionEnd: '19:00',
  breakevenTriggerPoints: 150,
  trailingStopPoints: 100,
  signalConfirmationMinutes: 2,
  entryCooldownMinutes: 15,
  updatedAt: new Date().toISOString(),
};

const INITIAL_ROBOT_INSTANCE: RobotInstance = {
  id: 'inst_01',
  accountId: INITIAL_ACCOUNT.id,
  currentState: 'RUNNING',
  blockNewEntries: false,
  isRealArmed: false,
  dailyPnL: 185.5,
  totalPnL: 1420.0,
  consecutiveLosses: 0,
  activePositionsCount: 2,
  updatedAt: new Date().toISOString(),
};

const INITIAL_WORKER: WorkerNode = {
  id: 'worker_win_vps_01',
  nodeIdentifier: 'WIN-SRV22-MT5-PROD1',
  status: 'ONLINE',
  lastHeartbeat: new Date().toISOString(),
  assignedAccountsCount: 1,
  hostname: 'vps-us-east-trading-01',
  version: '2.4.1-py311',
  os: 'Windows Server 2022 Datacenter x64',
};

const INITIAL_POSITIONS: Position[] = [
  {
    ticket: 8840192,
    accountId: INITIAL_ACCOUNT.id,
    symbol: 'EURUSD',
    type: 'BUY',
    lots: 0.1,
    openPrice: 1.0845,
    currentPrice: 1.0862,
    sl: 1.082,
    tp: 1.0895,
    profit: 170.0,
    swap: -1.2,
    openTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    reasonScore: 78,
  },
  {
    ticket: 8840255,
    accountId: INITIAL_ACCOUNT.id,
    symbol: 'XAUUSD',
    type: 'BUY',
    lots: 0.05,
    openPrice: 2642.5,
    currentPrice: 2645.8,
    sl: 2635.0,
    tp: 2660.0,
    profit: 16.5,
    swap: 0.0,
    openTime: new Date(Date.now() - 1800000).toISOString(),
    reasonScore: 72,
  },
];

const INITIAL_PENDING: PendingOrder[] = [
  {
    ticket: 8841002,
    accountId: INITIAL_ACCOUNT.id,
    symbol: 'GBPUSD',
    type: 'BUY_LIMIT',
    lots: 0.1,
    targetPrice: 1.291,
    currentPrice: 1.2935,
    sl: 1.288,
    tp: 1.298,
    createdTime: new Date(Date.now() - 5400000).toISOString(),
  },
];

const INITIAL_TRADES: ExecutedTrade[] = [
  {
    ticket: 8839011,
    accountId: INITIAL_ACCOUNT.id,
    symbol: 'USDJPY',
    type: 'SELL',
    lots: 0.1,
    openPrice: 148.5,
    closePrice: 147.95,
    profit: 371.2,
    commission: -3.5,
    openTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    closeTime: new Date(Date.now() - 86400000 * 2 + 14400000).toISOString(),
    durationSeconds: 14400,
    closeReason: 'TAKE_PROFIT_TRIGGERED',
  },
  {
    ticket: 8839480,
    accountId: INITIAL_ACCOUNT.id,
    symbol: 'EURUSD',
    type: 'BUY',
    lots: 0.1,
    openPrice: 1.082,
    closePrice: 1.0841,
    profit: 210.0,
    commission: -3.5,
    openTime: new Date(Date.now() - 86400000).toISOString(),
    closeTime: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    durationSeconds: 7200,
    closeReason: 'TRAILING_STOP_EXECUTED',
  },
  {
    ticket: 8839890,
    accountId: INITIAL_ACCOUNT.id,
    symbol: 'XAUUSD',
    type: 'SELL',
    lots: 0.05,
    openPrice: 2650.0,
    closePrice: 2654.2,
    profit: -21.0,
    commission: -2.0,
    openTime: new Date(Date.now() - 43200000).toISOString(),
    closeTime: new Date(Date.now() - 36000000).toISOString(),
    durationSeconds: 7200,
    closeReason: 'STOP_LOSS_HIT',
  },
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'INFO',
    userId: INITIAL_USER.id,
    accountId: INITIAL_ACCOUNT.id,
    workerId: INITIAL_WORKER.id,
    component: 'WORKER_HEARTBEAT',
    event: 'HEARTBEAT_ACK',
    message: 'Worker WIN-SRV22-MT5-PROD1 renovou lease de execução com sucesso (TTL 30s).',
  },
  {
    id: 'log_02',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    severity: 'INFO',
    userId: INITIAL_USER.id,
    accountId: INITIAL_ACCOUNT.id,
    workerId: INITIAL_WORKER.id,
    component: 'STRATEGY_ENGINE',
    event: 'ORDER_FILLED',
    message: 'Entrada confirmada: BUY 0.10 EURUSD @ 1.08450 (Score: 78 | Fallback FOK aplicado).',
  },
  {
    id: 'log_03',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    severity: 'INFO',
    userId: INITIAL_USER.id,
    accountId: INITIAL_ACCOUNT.id,
    workerId: INITIAL_WORKER.id,
    component: 'STRATEGY_ENGINE',
    event: 'ORDER_FILLED',
    message: 'Entrada confirmada: BUY 0.05 XAUUSD @ 2642.50 (Score: 72 | Fallback IOC aplicado).',
  },
  {
    id: 'log_04',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    severity: 'INFO',
    userId: INITIAL_USER.id,
    accountId: INITIAL_ACCOUNT.id,
    workerId: INITIAL_WORKER.id,
    component: 'RISK_GUARD',
    event: 'COOLDOWN_ACTIVE',
    message: 'Símbolo XAUUSD em período de cooldown (restam 12 min). Novas entradas bloqueadas.',
  },
];

class StorageService {
  private users: User[] = [INITIAL_USER];
  private currentUser: User = INITIAL_USER;
  private accounts: BrokerAccount[] = [INITIAL_ACCOUNT];
  private currentAccountId: string = INITIAL_ACCOUNT.id;
  private configs: Record<string, RobotConfiguration> = { [INITIAL_ACCOUNT.id]: INITIAL_CONFIG };
  private instances: Record<string, RobotInstance> = { [INITIAL_ACCOUNT.id]: INITIAL_ROBOT_INSTANCE };
  private workers: WorkerNode[] = [INITIAL_WORKER];
  private positions: Position[] = INITIAL_POSITIONS;
  private pendingOrders: PendingOrder[] = INITIAL_PENDING;
  private trades: ExecutedTrade[] = INITIAL_TRADES;
  private auditLogs: AuditLog[] = INITIAL_LOGS;
  private processedIdempotencyKeys: Set<string> = new Set();

  constructor() {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('tmm_accounts', JSON.stringify(this.accounts));
      localStorage.setItem('tmm_configs', JSON.stringify(this.configs));
      localStorage.setItem('tmm_instances', JSON.stringify(this.instances));
      localStorage.setItem('tmm_positions', JSON.stringify(this.positions));
      localStorage.setItem('tmm_trades', JSON.stringify(this.trades));
      localStorage.setItem('tmm_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('tmm_current_account', this.currentAccountId);
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      const acc = localStorage.getItem('tmm_accounts');
      if (acc) this.accounts = JSON.parse(acc);
      const cfg = localStorage.getItem('tmm_configs');
      if (cfg) this.configs = JSON.parse(cfg);
      const inst = localStorage.getItem('tmm_instances');
      if (inst) this.instances = JSON.parse(inst);
      const pos = localStorage.getItem('tmm_positions');
      if (pos) this.positions = JSON.parse(pos);
      const trd = localStorage.getItem('tmm_trades');
      if (trd) this.trades = JSON.parse(trd);
      const lg = localStorage.getItem('tmm_logs');
      if (lg) this.auditLogs = JSON.parse(lg);
      const cur = localStorage.getItem('tmm_current_account');
      if (cur && this.accounts.some((a) => a.id === cur)) this.currentAccountId = cur;
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public loginUser(email: string): User {
    const found = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.currentUser = found;
      return found;
    }
    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email,
      fullName: email.split('@')[0],
      allowRealTrading: false,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  public toggleAllowRealTrading(allowed: boolean) {
    this.currentUser.allowRealTrading = allowed;
    this.logAudit(
      'SECURITY',
      'ALLOW_REAL_TRADING_CHANGED',
      `Permissão de negociação em conta REAL alterada para: ${allowed ? 'HABILITADA' : 'DESABILITADA'}.`,
      'WARNING',
    );
  }

  public getAccounts(): BrokerAccount[] {
    return this.accounts.filter((a) => a.userId === this.currentUser.id);
  }

  public getActiveAccount(): BrokerAccount | null {
    const accs = this.getAccounts();
    return accs.find((a) => a.id === this.currentAccountId) || accs[0] || null;
  }

  public setActiveAccount(accountId: string) {
    if (this.accounts.some((a) => a.id === accountId && a.userId === this.currentUser.id)) {
      this.currentAccountId = accountId;
      this.saveToLocalStorage();
    }
  }

  public addAccount(data: {
    accountName: string;
    login: number;
    passwordMasked: string;
    server: string;
    environment: 'PAPER' | 'DEMO' | 'LIVE';
  }): BrokerAccount {
    const newAccount: BrokerAccount = {
      id: `acc_${Date.now().toString(36)}`,
      userId: this.currentUser.id,
      accountName: data.accountName,
      login: data.login,
      server: data.server,
      environment: data.environment,
      status: 'DISCONNECTED',
      currency: 'USD',
      balance: data.environment === 'PAPER' ? 50000.0 : 10000.0,
      equity: data.environment === 'PAPER' ? 50000.0 : 10000.0,
      margin: 0,
      freeMargin: data.environment === 'PAPER' ? 50000.0 : 10000.0,
      leverage: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedWorkerId: this.workers[0]?.id,
    };

    this.accounts.push(newAccount);
    this.currentAccountId = newAccount.id;

    // Default configuration for new account
    this.configs[newAccount.id] = {
      id: `cfg_${Date.now().toString(36)}`,
      accountId: newAccount.id,
      userId: this.currentUser.id,
      selectedSymbols: ['EURUSD', 'GBPUSD'],
      fixedLot: 0.1,
      stopLossPoints: 200,
      takeProfitPoints: 400,
      entryScoreThreshold: 65,
      reversalThreshold: 75,
      maxOpenPositions: 3,
      dailyLossLimit: 500.0,
      maxConsecutiveLosses: 3,
      correlationLimit: 0.7,
      utcSessionStart: '08:00',
      utcSessionEnd: '18:00',
      breakevenTriggerPoints: 150,
      trailingStopPoints: 100,
      signalConfirmationMinutes: 2,
      entryCooldownMinutes: 15,
      updatedAt: new Date().toISOString(),
    };

    this.instances[newAccount.id] = {
      id: `inst_${Date.now().toString(36)}`,
      accountId: newAccount.id,
      currentState: 'STOPPED',
      blockNewEntries: false,
      isRealArmed: false,
      dailyPnL: 0,
      totalPnL: 0,
      consecutiveLosses: 0,
      activePositionsCount: 0,
      updatedAt: new Date().toISOString(),
    };

    this.logAudit(
      'ACCOUNT_SERVICE',
      'ACCOUNT_CREATED',
      `Nova conta MT5 adicionada: ${newAccount.accountName} (Login: ***${String(newAccount.login).slice(-3)}, Servidor: ${newAccount.server}, Modo: ${newAccount.environment}). Senha protegida por chave AES-256 em repouso.`,
      'INFO',
    );

    this.saveToLocalStorage();
    return newAccount;
  }

  public testConnection(accountId: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const acc = this.accounts.find((a) => a.id === accountId);
        if (!acc) {
          resolve({ success: false, latencyMs: 0, message: 'Conta não localizada.' });
          return;
        }
        const latency = Math.floor(Math.random() * 25) + 12;
        this.logAudit(
          'WORKER_CONNECTOR',
          'CONNECTION_TESTED',
          `Teste de conexão MT5 bem-sucedido para login ***${String(acc.login).slice(-3)} em ${acc.server}. Latência: ${latency}ms. Modos de filling suportados: FOK, IOC, RETURN.`,
          'INFO',
        );
        resolve({
          success: true,
          latencyMs: latency,
          message: `Conexão bem-sucedida! Servidor ${acc.server} respondeu em ${latency}ms. Permissão de negociação algorítmica: ATIVA.`,
        });
      }, 700);
    });
  }

  public toggleConnect(accountId: string): boolean {
    const acc = this.accounts.find((a) => a.id === accountId);
    if (!acc) return false;
    acc.status = acc.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    acc.updatedAt = new Date().toISOString();
    this.logAudit(
      'WORKER_CONNECTOR',
      acc.status === 'CONNECTED' ? 'ACCOUNT_CONNECTED' : 'ACCOUNT_DISCONNECTED',
      `Conta MT5 ${acc.accountName} teve seu status alterado para: ${acc.status}.`,
      'INFO',
    );
    this.saveToLocalStorage();
    return true;
  }

  public deleteAccount(accountId: string): boolean {
    const index = this.accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return false;
    const removed = this.accounts.splice(index, 1)[0];
    delete this.configs[accountId];
    delete this.instances[accountId];
    if (this.currentAccountId === accountId) {
      this.currentAccountId = this.accounts[0]?.id || '';
    }
    this.logAudit(
      'ACCOUNT_SERVICE',
      'ACCOUNT_DELETED',
      `Conta MT5 excluída pelo usuário: ${removed.accountName}. Credenciais criptografadas expurgadas.`,
      'WARNING',
    );
    this.saveToLocalStorage();
    return true;
  }

  public getConfiguration(accountId: string): RobotConfiguration {
    if (!this.configs[accountId]) {
      this.configs[accountId] = {
        id: `cfg_${Date.now().toString(36)}`,
        accountId,
        userId: this.currentUser.id,
        selectedSymbols: ['EURUSD'],
        fixedLot: 0.1,
        stopLossPoints: 200,
        takeProfitPoints: 400,
        entryScoreThreshold: 65,
        reversalThreshold: 75,
        maxOpenPositions: 3,
        dailyLossLimit: 500.0,
        maxConsecutiveLosses: 3,
        correlationLimit: 0.7,
        utcSessionStart: '08:00',
        utcSessionEnd: '18:00',
        breakevenTriggerPoints: 150,
        trailingStopPoints: 100,
        signalConfirmationMinutes: 2,
        entryCooldownMinutes: 15,
        updatedAt: new Date().toISOString(),
      };
    }
    return this.configs[accountId];
  }

  public updateConfiguration(accountId: string, updates: Partial<RobotConfiguration>): RobotConfiguration {
    const current = this.getConfiguration(accountId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.configs[accountId] = updated;
    this.logAudit(
      'ROBOT_CONFIG',
      'CONFIG_UPDATED',
      `Parâmetros atualizados para conta: Lote ${updated.fixedLot}, SL ${updated.stopLossPoints} pts, TP ${updated.takeProfitPoints} pts, Score Mínimo ${updated.entryScoreThreshold}, Ativos: [${updated.selectedSymbols.join(', ') || 'TODOS OS ATIVOS'}].`,
      'INFO',
    );
    this.saveToLocalStorage();
    return updated;
  }

  public getInstance(accountId: string): RobotInstance {
    if (!this.instances[accountId]) {
      this.instances[accountId] = {
        id: `inst_${Date.now().toString(36)}`,
        accountId,
        currentState: 'STOPPED',
        blockNewEntries: false,
        isRealArmed: false,
        dailyPnL: 0,
        totalPnL: 0,
        consecutiveLosses: 0,
        activePositionsCount: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    return this.instances[accountId];
  }

  public executeRobotCommand(
    accountId: string,
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
  ): { success: boolean; message: string; instance: RobotInstance } {
    const finalKey = idempotencyKey || `cmd_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    if (this.processedIdempotencyKeys.has(finalKey)) {
      return {
        success: true,
        message: 'Comando já processado anteriormente (Idempotência confirmada).',
        instance: this.getInstance(accountId),
      };
    }
    this.processedIdempotencyKeys.add(finalKey);

    const instance = this.getInstance(accountId);
    const account = this.accounts.find((a) => a.id === accountId);

    switch (command) {
      case 'START':
        instance.currentState = 'RUNNING';
        instance.blockNewEntries = false;
        this.logAudit('COMMAND_QUEUE', 'ROBOT_STARTED', 'Robô de automação iniciado com sucesso.', 'INFO', finalKey);
        break;

      case 'PAUSE':
        instance.currentState = 'PAUSED';
        this.logAudit('COMMAND_QUEUE', 'ROBOT_PAUSED', 'Robô pausado. Nenhuma nova entrada será avaliada.', 'WARNING', finalKey);
        break;

      case 'RESUME':
        instance.currentState = 'RUNNING';
        this.logAudit('COMMAND_QUEUE', 'ROBOT_RESUMED', 'Robô retomado em execução normal.', 'INFO', finalKey);
        break;

      case 'STOP':
        instance.currentState = 'STOPPED';
        this.logAudit('COMMAND_QUEUE', 'ROBOT_STOPPED', 'Robô desligado de forma ordenada.', 'INFO', finalKey);
        break;

      case 'RESTART':
        instance.currentState = 'STARTING';
        setTimeout(() => {
          instance.currentState = 'RUNNING';
          this.saveToLocalStorage();
        }, 1500);
        this.logAudit('COMMAND_QUEUE', 'ROBOT_RESTARTED', 'Reinicio do motor de estratégia e do pipeline de candles.', 'INFO', finalKey);
        break;

      case 'BLOCK_ENTRIES':
        instance.blockNewEntries = true;
        this.logAudit('COMMAND_QUEUE', 'ENTRIES_BLOCKED', 'Bloqueio de novas entradas acionado. Posições abertas continuam geridas.', 'WARNING', finalKey);
        break;

      case 'UNBLOCK_ENTRIES':
        instance.blockNewEntries = false;
        this.logAudit('COMMAND_QUEUE', 'ENTRIES_UNBLOCKED', 'Novas entradas liberadas conforme estratégia.', 'INFO', finalKey);
        break;

      case 'EMERGENCY_STOP':
        instance.currentState = 'EMERGENCY_STOP';
        instance.blockNewEntries = true;
        // Close all positions and cancel pending immediately
        this.closeAllPositions(accountId, 'EMERGENCY_STOP_TRIGGERED');
        this.cancelAllPendingOrders(accountId);
        this.logAudit(
          'EMERGENCY_SYSTEM',
          'EMERGENCY_STOP_FIRED',
          `PARADA DE EMERGÊNCIA DISPARADA: Todas as posições e ordens foram liquidadas e o robô foi desarmado imediatamente.`,
          'CRITICAL',
          finalKey,
        );
        break;

      case 'CLOSE_ALL':
        this.closeAllPositions(accountId, 'MANUAL_USER_REQUEST');
        this.logAudit('COMMAND_QUEUE', 'CLOSE_ALL_EXECUTED', 'Solicitação de fechamento total de posições concluída.', 'WARNING', finalKey);
        break;

      case 'CANCEL_PENDING':
        this.cancelAllPendingOrders(accountId);
        this.logAudit('COMMAND_QUEUE', 'CANCEL_PENDING_EXECUTED', 'Todas as ordens pendentes foram canceladas.', 'INFO', finalKey);
        break;
    }

    instance.updatedAt = new Date().toISOString();
    this.saveToLocalStorage();
    return {
      success: true,
      message: `Comando ${command} confirmado pelo Execution Plane.`,
      instance,
    };
  }

  public closePosition(ticket: number): boolean {
    const index = this.positions.findIndex((p) => p.ticket === ticket);
    if (index === -1) return false;
    const pos = this.positions.splice(index, 1)[0];
    const trade: ExecutedTrade = {
      ticket: pos.ticket,
      accountId: pos.accountId,
      symbol: pos.symbol,
      type: pos.type,
      lots: pos.lots,
      openPrice: pos.openPrice,
      closePrice: pos.currentPrice,
      profit: pos.profit,
      commission: -2.5,
      openTime: pos.openTime,
      closeTime: new Date().toISOString(),
      durationSeconds: Math.floor((Date.now() - new Date(pos.openTime).getTime()) / 1000),
      closeReason: 'MANUAL_CLOSE_CONFIRMED',
    };
    this.trades.unshift(trade);
    this.logAudit('TRADING_DESK', 'POSITION_CLOSED', `Posição #${pos.ticket} (${pos.symbol} ${pos.type} ${pos.lots}L) encerrada a mercado com resultado: $${pos.profit.toFixed(2)}.`, 'INFO');
    this.saveToLocalStorage();
    return true;
  }

  public closeAllPositions(accountId: string, reason = 'CLOSE_ALL'): number {
    const toClose = this.positions.filter((p) => p.accountId === accountId);
    toClose.forEach((pos) => {
      this.trades.unshift({
        ticket: pos.ticket,
        accountId: pos.accountId,
        symbol: pos.symbol,
        type: pos.type,
        lots: pos.lots,
        openPrice: pos.openPrice,
        closePrice: pos.currentPrice,
        profit: pos.profit,
        commission: -2.5,
        openTime: pos.openTime,
        closeTime: new Date().toISOString(),
        durationSeconds: Math.floor((Date.now() - new Date(pos.openTime).getTime()) / 1000),
        closeReason: reason,
      });
    });
    this.positions = this.positions.filter((p) => p.accountId !== accountId);
    this.saveToLocalStorage();
    return toClose.length;
  }

  public cancelAllPendingOrders(accountId: string): number {
    const initialCount = this.pendingOrders.length;
    this.pendingOrders = this.pendingOrders.filter((p) => p.accountId !== accountId);
    this.saveToLocalStorage();
    return initialCount - this.pendingOrders.length;
  }

  public getPositions(accountId: string): Position[] {
    return this.positions.filter((p) => p.accountId === accountId);
  }

  public getPendingOrders(accountId: string): PendingOrder[] {
    return this.pendingOrders.filter((p) => p.accountId === accountId);
  }

  public getExecutedTrades(accountId: string): ExecutedTrade[] {
    return this.trades.filter((p) => p.accountId === accountId);
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getWorkers(): WorkerNode[] {
    return this.workers;
  }

  public logAudit(
    component: string,
    event: string,
    message: string,
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO',
    idempotencyKey?: string,
  ) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      severity,
      userId: this.currentUser.id,
      accountId: this.currentAccountId,
      workerId: this.workers[0]?.id,
      component,
      event,
      message,
      idempotencyKey,
      ipAddress: '192.168.1.104',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 300) {
      this.auditLogs.pop();
    }
  }

  /**
   * Generates live multi-timeframe analysis signal adhering to the exact mathematical weights:
   * H1: 20 | M30: 20 | M15: 20 | M5: 15 | M1: 15
   * Total = 100.
   */
  public calculateLiveStrategySignal(symbol: string, threshold = 65): StrategySignal {
    const tfConfigs: { tf: 'H1' | 'M30' | 'M15' | 'M5' | 'M1'; weight: number }[] = [
      { tf: 'H1', weight: 20 },
      { tf: 'M30', weight: 20 },
      { tf: 'M15', weight: 20 },
      { tf: 'M5', weight: 15 },
      { tf: 'M1', weight: 15 },
    ];

    let totalBuy = 0;
    let totalSell = 0;

    const timeframeScores: StrategyTimeframeScore[] = tfConfigs.map((cfg) => {
      // Deterministic pseudo-random variation based on time & symbol
      const seed = (symbol.charCodeAt(0) + cfg.weight + Math.floor(Date.now() / 60000)) % 10;
      const isBull = seed >= 4;
      const bos = (seed % 3 === 0);
      const choch = (seed % 4 === 0);
      const fvg = (seed % 2 === 0);
      const sweep = (seed === 7);

      let buyPts = 0;
      let sellPts = 0;

      if (isBull) {
        buyPts = cfg.weight * (0.6 + (seed % 4) * 0.1);
        sellPts = cfg.weight * 0.2;
      } else {
        sellPts = cfg.weight * (0.6 + (seed % 4) * 0.1);
        buyPts = cfg.weight * 0.2;
      }

      totalBuy += buyPts;
      totalSell += sellPts;

      return {
        timeframe: cfg.tf,
        weight: cfg.weight,
        trend: isBull ? 'BULLISH' : 'BEARISH',
        rsi: isBull ? 58.4 + (seed % 10) : 41.2 - (seed % 10),
        ema20: 1.0850,
        ema50: 1.0830,
        bos,
        choch,
        fvg,
        liquiditySweep: sweep,
        buyScore: Math.round(buyPts),
        sellScore: Math.round(sellPts),
      };
    });

    totalBuy = Math.round(totalBuy);
    totalSell = Math.round(totalSell);

    let direction: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
    if (totalBuy >= totalSell && totalBuy >= threshold) {
      direction = 'BUY';
    } else if (totalSell > totalBuy && totalSell >= threshold) {
      direction = 'SELL';
    }

    return {
      symbol,
      direction,
      totalBuyScore: totalBuy,
      totalSellScore: totalSell,
      threshold,
      timestamp: new Date().toISOString(),
      timeframeScores,
      confirmationTimeRemainingSeconds: direction !== 'WAIT' ? 45 : undefined,
    };
  }
}

export const storageService = new StorageService();
