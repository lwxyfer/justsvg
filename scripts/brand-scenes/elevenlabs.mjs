import { Diagram, rect, path, circle, text, content } from './document.mjs';
export default function elevenlabs(t) {
  const d = new Diagram('elevenlabs', t),
    f = t.font;
  d.defs.push(
    '<radialGradient id="eleven-agent-core" cx="0.52" cy="0.5" r="0.7"><stop stop-color="#143b62"/><stop offset="0.45" stop-color="#245573"/><stop offset="0.7" stop-color="#4b8f99"/><stop offset="0.86" stop-color="#9bc4ad"/><stop offset="1" stop-color="#d5e8e3"/></radialGradient>',
    '<radialGradient id="eleven-agent-light" cx="0.15" cy="0.13" r="0.72"><stop stop-color="#ecffff" stop-opacity=".7"/><stop offset=".48" stop-color="#7cbdc8" stop-opacity=".08"/><stop offset="1" stop-color="#143b62" stop-opacity="0"/></radialGradient>',
  );
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 106, 'Knowledge that', 60, t.ink, 400, f, 'letter-spacing="-1.4"') +
      text(72, 180, 'speaks clearly.', 60, t.ink, 400, f, 'letter-spacing="-1.4"') +
      text(1040, 124, 'A source-to-answer diagram.', 22, t.muted, 400, f) +
      text(1040, 159, 'ElevenAgents visual study.', 20, t.muted, 400, f),
  );
  const ys = [288, 456, 624, 792];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      72,
      ys[i],
      288,
      112,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#f0f0ec', 14) +
        text(x + 24, y + 35, content[k][0], 25, t.ink, 500, f) +
        text(x + 24, y + 70, content[k][1], 17, t.muted, 400, f) +
        [0, 1, 2, 3, 4]
          .map((j) =>
            rect(
              x + 24 + j * 38,
              y + 88,
              [27, 33, 19, 28, 22][j],
              4,
              ['#c4d8d6', '#a9c7cb', '#7ba6b8', '#a9c7cb', '#c4d8d6'][j],
              2,
            ),
          )
          .join(''),
    ),
  );
  d.node(
    'query',
    488,
    280,
    544,
    120,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 22, '#dddcd8') +
      d.label('query', x + 26, y + 39, 28, y + 76) +
      text(x + 250, y + 68, 'Ask from your documents.', 19, t.muted, 400, f),
  );
  d.node(
    'retrieve',
    488,
    520,
    224,
    136,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#edf3f1', 14) +
      d.label('retrieve', x + 22, y + 38, 27, y + 75) +
      text(x + 22, y + 115, 'match passages', 16, '#496c6b', 400, f),
  );
  d.node(
    'context',
    808,
    520,
    224,
    136,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#edf3f1', 14) +
      d.label('context', x + 22, y + 38, 27, y + 75) +
      text(x + 22, y + 115, 'retain sources', 16, '#496c6b', 400, f),
  );
  d.node(
    'llm',
    1096,
    456,
    416,
    416,
    () =>
      circle(1304, 664, 208, 'url(#eleven-agent-core)') +
      circle(1304, 664, 208, 'url(#eleven-agent-light)') +
      text(1304, 635, content.llm[0], 44, '#fff', 400, f, 'text-anchor="middle"') +
      text(1304, 675, content.llm[1], 20, '#fff', 400, f, 'text-anchor="middle"') +
      text(1304, 722, 'context → response', 18, '#fff', 400, f, 'text-anchor="middle"') +
      path('M1196 754Q1304 814 1412 754', '#a6d1ce', 1, 'none', 'opacity=".65"'),
  );
  d.node(
    'answer',
    488,
    932,
    1024,
    108,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#fff', 18, '#dddcd8') +
      d.label('answer', x + 26, y + 38, 29, y + 76) +
      text(x + 300, y + 65, 'A clear response, with its sources.', 23, '#3e5d69', 400, f),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [216, ys[i] + 116],
        [216, ys[i + 1] - 4],
      ],
      '#426b7c',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [600, 404],
      [600, 516],
    ],
    '#426b7c',
    1.8,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [716, 588],
      [804, 588],
    ],
    '#426b7c',
    1.8,
  );
  d.edge(
    'context',
    'llm',
    [
      [1036, 588],
      [1064, 588],
      [1064, 664],
      [1092, 664],
    ],
    '#426b7c',
    1.8,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1304, 876],
      [1304, 928],
    ],
    '#426b7c',
    1.8,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [364, 848],
      [424, 848],
      [424, 588],
      [484, 588],
    ],
    '#426b7c',
    1.8,
  );
  return d;
}
