# Agent Evals · OpenAI reproduction prompt

Create a self-contained native SVG architecture diagram with a 1440×1000 viewBox titled “Agent Evals.” Use the subtitle “Run repeatable trials, grade the evidence, and compare with a baseline.” The reader is an engineer reviewing how an evaluation run informs a release decision. Use the English labels below. Model a generic evaluation workflow with a baseline collected under a comparable evaluation setup.

Select the `openai` brand profile. [OpenAI Developers Blog](https://developers.openai.com/blog) and the [failover article cover](https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp). The visual anchor is the local October 25, 2026 capture reviewed on November 6. This diagram is an illustrative adaptation. Use a centered 52px sans headline and white editorial space. Position one wide rounded cover field at (54, 196), 1332×738. Build the field with a cream-to-coral-to-pink base, an upper coral concentration, a pale rose upper-right field, a cream lower-left pool, and a stronger red lower-right field. Add a deterministic stipple pattern and fine opposing concentric arcs inside a local clipPath. Keep functional routes deep plum. Use white translucent planes with clear outlines and small outline glyphs. Make the agent sandbox the largest plane with a larger glyph and a 25px title. Use darker body text on translucent areas. Use local Arial and Helvetica Neue. Space the sequence around the sandbox, then reverse direction for the score-and-decide row.

## Node content and allocations

| ID        | Editable title   | Editable detail lines                               | x y w h         |
| --------- | ---------------- | --------------------------------------------------- | --------------- |
| suite     | Eval suite       | Tasks · fixtures · rubric                           | 135 292 218 92  |
| spec      | Run spec         | Candidate · tool policy / Environment · trial count | 135 460 218 110 |
| runner    | Eval runner      | Schedule isolated trials                            | 407 378 198 115 |
| agent     | Agent sandbox    | Run the candidate / with controlled tools           | 665 361 220 150 |
| artifacts | Trial artifacts  | Trace · output · end state                          | 955 378 233 115 |
| graders   | Graders          | Checks · model judges / Human review when needed    | 955 641 233 118 |
| baseline  | Baseline         | Reference run scores                                | 619 813 235 85  |
| compare   | Compare runs     | Aggregate across trials / Measure baseline delta    | 619 641 235 118 |
| gate      | Release decision | Promote · hold · investigate                        | 292 641 224 118 |

## Directed relationships

| ID        | From → to           | Route points                                       | Label and baseline          |
| --------- | ------------------- | -------------------------------------------------- | --------------------------- |
| cases     | suite → runner      | 357,338 → 381,338 → 381,409 → 403,409              | —                           |
| configure | spec → runner       | 357,511 → 381,511 → 381,466 → 403,466              | —                           |
| execute   | runner → agent      | 609,434 → 661,434                                  | —                           |
| record    | agent → artifacts   | 889,434 → 951,434                                  | —                           |
| score     | artifacts → graders | 1071,497 → 1071,637                                | —                           |
| rubric    | suite → graders     | 244,288 → 244,244 → 1255,244 → 1255,690 → 1192,690 | rubric at 777,233           |
| aggregate | graders → compare   | 951,699 → 858,699                                  | —                           |
| reference | baseline → compare  | 736,809 → 736,763                                  | reference scores at 750,792 |
| decide    | compare → gate      | 615,699 → 520,699                                  | —                           |

Round elbows with 14-unit quadratic turns. Mark the direction with a local native arrow marker. Dash the rubric and baseline score paths, and label the legend “Trial and decision” and “Reference inputs.” Leave a gap between arrow tips and node allocations. Preserve the reference and main routes as separate editable groups.

Use native text, paths, groups, local definitions and presentation attributes. Give each node and relation its exact ID and the documented graph metadata. Do not load external images, scripts, or fonts. Check semantic equality against the shared graph, then inspect fit and native views for label fit, routing and contrast. Verify a real native text edit and reopen.
