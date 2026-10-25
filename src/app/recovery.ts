import { engine } from '../editor/document/engine';
import { useUI } from '../store/ui';
import { documents, MAX_DOCUMENTS, type SavedDocument } from './documents';
export const recoveryKey = 'svg-finisher.document';
const backupKey = 'svg-finisher.previous';
export interface RecoveryRecord {
  version: 1;
  xml: string;
  name: string;
  savedAt: number;
  unexported: boolean;
}
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
function parseRecord(item: unknown): RecoveryRecord {
  if (
    !object(item) ||
    typeof item.xml !== 'string' ||
    typeof item.name !== 'string' ||
    (item.version !== undefined && item.version !== 1)
  )
    throw new Error('本地恢复记录格式不受支持。');
  return {
    version: 1,
    xml: item.xml,
    name: item.name,
    savedAt: typeof item.savedAt === 'number' && Number.isFinite(item.savedAt) ? item.savedAt : 0,
    unexported: item.unexported !== false,
  };
}
export interface WorkspaceRecovery {
  version: 2;
  activeId: string;
  documents: SavedDocument[];
  savedAt: number;
}
function parseWorkspace(value: unknown): WorkspaceRecovery {
  if (
    !object(value) ||
    value.version !== 2 ||
    typeof value.activeId !== 'string' ||
    !Array.isArray(value.documents) ||
    !value.documents.length ||
    value.documents.length > MAX_DOCUMENTS
  )
    throw new Error('多文档恢复记录格式不受支持。');
  const saved = value.documents.map((item): SavedDocument => {
    if (
      !object(item) ||
      typeof item.id !== 'string' ||
      !item.id ||
      item.id.length > 128 ||
      typeof item.xml !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.unexported !== 'boolean' ||
      !object(item.view) ||
      !object(item.view.pan)
    )
      throw new Error('多文档恢复记录缺少有效图稿。');
    const { zoom, pan, aspectLocked } = item.view;
    if (
      typeof zoom !== 'number' ||
      !Number.isFinite(zoom) ||
      zoom < 0.02 ||
      zoom > 16 ||
      typeof pan.x !== 'number' ||
      !Number.isFinite(pan.x) ||
      typeof pan.y !== 'number' ||
      !Number.isFinite(pan.y) ||
      Math.abs(pan.x) > 1e8 ||
      Math.abs(pan.y) > 1e8 ||
      typeof aspectLocked !== 'boolean'
    )
      throw new Error('图稿视图恢复记录无效。');
    return {
      id: item.id,
      xml: item.xml,
      name: item.name,
      unexported: item.unexported,
      view: { zoom, pan: { x: pan.x, y: pan.y }, aspectLocked },
    };
  });
  if (
    new Set(saved.map((d) => d.id)).size !== saved.length ||
    !saved.some((d) => d.id === value.activeId)
  )
    throw new Error('图稿标签恢复记录无效。');
  return {
    version: 2,
    activeId: value.activeId,
    documents: saved,
    savedAt:
      typeof value.savedAt === 'number' && Number.isFinite(value.savedAt) ? value.savedAt : 0,
  };
}
export function readWorkspaceRecovery(): WorkspaceRecovery | null {
  const raw = localStorage.getItem(recoveryKey);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  return object(value) && value.version === 2 ? parseWorkspace(value) : null;
}
export function readRecovery(key = recoveryKey): RecoveryRecord | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (object(value) && value.version === 2) {
    const workspace = parseWorkspace(value),
      active = workspace.documents.find((d) => d.id === workspace.activeId)!;
    return {
      version: 1,
      xml: active.xml,
      name: active.name,
      unexported: active.unexported,
      savedAt: workspace.savedAt,
    };
  }
  return parseRecord(value);
}
export function currentRecord(): RecoveryRecord {
  return {
    version: 1,
    xml: engine.exportSvg(),
    name: engine.name,
    savedAt: Date.now(),
    unexported: engine.dirty,
  };
}
export function saveRecovery() {
  const saved = documents.savedDocuments();
  const record: WorkspaceRecovery = {
    version: 2,
    activeId: documents.activeId,
    documents: saved,
    savedAt: Date.now(),
  };
  localStorage.setItem(recoveryKey, JSON.stringify(record));
  useUI.getState().set({ recoveryState: 'saved', savedAt: record.savedAt });
}
export function preservePrevious() {
  if (!engine.root) return;
  try {
    localStorage.setItem(backupKey, JSON.stringify(currentRecord()));
  } catch {
    if (engine.dirty)
      throw new Error('恢复空间不足，无法保留当前未导出的修改。请先导出，再打开新文档。');
  }
}
export function previousRecovery() {
  try {
    return readRecovery(backupKey);
  } catch {
    return null;
  }
}
