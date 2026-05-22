'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { ChevronUp } from 'lucide-react';
import type { Position, DailyMetrics, TradeLog } from '@/lib/zone4-overlay-types';

// No mock data — all performance data comes from live backend via useDashboardData polling hook


interface PositionRowProps {
  position: Position;
}

function PositionRow({ position }: PositionRowProps) {
  const pnlColor = position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400';
  return (
    <div className="grid grid-cols-7 gap-2 text-xs p-2 border-b border-gray-700 hover:bg-gray-800">
      <div className="font-mono font-bold text-white">{position.contract}</div>
      <div className={position.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}>{position.direction}</div>
      <div className="font-mono text-gray-300">{position.entryPrice.toLocaleString()}</div>
      <div className="font-mono text-gray-300">{position.currentPrice.toLocaleString()}</div>
      <div className="font-mono text-gray-300">x{position.quantity}</div>
      <div className={`font-mono font-bold ${pnlColor}`}>${position.unrealizedPnL.toLocaleString()}</div>
      <div className={`font-mono font-bold ${pnlColor}`}>{position.unrealizedPnLPercent.toFixed(2)}%</div>
    </div>
  );
}

interface TradeRowProps {
  trade: TradeLog;
}

function TradeRow({ trade }: TradeRowProps) {
  const pnlColor = trade.pnl >= 0 ? 'text-green-400' : 'text-red-400';
  return (
    <div className="grid grid-cols-8 gap-2 text-xs p-2 border-b border-gray-700 hover:bg-gray-800">
      <div className="font-mono text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</div>
      <div className={trade.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}>{trade.direction}</div>
      <div className="font-mono text-gray-300">{trade.entryPrice.toLocaleString()}</div>
      <div className="font-mono text-gray-300">{trade.exitPrice.toLocaleString()}</div>
      <div className="font-mono text-gray-300">x{trade.quantity}</div>
      <div className={`font-mono font-bold ${pnlColor}`}>${trade.pnl}</div>
      <div className={`font-mono font-bold ${pnlColor}`}>{trade.pnlPercent.toFixed(2)}%</div>
      <div className="text-gray-400">{trade.duration}m</div>
    </div>
  );
}

export function Zone4Performance() {
  const { state, dispatch } = useDashboard();
  const [isExpanded, setIsExpanded] = useState(false);

  // Live data — null until first poll completes
  const metrics = state.zone4State?.dailyMetrics ?? null;
  const positions = state.zone4State?.positions ?? [];
  const tradeLog = state.zone4State?.tradeLog ?? [];
  const isLoading = !metrics;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    dispatch({ type: 'SET_ZONE4_EXPANDED', payload: !isExpanded });
  };

  if (isLoading) {
    return (
      <div
        className="transition-all overflow-hidden bg-gray-950 border-t border-gray-800"
        style={{ height: '120px' }}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">PERFORMANCE & POSITIONS</div>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 text-xs text-slate-500">
          <div className="w-4 h-4 border border-slate-600 border-t-blue-400 rounded-full animate-spin" />
          Loading live P&L data…
        </div>
      </div>
    );
  }

  return (
    <div
      className="transition-all overflow-hidden bg-gray-950 border-t border-gray-800"
      style={{ height: isExpanded ? '320px' : '120px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">PERFORMANCE & POSITIONS</div>
        <button
          onClick={toggleExpand}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronUp
            size={16}
            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Collapsed View: Daily Metrics Strip */}
      {!isExpanded && (
        <div className="flex gap-2 px-4 py-3 text-xs">
          <div className="flex flex-col">
            <span className="text-gray-400">Net P&L</span>
            <span className={metrics.netProfit >= 0 ? 'text-green-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
              ${metrics.netProfit.toLocaleString()}
            </span>
          </div>
          <div className="border-r border-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-gray-400">Return</span>
            <span className={metrics.netPnLPercent >= 0 ? 'text-green-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
              {metrics.netPnLPercent.toFixed(2)}%
            </span>
          </div>
          <div className="border-r border-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-gray-400">Win Rate</span>
            <span className="text-blue-400 font-bold text-sm">{(metrics.winRate * 100).toFixed(0)}%</span>
          </div>
          <div className="border-r border-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-gray-400">Profit Factor</span>
            <span className="text-yellow-400 font-bold text-sm">{metrics.profitFactor.toFixed(2)}</span>
          </div>
          <div className="border-r border-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-gray-400">Open Positions</span>
            <span className="text-cyan-400 font-bold text-sm">{positions.length}</span>
          </div>
          <div className="border-r border-gray-700"></div>
          <div className="flex flex-col">
            <span className="text-gray-400">Trades</span>
            <span className="text-purple-400 font-bold text-sm">{metrics.closedTrades}/{metrics.tradeCount}</span>
          </div>
        </div>
      )}

      {/* Expanded View: Tables */}
      {isExpanded && (
        <div className="flex-1 flex flex-col overflow-auto gap-2 p-2 text-xs">
          {/* Open Positions Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="font-semibold text-gray-300 px-2 py-1 bg-gray-900">OPEN POSITIONS ({positions.length})</div>
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-7 gap-2 text-xs px-2 py-2 font-semibold text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-900">
                <div>Contract</div>
                <div>Dir</div>
                <div>Entry</div>
                <div>Current</div>
                <div>Qty</div>
                <div>P&L</div>
                <div>%</div>
              </div>
              {positions.map(pos => <PositionRow key={pos.id} position={pos} />)}
            </div>
          </div>

          {/* Trade Log Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="font-semibold text-gray-300 px-2 py-1 bg-gray-900">CLOSED TRADES ({tradeLog.length})</div>
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-8 gap-2 text-xs px-2 py-2 font-semibold text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-900">
                <div>Time</div>
                <div>Dir</div>
                <div>Entry</div>
                <div>Exit</div>
                <div>Qty</div>
                <div>P&L</div>
                <div>%</div>
                <div>Dur</div>
              </div>
              {tradeLog.map(trade => <TradeRow key={trade.id} trade={trade} />)}
            </div>
          </div>

          {/* Daily Statistics */}
          <div className="bg-gray-900 rounded p-2 border border-gray-700 grid grid-cols-4 gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-gray-400">Gross Profit</span>
              <span className="text-green-400 font-bold">${metrics.grossProfit}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">Gross Loss</span>
              <span className="text-red-400 font-bold">${metrics.grossLoss}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">Largest Win</span>
              <span className="text-green-400 font-bold">${metrics.largestWin}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">Largest Loss</span>
              <span className="text-red-400 font-bold">${metrics.largestLoss}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
