import { Diagram, rect, path, text, lines } from './document.mjs';
export default function figma(t) {
  const d = new Diagram('figma', t),
    f = t.font;
  d.defs.push(
    `<pattern id="${d.id}-dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d9d0c3"/></pattern>`,
  );
  d.add(
    rect(0, 0, 1600, 1100, '#fff8ed') +
      text(72, 114, 'Ideas become', 76, '#242021', 600, f, 'letter-spacing="-2.4"') +
      text(72, 203, 'connected systems.', 76, '#242021', 600, f, 'letter-spacing="-2.4"') +
      text(76, 257, '在同一张画布上，把知识连接起来。', 22, '#5a534b', 400, f) +
      rect(64, 308, 1472, 722, `url(#${d.id}-dots)`, 16),
  );
  d.node(
    'docs',
    96,
    362,
    280,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#ffb7a8', 18) +
      path(`M${x + 20} ${y + 20}h28l8 8v38h-36zM${x + 48} ${y + 20}v9h8`, '#77392c', 1.5) +
      d.label('docs', x + 88, y + 45, 23, y + 79, '#512a22', f),
  );
  d.node(
    'chunks',
    96,
    586,
    280,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f9d7c7', 18) +
      [0, 1, 2].map((j) => rect(x + 20, y + 21 + j * 22, 34, 12, '#b85136', 4)).join('') +
      d.label('chunks', x + 88, y + 45, 23, y + 79, '#512a22', f),
  );
  d.node(
    'embed',
    96,
    810,
    280,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#d9c7ff', 18) +
      [0, 1, 2, 3]
        .map((i) =>
          path(
            `M${x + 37 + (i % 2) * 19} ${y + 22 + Math.floor(i / 2) * 25}l9 10-9 10-9-10z`,
            '#6331a5',
            1.5,
            '#b48bec',
          ),
        )
        .join('') +
      d.label('embed', x + 88, y + 45, 23, y + 79, '#45216d', f),
  );
  d.node(
    'index',
    500,
    810,
    260,
    168,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#b9e7dd', 24) +
      path(
        `M${x + 26} ${y + 28}q29-9 58 0v42q-29 9-58 0zM${x + 26} ${y + 28}q29 10 58 0m-58 19q29 10 58 0`,
        '#246b5b',
        2,
      ) +
      d.label('index', x + 26, y + 113, 25, y + 146, '#174e42', f),
  );
  d.node(
    'query',
    500,
    362,
    260,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f9e492', 24) +
      d.label('query', x + 24, y + 47, 25, y + 83, '#574318', f) +
      path(`M${x + w - 55} ${y + 30}h26v20h-17l-9 7z`, '#80601f', 1.8),
  );
  d.node(
    'retrieve',
    880,
    476,
    260,
    202,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#e8c6e5', 26) +
      path(
        `M${x + 34} ${y + 23}l15 16-15 16-15-16zM${x + 65} ${y + 23}l15 16-15 16-15-16z`,
        '#853b7b',
        1.5,
      ) +
      d.label('retrieve', x + 24, y + 116, 29, y + 154, '#59204f', f),
  );
  d.node(
    'context',
    880,
    842,
    260,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#d9c7ff', 18) +
      d.label('context', x + 25, y + 47, 25, y + 83, '#45216d', f) +
      lines(x + w - 60, y + 28, [34, 26, 34], '#734f9c', 10, 2),
  );
  d.node(
    'llm',
    1240,
    650,
    260,
    160,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#2b2640', 24) +
      text(x + 27, y + 65, 'LLM', 44, '#fff', 500, f) +
      text(x + 28, y + 105, '生成模型', 18, '#e0d8fa', 400, f) +
      path(`M${x + w - 69} ${y + 26}l17 18-17 18-17-18z`, '#c7afff', 1.5),
  );
  d.node(
    'answer',
    1240,
    888,
    260,
    130,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#246b5b', 20) +
      text(x + 24, y + 47, 'Answer', 28, '#fff', 600, f) +
      text(x + 24, y + 84, '回答与引用', 16, '#dbf4ed', 400, f) +
      path(`M${x + w - 53} ${y + 33}l7 7 12-16`, '#d5ffed', 2.5),
  );
  // Author-created collaborator pointers illustrate a shared board, not live editor handles.
  d.add(
    path('M799 343l8 32 10-11 14-4z', '#fff', 2, '#5b5bff') +
      rect(825, 376, 63, 28, '#5b5bff', 7) +
      text(837, 395, 'Mina', 14, '#fff', 500, f) +
      path('M1165 825l8 32 10-11 14-4z', '#fff', 2, '#a23b84') +
      rect(1191, 858, 55, 28, '#a23b84', 7) +
      text(1203, 877, 'Kai', 14, '#fff', 500, f),
  );
  d.edge(
    'docs',
    'chunks',
    [
      [236, 490],
      [236, 582],
    ],
    '#6e625d',
    1.8,
  );
  d.edge(
    'chunks',
    'embed',
    [
      [236, 714],
      [236, 806],
    ],
    '#6e625d',
    1.8,
  );
  d.edge(
    'embed',
    'index',
    [
      [380, 872],
      [496, 872],
    ],
    '#6331a5',
    1.8,
  );
  d.edge(
    'query',
    'retrieve',
    [
      [764, 424],
      [820, 424],
      [820, 550],
      [876, 550],
    ],
    '#80601f',
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [764, 894],
      [820, 894],
      [820, 626],
      [876, 626],
    ],
    '#246b5b',
    1.8,
    [730, 1009, '索引供给'],
  );
  d.edge(
    'retrieve',
    'context',
    [
      [1010, 682],
      [1010, 838],
    ],
    '#853b7b',
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1144, 904],
      [1190, 904],
      [1190, 730],
      [1236, 730],
    ],
    '#6331a5',
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1370, 814],
      [1370, 884],
    ],
    '#246b5b',
    1.8,
  );
  return d;
}
