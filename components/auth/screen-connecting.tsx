'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api-service';

export function ScreenConnecting() {
  const { setAuthenticated, setError, setSessionHealth, updateHeartbeat, moveToScreen } = useAuth();
  const [steps, setSteps] = useState({
    credentialsValidated: false,
    apiKeyVerified: false,
    tokenGenerated: false,
    sessionEstablished: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sequence = async () => {
      try {
        // Step 1: Verify token exists in localStorage (was saved by screen-awaiting-login)
        await new Promise((resolve) => setTimeout(resolve, 500));
        const token = authApi.getToken();
        if (!token) throw new Error('No access token found. Please log in again.');
        setSteps((prev) => ({ ...prev, credentialsValidated: true }));

        // Step 2: Validate the token against the backend AND get the refresh cookie
        // issued on THIS window (the OAuth popup had its own cookie we can't use).
        await new Promise((resolve) => setTimeout(resolve, 500));
        const finalized = await authApi.finalizeSession();
        // finalize-session returns a fresh access token — save it
        if (finalized.access_token) {
          authApi.saveToken(finalized.access_token);
        }
        setSteps((prev) => ({ ...prev, apiKeyVerified: true }));

        // Step 3: Verify the Kite session is alive on the backend
        const info = await authApi.getSessionInfo();
        setSteps((prev) => ({ ...prev, tokenGenerated: true }));

        // Step 4: Confirm Kite session is authenticated
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (!info.system_status.session_authenticated) {
          throw new Error('Kite session not active on backend. Please re-login with Zerodha.');
        }
        setSteps((prev) => ({ ...prev, sessionEstablished: true }));

        await new Promise((resolve) => setTimeout(resolve, 400));

        // All checks passed — enter dashboard
        setAuthenticated(true);
        setSessionHealth('healthy');
        updateHeartbeat();
        setIsLoading(false);
      } catch (err) {
        // Clear stale token and return to welcome screen
        authApi.clearToken();
        const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
        setErrorMsg(msg);
        setError(msg);
        setIsLoading(false);
        // Auto-redirect to welcome after 3 seconds so user can see what failed
        setTimeout(() => moveToScreen('welcome'), 3000);
      }
    };

    sequence();
  }, [setAuthenticated, setError, setSessionHealth, updateHeartbeat, moveToScreen]);

  const StepItem = ({
    label,
    completed,
  }: {
    label: string;
    completed: boolean;
  }) => (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
          completed
            ? 'bg-green-500 text-white'
            : 'bg-slate-200 text-slate-600 animate-pulse'
        }`}
      >
        {completed ? '✓' : '○'}
      </div>
      <span className={completed ? 'text-slate-900' : 'text-slate-500'}>{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle>Establishing Session</CardTitle>
          <CardDescription>Validating credentials and generating token</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <StepItem label="Credentials validated" completed={steps.credentialsValidated} />
            <StepItem label="Session finalized" completed={steps.apiKeyVerified} />
            <StepItem label="Token verified" completed={steps.tokenGenerated} />
            <StepItem label="Kite session established" completed={steps.sessionEstablished} />
          </div>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 text-center font-medium">
                Please wait...
              </p>
            </div>
          )}

          {!isLoading && !errorMsg && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-medium">
                ✓ Session established successfully! Entering dashboard…
              </p>
            </div>
          )}

          {!isLoading && errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900 font-medium">
                ✗ {errorMsg}
              </p>
              <p className="text-xs text-red-700 mt-1">Returning to login in 3 seconds…</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
