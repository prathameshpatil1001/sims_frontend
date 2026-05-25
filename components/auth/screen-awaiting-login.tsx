'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api-service';

export function ScreenAwaitingLogin() {
  const { moveToScreen, setError } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [step, setStep] = useState<string>('Waiting for Kite authorization…');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (timeLeft <= 0) {
      setError('Login timeout. Please start again.');
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, setError]);

  useEffect(() => {
    // Poll connection-status every 2 seconds
    pollingRef.current = setInterval(async () => {
      try {
        const status = await authApi.getConnectionStatus();
        if (status.step === 'VERIFYING_TOKEN') {
          setStep('Verifying Kite token…');
        } else if (status.step === 'LOADING_INSTRUMENTS') {
          setStep('Loading instruments…');
        } else if (status.step === 'COMPLETE') {
          clearInterval(pollingRef.current!);
          if (status.access_token) {
            authApi.saveToken(status.access_token);
          }
          setStep('Session established!');
          // Navigate to connecting screen — it will finalize auth after showing the animation
          moveToScreen('connecting');
        } else if (status.step === 'FAILED' && status.error) {
          clearInterval(pollingRef.current!);
          setError(`Kite auth failed: ${status.error}`);
        }
      } catch {
        // Network blip — will retry next poll
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [moveToScreen, setError]);

  const handleBack = () => window.location.reload();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle>Complete OAuth Login</CardTitle>
          <CardDescription>Waiting for you to authorize in the Kite browser window</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground text-center">{step}</p>
            </div>
          </div>

          <div className="bg-slate-100 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-600 mb-1">Time remaining</p>
            <p className="text-2xl font-mono font-bold text-slate-900">{formattedTime}</p>
          </div>

          <Button onClick={handleBack} variant="outline" className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
