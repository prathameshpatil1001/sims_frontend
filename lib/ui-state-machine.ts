// Part 12: UI State Machine

export type UIState = 
  | 'UNAUTHENTICATED'
  | 'TRADING_ACTIVE'
  | 'TRADING_CAUTION'
  | 'TRADING_SUSPENDED'
  | 'KILL_SWITCH_ACTIVE'
  | 'SESSION_OPENING'
  | 'SESSION_CLOSING'
  | 'FEED_DISCONNECTED';

export interface UIStateMachineInput {
  isAuthenticated: boolean;
  killSwitchArmed: boolean;
  sessionPhase: 'pre-market' | 'open' | 'close' | 'post-market';
  regimeState: 'bullish' | 'bearish' | 'choppy' | 'unknown';
  feedHealth: 'connected' | 'degraded' | 'disconnected';
  tradeCount: number;
  lastTradeTime: number;
  hasActivePositions: boolean;
}

export function computeUIState(input: UIStateMachineInput): UIState {
  // Priority 1: Authentication (highest priority)
  if (!input.isAuthenticated) {
    return 'UNAUTHENTICATED';
  }

  // Priority 2: Kill switch
  if (input.killSwitchArmed) {
    return 'KILL_SWITCH_ACTIVE';
  }

  // Priority 3: Feed connectivity
  if (input.feedHealth === 'disconnected') {
    return 'FEED_DISCONNECTED';
  }

  // Priority 4: Session phase
  if (input.sessionPhase === 'pre-market' || input.sessionPhase === 'post-market') {
    return 'SESSION_OPENING';
  }

  if (input.sessionPhase === 'close') {
    return 'SESSION_CLOSING';
  }

  // Priority 5: Market conditions
  if (input.feedHealth === 'degraded') {
    return 'TRADING_CAUTION';
  }

  if (input.regimeState === 'choppy') {
    return 'TRADING_CAUTION';
  }

  // Default: Active trading
  return 'TRADING_ACTIVE';
}

export const stateConfig: Record<UIState, {
  label: string;
  color: string;
  bgColor: string;
  allowTrades: boolean;
  allowPositionClose: boolean;
  allowUIInteraction: boolean;
  description: string;
}> = {
  UNAUTHENTICATED: {
    label: 'Not Authenticated',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800',
    allowTrades: false,
    allowPositionClose: false,
    allowUIInteraction: false,
    description: 'Please authenticate to access trading',
  },
  TRADING_ACTIVE: {
    label: 'Trading Active',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    allowTrades: true,
    allowPositionClose: true,
    allowUIInteraction: true,
    description: 'System ready for trading',
  },
  TRADING_CAUTION: {
    label: 'Trading Caution',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
    allowTrades: true,
    allowPositionClose: true,
    allowUIInteraction: true,
    description: 'Choppy market or degraded feed - proceed with caution',
  },
  TRADING_SUSPENDED: {
    label: 'Trading Suspended',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    allowTrades: false,
    allowPositionClose: true,
    allowUIInteraction: true,
    description: 'Market is suspended - only position closing available',
  },
  KILL_SWITCH_ACTIVE: {
    label: 'Kill Switch Active',
    color: 'text-red-500',
    bgColor: 'bg-red-900',
    allowTrades: false,
    allowPositionClose: true,
    allowUIInteraction: true,
    description: 'All trading disabled - kill switch armed',
  },
  SESSION_OPENING: {
    label: 'Session Opening',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    allowTrades: false,
    allowPositionClose: false,
    allowUIInteraction: true,
    description: 'Waiting for market open',
  },
  SESSION_CLOSING: {
    label: 'Session Closing',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    allowTrades: false,
    allowPositionClose: true,
    allowUIInteraction: true,
    description: 'Market closing soon - close positions',
  },
  FEED_DISCONNECTED: {
    label: 'Feed Disconnected',
    color: 'text-red-500',
    bgColor: 'bg-red-900/50',
    allowTrades: false,
    allowPositionClose: true,
    allowUIInteraction: true,
    description: 'Data feed disconnected - reconnecting...',
  },
};
