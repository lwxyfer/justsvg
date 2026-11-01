import { Diagram, rect, path, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function slack(t) {
  const d = new Diagram('slack', t),
    f = t.font;
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(
        800,
        112,
        'Put knowledge',
        62,
        t.ink,
        700,
        f,
        'text-anchor="middle" letter-spacing="-1.4"',
      ) +
      text(
        800,
        182,
        'in the conversation.',
        62,
        t.ink,
        700,
        f,
        'text-anchor="middle" letter-spacing="-1.4"',
      ),
  );
  d.add(
    rect(64, 264, 1472, 744, '#4a075d', 14) +
      rect(80, 326, 344, 666, '#5b246b', 8) +
      rect(440, 326, 1080, 666, '#fff', 8) +
      text(112, 306, 'Knowledge workspace', 20, '#fff', 600, f) +
      rect(550, 278, 610, 32, '#783789', 5) +
      glyph('retrieve', 565, 283, 20, '#fff') +
      text(602, 300, 'Search the knowledge flow', 15, '#f5e5fa', 400, f),
  );
  const sourceColors = ['#36c5f0', '#ecb22e', '#e99ac0', '#2eb67d'];
  const ys = [386, 528, 670, 812];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      112,
      ys[i],
      280,
      88,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#f7f0fa', 8) +
        text(x + 64, y + 34, content[key][0], 21, t.ink, 600, f) +
        text(x + 64, y + 62, content[key][1], 16, t.muted, 400, f) +
        rect(x + 16, y + 22, 34, 40, sourceColors[i], 6) +
        glyph(key, x + 20, y + 27, 26, '#252025', 1.6),
    ),
  );
  const message = (key, x, y, w, h, color) =>
    d.node(
      key,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff', 8, '#d9cedc') +
        text(x + 76, y + 36, content[key][0], 24, t.ink, 700, f) +
        text(x + 76, y + 68, content[key][1], 17, t.muted, 400, f) +
        rect(x + 20, y + 20, 38, 38, color, 9) +
        glyph(key, x + 25, y + 25, 28, '#1d1c1d') +
        (key === 'context' ? path(`M${x + 76} ${y + 88}h${w - 108}`, '#dfd5e2', 2) : '') +
        (key === 'llm'
          ? text(x + 24, y + 114, 'Question + grounded context', 17, '#4a075d', 600, f) +
            path(`M${x + 24} ${y + 135}h${w - 48}`, '#d6c4de', 2)
          : '') +
        (key === 'answer'
          ? rect(x + 76, y + 88, w - 100, 30, '#e6f5ed', 5) +
            text(x + 88, y + 109, 'Evidence linked to the response', 15, '#176342', 500, f)
          : ''),
    );
  message('query', 492, 386, 360, 104, '#36c5f0');
  message('retrieve', 948, 386, 500, 104, '#2eb67d');
  message('context', 948, 578, 500, 112, '#ecb22e');
  message('llm', 492, 772, 360, 160, '#e99ac0');
  message('answer', 948, 792, 500, 140, '#36c5f0');
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [252, ys[i] + 92],
        [252, ys[i + 1] - 4],
      ],
      '#eadbf0',
      1.8,
    );
  d.edge('query', 'retrieve', [
    [856, 426],
    [944, 426],
  ]);
  d.edge('retrieve', 'context', [
    [1198, 494],
    [1198, 574],
  ]);
  d.edge('context', 'llm', [
    [944, 634],
    [900, 634],
    [900, 742],
    [672, 742],
    [672, 768],
  ]);
  d.edge('llm', 'answer', [
    [856, 862],
    [944, 862],
  ]);
  d.edge(
    'index',
    'retrieve',
    [
      [396, 856],
      [416, 856],
      [416, 528],
      [916, 528],
      [916, 466],
      [944, 466],
    ],
    '#987fa1',
    1.8,
  );
  return d;
}
