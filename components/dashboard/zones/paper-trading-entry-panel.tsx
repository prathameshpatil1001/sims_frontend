'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DirectionalSignal, TradeSetup } from '@/lib/zone1-types';

interface PaperTradingEntryPanelProps {
  signal: DirectionalSignal | null;
  setup: TradeSetup | null;
  isDisabled: boolean;
  onExecute: (direction: 'LONG' | 'SHORT', isDryRun: boolean) => void;
  isExecuting: boolean;
}

export function PaperTradingEntryPanel({
  signal,
  setup,
  isDisabled,
  onExecute,
  isExecuting,
}: PaperTradingEntryPanelProps) {
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [entryPrice, setEntryPrice] = useState(setup?.entry ?? 93450);
  const [lots, setLots] = useState(setup?.positionSize ?? 2);
  const [stopLoss, setStopLoss] = useState(setup?.stopLoss ?? 93150);
  const [target1, setTarget1] = useState(setup?.target1 ?? 93750);
  const [target2, setTarget2] = useState(setup?.target2 ?? 94100);
  const [stopLocked, setStopLocked] = useState(true);

  const STARTING_CAPITAL = 500000;
  const MARGIN_PER_LOT = 55000;
  const LOT_SIZE = 30; // units per lot
  const TICK_SIZE = 1;
  const BROKERAGE_PER_LOT = 20;

  const maxLots = useMemo(() => Math.floor(STARTING_CAPITAL / MARGIN_PER_LOT), []);
  const marginRequired = useMemo(() => lots * MARGIN_PER_LOT, [lots]);
  const riskPerTrade = useMemo(
    () => Math.abs(entryPrice - stopLoss) * lots * LOT_SIZE,
    [entryPrice, stopLoss, lots]
  );
  const brokerageEstimate = useMemo(
    () => BROKERAGE_PER_LOT * lots * 2, // entry + exit
    [lots]
  );
  const breakEvenPrice = useMemo(
    () => entryPrice + (brokerageEstimate / (lots * LOT_SIZE)),
    [entryPrice, brokerageEstimate, lots]
  );

  const riskRewardR1 = Math.abs(target1 - entryPrice) / Math.abs(entryPrice - stopLoss);
  const riskRewardR2 = Math.abs(target2 - entryPrice) / Math.abs(entryPrice - stopLoss);

  const handlePriceAdjust = (direction: 'up' | 'down') => {
    const newPrice = direction === 'up' ? entryPrice + TICK_SIZE : entryPrice - TICK_SIZE;
    setEntryPrice(newPrice);
  };

  const handleLotsChange = (direction: 'inc' | 'dec') => {
    const newLots =
      direction === 'inc' ? Math.min(lots + 1, maxLots) : Math.max(lots - 1, 1);
    setLots(newLots);
  };

  if (!signal || !setup) {
    return null;
  }

  const signalColor =
    signal.direction === 'LONG'
      ? 'border-green-600 bg-green-950/30'
      : 'border-red-600 bg-red-950/30';
  const signalTextColor = signal.direction === 'LONG' ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`space-y-3 rounded-lg border ${signalColor} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${signalTextColor}`}>
          ▲ Entry Control Panel
        </h3>
        <Badge
          variant="outline"
          className={`text-xs ${
            signal.direction === 'LONG'
              ? 'border-green-600 text-green-400'
              : 'border-red-600 text-red-400'
          }`}
        >
          {signal.direction}
        </Badge>
      </div>

      {/* Order Type Toggle */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-300">Order Type</span>
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType('LIMIT')}
            className={`flex-1 rounded py-1.5 text-xs font-bold transition ${
              orderType === 'LIMIT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ● LIMIT
          </button>
          <button
            onClick={() => setOrderType('MARKET')}
            className={`flex-1 rounded py-1.5 text-xs font-bold transition ${
              orderType === 'MARKET'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ○ MARKET
          </button>
        </div>
      </div>

      {/* Entry Price */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-300">
          Entry Price ({orderType})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePriceAdjust('down')}
            className="rounded bg-gray-800 px-2 py-1 text-xs hover:bg-gray-700"
          >
            ←
          </button>
          <span className="flex-1 rounded bg-gray-900 px-3 py-1.5 text-center font-mono text-sm font-bold text-white">
            ₹{entryPrice.toLocaleString()}
          </span>
          <button
            onClick={() => handlePriceAdjust('up')}
            className="rounded bg-gray-800 px-2 py-1 text-xs hover:bg-gray-700"
          >
            →
          </button>
        </div>
        <div className="text-xs text-gray-500">
          (System: ₹{setup.entry.toLocaleString()})
        </div>
      </div>

      {/* Lots Control */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-300">Lots</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLotsChange('dec')}
            disabled={lots <= 1}
            className="rounded bg-gray-800 px-2 py-1 text-xs disabled:opacity-50 hover:bg-gray-700"
          >
            −
          </button>
          <span className="flex-1 rounded bg-gray-900 px-3 py-1.5 text-center font-mono text-sm font-bold text-white">
            {lots}
          </span>
          <button
            onClick={() => handleLotsChange('inc')}
            disabled={lots >= maxLots}
            className="rounded bg-gray-800 px-2 py-1 text-xs disabled:opacity-50 hover:bg-gray-700"
          >
            +
          </button>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>⚠ Margin: ₹{marginRequired.toLocaleString()}</span>
          <span>Available: ₹{STARTING_CAPITAL.toLocaleString()}</span>
        </div>
      </div>

      {/* Stop Loss & Targets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">Stop Loss</span>
          <div className="flex gap-1">
            <button
              onClick={() => setStopLocked(!stopLocked)}
              className={`rounded px-2 py-0.5 text-xs font-bold transition ${
                stopLocked
                  ? 'bg-green-900 text-green-300'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {stopLocked ? 'Lock' : 'Unlock'}
            </button>
          </div>
        </div>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => {
            if (!stopLocked) setStopLoss(parseFloat(e.target.value));
          }}
          disabled={stopLocked}
          className={`w-full rounded bg-gray-900 px-2 py-1.5 text-xs font-mono text-white disabled:opacity-50 ${
            stopLocked ? 'border border-gray-700' : 'border border-amber-700'
          }`}
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <span className="text-xs text-gray-400">Target 1</span>
            <input
              type="number"
              value={target1}
              onChange={(e) => setTarget1(parseFloat(e.target.value))}
              className="w-full rounded bg-gray-900 px-2 py-1.5 text-xs font-mono text-white"
            />
            <span className="text-xs text-blue-400">R:R {riskRewardR1.toFixed(1)}×</span>
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-400">Target 2</span>
            <input
              type="number"
              value={target2}
              onChange={(e) => setTarget2(parseFloat(e.target.value))}
              className="w-full rounded bg-gray-900 px-2 py-1.5 text-xs font-mono text-white"
            />
            <span className="text-xs text-blue-400">R:R {riskRewardR2.toFixed(1)}×</span>
          </div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="space-y-1 border-t border-gray-700 pt-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Max Risk this trade:</span>
          <span className="text-white font-mono">₹{riskPerTrade.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Brokerage (est.):</span>
          <span className="text-white font-mono">₹{brokerageEstimate.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Break-even:</span>
          <span className="text-white font-mono">
            ₹{breakEvenPrice.toFixed(0)} (+₹{(brokerageEstimate / (lots * LOT_SIZE)).toFixed(0)})
          </span>
        </div>
      </div>

      {/* Entry Buttons */}
      <div className="space-y-2 border-t border-gray-700 pt-3">
        <button
          onClick={() =>
            onExecute(signal.direction as 'LONG' | 'SHORT', false)
          }
          disabled={isDisabled || isExecuting}
          className={`w-full rounded py-2 text-xs font-bold transition ${
            signal.direction === 'LONG'
              ? 'border border-green-600 bg-green-900/30 text-green-400 hover:bg-green-900/50 disabled:opacity-50'
              : 'border border-red-600 bg-red-900/30 text-red-400 hover:bg-red-900/50 disabled:opacity-50'
          }`}
        >
          {signal.direction === 'LONG' ? '▲' : '▼'} ENTER {signal.direction} ·{' '}
          {lots} LOTS · ₹{entryPrice.toLocaleString()} {orderType}
        </button>

        <button
          onClick={() =>
            onExecute(
              signal.direction === 'LONG' ? 'SHORT' : 'LONG',
              false
            )
          }
          disabled={isDisabled || isExecuting}
          className="w-full rounded border border-gray-700 bg-gray-800/30 py-2 text-xs font-bold text-gray-400 opacity-50 transition hover:bg-gray-800/50"
        >
          {signal.direction === 'LONG' ? '▼' : '▲'} ENTER{' '}
          {signal.direction === 'LONG' ? 'SHORT' : 'LONG'} · {lots} LOTS ·
          ₹{entryPrice.toLocaleString()} {orderType}
          <span className="text-xs text-gray-500"> (Against signal)</span>
        </button>

        <button
          onClick={() => onExecute(signal.direction as 'LONG' | 'SHORT', true)}
          disabled={isDisabled || isExecuting}
          className="w-full rounded border border-blue-700 bg-blue-900/30 py-2 text-xs font-bold text-blue-400 transition hover:bg-blue-900/50 disabled:opacity-50"
        >
          🔬 DRY RUN
        </button>
      </div>
    </div>
  );
}
