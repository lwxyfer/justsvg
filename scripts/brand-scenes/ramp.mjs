import { Diagram, rect, path, circle, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function ramp(t) {
  const d = new Diagram('ramp', t),
    f = t.font;
  d.defs.push(
    `<pattern id="${d.id}-points" width="20" height="20" patternUnits="userSpaceOnUse">${circle(1, 1, 0.7, '#d8d6cf')}</pattern>`,
    `<clipPath id="${d.id}-core"><rect x="1130" y="640" width="360" height="200" rx="12"/></clipPath>`,
  );
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(72, 111, 'Less searching.', 68, t.ink, 400, f, 'letter-spacing="-1.5"') +
      text(72, 192, 'More knowing.', 68, t.ink, 400, f, 'letter-spacing="-1.5"') +
      text(76, 252, '把知识连成工作流，把注意力留给答案。', 22, t.muted, 400, f) +
      rect(64, 306, 1472, 726, '#f8f7f4', 12, '#e4e2db', 1) +
      rect(64, 306, 1472, 726, `url(#${d.id}-points)`, 12),
  );
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      80 + i * 370,
      350,
      310,
      128,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff', 10, '#d8d6cf', 1) +
        glyph(key, x + 22, y + 24, 36, t.ink, 1.5) +
        text(x + 77, y + 47, content[key][0], 25, t.ink, 500, f) +
        text(x + 77, y + 82, content[key][1], 16, t.muted, 400, f) +
        path(`M${x + 22} ${y + 108}h${w - 44}`, '#e7e5df', 1),
    ),
  );
  d.node(
    'query',
    80,
    700,
    310,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 10, '#c8c6bf', 1) +
      text(x + 24, y + 45, 'User query', 28, t.ink, 400, f) +
      text(x + 24, y + 80, '用户问题', 17, t.muted, 400, f),
  );
  d.node(
    'retrieve',
    580,
    664,
    350,
    164,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12, '#cbc9c2', 1) +
      text(x + 26, y + 59, 'Retriever', 33, t.ink, 500, f) +
      text(x + 26, y + 98, '相似度检索', 18, t.muted, 400, f) +
      rect(x + w - 74, y + 105, 48, 36, '#e4f222', 7) +
      glyph('retrieve', x + w - 64, y + 109, 27, t.ink, 1.8),
  );
  d.node(
    'context',
    580,
    920,
    350,
    100,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 10, '#cbc9c2', 1) +
      text(x + 26, y + 40, 'Context', 28, t.ink, 400, f) +
      text(x + 26, y + 74, '上下文构建', 17, t.muted, 400, f),
  );
  d.node('llm', 1130, 640, 360, 200, ({ x, y, w, h }) => {
    let arcs = '';
    for (let i = 0; i < 9; i++) {
      const r = 60 + i * 16;
      arcs += path(`M${x + w - r} ${y + h}A${r} ${r} 0 0 1 ${x + w} ${y + h - r}`, '#8c8c84', 0.8);
    }
    return (
      rect(x, y, w, h, '#171717', 12) +
      `<g clip-path="url(#${d.id}-core)">${arcs}</g>` +
      text(x + 28, y + 70, 'LLM', 48, '#fff', 400, f) +
      text(x + 30, y + 110, '生成模型', 19, '#d3d3c9', 400, f) +
      glyph('llm', x + w - 94, y + 32, 60, '#e4f222', 1.2)
    );
  });
  d.node(
    'answer',
    1130,
    920,
    360,
    100,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#e4f222', 10) +
      text(x + 26, y + 40, 'Answer', 28, t.ink, 500, f) +
      text(x + 26, y + 74, '回答与引用', 17, '#383b12', 400, f) +
      glyph('answer', x + w - 62, y + 27, 36, t.ink, 1.7),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [394 + i * 370, 414],
        [446 + i * 370, 414],
      ],
      t.accent,
      1.7,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [394, 756],
      [478, 756],
      [478, 746],
      [576, 746],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [755, 832],
      [755, 916],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'context',
    'llm',
    [
      [934, 970],
      [1030, 970],
      [1030, 740],
      [1126, 740],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1310, 844],
      [1310, 916],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1345, 482],
      [1345, 560],
      [1000, 560],
      [1000, 610],
      [755, 610],
      [755, 660],
    ],
    t.accent,
    1.7,
    [1020, 548, '索引供给'],
  );
  return d;
}
