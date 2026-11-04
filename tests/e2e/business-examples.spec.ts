import { test, expect } from '@playwright/test';
import { selectExampleOption, downloadExampleFromEditor } from './example-navigation';
const subjects = [
  'capability',
  'journey',
  'roadmap',
  'priority',
  'profit',
  'budget',
  'procurement',
  'metrics',
  'activation',
  'campaign',
  'raci',
  'milestones',
];
for (const subject of subjects)
  test(`business ${subject} has two readable native working styles`, async ({ page }) => {
    for (const mode of ['review', 'report']) {
      const id = `business-${mode}-${subject}`;
      await page.goto(`/examples?example=${id}`);
      await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', id);
      const errors = await page.locator('.example-artboard svg').evaluate((element) => {
        const root = element as SVGSVGElement,
          problems: string[] = [];
        const bounds = root.getBoundingClientRect();
        for (const text of root.querySelectorAll<SVGTextElement>('text')) {
          const b = text.getBoundingClientRect();
          if (
            b.left < bounds.left - 0.5 ||
            b.top < bounds.top - 0.5 ||
            b.right > bounds.right + 0.5 ||
            b.bottom > bounds.bottom + 0.5
          )
            problems.push(`canvas: ${text.textContent}`);
          const node = text.closest('[data-layout]');
          if (node) {
            const [x, y, w, h] = node.getAttribute('data-layout')!.split(' ').map(Number),
              local = text.getBBox();
            if (
              local.x < x + 5 ||
              local.y < y + 4 ||
              local.x + local.width > x + w - 5 ||
              local.y + local.height > y + h - 4
            )
              problems.push(`module ${node.id}: ${text.textContent}`);
          }
        }
        for (const edge of root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')) {
          for (let at = 2; at < edge.getTotalLength() - 2; at += 4) {
            const p = edge.getPointAtLength(at).matrixTransform(edge.getScreenCTM()!);
            for (const text of root.querySelectorAll('text')) {
              const b = text.getBoundingClientRect();
              if (
                p.x > b.left + 0.2 &&
                p.x < b.right - 0.2 &&
                p.y > b.top + 0.2 &&
                p.y < b.bottom - 0.2
              )
                problems.push(`line ${edge.id}: ${text.textContent}`);
            }
          }
        }
        return [...new Set(problems)];
      });
      expect(errors).toEqual([]);
      const svgText = await page
        .getByRole('textbox', { name: '生成 Prompt', exact: true })
        .inputValue();
      expect(svgText).toContain('1600×1000');
      await selectExampleOption(
        page,
        '选择视觉风格',
        `business-${mode === 'review' ? 'report' : 'review'}-${subject}`,
      );
      await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
        'data-value',
        `business-${mode === 'review' ? 'report' : 'review'}-${subject}`,
      );
    }
  });

