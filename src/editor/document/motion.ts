import type { DocumentEngine } from './engine';
const NS = 'http://www.w3.org/2000/svg';
export const motionAttribute = 'data-sf-motion';
const styleAttribute = 'data-sf-motion-style';
export interface MotionConfig {
  type: 'flow' | 'pulse' | 'blink';
  duration: number;
  amount: number;
  reverse: boolean;
  dash: number;
  gap: number;
  enabled: boolean;
}
export const defaultMotion = (type: MotionConfig['type']): MotionConfig => ({
  type,
  duration: type === 'pulse' ? 2.4 : 2,
  amount: type === 'blink' ? 0.6 : 0.35,
  reverse: false,
  dash: 10,
  gap: 8,
  enabled: true,
});
export function decodeMotion(source: string | null): MotionConfig | null {
  if (!source || source.length > 512) return null;
  try {
    const c: unknown = JSON.parse(source);
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    const v = c as Record<string, unknown>;
    if (
      !['flow', 'pulse', 'blink'].includes(String(v.type)) ||
      typeof v.duration !== 'number' ||
      !Number.isFinite(v.duration) ||
      v.duration < 1 ||
      v.duration > 20 ||
      typeof v.amount !== 'number' ||
      !Number.isFinite(v.amount) ||
      v.amount < 0.1 ||
      v.amount > 0.75 ||
      typeof v.reverse !== 'boolean' ||
      typeof v.enabled !== 'boolean' ||
      typeof v.dash !== 'number' ||
      !Number.isFinite(v.dash) ||
      v.dash < 2 ||
      v.dash > 40 ||
      typeof v.gap !== 'number' ||
      !Number.isFinite(v.gap) ||
      v.gap < 2 ||
      v.gap > 40
    )
      return null;
    return {
      type: v.type as MotionConfig['type'],
      duration: v.duration,
      amount: v.amount,
      reverse: v.reverse,
      dash: v.dash,
      gap: v.gap,
      enabled: v.enabled,
    };
  } catch {
    return null;
  }
}
export const isMotionPart = (el: Element) =>
  (el.hasAttribute('data-sf-motion-overlay') || el.hasAttribute('data-sf-motion-base')) &&
  !!el.parentElement?.hasAttribute(motionAttribute);
export const isMotionWrapper = (el: Element | null): boolean =>
  !!el && el.localName === 'g' && el.hasAttribute(motionAttribute);
