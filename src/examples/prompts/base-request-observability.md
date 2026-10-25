# 请求生命周期 · 可观测性信息图 · 标准基础

同图风格变体：保留全部内容、坐标与连接关系，只改变视觉呈现。

技术信息图应由三种结构组成：顶部六阶段请求链路，左下观测信号字段矩阵，右下三条实施约束。矩阵展示Trace/Metrics/Logs的示例字段与用途，不展示虚构延迟或可用率。阶段沿用当前风格的语义视觉规则，正文和字段保持水平基线。信息密度来自清晰的表格与职责解释，不使用装饰性大数字。所有文字仍为可编辑text。

视觉风格：标准基础。白底、语义浅色节点、白色分组、1.4px细边框、8px圆角。蓝/紫/绿/琥珀表示节点职责，保持基础图原有视觉。 系统无衬线。标题28px，节点标题15–17px，正文12–13px，分组、文字基线与列间距严格对齐。画布 1400×900，viewBox="0 0 1400 900"。

节点内容与布局 x/y/width/height：
client: 客户端 / 发起请求 · 关联标识 | (50,194,190,100) | blue
ingress: 接入网关 / 路由 · 限流 · 记录入口 | (270,194,190,100) | blue
auth: 身份鉴权 / 校验令牌 · 授权策略 | (490,194,190,100) | purple
service: 业务服务 / 规则执行 · 服务调用 | (710,194,190,100) | purple
store: 数据访问 / 查询 · 缓存 · 事务 | (930,194,190,100) | green
response: 响应输出 / 状态码 · 返回业务结果 | (1150,194,190,100) | green
trace: Trace / 链路 / trace_id · span_id；定位请求耗时与依赖 | (48,482,628,60) | slate
metrics: Metrics / 指标 / count · errors · latency；按服务聚合趋势与告警 | (48,558,628,60) | slate
logs: Logs / 日志 / request_id · error_code；补充错误与业务上下文 | (48,634,628,60) | slate
sampling: 采样策略 / 关键路径优先，采样比例按排障需求与成本决定。 | (748,452,600,72) | blue
correlation: 关联与脱敏 / 统一标识关联信号，避免记录敏感字段与完整载荷。 | (748,544,600,72) | purple
retention: 保留与告警 / 按用途配置保留周期；阈值依据实际服务目标确定。 | (748,636,600,72) | green

连线关系、类型与折线路径（sync同步、async异步或异常分支、data数据访问、scope治理/观测）：
client → ingress | sync | 244,244 → 266,244
ingress → auth | sync | 464,244 → 486,244
auth → service | sync | 684,244 → 706,244
service → store | sync | 904,244 → 926,244
store → response | sync | 1124,244 → 1146,244

原生 SVG text/g/rect/path/polyline/defs/marker，唯一ID、节点语义分组及内部引用。每条箭头保留 data-sf-start-node/end-node="#id" 与归一化 data-sf-start-anchor/end-anchor="u v dx dy"，支持移动和继续编辑；端点在边界外4px。源文档按层组织，连线走独立通道，禁止穿过无关节点和文字。不要脚本、foreignObject、图片、外部字体或资源。内容为演示，不代表生产部署或真实性能；只输出完整SVG。
