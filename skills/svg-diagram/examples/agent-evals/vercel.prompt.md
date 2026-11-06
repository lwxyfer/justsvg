# Agent Evals · Vercel reproduction prompt

Create a self-contained native SVG architecture diagram with a 1400×890 viewBox titled “Agent Evals.” Use the subtitle “Run repeatable trials, grade the evidence, and compare with a baseline.” The reader is an engineer reviewing how an evaluation run informs a release decision. Use the English labels below. Model a generic evaluation workflow with a baseline collected under a comparable evaluation setup.

Select the `vercel` brand profile. [Geist Grid](https://vercel.com/geist/grid) and [Geist Materials](https://vercel.com/geist/materials) read on November 6, with a prior local screenshot of the official [Geist colors](https://vercel.com/geist/colors) surface reviewed for the light neutral scale. This diagram is an illustrative adaptation. Use a near-white ground, a bold flush-left 55px heading and a monospaced engineering eyebrow. Frame the diagram with a restrained four-column grid with dotted guides and small crosshair intersections. Give each node a short slash-prefixed ID, a compact title and a small technical glyph. Use 6-unit radii for regular surfaces and 12 for the emphasized sandbox and decision surfaces. Make the release decision a black block with light text and keep color to the small blue baseline port and subdued reference lines. Place the baseline at the top of the evaluation column and route its dependency on the outside right. Use local Geist/Arial for titles and Geist Mono/Menlo/Consolas for technical labels.

## Node content and allocations

| ID        | Editable title   | Editable detail lines                               | x y w h          |
| --------- | ---------------- | --------------------------------------------------- | ---------------- |
| suite     | Eval suite       | Tasks · fixtures · rubric                           | 105 280 210 90   |
| spec      | Run spec         | Candidate · tool policy / Environment · trial count | 105 469 210 100  |
| runner    | Eval runner      | Schedule isolated trials                            | 437 270 220 94   |
| agent     | Agent sandbox    | Run the candidate / with controlled tools           | 437 450 220 106  |
| artifacts | Trial artifacts  | Trace · output · end state                          | 777 450 220 100  |
| graders   | Graders          | Checks · model judges / Human review when needed    | 1085 450 220 106 |
| baseline  | Baseline         | Reference run scores                                | 1085 270 220 90  |
| compare   | Compare runs     | Aggregate across trials / Measure baseline delta    | 1085 657 220 104 |
| gate      | Release decision | Promote · hold · investigate                        | 757 657 240 104  |

## Directed relationships

| ID        | From → to           | Route points                                       | Label and baseline           |
| --------- | ------------------- | -------------------------------------------------- | ---------------------------- |
| cases     | suite → runner      | 319,320 → 433,320                                  | —                            |
| configure | spec → runner       | 319,510 → 385,510 → 385,345 → 433,345              | —                            |
| execute   | runner → agent      | 547,368 → 547,446                                  | —                            |
| record    | agent → artifacts   | 661,499 → 773,499                                  | —                            |
| score     | artifacts → graders | 1001,510 → 1081,510                                | —                            |
| rubric    | suite → graders     | 210,276 → 210,240 → 1042,240 → 1042,474 → 1081,474 | rubric at 907,230            |
| aggregate | graders → compare   | 1195,560 → 1195,653                                | —                            |
| reference | baseline → compare  | 1309,315 → 1335,315 → 1335,705 → 1309,705          | reference scores at 1203,410 |
| decide    | compare → gate      | 1081,709 → 1001,709                                | —                            |

Keep elbows orthogonal. Mark the direction with a local native arrow marker. Dash the rubric and baseline score paths, and label the legend “Trial and decision” and “Reference inputs.” Leave a gap between arrow tips and node allocations. Preserve the reference and main routes as separate editable groups.

Use native text, paths, groups, local definitions and presentation attributes. Give each node and relation its exact ID and the documented graph metadata. Do not load external images, scripts, or fonts. Check semantic equality against the shared graph, then inspect fit and native views for label fit, routing and contrast. Verify a real native text edit and reopen.
