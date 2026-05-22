'use client';

import React from 'react';
import { HealthIndicator } from './health-indicator';
import { PriceDisplay } from './price-display';
import { CriticalBadges } from './critical-badges';
import { ControlsBar } from './controls-bar';

export function CommandBar() {
  return (
    <div className="h-12 border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-between px-4 gap-4">
      {/* Left: Health Indicator */}
      <HealthIndicator />

      {/* Center-Left: Price Display */}
      <PriceDisplay />

      {/* Center-Right: Critical Badges */}
      <CriticalBadges />

      {/* Right: Controls */}
      <ControlsBar />
    </div>
  );
}
