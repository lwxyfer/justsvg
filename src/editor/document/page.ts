import { engine } from './engine';

export type PageFill = 'transparent' | 'solid' | 'gradient' | 'dots' | 'grid';
export interface PageBackground {
  mode: PageFill;
  color: string;
  secondary: string;
  angle: number;
  spacing: number;
}
const ns = 'http://www.w3.org/2000/svg';
const marker = 'data-sf-page-background';
const defaults: PageBackground = {
  mode: 'transparent',
  color: '#ffffff',
  secondary: '#cbd5e1',
  angle: 135,
  spacing: 24,
};
function paper() {
  const root = engine.root;
  if (!root) return null;
  const owned = root.querySelector<SVGRectElement>(`rect[${marker}]`);
  if (owned) return owned;
  const first = engine.children(root)[0];
  const b = engine.viewBox();
  if (first?.localName !== 'rect' || first.hasAttribute('transform') || first.hasAttribute('rx'))
    return null;
  return Number(first.getAttribute('x') || 0) === b.x &&
    Number(first.getAttribute('y') || 0) === b.y &&
    Number(first.getAttribute('width')) === b.width &&
    Number(first.getAttribute('height')) === b.height
    ? (first as SVGRectElement)
    : null;
}
export function pageBackground(): PageBackground {
  const rect = paper();
  if (!rect) return { ...defaults };
  try {
    const parsed = JSON.parse(rect.getAttribute(marker) || 'null');
    if (
      parsed &&
      ['transparent', 'solid', 'gradient', 'dots', 'grid'].includes(parsed.mode) &&
      [parsed.color, parsed.secondary].every(
        (v) => typeof v === 'string' && /^#[a-f\d]{6}$/i.test(v),
      ) &&
      Number.isFinite(parsed.angle) &&
      Number.isFinite(parsed.spacing) &&
      parsed.spacing >= 4 &&
      parsed.spacing <= 200
    )
      return { ...defaults, ...parsed };
  } catch {
    /* An imported attribute never blocks the inspector. */
  }
  const fill = rect.getAttribute('fill') || '#ffffff';
  return {
    ...defaults,
    mode: fill === 'none' ? 'transparent' : 'solid',
    color: fill === 'white' ? '#ffffff' : /^#[a-f\d]{6}$/i.test(fill) ? fill : '#ffffff',
  };
}
function create(tag: string, attrs: Record<string, string | number>) {
  const el = document.createElementNS(ns, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}
function paint(config: PageBackground, target = paper()) {
  const root = engine.root!;
  let rect = target;
  if (!rect) {
    rect = create('rect', {}) as SVGRectElement;
    root.prepend(rect);
  }
  root.querySelectorAll('defs[data-sf-page-paint]').forEach((el) => el.remove());
  rect.setAttribute(marker, JSON.stringify(config));
  rect.style.setProperty('pointer-events', 'none', 'important');
  rect.style.setProperty('stroke', 'none', 'important');
  const b = engine.viewBox();
  for (const [key, value] of Object.entries(b)) rect.setAttribute(key, String(value));
  let fill = config.mode === 'transparent' ? 'none' : config.color;
  if (['gradient', 'dots', 'grid'].includes(config.mode)) {
    const id = `page-${crypto.randomUUID()}`;
    const defs = create('defs', { 'data-sf-page-paint': '' });
    if (config.mode === 'gradient') {
      const rad = (config.angle * Math.PI) / 180;
      const dx = Math.sin(rad) / 2,
        dy = -Math.cos(rad) / 2;
      const gradient = create('linearGradient', {
        id,
        x1: 0.5 - dx,
        y1: 0.5 - dy,
        x2: 0.5 + dx,
        y2: 0.5 + dy,
      });
      gradient.append(
        create('stop', { offset: 0, 'stop-color': config.color }),
        create('stop', { offset: 1, 'stop-color': config.secondary }),
      );
      defs.append(gradient);
    } else {
      const s = config.spacing;
      const pattern = create('pattern', {
        id,
        width: s,
        height: s,
        patternUnits: 'userSpaceOnUse',
      });
      pattern.append(create('rect', { width: s, height: s, fill: config.color }));
      pattern.append(
        config.mode === 'dots'
          ? create('circle', { cx: s / 2, cy: s / 2, r: 1, fill: config.secondary })
          : create('path', {
              d: `M ${s} 0 H 0 V ${s}`,
              fill: 'none',
              stroke: config.secondary,
              'stroke-width': 1,
            }),
      );
      defs.append(pattern);
    }
    root.prepend(defs);
    fill = `url(#${id})`;
  }
  rect.style.setProperty('fill', fill, 'important');
  rect.setAttribute('fill', fill);
}
export function setPageBackground(config: PageBackground) {
  if (!engine.root) return;
  if (JSON.stringify(pageBackground()) === JSON.stringify(config)) return;
  if (
    ![config.color, config.secondary].every((v) => /^#[a-f\d]{6}$/i.test(v)) ||
    !Number.isFinite(config.angle) ||
    !Number.isFinite(config.spacing) ||
    config.spacing < 4 ||
    config.spacing > 200
  )
    throw new Error('请使用有效颜色，间距范围为 4–200。');
  engine.transaction('画布背景', () => paint(config));
}
export function setPageSize(width: number, height: number) {
  if (!engine.root) return;
  if (![width, height].every((v) => Number.isFinite(v) && v >= 1 && v <= 16384))
    throw new Error('画布尺寸范围为 1–16384 px。');
  const current = engine.pageSize();
  if (width === current.width && height === current.height) return;
  const background = paper();
  const config = pageBackground();
  const b = engine.viewBox(),
    size = engine.pageSize();
  engine.transaction('画布尺寸', () => {
    engine.root!.setAttribute('width', String(width));
    engine.root!.setAttribute('height', String(height));
    // Preserve viewBox origin and scale; resize the page without stretching artwork.
    engine.root!.setAttribute(
      'viewBox',
      `${b.x} ${b.y} ${(b.width * width) / size.width} ${(b.height * height) / size.height}`,
    );
    if (background?.hasAttribute(marker)) paint(config, background);
    else if (background) {
      // Imported paper keeps its authored fill, gradient resources, opacity and styles.
      for (const [key, value] of Object.entries(engine.viewBox()))
        background.setAttribute(key, String(value));
    }
  });
}
