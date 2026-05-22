// Part 14: Keyboard Shortcuts System

export type ShortcutAction = 
  | 'open-confidence-drill'
  | 'toggle-kill-switch'
  | 'toggle-drill-down'
  | 'close-overlay'
  | 'select-contract-1'
  | 'select-contract-2'
  | 'select-contract-3'
  | 'select-contract-4'
  | 'select-contract-5'
  | 'cycle-microstructure-tab'
  | 'cycle-timeframe'
  | 'expand-zone4'
  | 'open-file-viewer'
  | 'open-integrity-drill'
  | 'confirm-action';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: ShortcutAction;
  description: string;
  context: 'global' | 'dashboard' | 'overlay';
}

export const shortcuts: Shortcut[] = [
  {
    key: ' ',
    action: 'open-confidence-drill',
    description: 'Open Composite Confidence Drill-Down',
    context: 'dashboard',
  },
  {
    key: 'k',
    action: 'toggle-kill-switch',
    description: 'Toggle Kill Switch (2s press-to-arm)',
    context: 'dashboard',
  },
  {
    key: 'd',
    action: 'toggle-drill-down',
    description: 'Toggle Last Drill-Down Overlay',
    context: 'dashboard',
  },
  {
    key: 'Escape',
    action: 'close-overlay',
    description: 'Close Active Overlay',
    context: 'overlay',
  },
  {
    key: '1',
    action: 'select-contract-1',
    description: 'Select Contract 1 (ES)',
    context: 'dashboard',
  },
  {
    key: '2',
    action: 'select-contract-2',
    description: 'Select Contract 2 (NQ)',
    context: 'dashboard',
  },
  {
    key: '3',
    action: 'select-contract-3',
    description: 'Select Contract 3 (YM)',
    context: 'dashboard',
  },
  {
    key: '4',
    action: 'select-contract-4',
    description: 'Select Contract 4 (CL)',
    context: 'dashboard',
  },
  {
    key: '5',
    action: 'select-contract-5',
    description: 'Select Contract 5 (GC)',
    context: 'dashboard',
  },
  {
    key: 'c',
    action: 'cycle-microstructure-tab',
    description: 'Cycle Microstructure Tabs (Vol → CVD → Intensity)',
    context: 'dashboard',
  },
  {
    key: 't',
    action: 'cycle-timeframe',
    description: 'Cycle Timeframes (1m → 2m → 5m → 10m)',
    context: 'dashboard',
  },
  {
    key: 'p',
    action: 'expand-zone4',
    description: 'Expand/Collapse Zone 4 Performance Panel',
    context: 'dashboard',
  },
  {
    key: 'l',
    action: 'open-file-viewer',
    description: 'Open File Viewer (CSV/Logs)',
    context: 'dashboard',
  },
  {
    key: 's',
    action: 'open-integrity-drill',
    description: 'Open System Integrity Drill-Down',
    context: 'dashboard',
  },
  {
    key: 'Enter',
    action: 'confirm-action',
    description: 'Confirm Current Action',
    context: 'overlay',
  },
];

export function getShortcutByAction(action: ShortcutAction): Shortcut | undefined {
  return shortcuts.find(s => s.action === action);
}

export function getShortcutsByContext(context: 'global' | 'dashboard' | 'overlay'): Shortcut[] {
  return shortcuts.filter(s => s.context === context || s.context === 'global');
}

export function parseShortcutKey(e: KeyboardEvent): string {
  const keyParts: string[] = [];
  if (e.ctrlKey || e.metaKey) keyParts.push('ctrl');
  if (e.shiftKey) keyParts.push('shift');
  if (e.altKey) keyParts.push('alt');
  keyParts.push(e.key === ' ' ? 'space' : e.key.toLowerCase());
  return keyParts.join('+');
}

export function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const keyMatches = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = (e.ctrlKey || e.metaKey) === (shortcut.ctrlKey ?? false);
  const shiftMatches = e.shiftKey === (shortcut.shiftKey ?? false);
  const altMatches = e.altKey === (shortcut.altKey ?? false);

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}
