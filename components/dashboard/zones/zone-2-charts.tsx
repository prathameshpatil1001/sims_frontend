'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MicrostructureTab, MicrostructureData } from '@/lib/zone2-types';

function ComprehensiveDataPanel() {
  const { state } = useDashboard();
  const priceData: any = state.priceData || {};
  const signalData: any = state.zone1State?.signal || {};
  
  // Safe extraction of nested fields
  const ltp = priceData.current || 0;
  const changeValue = priceData.change || 0;
  const changePct = priceData.changePercent || 0;
  const open = priceData.ohlc?.open || 0;
  const high = priceData.ohlc?.high || 0;
  const low = priceData.ohlc?.low || 0;
  const prevClose = priceData.previous || 0;
  
  const volume = priceData.volume || 0;
  const atp = priceData.atp || 0;
  const oi = priceData.oi || 0;
  const oiHigh = priceData.oi_stats?.high || 0;
  const oiLow = priceData.oi_stats?.low || 0;
  
  const depth = priceData.depth || {};
  const bidPrice = depth.bid?.price || 0;
  const askPrice = depth.ask?.price || 0;
  const bidQty = depth.bid?.qty || 0;
  const askQty = depth.ask?.qty || 0;
  const spread = depth.spread || (askPrice - bidPrice) || 0;
  const totalBid = depth.buy_total || 0;
  const totalAsk = depth.sell_total || 0;
  
  const limits = priceData.limits || {};
  const ucDist = limits.upper && ltp ? ((limits.upper - ltp) / ltp * 100).toFixed(2) : '0.00';
  const lcDist = limits.lower && ltp ? ((ltp - limits.lower) / ltp * 100).toFixed(2) : '0.00';
  
  const meta = priceData.meta || {};
  const status = priceData.status || {};
  
  // Format helpers
  const fmt = (num: number) => num ? num.toLocaleString() : '0';
  const fmtDec = (num: number) => num ? num.toFixed(2) : '0.00';
  const sign = (num: number) => num > 0 ? '+' : '';
  const color = (num: number) => num > 0 ? 'text-green-400' : num < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      {/* Header section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{priceData.symbol || 'LOADING...'}</h2>
        <div className="text-xs text-gray-400">{meta.exchange || 'MCX'} • Expiry: {meta.expiry || '--'}</div>
        
        <div className="mt-3">
          <div className="text-2xl font-bold text-white">₹{fmtDec(ltp)}</div>
          <div className={`text-sm ${color(changeValue)} font-semibold`}>
            {sign(changeValue)}{fmtDec(changeValue)} ({sign(changePct)}{fmtDec(changePct)}%)
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            Last updated: Just now
            <span className="px-1.5 py-0.5 rounded bg-green-900/50 text-green-400 border border-green-800 uppercase text-[10px]">
              Live
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          
          {/* Price Context */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Context</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">vs Previous Close</span>
                <span className={color(ltp - prevClose)}>{sign(ltp - prevClose)}{fmt(ltp - prevClose)} ({sign((ltp-prevClose)/prevClose*100)}{fmtDec((ltp-prevClose)/prevClose*100)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">vs Day Open</span>
                <span className={color(ltp - open)}>{sign(ltp - open)}{fmt(ltp - open)} ({sign((ltp-open)/open*100)}{fmtDec((ltp-open)/open*100)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">vs Day High</span>
                <span className="text-red-400">{fmt(ltp - high)} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">vs Day Low</span>
                <span className="text-green-400">+{fmt(ltp - low)} pts</span>
              </div>
            </div>
          </div>

          {/* Intelligence */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Intelligence</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">OI Regime</span>
                <span className="text-yellow-400 font-semibold">{priceData.analytics?.oi_regime || 'Long Unwinding'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Net Change</span>
                <span className="text-white">-6 (-0.03%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Flow Bias</span>
                <span className="text-red-400 font-bold">{priceData.analytics?.order_flow_bias || 'SELL-SIDE HEAVY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bid/Ask Ratio</span>
                <span className="text-white font-mono">{totalAsk > 0 ? (totalBid / totalAsk).toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Risk & Volatility */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Risk & Volatility</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Circuit Risk</span>
                <span className="text-green-400 font-bold">{status.circuit_state?.risk || 'NORMAL'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Distances</span>
                <span className="text-white">UC: {ucDist}% | LC: {lcDist}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volatility (HIGH)</span>
                <span className="text-white">Rng: {fmt(high - low)} / Avg: {fmtDec((high - low) * 0.6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Momentum (Last 5m)</span>
                <span className="text-gray-300">NEUTRAL (0 up / 2 dn / 1 flat)</span>
              </div>
            </div>
          </div>
          
          {/* Price & Session */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price & Session</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Open</span><span className="text-white font-mono">{fmt(open)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">High</span><span className="text-green-400 font-mono">{fmt(high)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Low</span><span className="text-red-400 font-mono">{fmt(low)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prev Close</span><span className="text-white font-mono">{fmt(prevClose)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">LTP (raw)</span><span className="text-white font-mono">{fmt(ltp)}</span></div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          
          {/* Market Depth & Stats */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
              Market Depth & Stats <span className="text-blue-400 cursor-pointer hover:underline normal-case text-[10px]">Hide Raw Data</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center bg-gray-900 rounded py-1">
                <div className="text-[10px] text-gray-500">Bid Price</div>
                <div className="text-green-400 font-mono text-sm">{fmt(bidPrice)}</div>
                <div className="text-[10px] text-gray-400">qty {fmt(bidQty)}</div>
              </div>
              <div className="text-center bg-gray-900 rounded py-1">
                <div className="text-[10px] text-gray-500">Ask Price</div>
                <div className="text-red-400 font-mono text-sm">{fmt(askPrice)}</div>
                <div className="text-[10px] text-gray-400">qty {fmt(askQty)}</div>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Volume</span><span className="text-white font-mono">{fmt(volume)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ATP</span><span className="text-cyan-400 font-mono">{fmtDec(atp)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">OI</span><span className="text-white font-mono">{fmt(oi)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Latency</span><span className="text-yellow-400">DELAYED</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Feed</span><span className="text-green-400">Active (KiteTicker)</span></div>
            </div>
          </div>

          {/* Volume & OI */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Volume & OI</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Volume (raw)</span><span className="text-white font-mono">{fmt(volume)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ATP (raw)</span><span className="text-cyan-400 font-mono">{fmtDec(atp)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Open Interest</span><span className="text-white font-mono">{fmt(oi)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">OI Day High</span><span className="text-green-400 font-mono">{fmt(oiHigh)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">OI Day Low</span><span className="text-red-400 font-mono">{fmt(oiLow)}</span></div>
            </div>
          </div>

          {/* Depth Raw */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Depth (Raw)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Best Bid</span><span className="text-green-400 font-mono">{fmt(bidPrice)} x {fmt(bidQty)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Best Ask</span><span className="text-red-400 font-mono">{fmt(askPrice)} x {fmt(askQty)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Bid Qty</span><span className="text-green-400 font-mono">{fmt(totalBid)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Ask Qty</span><span className="text-red-400 font-mono">{fmt(totalAsk)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Spread</span><span className="text-white font-mono">{fmt(spread)}</span></div>
            </div>
          </div>

          {/* Contract Specs */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contract Specs</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Exchange</span><span className="text-white">{meta.exchange || 'MCX'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Lot Size</span><span className="text-white">{meta.lot_size || 1}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expiry</span><span className="text-white">{meta.expiry || '--'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tick Size</span><span className="text-white">{meta.tick_size || 1}</span></div>
              <div className="col-span-2 flex justify-between"><span className="text-gray-500">Tradable</span><span className="text-green-400">{status.tradable ? 'YES (Active)' : 'NO'}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

interface MicrostructurePanelProps {
  activeTab: MicrostructureTab;
  onTabChange: (tab: MicrostructureTab) => void;
  microstructure: MicrostructureData | null;
}

function MicrostructurePanel({ activeTab, onTabChange, microstructure }: MicrostructurePanelProps) {
  const volOI = microstructure?.volumeOI?.[0] || { volume: 0, openInterest: 0, buySide: 0, sellSide: 0 };
  const cvd = microstructure?.cvd?.[0] || { cumulative: 0, bidVolume: 0, askVolume: 0 };
  const intensity = microstructure?.tradeIntensity?.[0] || { intensity: 0, tradeCount: 0, largeTradeCount: 0, avgTradeSize: 0 };
  const bsRatio = volOI.sellSide > 0 ? (volOI.buySide / volOI.sellSide).toFixed(3) : '0.000';

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as MicrostructureTab)} className="flex-1 flex flex-col">
        <TabsList className="border-b border-gray-700 bg-gray-800 rounded-none p-0 h-auto">
          <TabsTrigger 
            value="volume-oi" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-gray-700"
          >
            <span className="text-xs">Vol/OI</span>
          </TabsTrigger>
          <TabsTrigger 
            value="cvd" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-gray-700"
          >
            <span className="text-xs">CVD</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trade-intensity" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-gray-700"
          >
            <span className="text-xs">Intensity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="volume-oi" className="flex-1 p-3 space-y-2">
          <div className="text-xs text-gray-400 font-semibold">VOLUME & OPEN INTEREST</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Total Volume</span>
              <span className="text-white font-mono">{volOI.volume.toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Open Interest</span>
              <span className="text-white font-mono">{volOI.openInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Buy Volume</span>
              <span className="text-green-400 font-mono">{Math.round(volOI.buySide).toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Sell Volume</span>
              <span className="text-red-400 font-mono">{Math.round(volOI.sellSide).toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Buy/Sell Ratio</span>
              <span className="text-cyan-400 font-mono">{bsRatio}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cvd" className="flex-1 p-3 space-y-2">
          <div className="text-xs text-gray-400 font-semibold">CUMULATIVE VOLUME DELTA</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">CVD (Cumulative)</span>
              <span className={cvd.cumulative >= 0 ? "text-green-400 font-mono" : "text-red-400 font-mono"}>
                {cvd.cumulative > 0 ? '+' : ''}{Math.round(cvd.cumulative).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">CVD Trend</span>
              <span className={cvd.cumulative >= 0 ? "text-green-400 font-mono" : "text-red-400 font-mono"}>
                {cvd.cumulative >= 0 ? '↑ Bullish' : '↓ Bearish'}
              </span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Bid Volume (5min)</span>
              <span className="text-white font-mono">{Math.round(cvd.bidVolume).toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Ask Volume (5min)</span>
              <span className="text-white font-mono">{Math.round(cvd.askVolume).toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">CVD Divergence</span>
              <span className="text-amber-400 font-mono">⚠ Monitor</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trade-intensity" className="flex-1 p-3 space-y-2">
          <div className="text-xs text-gray-400 font-semibold">TRADE INTENSITY</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Current Intensity</span>
              <span className="text-white font-mono">{intensity.intensity.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${intensity.intensity}%` }}></div>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Trade Count (5min)</span>
              <span className="text-white font-mono">{intensity.tradeCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Large Trades</span>
              <span className="text-yellow-400 font-mono">{intensity.largeTradeCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-gray-800 p-2 rounded">
              <span className="text-gray-400">Avg Trade Size</span>
              <span className="text-white font-mono">{intensity.avgTradeSize.toFixed(0)} units</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



export function Zone2Charts() {
  const { state, dispatch } = useDashboard();
  const microstructure = state.zone2State?.microstructure || null;
  const [activeMicroTab, setActiveMicroTab] = useState<MicrostructureTab>(
    state.zone2State?.activeMicroTab || 'volume-oi'
  );
  const [isTradingSuspended] = useState(false);

  const handleMicroTabChange = (tab: MicrostructureTab) => {
    setActiveMicroTab(tab);
    dispatch({ type: 'UPDATE_ZONE2', payload: { activeMicroTab: tab } });
  };

  return (
    <div className="flex flex-col h-full gap-3 p-3 bg-gray-950 border-l border-gray-800">
      {/* Contract Selector */}
      <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
        <span className="text-xs text-gray-400 font-semibold mr-1">CONTRACT:</span>
        <select
          value={(state.selectedContract as any)?.symbol || (state.healthIndicator as any)?.contractId || 'SILVERM26JUNFUT'}
          onChange={(e) => dispatch({ type: 'SET_CONTRACT', payload: { symbol: e.target.value } as any })}
          className="bg-gray-800 text-xs text-white px-2 py-1 h-7 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
        >
          <option value="SILVERM26JUNFUT">SILVERM26JUNFUT</option>
          <option value="SILVERM26AUGFUT">SILVERM26AUGFUT</option>
          <option value="SILVERMIC26JUNFUT">SILVERMIC26JUNFUT</option>
          <option value="SILVERMIC26AUGFUT">SILVERMIC26AUGFUT</option>
        </select>
        
        {isTradingSuspended && (
          <div className="ml-auto px-2 py-1 bg-red-900 border border-red-700 rounded text-xs text-red-300 font-semibold">
            TRADING SUSPENDED
          </div>
        )}
      </div>

      {/* Main Chart Area - 65% */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Main Data Layout */}
        <div className="flex-1 flex flex-col gap-2 bg-gray-900 border border-gray-700 rounded p-4 overflow-hidden">
          <ComprehensiveDataPanel />
        </div>

        {/* Microstructure Panel - 35% */}
        <div className="w-[35%] flex flex-col bg-gray-900 border border-gray-700 rounded overflow-hidden">
          <MicrostructurePanel activeTab={activeMicroTab} onTabChange={handleMicroTabChange} microstructure={microstructure} />
        </div>
      </div>
    </div>
  );
}
