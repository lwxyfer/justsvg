import { describe, expect, it } from 'vitest';
import { assetGroups, commonShapes } from '../../src/editor/insert/groups';
import { shapes, iconAssets } from '../../src/editor/insert/catalog';
describe('visible material categories', () => {
  it('pins a unique common shape set before the six original categories', () => {
    const groups = assetGroups('shapes');
    expect(groups[0].label).toBe('常用图形');
    expect(groups[0].assets).toEqual(commonShapes);
    expect(new Set(commonShapes.map((a) => a.id)).size).toBe(12);
    expect(groups.filter((g) => g.id.startsWith('category-'))).toHaveLength(6);
    expect(groups.at(-1)?.assets).toBe(shapes);
    expect(commonShapes.some((a) => a.id === 'shape-text')).toBe(true);
  });
  it('keeps all icon categories plus common and validated recent shortcuts', () => {
    const groups = assetGroups('icons', ['icon-cloud', 'missing', 'icon-database', 'icon-cloud']);
    expect(groups[0].label).toBe('常用图标');
    expect(groups[0].assets.every((a) => a.featured)).toBe(true);
    expect(groups[1].assets.map((a) => a.id)).toEqual(['icon-cloud', 'icon-database']);
    expect(groups.filter((g) => g.id.startsWith('category-'))).toHaveLength(18);
    expect(groups.at(-1)?.assets).toBe(iconAssets);
    expect(groups.every((g) => g.pageSize <= 60)).toBe(true);
  });
});
