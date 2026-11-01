import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function kimi(t) {
  const d = new Diagram('kimi', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(
        800,
        106,
        '知识不止于回答。',
        59,
        '#181818',
        700,
        f,
        'text-anchor="middle" letter-spacing="-1"',
      ) +
      text(
        800,
        162,
        '从你的文档出发，把答案与依据一起带回来。',
        22,
        '#62605f',
        400,
        f,
        'text-anchor="middle"',
      ) +
      rect(80, 248, 340, 760, '#f7f6f5', 24),
  );
  const ys = [280, 464, 648, 832],
    ext = ['.md', '.txt', '.vec', '.index'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      104,
      ys[i],
      292,
      120,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#f7f6f5') +
        text(x + 56, y + 33, content[k][0], 23, '#181818', 500, f) +
        text(x + 56, y + 67, content[k][1], 16, '#62605f', 400, f) +
        rect(x + 8, y + 12, 32, 44, '#fff', 5, '#c9c8c6') +
        path(`M${x + 16} ${y + 25}h16m-16 8h16m-16 8h10`, '#8c8b87', 1.1) +
        text(x + 56, y + 103, 'knowledge' + ext[i], 13, '#62605f', 400, mono) +
        path(`M${x + 8} ${y + 118}h${w - 16}`, '#dcdad7'),
    ),
  );
  d.node(
    'query',
    496,
    248,
    952,
    176,
    ({ x, y, w, h }) =>
      rect(x + 18, y + 20, w - 36, h - 4, '#f6f6f5', 30) +
      rect(x, y, w, h, '#fff', 28, '#d8d6d4') +
      text(x + 30, y + 42, content.query[0], 30, '#181818', 500, f) +
      text(x + 30, y + 79, content.query[1], 18, '#62605f', 400, f) +
      text(x + 30, y + 132, '尽管问，让知识库提供依据。', 25, '#62605f', 400, f) +
      circle(x + w - 38, y + 132, 4, '#2685ff'),
  );
  d.node(
    'retrieve',
    496,
    544,
    280,
    156,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fafaf9', 18, '#e2e1de') +
      d.label('retrieve', x + 24, y + 37, 27, y + 74) +
      text(x + 24, y + 122, '找到与问题相关的段落', 17, '#62605f', 400, f),
  );
  d.node(
    'context',
    872,
    544,
    336,
    156,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fafaf9', 18, '#e2e1de') +
      d.label('context', x + 24, y + 37, 27, y + 74) +
      path(`M${x + 24} ${y + 96}h${w - 48}`, '#deddd9') +
      text(x + 24, y + 126, '[来源]  引文 + 原文片段', 17, '#62605f', 400, f),
  );
  d.node(
    'llm',
    1304,
    544,
    168,
    156,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#181818', 22) +
      text(x + 24, y + 41, content.llm[0], 32, '#fff', 600, f) +
      text(x + 24, y + 79, content.llm[1], 18, '#fff', 400, f) +
      text(x + 24, y + 128, '理解与综合', 18, '#e3e3e3', 400, f),
  );
  d.node(
    'answer',
    496,
    816,
    976,
    216,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff') +
      text(x + 8, y + 38, content.answer[0], 34, '#181818', 600, f) +
      text(x + 8, y + 76, content.answer[1], 19, '#62605f', 400, f) +
      text(x + 8, y + 119, '回答建立在检索到的知识之上。', 25, '#181818', 500, f) +
      text(x + 8, y + 158, '引用保留出处，让结论可以继续核对。', 20, '#62605f', 400, f) +
      rect(x + 8, y + 181, 436, 30, '#f6f6f5', 8) +
      text(x + 20, y + 202, '来源  /  knowledge.md · 相关原文片段', 15, '#62605f', 400, f) +
      circle(x + 458, y + 195, 3, '#2685ff'),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [248, ys[i] + 124],
        [248, ys[i + 1] - 4],
      ],
      '#8d8b87',
      1.6,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [636, 428],
      [636, 540],
    ],
    '#696b70',
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [780, 622],
      [868, 622],
    ],
    '#696b70',
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1212, 622],
      [1300, 622],
    ],
    '#696b70',
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1388, 704],
      [1388, 812],
    ],
    '#696b70',
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [400, 892],
      [448, 892],
      [448, 748],
      [636, 748],
      [636, 704],
    ],
    '#696b70',
    1.8,
  );
  return d;
}
