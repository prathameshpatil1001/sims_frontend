// Authentication and session types for SMIS

export type AuthScreen = 'welcome' | 'awaiting-login' | 'setup-wizard' | 'connecting';

export type SessionHealth = 'healthy' | 'warning' | 'critical' | 'disconnected';

export interface AuthState {
  screen: AuthScreen;
  sessionId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  sessionHealth: SessionHealth;
  lastHeartbeat: number | null;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  apiKey: string;
}

export interface TokenResponse {
  success: boolean;
  token?: string;
  sessionId?: string;
  error?: string;
}

export interface SessionCheckResponse {
  status: 'active' | 'expired' | 'pending';
  health: SessionHealth;
  lastUpdate: number;
}

export interface HeartbeatResponse {
  alive: boolean;
  health: SessionHealth;
  timestamp: number;
}
