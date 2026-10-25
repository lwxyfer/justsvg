import { template, node, panel, edge, text, rect, palette, type Tone } from './drawing';
const tones: Tone[] = ['blue', 'purple', 'green', 'amber'];
export const infographicTemplates = [
  template(
    'roadmap',
    '技术演进路线图',
    '技术信息图',
    '用四个阶段描述目标、交付物与验收条件',
    tones
      .map((tone, i) => {
        const x = 36 + i * 198;
        return (
          panel(
            `phase-${i}`,
            `阶段 ${i + 1}`,
            x,
            142,
            174,
            268,
            text(
              ['打好基础', '验证能力', '扩展规模', '持续优化'][i],
              x + 16,
              215,
              18,
              palette[tone].ink,
              600,
            ) +
              text('目标：待填写', x + 16, 256, 13) +
              text('交付：待填写', x + 16, 294, 13) +
              text('验收：待填写', x + 16, 332, 13),
            tone,
          ) +
          (i < 3
            ? edge(`next-${i}`, [
                [x + 174, 276],
                [x + 198, 276],
              ])
            : '')
        );
      })
      .join(''),
  ),
  template(
    'comparison',
    '技术方案对比矩阵',
    '技术信息图',
    '围绕约束与取舍比较两种方案，结论由你填写',
    panel(
      'criteria',
      '比较维度',
      36,
      122,
      200,
      322,
      ['实现复杂度', '运维成本', '扩展方式', '适用约束', '主要取舍']
        .map((v, i) => text(v, 56, 198 + i * 50, 14))
        .join(''),
    ) +
      ['方案 A', '方案 B']
        .map((v, i) =>
          panel(
            `option-${i}`,
            v,
            260 + i * 284,
            122,
            260,
            322,
            Array.from(
              { length: 5 },
              (_, row) =>
                `<g id="option-${i}-row-${row}">${rect(276 + i * 284, 178 + row * 50, 228, 34, i ? '#f5f3ff' : '#eff6ff', 'none', 4)}${text('待填写', 292 + i * 284, 200 + row * 50, 13, '#64748b')}</g>`,
            ).join(''),
            i ? 'purple' : 'blue',
          ),
        )
        .join(''),
  ),
  template(
    'metrics',
    '技术指标卡',
    '技术信息图',
    '展示性能、可靠性、质量与成本，数值和口径待补充',
    ['请求延迟', '服务可用性', '交付质量', '资源成本']
      .map((title, i) => {
        const x = 36 + (i % 2) * 396,
          y = 118 + Math.floor(i / 2) * 170,
          p = palette[tones[i]];
        return `<g id="metric-${i}" data-label="${title}">${rect(x, y, 372, 146, p.fill, p.line)}${text(title, x + 20, y + 32, 16, p.ink, 600)}${text('—', x + 20, y + 84, 34, p.ink, 700)}${text('单位 / 时间范围：待填写', x + 20, y + 120, 12, '#64748b')}</g>`;
      })
      .join(''),
  ),
  template(
    'pyramid',
    '系统分层金字塔',
    '技术信息图',
    '从基础资源到用户价值，说明层级之间的支撑关系',
    ['用户价值', '业务能力', '平台服务', '基础资源']
      .map((label, i) => {
        const y = 106 + i * 88,
          topHalf = 68 + i * 66,
          bottomHalf = topHalf + 56,
          p = palette[tones[i]];
        return `<g id="tier-${i}" data-label="${label}"><path d="M${420 - topHalf} ${y}H${420 + topHalf}L${420 + bottomHalf} ${y + 76}H${420 - bottomHalf}Z" fill="${p.fill}" stroke="${p.line}" stroke-width="1.5"/>${text(label, 420, y + 34, 17, p.ink, 600, 'middle')}${text('描述与示例：待填写', 420, y + 57, 12, '#64748b', 400, 'middle')}</g>`;
      })
      .join(''),
  ),
  template(
    'lifecycle',
    '数据生命周期',
    '技术信息图',
    '按阶段描述数据的流转、治理责任和质量控制',
    ['采集', '存储', '处理', '使用', '归档']
      .map((title, i) => {
        const x = 36 + i * 158,
          tone = (['blue', 'green', 'purple', 'amber', 'slate'] as Tone[])[i];
        return (
          (i < 4
            ? edge(`stage-link-${i}`, [
                [x + 136, 234],
                [x + 158, 234],
              ])
            : '') +
          node(
            `stage-${i}`,
            title,
            x,
            190,
            136,
            88,
            [['接入与授权'], ['分层与权限'], ['转换与校验'], ['服务与分析'], ['保留与删除']][i],
            tone,
          ) +
          `<g id="owner-${i}" data-label="${title}责任">${text('责任方：待填写', x, 326, 12)}${text('质量点：待填写', x, 353, 12)}</g>`
        );
      })
      .join(''),
  ),
  template(
    'hub',
    '主题辐射信息图',
    '技术信息图',
    '以一个技术主题为中心，展开六个关键维度',
    edge('capability', [
      [330, 250],
      [224, 250],
    ]) +
      edge('constraints', [
        [510, 250],
        [616, 250],
      ]) +
      edge('goals', [
        [370, 206],
        [370, 146],
        [224, 146],
      ]) +
      edge('integration', [
        [470, 206],
        [470, 146],
        [616, 146],
      ]) +
      edge('risks', [
        [370, 294],
        [370, 354],
        [224, 354],
      ]) +
      edge('metrics', [
        [470, 294],
        [470, 354],
        [616, 354],
      ]) +
      node('topic', '技术主题', 330, 206, 180, 88, ['填写主题与一句话说明'], 'purple') +
      node('goals', '目标', 36, 102, 188, 88, ['解决什么问题']) +
      node('capabilities', '核心能力', 36, 206, 188, 88, ['提供什么能力']) +
      node('risks', '风险', 36, 310, 188, 88, ['失败与兜底预案'], 'amber') +
      node('integration', '集成', 616, 102, 188, 88, ['上下游与接口'], 'green') +
      node('constraints', '约束', 616, 206, 188, 88, ['边界与前提'], 'slate') +
      node('metrics', '验证指标', 616, 310, 188, 88, ['如何衡量效果'], 'green'),
  ),
];
