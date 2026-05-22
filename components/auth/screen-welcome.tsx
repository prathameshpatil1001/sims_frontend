'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api-service';

export function ScreenWelcome() {
  const { moveToScreen, setSessionId, setError, setAuthenticated, updateHeartbeat } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { login_url } = await authApi.getLoginUrl();
      setLoginUrl(login_url);
      // Generate a client-side session ID to track this oauth attempt
      const sessionId = crypto.randomUUID();
      setSessionId(sessionId);
      // Open Kite OAuth in new tab
      window.open(login_url, '_blank', 'noopener,noreferrer');
      moveToScreen('awaiting-login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get login URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = () => {
    moveToScreen('setup-wizard');
  };

  const handleDevLogin = () => {
    // Development-only quick auth for testing UI
    setAuthenticated(true);
    updateHeartbeat();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">SMIS</CardTitle>
          <CardDescription>Silver Microstructure Intelligence System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Daily session required. Please authenticate to continue.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleOAuthLogin}
              disabled={isLoading}
              className="w-full h-10"
              size="lg"
            >
              {isLoading ? 'Opening Kite Login...' : 'Login with Zerodha OAuth'}
            </Button>

            {loginUrl && (
              <p className="text-xs text-muted-foreground text-center">
                A Kite login tab was opened.{' '}
                <button
                  onClick={() => window.open(loginUrl, '_blank')}
                  className="underline text-blue-400"
                >
                  Click here if it didn't open.
                </button>
              </p>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              onClick={handleCredentialsLogin}
              variant="outline"
              className="w-full h-10"
              size="lg"
            >
              Use API Credentials
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={handleDevLogin}
                variant="outline"
                className="w-full h-10 text-xs text-amber-400 border-amber-700"
                size="lg"
              >
                [DEV] Quick Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
