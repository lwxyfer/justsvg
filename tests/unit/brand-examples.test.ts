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
  'Dropbox',
  'Spotify',
  'Duolingo',
  'IBM',
  'Ramp',
  'GitHub',
  'Slack',
  'Cloudflare',
  'Miro',
  'Airbnb',
  'Cursor',
  'Lovable',
  'Supabase',
  'n8n',
  'Raycast',
  '字节跳动',
  '小红书',
  'DJI 大疆',
  'Kimi（月之暗面）',
  '阶跃星辰',
  'Mistral',
  'Perplexity',
  'Cohere',
  'Hugging Face',
  'ElevenLabs',
  'Replicate',
];
describe('brand-inspired native examples', () => {
  it('identifies the new five community and five Chinese unicorn studies with dated sources', () => {
    const community = brandStyles.filter((s) => s.tags.includes('社区热议'));
    const china = brandStyles.filter((s) => s.tags.includes('中国独角兽'));
    expect(community.map((s) => s.name)).toEqual([
      'Cursor',
      'Lovable',
      'Supabase',
      'n8n',
      'Raycast',
    ]);
    expect(china.map((s) => s.name)).toEqual([
      '字节跳动',
      '小红书',
      'DJI 大疆',
      'Kimi（月之暗面）',
      '阶跃星辰',
    ]);
    for (const style of china) {
      expect(style.brand!.sources.some((s) => s.url.includes('hurun.net/'))).toBe(true);
      expect(style.brand!.note).toContain('2026');
    }
    for (const style of community) expect(style.brand!.sources.length).toBeGreaterThan(1);
  });
  it('offers thirty-six independently sourced visual languages for one shared diagram', () => {
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
    expect(new Set(layouts).size).toBe(expected.length);
  });
  it.each(brandExamples)(
    'keeps $id safe, native and correctly bound through XML round trips',
    (example) => {
      const safe = sanitizeSvg(example.svg),
        root = safe.root;
      expect(safe.warnings).toEqual([]);
      expect(root.getAttribute('viewBox')).toBe('0 0 1600 1100');
      expect(root.getAttribute('data-brand-style')).toBe(
        example.id.replace(/^brand-/, '').replace(/-rag$/, ''),
      );
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
