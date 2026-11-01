import { Diagram, rect, path, circle, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function cloudflare(t) {
  const d = new Diagram('cloudflare', t),
    f = t.font;
  d.defs.push(
    '<linearGradient id="cloudflare-orange" x2="0" y2="1"><stop stop-color="#ff5b18"/><stop offset="1" stop-color="#eb4e0b"/></linearGradient>',
  );
  d.defs.push(
    '<pattern id="cloudflare-network-field" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.7" fill="#742a08" fill-opacity="0.12"/></pattern>',
  );
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      rect(48, 48, 1504, 220, 'url(#cloudflare-orange)', 20) +
      rect(48, 48, 1504, 220, 'url(#cloudflare-network-field)', 20) +
      text(
        92,
        135,
        'Knowledge, close to every question.',
        54,
        '#fff',
        500,
        f,
        'letter-spacing="-1.4"',
      ) +
      text(
        94,
        202,
        'Retrieval-augmented generation / an edge-network interpretation',
        24,
        '#fff',
        400,
        f,
      ),
  );
  d.add(
    rect(48, 300, 1504, 716, '#faf9f7', 16) +
      text(80, 330, 'Knowledge pipeline', 16, t.muted, 500, f) +
      text(80, 636, 'Query runtime', 16, t.muted, 500, f),
  );
  for (const r of [132, 154, 174]) d.add(circle(1400, 738, r, 'none', '#f8cfaf', 1.3));
  d.add(path('M1400 564V584M1400 892V912M1226 738H1246M1554 738H1574', '#d27643', 2));
  const xs = [80, 456, 832, 1208];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      xs[i],
      360,
      312,
      128,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff', 10, '#dad6d1') +
        text(x + 78, y + 48, content[key][0], 25, t.ink, 600, f) +
        text(x + 78, y + 83, content[key][1], 17, t.muted, 400, f) +
        glyph(key, x + 24, y + 43, 36, '#a23f12'),
    ),
  );
  const stage = (key, x, y, w, h, fill = '#fff') =>
    d.node(
      key,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fill, 12, key === 'llm' ? '#a23f12' : '#dad6d1', key === 'llm' ? 2 : 1) +
        text(x + 24, y + 43, content[key][0], 26, t.ink, 600, f) +
        text(x + 24, y + 77, content[key][1], 17, t.muted, 400, f) +
        (key === 'llm' ? glyph('llm', x + 80, y + 109, 76, '#a23f12', 1.2) : ''),
    );
  stage('query', 80, 680, 280, 116);
  stage('retrieve', 480, 680, 344, 116);
  stage('context', 944, 680, 280, 116);
  stage('llm', 1280, 628, 240, 220, '#fff5ec');
  stage('answer', 480, 864, 344, 116, '#fff5ec');
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [xs[i] + 316, 424],
        [xs[i + 1] - 4, 424],
      ],
      t.accent,
      2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [364, 738],
      [476, 738],
    ],
    t.accent,
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [828, 738],
      [940, 738],
    ],
    t.accent,
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1228, 738],
      [1276, 738],
    ],
    t.accent,
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1400, 852],
      [1400, 922],
      [828, 922],
    ],
    t.accent,
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1364, 492],
      [1364, 560],
      [652, 560],
      [652, 676],
    ],
    t.accent,
    2,
  );
  return d;
}
