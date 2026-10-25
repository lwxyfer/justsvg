import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseStyleThemes } from './base-style-themes.mjs';

// Extend the incumbent base template vocabulary: white, semantic pale fills, fine borders.
// Native SVG and named groups remain the artifact; no raster or external dependencies.
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../src/examples');
let activeTheme = 'standard';
const theme = () => baseStyleThemes[activeTheme];
const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const tag = (name, attrs, children = null) =>
  `<${name}${Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${esc(k === 'fill' || k === 'stroke' ? theme().colors[v] || v : v)}"`)
    .join('')}${children === null ? '/>' : `>${children}</${name}>`}`;
const rect = (x, y, width, height, fill = '#fff', stroke = '#cbd5e1', rx = 8, frame = false) =>
  tag('rect', {
    x,
    y,
    width,
    height,
    fill,
    stroke: frame && activeTheme === 'zone' ? 'none' : stroke,
    rx: rx ? theme().radius : 0,
    'stroke-width': theme().stroke,
    ...(frame && (activeTheme === 'wire' || activeTheme === 'reference')
      ? { 'stroke-dasharray': activeTheme === 'reference' ? '6 4' : '7 5' }
      : {}),
  });
const text = (s, x, y, size = 14, fill = '#334155', weight = 400, anchor = 'start') =>
  tag(
    'text',
    { x, y, 'font-size': size, fill, 'font-weight': weight, 'text-anchor': anchor },
    esc(s),
  );
function document(slug, title, subtitle, width, height) {
  if (activeTheme !== 'standard') slug = slug.replace(/^base-/, `base-${activeTheme}-`);
  const nodes = new Map(),
    panels = [],
    links = [],
    connections = [];
  const id = (key) => `${slug}-node-${key}`;
  const card = (key, title, x, y, w, h, body = [], tone = 'blue', diamond = false) => {
    const [fill, line, ink] = theme().nodes[tone];
    const shape = diamond
      ? rect(x, y, w, h, 'none', 'none', 0) +
        tag('path', {
          d: `M${x + w / 2} ${y}L${x + w} ${y + h / 2} ${x + w / 2} ${y + h} ${x} ${y + h / 2}Z`,
          fill,
          stroke: line,
          'stroke-width': theme().stroke,
        })
      : rect(x, y, w, h, fill, line);
    const labels = diamond
      ? text(title, x + w / 2, y + h / 2 + 5, 14, ink, 600, 'middle')
      : text(
          title,
          activeTheme === 'reference' ? x + w / 2 : x + 14,
          y + (h <= 60 ? 22 : 28),
          activeTheme === 'reference' ? 17 : h <= 60 ? 15 : 17,
          ink,
          activeTheme === 'reference' ? 700 : 600,
          activeTheme === 'reference' ? 'middle' : 'start',
        ) +
        body
          .map((s, i) =>
            text(
              s,
              activeTheme === 'reference' ? x + w / 2 : x + 14,
              y + (h <= 60 ? 43 : 52) + i * 18,
              activeTheme === 'reference' ? 13 : h <= 60 ? 12 : 13,
              '#475569',
              400,
              activeTheme === 'reference' ? 'middle' : 'start',
            ),
          )
          .join('');
    const svg = tag('g', { id: id(key), 'data-node': 'true', 'data-label': title }, shape + labels);
    nodes.set(key, { x, y, w, h, svg, title, body, tone });
    return svg;
  };
  const panel = (key, title, x, y, w, h, children, tone = 'slate', detail = '') => {
    tone = { lifecycle: 'blue', signals: 'purple', constraints: 'green' }[key] || tone;
    const [, line, ink] = theme().nodes[tone];
    panels.push(
      tag(
        'g',
        { id: `${slug}-layer-${key}`, 'data-label': title },
        rect(x, y, w, h, theme().groups[tone] || theme().panel, line, 8, true) +
          text(title, x + 16, y + 29, 15, ink, 600) +
          (detail ? text(detail, x + 16, y + 49, 12, '#64748b') : '') +
          children,
      ),
    );
  };
  const band = (key, title, detail, y, h, children) => {
    const tone = {
      clients: 'blue',
      edge: 'slate',
      domains: 'purple',
      async: 'amber',
      storage: 'green',
    }[key];
    panels.push(
      tag(
        'g',
        { id: `${slug}-layer-${key}`, 'data-label': title },
        rect(
          32,
          y,
          1224,
          h,
          theme().groups[tone] || theme().band,
          activeTheme === 'reference' ? theme().nodes[tone][1] : '#dce4ee',
          8,
          true,
        ) +
          text(
            title,
            48,
            y + 37,
            16,
            activeTheme === 'reference' ? theme().nodes[tone][1] : '#334155',
            600,
          ) +
          text(detail, 48, y + 59, 12, '#64748b') +
          tag('path', { d: `M184 ${y + 16}V${y + h - 16}`, fill: 'none', stroke: '#e2e8f0' }) +
          children,
      ),
    );
  };
  const port = (key, side) => {
    const n = nodes.get(key);
    return side === 'top'
      ? [n.x + n.w / 2, n.y - 4]
      : side === 'bottom'
        ? [n.x + n.w / 2, n.y + n.h + 4]
        : side === 'left'
          ? [n.x - 4, n.y + n.h / 2]
          : [n.x + n.w + 4, n.y + n.h / 2];
  };
  const edge = (key, a, b, points, kind = 'sync', label = '', labelAt) => {
    connections.push({ a, b, points, kind, label });
    const color =
      kind === 'async'
        ? '#a16207'
        : kind === 'data'
          ? '#047857'
          : kind === 'scope'
            ? '#64748b'
            : '#647f9e';
    const anchor = (node, p) => {
      const n = nodes.get(node),
        u = Math.min(1, Math.max(0, (p[0] - n.x) / n.w)),
        v = Math.min(1, Math.max(0, (p[1] - n.y) / n.h));
      return `${u.toFixed(6)} ${v.toFixed(6)} ${(p[0] - n.x - n.w * u).toFixed(2)} ${(p[1] - n.y - n.h * v).toFixed(2)}`;
    };
    const edgeId = `${slug}-edge-${key}`;
    links.push(
      tag(
        'g',
        { 'data-label': label || `${a} → ${b}` },
        tag('polyline', {
          id: edgeId,
          points: points.map((p) => p.join(',')).join(' '),
          fill: 'none',
          stroke: color,
          'stroke-width': activeTheme === 'wire' ? (kind === 'data' ? 2.2 : 1.4) : 1.8,
          'stroke-linejoin': 'round',
          'marker-end': `url(#${slug}-arrow-${kind})`,
          ...(kind === 'async' || kind === 'scope'
            ? { 'stroke-dasharray': activeTheme === 'wire' && kind === 'scope' ? '2 4' : '6 4' }
            : {}),
          'data-sf-start-node': `#${id(a)}`,
          'data-sf-end-node': `#${id(b)}`,
          'data-sf-start-anchor': anchor(a, points[0]),
          'data-sf-end-anchor': anchor(b, points.at(-1)),
        }) +
          (label
            ? tag(
                'g',
                { 'data-sf-label-for': `#${edgeId}` },
                text(label, ...labelAt, 12, color, 400, 'middle'),
              )
            : ''),
      ),
    );
  };
  const legend = (entries) =>
    entries
      .map(([label, kind], i) => {
        const x = 40 + i * 230,
          color =
            kind === 'async'
              ? '#a16207'
              : kind === 'data'
                ? '#047857'
                : kind === 'scope'
                  ? '#64748b'
                  : '#647f9e';
        return (
          tag('path', {
            d: `M${x} 106h36`,
            fill: 'none',
            stroke: color,
            'stroke-width': activeTheme === 'wire' ? (kind === 'data' ? 2.2 : 1.4) : 1.8,
            ...(kind === 'async' || kind === 'scope'
              ? { 'stroke-dasharray': activeTheme === 'wire' && kind === 'scope' ? '2 4' : '6 4' }
              : {}),
          }) + text(label, x + 46, 110, 12, '#475569')
        );
      })
      .join('');
  const finish = (
    prompt,
    extra = '',
    legendEntries = [
      ['同步调用', 'sync'],
      ['异步事件', 'async'],
      ['数据访问', 'data'],
    ],
  ) => {
    const defs = ['sync', 'async', 'data', 'scope']
      .map((kind) =>
        tag(
          'marker',
          {
            id: `${slug}-arrow-${kind}`,
            viewBox: '0 0 10 10',
            refX: 9,
            refY: 5,
            markerWidth: 6,
            markerHeight: 6,
            orient: 'auto-start-reverse',
          },
          tag('path', {
            d: 'M0 0L10 5L0 10Z',
            fill:
              kind === 'async'
                ? '#a16207'
                : kind === 'data'
                  ? '#047857'
                  : kind === 'scope'
                    ? '#64748b'
                    : '#647f9e',
          }),
        ),
      )
      .join('');
    const svg = tag(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        'font-family': 'Arial, PingFang SC, sans-serif',
        'data-visual-style': activeTheme,
      },
      tag('title', {}, esc(title)) +
        tag('desc', {}, esc(subtitle)) +
        tag('defs', {}, defs) +
        rect(0, 0, width, height, '#fff', 'none', 0) +
        text(title, 40, 48, 28, '#0f172a', 700) +
        text(subtitle, 40, 78, 13, '#64748b') +
        legend(legendEntries) +
        panels.join('') +
        links.join('') +
        extra,
    );
    const structure = [...nodes]
      .map(
        ([key, n]) =>
          `${key}: ${n.title} / ${n.body.join('；')} | (${n.x},${n.y},${n.w},${n.h}) | ${n.tone}`,
      )
      .join('\n');
    const relations = connections
      .map(
        ({ a, b, points, kind, label }) =>
          `${a} → ${b} | ${kind}${label ? ` / ${label}` : ''} | ${points.map((p) => p.join(',')).join(' → ')}`,
      )
      .join('\n');
    writeFileSync(resolve(output, `assets/${slug}.svg`), svg + '\n');
    writeFileSync(
      resolve(output, `prompts/${slug}.md`),
      `# ${title} · ${theme().name}\n\n同图风格变体：保留全部内容、坐标与连接关系，只改变视觉呈现。\n\n${prompt}\n\n视觉风格：${theme().name}。${theme().rules} 系统无衬线。标题28px，节点标题15–17px，正文12–13px，分组、文字基线与列间距严格对齐。画布 ${width}×${height}，viewBox="0 0 ${width} ${height}"。\n\n节点内容与布局 x/y/width/height：\n${structure}\n\n连线关系、类型与折线路径（sync同步、async异步或异常分支、data数据访问、scope治理/观测）：\n${relations}\n\n原生 SVG text/g/rect/path/polyline/defs/marker，唯一ID、节点语义分组及内部引用。每条箭头保留 data-sf-start-node/end-node="#id" 与归一化 data-sf-start-anchor/end-anchor="u v dx dy"，支持移动和继续编辑；端点在边界外4px。源文档按层组织，连线走独立通道，禁止穿过无关节点和文字。不要脚本、foreignObject、图片、外部字体或资源。内容为演示，不代表生产部署或真实性能；只输出完整SVG。\n`,
    );
    console.log(`${slug}: ${nodes.size} nodes, ${links.length} bound connectors`);
  };
  return { nodes, card, panel, band, port, edge, finish, nodeId: id };
}

