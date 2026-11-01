import { Diagram, rect, path, text, circle, content } from './document.mjs';
export default function bytedance(t) {
  const d = new Diagram('bytedance', t),
    f = t.font,
    serif = 'Songti SC, SimSun, Georgia, serif';
  d.add(
    rect(0, 0, 1600, 1100, '#398afa') +
      rect(0, 1048, 1600, 52, '#fff') +
      path('M0 0H650V844Q650 1032 462 1032H0Z', 'none', 0, '#fff') +
      text(72, 119, '让知识流动', 58, '#243443', 600, serif) +
      text(72, 194, '让答案生长', 58, '#243443', 600, serif) +
      text(748, 116, 'Knowledge in motion.', 43, '#fff', 500, f) +
      text(750, 166, 'Sources → context → grounded generation', 23, '#fff', 400, f) +
      path('M72 246H560', '#cbd6e1', 1),
  );
  const ys = [288, 464, 640, 816],
    names = ['source / knowledge', 'parse / segment', 'encode / vectors', 'store / retrieve'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, 72, ys[i], 432, 128, ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, '#fff') +
        text(x + 8, y + 34, content[k][0], 29, '#173354', 500, f) +
        text(x + 8, y + 68, content[k][1], 18, '#526174', 400, f) +
        text(x + 8, y + 104, names[i], 14, '#526174', 400, f) +
        path(`M${x + 270} ${y + 12}v104`, '#d4e3ed');
      if (i === 0)
        s += [0, 1, 2]
          .map(
            (j) =>
              rect(
                x + 296 + j * 13,
                y + 18 + j * 8,
                76,
                76,
                ['#ecf6ff', '#d9f5f0', '#b5e9ee'][j],
                6,
                '#418baa',
              ) +
              path(`M${x + 311 + j * 13} ${y + 37 + j * 8}h38m-38 13h30m-30 13h38`, '#44849a', 1.2),
          )
          .join('');
      if (i === 1)
        s += [0, 1, 2]
          .map((j) =>
            rect(
              x + 296,
              y + 22 + j * 29,
              112 - j * 8,
              18,
              ['#b5e9ee', '#d9f5f0', '#dbeaff'][j],
              3,
            ),
          )
          .join('');
      if (i === 2)
        s += Array.from({ length: 15 }, (_, j) =>
          circle(
            x + 300 + ((j * 31) % 102),
            y + 22 + ((j * 23) % 82),
            j % 3 ? 3 : 5,
            j % 3 ? '#398afa' : '#00aaad',
          ),
        ).join('');
      if (i === 3)
        s +=
          rect(x + 296, y + 22, 112, 80, '#eaf6fd', 3, '#7aafc7') +
          path(`M${x + 296} ${y + 48}h112m-112 26h112m-75 -52v80m38 -80v80`, '#7aafc7');
      return s;
    }),
  );
  d.node(
    'query',
    744,
    254,
    728,
    120,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 16) +
      d.label('query', x + 28, y + 38, 28, y + 74) +
      text(x + 310, y + 69, '从一个问题开始', 27, '#173354', 500, f),
  );
  d.node(
    'retrieve',
    744,
    480,
    320,
    160,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12) +
      d.label('retrieve', x + 26, y + 39, 28, y + 76) +
      text(x + 26, y + 125, '关联知识 · 找到依据', 18, '#345a7a', 400, f),
  );
  d.node(
    'context',
    1160,
    480,
    312,
    160,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#d7fcf5', 12) +
      d.label('context', x + 26, y + 39, 28, y + 76) +
      [0, 1, 2].map((j) => rect(x + 26 + j * 84, y + 104, 72, 28, '#b9ebe6', 4)).join(''),
  );
  d.node(
    'llm',
    1160,
    736,
    312,
    184,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#d7fcf5', 12) +
      d.label('llm', x + 26, y + 40, 30, y + 76) +
      [0, 1, 2]
        .map((j) =>
          path(
            `M${x + 170} ${y + 104 + j * 17}l46 -20l46 20l-46 20Z`,
            '#24738a',
            1.3,
            ['#a1dedf', '#c0eee7', '#e9fffa'][j],
          ),
        )
        .join('') +
      text(x + 26, y + 139, '综合', 24, '#173354', 500, f) +
      text(x + 26, y + 166, '有据生成', 16, '#345a7a', 400, f),
  );
  d.node(
    'answer',
    744,
    920,
    320,
    104,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12) + d.label('answer', x + 26, y + 36, 28, y + 71),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [288, ys[i] + 132],
        [288, ys[i + 1] - 4],
      ],
      '#326d94',
      2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [904, 378],
      [904, 476],
    ],
    '#173354',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [1068, 560],
      [1156, 560],
    ],
    '#173354',
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1316, 644],
      [1316, 732],
    ],
    '#173354',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1156, 848],
      [1108, 848],
      [1108, 972],
      [1068, 972],
    ],
    '#173354',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [508, 880],
      [690, 880],
      [690, 560],
      [740, 560],
    ],
    '#173354',
    2,
  );
  return d;
}
