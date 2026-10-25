import { describe, it, expect } from 'vitest';
import { sanitizeSvg, cleanCss, MAX_BYTES } from '../../src/editor/security/sanitize';
import { fixtures } from '../../src/fixtures';
const wrap = (content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${content}</svg>`;
describe('SVG security and fidelity', () => {
  it('preserves XML-escaped angle brackets and ampersands in native text and labels', () => {
    const input = wrap(
      '<g data-label="Proxy &lt;port&gt; &amp; socket"><text>127.0.0.1:&lt;port&gt; &amp; socket</text></g>',
    );
    const first = sanitizeSvg(input);
    expect(first.warnings).toEqual([]);
    expect(first.root.querySelector('g')!.getAttribute('data-label')).toBe('Proxy <port> & socket');
    expect(first.root.querySelector('text')!.textContent).toBe('127.0.0.1:<port> & socket');
    const second = sanitizeSvg(new XMLSerializer().serializeToString(first.root));
    expect(second.root.isEqualNode(first.root)).toBe(true);
  });
  it.each(Object.entries(fixtures))('parses and round-trips %s', (_name, xml) => {
    const first = sanitizeSvg(xml);
    const serialized = new XMLSerializer().serializeToString(first.root);
    const second = sanitizeSvg(serialized);
    expect(second.root.getAttribute('viewBox')).toBe(first.root.getAttribute('viewBox'));
    expect(second.root.querySelectorAll('text').length).toBe(
      first.root.querySelectorAll('text').length,
    );
  });
  it('retains definitions, internal URLs, markers, styles, masks and clip paths', () => {
    const { root } = sanitizeSvg(fixtures.complex);
    for (const tag of [
      'defs',
      'linearGradient',
      'clipPath',
      'mask',
      'marker',
      'filter',
      'style',
      'use',
    ])
      expect(root.querySelector(tag), tag).not.toBeNull();
    expect(root.querySelector('#nested-rect')?.getAttribute('fill')).toBe('url(#complex-gradient)');
    expect(root.querySelector('#inner')?.getAttribute('transform')).toBe('scale(1.2 .85)');
  });
  it('blocks scripts, events, foreignObject and external images', () => {
    const { root, warnings } = sanitizeSvg(fixtures.security);
    expect(root.querySelector('script,foreignObject')).toBeNull();
    expect(root.getAttribute('onload')).toBeNull();
    expect(root.querySelector('image')?.hasAttribute('href')).toBe(false);
    expect(root.querySelector('#safe')).not.toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
    expect(root.querySelector('style')?.textContent).not.toContain('https');
  });
  it.each([
    '<svg><g></svg>',
    '<html/>',
    '<!DOCTYPE svg><svg/>',
    '<svg xmlns="https://evil.example"/>',
  ])('rejects invalid documents %s', (xml) => expect(() => sanitizeSvg(xml)).toThrow());
  it('rejects oversized and deeply nested documents', () => {
    expect(() => sanitizeSvg(' '.repeat(MAX_BYTES + 1))).toThrow(/5 MB/);
    expect(() => sanitizeSvg(wrap('<g>'.repeat(85) + '<rect/>' + '</g>'.repeat(85)))).toThrow(/80/);
  });
  it('blocks CSS external URLs and escaped payloads, preserves safe CSS', () => {
    const warnings = new Set<string>();
    const safe = cleanCss(
      '.a{fill:url(#safe);stroke:red;filter:url(https://evil.test/x);cursor:url(https://evil.test/y)}',
      false,
      warnings,
    );
    expect(safe).toContain('fill:url(#safe)');
    expect(safe).not.toContain('https');
    expect(cleanCss('fill:u\\72l(https://evil.test)', true, warnings)).toBe('');
    expect(
      cleanCss('@font-face{src:url(https://evil.test/f)}text{font-family:Arial}', false, warnings),
    ).not.toContain('src');
  });
  it('blocks cyclic use references and preserves normal instances', () => {
    expect(() =>
      sanitizeSvg(wrap('<defs><g id="loop"><use href="#loop"/></g></defs><use href="#loop"/>')),
    ).toThrow(/循环/);
    expect(sanitizeSvg(fixtures.infographic).root.querySelector('use')?.getAttribute('href')).toBe(
      '#star',
    );
  });
  it('permits embedded raster images and strips SVG data images', () => {
    const root = sanitizeSvg(
      wrap(
        '<image id="png" href="data:image/png;base64,aGVsbG8="/><image id="svg" href="data:image/svg+xml;base64,aGVsbG8="/>',
      ),
    ).root;
    expect(root.querySelector('#png')?.getAttribute('href')).toContain('data:image/png');
    expect(root.querySelector('#svg')?.getAttribute('href')).toBeNull();
  });
  it('strips animation and namespaced event attributes', () => {
    const root = sanitizeSvg(
      wrap(
        '<rect onClick="evil()"><animate attributeName="href" values="javascript:alert(1)"/></rect>',
      ),
    ).root;
    expect(root.querySelector('animate')).toBeNull();
    expect(root.querySelector('rect')?.attributes.length).toBe(0);
  });
});

describe('viewport and CSS fidelity boundaries', () => {
  it('keeps safe CSS transforms with an explicit editing limitation', () => {
    const result = sanitizeSvg(
      wrap(
        '<style>.card{transform:translate(10px,20px);transform-origin:0 0;overflow:hidden}</style><rect class="card" width="30" height="30"/>',
      ),
    );
    expect(result.root.querySelector('style')?.textContent).toContain(
      'transform:translate(10px,20px)',
    );
    expect(result.warnings.join(' ')).toContain('CSS Transform');
  });
  it.each(['0 0 0 100', '0 0 1000000 200', 'NaN 0 100 100'])(
    'rejects invalid or excessive viewBox %s',
    (viewBox) =>
      expect(() =>
        sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"/>`),
      ).toThrow(/viewBox/),
  );
  it('does not report DOMPurify internal HTML container removal as SVG content loss', () =>
    expect(sanitizeSvg(fixtures.architecture).warnings).toEqual([]));
});
