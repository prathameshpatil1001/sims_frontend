'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { useDashboardData } from '@/lib/use-dashboard-data';
import { CommandBar } from './command-bar/command-bar';
import { Zone1DecisionEngine } from './zones/zone-1-decision-engine';
import { Zone2Charts } from './zones/zone-2-charts';
import { Zone3Intelligence } from './zones/zone-3-intelligence';
import { Zone4Performance } from './zones/zone-4-performance';
import { DrillDownOverlay } from './overlays/drill-down-overlay';
import { CSVViewer } from './overlays/csv-viewer';

export function MasterLayout() {
  const { state } = useDashboard();
  const [zone3Width, setZone3Width] = useState(340);
  const zone3MinWidth = 240;
  const zone3MaxWidth = 420;
  const resizeRef = useRef<HTMLDivElement>(null);

  // Primary contract derived from selected contract or market store
  const primarySymbol = (state.selectedContract as any)?.symbol ?? (state.healthIndicator as any)?.contractId ?? 'SILVERM26JUNFUT';

  // Start all live data polling
  useDashboardData(primarySymbol);

  // Handle zone 3 resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= zone3MinWidth && newWidth <= zone3MaxWidth) {
        setZone3Width(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (resizeRef.current) resizeRef.current.style.cursor = 'default';
    };

    const resizeElement = resizeRef.current;
    if (resizeElement) {
      resizeElement.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        resizeElement.style.cursor = 'col-resize';
      });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      {/* Zone 0: Command Bar (48px) */}
      <CommandBar />

      {/* Main Grid Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Zone 1: Decision Engine (320px fixed) */}
        <div className="w-80 border-r border-slate-700 bg-slate-900/50">
          <Zone1DecisionEngine />
        </div>

        {/* Zone 2: Charts (flex-grow with internal split) */}
        <div className="flex flex-1 flex-col border-r border-slate-700">
          <Zone2Charts />
        </div>

        {/* Zone 3: Intelligence (resizable, 240-420px) */}
        <div
          className="border-l border-slate-700 bg-slate-900/50 overflow-hidden transition-all"
          style={{ width: `${zone3Width}px` }}
        >
          <Zone3Intelligence />
        </div>

        {/* Resize Handle for Zone 3 */}
        <div
          ref={resizeRef}
          className="w-1 cursor-col-resize bg-slate-700 hover:bg-blue-500 transition-colors"
        />
      </div>

      {/* Zone 4: Performance (120px or 320px if expanded) */}
      <div className="border-t border-slate-700 bg-slate-900/50">
        <Zone4Performance />
      </div>

      {/* Overlays */}
      <DrillDownOverlay />
      <CSVViewer />
    </div>
  );
}
