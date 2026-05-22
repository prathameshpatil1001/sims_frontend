'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AuthState, AuthScreen, SessionHealth } from './auth-types';

interface AuthContextType {
  state: AuthState;
  moveToScreen: (screen: AuthScreen) => void;
  setUsername: (username: string) => void;
  setSessionId: (sessionId: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setSessionHealth: (health: SessionHealth) => void;
  updateHeartbeat: () => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'MOVE_SCREEN'; payload: AuthScreen }
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SESSION_HEALTH'; payload: SessionHealth }
  | { type: 'UPDATE_HEARTBEAT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  screen: 'welcome',
  sessionId: null,
  username: null,
  isAuthenticated: false,
  sessionHealth: 'disconnected',
  lastHeartbeat: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'MOVE_SCREEN':
      return { ...state, screen: action.payload };
    case 'SET_USERNAME':
      return { ...state, username: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_SESSION_HEALTH':
      return { ...state, sessionHealth: action.payload };
    case 'UPDATE_HEARTBEAT':
      return { ...state, lastHeartbeat: Date.now() };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const moveToScreen = useCallback((screen: AuthScreen) => {
    dispatch({ type: 'MOVE_SCREEN', payload: screen });
  }, []);

  const setUsername = useCallback((username: string) => {
    dispatch({ type: 'SET_USERNAME', payload: username });
  }, []);

  const setSessionId = useCallback((sessionId: string) => {
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  }, []);

  const setAuthenticated = useCallback((isAuthenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
  }, []);

  const setSessionHealth = useCallback((health: SessionHealth) => {
    dispatch({ type: 'SET_SESSION_HEALTH', payload: health });
  }, []);

  const updateHeartbeat = useCallback(() => {
    dispatch({ type: 'UPDATE_HEARTBEAT' });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Heartbeat monitor: track session health based on last heartbeat
  useEffect(() => {
    if (!state.isAuthenticated || !state.lastHeartbeat) return;

    const interval = setInterval(() => {
      const timeSinceHeartbeat = Date.now() - state.lastHeartbeat;
      const tenSeconds = 10000;
      const thirtySeconds = 30000;

      if (timeSinceHeartbeat > thirtySeconds) {
        setSessionHealth('critical');
      } else if (timeSinceHeartbeat > tenSeconds) {
        setSessionHealth('warning');
      } else {
        setSessionHealth('healthy');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.lastHeartbeat, setSessionHealth]);

  const value: AuthContextType = {
    state,
    moveToScreen,
    setUsername,
    setSessionId,
    setAuthenticated,
    setSessionHealth,
    updateHeartbeat,
    setError,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
