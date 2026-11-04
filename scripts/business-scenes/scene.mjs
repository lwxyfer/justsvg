export const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export class Scene {
  constructor(id, mode) {
    this.id = id;
    this.mode = mode;
    this.nodes = new Map();
    this.bg = [];
    this.items = [];
    this.edges = [];
    this.notes = [];
    this.ink = '#21354b';
    this.muted = '#54677c';
    this.accent = mode === 'review' ? '#315fa1' : '#405f77';
  }
  text(x, y, s, size = 22, color = this.ink, weight = 400, extra = '') {
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
  }
  rect(x, y, w, h, fill = '#fff', stroke = '#ccd7e2', r = 6) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${this.mode === 'report' ? 0 : r}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
  }
  line(points, color = '#74859a', extra = '') {
    return `<polyline points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.8" ${extra}/>`;
  }
  node(key, title, x, y, w, h, body = [], tone = 'blue', custom) {
    const colors = {
      blue: ['#edf3fd', '#9bb6da'],
      green: ['#edf6f2', '#9dbfad'],
      amber: ['#fff5e4', '#cfb88c'],
      purple: ['#f1eef9', '#b7aad1'],
      slate: ['#f3f5f7', '#bbc6d2'],
    };
    const [fill, stroke] = colors[tone];
    this.nodes.set(key, { x, y, w, h, title });
    const art = custom
      ? custom()
      : this.rect(x, y, w, h, this.mode === 'report' ? '#fffefa' : fill, stroke) +
        this.text(
          x + 18,
          y + 34,
          title,
          Math.min(
            24,
            Math.floor(
              (w - 36) /
                [...title].reduce((sum, c) => sum + (c.codePointAt(0) <= 127 ? 0.57 : 1), 0),
            ),
          ),
          this.ink,
          600,
        ) +
        body.map((s, i) => this.text(x + 18, y + 66 + i * 29, s, 19, this.muted)).join('');
    this.items.push(
      `<g id="${this.id}-${key}" data-node="true" data-label="${esc(title)}" data-layout="${x} ${y} ${w} ${h}">${art}</g>`,
    );
  }
  edge(a, b, points, label = '') {
    const anchor = (p, n) => {
      const u = Math.max(0, Math.min(1, (p[0] - n.x) / n.w)),
        v = Math.max(0, Math.min(1, (p[1] - n.y) / n.h));
      return `${u} ${v} ${p[0] - n.x - u * n.w} ${p[1] - n.y - v * n.h}`;
    };
    const id = `${this.id}-edge-${this.edges.length}`;
    this.edges.push(
      this.line(
        points,
        this.accent,
        `id="${id}" marker-end="url(#${this.id}-arrow)" data-sf-start-node="#${this.id}-${a}" data-sf-end-node="#${this.id}-${b}" data-sf-start-anchor="${anchor(points[0], this.nodes.get(a))}" data-sf-end-anchor="${anchor(points.at(-1), this.nodes.get(b))}"`,
      ),
    );
    if (label)
      this.notes.push(
        this.text(
          (points[0][0] + points[1][0]) / 2,
          (points[0][1] + points[1][1]) / 2 - 12,
          label,
          17,
          this.muted,
          400,
          `text-anchor="middle" data-sf-label-for="${id}"`,
        ),
      );
  }
  band(title, x, y, w, h, color = '#f5f7fa') {
    this.bg.push(
      this.rect(x, y, w, h, color, 'none', 8) + this.text(x + 18, y + 31, title, 22, this.ink, 600),
    );
  }
  note(x, y, s, size = 19) {
    this.notes.push(this.text(x, y, s, size, this.muted));
  }
  finish() {
    return `<defs><marker id="${this.id}-arrow" viewBox="0 0 10 10" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" refX="10" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${this.accent}"/></marker></defs>${this.bg.join('')}${this.edges.join('')}${this.items.join('')}${this.notes.join('')}`;
  }
}
