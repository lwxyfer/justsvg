import type { DocumentEngine } from './engine';
import type { Bounds } from '../geometry/geometry';
const frameAttribute = 'data-sf-text-frame';
const flowAttribute = 'data-sf-text-flow';
const lineAttribute = 'data-sf-text-line';
const ns = 'http://www.w3.org/2000/svg';
const fontProperties = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-variant',
  'letter-spacing',
  'word-spacing',
  'text-anchor',
  'direction',
  'fill',
  'stroke',
  'stroke-width',
];
export function textFrame(el: Element): Bounds | null {
  if (el.localName !== 'text') return null;
  try {
    const box = JSON.parse(el.getAttribute(frameAttribute) || 'null');
    if (
      box &&
      ['x', 'y', 'width', 'height'].every(
        (key) => typeof box[key] === 'number' && Number.isFinite(box[key]),
      ) &&
      box.width > 0 &&
      box.height > 0
    )
      return { x: box.x, y: box.y, width: box.width, height: box.height };
  } catch {
    /* Imported metadata must never block editing. */
  }
  return null;
}
export function flowingText(el: Element) {
  return (
    el.hasAttribute(flowAttribute) &&
    [...el.children].every((span) => span.localName === 'tspan' && span.hasAttribute(lineAttribute))
  );
}
export function prepareTextFrame(engine: DocumentEngine, el: SVGGraphicsElement) {
  const original = engine.matrix(el),
    rootCTM = engine.root!.getScreenCTM(),
    ctm = el.getScreenCTM();
  if (!rootCTM || !ctm) throw new Error('文字坐标系不可用。');
  const nativeMatrix = (value: DOMMatrix) =>
    new DOMMatrix([value.a, value.b, value.c, value.d, value.e, value.f]);
  const localToRoot = nativeMatrix(rootCTM).inverse().multiply(nativeMatrix(ctm));
  const box = textFrame(el) || el.getBBox();
  const origin = new DOMPoint(box.x, box.y).matrixTransform(localToRoot);
  const style = getComputedStyle(el),
    source = el.textContent || '';
  const simple =
    (!el.children.length || flowingText(el)) &&
    !['dx', 'dy', 'rotate', 'textLength'].some((key) => el.hasAttribute(key)) &&
    !/vertical/.test(style.writingMode) &&
    ['x', 'y'].every(
      (key) =>
        (el.getAttribute(key) || '')
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean).length <= 1,
    );
  const positions = (el as SVGTextElement).y.baseVal;
  const baseline = positions.numberOfItems ? positions.getItem(0).value : 0;
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.35;
  const advances = new Map<string, number>();
  // Measure once per distinct grapheme at gesture start, never create a history transaction for probes.
  const units =
    simple && source.length <= 10000
      ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(source)].map(
          (part) => part.segment,
        )
      : [];
  if (simple && source.length <= 10000) {
    const probe = el.cloneNode(false) as SVGTextElement;
    probe.removeAttribute('id');
    probe.removeAttribute('transform');
    probe.removeAttribute(frameAttribute);
    probe.style.setProperty('visibility', 'hidden', 'important');
    for (const property of fontProperties)
      probe.style.setProperty(property, style.getPropertyValue(property), 'important');
    el.parentNode!.append(probe);
    try {
      for (const char of new Set(units)) {
        probe.textContent = char;
        advances.set(char, probe.getComputedTextLength());
      }
    } finally {
      probe.remove();
    }
  }
  return (world: DOMMatrix) => {
    const local = localToRoot.inverse().multiply(world).multiply(localToRoot);
    const width = Math.max(0.01, box.width * Math.hypot(local.a, local.b)),
      height = Math.max(0.01, box.height * Math.hypot(local.c, local.d));
    const next = origin.matrixTransform(world);
    // Translation only: the original linear transform and all glyph sizes are retained.
    engine.applyWorld(
      el,
      new DOMMatrix().translate(next.x - origin.x, next.y - origin.y),
      original,
    );
    el.setAttribute(frameAttribute, JSON.stringify({ x: box.x, y: box.y, width, height }));
    if (!simple || !advances.size) return;
    const lines: string[] = [];
    let line = '',
      used = 0;
    for (const char of units) {
      const advance = advances.get(char) || 0;
      if (line && used + advance > width) {
        lines.push(line);
        line = '';
        used = 0;
      }
      line += char;
      used += advance;
      if (char === '\n') {
        lines.push(line);
        line = '';
        used = 0;
      }
    }
    if (line || !lines.length) lines.push(line);
    if (lines.length > 500) return;
    const end =
      style.textAnchor === 'end' || (style.textAnchor === 'start' && style.direction === 'rtl');
    const x = box.x + (style.textAnchor === 'middle' ? width / 2 : end ? width : 0);
    el.replaceChildren(
      ...lines.map((content, index) => {
        const span = document.createElementNS(ns, 'tspan');
        span.setAttribute(lineAttribute, '');
        span.setAttribute('x', String(x));
        span.setAttribute('y', String(baseline + index * lineHeight));
        // Author styles for tspan must not unexpectedly change an automatically wrapped line.
        for (const property of fontProperties)
          span.style.setProperty(property, 'inherit', 'important');
        span.textContent = content;
        return span;
      }),
    );
    el.setAttribute(flowAttribute, 'true');
  };
}
