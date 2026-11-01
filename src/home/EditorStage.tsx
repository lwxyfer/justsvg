import { useHomeLocale } from './homeLocale';
import { useState } from 'react';
import type { RefObject } from 'react';
import {
  ArrowUpRight,
  Eye,
  Move as Move2,
  MousePointer2,
  RotateCcw,
  Type,
  Palette,
  Undo2,
} from 'lucide-react';
import { NativeDiagram, NodeGlyph } from './NativeDiagram';
import { nodes, nodeColor } from './diagramModel';
import type { DiagramEdits, HomeTheme, NodeId, Point } from './diagramModel';
import { FileDrawing } from './FileDrawing';
import { editorHref } from '../app/routing';
import { homeRoute } from './homeRoute';
import { ConstructionConnections } from './ConstructionConnections';
import { ChapterBackdrop } from './ChapterBackdrop';

type Props = {
  theme: HomeTheme;
  edits: DiagramEdits;
  svgRef: RefObject<SVGSVGElement | null>;
  onLabel: (id: NodeId, value: string) => void;
  onColor: (id: NodeId, value: string) => void;
  onMove: (id: NodeId, value: Point) => void;
  remember: () => void;
  undo: () => void;
  canUndo: boolean;
  reset: () => void;
  open: () => void;
  error: string;
};
export function EditorStage({
  theme,
  edits,
  svgRef,
  onLabel,
  onColor,
  onMove,
  remember,
  undo,
  canUndo,
  reset,
  open,
  error,
}: Props) {
  const { t } = useHomeLocale();
  const [selected, select] = useState<NodeId>('retrieve');
  const node = nodes.find((n) => n.id === selected)!;
  const colors = ['#ffdc58', '#d9caff', '#b9ead5', '#ffa5a3', '#2855ee'];
  return (
    <section className="editor-chapter chapter" id="editor-demo" aria-labelledby="editor-title">
      <ChapterBackdrop kind="editor" />
      <ConstructionConnections kind="export-file" />
      <div className="chapter-heading home-width">
        <div>
          <h2 id="editor-title">
            {t('生成之后，')}
            <br className="mobile-break" />
            {t('直接改图。')}
          </h2>
          <p>{t('试着改名称、换颜色，或拖动节点，连线会跟着走。')}</p>
        </div>
        <div className="chapter-actions">
          <button className="home-action" onClick={open}>
            {t('在编辑器中打开')}
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
      <div className="editor-preview home-width">
        <div className="demo-toolbar">
          <span className="demo-filename">
            <MousePointer2 size={17} />
            rag-system.svg
          </span>
          <span className="demo-tools">
            <span>
              <Type size={16} />
              {t('改文字')}
            </span>
            <span>
              <Move2 size={16} />
              {t('拖节点')}
            </span>
            <span>
              <Palette size={16} />
              {t('改颜色')}
            </span>
          </span>
          <div>
            <button onClick={undo} disabled={!canUndo} aria-label={t('撤销图稿修改')}>
              <Undo2 size={17} />
            </button>
            <button onClick={reset} aria-label={t('重置示例图稿')}>
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        <div className="editor-preview-body">
          <div className="demo-layers" aria-label={t('图稿节点')}>
            <span>{t('图层')}</span>
            {nodes.map((item) => (
              <button
                key={item.id}
                aria-pressed={selected === item.id}
                onClick={() => select(item.id)}
              >
                <svg viewBox="0 0 36 38" aria-hidden="true">
                  <g fill="none" stroke="currentColor" strokeWidth="1.8">
                    <NodeGlyph id={item.id} />
                  </g>
                </svg>
                <span>{edits.labels[item.id] || item.label}</span>
                <Eye size={12} />
              </button>
            ))}
          </div>
          <div className="demo-canvas">
            <NativeDiagram
              theme={theme}
              edits={edits}
              svgRef={svgRef}
              interactive
              selected={selected}
              onSelect={select}
              onMove={onMove}
              onStart={remember}
            />
          </div>
          <div className="demo-properties">
            <span className="property-title">{t('属性')}</span>
            <label htmlFor="node-label">{t('节点名称')}</label>
            <input
              id="node-label"
              value={edits.labels[selected] ?? node.label}
              maxLength={32}
              onFocus={remember}
              onChange={(e) => onLabel(selected, e.target.value)}
            />
            <label>{t('填充颜色')}</label>
            <div className="demo-colors" role="group" aria-label={t('节点填充颜色')}>
              {colors.map((color) => (
                <button
                  key={color}
                  style={{ backgroundColor: color }}
                  aria-label={`${t('填充')} ${color}`}
                  aria-pressed={(edits.colors[selected] || nodeColor(theme, selected)) === color}
                  onClick={() => {
                    remember();
                    onColor(selected, color);
                  }}
                />
              ))}
            </div>
            <div className="demo-coordinate">
              <span>
                X <b>{Math.round(node.x + (edits.offsets[selected]?.x || 0))}</b>
              </span>
              <span>
                Y <b>{Math.round(node.y + (edits.offsets[selected]?.y || 0))}</b>
              </span>
            </div>
            <p>
              {t('选中节点后')}
              <br />
              {t('方向键移动')}
              <br />
              <kbd>Shift</kbd>
              {t('加速')}
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="home-error home-width" role="alert">
          {t(error)}{' '}
          <a href={editorHref} onClick={(event) => homeRoute(event, editorHref)}>
            {t('前往编辑器管理图稿')}
            <ArrowUpRight size={13} />
          </a>
        </p>
      )}
      <div className="export-bridge home-width">
        <p>
          {t('保存为 SVG，')}
          <br />
          {t('下次打开接着改。')}
        </p>
        <div className="export-file">
          <FileDrawing theme={theme} edits={edits} />
          <span>rag-system.svg</span>
        </div>
      </div>
    </section>
  );
}
