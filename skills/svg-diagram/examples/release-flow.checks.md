# Trial: release and rollback flow

Checked 2026-10-26. [SVG](release-flow.svg) · [semantic graph](release-flow.graph.json) · [full prompt](release-flow.prompt.md) · [machine report and input hashes](release-flow.report.json) · [native preview](previews/release-flow.png).

## Semantic and technical result

Eight leaf nodes and nine directed relations. Build/test leads to a readiness gate; failed checks revise and recheck. A canary leads to observation, then promotion or rollback. Rollback returns to a new revision. Thresholds, owners and release guarantees are unspecified rather than fabricated.

Python structural/reference checks and exact graph/direction/branch-label coverage passed with no errors/warnings. Chromium 155.0.8059.85 (`--channel chrome`), Node 24.18.0 and Python 3.12.13 were used. All 31 native text elements, eight allocations and nine sampled paths passed canvas, node/text overlap and route checks. A native text edit was serialized and actually reopened with editable text retained. No attempted external resource requests were recorded.

Inspected native 1280×940, fit-960 and fit-390 PNGs. Labels are readable at native scale; the phone-size fit image is for orientation and requires zoom for details. The SVG itself has native groups, text, paths and an internal arrow marker, with no bitmap, external resource or required application metadata.

## Visual result

This is an original **unbranded** editorial direction chosen for a technical handbook. It does not use Notion as a validated standard and makes no branded fidelity claim.

| Dimension           | Observation / result                                                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composition / scale | Top sequence establishes prepare → verify → release; outcomes occupy the right/lower field, and an outer corridor makes the long rollback path explicit.                                                   |
| Typography          | Left-aligned Georgia/serif title, sans node labels, centered decision text. Local font fallback remains platform-dependent.                                                                                |
| Lines / shapes      | Entry pill, processing rectangles, two true diamonds and a dark promotion terminal. Solid forward routes and ochre dashed revision/rollback routes match the visible legend.                               |
| Material / color    | Warm-white page, restrained ink and cream decisions; clear contrast by observation, without a claim of full computed WCAG compliance. No glass/gradient material carried over from the architecture trial. |
| Icons / rhythm      | No icons are needed to distinguish this flow. Spacing reserves separate return paths and keeps labels next to their routes.                                                                                |

No obvious native-size collision, clipping, incorrect branch label or wrong arrow direction remained on inspection. The revised fresh-page screenshot strategy was used for final previews. No JustSVG binding, Safari/Firefox behavior, official brand approval or user aesthetic acceptance is claimed. The helper's machine `visualReview: required` is addressed separately by this visual record.

## Reproduce the checks

From the skill directory:

```sh
python3 scripts/validate_svg.py examples/release-flow.svg --graph examples/release-flow.graph.json
node scripts/render_check.mjs examples/release-flow.svg --graph examples/release-flow.graph.json --out /tmp/svg-diagram-release-qa --channel chrome
```

Helper limits are listed in [validation.md](../references/validation.md). This self-run trial demonstrates different content/topology and visual rules; it is not an independent agent evaluation or proof across arbitrary diagrams.
