import { describe, it, expect } from 'vitest';
import { rewriteReferences } from '../../src/editor/document/references';
describe('clipboard reference rewrite', () => {
  it('rewrites parsed references without corrupting same-named color literals; scopes pasted styles', () => {
    const root = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><style>#fff,.card{fill:#fff;stroke:url(#paint)}</style><defs><linearGradient id="paint"/></defs><rect id="fff" fill="#fff" style="filter:url(#paint)"/><use href="#fff"/></svg>',
      'image/svg+xml',
    ).documentElement;
    rewriteReferences(
      root,
      new Map([
        ['fff', 'fff-copy'],
        ['paint', 'paint-copy'],
      ]),
      'pasted-1',
    );
    expect(root.querySelector('style')!.textContent).toBe(
      '#pasted-1 #fff-copy,#pasted-1 .card{fill:#fff;stroke:url(#paint-copy)}',
    );
    expect(root.querySelector('rect')!.getAttribute('fill')).toBe('#fff');
    expect(root.querySelector('rect')!.getAttribute('style')).toBe('filter:url(#paint-copy)');
    expect(root.querySelector('use')!.getAttribute('href')).toBe('#fff-copy');
  });
});
