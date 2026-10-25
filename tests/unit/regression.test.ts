import { describe, it, expect } from 'vitest';
import { sanitizeSvg, needsImportReview } from '../../src/editor/security/sanitize';
const documents = import.meta.glob<string>('../../src/fixtures/regression/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
describe('fixed native SVG regression documents', () => {
  it('provides fifteen additional distinct documents beyond the original five', () =>
    expect(Object.keys(documents)).toHaveLength(15));
  it.each(Object.entries(documents))(
    'preserves safe structure across serialization: %s',
    (_name, xml) => {
      const original = new DOMParser().parseFromString(xml, 'image/svg+xml').documentElement;
      const safe = sanitizeSvg(xml);
      expect(needsImportReview(safe.warnings), safe.warnings.join('\n')).toBe(false);
      expect(safe.root.querySelectorAll('*').length).toBe(original.querySelectorAll('*').length);
      const again = sanitizeSvg(new XMLSerializer().serializeToString(safe.root));
      expect(again.root.getAttribute('viewBox')).toBe(original.getAttribute('viewBox'));
      expect(again.root.textContent).toBe(safe.root.textContent);
    },
  );
  it('rejects duplicate identities and reports missing references without rewriting them', () => {
    expect(() =>
      sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect id="a"/><g id="a"/></svg>'),
    ).toThrow(/ID 重复/);
    const safe = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect id="node" fill="url(#missing)"/><use href="#absent"/></svg>',
    );
    expect(safe.warnings.join(' ')).toContain('#missing');
    expect(safe.warnings.join(' ')).toContain('#absent');
    expect(safe.root.querySelector('rect')?.getAttribute('fill')).toBe('url(#missing)');
  });
});
