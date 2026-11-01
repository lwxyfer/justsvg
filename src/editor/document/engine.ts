import { prepareResize } from './resizing';
import { sanitizeSvg, SVG_NS, cleanCss } from '../security/sanitize';
import { rewriteReferences } from './references';
import { freezeAssetAppearance } from '../insert/appearance';
import {
  syncConnections,
  prepareConnectionTransform,
  connectionElement,
  detachEnd,
} from './connections';
import type { Point } from '../geometry/geometry';
import { union, transformedBounds, type Bounds } from '../geometry/geometry';
import {
  isMotionPart,
  isMotionWrapper,
  motionOriginal,
  motionWrapper,
  refreshMotionStyles,
  syncMotionGeometry,
} from './motion';

const domMatrix = (m: DOMMatrix) => new DOMMatrix([m.a, m.b, m.c, m.d, m.e, m.f]);
const drawable = new Set([
  'g',
  'svg',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'path',
  'text',
  'image',
  'use',
]);
const nonVisual = new Set([
  'defs',
  'style',
  'title',
  'desc',
  'metadata',
  'clipPath',
  'mask',
  'marker',
  'symbol',
  'linearGradient',
  'radialGradient',
  'filter',
  'pattern',
]);
const editable = new Set(
  'id opacity fill fill-opacity stroke stroke-width stroke-opacity stroke-dasharray stroke-linecap stroke-linejoin rx ry font-size font-family font-weight text-anchor letter-spacing transform x y x1 y1 x2 y2 points marker-start marker-end'.split(
    ' ',
  ),
);
const frozenProps =
  'fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color font-family font-size font-style font-weight font-variant letter-spacing word-spacing text-anchor dominant-baseline alignment-baseline baseline-shift text-decoration paint-order vector-effect visibility display clip-path clip-rule mask filter marker-start marker-mid marker-end stop-color stop-opacity'.split(
    ' ',
  );
