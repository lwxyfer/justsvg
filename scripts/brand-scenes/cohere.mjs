import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function cohere(t) {
  const d = new Diagram('cohere', t),
    f = t.font,
    serif = 'CohereText, Georgia, Songti SC, serif';
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(72, 105, 'Your knowledge.', 68, t.ink, 400, serif, 'letter-spacing="-1.4"') +
      text(72, 188, 'Your context.', 68, t.ink, 400, serif, 'letter-spacing="-1.4"') +
      text(1024, 126, 'An enterprise knowledge flow,', 22, t.muted, 400, f) +
      text(1024, 162, 'from source to synthesis.', 22, t.muted, 400, f) +
      rect(48, 264, 1504, 768, '#284d40', 16),
  );
  d.add(
    Array.from({ length: 14 }, (_, i) =>
      path(
        `M${500 + i * 20} 284Q${1300 - i * 24} ${390 + i * 24} ${1496} ${770 + i * 16}`,
        '#6f7b55',
        0.7,
        'none',
        `opacity="${0.3 + i * 0.015}"`,
      ),
    ).join(''),
  );
  const ys = [312, 480, 648, 816],
    fills = ['#f2efe6', '#e7e8d4', '#dce6d8', '#d6d6b0'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, 80, ys[i], 288, 128, ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, fills[i], 8) +
        text(x + 22, y + 36, content[k][0], 25, '#243a30', 500, f) +
        text(x + 22, y + 72, content[k][1], 17, '#4a5f51', 400, f);
      if (i < 2)
        s += [0, 1]
          .map((j) => path(`M${x + 22} ${y + 97 + j * 14}h${[210, 161][j]}`, '#8e9c7d', 1.3))
          .join('');
      if (i === 2)
        s += Array.from({ length: 10 }, (_, j) =>
          circle(x + 26 + j * 25, y + 102 + (j % 2) * 10, 3, '#61816b'),
        ).join('');
      if (i === 3)
        s += path(`M${x + 22} ${y + 91}h244m-244 16h244m-162 -16v30m82 -30v30`, '#879770', 1.1);
      return s;
    }),
  );
  const paper = (k, x, y, w, h, extra) =>
    d.node(
      k,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#f5f3e9', k === 'retrieve' ? 40 : 10) +
        text(x + 26, y + 39, content[k][0], 29, '#243a30', 500, f) +
        text(x + 26, y + 77, content[k][1], 18, '#4a5f51', 400, f) +
        extra(x, y, w, h),
    );
  paper('query', 496, 312, 448, 120, (x, y) =>
    text(x + 26, y + 107, 'Ask from the knowledge you own.', 18, '#4a5f51', 400, f),
  );
  paper(
    'retrieve',
    496,
    568,
    448,
    176,
    (x, y) =>
      text(x + 26, y + 119, 'Match the intent to the passages.', 20, '#365e4e', 400, serif) +
      text(x + 26, y + 151, 'Keep the source attached.', 18, '#4a5f51', 400, f),
  );
  paper('context', 1040, 568, 448, 176, (x, y) =>
    [0, 1, 2]
      .map((j) =>
        rect(x + 26, y + 100 + j * 20, 396 - j * 36, 12, ['#dfe5d5', '#d5ddc8', '#e9e7d4'][j]),
      )
      .join(''),
  );
  paper(
    'llm',
    1040,
    824,
    448,
    160,
    (x, y) =>
      [0, 1, 2]
        .map((j) =>
          rect(
            x + 242 + j * 15,
            y + 100 - j * 14,
            116,
            14,
            ['#d6d6b0', '#c6cfa5', '#e8e7cd'][j],
            7,
          ),
        )
        .join('') + text(x + 26, y + 126, 'Compose with context.', 19, '#365e4e', 400, serif),
  );
  paper('answer', 496, 864, 448, 120, (x, y) =>
    text(x + 26, y + 107, 'Response + references', 18, '#4a5f51', 400, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [224, ys[i] + 132],
        [224, ys[i + 1] - 4],
      ],
      '#d5dec8',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [720, 436],
      [720, 564],
    ],
    '#d5dec8',
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [948, 656],
      [1036, 656],
    ],
    '#d5dec8',
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1264, 748],
      [1264, 820],
    ],
    '#d5dec8',
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1036, 924],
      [948, 924],
    ],
    '#d5dec8',
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [372, 880],
      [424, 880],
      [424, 656],
      [492, 656],
    ],
    '#d5dec8',
    1.8,
  );
  return d;
}
