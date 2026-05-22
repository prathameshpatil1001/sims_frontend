// Zone 1 Decision Engine Types

export type SignalType = 'mean-reversion' | 'momentum' | 'volatility-expansion' | 'liquidity-absorption';
export type ConditionStatus = 'pass' | 'warning' | 'fail' | 'pending';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface EdgeConsistency {
  candle1: number;
  candle2: number;
  candle3: number;
  candle4: number;
  candle5: number;
}

export interface DirectionalSignal {
  direction: 'LONG' | 'SHORT';
  confidence: number; // 0-100
  signalType: SignalType;
  persistenceCounter: number; // 0-20
  probLongSuccess: number;
  probShortSuccess: number;
  edgeConsistency: EdgeConsistency;
  timestamp: number;
}

export interface SignalCondition {
  id: string;
  name: string;
  status: ConditionStatus;
  threshold?: number;
  current?: number;
  description: string;
}

export interface TradeSetup {
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  positionSize: number;
  fillProbability: number;
}

export interface CrossContractData {
  contracts: Array<{
    symbol: string;
    consensus: 'align' | 'diverge' | 'neutral';
    strength: number;
  }>;
}

export interface Zone1State {
  signal: DirectionalSignal | null;
  conditions: SignalCondition[];
  setup: TradeSetup | null;
  crossContract: CrossContractData | null;
  isStreaming: boolean;
  executionInProgress: boolean;
  lastUpdate: number;
}

// API Response Types
export interface SSESignalUpdate {
  type: 'signal-update' | 'condition-update' | 'setup-update' | 'cross-contract-update';
  data: any;
  timestamp: number;
}
