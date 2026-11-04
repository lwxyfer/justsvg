import { expect, it } from 'vitest';
import { businessExamples, businessStyles } from '../../src/examples/business';
import { browseContents, contentKey, visualFamily } from '../../src/examples/browse';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
import { readFinancialChart } from '../../src/editor/charts/financial';
it('offers twelve real business subjects with two compatible working styles', () => {
  expect(businessExamples).toHaveLength(24);
  expect(businessStyles).toHaveLength(2);
  const keys = new Set(businessExamples.map(contentKey));
  expect(keys.size).toBe(12);
  for (const key of keys)
    expect(businessExamples.filter((e) => contentKey(e) === key).map((e) => e.style)).toEqual([
      'business-review',
      'business-report',
    ]);
  expect(businessExamples.every((e) => visualFamily(e) === 'work')).toBe(true);
  expect(browseContents('', 'work', '', '财务').flatMap((g) => g.variants)).toHaveLength(6);
  expect(
    browseContents('职责矩阵', 'work', '最终负责人', '项目协作').flatMap((g) => g.variants),
  ).toHaveLength(0);
  expect(
    browseContents('职责矩阵', 'work', '上线', '项目协作').flatMap((g) => g.variants),
  ).toHaveLength(2);
});
it.each(businessExamples)('keeps $id safe, native and semantically complete', (e) => {
  const { root, warnings } = sanitizeSvg(e.svg);
  expect(warnings).toEqual([]);
  expect(root.getAttribute('viewBox')).toBe('0 0 1600 1000');
  expect(root.querySelector('image,script,foreignObject,use')).toBeNull();
  const ids = [...root.querySelectorAll('[id]')].map((n) => n.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const edge of root.querySelectorAll('[data-sf-start-node]'))
    for (const end of ['start', 'end'])
      expect(ids).toContain(edge.getAttribute(`data-sf-${end}-node`)!.slice(1));
  if (e.editableData)
    expect(readFinancialChart(root.querySelector('[data-sf-chart]')!).rows.length).toBeGreaterThan(
      1,
    );
  else expect(root.querySelectorAll('[data-node]').length).toBeGreaterThan(3);
  expect(e.prompt).toContain('1600×1000');
  expect(e.prompt).toContain('foreignObject');
  expect(e.prompt).toContain(e.roles![0]);
});
