import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function perplexity(t) {
  const d = new Diagram('perplexity', t),
    f = t.font,
    serif = 'Perplexity Serif, Georgia, Songti SC, serif',
    mono = 'SFMono-Regular, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 116, 'Knowledge, with evidence.', 58, t.ink, 500, f, 'letter-spacing="-1.4"') +
      text(
        76,
        170,
        'Read the sources. Follow the reasoning. Keep the references.',
        22,
        t.muted,
        400,
        f,
      ) +
      path('M72 216H1520', '#20808d', 1.4),
  );
  const boxes = [
    [72, 272, 344, 176],
    [512, 272, 344, 176],
    [512, 544, 344, 176],
    [72, 544, 344, 176],
  ];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, ...boxes[i], ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, i === 2 ? '#def7f9' : '#f3f1e9', 0, '#c2ccc5') +
        text(x + 22, y + 38, content[k][0], 29, t.ink, 400, serif) +
        text(x + 22, y + 75, content[k][1], 17, t.muted, 400, f);
      if (i === 0)
        s +=
          text(x + 22, y + 116, 'knowledge.md', 15, '#1a6872', 400, mono) +
          path(`M${x + 22} ${y + 139}h250m-250 15h194`, '#9baaa3', 1);
      if (i === 1)
        s += [0, 1, 2]
          .map(
            (j) =>
              rect(x + 22, y + 99 + j * 21, w - 44, 14, j === 1 ? '#b6dbd7' : '#e4e8de') +
              path(`M${x + 30} ${y + 106 + j * 21}h${[212, 248, 174][j]}`, '#73948c', 1),
          )
          .join('');
      if (i === 2)
        s +=
          path(`M${x + 28} ${y + 140}l72 -35l88 41l88 -37`, '#7da4a5', 1.3) +
          [0, 1, 2, 3]
            .map((j) => circle(x + 28 + j * 83, y + [140, 105, 146, 109][j], 4, '#20808d'))
            .join('');
      if (i === 3)
        s += ['passage / source', 'vector / index']
          .map((s, j) => text(x + 22, y + 116 + j * 29, s, 16, '#1a6872', 400, mono))
          .join('');
      return s;
    }),
  );
  const page = (k, x, y, w, h, extra) =>
    d.node(
      k,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#fbfaf4', 0, '#b9c6bf') +
        d.label(k, x + 24, y + 38, 28, y + 76) +
        extra(x, y, w, h),
    );
  page('query', 1008, 272, 512, 112, (x, y) =>
    text(x + 260, y + 64, 'A question to explore.', 18, t.muted, 400, serif),
  );
  page(
    'retrieve',
    1008,
    480,
    512,
    160,
    (x, y) =>
      text(x + 24, y + 117, 'Find passages, preserve provenance.', 21, '#1a6872', 400, serif) +
      path(`M${x + 24} ${y + 138}h${512 - 48}`, '#a1c1b9', 1),
  );
  page('context', 1008, 736, 240, 144, (x, y) =>
    text(x + 24, y + 119, 'excerpts + sources', 15, '#1a6872', 400, mono),
  );
  page('llm', 1344, 736, 176, 144, (x, y) =>
    text(x + 24, y + 119, 'Synthesize', 18, '#1a6872', 400, serif),
  );
  d.node(
    'answer',
    72,
    920,
    1448,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fbfaf4') +
      path(`M${x} ${y}h${w}`, '#20808d', 1.4) +
      text(x + 8, y + 39, content.answer[0], 32, t.ink, 400, serif) +
      text(x + 8, y + 78, content.answer[1], 18, t.muted, 400, f) +
      text(x + 368, y + 46, 'An answer you can trace back to its sources.', 27, t.ink, 400, serif) +
      text(x + 370, y + 85, 'source → passage → context → response', 16, '#1a6872', 400, mono),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [420, 360],
      [508, 360],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [684, 452],
      [684, 540],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'embed',
    'index',
    [
      [508, 632],
      [420, 632],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [1264, 388],
      [1264, 476],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [1124, 644],
      [1124, 732],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1252, 808],
      [1340, 808],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1432, 884],
      [1432, 916],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [244, 724],
      [244, 816],
      [944, 816],
      [944, 560],
      [1004, 560],
    ],
    t.accent,
    1.8,
  );
  return d;
}
