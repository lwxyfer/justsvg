# Native SVG contract

## Portable output

- Root `svg` has the SVG namespace, a finite positive `viewBox`, explicit dimensions, a useful `title`/`desc`. Select dimensions from content rather than copying an example.
- Label text stays `text`/`tspan`. Group related shapes and labels under stable semantic IDs. Preserve `defs`, gradients, patterns, markers, clips and all local references through edits. XML-escape content and attribute values.
- Reference assets by local fragments only. Use native geometry instead of raster images or traced text. Keep the document free of scripts, event attributes, `foreignObject`, external styles/fonts/images, DTD/entities and remote links that the output needs to render.
- Use local/system font fallbacks; measure the fonts actually rendered. Missing proprietary fonts can change line breaks and bounds. Manual line breaks with `tspan` are more portable than HTML layout.
- Place edge paths behind nodes when appropriate, but route them in genuine clear corridors: hidden crossings remain defects. Distinguish junctions from crossings; explain multiple line types in a legend. Align labels with their relationships.
- A marker's drawn tip, `refX`/`refY`, orientation, units and actual endpoint must agree. `markerUnits="userSpaceOnUse"` decouples arrowhead size from stroke width. Choose size from scale, rather than imposing the brand study's 8–12 units everywhere.
- Check meaningful text and edges against the actual composited background, including translucent surfaces and gradients. Aim for text contrast 4.5:1 (large text 3:1) and functional graphics 3:1; these are readability targets, not automatic certification. Simplify material or deepen ink when needed.

## Optional helper metadata

This metadata is standard SVG `data-*` and works without JustSVG. It is an authoring/QA aid, not a runtime document model. Update it when geometry changes.

```xml
<g id="api" data-node="true" data-bounds="0 0 240 100"
   transform="translate(320 200)">
  <rect width="240" height="100" rx="12" fill="#fff"/>
  <text x="20" y="42">API</text>
</g>
<polyline id="request" data-edge="true" data-from="client" data-to="api"
  points="244,250 316,250" fill="none" stroke="#333"
  marker-end="url(#arrow)"/>
```

`data-bounds="x y width height"` is a node's allocated rectangle in that group's **local coordinate system**. Mark leaf nodes, not decorative/container groups. The browser helper maps local boxes, text boxes and route samples to root coordinates via CTMs. Rotated/nonrectangular boxes are conservative envelopes; inspect false positives. The helpers also understand the existing JustSVG brand examples' `data-layout` and connector metadata.

A semantic sidecar accepted by both helpers is JSON with `nodes: [{id, label}]` and `edges: [{id, from, to, label?}]`. IDs equal SVG node/edge IDs. Extra semantic fields are allowed. With `--graph`, coverage must match exactly; each node's label must occur in its SVG text and each relation's endpoints and optional label must match its SVG edge group. Place edge labels inside their `data-edge` group for that last check. This schema intentionally has no layout fields.

## Optional JustSVG connector profile

Read this only when the user wants linked movement in JustSVG. Standard SVG renders without it.

On a `line`, `polyline`, supported simple open `M/L/H/V` path, or its single-edge group, add `data-sf-start-node="#node-id"` / `data-sf-end-node="#node-id"`. Each anchor is `u v dx dy`: `u,v` are normalized coordinates on the target node's geometry box, and `dx,dy` are endpoint gaps in document units. Thus `1 0.5 4 0` is four units right of the right-center port. Associate a label through `data-sf-label-for="edge-id"`.

Bind to actual geometry in the node group, not a stale QA allocation containing arbitrary whitespace. Preserve target IDs during copies and edits. Verify movement, undo and export/reimport in JustSVG when promising this behavior. Curves and complex paths stay native but are outside the editor's current linked-routing subset. Moving linked nodes can reroute channels; the editor does not guarantee obstacle avoidance. No script in this package adds or tests app bindings automatically.

## Technical sources

- [SVG 2 bounding boxes and coordinate systems](https://www.w3.org/TR/SVG2/coords.html#BoundingBoxes): local boxes need coordinate conversion; ordinary bounds omit stroke/marker extents.
- [SVG 2 markers](https://www.w3.org/TR/SVG2/painting.html#Markers): marker positioning and units.
- [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): readability targets used here.
