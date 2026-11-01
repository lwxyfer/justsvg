import { Diagram, rect, path, text, content } from './document.mjs';
export default function huggingface(t) {
  const d = new Diagram('huggingface', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      rect(48, 48, 1504, 984, '#0b101b', 24) +
      text(96, 136, 'Knowledge, together.', 54, '#fff', 700, f, 'letter-spacing="-1.4"') +
      text(
        98,
        193,
        'Sources, representations and models in one explainable flow.',
        23,
        '#b8c3d2',
        400,
        f,
      ) +
      path('M96 240H1456', '#34404f'),
  );
  const ys = [296, 476, 656, 836],
    types = ['dataset', 'text', 'embeddings', 'index'],
    files = ['example/knowledge', 'example/passages', 'example/vectors', 'example/retrieval-index'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      96,
      ys[i],
      312,
      128,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#151d2a', 12, '#34404f') +
        text(x + 22, y + 34, content[k][0], 25, '#f3f4f6', 600, f) +
        text(x + 22, y + 68, content[k][1], 17, '#b8c3d2', 400, f) +
        text(x + 22, y + 103, files[i], 12, '#c7d1de', 400, mono) +
        rect(x + w - 86, y + 16, 70, 20, '#253142', 5) +
        text(
          x + w - 79,
          y + 30,
          types[i] === 'embeddings' ? 'vector' : types[i],
          11,
          '#c7d1de',
          400,
          f,
        ),
    ),
  );
  const panel = (k, x, y, w, h, extra) =>
    d.node(
      k,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#151d2a', 12, '#34404f') +
        text(x + 24, y + 38, content[k][0], 28, '#f3f4f6', 600, f) +
        text(x + 24, y + 75, content[k][1], 18, '#b8c3d2', 400, f) +
        extra(x, y, w, h),
    );
  panel('query', 520, 296, 928, 128, (x, y) =>
    text(x + 320, y + 73, 'A question grounded in shared knowledge.', 22, '#c7d1de', 400, f),
  );
  panel(
    'retrieve',
    520,
    548,
    344,
    176,
    (x, y) =>
      text(x + 24, y + 118, 'example/passages', 15, '#ffda55', 400, mono) +
      text(x + 24, y + 151, 'semantic matches', 15, '#c7d1de', 400, mono),
  );
  panel('context', 968, 548, 480, 176, (x, y) =>
    [0, 1]
      .map(
        (j) =>
          rect(x + 24, y + 99 + j * 30, 432, 24, '#202b3c', 5) +
          text(
            x + 36,
            y + 116 + j * 30,
            j ? 'source: example/knowledge' : 'passage: relevant context',
            14,
            '#c7d1de',
            400,
            mono,
          ),
      )
      .join(''),
  );
  d.node(
    'llm',
    968,
    824,
    480,
    176,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#ffd21e', 14) +
      text(x + 24, y + 40, content.llm[0], 34, '#302700', 600, f) +
      text(x + 24, y + 78, content.llm[1], 18, '#574705', 400, f) +
      text(x + 24, y + 125, 'query + context → response', 17, '#574705', 400, mono) +
      text(x + 24, y + 153, 'references preserved', 15, '#574705', 400, mono),
  );
  panel('answer', 520, 888, 344, 112, (x, y) =>
    text(x + 24, y + 101, 'answer + citations', 14, '#ffda55', 400, mono),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [252, ys[i] + 132],
        [252, ys[i + 1] - 4],
      ],
      '#acb8c7',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [692, 428],
      [692, 544],
    ],
    '#acb8c7',
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [868, 636],
      [964, 636],
    ],
    '#acb8c7',
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1208, 728],
      [1208, 820],
    ],
    '#acb8c7',
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [964, 944],
      [868, 944],
    ],
    '#acb8c7',
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [412, 900],
      [464, 900],
      [464, 636],
      [516, 636],
    ],
    '#acb8c7',
    1.8,
  );
  return d;
}
