import { diagram, rect, path, text, label, chain, sans, serif, glyph } from './common.mjs';
export function goldman(t) {
  const d = diagram(t);
  d.add(
    rect(0, 0, 1600, 1100, '#ffffff') +
      rect(0, 0, 1600, 38, '#7599be') +
      text(72, 134, 'The architecture', 68, t.ink, 400, serif) +
      text(72, 222, 'of informed answers.', 68, t.ink, 400, serif) +
      text(
        76,
        280,
        'A research-led view of retrieval-augmented generation.',
        23,
        t.muted,
        400,
        sans,
      ) +
      text(1528, 105, 'Goldman Sachs', 27, t.ink, 400, serif, 'text-anchor="end"') +
      text(1528, 143, 'Visual study', 17, t.muted, 400, sans, 'text-anchor="end"') +
      path('M72 326H1528', '#aeb6bd', 1),
  );
  d.add(
    text(72, 387, 'Knowledge formation', 27, t.ink, 400, serif) +
      text(72, 714, 'Retrieval & synthesis', 27, t.ink, 400, serif),
  );
  const top = ['docs', 'chunks', 'embed'];
  top.forEach((key, i) => {
    const x = 72 + i * 308;
    d.node(
      key,
      x,
      430,
      230,
      144,
      () =>
        rect(x, 430, 230, 144, '#ffffff') +
        path(`M${x} 430H${x + 230}`, t.accent, 2) +
        glyph(key, x + 8, 452, 32, t.accent, 1.5) +
        label(t, key, x + 8, 517, 28, t.ink, t.muted, 'start', serif),
    );
  });
  d.node(
    'index',
    1040,
    430,
    488,
    144,
    () =>
      rect(1040, 430, 488, 144, '#e6eef6') +
      label(t, 'index', 1068, 478, 30, t.ink, t.muted, 'start', serif) +
      glyph('index', 1436, 469, 56, t.accent, 1.4) +
      text(1068, 552, 'Reusable knowledge foundation', 17, t.muted, 400, sans),
  );
  d.node(
    'query',
    72,
    770,
    230,
    170,
    () =>
      rect(72, 770, 230, 170, t.ink) +
      label(t, 'query', 96, 823, 28, '#ffffff', '#d5e3f0', 'start', serif) +
      text(96, 909, 'The question', 17, '#d5e3f0', 400, sans),
  );
  for (const [key, x] of [
    ['retrieve', 380],
    ['context', 688],
  ])
    d.node(
      key,
      x,
      770,
      230,
      170,
      () =>
        rect(x, 770, 230, 170, '#ffffff') +
        path(`M${x} 770H${x + 230}M${x} 940H${x + 230}`, '#aeb6bd', 1) +
        label(t, key, x + 8, 823, 28, t.ink, t.muted, 'start', serif) +
        glyph(key, x + 8, 885, 28, t.accent, 1.4),
    );
  d.node(
    'llm',
    1040,
    770,
    220,
    170,
    () =>
      rect(1040, 770, 220, 170, '#d4e2ef') +
      label(t, 'llm', 1064, 831, 42, t.ink, t.muted, 'start', serif),
  );
  d.node(
    'answer',
    1336,
    770,
    192,
    170,
    () =>
      rect(1336, 770, 192, 170, '#ffffff') +
      path('M1336 940H1528', t.accent, 2) +
      label(t, 'answer', 1344, 823, 30, t.ink, t.muted, 'start', serif) +
      text(1344, 909, 'With citations', 16, t.muted, 400, sans),
  );
  chain(d, ['docs', 'chunks', 'embed', 'index'], 'horizontal', t.accent, 1.8);
  chain(d, ['query', 'retrieve', 'context', 'llm', 'answer'], 'horizontal', t.accent, 1.8);
  d.edge(
    'index',
    'retrieve',
    [
      [1284, 574],
      [1284, 654],
      [495, 654],
      [495, 770],
    ],
    t.accent,
    1.8,
  );
  d.add(
    path('M72 1015H1528', '#aeb6bd', 1) +
      text(
        72,
        1046,
        'Source evidence → structured knowledge → considered response',
        19,
        t.muted,
        400,
        sans,
      ),
  );
  return d;
}
export function morgan(t) {
  const d = diagram(t);
  d.add(
    rect(0, 0, 1600, 1100, '#ffffff') +
      text(64, 93, 'Morgan Stanley', 32, t.ink, 500, sans) +
      text(1536, 92, 'Visual study', 17, t.muted, 400, sans, 'text-anchor="end"') +
      path('M64 130H1536', '#ccd0d3', 1) +
      text(64, 220, 'A clear view of knowledge.', 66, t.ink, 400, sans, 'letter-spacing="-1.5"') +
      text(68, 278, 'An analytical framework for grounded answers.', 24, t.muted, 400, sans),
  );
  d.add(
    rect(64, 330, 400, 700, '#252b30') +
      text(96, 377, 'Knowledge base', 22, '#ffffff', 500, sans) +
      text(560, 363, 'Retrieval workflow', 23, t.ink, 500, sans) +
      text(1020, 363, 'Synthesis & evidence', 23, t.ink, 500, sans),
  );
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) => {
    const y = 410 + i * 155;
    d.node(
      key,
      96,
      y,
      336,
      110,
      () =>
        rect(96, y, 336, 110, '#343d45') +
        glyph(key, 117, y + 29, 36, '#ffffff', 1.4) +
        label(t, key, 177, y + 44, 26, '#ffffff', '#d7e0e6'),
    );
  });
  d.node(
    'query',
    560,
    410,
    320,
    104,
    () => rect(560, 410, 320, 104, '#f1f3f4') + label(t, 'query', 584, 451, 27),
  );
  d.node(
    'retrieve',
    560,
    600,
    320,
    140,
    () =>
      rect(560, 600, 320, 140, '#e1f1f7') +
      label(t, 'retrieve', 584, 652, 33) +
      glyph('retrieve', 806, 626, 43, t.accent, 1.5),
  );
  d.node(
    'context',
    560,
    850,
    320,
    130,
    () =>
      rect(560, 850, 320, 130, '#ffffff') +
      path('M560 850H880M560 980H880', '#adb4b9', 1) +
      label(t, 'context', 584, 902, 31),
  );
  d.node(
    'llm',
    1020,
    600,
    480,
    160,
    () =>
      rect(1020, 600, 480, 160, '#d2edf5') +
      label(t, 'llm', 1048, 663, 44) +
      glyph('llm', 1374, 636, 86, t.accent, 1.2),
  );
  d.node(
    'answer',
    1020,
    850,
    480,
    130,
    () =>
      rect(1020, 850, 480, 130, '#ffffff') +
      path('M1020 850H1500M1020 980H1500', '#adb4b9', 1) +
      label(t, 'answer', 1048, 902, 31) +
      text(1472, 940, 'Sources in view', 17, t.muted, 400, sans, 'text-anchor="end"'),
  );
  chain(d, ['docs', 'chunks', 'embed', 'index'], 'vertical', '#9dc7d9', 1.8);
  chain(d, ['query', 'retrieve', 'context'], 'vertical', t.accent, 1.8);
  d.edge(
    'index',
    'retrieve',
    [
      [432, 930],
      [495, 930],
      [495, 670],
      [560, 670],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [880, 915],
      [950, 915],
      [950, 680],
      [1020, 680],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1260, 760],
      [1260, 850],
    ],
    t.accent,
    1.8,
  );
  return d;
}
export function jpmorgan(t) {
  const d = diagram(t);
  d.add(
    rect(0, 0, 1600, 1100, '#faf7f2') +
      text(64, 94, 'J.P. Morgan', 38, t.ink, 400, serif) +
      text(1536, 92, 'Visual study', 17, t.muted, 400, sans, 'text-anchor="end"') +
      path('M64 129H1536', '#cdc0b0', 1) +
      text(64, 218, 'From information to insight.', 67, t.ink, 400, serif) +
      text(68, 276, 'The operating model of a retrieval-augmented answer.', 23, t.muted, 400, sans),
  );
  for (const [x, w, fill, title] of [
    [64, 400, '#eee8dd', 'Knowledge foundation'],
    [520, 430, '#fffdfa', 'Retrieval & context'],
    [1008, 528, '#e9ded0', 'Synthesis & delivery'],
  ])
    d.add(
      rect(x, 338, w, 680, fill) +
        text(x + 32, 383, title, 23, t.ink, 400, serif) +
        path(`M${x + 32} 402H${x + w - 32}`, '#c2ae98', 1),
    );
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) => {
    const y = 425 + i * 150;
    d.node(
      key,
      96,
      y,
      336,
      104,
      () =>
        rect(96, y, 336, 104, '#faf7f2') +
        glyph(key, 112, y + 28, 34, t.accent, 1.5) +
        label(t, key, 172, y + 40, 27, t.ink, t.muted, 'start', serif),
    );
  });
  const note = (key, y, h) =>
    d.node(
      key,
      555,
      y,
      360,
      h,
      () =>
        rect(555, y, 360, h, '#fffdfa') +
        path(`M555 ${y}H915M555 ${y + h}H915`, '#c2ae98', 1) +
        label(t, key, 575, y + 42, 29, t.ink, t.muted, 'start', serif),
    );
  note('query', 425, 104);
  note('retrieve', 665, 125);
  note('context', 875, 104);
  d.node(
    'llm',
    1040,
    520,
    464,
    200,
    () =>
      rect(1040, 520, 464, 200, '#3b3029') +
      label(t, 'llm', 1072, 589, 48, '#fff9ee', '#e8dacc', 'start', serif) +
      path('M1072 664H1472', '#ac8d69', 1) +
      text(1072, 696, 'Evidence-led generation', 20, '#e8dacc', 400, serif),
  );
  d.node(
    'answer',
    1040,
    875,
    464,
    104,
    () =>
      rect(1040, 875, 464, 104, '#fffdfa') +
      label(t, 'answer', 1064, 917, 32, t.ink, t.muted, 'start', serif) +
      glyph('answer', 1428, 901, 48, t.accent, 1.5),
  );
  chain(d, ['docs', 'chunks', 'embed', 'index'], 'vertical', t.accent, 1.8);
  chain(d, ['query', 'retrieve', 'context'], 'vertical', t.accent, 1.8);
  d.edge(
    'index',
    'retrieve',
    [
      [432, 927],
      [483, 927],
      [483, 727.5],
      [555, 727.5],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [915, 927],
      [970, 927],
      [970, 620],
      [1040, 620],
    ],
    t.accent,
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1272, 720],
      [1272, 875],
    ],
    t.accent,
    1.8,
  );
  return d;
}
