'use client';

import { useAuth } from '@/lib/auth-context';
import { DashboardProvider } from '@/lib/dashboard-context';
import { ScreenWelcome } from './screen-welcome';
import { ScreenAwaitingLogin } from './screen-awaiting-login';
import { ScreenSetupWizard } from './screen-setup-wizard';
import { ScreenConnecting } from './screen-connecting';
import { SessionStrip } from './session-strip';
import { MasterLayout } from '../dashboard/master-layout';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { state, isRestoringSession } = useAuth();

  // While checking localStorage token on mount, show a neutral splash to prevent
  // the login screen from flashing before silent re-auth completes.
  if (isRestoringSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">Reconnecting…</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth screens
  if (!state.isAuthenticated) {
    return (
      <div>
        {/* Offline Detection Banner (non-authenticated) */}
        {state.sessionHealth === 'disconnected' && (
          <div className="w-full bg-red-900/80 border-b border-red-700 px-4 py-2 text-center">
            <p className="text-xs font-semibold text-red-300">
              ⚠️ Connection Lost: Unable to reach backend. Reconnecting...
            </p>
          </div>
        )}
        {state.screen === 'welcome' && <ScreenWelcome />}
        {state.screen === 'awaiting-login' && <ScreenAwaitingLogin />}
        {state.screen === 'setup-wizard' && <ScreenSetupWizard />}
        {state.screen === 'connecting' && <ScreenConnecting />}
      </div>
    );
  }

  // If authenticated, show dashboard with session strip
  return (
    <DashboardProvider>
      <div className="flex flex-col min-h-screen">
        {/* Offline Detection Banner (authenticated) */}
        {state.sessionHealth === 'disconnected' && (
          <div className="w-full bg-red-900/80 border-b border-red-700 px-4 py-2 text-center">
            <p className="text-xs font-semibold text-red-300">
              ⚠️ Connection Lost: Unable to reach backend. Reconnecting...
            </p>
          </div>
        )}
        <main className="flex-1">
          <MasterLayout />
        </main>
        <SessionStrip />
      </div>
    </DashboardProvider>
  );
}
