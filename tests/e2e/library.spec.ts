import { test, expect } from '@playwright/test';
const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor');
  await expect(page.getByRole('complementary', { name: '插入面板' })).toBeVisible();
});

test('expanded shape categories provide real editable flow symbols and searchable containers', async ({
  page,
}) => {
  const panel = page.getByRole('complementary', { name: '插入面板' });
  await expect(panel.getByRole('status')).toContainText('74');
  await page.getByRole('button', { name: '流程图分类', exact: true }).click();
  expect(await panel.locator('.asset-tile').count()).toBeGreaterThanOrEqual(20);
  await page.screenshot({ path: 'tests/library-flowchart-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'tests/library-flowchart-compact.png', fullPage: true });
  await page.getByRole('button', { name: '插入数据库圆柱', exact: true }).click();
  const database = page.locator('[data-svg-host] [data-label="数据库圆柱"]');
  await expect(database).toBeVisible();
  await page.getByLabel('填充', { exact: true }).fill('#fde68a');
  await page.getByLabel('填充', { exact: true }).press('Enter');
  await expect(database).toHaveCSS('fill', 'rgb(253, 230, 138)');
  await page.getByRole('button', { name: '全部图形分类', exact: true }).click();
  await page.getByLabel('搜索素材').fill('泳道');
  await expect(panel.locator('.asset-tile')).toHaveCount(2);
  await page.getByRole('button', { name: '插入横向泳道', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="横向泳道"]')).toBeVisible();
});

test('full Lucide library stays paginated, supports Chinese and English search and inserts offline once loaded', async ({
  page,
  context,
}) => {
  await page.getByRole('tab', { name: 'Icon 图标' }).click();
  const panel = page.getByRole('complementary', { name: '插入面板' });
  await expect(panel.getByRole('status').filter({ hasText: '共' })).toContainText('1,903');
  await page.getByRole('button', { name: '全部图标分类', exact: true }).click();
  await expect(panel.locator('.asset-tile')).toHaveCount(60);
  const first = await panel.locator('.asset-tile').first().getAttribute('aria-label');
  await page.getByRole('button', { name: '下一页素材', exact: true }).click();
  await expect(panel.locator('.asset-tile')).toHaveCount(60);
  expect(await panel.locator('.asset-tile').first().getAttribute('aria-label')).not.toBe(first);
  await page.getByLabel('搜索素材').fill('数据库备份');
  await expect(panel.locator('.asset-tile')).toHaveCount(1);
  await page.getByRole('button', { name: '插入数据库 备份', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="数据库 备份"]')).toBeVisible();
  await page.getByLabel('搜索素材').fill('git branch');
  expect(await panel.locator('.asset-tile').count()).toBeGreaterThan(0);
  await page.getByLabel('搜索素材').fill('');
  await page.getByRole('button', { name: '开发与AI分类', exact: true }).click();
  await page.evaluate(async (module) => {
    await import(/* @vite-ignore */ module);
  }, bridge);
  await context.setOffline(true);
  try {
    await page.getByRole('button', { name: '插入工作流', exact: true }).click();
    await expect(page.locator('[data-svg-host] [data-label="工作流"]')).toBeVisible();
    const xml = await page.evaluate(
      async (module) => (await import(/* @vite-ignore */ module)).engine.exportSvg(),
      bridge,
    );
    expect(xml).toContain('Lucide Icons');
    expect(xml).not.toContain('https://cdn.');
  } finally {
    await context.setOffline(false);
  }
});

test('every bundled shape inserts with valid native bounds and an exact undo', async ({ page }) => {
  const result = await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    const catalog = '/src/editor/insert/catalog.ts';
    const { shapes, assetSource } = await import(/* @vite-ignore */ catalog);
    const before = engine.exportSvg();
    const invalid: string[] = [];
    for (const asset of shapes) {
      const b = engine.viewBox();
      engine.insertSvg(
        assetSource(asset),
        { x: b.x + b.width / 2, y: b.y + b.height / 2 },
        { label: asset.label, width: asset.width, height: asset.height, flatten: true },
      );
      const box = engine.selectionBounds();
      if (!box || !Object.values(box).every(Number.isFinite) || box.width + box.height < 0.1)
        invalid.push(asset.id);
      engine.undo();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (engine.exportSvg() !== before) invalid.push(asset.id + ':undo');
    }
    return { count: shapes.length, invalid };
  }, bridge);
  expect(result.count).toBe(74);
  expect(result.invalid).toEqual([]);
});
