'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api-service';

export function ScreenSetupWizard() {
  const { moveToScreen, setUsername, setError, setAuthenticated, setSessionHealth, updateHeartbeat } = useAuth();
  const [step, setStep] = useState<'credentials' | 'apikey'>('credentials');
  const [username, setUsernameInput] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [apiKey, setApiKeyInput] = useState('');
  const [apiSecret, setApiSecretInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; apiKey?: string; apiSecret?: string }>({});
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const validateStep = (currentStep: 'credentials' | 'apikey') => {
    const newErrors: typeof errors = {};
    if (currentStep === 'credentials') {
      if (!username.trim()) newErrors.username = 'Username is required';
      if (!password.trim()) newErrors.password = 'Password is required';
      if (password.length < 5) newErrors.password = 'Password must be at least 5 characters';
    } else {
      if (!apiKey.trim()) newErrors.apiKey = 'API Key is required';
      if (!apiSecret.trim()) newErrors.apiSecret = 'API Secret is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep('credentials')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Verify credentials with the backend before proceeding
      const res = await authApi.login(username, password);
      // Save the token so subsequent requests are authenticated if needed
      authApi.saveToken(res.access_token);
      
      setUsername(username);
      setStep('apikey');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('apikey')) return;
    setIsLoading(true);
    setStatusMsg(null);
    setError(null);
    try {
      // Step 1: Save Kite credentials
      setStatusMsg('Saving API credentials…');
      await authApi.configureCredentials(apiKey, apiSecret);

      // Step 2: Login with username + password
      setStatusMsg('Authenticating…');
      const res = await authApi.login(username, password);
      authApi.saveToken(res.access_token);

      setAuthenticated(true);
      setSessionHealth('healthy');
      updateHeartbeat();
      setStatusMsg('Session established!');
      moveToScreen('connecting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setStatusMsg(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'apikey') {
      setStep('credentials');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Credentials Login</CardTitle>
              <CardDescription>
                Step {step === 'credentials' ? '1' : '2'} of 2
              </CardDescription>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {Math.round((step === 'credentials' ? 1 : 2) / 2 * 100)}%
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">SMIS Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">SMIS Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Kite API Key + Secret */}
          {step === 'apikey' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  Welcome, <span className="font-semibold">{username}</span>. Enter your Zerodha API credentials.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apikey">Zerodha API Key</Label>
                <Input
                  id="apikey"
                  placeholder="e.g. abc123xyz"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    if (errors.apiKey) setErrors({ ...errors, apiKey: undefined });
                  }}
                  className={errors.apiKey ? 'border-red-500' : ''}
                />
                {errors.apiKey && <p className="text-xs text-red-500">{errors.apiKey}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apisecret">Zerodha API Secret</Label>
                <Input
                  id="apisecret"
                  type="password"
                  placeholder="Paste your API secret"
                  value={apiSecret}
                  onChange={(e) => {
                    setApiSecretInput(e.target.value);
                    if (errors.apiSecret) setErrors({ ...errors, apiSecret: undefined });
                  }}
                  className={errors.apiSecret ? 'border-red-500' : ''}
                />
                {errors.apiSecret && <p className="text-xs text-red-500">{errors.apiSecret}</p>}
              </div>

              <p className="text-xs text-muted-foreground">
                Your API secret will be encrypted before storage and never returned to the client.
              </p>
            </div>
          )}

          {statusMsg && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 text-center">{statusMsg}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleBack} variant="outline" className="flex-1" disabled={isLoading}>
              Back
            </Button>
            <Button
              onClick={step === 'credentials' ? handleNext : handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait…' : step === 'credentials' ? 'Next' : 'Authenticate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
