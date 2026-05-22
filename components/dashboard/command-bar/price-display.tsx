'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/dashboard-context';

export function PriceDisplay() {
  const { state } = useDashboard();
  const [flashTick, setFlashTick] = useState(false);
  const price = state.priceData;

  useEffect(() => {
    if (price?.timestamp) {
      setFlashTick(true);
      const timer = setTimeout(() => setFlashTick(false), 500);
      return () => clearTimeout(timer);
    }
  }, [price?.timestamp]);

  const changeColor = price && price.change >= 0 ? 'text-green-400' : 'text-red-400';
  const bgColor = flashTick ? 'bg-blue-500/20' : 'bg-transparent';

  return (
    <div className={`flex items-center gap-3 px-4 py-1 rounded transition-colors ${bgColor}`}>
      <div className="flex flex-col gap-0">
        <span className="text-xs text-slate-500">Price</span>
        <span className="text-sm font-bold text-slate-100">
          {price ? `₹${price.current.toFixed(2)}` : '--'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <div className={`flex flex-col gap-0 ${changeColor}`}>
          <span className="text-xs font-medium">
            {price ? (price.change >= 0 ? '▲' : '▼') : '--'}
          </span>
          <span className="text-xs font-bold">
            {price ? `${price.changePercent.toFixed(2)}%` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
