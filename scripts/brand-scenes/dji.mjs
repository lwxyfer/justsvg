import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function dji(t) {
  const d = new Diagram('dji', t),
    f = t.font;
  d.defs.push(
    '<radialGradient id="dji-horizon" cx="0.78" cy="0.69" r="0.7"><stop stop-color="#66747e"/><stop offset="0.32" stop-color="#252e41"/><stop offset="1" stop-color="#0e111b"/></radialGradient>',
    '<linearGradient id="dji-housing" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8d9499"/><stop offset="0.12" stop-color="#434a52"/><stop offset="0.45" stop-color="#191f2a"/><stop offset="0.8" stop-color="#272e38"/><stop offset="1" stop-color="#626b74"/></linearGradient>',
    '<radialGradient id="dji-glass"><stop stop-color="#0b151f"/><stop offset="0.38" stop-color="#1c4e5f"/><stop offset="0.58" stop-color="#0f2636"/><stop offset="0.76" stop-color="#446270"/><stop offset="0.85" stop-color="#101a25"/><stop offset="1" stop-color="#050b12"/></radialGradient>',
  );
  d.add(
    rect(0, 0, 1600, 1100, 'url(#dji-horizon)') +
      text(
        800,
        104,
        'KNOWLEDGE. IN FOCUS.',
        54,
        '#f4f6fa',
        400,
        f,
        'text-anchor="middle" letter-spacing="0.6"',
      ) +
      text(800, 160, '精确检索，清晰生成。', 25, '#d1d5de', 400, f, 'text-anchor="middle"') +
      path('M72 216H1528', '#59616e', 1),
  );
  const xs = [72, 436, 800, 1164];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(k, xs[i], 264, 288, 128, ({ x, y, w, h }) => {
      let s =
        rect(x, y, w, h, '#151d2a', 8, '#5f6b7c') +
        text(x + 20, y + 35, content[k][0], 24, '#f4f6fa', 500, f) +
        text(x + 20, y + 68, content[k][1], 17, '#b7c4d2', 400, f) +
        path(`M${x + 20} ${y + 91}h${w - 40}`, '#495769');
      if (i === 2)
        s += Array.from({ length: 12 }, (_, j) =>
          circle(x + 24 + j * 21, y + 109, 2 + (j % 2), '#a8c5cf'),
        ).join('');
      else
        s += text(
          x + 20,
          y + 116,
          ['SOURCE / KNOWLEDGE', 'PARSE / SEGMENT', '', 'STORE / INDEX'][i],
          12,
          '#b7c4d2',
          400,
          f,
          'letter-spacing="1.2"',
        );
      return s;
    }),
  );
  const module = (k, x, w) =>
    d.node(
      k,
      x,
      576,
      w,
      144,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#151d2a', 8, '#667283') +
        text(x + 20, y + 36, content[k][0], 26, '#f4f6fa', 500, f) +
        text(x + 20, y + 72, content[k][1], 18, '#b7c4d2', 400, f) +
        text(
          x + 20,
          y + 119,
          { query: '问题输入', retrieve: '语义聚焦', context: '片段与出处' }[k],
          16,
          '#d0d9e4',
          400,
          f,
        ),
    );
  module('query', 72, 224);
  module('retrieve', 384, 240);
  module('context', 712, 224);
  d.node('llm', 984, 450, 520, 450, ({ x, y, w, h }) => {
    const lens = (cx, cy, r) =>
      circle(cx, cy, r, '#090f18', '#87939d', 1.2) +
      circle(cx, cy, r - 8, '#222e3b', '#3a4e5e', 1) +
      circle(cx, cy, r - 16, 'url(#dji-glass)', '#718c99', 1) +
      circle(cx, cy, r * 0.25, '#08131e', '#4d8796', 1) +
      path(
        `M${cx - r * 0.4} ${cy - r * 0.43}Q${cx} ${cy - r * 0.72} ${cx + r * 0.39} ${cy - r * 0.37}`,
        '#98b8bd',
        1.5,
      );
    return (
      rect(x, y, w, h, 'url(#dji-housing)', 68, '#9099a4', 1.2) +
      rect(x + 12, y + 12, w - 24, h - 24, '#171f2c', 58, '#4e5c6b', 1) +
      text(
        x + w / 2,
        y + 58,
        content.llm[0],
        38,
        '#f4f6fa',
        400,
        f,
        'text-anchor="middle" letter-spacing="1.2"',
      ) +
      text(x + w / 2, y + 94, content.llm[1], 19, '#b7c4d2', 400, f, 'text-anchor="middle"') +
      lens(1244, 660, 104) +
      lens(1128, 810, 60) +
      lens(1360, 810, 60) +
      path('M1096 570H1128M1360 570H1392', '#64727f', 1)
    );
  });
  d.node(
    'answer',
    72,
    940,
    1432,
    88,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#151d2a', 12, '#647081') +
      d.label('answer', x + 28, y + 34, 28, y + 65, '#f4f6fa') +
      text(x + 490, y + 55, '从知识，到有据可查的答案。', 26, '#e5e9ef', 400, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [xs[i] + 292, 328],
        [xs[i + 1] - 4, 328],
      ],
      '#b2c3d1',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [300, 648],
      [380, 648],
    ],
    '#c4d0dc',
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [628, 648],
      [708, 648],
    ],
    '#c4d0dc',
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [940, 648],
      [980, 648],
    ],
    '#c4d0dc',
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1244, 904],
      [1244, 936],
    ],
    '#c4d0dc',
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1308, 396],
      [1308, 424],
      [504, 424],
      [504, 572],
    ],
    '#b2c3d1',
    1.8,
  );
  return d;
}
