import { template, node, panel, edge } from './drawing';
export const architectureTemplates = [
  template(
    'three-tier',
    '三层应用架构',
    '技术架构',
    '客户端、业务服务、缓存与数据库的基础布局',
    panel(
      'client-layer',
      '接入层',
      36,
      124,
      216,
      306,
      node('web', 'Web / App', 56, 216, 176, 88, ['页面交互', '请求与状态管理']),
      'blue',
    ) +
      panel(
        'service-layer',
        '业务层',
        292,
        124,
        244,
        306,
        node('api', 'API 服务', 316, 216, 196, 88, ['鉴权、业务规则', '接口与领域逻辑']),
        'purple',
      ) +
      panel(
        'data-layer',
        '数据层',
        576,
        124,
        228,
        306,
        node('database', '业务数据库', 596, 182, 188, 88, ['关系数据与事务'], 'green') +
          node('cache', '缓存', 596, 310, 188, 88, ['热点数据、会话'], 'amber'),
        'green',
      ) +
      edge(
        'web-api',
        [
          [232, 260],
          [316, 260],
        ],
        'HTTPS',
        [274, 246],
      ) +
      edge('api-db', [
        [512, 246],
        [550, 246],
        [550, 226],
        [596, 226],
      ]) +
      edge(
        'api-cache',
        [
          [512, 276],
          [550, 276],
          [550, 354],
          [596, 354],
        ],
        '读写',
        [552, 322],
      ),
  ),
  template(
    'microservices',
    '微服务架构',
    '技术架构',
    '统一入口、独立服务与共享平台能力',
    edge('gateway-auth', [
      [180, 250],
      [210, 250],
      [210, 153],
      [260, 153],
    ]) +
      edge('gateway-order', [
        [180, 250],
        [260, 250],
      ]) +
      edge('gateway-product', [
        [180, 250],
        [210, 250],
        [210, 347],
        [260, 347],
      ]) +
      edge('auth-bus', [
        [436, 153],
        [468, 153],
        [468, 250],
        [500, 250],
      ]) +
      edge('order-bus', [
        [436, 250],
        [500, 250],
      ]) +
      edge('product-bus', [
        [436, 347],
        [468, 347],
        [468, 250],
        [500, 250],
      ]) +
      edge('bus-storage', [
        [644, 250],
        [666, 250],
        [666, 160],
        [690, 160],
      ]) +
      edge('bus-cache', [
        [644, 250],
        [666, 250],
        [666, 340],
        [690, 340],
      ]) +
      node('gateway', 'API 网关', 36, 206, 144, 88, ['路由、限流', '统一鉴权']) +
      node('auth', '身份服务', 260, 110, 176, 86, ['账户与权限'], 'purple') +
      node('order', '订单服务', 260, 207, 176, 86, ['订单与事务'], 'purple') +
      node('product', '商品服务', 260, 304, 176, 86, ['商品与库存'], 'purple') +
      node('bus', '事件总线', 500, 206, 144, 88, ['解耦与通知'], 'amber') +
      node('storage', '业务数据库', 690, 116, 126, 88, ['服务独立存储'], 'green') +
      node('cache', '缓存平台', 690, 296, 126, 88, ['热点与会话'], 'green'),
  ),
  template(
    'rag',
    'RAG 检索增强生成',
    '技术架构',
    '知识入库与在线检索两条链路，连接向量存储和大模型',
    edge('ingest-parse', [
      [180, 165],
      [242, 165],
    ]) +
      edge('parse-embed', [
        [406, 165],
        [468, 165],
      ]) +
      edge('embed-vector', [
        [632, 165],
        [680, 165],
      ]) +
      edge('query-search', [
        [180, 356],
        [242, 356],
      ]) +
      edge(
        'retrieve-vector',
        [
          [324, 312],
          [324, 270],
          [744, 270],
          [744, 209],
        ],
        '相似度检索',
        [542, 258],
      ) +
      edge(
        'search-llm',
        [
          [406, 356],
          [468, 356],
        ],
        '上下文',
        [436, 343],
      ) +
      edge('llm-answer', [
        [632, 356],
        [680, 356],
      ]) +
      node('documents', '知识文档', 36, 122, 144, 86, ['文件与网页'], 'slate') +
      node('parse', '解析与分块', 242, 122, 164, 86, ['清洗、切片'], 'blue') +
      node('embedding', 'Embedding', 468, 122, 164, 86, ['生成文本向量'], 'purple') +
      node('vector-store', '向量数据库', 680, 122, 128, 86, ['向量与元数据'], 'green') +
      node('question', '用户问题', 36, 312, 144, 88, ['查询与对话'], 'slate') +
      node('retriever', '检索与重排', 242, 312, 164, 88, ['召回相关片段'], 'blue') +
      node('llm', '大模型', 468, 312, 164, 88, ['生成有依据回答'], 'purple') +
      node('answer', '回答与引用', 680, 312, 128, 88, ['展示来源'], 'green'),
  ),
  template(
    'event-driven',
    '事件驱动架构',
    '技术架构',
    '生产者、消息通道与独立消费者之间的异步协作',
    edge('producer-one', [
      [244, 174],
      [296, 174],
      [296, 247],
      [346, 247],
    ]) +
      edge('producer-two', [
        [244, 340],
        [296, 340],
        [296, 247],
        [346, 247],
      ]) +
      edge('consumer-one', [
        [494, 247],
        [546, 247],
        [546, 148],
        [596, 148],
      ]) +
      edge('consumer-two', [
        [494, 247],
        [596, 247],
      ]) +
      edge('consumer-three', [
        [494, 247],
        [546, 247],
        [546, 346],
        [596, 346],
      ]) +
      node('app-producer', '业务服务', 56, 130, 188, 88, ['发布领域事件']) +
      node('data-producer', '数据采集', 56, 296, 188, 88, ['上报变化与日志']) +
      node('broker', '消息队列', 346, 203, 148, 88, ['持久化与重试'], 'amber') +
      node('notification', '通知消费者', 596, 104, 188, 88, ['推送、邮件'], 'purple') +
      node('analytics', '分析消费者', 596, 203, 188, 88, ['指标、聚合'], 'purple') +
      node('archive', '归档消费者', 596, 302, 188, 88, ['存储、审计'], 'green'),
  ),
  template(
    'cicd',
    'CI/CD 交付流水线',
    '技术架构',
    '从代码提交到环境交付，保留自动验证和人工门禁',
    edge('git-build', [
      [176, 244],
      [206, 244],
    ]) +
      edge('build-image', [
        [346, 244],
        [376, 244],
      ]) +
      edge('image-stage', [
        [516, 244],
        [546, 244],
      ]) +
      edge('stage-prod', [
        [686, 244],
        [716, 244],
      ]) +
      node('git', '代码仓库', 36, 200, 140, 88, ['提交与评审']) +
      node('build', '构建与测试', 206, 200, 140, 88, ['单元与安全检查'], 'purple') +
      node('registry', '制品仓库', 376, 200, 140, 88, ['版本化镜像'], 'green') +
      node('staging', '预发布环境', 546, 200, 140, 88, ['集成验证'], 'amber') +
      node('production', '生产环境', 716, 200, 140, 88, ['灰度与监控'], 'green') +
      panel(
        'quality-gates',
        '质量门禁',
        206,
        340,
        480,
        100,
        textLines(['测试通过 → 安全检查 → 审批确认 → 可回滚发布'], 226, 408),
      ),
    900,
    500,
  ),
  template(
    'data-platform',
    '数据处理平台',
    '技术架构',
    '数据采集、转换、分层存储与服务输出的基础管道',
    edge('sources-ingest', [
      [190, 247],
      [230, 247],
    ]) +
      edge('ingest-compute', [
        [390, 247],
        [430, 247],
      ]) +
      edge('compute-store', [
        [590, 247],
        [630, 247],
      ]) +
      node('sources', '数据源', 36, 203, 154, 88, ['业务库、日志', '外部接口'], 'slate') +
      node('ingestion', '采集接入', 230, 203, 160, 88, ['批量与实时接入']) +
      node('compute', '计算与转换', 430, 203, 160, 88, ['清洗、校验、聚合'], 'purple') +
      node('warehouse', '数据存储', 630, 203, 174, 88, ['仓库、湖、索引'], 'green') +
      panel(
        'outputs',
        '服务出口',
        230,
        344,
        574,
        100,
        node('bi', '分析报表', 248, 392, 160, 40, [], 'slate') +
          node('api', '数据 API', 438, 392, 160, 40, [], 'slate') +
          node('ml', '模型特征', 628, 392, 158, 40, [], 'slate'),
      ) +
      edge('store-outputs', [
        [717, 291],
        [717, 344],
      ]),
  ),
  template(
    'layered-services',
    '分层服务架构',
    '技术架构',
    '按职责划分接口、应用编排、领域规则与基础设施',
    panel(
      'presentation',
      '接口层',
      76,
      106,
      688,
      76,
      node('http', 'HTTP / RPC', 224, 124, 210, 40, [], 'blue') +
        node('events', '事件入口', 460, 124, 210, 40, [], 'blue'),
      'blue',
    ) +
      panel(
        'application',
        '应用层',
        76,
        202,
        688,
        76,
        node('usecases', '用例编排', 224, 220, 210, 40, [], 'purple') +
          node('transactions', '事务与权限', 460, 220, 210, 40, [], 'purple'),
        'purple',
      ) +
      panel(
        'domain',
        '领域层',
        76,
        298,
        688,
        76,
        node('entities', '实体与规则', 224, 316, 210, 40, [], 'green') +
          node('domain-events', '领域事件', 460, 316, 210, 40, [], 'green'),
        'green',
      ) +
      panel(
        'infrastructure',
        '基础设施',
        76,
        394,
        688,
        76,
        node('repositories', '数据库适配', 224, 412, 210, 40, [], 'slate') +
          node('integrations', '外部服务', 460, 412, 210, 40, [], 'slate'),
        'slate',
      ) +
      edge('layer-one', [
        [190, 182],
        [190, 202],
      ]) +
      edge('layer-two', [
        [190, 278],
        [190, 298],
      ]) +
      edge('layer-three', [
        [190, 374],
        [190, 394],
      ]),
  ),
  template(
    'observability',
    '可观测性架构',
    '技术架构',
    '统一采集日志、指标与链路，并形成告警反馈',
    edge(
      'service-collector',
      [
        [230, 250],
        [300, 250],
      ],
      '遥测',
      [265, 238],
    ) +
      edge('collector-logs', [
        [480, 250],
        [530, 250],
        [530, 143],
        [580, 143],
      ]) +
      edge('collector-metrics', [
        [480, 250],
        [580, 250],
      ]) +
      edge('collector-traces', [
        [480, 250],
        [530, 250],
        [530, 357],
        [580, 357],
      ]) +
      node('services', '应用与基础设施', 40, 206, 190, 88, ['服务、主机、容器'], 'blue') +
      node('collector', '遥测采集器', 300, 206, 180, 88, ['OpenTelemetry'], 'purple') +
      node('logs', '日志', 580, 100, 220, 86, ['查询与审计'], 'green') +
      node('metrics', '指标', 580, 207, 220, 86, ['看板与告警'], 'amber') +
      node('traces', '调用链', 580, 314, 220, 86, ['耗时与依赖'], 'green'),
  ),
];
function textLines(lines: string[], x: number, y: number) {
  return lines
    .map((line) => `<text x="${x}" y="${y}" font-size="14" fill="#475569">${line}</text>`)
    .join('');
}
