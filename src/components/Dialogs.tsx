import { SettingsDialog } from './SettingsDialog';
import { Modal } from './Modal';
import { SourceEditor } from './SourceEditor';
import { useRef, useState } from 'react';
import { Upload, ClipboardPaste, Check, AlertTriangle } from 'lucide-react';
import { useChromeUI } from '../store/ui';
import { fixtures, fixtureNames } from '../fixtures';
import { importDocument, openFiles } from '../app/actions';
import { run } from './shared';
import { insertCustom } from '../editor/insert/actions';
import { useLocale } from '../i18n/locale';
export function Dialogs() {
  const { t } = useLocale();
  const ui = useChromeUI(),
    [source, setSource] = useState(''),
    [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const finishReview = (accept: boolean) => {
    const pending = ui.pendingImport;
    if (!pending) return;
    const errors = [...(pending.batchErrors || [])];
    if (accept) {
      try {
        if (pending.kind === 'icon') insertCustom(pending.xml, pending.name, true);
        else importDocument(pending.xml, pending.name, true);
      } catch (error) {
        errors.push(`${pending.name}：${error instanceof Error ? error.message : String(error)}`);
      }
    }
    ui.set({ pendingImport: null, importOpen: false });
    if (pending.remainingFiles) void openFiles(pending.remainingFiles, errors);
    else if (errors.length) ui.message(errors.join('\n'), true);
  };
  return (
    <>
      {ui.settingsOpen && <SettingsDialog />}
      {ui.pendingImport && (
        <Modal title={t('导入前检查')} onClose={() => finishReview(false)}>
          <p className="dialog-description">
            <strong>{ui.pendingImport.name}</strong>
            <br />
            {t('为安全显示 SVG，需要清理以下内容，图形外观可能发生变化。取消会保留当前图稿。')}
          </p>
          <ul className="import-review-list">
            {ui.pendingImport.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <div className="modal-footer">
            <button className="button" onClick={() => finishReview(false)}>
              {t('取消导入')}
            </button>
            <button className="button primary" onClick={() => finishReview(true)}>
              {t('清理并继续')}
            </button>
          </div>
        </Modal>
      )}
      {ui.importOpen && (
        <Modal title={t('导入 SVG')} onClose={() => ui.set({ importOpen: false })} wide>
          <div className="import-intro">
            <p>{t('把 AI 生成的 SVG 带进来，完成最后一点精修。')}</p>
            <span>{t('原生 SVG · 本地处理 · 标准格式导出')}</span>
          </div>
          <div
            className="import-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              if (files.length)
                void openFiles(files)
                  .then(() => ui.set({ importOpen: false }))
                  .catch((e) => setError(String(e.message)));
            }}
          >
            <Upload size={24} />
            <strong>{t('拖入 SVG 文件')}</strong>
            <span>
              {t('或')}{' '}
              <button className="text-button" onClick={() => file.current?.click()}>
                {t('选择本地文件')}
              </button>{' '}
              · {t('可多选，每个文件最大 5 MB')}
            </span>
            <input
              ref={file}
              type="file"
              accept=".svg,image/svg+xml"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length)
                  void openFiles(files)
                    .then(() => ui.set({ importOpen: false }))
                    .catch((e) => setError(String(e.message)));
                e.target.value = '';
              }}
            />
          </div>
          <div className="source-label">
            <label htmlFor="svg-input">{t('或粘贴 SVG XML')}</label>
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
            <span>{t('试试示例')}</span>
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
            <span>{t('不上传文件。危险内容会被移除并提示。')}</span>
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
              {t('导入 SVG')}
            </button>
          </div>
        </Modal>
      )}
      {ui.sourceOpen && <SourceEditor />}
      {ui.helpOpen && (
        <Modal title={t('键盘快捷键')} onClose={() => ui.set({ helpOpen: false })}>
          <div className="shortcut-list">
            {[
              [t('平移画布'), 'Space + drag / Middle drag'],
              [t('框选元素'), t('拖动空白处')],
              [t('追加框选'), t('Shift + 拖动背景')],
              [t('多选元素'), t('Shift + 点击')],
              [t('直接选择子元素'), 'Alt + click'],
              [t('撤销'), '⌘ / Ctrl + Z'],
              [t('重做'), '⌘ / Ctrl + Shift + Z'],
              [t('复制 / 粘贴元素'), '⌘ / Ctrl + C / V'],
              [t('重复元素'), '⌘ / Ctrl + D'],
              [t('全选当前层级'), '⌘ / Ctrl + A'],
              [t('分组 / 取消分组'), '⌘ / Ctrl + G / Shift + G'],
              [t('微调 / 大步移动'), t('方向键 / Shift + 方向键')],
              [t('删除元素'), 'Delete / Backspace'],
              [t('适应画布 / 100%'), 'Shift + 1 / Shift + 2'],
              [t('放大 / 缩小'), '+ / −'],
              [t('导出 SVG'), '⌘ / Ctrl + S'],
              [t('取消 / 退出分组'), 'Esc'],
            ].map(([name, key]) => (
              <div key={name}>
                <span>{name}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <span>{t('输入文字时，画布快捷键自动暂停。')}</span>
            <button className="button primary" onClick={() => ui.set({ helpOpen: false })}>
              <Check size={15} />
              {t('知道了')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
