import { anchorAt, encodeAnchor, parsePoints } from '../../geometry/connectors';
/** Our authored templates have untransformed absolute geometry; compile links without a render pass. */
export function templateBindings(source: string) {
  const root = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
  const nodes = [...root.querySelectorAll('[data-sf-bounds]')].map((node) => {
    const [x, y, width, height] = node.getAttribute('data-sf-bounds')!.split(' ').map(Number);
    node.removeAttribute('data-sf-bounds');
    return { node, box: { x, y, width, height } };
  });
  for (const line of root.querySelectorAll('polyline')) {
    const points = parsePoints(line.getAttribute('points') || '');
    if (!points) continue;
    for (const end of ['start', 'end'] as const) {
      const p = end === 'start' ? points[0] : points.at(-1)!;
      const matches = nodes
        .map(({ node, box }) => {
          const anchor = anchorAt(box, p, 'nearest', true);
          return { node, anchor, distance: Math.hypot(anchor.dx, anchor.dy) };
        })
        .filter((m) => m.distance <= 2)
        .sort((a, b) => a.distance - b.distance);
      if (
        !matches.length ||
        (matches[1] && Math.abs(matches[0].distance - matches[1].distance) < 0.001)
      )
        continue;
      line.setAttribute(`data-sf-${end}-node`, `#${matches[0].node.id}`);
      line.setAttribute(`data-sf-${end}-anchor`, encodeAnchor(matches[0].anchor));
    }
  }
  return new XMLSerializer().serializeToString(root);
}
