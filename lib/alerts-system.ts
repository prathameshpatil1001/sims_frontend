// Part 13: Alerts & Notifications System

export type AlertLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type AnomalyType = 'confidence-drop' | 'regime-shift' | 'divergence' | 'liquidity-crisis' | 'feed-delay';

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  anomalyType: AnomalyType;
  timestamp: number;
  component: string; // where to display (zone1, zone2, command-bar, etc)
  actionable: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export const alertConfig: Record<AlertLevel, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
  soundBeeps: number;
  showBanner: boolean;
  duration: number; // ms, 0 = persistent
}> = {
  CRITICAL: {
    bgColor: 'bg-red-900',
    textColor: 'text-red-100',
    borderColor: 'border-red-500',
    icon: '🚨',
    soundBeeps: 3,
    showBanner: true,
    duration: 0,
  },
  HIGH: {
    bgColor: 'bg-orange-900',
    textColor: 'text-orange-100',
    borderColor: 'border-orange-500',
    icon: '⚠️',
    soundBeeps: 2,
    showBanner: true,
    duration: 8000,
  },
  MEDIUM: {
    bgColor: 'bg-amber-900',
    textColor: 'text-amber-100',
    borderColor: 'border-amber-500',
    icon: '!',
    soundBeeps: 1,
    showBanner: false,
    duration: 5000,
  },
  INFO: {
    bgColor: 'bg-blue-900',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-500',
    icon: 'ℹ',
    soundBeeps: 0,
    showBanner: false,
    duration: 3000,
  },
};

export const anomalyConfig: Record<AnomalyType, {
  level: AlertLevel;
  title: string;
  description: string;
  triggers: string[];
}> = {
  'confidence-drop': {
    level: 'HIGH',
    title: 'Confidence Drop Detected',
    description: 'Signal confidence fell below 60%',
    triggers: ['composite_confidence < 0.60'],
  },
  'regime-shift': {
    level: 'MEDIUM',
    title: 'Regime Shift',
    description: 'Market regime changed to choppy',
    triggers: ['regime changed to CHOPPY'],
  },
  'divergence': {
    level: 'MEDIUM',
    title: 'Cross-Contract Divergence',
    description: 'ES and NQ showing conflicting signals',
    triggers: ['cross_contract_alignment < 0.60'],
  },
  'liquidity-crisis': {
    level: 'CRITICAL',
    title: 'Liquidity Crisis',
    description: 'Bid-ask spread exceeds 2.5% of price',
    triggers: ['bid_ask_spread > 2.5%'],
  },
  'feed-delay': {
    level: 'HIGH',
    title: 'Feed Latency High',
    description: 'Data feed latency exceeds 500ms',
    triggers: ['latency_ms > 500'],
  },
};

export function createAlert(
  anomalyType: AnomalyType,
  component: string,
  customMessage?: string
): Alert {
  const anomaly = anomalyConfig[anomalyType];
  const config = alertConfig[anomaly.level];

  return {
    id: `${anomalyType}-${Date.now()}`,
    level: anomaly.level,
    title: anomaly.title,
    message: customMessage || anomaly.description,
    anomalyType,
    timestamp: Date.now(),
    component,
    actionable: anomaly.level === 'CRITICAL' || anomaly.level === 'HIGH',
    actionLabel: 'Acknowledge',
  };
}
