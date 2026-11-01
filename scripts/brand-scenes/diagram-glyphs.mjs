// Semantic primitives only. Each scene owns its scale, weight, materials and composition.
import { path, rect, circle } from './document.mjs';
export function glyph(key, x, y, size = 32, color = '#222', weight = 1.8) {
  const p = (d) => path(d, color, weight);
  const shapes = {
    docs: p('M7 3H21L27 9V29H7ZM21 3V10H27M12 15H22M12 20H22M12 25H19'),
    chunks: [5, 13, 21].map((at) => rect(4, at, 25, 5, 'none', 1, color, weight)).join(''),
    embed:
      p('M5 24L16 6L28 24M5 24H28') +
      [
        [5, 24],
        [16, 6],
        [28, 24],
      ]
        .map(([a, b]) => circle(a, b, 3, color))
        .join(''),
    index: p('M5 8C5 2 27 2 27 8V25C27 31 5 31 5 25ZM5 8C5 14 27 14 27 8M5 16C5 22 27 22 27 16'),
    query: p('M4 4H28V23H15L7 29V23H4Z'),
    retrieve: circle(14, 14, 9, 'none', color, weight) + p('M21 21L29 29'),
    context: rect(5, 3, 22, 26, 'none', 1, color, weight) + p('M10 10H22M10 16H22M10 22H18'),
    llm: p('M3 11L16 4L29 11L16 18ZM3 18L16 25L29 18M3 24L16 31L29 24'),
    answer: circle(16, 16, 13, 'none', color, weight) + p('M9 16L14 21L24 10'),
  };
  return `<g transform="translate(${x} ${y}) scale(${size / 32})">${shapes[key]}</g>`;
}
