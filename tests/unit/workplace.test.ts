import { describe, expect, it } from 'vitest';
import { workplaceExamples, workplaceTypes } from '../../src/examples/workplace';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
describe('workplace diagrams', () => {
  it('separates eight diagram subjects from five inherited visual styles', () => {
    expect(workplaceTypes).toHaveLength(8);
    expect(workplaceExamples).toHaveLength(40);
    for (const type of workplaceTypes) {
      const group = workplaceExamples.filter((e) => e.diagramType === type);
      expect(new Set(group.map((e) => e.style)).size).toBe(5);
      expect(new Set(group.map((e) => e.sourceId)).size).toBe(1);
    }
  });
  it.each(workplaceExamples)(
    '$id remains safe and editable with complete reference prompt',
    (e) => {
      const safe = sanitizeSvg(e.svg);
      expect(safe.warnings).toEqual([]);
      expect(safe.root.getAttribute('viewBox')).toBe('0 0 1600 1000');
      expect(safe.root.querySelectorAll('[data-node]').length).toBeGreaterThanOrEqual(4);
      const ids = [...safe.root.querySelectorAll('[id]')].map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const edge of safe.root.querySelectorAll('[data-sf-start-node]')) {
        for (const end of ['start', 'end'])
          expect(ids).toContain(edge.getAttribute(`data-sf-${end}-node`)!.slice(1));
      }
      expect(e.prompt).toContain(e.diagramType);
      expect(e.prompt).toContain('foreignObject');
      expect(e.prompt).toContain('示意');
      expect(e.prompt).toContain(e.svg);
      expect(
        sanitizeSvg(new XMLSerializer().serializeToString(safe.root)).root.isEqualNode(safe.root),
      ).toBe(true);
    },
  );
});
