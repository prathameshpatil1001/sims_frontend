'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { analysisApi } from '@/lib/api-service';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { IntelligenceModule } from '@/lib/zone3-types';

// Module Card Components
function ModuleCard({
  module,
  onSelect,
}: {
  module: IntelligenceModule;
  onSelect: (id: string) => void;
}) {
  const statusColor =
    module.status === 'active'
      ? 'bg-green-900 text-green-200'
      : module.status === 'stale'
        ? 'bg-amber-900 text-amber-200'
        : 'bg-gray-700 text-gray-300';

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div
      onClick={() => onSelect(module.id)}
      className="cursor-pointer rounded border border-gray-600 bg-gray-950 p-3 hover:border-blue-500 hover:bg-gray-900 transition-all"
    >
      {/* Header: Title + Status + Timestamp */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-gray-200 truncate">
            {module.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant="outline"
            className={`text-xs ${statusColor} border-0`}
          >
            {module.status === 'active'
              ? module.confidence.toFixed(0)
              : module.status === 'stale'
                ? 'STALE DATA'
                : 'UNAVAILABLE'}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatTime(module.timestamp)}
          </span>
        </div>
      </div>

      {/* Body: Module-specific content */}
      <ModuleDataDisplay module={module} />
    </div>
  );
}

