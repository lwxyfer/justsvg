import { template, node, panel, edge, text, rect } from './drawing';
export const componentTemplates = [
  template(
    'service-card',
    '服务信息卡片',
    '可复用组件',
    '服务职责、接口、依赖与负责人信息',
    panel(
      'service',
      '订单服务',
      24,
      24,
      432,
      252,
      text('职责：创建、查询与管理订单', 44, 104, 15) +
        text('接口：HTTP / RPC', 44, 144, 14) +
        text('依赖：数据库 / 消息队列', 44, 180, 14) +
        rect(44, 212, 392, 42, '#eff6ff', 'none', 4) +
        text('负责人：待填写    ·    运行环境：待填写', 56, 239, 13, '#1d4ed8'),
      'blue',
    ),
    480,
    300,
    false,
  ),
  template(
    'node-link',
    '双节点连接',
    '可复用组件',
    '两个业务节点与带标签的连接线',
    edge(
      'connection',
      [
        [212, 138],
        [388, 138],
      ],
      '调用 / 数据流',
      [300, 123],
    ) +
      node('source', '上游服务', 24, 94, 188, 88, ['填写职责与接口']) +
      node('target', '下游服务', 388, 94, 188, 88, ['填写职责与接口'], 'green'),
    600,
    276,
    false,
  ),
  template(
    'cluster',
    '服务集群容器',
    '可复用组件',
    '包含三个实例的可复用服务边界',
    panel(
      'cluster',
      '服务集群 / 命名空间',
      24,
      24,
      552,
      228,
      node('replica-one', '实例 A', 44, 100, 152, 88, ['副本 / 可用区'], 'blue') +
        node('replica-two', '实例 B', 224, 100, 152, 88, ['副本 / 可用区'], 'blue') +
        node('replica-three', '实例 C', 404, 100, 152, 88, ['副本 / 可用区'], 'blue') +
        text('扩缩容策略与健康检查：待填写', 44, 230, 13, '#64748b'),
    ),
    600,
    276,
    false,
  ),
  template(
    'legend',
    '图例与状态说明',
    '可复用组件',
    '统一图表中的状态、颜色和连线含义',
    panel(
      'legend',
      '图例',
      24,
      24,
      432,
      292,
      ['业务节点', '数据存储', '待确认 / 风险']
        .map(
          (title, i) =>
            `<g id="state-${i}" data-label="${title}">${rect(48, 88 + i * 42, 24, 24, ['#eff6ff', '#ecfdf5', '#fffbeb'][i], ['#93b4ef', '#80c5ad', '#ddbd79'][i], 4)}${text(title, 88, 106 + i * 42, 14)}</g>`,
        )
        .join('') +
        edge('sync', [
          [48, 240],
          [150, 240],
        ]) +
        text('同步调用 / 数据流', 178, 245, 13) +
        edge(
          'async',
          [
            [48, 282],
            [150, 282],
          ],
          '',
          undefined,
          true,
        ) +
        text('异步事件 / 反馈', 178, 287, 13),
    ),
    480,
    340,
    false,
  ),
];
