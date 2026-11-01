import { Diagram, rect, path, circle, text, content } from './document.mjs';
import { glyph } from './diagram-glyphs.mjs';
export default function spotify(t) {
  const d = new Diagram('spotify', t),
    f = t.font;
  d.add(
    rect(0, 0, 1600, 1100, t.paper) +
      text(72, 116, 'Knowledge,', 76, '#fff', 700, f, 'letter-spacing="-2"') +
      text(72, 207, 'in the right mix.', 76, '#1ed760', 700, f, 'letter-spacing="-2"') +
      text(76, 264, '找到相关的片段，让答案进入状态。', 22, t.muted, 400, f),
  );
  const ys = [330, 490, 650, 810],
    colors = ['#b7a9f5', '#f7b47d', '#96dcb0', '#a8c7ed'];
  ['docs', 'chunks', 'embed', 'index'].forEach((key, i) =>
    d.node(
      key,
      80,
      ys[i],
      360,
      106,
      ({ x, y, w, h }) =>
        rect(x, y, w, h, '#1b1b1b', 8) +
        rect(x + 16, y + 17, 72, 72, colors[i], 4) +
        glyph(key, x + 32, y + 33, 40, '#151515', 1.8) +
        text(x + 106, y + 44, content[key][0], 25, '#fff', 600, f) +
        text(x + 106, y + 78, content[key][1], 16, t.muted, 400, f),
    ),
  );
  d.node(
    'query',
    600,
    330,
    350,
    112,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#242424', 56) +
      glyph('query', x + 24, y + 34, 38, '#fff') +
      text(x + 82, y + 46, 'User query', 27, '#fff', 600, f) +
      text(x + 82, y + 81, '用户问题', 17, t.muted, 400, f),
  );
  d.node(
    'retrieve',
    600,
    568,
    350,
    156,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#242424', 12) +
      text(x + 26, y + 62, 'Retriever', 32, '#fff', 700, f) +
      text(x + 26, y + 101, '相似度检索', 18, t.muted, 400, f) +
      circle(x + w - 48, y + 48, 24, '#1ed760') +
      path(`M${x + w - 54} ${y + 36}l19 12-19 12z`, 'none', 0, '#092817'),
  );
  d.node(
    'context',
    600,
    872,
    350,
    122,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#242424', 12) +
      text(x + 26, y + 50, 'Context', 30, '#fff', 600, f) +
      text(x + 26, y + 87, '上下文构建', 17, t.muted, 400, f) +
      glyph('context', x + w - 70, y + 35, 40, '#b3b3b3'),
  );
  d.node('llm', 1140, 476, 300, 300, ({ x, y, w, h }) => {
    const cx = x + w / 2,
      cy = y + h / 2;
    return (
      circle(cx, cy, 150, '#1ed760') +
      [132, 120, 108, 96].map((r) => circle(cx, cy, r, 'none', '#126a35', 1)).join('') +
      circle(cx, cy, 76, '#121212') +
      text(cx, cy + 5, 'LLM', 40, '#fff', 700, f, 'text-anchor="middle"') +
      text(cx, cy + 37, '生成模型', 17, '#b9eacb', 400, f, 'text-anchor="middle"')
    );
  });
  d.node(
    'answer',
    1110,
    872,
    360,
    122,
    ({ x, y, w, h }) =>
      rect(x, y, w, h, '#163b26', 12, '#1ed760', 1.5) +
      text(x + 26, y + 50, 'Answer', 30, '#fff', 700, f) +
      text(x + 26, y + 87, '回答与引用', 17, '#b9eacb', 400, f) +
      glyph('answer', x + w - 66, y + 36, 38, '#1ed760'),
  );
  for (let i = 0; i < 3; i++)
    d.edge(
      ['docs', 'chunks', 'embed'][i],
      ['chunks', 'embed', 'index'][i],
      [
        [260, ys[i] + 110],
        [260, ys[i + 1] - 4],
      ],
      t.accent,
      1.7,
    );
  d.edge(
    'query',
    'retrieve',
    [
      [775, 446],
      [775, 564],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'retrieve',
    'context',
    [
      [775, 728],
      [775, 868],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'context',
    'llm',
    [
      [954, 933],
      [1030, 933],
      [1030, 626],
      [1136, 626],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'llm',
    'answer',
    [
      [1290, 780],
      [1290, 868],
    ],
    t.accent,
    1.7,
  );
  d.edge(
    'index',
    'retrieve',
    [
      [444, 863],
      [510, 863],
      [510, 646],
      [596, 646],
    ],
    t.accent,
    1.7,
    [522, 774, '索引供给'],
  );
  return d;
}
