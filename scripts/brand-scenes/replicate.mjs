import { Diagram, rect, path, text, content } from './document.mjs';
export default function replicate(t) {
  const d = new Diagram('replicate', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.defs.push(
    '<linearGradient id="replicate-field" x2="1" y2="1"><stop stop-color="#791c83"/><stop offset=".45" stop-color="#ca268d"/><stop offset=".72" stop-color="#df2855"/><stop offset="1" stop-color="#e64720"/></linearGradient>',
    '<pattern id="replicate-halftone" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".85" fill="#171217" fill-opacity=".16"/></pattern>',
  );
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      rect(0, 0, 1600, 1048, 'url(#replicate-field)') +
      rect(0, 0, 1600, 1048, 'url(#replicate-halftone)') +
      text(
        72,
        103,
        'Run knowledge',
        64,
        '#fff',
        600,
        'Freigeist Neue, ' + f,
        'letter-spacing="-1.6"',
      ) +
      text(
        72,
        181,
        'as a diagram.',
        64,
        '#fff',
        600,
        'Freigeist Neue, ' + f,
        'letter-spacing="-1.6"',
      ) +
      text(1016, 120, 'From source code', 24, '#fff', 400, f) +
      text(1016, 157, 'to sourced answers.', 24, '#fff', 400, f) +
      rect(72, 264, 376, 752, '#fff'),
  );
  const ys = [300, 468, 636, 804],
    code = ['sources: knowledge', 'split(source.text)', 'embed(passages)', 'index(vectors)'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      96,
      ys[i],
      352,
      112,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff') +
        text(x + 16, y + 33, content[k][0], 25, '#202020', 500, f) +
        text(x + 16, y + 67, content[k][1], 17, '#626262', 400, f) +
        text(
          x + 16,
          y + 100,
          code[i],
          15,
          ['#ae1b55', '#6e39a4', '#236797', '#ae1b55'][i],
          400,
          mono,
        ),
    ),
  );
  const codePane = (k, x, y, w, h, extra) =>
    d.node(
      k,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fff') +
        text(x + 24, y + 38, content[k][0], 28, '#202020', 500, f) +
        text(x + 24, y + 75, content[k][1], 18, '#626262', 400, f) +
        extra(x, y, w, h),
    );
  codePane('query', 536, 300, 448, 128, (x, y) =>
    text(x + 24, y + 110, 'query: "your question"', 17, '#236797', 400, mono),
  );
  codePane('retrieve', 536, 568, 448, 152, (x, y) =>
    text(x + 24, y + 116, 'passages = retrieve(query)', 17, '#6e39a4', 400, mono),
  );
  codePane('context', 1080, 568, 424, 152, (x, y) =>
    text(x + 24, y + 116, 'context = passages + sources', 16, '#236797', 400, mono),
  );
  codePane(
    'llm',
    1080,
    824,
    424,
    192,
    (x, y, w) =>
      path(`M${x} ${y + 90}h${w}`, '#ddd') +
      text(x + 24, y + 120, 'answer = generate({', 17, '#ae1b55', 400, mono) +
      text(x + 40, y + 148, 'query, context', 17, '#236797', 400, mono) +
      text(x + 24, y + 177, '})', 17, '#ae1b55', 400, mono),
  );
  codePane('answer', 536, 904, 448, 112, (x, y) =>
    text(x + 24, y + 103, 'response + references', 15, '#6e39a4', 400, mono),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [260, ys[i] + 116],
        [260, ys[i + 1] - 4],
      ],
      '#777',
      1.6,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [760, 432],
      [760, 564],
    ],
    '#fff',
    1.9,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [988, 644],
      [1076, 644],
    ],
    '#fff',
    1.9,
  );
  d.edge(
    'context',
    'llm',
    [
      [1292, 724],
      [1292, 820],
    ],
    '#fff',
    1.9,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1076, 960],
      [988, 960],
    ],
    '#fff',
    1.9,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [452, 860],
      [484, 860],
      [484, 644],
      [532, 644],
    ],
    '#fff',
    1.9,
  );
  return d;
}
