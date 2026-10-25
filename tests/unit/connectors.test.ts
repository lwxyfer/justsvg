import { describe, expect, it } from 'vitest';
import {
  anchorAt,
  anchorPoint,
  decodeAnchor,
  encodeAnchor,
  parseLinearPath,
  parsePoints,
  pathMidpoint,
  routePoints,
} from '../../src/editor/geometry/connectors';
import { templates } from '../../src/editor/insert/catalog';
import { rewriteReferences } from '../../src/editor/document/references';
describe('safe connector geometry', () => {
  it('parses absolute, relative, implicit and scientific linear SVG paths', () => {
    expect(parseLinearPath('M 10 20 h40 v-10 L70 50')).toEqual([
      { x: 10, y: 20 },
      { x: 50, y: 20 },
      { x: 50, y: 10 },
      { x: 70, y: 50 },
    ]);
    expect(parseLinearPath('m1e1 2e1 30 0 0 10')).toEqual([
      { x: 10, y: 20 },
      { x: 40, y: 20 },
      { x: 40, y: 30 },
    ]);
    expect(parsePoints('10,20 30,40')).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ]);
  });
  it('leaves curves, closed artwork, multiple subpaths and malformed paths unsupported', () => {
    for (const value of [
      'M0 0C1 1 2 2 3 3',
      'M0 0A4 4 0 0 1 10 10',
      'M0 0L10 10Z',
      'M0 0L10 10M20 20L30 30',
      'H4',
      'M0 0H',
      'M0 0LInfinity 4',
      'M0 0L1e999 4',
      'M0 0?L10 10',
    ])
      expect(parseLinearPath(value), value).toBeNull();
    expect(parsePoints('0 1 2')).toBeNull();
    expect(decodeAnchor('1 .5 NaN 0')).toBeNull();
    expect(decodeAnchor('2 .5 0 0')).toBeNull();
  });
  it('computes normalized border ports and preserves intentional small endpoint gaps', () => {
    const b = { x: 10, y: 20, width: 100, height: 60 };
    const a = anchorAt(b, { x: 114, y: 35 }, 'nearest', true);
    expect(a).toEqual({ u: 1, v: 0.25, dx: 4, dy: 0 });
    expect(anchorPoint({ ...b, width: 180, height: 120 }, a)).toEqual({ x: 194, y: 50 });
    expect(anchorAt(b, { x: 500, y: 500 }, 'left')).toEqual({ u: 0, v: 0.5, dx: 0, dy: 0 });
    expect(decodeAnchor(encodeAnchor(a))).toEqual(a);
  });
  it('keeps orthogonal approaches and translates all bends when both nodes move together', () => {
    expect(
      routePoints(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        { x: 0, y: 40 },
        { x: 100, y: 0 },
      ),
    ).toEqual([
      { x: 0, y: 40 },
      { x: 50, y: 40 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
    ]);
    const original = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 80 },
      { x: 100, y: 80 },
    ];
    expect(routePoints(original, { x: 20, y: 30 }, { x: 120, y: 110 })).toEqual(
      original.map((p) => ({ x: p.x + 20, y: p.y + 30 })),
    );
    expect(routePoints(original, { x: 20, y: 30 }, { x: 100, y: 80 })).toEqual([
      { x: 20, y: 30 },
      { x: 50, y: 30 },
      { x: 50, y: 80 },
      { x: 100, y: 80 },
    ]);
    expect(
      pathMidpoint([
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 60, y: 20 },
      ]),
    ).toEqual({ x: 40, y: 0 });
  });
  it('ships internal associations and label references without unresolved IDs or construction metadata', () => {
    const linked = templates.filter((a) => a.svg.includes('data-sf-start-node'));
    expect(linked.length).toBeGreaterThanOrEqual(15);
    for (const asset of templates) {
      const root = new DOMParser().parseFromString(asset.svg, 'image/svg+xml').documentElement;
      const ids = new Set([...root.querySelectorAll('[id]')].map((n) => n.id));
      expect(root.querySelector('[data-sf-bounds]')).toBeNull();
      for (const el of root.querySelectorAll(
        '[data-sf-start-node],[data-sf-end-node],[data-sf-label-for]',
      ))
        for (const name of ['data-sf-start-node', 'data-sf-end-node', 'data-sf-label-for']) {
          const ref = el.getAttribute(name);
          if (ref) expect(ids.has(ref.slice(1)), `${asset.id}:${ref}`).toBe(true);
        }
    }
  });
  it('remaps internal bindings and drops external associations when copying an isolated connector', () => {
    const root = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><g id="node"/><line id="edge" data-sf-start-node="#node" data-sf-start-anchor="1 .5 0 0" data-sf-end-node="#outside" data-sf-end-anchor="0 .5 0 0"/><g data-sf-label-for="#edge"/></svg>',
      'image/svg+xml',
    ).documentElement;
    rewriteReferences(
      root,
      new Map([
        ['node', 'new-node'],
        ['edge', 'new-edge'],
      ]),
      'copy',
    );
    const line = root.querySelector('line')!;
    expect(line.getAttribute('data-sf-start-node')).toBe('#new-node');
    expect(line.hasAttribute('data-sf-end-node')).toBe(false);
    expect(line.hasAttribute('data-sf-end-anchor')).toBe(false);
    expect(root.querySelector('[data-sf-label-for]')!.getAttribute('data-sf-label-for')).toBe(
      '#new-edge',
    );
  });
});
