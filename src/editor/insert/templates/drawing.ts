import type { InsertAsset } from '../catalog';
import { templateBindings } from './bindings';
export type Tone = 'blue' | 'green' | 'purple' | 'amber' | 'slate';
export const palette: Record<Tone, { ink: string; line: string; fill: string }> = {
  blue: { ink: '#1d4ed8', line: '#93b4ef', fill: '#eff6ff' },
  green: { ink: '#047857', line: '#80c5ad', fill: '#ecfdf5' },
  purple: { ink: '#6d28d9', line: '#b8a0e8', fill: '#f5f3ff' },
  amber: { ink: '#a16207', line: '#ddbd79', fill: '#fffbeb' },
  slate: { ink: '#334155', line: '#b8c5d5', fill: '#f8fafc' },
};
export const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
export function text(
  value: string,
  x: number,
  y: number,
  size = 14,
  color = '#334155',
  weight = 400,
  anchor: 'start' | 'middle' | 'end' = 'start',
) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}
export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill = '#ffffff',
  stroke = '#cbd5e1',
  radius = 8,
) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
}
export function node(
  id: string,
  title: string,
  x: number,
  y: number,
  width = 176,
  height = 88,
  body: string[] = [],
  tone: Tone = 'blue',
) {
  const p = palette[tone];
  return `<g id="tpl-node-${id}" data-label="${escapeXml(title)}" data-node="true" data-sf-bounds="${x} ${y} ${width} ${height}">${rect(x, y, width, height, p.fill, p.line)}${text(title, x + 16, y + 28, 16, p.ink, 600)}${body.map((line, i) => text(line, x + 16, y + 51 + i * 18, 12, '#475569')).join('')}</g>`;
}
export function edge(
  id: string,
  points: [number, number][],
  label = '',
  labelAt?: [number, number],
  dashed = false,
) {
  const a = points[0],
    b = points.at(-1)!,
    at = labelAt || [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 10];
  return `<g id="tpl-edge-${id}" data-label="${escapeXml(label || '连接线')}"><polyline id="tpl-line-${id}" points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linejoin="round" ${dashed ? 'stroke-dasharray="6 4"' : ''} marker-end="url(#template-arrow)"/>${label ? `<g data-sf-label-for="#tpl-line-${id}">${text(label, at[0], at[1], 11, '#64748b', 400, 'middle')}</g>` : ''}</g>`;
}
export function panel(
  id: string,
  title: string,
  x: number,
  y: number,
  width: number,
  height: number,
  content = '',
  tone: Tone = 'slate',
) {
  const p = palette[tone];
  return `<g id="tpl-panel-${id}" data-label="${escapeXml(title)}" data-sf-node="true" data-sf-bounds="${x} ${y} ${width} ${height}">${rect(x, y, width, height, '#ffffff', p.line)}<path d="M${x} ${y + 40}H${x + width}" fill="none" stroke="${p.line}" stroke-width="1"/>${text(title, x + 16, y + 26, 14, p.ink, 600)}${content}</g>`;
}
export function decision(
  id: string,
  title: string,
  x: number,
  y: number,
  width = 132,
  height = 86,
) {
  return `<g id="tpl-decision-${id}" data-label="${escapeXml(title)}" data-sf-node="true" data-sf-bounds="${x} ${y} ${width} ${height}"><path d="M${x + width / 2} ${y} ${x + width} ${y + height / 2} ${x + width / 2} ${y + height} ${x} ${y + height / 2}Z" fill="#fffbeb" stroke="#ddbd79" stroke-width="1.5"/>${text(title, x + width / 2, y + height / 2 + 5, 14, '#92400e', 600, 'middle')}</g>`;
}
export function template(
  slug: string,
  label: string,
  category: string,
  description: string,
  body: string,
  width = 840,
  height = 500,
  heading = true,
): InsertAsset {
  const categoryWords =
    category === '技术架构'
      ? 'architecture system cloud diagram 架构图'
      : category === '工作流程'
        ? 'flowchart workflow process 流程图'
        : category === '技术信息图'
          ? 'infographic chart 信息图'
          : 'component card reusable 组件 卡片';
  return {
    id: `template-${slug}`,
    label,
    category,
    description,
    kind: 'template',
    width,
    height,
    keywords: `${slug} ${label} ${description} ${categoryWords}`,
    svg: templateBindings(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, sans-serif"><title>${escapeXml(label)}</title><defs><marker id="template-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#94a3b8"/></marker></defs>${heading ? `<g id="heading" data-label="标题与说明">${text(label, 36, 38, 25, '#0f172a', 700)}${text(description, 36, 63, 13, '#64748b')}</g>` : ''}${body}</svg>`,
    ),
  };
}
