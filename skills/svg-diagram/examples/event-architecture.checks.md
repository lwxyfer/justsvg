# Trial: event-driven order architecture

Checked 2026-10-26. [SVG](event-architecture.svg) · [semantic graph](event-architecture.graph.json) · [full prompt](event-architecture.prompt.md) · [machine report and input hashes](event-architecture.report.json) · [native preview](previews/event-architecture.png).

## Semantic and technical result

Illustrative order submission, record persistence, outbox event publishing and two subscribers. Seven leaf nodes, six directed relations; this is a new topic and composition, not the RAG fixture with renamed labels. The simplified order/outbox writes do not assert transaction atomicity, delivery guarantees or a complete retry design.

Python structural preflight and semantic graph equality passed with no errors/warnings. Chromium 155.0.8059.85 (`--channel chrome`), Node 24.18.0 and Python 3.12.13 were used. All 23 native text elements, seven allocations and six sampled paths passed canvas/allocation, overlap and route checks. A real native text edit was serialized and reopened in a new browser navigation; editable text remained. No attempted external resource requests were recorded.

Inspected native 1200×820, fit-960 and fit-390 PNGs. Native view supports reading; 390px is an overview and needs zoom for details. Preview PNGs are review artifacts only: the SVG contains no bitmap. No JustSVG connector bindings are added or claimed.

## Source and visual result

Primary anchor: [OpenAI Developers Blog](https://developers.openai.com/blog), specifically [the failover article cover](https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp). The project's valid screenshot/DOM observation was captured 2026-10-25 and inspected in this trial on 2026-10-26. This review compares that historical capture; it does not assert a fresh current-page capture. The screenshot and proprietary typeface are not packaged.

| Dimension           | Observation / result                                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composition / scale | Adaptation: white centered editorial header and one full warm field; unequal API/broker focal planes with supporting records and consumers. New graph and route corridor, not a copy of the cover's sparse topology.            |
| Typography          | Adaptation: local Arial/sans fallback, native editable text. Does not reproduce OpenAI Sans glyphs or exact source spacing.                                                                                                     |
| Lines / shapes      | Matches selected devices: thin precise glyphs, translucent rounded planes and opposing arc families. Deep-wine information and arrowheads are readability adaptations.                                                          |
| Material / color    | Partial match: warm coral/orange concentrations, lower-left cream and upper-right pink. The vector field is smoother and the stipple more regular than the source's cloud/grain material; exact texture fidelity remains a gap. |
| Icons / rhythm      | Original code/store/queue/mail/ledger glyphs; large clear pauses between the main request, publish path and subscribers. No brand logo or simulated product UI.                                                                 |

Two bounded corrections were made: the renderer now uses fresh pages for each size after a visible gradient screenshot residue; small text and functional route ink were deepened after contrast spot checks on the actual composited background. Re-rendered images showed no obvious clipping, node/label collision or misdirected arrow. There is no whole-image automated contrast certification.

This is a usable non-official visual adaptation with the above material/font limits. No user aesthetic approval or official brand certification is asserted. The helper report's `visualReview: required` is intentionally separate from this explicit visual review.

## Reproduce the checks

From the skill directory:

```sh
python3 scripts/validate_svg.py examples/event-architecture.svg --graph examples/event-architecture.graph.json
node scripts/render_check.mjs examples/event-architecture.svg --graph examples/event-architecture.graph.json --out /tmp/svg-diagram-event-qa --channel chrome
```

Helper limits (sampling, conservative transformed boxes, stroke/marker extents, fonts) are listed in [validation.md](../references/validation.md). This self-run trial verifies this artifact and workflow, not cross-model or independent-agent generalization.
