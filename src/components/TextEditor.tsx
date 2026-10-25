import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { engine } from '../editor/document/engine';
import { useUI } from '../store/ui';
import { IconButton, run } from './shared';
export function TextEditor({
  element,
  position,
}: {
  element: SVGGraphicsElement;
  position: { x: number; y: number };
}) {
  const info = engine.textStructure(element);
  const [values, setValues] = useState(info.parts.map((p) => p.textContent || ''));
  const ui = useUI();
  const save = () =>
    run(() => {
      if (info.parts.length === 1 && values[0].includes('\n'))
        engine.multiline(element, values[0], parseFloat(getComputedStyle(element).fontSize) * 1.35);
      else engine.updateText(element, values);
      ui.set({ textEdit: false });
    });
  return (
    <div
      className="text-editor"
      data-ui
      style={{ left: position.x, top: position.y }}
      role="dialog"
      aria-label="编辑文字"
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Escape') ui.set({ textEdit: false });
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save();
      }}
    >
      <div className="text-editor-header">
        <strong>编辑文字</strong>
        <IconButton label="取消文字编辑" onClick={() => ui.set({ textEdit: false })}>
          <X size={15} />
        </IconButton>
      </div>
      {info.editable ? (
        <>
          {values.map((v, i) => (
            <label key={i}>
              {values.length > 1 && <span>段落 {i + 1} · 保留原始位置</span>}
              <textarea
                autoFocus={i === 0}
                value={v}
                aria-label={`文字段落 ${i + 1}`}
                onChange={(e) =>
                  setValues(values.map((value, j) => (j === i ? e.target.value : value)))
                }
              />
            </label>
          ))}
          <div className="text-editor-footer">
            <span>⌘ / Ctrl + Enter 应用</span>
            <button className="button primary" onClick={save}>
              <Check size={14} />
              应用
            </button>
          </div>
        </>
      ) : (
        <p className="notice">{info.reason}</p>
      )}
    </div>
  );
}
