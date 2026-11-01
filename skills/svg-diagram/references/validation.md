# Validation helpers

Run commands from the skill folder, or substitute absolute paths. Authoring itself needs no library or editor. Structural checks need Python 3.10+ (standard library only). Browser checks need Node.js 22+ and `playwright` or `@playwright/test` plus Chromium; the JustSVG checkout already has the latter dependency. The browser helper resolves packages beside the script or in the current working directory.

```sh
python3 scripts/validate_svg.py examples/event-architecture.svg --graph examples/event-architecture.graph.json
node scripts/render_check.mjs examples/event-architecture.svg --graph examples/event-architecture.graph.json --out /tmp/svg-diagram-architecture-qa
```

For a standalone copy without browser dependencies, install them in a temporary project rather than changing the skill package:

```sh
mkdir -p /tmp/svg-diagram-browser
npm install --prefix /tmp/svg-diagram-browser playwright
cd /tmp/svg-diagram-browser
npx playwright install chromium
node /absolute/path/svg-diagram/scripts/render_check.mjs /absolute/path/diagram.svg --out /tmp/svg-diagram-qa
```

`validate_svg.py` prints JSON and exits 0 for success, 1 for invalid/unsupported input. `render_check.mjs` exits 0 for completed technical checks, 1 for measured geometry errors, 2 for preflight/dependency/browser/CLI failure. Check `warnings` as well as exit status. Missing semantic metadata reduces coverage even if the XML is accepted. `--graph` makes node/edge/direction/label coverage mandatory.

## What is checked

The Python helper checks XML, a bounded static element/attribute profile, unique IDs, local references/cycles, positive canvas/allocation dimensions, editable text, semantic endpoints, and optional graph equality. Its 5 MB input limit protects ordinary generated assets. It **rejects** rather than sanitizes unsupported content: CSS styles, animation, filters, images, scripts, events, `foreignObject`, external resources, DTD/entities and foreign namespaces. This is a documented helper profile, not a statement that every other SVG feature is invalid. For existing SVG outside that profile, preserve the original, report the unsupported feature, and use a suitable trusted sanitizer/renderer if needed. Do not strip features silently.

The browser helper runs preflight first, disables page JavaScript, blocks resource requests, and renders the file as standalone SVG. It writes `native.png`, `fit-960.png`, `fit-390.png` and `report.json` to the specified directory. Native dimensions are capped at 8192px per axis. These two fit views test scaled artwork; they do not test a responsive application UI or guarantee readable phone-size labels. If bundled Chromium is missing but Google Chrome is installed, add `--channel chrome`; the JustSVG project uses that channel for its own browser tests. Record the actual browser/version. The default remains Playwright's bundled Chromium.

Measured checks: text outside canvas or allocation, text/text and leaf-node overlap, sampled functional paths through nodes/text, routes outside the canvas, endpoint distance warnings, and a real text edit → XML serialize → new browser navigation with editable text retained. The source is never overwritten. `data-bounds`/`data-layout` and `data-edge` or existing JustSVG metadata select geometry; see [svg-contract.md](svg-contract.md). An edge group must contain exactly one path/line/polyline for automated route checks. Missing or ambiguous geometry produces warnings, not fabricated coverage.

## What still requires inspection

Compare the PNGs with the pinned visual evidence. Inspect native-size text, actual font fallback, alignment, whitespace, arrowhead tips/size, label-to-route association and legend meanings. Check contrast against the composited material. Inspect clipping, masks, dashed routes and overlapping decorations.

Node boxes and transformed text are conservative axis-aligned envelopes. Stroke widths, arrowhead extents and clipping are not measured. Routes are sampled approximately every two root units, capped at 4000 samples per edge; very narrow intersections can escape. Masked/occluded geometry may be over-reported. A generic text XML roundtrip does not prove a specific editor's import or binding behavior. There is no automated contrast score, brand recognition score, browser compatibility matrix or user acceptance verdict. Warnings produce `technical-checks-incomplete`; they still require inspection even when the exit code is zero.

Record verdicts separately: semantic/technical results; visual observations and deliberate adaptations; remaining gaps; explicit user feedback if supplied. Batch real defects and rerun affected checks within the skill's repair bound.

Helpers can be regression-tested without changing the app:

```sh
python3 scripts/test_validate_svg.py
node scripts/test_render_check.mjs
```

The second command needs Chromium; add `--channel chrome` to use installed Google Chrome. These tests exercise adverse inputs and actual geometry failures; they do not score aesthetic quality.

API basis: [Playwright routing](https://playwright.dev/docs/api/class-page#page-route), [screenshots](https://playwright.dev/docs/api/class-page#page-screenshot), and [SVG coordinate systems](https://www.w3.org/TR/SVG2/coords.html#BoundingBoxes).
