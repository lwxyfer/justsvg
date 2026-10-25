export const content = {
  docs: ['Documents', '文档与知识库'],
  chunks: ['Chunking', '解析与切分'],
  embed: ['Embeddings', '向量编码'],
  index: ['Vector index', '向量索引'],
  query: ['User query', '用户问题'],
  retrieve: ['Retriever', '相似度检索'],
  context: ['Context', '上下文构建'],
  llm: ['LLM', '生成模型'],
  answer: ['Answer', '回答与引用'],
};
export const relations = [
  ['docs', 'chunks'],
  ['chunks', 'embed'],
  ['embed', 'index'],
  ['query', 'retrieve'],
  ['retrieve', 'context'],
  ['context', 'llm'],
  ['llm', 'answer'],
  ['index', 'retrieve'],
];
export const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export const rect = (x, y, w, h, fill = '#fff', r = 0, stroke = 'none', sw = 1, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
export const path = (d, stroke = '#888', sw = 1, fill = 'none', extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const circle = (x, y, r, fill, stroke = 'none', sw = 1) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const text = (
  x,
  y,
  label,
  size = 18,
  fill = '#222',
  weight = 400,
  font = 'Arial, PingFang SC, sans-serif',
  extra = '',
) =>
  `<text x="${x}" y="${y}" font-family="${esc(font)}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(label)}</text>`;
export const lines = (x, y, lengths, color = '#ddd', gap = 12, sw = 3) =>
  lengths.map((w, i) => path(`M${x} ${y + i * gap}h${w}`, color, sw)).join('');
export class Diagram {
  constructor(key, theme) {
    this.key = key;
    this.theme = theme;
    this.id = `brand-${key}-rag`;
    this.bg = [];
    this.nodes = [];
    this.edges = [];
    this.over = [];
    this.defs = [];
    this.boxes = new Map();
    this.routes = [];
  }
  add(s) {
    this.bg.push(s);
  }
  node(key, x, y, w, h, draw) {
    const [title, body] = content[key];
    this.boxes.set(key, { x, y, w, h });
    this.nodes.push(
      `<g id="${this.id}-node-${key}" data-node="true" data-label="${title}" data-layout="${x} ${y} ${w} ${h}">${draw({ x, y, w, h, title, body })}</g>`,
    );
  }
  label(
    n,
    x,
    y,
    size = 22,
    bodyY = y + 30,
    color = this.theme.ink,
    font = this.theme.font,
    weight = 600,
  ) {
    const [title, body] = content[n];
    return (
      text(x, y, title, size, color, weight, font) +
      text(x, bodyY, body, 16, this.theme.muted, 400, this.theme.font)
    );
  }
  edge(start, end, points, color = this.theme.accent, width = 2, label) {
    const anchor = (p, b) => {
      let u = (p[0] - b.x) / b.w,
        v = (p[1] - b.y) / b.h;
      const cu = Math.max(0, Math.min(1, u)),
        cv = Math.max(0, Math.min(1, v));
      return `${cu} ${cv} ${(u - cu) * b.w} ${(v - cv) * b.h}`;
    };
    const marker = `${this.id}-arrow-${color.replace('#', '')}`;
    if (!this.defs.some((s) => s.includes(`id="${marker}"`)))
      this.defs.push(
        `<marker id="${marker}" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="${this.theme.arrowSize}" markerHeight="${this.theme.arrowSize}" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`,
      );
    const id = `${this.id}-link-${start}-${end}`;
    this.edges.push(
      `<polyline id="${id}" data-sf-start-node="#${this.id}-node-${start}" data-sf-end-node="#${this.id}-node-${end}" data-sf-start-anchor="${anchor(points[0], this.boxes.get(start))}" data-sf-end-anchor="${anchor(points.at(-1), this.boxes.get(end))}" points="${points.map((p) => p.join(',')).join(' ')}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${this.startMarker ? `marker-start="url(#${this.startMarker})" ` : ''}marker-end="url(#${marker})"/>`,
    );
    if (label)
      this.over.push(
        text(
          label[0],
          label[1],
          label[2],
          14,
          this.theme.muted,
          400,
          this.theme.font,
          `data-sf-label-for="${id}"`,
        ),
      );
    this.routes.push({ start, end, points });
  }
  finish() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100" data-brand-style="${this.key}" data-composition="${this.key}-v2"><title>${this.theme.name} 灵感 · RAG 检索增强生成架构</title><desc>非官方品牌视觉研究。九个语义节点、八条依赖；按具体品牌视觉重新组织构图，字体本机回退。</desc><defs>${this.defs.join('')}</defs>${this.bg.join('')}${this.edges.join('')}${this.nodes.join('')}${this.over.join('')}${text(72, 1074, `${this.theme.name} 视觉研究 · 示例架构 / 非官方 · 原生 SVG 可编辑`, 14, this.theme.muted, 400, this.theme.font)}</svg>\n`;
  }
}