test('role shortcuts intersect type, working style and search and remain usable on mobile', async ({
  page,
}) => {
  await page.goto('/examples');
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  const roles = page.getByRole('group', { name: '岗位快捷筛选' });
  await roles.getByRole('button', { name: '财务', exact: true }).click();
  await expect(page.locator('.image-result')).toHaveCount(6);
  await selectExampleOption(page, '筛选风格系列', 'work');
  await selectExampleOption(page, '筛选图形类型', '瀑布图');
  await expect(page.locator('.image-result')).toHaveCount(2);
  await page.getByLabel('搜索示例').fill('预算');
  await expect(page.locator('.image-result')).toHaveCount(0);
  await page.getByRole('button', { name: '显示全部示例', exact: true }).click();
  await expect(roles.getByRole('button', { name: '全部岗位' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await roles.getByRole('button', { name: '产品', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#result-business-review-journey').click();
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'business-review-journey',
  );
});
for (const subject of ['profit', 'budget'])
  test(`financial ${subject} data edits, invalid drafts and actual exports stay consistent`, async ({
    page,
  }) => {
    await page.goto(`/examples?example=business-review-${subject}`);
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    const svg = page.locator('[data-svg-host] > svg');
    await svg.locator('[data-sf-chart]').click({ position: { x: 30, y: 30 } });
    const panel = page.getByRole('form', { name: '财务图表数据' });
    await expect(panel).toBeVisible();
    const model = () => svg.locator('[data-sf-chart]').getAttribute('data-sf-chart');
    const before = await model();
    const input = page.getByLabel(subject === 'profit' ? '变化金额 1' : '实际金额 1', {
      exact: true,
    });
    await input.fill(subject === 'profit' ? '200' : '260');
    await page.getByRole('button', { name: '应用图表数据', exact: true }).click();
    expect(JSON.parse(decodeURIComponent((await model())!)).rows[0].value).toBe(
      subject === 'profit' ? 200 : 260,
    );
    await page.evaluate(async () => {
      const path = '/tests/e2e/bridge.ts';
      (await import(/* @vite-ignore */ path)).engine.undo();
    });
    expect(await model()).toBe(before);
    await page.evaluate(async () => {
      const path = '/tests/e2e/bridge.ts';
      (await import(/* @vite-ignore */ path)).engine.redo();
    });
    await page
      .getByLabel(subject === 'profit' ? '变化金额 1' : '实际金额 1', { exact: true })
      .fill('');
    const applied = await model();
    await page.getByRole('button', { name: '应用图表数据', exact: true }).click();
    await expect(panel.getByRole('alert')).toBeVisible();
    expect(await model()).toBe(applied);
    await page
      .getByLabel(subject === 'profit' ? '变化金额 1' : '实际金额 1', { exact: true })
      .fill(subject === 'profit' ? '200' : '260');
    await page.getByRole('button', { name: '应用图表数据', exact: true }).click();
    await page.locator('.export-dropdown > summary').click();
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
    const download = await pending;
    const { readFile } = await import('node:fs/promises');
    const xml = await readFile((await download.path())!, 'utf8');
    const native = await page.context().newPage();
    await native.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
    await expect(native.locator('[data-sf-chart]')).toHaveCount(1);
    await native.close();
    const result = await page.evaluate(async (xml) => {
      const path = '/tests/e2e/bridge.ts';
      const { engine } = await import(/* @vite-ignore */ path);
      engine.importSvg(xml, 'financial-reimport.svg');
      return {
        warnings: engine.warnings,
        value: JSON.parse(
          decodeURIComponent(
            engine.root.querySelector('[data-sf-chart]').getAttribute('data-sf-chart'),
          ),
        ).rows[0].value,
      };
    }, xml);
    expect(result.warnings).toEqual([]);
    expect(result.value).toBe(subject === 'profit' ? 200 : 260);
  });

test('a business flow exports editable linked nodes and preserves unrelated text during a move', async ({
  page,
}) => {
  await page.goto('/examples?example=business-report-procurement');
  const { xml } = await downloadExampleFromEditor(page);
  expect(xml).toContain('data-sf-start-node');
  await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
  const result = await page.evaluate(async () => {
    const path = '/tests/e2e/bridge.ts';
    const { engine } = await import(/* @vite-ignore */ path);
    const node = engine.root.querySelector('[data-node]'),
      edge = engine.root.querySelector('[data-sf-start-node]'),
      before = engine.exportSvg(),
      old = edge.getAttribute('points');
    engine.select([node]);
    engine.translate(10, 6);
    const moved = old !== edge.getAttribute('points');
    engine.undo();
    return { moved, undone: engine.exportSvg() === before };
  });
  expect(result).toEqual({ moved: true, undone: true });
});

test('financial zero, negative and eight-category large-value cases keep readable finite geometry', async ({
  page,
}) => {
  await page.goto('/examples?example=business-review-profit');
  const cases = [
    {
      kind: 'waterfall',
      start: -100,
      rows: [
        { label: '减少', value: -80 },
        { label: '增加', value: 20 },
      ],
    },
    {
      kind: 'waterfall',
      start: 0,
      rows: [
        { label: '零变化', value: 0 },
        { label: '仍为零', value: 0 },
      ],
    },
    {
      kind: 'budget',
      start: 0,
      rows: Array.from({ length: 8 }, (_, i) => ({
        label: `部门项目${i + 1}验证`,
        budget: 1e9,
        value: i % 2 ? 1e9 : 0,
      })),
    },
  ];
  const errors = await page.evaluate(async (cases) => {
    const path = '/src/editor/charts/financial.ts';
    const { renderFinancialChart } = await import(/* @vite-ignore */ path);
    const errors: string[] = [];
    for (const input of cases) {
      const host = document.createElement('div');
      host.style.cssText =
        'position:fixed;left:0;top:0;width:1472px;height:700px;background:white;z-index:9999';
      document.body.append(host);
      const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="1472" height="700">${renderFinancialChart({ ...input, version: 1, theme: 'review', title: '边界数据', period: '2026 Q3', unit: '万元', direction: input.kind === 'budget' ? 'lower' : 'higher' })}</svg>`;
      host.append(
        document.importNode(
          new DOMParser().parseFromString(xml, 'image/svg+xml').documentElement,
          true,
        ),
      );
      for (const text of host.querySelectorAll<SVGTextElement>('text')) {
        const b = text.getBBox();
        if (b.x < 0 || b.y < 0 || b.x + b.width > 1472 || b.y + b.height > 700)
          errors.push(`${input.kind}: outside ${text.textContent}`);
      }
      const values = [
        ...host.querySelectorAll<SVGTextElement>('[data-sf-chart-bar] [data-sf-chart-managed]'),
      ];
      for (let i = 0; i < values.length; i++)
        for (let j = i + 1; j < values.length; j++) {
          const a = values[i].getBBox(),
            b = values[j].getBBox();
          if (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
          )
            errors.push(`${input.kind}: numeric labels overlap`);
        }
      if (/NaN|Infinity/.test(xml)) errors.push('nonfinite');
      host.remove();
    }
    return errors;
  }, cases);
  expect(errors).toEqual([]);
});
