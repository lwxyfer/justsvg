import { diagram, rect, path, text, circle, label, chain, sans, glyph } from './common.mjs';
const mono = 'SFMono-Regular, Menlo, Consolas, monospace';
export function starwars(t) {
  const d = diagram(t);
  d.add(rect(0, 0, 1600, 1100, '#060a12'));
  for (let i = 0; i < 100; i++)
    d.add(
      circle(
        28 + ((i * 179) % 1540),
        26 + ((i * 113) % 1000),
        i % 7 === 0 ? 1.6 : 0.8,
        i % 3 === 0 ? '#97a9bd' : '#465267',
      ),
    );
  d.add(
    text(
      72,
      132,
      'KNOWLEDGE',
      82,
      'none',
      900,
      sans,
      'stroke="#ffe34b" stroke-width="2" letter-spacing="2"',
    ) +
      text(
        72,
        225,
        'COMMAND',
        82,
        'none',
        900,
        sans,
        'stroke="#ffe34b" stroke-width="2" letter-spacing="2"',
      ) +
      text(76, 278, 'RAG SYSTEM / ARCHIVE TO ANSWER', 19, '#a7bdce', 500, mono) +
      path('M72 310H1530', '#344354', 1),
  );
  const plate = (key, x, y, w, h, tag) =>
    d.node(
      key,
      x,
      y,
      w,
      h,
      () =>
        path(
          `M${x + 15} ${y}H${x + w}V${y + h - 15}L${x + w - 15} ${y + h}H${x}V${y + 15}Z`,
          '#56748a',
          1.6,
          '#101c2a',
        ) +
        glyph(key, x + 20, y + 25, 34, '#8ee7ed', 1.7) +
        label(t, key, x + 70, y + 42, 24, '#eef6fa', '#a7bdce') +
        text(x + w - 18, y + 22, tag, 11, '#a7bdce', 400, mono, 'text-anchor="end"'),
    );
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    plate(key, 80, 350 + i * 160, 280, 108, `A-${i + 1}`),
  );
  plate('query', 470, 350, 300, 110, 'IN');
  plate('retrieve', 470, 570, 300, 120, 'SCAN');
  plate('context', 470, 850, 300, 120, 'PACK');
  d.node(
    'llm',
    880,
    470,
    300,
    300,
    () =>
      circle(1030, 620, 150, '#152634', '#8ee7ed', 2) +
      circle(1030, 620, 134, 'none', '#344e63', 1) +
      path('M888 589H1172M886 597H1174M902 693H1158', '#57798d', 1) +
      circle(995, 542, 34, '#0a141f', '#8ee7ed', 1.4) +
      circle(995, 542, 19, 'none', '#57798d', 1) +
      path('M971 518L1019 566M971 566L1019 518', '#57798d', 1) +
      text(1030, 647, 'LLM', 45, '#ffe34b', 700, sans, 'text-anchor="middle"') +
      text(1030, 678, '生成模型', 18, '#c6e2ed', 400, sans, 'text-anchor="middle"') +
      path('M954 721H985M997 721H1040M1052 721H1093', '#8ee7ed', 2),
  );
  d.node(
    'answer',
    1280,
    450,
    250,
    340,
    () =>
      rect(1280, 450, 250, 340, '#101c2a', 2, '#56748a', 1.6) +
      path('M1304 482H1374', '#ffe34b', 3) +
      label(t, 'answer', 1304, 533, 32, '#eef6fa', '#a7bdce') +
      text(1304, 616, 'CITED', 23, '#ffe34b', 600, mono) +
      text(1304, 649, 'TRANSMISSION', 19, '#eef6fa', 500, mono) +
      [0, 1, 2, 3].map((i) => path(`M1304 ${688 + i * 17}h${170 - i * 18}`, '#56748a', 2)).join(''),
  );
  chain(d, ['docs', 'chunks', 'embed', 'index'], 'vertical', '#8ee7ed');
  chain(d, ['query', 'retrieve', 'context'], 'vertical', '#8ee7ed');
  d.edge(
    'index',
    'retrieve',
    [
      [360, 884],
      [415, 884],
      [415, 630],
      [470, 630],
    ],
    '#8ee7ed',
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [770, 910],
      [824, 910],
      [824, 620],
      [880, 620],
    ],
    '#8ee7ed',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1180, 620],
      [1280, 620],
    ],
    '#ffe34b',
    2,
  );
  d.add(text(470, 1012, 'Eight routes. One grounded transmission.', 22, '#a7bdce', 400, mono));
  return d;
}
const flower = (cx, cy, r, color) => {
  let points = [];
  for (let i = 0; i <= 100; i++) {
    const a = (i / 100) * Math.PI * 2,
      rr = r * (0.73 + 0.27 * Math.cos(5 * a));
    points.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return (
    path('M' + points.map((p) => p.join(',')).join('L') + 'Z', color, 3) +
    circle(cx, cy, r * 0.16, 'none', color, 3)
  );
};
export function bikini(t) {
  const d = diagram(t),
    f = 'Chalkboard SE, Comic Sans MS, Kaiti SC, cursive',
    ink = '#203f43';
  d.add(
    rect(0, 0, 1600, 1100, '#9ee6df') +
      path('M0 990Q290 950 550 996T1050 986T1600 990V1100H0Z', 'none', 0, '#f4de9b'),
  );
  for (const [x, y, r, c] of [
    [1170, 150, 100, '#6fc5c2'],
    [1450, 310, 72, '#6fc5c2'],
    [430, 290, 75, '#6fc5c2'],
    [120, 690, 52, '#6fc5c2'],
  ])
    d.add(flower(x, y, r, c));
  d.add(
    text(72, 125, 'Knowledge under the sea', 64, ink, 700, f) +
      text(78, 181, 'A Bikini Bottom-inspired RAG knowledge factory', 24, ink, 400, f),
  );
  for (const [x, y, r] of [
    [1230, 270, 10],
    [1280, 250, 18],
    [1330, 285, 7],
    [970, 320, 12],
    [40, 330, 15],
  ])
    d.add(circle(x, y, r, 'none', '#4d989d', 2));
  d.node(
    'docs',
    70,
    400,
    250,
    200,
    () =>
      path('M126 398L98 345L160 375L174 330L201 374L253 344L237 399', '#305b44', 4, '#69a959') +
      path(
        'M100 400H290L320 548Q320 600 195 600Q70 600 70 548V430Q70 400 100 400Z',
        ink,
        4,
        '#f3b649',
      ) +
      path(
        'M98 430L275 563M110 404L291 535M91 475L246 591M272 423L102 555M287 468L143 593',
        '#bf7b26',
        2,
      ) +
      rect(100, 449, 193, 91, '#fff5cb', 20, ink, 3) +
      label(t, 'docs', 196, 482, 25, ink, ink, 'middle', f),
  );
  d.node(
    'chunks',
    390,
    400,
    210,
    150,
    () =>
      path(
        'M390 416L402 400L430 406L460 400L490 405L520 400L548 404L580 400L600 412L594 445L600 478L595 515L600 538L584 550L552 544L520 550L490 544L458 550L430 545L402 550L390 534L395 504L390 472L395 440Z',
        ink,
        4,
        '#ffe265',
      ) +
      [
        [410, 422, 7],
        [580, 430, 5],
        [416, 526, 5],
        [576, 528, 8],
      ]
        .map(([x, y, r]) => circle(x, y, r, '#d9b43d'))
        .join('') +
      label(t, 'chunks', 495, 463, 27, ink, ink, 'middle', f),
  );
  d.node(
    'embed',
    690,
    400,
    230,
    150,
    () =>
      path(
        'M690 430Q690 400 720 400H890Q920 400 920 430V520Q920 550 890 550H720Q690 550 690 520Z',
        ink,
        4,
        '#f4b4c5',
      ) +
      label(t, 'embed', 805, 463, 25, ink, ink, 'middle', f) +
      path('M727 426L733 435M881 522L889 529', '#bd5f8b', 3),
  );
  d.node(
    'index',
    1060,
    360,
    380,
    220,
    () =>
      rect(1060, 360, 380, 220, '#1f6b70', 28, ink, 4) +
      path('M1078 402H1422', '#4f9797', 3) +
      [0, 1, 2].map((i) => circle(1090 + i * 22, 383, 4, '#c6f1d6')).join('') +
      label(t, 'index', 1250, 462, 34, '#fff7cf', '#e2f4ed', 'middle', f) +
      path('M1100 534H1400', '#b4dfc6', 3) +
      [1120, 1180, 1240, 1300, 1360].map((x) => path(`M${x} 524V545`, '#b4dfc6', 3)).join(''),
  );
  d.node(
    'query',
    72,
    792,
    217,
    146,
    () =>
      path(
        'M94 792H265Q289 792 289 819V892Q289 920 265 920H125L94 938L101 920H94Q72 920 72 894V819Q72 792 94 792Z',
        ink,
        4,
        '#fff9de',
      ) + label(t, 'query', 180, 847, 26, ink, ink, 'middle', f),
  );
  d.node(
    'retrieve',
    390,
    740,
    230,
    230,
    () =>
      circle(505, 855, 115, '#e4c591', ink, 4) +
      circle(505, 855, 93, '#d5f3ef', ink, 3) +
      [0, 1, 2, 3, 4, 5, 6, 7]
        .map((i) =>
          circle(
            505 + 103 * Math.cos((i * Math.PI) / 4),
            855 + 103 * Math.sin((i * Math.PI) / 4),
            4,
            ink,
          ),
        )
        .join('') +
      label(t, 'retrieve', 505, 849, 26, ink, ink, 'middle', f),
  );
  d.node(
    'context',
    720,
    790,
    200,
    150,
    () =>
      rect(720, 790, 200, 150, '#fff0b8', 17, ink, 4) +
      path('M738 809H902M738 919H902', '#c29441', 2) +
      label(t, 'context', 820, 852, 26, ink, ink, 'middle', f),
  );
  d.node(
    'llm',
    1030,
    720,
    220,
    220,
    () =>
      rect(1030, 720, 220, 220, '#f5d976', 15, ink, 4) +
      path('M1030 771L1140 723L1250 771Z', ink, 3, '#d7755b') +
      rect(1050, 790, 180, 124, '#fff6cc', 16, ink, 3) +
      label(t, 'llm', 1140, 838, 38, ink, ink, 'middle', f),
  );
  d.node(
    'answer',
    1330,
    790,
    210,
    160,
    () =>
      rect(1330, 790, 210, 160, '#ffe4cf', 22, ink, 4) +
      label(t, 'answer', 1435, 852, 29, ink, ink, 'middle', f) +
      path('M1375 918Q1435 897 1495 918', '#ad6845', 2),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [320, 475],
      [390, 475],
    ],
    ink,
    3,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [600, 475],
      [690, 475],
    ],
    ink,
    3,
  );
  d.edge(
    'embed',
    'index',
    [
      [920, 475],
      [990, 475],
      [990, 470],
      [1060, 470],
    ],
    ink,
    3,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1250, 580],
      [1250, 648],
      [505, 648],
      [505, 740],
    ],
    ink,
    3,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [290, 865],
      [340, 865],
      [340, 855],
      [390, 855],
    ],
    ink,
    3,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [620, 855],
      [670, 855],
      [670, 865],
      [720, 865],
    ],
    ink,
    3,
  );
  d.edge(
    'context',
    'llm',
    [
      [920, 865],
      [975, 865],
      [975, 830],
      [1030, 830],
    ],
    ink,
    3,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1250, 830],
      [1290, 830],
      [1290, 870],
      [1330, 870],
    ],
    ink,
    3,
  );
  d.add(text(74, 1035, 'A little ocean of knowledge. A properly sourced answer.', 25, ink, 600, f));
  return d;
}
