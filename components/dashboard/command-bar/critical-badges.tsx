'use client';

import React from 'react';
import { useDashboard } from '@/lib/dashboard-context';

const badgeConfig = [
  { key: 'liquidityState', label: 'Liquidity' },
  { key: 'volatilityState', label: 'Volatility' },
  { key: 'sessionState', label: 'Session' },
  { key: 'eventRiskState', label: 'Event Risk' },
  { key: 'trapState', label: 'Trap' },
  { key: 'trendState', label: 'Trend' },
];

export function CriticalBadges() {
  const { state } = useDashboard();
  const badges = state.badgeIndicator;

  const getColor = (badgeState: string) => {
    switch (badgeState) {
      case 'normal':
        return 'bg-slate-700 text-slate-300';
      case 'alert':
        return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700';
      case 'critical':
        return 'bg-red-900/60 text-red-300 border border-red-700';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {badgeConfig.map(({ key, label }) => {
        const state = badges ? badges[key as keyof typeof badges] : 'normal';
        return (
          <div
            key={key}
            className={`px-2 py-0.5 rounded text-xs font-medium ${getColor(state)} transition-colors`}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
