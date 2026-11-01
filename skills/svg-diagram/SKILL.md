---
name: svg-diagram
description: Create or restyle editable native SVG architecture diagrams, flowcharts, infographics, and system or repository maps. Use for concrete visual references or brand-inspired diagrams, including source calibration and browser verification. Excludes logo design, general illustration, and raster mockups.
---

# SVG Diagram

Deliver a useful diagram as portable SVG, with a reproducible prompt and evidence of what was checked. Work independently of JustSVG; its connector bindings are optional.

## Establish the brief

Extract the audience, communication goal, required facts and relationships, output location, language, and visual reference. Infer routine layout choices. Ask only when a missing fact changes meaning or the reference cannot be identified; continue independent work while waiting. With no reference, choose an unbranded diagram language appropriate to the medium and state that choice.

For a brand or supplied visual, read [references/style-calibration.md](references/style-calibration.md). Pin a **specific surface**: website, product interface, article cover, or supplied screenshot. Record source URL/file, capture date, visible observations and access limits. Inspect valid visual evidence before claiming fidelity. Treat blocked pages as unavailable evidence. A broad brand name alone does not select a surface; name a reasonable candidate as provisional when clarification is unavailable. The historical OpenAI case in the reference is a dated observation, not a universal brand preset.

## Separate meaning from presentation

Write a compact semantic graph of node IDs, labels, groups, directed relations and branch meanings. For repository maps, ground claims in inspected files; label inferred responsibilities. Distinguish illustrative examples from production facts. Preserve this graph when comparing styles; choose geometry independently. For same-style new content, reuse the visual rules and re-layout the graph.

Choose composition, focal scale, type hierarchy, line language, silhouette, material, icon vocabulary and reading rhythm from the reference and the actual content. Allocate node/text boxes and connector corridors before drawing details. Place branch labels beside the route they explain. A style comparison needs structural visual differences beyond a recolored template; a content comparison need not invent a new style.

## Author the SVG and prompt

Read [references/svg-contract.md](references/svg-contract.md) before generating markup. Use native `text`/`tspan`, named `g` groups, unique IDs, and local `defs` references. Keep text editable, resources self-contained and font fallbacks explicit. Use original vector symbols for concepts; brand-inspired artwork does not require a brand logo.

Write the complete generation prompt using [references/prompt-template.md](references/prompt-template.md): resolved content, visual rules, actual geometry/routes, sources and adaptation limits. Save it alongside the SVG, rather than leaving critical instructions only in chat. Choose canvas dimensions from density and reading size; the packaged examples' sizes and counts are examples only.

## Render, inspect, repair

Use [references/validation.md](references/validation.md) for commands, helper metadata, and limits. Run structural validation before opening generated SVG. Then render in a browser; inspect the whole composition at fit size and lettering, route labels, arrow tips, alignment and spacing at native size. If the supplied browser helper is unavailable, use another real browser and record the missing automated checks.

Check **two separate outcomes**:

- Technical: exact semantic coverage, valid references, editable text/groups, readable bounds, clear nodes and routes, correct arrow direction and legend. Include at least one real text edit → serialize → reopen check when editability is promised; verify connector movement in the target app only when bindings are requested.
- Visual: compare against the pinned evidence on composition, scale, typography, lines, shapes, material, icons and rhythm. Name observations as match, deliberate adaptation, gap or unknown. Tests alone cannot establish this outcome or user acceptance.

Collect concrete defects, fix them in one batch, and re-render affected views. Default to at most two repair batches; if a substantive defect remains, deliver the usable work with the exact gap or ask for the missing input. Change the bound when the user requests further refinement. Avoid repeated preference-only micro-adjustments after the defined checks pass.

## Deliver

Provide the `.svg`, full `.prompt.md`, and a concise check record with sources, completed checks, visual gaps and renderer/font limits. Keep the semantic graph as a sidecar when it aids reuse or comparison. If the user requests only XML, return only the complete SVG and keep supporting artifacts in the requested workspace when available. Distinguish technical success, visual review, and explicit user approval.

For installation and executable examples see [README.md](README.md). The examples are a seven-node event architecture and an eight-node release flow; neither defines the skill's content scope.
