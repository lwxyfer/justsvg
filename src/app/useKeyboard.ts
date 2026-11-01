import { useEffect } from 'react';
import { engine } from '../editor/document/engine';
import { useUI } from '../store/ui';
import { run } from '../components/shared';
import {
  copyElements,
  pasteElements,
  duplicateElements,
  downloadSvg,
  getClipboard,
  importDocument,
} from './actions';
import { fitView, zoomTo } from '../editor/canvas/viewport';
export function useKeyboard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let nudging = false;
    const arrows = new Set(['arrowleft', 'arrowright', 'arrowup', 'arrowdown']);
    const finishNudge = () => {
      if (nudging) {
        nudging = false;
        engine.commit();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (arrows.has(e.key.toLowerCase())) finishNudge();
    };
    const input = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.matches('input,textarea,select') || target.isContentEditable);
    const down = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (nudging && e.key === 'Escape') {
        nudging = false;
        engine.cancel();
        e.preventDefault();
        return;
      }
      if (!arrows.has(e.key.toLowerCase())) finishNudge();
      const ui = useUI.getState();
      if (
        input(e.target) ||
        ui.importOpen ||
        ui.sourceOpen ||
        ui.helpOpen ||
        ui.settingsOpen ||
        ui.pendingImport ||
        ui.textEdit
      )
        return;
      const mod = e.metaKey || e.ctrlKey,
        key = e.key.toLowerCase();
      let fn: (() => void) | undefined;
      if (mod) {
        if (key === 'z') fn = e.shiftKey ? () => engine.redo() : () => engine.undo();
        if (key === 'y') fn = () => engine.redo();
        if (key === 'a') fn = () => engine.select(engine.children(engine.scope || engine.root!));
        if (key === 'c') fn = copyElements;
        if (key === 'd') fn = duplicateElements;
        if (key === 'g') fn = e.shiftKey ? () => engine.ungroup() : () => engine.group();
        if (key === 's') fn = downloadSvg;
        if (key === 'o') fn = () => ui.set({ importOpen: true });
        if (key === ']') fn = () => engine.reorder(e.shiftKey ? 'front' : 'forward');
        if (key === '[') fn = () => engine.reorder(e.shiftKey ? 'back' : 'backward');
      } else {
        if (key === 'delete' || key === 'backspace') fn = () => engine.remove();
        if (key === 'escape')
          fn = () => {
            if (engine.scope) {
              engine.scope =
                engine.scope.parentElement === engine.root
                  ? null
                  : (engine.scope.parentElement as unknown as SVGGraphicsElement);
            }
            engine.select([]);
          };
        if (key === 'arrowleft' || key === 'arrowright' || key === 'arrowup' || key === 'arrowdown')
          fn = () => {
            if (!engine.selection.length) return;
            nudging = true;
            const d = e.shiftKey ? 10 : 1;
            engine.translate(
              key === 'arrowleft' ? -d : key === 'arrowright' ? d : 0,
              key === 'arrowup' ? -d : key === 'arrowdown' ? d : 0,
              true,
            );
          };
        if (e.shiftKey && key === '!') fn = fitView;
        if (e.shiftKey && (key === '@' || key === '2')) fn = () => zoomTo(1);
        if (e.shiftKey && key === '1') fn = fitView;
        if (key === '+' || key === '=') fn = () => zoomTo(ui.zoom * 1.2);
        if (key === '-') fn = () => zoomTo(ui.zoom / 1.2);
        if (key === '?') fn = () => ui.set({ helpOpen: true });
      }
      if (fn) {
        e.preventDefault();
        run(fn);
      }
    };
    const paste = (e: ClipboardEvent) => {
      const ui = useUI.getState();
      if (
        input(e.target) ||
        ui.importOpen ||
        ui.sourceOpen ||
        ui.helpOpen ||
        ui.settingsOpen ||
        ui.pendingImport ||
        ui.textEdit
      )
        return;
      const text = e.clipboardData?.getData('text/plain') || '';
      if (text.trim().startsWith('<')) {
        e.preventDefault();
        run(() => {
          if (text === getClipboard()) engine.paste(text);
          else importDocument(text);
        });
      } else if (!text) {
        e.preventDefault();
        run(pasteElements);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', finishNudge);
    window.addEventListener('pointerdown', finishNudge, true);
    window.addEventListener('paste', paste);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', finishNudge);
      window.removeEventListener('pointerdown', finishNudge, true);
      window.removeEventListener('paste', paste);
      finishNudge();
    };
  }, [enabled]);
}
