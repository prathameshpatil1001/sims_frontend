'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function ScreenConnecting() {
  const { state, setAuthenticated, setError, setSessionHealth, updateHeartbeat } = useAuth();
  const [steps, setSteps] = useState({
    credentialsValidated: false,
    apiKeyVerified: false,
    tokenGenerated: false,
    sessionEstablished: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sequence = async () => {
      try {
        // Step 1: Credentials validated (simulated)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSteps((prev) => ({ ...prev, credentialsValidated: true }));

        // Step 2: API Key verified (simulated)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSteps((prev) => ({ ...prev, apiKeyVerified: true }));

        // Step 3: Token generated (simulated)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSteps((prev) => ({ ...prev, tokenGenerated: true }));

        // Step 4: Session established (simulated)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSteps((prev) => ({ ...prev, sessionEstablished: true }));

        // Update auth state
        setAuthenticated(true);
        setSessionHealth('healthy');
        updateHeartbeat();
        setIsLoading(false);
      } catch (err) {
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    };

    sequence();
  }, [setAuthenticated, setError, setSessionHealth, updateHeartbeat]);

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
            <StepItem label="API key verified" completed={steps.apiKeyVerified} />
            <StepItem label="Token generated" completed={steps.tokenGenerated} />
            <StepItem label="Session established" completed={steps.sessionEstablished} />
          </div>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 text-center font-medium">
                Please wait...
              </p>
            </div>
          )}

          {!isLoading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-medium">
                ✓ Session established successfully!
              </p>
            </div>
          )}

          {!isLoading && (
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Continue to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
