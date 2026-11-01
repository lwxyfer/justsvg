import { Diagram, rect, path, text, content } from './document.mjs';
export default function mistral(t) {
  const d = new Diagram('mistral', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  const stepped = (x, y, w, h, fill) =>
    path(
      `M${x + 16} ${y}H${x + w - 16}V${y + 16}H${x + w}V${y + h - 16}H${x + w - 16}V${y + h}H${x + 16}V${y + h - 16}H${x}V${y + 16}H${x + 16}Z`,
      'none',
      0,
      fill,
    );
  const pixel = (k, x, y) => {
    const patterns = {
      docs: ['11110', '10001', '10111', '10101', '10111', '11111'],
      chunks: ['11111', '00000', '11110', '00000', '11111', '00000'],
      embed: ['00100', '01110', '10101', '01110', '00100', '00100'],
      index: ['11111', '10101', '11111', '10101', '11111', '11111'],
    };
    return patterns[k]
      .map((r, j) =>
        [...r]
          .map((n, i) =>
            n === '1'
              ? rect(
                  x + i * 8,
                  y + j * 8,
                  8,
                  8,
                  ['#ffaf00', '#ff8205', '#fa520f', '#e10500'][j % 4],
                )
              : '',
          )
          .join(''),
      )
      .join('');
  };
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 106, 'Knowledge.', 76, t.ink, 500, f, 'letter-spacing="-2"') +
      rect(68, 130, 584, 88, '#ffaf00') +
      text(72, 198, 'Built in pixels.', 76, t.ink, 500, f, 'letter-spacing="-2"') +
      text(1024, 142, 'From source material', 24, t.muted, 400, f) +
      text(1024, 177, 'to a grounded answer.', 24, t.muted, 400, f),
  );
  const boxes = [
    [72, 304, 240, 176],
    [376, 352, 240, 176],
    [680, 400, 240, 176],
    [984, 448, 264, 176],
  ];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      ...boxes[i],
      ({ x, y, w, h }) =>
        stepped(x, y, w, h, ['#eeece4', '#f5e8bd', '#ffe3ba', '#ffd491'][i]) +
        text(x + 20, y + 36, content[k][0], 24, t.ink, 500, f) +
        text(x + 20, y + 69, content[k][1], 17, t.muted, 400, f) +
        pixel(k, x + 20, y + 100) +
        text(
          x + 82,
          y + 128,
          ['source', 'split(text)', 'encode()', 'store()'][i],
          14,
          '#6b442e',
          400,
          mono,
        ),
    ),
  );
  d.node(
    'query',
    72,
    744,
    240,
    128,
    ({ x, y, w, h }) =>
      stepped(x, y, w, h, '#e9e7df') +
      d.label('query', x + 20, y + 37, 25, y + 73) +
      text(x + 20, y + 109, 'question', 15, t.muted, 400, mono),
  );
  d.node(
    'retrieve',
    376,
    704,
    336,
    208,
    ({ x, y, w, h }) =>
      stepped(x, y, w, h, '#f5e8bd') +
      d.label('retrieve', x + 24, y + 40, 28, y + 77) +
      [0, 1, 2]
        .map(
          (j) =>
            rect(x + 24, y + 108 + j * 25, 12, 12, ['#fa520f', '#ff8205', '#ffaf00'][j]) +
            path(`M${x + 48} ${y + 114 + j * 25}h${[224, 176, 208][j]}`, '#a68b61', 2),
        )
        .join(''),
  );
  d.node(
    'context',
    808,
    744,
    240,
    128,
    ({ x, y, w, h }) =>
      stepped(x, y, w, h, '#eeece4') +
      d.label('context', x + 20, y + 37, 25, y + 73) +
      text(x + 20, y + 109, 'passages + source', 14, t.muted, 400, mono),
  );
  d.node(
    'llm',
    1160,
    736,
    352,
    176,
    ({ x, y, w, h }) =>
      stepped(x, y, w, h, '#fa520f') +
      text(x + 24, y + 42, content.llm[0], 34, '#251409', 500, f) +
      text(x + 24, y + 78, content.llm[1], 18, '#251409', 400, f) +
      [0, 1, 2]
        .map((j) =>
          rect(x + 212 + j * 16, y + 110 - j * 16, 64, 16, ['#e10500', '#ffaf00', '#fff1b8'][j]),
        )
        .join('') +
      text(x + 24, y + 137, 'Synthesize.', 20, '#251409', 500, f),
  );
  d.node(
    'answer',
    1160,
    968,
    352,
    80,
    ({ x, y, w, h }) =>
      stepped(x, y, w, h, '#eeece4') + d.label('answer', x + 20, y + 32, 27, y + 62),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [316, 392],
      [340, 392],
      [340, 440],
      [372, 440],
    ],
    t.accent,
    2,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [620, 440],
      [648, 440],
      [648, 488],
      [676, 488],
    ],
    t.accent,
    2,
  );
  d.edge(
    'embed',
    'index',
    [
      [924, 488],
      [952, 488],
      [952, 536],
      [980, 536],
    ],
    t.accent,
    2,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [316, 808],
      [372, 808],
    ],
    t.accent,
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [716, 808],
      [804, 808],
    ],
    t.accent,
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1052, 808],
      [1156, 808],
    ],
    t.accent,
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1336, 916],
      [1336, 964],
    ],
    t.accent,
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1116, 628],
      [1116, 664],
      [544, 664],
      [544, 700],
    ],
    t.accent,
    2,
  );
  return d;
}
