import { Diagram, rect, path, circle, text, lines } from './document.mjs';
export default function openai(t) {
  const d = new Diagram('openai', t),
    f = t.font,
    ink = '#421d2b',
    muted = '#58323e';
  const surface = (x, y, w, h, r = 18, alpha = 0.18) =>
    rect(x, y, w, h, '#fff', r, '#fff', 1.5, `fill-opacity="${alpha}" stroke-opacity=".8"`) +
    path(`M${x + r} ${y + 2}H${x + w - r}`, '#fff', 0.8, 'none', 'stroke-opacity=".5"');
  d.defs.push(
    `<clipPath id="${d.id}-cover"><rect x="64" y="230" width="1472" height="790" rx="18"/></clipPath>`,
    `<linearGradient id="${d.id}-warm" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffe6be"/><stop offset=".29" stop-color="#fba477"/><stop offset=".62" stop-color="#ed755e"/><stop offset="1" stop-color="#f9adb8"/></linearGradient>`,
    `<radialGradient id="${d.id}-coral"><stop stop-color="#e85c3e" stop-opacity=".86"/><stop offset=".46" stop-color="#ec6e4d" stop-opacity=".52"/><stop offset="1" stop-color="#ec6e4d" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${d.id}-light"><stop stop-color="#fff3dc" stop-opacity=".96"/><stop offset=".45" stop-color="#ffedcf" stop-opacity=".62"/><stop offset="1" stop-color="#ffedcf" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${d.id}-rose"><stop stop-color="#ffd0cd" stop-opacity=".86"/><stop offset="1" stop-color="#ffc1c1" stop-opacity="0"/></radialGradient>`,
  );
  d.defs.push(
    `<radialGradient id="${d.id}-ember"><stop stop-color="#e84b47" stop-opacity=".8"/><stop offset=".55" stop-color="#ed5c56" stop-opacity=".48"/><stop offset="1" stop-color="#ed5c56" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${d.id}-cloud-light"><stop stop-color="#ffe1c9" stop-opacity=".35"/><stop offset=".45" stop-color="#ffe1c9" stop-opacity=".12"/><stop offset="1" stop-color="#ffe1c9" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${d.id}-cloud-warm"><stop stop-color="#c64f35" stop-opacity=".17"/><stop offset=".5" stop-color="#d86347" stop-opacity=".06"/><stop offset="1" stop-color="#d86347" stop-opacity="0"/></radialGradient>`,
  );
  // Seeded vector stipple: a native pattern, not a bitmap or a noise filter.
  let seed = 17,
    grain = '';
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 110; i++)
    grain += `<circle cx="${(random() * 64).toFixed(2)}" cy="${(random() * 64).toFixed(2)}" r="${(0.22 + random() * 0.58).toFixed(2)}" fill="${i % 3 ? '#fff' : '#994946'}" opacity="${(0.035 + random() * 0.055).toFixed(3)}"/>`;
  d.defs.push(
    `<pattern id="${d.id}-grain" width="64" height="64" patternUnits="userSpaceOnUse">${grain}</pattern>`,
  );
  // Unequal, overlapping soft fields provide low-frequency atmosphere as well as fine grain.
  let atmosphere = '';
  for (let i = 0; i < 76; i++) {
    const cx = 64 + random() * 1472,
      cy = 230 + random() * 790;
    const rx = 36 + random() * 140,
      ry = 22 + random() * 95;
    const angle = -60 + random() * 120;
    atmosphere += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#${d.id}-cloud-${i % 3 ? 'light' : 'warm'})" transform="rotate(${angle.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
  }
  let contours = '';
  for (let i = 0; i < 10; i++) {
    const r = 250 + i * 13;
    contours += path(
      `M${64 + r} 230A${r} ${r} 0 0 1 64 ${230 + r}`,
      '#fff',
      1,
      'none',
      'stroke-opacity=".16"',
    );
    const s = 185 + i * 14;
    contours += path(
      `M${1536 - s} 1020A${s} ${s} 0 0 1 1536 ${1020 - s}`,
      '#fff',
      1,
      'none',
      'stroke-opacity=".18"',
    );
  }
  d.add(
    rect(0, 0, 1600, 1100, '#fff') +
      text(
        800,
        105,
        'Knowledge, in context.',
        48,
        '#181818',
        600,
        f,
        'text-anchor="middle" letter-spacing="-.9"',
      ) +
      text(
        800,
        153,
        'RAG · 从知识到有据可依的回答',
        22,
        '#5d5d5d',
        400,
        f,
        'text-anchor="middle"',
      ) +
      `<g clip-path="url(#${d.id}-cover)">${rect(64, 230, 1472, 790, `url(#${d.id}-warm)`)}${`<ellipse cx="680" cy="425" rx="680" ry="430" fill="url(#${d.id}-coral)"/>`}${circle(85, 1010, 540, `url(#${d.id}-light)`)}${
        `<ellipse cx="1440" cy="285" rx="510" ry="350" fill="url(#${d.id}-rose)"/>` +
        `<ellipse cx="1260" cy="945" rx="590" ry="360" fill="url(#${d.id}-ember)"/>` +
        atmosphere
      }${rect(64, 230, 1472, 790, `url(#${d.id}-grain)`)}${contours}</g>`,
  );
  const ys = [340, 495, 650, 805];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(key, 128, ys[i], 320, 104, ({ x, y, w, h }) => {
      let glyph = '';
      if (i === 0)
        glyph =
          path(`M${x + 23} ${y + 26}h23l8 8v34h-31zM${x + 46} ${y + 26}v9h8`, ink, 1.5) +
          lines(x + 30, y + 46, [17, 14], ink, 9, 1.5);
      if (i === 1)
        glyph = [0, 1, 2]
          .map((j) => rect(x + 21, y + 29 + j * 14, 35, 6, 'none', 2, ink, 1.4))
          .join('');
      if (i === 2)
        glyph =
          path(`M${x + 24} ${y + 63}l15-31 17 29`, ink, 1.5) +
          [
            [24, 63],
            [39, 32],
            [56, 61],
          ]
            .map(([dx, dy]) => circle(x + dx, y + dy, 3, '#fff', ink, 1.3))
            .join('');
      if (i === 3)
        glyph = path(
          `M${x + 22} ${y + 34}q17-9 34 0v29q-17 9-34 0zM${x + 22} ${y + 34}q17 9 34 0m-34 14q17 9 34 0`,
          ink,
          1.5,
        );
      return (
        surface(x, y, w, h, 18, 0.18) +
        glyph +
        d.label(key, x + 77, y + 42, 24, y + 74, ink, f, 500)
      );
    }),
  );
  d.node(
    'query',
    600,
    340,
    300,
    108,
    ({ x, y, w, h }) =>
      surface(x, y, w, h, 24, 0.22) + d.label('query', x + 24, y + 43, 25, y + 76, ink, f, 500),
  );
  d.node(
    'retrieve',
    600,
    555,
    300,
    156,
    ({ x, y, w, h }) =>
      surface(x, y, w, h, 22, 0.22) +
      circle(x + 34, y + 35, 11, 'none', ink, 1.5) +
      path(`M${x + 42} ${y + 43}l8 8`, ink, 1.5) +
      d.label('retrieve', x + 25, y + 92, 28, y + 127, ink, f, 500),
  );
  d.node(
    'context',
    600,
    850,
    300,
    114,
    ({ x, y, w, h }) =>
      surface(x, y, w, h, 18, 0.18) +
      d.label('context', x + 24, y + 46, 25, y + 80, ink, f, 500) +
      lines(x + w - 64, y + 29, [36, 29, 36], muted, 10, 1.4),
  );
  d.node(
    'llm',
    1120,
    498,
    320,
    210,
    ({ x, y, w, h }) =>
      surface(x, y, w, h, 24, 0.14) +
      path(
        `M${x + 118} ${y + 41}l42-23 42 23-42 23zM${x + 118} ${y + 54}l42 23 42-23m-84 14 42 23 42-23`,
        ink,
        1.6,
      ) +
      text(x + w / 2, y + 137, 'LLM', 44, ink, 500, f, 'text-anchor="middle"') +
      text(x + w / 2, y + 174, '生成模型', 18, muted, 400, f, 'text-anchor="middle"'),
  );
  d.node(
    'answer',
    1120,
    850,
    320,
    114,
    ({ x, y, w, h }) =>
      surface(x, y, w, h, 18, 0.22) +
      d.label('answer', x + 24, y + 46, 27, y + 80, ink, f, 500) +
      circle(x + w - 39, y + 39, 15, '#fff', ink, 1.3) +
      path(`M${x + w - 46} ${y + 39}l5 5 9-11`, ink, 1.6),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [288, ys[i] + 108],
        [288, ys[i + 1] - 4],
      ],
      '#713346',
      1.6,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [750, 452],
      [750, 551],
    ],
    '#713346',
    1.7,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [750, 715],
      [750, 846],
    ],
    '#713346',
    1.7,
  );
  d.edge(
    'context',
    'llm',
    [
      [904, 907],
      [1008, 907],
      [1008, 603],
      [1116, 603],
    ],
    '#713346',
    1.7,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1280, 712],
      [1280, 846],
    ],
    '#713346',
    1.7,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [452, 857],
      [522, 857],
      [522, 633],
      [596, 633],
    ],
    '#713346',
    1.7,
    [530, 780, '索引供给'],
  );
  return d;
}
