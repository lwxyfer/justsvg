import { BrandIdentity } from './Brand';
import { memo, useRef, useState } from 'react';
import { Dropdown } from './Dropdown';
import { DocumentTabs } from './DocumentTabs';
import {
  Upload,
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
  Grid2X2,
  Magnet,
  Code2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  BookOpen,
  Settings,
  Plus,
} from 'lucide-react';
import { engine } from '../editor/document/engine';
import { alignTo } from '../editor/document/editing';
import { examplesHref, homeHref, navigate } from '../app/routing';
import { documents } from '../app/documents';
import { useChromeUI } from '../store/ui';
import { IconButton, run, useDocument } from './shared';
import { useLocale } from '../i18n/locale';
import {
  copyElements,
  pasteElements,
  duplicateElements,
  downloadSvg,
  downloadRaster,
  copySource,
  openFiles,
  restorePrevious,
} from '../app/actions';
export const Toolbar = memo(function Toolbar() {
  useDocument(true);
  const { t } = useLocale();
  const ui = useChromeUI(),
    file = useRef<HTMLInputElement>(null),
    count = engine.selection.length;
  const [scale, setScale] = useState(1);
  const alignments = [
    ['left', t('左对齐'), AlignStartVertical],
    ['center', t('水平居中'), AlignCenterVertical],
    ['right', t('右对齐'), AlignEndVertical],
    ['top', t('顶对齐'), AlignStartHorizontal],
    ['middle', t('垂直居中'), AlignCenterHorizontal],
    ['bottom', t('底对齐'), AlignEndHorizontal],
    ['horizontal', t('水平分布'), GalleryHorizontal],
    ['vertical', t('垂直分布'), GalleryVertical],
  ] as const;
  return (
    <>
      <header className="topbar">
        <a
          className="brand"
          href={homeHref}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            if (ui.textEdit) {
              ui.message(t('请先应用或取消文字编辑，再返回首页。'), true);
              return;
            }
            documents.rememberView();
            navigate(homeHref);
          }}
          aria-label={t('JustSVG 首页')}
        >
          <BrandIdentity />
        </a>
        <span className="topbar-divider" />
        <div className="import-actions" role="group" aria-label={t('导入 SVG')}>
          <button
            className="button import-main"
            onClick={() => ui.set({ importOpen: true })}
            title={t('粘贴 SVG')}
          >
            <ClipboardPaste size={15} />
            {t('粘贴 SVG')}
          </button>
          <Dropdown className="file-dropdown">
            <summary className="button">
              <Upload size={15} />
              <span>{t('导入')}</span>
              <ChevronDown size={13} />
            </summary>
            <div className="dropdown-menu">
              <button onClick={() => run(() => documents.create())}>
                <Plus size={15} />
                {t('新建 SVG')}
              </button>
              <button onClick={() => file.current?.click()}>
                <Upload size={15} />
                {t('打开文件')}
              </button>
              <hr />
              <button onClick={() => run(restorePrevious)}>
                <Undo2 size={15} />
                {t('恢复上一份文档')}
              </button>
            </div>
          </Dropdown>
        </div>
        <div className="topbar-actions">
          <a
            className="header-link examples-action"
            href={examplesHref}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              if (ui.textEdit) {
                ui.message(t('请先应用或取消文字编辑，再打开示例页。'), true);
                return;
              }
              documents.rememberView();
              navigate(examplesHref);
            }}
          >
            <BookOpen size={15} />
            <span>{t('示例库')}</span>
          </a>
          <button
            className="header-link source-action"
            onClick={() => ui.set({ sourceOpen: true })}
            title={t('查看源码')}
          >
            <Code2 size={15} />
            <span>{t('源码')}</span>
          </button>
          <a
            className="icon-button header-github-link"
            href="https://github.com/lwxyfer/justsvg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('在 GitHub 查看源码')}
            title={t('在 GitHub 查看源码')}
          >
            <img
              src={`${import.meta.env.BASE_URL}brand/github-mark.svg`}
              width="17"
              height="17"
              alt=""
            />
          </a>
          <IconButton label={t('设置')} onClick={() => ui.set({ settingsOpen: true })}>
            <Settings size={18} />
          </IconButton>
          <span className="header-action-divider" />
          <div className="export-actions" role="group" aria-label={t('导出')}>
            <button
              className="button primary export-main"
              onClick={() => run(() => downloadSvg())}
              title={t('下载 SVG')}
            >
              <Download size={15} />
              {t('导出 SVG')}
            </button>
            <Dropdown className="export-dropdown">
              <summary
                className="button primary export-options"
                aria-label={t('更多导出格式')}
                title={t('更多导出格式')}
              >
                <ChevronDown size={13} />
              </summary>
              <div className="dropdown-menu">
                <button
                  aria-label={t('下载 SVG')}
                  onClick={(e) => {
                    downloadSvg();
                    e.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                >
                  <Download size={15} />
                  {t('下载 SVG')}
                  <kbd>⌘ S</kbd>
                </button>
                <button onClick={() => void copySource()}>
                  <Copy size={15} />
                  {t('复制完整源码')}
                </button>
                <button
                  onClick={(e) => {
                    downloadSvg(true);
                    e.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                >
                  <Download size={15} />
                  {t('下载静态 SVG')}
                </button>
                <hr />
                <label className="export-scale">
                  {t('图片倍率')}
                  <select
                    aria-label={t('图片倍率')}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                  >
                    <option value={1}>1×</option>
                    <option value={2}>2×</option>
                    <option value={3}>3×</option>
                  </select>
                </label>
                {(['png', 'jpeg', 'webp'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() =>
                      void downloadRaster(format, scale).catch((error: Error) =>
                        ui.message(error.message, true),
                      )
                    }
                  >
                    <Download size={15} />
                    {t(`下载 ${format.toUpperCase()}`)}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
        </div>
        <input
          type="file"
          ref={file}
          accept=".svg,image/svg+xml"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) void openFiles(files).catch((e) => ui.message(e.message, true));
            e.target.value = '';
          }}
        />
      </header>
      <DocumentTabs />
      <nav className="actionbar" aria-label={t('编辑工具栏')}>
        <div className="toolbar-cluster">
          <IconButton
            label={`${t('撤销')} (⌘/Ctrl+Z)`}
            disabled={!engine.past.length}
            onClick={() => engine.undo()}
          >
            <Undo2 size={17} />
          </IconButton>
          <IconButton
            label={`${t('重做')} (⌘/Ctrl+Shift+Z)`}
            disabled={!engine.future.length}
            onClick={() => engine.redo()}
          >
            <Redo2 size={17} />
          </IconButton>
          <span className="separator" />
          <IconButton
            label={`${t('组合')} (⌘/Ctrl+G)`}
            disabled={count < 2}
            onClick={() => run(() => engine.group())}
          >
            <Group size={17} />
          </IconButton>
          <IconButton
            label={`${t('取消分组')} (⌘/Ctrl+Shift+G)`}
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
          <Dropdown>
            <summary
              className="icon-button"
              title={t('更多排列操作')}
              aria-label={t('更多排列操作')}
            >
              <ChevronDown size={14} />
            </summary>
            <div className="dropdown-menu">
              <button disabled={count < 2} onClick={() => run(() => engine.align('width'))}>
                <Maximize2 size={15} />
                {t('相同宽度')}
              </button>
              <button disabled={count < 2} onClick={() => run(() => engine.align('height'))}>
                <Minimize2 size={15} />
                {t('相同高度')}
              </button>
              <hr />
              {[
                ['front', t('置顶'), ArrowUpToLine],
                ['back', t('置底'), ArrowDownToLine],
                ['forward', t('上移一层'), ChevronUp],
                ['backward', t('下移一层'), ChevronDown],
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
                {t('复制元素')}
              </button>
              <button onClick={() => run(pasteElements)}>
                <ClipboardPaste size={15} />
                {t('粘贴元素')}
              </button>
            </div>
          </Dropdown>
        </div>
        <div className="toolbar-cluster">
          <span className="separator" />
          <IconButton
            label={`${t('重复元素')} (⌘/Ctrl+D)`}
            disabled={!count}
            onClick={() => run(duplicateElements)}
          >
            <CopyPlus size={16} />
          </IconButton>
          <IconButton
            label={`${t('删除元素')} (Delete)`}
            disabled={!count}
            onClick={() => engine.remove()}
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
        <div className="toolbar-right">
          <IconButton
            label={ui.motionPreview ? t('暂停全部动效预览') : t('播放全部动效预览')}
            active={!ui.motionPreview}
            onClick={() => ui.set({ motionPreview: !ui.motionPreview })}
          >
            {ui.motionPreview ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton
            label={t('智能吸附')}
            active={ui.snap}
            onClick={() => ui.set({ snap: !ui.snap })}
          >
            <Magnet size={16} />
          </IconButton>
          <IconButton
            label={t('显示网格')}
            active={ui.grid}
            onClick={() => ui.set({ grid: !ui.grid })}
          >
            <Grid2X2 size={16} />
          </IconButton>
        </div>
      </nav>
    </>
  );
});
