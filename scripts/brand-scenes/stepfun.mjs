import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function stepfun(t) {
  const d = new Diagram('stepfun', t),
    f = t.font,
    serif = 'Lora, Georgia, Songti SC, SimSun, serif';
  d.add(
    rect(0, 0, 1600, 1100, '#fafaf8') +
      text(72, 99, 'Knowledge,', 61, '#1a1a1a', 500, serif, 'letter-spacing="-1.5"') +
      text(72, 173, 'step by step.', 61, '#00a1e1', 500, serif, 'letter-spacing="-1.5"') +
      text(858, 132, '从原始材料，到推理与回答。', 26, '#5c5f66', 400, f),
  );
  // Consecutive sheets overlap at blank margins; their titles and ports stay exposed.

  const bs = [
    [104, 292, 352, 312],
    [416, 244, 320, 280],
    [700, 300, 408, 320],
    [1068, 252, 424, 304],
  ];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, ...bs[i], ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, ['#e4dfd2', '#f6edbd', '#dce9e8', '#ece9e3'][i]) +
        text(x + 18, y + 39, content[k][0], 30, '#1a1a1a', 500, serif) +
        text(x + 18, y + 75, content[k][1], 17, '#5c5f66', 400, f);
      if (i === 0) {
        s += rect(x + 18, y + 99, w - 36, h - 119, '#f8f6ee', 0, '#a9a699');
        s += Array.from({ length: 8 }, (_, j) =>
          path(
            `M${x + 34} ${y + 121 + j * 17}h${[194, 212, 163, 204, 181, 212, 149, 184][j]}`,
            '#939588',
            0.9,
          ),
        ).join('');
      }
      if (i === 1)
        s += [0, 1, 2, 3]
          .map(
            (j) =>
              rect(x + 18, y + 100 + j * 29, w - 74, 20, '#fffced', 0, '#c8bc90') +
              path(`M${x + 30} ${y + 110 + j * 29}h${[182, 153, 189, 164][j]}`, '#a09877', 1),
          )
          .join('');
      if (i === 2) {
        const pts = Array.from({ length: 16 }, (_, j) => [
          x + 28 + ((j * 53) % 316),
          y + 112 + ((j * 47) % 158),
        ]);
        s +=
          pts
            .slice(1)
            .map((p, j) => path(`M${pts[j][0]} ${pts[j][1]}L${p[0]} ${p[1]}`, '#899d9e', 0.9))
            .join('') +
          pts.map((p, j) => circle(...p, j % 4 ? 2 : 4, j % 4 ? '#778f91' : '#00adf4')).join('');
      }
      if (i === 3) {
        s += rect(x + 18, y + 100, w - 36, 148, '#f9f8f4', 0, '#aeb3b0');
        s +=
          [1, 2, 3, 4]
            .map((j) => path(`M${x + 18} ${y + 100 + j * 29.6}h${w - 36}`, '#c0c5c1', 0.8))
            .join('') +
          [1, 2, 3]
            .map((j) => path(`M${x + 18 + j * 83} ${y + 100}v148`, '#c0c5c1', 0.8))
            .join('') +
          [0, 1, 2, 3].map((j) => circle(x + 54 + j * 83, y + 121 + j * 29, 3, '#008bbd')).join('');
      }
      return s;
    }),
  );
  d.node(
    'query',
    72,
    800,
    248,
    136,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 0, '#bfc2bd') +
      text(x + 20, y + 39, content.query[0], 29, '#1a1a1a', 500, serif) +
      text(x + 20, y + 75, content.query[1], 17, '#5c5f66', 400, f) +
      text(x + 20, y + 117, 'A question to explore.', 17, '#5c5f66', 400, serif),
  );
  d.node(
    'retrieve',
    416,
    736,
    304,
    224,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#e7eff0', 0, '#b1c4c9') +
      text(x + 22, y + 40, content.retrieve[0], 31, '#1a1a1a', 500, serif) +
      text(x + 22, y + 76, content.retrieve[1], 18, '#5c5f66', 400, f) +
      [0, 1, 2]
        .map(
          (j) =>
            path(`M${x + 24} ${y + 112 + j * 35}h${w - 48}`, '#b3c5ca', 1) +
            circle(x + 30, y + 124 + j * 35, 3, '#008bbd') +
            path(`M${x + 45} ${y + 124 + j * 35}h${[184, 152, 200][j]}`, '#6a8e9d', 1.2),
        )
        .join(''),
  );
  d.node(
    'context',
    824,
    800,
    272,
    136,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#e3ddc6', 0, '#c8c3af') +
      rect(x, y, w - 8, h - 8, '#f9f6e9', 0, '#c8c3af') +
      text(x + 20, y + 39, content.context[0], 29, '#1a1a1a', 500, serif) +
      text(x + 20, y + 75, content.context[1], 17, '#5c5f66', 400, f) +
      text(x + 20, y + 117, 'excerpts + sources', 17, '#5c5f66', 400, serif),
  );
  d.node(
    'llm',
    1200,
    748,
    304,
    188,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 0, '#bfc2bd') +
      text(x + 22, y + 40, content.llm[0], 32, '#1a1a1a', 500, serif) +
      text(x + 22, y + 76, content.llm[1], 18, '#5c5f66', 400, f) +
      text(x + 22, y + 121, 'Reason with context.', 21, '#1a1a1a', 400, serif) +
      text(x + 22, y + 158, 'Synthesize, then cite.', 18, '#5c5f66', 400, serif) +
      circle(x + w - 26, y + 32, 4, '#00adf4'),
  );
  d.node(
    'answer',
    824,
    976,
    680,
    72,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f6edbd') +
      text(x + 22, y + 32, content.answer[0], 29, '#1a1a1a', 500, serif) +
      text(x + 22, y + 62, content.answer[1], 17, '#5c5f66', 400, f) +
      text(x + 265, y + 48, 'Understanding, with evidence.', 23, '#1a1a1a', 400, serif),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [260, 288],
      [260, 216],
      [560, 216],
      [560, 240],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [560, 528],
      [560, 660],
      [900, 660],
      [900, 624],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'embed',
    'index',
    [
      [900, 296],
      [900, 224],
      [1280, 224],
      [1280, 248],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [324, 868],
      [412, 868],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [724, 868],
      [820, 868],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'context',
    'llm',
    [
      [1100, 868],
      [1196, 868],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1352, 940],
      [1352, 972],
    ],
    '#3a6e83',
    1.6,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1340, 560],
      [1340, 700],
      [568, 700],
      [568, 732],
    ],
    '#3a6e83',
    1.6,
  );
  return d;
}
