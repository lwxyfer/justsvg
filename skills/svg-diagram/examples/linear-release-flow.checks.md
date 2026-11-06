# Linear release flow · check record

Reviewed on 2026-11-06. [SVG](linear-release-flow.svg) · [Prompt](linear-release-flow.prompt.md) · [Shared flow semantics](release-flow.graph.json) · [Native preview](previews/linear-release-flow.png) · [Browser report](linear-release-flow.report.json)

The request “Linear” resolved to the project and issue UI refresh profile. The review used Linear's current article text and palette documentation, plus a prior project capture of the official side-by-side artwork. The image endpoint did not return a fresh image on 2026-11-06. The earlier capture remains the visual reference for softer dividers, muted surfaces and compact task metadata. [Linear UI refresh](https://linear.app/now/behind-the-latest-design-refresh) · [Linear brand guidelines](https://linear.app/brand)

The adaptation uses a receding sidebar, separate location and view bars, warm dark surfaces and compact task labels. The selected decision uses a small desaturated blue accent. Gray solid lines show forward movement, and warm dashed lines distinguish revision and rollback. The warm route color, issue identifiers and four-column release composition are choices for this diagram. Local fonts approximate the reference typography. The example covers one cross-type transfer of the selected Linear surface.

The original paper-and-ink release flow and this version share eight nodes and nine directed relations. Both readiness outcomes and both health outcomes remain present. The two loops lead back to verification and a new revision respectively. XML and graph validation reported no errors or warnings. Chrome 156 checked the bounds, overlaps and sampled routes, then successfully reopened the SVG after a native text edit. Native and 390px previews were inspected. The narrow preview is an overview and the details need zoom. The browser report has no attempted external requests.

```sh
python3 scripts/find_brand.py Linear
python3 scripts/validate_svg.py examples/linear-release-flow.svg --graph examples/release-flow.graph.json
node scripts/render_check.mjs examples/linear-release-flow.svg --graph examples/release-flow.graph.json --out /tmp/linear-release-qa --channel chrome
```
