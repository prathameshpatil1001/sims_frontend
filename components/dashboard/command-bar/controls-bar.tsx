'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { monitoringApi } from '@/lib/api-service';
import { Database, Settings } from 'lucide-react';
import { AdminSettingsModal } from '@/components/admin/admin-settings-modal';

export function ControlsBar() {
  const { state, dispatch } = useDashboard();
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);

  const isKillActive = (state.healthIndicator as any)?.killSwitchStatus === 'ACTIVE';

  const handleKillSwitchMouseDown = () => {
    if (isKillActive) return; // Can't re-arm when already active
    const timer = setTimeout(() => {
      dispatch({ type: 'ARM_KILL_SWITCH', payload: true });
    }, 2000);
    setHoldTimer(timer);
  };

  const handleKillSwitchMouseUp = async () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }

    if (state.killSwitchArmed && !isKillActive) {
      // Confirm and send to backend
      setIsSubmitting(true);
      try {
        await monitoringApi.activateKillSwitch();
        // Health poller will update the killSwitchStatus in healthIndicator
      } catch (err) {
        console.error('Kill switch activation failed:', err);
      } finally {
        setIsSubmitting(false);
        dispatch({ type: 'ARM_KILL_SWITCH', payload: false });
      }
    } else if (state.killSwitchArmed) {
      dispatch({ type: 'ARM_KILL_SWITCH', payload: false });
    }
  };

  const handleKillSwitchLeave = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    dispatch({ type: 'ARM_KILL_SWITCH', payload: false });
  };

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    try {
      await monitoringApi.deactivateKillSwitch();
    } catch (err) {
      console.error('Kill switch deactivation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pnlColor = state.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400';

  if (isKillActive) {
    return (
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex flex-col gap-0 pr-4 border-r border-slate-700">
          <span className="text-xs text-slate-500">Daily P&L</span>
          <span className={`text-sm font-bold ${pnlColor}`}>${state.dailyPnL.toFixed(2)}</span>
        </div>
        <button
          onClick={handleDeactivate}
          disabled={isSubmitting}
          className="px-3 py-1 rounded text-xs font-bold text-white bg-red-700 hover:bg-red-600 animate-pulse transition-colors"
        >
          {isSubmitting ? 'DEACTIVATING…' : '⛔ KILL ACTIVE — Click to Deactivate'}
        </button>
      </div>
    );
  }

  const killSwitchColor = state.killSwitchArmed
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-slate-700 hover:bg-slate-600';

  return (
    <>
      <div className="flex items-center gap-3 ml-auto">
        {/* Daily P&L Display */}
        <div className="flex flex-col gap-0 pr-4 border-r border-slate-700">
          <span className="text-xs text-slate-500">Daily P&L</span>
          <span className={`text-sm font-bold ${pnlColor}`}>${state.dailyPnL.toFixed(2)}</span>
        </div>

        {/* Admin Settings */}
        <button
          onClick={() => setShowAdminSettings(true)}
          className="px-2 py-1.5 rounded text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
          title="Admin Settings"
        >
          <Settings size={14} />
        </button>

        {/* Data & Logs Viewer */}
        <button
          onClick={() => dispatch({ type: 'OPEN_CSV_VIEWER' })}
          className="px-3 py-1.5 rounded text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 border border-slate-700"
        >
          <Database size={14} />
          Data & Logs
        </button>

        {/* Kill Switch */}
        <button
          onMouseDown={handleKillSwitchMouseDown}
          onMouseUp={handleKillSwitchMouseUp}
          onMouseLeave={handleKillSwitchLeave}
          disabled={isSubmitting}
          className={`px-3 py-1 rounded text-xs font-bold text-white transition-colors ${killSwitchColor}`}
        >
          {isSubmitting ? 'ACTIVATING…' : state.killSwitchArmed ? 'ARMED — Release to Activate' : 'Kill Switch (Hold 2s)'}
        </button>
      </div>

      <AdminSettingsModal
        isOpen={showAdminSettings}
        onClose={() => setShowAdminSettings(false)}
      />
    </>
  );
}
