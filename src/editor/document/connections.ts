import type { DocumentEngine } from './engine';
import type { Bounds, Point } from '../geometry/geometry';
import { isMotionPart, motionOriginal, motionWrapper } from './motion';
import {
  anchorAt,
  anchorPoint,
  decodeAnchor,
  encodeAnchor,
  parseLinearPath,
  parsePoints,
  pathMidpoint,
  routePoints,
  type ConnectionEnd,
  type Port,
} from '../geometry/connectors';
const ends = ['start', 'end'] as const;
export const nodeAttribute = (end: ConnectionEnd) => `data-sf-${end}-node`;
const anchorAttribute = (end: ConnectionEnd) => `data-sf-${end}-anchor`;
export function connectionPoints(el: Element): Point[] | null {
  if (el.localName === 'line') {
    const values = ['x1', 'y1', 'x2', 'y2'].map((a) => Number(el.getAttribute(a) || 0));
    return values.every(Number.isFinite)
      ? [
          { x: values[0], y: values[1] },
          { x: values[2], y: values[3] },
        ]
      : null;
  }
  if (el.localName === 'polyline') return parsePoints(el.getAttribute('points') || '');
  if (el.localName === 'path') {
    if ((el as SVGElement).style.getPropertyValue('d')) return null;
    // CSS-authored geometry must be edited at its source rather than shadowed by an attribute.
    const root = (el as SVGElement).ownerSVGElement;
    if (root?.querySelector('style')) {
      for (const style of root.querySelectorAll('style'))
        for (const rule of style.sheet?.cssRules || [])
          if (
            rule instanceof CSSStyleRule &&
            rule.style.getPropertyValue('d') &&
            el.matches(rule.selectorText)
          )
            return null;
    }
    return parseLinearPath(el.getAttribute('d') || '');
  }
  return null;
}
export function connectionElement(el: SVGGraphicsElement): SVGGraphicsElement | null {
  if (connectionPoints(el)) return el;
  if (el.localName !== 'g') return null;
  const shapes = [
    ...el.querySelectorAll<SVGGraphicsElement>(
      'path,line,polyline,rect,circle,ellipse,polygon,image,use,svg',
    ),
  ].filter((n) => !n.closest('defs') && !isMotionPart(n));
  return shapes.length === 1 && connectionPoints(shapes[0]) ? shapes[0] : null;
}
const nodeCache = new WeakMap<
  DocumentEngine,
  { root: SVGSVGElement | null; revision: number; nodes: SVGGraphicsElement[] }
