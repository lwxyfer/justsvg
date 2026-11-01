import { Diagram, rect, path, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function duolingo(t) {
  const d = new Diagram('duolingo', t),
    f = t.font;
  const button = (x, y, w, h, fill = '#fff', edge = '#dedede') =>
    rect(x, y + 7, w, h - 7, edge, 24) + rect(x, y, w, h - 7, fill, 24, edge, 2.5);
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(72, 116, 'Learn the context.', 68, '#3f7e16', 700, f, 'letter-spacing="-1"') +
      text(72, 197, 'One good step at a time.', 48, t.ink, 700, f, 'letter-spacing="-.8"') +
      text(76, 254, '知识走过的每一步，都让回答更有依据。', 22, t.muted, 400, f),
  );
  const positions = [
    [84, 356],
    [230, 520],
    [84, 684],
    [230, 848],
  ];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      ...positions[i],
      270,
      112,
      ({ x, y, w, h }) =>
        button(x, y, w, h, '#f2ffe5', '#a4d96c') +
        glyph(key, x + 20, y + 32, 42, '#3f7e16', 2.6) +
        text(x + 79, y + 46, content[key][0], 24, t.ink, 700, f) +
        text(x + 79, y + 81, content[key][1], 16, '#526443', 400, f),
    ),
  );
  d.node(
    'query',
    650,
    356,
    320,
    120,
    ({ x, y, w, h }) =>
      button(x, y, w, h, '#ddf4ff', '#8dd4ef') +
      text(x + 25, y + 49, 'User query', 29, '#18566e', 700, f) +
      text(x + 25, y + 84, '用户问题', 17, '#18566e', 400, f) +
      glyph('query', x + w - 66, y + 32, 40, '#147b9e', 2.5),
  );
  d.node(
    'retrieve',
    650,
    566,
    320,
    164,
    ({ x, y, w, h }) =>
      path(
        `M${x + 24} ${y}H${x + w - 24}L${x + w} ${y + 24}V${y + h - 24}L${x + w - 24} ${y + h}H${x + 24}L${x} ${y + h - 24}V${y + 24}Z`,
        '#b07bd4',
        3,
        '#ecd9ff',
      ) +
      text(x + 26, y + 67, 'Retriever', 33, '#5e2b85', 700, f) +
      text(x + 26, y + 106, '相似度检索', 18, '#5e2b85', 400, f) +
      glyph('retrieve', x + w - 72, y + 110, 35, '#7a42a1', 2.8),
  );
  d.node(
    'context',
    650,
    870,
    320,
    120,
    ({ x, y, w, h }) =>
      button(x, y, w, h) +
      text(x + 25, y + 49, 'Context', 29, t.ink, 700, f) +
      text(x + 25, y + 84, '上下文构建', 17, t.muted, 400, f) +
      glyph('context', x + w - 66, y + 32, 40, '#777', 2.5),
  );
  d.node(
    'llm',
    1110,
    512,
    360,
    252,
    ({ x, y, w, h }) =>
      button(x, y, w, h, '#d7ffb8', '#8ecf5c') +
      glyph('llm', x + 133, y + 27, 90, '#3f7e16', 2.8) +
      text(x + w / 2, y + 164, 'LLM', 49, '#244e0b', 700, f, 'text-anchor="middle"') +
      text(x + w / 2, y + 207, '生成模型', 20, '#244e0b', 400, f, 'text-anchor="middle"'),
  );
  d.node(
    'answer',
    1110,
    870,
    360,
    120,
    ({ x, y, w, h }) =>
      button(x, y, w, h, '#58cc02', '#46a302') +
      text(x + 25, y + 49, 'Answer', 31, '#183c00', 700, f) +
      text(x + 25, y + 84, '回答与引用', 17, '#204900', 400, f) +
      glyph('answer', x + w - 69, y + 32, 42, '#244e0b', 2.6),
  );
  for (let i = 0; i < 3; i++) {
    const [x, y] = positions[i],
      [nx, ny] = positions[i + 1];
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [x + 135, y + 116],
        [x + 135, y + 138],
        [nx + 135, y + 138],
        [nx + 135, ny - 4],
      ],
      t.accent,
      2.8,
    );
  }
  d.edge(
    'query',
    'retrieve',
    [
      [810, 480],
      [810, 562],
    ],
    t.accent,
    2.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [810, 734],
      [810, 866],
    ],
    t.accent,
    2.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [974, 930],
      [1030, 930],
      [1030, 638],
      [1106, 638],
    ],
    t.accent,
    2.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1290, 768],
      [1290, 866],
    ],
    t.accent,
    2.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [504, 904],
      [568, 904],
      [568, 648],
      [646, 648],
    ],
    t.accent,
    2.8,
    [578, 794, '索引供给'],
  );
  return d;
}
