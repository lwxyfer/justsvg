import { readRecovery, readWorkspaceRecovery, saveRecovery } from './recovery';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { documents } from './documents';
import { AlertTriangle, CheckCircle2, X, ShieldCheck, ChevronUp } from 'lucide-react';
import { engine } from '../editor/document/engine';
import { fixtures } from '../fixtures';
import { useUI, useStatusUI } from '../store/ui';
import { Canvas } from '../editor/canvas/Canvas';
import { Sidebar } from '../components/Sidebar';
import { Inspector } from '../components/Inspector';
import { Toolbar } from '../components/Toolbar';
import { Dialogs } from '../components/Dialogs';
import { useDocument, IconButton } from '../components/shared';
import { openFiles } from './actions';
import { useKeyboard } from './useKeyboard';
import { useLocale } from '../i18n/locale';

// Startup happens once, outside React rendering. Local recovery is sanitized like any other input.
let recoveredAt: number | null = null;
let recoveryError = '';
try {
  if (!engine.root) {
    const workspace = readWorkspaceRecovery();
    if (workspace) {
      documents.restore(workspace.documents, workspace.activeId);
      recoveredAt = workspace.savedAt;
    } else {
      const d = readRecovery();
      if (d) {
        engine.importSvg(d.xml, d.name);
        engine.markRecovered(d.unexported);
        recoveredAt = d.savedAt;
      }
    }
  }
} catch (e) {
  recoveryError = `本地文档恢复失败：${e instanceof Error ? e.message : String(e)} 原记录尚未覆盖，当前显示示例；请检查恢复副本或导入文件。`;
}
if (!engine.root) engine.importSvg(fixtures.architecture, 'architecture.svg');
documents.ensure();
export function App({ active = true }: { active?: boolean }) {
  const { t, locale } = useLocale();
  useDocument();
  useSyncExternalStore(documents.subscribe, documents.getSnapshot);
  const ui = useStatusUI(),
    [warningsOpen, setWarningsOpen] = useState(false);
  useKeyboard(active);
  useEffect(() => {
    if (recoveryError) {
      ui.set({ recoveryState: 'unavailable' });
      ui.message(
        locale === 'en' ? `Local document recovery failed: ${recoveryError}` : recoveryError,
        true,
      );
    } else if (recoveredAt !== null) {
      ui.set({ recoveryState: 'saved', savedAt: recoveredAt });
      ui.message(
        locale === 'en'
          ? `Recovered the local document from ${recoveredAt ? new Date(recoveredAt).toLocaleString() : 'the last session'}.`
          : `已恢复${recoveredAt ? new Date(recoveredAt).toLocaleString() : '上次'}的本地文档。`,
      );
    }
    const file = (e: Event) => {
      void openFiles((e as CustomEvent<File[]>).detail).catch((e) =>
        useUI.getState().message(e.message, true),
      );
    };
    window.addEventListener('svg-file', file);
    let timer: ReturnType<typeof setTimeout>;
    let revision = engine.documentRevision;
    let dirty = engine.dirty;
    const scheduleSave = () => {
      recoveryError = '';
      useUI.getState().set({ recoveryState: 'pending' });
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          saveRecovery();
        } catch {
          useUI.getState().set({ recoveryState: 'unavailable' });
          useUI.getState().message(t('本地恢复空间不可用，请及时导出各标签中的 SVG。'), true);
        }
      }, 1200);
    };
    const unsubscribe = engine.subscribe(() => {
      if (revision === engine.documentRevision && dirty === engine.dirty) return;
      revision = engine.documentRevision;
      dirty = engine.dirty;
      scheduleSave();
    });
    const unsubscribeWorkspace = documents.subscribe(scheduleSave);
    const unload = () => {
      if (recoveryError) return;
      try {
        saveRecovery();
      } catch {
        /* Manual export remains available. */
      }
    };
    window.addEventListener('beforeunload', unload);
    return () => {
      clearTimeout(timer);
      unsubscribe();
      unsubscribeWorkspace();
      window.removeEventListener('svg-file', file);
      window.removeEventListener('beforeunload', unload);
    };
    // Initialize listeners once; UI actions always use the current store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const b = engine.pageSize(),
    selected = engine.selectionBounds();
  return (
    <div className="app-shell" hidden={!active} inert={!active}>
      <Toolbar />
      <div
        className="workspace"
        role="tabpanel"
        id="document-workspace"
        aria-labelledby={`document-tab-${documents.activeId}`}
      >
        <Sidebar />
        {active && (
          <Canvas
            key={`canvas-${documents.activeId}`}
            fitOnMount={documents.items.find((d) => d.id === documents.activeId)?.fitOnMount}
          />
        )}
        <Inspector key={`inspector-${documents.activeId}`} />
      </div>
      <footer className="statusbar">
        <div>
          <span className="status-dot" />
          {engine.selection.length
            ? `${engine.selection.length} ${t('个已选')} · ${engine.selection
                .map((el) => el.localName)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(', ')}`
            : t('就绪，选择一个元素开始编辑')}
          {selected && (
            <span className="status-coordinates">
              X {selected.x.toFixed(1)} · Y {selected.y.toFixed(1)}
            </span>
          )}
        </div>
        <div>
          <span>
            {Math.round(b.width)} × {Math.round(b.height)} px
          </span>
          <span className="status-separator" />
          <button
            className={engine.warnings.length ? 'warning-button' : ''}
            onClick={() => setWarningsOpen(!warningsOpen)}
          >
            {engine.warnings.length ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}{' '}
            {engine.warnings.length ? `${engine.warnings.length} ${t('条提示')}` : t('安全 SVG')}
            <ChevronUp size={11} />
          </button>
          <span className="status-separator" />
          <span className="status-local">
            {ui.recoveryState === 'saved'
              ? t('已写入本地恢复副本')
              : ui.recoveryState === 'unavailable'
                ? t('恢复不可用')
                : t('待写入恢复副本')}
          </span>
          <span>{Math.round(ui.zoom * 100)}%</span>
        </div>
      </footer>
      {warningsOpen && (
        <div className="warnings-popover">
          <div>
            <strong>{t('导入兼容性与安全报告')}</strong>
            <IconButton label={t('关闭兼容性报告')} onClick={() => setWarningsOpen(false)}>
              <X size={14} />
            </IconButton>
          </div>
          {engine.warnings.length ? (
            <ul>
              {engine.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : (
            <p>{t('未发现需移除的危险内容。内部 SVG 资源与结构已保留。')}</p>
          )}
          <p className="field-note">
            {t('安全处理会限制高风险特性。建议在导出前检查原始视觉效果。')}
          </p>
        </div>
      )}
      {ui.toast && (
        <div
          className={`toast ${ui.toast.error ? 'error' : ''}`}
          role={ui.toast.error ? 'alert' : 'status'}
        >
          {ui.toast.error ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
          <span>{ui.toast.message}</span>
          <IconButton label={t('关闭提示')} onClick={() => ui.set({ toast: null })}>
            <X size={14} />
          </IconButton>
        </div>
      )}
      <Dialogs />
    </div>
  );
}
