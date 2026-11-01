import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor');
});
test('common shapes are first, categories are directly visible, and browsing does not modify the SVG', async ({
  page,
}) => {
  const panel = page.getByRole('complementary', { name: '插入面板' });
  const headers = panel.locator('.asset-group-heading');
  await expect(headers.first()).toHaveAttribute('aria-label', '常用图形分类');
  await expect(headers.first()).toHaveAttribute('aria-expanded', 'true');
  const common = page.getByRole('region', { name: '常用图形', exact: true });
  await expect(common.locator('.asset-tile')).toHaveCount(12);
  for (const name of ['矩形', '圆角矩形', '文字标签', '直线', '单向箭头'])
    await expect(common.getByRole('button', { name: `插入${name}`, exact: true })).toBeVisible();
  for (const category of ['基础图形', '流程图', '连接线', '块状箭头', '容器与注释', '架构符号'])
    await expect(
      panel.getByRole('button', { name: `${category}分类`, exact: true }),
    ).toHaveAttribute('aria-expanded', 'false');
  const before = await page
    .locator('[data-svg-host] > svg')
    .evaluate((svg) => new XMLSerializer().serializeToString(svg));
  await panel.getByRole('button', { name: '流程图分类', exact: true }).click();
  await expect(common).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: '流程图', exact: true }).locator('.asset-tile'),
  ).toHaveCount(21);
  await headers.first().click();
  await expect(common).toBeVisible();
  await headers.first().focus();
  await headers.first().press('ArrowDown');
  await expect(headers.nth(1)).toBeFocused();
  expect(
    await page
      .locator('[data-svg-host] > svg')
      .evaluate((svg) => new XMLSerializer().serializeToString(svg)),
  ).toBe(before);
  await page.screenshot({ path: 'tests/categories-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'tests/categories-compact.png', fullPage: true });
});
test('search finds shapes across collapsed categories and Icons keep bounded previews', async ({
  page,
}) => {
  await page.getByLabel('搜索素材').fill('泳道');
  await expect(page.locator('.asset-tile')).toHaveCount(2);
  await page.getByRole('button', { name: '插入横向泳道', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="横向泳道"]')).toBeVisible();
  await page.getByLabel('搜索素材').fill('');
  await expect(page.getByRole('button', { name: '常用图形分类' })).toBeVisible();
  await page.getByRole('tab', { name: 'Icon 图标' }).click();
  await expect(
    page.getByRole('region', { name: '常用图标', exact: true }).locator('.asset-tile'),
  ).toHaveCount(12);
  await expect(page.getByRole('button', { name: '常用图标分类' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page.getByRole('button', { name: '网络与云分类', exact: true }).click();
  await expect(page.getByRole('region', { name: '常用图标' })).toHaveCount(0);
  const network = page.getByRole('region', { name: '网络与云', exact: true });
  expect(await network.locator('.asset-tile').count()).toBeLessThanOrEqual(60);
  await network.getByRole('button', { name: '插入云', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="云"]')).toBeVisible();
});
