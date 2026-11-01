import { Diagram, rect, path, circle, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function miro(t) {
  const d = new Diagram('miro', t),
    f = t.font;
  d.defs.push(
    '<pattern id="miro-canvas-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.8" fill="#d8d6d1"/></pattern>',
  );
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(
        800,
        116,
        'Make knowledge a shared direction.',
        56,
        t.ink,
        400,
        'Georgia, Times New Roman, serif',
        'text-anchor="middle" letter-spacing="-1.2"',
      ) +
      text(
        800,
        172,
        'A retrieval-augmented generation canvas',
        23,
        t.muted,
        400,
        f,
        'text-anchor="middle"',
      ) +
      rect(48, 220, 1504, 800, '#fff', 24) +
      rect(48, 220, 1504, 800, 'url(#miro-canvas-dots)', 24),
  );
  const xs = [104, 456, 808, 1160],
    fills = ['#fff5ad', '#f6d5e6', '#d3e8fd', '#dbefb7'];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      xs[i],
      306,
      240,
      152,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fills[i]) +
        text(x + 22, y + 46, content[key][0], 24, t.ink, 600, f) +
        text(x + 22, y + 80, content[key][1], 17, t.muted, 400, f) +
        glyph(key, x + 22, y + 104, 30, t.ink, 1.4) +
        path(`M${x + w - 24} ${y + h}l24 -24h-24Z`, 'none', 0, '#fff', 'fill-opacity="0.55"'),
    ),
  );
  d.node(
    'query',
    104,
    684,
    280,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 16, '#bcbab2', 1.4) +
      text(x + 24, y + 43, content.query[0], 26, t.ink, 600, f) +
      text(x + 24, y + 79, content.query[1], 17, t.muted, 400, f) +
      glyph('query', x + 216, y + 94, 30, t.ink),
  );
  d.node(
    'retrieve',
    496,
    650,
    280,
    212,
    ({ x, y, w, h }) =>
      path(
        `M${x + w / 2} ${y}L${x + w} ${y + h / 2}L${x + w / 2} ${y + h}L${x} ${y + h / 2}Z`,
        '#5846cc',
        1.5,
        '#ede9ff',
      ) +
      text(x + w / 2, y + 98, content.retrieve[0], 25, t.ink, 600, f, 'text-anchor="middle"') +
      text(x + w / 2, y + 132, content.retrieve[1], 17, t.muted, 400, f, 'text-anchor="middle"'),
  );
  d.node(
    'context',
    888,
    684,
    232,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 4, '#bcbab2', 1.4) +
      text(x + 24, y + 43, content.context[0], 26, t.ink, 600, f) +
      text(x + 24, y + 79, content.context[1], 17, t.muted, 400, f) +
      path(`M${x + 24} ${y + 108}h168M${x + 24} ${y + 121}h115`, '#a5a297', 2),
  );
  d.node(
    'llm',
    1224,
    654,
    248,
    204,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#25251f', 16) +
      text(x + 24, y + 43, content.llm[0], 30, '#fff', 600, f) +
      text(x + 24, y + 80, content.llm[1], 17, '#deddd1', 400, f) +
      glyph('llm', x + 150, y + 106, 62, '#ffe44d', 1.4),
  );
  d.node(
    'answer',
    1160,
    898,
    312,
    88,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#ffe44d', 10) +
      text(x + 24, y + 34, content.answer[0], 25, t.ink, 600, f) +
      text(x + 24, y + 65, content.answer[1], 17, t.muted, 400, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [xs[i] + 244, 382],
        [xs[i + 1] - 4, 382],
      ],
      t.accent,
      2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [388, 756],
      [492, 756],
    ],
    t.accent,
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [780, 756],
      [884, 756],
    ],
    t.accent,
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1124, 756],
      [1220, 756],
    ],
    t.accent,
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1348, 862],
      [1348, 894],
    ],
    t.accent,
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1280, 462],
      [1280, 520],
      [636, 520],
      [636, 646],
    ],
    t.accent,
    2,
  );
  d.add(circle(636, 520, 4, '#5846cc'));
  return d;
}
