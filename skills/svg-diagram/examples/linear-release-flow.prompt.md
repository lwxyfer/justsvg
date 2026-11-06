# Reproduction prompt · Linear release flow

Create a 1400×760 editable native SVG named `linear-release-flow.svg`. Use the supplied release workflow as a technical playbook for an engineering team. Show the positive rollout, the revise-and-recheck loop and the rollback-to-new-revision loop. The workflow and REL IDs are illustrative.

Resolve the requested brand name with `python3 scripts/find_brand.py Linear`. Use the March 12, 2026 Linear project and issue interface refresh, specifically the warm neutral dark surfaces, separated location and view bars, muted navigation, compact issue metadata and softened dividers. The official article and palette documentation were read on 2026-11-06. Visual observations also use the prior project capture of the official comparison artwork.

- [Linear interface refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [Linear brand color references](https://linear.app/brand)

Keep the workspace dominant. Use background `#111112`, panel `#171719`, sidebar `#141415`, issue surface `#212124`, primary text `#f4f5f8`, supporting text `#b0afb4`. Color values are diagram adaptations except for the named Mercury White reference. Use desaturated blue `#a4a9e4` for the current focus and tiny metadata accents. Ordinary connectors are neutral `#939298`. Return routes use warm `#d8ae90` and dashes with a legend. Use Arial / Helvetica Neue / system sans and Menlo / Consolas for identifiers. Keep type as SVG text.

Place the main title at (48,92) above the workspace rectangle (48,126,1304,576). Reserve x=48–225 for the dim navigation. The location bar ends at y=169 and the view bar at y=221. Keep four content columns with headings at x=275,540,805,1070 and y=267. Keep the issue rows and routes editable. Node rectangles have 7-unit radii and carry their exact allocated bounds. Text anchors are x+12, with title and detail baselines at y+44 and y+63. REL IDs occupy x+24/y+20. Legend sits at y=734.

## Exact node layout

| ID       | Title        | Detail                   | Bounds x y w h  |
| -------- | ------------ | ------------------------ | --------------- |
| draft    | Change       | A reviewed revision      | 275 298 180 75  |
| checks   | Build & test | Static + behavior checks | 540 298 185 75  |
| gate     | Ready?       | Pass / revise            | 805 298 185 75  |
| canary   | Canary       | Small traffic slice      | 1070 298 208 75 |
| observe  | Healthy?     | Signals / errors         | 1070 435 208 76 |
| promote  | Promote      | Expand the rollout       | 1070 574 208 75 |
| rollback | Rollback     | Restore prior version    | 805 574 185 75  |
| rework   | Revise       | Address failed checks    | 805 435 185 76  |

## Exact relationships and routes

| ID        | From → to          | Label                       | Route points                       | Label baseline |
| --------- | ------------------ | --------------------------- | ---------------------------------- | -------------- |
| build     | draft → checks     | —                           | 459,336 536,336                    | —              |
| assess    | checks → gate      | —                           | 729,336 801,336                    | —              |
| pass      | gate → canary      | pass                        | 994,336 1066,336                   | (1014, 324)    |
| fail      | gate → rework      | revise                      | 897,377 897,431                    | (911, 409)     |
| retry     | rework → checks    | recheck                     | 801,475 630,475 630,377            | (649, 463)     |
| monitor   | canary → observe   | observe                     | 1174,377 1174,431                  | (1190, 409)    |
| healthy   | observe → promote  | healthy                     | 1174,515 1174,570                  | (1190, 548)    |
| unhealthy | observe → rollback | errors                      | 1066,475 1027,475 1027,611 994,611 | (1040, 554)    |
| restore   | rollback → draft   | new revision after rollback | 801,611 252,611 252,336 271,336    | (313, 598)     |

Use the supplied release-flow graph as the semantic sidecar. Implement each node as a named g with data-node and data-bounds, and each edge as a named g with data-edge, data-from and data-to. Use local marker fragments with viewBox 0 0 10 10, refX=10 and refY=5. Keep labels separate from the routes. Output a self-contained SVG with no external fonts, images, scripts or styles. Validate both branches at each decision, route clearances and native text roundtrip in a real browser. Keep the full prompt and a check record with the SVG.
