import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function stripe(t) {
  const d = new Diagram('stripe', t),
    f = t.font,
    mono = 'Menlo, Consolas, monospace';
  d.defs.push(
    `<radialGradient id="${d.id}-mesh" cx=".8" cy=".05" r=".9"><stop stop-color="#ffe0ca" stop-opacity=".95"/><stop offset=".45" stop-color="#ffb5d5" stop-opacity=".35"/><stop offset="1" stop-color="#635bff" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${d.id}-spectrum" x2=".9" y2="1"><stop stop-color="#80e9ff"/><stop offset=".35" stop-color="#635bff"/><stop offset=".7" stop-color="#a960ee"/><stop offset="1" stop-color="#ffbfad"/></linearGradient><linearGradient id="${d.id}-core" x2="1" y2="1"><stop stop-color="#b8b3ff"/><stop offset="1" stop-color="#635bff"/></linearGradient>`,
  );
  d.add(
    rect(0, 0, 1600, 1100, '#f6f9fc') +
      path('M970 0H1600V396L760 182Z', 'none', 0, `url(#${d.id}-spectrum)`) +
      path('M970 0H1600V396L760 182Z', 'none', 0, `url(#${d.id}-mesh)`) +
      text(72, 116, 'Knowledge,', 78, '#0a2540', 600, f, 'letter-spacing="-2.8"') +
      text(72, 208, 'engineered to flow.', 78, '#0a2540', 600, f, 'letter-spacing="-2.8"') +
      text(76, 266, '把知识输入，转化为有依据的输出。', 22, '#425466', 400, f),
  );
  d.add(path('M64 312H996', '#d8e2ee') + text(96, 336, 'Knowledge inputs', 15, '#425466', 600, f));
  const ys = [362, 516, 670, 824];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      96,
      ys[i],
      304,
      108,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff', 10, '#d9e2ed') +
        rect(x + 18, y + 20, 42, 52, ['#e5efff', '#eae7ff', '#f1e6ff', '#e2f5f2'][i], 7) +
        path(
          i === 0
            ? `M${x + 29} ${y + 29}h13l7 7v24h-20zM${x + 42} ${y + 29}v8h7m-15 8h10m-10 7h10`
            : i === 1
              ? `M${x + 28} ${y + 31}h22m-22 11h22m-22 11h22`
              : i === 2
                ? `M${x + 29} ${y + 53}l10-20 11 17`
                : `M${x + 28} ${y + 34}q11-8 22 0v22q-11 8-22 0zM${x + 28} ${y + 34}q11 8 22 0m-22 11q11 8 22 0`,
          '#635bff',
          2,
        ) +
        (i === 2
          ? [
              [29, 53],
              [39, 33],
              [50, 50],
            ]
              .map(([dx, dy]) => circle(x + dx, y + dy, 3, '#635bff'))
              .join('')
          : '') +
        d.label(key, x + 82, y + 46, 22, y + 78, '#0a2540', f),
    ),
  );
  d.node(
    'query',
    600,
    362,
    340,
    94,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12, '#c6c0ff') +
      d.label('query', x + 23, y + 37, 23, y + 67, '#0a2540', f),
  );
  d.node(
    'retrieve',
    600,
    546,
    340,
    208,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 16, '#c6c0ff') +
      rect(x + 26, y + 24, 56, 56, `url(#${d.id}-core)`, 12) +
      path(`M${x + 38} ${y + 46}l16-9 16 9-16 9zM${x + 38} ${y + 56}l16 9 16-9`, '#fff', 2) +
      d.label('retrieve', x + 26, y + 125, 32, y + 161, '#0a2540', f) +
      text(x + w - 26, y + 186, 'SEARCH / CONTEXT', 11, '#635bff', 500, mono, 'text-anchor="end"'),
  );
  d.node(
    'context',
    600,
    860,
    340,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12, '#d9e2ed') +
      d.label('context', x + 24, y + 46, 25, y + 81, '#0a2540', f) +
      lines(x + w - 80, y + 31, [48, 40, 48], '#b8c4d4', 13, 2),
  );
  d.node(
    'llm',
    1120,
    478,
    350,
    258,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#0a2540', 16) +
      text(x + 28, y + 71, 'LLM', 57, '#fff', 600, f) +
      text(x + 30, y + 111, '生成模型', 19, '#c4d5e9', 400, f) +
      path(`M${x + 28} ${y + 145}h${w - 56}`, '#426181') +
      text(x + 30, y + 180, 'POST /generate', 16, '#bcb6ff', 400, mono) +
      text(x + 30, y + 217, 'context → completion', 14, '#c4d5e9', 400, mono),
  );
  d.node(
    'answer',
    1120,
    874,
    350,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12, '#d9e2ed') +
      d.label('answer', x + 25, y + 45, 27, y + 80, '#0a2540', f) +
      circle(x + w - 42, y + 43, 17, '#087f7c') +
      path(`M${x + w - 49} ${y + 43}l5 5 10-12`, '#fff', 2) +
      lines(x + 26, y + 111, [260, 205], '#c5d4e3', 13, 3),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [248, ys[i] + 112],
        [248, ys[i + 1] - 4],
      ],
      '#74859a',
      1.6,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [770, 460],
      [770, 542],
    ],
    '#635bff',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [770, 758],
      [770, 856],
    ],
    '#635bff',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [404, 878],
      [500, 878],
      [500, 650],
      [596, 650],
    ],
    '#635bff',
    2,
    [430, 981, '索引供给'],
  );
  d.edge(
    'context',
    'llm',
    [
      [944, 916],
      [1030, 916],
      [1030, 607],
      [1116, 607],
    ],
    '#635bff',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1295, 740],
      [1295, 870],
    ],
    '#635bff',
    2,
  );
  return d;
}
