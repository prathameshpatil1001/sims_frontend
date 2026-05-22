'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { DashboardState, DashboardAction, Contract } from './dashboard-types';
import type { Zone1State } from './zone1-types';
import type { Zone2State } from './zone2-types';
import type { Zone4State, OverlayState, CSVViewerState } from './zone4-overlay-types';

const initialZone1State: Zone1State = {
  signal: null,
  conditions: [],
  setup: null,
  crossContract: null,
  isStreaming: false,
  executionInProgress: false,
  lastUpdate: 0,
};

const initialZone2State: Zone2State = {
  ohlcData: [],
  microstructure: null,
  structural: null,
  currentTimeframe: '5m',
  activeMicroTab: 'volume-oi',
  selectedCandle: null,
  isLoading: false,
  lastUpdate: 0,
};

const initialState: DashboardState = {
  isAuthenticated: false,
  selectedContract: null,
  priceData: null,
  healthIndicator: null,
  badgeIndicator: null,
  zone1State: initialZone1State,
  zone2State: initialZone2State,
  zone3State: {
    width: 340,
    isResizing: false,
    minWidth: 240,
    maxWidth: 420,
  },
  zone4State: {
    positions: [],
    dailyMetrics: null,
    tradeLog: [],
    isExpanded: false,
    expandedHeight: 320,
    lastUpdate: 0,
  },
  overlayState: {
    activeOverlay: null,
    drillDowns: {},
  },
  csvViewerState: {
    isOpen: false,
    fileTree: [],
    selectedFile: null,
    fileContent: null,
    visibleColumns: [],
    searchQuery: '',
    currentPage: 0,
    isLoading: false,
  },
  killSwitchArmed: false,
  killSwitchCountdown: 0,
  dailyPnL: 0,
  isLoading: false,
  error: null,
  paperTradingEnabled: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_CONTRACT':
      return { ...state, selectedContract: action.payload };
    case 'UPDATE_PRICE':
      return { ...state, priceData: action.payload };
    case 'UPDATE_HEALTH':
      return { ...state, healthIndicator: action.payload };
    case 'UPDATE_BADGES':
      return { ...state, badgeIndicator: action.payload };
    case 'UPDATE_ZONE1':
      return {
        ...state,
        zone1State: state.zone1State
          ? { ...state.zone1State, ...action.payload }
          : initialZone1State,
      };
    case 'UPDATE_ZONE2':
      return {
        ...state,
        zone2State: state.zone2State
          ? { ...state.zone2State, ...action.payload }
          : initialZone2State,
      };
    case 'SET_ZONE3_WIDTH':
      return {
        ...state,
        zone3State: {
          ...state.zone3State,
          width: Math.max(
            state.zone3State.minWidth,
            Math.min(action.payload, state.zone3State.maxWidth)
          ),
        },
      };
    case 'SET_ZONE3_RESIZING':
      return {
        ...state,
        zone3State: { ...state.zone3State, isResizing: action.payload },
      };
    case 'UPDATE_ZONE4':
      return {
        ...state,
        zone4State: state.zone4State
          ? { ...state.zone4State, ...action.payload }
          : state.zone4State,
      };
    case 'OPEN_OVERLAY':
      return {
        ...state,
        overlayState: {
          ...state.overlayState,
          activeOverlay: action.payload as any,
        },
      };
    case 'CLOSE_OVERLAY':
      return {
        ...state,
        overlayState: {
          ...state.overlayState,
          activeOverlay: null,
        },
      };
    case 'OPEN_CSV_VIEWER':
      return {
        ...state,
        csvViewerState: {
          ...state.csvViewerState,
          isOpen: true,
        },
      };
    case 'CLOSE_CSV_VIEWER':
      return {
        ...state,
        csvViewerState: {
          ...state.csvViewerState,
          isOpen: false,
        },
      };
    case 'SET_ZONE4_EXPANDED':
      return {
        ...state,
        zone4State: state.zone4State ? {
          ...state.zone4State,
          isExpanded: action.payload,
          expandedHeight: action.payload ? 320 : 120,
        } : state.zone4State,
      };
    case 'ARM_KILL_SWITCH':
      return { ...state, killSwitchArmed: action.payload };
    case 'SET_KILL_SWITCH_COUNTDOWN':
      return { ...state, killSwitchCountdown: action.payload };
    case 'SET_DAILY_PNL':
      return { ...state, dailyPnL: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'TOGGLE_PAPER_TRADING':
      return { ...state, paperTradingEnabled: action.payload };
    case 'RESET_DASHBOARD':
      return initialState;
    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
