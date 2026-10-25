# 三层业务系统 · 基础架构 · 标准基础

同图风格变体：保留全部内容、坐标与连接关系，只改变视觉呈现。

从基础组合图演变为三层业务系统架构。三层横向容器：访问入口、业务服务、数据支撑；各层三节点，列基线统一。主调用从上向下，订单到事务库、账户到会话缓存为跨列连接，走层间空白通道。底部一条共享支撑说明列出可观测性、配置密钥与交付回滚，不将这些能力误画成业务请求链。

视觉风格：标准基础。白底、语义浅色节点、白色分组、1.4px细边框、8px圆角。蓝/紫/绿/琥珀表示节点职责，保持基础图原有视觉。 系统无衬线。标题28px，节点标题15–17px，正文12–13px，分组、文字基线与列间距严格对齐。画布 1200×800，viewBox="0 0 1200 800"。

节点内容与布局 x/y/width/height：
web: Web / App / 页面交互 · 客户请求 | (220,166,280,80) | blue
admin: 管理后台 / 运营操作 · 权限入口 | (540,166,280,80) | blue
api: 开放 API / 外部集成 · 接口访问 | (860,166,280,80) | blue
identity: 账户服务 / 组织与成员 · 鉴权 | (220,350,280,80) | purple
orders: 订单服务 / 订单状态 · 交易规则 | (540,350,280,80) | purple
workflow: 流程服务 / 任务编排 · 审批 | (860,350,280,80) | purple
postgres: PostgreSQL / 事务与持久化 | (220,534,280,80) | green
redis: Redis / 会话与热点缓存 | (540,534,280,80) | green
objects: 对象存储 / 文件与业务附件 | (860,534,280,80) | green

连线关系、类型与折线路径（sync同步、async异步或异常分支、data数据访问、scope治理/观测）：
web → identity | sync | 360,250 → 360,346
identity → postgres | data | 360,434 → 360,530
admin → orders | sync | 680,250 → 680,346
orders → redis | data | 680,434 → 680,530
api → workflow | sync | 1000,250 → 1000,346
workflow → objects | data | 1000,434 → 1000,530
orders → postgres | data | 680,434 → 680,480 → 360,480 → 360,530
identity → redis | data | 504,390 → 514,390 → 514,488 → 680,488 → 680,530

原生 SVG text/g/rect/path/polyline/defs/marker，唯一ID、节点语义分组及内部引用。每条箭头保留 data-sf-start-node/end-node="#id" 与归一化 data-sf-start-anchor/end-anchor="u v dx dy"，支持移动和继续编辑；端点在边界外4px。源文档按层组织，连线走独立通道，禁止穿过无关节点和文字。不要脚本、foreignObject、图片、外部字体或资源。内容为演示，不代表生产部署或真实性能；只输出完整SVG。
