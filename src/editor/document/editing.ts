import type { DocumentEngine } from './engine';
import { SVG_NS } from '../security/sanitize';
import { union } from '../geometry/geometry';
export function element(tag: string, attrs: Record<string, string | number> = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}
export function lineEditable(engine: DocumentEngine, el: SVGGraphicsElement) {
  const info = engine.textStructure(el);
  if (!info.editable) return false;
  if (!el.children.length) return true;
  return info.parts.every(
    (span, i) =>
      span.localName === 'tspan' &&
      [...span.attributes].every((a) => ['x', 'y', 'dy'].includes(a.name)) &&
      (i === 0 || span.hasAttribute('y') || span.hasAttribute('dy')),
  );
}
export function setLines(
  engine: DocumentEngine,
  el: SVGGraphicsElement,
  lines: string[],
  height: number,
) {
  if (!lineEditable(engine, el))
    throw new Error('仅支持普通 text 或无混合样式的逐行 tspan，请使用逐段编辑或源码。');
  if (!Number.isFinite(height) || height <= 0 || lines.length > 500)
    throw new Error('行距必须大于 0，文字不超过 500 行。');
  const old = [...el.children];
  const x = old[0]?.getAttribute('x') || el.getAttribute('x') || '0';
  const firstY = old[0]?.getAttribute('y'),
    firstDy = old[0]?.getAttribute('dy');
  engine.transaction('修改文本行', () => {
    el.replaceChildren(
      ...lines.map((line, i) => {
        const span = element('tspan', { x });
        if (i) span.setAttribute('dy', String(height));
        else if (firstY !== null && firstY !== undefined) span.setAttribute('y', firstY);
        else span.setAttribute('dy', firstDy || '0');
        span.textContent = line;
        return span;
      }),
    );
  });
}
export function wrapText(
  engine: DocumentEngine,
  el: SVGGraphicsElement,
  width: number,
  height: number,
  fit = false,
  minSize = 8,
) {
  if (!lineEditable(engine, el) || !Number.isFinite(width) || width <= 0)
    throw new Error('请选择可逐行排版的文字，并设置大于 0 的宽度。');
  if (document.fonts?.status === 'loading') throw new Error('字体正在加载，请稍后重试排版。');
  const content = el.children.length
    ? [...el.children].map((s) => s.textContent || '').join('\n')
    : el.textContent || '';
  const probe = el.cloneNode(false) as SVGTextElement;
  const computed = getComputedStyle(el);
  for (const property of [
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'font-variant',
    'font-stretch',
    'letter-spacing',
    'word-spacing',
  ])
    probe.style.setProperty(property, computed.getPropertyValue(property), 'important');
  probe.removeAttribute('id');
  probe.removeAttribute('transform');
  probe.style.setProperty('visibility', 'hidden');
  el.parentNode!.append(probe);
  const measure = (value: string) => {
    probe.textContent = value;
    return probe.getComputedTextLength();
  };
  try {
    if (fit) {
      const original = parseFloat(getComputedStyle(el).fontSize);
      const maximum = Math.max(...content.split('\n').map(measure));
      const size = Math.min(original, (original * width) / Math.max(maximum, 0.001));
      if (!Number.isFinite(minSize) || minSize <= 0 || minSize > original || size < minSize)
        throw new Error(`达到宽度需要小于 ${minSize}px 的字号，请加宽文字或使用换行。`);
      // Measurement nodes must never enter either side of a history snapshot.
      probe.remove();
      engine.updateAttributes({ 'font-size': `${Math.floor(size * 100) / 100}px` });
      return;
    }
    const lines: string[] = [];
    for (const paragraph of content.split('\n')) {
      let current = '';
      for (const char of Array.from(paragraph)) {
        if (current && measure(current + char) > width) {
          lines.push(current);
          current = char;
        } else current += char;
      }
      lines.push(current);
    }
    probe.remove();
    setLines(engine, el, lines, height);
  } finally {
    probe.remove();
  }
}
export function resizeRect(
  engine: DocumentEngine,
  el: SVGGraphicsElement,
  width: number,
  height: number,
) {
  if (el.localName !== 'rect' || ![width, height].every((v) => Number.isFinite(v) && v > 0))
    throw new Error('请选择矩形并输入大于 0 的外框尺寸。');
  if (el.style.width || el.style.height) throw new Error('此矩形尺寸由 CSS 控制，请在源码中调整。');
  // Class-based geometry must not be silently overridden by an attribute that has no visible effect.
  for (const style of engine.root?.querySelectorAll('style') || [])
    for (const rule of style.sheet?.cssRules || []) {
      if (
        rule instanceof CSSStyleRule &&
        (rule.style.width || rule.style.height) &&
        el.matches(rule.selectorText)
      )
        throw new Error('此矩形尺寸由 CSS class 控制，请在源码中调整。');
    }
  engine.transaction('调整容器外框', () => {
    el.setAttribute('width', String(width));
    el.setAttribute('height', String(height));
  });
}
export function gapElements(engine: DocumentEngine, axis: 'x' | 'y', gap: number) {
  if (!Number.isFinite(gap)) throw new Error('请输入有效间距。');
  const entries = engine.selection
    .map((el) => ({ el, b: engine.bounds(el) }))
    .filter((v): v is { el: SVGGraphicsElement; b: NonNullable<typeof v.b> } => !!v.b)
    .sort((a, b) => a.b[axis] - b.b[axis]);
  if (entries.length < 2) throw new Error('设置间距需要至少两个元素。');
  const size = axis === 'x' ? 'width' : 'height';
  let position = entries[0].b[axis];
  engine.transaction('设置净间距', () => {
    for (const { el, b } of entries) {
      engine.applyWorld(
        el,
        new DOMMatrix().translate(
          axis === 'x' ? position - b.x : 0,
          axis === 'y' ? position - b.y : 0,
        ),
      );
      position += b[size] + gap;
    }
  });
}
export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export function alignTo(
  engine: DocumentEngine,
  kind: Alignment,
  reference: 'selection' | 'key' | 'canvas',
) {
  const entries = engine.selection
    .map((el) => ({ el, b: engine.bounds(el) }))
    .filter((v): v is { el: SVGGraphicsElement; b: NonNullable<typeof v.b> } => !!v.b);
  const key = engine.selection.at(-1);
  const target =
    reference === 'canvas'
      ? engine.viewBox()
      : reference === 'key' && key
        ? engine.bounds(key)
        : union(entries.map((v) => v.b));
  if (!target) return;
  engine.transaction('按参照对齐', () => {
    for (const { el, b } of entries) {
      if (reference === 'key' && el === key) continue;
      const dx =
        kind === 'left'
          ? target.x - b.x
          : kind === 'center'
            ? target.x + target.width / 2 - b.x - b.width / 2
            : kind === 'right'
              ? target.x + target.width - b.x - b.width
              : 0;
      const dy =
        kind === 'top'
          ? target.y - b.y
          : kind === 'middle'
            ? target.y + target.height / 2 - b.y - b.height / 2
            : kind === 'bottom'
              ? target.y + target.height - b.y - b.height
              : 0;
      engine.applyWorld(el, new DOMMatrix().translate(dx, dy));
    }
  });
}
export function markerStyle(
  engine: DocumentEngine,
  position: 'start' | 'end',
  kind: 'none' | 'triangle' | 'open' | 'circle',
) {
  engine.transaction('设置箭头', () => {
    for (const el of engine.selection) {
      if (kind === 'none') {
        el.setAttribute(`marker-${position}`, 'none');
        el.style.setProperty(`marker-${position}`, 'none', 'important');
        continue;
      }
      const id = `sf-marker-${crypto.randomUUID()}`,
        color = getComputedStyle(el).stroke;
      const marker = element('marker', {
        id,
        viewBox: '0 0 10 10',
        refX: kind === 'circle' ? 5 : 9,
        refY: 5,
        markerWidth: 7,
        markerHeight: 7,
        orient: 'auto-start-reverse',
      });
      const shape =
        kind === 'circle'
          ? element('circle', { cx: 5, cy: 5, r: 3, fill: color })
          : element('path', {
              d: kind === 'triangle' ? 'M0 0 10 5 0 10Z' : 'M1 1 9 5 1 9',
              fill: kind === 'triangle' ? color : 'none',
              stroke: color,
              'stroke-width': 1.5,
            });
      // Inline styles win over unrelated document rules for path/circle/marker.
      for (const a of ['fill', 'stroke', 'stroke-width'])
        if (shape.hasAttribute(a)) shape.style.setProperty(a, shape.getAttribute(a)!, 'important');
      marker.append(shape);
      let defs = engine.root!.querySelector(':scope > defs');
      if (!defs) {
        defs = element('defs');
        engine.root!.prepend(defs);
      }
      defs.append(marker);
      el.setAttribute(`marker-${position}`, `url(#${id})`);
      el.style.setProperty(`marker-${position}`, `url(#${id})`, 'important');
    }
  });
}
