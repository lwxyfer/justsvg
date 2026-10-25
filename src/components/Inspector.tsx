import { useId, useState, type ReactNode } from 'react';
import {
  SlidersHorizontal,
  X,
  Type,
  Move,
  Palette,
  Info,
  Code2,
  MousePointer2,
  ChevronDown,
  ChevronRight,
  Link,
  Unlink,
  Sparkles,
} from 'lucide-react';
import {
  resizeRect,
  lineEditable,
  setLines,
  wrapText,
  gapElements,
  alignTo,
  markerStyle,
} from '../editor/document/editing';
import { engine } from '../editor/document/engine';
import { useUI } from '../store/ui';
import { IconButton, run, useDocument } from './shared';
import { ColorPicker } from './ColorPicker';
import { ConnectionBindings, NodeConnections } from './ConnectionBindings';
import { connectionElement, connectionNodes } from '../editor/document/connections';
import { MotionProperties } from './MotionProperties';
import { motionOriginal, motionWrapper, isMotionWrapper } from '../editor/document/motion';
function Field({
  label,
  value,
  onCommit,
  type = 'text',
  step,
  unit,
  readOnly = false,
}: {
  label: string;
  value: string | number;
  onCommit?: (value: string) => void;
  type?: string;
  step?: number;
  unit?: string;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState('');
  return (
    <label className="property-field">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type={type}
          step={step}
          value={draft ?? (type === 'number' && value === '混合' ? '' : String(value))}
          placeholder={value === '混合' ? '混合' : undefined}
          aria-invalid={!!error}
          readOnly={readOnly}
          onChange={(e) => {
            setDraft(e.target.value);
            setError('');
          }}
          onBlur={(e) => {
            const next = e.currentTarget.value;
            if (next !== String(value)) {
              if (type === 'number' && (!next.trim() || !Number.isFinite(Number(next)))) {
                setError('请输入有效数字。');
                return;
              }
              try {
                onCommit?.(next);
              } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
                return;
              }
            }
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (type === 'number' && e.shiftKey && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
              const current = Number(draft ?? value);
              if (Number.isFinite(current)) {
                setDraft(String(current + (e.key === 'ArrowUp' ? 1 : -1) * (step || 1) * 10));
                setError('');
              }
              return;
            }
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              e.currentTarget.value = String(value);
              setDraft(null);
              setError('');
              e.currentTarget.blur();
            }
          }}
        />
        {unit && <span>{unit}</span>}
      </div>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
function Section({
  title,
  icon,
  children,
  defaultExpanded = true,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}) {
  const ui = useUI();
  const expanded = ui.sections[title] ?? defaultExpanded;
  const contentId = useId();
  return (
    <section className="property-section">
      <h3>
        <button
          type="button"
          className="property-section-toggle"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => ui.set({ sections: { ...ui.sections, [title]: !expanded } })}
        >
          {icon}
          <span>{title}</span>
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
      </h3>
      <div id={contentId} className="property-section-content" hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}
function TextProperties({ el }: { el: SVGGraphicsElement }) {
  const info = engine.textStructure(el),
    computed = getComputedStyle(el);
  return (
    <Section title="文字" icon={<Type size={14} />}>
      {info.editable ? (
        info.parts.map((p, i) => (
          <label className="text-property" key={i}>
            <span>{info.parts.length > 1 ? `段落 ${i + 1}` : '内容'}</span>
            <textarea
              aria-label={`属性文字 ${i + 1}`}
              defaultValue={p.textContent || ''}
              key={`${i}-${p.textContent}`}
              onBlur={(e) => {
                if (e.target.value !== p.textContent)
                  run(() => {
                    const values = info.parts.map((part, j) =>
                      j === i ? e.target.value : part.textContent || '',
                    );
                    if (values.length === 1 && values[0].includes('\n'))
                      engine.multiline(el, values[0], parseFloat(computed.fontSize) * 1.35);
                    else engine.updateText(el, values);
                  });
              }}
            />
          </label>
        ))
      ) : (
        <p className="notice">{info.reason}</p>
      )}
      <Field
        label="字体"
        value={computed.fontFamily}
        onCommit={(v) => engine.updateAttributes({ 'font-family': v })}
      />
      <div className="property-grid">
        <Field
          label="字号"
          type="number"
          value={parseFloat(computed.fontSize)}
          unit="px"
          onCommit={(v) => {
            if (Number(v) <= 0) throw new Error('字号必须大于 0。');
            engine.updateAttributes({ 'font-size': v });
          }}
        />
        <Field
          label="字重"
          value={computed.fontWeight}
          onCommit={(v) => engine.updateAttributes({ 'font-weight': v })}
        />
      </div>
      <label className="property-field">
        <span>文字对齐</span>
        <select
          aria-label="文字对齐"
          value={computed.textAnchor}
          onChange={(e) => run(() => engine.updateAttributes({ 'text-anchor': e.target.value }))}
        >
          <option value="start">左 / 起始</option>
          <option value="middle">居中</option>
          <option value="end">右 / 末尾</option>
        </select>
      </label>
      {info.parts.length > 1 && (
        <Field
          label="多行行距"
          value={info.parts[1].getAttribute('dy') || parseFloat(computed.fontSize) * 1.35}
          type="number"
          unit="px"
          onCommit={(v) => engine.lineHeight(el, Number(v))}
        />
      )}
      {lineEditable(engine, el) && <TextLayout el={el} />}
      <p className="field-note">
        SVG 保留原字体。此设备未安装的字体会使用浏览器回退字体；不会加载外部字体。
      </p>
    </Section>
  );
}
export function Inspector() {
  useDocument();
  const ui = useUI();
  const styleTarget = (node: SVGGraphicsElement) =>
    isMotionWrapper(node) ? motionOriginal(node)! : node;
  const el = engine.selection[0],
    bounds = engine.selectionBounds(),
    computed = el ? getComputedStyle(styleTarget(el)) : null;
  const attr = (name: string) =>
    el ? (['id', 'transform'].includes(name) ? el : styleTarget(el)).getAttribute(name) || '' : '';
  const connector = engine.selection.length === 1 && el ? connectionElement(el) : null;
  const common = (name: string) => {
    if (!el) return '';
    const value = getComputedStyle(styleTarget(el)).getPropertyValue(name);
    return engine.selection.every(
      (e) => getComputedStyle(styleTarget(e)).getPropertyValue(name) === value,
    )
      ? value
      : '混合';
  };
  return (
    <aside className="inspector-panel" aria-label="属性面板">
      <div className="panel-heading">
        <span>
          <SlidersHorizontal size={15} />
          属性
        </span>
        <IconButton label="收起属性面板" onClick={() => ui.set({ rightOpen: false })}>
          <X size={14} />
        </IconButton>
      </div>
      {!el ? (
        <div className="inspector-empty">
          <div className="empty-illustration">
            <div />
            <div />
            <MousePointer2 size={20} />
          </div>
          <h2>每个细节，都刚刚好。</h2>
          <p>
            选择一个元素，开始精修。
            <br />
            文字、颜色、间距，由你决定。
          </p>
          <div className="empty-shortcuts">
            <span>
              选择多个元素<kbd>Shift + 点击</kbd>
            </span>
            <span>
              深入分组<kbd>双击</kbd>
            </span>
            <span>
              微调位置<kbd>↑ ↓ ← →</kbd>
            </span>
          </div>
          <button className="button" onClick={() => ui.set({ importOpen: true })}>
            粘贴你的 SVG
          </button>
        </div>
      ) : (
        <div
          className="inspector-scroll"
          key={engine.selection.map((v) => engine.key(v)).join(',')}
        >
          <div className="selection-summary">
            <span className="element-badge">
              {engine.selection.length > 1
                ? `${engine.selection.length} 个元素`
                : `<${el.localName}>`}
            </span>
            <span>{el.getAttribute('data-label') || el.id || '未命名'}</span>
          </div>
          {bounds && (
            <Section title="布局" icon={<Move size={14} />} defaultExpanded={false}>
              <div className="property-grid">
                <Field
                  label="X"
                  type="number"
                  step={1}
                  value={Number(bounds.x.toFixed(2))}
                  onCommit={(v) => engine.translate(Number(v) - bounds.x, 0)}
                />
                <Field
                  label="Y"
                  type="number"
                  value={Number(bounds.y.toFixed(2))}
                  onCommit={(v) => engine.translate(0, Number(v) - bounds.y)}
                />
                <Field
                  label="宽度"
                  type="number"
                  value={Number(bounds.width.toFixed(2))}
                  onCommit={(v) =>
                    engine.resize(
                      Number(v),
                      ui.aspectLocked && bounds.width
                        ? (bounds.height * Number(v)) / bounds.width
                        : bounds.height,
                    )
                  }
                />
                <Field
                  label="高度"
                  type="number"
                  value={Number(bounds.height.toFixed(2))}
                  onCommit={(v) =>
                    engine.resize(
                      ui.aspectLocked && bounds.height
                        ? (bounds.width * Number(v)) / bounds.height
                        : bounds.width,
                      Number(v),
                    )
                  }
                />
                <Field
                  label="旋转增量"
                  type="number"
                  value={0}
                  unit="°"
                  onCommit={(v) => engine.rotate(Number(v))}
                />
                <Field
                  label="透明度"
                  type="number"
                  step={0.1}
                  value={common('opacity')}
                  onCommit={(v) => {
                    if (Number(v) < 0 || Number(v) > 1) throw new Error('透明度范围为 0–1。');
                    engine.updateAttributes({ opacity: v });
                  }}
                />
              </div>
              <button
                className="text-button"
                aria-pressed={ui.aspectLocked}
                onClick={() => ui.set({ aspectLocked: !ui.aspectLocked })}
              >
                {ui.aspectLocked ? <Link size={12} /> : <Unlink size={12} />}{' '}
                {ui.aspectLocked ? '比例已锁定' : '锁定宽高比例'}
              </button>
              {engine.selection.length === 1 && el.localName === 'rect' && (
                <ContainerSize el={el} />
              )}
              {engine.selection.length === 1 &&
                el.localName === 'g' &&
                engine.children(el).some((v) => v.localName === 'rect') && (
                  <div className="section-actions">
                    {engine
                      .children(el)
                      .filter((v) => v.localName === 'rect')
                      .map((rect, i) => (
                        <button
                          key={engine.key(rect)}
                          className="button"
                          onClick={() => engine.select([rect])}
                        >
                          编辑背景矩形 {i + 1}
                        </button>
                      ))}
                  </div>
                )}
              {el.localName === 'rect' && (
                <Field
                  label="圆角"
                  type="number"
                  value={attr('rx') || 0}
                  onCommit={(v) => engine.updateAttributes({ rx: v })}
                />
              )}
            </Section>
          )}
          {el.getAttribute('data-monochrome') === 'true' && (
            <Section title="图标" icon={<Palette size={14} />}>
              <Field
                label="图标颜色"
                value={el.querySelector('[stroke]')?.getAttribute('stroke') || '#334155'}
                onCommit={(v) => engine.updateIcon(v)}
              />
              <Field
                label="图标描边"
                type="number"
                value={el.querySelector('[stroke-width]')?.getAttribute('stroke-width') || 1.75}
                onCommit={(v) =>
                  engine.updateIcon(
                    el.querySelector('[stroke]')?.getAttribute('stroke') || '#334155',
                    Number(v),
                  )
                }
              />
            </Section>
          )}
          <Section title="外观" icon={<Palette size={14} />}>
            {(['fill', 'stroke'] as const).map((name) => (
              <div className="paint-property" key={name}>
                <ColorPicker
                  name={name}
                  color={name === 'fill' ? computed?.fill || '' : computed?.stroke || ''}
                />
                <Field
                  label={name === 'fill' ? '填充' : '描边'}
                  value={common(name)}
                  onCommit={(v) => engine.updateAttributes({ [name]: v })}
                />
              </div>
            ))}
            <div className="property-grid">
              <Field
                label="描边宽度"
                type="number"
                value={
                  common('stroke-width') === '混合'
                    ? '混合'
                    : parseFloat(common('stroke-width')) || 0
                }
                onCommit={(v) => engine.updateAttributes({ 'stroke-width': v })}
              />
              <Field
                label="虚线间距"
                value={common('stroke-dasharray')}
                onCommit={(v) => engine.updateAttributes({ 'stroke-dasharray': v })}
              />
            </div>
            <p className="field-note">
              显示计算样式。修改将为所选元素设置显式覆盖；清空可恢复继承。
            </p>
            {el.localName === 'g' && (
              <p className="field-note">分组内已有独立样式的子元素保持原样；可深入分组单独修改。</p>
            )}
          </Section>
          {engine.selection.length > 1 && <LayoutTools />}
          {engine.selection.length === 1 && (
            <Section title="动效" icon={<Sparkles size={14} />}>
              <MotionProperties key={engine.key(el)} el={el} />
            </Section>
          )}
          {engine.selection.length > 1 && engine.selection.every((e) => e.localName === 'text') && (
            <Section title="批量文字" icon={<Type size={14} />}>
              <Field
                label="批量字号"
                value={common('font-size') === '混合' ? '混合' : parseFloat(common('font-size'))}
                type="number"
                unit="px"
                onCommit={(v) => engine.updateAttributes({ 'font-size': v })}
              />
              <Field
                label="批量字体"
                value={common('font-family')}
                onCommit={(v) => engine.updateAttributes({ 'font-family': v })}
              />
            </Section>
          )}
          {engine.selection.length === 1 && el.localName === 'text' && (
            <TextProperties key={engine.key(el)} el={el} />
          )}
          {connector && (
            <Section title="连接关联" icon={<Link size={14} />}>
              <ConnectionBindings line={connector} />
            </Section>
          )}
          {!connector &&
            engine.selection.length > 0 &&
            engine.selection.every((selected) =>
              connectionNodes(engine).includes(
                motionWrapper(selected) === selected ? motionOriginal(selected)! : selected,
              ),
            ) && (
              <Section title="连接关联" icon={<Link size={14} />}>
                <NodeConnections />
              </Section>
            )}
          {engine.selection.length === 1 && ['path', 'line', 'polyline'].includes(el.localName) && (
            <Section title="连接线" icon={<Move size={14} />}>
              {(['start', 'end'] as const).map((position) => (
                <label className="property-field" key={position}>
                  <span>{position === 'start' ? '起点箭头样式' : '终点箭头样式'}</span>
                  <select
                    aria-label={position === 'start' ? '起点箭头样式' : '终点箭头样式'}
                    defaultValue=""
                    onChange={(e) => {
                      run(() =>
                        e.target.value.startsWith('#')
                          ? engine.updateAttributes({
                              [`marker-${position}`]: `url(${e.target.value})`,
                            })
                          : markerStyle(engine, position, e.target.value as 'triangle'),
                      );
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>
                      选择箭头…
                    </option>
                    <option value="none">无</option>
                    <option value="triangle">实心箭头</option>
                    <option value="open">开放箭头</option>
                    <option value="circle">圆点</option>
                    {[...engine.root!.querySelectorAll('marker[id]')].map((marker) => (
                      <option key={marker.id} value={`#${marker.id}`}>
                        文档：{marker.id}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <Field
                label="起始箭头"
                value={attr('marker-start') || 'none'}
                onCommit={(v) => engine.updateAttributes({ 'marker-start': v })}
              />
              <Field
                label="结束箭头"
                value={attr('marker-end') || 'none'}
                onCommit={(v) => engine.updateAttributes({ 'marker-end': v })}
              />
              {el.localName === 'line' && (
                <div className="property-grid">
                  {['x1', 'y1', 'x2', 'y2'].map((n) => (
                    <Field
                      key={n}
                      label={n.toUpperCase()}
                      type="number"
                      value={attr(n) || 0}
                      onCommit={(v) => engine.updateAttributes({ [n]: v })}
                    />
                  ))}
                </div>
              )}
              {el.localName === 'polyline' && (
                <Field
                  label="折线坐标"
                  value={attr('points')}
                  onCommit={(v) => engine.updateAttributes({ points: v })}
                />
              )}
              <p className="field-note">
                可选已有箭头或创建独立样式。Path 支持整体移动、缩放与样式编辑。
              </p>
            </Section>
          )}
          {engine.selection.length === 1 && (
            <Section title="SVG 属性" icon={<Code2 size={14} />}>
              <Field
                label="元素 ID"
                value={el.id}
                onCommit={(v) => engine.updateAttributes({ id: v })}
              />
              <Field
                label="Transform"
                value={attr('transform')}
                onCommit={(v) => engine.updateAttributes({ transform: v })}
              />
              {el.getAttribute('class') && (
                <div className="class-info">
                  <span>Class</span>
                  <code>{el.getAttribute('class')}</code>
                </div>
              )}
              <button className="text-button" onClick={() => ui.set({ sourceOpen: true })}>
                查看完整 SVG 源码
              </button>
            </Section>
          )}
          <div className="inspector-tip">
            <Info size={14} />
            <span>坐标与尺寸基于文档坐标系的外接矩形。旋转为相对角度。</span>
          </div>
        </div>
      )}
    </aside>
  );
}

function ContainerSize({ el }: { el: SVGGraphicsElement }) {
  return (
    <div className="container-size">
      <p className="field-note">调整外框尺寸，保持同组文字和图标不变。</p>
      <div className="property-grid">
        <Field
          label="外框宽度"
          type="number"
          value={el.getAttribute('width') || 0}
          onCommit={(v) => resizeRect(engine, el, Number(v), Number(el.getAttribute('height')))}
        />
        <Field
          label="外框高度"
          type="number"
          value={el.getAttribute('height') || 0}
          onCommit={(v) => resizeRect(engine, el, Number(el.getAttribute('width')), Number(v))}
        />
      </div>
    </div>
  );
}
function TextLayout({ el }: { el: SVGGraphicsElement }) {
  const [width, setWidth] = useState('200'),
    [height, setHeight] = useState(
      String(Math.round(parseFloat(getComputedStyle(el).fontSize) * 1.35)),
    ),
    [minimum, setMinimum] = useState('8');
  const changeLines = (add: boolean) => {
    const parts = el.children.length
      ? [...el.children].map((p) => p.textContent || '')
      : [el.textContent || ''];
    if (add) parts.push('新的一行');
    else parts.pop();
    setLines(engine, el, parts.length ? parts : [''], Number(height));
  };
  return (
    <div className="text-layout">
      <div className="section-actions">
        <button className="button" onClick={() => run(() => changeLines(true))}>
          增加一行
        </button>
        <button
          className="button"
          disabled={el.children.length < 2}
          onClick={() => run(() => changeLines(false))}
        >
          删除末行
        </button>
      </div>
      <div className="property-grid">
        <label className="property-field">
          <span>排版宽度</span>
          <div>
            <input
              aria-label="排版宽度"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
        </label>
        <label className="property-field">
          <span>排版行距</span>
          <div>
            <input
              aria-label="排版行距"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </label>
      </div>
      <div className="section-actions">
        <button
          className="button"
          onClick={() => run(() => wrapText(engine, el, Number(width), Number(height)))}
        >
          按宽度换行
        </button>
      </div>
      <label className="property-field">
        <span>最小字号</span>
        <div>
          <input
            aria-label="最小字号"
            type="number"
            value={minimum}
            onChange={(e) => setMinimum(e.target.value)}
          />
        </div>
      </label>
      <button
        className="button"
        onClick={() =>
          run(() => wrapText(engine, el, Number(width), Number(height), true, Number(minimum)))
        }
      >
        缩小字号适应宽度
      </button>
      <p className="field-note">
        宽度和行距使用文字本地坐标。仅在点击命令时排版；可撤销，不修改其他文字。
      </p>
    </div>
  );
}
function LayoutTools() {
  const ui = useUI(),
    [gap, setGap] = useState('24');
  return (
    <Section title="对齐与间距" icon={<Move size={14} />}>
      <label className="property-field">
        <span>对齐到</span>
        <select
          aria-label="对齐参照"
          value={ui.alignReference}
          onChange={(e) => ui.set({ alignReference: e.target.value as 'selection' })}
        >
          <option value="selection">当前选择边界</option>
          <option value="key">最后选中的关键对象</option>
          <option value="canvas">画布</option>
        </select>
      </label>
      <div className="section-actions">
        {(
          [
            ['left', '左对齐'],
            ['center', '水平居中'],
            ['right', '右对齐'],
            ['top', '顶对齐'],
            ['middle', '垂直居中'],
            ['bottom', '底对齐'],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            className="button"
            onClick={() => run(() => alignTo(engine, kind, ui.alignReference))}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="property-field">
        <span>净间距</span>
        <div>
          <input
            type="number"
            aria-label="净间距"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
          />
          <span>px</span>
        </div>
      </label>
      <div className="section-actions">
        <button className="button" onClick={() => run(() => gapElements(engine, 'x', Number(gap)))}>
          设置水平间距
        </button>
        <button className="button" onClick={() => run(() => gapElements(engine, 'y', Number(gap)))}>
          设置垂直间距
        </button>
      </div>
      {ui.alignReference === 'key' && (
        <p className="field-note">
          关键对象：
          {engine.selection.at(-1)?.getAttribute('data-label') ||
            engine.selection.at(-1)?.id ||
            '最后选中的对象'}
        </p>
      )}
    </Section>
  );
}
