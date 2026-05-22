// Part 15: Backend API Schema & Types

// ============================================================================
// AUTHENTICATION & SESSION
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface SessionStatus {
  userId: string;
  username: string;
  authenticated: boolean;
  lastHeartbeat: number;
  sessionPhase: 'pre-market' | 'open' | 'close' | 'post-market';
}

// ============================================================================
// SIGNAL & ANALYSIS
// ============================================================================

export interface SignalRequest {
  contract: string;
  timeframe: '1m' | '2m' | '5m' | '10m';
}

export interface Signal {
  id: string;
  timestamp: number;
  contract: string;
  timeframe: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  
  // Confidence metrics
  compositeConfidence: number; // 0-100
  confidenceBreakdown: {
    priceAction: number;
    volumeAnalysis: number;
    regimeAlignment: number;
    crossContractConsensus: number;
  };
  
  // Signal characteristics
  signalType: 'mean-reversion' | 'trend-continuation' | 'regime-shift' | 'breakout';
  persistenceCounter: number;
  edgeConsistency: number[]; // Last 5 candles
  
  // Probabilities
  probLongSuccess: number;
  probShortSuccess: number;
  
  // Structural context
  structural: {
    vwap: number;
    pdh: number; // Prior Day High
    pdl: number; // Prior Day Low
    atr: number;
    supportLevel: number;
    resistanceLevel: number;
  };
  
  // Trade setup
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  positionSize: number;
  fillProbability: number;
  
  // Conditions & validation
  conditions: SignalCondition[];
  conditionsPassCount: number;
  
  // Cross-contract
  crossContractConsensus: {
    contracts: { symbol: string; consensus: 'align' | 'diverge'; strength: number }[];
    overallStrength: number;
  };
}

export interface SignalCondition {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  current?: number;
  threshold?: number;
  description: string;
}

// ============================================================================
// HEALTH & STATUS
// ============================================================================

export interface HealthIndicator {
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  latency: number; // ms
  feedHealth: 'connected' | 'degraded' | 'disconnected';
  lastUpdate: number;
  uptime: number; // seconds
}

export interface BadgeIndicator {
  liquidity: 'normal' | 'alert' | 'critical';
  volatility: 'normal' | 'alert' | 'critical';
  sessionPhase: 'opening' | 'active' | 'closing' | 'closed';
  eventRisk: 'low' | 'medium' | 'high';
  trapDetection: boolean;
  trendAlignment: 'strong' | 'moderate' | 'weak';
}

// ============================================================================
// POSITIONS & TRADES
// ============================================================================

export interface Position {
  id: string;
  contract: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: number;
}

export interface Trade {
  id: string;
  contract: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  entryTime: number;
  exitTime: number;
  duration: number; // minutes
  signal: string; // signal type that triggered it
}

export interface DailyMetrics {
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  netPnLPercent: number;
  winRate: number; // 0-1
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  tradeCount: number;
  closedTrades: number;
}

// ============================================================================
// ANALYSIS & DRILL-DOWNS
// ============================================================================

export interface CompositeCofidenceDrill {
  title: string;
  overallScore: number;
  components: {
    name: string;
    score: number;
    weight: number;
    weightedContribution: number;
    details: string;
  }[];
  calculation: {
    formula: string;
    rawScores: Record<string, number>;
    weights: Record<string, number>;
    intermediate: Record<string, number>;
  };
  history: Array<{
    timestamp: number;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface SystemIntegrityDrill {
  title: string;
  overallHealth: number;
  modules: {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    checks: Array<{
      name: string;
      pass: boolean;
      latency: number;
    }>;
  }[];
}

// ============================================================================
// FILE & DATA
// ============================================================================

export interface FileListResponse {
  files: {
    name: string;
    type: 'csv' | 'jsonl' | 'log' | 'txt';
    size: number;
    modifiedAt: number;
    isLive: boolean;
  }[];
}

export interface CSVReadResponse {
  filename: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  pageSize: number;
  currentPage: number;
}

// ============================================================================
// PAPER TRADING
// ============================================================================

export interface PaperTradeRequest {
  contract: string;
  direction: 'LONG' | 'SHORT';
  quantity: number;
  limitPrice?: number;
}

export interface PaperTradeResponse {
  orderId: string;
  status: 'pending' | 'filled' | 'rejected';
  filledAt: number;
  filledPrice: number;
}

// ============================================================================
// API ENDPOINTS REFERENCE
// ============================================================================

export const apiEndpoints = {
  // Auth
  'POST /auth/login': 'Login with username/password',
  'POST /auth/refresh': 'Refresh authentication token',
  'POST /auth/logout': 'Logout current session',
  'GET /session/status': 'Get current session status',
  
  // Signals & Analysis
  'GET /signals/current': 'Get current signal for contract',
  'POST /signals/analyze': 'Analyze signal for contract+timeframe',
  'GET /signals/history': 'Get historical signals',
  'GET /drill-down/confidence': 'Composite Confidence detailed drill-down',
  'GET /drill-down/integrity': 'System Integrity drill-down',
  'GET /drill-down/module/:name': 'Module-specific drill-down',
  
  // Health & Status
  'GET /health/status': 'System health indicator',
  'GET /health/badges': 'Critical state badges',
  'GET /health/heartbeat': 'Heartbeat check (keep-alive)',
  'GET /feed/latency': 'Data feed latency metrics',
  
  // Positions & Trades
  'GET /positions/open': 'Get all open positions',
  'GET /positions/:id': 'Get specific position',
  'GET /trades/history': 'Get closed trades',
  'GET /trades/daily': 'Get daily metrics',
  'POST /trades/close': 'Close position or trade',
  
  // Paper Trading
  'POST /paper-trade/submit': 'Submit paper trade',
  'GET /paper-trade/status/:orderId': 'Get paper trade status',
  'GET /paper-trade/history': 'Get paper trade history',
  
  // Data & Files
  'GET /files/list': 'List available data files',
  'GET /files/read/:filename': 'Read CSV/JSONL file with pagination',
  'GET /files/download/:filename': 'Download file',
  
  // Watchlist & Config
  'GET /watchlist/contracts': 'Get monitored contracts',
  'POST /watchlist/add': 'Add contract to watchlist',
  'DELETE /watchlist/:contract': 'Remove contract from watchlist',
  
  // Monitoring & Events
  'GET /events/recent': 'Get recent system events',
  'GET /events/stream': 'Stream real-time events (SSE)',
  'POST /events/acknowledge': 'Acknowledge alert/event',
};
