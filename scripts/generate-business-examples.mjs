import { writeFileSync } from 'node:fs';
import { Scene, esc } from './business-scenes/scene.mjs';
import { capability, journey, roadmap, priority } from './business-scenes/product.mjs';
import { metrics, funnel, campaign, procurement } from './business-scenes/operations.mjs';
import { raci, milestones } from './business-scenes/project.mjs';
import { renderFinancialChart } from '../src/editor/charts/financial.ts';
const subjects = [
  [
    'capability',
    '产品能力地图',
    '能力地图',
    ['产品', '管理层'],
    '按用户任务组织协作产品的能力边界',
    capability,
    ['围绕首次交付组织能力', '明确范围与责任边界', '实现架构另行展开'],
  ],
  [
    'journey',
    '新团队用户旅程',
    '用户旅程',
    ['产品', '设计', '运营'],
    '从发现需求到持续使用的触点、阻碍与机会',
    journey,
    ['逐阶段追踪用户行为', '机会需关联研究证据', '优先缩短首次成功路径'],
  ],
  [
    'roadmap',
    'Now / Next / Later 产品路线图',
    '路线图',
    ['产品', '项目协作', '管理层'],
    '用投入和确定性表达产品方向与验证顺序',
    roadmap,
    ['近期承诺与探索分开', '每个方向有验证条件', '季度复核投入顺序'],
  ],
  [
    'priority',
    '需求价值与投入矩阵',
    '优先级矩阵',
    ['产品', '设计', '管理层'],
    '用价值和投入讨论六项产品需求的推进顺序',
    priority,
    ['优先高价值低投入事项', '大投入方向先做验证', '位置体现判断而非精算'],
  ],
  [
    'profit',
    '营业利润变化分析',
    '瀑布图',
    ['财务', '管理层'],
    '从期初利润解释销量、价格、成本与费用的增减',
    null,
    ['从期初勾稽到期末', '正负变化与好坏分开', '金额修改同步比例与合计'],
  ],
  [
    'budget',
    '部门预算与实际对比',
    '对比图',
    ['财务', '管理层'],
    '同一期间、同一单位的部门费用执行与偏差',
    null,
    ['比较同口径预算与实际', '费用减少为有利方向', '差额与汇总随数据更新'],
  ],
  [
    'procurement',
    '采购到付款控制流程',
    '泳道图',
    ['财务', '项目协作'],
    '业务、财务审批与供应商交付的职责及单据控制',
    procurement,
    ['核验预算与授权', '先验收再核对付款', '职责分离并保留记录'],
  ],
  [
    'metrics',
    '协作产品业务指标树',
    '指标树',
    ['运营', '产品', '管理层'],
    '以周活跃协作团队为目标拆解新增、留存和回流',
    metrics,
    ['分支互斥且使用同周期', '每项指标有定义和责任', '从指标定位改进行动'],
  ],
  [
    'activation',
    '新用户激活转化漏斗',
    '漏斗图',
    ['运营', '产品'],
    '同一批用户从访问到完成团队交付的逐步转化',
    funnel,
    ['同一人群与观察窗口', '人数与条宽成比例', '整体交付转化率为5%'],
  ],
  [
    'campaign',
    '营销活动全链路',
    '泳道图',
    ['运营', '项目协作'],
    '目标、内容、渠道上线、线索承接与复盘闭环',
    campaign,
    ['每阶段有责任与验收', '承接结果反馈运营', '来源与成本共同追踪'],
  ],
  [
    'raci',
    '产品上线职责矩阵',
    '职责矩阵',
    ['项目协作', '产品', '管理层'],
    '明确产品、研发、测试与项目经理的协作职责',
    raci,
    ['每项交付有最终负责人', '执行和知会职责明确', '参与者共同确认分工'],
  ],
  [
    'milestones',
    '跨团队项目里程碑',
    '依赖图',
    ['项目协作', '产品'],
    '沿范围、方案、开发、验收到发布标出依赖',
    milestones,
    ['关键依赖影响后续窗口', '每个检查点有验收条件', '计划变化需同步责任方'],
  ],
];
const manifest = [];
for (const mode of ['review', 'report'])
  for (const [key, name, type, roles, description, draw, takeaways] of subjects) {
    const id = `business-${mode}-${key}`,
      d = new Scene(id, mode),
      report = mode === 'report';
    if (draw) draw(d);
    const model = {
      version: 1,
      kind: key === 'profit' ? 'waterfall' : 'budget',
      theme: mode,
      title: name,
      period: '2026 年第三季度',
      unit: '万元',
      direction: key === 'profit' ? 'higher' : 'lower',
      start: key === 'profit' ? 300 : 0,
      rows:
        key === 'profit'
          ? [
              { label: '销量变化', value: 120 },
              { label: '价格变化', value: 40 },
              { label: '成本变化', value: -60 },
              { label: '费用变化', value: -30 },
            ]
          : [
              { label: '研发', budget: 240, value: 228 },
              { label: '销售', budget: 180, value: 195 },
              { label: '市场', budget: 120, value: 108 },
              { label: '运营', budget: 90, value: 96 },
              { label: '行政', budget: 70, value: 68 },
            ],
    };
    const chart = !draw;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" font-family="Arial, PingFang SC, sans-serif" data-business-subject="${key}" data-work-style="${mode}"><title>${esc(name)} · ${report ? '正式汇报' : '工作评审'}</title><desc>岗位：${roles.join('、')}。原创工作示例，内容、日期与数据均为演示。${chart ? '此图表内置可编辑数值与比例联动。' : '图形与文字为原生SVG。'}</desc>${d.rect(0, 0, 1600, 1000, report ? '#faf8f3' : '#f5f7fb', 'none', 0)}${d.text(64, report ? 102 : 78, name, report ? 52 : 37, '#21354b', report ? 400 : 700, report ? 'font-family="Georgia, Songti SC, serif"' : '')}${d.text(67, report ? 153 : 120, description, 21, '#54677c')}${d.text(1536, report ? 192 : 168, `${roles.join(' / ')} · ${report ? '正式汇报' : '工作评审'}`, 18, '#54677c', 400, 'text-anchor="end"')}${
      report
        ? d.line(
            [
              [64, 208],
              [1536, 208],
            ],
            '#c3cbd2',
          ) +
          takeaways
            .map(
              (s, i) =>
                d.text(
                  64,
                  265 + i * 150,
                  ['核心判断', '协作重点', '下一步'][i],
                  20,
                  '#405f77',
                  600,
                ) +
                [...s]
                  .reduce((a, c, j) => {
                    if (j % 11 === 0) a.push('');
                    a[a.length - 1] += c;
                    return a;
                  }, [])
                  .map((line, j) => d.text(64, 305 + i * 150 + j * 30, line, 20, '#21354b'))
                  .join(''),
            )
            .join('')
        : ''
    }<g id="${id}-diagram" transform="translate(${report ? 344 : 64} ${report ? 230 : 210}) scale(${report ? 0.81 : 1})">${chart ? renderFinancialChart(model) : d.finish()}</g>${d.text(64, report ? 885 : 951, chart ? '选中图表 → 图表数据：修改金额、期间、单位及有利方向，比例和合计同步更新。' : '可编辑工作示例 · 情境、计划与数据为演示 · 请按实际业务补充口径、证据与责任', 18, '#54677c')}${report ? d.text(64, 942, `讨论目标：${takeaways[0]}；${takeaways[2]}。`, 20, '#405f77') : ''}</svg>`;
    writeFileSync(`src/examples/assets/${id}.svg`, svg + '\n');
    const prompt = `# ${name} · ${report ? '正式汇报' : '工作评审'}\n\n岗位：${roles.join('、')}。任务：${description}。图形类型：${type}。示例场景与数据为演示，不能作为真实业绩、研究证据或日期承诺。\n\n画布1600×1000，保留viewBox。${report ? '正式汇报：暖白纸面、大幅衬线标题、左侧三条判断与协作要点、右侧主要图形、底部讨论目标；方角、细线、低饱和蓝灰。' : '工作评审：冷白画布、无衬线标题、横向铺开的主要图形、语义浅色分区和紧凑标签；强调责任、条件和完整信息。'}不能将所有内容画成通用流程卡片，要保留${type}特有的轴线、矩阵、层级、阶段或责任结构。\n\n图内关系与判断：${takeaways.join('；')}。${chart ? '金融数据：' + JSON.stringify(model) + '。金额用百分之一最小单位精确加总；期初加变化等于期末，预算与实际使用同一比例和单位。有利方向与正负变化分开。data-sf-chart使用URI编码JSON以保留引号和中文，保留该模型以及原生图形，使用图表数据面板修改。' : ''}\n\n保留原生g/text/rect/path/polyline/defs/marker，命名语义节点；连线使用内部marker与data-sf端点绑定，节点可移动，文字不转路径。所有ID唯一、引用有效、文字在模块和画布内、连线不穿字。不使用script、foreignObject、事件、外部资源、外部字体或位图。只输出完整SVG XML。\n\n以下为完整示例结构，可替换业务内容，并保留其图形语义与工作风格：\n\n${svg}\n`;
    writeFileSync(`src/examples/prompts/${id}.md`, prompt);
    manifest.push({
      id,
      sourceId: `business-${key}`,
      style: `business-${mode}`,
      name,
      diagramType: type,
      roles,
      task: description,
      width: 1600,
      height: 1000,
      editableData: chart,
    });
  }
writeFileSync('src/examples/business-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${manifest.length} business examples across ${subjects.length} subjects.`);
