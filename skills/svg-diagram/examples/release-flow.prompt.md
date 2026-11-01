# Release with a return path. — full generation prompt

Create a complete editable native SVG diagram for a technical reader. English labels with a Chinese subtitle. This is an illustrative system, not a claim about a real company's production architecture.

## Purpose and exact content

发布流程 · 每个判断，都有明确去向

Nodes (ID | exact title | exact detail):

- draft | Change | A reviewed revision
- checks | Build & test | Static + behavior checks
- gate | Ready? | Pass / revise
- canary | Canary | Small traffic slice
- observe | Healthy? | Signals / errors
- promote | Promote | Expand the rollout
- rollback | Rollback | Restore prior version
- rework | Revise | Address failed checks

Directed relations (IDs and branch meanings must be preserved):

- build | draft -> checks |
- assess | checks -> gate |
- pass | gate -> canary | pass
- fail | gate -> rework | revise
- retry | rework -> checks | recheck
- monitor | canary -> observe | observe
- healthy | observe -> promote | healthy
- unhealthy | observe -> rollback | errors
- restore | rollback -> draft | new revision after rollback

## Source and visual rules

Original unbranded visual direction chosen for a technical handbook; no external visual source is asserted. Illustrative release logic supplied for this trial on 2026-10-26: build/test gate, revision loop, canary observation, promotion or rollback, then a new revision. Thresholds and deployment machinery are intentionally unspecified.

Unbranded editorial flow; no Notion or other brand fidelity claim. Warm-white #fbfaf7 ground, near-black #242822 ink, cream #f0ead9 decisions, restrained ochre #80552d dashed return paths. Composition follows prepare → verify → release across the top, then outcomes down the right; a visible outer-bottom corridor closes rollback to the original change. Typography: left-aligned 46-unit Georgia serif title, 20-unit sans subtitle, 23-unit node titles, 15-unit details; centered 22/13 labels in diamonds. Silhouette: pill entry, plain square-corner processing boxes, two true diamonds and a solid-dark promotion terminal. Lines: 1.8-unit solid forward routes; ochre dashed revise/rollback routes, with an explicit bottom legend. No shadow, grain or glass material. Rhythm: large pauses between gate, return lanes and outcomes; 13-unit numbered phase headings. Node text uses baselines y+39/y+68 for rectangular nodes, and diamond center-5/center+21. No unsupported status metrics, named owners or release guarantees.

## Final layout and routes

Use width=1280, height=940, viewBox="0 0 1280 940". All coordinates are root user units. Font stack: Arial, Helvetica Neue, PingFang SC, sans-serif. Node allocations (ID | x y width height):

- draft | 80 240 200 90
- checks | 390 225 220 120
- gate | 760 210 180 150
- canary | 1030 225 180 120
- observe | 1010 470 220 160
- promote | 720 710 230 100
- rollback | 1010 710 220 100
- rework | 390 490 220 110

Routes (edge ID | ordered points | label baseline x,y):

- build | 284,285 -> 386,285 | None
- assess | 614,285 -> 756,285 | None
- pass | 944,285 -> 1026,285 | (965, 270)
- fail | 850,364 -> 850,430 -> 500,430 -> 500,486 | (865, 403)
- retry | 386,545 -> 340,545 -> 340,385 -> 440,385 -> 440,349 | (349, 411)
- monitor | 1120,349 -> 1120,466 | (1134, 413)
- healthy | 1006,550 -> 835,550 -> 835,706 | (850, 619)
- unhealthy | 1120,634 -> 1120,706 | (1134, 677)
- restore | 1120,814 -> 1120,860 -> 48,860 -> 48,285 -> 76,285 | (390, 847)

All routes have four-unit endpoint gaps; marker tip is M0 0 L10 5 L0 10 Z, refX=10/refY=5, markerUnits=userSpaceOnUse, markerWidth/Height=8, orient=auto. Draw functional lines behind nodes; do not conceal crossings with a fill. Label baselines sit beside the actual route. All lines are 1.8 units; solid is forward movement, dashed is rework/rollback when present. Include the specified visible legend/caption.

## Native SVG and output

