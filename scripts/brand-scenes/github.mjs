import { Diagram, rect, path, circle, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function github(t) {
  const d = new Diagram('github', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(64, 116, 'Knowledge, built together.', 60, t.ink, 600, f, 'letter-spacing="-1.8"') +
      text(66, 174, 'Retrieval-augmented generation · a dependency graph', 23, t.muted, 400, f),
  );
  d.add(
    rect(64, 248, 1472, 768, '#0d1117', 12, '#30363d') +
      rect(64, 248, 1472, 64, '#161b22', 12) +
      path('M64 312H1536', '#30363d') +
      glyph('docs', 90, 266, 26, '#9da7b3') +
      text(132, 289, 'knowledge / rag-pipeline.yml', 18, '#c9d1d9', 400, mono) +
      text(1260, 289, 'Illustrative workflow', 15, t.muted, 400, f),
  );
  d.add(
    text(112, 356, 'Knowledge build', 16, t.muted, 500, f) +
      text(516, 356, 'Query → retrieval → generation', 16, t.muted, 500, f),
  );
  const ys = [390, 532, 674, 816];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      112,
      ys[i],
      300,
      96,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#161b22', 6, '#30363d') +
        text(x + 62, y + 37, content[key][0], 23, t.ink, 600, f) +
        text(x + 62, y + 67, content[key][1], 16, t.muted, 400, f) +
        circle(x + 28, y + 44, 11, '#0d1117', '#3fb950', 2) +
        circle(x + 28, y + 44, 3, '#3fb950'),
    ),
  );
  const job = (key, x, y, w, h, fill = '#161b22') =>
    d.node(
      key,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fill, 6, '#30363d') +
        text(x + 24, y + 38, content[key][0], 24, t.ink, 600, f) +
        text(x + 24, y + 68, content[key][1], 16, t.muted, 400, f) +
        (key === 'llm'
          ? path(`M${x} ${y + 84}h${w}`, '#30363d') +
            text(x + 24, y + 115, 'generate(context, query)', 18, '#a5d6ff', 400, mono) +
            text(x + 24, y + 139, 'return answer.with_sources()', 16, '#7ee787', 400, mono)
          : ''),
    );
  job('query', 516, 390, 260, 96);
  job('retrieve', 852, 390, 260, 96);
  job('context', 1188, 390, 260, 96);
  job('llm', 852, 650, 596, 152);
  job('answer', 852, 866, 596, 96, '#12251b');
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [262, ys[i] + 100],
        [262, ys[i + 1] - 4],
      ],
      '#3fb950',
      2,
    );
  d.edge('query', 'retrieve', [
    [780, 438],
    [848, 438],
  ]);
  d.edge('retrieve', 'context', [
    [1116, 438],
    [1184, 438],
  ]);
  d.edge('context', 'llm', [
    [1318, 490],
    [1318, 646],
  ]);
  d.edge(
    'llm',
    'answer',
    [
      [1150, 806],
      [1150, 862],
    ],
    '#3fb950',
  );
  d.edge('index', 'retrieve', [
    [416, 864],
    [468, 864],
    [468, 570],
    [982, 570],
    [982, 490],
  ]);
  return d;
}