interface Snapshot {
  xml: string;
  selection: number[][];
  label: string;
  warnings: string[];
  identities: { path: number[]; key: string }[];
}
/** Live document state: switching tabs retains the DOM and undo stack without XML round trips. */
export interface DocumentSession {
  root: SVGSVGElement | null;
  selection: SVGGraphicsElement[];
  scope: SVGGraphicsElement | null;
  warnings: string[];
  name: string;
  dirty: boolean;
  baseline: string;
  past: Snapshot[];
  future: Snapshot[];
  keys: WeakMap<Element, string>;
  nextKey: number;
  locks: Set<string>;
}
export class DocumentEngine {
  root: SVGSVGElement | null = null;
  selection: SVGGraphicsElement[] = [];
  scope: SVGGraphicsElement | null = null;
  warnings: string[] = [];
  name = 'untitled.svg';
  version = 0;
  documentRevision = 0;
  dirty = false;
  private baseline = '';
  panelVersion = 0;
  past: Snapshot[] = [];
  future: Snapshot[] = [];
  private pending: Snapshot | null = null;
  private listeners = new Set<() => void>();
  private keys = new WeakMap<Element, string>();
  private nextKey = 0;
  private locks = new Set<string>();
  private hitRegions:
    { el: SVGGraphicsElement; box: Bounds; inverse: DOMMatrix; container: boolean }[] | null = null;
  private allCache: SVGGraphicsElement[] | null = null;
  private childCache = new WeakMap<Element, SVGGraphicsElement[]>();
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.version;
  getPanelSnapshot = () => this.panelVersion;
  captureSession(): DocumentSession {
    return {
      root: this.root,
      selection: this.selection,
      scope: this.scope,
      warnings: this.warnings,
      name: this.name,
      dirty: this.dirty,
      baseline: this.baseline,
      past: this.past,
      future: this.future,
      keys: this.keys,
      nextKey: this.nextKey,
      locks: this.locks,
    };
  }
  restoreSession(session: DocumentSession) {
    Object.assign(this, session);
    this.pending = null;
    this.notify();
  }
  notify(kind: 'document' | 'geometry' | 'selection' = 'document') {
    if (kind !== 'geometry') this.panelVersion++;
    if (kind !== 'selection') this.hitRegions = null;
    if (kind === 'document') {
      this.documentRevision++;
      this.allCache = null;
      this.childCache = new WeakMap();
    }
    this.version++;
    this.listeners.forEach((fn) => fn());
  }
  key(el: Element) {
    let k = this.keys.get(el);
    if (!k) {
      k = `node-${++this.nextKey}`;
      this.keys.set(el, k);
    }
    return k;
  }
  importSvg(xml: string, name = 'untitled.svg') {
    const safe = sanitizeSvg(xml);
    this.root = safe.root;
    this.warnings = safe.warnings;
    this.name = name;
    this.selection = [];
    this.scope = null;
    this.past = [];
    this.future = [];
    this.pending = null;
    this.locks.clear();
    this.baseline = this.exportSvg();
    this.dirty = false;
    this.notify();
  }
  markExported() {
    this.baseline = this.exportSvg();
    this.dirty = false;
    this.notify('selection');
  }
  markRecovered(unexported: boolean) {
    if (unexported) this.baseline = '';
    this.dirty = unexported;
    this.notify('selection');
  }
  exportSvg() {
    return this.root ? new XMLSerializer().serializeToString(this.root) : '';
  }
  viewBox(): Bounds {
    const vb = this.root
      ?.getAttribute('viewBox')
      ?.trim()
      .split(/[\s,]+/)
      .map(Number);
    if (vb?.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0)
      return { x: vb[0], y: vb[1], width: vb[2], height: vb[3] };
    return { x: 0, y: 0, ...this.pageSize() };
  }
  pageSize(): { width: number; height: number } {
    const vb = this.root
      ?.getAttribute('viewBox')
      ?.trim()
      .split(/[\s,]+/)
      .map(Number);
    const fallback =
      vb?.length === 4 ? { width: vb[2], height: vb[3] } : { width: 800, height: 600 };
    const length = (v: string | null | undefined, fallback: number) => {
      const m = v?.match(/^([\d.]+)(px|pt|pc|in|cm|mm|q)?$/i);
      if (!m) return fallback;
      const units: Record<string, number> = {
        px: 1,
        pt: 96 / 72,
        pc: 16,
        in: 96,
        cm: 96 / 2.54,
        mm: 96 / 25.4,
        q: 96 / 101.6,
      };
      return Math.max(1, Number(m[1]) * (units[m[2]?.toLowerCase() || 'px'] || 1));
    };
    return {
      width: length(this.root?.getAttribute('width'), fallback.width),
      height: length(this.root?.getAttribute('height'), fallback.height),
    };
  }
  children(parent: Element = this.root!) {
    if (!parent) return [];
    let cached = this.childCache.get(parent);
    if (!cached) {
      cached = isMotionWrapper(parent)
        ? [motionOriginal(parent)].filter((el): el is SVGGraphicsElement => !!el)
        : [...parent.children].filter((el) => this.isDrawable(el));
      this.childCache.set(parent, cached);
    }
    return cached;
  }
  all() {
    if (!this.allCache)
      this.allCache = this.root
        ? ([...this.root.querySelectorAll('*')].filter((el) =>
            this.isDrawable(el),
          ) as SVGGraphicsElement[])
        : [];
    return this.allCache;
  }
  isDrawable(el: Element): el is SVGGraphicsElement {
    if (isMotionPart(el) || el.hasAttribute('data-sf-page-background')) return false;
    if (!drawable.has(el.localName) || el === this.root) return false;
    for (let p: Element | null = el.parentElement; p && p !== this.root; p = p.parentElement)
      if (nonVisual.has(p.localName)) return false;
    return true;
  }
  isLocked(el: Element): boolean {
    for (let p: Element | null = el; p && p !== this.root; p = p.parentElement)
      if (this.locks.has(this.key(p))) return true;
    return false;
  }
  lock(el: Element) {
    if (this.locks.has(this.key(el))) this.locks.delete(this.key(el));
    else this.locks.add(this.key(el));
    this.selection = this.selection.filter((e) => !this.isLocked(e));
    this.notify('selection');
  }
  locked(el: Element) {
    return this.locks.has(this.key(el));
  }
  select(els: SVGGraphicsElement[], additive = false) {
    const list = additive ? [...this.selection, ...els] : els;
    this.selection = [...new Set(list)].filter(
      (el) =>
        this.isDrawable(el) &&
        !this.isLocked(el) &&
        !list.some((other) => other !== el && other.contains(el)),
    );
    this.notify('selection');
  }
  hit(target: Element | null, deep = false) {
    if (!target || !this.root?.contains(target)) return null;
    let el = target;
    while (el !== this.root && !this.isDrawable(el)) el = el.parentElement!;
    if (el === this.root) return null;
    if (!deep)
      for (
        let p: Element | null = el.parentElement;
        p && p !== this.root && p !== this.scope;
        p = p.parentElement
      )
        if (this.isDrawable(p)) el = p;
    return this.isDrawable(el) && !this.isLocked(el) ? el : null;
  }
  private localBox(el: SVGGraphicsElement): Bounds {
    const frame = isMotionWrapper(el)
      ? motionOriginal(el)
      : el.localName === 'g'
        ? this.children(el).find(
            (child) => child.localName === 'rect' && child.hasAttribute('data-sf-node-frame'),
          )
        : null;
    if (frame) {
      const parent = el.getScreenCTM(),
        child = frame.getScreenCTM();
      if (parent && child)
        return transformedBounds(
          this.localBox(frame),
          domMatrix(parent).inverse().multiply(domMatrix(child)),
        );
    }
    return el.getBBox();
  }
  hitAt(point: Point, target: Element | null, deep = false) {
    if (!this.root) return null;
    if (!this.hitRegions) {
      const rootCTM = this.root.getScreenCTM();
      if (!rootCTM) return this.hit(target, deep);
      this.hitRegions = this.all()
        .flatMap((el) => {
          const ctm = el.getScreenCTM();
          if (!ctm || Math.abs(ctm.a * ctm.d - ctm.b * ctm.c) < 1e-12) return [];
          const style = getComputedStyle(el);
          if (style.visibility === 'hidden' || style.pointerEvents === 'none') return [];
          for (let p: Element | null = el; p && p !== this.root; p = p.parentElement)
            if (getComputedStyle(p).display === 'none') return [];
          try {
            return [
              {
                el,
                box: this.localBox(el),
                inverse: domMatrix(ctm).inverse().multiply(domMatrix(rootCTM)),
                container:
                  ['rect', 'g', 'svg', 'circle', 'ellipse', 'polygon', 'image', 'use'].includes(
                    el.localName,
                  ) &&
                  (el.localName !== 'g' ||
                    !!el.querySelector('rect,circle,ellipse,polygon,image,use') ||
                    [...el.querySelectorAll('path')].some((p) =>
                      /[zZ]\s*$/.test(p.getAttribute('d') || ''),
                    )),
              },
            ];
          } catch {
            return [];
          }
        })
        .reverse();
    }
    for (const { el, box, inverse, container } of this.hitRegions) {
      if (this.isLocked(el) || (this.scope && (el === this.scope || !this.scope.contains(el))))
        continue;
      const local = new DOMPoint(point.x, point.y).matrixTransform(inverse);
      if (
        el === target ||
        (target !== null && el.contains(target)) ||
        (container &&
          local.x >= box.x &&
          local.y >= box.y &&
          local.x <= box.x + box.width &&
          local.y <= box.y + box.height)
      ) {
        const hit = this.hit(el, deep);
        if (hit) return hit;
      }
    }
    return null;
  }
  bounds(el: SVGGraphicsElement): Bounds | null {
    try {
      const rootCTM = this.root?.getScreenCTM(),
        ctm = el.getScreenCTM();
      if (!rootCTM || !ctm || getComputedStyle(el).display === 'none') return null;
      const b = this.localBox(el);
      return transformedBounds(b, domMatrix(rootCTM).inverse().multiply(domMatrix(ctm)));
    } catch {
      return null;
    }
  }
  selectionBounds() {
    return union(this.selection.map((el) => this.bounds(el)).filter((b): b is Bounds => !!b));
  }
  private path(el: Element): number[] {
    const out: number[] = [];
    for (let p: Element | null = el; p && p !== this.root; p = p.parentElement)
      out.unshift([...p.parentElement!.children].indexOf(p));
    return out;
  }
  private snapshot(label: string): Snapshot {
    const identities: Snapshot['identities'] = [],
      visible = new Set<Element>(this.all());
    const walk = (parent: Element, path: number[]) => {
      [...parent.children].forEach((el, i) => {
        const next = [...path, i];
        if (visible.has(el)) identities.push({ path: next, key: this.key(el) });
        walk(el, next);
      });
    };
    if (this.root) walk(this.root, []);
    return {
      xml: this.exportSvg(),
      selection: this.selection.map((el) => this.path(el)),
      label,
      identities,
      warnings: [...this.warnings],
    };
  }
  begin(label: string) {
    if (!this.pending) this.pending = this.snapshot(label);
  }
  commit() {
    if (this.pending) syncConnections(this);
    if (this.root?.querySelector('[data-sf-motion]')) {
      syncMotionGeometry(this.root, true);
      refreshMotionStyles(this.root);
    } else this.root?.querySelectorAll('style[data-sf-motion-style]').forEach((s) => s.remove());
    if (this.pending && this.pending.xml !== this.exportSvg()) {
      this.past.push(this.pending);
      while (
        this.past.length > 80 ||
        (this.past.length > 1 && this.past.reduce((n, s) => n + s.xml.length, 0) > 25_000_000)
      )
        this.past.shift();
      this.future = [];
    }
    this.pending = null;
    this.dirty = this.exportSvg() !== this.baseline;
    this.notify();
  }
  cancel() {
    if (this.pending) {
      const s = this.pending;
      this.pending = null;
      this.restore(s);
    }
  }
  transaction(label: string, fn: () => void) {
    this.begin(label);
    try {
      fn();
      this.commit();
    } catch (e) {
      this.cancel();
      throw e;
    }
  }
  private restore(s: Snapshot) {
    const xml = new DOMParser().parseFromString(s.xml, 'image/svg+xml');
    this.root = document.importNode(xml.documentElement, true) as unknown as SVGSVGElement;
    this.scope = null;
    this.warnings = [...s.warnings];
    this.dirty = s.xml !== this.baseline;
    this.allCache = null;
    this.childCache = new WeakMap();
    for (const item of s.identities) {
      let el: Element | undefined = this.root!;
      for (const i of item.path) el = el?.children[i];
      if (el) this.keys.set(el, item.key);
    }
    this.selection = s.selection
      .map((path) => {
        let el: Element = this.root!;
        for (const i of path) {
          if (!el.children[i]) return null;
          el = el.children[i];
        }
        return el;
      })
      .filter((el): el is SVGGraphicsElement => !!el && this.isDrawable(el) && !this.isLocked(el));
    this.notify();
  }
  undo() {
    const s = this.past.pop();
    if (s) {
      this.future.push(this.snapshot(s.label));
      this.restore(s);
    }
  }
  redo() {
    const s = this.future.pop();
    if (s) {
      this.past.push(this.snapshot(s.label));
      this.restore(s);
    }
  }
  matrix(el: SVGGraphicsElement): DOMMatrix {
    let out = new DOMMatrix();
    const list = el.transform.baseVal;
    for (let i = 0; i < list.numberOfItems; i++) out = out.multiply(list.getItem(i).matrix);
    return out;
  }
  private cssTransformed(el: SVGGraphicsElement) {
    if (el.style.transform) return true;
    for (const style of this.root?.querySelectorAll('style') || []) {
      for (const rule of style.sheet?.cssRules || []) {
        if (rule instanceof CSSStyleRule && rule.style.getPropertyValue('transform')) {
          try {
            if (el.matches(rule.selectorText)) return true;
          } catch {
            /* An unsupported selector cannot apply. */
          }
        }
      }
    }
    return false;
  }
  applyWorld(el: SVGGraphicsElement, world: DOMMatrix, original: DOMMatrix = this.matrix(el)) {
    if (this.cssTransformed(el))
      throw new Error(
        '此节点使用 CSS Transform。请选择外层分组移动，或先在源码中将其转换为 SVG transform 属性。',
      );
    const p = (el.parentNode as SVGGraphicsElement).getScreenCTM(),
      r = this.root?.getScreenCTM();
    if (!p || !r) throw new Error('元素坐标系不可用。');
    const parentToRoot = domMatrix(r).inverse().multiply(domMatrix(p));
    if (Math.abs(parentToRoot.a * parentToRoot.d - parentToRoot.b * parentToRoot.c) < 1e-12)
      throw new Error('父级 Transform 不可逆，无法安全编辑。');
    const m = parentToRoot.inverse().multiply(world).multiply(parentToRoot).multiply(original);
    const nums = [m.a, m.b, m.c, m.d, m.e, m.f];
    if (!nums.every(Number.isFinite)) throw new Error('不能变换奇异矩阵。');
    prepareConnectionTransform(this, el);
    el.setAttribute('transform', `matrix(${nums.map((v) => Number(v.toFixed(7))).join(' ')})`);
  }
  translate(dx: number, dy: number, preview = false) {
    const apply = () =>
      this.selection.forEach((el) => this.applyWorld(el, new DOMMatrix().translate(dx, dy)));
    if (preview) {
      this.begin('键盘微调');
      try {
        apply();
        syncConnections(this);
        if (this.root) syncMotionGeometry(this.root);
        this.notify('geometry');
      } catch (error) {
        this.cancel();
        throw error;
      }
    } else this.transaction('移动元素', apply);
  }
  resize(width: number, height: number) {
    const b = this.selectionBounds();
    if (!b || b.width < 0.001 || b.height < 0.001)
      throw new Error('零宽或零高元素请通过线条端点属性调整。');
    if (width <= 0 || height <= 0) throw new Error('尺寸必须大于 0。');
    if (![width, height].every(Number.isFinite)) throw new Error('请输入有效尺寸。');
    this.transaction('调整元素尺寸', () => {
      const resize = prepareResize(this);
      resize(
        new DOMMatrix()
          .translate(b.x, b.y)
          .scale(width / b.width, height / b.height)
          .translate(-b.x, -b.y),
      );
    });
  }
  rotate(angle: number) {
    const b = this.selectionBounds();
    if (!b) return;
    this.transaction('旋转元素', () =>
      this.selection.forEach((el) =>
        this.applyWorld(
          el,
          new DOMMatrix()
            .translate(b.x + b.width / 2, b.y + b.height / 2)
            .rotate(angle)
            .translate(-b.x - b.width / 2, -b.y - b.height / 2),
        ),
      ),
    );
  }
  updateAttributes(attrs: Record<string, string>, preview = false) {
    const updates = { ...attrs };
    const fontSize = updates['font-size']?.trim();
    // SVG accepts a unitless font-size, while CSS validation and inline styles require a length.
    if (fontSize && /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(fontSize)) {
      const size = Number(fontSize);
      if (!Number.isFinite(size) || size <= 0) throw new Error('字号必须大于 0。');
      updates['font-size'] = `${size}px`;
    }
    for (const [name, value] of Object.entries(updates)) {
      if (!editable.has(name)) throw new Error(`不支持编辑属性 ${name}`);
      if (
        name === 'id' &&
        value &&
        (!/^[A-Za-z_][\w:.-]*$/.test(value) ||
          [this.root!, ...this.root!.querySelectorAll('[id]')].some(
            (el) => !this.selection.includes(el as SVGGraphicsElement) && el.id === value,
          ))
      )
        throw new Error('ID 必须唯一，且以字母或下划线开头。');
      if (name === 'id' && this.selection.length !== 1) throw new Error('请单选后修改 ID。');
      if (
        name === 'id' &&
        this.selection[0].id &&
        this.root &&
        [...this.root.querySelectorAll('*')].some(
          (el) =>
            [...el.attributes].some(
              (a) => a.localName !== 'id' && a.value.includes(`#${this.selection[0].id}`),
            ) ||
            (el.localName === 'style' && el.textContent?.includes(`#${this.selection[0].id}`)),
        )
      )
        throw new Error('此 ID 被样式或内部资源引用。为保留引用，请在源文件中修改。');
      if (/url\s*\(|[\\]/i.test(value) && !cleanCss(`${name}:${value}`, true, new Set()))
        throw new Error('仅允许安全的内部 URL 引用。');
      if (
        name !== 'id' &&
        name !== 'transform' &&
        value &&
        !['x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'rx', 'ry'].includes(name) &&
        typeof CSS !== 'undefined' &&
        !CSS.supports(name, value)
      )
        throw new Error(`属性 ${name} 的值无效。`);
      if (name === 'transform' && this.selection.some((el) => this.cssTransformed(el)))
        throw new Error('此节点的 Transform 由 CSS 控制，请在源码中修改。');
      if (name === 'transform' && value) {
        const probe = document.createElementNS(SVG_NS, 'g');
        probe.setAttribute('transform', value);
        if (!probe.transform.baseVal.numberOfItems) throw new Error('Transform 语法无效。');
      }
    }
    const apply = () =>
      this.selection.forEach((el) => {
        const line = connectionElement(el);
        if (line) {
          if (['x1', 'y1', 'points', 'transform'].some((name) => name in updates))
            detachEnd(line, 'start');
          if (['x2', 'y2', 'points', 'transform'].some((name) => name in updates))
            detachEnd(line, 'end');
        }
        return Object.entries(updates).forEach(([name, value]) => {
          const target =
            isMotionWrapper(el) && !['id', 'transform'].includes(name) ? motionOriginal(el)! : el;
          if (value === '') {
            target.removeAttribute(name);
            if (name !== 'id' && name !== 'transform') target.style.removeProperty(name);
          } else {
            target.setAttribute(name, value);
            if (
              name !== 'id' &&
              name !== 'transform' &&
              !['x', 'y', 'x1', 'x2', 'y1', 'y2', 'points', 'rx', 'ry'].includes(name)
            )
              target.style.setProperty(name, value, 'important');
          }
        });
      });
    if (preview) {
      this.begin('调整颜色');
      try {
        apply();
        if (this.root) syncMotionGeometry(this.root, true);
        this.notify('geometry');
      } catch (error) {
        this.cancel();
        throw error;
      }
    } else this.transaction('修改属性', apply);
  }
  textStructure(el: SVGGraphicsElement) {
    if (el.localName !== 'text')
      return { editable: false, reason: '请选择文字元素。', parts: [] as Element[] };
    if (
      el.querySelector('textPath') ||
      [...el.querySelectorAll('*')].some((n) => n.localName !== 'tspan') ||
      el.querySelector('tspan tspan')
    )
      return {
        editable: false,
        reason: '复杂文本结构仅支持整体变换；请在源码中编辑内容。',
        parts: [] as Element[],
      };
    const spans = [...el.children];
    if (
      spans.length &&
      [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
    )
      return {
        editable: false,
        reason: '混合文本与 tspan 布局不能安全重写，请分别在图层中选择或编辑源码。',
        parts: [] as Element[],
      };
    const parts = spans.length ? spans : [el];
    const positioned = parts.some((p) =>
      ['x', 'y', 'dx', 'dy', 'rotate'].some(
        (a) => (p.getAttribute(a) || '').trim().split(/[\s,]+/).length > 1,
      ),
    );
    return {
      editable: !positioned,
      reason: positioned ? '逐字定位的文本不能安全改写。' : '',
      parts,
    };
  }
  updateText(el: SVGGraphicsElement, values: string[]) {
    const info = this.textStructure(el);
    if (!info.editable) throw new Error(info.reason);
    if (values.length !== info.parts.length)
      throw new Error('请保留原有 tspan 数量，逐段修改文字。');
    this.transaction('编辑文字', () =>
      info.parts.forEach((part, i) => {
        part.textContent = values[i];
      }),
    );
  }
  multiline(el: SVGGraphicsElement, text: string, lineHeight: number) {
    if (el.children.length) throw new Error('已有 tspan 时请逐段编辑，避免覆盖原始布局。');
    this.transaction('创建多行文字', () => {
      const x = el.getAttribute('x') || '0';
      el.textContent = '';
      text.split('\n').forEach((line, i) => {
        const span = document.createElementNS(SVG_NS, 'tspan');
        span.setAttribute('x', x);
        span.setAttribute('dy', i ? String(lineHeight) : '0');
        span.textContent = line;
        el.append(span);
      });
    });
  }
  lineHeight(el: SVGGraphicsElement, value: number) {
    const info = this.textStructure(el);
    if (!info.editable || info.parts.length < 2)
      throw new Error('当前文字没有可调整的多行 tspan。');
    this.transaction('修改行距', () =>
      info.parts.forEach((p, i) => {
        if (!i) return;
        p.removeAttribute('y');
        p.setAttribute('dy', String(value));
      }),
    );
  }
  remove() {
    this.transaction('删除元素', () => {
      this.selection.forEach((el) => (motionWrapper(el) || el).remove());
      if (this.scope && !this.root!.contains(this.scope)) this.scope = null;
      this.selection = [];
    });
  }
  hide(el: SVGGraphicsElement) {
    this.transaction('切换可见性', () => {
      if (getComputedStyle(el).display === 'none')
        el.style.setProperty('display', 'inline', 'important');
      else el.style.setProperty('display', 'none', 'important');
    });
  }
  rename(el: SVGGraphicsElement, name: string) {
    this.transaction('重命名图层', () => el.setAttribute('data-label', name));
  }
  private freeze(els: Element[]) {
    const saved = els
      .flatMap((el) => [el, ...el.querySelectorAll('*')])
      .map((el) => ({
        el,
        values: frozenProps.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]),
      }));
    return () =>
      saved.forEach(({ el, values }) =>
        values.forEach(([p, v]) => {
          if (isMotionPart(el) || (isMotionWrapper(el) && p === 'opacity')) return;
          if (v)
            (el as SVGElement).style.setProperty(
              p,
              v.replace(/url\(["']?[^#)]*#/g, 'url(#'),
              'important',
            );
        }),
      );
  }
  private requireSvgTransforms() {
    for (const el of this.selection.flatMap((el) => [
      el,
      ...el.querySelectorAll<SVGGraphicsElement>('*'),
    ]))
      if (this.cssTransformed(el))
        throw new Error('包含 CSS Transform 的结构暂不支持重新分组，以保留原始外观。');
  }
  group() {
    this.requireSvgTransforms();
    const els = this.selection;
    if (els.length < 2) throw new Error('至少选择两个同级元素。');
    const parent = els[0].parentElement!;
    if (els.some((el) => el.parentElement !== parent))
      throw new Error('请在相同分组层级中组合元素。');
    this.transaction('组合元素', () => {
      const frozen = this.freeze(els);
      const ordered = [...parent.children].filter((el) => els.includes(el as SVGGraphicsElement));
      const g = document.createElementNS(SVG_NS, 'g');
      parent.insertBefore(g, ordered[0]);
      ordered.forEach((el) => g.append(el));
      frozen();
      this.selection = [g];
    });
  }
  ungroup() {
    this.requireSvgTransforms();
    if (!this.selection.length || this.selection.some((el) => el.localName !== 'g'))
      throw new Error('请选择一个或多个分组。');
    // Compositing effects on a group cannot be distributed to overlapping children without changing appearance.
    for (const g of this.selection) {
      if (isMotionWrapper(g)) throw new Error('请先在动效面板移除动效，再取消此分组。');
      if (
        g.id &&
        [...this.root!.querySelectorAll('[data-sf-start-node],[data-sf-end-node]')].some(
          (line) =>
            line.getAttribute('data-sf-start-node') === `#${g.id}` ||
            line.getAttribute('data-sf-end-node') === `#${g.id}`,
        )
      )
        throw new Error('此分组有关联箭头。请先在线条属性中解除关联，再取消分组。');
      const s = getComputedStyle(g);
      if (Number(s.opacity) !== 1 || [s.filter, s.clipPath, s.mask].some((v) => v && v !== 'none'))
        throw new Error('分组包含透明度、滤镜、裁剪或蒙版。为保持外观，暂不支持取消此分组。');
    }
    this.transaction('取消分组', () => {
      const next: SVGGraphicsElement[] = [];
      for (const g of this.selection) {
        const children = this.children(g),
          frozen = this.freeze(children),
          m = this.matrix(g);
        for (const child of children) {
          const cm = m.multiply(this.matrix(child));
          child.setAttribute(
            'transform',
            `matrix(${[cm.a, cm.b, cm.c, cm.d, cm.e, cm.f].join(' ')})`,
          );
        }
        g.replaceWith(...g.childNodes);
        frozen();
        next.push(...children);
      }
      this.selection = next;
    });
  }
  align(
    kind:
      | 'left'
      | 'center'
      | 'right'
      | 'top'
      | 'middle'
      | 'bottom'
      | 'horizontal'
      | 'vertical'
      | 'width'
      | 'height',
  ) {
    const entries = this.selection
      .map((el) => ({ el, b: this.bounds(el) }))
      .filter((v): v is { el: SVGGraphicsElement; b: Bounds } => !!v.b);
    const all = union(entries.map((v) => v.b));
    if (!all || entries.length < 2) return;
    this.transaction('对齐 / 分布', () => {
      if (kind === 'horizontal' || kind === 'vertical') {
        if (entries.length < 3) throw new Error('均匀分布需要至少三个元素。');
        const axis = kind === 'horizontal' ? 'x' : 'y',
          size = axis === 'x' ? 'width' : 'height';
        entries.sort((a, b) => a.b[axis] - b.b[axis]);
        const gap = (all[size] - entries.reduce((n, v) => n + v.b[size], 0)) / (entries.length - 1);
        let position = all[axis];
        entries.forEach(({ el, b }) => {
          this.applyWorld(
            el,
            new DOMMatrix().translate(
              axis === 'x' ? position - b.x : 0,
              axis === 'y' ? position - b.y : 0,
            ),
          );
          position += b[size] + gap;
        });
        return;
      }
      entries.forEach(({ el, b }) => {
        let dx = 0,
          dy = 0;
        if (kind === 'left') dx = all.x - b.x;
        if (kind === 'center') dx = all.x + all.width / 2 - b.x - b.width / 2;
        if (kind === 'right') dx = all.x + all.width - b.x - b.width;
        if (kind === 'top') dy = all.y - b.y;
        if (kind === 'middle') dy = all.y + all.height / 2 - b.y - b.height / 2;
        if (kind === 'bottom') dy = all.y + all.height - b.y - b.height;
        if (kind === 'width' || kind === 'height') {
          if (b.width < 0.001 || b.height < 0.001) throw new Error('零尺寸元素无法统一大小。');
          const value =
            kind === 'width'
              ? Math.max(...entries.map((e) => e.b.width))
              : Math.max(...entries.map((e) => e.b.height));
          this.applyWorld(
            el,
            new DOMMatrix()
              .translate(b.x, b.y)
              .scale(
                kind === 'width' ? value / b.width : 1,
                kind === 'height' ? value / b.height : 1,
              )
              .translate(-b.x, -b.y),
          );
        } else this.applyWorld(el, new DOMMatrix().translate(dx, dy));
      });
    });
  }
  reorder(kind: 'front' | 'back' | 'forward' | 'backward') {
    this.transaction('调整层级', () => {
      const els = [...this.selection].sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      if (kind === 'back' || kind === 'forward') els.reverse();
      for (const el of els) {
        const p = el.parentElement!;
        if (kind === 'front') p.append(el);
        if (kind === 'back') p.prepend(el);
        if (kind === 'forward' && el.nextElementSibling) el.nextElementSibling.after(el);
        if (kind === 'backward' && el.previousElementSibling) el.previousElementSibling.before(el);
      }
    });
  }
  copy(): string {
    this.requireSvgTransforms();
    if (!this.root || !this.selection.length) return '';
    // Include definitions and stylesheet so internal resources remain valid when pasted in another document.
    const clone = this.root.cloneNode(false) as SVGSVGElement;
    // The target document already supplies root transforms and compositing effects.
    for (const property of ['transform', 'opacity', 'filter', 'mask', 'clip-path']) {
      clone.removeAttribute(property);
      clone.style.removeProperty(property);
    }
    for (const el of this.root.children)
      if (['defs', 'style'].includes(el.localName)) clone.append(el.cloneNode(true));
    for (const el of this.selection) {
      const c = el.cloneNode(true) as SVGGraphicsElement;
      const matrix = domMatrix(this.root.getScreenCTM()!)
        .inverse()
        .multiply(domMatrix(el.getScreenCTM()!));
      c.setAttribute(
        'transform',
        `matrix(${[matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f].join(' ')})`,
      );
      clone.append(c);
    }
    // Inline computed inherited styles to make copying out of a group reliable.
    const copied = [...clone.children].filter((el) => !['defs', 'style'].includes(el.localName));
    this.selection.forEach((el, i) => {
      const originals = [el, ...el.querySelectorAll('*')],
        copies = [copied[i], ...copied[i].querySelectorAll('*')];
      originals.forEach((o, j) =>
        frozenProps.forEach((p) => {
          if (isMotionPart(o) || (isMotionWrapper(o) && p === 'opacity')) return;
          const v = getComputedStyle(o).getPropertyValue(p);
          if (v)
            (copies[j] as SVGElement).style.setProperty(
              p,
              v.replace(/url\(["']?[^#)]*#/g, 'url(#'),
              'important',
            );
        }),
      );
    });
    refreshMotionStyles(clone);
    return new XMLSerializer().serializeToString(clone);
  }
  updateIcon(color: string, strokeWidth?: number, preview = false) {
    if (
      !CSS.supports('color', color) ||
      (strokeWidth !== undefined && (!Number.isFinite(strokeWidth) || strokeWidth <= 0))
    )
      throw new Error('请输入有效颜色和正数描边宽度。');
    if (this.selection.length !== 1 || this.selection[0].getAttribute('data-monochrome') !== 'true')
      throw new Error('仅对内置单色图标提供整体改色。');
    const nodes = [
      this.selection[0],
      ...this.selection[0].querySelectorAll<SVGGraphicsElement>('*'),
    ].filter((el) => this.isDrawable(el));
    const targets = nodes.map((el) => ({
      el,
      stroke: getComputedStyle(el).stroke,
      fill: getComputedStyle(el).fill,
    }));
    const apply = () => {
      for (const { el, stroke, fill } of targets) {
        if (stroke !== 'none') {
          el.setAttribute('stroke', color);
          el.style.setProperty('stroke', color, 'important');
          if (strokeWidth !== undefined) {
            el.setAttribute('stroke-width', String(strokeWidth));
            el.style.setProperty('stroke-width', String(strokeWidth), 'important');
          }
        }
        if (fill !== 'none' && el.localName !== 'g' && el.localName !== 'svg') {
          el.setAttribute('fill', color);
          el.style.setProperty('fill', color, 'important');
        }
      }
    };
    if (preview) {
      this.begin('修改图标样式');
      try {
        apply();
        this.notify('geometry');
      } catch (error) {
        this.cancel();
        throw error;
      }
    } else this.transaction('修改图标样式', apply);
  }
  applySource(xml: string) {
    const safe = sanitizeSvg(xml);
    this.transaction('应用 SVG 源码', () => {
      this.root = safe.root;
      this.selection = [];
      this.scope = null;
      this.warnings = safe.warnings;
    });
  }
  insertSvg(
    xml: string,
    point: Point,
    options: {
      label?: string;
      width?: number;
      height?: number;
      icon?: boolean;
      flatten?: boolean;
    } = {},
  ) {
    if (!this.root) throw new Error('请先打开文档。');
    const safe = sanitizeSvg(xml),
      incoming = safe.root;
    const parent = this.scope || this.root;
    if (this.isLocked(parent)) throw new Error('当前分组已锁定，请退出分组后插入。');
    if (
      getComputedStyle(parent).display === 'none' ||
      getComputedStyle(parent).visibility === 'hidden'
    )
      throw new Error('当前分组不可见，请退出分组后插入。');
    const ctm = parent.getScreenCTM();
    if (!ctm || Math.abs(ctm.a * ctm.d - ctm.b * ctm.c) < 1e-12)
      throw new Error('当前分组坐标不可逆，请退出分组后插入。');
    if (this.root.querySelectorAll('*').length + incoming.querySelectorAll('*').length > 14990)
      throw new Error('插入后文档节点将超出 15,000 限制。');
    const view = incoming
      .getAttribute('viewBox')
      ?.trim()
      .split(/[\s,]+/)
      .map(Number);
    const sourceWidth = parseFloat(incoming.getAttribute('width') || '') || view?.[2] || 32;
    const sourceHeight = parseFloat(incoming.getAttribute('height') || '') || view?.[3] || 32;
    if (!incoming.hasAttribute('viewBox'))
      incoming.setAttribute('viewBox', `0 0 ${sourceWidth} ${sourceHeight}`);
    incoming.setAttribute('width', String(options.width || sourceWidth));
    incoming.setAttribute('height', String(options.height || sourceHeight));
    freezeAssetAppearance(incoming);
    this.transaction('插入 ' + (options.label || 'SVG 图标'), () => {
      const id = `sf-insert-${crypto.randomUUID()}`,
        remap = new Map<string, string>();
      for (const el of [incoming, ...incoming.querySelectorAll('[id]')])
        if (el.id) {
          const old = el.id;
          const replacement = `${id}-${remap.size}`;
          remap.set(old, replacement);
          el.id = replacement;
        }
      rewriteReferences(incoming, remap, id);
      const visual = [...incoming.children].filter((el) => this.isDrawable(el));
      // Built-in, unit-scale native assets can shed the viewport. Multi-node templates
      // retain one editable group; custom SVGs keep their original nested viewport.
      const flatten =
        options.flatten &&
        visual.length >= 1 &&
        (!view ||
          (view[0] === 0 && view[1] === 0 && view[2] === sourceWidth && view[3] === sourceHeight));
      let target: SVGGraphicsElement;
      if (flatten && visual.length === 1) {
        target = visual[0] as SVGGraphicsElement;
        for (const other of [...incoming.children]) if (other !== target) parent.append(other);
        parent.append(target);
      } else if (flatten) {
        target = document.createElementNS(SVG_NS, 'g');
        target.append(...incoming.childNodes);
        parent.append(target);
      } else {
        target = document.createElementNS(SVG_NS, 'g');
        target.append(incoming);
        parent.append(target);
      }
      target.id = id;
      target.setAttribute('data-label', options.label || 'SVG 图标');
      if (options.icon) {
        target.setAttribute('data-icon', 'true');
        if (options.label !== '自定义 SVG 图标' && options.flatten === false)
          target.setAttribute('data-monochrome', 'true');
      }
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = options.label || 'SVG 图标';
      target.prepend(title);
      this.selection = [target];
      const bounds = this.bounds(target);
      if (!bounds) throw new Error('插入图形没有有效边界。');
      this.applyWorld(
        target,
        new DOMMatrix().translate(
          point.x - bounds.x - bounds.width / 2,
          point.y - bounds.y - bounds.height / 2,
        ),
      );
      if (new TextEncoder().encode(this.exportSvg()).length > 5 * 1024 * 1024)
        throw new Error('插入后文档超过 5 MB，请使用更简单的图标。');
      this.warnings = [...new Set([...this.warnings, ...safe.warnings])];
    });
  }
  paste(xml: string) {
    if (!this.root) return;
    const safe = sanitizeSvg(xml);
    this.warnings = [...new Set([...this.warnings, ...safe.warnings])];
    this.transaction('粘贴元素', () => {
      const fragment = safe.root;
      const remap = new Map<string, string>();
      for (const el of fragment.querySelectorAll('[id]')) {
        const old = el.id;
        const id = `${old}-copy-${++this.nextKey}`;
        remap.set(old, id);
        el.id = id;
      }
      const wrapper = document.createElementNS(SVG_NS, 'g');
      const scope = `pasted-${++this.nextKey}`;
      wrapper.id = scope;
      // Keep root presentation inheritance, while the existing document owns the viewport.
      for (const attr of [...fragment.attributes])
        if (
          !['xmlns', 'width', 'height', 'viewBox', 'id', 'version', 'preserveAspectRatio'].includes(
            attr.name,
          ) &&
          !attr.name.startsWith('xmlns:')
        )
          wrapper.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
      rewriteReferences(fragment, remap, scope);
      wrapper.append(...fragment.childNodes);
      this.root!.append(wrapper);
      this.selection = [wrapper];
      this.applyWorld(wrapper, new DOMMatrix().translate(16, 16));
    });
  }
}
export const engine = new DocumentEngine();
