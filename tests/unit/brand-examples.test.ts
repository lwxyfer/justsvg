import { describe, expect, it } from 'vitest';
import { brandExamples, brandStyles } from '../../src/examples/brand-styles';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
const expected = [
  'Apple',
  'Microsoft',
  'Google',
  'OpenAI',
  'Claude',
  'Notion',
  'Stripe',
  'Linear',
  'Figma',
  'Vercel',
];
describe('brand-inspired native examples', () => {
  it('offers ten independently sourced visual languages for one shared diagram', () => {
    expect(brandStyles.map((s) => s.name)).toEqual(expected);
    expect(new Set(brandExamples.map((e) => e.sourceId))).toEqual(new Set(['brand-rag']));
    const signatures = brandExamples.map((e) => {
      const root = sanitizeSvg(e.svg).root;
      return [...root.querySelectorAll('[data-node]')].map((n) => ({
        label: n.getAttribute('data-label'),
        text: [...n.querySelectorAll('text')].slice(0, 2).map((t) => t.textContent),
      }));
    });
    for (const signature of signatures) expect(signature).toEqual(signatures[0]);
    const layouts = brandExamples.map((e) =>
      [...sanitizeSvg(e.svg).root.querySelectorAll('[data-node]')]
        .map((n) => n.getAttribute('data-layout'))
        .join('|'),
    );
    expect(new Set(layouts).size).toBe(10);
  });
  it.each(brandExamples)(
    'keeps $id safe, native and correctly bound through XML round trips',
    (example) => {
      const safe = sanitizeSvg(example.svg),
        root = safe.root;
      expect(safe.warnings).toEqual([]);
      expect(root.getAttribute('viewBox')).toBe('0 0 1600 1100');
      expect(root.querySelector('image,script,foreignObject,filter')).toBeNull();
      expect(root.querySelectorAll('[data-node]')).toHaveLength(9);
      expect(root.querySelectorAll('[data-sf-start-node]')).toHaveLength(8);
      const ids = [...root.querySelectorAll('[id]')].map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      // Marker tips must coincide with the bound endpoint at every stroke width.
      for (const marker of root.querySelectorAll('marker')) {
        expect(marker.getAttribute('markerUnits')).toBe('userSpaceOnUse');
        if (marker.id.includes('-arrow-')) expect(marker.getAttribute('refX')).toBe('10');
        expect(Number(marker.getAttribute('markerWidth'))).toBeGreaterThanOrEqual(8);
        expect(Number(marker.getAttribute('markerWidth'))).toBeLessThanOrEqual(12);
      }
      for (const edge of root.querySelectorAll('[data-sf-start-node]')) {
        for (const end of ['start', 'end']) {
          expect(ids).toContain(edge.getAttribute(`data-sf-${end}-node`)!.slice(1));
          const anchor = edge.getAttribute(`data-sf-${end}-anchor`)!.split(' ').map(Number);
          expect(anchor).toHaveLength(4);
          expect(anchor.every(Number.isFinite)).toBe(true);
          expect(anchor[0]).toBeGreaterThanOrEqual(0);
          expect(anchor[0]).toBeLessThanOrEqual(1);
          expect(anchor[1]).toBeGreaterThanOrEqual(0);
          expect(anchor[1]).toBeLessThanOrEqual(1);
        }
      }
      const next = sanitizeSvg(new XMLSerializer().serializeToString(root));
      expect(next.root.isEqualNode(root)).toBe(true);
      const style = brandStyles.find((s) => s.id === example.style)!;
      expect(style.brand!.sources.length).toBeGreaterThan(0);
      for (const source of style.brand!.sources) {
        expect(new URL(source.url).protocol).toBe('https:');
        expect(example.prompt).toContain(source.url);
      }
      expect(example.prompt).toContain('非官方');
      expect(example.prompt).toContain('foreignObject');
      expect(example.prompt).toContain('字体');
    },
  );
});
