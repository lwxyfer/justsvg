import { Diagram, rect, path, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function raycast(t) {
  const d = new Diagram('raycast', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.defs.push(
    '<linearGradient id="raycast-direction" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#08090b"/><stop offset="0.38" stop-color="#280a15"/><stop offset="0.58" stop-color="#ec173d"/><stop offset="0.78" stop-color="#850b28"/><stop offset="1" stop-color="#08090b"/></linearGradient>',
    '<linearGradient id="raycast-key" x2="0" y2="1"><stop stop-color="#4c3843"/><stop offset="0.25" stop-color="#272329"/><stop offset="1" stop-color="#141317"/></linearGradient>',
  );
  d.add(
    rect(0, 0, 1600, 1100, '#08090b') +
      path('M360 0H644L1510 1100H1200Z', 'none', 0, 'url(#raycast-direction)') +
      path('M780 0H950L1600 822V1040Z', 'none', 0, 'url(#raycast-direction)') +
      text(72, 104, 'From a thought', 52, t.ink, 600, f, 'letter-spacing="-1.5"') +
      text(72, 164, 'to an answer.', 52, t.ink, 600, f, 'letter-spacing="-1.5"') +
      text(1096, 122, 'Knowledge at a keystroke.', 21, '#c5bcc7', 400, f),
  );
  const ys = [292, 460, 628, 796],
    types = ['MD', 'TXT', 'VEC', 'SQL'],
    colors = ['#dfb981', '#c9b5ec', '#b5c9df', '#a9d5bc'];
  ['docs', 'chunks', 'embed', 'index'].forEach((k, i) =>
    d.node(
      k,
      72,
      ys[i],
      320,
      128,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#19191d', 12, '#4a414b') +
        text(x + 98, y + 34, content[k][0], 24, t.ink, 500, f) +
        text(x + 98, y + 66, content[k][1], 16, '#c5bcc7', 400, f) +
        text(x + 98, y + 103, types[i] + ' / knowledge', 13, colors[i], 400, mono) +
        rect(x + 18, y + 25, 60, 76, '#2b282e', 9, '#514850') +
        glyph(k, x + 31, y + 43, 34, colors[i], 1.4),
    ),
  );
  const pane = (k, x, y, w, h) =>
    d.node(k, x, y, w, h, ({ x, y, w, h }) => {
      let s =
        rect(
          x,
          y,
          w,
          h,
          k === 'llm' ? 'url(#raycast-key)' : '#19191d',
          k === 'llm' ? 24 : 14,
          k === 'llm' ? '#936373' : '#4a414b',
          1.2,
        ) +
        text(x + 26, y + 39, content[k][0], 28, t.ink, 500, f) +
        text(x + 26, y + 75, content[k][1], 17, '#c5bcc7', 400, f);
      if (k === 'query')
        s +=
          path(`M${x + 300} ${y + 24}v64`, '#4b424b') +
          text(x + 330, y + 62, 'Ask from your knowledge base', 22, '#cfc6d1', 400, f);
      if (k === 'retrieve')
        s +=
          glyph('retrieve', x + 26, y + 102, 36, '#ff8ca2', 1.5) +
          text(x + 84, y + 128, 'Match → rank → return', 15, '#d6c8d5', 400, mono);
      if (k === 'context')
        s +=
          rect(x + 26, y + 102, w - 52, 35, '#29252d', 6) +
          text(x + 40, y + 126, 'passage + source', 15, '#d6c8d5', 400, mono);
      if (k === 'llm')
        s +=
          rect(x + 16, y + 14, w - 32, h - 32, 'none', 18, '#6b5662') +
          glyph('llm', x + w - 88, y + 86, 54, '#ff96a9', 1.5) +
          text(x + 26, y + 126, 'Generate', 20, '#fff', 500, f);
      if (k === 'answer')
        s += text(x + 322, y + 59, 'A response with its sources.', 22, '#f6d1da', 400, f);
      return s;
    });
  pane('query', 640, 264, 816, 112);
  pane('retrieve', 640, 464, 352, 160);
  pane('context', 1104, 464, 352, 160);
  pane('llm', 1104, 704, 352, 168);
  pane('answer', 640, 920, 816, 104);
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [232, ys[i] + 132],
        [232, ys[i + 1] - 4],
      ],
      '#a99aaa',
      1.8,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [816, 380],
      [816, 460],
    ],
    '#f4e5ec',
    2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [996, 544],
      [1100, 544],
    ],
    '#f4e5ec',
    2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1280, 628],
      [1280, 700],
    ],
    '#f4e5ec',
    2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1280, 876],
      [1280, 916],
    ],
    '#f4e5ec',
    2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [396, 860],
      [528, 860],
      [528, 544],
      [636, 544],
    ],
    '#f4e5ec',
    2,
  );
  return d;
}
