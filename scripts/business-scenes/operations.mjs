export function metrics(d) {
  d.node('north', '周活跃协作团队', 536, 20, 400, 100, ['口径：每周完成 ≥1 次协作交付'], 'blue');
  const groups = [
    ['acquire', '新增激活团队', 60, ['获客触达', '激活完成率']],
    ['retain', '留存活跃团队', 550, ['上周活跃团队', '团队周留存率']],
    ['revive', '回流活跃团队', 1040, ['沉默团队基数', '召回激活率']],
  ];
  groups.forEach(([k, title, x, children]) => {
    d.node(k, title, x, 226, 380, 100, ['与其他分支按团队去重'], 'purple');
    d.edge('north', k, [
      [736, 120],
      [736, 172],
      [x + 190, 172],
      [x + 190, 226],
    ]);
    children.forEach((s, j) => {
      const xx = x + j * 194;
      d.node(`${k}-${j}`, s, xx, 440, 186, 104, ['每周追踪'], 'slate');
      d.edge(k, `${k}-${j}`, [
        [x + 190, 326],
        [x + 190, 380],
        [xx + 93, 380],
        [xx + 93, 440],
      ]);
    });
  });
  d.note(20, 620, '关系：新增 + 留存 + 回流 = 本周活跃团队（分支互斥、同一统计周期）。');
  d.note(20, 660, '每个指标必须补齐对象、事件、去重方式、时间窗口和责任人。');
}
export function funnel(d) {
  const stages = [
    ['访问落地页', 10000, '内容与投放'],
    ['注册账号', 4000, '注册体验'],
    ['完成首次项目', 2000, '引导与模板'],
    ['邀请同事', 1000, '协作触发'],
    ['完成团队交付', 500, '交付闭环'],
  ];
  stages.forEach(([title, value, owner], i) => {
    const y = 28 + i * 115,
      width = (980 * value) / 10000,
      x = 70 + (980 - width) / 2;
    d.node(`step-${i}`, title, x, y, width, 75, [], 'blue', () =>
      d.rect(x, y, width, 75, i % 2 ? '#b3c8e1' : '#d5e2f0', '#819fbd', 0),
    );
    d.note(1100, y + 26, title, 23);
    d.note(1100, y + 58, `${value.toLocaleString('en-US')} 人 · ${owner}`, 19);
    d.notes.push(d.text(560, y + 47, String(value), 22, '#21354b', 600, 'text-anchor="middle"'));
    if (i < 4) {
      const rate = (stages[i + 1][1] / value) * 100;
      d.note(1100, y + 95, `下一步转化 ${rate}%`);
    }
  });
  d.note(70, 640, '整体转化率 5% · 人数与条宽按相同比例 · 同一批用户、同一观察窗口');
  d.note(70, 679, '演示数据：2026 年第三季度新增访问用户；实际项目请替换口径与来源。');
}
export function campaign(d) {
  const roles = ['市场运营', '产品 / 内容', '销售 / 客服'];
  roles.forEach((r, i) => d.band(r, 0, 30 + i * 200, 1472, 180, i % 2 ? '#f5f7fa' : '#edf3fa'));
  const nodes = [
    ['goal', '定义目标', 40, 90, ['目标：合格线索', '预算：审核后发布']],
    ['content', '制作内容', 370, 290, ['落地页与素材', '验收：场景清晰']],
    ['launch', '渠道上线', 700, 90, ['投放 / 社群 / 内容', '验收：链接可追踪']],
    ['qualify', '承接与分级', 1030, 490, ['筛选匹配需求', '记录线索来源']],
    ['review', '复盘与调整', 1030, 90, ['回看转化与成本', '确认下一轮动作']],
  ];
  nodes.forEach(([k, t, x, y, b]) => d.node(k, t, x, y, 280, 110, b, 'blue'));
  d.edge('goal', 'content', [
    [320, 145],
    [345, 145],
    [345, 345],
    [370, 345],
  ]);
  d.edge('content', 'launch', [
    [650, 345],
    [675, 345],
    [675, 145],
    [700, 145],
  ]);
  d.edge('launch', 'qualify', [
    [980, 145],
    [1005, 145],
    [1005, 545],
    [1030, 545],
  ]);
  d.edge('qualify', 'review', [
    [1170, 490],
    [1170, 200],
  ]);
  d.note(20, 680, '闭环：每个阶段有责任、交付物和验收条件；用户响应反馈进入下一轮活动。');
}
export function procurement(d) {
  const roles = ['业务申请', '财务与审批', '采购 / 供应商'];
  roles.forEach((r, i) => d.band(r, 0, 30 + i * 200, 1472, 180, i % 2 ? '#f6f4ef' : '#edf3fa'));
  const nodes = [
    ['request', '提出采购需求', 30, 87, ['用途、金额与预算项']],
    ['check', '核验预算', 350, 287, ['预算余额与必要性']],
    ['approve', '授权审批', 670, 287, ['按金额与权限审批']],
    ['order', '下单与验收', 990, 487, ['订单、交付与验收单']],
    ['pay', '核对并付款', 1190, 287, ['合同 / 发票 / 验收一致']],
  ];
  nodes.forEach(([k, t, x, y, b]) =>
    d.node(k, t, x, y, 250, 110, b, k === 'pay' ? 'green' : 'blue'),
  );
  d.edge('request', 'check', [
    [280, 142],
    [315, 142],
    [315, 342],
    [350, 342],
  ]);
  d.edge('check', 'approve', [
    [600, 342],
    [670, 342],
  ]);
  d.edge('approve', 'order', [
    [920, 342],
    [955, 342],
    [955, 542],
    [990, 542],
  ]);
  d.edge('order', 'pay', [
    [1240, 487],
    [1315, 487],
    [1315, 397],
  ]);
  d.note(30, 675, '控制点：预算不足或单据不一致需退回补正；申请、审批与付款职责分开。');
}