function denseArchitecture() {
  const d = document(
    'base-dense-platform',
    '多租户 SaaS 平台 · 高信息密度架构',
    '示意架构 · 代表性依赖与跨层调用，非完整生产部署或容量指标',
    1600,
    1100,
  );
  const xs = [208, 414, 620, 826, 1032];
  const layer = (keys, titles, bodies, y, h, tone) =>
    keys.map((key, i) => d.card(key, titles[i], xs[i], y, 178, h, [bodies[i]], tone)).join('');
  const clients = ['web', 'app', 'admin', 'openapi', 'partner'];
  d.band(
    'clients',
    '用户入口',
    '5 类访问端',
    130,
    130,
    layer(
      clients,
      ['Web 控制台', '移动端 App', '运营管理端', '开放 API', '合作伙伴'],
      [
        '浏览器 · 管理操作',
        '终端 · 移动业务',
        '租户运营 · 审核',
        '系统对接 · SDK',
        '外部事件 · 回调',
      ],
      176,
      56,
      'blue',
    ),
  );
  const gateways = ['web-bff', 'app-bff', 'admin-bff', 'api-gateway', 'webhook'];
  d.band(
    'edge',
    '接入与边界',
    '聚合 · 鉴权 · 限流',
    290,
    130,
    layer(
      gateways,
      ['Web BFF', 'App BFF', 'Admin BFF', 'OpenAPI 网关', 'Webhook 接入'],
      [
        'WAF · 页面聚合',
        'Token · 版本兼容',
        'SSO · 操作授权',
        '签名 · 访问限流',
        '验签 · 事件幂等',
      ],
      336,
      60,
      'slate',
    ),
  );
  const services = ['identity', 'catalog', 'orders', 'workflow', 'integration'],
    secondary = ['policy', 'billing', 'payment', 'notification', 'search'];
  d.band(
    'domains',
    '业务域',
    '5 个域 · 10 个服务',
    450,
    210,
    layer(
      services,
      ['租户与账户', '商品与库存', '订单与交易', '审批工作流', '集成与连接'],
      [
        '组织 · 成员 · 租户',
        '目录 · 库存预留',
        '订单状态 · 幂等',
        '状态机 · 审批规则',
        '连接器 · Webhook',
      ],
      486,
      60,
      'purple',
    ) +
      layer(
        secondary,
        ['权限与策略', '定价与计费', '支付与结算', '通知与任务', '搜索与索引'],
        [
          'RBAC · 策略校验',
          '套餐 · 续费 · 账单',
          '支付回调 · 对账',
          '模板 · 调度 · 投递',
          '查询 · 索引管理',
        ],
        574,
        60,
        'purple',
      ),
  );
  const async = ['events', 'scheduler', 'outbox', 'channels', 'pipeline'];
  d.band(
    'async',
    '异步与集成',
    '事件 · 任务 · 数据管道',
    700,
    130,
    layer(
      async,
      ['事件总线', '任务调度', '事件投递', '消息通道', '数据管道'],
      [
        'Kafka · Topic 隔离',
        '重试 · 延时执行',
        'Outbox · CDC',
        '邮件 · SMS · Push',
        '采集 · 索引更新',
      ],
      746,
      60,
      'amber',
    ),
  );
  const data = ['postgres', 'redis', 'objects', 'analytics', 'opensearch'];
  d.band(
    'storage',
    '数据存储',
    '按职责选择持久化',
    860,
    130,
    layer(
      data,
      ['PostgreSQL', 'Redis', '对象存储', 'ClickHouse', 'OpenSearch'],
      ['租户隔离 · 事务', '缓存 · 分布式锁', '附件 · 归档', '事件分析 · 报表', '全文检索 · 聚合'],
      906,
      60,
      'green',
    ),
  );
  const ops = [
    ['config', '配置与密钥', '环境配置 · 密钥轮换'],
    ['telemetry', '可观测性', '日志 · 指标 · 链路'],
    ['audit', '审计与合规', '操作审计 · 留存策略'],
    ['delivery', '交付与回滚', 'CI/CD · 灰度 · 回退'],
    ['secrets', '运行时安全', '隔离 · 策略 · 扫描'],
    ['backup', '备份与恢复', '恢复演练 · 数据校验'],
    ['quotas', '配额与成本', '租户配额 · 资源核算'],
    ['oncall', '告警与值班', '分级响应 · 事件复盘'],
  ];
  d.panel(
    'governance',
    '治理与运维',
    1290,
    130,
    278,
    860,
    ops
      .map(([key, title, body], i) =>
        d.card(key, title, 1310, 196 + i * 94, 238, 66, [body], 'slate'),
      )
      .join(''),
    'slate',
    '共享能力 · 跨业务域适用',
  );
  for (let i = 0; i < 5; i++) {
    d.edge(`entry-${i}`, clients[i], gateways[i], [
      d.port(clients[i], 'bottom'),
      d.port(gateways[i], 'top'),
    ]);
    d.edge(`request-${i}`, gateways[i], services[i], [
      d.port(gateways[i], 'bottom'),
      d.port(services[i], 'top'),
    ]);
    d.edge(`domain-${i}`, services[i], secondary[i], [
      d.port(services[i], 'bottom'),
      d.port(secondary[i], 'top'),
    ]);
    d.edge(
      `event-${i}`,
      secondary[i],
      async[i],
      [d.port(secondary[i], 'bottom'), d.port(async[i], 'top')],
      'async',
    );
    d.edge(
      `persist-${i}`,
      async[i],
      data[i],
      [d.port(async[i], 'bottom'), d.port(data[i], 'top')],
      'data',
    );
  }
  d.edge(
    'cache-read',
    'billing',
    'redis',
    [d.port('billing', 'right'), [606, 604], [606, 936], d.port('redis', 'right')],
    'data',
  );
  d.edge(
    'transaction',
    'payment',
    'postgres',
    [d.port('payment', 'bottom'), [709, 680], [400, 680], [400, 936], d.port('postgres', 'right')],
    'data',
  );
  d.edge(
    'attachments',
    'integration',
    'objects',
    [
      d.port('integration', 'right'),
      [1232, 516],
      [1232, 844],
      [812, 844],
      [812, 936],
      d.port('objects', 'right'),
    ],
    'data',
  );
  d.edge(
    'policy-scope',
    'config',
    'webhook',
    [d.port('config', 'left'), [1274, 229], [1274, 366], d.port('webhook', 'right')],
    'scope',
  );
  d.edge(
    'telemetry',
    'pipeline',
    'telemetry',
    [d.port('pipeline', 'right'), [1266, 776], [1266, 323], d.port('telemetry', 'left')],
    'scope',
  );
  d.finish(
    '以基础风格绘制高信息密度、多租户 SaaS 平台系统架构。五条水平分层带：用户入口、接入边界、业务域、异步集成、数据存储；右侧独立治理运维列。38个命名服务节点、30条代表性依赖。业务域每列两项职责，列宽178px、间距28px，左侧层标签不得进入连线通道。异步、数据访问和治理关系遵循当前风格的图例与线型。保留计费访问缓存、支付事务落库、集成附件存储等跨层连接，走列间或层间专用通道。节点不互相覆盖，交叉但无圆点的线不表示连接。不要为了密度缩小字体。右侧运维能力适用于所有域，只画代表性虚线，省略全连接。',
    text('阅读：从上到下看分层，从左到右看职责；右列为共享治理能力。', 40, 1032, 13, '#475569') +
      text(
        '连线只展示代表性依赖；交叉无圆点表示不连接。具体隔离、容灾与安全方案需按系统约束设计。',
        40,
        1060,
        13,
        '#64748b',
      ),
    [
      ['同步调用', 'sync'],
      ['异步事件', 'async'],
      ['数据访问', 'data'],
      ['治理 / 观测', 'scope'],
    ],
  );
}

