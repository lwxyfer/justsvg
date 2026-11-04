import { beforeEach, describe, expect, it, vi } from 'vitest';
import { examples, exampleStyles } from '../../src/examples/catalog';
import { additionalExamples } from '../../src/examples/styles';
import { referenceExamples } from '../../src/examples/reference-examples';
import { baseVariationExamples } from '../../src/examples/base-variations';
import { academicExamples } from '../../src/examples/academic';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
import {
  exampleStorageKey,
  loadExampleVersions,
  saveExampleVersion,
  validateExample,
} from '../../src/examples/storage';
beforeEach(() => localStorage.clear());
describe('SVG examples and reusable prompts', () => {
  it('preserves safe, editable academic panels, math and valid connector references', () => {
    const example = academicExamples[0];
    const safe = sanitizeSvg(example.svg);
    expect(safe.warnings).toEqual([]);
    expect(safe.root.getAttribute('viewBox')).toBe('0 0 1440 900');
    expect(safe.root.querySelectorAll('[data-node]')).toHaveLength(9);
    expect(safe.root.querySelectorAll('[data-sf-start-node]')).toHaveLength(8);
    expect(safe.root.querySelector('script,foreignObject,image,use,style')).toBeNull();
    const ids = [...safe.root.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const edge of safe.root.querySelectorAll('[data-sf-start-node]'))
      for (const end of ['start', 'end'])
        expect(ids).toContain(edge.getAttribute(`data-sf-${end}-node`)!.slice(1));
    expect(safe.root.querySelector('[baseline-shift="sub"]')).not.toBeNull();
    const restored = sanitizeSvg(new XMLSerializer().serializeToString(safe.root));
    expect(restored.warnings).toEqual([]);
    expect(restored.root.querySelector('#arxiv-decoding-note')!.textContent).toBe(
      safe.root.querySelector('#arxiv-decoding-note')!.textContent,
    );
    expect(example.prompt).toContain('1440×900');
    expect(example.prompt).toContain('foreignObject');
  });
  it.each(referenceExamples)(
    'reconstructs $id with editable text and valid node/scope links',
    (example) => {
      const safe = sanitizeSvg(example.svg);
      expect(safe.warnings).toEqual([]);
      expect(safe.root.getAttribute('viewBox')).toBe(`0 0 ${example.width} ${example.height}`);
      expect(safe.root.querySelector('script,foreignObject,image,use')).toBeNull();
      const nodes = [...safe.root.querySelectorAll('[data-node]')];
      expect(nodes).toHaveLength(example.id === 'reference-sandbox-overview' ? 21 : 23);
      expect(safe.root.querySelectorAll('[data-boundary]').length).toBeGreaterThanOrEqual(2);
      const ids = [...safe.root.querySelectorAll('[id]')].map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const edge of safe.root.querySelectorAll('[data-sf-start-node]'))
        for (const end of ['start', 'end'])
          expect(ids).toContain(edge.getAttribute(`data-sf-${end}-node`)!.slice(1));
      for (const node of nodes) {
        expect(node.querySelector('text')!.getAttribute('text-anchor')).toBe('middle');
        expect(node.querySelector('text')!.getAttribute('font-weight')).toBe('700');
      }
      expect(example.prompt).toContain('用户');
      expect(example.prompt).toContain('foreignObject');
    },
  );
  it('keeps base content separate from visual styles and preserves all existing diagrams', () => {
    expect(exampleStyles).toHaveLength(66);
    expect(examples.filter((e) => e.style === 'base')).toHaveLength(36);
    expect(examples).toHaveLength(169);
    expect(examples.some((e) => ['orbital-rag', 'folded-rag'].includes(e.id))).toBe(false);
    expect(new Set(examples.map((e) => e.id)).size).toBe(169);
    expect(exampleStyles.map((s) => s.id)).not.toEqual(
      expect.arrayContaining(['base-architecture', 'base-flow', 'base-infographic']),
    );
    expect(
      exampleStyles[0].id === 'factory' && exampleStyles.filter((s) => s.featured).length === 3,
    ).toBe(true);
  });
  it.each(additionalExamples)(
    'validates native artwork and complete prompt for $style',
    (example) => {
      const safe = sanitizeSvg(example.svg);
      expect(safe.warnings).toEqual([]);
      expect(safe.root.getAttribute('viewBox')).toBe('0 0 1200 800');
      expect(safe.root.querySelectorAll('[data-node]')).toHaveLength(9);
      expect(safe.root.querySelectorAll('[data-sf-start-node]')).toHaveLength(8);
      expect(safe.root.querySelectorAll('text').length).toBeGreaterThan(20);
      expect(safe.root.querySelector('script,foreignObject,image,use')).toBeNull();
      const ids = [...safe.root.querySelectorAll('[id]')].map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const edge of safe.root.querySelectorAll('[data-sf-start-node]')) {
        for (const attr of ['data-sf-start-node', 'data-sf-end-node'])
          expect(ids).toContain(edge.getAttribute(attr)!.slice(1));
      }
      expect(example.prompt).toContain('1200×800');
      expect(example.prompt).toContain('Vector index');
      expect(example.prompt).toContain('foreignObject');
      expect(example.prompt).toContain(exampleStyles.find((s) => s.id === example.style)!.name);
    },
  );
  it('changes presentation while keeping content, node geometry and connections identical', () => {
    for (const original of baseVariationExamples.filter((e) => e.style === 'base')) {
      const pair = baseVariationExamples.filter((e) => e.sourceId === original.sourceId);
      expect(pair).toHaveLength(5);
      const structure = (example: typeof original) => {
        const root = sanitizeSvg(example.svg).root;
        return {
          text: [...root.querySelectorAll('text')].map((t) => t.textContent),
          nodes: [...root.querySelectorAll('[data-node]')].map((n) => [
            n.getAttribute('data-label'),
            ...['x', 'y', 'width', 'height'].map((a) => n.querySelector('rect')!.getAttribute(a)),
          ]),
          edges: [...root.querySelectorAll('[data-sf-start-node]')].map((e) => [
            e.getAttribute('points'),
            ...['start', 'end'].map((end) =>
              e.getAttribute(`data-sf-${end}-node`)!.replace(`#${example.id}-node-`, ''),
            ),
          ]),
        };
      };
      const expected = structure(original);
      for (const variant of pair) expect(structure(variant), variant.id).toEqual(expected);
      expect(new Set(pair.map((e) => e.svg.match(/data-visual-style="(.*?)"/)![1])).size).toBe(5);
    }
  });
  it.each(baseVariationExamples)(
    'keeps $id native, safe and fully bound for editing',
    (example) => {
      const safe = sanitizeSvg(example.svg);
      expect(safe.warnings).toEqual([]);
      expect(safe.root.getAttribute('viewBox')).toBe(`0 0 ${example.width} ${example.height}`);
      expect(safe.root.querySelector('script,foreignObject,image,use')).toBeNull();
      const ids = [...safe.root.querySelectorAll('[id]')].map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      const edges = [...safe.root.querySelectorAll('[data-sf-start-node]')];
      expect(edges.length).toBeGreaterThanOrEqual(5);
      for (const edge of edges)
        for (const end of ['start', 'end']) {
          const nodeId = edge.getAttribute(`data-sf-${end}-node`)!.slice(1);
          expect(ids).toContain(nodeId);
          const anchor = edge.getAttribute(`data-sf-${end}-anchor`)!.split(' ').map(Number);
          expect(anchor).toHaveLength(4);
          expect(anchor.every(Number.isFinite)).toBe(true);
          expect(anchor[0]).toBeGreaterThanOrEqual(0);
          expect(anchor[0]).toBeLessThanOrEqual(1);
          expect(anchor[1]).toBeGreaterThanOrEqual(0);
          expect(anchor[1]).toBeLessThanOrEqual(1);
        }
      const restored = sanitizeSvg(new XMLSerializer().serializeToString(safe.root));
      expect(restored.warnings).toEqual([]);
      expect(restored.root.querySelectorAll('[data-node]').length).toBe(
        safe.root.querySelectorAll('[data-node]').length,
      );
      expect(example.prompt).toContain('foreignObject');
      expect(example.prompt).toContain(`${example.width}×${example.height}`);
      if (example.id === 'base-dense-platform') {
        expect(safe.root.querySelectorAll('[data-node]')).toHaveLength(38);
        expect(edges).toHaveLength(30);
        expect(safe.root.querySelectorAll('[id*="-layer-"]')).toHaveLength(6);
      }
    },
  );
  it('records and restores safe local SVG + prompt pairs without touching editor recovery', () => {
    localStorage.setItem('svg-finisher.document', 'working documents');
    const version = validateExample(examples[0].svg, 'Modified prompt');
    saveExampleVersion(examples[0].id, version);
    expect(loadExampleVersions()[examples[0].id].prompt).toBe('Modified prompt');
    expect(localStorage.getItem('svg-finisher.document')).toBe('working documents');
    saveExampleVersion(examples[0].id, null);
    expect(loadExampleVersions()).toEqual({});
  });
  it('rejects invalid and executable source before replacing a saved version', () => {
    const version = validateExample(examples[0].svg, 'Working prompt');
    saveExampleVersion('base', version);
    const before = localStorage.getItem(exampleStorageKey);
    expect(() => validateExample('<svg><g></svg>', 'p')).toThrow();
    expect(() =>
      validateExample(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        'p',
      ),
    ).toThrow(/需要清理/);
    expect(localStorage.getItem(exampleStorageKey)).toBe(before);
  });
  it('preserves the previous record on quota failure or corrupted storage', () => {
    const version = validateExample(examples[0].svg, 'Working prompt');
    saveExampleVersion('base', version);
    const before = localStorage.getItem(exampleStorageKey);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveExampleVersion('second', version)).toThrow('quota');
    spy.mockRestore();
    expect(localStorage.getItem(exampleStorageKey)).toBe(before);
    localStorage.setItem(exampleStorageKey, '{broken');
    expect(() => saveExampleVersion('base', version)).toThrow();
    expect(localStorage.getItem(exampleStorageKey)).toBe('{broken');
  });
});
