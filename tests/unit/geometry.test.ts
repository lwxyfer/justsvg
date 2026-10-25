import { describe, it, expect } from 'vitest';
import { union, intersects, snapDelta } from '../../src/editor/geometry/geometry';
describe('geometry', () => {
  it('unions negative coordinates and empty bounds', () => {
    expect(union([])).toBeNull();
    expect(
      union([
        { x: -10, y: 5, width: 30, height: 20 },
        { x: 40, y: -5, width: 10, height: 5 },
      ]),
    ).toEqual({ x: -10, y: -5, width: 60, height: 30 });
  });
  it('tests marquee intersections', () => {
    expect(
      intersects({ x: 0, y: 0, width: 10, height: 10 }, { x: 8, y: 8, width: 10, height: 10 }),
    ).toBe(true);
    expect(
      intersects({ x: 0, y: 0, width: 10, height: 10 }, { x: 11, y: 0, width: 10, height: 10 }),
    ).toBe(false);
  });
  it('snaps the nearest edge within a viewport-dependent threshold', () => {
    const r = snapDelta(
      { x: 0, y: 0, width: 20, height: 20 },
      [{ x: 100, y: 100, width: 20, height: 20 }],
      { x: 79, y: 10 },
      3,
    );
    expect(r.delta).toEqual({ x: 80, y: 10 });
    expect(r.guides).toEqual([{ axis: 'x', value: 100 }]);
  });
});
