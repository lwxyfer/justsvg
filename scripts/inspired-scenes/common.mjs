import { Diagram, rect, path, text, circle, lines, content } from '../brand-scenes/document.mjs';
export { rect, path, text, circle, lines, content };
export { glyph } from '../brand-scenes/diagram-glyphs.mjs';
export const sans = 'Helvetica Neue, Arial, PingFang SC, sans-serif';
export const serif = 'Georgia, Times New Roman, Songti SC, serif';
export function diagram(t) {
  const d = new Diagram(t.key, t);
  d.id = t.id;
  return d;
}
export function label(
  t,
  key,
  x,
  y,
  size = 26,
  color = t.ink,
  bodyColor = t.muted,
  align = 'start',
  font = t.font,
) {
  return (
    text(x, y, content[key][0], size, color, 600, font, `text-anchor="${align}"`) +
    text(x, y + 32, content[key][1], 17, bodyColor, 400, sans, `text-anchor="${align}"`)
  );
}
export function chain(d, keys, axis = 'vertical', color = d.theme.accent, width = 2) {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = d.boxes.get(keys[i]),
      b = d.boxes.get(keys[i + 1]);
    const points =
      axis === 'vertical'
        ? [
            [a.x + a.w / 2, a.y + a.h],
            [b.x + b.w / 2, b.y],
          ]
        : [
            [a.x + a.w, a.y + a.h / 2],
            [b.x, b.y + b.h / 2],
          ];
    d.edge(keys[i], keys[i + 1], points, color, width);
  }
}
