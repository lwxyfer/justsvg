import { writeFileSync } from 'node:fs';
import { baseStyleThemes } from './base-style-themes.mjs';
const out = 'src/examples';
const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const manifest = [];
for (const mode of ['standard', 'wire', 'zone', 'night', 'reference']) {
  const t = baseStyleThemes[mode],
    style = mode === 'standard' ? 'base' : `base-${mode}`;
  const c = (v) => t.colors[v] || v;
  const txt = (x, y, s, size = 20, fill = '#334155', weight = 400, extra = '') =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${c(fill)}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
  const rect = (x, y, w, h, fill = '#fff', stroke = '#cbd5e1', r = t.radius) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c(fill)}" stroke="${c(stroke)}" stroke-width="${t.stroke}"/>`;
  const line = (points, color = '#64748b', extra = '') =>
    `<polyline points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${c(color)}" stroke-width="2" ${extra}/>`;
  function scene(key, name, type, description, draw) {
    const id = `work-${mode}-${key}`,
      nodes = new Map(),
      backgrounds = [],
      shapes = [],
      edges = [],
      labels = [];
    const node = (k, title, x, y, w, h, body = [], tone = 'blue', custom) => {
      const [fill, border, ink] = t.nodes[tone];
      const visual = custom
        ? custom(fill, border, ink)
        : rect(x, y, w, h, fill, border) +
          txt(
            mode === 'reference' ? x + w / 2 : x + 20,
            y + 34,
            title,
            23,
            ink,
            mode === 'reference' ? 700 : 600,
            mode === 'reference' ? 'text-anchor="middle"' : '',
          ) +
          body
            .map((s, i) =>
              txt(
                mode === 'reference' ? x + w / 2 : x + 20,
                y + 66 + i * 29,
                s,
                18,
                '#475569',
                400,
                mode === 'reference' ? 'text-anchor="middle"' : '',
              ),
            )
            .join('');
      nodes.set(k, { x, y, w, h, title, body });
      shapes.push(
        `<g id="${id}-${k}" data-node="true" data-label="${esc(title)}" data-layout="${x} ${y} ${w} ${h}">${visual}</g>`,
      );
    };
    const band = (title, x, y, w, h, tone = 'slate') => {
      backgrounds.push(
        rect(x, y, w, h, t.groups[tone] || t.panel, t.nodes[tone][1]) +
          txt(x + 20, y + 33, title, 21, t.nodes[tone][2], 600),
      );
    };
    const note = (x, y, s, size = 18) => labels.push(txt(x, y, s, size, '#64748b'));
    const edge = (a, b, points, label = '', crow = false) => {
      const anchor = (p, n) => {
        const u = Math.max(0, Math.min(1, (p[0] - n.x) / n.w)),
          v = Math.max(0, Math.min(1, (p[1] - n.y) / n.h));
        return `${u} ${v} ${p[0] - n.x - u * n.w} ${p[1] - n.y - v * n.h}`;
      };
      const eid = `${id}-edge-${edges.length}`;
      edges.push(
        `<polyline id="${eid}" points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${c('#64748b')}" stroke-width="2" marker-end="url(#${id}-${crow ? 'crow' : 'arrow'})" data-sf-start-node="#${id}-${a}" data-sf-end-node="#${id}-${b}" data-sf-start-anchor="${anchor(points[0], nodes.get(a))}" data-sf-end-anchor="${anchor(points.at(-1), nodes.get(b))}"/>`,
      );
      if (label) {
        const a = points[0],
          b = points[1],
          horizontal = a[1] === b[1];
        labels.push(
          txt(
            (a[0] + b[0]) / 2 + (horizontal ? 0 : 12),
            (a[1] + b[1]) / 2 - 12,
            label,
            17,
            '#475569',
            400,
            `data-sf-label-for="${eid}" text-anchor="${horizontal ? 'middle' : 'start'}"`,
          ),
        );
      }
    };
    draw({ node, band, note, edge, edges, backgrounds, shapes, labels, txt, rect, line, t, id });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" font-family="Arial, PingFang SC, sans-serif" data-workplace="${key}"><title>${esc(name)}</title><desc>${esc(description)}。示意数据，非生产配置。</desc><defs><marker id="${id}-arrow" viewBox="0 0 10 10" markerWidth="9" markerHeight="9" refX="10" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 5L0 10Z" fill="${c('#64748b')}"/></marker><marker id="${id}-crow" viewBox="0 0 12 12" markerWidth="14" markerHeight="14" refX="12" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M12 0L0 6L12 12M0 6H12" stroke="${c('#64748b')}" fill="none"/></marker></defs>${rect(0, 0, 1600, 1000, t.paper, 'none', 0)}${txt(56, 66, name, 36, '#0f172a', 700)}${txt(56, 106, description, 19, '#64748b')}${backgrounds.join('')}${edges.join('')}${shapes.join('')}${labels.join('')}${txt(56, 970, '工作场景示例 · 数据与部署均为演示 · 原生文字 / 分组 / 关联线可编辑', 16, '#64748b')}</svg>`;
    const prompt = `# ${name} · ${t.name}\n\n生成完整原生SVG，图形类型：${type}。\n场景：${description}。仅为说明，所有数据与部署均为示意，非真实业务表现。\n\n画布1600×1000。沿用${t.name}：背景${t.paper}，描边${t.stroke}px，圆角${t.radius}px。标题36px，节点标题23px、正文18px；文字保留text。明确保留此图特有的分区、时间轴、实体字段或图表结构，不得全部改成流程卡片。\n\n节点与坐标：\n${[...nodes].map(([k, n]) => `- ${k}: ${n.title}；${n.body.join(' / ')}；(${n.x},${n.y},${n.w},${n.h})`).join('\n')}\n\n约束：所有节点独立命名g，连接使用内部marker与data-sf绑定；保持下方原图的语义、几何、关系和说明，可替换内容。不得使用script、foreignObject、外部资源或网络字体；禁止位图代替图表。只输出SVG XML。\n\n完整原生结构参考（含${edges.length}条关系、端点与路线，数据/字段见原图）：\n\n${svg}\n`;
    writeFileSync(`${out}/assets/${id}.svg`, svg + '\n');
    writeFileSync(`${out}/prompts/${id}.md`, prompt);
    manifest.push({
      id,
      sourceId: `work-${key}`,
      style,
      name,
      diagramType: type,
      width: 1600,
      height: 1000,
    });
  }
  scene(
    'commerce',
    '电商业务系统架构',
    '系统架构',
    '入口、业务域、异步事件与数据存储的分层协作',
    ({ node, band, edge, note }) => {
      band('接入层', 48, 154, 1504, 154, 'blue');
      band('业务服务 · 按领域拆分', 48, 346, 1504, 250, 'purple');
      band('数据与异步基础设施', 48, 644, 1504, 250, 'green');
      node('web', 'Web / App', 80, 210, 260, 72, []);
      node('gateway', 'API Gateway', 480, 210, 300, 72, []);
      node('auth', '身份与权限', 960, 210, 280, 72, []);
      ['商品服务', '订单服务', '支付服务', '库存服务'].forEach((s, i) =>
        node(
          'svc' + i,
          s,
          80 + i * 380,
          420,
          290,
          130,
          ['独立领域接口', '业务规则 / 幂等校验'],
          'purple',
        ),
      );
      node('cache', 'Redis 缓存', 80, 736, 290, 104, ['热点商品 / 会话'], 'green');
      node('db', '业务数据库', 460, 736, 290, 104, ['订单 / 支付记录'], 'green');
      node('bus', '事件总线', 840, 736, 290, 104, ['OrderCreated / Paid'], 'amber');
      node('stock', '库存数据库', 1220, 736, 290, 104, ['预占 / 扣减'], 'green');
      edge('web', 'gateway', [
        [344, 246],
        [476, 246],
      ]);
      edge('gateway', 'auth', [
        [784, 246],
        [956, 246],
      ]);
      [0, 1, 2, 3].forEach((i) =>
        edge('gateway', 'svc' + i, [
          [630, 286],
          [630, 400],
          [225 + i * 380, 400],
          [225 + i * 380, 416],
        ]),
      );
      edge('svc0', 'cache', [
        [225, 554],
        [225, 620],
        [400, 620],
        [400, 706],
        [225, 706],
        [225, 732],
      ]);
      edge('svc1', 'db', [
        [605, 554],
        [605, 732],
      ]);
      edge('svc2', 'bus', [
        [985, 554],
        [985, 732],
      ]);
      edge('svc3', 'stock', [
        [1365, 554],
        [1365, 732],
      ]);
      note(80, 930, '同步 API 处理请求；领域事件支撑异步协作。图中服务与存储为示意拆分。');
    },
  );
  scene(
    'deployment',
    '双可用区云端部署',
    '部署架构',
    '流量入口、双区应用副本、共享数据层与运维边界',
    ({ node, band, edge, note }) => {
      node('dns', 'DNS / CDN', 72, 186, 290, 100, ['静态资源与域名'], 'slate');
      node('lb', '负载均衡', 600, 186, 320, 100, ['健康检查 / TLS 入口']);
      band('VPC · 应用网络', 48, 340, 1504, 330, 'blue');
      band('可用区 A', 80, 400, 660, 230, 'purple');
      band('可用区 B', 860, 400, 660, 230, 'green');
      node('a', '应用副本 A', 160, 474, 440, 116, ['业务容器 / 就绪探针'], 'purple');
      node('b', '应用副本 B', 960, 474, 440, 116, ['业务容器 / 就绪探针'], 'green');
      node('db', '托管数据库', 160, 766, 440, 120, ['主备部署（示意）', '私网访问'], 'green');
      node('obs', '日志与指标', 960, 766, 440, 120, ['集中采集 / 告警路由'], 'amber');
      edge('dns', 'lb', [
        [366, 236],
        [596, 236],
      ]);
      edge('lb', 'a', [
        [760, 290],
        [760, 370],
        [380, 370],
        [380, 470],
      ]);
      edge('lb', 'b', [
        [760, 290],
        [760, 370],
        [1180, 370],
        [1180, 470],
      ]);
      edge('a', 'db', [
        [380, 594],
        [380, 762],
      ]);
      edge('b', 'db', [
        [1180, 594],
        [1180, 706],
        [620, 706],
        [620, 826],
        [604, 826],
      ]);
      edge('b', 'obs', [
        [1404, 532],
        [1536, 532],
        [1536, 826],
        [1404, 826],
      ]);
      note(72, 930, '示意拓扑，不构成高可用承诺；副本数、网络与故障策略需按实际环境设计。');
    },
  );
  scene(
    'swimlane',
    '需求到上线 · 跨团队泳道',
    '泳道图',
    '产品、研发、测试与运维的交接，以及验收失败的返回路径',
    ({ node, band, edge, note }) => {
      ['产品', '研发', '测试', '运维'].forEach((s, i) => {
        band(s, 48, 166 + i * 180, 1504, 160, ['blue', 'purple', 'green', 'amber'][i]);
      });
      node('brief', '需求澄清', 200, 220, 250, 78, []);
      node('review', '范围确认', 650, 220, 250, 78, []);
      node('code', '开发与自测', 650, 400, 250, 78, [], 'purple');
      node('fix', '修复问题', 1080, 400, 270, 78, [], 'purple');
      node('qa', '集成验收', 650, 580, 250, 78, [], 'green');
      node('ok', '发布审批', 200, 580, 250, 78, [], 'green');
      node('ship', '灰度上线', 200, 760, 250, 78, [], 'amber');
      node('observe', '观测与回滚', 650, 760, 250, 78, [], 'amber');
      edge(
        'brief',
        'review',
        [
          [454, 259],
          [646, 259],
        ],
        '交接',
      );
      edge('review', 'code', [
        [775, 302],
        [775, 396],
      ]);
      edge('code', 'qa', [
        [775, 482],
        [775, 576],
      ]);
      edge(
        'qa',
        'fix',
        [
          [904, 619],
          [1215, 619],
          [1215, 482],
        ],
        '不通过',
      );
      edge(
        'fix',
        'code',
        [
          [1076, 439],
          [904, 439],
        ],
        '重新验证',
      );
      edge(
        'qa',
        'ok',
        [
          [646, 619],
          [454, 619],
        ],
        '通过',
      );
      edge('ok', 'ship', [
        [325, 662],
        [325, 756],
      ]);
      edge('ship', 'observe', [
        [454, 799],
        [646, 799],
      ]);
      note(72, 930, '纵向表示责任域，横向表示交接顺序；验收结果与灰度判定为示意流程。');
    },
  );
  scene(
    'sequence',
    '支付请求 · 时序与异步回调',
    '时序图',
    '从用户确认到支付渠道回调，区分请求、响应与事件通知',
    ({ node, edge, edges, note, line }) => {
      ['用户端', '订单服务', '支付服务', '支付渠道'].forEach((s, i) => {
        let x = 100 + i * 380;
        node(
          'actor' + i,
          s,
          x,
          166,
          260,
          78,
          [],
          'blue',
          (fill, border, ink) =>
            rect(x, 166, 260, 78, fill, border) +
            txt(x + 24, 214, s, 24, ink, 600) +
            line(
              [
                [x + 130, 248],
                [x + 130, 874],
              ],
              '#94a3b8',
              'stroke-dasharray="8 6"',
            ),
        );
      });
      const msg = (a, b, y, s) => {
        let x = 230 + a * 380,
          z = 230 + b * 380;
        edge('actor' + a, 'actor' + b, [
          [x, y],
          [z, y],
        ]);
        if (y === 600 || y === 690)
          edges[edges.length - 1] = edges
            .at(-1)
            .replace('fill="none"', 'fill="none" stroke-dasharray="8 6"');
        note(Math.min(x, z) + 24, y - 15, s, 20);
      };
      msg(0, 1, 330, '确认订单');
      msg(1, 2, 420, '创建支付单');
      msg(2, 3, 510, '渠道下单（幂等键）');
      msg(3, 2, 600, '返回支付凭据');
      msg(2, 0, 690, '返回待支付结果');
      msg(3, 2, 780, '异步通知：支付成功');
      msg(2, 1, 860, '更新订单状态');
      note(72, 930, '从上到下为时间顺序；虚线为响应，实线为请求或异步通知。支付结果需服务端校验。');
    },
  );
  scene(
    'entity',
    '订单领域 · 实体关系',
    '实体关系图',
    '主外键、业务字段与一对多关系；支付记录与订单明细分开建模',
    ({ node, edge, note }) => {
      const table = (k, title, x, y, fields, tone = 'blue') =>
        node(
          k,
          title,
          x,
          y,
          390,
          240,
          fields,
          tone,
          (fill, border, ink) =>
            rect(x, y, 390, 240, fill, border) +
            txt(x + 20, y + 35, title, 24, ink, 600) +
            line(
              [
                [x, y + 54],
                [x + 390, y + 54],
              ],
              border,
            ) +
            fields.map((s, i) => txt(x + 20, y + 88 + i * 33, s, 18, '#475569')).join(''),
        );
      table('user', 'users · 用户', 70, 190, [
        'PK id : uuid',
        'email : string',
        'created_at : timestamp',
      ]);
      table('order', 'orders · 订单', 600, 190, [
        'PK id : uuid',
        'FK user_id : uuid',
        'status : enum',
        'total : decimal',
      ]);
      table(
        'pay',
        'payments · 支付',
        1130,
        190,
        ['PK id : uuid', 'FK order_id : uuid', 'channel : string', 'status : enum'],
        'purple',
      );
      table(
        'item',
        'order_items · 明细',
        600,
        620,
        ['PK id : uuid', 'FK order_id : uuid', 'FK product_id : uuid', 'quantity : integer'],
        'green',
      );
      table(
        'product',
        'products · 商品',
        70,
        620,
        ['PK id : uuid', 'sku : string', 'price : decimal'],
        'green',
      );
      edge(
        'user',
        'order',
        [
          [464, 310],
          [596, 310],
        ],
        '1 → N',
        true,
      );
      edge(
        'order',
        'pay',
        [
          [994, 310],
          [1126, 310],
        ],
        '1 → N',
        true,
      );
      edge(
        'order',
        'item',
        [
          [795, 434],
          [795, 616],
        ],
        '1 → N',
        true,
      );
      edge(
        'product',
        'item',
        [
          [464, 740],
          [596, 740],
        ],
        '1 → N',
        true,
      );
      note(72, 930, '乌鸦脚表示多端；这里只展示逻辑模型，未表达所有唯一约束、索引与业务规则。');
    },
  );
  scene(
    'infographic',
    '增长漏斗 · 转化与流失',
    '信息图',
    '示例数据：四阶段转化漏斗、相邻转化率与分阶段流失量',
    ({ node, band, note }) => {
      band('从访问到付费 · 示例统计口径为同一批用户', 48, 156, 1504, 734, 'slate');
      const values = [10000, 4000, 2000, 500],
        widths = [840, 680, 520, 360],
        ys = [244, 394, 544, 694],
        names = ['访问', '注册', '激活', '付费'];
      values.forEach((v, i) => {
        let w = widths[i],
          x = 550 - w / 2,
          y = ys[i];
        node(
          'stage' + i,
          names[i],
          x,
          y,
          w,
          118,
          [String(v)],
          ['blue', 'purple', 'green', 'amber'][i],
          (fill, border, ink) =>
            `<path d="M${x} ${y}H${x + w}L${x + w - 45} ${y + 118}H${x + 45}Z" fill="${fill}" stroke="${border}" stroke-width="${t.stroke}"/>` +
            txt(550, y + 47, names[i], 24, ink, 600, 'text-anchor="middle"') +
            txt(
              550,
              y + 84,
              v.toLocaleString('en-US') + ' 人',
              26,
              ink,
              600,
              'text-anchor="middle"',
            ),
        );
      });
      node('summary', '整体转化率', 1100, 244, 360, 150, ['500 / 10,000 = 5.0%'], 'purple');
      [6000, 2000, 1500].forEach((v, i) =>
        node(
          'loss' + i,
          '阶段流失 ' + v.toLocaleString('en-US'),
          1100,
          444 + i * 118,
          360,
          94,
          [`相邻转化率 ${['40%', '50%', '25%'][i]}`],
          'slate',
        ),
      );
      note(
        120,
        852,
        '漏斗宽度为阶段示意，非数值比例；同批用户口径。数据为演示，不代表实际业务表现。',
      );
    },
  );
  scene(
    'lineage',
    '数据平台 · 批流与血缘',
    '数据流图',
    '多源采集、原始层、清洗层和消费层；区分实时与离线链路',
    ({ node, band, edge, note }) => {
      ['数据源', '采集与原始层', '清洗与建模', '消费'].forEach((s, i) =>
        band(s, 48 + i * 388, 164, 352, 708, ['blue', 'purple', 'green', 'amber'][i]),
      );
      node('db', '业务数据库', 72, 280, 304, 120, ['订单 / 商品'], 'blue');
      node('events', '行为事件', 72, 620, 304, 120, ['埋点 / 日志'], 'blue');
      node('raw', 'ODS 原始层', 460, 280, 304, 120, ['批同步 / 原始快照'], 'purple');
      node('stream', '事件流', 460, 620, 304, 120, ['实时采集 / 分区'], 'purple');
      node('warehouse', 'DWD 明细层', 848, 280, 304, 120, ['清洗 / 去重 / 统一键'], 'green');
      node('realtime', '实时聚合', 848, 620, 304, 120, ['窗口统计 / 延迟水位'], 'green');
      node('bi', '经营分析', 1236, 280, 292, 120, ['主题指标 / 报表'], 'amber');
      node('api', '在线服务', 1236, 620, 292, 120, ['实时特征 / 查询 API'], 'amber');
      [
        'db,raw',
        'raw,warehouse',
        'warehouse,bi',
        'events,stream',
        'stream,realtime',
        'realtime,api',
      ].forEach((pair) => {
        const [a, b] = pair.split(',');
        const xs = { db: 72, raw: 460, warehouse: 848, events: 72, stream: 460, realtime: 848 },
          y = ['events', 'stream', 'realtime'].includes(a) ? 680 : 340;
        edge(a, b, [
          [xs[a] + 308, y],
          [xs[a] + 384, y],
        ]);
      });
      note(72, 930, '上行离线批处理，下行实时处理；同名业务键用于关联，未表示实际处理吞吐或延迟。');
    },
  );
  scene(
    'roadmap',
    '产品路线图 · 季度交付',
    '路线图',
    '按工作流展示发现、基础能力、体验与增长的季度交付安排',
    ({ node, band, backgrounds, note }) => {
      const qs = ['Q1 · 发现', 'Q2 · 建设', 'Q3 · 验证', 'Q4 · 扩展'];
      qs.forEach((q, i) => {
        backgrounds.push(
          rect(300 + i * 300, 176, 300, 690, t.panel, '#cbd5e1', 0) +
            txt(320 + i * 300, 215, q, 23, '#334155', 600),
        );
      });
      ['用户研究', '平台能力', '产品体验', '增长试验'].forEach((s, i) => {
        band(s, 48, 258 + i * 150, 230, 126, ['blue', 'purple', 'green', 'amber'][i]);
      });
      node('research', '访谈与问题定义', 320, 280, 260, 82, []);
      node('pilot', '原型验证', 620, 280, 260, 82, []);
      node('platform', '权限 / 文档基础能力', 320, 430, 560, 82, [], 'purple');
      node('api', 'API 与扩展点', 920, 430, 560, 82, [], 'purple');
      node('editor', '核心编辑闭环', 620, 580, 560, 82, [], 'green');
      node('polish', '可用性打磨', 1220, 580, 260, 82, [], 'green');
      node('growth', '用户试用与反馈', 920, 730, 560, 82, [], 'amber');
      note(72, 930, '计划为演示，不表示承诺日期；条形跨度表达工作区间，各工作流可并行。');
    },
  );
}
writeFileSync(`${out}/workplace-manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${manifest.length} native workplace SVG/Prompt pairs`);
