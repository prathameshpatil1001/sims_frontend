'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaperTradingEntryPanel } from './paper-trading-entry-panel';
import type { DirectionalSignal, SignalCondition, TradeSetup, ConditionStatus } from '@/lib/zone1-types';
import { paperTradingApi } from '@/lib/api-service';

// No mock data — all data comes from live backend via useDashboardData polling hook
// Zone 1 reads from DashboardContext zone1State which is populated in real-time

interface DecisionSnapshotProps {
  signal: DirectionalSignal | null;
  conditions?: SignalCondition[];
}

function DecisionSnapshot({ signal, conditions = [] }: DecisionSnapshotProps) {
  if (!signal) return null;

  const confidenceRing = signal.confidence >= 75 ? 'ring-green-500' : signal.confidence >= 60 ? 'ring-amber-500' : 'ring-red-500';
  const confidenceBg = signal.confidence >= 75 ? 'bg-green-900/20' : signal.confidence >= 60 ? 'bg-amber-900/20' : 'bg-red-900/20';
  const confidenceText = signal.confidence >= 75 ? 'text-green-400' : signal.confidence >= 60 ? 'text-amber-400' : 'text-red-400';
  
  const passedConditions = conditions.filter(c => c.status === 'pass').length;
  const totalConditions = conditions.length;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-300">DECISION SNAPSHOT</h3>
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-900 rounded p-2 text-center border border-gray-700">
          <div className="text-xs text-gray-400">Direction</div>
          <div className={`text-sm font-bold ${signal.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
            {signal.direction === 'LONG' ? '▲ LONG' : '▼ SHORT'}
          </div>
        </div>
        <div className={`rounded p-2 text-center border-2 ${confidenceRing} ${confidenceBg}`}>
          <div className="text-xs text-gray-300">Confidence</div>
          <div className={`text-sm font-bold ${confidenceText}`}>{signal.confidence}%</div>
        </div>
        <div className="bg-gray-900 rounded p-2 text-center border border-gray-700">
          <div className="text-xs text-gray-400">Signal Type</div>
          <div className="text-xs font-semibold text-cyan-400 uppercase">{signal.signalType.slice(0, 10)}</div>
        </div>
        <div className="bg-gray-900 rounded p-2 text-center border border-gray-700">
          <div className="text-xs text-gray-400">Conditions</div>
          <div className="text-sm font-bold text-blue-400">{passedConditions}/{totalConditions} ✓</div>
        </div>
      </div>
    </div>
  );
}

interface DirectionalSignalBlockProps {
  signal: DirectionalSignal | null;
}

function DirectionalSignalBlock({ signal }: DirectionalSignalBlockProps) {
  if (!signal) return null;

  const confidencePercent = (signal.confidence / 100) * 100;
  const confidenceColor = signal.confidence >= 75 ? 'bg-green-500' : signal.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-300">DIRECTIONAL SIGNAL</h3>
      <div className="bg-gray-900 rounded border border-gray-700 p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Composite Confidence</span>
          <span className="text-sm font-bold text-white">{signal.confidence}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className={`${confidenceColor} h-2 rounded-full transition-all`} style={{ width: `${confidencePercent}%` }}></div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Persistence Counter: {signal.persistenceCounter}/20</span>
          <span className="text-blue-400">Edge: {signal.edgeConsistency.candle1}%</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Long Success</div>
            <div className="text-green-400 font-bold">{(signal.probLongSuccess * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Short Success</div>
            <div className="text-red-400 font-bold">{(signal.probShortSuccess * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TradeSetupBlockProps {
  setup: TradeSetup | null;
  signal: DirectionalSignal | null;
  onExecute: (isDryRun: boolean) => void;
  isDisabled: boolean;
}

function TradeSetupBlock({ setup, signal, onExecute, isDisabled }: TradeSetupBlockProps) {
  const dispatch = useDashboard().dispatch;
  
  if (!setup) return null;

  const riskAmount = Math.abs(setup.entry - setup.stopLoss);
  const profitTarget1 = Math.abs(setup.target1 - setup.entry);
  const profitTarget2 = Math.abs(setup.target2 - setup.entry);
  const marginRequired = setup.positionSize * setup.entry * 0.04; // 4% SPAN for silver futures
  const riskPercent = (riskAmount / setup.entry) * 100;
  const rrRatio = setup.riskReward;
  const rrPercent = (rrRatio / (1 + rrRatio)) * 100; // Normalize for visual

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-300">TRADE SETUP</h3>
      <div className="bg-gray-900 rounded border border-gray-700 p-3 space-y-2">
        {/* Sticky header with symbol and LTP */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div className="text-xs text-gray-400">SILVERM26JUN</div>
          <div className="text-sm font-bold text-white">₹{setup.entry.toLocaleString('en-IN')}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-400">Entry</div>
            <div className="text-white font-mono">₹{setup.entry.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-gray-400">Stop Loss</div>
            <div className="text-red-400 font-mono">₹{setup.stopLoss.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-gray-400">Target 1</div>
            <div className="text-green-400 font-mono">₹{setup.target1.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div className="text-gray-400">Target 2</div>
            <div className="text-green-400 font-mono">₹{setup.target2.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* R:R Visual Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Risk:Reward</span>
            <span className="text-yellow-400 font-bold">1:{rrRatio.toFixed(1)}</span>
          </div>
          <div className="flex gap-0.5 bg-gray-800 rounded overflow-hidden h-2">
            <div className="bg-red-500" style={{ width: `${100 / (rrRatio + 1)}%` }} />
            <div className="bg-green-500" style={{ width: `${(rrRatio / (rrRatio + 1)) * 100}%` }} />
          </div>
        </div>

        {/* Margin & Risk Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Margin Required</div>
            <div className="text-blue-400 font-bold">₹{marginRequired.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Risk Per Trade</div>
            <div className="text-yellow-400 font-bold">{riskPercent.toFixed(2)}%</div>
          </div>
        </div>
        <div className="flex justify-between text-xs bg-gray-800 rounded p-2">
          <span className="text-gray-400">Position Size</span>
          <span className="text-blue-400 font-bold">{setup.positionSize} contracts</span>
        </div>
        <div className="flex justify-between text-xs bg-gray-800 rounded p-2">
          <span className="text-gray-400">Fill Probability</span>
          <span className="text-cyan-400 font-bold">{(setup.fillProbability * 100).toFixed(0)}%</span>
        </div>

        {/* Paper Trading Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-gray-700 mt-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${signal?.paperTradingEnabled ? 'bg-blue-400' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-400">Paper Trading</span>
          </div>
          <Switch
            checked={signal?.paperTradingEnabled || false}
            onCheckedChange={async (checked) => {
              try {
                await paperTradingApi.setMode(checked);
                dispatch({ type: 'TOGGLE_PAPER_TRADING', payload: checked });
              } catch (err) {
                console.error('[v0] Failed to toggle paper trading mode:', err);
              }
            }}
            className="h-4 w-7"
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button 
            onClick={() => onExecute(false)} 
            disabled={isDisabled || !signal?.paperTradingEnabled}
            className={`w-full ${
              signal?.paperTradingEnabled
                ? signal?.direction === 'LONG' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : signal?.direction === 'SHORT'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-700'
            } disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold tracking-wide`}
            size="sm"
            title={!signal?.paperTradingEnabled ? 'Enable paper trading first' : ''}
          >
            {signal?.paperTradingEnabled 
              ? signal?.direction === 'LONG' 
                ? '▲ PAPER LONG' 
                : signal?.direction === 'SHORT'
                ? '▼ PAPER SHORT'
                : 'PAPER TRADE'
              : `Enable paper trading to trade`}
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={() => onExecute(false)} 
              variant="outline" 
              className="flex-1 text-xs h-7 bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
            >
              Manual Override
            </Button>
            <Button 
              onClick={() => onExecute(true)} 
              variant="outline" 
              className="flex-1 text-xs h-7 bg-gray-800 border-gray-700 text-blue-400 hover:bg-blue-900/30"
            >
              Dry Run
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SignalConditionChecklistProps {
  conditions: SignalCondition[];
}

function SignalConditionChecklist({ conditions }: SignalConditionChecklistProps) {
  const [expandAll, setExpandAll] = React.useState(false);
  const displayedCount = expandAll ? conditions.length : Math.min(5, conditions.length);
  const passedCount = conditions.filter(c => c.status === 'pass').length;

  const statusIcon = (status: ConditionStatus) => {
    switch (status) {
      case 'pass': return '✓';
      case 'warning': return '⚠';
      case 'fail': return '✗';
      case 'pending': return '◌';
    }
  };

  const statusColor = (status: ConditionStatus) => {
    switch (status) {
      case 'pass': return 'text-green-400';
      case 'warning': return 'text-amber-400';
      case 'fail': return 'text-red-400';
      case 'pending': return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-300">SIGNAL CONDITIONS ({passedCount}/{conditions.length})</h3>
        {conditions.length > 5 && (
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {expandAll ? 'Show less' : `Show all ${conditions.length}`}
          </button>
        )}
      </div>
      <div className="bg-gray-900 rounded border border-gray-700 p-2 space-y-1">
        {conditions.slice(0, displayedCount).map((condition) => (
          <div key={condition.id} className="flex items-center gap-2 text-xs p-1 hover:bg-gray-800 rounded cursor-pointer">
            <span className={`font-bold w-3 ${statusColor(condition.status)}`}>{statusIcon(condition.status)}</span>
            <span className="text-gray-400 flex-1">{condition.name}</span>
            {condition.current !== undefined && (
              <span className="text-gray-500 font-mono text-xs">{condition.current.toLocaleString()}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CrossContractStripProps {
  crossContract: typeof mockCrossContract | null;
}

function CrossContractStrip({ crossContract }: CrossContractStripProps) {
  if (!crossContract) return null;

  const alignCount = crossContract.contracts.filter(c => c.consensus === 'align').length;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-300">CROSS-CONTRACT CONSENSUS</h3>
      <div className="flex gap-2">
        {crossContract.contracts.map((contract) => (
          <div 
            key={contract.symbol}
            className={`flex-1 rounded p-2 text-center text-xs border ${
              contract.consensus === 'align' ? 'bg-green-900 border-green-700' : 'bg-amber-900 border-amber-700'
            }`}
          >
            <div className="font-mono font-bold text-white">{contract.symbol}</div>
            <div className={contract.consensus === 'align' ? 'text-green-300' : 'text-amber-300'}>
              {contract.consensus === 'align' ? 'ALIGN' : 'DIVERGE'}
            </div>
            <div className="text-gray-300">{(contract.strength * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-800 rounded p-2 text-center text-xs">
        <span className="text-gray-400">Consensus Strength: </span>
        <span className={alignCount >= 2 ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
          {alignCount}/3 Contracts Aligned
        </span>
      </div>
    </div>
  );
}

export function Zone1DecisionEngine() {
  const { state } = useDashboard();
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Live data from polling — null until first fetch completes
  const signal = state.zone1State?.signal ?? null;
  const conditions: SignalCondition[] = (state.zone1State?.conditions as SignalCondition[]) ?? [];
  const setup = state.zone1State?.setup ?? null;
  const isStreaming = state.zone1State?.isStreaming ?? false;

  const isExecuteDisabled =
    !signal ||
    signal.confidence < 60 ||
    conditions.filter((c) => c.status === 'pass').length < 8;

  const handleExecute = (dryRun: boolean) => {
    setIsDryRun(dryRun);
    setShowExecutionModal(true);
  };

  const confirmExecution = async () => {
    if (!signal || !setup) return;
    setIsExecuting(true);
    try {
      await paperTradingApi.openEntry({
        direction: signal.direction as 'LONG' | 'SHORT',
        entry_price: setup.entry,
        stop_loss: setup.stopLoss,
        target_1: setup.target1,
        target_2: setup.target2,
        lots: setup.positionSize,
        dry_run: isDryRun,
      });
      // Optionally trigger a toast or re-fetch Zone 4 here
    } catch (err) {
      console.error('Execution failed', err);
    } finally {
      setIsExecuting(false);
      setShowExecutionModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-950 border-r border-gray-800 overflow-y-auto h-full">
      {!signal && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Waiting for signal data…</p>
          <p className="text-xs text-slate-600">Backend will publish signals when market opens.</p>
        </div>
      )}
      {signal && state.paperTradingEnabled ? (
        // Paper Trading UI
        <PaperTradingEntryPanel
          signal={signal}
          setup={setup}
          isDisabled={isExecuteDisabled}
          onExecute={(direction, isDryRun) => {
            setIsDryRun(isDryRun);
            setShowExecutionModal(true);
          }}
          isExecuting={isExecuting}
        />
      ) : (
        // Normal Decision Engine UI
        <>
          {signal ? (
            <>
              <DecisionSnapshot signal={signal} conditions={conditions} />
              <DirectionalSignalBlock signal={signal} />
              <TradeSetupBlock setup={setup} signal={signal} onExecute={handleExecute} isDisabled={isExecuteDisabled} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Waiting for signal data…</p>
              <p className="text-xs text-slate-600">Backend will publish signals when market opens.</p>
            </div>
          )}
        </>
      )}
      {conditions.length > 0 ? (
        <SignalConditionChecklist conditions={conditions} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Waiting for conditions…</p>
        </div>
      )}
      <CrossContractStrip crossContract={null} />

      <Dialog open={showExecutionModal} onOpenChange={setShowExecutionModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isDryRun ? 'DRY RUN: Simulation Only' : 'Confirm Trade Execution'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-800 rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Direction:</span>
                <span className={signal?.direction === 'LONG' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {signal?.direction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Price:</span>
                <span className="text-white font-mono">{setup?.entry.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position Size:</span>
                <span className="text-white font-mono">{setup?.positionSize} contracts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk:Reward:</span>
                <span className="text-yellow-400 font-bold">1:{setup?.riskReward.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowExecutionModal(false)}
                variant="outline"
                disabled={isExecuting}
                className="flex-1 bg-gray-800 border-gray-700 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmExecution}
                disabled={isExecuting}
                className={`flex-1 ${
                  isDryRun ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                } text-white font-bold`}
              >
                {isExecuting ? 'Executing...' : isDryRun ? 'Confirm Dry Run' : `Confirm ${signal?.direction}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
