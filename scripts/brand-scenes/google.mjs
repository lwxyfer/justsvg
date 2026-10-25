import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function google(t) {
  const d = new Diagram('google', t),
    f = 'Google Sans, Arial, PingFang SC, sans-serif';
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(72, 116, 'Find a little.', 72, '#202124', 500, f, 'letter-spacing="-2"') +
      text(72, 202, 'Understand a lot.', 72, '#1a73e8', 500, f, 'letter-spacing="-2"') +
      text(76, 253, '知识的不同形态，连接成一个答案。', 22, '#5f6368', 400, f),
  );
  d.node(
    'docs',
    80,
    320,
    280,
    194,
    ({ x, y, w }) =>
      path(
        `M${x} ${y + 28}q0-28 28-28h196l56 56v110q0 28-28 28H${x + 28}q-28 0-28-28z`,
        'none',
        0,
        '#d3e3fd',
      ) +
      path(`M${x + w - 56} ${y}v56h56`, '#a8c7fa', 1, '#a8c7fa') +
      lines(x + 28, y + 44, [63, 45], '#1967d2', 12, 4) +
      d.label('docs', x + 28, y + 122, 25, y + 157, '#174ea6', f),
  );
  d.node(
    'chunks',
    448,
    320,
    264,
    194,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fce8e6', 56) +
      [0, 1, 2].map((j) => rect(x + 28 + j * 31, y + 31, 22, 48, '#ea4335', 7)).join('') +
      d.label('chunks', x + 28, y + 122, 25, y + 157, '#a50e0e', f),
  );
  d.node('embed', 800, 300, 270, 234, ({ x, y, w, h }) => {
    const cx = x + w / 2,
      cy = y + h / 2;
    // Smooth eight-lobed Material silhouette, with zero slope at each join.
    const points = Array.from({ length: 256 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 256,
        r = 109 + 8 * Math.cos(8 * a);
      return [(cx + Math.cos(a) * r * 1.15).toFixed(2), (cy + Math.sin(a) * r).toFixed(2)];
    });
    const shape = path('M' + points.map((p) => p.join(',')).join('L') + 'Z', 'none', 0, '#fff0b3');
    return (
      shape +
      circle(cx, y + 65, 24, '#fbbc05') +
      path(`M${cx - 10} ${y + 72}l10-15 10 13`, '#795600', 2) +
      [
        [-10, 72],
        [0, 57],
        [10, 70],
      ]
        .map(([dx, dy]) => circle(cx + dx, y + dy, 3.5, '#795600'))
        .join('') +
      d.label('embed', x + 45, y + 131, 25, y + 166, '#665000', f)
    );
  });
  d.node(
    'index',
    1174,
    312,
    288,
    218,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#c4eed0', h / 2) +
      path(`M${x + 102} ${y + 34}q42-14 84 0v40q-42 14-84 0z`, '#137333', 2, '#a2dbae') +
      path(`M${x + 102} ${y + 34}q42 17 84 0m-84 20q42 17 84 0`, '#137333', 2) +
      d.label('index', x + 47, y + 141, 25, y + 176, '#0d652d', f),
  );
  d.node(
    'query',
    80,
    704,
    348,
    110,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#e8f0fe', h / 2) +
      circle(x + 38, y + 48, 12, 'none', '#1a73e8', 3) +
      path(`M${x + 47} ${y + 57}l10 10`, '#1a73e8', 3) +
      d.label('query', x + 74, y + 47, 25, y + 80, '#174ea6', f),
  );
  d.node(
    'retrieve',
    526,
    622,
    260,
    260,
    ({ x, y, w, h }) =>
      circle(x + w / 2, y + h / 2, w / 2, '#a8c7fa') +
      circle(x + w / 2, y + 63, 28, '#fff') +
      circle(x + 128, y + 61, 9, 'none', '#1967d2', 2.5) +
      path(`M${x + 135} ${y + 68}l7 7`, '#1967d2', 2.5) +
      text(x + w / 2, y + 145, 'Retriever', 27, '#0b3d91', 600, f, 'text-anchor="middle"') +
      text(x + w / 2, y + 182, '相似度检索', 18, '#174ea6', 400, f, 'text-anchor="middle"'),
  );
  d.node(
    'context',
    880,
    686,
    270,
    132,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff0b3', 30) +
      rect(x + 22, y + 22, 29, 37, '#fff', 5) +
      lines(x + 28, y + 32, [17, 15, 17], '#795600', 7, 2) +
      d.label('context', x + 72, y + 56, 25, y + 90, '#665000', f),
  );
  d.node(
    'llm',
    876,
    920,
    278,
    110,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#1a73e8', h / 2) +
      text(x + 28, y + 50, 'LLM', 35, '#fff', 500, f) +
      text(x + 29, y + 82, '生成模型', 17, '#fff', 400, f) +
      circle(x + w - 56, y + 55, 24, '#a8c7fa') +
      path(
        `M${x + w - 56} ${y + 40}q3 12 15 15-12 3-15 15-3-12-15-15 12-3 15-15Z`,
        'none',
        0,
        '#174ea6',
      ),
  );
  d.node(
    'answer',
    1250,
    838,
    270,
    192,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#c4eed0', 36) +
      circle(x + w - 42, y + 39, 19, '#137333') +
      path(`M${x + w - 50} ${y + 39}l6 6 11-13`, '#fff', 2.5) +
      d.label('answer', x + 27, y + 62, 28, y + 98, '#0d652d', f) +
      lines(x + 28, y + 133, [174, 153, 185], '#8dcc9c', 13, 4),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [364, 417],
      [444, 417],
    ],
    '#1967d2',
    3,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [716, 417],
      [796, 417],
    ],
    '#a50e0e',
    3,
  );
  d.edge(
    'embed',
    'index',
    [
      [1074, 417],
      [1170, 417],
    ],
    '#795600',
    3,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [432, 759],
      [522, 759],
    ],
    '#1967d2',
    3,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [790, 752],
      [876, 752],
    ],
    '#1967d2',
    3,
  );
  d.edge(
    'context',
    'llm',
    [
      [1015, 822],
      [1015, 916],
    ],
    '#795600',
    3,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1158, 975],
      [1246, 975],
    ],
    '#1a73e8',
    3,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1318, 534],
      [1318, 576],
      [656, 576],
      [656, 618],
    ],
    '#137333',
    3,
    [1060, 561, '索引供给'],
  );
  return d;
}
