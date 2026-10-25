import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { engine } from '../editor/document/engine';
import { useUI } from '../store/ui';
export function useDocument(panel = false) {
  return useSyncExternalStore(
    engine.subscribe,
    panel ? engine.getPanelSnapshot : engine.getSnapshot,
  );
}
export function run(fn: () => void) {
  try {
    fn();
  } catch (e) {
    useUI.getState().message(e instanceof Error ? e.message : String(e), true);
  }
}
export function IconButton({
  label,
  children,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-button ${active ? 'active' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      {...props}
    >
      {children}
    </button>
  );
}
