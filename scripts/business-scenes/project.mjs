export function raci(d) {
  const cols = ['交付事项', '产品负责人', '研发负责人', '测试负责人', '项目经理'];
  const widths = [400, 250, 250, 250, 250],
    xs = [0, 400, 650, 900, 1150];
  cols.forEach((title, i) => {
    d.bg.push(
      d.rect(xs[i], 45, widths[i], 70, '#e6edf5', '#b7c5d4', 0) +
        d.text(xs[i] + 20, 89, title, 23, d.ink, 600),
    );
  });
  const rows = [
    ['明确范围与验收', 'A', 'R', 'C', 'C'],
    ['开发与集成', 'C', 'A/R', 'C', 'I'],
    ['测试与质量结论', 'C', 'C', 'A/R', 'I'],
    ['发布决策', 'A', 'R', 'C', 'R'],
    ['进度与风险同步', 'C', 'R', 'C', 'A'],
  ];
  rows.forEach((row, r) => {
    const y = 115 + r * 86;
    row.forEach((value, c) => {
      const x = xs[c],
        w = widths[c];
      d.node(
        `cell-${r}-${c}`,
        value,
        x,
        y,
        w,
        86,
        [],
        'slate',
        () =>
          d.rect(x, y, w, 86, r % 2 ? '#f5f7fa' : '#fff', '#d7e0e8', 0) +
          d.text(
            c === 0 ? x + 20 : x + w / 2,
            y + 51,
            value,
            c === 0 ? 22 : 26,
            d.ink,
            c === 0 ? 400 : 600,
            c === 0 ? '' : 'text-anchor="middle"',
          ),
      );
    });
  });
  d.note(0, 610, 'R 执行 · A 最终负责 · C 征询 · I 知会；每行明确一个最终负责人。', 22);
  d.note(0, 655, '模拟项目：团队协作产品上线。职责应由参与者共同确认，不由模板代替授权。');
}
export function milestones(d) {
  const dates = ['11/02', '11/09', '11/16', '11/23', '11/30', '12/07'];
  d.bg.push(
    d.line(
      [
        [150, 125],
        [1400, 125],
      ],
      '#a6b5c5',
    ),
  );
  dates.forEach((date, i) => {
    const x = 150 + i * 250;
    d.bg.push(
      d.line(
        [
          [x, 125],
          [x, 620],
        ],
        '#dde4ec',
        'stroke-dasharray="4 6"',
      ) + d.text(x, 94, date, 21, d.muted, 400, 'text-anchor="middle"'),
    );
  });
  const tasks = [
    ['scope', '范围确认', 55, 180, 200, ['验收标准可验证']],
    ['design', '方案评审', 305, 180, 250, ['关键依赖已识别']],
    ['build', '开发完成', 605, 355, 300, ['完成集成验证']],
    ['qa', '验收完成', 955, 355, 250, ['阻塞问题清零']],
    ['release', '发布检查', 1255, 180, 200, ['回滚方案就绪']],
  ];
  tasks.forEach(([k, title, x, y, w, b]) =>
    d.node(k, title, x, y, w, 108, b, k === 'release' ? 'green' : 'blue'),
  );
  d.edge('scope', 'design', [
    [255, 234],
    [305, 234],
  ]);
  d.edge('design', 'build', [
    [555, 234],
    [580, 234],
    [580, 409],
    [605, 409],
  ]);
  d.edge('build', 'qa', [
    [905, 409],
    [955, 409],
  ]);
  d.edge('qa', 'release', [
    [1205, 409],
    [1230, 409],
    [1230, 234],
    [1255, 234],
  ]);
  d.note(60, 560, '关键路径：范围 → 方案 → 开发 → 验收 → 发布。节点水平位置表示计划检查窗口。', 22);
  d.note(60, 608, '责任：产品确认范围 · 研发交付方案与实现 · 测试给出质量结论 · 项目经理协调依赖');
  d.note(60, 659, '日期为演示计划，非交付承诺；延迟发生时需重新确认后续依赖与时间窗口。');
}
