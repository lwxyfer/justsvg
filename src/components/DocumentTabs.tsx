import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FileCode2, Plus, X, Download } from 'lucide-react';
import { documents } from '../app/documents';
import { engine } from '../editor/document/engine';
import { downloadSvg } from '../app/actions';
import { Modal } from './Modal';
import { run, useDocument } from './shared';
import { useLocale } from '../i18n/locale';
export function DocumentTabs() {
  const { t } = useLocale();
  useSyncExternalStore(documents.subscribe, documents.getSnapshot);
  useDocument(true);
  const [closing, setClosing] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const activeId = documents.activeId;
  useEffect(() => {
    const reveal = () =>
      list.current
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    reveal();
    const observer = new ResizeObserver(reveal);
    if (list.current) observer.observe(list.current);
    return () => observer.disconnect();
  }, [activeId]);
  const requestClose = (id: string) =>
    run(() => {
      if (id === documents.activeId) engine.commit();
      if (documents.dirty(id)) setClosing(id);
      else documents.close(id);
    });
  const nameOf = (id: string) =>
    id === activeId ? engine.name : documents.items.find((d) => d.id === id)?.session.name || 'SVG';
  return (
    <>
      <div className="document-strip">
        <div className="document-tabs" role="tablist" aria-label={t('SVG 文档')} ref={list}>
          {documents.items.map((item, index) => {
            const active = item.id === activeId,
              name = nameOf(item.id),
              dirty = documents.dirty(item.id);
            return (
              <div
                className={`document-tab ${active ? 'active' : ''}`}
                key={item.id}
                role="presentation"
              >
                <button
                  role="tab"
                  id={`document-tab-${item.id}`}
                  aria-controls="document-workspace"
                  aria-selected={active}
                  aria-label={name}
                  tabIndex={active ? 0 : -1}
                  title={`${name}${dirty ? ` · ${t('有未导出修改')}` : ''}`}
                  onClick={() => run(() => documents.activate(item.id))}
                  onKeyDown={(e) => {
                    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                      e.preventDefault();
                      e.stopPropagation();
                      const next =
                        e.key === 'Home'
                          ? 0
                          : e.key === 'End'
                            ? documents.items.length - 1
                            : (index + (e.key === 'ArrowRight' ? 1 : -1) + documents.items.length) %
                              documents.items.length;
                      run(() => documents.activate(documents.items[next].id));
                      list.current
                        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                        .item(next)
                        ?.focus();
                    } else if (e.key === 'Delete' || e.key === 'Backspace') {
                      e.preventDefault();
                      e.stopPropagation();
                      requestClose(item.id);
                    }
                  }}
                >
                  <FileCode2 size={14} aria-hidden="true" />
                  <span className="document-tab-name">{name}</span>
                  {dirty && (
                    <span className="document-tab-dirty" role="img" aria-label={t('有未导出修改')} />
                  )}
                </button>
                <button
                  className="document-tab-close"
                  aria-label={`${t('关闭')} ${name}`}
                  title={`${t('关闭')} ${name}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => requestClose(item.id)}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
        <button
          className="document-new"
          aria-label={t('新建 SVG')}
          title={t('新建空白 SVG')}
          onClick={() => run(() => documents.create())}
        >
          <Plus size={16} />
        </button>
      </div>
      {closing && (
        <Modal title={t('关闭有未导出修改的图稿')} onClose={() => setClosing(null)}>
          <p className="dialog-description">
            「{nameOf(closing)}」{t('有未导出的修改。关闭后将从已打开的图稿中移除，建议先下载 SVG。')}
          </p>
          <div className="modal-footer document-close-actions">
            <button className="button" onClick={() => setClosing(null)}>
              {t('保留图稿')}
            </button>
            <button
              className="button"
              onClick={() =>
                run(() => {
                  documents.close(closing, true);
                  setClosing(null);
                })
              }
            >
              {t('直接关闭')}
            </button>
            <button
              className="button primary"
              onClick={() =>
                run(() => {
                  documents.activate(closing);
                  downloadSvg();
                  documents.close(closing);
                  setClosing(null);
                })
              }
            >
              <Download size={14} />
              {t('下载并关闭')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
