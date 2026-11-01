# An order becomes an event. — full generation prompt

Create a complete editable native SVG diagram for a technical reader. English labels with a Chinese subtitle. This is an illustrative system, not a claim about a real company's production architecture.

## Purpose and exact content

事件驱动订单架构 · 一次请求，多路处理

Nodes (ID | exact title | exact detail):

- client | Client | Creates an order
- api | Order API | Validates the request
- database | Order store | Durable order record
- outbox | Outbox | Pending domain events
- broker | Event broker | Fan-out to subscribers
- mail | Notification | Sends a receipt
- audit | Audit | Appends event log

Directed relations (IDs and branch meanings must be preserved):

- create | client -> api | POST /orders
- persist | api -> database | write
- enqueue | api -> outbox | event
- publish | outbox -> broker | publish
- notify | broker -> mail | notify
- record | broker -> audit | record

## Source and visual rules

Primary visual surface: OpenAI Developers Blog, https://developers.openai.com/blog ; specifically “Designing failover across OpenAI model providers” cover, https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp . Valid project screenshot/DOM evidence observed 2026-10-25 and inspected for this trial 2026-10-26. Historical local evidence is described in references/style-calibration.md; no fresh-live-page or official diagram standard claim is made. The package redistributes neither the cover nor proprietary fonts. Non-official inspiration; this order architecture is unrelated to OpenAI's actual system.

Composition: centered editorial header above one warm scene; request enters from left, a taller API is the first focus, storage is upper-right, a larger broker is middle-right, consumers terminate low-right and low-left. Scale: API/broker titles 29, supporting titles 22–23, details 15, route labels 13, header 36. Shapes: rounded translucent planes with distinct original code, record, queue, envelope and ledger glyphs, not a traced brand logo. Material: white plane fill opacity .22, thin white outlines; coral fields concentrate upper-middle and lower-right, cream stays lower-left, warm pink upper-right. Native gradients and light stipple approximate atmosphere rather than raster grain. Deep wine #421d2b node text and darker #351825 route labels/arrows are deliberate readability adaptations. Linework is precise and light; corner arc families are decoration. Rhythm: unequal focal planes with clear 60–160 unit route corridors. Footer: “Illustrative architecture · non-official visual study · native editable SVG”. The order/outbox relationship is simplified; do not imply atomic writes, guaranteed delivery or complete retry behavior.

## Final layout and routes

Use width=1200, height=820, viewBox="0 0 1200 820". All coordinates are root user units. Font stack: Arial, Helvetica Neue, PingFang SC, sans-serif. Node allocations (ID | x y width height):

- client | 90 260 180 100
- api | 360 235 240 150
- database | 760 240 300 110
- outbox | 360 455 240 110
- broker | 760 435 300 150
- mail | 760 635 300 90
- audit | 90 485 180 100

Routes (edge ID | ordered points | label baseline x,y):

- create | 274,310 -> 356,310 | (278, 296)
- persist | 604,295 -> 756,295 | (660, 280)
- enqueue | 480,389 -> 480,451 | (492, 425)
- publish | 604,510 -> 756,510 | (650, 496)
- notify | 910,589 -> 910,631 | (925, 616)
- record | 756,545 -> 680,545 -> 680,610 -> 180,610 -> 180,589 | (465, 600)

All routes have four-unit endpoint gaps; marker tip is M0 0 L10 5 L0 10 Z, refX=10/refY=5, markerUnits=userSpaceOnUse, markerWidth/Height=8, orient=auto. Draw functional lines behind nodes; do not conceal crossings with a fill. Label baselines sit beside the actual route. All lines are 1.8 units; solid is forward movement, dashed is rework/rollback when present. Include the specified visible legend/caption.

## Native SVG and output

Keep text/tspan, named g groups and semantic IDs editable; use local defs/gradient/pattern/clipPath/marker references. No image, script, event, foreignObject, external resource, font download or proprietary font distribution. Use presentation attributes. Include title/desc, data-node=true with data-bounds in root coordinates, and data-edge=true with data-from/data-to. Put each edge label inside its edge group. This is standard SVG; no JustSVG bindings are required.

Validate XML, IDs, refs, semantic graph equality and geometry. Render at native, 960px and 390px widths; inspect type and arrow tips at native scale and source features at fit scale. Save SVG, this complete prompt, semantic graph and a check record. Technical checks cannot establish brand approval or user aesthetic acceptance.

## Final editable lettering schedule

Text | exact baseline coordinates | typography | local font stack:

- An order becomes an event. | x=600, y=70 | size=36, weight=600, anchor=middle, fill=#181818 | Arial, Helvetica Neue, PingFang SC, sans-serif
- 事件驱动订单架构 · 一次请求，多路处理 | x=600, y=109 | size=19, weight=400, anchor=middle, fill=#5d5d5d | Arial, Helvetica Neue, PingFang SC, sans-serif
- POST /orders | x=278, y=296 | size=13, weight=500, anchor=start, fill=#351825 | Arial, Helvetica Neue, PingFang SC, sans-serif
- write | x=660, y=280 | size=13, weight=500, anchor=start, fill=#351825 | Arial, Helvetica Neue, PingFang SC, sans-serif
- event | x=492, y=425 | size=13, weight=500, anchor=start, fill=#351825 | Arial, Helvetica Neue, PingFang SC, sans-serif
- publish | x=650, y=496 | size=13, weight=500, anchor=start, fill=#351825 | Arial, Helvetica Neue, PingFang SC, sans-serif
- notify | x=925, y=616 | size=13, weight=500, anchor=start, fill=#351825 | Arial, Helvetica Neue, PingFang SC, sans-serif
- record | x=465, y=600 | size=13, weight=500, anchor=start, fill=#351825 | Arial, Helvetica Neue, PingFang SC, sans-serif
- Client | x=160, y=302 | size=22, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Creates an order | x=112, y=340 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Order API | x=382, y=329 | size=29, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Validates the request | x=382, y=360 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Order store | x=830, y=282 | size=23, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Durable order record | x=782, y=330 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Outbox | x=430, y=497 | size=23, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Pending domain events | x=382, y=545 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Event broker | x=782, y=529 | size=29, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Fan-out to subscribers | x=782, y=560 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Notification | x=830, y=677 | size=23, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Sends a receipt | x=782, y=705 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Audit | x=160, y=527 | size=22, weight=600, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Appends event log | x=112, y=565 | size=15, weight=400, anchor=start, fill=#421d2b | Arial, Helvetica Neue, PingFang SC, sans-serif
- Illustrative architecture · non-official visual study · native editable SVG | x=48, y=794 | size=13, weight=400, anchor=start, fill=#58323e | Arial, Helvetica Neue, PingFang SC, sans-serif
