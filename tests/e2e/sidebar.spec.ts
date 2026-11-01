import { test, expect } from '@playwright/test';

test('materials replace layers by default and remain available after insert, drag and undo', async ({
  page,
}) => {
  await page.goto('/editor');
  const materials = page.getByRole('complementary', { name: '插入面板', exact: true });
  await expect(materials).toBeVisible();
  await expect(page.getByRole('complementary', { name: '图层面板' })).toHaveCount(0);
  const rect = materials.getByRole('button', { name: /^插入\s*圆角矩形$/, exact: true });
  await rect.click();
  await expect(materials).toBeVisible();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(page.locator('[data-svg-host] [data-label="圆角矩形"]')).toHaveCount(0);
  const canvas = page.locator('[data-canvas]');
  await rect.dragTo(canvas, { targetPosition: { x: 140, y: 220 } });
  await expect(page.locator('[data-svg-host] [data-label="圆角矩形"]')).toHaveCount(1);
  await expect(materials).toBeVisible();
  const b = await page.locator('[data-svg-host] [data-label="圆角矩形"]').boundingBox(),
    c = await canvas.boundingBox();
  expect(b!.x + b!.width / 2).toBeCloseTo(c!.x + 140, 0);
  expect(b!.y + b!.height / 2).toBeCloseTo(c!.y + 220, 0);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.app-shell')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBe(768);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'tests/sidebar-compact.png', fullPage: true });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'tests/sidebar-desktop.png', fullPage: true });
});

test('sidebar switches between materials and layers, stays open, and remembers the current panel', async ({
  page,
}) => {
  await page.goto('/editor');
  await page.getByRole('button', { name: '显示图层面板', exact: true }).click();
  await expect(page.getByRole('complementary', { name: '图层面板' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: '插入面板' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('complementary', { name: '图层面板' })).toBeVisible();
  await expect(page.getByRole('button', { name: '收起左侧面板', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '显示插入面板', exact: true }).click();
  await expect(page.getByRole('complementary', { name: '插入面板' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: '图层面板' })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Icon 图标' }).click();
  await page.getByLabel('搜索素材').fill('数据库');
  await page.getByRole('button', { name: /^插入\s*数据库$/, exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="数据库"]')).toHaveCount(1);
  await expect(page.getByRole('complementary', { name: '插入面板' })).toBeVisible();
});

test('old layer-only preferences migrate to the new default material sidebar', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'svg-finisher.preferences',
      JSON.stringify({ leftOpen: true, grid: false, sections: { 布局: true } }),
    ),
  );
  await page.goto('/editor');
  await expect(page.getByRole('complementary', { name: '插入面板' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: '图层面板' })).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('svg-finisher.preferences')!).grid),
  ).toBe(false);
});
