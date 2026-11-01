import { useShallow } from 'zustand/react/shallow';
import { create } from 'zustand';
interface UIState {
  motionPreview: boolean;
  pendingImport: {
    xml: string;
    name: string;
    warnings: string[];
    kind: 'document' | 'icon';
    remainingFiles?: File[];
    batchErrors?: string[];
  } | null;
  recoveryState: 'pending' | 'saved' | 'unavailable';
  savedAt: number;
  leftPanel: 'insert' | 'layers';
  aspectLocked: boolean;
  recentIcons: string[];
  recentColors: string[];
  sections: Record<string, boolean>;
  alignReference: 'selection' | 'key' | 'canvas';
  zoom: number;
  pan: { x: number; y: number };
  grid: boolean;
  gridPattern: 'dots' | 'grid';
  snap: boolean;
  wheelModifier: boolean;
  background: string;
  importOpen: boolean;
  helpOpen: boolean;
  settingsOpen: boolean;
  sourceOpen: boolean;
  textEdit: boolean;
  toast: { message: string; error: boolean } | null;
  set: (patch: Partial<Omit<UIState, 'set' | 'message'>>) => void;
  message: (message: string, error?: boolean) => void;
}
const prefKey = 'svg-finisher.preferences';
let preferences: Partial<UIState> = {};
try {
  const parsed = JSON.parse(localStorage.getItem(prefKey) || '{}') as Partial<UIState>;
  preferences = {
    sections: typeof parsed.sections === 'object' && parsed.sections ? parsed.sections : {},
    recentIcons: Array.isArray(parsed.recentIcons)
      ? parsed.recentIcons.filter((v) => typeof v === 'string').slice(0, 12)
      : [],
    recentColors: Array.isArray(parsed.recentColors)
      ? parsed.recentColors
          .filter((v) => typeof v === 'string' && /^#[a-f\d]{6}$/i.test(v))
          .slice(0, 8)
      : [],
    wheelModifier: parsed.wheelModifier !== false,
    grid: parsed.grid !== false,
    gridPattern: parsed.gridPattern === 'grid' ? 'grid' : 'dots',
    snap: parsed.snap !== false,
    background:
      typeof parsed.background === 'string' && /^#[a-f\d]{6}$/i.test(parsed.background)
        ? parsed.background
        : '#eef0f3',
    leftPanel: parsed.leftPanel === 'layers' ? 'layers' : 'insert',
  };
} catch {
  /* Preferences never block startup. */
}
let toastTimer: ReturnType<typeof setTimeout>;
export const useUI = create<UIState>()((set) => ({
  motionPreview: true,
  pendingImport: null,
  recoveryState: 'pending',
  savedAt: 0,
  leftPanel: 'insert',
  aspectLocked: false,
  recentIcons: [],
  recentColors: [],
  sections: {},
  alignReference: 'selection',
  zoom: 1,
  pan: { x: 60, y: 60 },
  grid: true,
  gridPattern: 'dots',
  snap: true,
  wheelModifier: true,
  background: '#eef0f3',
  importOpen: false,
  helpOpen: false,
  settingsOpen: false,
  sourceOpen: false,
  textEdit: false,
  toast: null,
  ...preferences,
  set: (patch) => set(patch),
  message: (message, error = false) => {
    clearTimeout(toastTimer);
    set({ toast: { message, error } });
    if (!error) toastTimer = setTimeout(() => set({ toast: null }), 6000);
  },
}));

let lastPreferences = '';
useUI.subscribe((state) => {
  try {
    const encoded = JSON.stringify({
      sections: state.sections,
      recentIcons: state.recentIcons,
      recentColors: state.recentColors,
      wheelModifier: state.wheelModifier,
      grid: state.grid,
      gridPattern: state.gridPattern,
      snap: state.snap,
      background: state.background,
      leftPanel: state.leftPanel,
    });
    if (encoded !== lastPreferences) {
      localStorage.setItem(prefKey, encoded);
      lastPreferences = encoded;
    }
  } catch {
    /* Document recovery reports storage failures separately. */
  }
});

// Canvas navigation should not redraw document controls and asset galleries on every wheel tick.
export function useChromeUI() {
  return useUI(
    useShallow(({ pan, zoom, ...chrome }) => {
      void pan;
      void zoom;
      return chrome;
    }),
  );
}
export function useStatusUI() {
  return useUI(
    useShallow(({ pan, ...status }) => {
      void pan;
      return status;
    }),
  );
}