function layeredArchitecture() {
  const d = document(
    'base-layered-platform',
    '三层业务系统 · 基础架构',
    '基础分层演变 · 访问端、业务服务与数据职责，选取代表性调用',
    1200,
    800,
  );
  const xs = [220, 540, 860],
    keys = [
      ['web', 'admin', 'api'],
      ['identity', 'orders', 'workflow'],
      ['postgres', 'redis', 'objects'],
    ];
  const titles = [
    ['Web / App', '管理后台', '开放 API'],
    ['账户服务', '订单服务', '流程服务'],
    ['PostgreSQL', 'Redis', '对象存储'],
  ];
  const bodies = [
    ['页面交互 · 客户请求', '运营操作 · 权限入口', '外部集成 · 接口访问'],
    ['组织与成员 · 鉴权', '订单状态 · 交易规则', '任务编排 · 审批'],
    ['事务与持久化', '会话与热点缓存', '文件与业务附件'],
  ];
  [132, 316, 500].forEach((y, row) => {
    const cards = keys[row]
      .map((key, i) =>
        d.card(
          key,
          titles[row][i],
          xs[i],
          y + 34,
          280,
          80,
          [bodies[row][i]],
          ['blue', 'purple', 'green'][row],
        ),
      )
      .join('');
    d.panel(
      `row-${row}`,
      ['访问入口', '业务服务', '数据支撑'][row],
      36,
      y,
      1128,
      142,
      cards,
      ['blue', 'purple', 'green'][row],
    );
  });
  for (let i = 0; i < 3; i++) {
    d.edge(`request-${i}`, keys[0][i], keys[1][i], [
      d.port(keys[0][i], 'bottom'),
      d.port(keys[1][i], 'top'),
    ]);
    d.edge(
      `data-${i}`,
      keys[1][i],
      keys[2][i],
      [d.port(keys[1][i], 'bottom'), d.port(keys[2][i], 'top')],
      'data',
    );
  }
  d.edge(
    'order-transaction',
    'orders',
    'postgres',
    [d.port('orders', 'bottom'), [680, 480], [360, 480], d.port('postgres', 'top')],
    'data',
  );
  d.edge(
    'session',
    'identity',
    'redis',
    [d.port('identity', 'right'), [514, 390], [514, 488], [680, 488], d.port('redis', 'top')],
    'data',
  );
  d.finish(
    '从基础组合图演变为三层业务系统架构。三层横向容器：访问入口、业务服务、数据支撑；各层三节点，列基线统一。主调用从上向下，订单到事务库、账户到会话缓存为跨列连接，走层间空白通道。底部一条共享支撑说明列出可观测性、配置密钥与交付回滚，不将这些能力误画成业务请求链。',
    tag(
      'g',
      { 'data-label': '共享支撑' },
      rect(36, 694, 1128, 70, '#f8fafc', '#dce4ee') +
        text('共享支撑', 56, 723, 15, '#334155', 600) +
        text('配置与密钥  ·  日志 / 指标 / 链路  ·  CI/CD 与回滚', 220, 723, 14, '#475569') +
        text('图示为职责划分示例，服务拆分和部署方式按实际约束确定。', 220, 747, 12, '#64748b'),
    ),
  );
}

