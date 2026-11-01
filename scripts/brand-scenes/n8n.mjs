import { Diagram, rect, path, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function n8n(t) {
  const d = new Diagram('n8n', t),
    f = t.font,
    mono = 'SFMono-Regular, Consolas, monospace';
  d.defs.push(
    '<pattern id="n8n-workflow-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#505050"/></pattern>',
    '<marker id="n8n-data-port" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><circle cx="5" cy="5" r="3.4" fill="#363636" stroke="#bdbdbd" stroke-width="1.5"/></marker>',
  );
  d.startMarker = 'n8n-data-port';
  d.add(
    rect(0, 0, 1600, 1100, '#fafafa') +
      text(
        800,
        98,
        'Build the knowledge.',
        55,
        '#161616',
        600,
        f,
        'text-anchor="middle" letter-spacing="-1.5"',
      ) +
      text(
        800,
        159,
        'Understand the workflow.',
        55,
        '#161616',
        600,
        f,
        'text-anchor="middle" letter-spacing="-1.5"',
      ) +
      rect(48, 224, 1504, 808, '#202020', 28) +
      rect(72, 284, 1456, 720, 'url(#n8n-workflow-dots)', 16) +
      rect(80, 245, 168, 28, '#ffb6c7', 14) +
      text(100, 265, 'KNOWLEDGE / RAG', 13, '#30262a', 500, mono),
  );
  const xs = [112, 464, 816, 1168],
    ks = ['docs', 'chunks', 'embed', 'index'];
  ks.forEach((k, i) =>
    d.node(
      k,
      xs[i],
      344,
      248,
      176,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#333333', 16, '#626262', 1.2) +
        text(x + w / 2, y + 123, content[k][0], 23, '#fff', 500, f, 'text-anchor="middle"') +
        text(x + w / 2, y + 153, content[k][1], 16, '#c4c4c4', 400, f, 'text-anchor="middle"') +
        glyph(k, x + 99, y + 27, 50, ['#ffb6c7', '#e6e6e6', '#c4d9ee', '#c8e5d5'][i], 1.4) +
        path(`M${x + 20} ${y + 98}h${w - 40}`, '#515151'),
    ),
  );
  const part = (k, x, y, w, h, fill = '#333333') =>
    d.node(
      k,
      x,
      y,
      w,
      h,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, fill, 16, '#626262', 1.2) +
        text(x + 24, y + (k === 'answer' ? 32 : 40), content[k][0], 25, '#fff', 500, f) +
        text(x + 24, y + (k === 'answer' ? 63 : 73), content[k][1], 17, '#c4c4c4', 400, f) +
        (k === 'retrieve'
          ? glyph(k, x + 24, y + 99, 48, '#ffb6c7', 1.4) +
            text(x + 88, y + 129, 'vector → text', 14, '#ededed', 400, mono)
          : k === 'llm'
            ? path(`M${x + 24} ${y + 96}h${w - 48}`, '#6b5960') +
              text(x + 24, y + 125, 'prompt + context', 14, '#ffe0e9', 400, mono) +
              text(x + 24, y + 156, '→ cited response', 14, '#ffe0e9', 400, mono)
            : k === 'answer'
              ? text(x + 270, y + 58, 'Response + sources', 19, '#ededed', 400, f)
              : ''),
    );
  part('query', 112, 716, 248, 112);
  part('retrieve', 464, 684, 344, 176);
  part('context', 920, 716, 248, 112);
  part('llm', 1264, 684, 248, 176, '#4f353f');
  part('answer', 920, 936, 592, 80);
  for (let i = 0; i < 3; i++)
    d.edge(
      ks[i],
      ks[i + 1],
      [
        [xs[i] + 252, 428],
        [xs[i + 1] - 4, 428],
      ],
      '#bcbcbc',
      2.2,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [364, 772],
      [460, 772],
    ],
    '#bcbcbc',
    2.2,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [812, 772],
      [916, 772],
    ],
    '#bcbcbc',
    2.2,
  );
  d.edge(
    'context',
    'llm',
    [
      [1172, 772],
      [1260, 772],
    ],
    '#bcbcbc',
    2.2,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1388, 864],
      [1388, 932],
    ],
    '#bcbcbc',
    2.2,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [1292, 524],
      [1292, 596],
      [636, 596],
      [636, 680],
    ],
    '#bcbcbc',
    2.2,
  );
  return d;
}