>();
export function connectionNodes(engine: DocumentEngine): SVGGraphicsElement[] {
  const cached = nodeCache.get(engine);
  if (cached?.root === engine.root && cached.revision === engine.documentRevision)
    return cached.nodes;
  const groups = engine
    .all()
    .filter(
      (el) =>
        el.localName === 'g' &&
        !connectionElement(el) &&
        (el.hasAttribute('data-node') ||
          el.hasAttribute('data-sf-node') ||
          ([...el.children].some((c) =>
            ['rect', 'circle', 'ellipse', 'polygon'].includes(c.localName),
          ) &&
            !!el.querySelector('text'))),
    );
  const nodes = engine
    .all()
    .filter((el) => {
      if (groups.includes(el)) return true;
      return (
        ['rect', 'circle', 'ellipse', 'polygon'].includes(el.localName) &&
        !groups.some((g) => g.contains(el))
      );
    })
    .filter((el) => getComputedStyle(el).display !== 'none');
  nodeCache.set(engine, { root: engine.root, revision: engine.documentRevision, nodes });
  return nodes;
}
function box(node: SVGGraphicsElement): Bounds {
  // A card's background controls its ports; overflowing text must not move the attachment.
  if (node.localName === 'g') {
    const direct = [...node.children].filter(
      (el) =>
        ['rect', 'circle', 'ellipse', 'polygon', 'path'].includes(el.localName) &&
        !connectionPoints(el),
    ) as SVGGraphicsElement[];
    const background = direct
      .map((el) => ({ el, b: el.getBBox() }))
      .sort((a, b) => b.b.width * b.b.height - a.b.width * a.b.height)[0];
    if (background) {
      const matrix = node.getScreenCTM()!.inverse().multiply(background.el.getScreenCTM()!);
      // Usually identity. Transform all corners for a background with its own SVG transform.
      const points = [
        [background.b.x, background.b.y],
        [background.b.x + background.b.width, background.b.y],
        [background.b.x, background.b.y + background.b.height],
        [background.b.x + background.b.width, background.b.y + background.b.height],
      ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
      const x = Math.min(...points.map((p) => p.x)),
        y = Math.min(...points.map((p) => p.y));
      return {
        x,
        y,
        width: Math.max(...points.map((p) => p.x)) - x,
        height: Math.max(...points.map((p) => p.y)) - y,
      };
    }
  }
  const b = node.getBBox();
  return { x: b.x, y: b.y, width: b.width, height: b.height };
}
const invertible = (m: DOMMatrix | null): m is DOMMatrix =>
  !!m && Math.abs(m.a * m.d - m.b * m.c) > 1e-12;
function target(line: Element, end: ConnectionEnd, ids: Map<string, SVGGraphicsElement>) {
  const ref = line.getAttribute(nodeAttribute(end));
  const node = ref?.startsWith('#') ? ids.get(ref.slice(1)) : undefined;
  const shape =
    node &&
    (['rect', 'circle', 'ellipse', 'polygon'].includes(node.localName) ||
      (node.localName === 'g' &&
        [...node.children].some(
          (c) =>
            ['rect', 'circle', 'ellipse', 'polygon'].includes(c.localName) ||
            (c.localName === 'path' && /[zZ]\s*$/.test(c.getAttribute('d') || '')),
        )));
  return node && shape && node !== line && !node.contains(line) && !connectionElement(node)
    ? node
    : null;
}
export function detachEnd(line: Element, end: ConnectionEnd) {
  line.removeAttribute(nodeAttribute(end));
  line.removeAttribute(anchorAttribute(end));
}
export function bindConnection(
  engine: DocumentEngine,
  line: SVGGraphicsElement,
  end: ConnectionEnd,
  node: SVGGraphicsElement | null,
  port: Port = 'nearest',
) {
  engine.transaction('关联连接线', () => {
    if (!node) {
      detachEnd(line, end);
      return;
    }
    if (
      !engine.root?.contains(line) ||
      !engine.root.contains(node) ||
      node.contains(line) ||
      node === line ||
      !connectionNodes(engine).includes(node)
    )
      throw new Error('请选择当前文档内的独立卡片或图形节点。');
    const points = connectionPoints(line),
      matrix = line.getScreenCTM(),
      to = node.getScreenCTM();
    if (!points || !invertible(matrix) || !invertible(to))
      throw new Error('此连接线或节点坐标不支持安全关联。');
    const point = new DOMPoint(
      ...(end === 'start'
        ? ([points[0].x, points[0].y] as const)
        : ([points.at(-1)!.x, points.at(-1)!.y] as const)),
    )
      .matrixTransform(matrix)
      .matrixTransform(to.inverse());
    if (!node.id) node.id = `sf-node-${crypto.randomUUID()}`;
    line.setAttribute(nodeAttribute(end), `#${node.id}`);
    line.setAttribute(anchorAttribute(end), encodeAnchor(anchorAt(box(node), point, port)));
  });
}
export function associateNearby(engine: DocumentEngine, selected: SVGGraphicsElement[]) {
  const nodes = connectionNodes(engine),
    selectedNodes = nodes.filter((n) =>
      selected.some((s) => s === n || (motionWrapper(s) === s && motionOriginal(s) === n)),
    );
  if (!selectedNodes.length) throw new Error('请先选中需要关联箭头的卡片或节点。');
  let count = 0;
  engine.transaction('关联相邻箭头', () => {
    for (const line of engine.all()) {
      const points = connectionPoints(line),
        matrix = line.getScreenCTM();
      if (!points || !invertible(matrix) || engine.isLocked(line)) continue;
      const matches = ends.map((end) => {
        const p = end === 'start' ? points[0] : points.at(-1)!;
        const screen = new DOMPoint(p.x, p.y).matrixTransform(matrix);
        const candidates = nodes
          .filter((n) => !n.contains(line) && n !== line)
          .flatMap((node) => {
            const m = node.getScreenCTM();
            if (!invertible(m)) return [];
            const local = screen.matrixTransform(m.inverse()),
              b = box(node),
              anchor = anchorAt(b, local, 'nearest', true);
            const border = anchorPoint(b, { ...anchor, dx: 0, dy: 0 });
            const projected = new DOMPoint(border.x, border.y).matrixTransform(m);
            return [
              {
                node,
                anchor,
                distance: Math.hypot(projected.x - screen.x, projected.y - screen.y),
              },
            ];
          })
          .filter((c) => c.distance <= 14)
          .sort((a, b) => a.distance - b.distance);
        if (!candidates.length) return null;
        // Overlapping unrelated candidates are ambiguous; leave them for an explicit choice.
        if (candidates[1] && Math.abs(candidates[1].distance - candidates[0].distance) < 0.5)
          return null;
        return candidates[0];
      });
      if (!matches.some((m) => m && selectedNodes.includes(m.node))) continue;
      matches.forEach((match, i) => {
        const end = ends[i];
        if (!match || line.hasAttribute(nodeAttribute(end))) return;
        if (!match.node.id) match.node.id = `sf-node-${crypto.randomUUID()}`;
        line.setAttribute(nodeAttribute(end), `#${match.node.id}`);
        line.setAttribute(anchorAttribute(end), encodeAnchor(match.anchor));
        count++;
      });
    }
  });
  return count;
}
export function prepareConnectionTransform(engine: DocumentEngine, element: SVGGraphicsElement) {
  if (!engine.root?.querySelector('[data-sf-start-node],[data-sf-end-node]')) return;
  // Insertion/paste calls this before the document cache is invalidated at commit.
  const ids = new Map(
    [...engine.root.querySelectorAll<SVGGraphicsElement>('[id]')]
      .filter((n) => engine.isDrawable(n))
      .map((n) => [n.id, n]),
  );
  for (const line of [
    element,
    ...element.querySelectorAll<SVGGraphicsElement>('[data-sf-start-node],[data-sf-end-node]'),
  ]) {
    if (!connectionPoints(line)) continue;
    const movingNode = ends.some((end) => {
      const node = target(line, end, ids);
      return node && engine.selection.some((s) => s === node || s.contains(node));
    });
    if (!movingNode) ends.forEach((end) => detachEnd(line, end));
  }
}
export function syncConnections(engine: DocumentEngine) {
  if (!engine.root?.isConnected) return;
  const lines = [
    ...engine.root.querySelectorAll<SVGGraphicsElement>('[data-sf-start-node],[data-sf-end-node]'),
  ];
  if (!lines.length) return;
  const ids = new Map(
    [...engine.root.querySelectorAll<SVGGraphicsElement>('[id]')]
      .filter((n) => engine.isDrawable(n))
      .map((n) => [n.id, n]),
  );
  for (const line of lines) {
    const points = connectionPoints(line),
      matrix = line.getScreenCTM();
    if (!points || !invertible(matrix)) continue;
    const next = ends.map((end, i) => {
      const original = i ? points.at(-1)! : points[0],
        node = target(line, end, ids),
        anchor = decodeAnchor(line.getAttribute(anchorAttribute(end)));
      if (!node || !anchor) {
        if (line.hasAttribute(nodeAttribute(end))) detachEnd(line, end);
        return original;
      }
      const m = node.getScreenCTM();
      if (!invertible(m)) return original;
      for (let n: Element | null = node; n && n !== engine.root; n = n.parentElement)
        if (getComputedStyle(n).display === 'none') return original;
      const bounds = box(node);
      if (bounds.width <= 0 || bounds.height <= 0) return original;
      const p = anchorPoint(bounds, anchor);
      return new DOMPoint(p.x, p.y).matrixTransform(m).matrixTransform(matrix.inverse());
    });
    if (
      Math.hypot(next[0].x - points[0].x, next[0].y - points[0].y) < 1e-5 &&
      Math.hypot(next[1].x - points.at(-1)!.x, next[1].y - points.at(-1)!.y) < 1e-5
    )
      continue;
    const routed = routePoints(points, next[0], next[1], line.localName === 'line');
    const n = (v: number) => String(Number(v.toFixed(7)));
    if (line.localName === 'line') {
      for (const [key, value] of Object.entries({
        x1: routed[0].x,
        y1: routed[0].y,
        x2: routed.at(-1)!.x,
        y2: routed.at(-1)!.y,
      }))
        line.setAttribute(key, n(value));
    } else if (line.localName === 'polyline')
      line.setAttribute('points', routed.map((p) => `${n(p.x)},${n(p.y)}`).join(' '));
    else
      line.setAttribute('d', routed.map((p, i) => `${i ? 'L' : 'M'}${n(p.x)} ${n(p.y)}`).join(' '));
    if (line.id)
      for (const label of engine.root.querySelectorAll<SVGGraphicsElement>('[data-sf-label-for]')) {
        if (!engine.isDrawable(label)) continue;
        if (label.getAttribute('data-sf-label-for') !== `#${line.id}`) continue;
        const before = pathMidpoint(points),
          after = pathMidpoint(routed);
        const a = new DOMPoint(before.x, before.y).matrixTransform(matrix),
          b = new DOMPoint(after.x, after.y).matrixTransform(matrix);
        const r = engine.root.getScreenCTM();
        if (!invertible(r)) continue;
        const from = a.matrixTransform(r.inverse()),
          to = b.matrixTransform(r.inverse());
        try {
          engine.applyWorld(label, new DOMMatrix().translate(to.x - from.x, to.y - from.y));
        } catch {
          if (!engine.warnings.includes('部分连接线标签的坐标不可安全修改，请手动调整标签。'))
            engine.warnings.push('部分连接线标签的坐标不可安全修改，请手动调整标签。');
        }
      }
  }
}
