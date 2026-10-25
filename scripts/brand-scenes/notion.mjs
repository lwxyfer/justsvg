import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function notion(t) {
  const d = new Diagram('notion', t),
    f = t.font,
    ink = '#252522';
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(80, 132, 'Knowledge,', 84, ink, 700, f, 'letter-spacing="-2"') +
      text(80, 228, 'organized.', 84, ink, 700, f, 'letter-spacing="-2"') +
      text(84, 279, '把散落的知识，连接成有条理的回答。', 21, '#57564f', 400, f),
  );
  const ys = [342, 502, 662, 822];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(key, 92, ys[i], 340, 118, ({ x, y, w, h }) => {
      let glyph = '';
      if (i === 0)
        glyph =
          path(`M${x + 11} ${y + 24}l35-5 6 56-35 5z`, ink, 2.8, '#fff') +
          path(
            `M${x + 25} ${y + 14}h29l10 11v54H${x + 25}zM${x + 54} ${y + 14}v12h10`,
            ink,
            2.8,
            '#fff',
          ) +
          lines(x + 33, y + 40, [21, 17, 21], ink, 10, 2.5);
      if (i === 1)
        glyph =
          [0, 1, 2]
            .map((j) =>
              rect(x + 13, y + 21 + j * 20, 52, 12, j === 1 ? '#fff2c6' : '#fff', 1, ink, 2.8),
            )
            .join('') + path(`M${x + 49} ${y + 17}v65`, ink, 1.8, 'none', 'stroke-dasharray="3 5"');
      if (i === 2)
        glyph =
          path(
            `M${x + 20} ${y + 35}l30-12 11 40-35 8zM${x + 20} ${y + 35}l41 28m-11-40-24 48`,
            ink,
            2.2,
          ) +
          [
            [20, 35],
            [50, 23],
            [61, 63],
            [26, 71],
          ]
            .map(([dx, dy]) => circle(x + dx, y + dy, 5, '#fff', ink, 2.8))
            .join('');
      if (i === 3)
        glyph =
          rect(x + 14, y + 16, 52, 68, '#fff', 1, ink, 2.8) +
          [0, 1, 2]
            .map((j) =>
              rect(x + 20, y + 23 + j * 18, 40, 13, j === 2 ? '#fff2c6' : '#fff', 1, ink, 2),
            )
            .join('') +
          [0, 1, 2].map((j) => path(`M${x + 36} ${y + 29 + j * 18}h8`, ink, 2)).join('');
      return (
        rect(x, y, w, h, '#fff') + glyph + d.label(key, x + 91, y + 44, 26, y + 80, ink, f, 600)
      );
    }),
  );
  d.node(
    'query',
    536,
    342,
    350,
    118,
    ({ x, y, w }) =>
      path(
        `M${x + 6} ${y}h${w - 12}q6 0 6 6v82q0 6-6 6H${x + 62}l-23 23v-23H${x + 6}q-6 0-6-6V${y + 6}q0-6 6-6z`,
        ink,
        2.8,
        '#fff',
      ) + d.label('query', x + 26, y + 39, 27, y + 72, ink, f, 600),
  );
  d.node(
    'retrieve',
    536,
    560,
    350,
    126,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 4, ink, 2.8) +
      rect(x + 24, y + 28, 36, 36, '#fff2c6', 3, ink, 2.8) +
      path(`M${x + 32} ${y + 46}l7 8 14-21`, ink, 3) +
      d.label('retrieve', x + 82, y + 47, 27, y + 83, ink, f, 600),
  );
  d.node(
    'context',
    536,
    812,
    350,
    126,
    ({ x, y, w, h }) =>
      path(
        `M${x} ${y}h${w - 26}l26 26v${h - 26}H${x}zM${x + w - 26} ${y}v27h26`,
        ink,
        2.8,
        '#fff',
      ) +
      d.label('context', x + 25, y + 48, 27, y + 84, ink, f, 600) +
      lines(x + w - 91, y + 58, [48, 39, 48], ink, 12, 2),
  );
  d.node(
    'llm',
    1006,
    462,
    430,
    250,
    ({ x, y, w, h }) =>
      path(
        `M${x} ${y + 18}q95-25 212 0q108-25 ${w - 212} 0v${h - 28}q-108-20-${w - 212} 0q-117-20-212 0zM${x + 212} ${y + 18}v${h - 28}`,
        ink,
        3.2,
        '#fff',
      ) +
      path(`M${x + 8} ${y + h - 4}q87-20 204 0q108-20 ${w - 220} 0`, ink, 2.4) +
      text(x + 28, y + 71, 'LLM', 48, ink, 700, f) +
      text(x + 30, y + 111, '生成模型', 18, '#57564f', 400, f) +
      lines(x + 30, y + 153, [136, 121, 145, 101], ink, 17, 2.3) +
      path(
        `M${x + w - 184} ${y + 51}h152v126h-152zM${x + w - 184} ${y + 72}h152m-101 0v105m50-105v105m-101-70h152m-152 35h152`,
        ink,
        2.8,
        '#fff',
      ) +
      rect(x + w - 181, y + 54, 146, 15, ink) +
      rect(x + w - 130, y + 75, 44, 29, '#ffcf38') +
      rect(x + w - 181, y + 145, 44, 29, '#ffcf38') +
      circle(x + w - 172, y + 61, 2, '#fff') +
      circle(x + w - 160, y + 61, 2, '#fff'),
  );
  d.node(
    'answer',
    1044,
    820,
    420,
    174,
    ({ x, y, w, h }) =>
      path(`M${x} ${y}h${w - 33}l33 33v${h - 33}H${x}zM${x + w - 33} ${y}v34h33`, ink, 3, '#fff') +
      d.label('answer', x + 28, y + 50, 34, y + 88, ink, f, 700) +
      lines(x + 30, y + 121, [w - 82, w - 122], ink, 17, 2.3),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [260, ys[i] + 122],
        [260, ys[i + 1] - 4],
      ],
      ink,
      2.3,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [711, 464],
      [711, 556],
    ],
    ink,
    2.3,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [711, 690],
      [711, 808],
    ],
    ink,
    2.3,
  );
  d.edge(
    'context',
    'llm',
    [
      [890, 875],
      [952, 875],
      [952, 587],
      [1002, 587],
    ],
    ink,
    2.3,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1221, 716],
      [1221, 764],
      [1254, 764],
      [1254, 816],
    ],
    ink,
    2.3,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [436, 881],
      [480, 881],
      [480, 623],
      [532, 623],
    ],
    ink,
    2.3,
    [488, 756, '索引供给'],
  );
  return d;
}
