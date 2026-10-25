import { describe, expect, it } from 'vitest';
import { templates, assetById, assetSource, matchesAsset } from '../../src/editor/insert/catalog';
import { assetGroups } from '../../src/editor/insert/groups';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
describe('editable composite diagram library', () => {
  it('provides 24 original diagrams across four categories, with common templates first', () => {
    expect(templates).toHaveLength(24);
    expect(new Set(templates.map((a) => a.id)).size).toBe(24);
    const groups = assetGroups('templates');
    expect(groups[0].label).toBe('常用组合图');
    expect(groups[0].assets.map((a) => a.id)).toEqual([
      'template-three-tier',
      'template-rag',
      'template-approval',
      'template-roadmap',
    ]);
    expect(groups.filter((g) => g.id.startsWith('category-')).map((g) => g.label)).toEqual([
      '技术架构',
      '工作流程',
      '技术信息图',
      '可复用组件',
    ]);
    expect(groups.at(-1)?.assets).toBe(templates);
    expect(groups.every((g) => g.pageSize <= 6)).toBe(true);
  });
  it('keeps each SVG safe, self-contained, grouped and editable with unique reference targets', () => {
    for (const asset of templates) {
      expect(assetById(asset.id)).toBe(asset);
      expect(asset.kind).toBe('template');
      expect(asset.description).toBeTruthy();
      const safe = sanitizeSvg(assetSource(asset));
      expect(safe.warnings, asset.id).toEqual([]);
      expect(safe.root.getAttribute('viewBox')).toBe(`0 0 ${asset.width} ${asset.height}`);
      expect(safe.root.querySelectorAll('g').length, asset.id).toBeGreaterThanOrEqual(1);
      expect(safe.root.querySelectorAll('text').length, asset.id).toBeGreaterThan(3);
      expect(safe.root.querySelector('image,script,foreignObject,use')).toBeNull();
      const ids = [...safe.root.querySelectorAll('[id]')].map((el) => el.id);
      expect(new Set(ids).size, asset.id).toBe(ids.length);
      for (const el of safe.root.querySelectorAll('[marker-end]')) {
        const id = el.getAttribute('marker-end')!.match(/^url\(#(.+)\)$/)?.[1];
        expect(ids, asset.id).toContain(id);
      }
      // Empty areas remain pannable; document-sized backgrounds aren't selectable objects.
      expect([...safe.root.children].some((el) => el.localName === 'rect')).toBe(false);
    }
  });
  it('searches common technical names and task vocabulary across categories', () => {
    for (const [query, id] of [
      ['RAG', 'rag'],
      ['CI/CD', 'cicd'],
      ['泳道', 'swimlane'],
      ['路线图', 'roadmap'],
      ['负责人', 'service-card'],
    ]) {
      expect(matchesAsset(assetById(`template-${id}`)!, query), query).toBe(true);
    }
    expect(templates.filter((a) => matchesAsset(a, '可复用组件'))).toHaveLength(4);
  });
});
