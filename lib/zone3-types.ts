// Zone 3: Intelligence Module Panel Types

export interface Zone3State {
  modules: IntelligenceModule[];
  lastUpdate: number;
  isLoading: boolean;
  selectedModuleId: string | null;
}

export interface IntelligenceModule {
  id: string;
  name: string;
  section: 'direction-core' | 'pressure-flow' | 'environment';
  status: 'active' | 'stale' | 'unavailable';
  timestamp: number;
  confidence: number;
  data: ModuleData;
}

export type ModuleData =
  | CompositeConfidenceData
  | MTFAlignmentData
  | AbsorptionAgressionData
  | StructuralReversalData
  | InstitutionalBiasData
  | VolatilityRegimeData
  | CVDModuleData
  | StructuralContextData
  | LiquidityRegimeData
  | SessionEventRiskData
  | OrderbookMicrostructureData
  | MoveQualityScorerData;

export interface CompositeConfidenceData {
  type: 'composite-confidence';
  dominantDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  finalConfidence: number;
  preCapscore: number;
  postCapScore: number;
  bullProbability: number;
  bearProbability: number;
  neutralProbability: number;
  weights: {
    mtf: number;
    absorption: number;
    structural: number;
  };
  penalties: {
    volatility: number;
    transition: number;
    net: number;
  };
}

export interface MTFAlignmentData {
  type: 'mtf-alignment';
  alignmentStatus: 'ALIGNED' | 'PARTIAL' | 'DIVERGENT' | 'INSUFFICIENT';
  alignmentScore: number;
  timeframeDirections: {
    '1m': 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    '2m': 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    '5m': 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    '10m': 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  emaSloperConfirmations: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface AbsorptionAgressionData {
  type: 'absorption-aggression';
  state: 'DOMINANCE' | 'ABSORPTION' | 'BALANCED' | 'WEAK_PRESSURE' | 'NONE';
  buyPressurePercent: number;
  sellPressurePercent: number;
  efficiency: number;
  imbalanceRatio: number;
  shockState: 'NONE' | 'ACTIVE' | 'EXTREME';
}

export interface StructuralReversalData {
  type: 'structural-reversal';
  reversalState: 'REVERSAL_DETECTED' | 'CONTINUATION' | 'NEUTRAL';
  reversalScore: number;
  reversalType: string | null;
  clusterTriggerCount: number;
}

export interface InstitutionalBiasData {
  type: 'institutional-bias';
  mcxOiSignal: 'BULL_BIAS' | 'BEAR_BIAS' | 'NEUTRAL';
  mcxOiRate: number;
  oiSmoothedRate: number;
  trapRiskScore: number;
  institutionalConfidence: number;
}

export interface VolatilityRegimeData {
  type: 'volatility-regime';
  regime: 'EXPANSION' | 'NORMAL_VOL' | 'CONTRACTION' | 'EXTREME';
  atr: number;
  atrPercentile: number;
  atrRatio: number;
  expansionRate: number;
  rMultiple: number;
  stopMultiplier: number;
  sizeModifier: number;
  confidencePenalty: number;
}

export interface CVDModuleData {
  type: 'cvd-module';
  cvdValue: number;
  cvdSlope: 'RISING' | 'FALLING' | 'FLAT';
  cvdBias: 'BULL' | 'BEAR' | 'NEUTRAL';
  cvdDivergence: 'NONE' | 'BULLISH' | 'BEARISH';
  sessionStartCvd: number;
}

export interface StructuralContextData {
  type: 'structural-context';
  primaryContext:
    | 'BULLISH_ABOVE_VWAP'
    | 'BEARISH_BELOW_VWAP'
    | 'AT_VWAP'
    | 'RANGING'
    | 'BREAKOUT';
  structuralStrength: number;
  vwap: number;
  ltpVsVwapPercent: number;
  nearestLevel: string;
  nearestLevelDistance: number;
  openingRangeHigh: number;
  openingRangeLow: number;
  openingRangeBreakout: boolean;
}

export interface LiquidityRegimeData {
  type: 'liquidity-regime';
  regime: 'ACTIVE' | 'NORMAL' | 'THIN' | 'DRY';
  tradeIntensity: number;
  tradeIntensityMedian: number;
  intensityRatio: number;
  participationLevel: 'HIGH' | 'NORMAL' | 'LOW';
  quoteTradeRatio: number;
  shockState: 'NONE' | 'ACTIVE' | 'EXTREME';
  transitionPrediction: {
    predictedRegime: string;
    transitionProbability: number;
    candlesToTransitionEstimate: number;
    confidenceModifier: number;
  };
}

export interface SessionEventRiskData {
  type: 'session-event-risk';
  sessionPhase: 'PRE_SESSION' | 'OPENING' | 'MID_SESSION' | 'CLOSING' | 'POST_SESSION';
  minutesToClose: number;
  openingDistortion: 'ACTIVE' | 'RESOLVED' | 'NONE';
  lateCompression: 'INACTIVE' | 'BUILDING' | 'ACTIVE';
  eventRisk: 'CLEAR' | 'WATCH' | 'ALERT';
  nextEvent: {
    name: string;
    time: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
  } | null;
}

export interface OrderbookMicrostructureData {
  type: 'orderbook-microstructure';
  dataAvailable: boolean;
  microstructureBias: 'BID_HEAVY' | 'ASK_HEAVY' | 'BALANCED' | 'UNAVAILABLE';
  imbalanceRatio: number;
  imbalanceZScore: number;
  spoofingDetected: boolean;
  icebergDetected: boolean;
  absorptionLevel: string;
}

export interface MoveQualityScorerData {
  type: 'move-quality-scorer';
  score: number;
  qualityTier: 'HIGH QUALITY' | 'MEDIUM QUALITY' | 'LOW QUALITY';
  contributingFactors: string[];
  deductions: {
    reason: string;
    amount: number;
  }[];
}