Keep text/tspan, named g groups and semantic IDs editable; use local defs/gradient/pattern/clipPath/marker references. No image, script, event, foreignObject, external resource, font download or proprietary font distribution. Use presentation attributes. Include title/desc, data-node=true with data-bounds in root coordinates, and data-edge=true with data-from/data-to. Put each edge label inside its edge group. This is standard SVG; no JustSVG bindings are required.

Validate XML, IDs, refs, semantic graph equality and geometry. Render at native, 960px and 390px widths; inspect type and arrow tips at native scale and source features at fit scale. Save SVG, this complete prompt, semantic graph and a check record. Technical checks cannot establish brand approval or user aesthetic acceptance.

## Final editable lettering schedule

Text | exact baseline coordinates | typography | local font stack:

- Release with a return path. | x=64, y=83 | size=46, weight=400, anchor=start, fill=#242822 | Georgia, Songti SC, serif
- 发布流程 · 每个判断，都有明确去向 | x=66, y=126 | size=20, weight=400, anchor=start, fill=#565b52 | Arial, Helvetica Neue, PingFang SC, sans-serif
- 01 PREPARE | x=80, y=195 | size=13, weight=600, anchor=start, fill=#565b52 | Arial, Helvetica Neue, PingFang SC, sans-serif
- 02 VERIFY | x=390, y=195 | size=13, weight=600, anchor=start, fill=#565b52 | Arial, Helvetica Neue, PingFang SC, sans-serif
- 03 RELEASE | x=1030, y=195 | size=13, weight=600, anchor=start, fill=#565b52 | Arial, Helvetica Neue, PingFang SC, sans-serif
- pass | x=965, y=270 | size=13, weight=500, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- revise | x=865, y=403 | size=13, weight=500, anchor=start, fill=#80552d | Arial, Helvetica Neue, PingFang SC, sans-serif
- recheck | x=349, y=411 | size=13, weight=500, anchor=start, fill=#80552d | Arial, Helvetica Neue, PingFang SC, sans-serif
- observe | x=1134, y=413 | size=13, weight=500, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- healthy | x=850, y=619 | size=13, weight=500, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- errors | x=1134, y=677 | size=13, weight=500, anchor=start, fill=#80552d | Arial, Helvetica Neue, PingFang SC, sans-serif
- new revision after rollback | x=390, y=847 | size=13, weight=500, anchor=start, fill=#80552d | Arial, Helvetica Neue, PingFang SC, sans-serif
- Change | x=100, y=279 | size=23, weight=600, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- A reviewed revision | x=100, y=308 | size=15, weight=400, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Build & test | x=410, y=264 | size=23, weight=600, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Static + behavior checks | x=410, y=293 | size=15, weight=400, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Ready? | x=850.0, y=280.0 | size=22, weight=600, anchor=middle, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Pass / revise | x=850.0, y=306.0 | size=13, weight=400, anchor=middle, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Canary | x=1050, y=264 | size=23, weight=600, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Small traffic slice | x=1050, y=293 | size=15, weight=400, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Healthy? | x=1120.0, y=545.0 | size=22, weight=600, anchor=middle, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Signals / errors | x=1120.0, y=571.0 | size=13, weight=400, anchor=middle, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Promote | x=740, y=749 | size=23, weight=600, anchor=start, fill=#fffefb | Arial, Helvetica Neue, PingFang SC, sans-serif
- Expand the rollout | x=740, y=778 | size=15, weight=400, anchor=start, fill=#fffefb | Arial, Helvetica Neue, PingFang SC, sans-serif
- Rollback | x=1030, y=749 | size=23, weight=600, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Restore prior version | x=1030, y=778 | size=15, weight=400, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Revise | x=410, y=529 | size=23, weight=600, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Address failed checks | x=410, y=558 | size=15, weight=400, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Forward | x=133, y=908 | size=14, weight=400, anchor=start, fill=#242822 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Revise / rollback | x=323, y=908 | size=14, weight=400, anchor=start, fill=#80552d | Arial, Helvetica Neue, PingFang SC, sans-serif
- Illustrative flow · editable SVG | x=1216, y=908 | size=13, weight=400, anchor=end, fill=#565b52 | Arial, Helvetica Neue, PingFang SC, sans-serif
