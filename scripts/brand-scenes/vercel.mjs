import { Diagram, rect, path, circle, text } from './document.mjs';
export default function vercel(t) {
  const d = new Diagram('vercel', t),
    f = t.font,
    mono = 'Geist Mono, Menlo, Consolas, monospace';
  // Native start markers follow the bound route during node edits and resizing.
  d.startMarker = `${d.id}-port`;
  d.defs.push(
    `<marker id="${d.startMarker}" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8"><circle cx="5" cy="5" r="3.75" fill="#000" stroke="#a1a1a1" stroke-width="1.625"/></marker>`,
  );
  d.add(
    rect(0, 0, 1600, 1100, '#000') +
      text(72, 115, 'Knowledge.', 78, '#ededed', 500, f, 'letter-spacing="-2.8"') +
      text(72, 207, 'Ready to connect.', 78, '#ededed', 500, f, 'letter-spacing="-2.8"') +
      text(76, 263, 'source → retrieve → generate', 18, '#a1a1a1', 400, mono),
  );
  d.add(
    text(1110, 111, 'knowledge-pipeline', 22, '#ededed', 500, f) +
      text(1110, 145, 'reference / rag', 13, '#a1a1a1', 400, mono) +
      rect(1110, 170, 88, 28, '#1a1a1a', 6, '#333') +
      path('M1123 178v10m0-7h7v-3m-7 10h7v-3', '#a1a1a1', 1.3) +
      text(1142, 189, 'main', 13, '#ededed', 400, mono) +
      rect(1212, 170, 100, 28, '#102217', 6, '#294c36') +
      circle(1227, 184, 3, '#62c073') +
      text(1239, 189, 'Preview', 13, '#9fdfab', 500, f) +
      text(1110, 233, 'Illustrative deployment', 13, '#a1a1a1', 400, f),
  );
  // Major guides align to the four source columns; minor lines subdivide those bays.
  const guides = [64, 408, 752, 1096, 1536];
  for (let i = 0; i < guides.length - 1; i++) {
    const divisions = i === 3 ? 5 : 4;
    for (let j = 1; j < divisions; j++)
      d.add(
        path(`M${guides[i] + ((guides[i + 1] - guides[i]) * j) / divisions} 310V1034`, '#171717'),
      );
  }
  for (const x of guides) d.add(path(`M${x} 310V1034`, '#303030'));
  for (let y = 310; y <= 1034; y += 92) d.add(path(`M64 ${y}H1536`, '#1e1e1e'));
  d.add(path('M64 1034H1536', '#303030'));
  for (const [x, y] of [
    [64, 310],
    [1536, 310],
    [64, 1034],
    [1536, 1034],
  ])
    d.add(path(`M${x - 6} ${y}h12M${x} ${y - 6}v12`, '#777', 1));
  const xs = [88, 432, 776, 1120],
    ws = [250, 250, 250, 310];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      xs[i],
      348,
      ws[i],
      120,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#0a0a0a', 6, '#3d3d3d') +
        path(
          `M${x + w - 40} ${y + 19}h14l5 5v18h-19zM${x + w - 26} ${y + 19}v6h5`,
          '#a1a1a1',
          1.4,
        ) +
        path(`M${x + 1} ${y + 88}h${w - 2}`, '#292929') +
        d.label(key, x + 21, y + 42, 23, y + 76, '#ededed', f, 500) +
        text(
          x + 22,
          y + 103,
          ['/knowledge', '/parse', '/encode', '/index'][i],
          12,
          '#a1a1a1',
          400,
          mono,
        ),
    ),
  );
  d.node(
    'query',
    88,
    708,
    290,
    116,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#111', 6, '#3d3d3d') +
      d.label('query', x + 22, y + 36, 25, y + 69, '#ededed', f, 500) +
      text(x + 22, y + 100, 'POST /query', 12, '#a1a1a1', 400, mono),
  );
  d.node(
    'retrieve',
    520,
    636,
    322,
    132,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#111', 6, '#888') +
      circle(x + w - 37, y + 35, 9, 'none', '#ededed', 1.5) +
      path(`M${x + w - 30} ${y + 42}l6 6`, '#ededed', 1.5) +
      d.label('retrieve', x + 23, y + 48, 29, y + 85, '#ededed', f, 500) +
      path(`M${x + 1} ${y + 97}h${w - 2}`, '#292929') +
      text(x + 24, y + 119, 'search.resolve()', 12, '#a1a1a1', 400, mono),
  );
  d.node(
    'context',
    520,
    884,
    322,
    132,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#0a0a0a', 6, '#3d3d3d') +
      d.label('context', x + 23, y + 48, 29, y + 85, '#ededed', f, 500) +
      path(`M${x + 1} ${y + 97}h${w - 2}`, '#292929') +
      text(x + 24, y + 119, 'context.assemble()', 12, '#a1a1a1', 400, mono),
  );
  d.node(
    'llm',
    1100,
    676,
    340,
    176,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#111', 12, '#666') +
      d.label('llm', x + 25, y + 53, 39, y + 90, '#ededed', f, 500) +
      rect(x + 22, y + 127, w - 44, 30, '#1a1a1a', 5) +
      text(x + 34, y + 147, 'stream: true', 13, '#8ec8f6', 400, mono) +
      path(
        `M${x + 232} ${y + 42}l39-19 39 19v52l-39 19-39-19zM${x + 232} ${y + 42}l39 19 39-19m-39 19v52`,
        '#ededed',
        1.4,
      ),
  );
  d.node(
    'answer',
    1100,
    888,
    340,
    136,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#001e3b', 6, '#419dff') +
      d.label('answer', x + 24, y + 39, 26, y + 74, '#ededed', f, 500) +
      text(x + 24, y + 110, 'text/event-stream', 12, '#8ec8f6', 400, mono) +
      circle(x + w - 28, y + 26, 5, '#69b8ff'),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [342, 408],
      [428, 408],
    ],
    '#a1a1a1',
    1.4,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [686, 408],
      [772, 408],
    ],
    '#a1a1a1',
    1.4,
  );
  d.edge(
    'embed',
    'index',
    [
      [1030, 408],
      [1116, 408],
    ],
    '#a1a1a1',
    1.4,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1275, 472],
      [1275, 556],
      [681, 556],
      [681, 632],
    ],
    '#a1a1a1',
    1.4,
    [1050, 541, '索引供给'],
  );
  d.edge(
    'query',
    'retrieve',
    [
      [382, 766],
      [450, 766],
      [450, 702],
      [516, 702],
    ],
    '#ededed',
    1.4,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [681, 772],
      [681, 880],
    ],
    '#ededed',
    1.4,
  );
  d.edge(
    'context',
    'llm',
    [
      [846, 950],
      [992, 950],
      [992, 764],
      [1096, 764],
    ],
    '#ededed',
    1.4,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1270, 856],
      [1270, 884],
    ],
    '#419dff',
    1.6,
  );
  return d;
}
