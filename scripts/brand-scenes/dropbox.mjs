import { Diagram, rect, path, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function dropbox(t) {
  const d = new Diagram('dropbox', t),
    f = t.font,
    ink = '#1e1919';
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 123, 'For everything', 78, '#fff', 700, f, 'letter-spacing="-2"') +
      text(72, 218, 'worth knowing.', 78, '#fff', 700, f, 'letter-spacing="-2"') +
      text(76, 280, '把分散的知识，组成值得保留的答案。', 22, t.muted, 400, f),
  );
  d.add(
    rect(1240, 64, 288, 222, '#fad24b') +
      glyph('docs', 1296, 100, 100, '#1e1919', 1.4) +
      path('M1456 103v124m-28-28 28 28 28-28', '#007891', 5),
  );
  const ys = [366, 514, 662, 810],
    fills = ['#b4c8e1', '#b4dc19', '#ffafa5', '#fad24b'];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      80,
      ys[i],
      260,
      112,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fills[i]) +
        text(x + 20, y + 45, content[key][0], 26, ink, 600, f) +
        text(x + 20, y + 80, content[key][1], 16, ink, 400, f),
    ),
  );
  d.node(
    'query',
    560,
    366,
    350,
    116,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f7f5f2') +
      text(x + 24, y + 48, 'User query', 30, ink, 600, f) +
      text(x + 24, y + 84, '用户问题', 17, ink, 400, f) +
      glyph('query', x + w - 64, y + 34, 36, ink),
  );
  d.node(
    'retrieve',
    560,
    618,
    350,
    164,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#ffafa5') +
      text(x + 24, y + 68, 'Retriever', 42, ink, 600, f) +
      text(x + 24, y + 108, '相似度检索', 18, ink, 400, f) +
      glyph('retrieve', x + w - 70, y + 105, 38, ink),
  );
  d.node(
    'context',
    560,
    886,
    350,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#b4dc19') +
      text(x + 24, y + 48, 'Context', 32, ink, 600, f) +
      text(x + 24, y + 83, '上下文构建', 17, ink, 400, f),
  );
  d.node(
    'llm',
    1050,
    510,
    440,
    240,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#0061fe') +
      text(x + 32, y + 116, 'LLM', 82, '#fff', 600, f) +
      text(x + 36, y + 164, '生成模型', 20, '#fff', 400, f) +
      glyph('llm', x + w - 112, y + 44, 76, '#fff', 1.5),
  );
  d.node(
    'answer',
    1050,
    886,
    440,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f7f5f2') +
      text(x + 24, y + 48, 'Answer', 32, ink, 600, f) +
      text(x + 24, y + 83, '回答与引用', 17, ink, 400, f) +
      glyph('answer', x + w - 68, y + 32, 40, '#0061fe'),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [210, ys[i] + 116],
        [210, ys[i + 1] - 4],
      ],
      t.accent,
      2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [735, 486],
      [735, 614],
    ],
    t.accent,
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [735, 786],
      [735, 882],
    ],
    t.accent,
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [914, 942],
      [992, 942],
      [992, 630],
      [1046, 630],
    ],
    t.accent,
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1270, 754],
      [1270, 882],
    ],
    t.accent,
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [344, 866],
      [438, 866],
      [438, 700],
      [556, 700],
    ],
    t.accent,
    2,
    [450, 792, '索引供给'],
  );
  return d;
}