function ModuleDataDisplay({ module }: { module: IntelligenceModule }) {
  const data = module.data;

  switch (data.type) {
    case 'composite-confidence':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Direction:</span>
            <span
              className={
                data.dominantDirection === 'BULLISH'
                  ? 'text-green-400 font-bold'
                  : data.dominantDirection === 'BEARISH'
                    ? 'text-red-400 font-bold'
                    : 'text-gray-300'
              }
            >
              {'▲'} {data.dominantDirection}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pre-cap:</span>
            <span className="text-white">{data.preCapscore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Post-cap:</span>
            <span className="text-white">{data.postCapScore}</span>
          </div>
          <div className="flex gap-2 text-gray-400 mt-1">
            <span>Bull: {data.bullProbability.toFixed(0)}%</span>
            <span>Bear: {data.bearProbability.toFixed(0)}%</span>
            <span>Neutral: {data.neutralProbability.toFixed(0)}%</span>
          </div>
        </div>
      );

    case 'mtf-alignment':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="text-white">{data.alignmentScore}</span>
          </div>
          <div className="flex gap-2 text-gray-300 text-xs">
            <span>1m: {'▲'}</span>
            <span>2m: {'▲'}</span>
            <span>5m: {'▲'}</span>
            <span>10m: {'▲'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Strength:</span>
            <span className="text-green-300 font-bold">{data.strength}</span>
          </div>
        </div>
      );

    case 'absorption-aggression':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">State:</span>
            <span
              className={
                data.state === 'DOMINANCE'
                  ? 'text-green-400 font-bold'
                  : data.state === 'ABSORPTION'
                    ? 'text-amber-400 font-bold'
                    : 'text-blue-400'
              }
            >
              {data.state}
            </span>
          </div>
          <div className="flex gap-2 text-gray-400">
            <span>Buy: {data.buyPressurePercent.toFixed(0)}%</span>
            <span>Sell: {data.sellPressurePercent.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Imbalance:</span>
            <span className="text-white">{data.imbalanceRatio.toFixed(2)}x</span>
          </div>
        </div>
      );

    case 'structural-reversal':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">State:</span>
            <span className="text-white">{data.reversalState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="text-white">{data.reversalScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cluster triggers:</span>
            <span className="text-white">{data.clusterTriggerCount}/3</span>
          </div>
        </div>
      );

    case 'institutional-bias':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Signal:</span>
            <span
              className={
                data.mcxOiSignal === 'BULL_BIAS'
                  ? 'text-green-400 font-bold'
                  : data.mcxOiSignal === 'BEAR_BIAS'
                    ? 'text-red-400 font-bold'
                    : 'text-gray-300'
              }
            >
              {data.mcxOiSignal}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">OI rate:</span>
            <span className="text-white">
              {data.mcxOiRate.toLocaleString()} lots/min
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Trap risk:</span>
            <span className="text-white">{data.trapRiskScore.toFixed(2)}</span>
          </div>
        </div>
      );

    case 'volatility-regime':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Regime:</span>
            <span className="text-white">{data.regime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ATR:</span>
            <span className="text-white">₹{data.atr.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">ATR %ile:</span>
            <span className="text-white">{data.atrPercentile}th</span>
          </div>
        </div>
      );

    case 'cvd-module':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">CVD:</span>
            <span className="text-white">{data.cvdValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Slope:</span>
            <span
              className={
                data.cvdSlope === 'RISING'
                  ? 'text-green-400'
                  : data.cvdSlope === 'FALLING'
                    ? 'text-red-400'
                    : 'text-gray-400'
              }
            >
              {data.cvdSlope}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Divergence:</span>
            <span className="text-white">{data.cvdDivergence}</span>
          </div>
        </div>
      );

    case 'structural-context':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Context:</span>
            <span className="text-white">{data.primaryContext}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">VWAP:</span>
            <span className="text-white">₹{data.vwap.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Nearest level:</span>
            <span className="text-white">{data.nearestLevel}</span>
          </div>
        </div>
      );

    case 'liquidity-regime':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Regime:</span>
            <span className="text-white">{data.regime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Trade intensity:</span>
            <span className="text-white">{data.tradeIntensity} trades/min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Participation:</span>
            <span className="text-white">{data.participationLevel}</span>
          </div>
        </div>
      );

    case 'session-event-risk':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Phase:</span>
            <span className="text-white">{data.sessionPhase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">To close:</span>
            <span className="text-white">{data.minutesToClose}m</span>
          </div>
          {data.nextEvent && (
            <div className="flex justify-between">
              <span className="text-gray-400">Next event:</span>
              <span className="text-white text-xs">{data.nextEvent.name}</span>
            </div>
          )}
        </div>
      );

    case 'orderbook-microstructure':
      return (
        <div className="space-y-1 text-xs">
          {data.dataAvailable ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Bias:</span>
                <span className="text-white">{data.microstructureBias}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Imbalance:</span>
                <span className="text-white">
                  {data.imbalanceRatio.toFixed(1)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Spoofing:</span>
                <span className={data.spoofingDetected ? 'text-red-400' : 'text-green-400'}>
                  {data.spoofingDetected ? 'DETECTED' : 'NO'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-gray-500">L2 data not available</div>
          )}
        </div>
      );

    case 'move-quality-scorer':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="text-white font-bold">{data.score}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tier:</span>
            <span
              className={
                data.qualityTier === 'HIGH QUALITY'
                  ? 'text-green-400 font-bold'
                  : data.qualityTier === 'MEDIUM QUALITY'
                    ? 'text-amber-400 font-bold'
                    : 'text-red-400 font-bold'
              }
            >
              {data.qualityTier}
            </span>
          </div>
          <div className="text-gray-400">
            Contributing: {data.contributingFactors.slice(0, 2).join(' ✓ ')} ✓
          </div>
        </div>
      );

    default:
      return null;
  }
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="flex-1 h-px bg-gray-700" />
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
}

// Mock data generator for demo
function generateMockModules(): IntelligenceModule[] {
  const now = Date.now();
  return [
    // Direction Core
    {
      id: 'composite-confidence',
      name: 'Composite Confidence Fusion',
      section: 'direction-core',
      status: 'active',
      timestamp: now,
      confidence: 72,
      data: {
        type: 'composite-confidence',
        dominantDirection: 'BULLISH',
        finalConfidence: 72,
        preCapscore: 74,
        postCapScore: 72,
        bullProbability: 0.68,
        bearProbability: 0.12,
        neutralProbability: 0.2,
        weights: { mtf: 30, absorption: 25, structural: 20 },
        penalties: { volatility: -5, transition: -3, net: -8 },
      },
    },
    {
      id: 'mtf-alignment',
      name: 'MTF Alignment Engine',
      section: 'direction-core',
      status: 'active',
      timestamp: now,
      confidence: 82,
      data: {
        type: 'mtf-alignment',
        alignmentStatus: 'ALIGNED',
        alignmentScore: 82,
        timeframeDirections: {
          '1m': 'BULLISH',
          '2m': 'BULLISH',
          '5m': 'BULLISH',
          '10m': 'BULLISH',
        },
        emaSloperConfirmations: 3,
        strength: 'STRONG',
      },
    },
    // Pressure & Flow
    {
      id: 'absorption-aggression',
      name: 'Absorption & Aggression Engine',
      section: 'pressure-flow',
      status: 'active',
      timestamp: now,
      confidence: 68,
      data: {
        type: 'absorption-aggression',
        state: 'DOMINANCE',
        buyPressurePercent: 0.68,
        sellPressurePercent: 0.32,
        efficiency: 0.84,
        imbalanceRatio: 2.1,
        shockState: 'NONE',
      },
    },
    {
      id: 'structural-reversal',
      name: 'Structural Reversal Engine',
      section: 'pressure-flow',
      status: 'active',
      timestamp: now,
      confidence: 24,
      data: {
        type: 'structural-reversal',
        reversalState: 'CONTINUATION',
        reversalScore: 24,
        reversalType: null,
        clusterTriggerCount: 0,
      },
    },
    {
      id: 'institutional-bias',
      name: 'Institutional Bias',
      section: 'pressure-flow',
      status: 'active',
      timestamp: now,
      confidence: 74,
      data: {
        type: 'institutional-bias',
        mcxOiSignal: 'BULL_BIAS',
        mcxOiRate: 2400,
        oiSmoothedRate: 1850,
        trapRiskScore: 0.12,
        institutionalConfidence: 0.74,
      },
    },
    {
      id: 'volatility-regime',
      name: 'Volatility Regime Engine',
      section: 'pressure-flow',
      status: 'active',
      timestamp: now,
      confidence: 54,
      data: {
        type: 'volatility-regime',
        regime: 'NORMAL_VOL',
        atr: 185,
        atrPercentile: 54,
        atrRatio: 0.97,
        expansionRate: 0.02,
        rMultiple: 1.0,
        stopMultiplier: 2.0,
        sizeModifier: 1.0,
        confidencePenalty: 0,
      },
    },
    {
      id: 'cvd-module',
      name: 'CVD Module',
      section: 'pressure-flow',
      status: 'active',
      timestamp: now,
      confidence: 65,
      data: {
        type: 'cvd-module',
        cvdValue: 12450,
        cvdSlope: 'RISING',
        cvdBias: 'BULL',
        cvdDivergence: 'NONE',
        sessionStartCvd: 3200,
      },
    },
    {
      id: 'structural-context',
      name: 'Structural Context Engine',
      section: 'pressure-flow',
      status: 'active',
      timestamp: now,
      confidence: 78,
      data: {
        type: 'structural-context',
        primaryContext: 'BULLISH_ABOVE_VWAP',
        structuralStrength: 0.78,
        vwap: 93310,
        ltpVsVwapPercent: 0.15,
        nearestLevel: 'PDH ₹94,200',
        nearestLevelDistance: 0.8,
        openingRangeHigh: 93420,
        openingRangeLow: 93100,
        openingRangeBreakout: true,
      },
    },
    // Environment
    {
      id: 'liquidity-regime',
      name: 'Liquidity Regime & Transition',
      section: 'environment',
      status: 'active',
      timestamp: now,
      confidence: 64,
      data: {
        type: 'liquidity-regime',
        regime: 'ACTIVE',
        tradeIntensity: 42,
        tradeIntensityMedian: 30,
        intensityRatio: 1.4,
        participationLevel: 'HIGH',
        quoteTradeRatio: 2.1,
        shockState: 'NONE',
        transitionPrediction: {
          predictedRegime: 'NORMAL',
          transitionProbability: 0.24,
          candlesToTransitionEstimate: 8,
          confidenceModifier: 0,
        },
      },
    },
    {
      id: 'session-event-risk',
      name: 'Session & Event Risk',
      section: 'environment',
      status: 'active',
      timestamp: now,
      confidence: 85,
      data: {
        type: 'session-event-risk',
        sessionPhase: 'MID_SESSION',
        minutesToClose: 312,
        openingDistortion: 'RESOLVED',
        lateCompression: 'INACTIVE',
        eventRisk: 'CLEAR',
        nextEvent: {
          name: 'RBI Policy',
          time: '14:00 IST',
          impact: 'MEDIUM',
        },
      },
    },
    {
      id: 'orderbook-microstructure',
      name: 'Order Book Microstructure',
      section: 'environment',
      status: 'unavailable',
      timestamp: now,
      confidence: 0,
      data: {
        type: 'orderbook-microstructure',
        dataAvailable: false,
        microstructureBias: 'UNAVAILABLE',
        imbalanceRatio: 0,
        imbalanceZScore: 0,
        spoofingDetected: false,
        icebergDetected: false,
        absorptionLevel: '',
      },
    },
    {
      id: 'move-quality-scorer',
      name: 'Move Quality Scorer',
      section: 'environment',
      status: 'active',
      timestamp: now,
      confidence: 74,
      data: {
        type: 'move-quality-scorer',
        score: 74,
        qualityTier: 'HIGH QUALITY',
        contributingFactors: ['MTF', 'Absorption', 'Regime', 'CVD'],
        deductions: [
          { reason: 'Volatility', amount: -5 },
          { reason: 'Event caution', amount: -3 },
        ],
      },
    },
  ];
}

export function Zone3Intelligence() {
  const { state, dispatch } = useDashboard();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true);
        const data = await analysisApi.getModules();
        dispatch({
          type: 'UPDATE_ZONE3_MODULES',
          payload: data,
        });
      } catch (err) {
        console.error('[v0] Failed to fetch intelligence modules:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchModules();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchModules, 5 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Use modules from dashboard state or show loading state
  const modules = state.zone3State?.modules || [];

  const directionCoreModules = modules.filter(
    (m) => m.section === 'direction-core'
  );
  const pressureFlowModules = modules.filter(
    (m) => m.section === 'pressure-flow'
  );
  const environmentModules = modules.filter(
    (m) => m.section === 'environment'
  );

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Intelligence Modules
        </h2>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {modules.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Waiting for module data…</p>
              <p className="text-xs text-slate-600">Backend is computing intelligence modules.</p>
            </div>
          ) : (
            <>
              {/* Direction Core Section */}
              {directionCoreModules.length > 0 && (
                <>
                  <SectionDivider title="Direction Core" />
                  <div className="space-y-2">
                    {directionCoreModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onSelect={setSelectedModuleId}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Pressure & Flow Section */}
              {pressureFlowModules.length > 0 && (
                <>
                  <SectionDivider title="Pressure & Flow" />
                  <div className="space-y-2">
                    {pressureFlowModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onSelect={setSelectedModuleId}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Environment Section */}
              {environmentModules.length > 0 && (
                <>
                  <SectionDivider title="Environment" />
                  <div className="space-y-2">
                    {environmentModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onSelect={setSelectedModuleId}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
