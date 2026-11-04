import { describe, expect, it } from 'vitest';
import { inspiredExamples, inspiredStyles } from '../../src/examples/inspired-styles';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
import { browseContents, visualFamily } from '../../src/examples/browse';

describe('fictional-world and financial visual studies', () => {
  it('separates the two world studies from the three investment-bank studies', () => {
    expect(inspiredExamples.map(visualFamily)).toEqual([
      'special',
      'special',
      'brand',
      'brand',
      'brand',
    ]);
    expect(
      browseContents('架构图', 'brand', '投行').flatMap((group) => group.variants),
    ).toHaveLength(3);
    expect(
      browseContents('架构图', 'special', '趣味风格').flatMap((group) => group.variants),
    ).toHaveLength(2);
  });
  it.each(inspiredExamples)(
    'keeps $id safe, native and fully referenced after serialization',
    (example) => {
      const { root, warnings } = sanitizeSvg(example.svg);
      expect(warnings).toEqual([]);
      expect(root.getAttribute('viewBox')).toBe('0 0 1600 1100');
      expect(root.querySelector('script,foreignObject,image,use,style')).toBeNull();
      expect(root.querySelectorAll('[data-node]')).toHaveLength(9);
      expect(root.querySelectorAll('[data-sf-start-node]')).toHaveLength(8);
      const ids = [...root.querySelectorAll('[id]')].map((element) => element.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const edge of root.querySelectorAll('[data-sf-start-node]')) {
        for (const end of ['start', 'end']) {
          expect(ids).toContain(edge.getAttribute(`data-sf-${end}-node`)!.slice(1));
          expect(
            edge
              .getAttribute(`data-sf-${end}-anchor`)!
              .split(' ')
              .map(Number)
              .every(Number.isFinite),
          ).toBe(true);
        }
        expect(ids).toContain(edge.getAttribute('marker-end')!.slice(5, -1));
      }
      const restored = sanitizeSvg(new XMLSerializer().serializeToString(root));
      expect(restored.warnings).toEqual([]);
      expect(restored.root.querySelectorAll('[data-node]')).toHaveLength(9);
      expect(example.prompt).toContain('foreignObject');
      expect(example.prompt).toContain('1600×1100');
      expect(example.prompt).toContain(
        inspiredStyles.find((style) => style.id === example.style)!.name,
      );
    },
  );
});
