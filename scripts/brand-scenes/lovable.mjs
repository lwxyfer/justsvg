import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function lovable(t) {
  const d = new Diagram('lovable', t),
    f = t.font;
  // The brand hub's Fill backgrounds blend full-spectrum fields, not equally sized stripes.
  d.defs.push(
    '<radialGradient id="lovable-blue" cx="0.12" cy="0.72" r="0.85"><stop stop-color="#4b73ff"/><stop offset="0.55" stop-color="#bbc1ff"/><stop offset="1" stop-color="#f7f4ed" stop-opacity="0"/></radialGradient>',
    '<radialGradient id="lovable-warm" cx="0.85" cy="1" r="0.88"><stop stop-color="#ff6d1b"/><stop offset="0.35" stop-color="#ff0178"/><stop offset="0.7" stop-color="#ffa6f9" stop-opacity="0.75"/><stop offset="1" stop-color="#f7f4ed" stop-opacity="0"/></radialGradient>',
    '<linearGradient id="lovable-object" x2="0.85" y2="1"><stop stop-color="#4e93ff"/><stop offset="0.45" stop-color="#bbc1ff"/><stop offset="0.7" stop-color="#ffa6f9"/><stop offset="1" stop-color="#ff6d1b"/></linearGradient>',
  );
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      rect(0, 160, 1600, 940, 'url(#lovable-blue)') +
      rect(0, 160, 1600, 940, 'url(#lovable-warm)') +
      text(
        800,
        105,
        'An idea, with knowledge behind it.',
        56,
        t.ink,
        600,
        f,
        'text-anchor="middle" letter-spacing="-2"',
      ) +
      text(
        800,
        159,
        'A retrieval-augmented generation diagram',
        21,
        t.muted,
        400,
        f,
        'text-anchor="middle"',
      ),
  );
  const ys = [306, 480, 654, 828];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, 88, ys[i], 280, 128, ({ x, y, w, h }) => {
      let shape =
        rect(x, y, w, h, '#fff', 14, '#ffffff', 1, 'fill-opacity="0.86"') +
        text(x + 22, y + 34, content[k][0], 24, t.ink, 500, f) +
        text(x + 22, y + 64, content[k][1], 16, t.muted, 400, f);
      if (i === 0)
        shape += path(`M${x + 22} ${y + 88}h210M${x + 22} ${y + 103}h156`, '#a8a6bc', 1.4);
      if (i === 1)
        shape += [0, 1, 2]
          .map((j) =>
            rect(x + 22 + j * 76, y + 86, 64, 22, ['#e5e9ff', '#efdcff', '#ffe1e9'][j], 4),
          )
          .join('');
      if (i === 2)
        shape += Array.from({ length: 9 }, (_, j) =>
          circle(
            x + 26 + j * 26,
            y + 96 + ((j % 3) - 1) * 7,
            3,
            ['#4b73ff', '#9b50b3', '#e34f7c'][j % 3],
          ),
        ).join('');
      if (i === 3)
        shape +=
          path(`M${x + 22} ${y + 82}h236m-236 18h236m-154 -18v36m78 -36v36`, '#beb5d1', 1) +
          text(x + 28, y + 114, 'passage', 12, t.muted, 400, f) +
          text(x + 110, y + 114, 'vector', 12, t.muted, 400, f) +
          text(x + 190, y + 114, 'source', 12, t.muted, 400, f);
      return shape;
    }),
  );
  d.node(
    'query',
    488,
    270,
    944,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 28, '#e8e0e9') +
      d.label('query', x + 28, y + 39, 28, y + 73) +
      text(x + 28, y + 105, 'What would you like to know?', 17, '#62584e', 400, f),
  );
  d.node(
    'retrieve',
    528,
    492,
    288,
    288,
    ({ x, y, w, h }) =>
      circle(x + w / 2, y + h / 2, 144, '#fff') +
      text(x + w / 2, y + 128, content.retrieve[0], 30, t.ink, 500, f, 'text-anchor="middle"') +
      text(x + w / 2, y + 163, content.retrieve[1], 18, t.muted, 400, f, 'text-anchor="middle"') +
      path(`M${x + 80} ${y + 196}h128`, '#c6b3d0', 1.5) +
      text(
        x + w / 2,
        y + 225,
        'knowledge + intent',
        16,
        '#6c4777',
        400,
        f,
        'text-anchor="middle"',
      ) +
      circle(x + 144, y + 66, 15, 'url(#lovable-object)'),
  );
  d.node(
    'context',
    944,
    482,
    488,
    176,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 16, '#fff', 1, 'fill-opacity="0.94"') +
      d.label('context', x + 28, y + 40, 28, y + 74) +
      [0, 1]
        .map(
          (j) =>
            rect(x + 28 + j * 220, y + 100, 208, 46, j ? '#fff0e8' : '#f0edff', 7) +
            text(
              x + 40 + j * 220,
              y + 128,
              j ? 'source reference' : 'relevant passage',
              15,
              j ? '#744d39' : '#5d4b83',
              400,
              f,
            ),
        )
        .join(''),
  );
  d.node(
    'llm',
    944,
    730,
    488,
    176,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 16) +
      d.label('llm', x + 28, y + 40, 28, y + 74) +
      text(x + 28, y + 122, 'Compose with context.', 20, '#523451', 400, f) +
      text(x + 28, y + 151, 'Keep the sources attached.', 16, '#62584e', 400, f) +
      [0, 1, 2]
        .map((j) =>
          rect(
            x + w - 116 + j * 10,
            y + 66 - j * 12,
            64,
            64,
            'url(#lovable-object)',
            14,
            '#fff',
            1.3,
          ),
        )
        .join(''),
  );
  d.node(
    'answer',
    488,
    960,
    944,
    76,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 18) +
      text(x + 28, y + 31, content.answer[0], 27, t.ink, 500, f) +
      text(x + 28, y + 59, content.answer[1], 16, t.muted, 400, f) +
      text(x + 330, y + 46, 'A clear response. A traceable source.', 20, '#523451', 400, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [228, ys[i] + 132],
        [228, ys[i + 1] - 4],
      ],
      '#63486e',
      2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [672, 398],
      [672, 488],
    ],
    '#63486e',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [820, 636],
      [876, 636],
      [876, 570],
      [940, 570],
    ],
    '#63486e',
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1188, 662],
      [1188, 726],
    ],
    '#63486e',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1188, 910],
      [1188, 956],
    ],
    '#63486e',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [372, 892],
      [444, 892],
      [444, 636],
      [524, 636],
    ],
    '#63486e',
    2,
  );
  return d;
}