export function motionOriginal(wrapper: Element): SVGGraphicsElement | null {
  const children = [...wrapper.children].filter((c) => !['title', 'desc'].includes(c.localName));
  const first = children[0];
  if (first?.hasAttribute('data-sf-motion-base'))
    return (first.children[0] as SVGGraphicsElement) || null;
  return (first as SVGGraphicsElement) || null;
}
export function motionWrapper(el: SVGGraphicsElement): SVGGElement | null {
  if (isMotionWrapper(el)) return el as SVGGElement;
  const parent = el.parentElement;
  if (parent && isMotionWrapper(parent) && motionOriginal(parent) === el)
    return parent as unknown as SVGGElement;
  if (
    parent?.hasAttribute('data-sf-motion-base') &&
    parent.parentElement &&
    isMotionWrapper(parent.parentElement) &&
    motionOriginal(parent.parentElement) === el
  )
    return parent.parentElement as unknown as SVGGElement;
  return null;
}
const strokeTags = ['path', 'line', 'polyline'];
export function flowTarget(el: SVGGraphicsElement): SVGGraphicsElement | null {
  const wrapper = motionWrapper(el);
  const original = wrapper ? motionOriginal(wrapper)! : el;
  if (strokeTags.includes(original.localName)) return original;
  if (original.localName !== 'g') return null;
  const shapes = [
    ...original.querySelectorAll<SVGGraphicsElement>(
      'path,line,polyline,rect,circle,ellipse,polygon,image,use',
    ),
  ].filter((n) => !n.closest('defs') && !isMotionPart(n));
  return shapes.length === 1 && strokeTags.includes(shapes[0].localName) ? shapes[0] : null;
}
function validWrapper(el: Element): el is SVGGElement {
  if (
    !isMotionWrapper(el) ||
    !/^[A-Za-z_][\w-]{0,160}$/.test(el.id) ||
    !decodeMotion(el.getAttribute(motionAttribute))
  )
    return false;
  const original = motionOriginal(el);
  if (
    !original ||
    ![
      'g',
      'rect',
      'circle',
      'ellipse',
      'polygon',
      'path',
      'line',
      'polyline',
      'text',
      'image',
      'use',
      'svg',
    ].includes(original.localName)
  )
    return false;
  const children = [...el.children].filter((n) => !['title', 'desc'].includes(n.localName));
  return decodeMotion(el.getAttribute(motionAttribute))!.type === 'flow'
    ? children.length === 2 &&
        children[0].hasAttribute('data-sf-motion-base') &&
        children[0].children.length === 1 &&
        children[1].hasAttribute('data-sf-motion-overlay') &&
        children[1].localName === original.localName &&
        strokeTags.includes(original.localName)
    : children.length === 1;
}
export function motionStyles(root: Element) {
  const rules: string[] = [];
  for (const el of root.querySelectorAll(`[${motionAttribute}]`)) {
    if (!validWrapper(el)) continue;
    const c = decodeMotion(el.getAttribute(motionAttribute))!,
      id = el.id,
      name = `sf_effect_${id}`;
    if (c.type === 'flow') {
      rules.push(
        `#${id}>[data-sf-motion-base]{opacity:${c.enabled ? 0.2 : 1}!important}#${id}>[data-sf-motion-overlay]{pointer-events:none!important;display:${c.enabled ? 'inline' : 'none'}!important;stroke-dasharray:${c.dash} ${c.gap}!important;animation:${c.enabled ? `${name} ${c.duration}s linear infinite${c.reverse ? ' reverse' : ''}` : 'none'}}`,
      );
      if (c.enabled)
        rules.push(
          `@keyframes ${name}{from{stroke-dashoffset:0}to{stroke-dashoffset:-${c.dash + c.gap}}}`,
        );
    } else {
      rules.push(
        `#${id}{animation:${c.enabled ? `${name} ${c.duration}s ease-in-out infinite` : 'none'}}`,
      );
      if (c.enabled)
        rules.push(
          `@keyframes ${name}{${c.type === 'pulse' ? `0%,100%{opacity:1}50%{opacity:${1 - c.amount}}` : `0%,30%,100%{opacity:1}45%,65%{opacity:${1 - c.amount}}`}}`,
        );
    }
    rules.push(
      `@media (prefers-reduced-motion:reduce){#${id},#${id}>[data-sf-motion-overlay]{animation:none!important}${c.type === 'flow' ? `#${id}>[data-sf-motion-base]{opacity:1!important}#${id}>[data-sf-motion-overlay]{display:none!important}` : ''}}`,
    );
  }
  return rules.join('\n');
}
/** Only exact, regenerated application CSS bypasses generic @rule stripping. Never trust a marker. */
export function prepareMotionImport(root: Element, warnings: Set<string>) {
  const canonical = motionStyles(root);
  for (const style of root.querySelectorAll(`style[${styleAttribute}]`)) {
    if (canonical && style.textContent === canonical) style.remove();
    else {
      style.removeAttribute(styleAttribute);
      warnings.add('已移除不匹配的动效样式，将按有效配置重新生成。');
    }
  }
  for (const el of root.querySelectorAll(`[${motionAttribute}]`)) {
    if (!validWrapper(el)) {
      el.removeAttribute(motionAttribute);
      warnings.add('已移除无效的动效配置，保留静态图形。');
    }
  }
}
export function refreshMotionStyles(root: Element) {
  const css = motionStyles(root),
    styles = [...root.querySelectorAll<SVGStyleElement>(`style[${styleAttribute}]`)];
  const style = styles.shift();
  styles.forEach((s) => s.remove());
  if (!css) {
    style?.remove();
    return;
  }
  if (style) {
    if (style.textContent !== css) style.textContent = css;
    return;
  }
  const created = document.createElementNS(NS, 'style');
  created.setAttribute(styleAttribute, '1');
  created.textContent = css;
  root.append(created);
}
const geometry = ['d', 'points', 'x1', 'y1', 'x2', 'y2', 'transform', 'pathLength', 'x', 'y'];
const appearance = [
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'opacity',
  'visibility',
  'vector-effect',
  'marker-start',
  'marker-mid',
  'marker-end',
  'clip-path',
  'mask',
  'filter',
];
export function syncMotionGeometry(root: Element, appearanceToo = false) {
  for (const wrapper of root.querySelectorAll<SVGGElement>(`[${motionAttribute}]`)) {
    const c = decodeMotion(wrapper.getAttribute(motionAttribute));
    if (c?.type !== 'flow') continue;
    const original = motionOriginal(wrapper),
      overlay = [...wrapper.children].find((n) => n.hasAttribute('data-sf-motion-overlay')) as
        SVGElement | undefined;
    if (!original || !overlay) continue;
    for (const attr of geometry) {
      const value = original.getAttribute(attr);
      if (value === null) overlay.removeAttribute(attr);
      else if (overlay.getAttribute(attr) !== value) overlay.setAttribute(attr, value);
    }
    if (appearanceToo && original.isConnected) {
      const computed = getComputedStyle(original);
      for (const property of appearance) {
        const value = (
          property === 'visibility' && computed.display === 'none'
            ? 'hidden'
            : computed.getPropertyValue(property)
        ).replace(/url\(["']?[^#)]*#/g, 'url(#');
        if (value && overlay.style.getPropertyValue(property) !== value)
          overlay.style.setProperty(property, value, 'important');
      }
    }
  }
}
function unwrap(wrapper: Element): SVGGraphicsElement | null {
  const original = motionOriginal(wrapper);
  if (!original) return null;
  // Keep transforms/opacity applied by normal editing to the authored effect group.
  const meaningful = [...wrapper.attributes].some(
    (a) => !['id', motionAttribute, 'data-label'].includes(a.name),
  );
  if (meaningful) {
    wrapper.replaceChildren(original);
    wrapper.removeAttribute(motionAttribute);
    return wrapper as SVGGraphicsElement;
  }
  wrapper.replaceWith(original);
  return original;
}
export function configureMotion(
  engine: DocumentEngine,
  selected: SVGGraphicsElement,
  config: MotionConfig | null,
) {
  if (config && !decodeMotion(JSON.stringify(config)))
    throw new Error('动效参数无效：周期 1–20 秒，强度 10–75%，线段与间隔 2–40。');
  engine.transaction(config ? '配置图形动效' : '移除图形动效', () => {
    let wrapper = motionWrapper(selected);
    if (
      wrapper &&
      config &&
      decodeMotion(wrapper.getAttribute(motionAttribute))?.type !== config.type
    ) {
      selected = unwrap(wrapper)!;
      wrapper = null;
    }
    if (!config) {
      if (wrapper) engine.selection = [unwrap(wrapper)!];
      if (engine.scope && !engine.root!.contains(engine.scope)) engine.scope = null;
      refreshMotionStyles(engine.root!);
      return;
    }
    if (!wrapper) {
      const original = config.type === 'flow' ? flowTarget(selected) : selected;
      if (!original) throw new Error('流动效果需要选择一条带描边的直线、折线或 Path。');
      if (config.type === 'flow' && getComputedStyle(original).stroke === 'none')
        throw new Error('此线条没有可见描边，请先设置描边颜色。');
      if (config.type === 'flow') {
        const geometryCss = ['d', 'transform', 'transform-origin', 'transform-box', 'x', 'y'];
        const controlled =
          geometryCss.some((p) => original.style.getPropertyValue(p)) ||
          [
            ...engine.root!.querySelectorAll<SVGStyleElement>('style:not([data-sf-motion-style])'),
          ].some((s) =>
            [...(s.sheet?.cssRules || [])].some(
              (rule) =>
                rule instanceof CSSStyleRule &&
                original.matches(rule.selectorText) &&
                geometryCss.some((p) => rule.style.getPropertyValue(p)),
            ),
          );
        if (controlled)
          throw new Error(
            '此线条的几何或变换由 CSS 控制，暂不支持流动效果。可改用 SVG 几何与 transform 属性后添加。',
          );
      }
      // Structural selectors can change siblings too (e.g. rect + text, :nth-child, :has).
      // With author CSS present, check the other artwork before accepting a new wrapper.
      const watched = (
        engine.root!.querySelector('style:not([data-sf-motion-style])')
          ? [...engine.root!.querySelectorAll<SVGElement>('*')]
          : [original, ...original.querySelectorAll<SVGElement>('*')]
      ).filter(
        (n) =>
          !isMotionWrapper(n) &&
          !isMotionPart(n) &&
          !['style', 'defs', 'title', 'desc'].includes(n.localName),
      );
      const properties = [
        'fill',
        'stroke',
        'stroke-width',
        'stroke-opacity',
        'fill-opacity',
        'opacity',
        'font-family',
        'font-size',
        'font-weight',
        'filter',
        'clip-path',
        'mask',
        'display',
        'visibility',
        'transform',
        'transform-origin',
        'transform-box',
        'x',
        'y',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'width',
        'height',
        'd',
        'text-anchor',
        'dominant-baseline',
        'letter-spacing',
        'word-spacing',
        'marker-start',
        'marker-mid',
        'marker-end',
        'color',
        'fill-rule',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-miterlimit',
        'stroke-dasharray',
        'stroke-dashoffset',
        'font-style',
        'font-variant',
        'font-stretch',
        'text-decoration',
        'white-space',
        'baseline-shift',
        'alignment-baseline',
        'stop-color',
        'stop-opacity',
        'flood-color',
        'flood-opacity',
        'lighting-color',
        'vector-effect',
        'paint-order',
        'overflow',
        'clip-rule',
        'mask-type',
      ];
      const readStyle = (node: Element) => {
        const s = getComputedStyle(node);
        return properties.map((p) => s.getPropertyValue(p));
      };
      const before = watched.map(readStyle);
      wrapper = document.createElementNS(NS, 'g');
      wrapper.id = `sf-motion-${crypto.randomUUID()}`;
      wrapper.setAttribute(
        'data-label',
        selected.getAttribute('data-label') ||
          selected.querySelector('title')?.textContent ||
          (config.type === 'flow' ? '流动箭头' : '动效图形'),
      );
      original.before(wrapper);
      if (config.type === 'flow') {
        const base = document.createElementNS(NS, 'g');
        base.setAttribute('data-sf-motion-base', '');
        base.append(original);
        const overlay = document.createElementNS(NS, original.localName);
        overlay.setAttribute('data-sf-motion-overlay', '');
        overlay.setAttribute('fill', 'none');
        overlay.style.setProperty('fill', 'none', 'important');
        wrapper.append(base, overlay);
      } else wrapper.append(original);
      const added = [wrapper, ...wrapper.querySelectorAll<SVGGElement>('[data-sf-motion-base]')];
      if (
        added.some((node) => {
          const s = getComputedStyle(node);
          return (
            (s.opacity && Number(s.opacity) !== 1) ||
            s.display === 'none' ||
            s.visibility === 'hidden' ||
            [s.transform, s.filter, s.clipPath, s.mask].some((v) => v && v !== 'none')
          );
        })
      )
        throw new Error(
          '原 SVG 的分组样式包含变换或合成效果，无法安全添加动效。请选择其他分组，或先调整对应样式。',
        );
      if (watched.some((n, i) => readStyle(n).some((v, j) => v !== before[i][j])))
        throw new Error(
          '原 SVG 的样式依赖父子层级，无法安全添加动效。请选择外层分组，或先将样式改为显式属性。',
        );
    }
    wrapper.setAttribute(motionAttribute, JSON.stringify(config));
    engine.selection = [wrapper];
    if (engine.scope && !engine.root!.contains(engine.scope)) engine.scope = null;
    syncMotionGeometry(engine.root!, true);
    refreshMotionStyles(engine.root!);
    // An external !important declaration cannot be animated safely without overriding source styles.
    for (const style of engine.root!.querySelectorAll<SVGStyleElement>(
      'style:not([data-sf-motion-style])',
    ))
      for (const rule of style.sheet?.cssRules || []) {
        if (!(rule instanceof CSSStyleRule)) continue;
        const target =
          config.type === 'flow' ? wrapper.querySelector('[data-sf-motion-overlay]')! : wrapper;
        const property = config.type === 'flow' ? 'stroke-dashoffset' : 'opacity';
        if (
          rule.style.getPropertyPriority(property) === 'important' &&
          target.matches(rule.selectorText)
        )
          throw new Error('原 SVG 使用 !important 控制动效属性，请先在源码中调整该规则。');
      }
  });
}
export function staticMotionSvg(root: SVGSVGElement) {
  const clone = root.cloneNode(true) as SVGSVGElement;
  for (const wrapper of [...clone.querySelectorAll(`[${motionAttribute}]`)].reverse())
    unwrap(wrapper);
  clone.querySelectorAll(`style[${styleAttribute}]`).forEach((s) => s.remove());
  return new XMLSerializer().serializeToString(clone);
}
