import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function supabase(t) {
  const d = new Diagram('supabase', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 108, 'Build the knowledge.', 48, t.ink, 400, f, 'letter-spacing="-1.2"') +
      text(72, 166, 'Retrieve with context.', 48, '#087f5b', 400, f, 'letter-spacing="-1.2"') +
      text(1032, 126, 'Sources, vectors and answers.', 22, t.muted, 400, f),
  );
  const xs = [72, 440, 808];
  ['docs', 'chunks', 'embed'].forEach((k, i) =>
    d.node(k, xs[i], 270, 280, 240, ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, '#fff', 12, '#e4e4e4') +
        text(x + 22, y + 37, content[k][0], 24, t.ink, 500, f) +
        text(x + 22, y + 70, content[k][1], 17, t.muted, 400, f);
      if (i === 0)
        s += [0, 1, 2]
          .map(
            (j) =>
              rect(x + 24 + j * 73, y + 104, 62, 104, '#fcfcfc', 6, '#dedede') +
              path(
                `M${x + 38 + j * 73} ${y + 126}h32m-32 14h32m-32 14h24m-24 14h32`,
                '#b6b6b6',
                1,
              ) +
              text(x + 34 + j * 73, y + 193, ['.md', '.pdf', '.txt'][j], 11, '#626262', 400, mono),
          )
          .join('');
      if (i === 1)
        s += [0, 1, 2]
          .map(
            (j) =>
              rect(
                x + 24,
                y + 104 + j * 33,
                232,
                24,
                j === 1 ? '#e9f9ef' : '#fafafa',
                4,
                '#e0e6e2',
              ) +
              path(
                `M${x + 36} ${y + 116 + j * 33}h${[152, 176, 128][j]}`,
                j === 1 ? '#087f5b' : '#a8aaa9',
                1.3,
              ),
          )
          .join('');
      if (i === 2) {
        s += path(
          `M${x + 140} ${y + 111}l-72 42v58l72 -42l72 42v-58Zm-72 42l72 42l72 -42m-72 -42v58`,
          '#a8b3ad',
          1,
        );
        s += Array.from({ length: 13 }, (_, j) =>
          circle(
            x + 34 + ((j * 47) % 212),
            y + 109 + ((j * 29) % 109),
            j % 3 ? 2 : 3,
            j % 3 ? '#babfbc' : '#087f5b',
          ),
        ).join('');
      }
      return s;
    }),
  );
  d.node(
    'index',
    1160,
    238,
    360,
    320,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 12, '#e4e4e4') +
      d.label('index', x + 22, y + 37, 25, y + 70) +
      rect(x + 22, y + 98, w - 44, 196, '#fcfcfc', 5, '#d6dfda') +
      text(x + 34, y + 121, 'knowledge', 14, '#087f5b', 500, mono) +
      path(`M${x + 22} ${y + 133}h${w - 44}m-194 0v161`, '#d6dfda') +
      [
        'id      uuid',
        'text    text',
        'vector  vector',
        'source  text',
        'chunk   integer',
        'index   hnsw',
      ]
        .map((s, j) => text(x + 34, y + 154 + j * 24, s, 13, '#505953', 400, mono))
        .join(''),
  );
  const module = (k, x, y, w, h, extra) =>
    d.node(
      k,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, k === 'answer' ? '#e9f9ef' : '#fff', 12, '#e4e4e4') +
        d.label(k, x + 22, y + 36, 25, y + 68) +
        extra(x, y, w, h),
    );
  module('query', 72, 664, 280, 120, (x, y) =>
    text(x + 22, y + 99, 'question → query vector', 14, '#626262', 400, mono),
  );
  module(
    'retrieve',
    440,
    628,
    280,
    220,
    (x, y) =>
      path(`M${x + 22} ${y + 88}h236`, '#e0e7e3') +
      text(x + 22, y + 117, 'SELECT text, source', 14, '#087f5b', 400, mono) +
      text(x + 22, y + 144, 'FROM knowledge', 14, '#505953', 400, mono) +
      text(x + 22, y + 171, 'ORDER BY embedding', 14, '#505953', 400, mono) +
      text(x + 22, y + 198, '<=> query_vector', 14, '#087f5b', 400, mono),
  );
  module('context', 808, 664, 280, 120, (x, y) =>
    [0, 1, 2].map((j) => rect(x + 22 + j * 79, y + 86, 70, 19, '#f2f6f3', 4, '#d4dfd9')).join(''),
  );
  module(
    'llm',
    1208,
    628,
    312,
    220,
    (x, y) =>
      rect(x + 22, y + 91, 268, 104, '#f7faf8', 6, '#e0e7e3') +
      text(x + 36, y + 117, 'generate({', 15, '#087f5b', 400, mono) +
      text(x + 48, y + 146, 'query, context,', 15, '#505953', 400, mono) +
      text(x + 36, y + 175, '}) → answer', 15, '#087f5b', 400, mono),
  );
  module('answer', 808, 916, 712, 108, (x, y) =>
    text(x + 278, y + 62, 'Response with source references', 20, '#176a4d', 400, f),
  );
  for (let i = 0; i < 2; i++)
    d.edge(
      ['docs', 'chunks'][i],
      ['chunks', 'embed'][i],
      [
        [xs[i] + 284, 390],
        [xs[i + 1] - 4, 390],
      ],
      t.accent,
      1.8,
    );
  d.edge(
    'embed',
    'index',
    [
      [1092, 390],
      [1156, 390],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [356, 724],
      [436, 724],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [724, 724],
      [804, 724],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1092, 724],
      [1204, 724],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1364, 852],
      [1364, 912],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1340, 562],
      [1340, 596],
      [580, 596],
      [580, 624],
    ],
    t.accent,
    1.8,
  );
  return d;
}
