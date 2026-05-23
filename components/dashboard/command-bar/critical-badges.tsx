'use client';

import React from 'react';
import { useDashboard } from '@/lib/dashboard-context';

const badgeConfig = [
  { key: 'liquidityState', label: 'Liquidity', moduleId: 'liquidity-regime' },
  { key: 'volatilityState', label: 'Volatility', moduleId: 'volatility-regime' },
  { key: 'sessionState', label: 'Session', moduleId: 'session-event-risk' },
  { key: 'eventRiskState', label: 'Event Risk', moduleId: 'session-event-risk' },
  { key: 'trapState', label: 'Trap', moduleId: 'institutional-bias' },
  { key: 'trendState', label: 'Trend', moduleId: 'mtf-alignment' },
];

export function CriticalBadges() {
  const { state, dispatch } = useDashboard();
  const badges = state.badgeIndicator;

  const getColor = (badgeState: string) => {
    switch (badgeState) {
      case 'normal':
        return 'bg-slate-700 text-slate-300 hover:bg-slate-600';
      case 'alert':
        return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700 hover:bg-yellow-900';
      case 'critical':
        return 'bg-red-900/60 text-red-300 border border-red-700 hover:bg-red-900';
      default:
        return 'bg-slate-700 text-slate-300 hover:bg-slate-600';
    }
  };

  const handleBadgeClick = (moduleId: string) => {
    dispatch({
      type: 'OPEN_OVERLAY',
      payload: moduleId,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {badgeConfig.map(({ key, label, moduleId }) => {
        const badgeState = badges ? badges[key as keyof typeof badges] : 'normal';
        return (
          <button
            key={key}
            onClick={() => handleBadgeClick(moduleId)}
            className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${getColor(badgeState)}`}
            title={`Click for ${label} details`}
          >
            {label}: {badgeState}
          </button>
        );
      })}
    </div>
  );
}
