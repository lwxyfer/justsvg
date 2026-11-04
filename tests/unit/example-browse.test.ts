import { expect, it } from 'vitest';
import { examples } from '../../src/examples/catalog';
import {
  browseContents,
  contentKey,
  preferredVariant,
  diagramType,
} from '../../src/examples/browse';
it('groups every saved example exactly once without losing old IDs', () => {
  const groups = browseContents('', 'all', '');
  expect(groups.flatMap((g) => g.variants.map((e) => e.id)).sort()).toEqual(
    examples.map((e) => e.id).sort(),
  );
  expect(groups.filter((g) => g.key === 'rag-studies')).toHaveLength(1);
  expect(groups.find((g) => g.key === 'rag-studies')!.variants).toHaveLength(59);
});
it('combines type, family and search rather than silently broadening filters', () => {
  expect(browseContents('实体关系图', 'brand', '')).toEqual([]);
  expect(
    browseContents('', 'brand', 'mistral').flatMap((g) => g.variants.map((e) => e.id)),
  ).toEqual(['brand-mistral-rag']);
  expect(browseContents('', 'all', '这不是任何示例')).toEqual([]);
  expect(browseContents('时序图', 'base', '')[0].variants).toHaveLength(5);
});
it('only preserves a visual variant when that content supports it', () => {
  const group = browseContents('实体关系图', 'all', '').find((g) => g.key === 'work-entity')!;
  const night = examples.find((e) => e.id === 'work-night-commerce')!;
  expect(preferredVariant(group, night).id).toBe('work-night-entity');
  expect(
    preferredVariant(
      group,
      examples.find((e) => e.id === 'brand-apple-rag')!,
    ).id,
  ).toBe('work-standard-entity');
  expect(contentKey(night)).not.toBe(contentKey(group.variants[0]));
  expect(diagramType(examples.find((e) => e.id === 'template-approval')!)).toBe('流程图');
});
