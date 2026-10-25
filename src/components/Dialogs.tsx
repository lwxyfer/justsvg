import { Modal } from './Modal';
import { SourceEditor } from './SourceEditor';
import { useRef, useState } from 'react';
import { Upload, ClipboardPaste, Check, AlertTriangle } from 'lucide-react';
import { useUI } from '../store/ui';
import { fixtures, fixtureNames } from '../fixtures';
import { importDocument, openFile } from '../app/actions';
import { run } from './shared';
import { insertCustom } from '../editor/insert/actions';
export function Dialogs() {
  const ui = useUI(),
    [source, setSource] = useState(''),
    [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);
  return (
    <>
      {ui.pendingImport && (
        <Modal title="导入前检查" onClose={() => ui.set({ pendingImport: null })}>
          <p className="dialog-description">
            为安全显示 SVG，需要清理以下内容，图形外观可能发生变化。取消会保留当前图稿。
          </p>
          <ul className="import-review-list">
            {ui.pendingImport.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <div className="modal-footer">
            <button className="button" onClick={() => ui.set({ pendingImport: null })}>
              取消导入
            </button>
            <button
              className="button primary"
              onClick={() =>
                run(() => {
                  const pending = ui.pendingImport!;
                  if (pending.kind === 'icon') insertCustom(pending.xml, pending.name, true);
                  else importDocument(pending.xml, pending.name, true);
                  ui.set({ pendingImport: null, importOpen: false });
                })
              }
            >
              清理并继续
            </button>
          </div>
        </Modal>
      )}
      {ui.importOpen && (
        <Modal title="导入 SVG" onClose={() => ui.set({ importOpen: false })} wide>
          <div className="import-intro">
            <p>把 AI 生成的 SVG 带进来，完成最后一点精修。</p>
            <span>原生 SVG · 本地处理 · 标准格式导出</span>
          </div>
          <div
            className="import-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f)
                void openFile(f)
                  .then(() => ui.set({ importOpen: false }))
                  .catch((e) => setError(String(e.message)));
            }}
          >
            <Upload size={24} />
            <strong>拖入 SVG 文件</strong>
            <span>
              或{' '}
              <button className="text-button" onClick={() => file.current?.click()}>
                选择本地文件
              </button>{' '}
              · 最大 5 MB
            </span>
            <input
              ref={file}
              type="file"
              accept=".svg,image/svg+xml"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  void openFile(f)
                    .then(() => ui.set({ importOpen: false }))
                    .catch((e) => setError(String(e.message)));
              }}
            />
          </div>
          <div className="source-label">
            <label htmlFor="svg-input">或粘贴 SVG XML</label>
            <kbd>&lt;svg&gt;…&lt;/svg&gt;</kbd>
          </div>
          <textarea
            id="svg-input"
            className="source-input"
            spellCheck={false}
            placeholder={
              '<svg xmlns="http://www.w3.org/2000/svg"\n     viewBox="0 0 800 600">\n  <!-- Your next great diagram -->\n</svg>'
            }
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setError('');
            }}
          />
          {error && (
            <p className="error-inline" role="alert">
              <AlertTriangle size={15} />
              {error}
            </p>
          )}
          <div className="sample-row">
            <span>试试示例</span>
            {(Object.keys(fixtures) as (keyof typeof fixtures)[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  run(() => {
                    importDocument(fixtures[key], `${key}.svg`);
                    ui.set({ importOpen: false });
                  });
                }}
              >
                {fixtureNames[key]}
              </button>
            ))}
          </div>
          <div className="modal-footer">
            <span>不上传文件。危险内容会被移除并提示。</span>
            <button
              className="button primary"
              disabled={!source.trim()}
              onClick={() => {
                try {
                  importDocument(source);
                  setSource('');
                  setError('');
                  ui.set({ importOpen: false });
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              <ClipboardPaste size={15} />
              导入 SVG
            </button>
          </div>
        </Modal>
      )}
      {ui.sourceOpen && <SourceEditor />}
      {ui.helpOpen && (
        <Modal title="键盘快捷键" onClose={() => ui.set({ helpOpen: false })}>
          <div className="shortcut-list">
            {[
              ['平移画布', '按住背景拖动'],
              ['框选元素', 'Shift + 拖动背景'],
              ['从元素上平移', 'Space + 拖拽'],
              ['多选元素', 'Shift + 点击'],
              ['直接选择子元素', 'Alt + 点击'],
              ['撤销', '⌘ / Ctrl + Z'],
              ['重做', '⌘ / Ctrl + Shift + Z'],
              ['复制 / 粘贴元素', '⌘ / Ctrl + C / V'],
              ['重复元素', '⌘ / Ctrl + D'],
              ['全选当前层级', '⌘ / Ctrl + A'],
              ['分组 / 取消分组', '⌘ / Ctrl + G / Shift + G'],
              ['微调 / 大步移动', '方向键 / Shift + 方向键'],
              ['删除元素', 'Delete / Backspace'],
              ['适应画布 / 100%', 'Shift + 1 / Shift + 2'],
              ['放大 / 缩小', '+ / −'],
              ['导出 SVG', '⌘ / Ctrl + S'],
              ['取消 / 退出分组', 'Esc'],
            ].map(([name, key]) => (
              <div key={name}>
                <span>{name}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <span>输入文字时，画布快捷键自动暂停。</span>
            <button className="button primary" onClick={() => ui.set({ helpOpen: false })}>
              <Check size={15} />
              知道了
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
