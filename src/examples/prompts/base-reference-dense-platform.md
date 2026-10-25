# 多租户 SaaS 平台 · 高信息密度架构 · 技术文档

同图风格变体：保留全部内容、坐标与连接关系，只改变视觉呈现。

以基础风格绘制高信息密度、多租户 SaaS 平台系统架构。五条水平分层带：用户入口、接入边界、业务域、异步集成、数据存储；右侧独立治理运维列。38个命名服务节点、30条代表性依赖。业务域每列两项职责，列宽178px、间距28px，左侧层标签不得进入连线通道。异步、数据访问和治理关系遵循当前风格的图例与线型。保留计费访问缓存、支付事务落库、集成附件存储等跨层连接，走列间或层间专用通道。节点不互相覆盖，交叉但无圆点的线不表示连接。不要为了密度缩小字体。右侧运维能力适用于所有域，只画代表性虚线，省略全连接。

视觉风格：技术文档。按两张参考图片的技术文档样式绘制：近白底#fdfdfd，节点标题居中、黑色粗体700，正文居中深灰；灰色中性节点、浅紫控制组件、浅蓝路径组件、薄荷绿后端、浅黄配置、浅橙网络、浅红告警。节点2px深色语义描边、8px圆角，无阴影。父边界使用6 4彩色虚线和极浅填充，黑/灰/蓝/橙/红/紫直角箭头带简短标签。节点与连线位置保持，文字按此风格居中排版。 系统无衬线。标题28px，节点标题15–17px，正文12–13px，分组、文字基线与列间距严格对齐。画布 1600×1100，viewBox="0 0 1600 1100"。

节点内容与布局 x/y/width/height：
web: Web 控制台 / 浏览器 · 管理操作 | (208,176,178,56) | blue
app: 移动端 App / 终端 · 移动业务 | (414,176,178,56) | blue
admin: 运营管理端 / 租户运营 · 审核 | (620,176,178,56) | blue
openapi: 开放 API / 系统对接 · SDK | (826,176,178,56) | blue
partner: 合作伙伴 / 外部事件 · 回调 | (1032,176,178,56) | blue
web-bff: Web BFF / WAF · 页面聚合 | (208,336,178,60) | slate
app-bff: App BFF / Token · 版本兼容 | (414,336,178,60) | slate
admin-bff: Admin BFF / SSO · 操作授权 | (620,336,178,60) | slate
api-gateway: OpenAPI 网关 / 签名 · 访问限流 | (826,336,178,60) | slate
webhook: Webhook 接入 / 验签 · 事件幂等 | (1032,336,178,60) | slate
identity: 租户与账户 / 组织 · 成员 · 租户 | (208,486,178,60) | purple
catalog: 商品与库存 / 目录 · 库存预留 | (414,486,178,60) | purple
orders: 订单与交易 / 订单状态 · 幂等 | (620,486,178,60) | purple
workflow: 审批工作流 / 状态机 · 审批规则 | (826,486,178,60) | purple
integration: 集成与连接 / 连接器 · Webhook | (1032,486,178,60) | purple
policy: 权限与策略 / RBAC · 策略校验 | (208,574,178,60) | purple
billing: 定价与计费 / 套餐 · 续费 · 账单 | (414,574,178,60) | purple
payment: 支付与结算 / 支付回调 · 对账 | (620,574,178,60) | purple
notification: 通知与任务 / 模板 · 调度 · 投递 | (826,574,178,60) | purple
search: 搜索与索引 / 查询 · 索引管理 | (1032,574,178,60) | purple
events: 事件总线 / Kafka · Topic 隔离 | (208,746,178,60) | amber
scheduler: 任务调度 / 重试 · 延时执行 | (414,746,178,60) | amber
outbox: 事件投递 / Outbox · CDC | (620,746,178,60) | amber
channels: 消息通道 / 邮件 · SMS · Push | (826,746,178,60) | amber
pipeline: 数据管道 / 采集 · 索引更新 | (1032,746,178,60) | amber
postgres: PostgreSQL / 租户隔离 · 事务 | (208,906,178,60) | green
redis: Redis / 缓存 · 分布式锁 | (414,906,178,60) | green
objects: 对象存储 / 附件 · 归档 | (620,906,178,60) | green
analytics: ClickHouse / 事件分析 · 报表 | (826,906,178,60) | green
opensearch: OpenSearch / 全文检索 · 聚合 | (1032,906,178,60) | green
config: 配置与密钥 / 环境配置 · 密钥轮换 | (1310,196,238,66) | slate
telemetry: 可观测性 / 日志 · 指标 · 链路 | (1310,290,238,66) | slate
audit: 审计与合规 / 操作审计 · 留存策略 | (1310,384,238,66) | slate
delivery: 交付与回滚 / CI/CD · 灰度 · 回退 | (1310,478,238,66) | slate
secrets: 运行时安全 / 隔离 · 策略 · 扫描 | (1310,572,238,66) | slate
backup: 备份与恢复 / 恢复演练 · 数据校验 | (1310,666,238,66) | slate
quotas: 配额与成本 / 租户配额 · 资源核算 | (1310,760,238,66) | slate
oncall: 告警与值班 / 分级响应 · 事件复盘 | (1310,854,238,66) | slate

连线关系、类型与折线路径（sync同步、async异步或异常分支、data数据访问、scope治理/观测）：
web → web-bff | sync | 297,236 → 297,332
web-bff → identity | sync | 297,400 → 297,482
identity → policy | sync | 297,550 → 297,570
policy → events | async | 297,638 → 297,742
events → postgres | data | 297,810 → 297,902
app → app-bff | sync | 503,236 → 503,332
app-bff → catalog | sync | 503,400 → 503,482
catalog → billing | sync | 503,550 → 503,570
billing → scheduler | async | 503,638 → 503,742
scheduler → redis | data | 503,810 → 503,902
admin → admin-bff | sync | 709,236 → 709,332
admin-bff → orders | sync | 709,400 → 709,482
orders → payment | sync | 709,550 → 709,570
payment → outbox | async | 709,638 → 709,742
outbox → objects | data | 709,810 → 709,902
openapi → api-gateway | sync | 915,236 → 915,332
api-gateway → workflow | sync | 915,400 → 915,482
workflow → notification | sync | 915,550 → 915,570
notification → channels | async | 915,638 → 915,742
channels → analytics | data | 915,810 → 915,902
partner → webhook | sync | 1121,236 → 1121,332
webhook → integration | sync | 1121,400 → 1121,482
integration → search | sync | 1121,550 → 1121,570
search → pipeline | async | 1121,638 → 1121,742
pipeline → opensearch | data | 1121,810 → 1121,902
billing → redis | data | 596,604 → 606,604 → 606,936 → 596,936
payment → postgres | data | 709,638 → 709,680 → 400,680 → 400,936 → 390,936
integration → objects | data | 1214,516 → 1232,516 → 1232,844 → 812,844 → 812,936 → 802,936
config → webhook | scope | 1306,229 → 1274,229 → 1274,366 → 1214,366
pipeline → telemetry | scope | 1214,776 → 1266,776 → 1266,323 → 1306,323

原生 SVG text/g/rect/path/polyline/defs/marker，唯一ID、节点语义分组及内部引用。每条箭头保留 data-sf-start-node/end-node="#id" 与归一化 data-sf-start-anchor/end-anchor="u v dx dy"，支持移动和继续编辑；端点在边界外4px。源文档按层组织，连线走独立通道，禁止穿过无关节点和文字。不要脚本、foreignObject、图片、外部字体或资源。内容为演示，不代表生产部署或真实性能；只输出完整SVG。
