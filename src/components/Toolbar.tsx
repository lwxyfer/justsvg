import { BrandIdentity } from './Brand';
import { memo, useRef } from 'react';
import {
  Upload,
  Plus,
  ClipboardPaste,
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  Group,
  Ungroup,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  GalleryHorizontal,
  GalleryVertical,
  Copy,
  CopyPlus,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  PanelLeft,
  PanelRight,
  Grid2X2,
  Magnet,
  Code2,
  Keyboard,
  Settings2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  BookOpen,
} from 'lucide-react';
import { engine } from '../editor/document/engine';
import { alignTo } from '../editor/document/editing';
import { examplesHref, navigate } from '../app/routing';
import { documents } from '../app/documents';
import { useUI } from '../store/ui';
import { IconButton, run, useDocument } from './shared';
import {
  copyElements,
  pasteElements,
  duplicateElements,
  downloadSvg,
  copySource,
  openFile,
  restorePrevious,
} from '../app/actions';
export const Toolbar = memo(function Toolbar() {
  useDocument(true);
  const ui = useUI(),
    file = useRef<HTMLInputElement>(null),
    count = engine.selection.length;
  const alignments = [
    ['left', '左对齐', AlignStartVertical],
    ['center', '水平居中', AlignCenterVertical],
    ['right', '右对齐', AlignEndVertical],
    ['top', '顶对齐', AlignStartHorizontal],
    ['middle', '垂直居中', AlignCenterHorizontal],
    ['bottom', '底对齐', AlignEndHorizontal],
    ['horizontal', '水平分布', GalleryHorizontal],
    ['vertical', '垂直分布', GalleryVertical],
  ] as const;
  return (
    <>
      <header className="topbar">
        <a className="brand" href="./" onClick={(e) => e.preventDefault()} aria-label="JustSVG">
          <BrandIdentity />
          <span className="version-badge">BETA</span>
        </a>
        <span className="topbar-divider" />
        <span className="file-title">
          {engine.name}
          <span className="local-indicator">本地编辑</span>
          {engine.dirty && <span className="status-dirty">有未导出修改</span>}
        </span>
        <button
          className="button"
          aria-expanded={ui.leftOpen && ui.leftPanel === 'insert'}
          onClick={() => ui.set({ leftOpen: true, leftPanel: 'insert' })}
        >
          <Plus size={16} />
          插入
        </button>
        <div className="topbar-actions">
          <a
            className="button"
            href={examplesHref}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              if (ui.textEdit) {
                ui.message('请先应用或取消文字编辑，再打开示例页。', true);
                return;
              }
              documents.rememberView();
              navigate(examplesHref);
            }}
          >
            <BookOpen size={15} />
            <span>Example 示例</span>
          </a>
          <button className="button" onClick={() => file.current?.click()}>
            <Upload size={15} />
            <span>打开文件</span>
          </button>
          <button className="button" onClick={() => ui.set({ importOpen: true })}>
            <ClipboardPaste size={15} />
            <span>粘贴 SVG</span>
          </button>
          <span className="separator" />
          <IconButton label="快捷键 (?)" onClick={() => ui.set({ helpOpen: true })}>
            <Keyboard size={18} />
          </IconButton>
          <details className="dropdown export-dropdown">
            <summary className="button primary">
              <Download size={15} />
              导出 SVG
              <ChevronDown size={13} />
            </summary>
            <div className="dropdown-menu">
              <button
                aria-label="下载 SVG"
                onClick={(e) => {
                  downloadSvg();
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
              >
                <Download size={15} />
                下载 SVG<kbd>⌘ S</kbd>
              </button>
              <button onClick={() => void copySource()}>
                <Copy size={15} />
                复制完整源码
              </button>
              <button
                onClick={(e) => {
                  downloadSvg(true);
                  e.currentTarget.closest('details')?.removeAttribute('open');
                }}
              >
                <Download size={15} />
                下载静态 SVG
              </button>
              <button onClick={() => run(restorePrevious)}>
                <Undo2 size={15} />
                恢复上一份文档
              </button>
              <button onClick={() => ui.set({ sourceOpen: true })}>
                <Code2 size={15} />
                查看源码
              </button>
            </div>
          </details>
        </div>
        <input
          type="file"
          ref={file}
          accept=".svg,image/svg+xml"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void openFile(f).catch((e) => ui.message(e.message, true));
            e.target.value = '';
          }}
        />
      </header>
      <nav className="actionbar" aria-label="编辑工具栏">
        <div className="toolbar-cluster">
          <IconButton
            label="撤销 (⌘/Ctrl+Z)"
            disabled={!engine.past.length}
            onClick={() => engine.undo()}
          >
            <Undo2 size={17} />
          </IconButton>
          <IconButton
            label="重做 (⌘/Ctrl+Shift+Z)"
            disabled={!engine.future.length}
            onClick={() => engine.redo()}
          >
            <Redo2 size={17} />
          </IconButton>
          <span className="separator" />
          <IconButton
            label="组合 (⌘/Ctrl+G)"
            disabled={count < 2}
            onClick={() => run(() => engine.group())}
          >
            <Group size={17} />
          </IconButton>
          <IconButton
            label="取消分组 (⌘/Ctrl+Shift+G)"
            disabled={!count || engine.selection.some((el) => el.localName !== 'g')}
            onClick={() => run(() => engine.ungroup())}
          >
            <Ungroup size={17} />
          </IconButton>
          <span className="separator" />
        </div>
        <div className="alignment-tools">
          {alignments.map(([kind, label, Icon]) => (
            <IconButton
              key={kind}
              label={label}
              disabled={count < (kind === 'horizontal' || kind === 'vertical' ? 3 : 2)}
              onClick={() =>
                run(() =>
                  kind === 'horizontal' || kind === 'vertical'
                    ? engine.align(kind)
                    : alignTo(engine, kind, ui.alignReference),
                )
              }
            >
              <Icon size={17} />
            </IconButton>
          ))}
          <details className="dropdown">
            <summary className="icon-button" title="更多排列操作" aria-label="更多排列操作">
              <ChevronDown size={14} />
            </summary>
            <div className="dropdown-menu">
              <button disabled={count < 2} onClick={() => run(() => engine.align('width'))}>
                <Maximize2 size={15} />
                相同宽度
              </button>
              <button disabled={count < 2} onClick={() => run(() => engine.align('height'))}>
                <Minimize2 size={15} />
                相同高度
              </button>
              <hr />
              {[
                ['front', '置顶', ArrowUpToLine],
                ['back', '置底', ArrowDownToLine],
                ['forward', '上移一层', ChevronUp],
                ['backward', '下移一层', ChevronDown],
              ].map(([kind, label, Icon]) => (
                <button
                  key={String(kind)}
                  disabled={!count}
                  onClick={() => run(() => engine.reorder(kind as 'front'))}
                >
                  <Icon size={15} />
                  {String(label)}
                </button>
              ))}
              <hr />
              <button disabled={!count} onClick={() => run(copyElements)}>
                <Copy size={15} />
                复制元素
              </button>
              <button onClick={() => run(pasteElements)}>
                <ClipboardPaste size={15} />
                粘贴元素
              </button>
            </div>
          </details>
        </div>
        <div className="toolbar-cluster">
          <span className="separator" />
          <IconButton
            label="重复元素 (⌘/Ctrl+D)"
            disabled={!count}
            onClick={() => run(duplicateElements)}
          >
            <CopyPlus size={16} />
          </IconButton>
          <IconButton label="删除元素 (Delete)" disabled={!count} onClick={() => engine.remove()}>
            <Trash2 size={16} />
          </IconButton>
        </div>
        <div className="toolbar-right">
          <IconButton
            label={ui.motionPreview ? '暂停全部动效预览' : '播放全部动效预览'}
            active={!ui.motionPreview}
            onClick={() => ui.set({ motionPreview: !ui.motionPreview })}
          >
            {ui.motionPreview ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton label="智能吸附" active={ui.snap} onClick={() => ui.set({ snap: !ui.snap })}>
            <Magnet size={16} />
          </IconButton>
          <IconButton label="显示网格" active={ui.grid} onClick={() => ui.set({ grid: !ui.grid })}>
            <Grid2X2 size={16} />
          </IconButton>
          <details className="dropdown">
            <summary className="icon-button" aria-label="画布设置" title="画布设置">
              <Settings2 size={16} />
            </summary>
            <div className="dropdown-menu settings-menu">
              <label>
                <input
                  type="checkbox"
                  checked={ui.wheelModifier}
                  onChange={(e) => ui.set({ wheelModifier: e.target.checked })}
                />
                仅 Ctrl / Cmd + 滚轮缩放
              </label>
              <label>
                画布背景
                <input
                  type="color"
                  value={ui.background}
                  onChange={(e) => ui.set({ background: e.target.value })}
                />
              </label>
            </div>
          </details>
          <span className="separator" />
          <IconButton
            label="切换图层面板"
            active={ui.leftOpen && ui.leftPanel === 'layers'}
            onClick={() =>
              ui.set({ leftPanel: 'layers', leftOpen: !(ui.leftOpen && ui.leftPanel === 'layers') })
            }
          >
            <PanelLeft size={16} />
          </IconButton>
          <IconButton
            label="切换属性面板"
            active={ui.rightOpen}
            onClick={() => ui.set({ rightOpen: !ui.rightOpen })}
          >
            <PanelRight size={16} />
          </IconButton>
        </div>
      </nav>
    </>
  );
});
