'use client';

import React from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { X } from 'lucide-react';
import type { OverlayType } from '@/lib/zone4-overlay-types';

const overlayConfigs: Record<OverlayType, { title: string; description: string }> = {
  'composite-confidence': {
    title: 'Composite Confidence Fusion',
    description: 'Weighted contribution of all signal components',
  },
  'system-integrity': {
    title: 'System Integrity Status',
    description: 'Real-time health metrics and thresholds',
  },
  'entry-timing': {
    title: 'Entry Timing Analysis',
    description: 'Optimal entry based on microstructure',
  },
  'position-sizing': {
    title: 'Position Sizing Calculation',
    description: 'Risk-adjusted position sizing formula',
  },
  'edge-consistency': {
    title: 'Edge Consistency Over Time',
    description: 'Signal quality persistence tracking',
  },
  'microstructure-health': {
    title: 'Microstructure Health Check',
    description: 'Volume, spread, and liquidity analysis',
  },
  'regime-alignment': {
    title: 'Regime Alignment Score',
    description: 'Market regime conformance metrics',
  },
  'liquidity-depth': {
    title: 'Liquidity Depth Analysis',
    description: 'Market depth and absorption zones',
  },
  'slippage-estimate': {
    title: 'Slippage Estimate',
    description: 'Expected execution slippage range',
  },
  'event-risk': {
    title: 'Event Risk Assessment',
    description: 'Upcoming economic events impact',
  },
  'trade-history': {
    title: 'Trade History Analysis',
    description: 'Historical performance patterns',
  },
  'signal-details': {
    title: 'Signal Details Deep Dive',
    description: 'Complete signal component breakdown',
  },
};

interface DrillDownSection {
  title: string;
  items: Array<{ label: string; value: string | number; color?: string }>;
}

function CompositeConfidenceContent(): React.ReactNode {
  const sections: DrillDownSection[] = [
    {
      title: 'OUTPUT',
      items: [
        { label: 'Final Confidence', value: '78%', color: 'text-green-400' },
        { label: 'Direction', value: 'LONG', color: 'text-green-400' },
      ],
    },
    {
      title: 'INPUTS',
      items: [
        { label: 'RSI Oversold Signal', value: '28 / 30', color: 'text-cyan-400' },
        { label: 'MACD Bullish Cross', value: 'Confirmed', color: 'text-cyan-400' },
        { label: 'Bollinger Touch', value: 'Lower Band', color: 'text-cyan-400' },
      ],
    },
    {
      title: 'COMPUTATION',
      items: [
        { label: 'RSI Weight', value: '35% → 24.5%', color: 'text-yellow-400' },
        { label: 'MACD Weight', value: '30% → 21.0%', color: 'text-yellow-400' },
        { label: 'BB Weight', value: '20% → 14.0%', color: 'text-yellow-400' },
        { label: 'Microstructure Weight', value: '15% → 18.5%', color: 'text-yellow-400' },
      ],
    },
    {
      title: 'HISTORY',
      items: [
        { label: '5min Ago', value: '76%', color: 'text-gray-400' },
        { label: '10min Ago', value: '73%', color: 'text-gray-400' },
        { label: '15min Ago', value: '71%', color: 'text-gray-400' },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-bold text-gray-300 uppercase mb-2">{section.title}</h3>
          <div className="bg-gray-800 rounded p-2 space-y-1">
            {section.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-gray-400">{item.label}</span>
                <span className={item.color || 'text-white'}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemIntegrityContent(): React.ReactNode {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase mb-2">OUTPUT</h3>
        <div className="bg-gray-800 rounded p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Overall Health</span>
            <span className="text-green-400">HEALTHY</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Latency</span>
            <span className="text-cyan-400">24ms</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase mb-2">SYSTEMS</h3>
        <div className="bg-gray-800 rounded p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Market Data</span>
            <span className="text-green-400">OK</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Execution Engine</span>
            <span className="text-green-400">OK</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Risk Management</span>
            <span className="text-green-400">OK</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Signal Generation</span>
            <span className="text-amber-400">⚠ Monitor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PositionSizingContent(): React.ReactNode {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase mb-2">OUTPUT</h3>
        <div className="bg-gray-800 rounded p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Recommended Size</span>
            <span className="text-white font-bold">5 contracts</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Risk/Trade</span>
            <span className="text-white font-bold">$185 (0.37%)</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase mb-2">INPUTS</h3>
        <div className="bg-gray-800 rounded p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Account Size</span>
            <span className="text-cyan-400">$50,000</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Risk Per Trade</span>
            <span className="text-cyan-400">0.5%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Stop Loss Distance</span>
            <span className="text-cyan-400">370 points</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DrillDownOverlay() {
  const { state, dispatch } = useDashboard();
  const activeType = state.overlayState.activeOverlay;

  if (!activeType) return null;

  const config = overlayConfigs[activeType];

  const getContent = () => {
    switch (activeType) {
      case 'composite-confidence':
        return <CompositeConfidenceContent />;
      case 'system-integrity':
        return <SystemIntegrityContent />;
      case 'position-sizing':
        return <PositionSizingContent />;
      default:
        return (
          <div className="bg-gray-800 rounded p-3 text-xs text-gray-400">
            Detailed analysis for {config.title}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
      />

      {/* Right-side panel */}
      <div className="absolute right-0 top-0 h-screen w-[480px] bg-gray-900 border-l border-gray-700 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">{config.title}</h2>
            <p className="text-xs text-gray-400 mt-1">{config.description}</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {getContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 px-6 py-3 bg-gray-950 text-xs text-gray-400 flex justify-between">
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
