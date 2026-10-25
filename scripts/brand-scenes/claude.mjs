import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function claude(t) {
  const d = new Diagram('claude', t),
    serif = 'Georgia, Songti SC, serif',
    sans = 'Arial, PingFang SC, sans-serif';
  d.add(
    rect(0, 0, 1600, 1100, '#faf9f5') +
      text(72, 114, 'From knowledge', 76, '#292720', 400, serif, 'letter-spacing="-2"') +
      text(72, 204, 'to considered answers.', 76, '#292720', 400, serif, 'letter-spacing="-2"') +
      text(76, 259, '先理解上下文，再给出有据可依的回答。', 22, '#646058', 400, sans),
  );
  d.add(
    rect(64, 334, 342, 670, '#f0ece3', 8) +
      path('M83 351V987', '#d9d2c4') +
      text(106, 373, 'The knowledge notebook', 18, '#646058', 400, serif),
  );
  const ys = [400, 550, 700, 850];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      106,
      ys[i],
      270,
      108,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#faf9f5', 3) +
        path(`M${x + 15} ${y + 16}h10v17l-5-3-5 3z`, '#b95637', 1.3) +
        d.label(key, x + 19, y + 57, 24, y + 86, '#3c3830', serif, 400),
    ),
  );
  d.node(
    'query',
    500,
    400,
    370,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#eee9df', 24) +
      d.label('query', x + 25, y + 47, 25, y + 81, '#3c3830', sans, 400),
  );
  d.node(
    'retrieve',
    500,
    600,
    330,
    118,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#faf9f5', 0) +
      path(`M${x} ${y}h${w}M${x} ${y + h}h${w}`, '#d4ccbe', 1) +
      text(x + 8, y + 48, 'Retriever', 31, '#3c3830', 400, serif) +
      text(x + 8, y + 83, '相似度检索', 17, '#646058', 400, sans) +
      path(`M${x + w - 30} ${y + 49}h21m-7-7 7 7-7 7`, '#b95637', 1.4),
  );
  d.node(
    'context',
    500,
    838,
    330,
    118,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#faf9f5', 0) +
      path(`M${x} ${y}h${w}M${x} ${y + h}h${w}`, '#d4ccbe', 1) +
      text(x + 8, y + 48, 'Context', 31, '#3c3830', 400, serif) +
      text(x + 8, y + 83, '上下文构建', 17, '#646058', 400, sans) +
      lines(x + w - 64, y + 36, [48, 35, 43], '#c2b8a6', 12, 2),
  );
  d.node(
    'llm',
    870,
    664,
    208,
    208,
    ({ x, y, w, h }) =>
      circle(x + w / 2, y + h / 2, w / 2, '#d97757') +
      text(x + w / 2, y + 102, 'LLM', 40, '#fff', 400, serif, 'text-anchor="middle"') +
      text(x + w / 2, y + 138, '生成模型', 17, '#3c251b', 400, sans, 'text-anchor="middle"'),
  );
  d.node(
    'answer',
    1130,
    398,
    404,
    606,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fffefa', 4, '#d8d0c2', 1) +
      path(`M${x + 32} ${y + 35}h32`, '#d97757', 2) +
      text(x + 32, y + 94, 'Answer', 43, '#3c3830', 400, serif) +
      text(x + 34, y + 134, '回答与引用', 18, '#646058', 400, sans) +
      text(x + 32, y + 205, 'An answer,', 31, '#3c3830', 400, serif) +
      text(x + 32, y + 249, 'with something', 31, '#3c3830', 400, serif) +
      text(x + 32, y + 293, 'to stand on.', 31, '#3c3830', 400, serif) +
      lines(x + 33, y + 344, [331, 307, 318, 257], '#ddd6ca', 21, 3) +
      path(`M${x + 32} ${y + 465}h${w - 64}`, '#d8d0c2') +
      text(x + 33, y + 501, 'Context, carefully assembled.', 16, '#646058', 400, serif) +
      text(x + 33, y + 538, 'Sources, kept in view.', 16, '#646058', 400, serif),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [241, ys[i] + 112],
        [241, ys[i + 1] - 4],
      ],
      '#8b7d69',
      1.3,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [665, 516],
      [665, 596],
    ],
    '#8b7d69',
    1.5,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [665, 722],
      [665, 834],
    ],
    '#b95637',
    1.5,
  );
  d.edge(
    'context',
    'llm',
    [
      [834, 897],
      [850, 897],
      [850, 768],
      [866, 768],
    ],
    '#b95637',
    1.5,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1082, 768],
      [1126, 768],
    ],
    '#b95637',
    1.5,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [380, 904],
      [444, 904],
      [444, 659],
      [496, 659],
    ],
    '#b95637',
    1.5,
    [414, 980, '索引供给'],
  );
  return d;
}
