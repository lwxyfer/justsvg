import { DocumentEngine, engine, type DocumentSession } from '../editor/document/engine';
import { useUI } from '../store/ui';
export const MAX_DOCUMENTS = 20;
const blankSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700"><rect data-sf-page-background="" width="1000" height="700" fill="#ffffff" pointer-events="none"/></svg>';
export interface DocumentView {
  zoom: number;
  pan: { x: number; y: number };
  aspectLocked: boolean;
}
export interface OpenDocument {
  id: string;
  session: DocumentSession;
  view: DocumentView;
  fitOnMount: boolean;
}
export interface SavedDocument {
  id: string;
  xml: string;
  name: string;
  unexported: boolean;
  view: DocumentView;
}
const currentView = (): DocumentView => {
  const { zoom, pan, aspectLocked } = useUI.getState();
  return { zoom, pan: { ...pan }, aspectLocked };
};
const initialView = (): DocumentView => ({ zoom: 1, pan: { x: 60, y: 60 }, aspectLocked: false });
export class DocumentWorkspace {
  items: OpenDocument[] = [];
  activeId = '';
  private revision = 0;
  private listeners = new Set<() => void>();
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.revision;
  private notify() {
    this.revision++;
    this.listeners.forEach((fn) => fn());
  }
  ensure() {
    if (this.items.length) return;
    if (!engine.root) throw new Error('文档尚未初始化。');
    this.activeId = crypto.randomUUID();
    this.items = [
      {
        id: this.activeId,
        session: engine.captureSession(),
        view: currentView(),
        fitOnMount: true,
      },
    ];
  }
  private capture() {
    const active = this.items.find((d) => d.id === this.activeId);
    if (active) {
      active.session = engine.captureSession();
      active.view = currentView();
      active.fitOnMount = false;
    }
  }
  rememberView() {
    engine.commit();
    this.capture();
  }
  activate(id: string) {
    if (id === this.activeId) return;
    const next = this.items.find((d) => d.id === id);
    if (!next) throw new Error('图稿标签不存在。');
    engine.commit();
    this.capture();
    this.activeId = id;
    useUI.getState().set({
      ...next.view,
      textEdit: false,
      sourceOpen: false,
      importOpen: false,
      pendingImport: null,
    });
    engine.restoreSession(next.session);
    this.notify();
  }
  open(xml: string, name: string, unexported = false) {
    this.ensure();
    if (this.items.length >= MAX_DOCUMENTS)
      throw new Error(`最多同时打开 ${MAX_DOCUMENTS} 张 SVG，请先关闭部分标签。`);
    // Validate an independent document before changing any existing session.
    const next = new DocumentEngine();
    next.importSvg(xml, name);
    if (unexported) next.markRecovered(true);
    const item: OpenDocument = {
      id: crypto.randomUUID(),
      session: next.captureSession(),
      view: initialView(),
      fitOnMount: true,
    };
    this.items.push(item);
    this.activate(item.id);
    return item.id;
  }
  create() {
    const names = new Set(
      this.items.map((d) => (d.id === this.activeId ? engine.name : d.session.name)),
    );
    let name = 'untitled',
      number = 2;
    while (names.has(name)) name = `untitled-${number++}`;
    return this.open(blankSvg, name);
  }
  rename(value: string) {
    const name = value.trim();
    if (
      !name ||
      name.length > 120 ||
      /[\\/:*?"<>|]/.test(name) ||
      [...name].some((c) => c.charCodeAt(0) < 32) ||
      /^\.+$/.test(name)
    )
      throw new Error('名称需为 1–120 个字符，不能包含文件路径或特殊文件名字符。');
    if (name === engine.name) return;
    engine.name = name;
    engine.notify('selection');
    this.capture();
    this.notify();
  }
  dirty(id: string) {
    return id === this.activeId
      ? engine.dirty
      : !!this.items.find((d) => d.id === id)?.session.dirty;
  }
  close(id: string, discard = false) {
    const index = this.items.findIndex((d) => d.id === id);
    if (index < 0) return;
    if (id === this.activeId) engine.commit();
    if (this.dirty(id) && !discard) throw new Error('此图稿有未导出修改，请先下载或确认关闭。');
    if (this.items.length === 1) {
      // Closing the final tab leaves an empty document rather than a dead editor.
      const blank = new DocumentEngine();
      blank.importSvg(blankSvg, 'untitled');
      const item: OpenDocument = {
        id: crypto.randomUUID(),
        session: blank.captureSession(),
        view: initialView(),
        fitOnMount: true,
      };
      this.items = [item];
      this.activeId = item.id;
      useUI.getState().set({ ...item.view, textEdit: false, sourceOpen: false });
      engine.restoreSession(item.session);
    } else {
      if (id === this.activeId)
        this.activate(this.items[index + 1]?.id || this.items[index - 1].id);
      this.items = this.items.filter((d) => d.id !== id);
    }
    this.notify();
  }
  savedDocuments(): SavedDocument[] {
    this.ensure();
    this.capture();
    return this.items.map((d) => ({
      id: d.id,
      xml: d.session.root ? new XMLSerializer().serializeToString(d.session.root) : '',
      name: d.session.name,
      unexported: d.session.dirty,
      view: d.view,
    }));
  }
  restore(saved: SavedDocument[], activeId: string) {
    if (
      !saved.length ||
      saved.length > MAX_DOCUMENTS ||
      new Set(saved.map((d) => d.id)).size !== saved.length ||
      !saved.some((d) => d.id === activeId)
    )
      throw new Error('多文档恢复记录无效。');
    // All-or-nothing: a malformed inactive tab must not silently disappear from recovery.
    const items = saved.map((d): OpenDocument => {
      const next = new DocumentEngine();
      next.importSvg(d.xml, d.name);
      next.markRecovered(d.unexported);
      return { id: d.id, session: next.captureSession(), view: d.view, fitOnMount: false };
    });
    this.items = items;
    this.activeId = activeId;
    const active = items.find((d) => d.id === activeId)!;
    useUI.getState().set(active.view);
    engine.restoreSession(active.session);
    this.notify();
  }
}
export const documents = new DocumentWorkspace();
