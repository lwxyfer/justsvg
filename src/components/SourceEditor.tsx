import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Modal } from './Modal';
import { engine } from '../editor/document/engine';
import { sanitizeSvg } from '../editor/security/sanitize';
import { useUI } from '../store/ui';
import { copySource, downloadSvg } from '../app/actions';
export function SourceEditor() {
  const [draft, setDraft] = useState(engine.exportSvg()),
    [error, setError] = useState(''),
    [report, setReport] = useState<string[] | null>(null);
  const ui = useUI();
  const apply = () => {
    try {
      const safe = sanitizeSvg(draft);
      if (safe.warnings.length && report === null) {
        setReport(safe.warnings);
        return;
      }
      engine.applySource(draft);
      ui.set({ sourceOpen: false, textEdit: false });
      ui.message('源码修改已应用，可撤销。');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <Modal title="SVG 源码" onClose={() => ui.set({ sourceOpen: false })} wide>
      <p className="dialog-description">
        编辑源码后点击应用。取消不修改图稿；一次应用可完整撤销，视口保持不变。
      </p>
      <textarea
        className="source-output"
        aria-label="导出 SVG 源码"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError('');
          setReport(null);
        }}
        spellCheck={false}
      />
      {error && (
        <p className="error-inline" role="alert">
          {error}
        </p>
      )}
      {report && (
        <div className="source-report">
          <strong>应用时会清理或限制以下内容：</strong>
          <ul>
            {report.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="modal-footer">
        <div className="section-actions">
          <button className="button" onClick={() => void copySource()}>
            <Copy size={14} />
            复制当前图稿
          </button>
          <button className="button" onClick={() => downloadSvg()}>
            <Download size={14} />
            下载
          </button>
        </div>
        <button className="button primary" disabled={draft === engine.exportSvg()} onClick={apply}>
          <Check size={14} />
          {report ? '确认并应用' : '应用修改'}
        </button>
      </div>
    </Modal>
  );
}
