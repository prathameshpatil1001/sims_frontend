// Dashboard state types and interfaces
import type { Zone1State } from './zone1-types';
import type { Zone2State } from './zone2-types';
import type { Zone4State, OverlayState, CSVViewerState } from './zone4-overlay-types';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';
export type BadgeState = 'normal' | 'alert' | 'critical';

export interface Contract {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
}

export interface PriceData {
  symbol: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  timestamp: number;
  ohlc: { open: number; high: number; low: number; close: number };
  volume: number;
  oi: number;
  oi_stats?: { high: number; low: number };
  analytics?: Record<string, any>;
  depth?: {
    bid: { price: number; qty: number };
    ask: { price: number; qty: number };
    buy_total: number;
    sell_total: number;
    spread: number;
  };
  limits?: { upper: number; lower: number };
  data_health?: any;
  insights?: any;
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
}

export interface HealthIndicator {
  status: HealthStatus;
  latency: number;
  uptime: number;
  contractId: string;
}

export interface BadgeIndicator {
  liquidityState: BadgeState;
  volatilityState: BadgeState;
  sessionState: BadgeState;
  eventRiskState: BadgeState;
  trapState: BadgeState;
  trendState: BadgeState;
}

export interface Zone3State {
  width: number;
  isResizing: boolean;
  minWidth: number;
  maxWidth: number;
}

export interface DashboardState {
  isAuthenticated: boolean;
  selectedContract: Contract | null;
  priceData: PriceData | null;
  healthIndicator: HealthIndicator | null;
  badgeIndicator: BadgeIndicator | null;
  zone1State: Zone1State | null;
  zone2State: Zone2State | null;
  zone3State: Zone3State;
  zone4State: Zone4State | null;
  overlayState: OverlayState;
  csvViewerState: CSVViewerState;
  zone4State: Zone4State;
  killSwitchArmed: boolean;
  killSwitchCountdown: number;
  dailyPnL: number;
  isLoading: boolean;
  error: string | null;
}

export type DashboardAction =
  | { type: 'SET_CONTRACT'; payload: Contract }
  | { type: 'UPDATE_PRICE'; payload: PriceData }
  | { type: 'UPDATE_HEALTH'; payload: HealthIndicator }
  | { type: 'UPDATE_BADGES'; payload: BadgeIndicator }
  | { type: 'UPDATE_ZONE1'; payload: Partial<Zone1State> }
  | { type: 'UPDATE_ZONE2'; payload: Partial<Zone2State> }
  | { type: 'UPDATE_ZONE4'; payload: Partial<Zone4State> }
  | { type: 'OPEN_OVERLAY'; payload: string }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'OPEN_CSV_VIEWER' }
  | { type: 'CLOSE_CSV_VIEWER' }
  | { type: 'SET_ZONE3_WIDTH'; payload: number }
  | { type: 'SET_ZONE3_RESIZING'; payload: boolean }
  | { type: 'SET_ZONE4_EXPANDED'; payload: boolean }
  | { type: 'ARM_KILL_SWITCH'; payload: boolean }
  | { type: 'SET_KILL_SWITCH_COUNTDOWN'; payload: number }
  | { type: 'SET_DAILY_PNL'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_DASHBOARD' };
