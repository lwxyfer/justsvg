import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function xiaohongshu(t) {
  const d = new Diagram('xiaohongshu', t),
    f = t.font;
  d.add(
    rect(0, 0, 1600, 1100, '#fafafa') +
      text(72, 116, '把知识，连成答案。', 64, '#252525', 700, f) +
      text(76, 177, '从一篇知识笔记，到一份有据可查的回答', 24, '#646060', 400, f) +
      rect(72, 212, 88, 6, '#ff2442', 3),
  );
  const ys = [270, 454, 638, 822],
    fills = ['#eeeae0', '#f5e6be', '#d8e8dd', '#e7e3f0'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, 72, ys[i], 600, 140, ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, '#fff', 24) +
        text(x + 170, y + 43, content[k][0], 28, '#252525', 600, f) +
        text(x + 170, y + 81, content[k][1], 18, '#646060', 400, f) +
        text(
          x + 170,
          y + 115,
          ['知识的原始出处', '把长文切成可引用段落', '将语义变成向量', '让相关内容能够被找到'][i],
          16,
          '#646060',
          400,
          f,
        ) +
        rect(x + 18, y + 16, 116, 108, fills[i], 18);
      if (i === 0)
        s +=
          rect(x + 38, y + 32, 47, 70, '#fffdf8', 3, '#a9987f') +
          rect(x + 68, y + 43, 45, 64, '#f7f5ee', 3, '#a9987f') +
          path(
            `M${x + 48} ${y + 47}h24m-24 13h24m-24 13h24M${x + 78} ${y + 59}h23m-23 13h23m-23 13h23`,
            '#8b765a',
            1.3,
          );
      if (i === 1)
        s += [0, 1, 2]
          .map((j) => rect(x + 35, y + 36 + j * 24, 80 - j * 8, 16, '#fff9e7', 3, '#baa063'))
          .join('');
      if (i === 2)
        s +=
          path(`M${x + 42} ${y + 92}l34 -51l35 51Zm34 -51v65`, '#73927e', 1.5) +
          [
            [42, 92],
            [76, 41],
            [111, 92],
            [76, 106],
          ]
            .map(([a, b]) => circle(x + a, y + b, 5, '#4b7d65'))
            .join('');
      if (i === 3)
        s +=
          rect(x + 37, y + 35, 78, 70, '#f8f7fb', 5, '#9c8daf') +
          path(`M${x + 37} ${y + 58}h78m-78 23h78m-52 -46v70m26 -70v70`, '#ad9fbc', 1.1) +
          circle(x + 50, y + 47, 4, '#866695') +
          circle(x + 76, y + 70, 4, '#866695') +
          circle(x + 102, y + 93, 4, '#866695');
      return s;
    }),
  );
  d.node(
    'query',
    824,
    270,
    696,
    104,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 24) +
      d.label('query', x + 28, y + 36, 28, y + 71) +
      text(x + 272, y + 60, '我想了解……', 24, '#646060', 400, f),
  );
  d.node(
    'retrieve',
    824,
    478,
    696,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 24) +
      d.label('retrieve', x + 28, y + 40, 28, y + 77) +
      rect(x + 286, y + 26, 378, 92, '#fff0f1', 16) +
      text(x + 308, y + 63, '沿着问题，找到相关笔记', 21, '#a1263e', 500, f) +
      text(x + 308, y + 98, '语义匹配 / 保留原文出处', 16, '#8c4c59', 400, f),
  );
  d.node(
    'context',
    824,
    714,
    320,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 22) +
      d.label('context', x + 24, y + 38, 27, y + 73) +
      text(x + 24, y + 115, '原文片段 + 出处', 18, '#646060', 400, f),
  );
  d.node(
    'llm',
    1240,
    714,
    280,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#ff2442', 22) +
      text(x + 24, y + 38, content.llm[0], 28, '#fff', 600, f) +
      text(x + 24, y + 73, content.llm[1], 18, '#fff', 400, f) +
      text(x + 24, y + 115, '理解 · 综合 · 表达', 18, '#fff', 400, f),
  );
  d.node(
    'answer',
    824,
    942,
    696,
    96,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 22) +
      d.label('answer', x + 26, y + 35, 28, y + 69) +
      text(x + 258, y + 55, '答案有出处，知识可追溯。', 23, '#a1263e', 500, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [372, ys[i] + 144],
        [372, ys[i + 1] - 4],
      ],
      '#a68c8d',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [1172, 378],
      [1172, 474],
    ],
    '#a1263e',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [984, 626],
      [984, 710],
    ],
    '#a1263e',
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1148, 786],
      [1236, 786],
    ],
    '#a1263e',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1380, 862],
      [1380, 938],
    ],
    '#a1263e',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [676, 892],
      [748, 892],
      [748, 550],
      [820, 550],
    ],
    '#a1263e',
    2,
  );
  return d;
}
