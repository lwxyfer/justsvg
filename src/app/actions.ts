import { rasterizeSvg, type RasterFormat } from './raster';
import { sanitizeSvg, needsImportReview } from '../editor/security/sanitize';
import { preservePrevious, previousRecovery } from './recovery';
import { engine } from '../editor/document/engine';
import { useUI } from '../store/ui';
import { documents } from './documents';
import { staticMotionSvg } from '../editor/document/motion';
export function importDocument(xml: string, name = 'untitled.svg', confirmed = false) {
  const safe = sanitizeSvg(xml); // Validate before preserving/replacing a working document.
  if (!confirmed && needsImportReview(safe.warnings)) {
    useUI.getState().set({
      importOpen: false,
      pendingImport: { xml, name, warnings: safe.warnings, kind: 'document' },
    });
    return false;
  }
  // An unavailable legacy backup must not block opening another tab: existing work stays open.
  try {
    preservePrevious();
  } catch {
    /* The workspace recovery writer reports storage failures. */
  }
  documents.open(xml, name);
  useUI.getState().set({ textEdit: false });
  useUI
    .getState()
    .message(
      engine.warnings.length
        ? `已导入 · ${engine.warnings.length} 条兼容性提示`
        : 'SVG 已在新标签打开，开始精修。',
    );
  return true;
}
export async function openFile(file: File) {
  if (!/\.svg$/i.test(file.name)) throw new Error('请选择 .svg 文件。');
  if (file.size > 5 * 1024 * 1024) throw new Error('文件超过 5 MB 限制。');
  return importDocument(await file.text(), file.name);
}
let importingFiles = false;
export async function openFiles(files: readonly File[], previousErrors: string[] = []) {
  if (importingFiles || useUI.getState().pendingImport) {
    useUI.getState().message('请先完成当前的文件导入检查。', true);
    return;
  }
  importingFiles = true;
  const errors = [...previousErrors];
  try {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        const imported = await openFile(file);
        if (!imported) {
          const pending = useUI.getState().pendingImport;
          if (pending)
            useUI
              .getState()
              .set({
                pendingImport: {
                  ...pending,
                  remainingFiles: files.slice(index + 1),
                  batchErrors: errors,
                },
              });
          return; // Resume the remaining files after this file's review is accepted or cancelled.
        }
      } catch (error) {
        errors.push(`${file.name}：${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (errors.length) useUI.getState().message(`以下文件未导入：\n${errors.join('\n')}`, true);
  } finally {
    importingFiles = false;
  }
}
export function downloadSvg(staticOnly = false) {
  const blob = new Blob(
    [staticOnly && engine.root ? staticMotionSvg(engine.root) : engine.exportSvg()],
    { type: 'image/svg+xml;charset=utf-8' },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = engine.name.replace(/\.svg$/i, '') + (staticOnly ? '-static.svg' : '-finished.svg');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (!staticOnly) engine.markExported();
  useUI
    .getState()
    .message(
      staticOnly
        ? '已发起静态 SVG 下载，编辑中的动效配置保留。'
        : '已发起 SVG 下载，请检查浏览器下载结果。',
    );
}
export async function downloadRaster(format: RasterFormat, scale = 1) {
  if (!engine.root) throw new Error('请先打开 SVG 文档。');
  // Capture the active document before asynchronous rendering; raster export does not mark SVG saved.
  const xml = staticMotionSvg(engine.root),
    size = engine.pageSize(),
    name = engine.name;
  const blob = await rasterizeSvg(xml, size.width, size.height, format, scale);
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name.replace(/\.svg$/i, '') + `@${scale}x.${format === 'jpeg' ? 'jpg' : format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  useUI.getState().message(`已发起 ${format.toUpperCase()} 下载。`);
}
export async function copySource() {
  try {
    await navigator.clipboard.writeText(engine.exportSvg());
    useUI.getState().message('完整 SVG 源码已复制。');
  } catch {
    useUI.getState().set({ sourceOpen: true });
    useUI.getState().message('浏览器未允许剪贴板访问，请在源码窗口中手动复制。', true);
  }
}
let clipboard = '';
export function copyElements() {
  clipboard = engine.copy();
  if (clipboard) {
    void navigator.clipboard?.writeText(clipboard).catch(() => {});
    useUI.getState().message(`已复制 ${engine.selection.length} 个元素。`);
  }
}
export function pasteElements() {
  if (clipboard) engine.paste(clipboard);
  else useUI.getState().message('请先复制画布中的元素，或使用 ⌘/Ctrl+V 粘贴 SVG。');
}
export function getClipboard() {
  return clipboard;
}
export function duplicateElements() {
  const xml = engine.copy();
  if (xml) engine.paste(xml);
}

export function restorePrevious() {
  const saved = previousRecovery();
  if (!saved) throw new Error('没有可恢复的上一份文档。');
  const existing = documents
    .savedDocuments()
    .find((d) => d.xml === saved.xml && d.name === saved.name);
  if (existing) documents.activate(existing.id);
  else if (importDocument(saved.xml, saved.name)) engine.markRecovered(saved.unexported);
  useUI.getState().message('已打开上一份文档，其他图稿保留在标签中。');
}
