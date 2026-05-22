// Zone 2 - Charts & Microstructure Types

export type Timeframe = '1m' | '2m' | '5m' | '10m';

export interface OHLCData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StructuralLevel {
  price: number;
  label: string;
  type: 'vwap' | 'pdh' | 'pdl' | 'support' | 'resistance' | 'target';
  color: string;
}

export interface EventMarker {
  time: number;
  type: 'signal-fire' | 'trap' | 'regime-change' | 'absorption';
  price: number;
  description: string;
}

export interface AbsorptionZone {
  startTime: number;
  endTime: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  intensity: 'light' | 'moderate' | 'heavy';
}

export interface CVDData {
  time: number;
  cumulative: number; // Cumulative Volume Delta
  bidVolume: number;
  askVolume: number;
}

export interface MicrostructureData {
  cvd: CVDData[];
  volumeOI: VolumeOIBar[];
  tradeIntensity: TradeIntensityData[];
}

export interface VolumeOIBar {
  time: number;
  volume: number;
  openInterest: number;
  buySide: number;
  sellSide: number;
  color: 'bull' | 'bear' | 'neutral';
}

export interface TradeIntensityData {
  time: number;
  intensity: number; // 0-100
  tradeCount: number;
  largeTradeCount: number;
  avgTradeSize: number;
}

export interface StructuralContext {
  vwap: number;
  pdh: number;
  pdl: number;
  range: number;
  atr: number;
  supportLevels: StructuralLevel[];
  resistanceLevels: StructuralLevel[];
  eventMarkers: EventMarker[];
  absorptionZones: AbsorptionZone[];
  isTradingSuspended: boolean;
  suspensionReason?: string;
}

export type MicrostructureTab = 'cvd' | 'volume-oi' | 'trade-intensity';

export interface Zone2State {
  ohlcData: OHLCData[];
  microstructure: MicrostructureData | null;
  structural: StructuralContext | null;
  currentTimeframe: Timeframe;
  activeMicroTab: MicrostructureTab;
  selectedCandle: OHLCData | null;
  isLoading: boolean;
  lastUpdate: number;
}
