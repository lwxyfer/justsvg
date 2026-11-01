import { Diagram, rect, path, circle, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function airbnb(t) {
  const d = new Diagram('airbnb', t),
    f = t.font;
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(72, 110, 'A journey to a grounded answer.', 54, t.ink, 600, f, 'letter-spacing="-1.4"') +
      text(
        74,
        166,
        'Explore the knowledge. Find the context. Bring it together.',
        23,
        t.muted,
        400,
        f,
      ),
  );
  d.add(
    rect(64, 656, 1472, 376, '#f3f5f1', 20) +
      path(
        'M80 956L352 680M160 1030L530 660M90 886L784 1032M760 668L1100 1032M64 920H1536M64 708H1536',
        '#fff',
        16,
      ) +
      path('M80 1010C290 960 282 760 422 682', '#dfeee8', 28),
  );
  const xs = [72, 440, 808, 1176],
    fills = ['#f4e7db', '#e3ece8', '#e7e8f5', '#f4e6e8'];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      xs[i],
      362,
      280,
      228,
      ({ x, y, w }) =>
        rect(x, y, w, 148, fills[i], 18) +
        text(x + 12, y + 184, content[key][0], 26, t.ink, 600, f) +
        text(x + 12, y + 216, content[key][1], 17, t.muted, 400, f) +
        glyph(key, x + 96, y + 28, 88, '#4d4345', 1.2) +
        circle(x + w - 28, y + 28, 13, '#fff') +
        path(`M${x + w - 28} ${y + 35}l-6 -6c-6 -6 2 -12 6 -6c4 -6 12 0 6 6Z`, '#222222', 1.2),
    ),
  );
  d.node(
    'query',
    360,
    208,
    880,
    92,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 46, '#d5d5d5', 1.5) +
      text(x + 38, y + 35, content.query[0], 23, t.ink, 600, f) +
      text(x + 38, y + 66, content.query[1], 17, t.muted, 400, f) +
      path(`M${x + 310} ${y + 24}v44M${x + 604} ${y + 24}v44`, '#dedede') +
      text(x + 344, y + 35, 'Knowledge scope', 16, t.ink, 600, f) +
      text(x + 344, y + 66, 'Documents + context', 17, t.muted, 400, f) +
      circle(x + w - 48, y + 46, 28, '#d70466') +
      glyph('retrieve', x + w - 64, y + 30, 32, '#fff', 1.6),
  );
  const stage = (key, x, y, w, h, fill = '#fff', color = t.ink, body = t.muted) =>
    d.node(
      key,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fill, 16, fill === '#fff' ? '#d6d6d1' : 'none') +
        text(x + 24, y + 38, content[key][0], 26, color, 600, f) +
        text(x + 24, y + 73, content[key][1], 17, body, 400, f) +
        (key === 'llm'
          ? path(
              `M${x + w - 44} ${y + 28}c-14 0 -18 12 -12 23l12 19l12 -19c6 -11 2 -23 -12 -23Z`,
              '#a52a49',
              1.8,
              'none',
            ) + circle(x + w - 44, y + 42, 4, 'none', '#a52a49', 1.5)
          : ''),
    );
  stage('retrieve', 440, 728, 320, 104);
  stage('context', 872, 728, 280, 104);
  stage('llm', 1200, 728, 328, 104);
  stage('answer', 872, 912, 656, 104, '#d70466', '#fff', '#fff');
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [xs[i] + 284, 476],
        [xs[i + 1] - 4, 476],
      ],
      t.accent,
      2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [1244, 254],
      [1516, 254],
      [1516, 668],
      [640, 668],
      [640, 724],
    ],
    t.accent,
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1316, 594],
      [1316, 632],
      [560, 632],
      [560, 724],
    ],
    t.accent,
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [764, 780],
      [868, 780],
    ],
    t.accent,
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1156, 780],
      [1196, 780],
    ],
    t.accent,
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1364, 836],
      [1364, 908],
    ],
    t.accent,
    2,
  );
  return d;
}
