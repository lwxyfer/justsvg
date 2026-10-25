import { isMotionPart, isMotionWrapper } from '../document/motion';
// Resolve the incoming asset in an isolated shadow tree before attaching it to the user's SVG.
// Inline appearance prevents an existing stylesheet such as `path { fill:red!important }`
// from changing the new asset. Styles and references inside the asset still resolve natively.
const properties =
  'fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color font-family font-size font-style font-weight letter-spacing word-spacing text-anchor dominant-baseline alignment-baseline baseline-shift visibility display clip-path clip-rule mask filter marker-start marker-mid marker-end stop-color stop-opacity flood-color flood-opacity vector-effect paint-order'.split(
    ' ',
  );
export function freezeAssetAppearance(root: SVGSVGElement) {
  const host = document.createElement('div');
  host.style.cssText =
    'all:initial;position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(root);
  document.body.append(host);
  try {
    const values = [root, ...root.querySelectorAll<SVGElement>('*')]
      .filter(
        (el) =>
          !isMotionPart(el) &&
          !['style', 'defs', 'title', 'desc', 'metadata'].includes(el.localName),
      )
      .map((el) => ({
        el,
        style: properties.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]),
      }));
    for (const { el, style } of values)
      for (const [p, v] of style)
        if (v && !(isMotionWrapper(el) && p === 'opacity'))
          el.style.setProperty(p, v.replace(/url\(["']?[^#)]*#/g, 'url(#'), 'important');
  } finally {
    root.remove();
    host.remove();
  }
}
