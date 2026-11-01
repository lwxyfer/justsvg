import { Diagram, rect, path, text, circle, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function cursor(t) {
  const d = new Diagram('cursor', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 108, 'An agent that knows your codebase.', 40, t.ink, 400, f) +
      text(
        74,
        158,
        'Sources become context. Context becomes a grounded answer.',
        21,
        t.muted,
        400,
        f,
      ),
  );
  d.add(
    rect(72, 244, 344, 764, '#eeece5', 6) +
      text(96, 280, 'knowledge / sources', 16, t.ink, 500, mono) +
      path('M472 252H1440', '#d4d1c8') +
      text(472, 284, 'Grounded generation', 18, t.muted, 400, f),
  );
  const ys = [320, 484, 648, 812],
    files = [
      'sources/handbook.md',
      'pipeline/chunks.ts',
      'pipeline/embeddings.ts',
      'storage/knowledge.sql',
    ];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      96,
      ys[i],
      296,
      112,
      ({ x, y, w }) =>
        rect(x, y, w, 112, '#eeece5') +
        path(`M${x} ${y + 111}h${w}`, '#d5d1c7') +
        text(x + 42, y + 31, content[k][0], 22, t.ink, 500, f) +
        text(x + 42, y + 61, content[k][1], 16, t.muted, 400, f) +
        glyph(k, x + 4, y + 12, 26, t.ink, 1.3) +
        text(x + 10, y + 94, files[i], 13, '#595a4d', 400, mono),
    ),
  );
  d.node(
    'query',
    472,
    324,
    376,
    124,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 10, '#d4d1c8') +
      d.label('query', x + 24, y + 34, 24, y + 64) +
      text(x + 24, y + 99, 'Ask about this codebase…', 16, '#595a4d', 400, f),
  );
  d.node(
    'retrieve',
    1000,
    324,
    440,
    144,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f2f0e9', 6) +
      d.label('retrieve', x + 24, y + 34, 24, y + 64) +
      path(`M${x + 24} ${y + 82}h${w - 48}`, '#d6d1c5') +
      glyph('docs', x + 26, y + 98, 22, '#595a4d', 1.2) +
      text(x + 62, y + 116, 'handbook.md · relevant passages', 15, '#595a4d', 400, mono),
  );
  d.node(
    'context',
    1000,
    568,
    440,
    172,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#f2f0e9', 6) +
      d.label('context', x + 24, y + 34, 24, y + 64) +
      text(x + 24, y + 105, '<context source="handbook.md">', 15, '#595a4d', 400, mono) +
      text(x + 40, y + 132, 'retrieved passages + query', 15, '#595a4d', 400, mono) +
      text(x + 24, y + 157, '</context>', 15, '#595a4d', 400, mono),
  );
  d.node(
    'llm',
    472,
    720,
    376,
    248,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 6, '#c9c5ba') +
      d.label('llm', x + 24, y + 36, 25, y + 68) +
      path(`M${x} ${y + 86}h${w}`, '#dedbd2') +
      text(x + 24, y + 118, 'const answer = await agent({', 14, '#4f5548', 400, mono) +
      text(x + 40, y + 147, 'query,', 15, '#4f5548', 400, mono) +
      text(x + 40, y + 176, 'context,', 15, '#4f5548', 400, mono) +
      text(x + 40, y + 205, 'citations: true', 15, '#4f5548', 400, mono) +
      text(x + 24, y + 232, '});', 15, '#4f5548', 400, mono),
  );
  d.node(
    'answer',
    1000,
    840,
    440,
    128,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 6, '#d4d1c8') +
      d.label('answer', x + 24, y + 35, 25, y + 67) +
      path(`M${x + 24} ${y + 91}h${w - 48}`, '#d8d4cb') +
      circle(x + 31, y + 109, 3, '#68755b') +
      text(x + 44, y + 114, 'Grounded response · source references', 15, '#595a4d', 400, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [244, ys[i] + 116],
        [244, ys[i + 1] - 4],
      ],
      t.accent,
      1.6,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [852, 386],
      [996, 386],
    ],
    t.accent,
    1.6,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [1220, 472],
      [1220, 564],
    ],
    t.accent,
    1.6,
  );
  d.edge(
    'context',
    'llm',
    [
      [996, 656],
      [920, 656],
      [920, 692],
      [660, 692],
      [660, 716],
    ],
    t.accent,
    1.6,
  );
  d.edge(
    'llm',
    'answer',
    [
      [852, 904],
      [996, 904],
    ],
    t.accent,
    1.6,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [396, 868],
      [440, 868],
      [440, 508],
      [960, 508],
      [960, 436],
      [996, 436],
    ],
    t.accent,
    1.6,
  );
  return d;
}
