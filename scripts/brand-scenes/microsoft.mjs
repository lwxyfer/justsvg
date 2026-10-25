import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function microsoft(t) {
  const d = new Diagram('microsoft', t),
    f = 'Segoe UI, Arial, PingFang SC, sans-serif';
  d.defs.push(
    `<linearGradient id="${d.id}-blue" x2=".9" y2="1"><stop stop-color="#61d6ff"/><stop offset=".45" stop-color="#1679e9"/><stop offset="1" stop-color="#4943b9"/></linearGradient><linearGradient id="${d.id}-violet" x2="1" y2="1"><stop stop-color="#d5c0ff"/><stop offset="1" stop-color="#7550d9"/></linearGradient><linearGradient id="${d.id}-glass" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#e7f2ff" stop-opacity=".15"/></linearGradient>`,
  );
  d.add(
    rect(0, 0, 1600, 1100, '#eef3fb') +
      text(72, 120, 'Knowledge that', 66, '#242424', 600, f, 'letter-spacing="-1.4"') +
      text(72, 198, 'works together.', 66, '#0f6cbd', 600, f, 'letter-spacing="-1.4"'),
  );
  d.add(
    rect(64, 260, 1472, 770, '#ffffff', 18, '#dce4ef', 1) +
      path('M82 260H1518Q1536 260 1536 278V328H64V278Q64 260 82 260Z', 'none', 0, '#f8fafc') +
      path('M64 328H1536', '#dfe5ec') +
      text(96, 302, 'Knowledge workspace', 20, '#242424', 600, f),
  );
  d.add(
    path('M1398 293h14M1444 286v14h14v-14zM1495 286l13 14m0-14-13 14', '#64748b', 1.5) +
      rect(64, 330, 356, 700, '#f3f6fa', 0) +
      text(94, 357, 'Knowledge pipeline', 16, '#616161', 600, f),
  );
  const ys = [378, 532, 686, 840];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(key, 92, ys[i], 300, 108, ({ x, y, w, h }) => {
      let icon = '';
      if (i === 0)
        icon =
          rect(x + 18, y + 18, 46, 58, `url(#${d.id}-violet)`, 8) +
          rect(x + 26, y + 26, 48, 58, `url(#${d.id}-blue)`, 8) +
          path(`M${x + 34} ${y + 27}h31q8 0 8 8v39`, '#c6edff', 0.8) +
          lines(x + 36, y + 41, [25, 20, 25], '#e5f6ff', 10, 2);
      if (i === 1)
        icon = [0, 1, 2]
          .map(
            (j) =>
              path(
                `M${x + 18} ${y + 25 + j * 19}l40-5 15 10-40 5z`,
                'none',
                0,
                ['#9cdcff', '#65bcf6', '#187bd7'][j],
              ) +
              path(
                `M${x + 33} ${y + 35 + j * 19}l40-5v8l-40 5z`,
                'none',
                0,
                ['#4c9fdb', '#237ec6', '#145fa9'][j],
              ),
          )
          .join('');
      if (i === 2)
        icon = [0, 1, 2]
          .map((j) =>
            [0, 1, 2]
              .map((k) => rect(x + 18 + j * 18, y + 20 + k * 18, 13, 13, `url(#${d.id}-blue)`, 4))
              .join(''),
          )
          .join('');
      if (i === 3)
        icon =
          rect(x + 19, y + 20, 55, 64, `url(#${d.id}-blue)`, 15) +
          [0, 1, 2]
            .map((j) => path(`M${x + 24} ${y + 27 + j * 18}q22 12 44 0`, '#bfe7ff', 2))
            .join('');
      return (
        rect(x, y, w, h, '#fff', 10, '#e3e8ef', 1) +
        icon +
        d.label(key, x + 94, y + 47, 21, y + 79, '#242424', f)
      );
    }),
  );
  d.add(text(500, 357, 'Ask your knowledge', 24, '#242424', 600, f));
  d.node(
    'query',
    500,
    378,
    576,
    108,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#eef6fd', 14) +
      d.label('query', x + 25, y + 44, 24, y + 77, '#0f6cbd', f) +
      circle(x + w - 42, y + 54, 20, '#0f6cbd') +
      path(`M${x + w - 49} ${y + 54}h14m-7-7 7 7-7 7`, '#fff', 2),
  );
  d.node(
    'retrieve',
    500,
    582,
    266,
    122,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 10, '#ccd9e8') +
      rect(x + 18, y + 15, 36, 5, '#0f6cbd', 2) +
      d.label('retrieve', x + 22, y + 62, 23, y + 96, '#242424', f),
  );
  d.node(
    'context',
    850,
    582,
    266,
    122,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 10, '#ccd9e8') +
      rect(x + 18, y + 15, 36, 5, '#7444bb', 2) +
      d.label('context', x + 22, y + 62, 23, y + 96, '#242424', f),
  );
  d.node(
    'llm',
    1200,
    520,
    240,
    244,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, `url(#${d.id}-blue)`, 26) +
      rect(x + 20, y + 16, 166, 102, `url(#${d.id}-violet)`, 20) +
      rect(x + 42, y + 36, 166, 102, `url(#${d.id}-glass)`, 20, '#daedff', 0.7) +
      path(`M${x + 75} ${y + 85}l40-20 40 20-40 20z`, '#fff', 2) +
      text(x + 30, y + 176, 'LLM', 48, '#fff', 600, f) +
      text(x + 31, y + 211, '生成模型', 18, '#fff', 400, f),
  );
  d.node(
    'answer',
    500,
    858,
    940,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f5f9fe', 12, '#dae7f5') +
      d.label('answer', x + 28, y + 49, 26, y + 85, '#242424', f) +
      rect(x + 28, y + 106, 60, 22, '#deecf9', 5) +
      text(x + 39, y + 122, '引用', 12, '#0f6cbd', 600, f) +
      lines(x + 300, y + 43, [540, 490, 516, 360], '#cedcec', 18, 5),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [242, ys[i] + 112],
        [242, ys[i + 1] - 4],
      ],
      '#6b7f9b',
      1.7,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [633, 490],
      [633, 578],
    ],
    '#0f6cbd',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [770, 643],
      [846, 643],
    ],
    '#0f6cbd',
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1120, 643],
      [1196, 643],
    ],
    '#0f6cbd',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1320, 768],
      [1320, 812],
      [1120, 812],
      [1120, 854],
    ],
    '#0f6cbd',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [396, 894],
      [448, 894],
      [448, 643],
      [496, 643],
    ],
    '#0f6cbd',
    2,
    [427, 974, '索引供给'],
  );
  return d;
}