function releaseWorkflow() {
  const d = document(
    'base-release-flow',
    '发布交付流程 · 含失败回路',
    '基础流程演变 · 角色泳道、发布判断、失败重试与运行回滚',
    1400,
    900,
  );
  d.panel(
    'dev',
    '研发',
    32,
    132,
    1336,
    140,
    d.card('commit', '提交变更', 190, 172, 180, 72, ['代码 · 测试 · 描述']) +
      d.card('review', '代码评审', 490, 172, 180, 72, ['设计检查 · 同行审核']) +
      d.card('merge', '合并主干', 790, 172, 180, 72, ['受保护分支 · 触发构建']),
    'blue',
  );
  d.panel(
    'ci',
    '交付流水线',
    32,
    332,
    1336,
    156,
    d.card('build', '构建制品', 790, 376, 180, 72, ['版本标记 · 依赖检查'], 'purple') +
      d.card('checks', '自动化校验', 1090, 376, 180, 72, ['单测 · 集成测试 · 扫描'], 'purple'),
    'purple',
  );
  d.panel(
    'ops',
    '线上运行',
    32,
    548,
    1336,
    320,
    d.card('decision', '可发布？', 1110, 566, 140, 88, [], 'amber', true) +
      d.card('canary', '灰度发布', 790, 574, 180, 72, ['小范围验证 · 可回退'], 'green') +
      d.card('observe', '验证与观测', 490, 574, 180, 72, ['错误率 · 延迟 · 业务校验'], 'green') +
      d.card('release', '完成发布', 190, 574, 180, 72, ['扩大流量 · 记录变更'], 'green') +
      d.card('rollback', '回滚恢复', 790, 780, 180, 72, ['恢复上个稳定版本'], 'amber'),
    'green',
  );
  const e = (key, a, b, p, kind = 'sync', label = '', at) => d.edge(key, a, b, p, kind, label, at);
  e('commit-review', 'commit', 'review', [d.port('commit', 'right'), d.port('review', 'left')]);
  e('review-merge', 'review', 'merge', [d.port('review', 'right'), d.port('merge', 'left')]);
  e('merge-build', 'merge', 'build', [d.port('merge', 'bottom'), d.port('build', 'top')]);
  e('build-check', 'build', 'checks', [d.port('build', 'right'), d.port('checks', 'left')]);
  e('check-decision', 'checks', 'decision', [
    d.port('checks', 'bottom'),
    d.port('decision', 'top'),
  ]);
  e(
    'yes',
    'decision',
    'canary',
    [d.port('decision', 'left'), d.port('canary', 'right')],
    'sync',
    '通过',
    [1040, 596],
  );
  e(
    'no',
    'decision',
    'review',
    [d.port('decision', 'right'), [1320, 610], [1320, 296], [580, 296], d.port('review', 'bottom')],
    'async',
    '未通过：修复后重试',
    [1000, 284],
  );
  e('canary-observe', 'canary', 'observe', [d.port('canary', 'left'), d.port('observe', 'right')]);
  e(
    'observe-release',
    'observe',
    'release',
    [d.port('observe', 'left'), d.port('release', 'right')],
    'sync',
    '验证正常',
    [430, 596],
  );
  e(
    'rollback',
    'observe',
    'rollback',
    [d.port('observe', 'bottom'), [580, 718], [880, 718], d.port('rollback', 'top')],
    'async',
    '运行异常',
    [720, 706],
  );
  d.finish(
    '用基础风格表达一次软件发布交付流程。三条角色泳道：研发、交付流水线、线上运行。阅读顺序为提交→评审→合并→构建→校验→发布判断；通过后灰度→验证→完成。未通过沿右侧和研发泳道下方返回代码评审；运行异常从验证节点进入回滚。判断用菱形，所有分支明确标注。各泳道节点基线统一，回路不能穿过节点。数值指标与具体门禁阈值由实际团队填写。',
    '',
    [
      ['主流程 / 通过', 'sync'],
      ['异常 / 返工', 'async'],
    ],
  );
}

