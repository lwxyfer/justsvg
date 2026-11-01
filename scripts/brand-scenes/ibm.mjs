import { Diagram, rect, path, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function ibm(t) {
  const d = new Diagram('ibm', t),
    f = t.font;
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(64, 112, 'Retrieval-augmented generation', 52, t.ink, 400, f, 'letter-spacing="-1"') +
      text(66, 169, 'Clear boundaries. Explicit relationships.', 24, t.muted, 400, f) +
      path('M64 216H1536', '#c6c6c6', 1),
  );
  for (const [x, w, title] of [
    [64, 464, 'Knowledge pipeline'],
    [600, 400, 'Retrieval runtime'],
    [1072, 464, 'Generation'],
  ])
    d.add(
      rect(x, 264, w, 744, '#fff', 0, '#8d8d8d', 1.5) +
        rect(x, 264, w, 56, '#e8e8e8') +
        text(x + 24, 299, title, 22, t.ink, 500, f),
    );
  const ys = [360, 512, 664, 816];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      112,
      ys[i],
      352,
      96,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff', 0, '#0f62fe', 1.5) +
        glyph(key, x + 24, y + 27, 40, '#161616', 1.5) +
        text(x + 88, y + 40, content[key][0], 24, t.ink, 600, f) +
        text(x + 88, y + 72, content[key][1], 16, t.muted, 400, f),
    ),
  );
  const block = (key, x, y, w, h, fill = '#fff', title = t.ink, body = t.muted) =>
    d.node(
      key,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fill, 0, '#0f62fe', 1.5) +
        text(x + 24, y + 42, content[key][0], 26, title, 600, f) +
        text(x + 24, y + 76, content[key][1], 17, body, 400, f) +
        (key === 'llm' ? glyph('llm', x + w - 96, y + 96, 64, '#fff', 1.5) : ''),
    );
  block('query', 648, 328, 304, 96);
  block('retrieve', 648, 552, 304, 128, '#e5f6ff');
  block('context', 648, 848, 304, 112);
  block('llm', 1120, 512, 352, 192, '#0f62fe', '#fff', '#fff');
  block('answer', 1120, 848, 352, 112);
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [288, ys[i] + 100],
        [288, ys[i + 1] - 4],
      ],
      t.accent,
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [800, 428],
      [800, 548],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [800, 684],
      [800, 844],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [956, 904],
      [1032, 904],
      [1032, 608],
      [1116, 608],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1296, 708],
      [1296, 844],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [468, 864],
      [568, 864],
      [568, 616],
      [644, 616],
    ],
    t.accent,
    1.8,
    [478, 795, '索引供给'],
  );
  return d;
}
