'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HealthIndicator() {
  const { state } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);

  const health = state.healthIndicator as any;

  const statusColor: Record<string, string> = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    offline: 'bg-gray-500',
  };

  const statusLabel: Record<string, string> = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    offline: 'Offline',
  };

  const status: string = health?.status ?? 'offline';
  const latency: number | null = health?.latency ?? null;
  const pipelineStatus: string = health?.pipelineStatus ?? '—';
  const activeRegime: string = health?.activeRegime ?? '—';
  const sessionPhase: string = health?.sessionPhase ?? '—';
  const wsConnected: boolean = health?.feedHealth === 'connected';
  const uptime: number | null = health?.uptime ?? null;
  const modules: Record<string, Record<string, string>> = health?.modules ?? {};

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-slate-700 transition-colors cursor-pointer">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor[status] ?? statusColor.offline}`} />
          <span className="text-xs font-medium text-slate-300">{statusLabel[status] ?? 'Offline'}</span>
          <span className="text-xs text-slate-500">
            {latency != null ? `${Math.round(latency / 1000)}s` : '—'}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700 min-w-48">
        <DropdownMenuItem disabled className="text-slate-400 text-xs">
          Pipeline: {pipelineStatus}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-slate-400 text-xs">
          WebSocket: {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-slate-400 text-xs">
          Regime: {activeRegime}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-slate-400 text-xs">
          Session: {sessionPhase}
        </DropdownMenuItem>
        {uptime != null && (
          <DropdownMenuItem disabled className="text-slate-400 text-xs">
            Uptime: {Math.round(uptime / 60)}m
          </DropdownMenuItem>
        )}
        {Object.keys(modules).length > 0 && (
          <>
            <DropdownMenuItem disabled className="text-slate-500 text-xs font-semibold mt-1">
              Modules
            </DropdownMenuItem>
            {Object.entries(modules.required ?? {}).map(([mod, st]) => (
              <DropdownMenuItem key={mod} disabled className="text-xs text-slate-400 pl-4">
                {mod}: {st === 'HEALTHY' ? '✅' : '❌'} {st}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