function technicalInfographic() {
  const d = document(
    'base-request-observability',
    '请求生命周期 · 可观测性信息图',
    '基础信息图演变 · 用流程、字段矩阵和实施约束解释一次请求',
    1400,
    900,
  );
  const stages = [
    ['client', '客户端', '发起请求 · 关联标识'],
    ['ingress', '接入网关', '路由 · 限流 · 记录入口'],
    ['auth', '身份鉴权', '校验令牌 · 授权策略'],
    ['service', '业务服务', '规则执行 · 服务调用'],
    ['store', '数据访问', '查询 · 缓存 · 事务'],
    ['response', '响应输出', '状态码 · 返回业务结果'],
  ];
  d.panel(
    'lifecycle',
    '请求链路',
    32,
    136,
    1336,
    196,
    stages
      .map(([key, title, body], i) =>
        d.card(
          key,
          title,
          50 + i * 220,
          194,
          190,
          100,
          [body],
          i < 2 ? 'blue' : i < 4 ? 'purple' : 'green',
        ),
      )
      .join(''),
  );
  for (let i = 0; i < 5; i++)
    d.edge(`stage-${i}`, stages[i][0], stages[i + 1][0], [
      d.port(stages[i][0], 'right'),
      d.port(stages[i + 1][0], 'left'),
    ]);
  const rows = [
    ['trace', 'Trace / 链路', 'trace_id · span_id', '定位请求耗时与依赖'],
    ['metrics', 'Metrics / 指标', 'count · errors · latency', '按服务聚合趋势与告警'],
    ['logs', 'Logs / 日志', 'request_id · error_code', '补充错误与业务上下文'],
  ];
  d.panel(
    'signals',
    '观测信号与记录口径',
    32,
    392,
    660,
    344,
    text('信号', 52, 462, 12, '#64748b', 600) +
      text('示例字段', 224, 462, 12, '#64748b', 600) +
      text('用途', 468, 462, 12, '#64748b', 600) +
      rows
        .map(([key, title, fields, purpose], i) => {
          const y = 482 + i * 76;
          const body =
            rect(48, y, 628, 60, i % 2 ? '#fff' : '#f8fafc', 'none', 4) +
            text(title, 60, y + 34, 14, '#334155', 600) +
            text(fields, 224, y + 34, 12, '#475569') +
            text(purpose, 468, y + 34, 12, '#475569');
          d.nodes.set(key, {
            x: 48,
            y,
            w: 628,
            h: 60,
            svg: '',
            title,
            body: [fields, purpose],
            tone: 'slate',
          });
          return tag(
            'g',
            {
              id: d.nodeId(key),
              'data-node': 'true',
              'data-label': title,
            },
            body,
          );
        })
        .join(''),
    'slate',
  );
  d.panel(
    'constraints',
    '实施约束与阅读提示',
    728,
    392,
    640,
    344,
    d.card(
      'sampling',
      '采样策略',
      748,
      452,
      600,
      72,
      ['关键路径优先，采样比例按排障需求与成本决定。'],
      'blue',
    ) +
      d.card(
        'correlation',
        '关联与脱敏',
        748,
        544,
        600,
        72,
        ['统一标识关联信号，避免记录敏感字段与完整载荷。'],
        'purple',
      ) +
      d.card(
        'retention',
        '保留与告警',
        748,
        636,
        600,
        72,
        ['按用途配置保留周期；阈值依据实际服务目标确定。'],
        'green',
      ),
    'slate',
  );
  d.finish(
    '技术信息图应由三种结构组成：顶部六阶段请求链路，左下观测信号字段矩阵，右下三条实施约束。矩阵展示Trace/Metrics/Logs的示例字段与用途，不展示虚构延迟或可用率。阶段沿用当前风格的语义视觉规则，正文和字段保持水平基线。信息密度来自清晰的表格与职责解释，不使用装饰性大数字。所有文字仍为可编辑text。',
    rect(32, 788, 1336, 68, '#f8fafc', '#dce4ee') +
      text('阅读方式', 52, 817, 15, '#334155', 600) +
      text('先沿请求链路定位阶段，再用统一标识关联链路、指标和日志。', 196, 817, 14, '#475569') +
      text('图中字段为说明示例，采样与保留策略根据实际服务约束配置。', 196, 841, 12, '#64748b'),
    [['请求阶段与依赖', 'sync']],
  );
}

for (const key of Object.keys(baseStyleThemes)) {
  activeTheme = key;
  denseArchitecture();
  layeredArchitecture();
  releaseWorkflow();
  technicalInfographic();
}
