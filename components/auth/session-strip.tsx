'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { monitoringApi, authApi } from '@/lib/api-service';
import { Button } from '@/components/ui/button';

export function SessionStrip() {
  const { state, setSessionHealth, updateHeartbeat, logout } = useAuth();

  // Use GET /health as an implicit heartbeat — no dedicated endpoint needed
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        const health = await monitoringApi.getHealth();
        updateHeartbeat();
        // Derive session health from backend status
        if (health.status === 'OK') {
          setSessionHealth('healthy');
        } else if (health.status === 'DEGRADED') {
          setSessionHealth('warning');
        } else {
          setSessionHealth('critical');
        }
      } catch {
        // If the request fails, the auth context timer will escalate to 'critical'
      }
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [state.isAuthenticated, updateHeartbeat, setSessionHealth]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      authApi.clearToken();
      logout();
    }
  };

  if (!state.isAuthenticated) {
    return null;
  }

  const healthColors = {
    healthy: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
    disconnected: 'bg-slate-50 border-slate-200 text-slate-900',
  };

  const healthDots = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    disconnected: 'bg-slate-400',
  };

  const healthLabel = {
    healthy: 'Connected',
    warning: 'Degraded',
    critical: 'Critical',
    disconnected: 'Disconnected',
  };

  return (
    <div className={`border-t ${healthColors[state.sessionHealth]}`}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${healthDots[state.sessionHealth]}`} />
            <span className="font-medium">{healthLabel[state.sessionHealth]}</span>
          </div>
          {state.username && (
            <>
              <span className="text-xs opacity-60">•</span>
              <span className="text-xs">User: {state.username}</span>
            </>
          )}
          {state.lastHeartbeat && (
            <>
              <span className="text-xs opacity-60">•</span>
              <span className="text-xs text-muted-foreground">
                Last beat: {new Date(state.lastHeartbeat).toLocaleTimeString()}
              </span>
            </>
          )}
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
