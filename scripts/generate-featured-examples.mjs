import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iso, slabOf, depthOf, boxCorners } from './vendor/iso-kit.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src/examples');
const escape = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const tag = (name, attrs = {}, body = null) =>
  `<${name}${Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escape(v)}"`)
    .join('')}${body === null ? '/>' : `>${body}</${name}>`}`;
const rect = (x, y, w, h, fill = 'none', stroke = 'none', rx = 0) =>
  tag('rect', { x, y, width: w, height: h, fill, stroke, rx });
const text = (s, x, y, size = 20, fill = '#27344b', weight = 400, anchor = 'start') =>
  tag(
    'text',
    { x, y, 'font-size': size, fill, 'font-weight': weight, 'text-anchor': anchor },
    escape(s),
  );
const path = (d, fill = 'none', stroke = 'none', sw = 1) =>
  tag('path', { d, fill, stroke, 'stroke-width': sw });
const nodes = [
  ['docs', 'Documents', '文档进料'],
  ['chunks', 'Chunking', '解析切分'],
  ['embed', 'Embeddings', '向量编码'],
  ['index', 'Vector index', '索引仓储'],
  ['query', 'User query', '问题输入'],
  ['retrieve', 'Retriever', '相似度检索'],
  ['context', 'Context', '上下文装配'],
  ['llm', 'LLM', '生成模型'],
  ['answer', 'Answer', '回答与引用'],
];
const edges = [
  ['docs', 'chunks'],
  ['chunks', 'embed'],
  ['embed', 'index'],
  ['query', 'retrieve'],
  ['retrieve', 'context'],
  ['context', 'llm'],
  ['llm', 'answer'],
  ['index', 'retrieve'],
];
const commonPrompt = `内容为演示用 RAG 架构，并非真实设备、天文数据或生产部署。离线：Documents（文档）→ Chunking（切分）→ Embeddings（向量编码）→ Vector index（索引）。在线：User query（问题）→ Retriever（检索）→ Context（上下文）→ LLM（生成）→ Answer（回答与引用）。索引另向 Retriever 提供内容。保留九个命名节点与八条连接。\n\n输出完整 1200×800 SVG，viewBox="0 0 1200 800"。原生 text、g、path、polygon、rect、circle、polyline、defs/gradient/marker；不要图片、脚本、事件、foreignObject、外部字体、纹理滤镜或 CSS @规则。文字不转路径。节点使用 data-node="true"、唯一 id 和中文 data-label；第一个透明 rect 为包含图形和文字的逻辑边界。连线可用 data-sf-start-node/end-node="#id" 与 data-sf-start-anchor/end-anchor="u v 0 0" 记录该边界中的归一化端点，支持继续编辑；实例移动后允许按编辑器路线重排。标题、标签和连线应避让，不要文本重叠。只输出 SVG XML。`;

function connection(slug, a, b, points, bounds, color = '#5b7f95', width = 2) {
  const anchor = (id, p) => {
    const [x, y, w, h] = bounds[id];
    return `${((p[0] - x) / w).toFixed(6)} ${((p[1] - y) / h).toFixed(6)} 0 0`;
  };
  return tag('polyline', {
    id: `${slug}-edge-${a}-${b}`,
    points: points.map((p) => p.map((n) => +n.toFixed(2)).join(',')).join(' '),
    fill: 'none',
    stroke: color,
    'stroke-width': width,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'marker-end': `url(#${slug}-arrow)`,
    'data-sf-start-node': `#${slug}-node-${a}`,
    'data-sf-end-node': `#${slug}-node-${b}`,
    'data-sf-start-anchor': anchor(a, points[0]),
    'data-sf-end-anchor': anchor(b, points.at(-1)),
  });
}
function write(slug, name, body, prompt, defs = '', ink = '#5b7f95') {
  const marker = tag(
    'marker',
    {
      id: `${slug}-arrow`,
      viewBox: '0 0 10 10',
      refX: 9,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: 'auto-start-reverse',
    },
    path('M0 0L10 5L0 10Z', ink),
  );
  const svg = tag(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 1200,
      height: 800,
      viewBox: '0 0 1200 800',
      'font-family': 'Arial, PingFang SC, sans-serif',
    },
    tag('title', {}, name + ' · RAG 架构图') +
      tag('desc', {}, '原创可编辑 SVG；演示构造。对应 Prompt 见 ' + slug + '.md。') +
      tag('defs', {}, marker + defs) +
      body,
  );
  writeFileSync(
    `${root}/prompts/${slug}.md`,
    `# ${name} · RAG 架构图\n\n${prompt}\n\n${commonPrompt}\n`,
  );
  writeFileSync(`${root}/assets/${slug}.svg`, svg + '\n');
}

