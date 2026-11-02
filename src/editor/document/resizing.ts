import type { DocumentEngine } from './engine';
import { isMotionWrapper, motionOriginal } from './motion';
import { prepareTextFrame, textFrame } from './textFrame';

const matrix = (m: DOMMatrix) => new DOMMatrix([m.a, m.b, m.c, m.d, m.e, m.f]);
const invertible = (m: DOMMatrix) => Math.abs(m.a * m.d - m.b * m.c) > 1e-12;

/** Capture once per gesture: every preview is derived from the same native geometry. */
export function prepareResize(engine: DocumentEngine, selection = engine.selection) {
  const root = engine.root!;
  const rootCTM = root.getScreenCTM();
  if (!rootCTM) throw new Error('元素坐标系不可用。');
  const toRoot = (el: SVGGraphicsElement) => {
    const ctm = el.getScreenCTM();
    if (!ctm) throw new Error('元素坐标系不可用。');
    const result = matrix(rootCTM).inverse().multiply(matrix(ctm));
    if (!invertible(result)) throw new Error('元素坐标不可逆，无法调整尺寸。');
    return result;
  };
  const leaf = (el: SVGGraphicsElement) => {
    const original = engine.matrix(el),
      localToRoot = toRoot(el),
      box = textFrame(el) || el.getBBox();
    const center = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2).matrixTransform(
      localToRoot,
    );
    return (world: DOMMatrix) => {
      const next = center.matrixTransform(world);
      engine.applyWorld(
        el,
        new DOMMatrix().translate(next.x - center.x, next.y - center.y),
        original,
      );
    };
  };
  const rectangle = (el: SVGGraphicsElement, owner = el) => {
    const rect = el as SVGRectElement;
    const x = rect.x.baseVal.value,
      y = rect.y.baseVal.value;
    const width = rect.width.baseVal.value,
      height = rect.height.baseVal.value;
    const localToRoot = toRoot(rect),
      original = engine.matrix(owner);
    const origin = new DOMPoint(x, y).matrixTransform(localToRoot);
    // CSS-controlled geometry must not receive ineffective presentation attributes.
    for (const style of root.querySelectorAll('style'))
      for (const rule of style.sheet?.cssRules || [])
        if (
          rule instanceof CSSStyleRule &&
          (rule.style.width || rule.style.height) &&
          el.matches(rule.selectorText)
        )
          throw new Error('此矩形尺寸由 CSS class 控制，请在源码中调整。');
    if (rect.style.width || rect.style.height)
      throw new Error('此矩形尺寸由 CSS 控制，请在源码中调整。');
    return (world: DOMMatrix) => {
      const local = localToRoot.inverse().multiply(world).multiply(localToRoot);
      const sx = Math.hypot(local.a, local.b),
        sy = Math.hypot(local.c, local.d);
      const next = origin.matrixTransform(world);
      engine.applyWorld(
        owner,
        new DOMMatrix().translate(next.x - origin.x, next.y - origin.y),
        original,
      );
      if (owner !== el) rect.setAttribute('data-sf-node-frame', 'true');
      rect.setAttribute('width', String(width * sx));
      rect.setAttribute('height', String(height * sy));
    };
  };
  const build = (el: SVGGraphicsElement, preserveText = false): ((world: DOMMatrix) => void) => {
    if (isMotionWrapper(el)) {
      const original = motionOriginal(el);
      if (original) return build(original, preserveText);
    }
    if (el.localName === 'rect' || el.localName === 'image') return rectangle(el);
    if (el.localName === 'text' && !preserveText) return prepareTextFrame(engine, el);
    if (el.localName === 'text' || el.localName === 'use') return leaf(el);
    if (
      ['g', 'svg'].includes(el.localName) &&
      (el.getAttribute('data-monochrome') !== 'true' || el.querySelector('text'))
    ) {
      const children = engine.children(el),
        bounds = el.getBBox();
      // A dominant background rectangle is the node's frame, not an instruction to scale its content.
      const frames = children
        .filter((child) => child.localName === 'rect')
        .map((child) => ({ child, b: engine.bounds(child) }));
      const node = engine.bounds(el);
      const frame =
        node &&
        (frames.find(({ child }) => child.hasAttribute('data-sf-node-frame')) ||
          frames.find(
            ({ b }) => b && b.width >= node.width * 0.9 && b.height >= node.height * 0.9,
          ));
      if (frame) return rectangle(frame.child, el);
      if (bounds.width > 0 && bounds.height > 0 && children.length) {
        const updates = children.map((child) =>
          child.getAttribute('data-monochrome') === 'true' ? leaf(child) : build(child, true),
        );
        return (world) => updates.forEach((update) => update(world));
      }
    }
    if (el.localName === 'ellipse') {
      const ellipse = el as SVGEllipseElement,
        localToRoot = toRoot(el),
        original = engine.matrix(el);
      const center = new DOMPoint(
        ellipse.cx.baseVal.value,
        ellipse.cy.baseVal.value,
      ).matrixTransform(localToRoot);
      const rx = ellipse.rx.baseVal.value,
        ry = ellipse.ry.baseVal.value;
      return (world) => {
        const local = localToRoot.inverse().multiply(world).multiply(localToRoot),
          next = center.matrixTransform(world);
        engine.applyWorld(
          el,
          new DOMMatrix().translate(next.x - center.x, next.y - center.y),
          original,
        );
        ellipse.setAttribute('rx', String(rx * Math.hypot(local.a, local.b)));
        ellipse.setAttribute('ry', String(ry * Math.hypot(local.c, local.d)));
      };
    }
    // Freeform paths and standalone icons retain native transforms; lock painted stroke widths.
    const original = engine.matrix(el);
    const strokes = [el, ...el.querySelectorAll<SVGGraphicsElement>('*')]
      .filter((node) => engine.isDrawable(node) && !['g', 'svg', 'text'].includes(node.localName))
      .map((node) => {
        const style = getComputedStyle(node),
          ctm = node.getScreenCTM()!;
        const svgScreen = matrix(rootCTM),
          viewport = root.getCTM();
        const baseline = (viewport ? matrix(viewport) : new DOMMatrix())
          .multiply(svgScreen.inverse())
          .multiply(matrix(ctm));
        return {
          node,
          width:
            parseFloat(style.strokeWidth) *
            Math.sqrt(Math.abs(baseline.a * baseline.d - baseline.b * baseline.c)),
          fixed: style.vectorEffect === 'non-scaling-stroke',
          stroke: style.stroke,
        };
      });
    return (world) => {
      engine.applyWorld(el, world, original);
      for (const { node, width, fixed, stroke } of strokes) {
        if (fixed || stroke === 'none') continue;
        node.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
        node.style.setProperty('stroke-width', String(width), 'important');
      }
    };
  };
  const updates = selection.map((el) => build(el));
  return (world: DOMMatrix) => updates.forEach((update) => update(world));
}
