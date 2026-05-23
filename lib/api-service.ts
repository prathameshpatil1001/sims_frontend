// Typed API service for all SMIS backend endpoints
// Base URL is '' because Next.js rewrites /api/* → http://localhost:8000/api/*

const API = '';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smis_access_token');
}

function saveToken(token: string): void {
  localStorage.setItem('smis_access_token', token);
}

function clearToken(): void {
  localStorage.removeItem('smis_access_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include', // for refresh cookie
  });

  if (res.status === 401 && auth) {
    // Try refresh once
    try {
      const refreshed = await request<{ access_token: string }>(
        'POST', '/api/auth/refresh', undefined, false,
      );
      saveToken(refreshed.access_token);
      headers['Authorization'] = `Bearer ${refreshed.access_token}`;
      const retried = await fetch(`${API}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });
      if (!retried.ok) throw new Error(`${retried.status}`);
      return retried.json() as Promise<T>;
    } catch {
      clearToken();
      throw new Error('Session expired');
    }
  }

  if (res.status === 204) return undefined as unknown as T;
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  credentials_configured: boolean;
  user_name: string | null;
  last_error: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token: string | null;
}

export interface SessionInfoResponse {
  user_name: string | null;
  token_issued_at: string | null;
  token_expires_at: string | null;
  system_status: {
    credentials_configured: boolean;
    instruments_loaded: boolean;
    instruments_count: number;
    pipeline_ready: boolean;
    session_authenticated: boolean;
  };
}

export interface ConnectionStatusResponse {
  step: 'COMPLETE' | 'FAILED' | 'PENDING' | 'VERIFYING_TOKEN' | 'LOADING_INSTRUMENTS';
  user_name: string | null;
  user_id: string | null;
  error: string | null;
}

export const authApi = {
  /** Gate endpoint — no auth required. Determines which login screen to show. */
  getStatus: () =>
    request<AuthStatusResponse>('GET', '/api/auth/status', undefined, false),

  /** Returns Kite login URL for OAuth flow */
  getLoginUrl: () =>
    request<{ login_url: string }>('GET', '/api/auth/login-url', undefined, false),

  /** Polled after user opens OAuth tab — checks if Kite callback happened */
  getConnectionStatus: () =>
    request<ConnectionStatusResponse>('GET', '/api/auth/connection-status', undefined, false),

  /** Saves Zerodha API key + secret (first-run or reset) */
  configureCredentials: (api_key: string, api_secret: string) =>
    request<{ success: boolean; message: string }>(
      'POST', '/api/auth/configure-credentials', { api_key, api_secret }, false,
    ),

  /** Login with username + password → access token */
  login: (username: string, password: string) =>
    request<LoginResponse>('POST', '/api/auth/login', { username, password }, false),

  /** Refresh access token using httpOnly cookie */
  refresh: () =>
    request<LoginResponse>('POST', '/api/auth/refresh', undefined, false),

  /** Invalidate session */
  logout: () =>
    request<void>('POST', '/api/auth/logout', undefined, false),

  /** Session info for login screen (last session, system status) */
  getSessionInfo: () =>
    request<SessionInfoResponse>('GET', '/api/auth/session-info', undefined, false),

  saveToken,
  clearToken,
  getToken,
};

// ─── HEALTH / MONITORING ──────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'OK' | 'DEGRADED' | 'CRITICAL';
  timestamp: string;
  system: {
    mode: string;
    pipeline_status: 'RUNNING' | 'STALLED';
    uptime_seconds: number;
  };
  market: {
    last_candle_timestamp: string | null;
    seconds_since_last_candle: number | null;
    last_candle_symbol: string | null;
    active_regime: string | null;
    session_phase: string | null;
    websocket_connected: boolean;
  };
  signals: {
    last_signal_timestamp: string | null;
    seconds_since_last_signal: number | null;
    signals_today: number;
    pipeline_stall: boolean;
  };
  kill_switch: {
    status: 'ACTIVE' | 'INACTIVE';
    triggered_at: string | null;
    daily_drawdown_pct: number;
  };
  paper_trading: {
    session_pnl: number;
    open_positions: number;
    drawdown_pct: number;
    total_trades: number;
    win_rate: number;
  };
  modules: {
    required: Record<string, 'HEALTHY' | 'UNAVAILABLE'>;
    optional: Record<string, 'HEALTHY' | 'UNAVAILABLE'>;
  };
}

export const monitoringApi = {
  getHealth: () => request<HealthResponse>('GET', '/health'),
  activateKillSwitch: () =>
    request<{ status: string; triggered_at: string; message: string }>(
      'POST', '/api/monitoring/kill-switch/activate',
    ),
  deactivateKillSwitch: () =>
    request<{ status: string; message: string }>(
      'POST', '/api/monitoring/kill-switch/deactivate', { confirm: true },
    ),
};

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

export interface ContractSnapshot {
  snapshot?: {
    symbol: string;
    ltp: number;
    change_value: number;
    change_percent: number;
    atp: number;
    last_traded_qty: number;
    timestamp: string | null;
    ohlc: { open: number; high: number; low: number; close: number };
    volume: number;
    oi: number;
    oi_stats: { high: number; low: number };
    analytics: Record<string, any>;
    depth: {
      bid: { price: number; qty: number };
      ask: { price: number; qty: number };
      buy_total: number;
      sell_total: number;
      spread: number;
    };
    limits: { upper: number; lower: number };
    data_health?: any;
    insights?: any;
  };
  meta?: {
    expiry: string;
    lot_size: number;
    tick_size: number;
    exchange: string;
  };
  status?: {
    tradable: boolean;
    circuit_state: any;
  };
  // Fallback for when "waiting_for_data" is returned at the root level
  symbol?: string;
  response_status?: string; 
}

export const contractsApi = {
  getSnapshot: (symbol: string) =>
    request<ContractSnapshot>('GET', `/api/contracts/${encodeURIComponent(symbol)}/details`),
};

// ─── SIGNALS ──────────────────────────────────────────────────────────────────

export interface LatestSignalResponse {
  status: string;
  signal: Record<string, unknown> | null;
}

export const signalsApi = {
  getLatest: () => request<LatestSignalResponse>('GET', '/api/signals/latest'),
};

// ─── ANALYSIS ─────────────────────────────────────────────────────────────────

export const analysisApi = {
  getContext: (symbol: string) =>
    request<Record<string, unknown>>('GET', `/api/analysis/context/${encodeURIComponent(symbol)}`),
  getCandles: (symbol: string, timeframe = '5m', limit = 200) =>
    request<{ candles: unknown[]; symbol: string; timeframe: string }>(
      'GET',
      `/api/analysis/candles/${encodeURIComponent(symbol)}?timeframe=${timeframe}&limit=${limit}`,
    ),
};

// ─── PAPER TRADING ────────────────────────────────────────────────────────────

export interface Position {
  position_id: string;
  direction: 'LONG' | 'SHORT';
  lots: number;
  entry_price: number;
  entry_time: string;
  current_price: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  target_1_progress_pct: number;
}

export interface TradeHistorySummary {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  avg_r_multiple: number;
  profit_factor: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
}

export interface TradeHistoryResponse {
  trades: Record<string, unknown>[];
  summary: TradeHistorySummary;
  session_quality: Record<string, unknown>;
}

export interface PositionsResponse {
  positions: Position[];
  has_position: boolean;
}

export const paperTradingApi = {
  /** Set paper trading mode (enabled/disabled) and notify backend */
  setMode: (enabled: boolean) =>
    request<{ success: boolean; mode: string }>('POST', '/api/paper-trading/set-mode', { enabled }),

  getPositions: () => request<PositionsResponse>('GET', '/api/paper-trading/positions'),
  getTradeHistory: () => request<TradeHistoryResponse>('GET', '/api/paper-trading/trade-history'),
  openEntry: (body: {
    direction: 'LONG' | 'SHORT';
    entry_price: number;
    stop_loss: number;
    target_1: number;
    target_2: number;
    lots: number;
    symbol?: string;
    dry_run?: boolean;
  }) => request<Record<string, unknown>>('POST', '/api/paper-trading/entry', body),
  closePosition: (position_id: string, exit_price: number, reason = 'MANUAL') =>
    request<Record<string, unknown>>('POST', '/api/paper-trading/exit', {
      position_id,
      exit_price,
      reason,
    }),
};



// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const adminApi = {
  /** Verify admin credentials — returns short-lived admin token */
  verifyAdmin: (username: string, password: string) =>
    request<{ admin_token: string }>('POST', '/api/admin/verify', { username, password }, false),

  /** Update Zerodha API credentials (requires admin token) */
  updateApiCredentials: (api_key: string, api_secret: string) =>
    request<{ success: boolean }>('POST', '/api/admin/credentials', { api_key, api_secret }),

  /** Change admin password */
  changeAdminPassword: (current: string, newPassword: string) =>
    request<{ success: boolean }>('POST', '/api/admin/change-password', { current, new_password: newPassword }),

  /** Get current threshold values */
  getThresholds: () =>
    request<Record<string, number>>('GET', '/api/admin/thresholds'),

  /** Update a single threshold */
  updateThreshold: (key: string, value: number) =>
    request<{ success: boolean }>('POST', '/api/admin/thresholds', { key, value }),
};

// ─── DATA & LOGS ──────────────────────────────────────────────────────────────

export interface DataFile {
  path: string;
  size: number;
  size_human: string;
  modified: string;
  is_live: boolean;
  type: string;
}

export interface DataFilesResponse {
  files: DataFile[];
  count: number;
}

export interface ReadCsvResponse {
  headers: string[];
  rows: string[][];
  total_rows: number;
  page: number;
  per_page: number;
  total_pages: number;
  file: string;
}

export interface ReadJsonlResponse {
  entries: { line: number; data: any; raw: string | null }[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const dataApi = {
  getFiles: () => request<DataFilesResponse>('GET', '/api/data/files'),
  readCsv: (file: string, page = 1, perPage = 100, search?: string) => {
    let url = `/api/data/read?file=${encodeURIComponent(file)}&page=${page}&per_page=${perPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request<ReadCsvResponse>('GET', url);
  },
  readJsonl: (file: string, page = 1, perPage = 50) =>
    request<ReadJsonlResponse>('GET', `/api/data/read-jsonl?file=${encodeURIComponent(file)}&page=${page}&per_page=${perPage}`),
  downloadUrl: (file: string) => `/api/data/download?file=${encodeURIComponent(file)}`,
};