function factory() {
  const slug = 'factory',
    P = { origin: [470, 232], scale: 0.88, azimuth: 45, elevation: 30 };
  const locations = [
    [90, 90],
    [260, 90],
    [430, 90],
    [600, 90],
    [80, 300],
    [250, 300],
    [420, 300],
    [590, 300],
    [755, 300],
  ];
  const tones = {
    steel: ['#edf4fa', '#d9e4ef', '#b5c8d9', '#7f99af'],
    blue: ['#b7d9ff', '#80b5ed', '#517cba', '#355c91'],
    orange: ['#ffe0b7', '#f6b96f', '#d68a44', '#a5652e'],
    green: ['#d8f0dd', '#9fceb1', '#6b9d84', '#477a65'],
  };
  let count = 0;
  const records = [];
  const part = (x, y, z, w, d, h, tone = 'steel') => ({ x, y, z, w, d, h, tone });
  const paint = (part) => {
    count++;
    records.push(part);
    const s = slabOf({ x: part.x, y: part.y, w: part.w, d: part.d, r: 0 }, part.z, part.h, P, 1),
      c = tones[part.tone];
    return tag(
      'g',
      { 'data-solid': 'true' },
      path(s.fill, c[2]) +
        s.shades.map((d, i) => (d ? path(d, c[Math.min(3, i)]) : '')).join('') +
        path(s.top, c[0]) +
        path(s.outline, 'none', c[3], 0.8) +
        path(s.crease, 'none', c[3], 0.55),
    );
  };
  const sorted = (parts) =>
    parts
      .sort(
        (a, b) =>
          depthOf([a.x + a.w / 2, a.y + a.d / 2, a.z + a.h / 2], P) -
          depthOf([b.x + b.w / 2, b.y + b.d / 2, b.z + b.h / 2], P),
      )
      .map(paint)
      .join('');
  let body =
    rect(0, 0, 1200, 800, '#f4f7fb') +
    text('知识有自己的流水线', 60, 76, 44, '#243b54', 700) +
    text('把文档送入加工设备，把检索结果装配成回答', 62, 114, 17, '#536c83');
  const base = [part(0, 0, 0, 800, 400, 12)];
  for (const [x, y] of [
    [18, 18],
    [744, 18],
    [18, 344],
    [744, 344],
  ])
    base.push(part(x, y, -13, 38, 38, 13, 'blue'));
  base.push(
    part(20, 18, 12, 760, 8, 3),
    part(20, 374, 12, 760, 8, 3),
    part(20, 26, 12, 8, 348, 3),
    part(772, 26, 12, 8, 348, 3),
  );
  for (const y of [90, 300]) base.push(part(30, y - 16, 12, 735, 32, 4, 'blue'));
  body += sorted(base);
  const bounds = {},
    groups = [];
  nodes.forEach(([id, title, sub], i) => {
    const [x, y] = locations[i],
      [cx, cy] = iso([x, y, 0], P);
    bounds[id] = [cx - 80, cy - 118, 160, 172];
    const pieces = [part(x - 54, y - 35, 16, 108, 70, 8)];
    if (id === 'docs') {
      pieces.push(
        part(x - 42, y - 25, 24, 84, 50, 12, 'blue'),
        part(x - 48, y - 32, 24, 6, 64, 46),
        part(x + 42, y - 32, 24, 6, 64, 46),
      );
      for (let j = 0; j < 5; j++)
        pieces.push(part(x - 35 + j * 1.3, y - 24, 36 + j * 3, 70, 48, 3));
    } else if (id === 'chunks') {
      pieces.push(
        part(x - 45, y - 28, 24, 10, 56, 68, 'blue'),
        part(x + 35, y - 28, 24, 10, 56, 68, 'blue'),
        part(x - 45, y - 28, 92, 90, 56, 10),
        part(x - 32, y - 6, 55, 64, 8, 30, 'orange'),
        part(x - 5, y - 4, 85, 10, 8, 7, 'blue'),
        part(x - 35, y - 22, 24, 70, 44, 5),
      );
    } else if (id === 'embed') {
      pieces.push(
        part(x - 44, y - 28, 24, 10, 56, 72, 'blue'),
        part(x + 34, y - 28, 24, 10, 56, 72, 'blue'),
        part(x - 44, y - 28, 96, 88, 56, 8),
        part(x - 27, y - 22, 60, 54, 44, 16, 'orange'),
        part(x - 6, y - 6, 76, 12, 12, 20, 'blue'),
        part(x - 30, y - 23, 24, 60, 46, 7, 'blue'),
      );
      for (let j = 0; j < 3; j++)
        pieces.push(part(x - 24 + j * 16, y - 17, 31, 11, 34, 5, 'green'));
    } else if (id === 'index') {
      pieces.push(part(x - 44, y - 27, 24, 88, 54, 77, 'blue'));
      for (let j = 0; j < 4; j++)
        pieces.push(
          part(x - 36, y + 27, 31 + j * 16, 72, 4, 10),
          part(x + 18, y + 31, 34 + j * 16, 10, 3, 3, 'orange'),
        );
    } else if (id === 'query') {
      pieces.push(
        part(x - 40, y - 25, 24, 80, 50, 24, 'blue'),
        part(x - 45, y - 29, 48, 90, 58, 5),
      );
      for (let j = 0; j < 6; j++)
        pieces.push(
          part(
            x - 30 + (j % 3) * 21,
            y - 17 + Math.floor(j / 3) * 19,
            53,
            14,
            12,
            5,
            j === 5 ? 'orange' : 'green',
          ),
        );
    } else if (id === 'retrieve') {
      pieces.push(
        part(x - 44, y - 28, 24, 9, 56, 62),
        part(x + 35, y - 28, 24, 9, 56, 62),
        part(x - 44, y - 28, 86, 88, 13, 10, 'blue'),
        part(x - 14, y - 21, 67, 28, 30, 19, 'orange'),
        part(x - 20, y - 4, 48, 8, 19, 26),
        part(x + 12, y - 4, 48, 8, 19, 26),
      );
    } else if (id === 'context') {
      pieces.push(part(x - 43, y - 27, 24, 86, 54, 8, 'green'));
      for (let j = 0; j < 3; j++)
        pieces.push(
          part(x - 36 + j * 25, y - 24, 32, 4, 48, 18),
          part(x - 30 + j * 25, y - 18, 32, 16, 36, 4, 'orange'),
        );
    } else if (id === 'llm') {
      pieces.push(
        part(x - 46, y - 30, 24, 92, 60, 65, 'blue'),
        part(x - 34, y - 20, 89, 68, 40, 5),
      );
      for (let j = 0; j < 4; j++)
        pieces.push(
          part(x - 27 + j * 15, y - 18, 94, 9, 36, 8, 'orange'),
          part(x - 35 + j * 18, y + 30, 38, 10, 3, 37),
        );
    } else {
      pieces.push(part(x - 44, y - 28, 24, 88, 56, 14, 'green'));
      for (let j = 0; j < 4; j++) pieces.push(part(x - 35 + j * 2, y - 22, 38 + j * 3, 64, 44, 3));
    }
    // Leave visible conveyor gaps; the equipment keeps its proportions and all parts.
    for (const p of pieces) {
      p.x = x + (p.x - x) * 0.82;
      p.y = y + (p.y - y) * 0.82;
      p.w *= 0.82;
      p.d *= 0.82;
      p.z = 16 + (p.z - 16) * 0.82;
      p.h *= 0.82;
    }
    const labelY = i < 4 ? cy + 4 : cy + 23;
    const projected = pieces.flatMap((p) =>
      boxCorners({ x: p.x, y: p.y, w: p.w, d: p.d }, p.z, p.z + p.h).map((v) => iso(v, P)),
    );
    projected.push([cx - 56, labelY], [cx + 56, labelY + 29]);
    const bx = Math.min(...projected.map((p) => p[0])) - 10,
      by = Math.min(...projected.map((p) => p[1])) - 10;
    const bw = Math.max(...projected.map((p) => p[0])) - bx + 10,
      bh = Math.max(...projected.map((p) => p[1])) - by + 10;
    bounds[id] = [bx, by, bw, bh];
    const label =
      rect(cx - 56, labelY, 112, 29, '#ffffff') +
      text(title, cx, labelY + 12, 12, '#243b54', 600, 'middle') +
      text(sub, cx, labelY + 24, 10, '#526980', 400, 'middle');
    groups.push({
      depth: depthOf([x, y, 0], P),
      svg: tag(
        'g',
        { id: `${slug}-node-${id}`, 'data-node': 'true', 'data-label': `${title} / ${sub}` },
        rect(bx, by, bw, bh) + sorted(pieces) + label,
      ),
    });
  });
  let links = '';
  for (const [a, b] of edges) {
    const ai = nodes.findIndex((n) => n[0] === a),
      bi = nodes.findIndex((n) => n[0] === b),
      [ax, ay] = locations[ai],
      [bx, by] = locations[bi];
    const source = iso([ax + 54 * 0.82, ay - 35 * 0.82, 16], P),
      target = iso([bx - 54 * 0.82, by + 35 * 0.82, 16], P);
    source[0] += 3;
    target[0] -= 3;
    const points =
      a === 'index'
        ? [
            source,
            [1118, source[1]],
            [1118, 720],
            [bounds[b][0] + bounds[b][2] / 2, 720],
            [bounds[b][0] + bounds[b][2] / 2, bounds[b][1] + bounds[b][3] - 3],
          ]
        : [source, target];
    links += connection(slug, a, b, points, bounds, a === 'index' ? '#ce8741' : '#557b9c', 2);
  }
  body +=
    tag('g', { 'data-label': '加工与检索路径' }, links) +
    groups
      .sort((a, b) => a.depth - b.depth)
      .map((g) => g.svg)
      .join('');
  body +=
    text('离线加工 / INDEXING', 820, 178, 15, '#3d668c', 600) +
    text('在线装配 / ANSWERING', 96, 586, 15, '#477a65', 600) +
    text('概念设备 · 九个可编辑节点 · 橙线：索引供给检索器', 60, 765, 13, '#536c83');
  if (count < 60) throw new Error('Factory detail count is below the authored parts list');
  const contact = (a, b) => {
    const spans = [
      ['x', 'w'],
      ['y', 'd'],
      ['z', 'h'],
    ].map(([at, size]) => Math.min(a[at] + a[size], b[at] + b[size]) - Math.max(a[at], b[at]));
    return spans.every((v) => v >= -1e-6) && spans.filter((v) => v > 1e-6).length >= 2;
  };
  const connected = new Set([0]),
    queue = [0];
  while (queue.length) {
    const at = queue.pop();
    for (let i = 0; i < records.length; i++)
      if (!connected.has(i) && contact(records[at], records[i])) {
        connected.add(i);
        queue.push(i);
      }
  }
  if (connected.size !== records.length)
    throw new Error(`Factory has ${records.length - connected.size} unsupported parts`);
  console.log('factory static support audit: all prismatic parts connected to base');
  console.log('factory prismatic parts:', count);
  write(
    slug,
    '等距知识工厂',
    body,
    `用一座精密的等距微型知识加工设备解释 RAG。不要使用双排同尺寸卡片。画布暖冷白 #f4f7fb，采用 azimuth45° / elevation30°、四级明暗的棱柱几何。底板有四脚、压边和两条运输轨道；离线侧依次为纸张进料架、带刀片的切分机、带上下模的编码压机和四层索引抽屉；在线侧为六键问题台、带滑块夹爪的检索架、分隔上下文托盘、四芯片生成机箱和叠纸输出台。至少60个有功能的零件，不画写实纹理或装饰光晕。\n\n世界坐标：底板 x0–800 / y0–400 / z0–12。四个离线设备中心 (90,90)、(260,90)、(430,90)、(600,90)；五个在线设备中心 (80,300)、(250,300)、(420,300)、(590,300)、(755,300)。设备高约60–100个演示单位。按深度从后向前绘制，物体在底板上有支撑；两侧分别以蓝色金属和橙色工作部件强调机制。设备相对上述零件计划按0.82等比缩放，底板和设备中心不变，给运输间隙留出空间。每个部件下方用112px宽的英文/中文标牌，标牌与设备一起分组。两条主链的箭头从前一设备底座最右角外侧，指向下一设备底座最左角外侧，箭头末段至少15px不被零件或标牌遮盖；不要从机身中央接线。索引向检索器供给的橙线沿右侧x1118、下侧y720绕行，再向上指向检索器标牌下方，整条路线避开设备。保留其逻辑边界和八条关联折线。图只是静态概念设备，不嵌入脚本或物理仿真。`,
  );
}

factory();
console.log('Authored the featured factory composition and reusable prompt.');
