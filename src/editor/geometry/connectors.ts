import type { Bounds, Point } from './geometry';
export type ConnectionEnd = 'start' | 'end';
export type Port = 'nearest' | 'left' | 'right' | 'top' | 'bottom';
export interface Anchor {
  u: number;
  v: number;
  dx: number;
  dy: number;
}
const finitePoint = (p: Point) => Number.isFinite(p.x) && Number.isFinite(p.y);
const close = (a: number, b: number) => Math.abs(a - b) < 1e-5;
export function parsePoints(source: string): Point[] | null {
  const numbers = source
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (
    numbers.length < 4 ||
    numbers.length % 2 ||
    numbers.length > 2000 ||
    !numbers.every(Number.isFinite)
  )
    return null;
  return Array.from({ length: numbers.length / 2 }, (_, i) => ({
    x: numbers[i * 2],
    y: numbers[i * 2 + 1],
  }));
}
/** Deliberately limited to one open M/L/H/V subpath. Curves and closed artwork are preserved. */
export function parseLinearPath(source: string): Point[] | null {
  const tokens = source.match(/[a-zA-Z]|[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g) || [];
  if (
    !tokens.length ||
    tokens.length > 3000 ||
    source.replace(/[a-zA-Z]|[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g, '').replace(/[\s,]/g, '')
  )
    return null;
  let i = 0,
    command = '',
    point: Point = { x: 0, y: 0 };
  const points: Point[] = [];
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) command = tokens[i++];
    const kind = command.toUpperCase();
    if (
      !['M', 'L', 'H', 'V'].includes(kind) ||
      (!points.length && kind !== 'M') ||
      (kind === 'M' && points.length)
    )
      return null;
    const count = kind === 'M' || kind === 'L' ? 2 : 1;
    const values = tokens.slice(i, i + count).map(Number);
    if (values.length !== count || !values.every(Number.isFinite)) return null;
    i += count;
    const relative = command === command.toLowerCase();
    point = {
      x: kind === 'V' ? point.x : values[0] + (relative ? point.x : 0),
      y: kind === 'H' ? point.y : values[kind === 'V' ? 0 : 1] + (relative ? point.y : 0),
    };
    if (!finitePoint(point)) return null;
    points.push(point);
    if (kind === 'M') command = relative ? 'l' : 'L';
  }
  return points.length >= 2 ? points : null;
}
export function anchorAt(box: Bounds, p: Point, port: Port = 'nearest', keepGap = false): Anchor {
  let x = Math.max(box.x, Math.min(box.x + box.width, p.x));
  let y = Math.max(box.y, Math.min(box.y + box.height, p.y));
  if (port !== 'nearest') {
    x = port === 'left' ? box.x : port === 'right' ? box.x + box.width : box.x + box.width / 2;
    y = port === 'top' ? box.y : port === 'bottom' ? box.y + box.height : box.y + box.height / 2;
  } else {
    const distances = [
      Math.abs(p.x - box.x),
      Math.abs(p.x - box.x - box.width),
      Math.abs(p.y - box.y),
      Math.abs(p.y - box.y - box.height),
    ];
    const side = distances.indexOf(Math.min(...distances));
    if (side === 0) x = box.x;
    if (side === 1) x = box.x + box.width;
    if (side === 2) y = box.y;
    if (side === 3) y = box.y + box.height;
  }
  return {
    u: box.width ? (x - box.x) / box.width : 0.5,
    v: box.height ? (y - box.y) / box.height : 0.5,
    dx: keepGap ? p.x - x : 0,
    dy: keepGap ? p.y - y : 0,
  };
}
export function anchorPoint(box: Bounds, a: Anchor): Point {
  return { x: box.x + box.width * a.u + a.dx, y: box.y + box.height * a.v + a.dy };
}
export const encodeAnchor = (a: Anchor) =>
  [a.u, a.v, a.dx, a.dy].map((n) => Number(n.toFixed(10))).join(' ');
export function decodeAnchor(source: string | null): Anchor | null {
  const values = source?.trim().split(/\s+/).map(Number);
  return values?.length === 4 &&
    values.every(Number.isFinite) &&
    values[0] >= 0 &&
    values[0] <= 1 &&
    values[1] >= 0 &&
    values[1] <= 1 &&
    Math.abs(values[2]) < 1e6 &&
    Math.abs(values[3]) < 1e6
    ? { u: values[0], v: values[1], dx: values[2], dy: values[3] }
    : null;
}
export function routePoints(
  original: Point[],
  start: Point,
  end: Point,
  straight = false,
): Point[] {
  const dx = start.x - original[0].x,
    dy = start.y - original[0].y;
  if (close(end.x - original.at(-1)!.x, dx) && close(end.y - original.at(-1)!.y, dy))
    return original.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  const result = original.map((p) => ({ ...p }));
  const orthogonal = original
    .slice(1)
    .every((p, i) => close(p.x, original[i].x) || close(p.y, original[i].y));
  const firstH = close(original[0].y, original[1].y),
    lastH = close(original.at(-2)!.y, original.at(-1)!.y);
  if (
    !straight &&
    orthogonal &&
    (original.length === 2 || (original.length === 3 && firstH === lastH))
  ) {
    if (close(start.x, end.x) || close(start.y, end.y)) return [start, end];
    if (firstH) {
      const x = (start.x + end.x) / 2;
      return [start, { x, y: start.y }, { x, y: end.y }, end];
    }
    const y = (start.y + end.y) / 2;
    return [start, { x: start.x, y }, { x: end.x, y }, end];
  }
  result[0] = start;
  result[result.length - 1] = end;
  if (!straight && orthogonal && result.length > 2) {
    if (firstH) result[1].y = start.y;
    else result[1].x = start.x;
    if (lastH) result[result.length - 2].y = end.y;
    else result[result.length - 2].x = end.x;
  }
  return result;
}
export function pathMidpoint(points: Point[]): Point {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  let remaining = lengths.reduce((a, b) => a + b, 0) / 2;
  for (const [i, length] of lengths.entries()) {
    if (remaining <= length) {
      const t = length ? remaining / length : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t,
      };
    }
    remaining -= length;
  }
  return { ...points.at(-1)! };
}
