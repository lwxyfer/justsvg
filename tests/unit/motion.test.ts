import { describe, it, expect } from 'vitest';
import { DocumentEngine } from '../../src/editor/document/engine';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
import {
  configureMotion,
  decodeMotion,
  defaultMotion,
  motionAttribute,
  motionStyles,
  refreshMotionStyles,
  staticMotionSvg,
} from '../../src/editor/document/motion';
import { rewriteReferences } from '../../src/editor/document/references';
const wrap = (content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">${content}</svg>`;
const animated = (type: 'pulse' | 'blink' | 'flow' = 'pulse') => {
  const root = sanitizeSvg(
    wrap('<g id="motion"><rect id="card" width="100" height="60" fill="#eaf2ff"/></g>'),
  ).root;
  const group = root.querySelector('#motion')!;
  group.setAttribute(motionAttribute, JSON.stringify(defaultMotion(type)));
  if (type === 'flow')
    group.innerHTML =
      '<g data-sf-motion-base=""><line id="edge" x1="0" x2="200" stroke="blue"/></g><line data-sf-motion-overlay="" x1="0" x2="200" stroke="blue"/>';
  refreshMotionStyles(root);
  return root;
};
describe('controlled SVG motion', () => {
  it.each(['pulse', 'blink', 'flow'] as const)(
    'round-trips %s with only canonical local CSS',
    (type) => {
      const root = animated(type),
        css = motionStyles(root);
      const safe = sanitizeSvg(new XMLSerializer().serializeToString(root));
      expect(safe.warnings).toEqual([]);
      expect(motionStyles(safe.root)).toBe(css);
      expect(safe.root.querySelector('style')!.textContent).toBe(css);
      expect(css).toContain('prefers-reduced-motion');
      expect(css).not.toContain('url(');
    },
  );
  it.each([
    { duration: 0.1 },
    { duration: 21 },
    { amount: 1 },
    { gap: -1 },
    { dash: 1e30 },
    { type: 'url(https://evil.test)' },
    { enabled: 'true' },
    { reverse: null },
  ])('rejects invalid or injectable configuration %j', (patch) => {
    expect(decodeMotion(JSON.stringify({ ...defaultMotion('pulse'), ...patch }))).toBeNull();
  });
  it('does not trust style markers or arbitrary animation declarations', () => {
    const root = animated();
    root.querySelector('style')!.textContent +=
      '@import url(https://evil.test/a);@keyframes evil{to{fill:url(https://evil.test/x)}}#card{animation:evil 1s;fill:red}';
    const { root: safe, warnings } = sanitizeSvg(new XMLSerializer().serializeToString(root));
    const styles = [...safe.querySelectorAll('style')].map((s) => s.textContent).join('');
    expect(styles).not.toContain('evil');
    expect(styles).not.toContain('https');
    expect(styles).toContain('fill:red');
    expect(styles).toContain('sf_effect_motion');
    expect(warnings.join(' ')).toContain('不匹配');
  });
  it('drops malformed wrappers without admitting script, SMIL or events', () => {
    const root = animated();
    root.querySelector('#motion')!.setAttribute('id', 'x:injected');
    const { root: safe, warnings } = sanitizeSvg(
      new XMLSerializer()
        .serializeToString(root)
        .replace(
          '</svg>',
          '<script>alert(1)</script><animate attributeName="href" values="javascript:alert(1)"/><rect onload="evil()"/></svg>',
        ),
    );
    expect(safe.querySelector(`[${motionAttribute}]`)).toBeNull();
    expect(safe.querySelector('script,animate,[onload]')).toBeNull();
    expect(safe.querySelector('#card')).not.toBeNull();
    expect(warnings.join(' ')).toContain('无效的动效');
  });
  it('regenerates keyframes after ID remapping', () => {
    const root = animated('flow');
    root.querySelector('#motion')!.id = 'copied-motion';
    rewriteReferences(root, new Map([['motion', 'copied-motion']]), 'copy');
    expect(root.querySelector('style')).toBeNull();
    refreshMotionStyles(root);
    expect(root.querySelector('style')!.textContent).toContain('sf_effect_copied-motion');
    expect(root.querySelector('style')!.textContent).not.toContain('sf_effect_motion');
  });
  it('exports a static copy with original geometry and later wrapper edits preserved', () => {
    const root = animated('flow');
    root.querySelector('#motion')!.setAttribute('transform', 'translate(30 10)');
    const xml = staticMotionSvg(root),
      safe = sanitizeSvg(xml).root;
    expect(xml).not.toContain('data-sf-motion');
    expect(xml).not.toContain('@keyframes');
    expect(safe.querySelector('#motion')!.getAttribute('transform')).toBe('translate(30 10)');
    expect(safe.querySelectorAll('line')).toHaveLength(1);
    expect(safe.querySelector('#edge')!.getAttribute('x2')).toBe('200');
    expect(root.querySelector('[data-sf-motion-overlay]')).not.toBeNull();
  });
  it('changes a card as one undoable operation and removes the effect losslessly', () => {
    const engine = new DocumentEngine();
    engine.importSvg(
      wrap('<rect id="card" width="100" height="60" style="opacity:.8!important"/>'),
    );
    const before = engine.exportSvg(),
      card = engine.root!.querySelector('#card') as SVGGraphicsElement;
    configureMotion(engine, card, defaultMotion('pulse'));
    expect(engine.past).toHaveLength(1);
    expect(card.style.opacity).toBe('0.8');
    const after = engine.exportSvg();
    engine.undo();
    expect(engine.exportSvg()).toBe(before);
    engine.redo();
    expect(engine.exportSvg()).toBe(after);
    configureMotion(engine, engine.selection[0], null);
    expect(engine.exportSvg()).toBe(before);
  });
});
