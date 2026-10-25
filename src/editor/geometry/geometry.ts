export interface Point {
  x: number;
  y: number;
}
export interface Bounds extends Point {
  width: number;
  height: number;
}
export function union(bounds: Bounds[]): Bounds | null {
  if (!bounds.length) return null;
  const x = Math.min(...bounds.map((b) => b.x)),
    y = Math.min(...bounds.map((b) => b.y));
  return {
    x,
    y,
    width: Math.max(...bounds.map((b) => b.x + b.width)) - x,
    height: Math.max(...bounds.map((b) => b.y + b.height)) - y,
  };
}
export function transformedBounds(b: Bounds, matrix: DOMMatrix): Bounds {
  const points = [
    [b.x, b.y],
    [b.x + b.width, b.y],
    [b.x, b.y + b.height],
    [b.x + b.width, b.y + b.height],
  ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
  const x = Math.min(...points.map((p) => p.x)),
    y = Math.min(...points.map((p) => p.y));
  return {
    x,
    y,
    width: Math.max(...points.map((p) => p.x)) - x,
    height: Math.max(...points.map((p) => p.y)) - y,
  };
}
export const intersects = (a: Bounds, b: Bounds) =>
  a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y;
export function snapDelta(
  moving: Bounds,
  others: Bounds[],
  delta: Point,
  threshold: number,
): { delta: Point; guides: { axis: 'x' | 'y'; value: number }[] } {
  const guides: { axis: 'x' | 'y'; value: number }[] = [];
  const out = { ...delta };
  for (const axis of ['x', 'y'] as const) {
    const size = axis === 'x' ? 'width' : 'height';
    const anchors = [moving[axis], moving[axis] + moving[size] / 2, moving[axis] + moving[size]];
    let closest = threshold;
    let correction = 0;
    let line: number | null = null;
    for (const b of others)
      for (const edge of [b[axis], b[axis] + b[size] / 2, b[axis] + b[size]])
        for (const anchor of anchors) {
          const diff = edge - anchor - delta[axis];
          if (Math.abs(diff) < closest) {
            closest = Math.abs(diff);
            correction = diff;
            line = edge;
          }
        }
    out[axis] += correction;
    if (line !== null) guides.push({ axis, value: line });
  }
  return { delta: out, guides };
}
