import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function apple(t) {
  const d = new Diagram('apple', t),
    f = 'Helvetica Neue, Arial, PingFang SC, sans-serif';
  d.defs.push(
    `<linearGradient id="${d.id}-contacts" x2="0" y2="1"><stop stop-color="#d4d8df"/><stop offset=".5" stop-color="#aeb4c0"/><stop offset="1" stop-color="#808895"/></linearGradient>`,
    `<linearGradient id="${d.id}-metal" x2=".8" y2="1"><stop stop-color="#fafbff"/><stop offset=".48" stop-color="#dadde5"/><stop offset="1" stop-color="#b3b8c5"/></linearGradient><linearGradient id="${d.id}-chip" x2="1" y2="1"><stop stop-color="#383942"/><stop offset=".5" stop-color="#0c0c11"/><stop offset="1" stop-color="#2d2e36"/></linearGradient><linearGradient id="${d.id}-intelligence" x2="1" y2=".7"><stop stop-color="#58c4fa"/><stop offset=".28" stop-color="#7868f3"/><stop offset=".58" stop-color="#e77a9a"/><stop offset=".82" stop-color="#f69c5a"/><stop offset="1" stop-color="#eaca89"/></linearGradient>`,
  );
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(72, 120, 'Your knowledge.', 84, '#1d1d1f', 600, f, 'letter-spacing="-3"') +
      text(72, 212, 'Intelligently connected.', 84, '#1d1d1f', 600, f, 'letter-spacing="-3"') +
      text(76, 267, '让知识，成为回答的一部分。', 23, '#6e6e73', 400, f),
  );
  d.add(
    rect(64, 318, 370, 700, '#f5f5f7', 32) +
      text(96, 360, 'Knowledge library', 23, '#6e6e73', 600, f),
  );
  const ys = [394, 550, 706, 862];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(key, 96, ys[i], 306, 112, ({ x, y, w, h }) => {
      let icon = '';
      if (i === 0)
        icon =
          rect(x + 19, y + 23, 42, 60, '#e9f3ff', 7) +
          rect(x + 25, y + 17, 42, 60, '#cde6ff', 7) +
          rect(x + 31, y + 11, 42, 60, '#007aff', 7) +
          lines(x + 40, y + 30, [24, 20, 23], '#fff', 10, 2);
      if (i === 1)
        icon = [0, 1, 2]
          .map((j) =>
            rect(x + 18, y + 17 + j * 20, 56, 12, ['#9cceff', '#56a8fd', '#007aff'][j], 4),
          )
          .join('');
      if (i === 2)
        icon = [0, 1, 2, 3]
          .map((j) =>
            [0, 1, 2]
              .map((k) => circle(x + 25 + j * 13, y + 25 + k * 16, 3 + (j % 2), '#007aff'))
              .join(''),
          )
          .join('');
      if (i === 3)
        icon =
          rect(x + 18, y + 17, 58, 65, '#e4e7ee', 10) +
          [0, 1, 2].map((j) => rect(x + 25, y + 24 + j * 17, 44, 11, '#b8c1cf', 3)).join('');
      return (
        rect(x, y, w, h, '#fff', 18) + icon + d.label(key, x + 94, y + 47, 22, y + 78, '#1d1d1f', f)
      );
    }),
  );
  d.node(
    'query',
    528,
    394,
    330,
    102,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f5f5f7', h / 2) +
      circle(x + 38, y + 46, 11, 'none', '#8e8e93', 2) +
      path(`M${x + 46} ${y + 54}l7 7`, '#8e8e93', 2) +
      d.label('query', x + 69, y + 43, 22, y + 74, '#1d1d1f', f),
  );
  d.node(
    'retrieve',
    528,
    581,
    330,
    110,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#edf5ff', 24) +
      d.label('retrieve', x + 28, y + 46, 25, y + 79, '#0071e3', f) +
      path(`M${x + w - 55} ${y + 35}l12 12-12 12`, '#0071e3', 2),
  );
  d.node(
    'context',
    528,
    782,
    330,
    110,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f5f5f7', 24) +
      d.label('context', x + 28, y + 46, 25, y + 79, '#1d1d1f', f) +
      rect(x + w - 72, y + 27, 40, 48, '#fff', 6) +
      lines(x + w - 65, y + 42, [25, 20, 23], '#c3c3c8', 8, 2),
  );
  d.node('llm', 986, 410, 440, 440, ({ x, y, w, h }) => {
    let pins = '';
    for (let i = 0; i < 14; i++) {
      let p = x + 42 + i * 27;
      pins +=
        rect(p, y, 10, 20, `url(#${d.id}-contacts)`, 2) +
        rect(p, y + h - 20, 10, 20, `url(#${d.id}-contacts)`, 2) +
        rect(x, y + 42 + i * 27, 20, 10, `url(#${d.id}-contacts)`, 2) +
        rect(x + w - 20, y + 42 + i * 27, 20, 10, `url(#${d.id}-contacts)`, 2);
    }
    return (
      pins +
      rect(x + 18, y + 18, w - 36, h - 36, `url(#${d.id}-metal)`, 43) +
      rect(x + 19, y + 19, w - 38, h - 38, 'none', 42, '#fafbff', 0.8) +
      rect(
        x + 32,
        y + 32,
        w - 64,
        h - 64,
        `url(#${d.id}-chip)`,
        34,
        `url(#${d.id}-intelligence)`,
        6,
      ) +
      rect(x + 46, y + 46, w - 92, h - 92, 'none', 25, '#777885', 0.7) +
      path(`M${x + 64} ${y + 43}H${x + w - 66}`, '#b6b8c8', 0.6) +
      text(
        x + w / 2,
        y + 212,
        'LLM',
        104,
        '#fff',
        600,
        f,
        'text-anchor="middle" letter-spacing="-4"',
      ) +
      text(x + w / 2, y + 260, '生成模型', 23, '#d2d2d7', 400, f, 'text-anchor="middle"') +
      text(x + w / 2, y + 310, 'Knowledge + context', 17, '#9c9ca7', 400, f, 'text-anchor="middle"')
    );
  });
  d.node(
    'answer',
    974,
    922,
    474,
    96,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f5f5f7', 22) +
      d.label('answer', x + 25, y + 39, 24, y + 70, '#1d1d1f', f) +
      circle(x + w - 46, y + 48, 20, '#0071e3') +
      path(`M${x + w - 54} ${y + 48}l6 6 11-13`, '#fff', 2.5),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [249, ys[i] + 116],
        [249, ys[i + 1] - 4],
      ],
      '#7a8190',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [693, 500],
      [693, 577],
    ],
    '#7a8190',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [693, 695],
      [693, 778],
    ],
    '#0071e3',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [406, 918],
      [470, 918],
      [470, 636],
      [524, 636],
    ],
    '#0071e3',
    2,
    [440, 955, '索引供给'],
  );
  d.edge(
    'context',
    'llm',
    [
      [862, 837],
      [922, 837],
      [922, 630],
      [982, 630],
    ],
    '#0071e3',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1206, 854],
      [1206, 918],
    ],
    '#7a8190',
    2,
  );
  return d;
}
