// Zone 4, Overlay, and CSV types

// Zone 4: Performance Panel Types
export interface Position {
  id: string;
  contract: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  stopLoss: number;
  takeProfit: number;
}

export interface DailyMetrics {
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  netPnLPercent: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  tradeCount: number;
  closedTrades: number;
}

export interface TradeLog {
  id: string;
  timestamp: number;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  duration: number;
  signal: string;
}

export interface Zone4State {
  positions: Position[];
  dailyMetrics: DailyMetrics | null;
  tradeLog: TradeLog[];
  isExpanded: boolean;
  expandedHeight: number;
  lastUpdate: number;
}

// Overlay: Drill-Down Types
export type OverlayType =
  | 'composite-confidence'
  | 'system-integrity'
  | 'entry-timing'
  | 'position-sizing'
  | 'edge-consistency'
  | 'microstructure-health'
  | 'regime-alignment'
  | 'liquidity-depth'
  | 'slippage-estimate'
  | 'event-risk'
  | 'trade-history'
  | 'signal-details';

export interface OverlaySection {
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: string | number;
    color?: string;
    icon?: string;
  }>;
}

export interface DrillDownOverlay {
  type: OverlayType;
  isOpen: boolean;
  sections: {
    output?: OverlaySection;
    inputs?: OverlaySection;
    computation?: OverlaySection;
    history?: OverlaySection;
  };
}

export interface OverlayState {
  activeOverlay: OverlayType | null;
  drillDowns: Partial<Record<OverlayType, DrillDownOverlay>>;
}

// CSV File Viewer Types
export interface CSVFile {
  name: string;
  path: string;
  type: 'csv' | 'jsonl' | 'log';
  size: number;
  lastModified: number;
  isLive: boolean;
}

export interface CSVFileContent {
  rows: Record<string, string | number>[];
  headers: string[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

export interface CSVViewerState {
  isOpen: boolean;
  fileTree: FileTreeNode[];
  selectedFile: CSVFile | null;
  fileContent: CSVFileContent | null;
  visibleColumns: string[];
  searchQuery: string;
  currentPage: number;
  isLoading: boolean;
}
