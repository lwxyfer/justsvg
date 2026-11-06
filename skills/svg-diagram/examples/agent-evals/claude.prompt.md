# Agent Evals · Claude reproduction prompt

Create a self-contained native SVG architecture diagram with a 1360×1060 viewBox titled “Agent Evals.” Use the subtitle “Run repeatable trials, grade the evidence, and compare with a baseline.” The reader is an engineer reviewing how an evaluation run informs a release decision. Use the English labels below. Model a generic evaluation workflow with a baseline collected under a comparable evaluation setup.

Select the `claude` brand profile. [Claude home page](https://claude.com/), 1440px live desktop capture reviewed on November 6 after typography and animation settled. Use the warm paper base and serif hierarchy, with the photographed paper materials as inspiration for vector note surfaces. This diagram is an illustrative adaptation. Make the diagram read like a field note. Use a warm paper field #f8f6ef, a 66px Georgia serif headline aligned left, thin brown rules, and three numbered chapters across the page. Use open rule blocks for inputs, runner, artifacts and baseline. Place a taller terracotta #a04a37 panel at the center for the sandbox, with ivory text and a small outline cube. Put review outputs in stacked oatmeal manuscript panels with a short colored edge rule. Use Georgia for node titles and system sans for details. Keep the trial and review sequences vertical and connect them across the middle. Use thin ink arrows and clay dashed reference paths.

## Node content and allocations

| ID        | Editable title   | Editable detail lines                               | x y w h         |
| --------- | ---------------- | --------------------------------------------------- | --------------- |
| suite     | Eval suite       | Tasks · fixtures · rubric                           | 90 305 245 108  |
| spec      | Run spec         | Candidate · tool policy / Environment · trial count | 90 481 245 108  |
| runner    | Eval runner      | Schedule isolated trials                            | 472 302 275 104 |
| agent     | Agent sandbox    | Run the candidate / with controlled tools           | 472 468 275 120 |
| artifacts | Trial artifacts  | Trace · output · end state                          | 472 660 275 100 |
| graders   | Graders          | Checks · model judges / Human review when needed    | 917 448 340 128 |
| baseline  | Baseline         | Reference run scores                                | 472 858 275 92  |
| compare   | Compare runs     | Aggregate across trials / Measure baseline delta    | 917 670 340 114 |
| gate      | Release decision | Promote · hold · investigate                        | 917 850 340 114 |

## Directed relationships

| ID        | From → to           | Route points                            | Label and baseline          |
| --------- | ------------------- | --------------------------------------- | --------------------------- |
| cases     | suite → runner      | 339,350 → 468,350                       | —                           |
| configure | spec → runner       | 339,535 → 390,535 → 390,382 → 468,382   | —                           |
| execute   | runner → agent      | 608,410 → 608,464                       | —                           |
| record    | agent → artifacts   | 608,592 → 608,656                       | —                           |
| score     | artifacts → graders | 751,707 → 815,707 → 815,524 → 913,524   | —                           |
| rubric    | suite → graders     | 301,301 → 301,244 → 1087,244 → 1087,444 | rubric at 726,232           |
| aggregate | graders → compare   | 1087,580 → 1087,666                     | —                           |
| reference | baseline → compare  | 751,903 → 843,903 → 843,735 → 913,735   | reference scores at 759,928 |
| decide    | compare → gate      | 1087,788 → 1087,846                     | —                           |

Keep elbows orthogonal. Mark the direction with a local native arrow marker. Dash the rubric and baseline score paths, and label the legend “Trial and decision” and “Reference inputs.” Leave a gap between arrow tips and node allocations. Preserve the reference and main routes as separate editable groups.

Use native text, paths, groups, local definitions and presentation attributes. Give each node and relation its exact ID and the documented graph metadata. Do not load external images, scripts, or fonts. Check semantic equality against the shared graph, then inspect fit and native views for label fit, routing and contrast. Verify a real native text edit and reopen.
