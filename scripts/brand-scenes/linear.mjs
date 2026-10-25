import { Diagram, rect, path, circle, text } from './document.mjs';
export default function linear(t) {
  const d = new Diagram('linear', t),
    f = t.font,
    mono = 'Menlo, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, '#101012') +
      text(72, 114, 'From signals', 72, '#f4f5f8', 500, f, 'letter-spacing="-2.5"') +
      text(72, 200, 'to a clear answer.', 72, '#aaa9a6', 500, f, 'letter-spacing="-2.5"'),
  );
  d.add(
    rect(64, 280, 1472, 752, '#171719', 12, '#39393d') +
      path('M64 334H488V1032H76Q64 1032 64 1020Z', 'none', 0, '#131315') +
      path('M64 334H1536M488 334V1032M488 366H1536', '#2b2b2e') +
      text(96, 362, 'Knowledge sources', 13, '#aaa9a6', 500, f) +
      text(520, 355, 'All issues', 13, '#eeedeb', 500, f) +
      text(615, 355, 'Active', 13, '#aaa9a6', 400, f) +
      text(690, 355, 'Completed', 13, '#aaa9a6', 400, f) +
      path('M520 365h64', '#aaa9a6', 1.5) +
      text(92, 314, 'Workspace  /  Knowledge', 16, '#aaa9a6', 400, f) +
      text(520, 314, 'Retrieval pipeline', 16, '#eeedeb', 500, f) +
      path('M1400 300v16m7-16v16m7-16v16M1397 304h6m1 7h6m1-9h6', '#aaa9a6', 1.2) +
      text(1428, 314, 'View', 14, '#aaa9a6', 400, f),
  );
  const ys = [380, 506, 632, 758];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      96,
      ys[i],
      348,
      88,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#131315', 0) +
        circle(x + 16, y + 24, 9, 'none', '#aaa9a6', 1.5) +
        path(`M${x + 16} ${y + 15}a9 9 0 0 1 9 9`, '#aaa9a6', 2.3) +
        d.label(key, x + 42, y + 34, 21, y + 65, '#c9c8c5', f, 500) +
        text(
          x + w - 8,
          y + 25,
          `SRC-${String(i + 1).padStart(2, '0')}`,
          11,
          '#aaa9a6',
          400,
          mono,
          'text-anchor="end"',
        ),
    ),
  );
  d.node(
    'query',
    552,
    380,
    362,
    98,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#202022', 10, '#3d3d40') +
      d.label('query', x + 23, y + 40, 23, y + 72, '#f4f5f8', f, 500),
  );
  d.node(
    'retrieve',
    552,
    594,
    362,
    122,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#24242b', 10, '#717589') +
      circle(x + 25, y + 25, 8, '#929bf5') +
      d.label('retrieve', x + 24, y + 66, 27, y + 100, '#f4f5f8', f, 500) +
      text(x + 42, y + 29, 'RAG-05', 12, '#aaa9a6', 400, mono) +
      rect(x + w - 118, y + 14, 96, 23, '#303038', 5) +
      text(x + w - 106, y + 30, 'In progress', 12, '#d6d6dd', 400, f),
  );
  d.node(
    'context',
    1020,
    594,
    406,
    122,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#1c1c1f', 8, '#3d3d40') +
      path(`M${x + 24} ${y + 20}h17v16h-17zM${x + 28} ${y + 25}h9m-9 5h6`, '#aaa9a6', 1.3) +
      d.label('context', x + 24, y + 66, 27, y + 100, '#eeedeb', f, 500),
  );
  d.node(
    'llm',
    1020,
    838,
    406,
    140,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#1c1c1f', 8, '#3d3d40') +
      d.label('llm', x + 24, y + 46, 29, y + 80, '#eeedeb', f, 500) +
      text(x + 25, y + 114, 'RAG-07 / generation', 12, '#aaa9a6', 400, mono) +
      circle(x + w - 31, y + 35, 6, '#929bf5'),
  );
  d.node(
    'answer',
    552,
    860,
    362,
    118,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#1b211d', 10, '#3c5143') +
      d.label('answer', x + 24, y + 47, 27, y + 81, '#e2ede3', f, 500) +
      circle(x + w - 31, y + 36, 12, '#8ad4b1') +
      path(`M${x + w - 36} ${y + 36}l4 4 6-8`, '#1b211d', 1.8),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [270, ys[i] + 92],
        [270, ys[i + 1] - 4],
      ],
      '#939390',
      1.4,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [733, 482],
      [733, 590],
    ],
    '#aaa9a6',
    1.6,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [918, 655],
      [1016, 655],
    ],
    '#a5a5a2',
    1.6,
  );
  d.edge(
    'context',
    'llm',
    [
      [1223, 720],
      [1223, 834],
    ],
    '#aaa9a6',
    1.6,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1016, 908],
      [958, 908],
      [958, 919],
      [918, 919],
    ],
    '#a5a5a2',
    1.6,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [448, 802],
      [510, 802],
      [510, 655],
      [548, 655],
    ],
    '#a5a5a2',
    1.6,
    [422, 898, '索引供给'],
  );
  return d;
}
