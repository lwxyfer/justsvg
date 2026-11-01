import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor#lang=zh');
  await expect(page.locator('[data-svg-host] #paper')).toBeVisible();
});

test('canvas settings replace false empty state and yield all panel space to selected elements', async ({
  page,
}) => {
  const settings = page.getByRole('region', { name: '画布设置' });
  await expect(settings).toBeVisible();
  await expect(page.getByRole('button', { name: '粘贴你的 SVG' })).toHaveCount(0);
  await page.screenshot({ path: 'output/canvas-panel-desktop.png' });
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('#client-card')!]);
  }, bridge);
  await expect(settings).toHaveCount(0);
  await expect(page.locator('.panel-heading')).toContainText('元素属性');
  await page.screenshot({ path: 'output/properties-panel-desktop.png' });
  await page.locator('[data-canvas]').click({ position: { x: 10, y: 90 } });
  await expect(settings).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(page.locator('.app-shell > .topbar')).toHaveCount(1);
  await page.screenshot({ path: 'output/canvas-panel-compact.png' });
});

test('resize preserves artwork geometry, handles undo, and keeps page paint in bounds', async ({
  page,
}) => {
  const old = await page.locator('[data-svg-host] #client-card').getAttribute('transform');
  await page.getByLabel('画布宽度', { exact: true }).fill('1200');
  await page.getByLabel('画布宽度', { exact: true }).press('Enter');
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('viewBox', '0 0 1200 640');
  await expect(page.locator('[data-svg-host] #client-card')).toHaveAttribute('transform', old!);
  await expect(page.locator('[data-svg-host] #paper')).toHaveAttribute('width', '1200');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('width', '960');
  await page.getByLabel('画布宽度', { exact: true }).fill('500');
  await page.getByLabel('画布宽度', { exact: true }).press('Escape');
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('width', '960');
  await page.getByLabel('尺寸预设').selectOption('1080x1080');
  await expect(page.getByLabel('尺寸预设')).toHaveValue('1080x1080');
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('viewBox', '0 0 1080 1080');
  await page.getByLabel('画布宽度', { exact: true }).fill('-1');
  await page.getByLabel('画布宽度', { exact: true }).press('Enter');
  await expect(page.getByRole('alert')).toContainText('尺寸范围');
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('width', '1080');
});

for (const mode of ['渐变', '点阵', '网格']) {
  test(`${mode} background exports, reimports and remains document-specific`, async ({ page }) => {
    await page.getByRole('button', { name: mode, exact: true }).first().click();
    await page.getByLabel('背景颜色', { exact: true }).fill('#eef2ff');
    const owned = page.locator('[data-svg-host] rect[data-sf-page-background]');
    await expect(owned).toHaveCount(1);
    await expect(owned).toHaveCSS('fill', /url/);
    await page.screenshot({ path: `output/canvas-background-${mode}.png` });
    await page.getByRole('button', { name: '导出 SVG', exact: true }).click();
    // Capture actual download separately below: ensure export source includes native paint.
    const xml = await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    );
    expect(xml).toContain(mode === '渐变' ? '<linearGradient' : '<pattern');
    await page.locator('.export-dropdown > summary').click();
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: '下载 PNG', exact: true }).click();
    expect((await fs.stat((await (await pending).path())!)).size).toBeGreaterThan(1000);
    await page.evaluate(
      async ({ m, xml }) => {
        const { documents } = await import(/* @vite-ignore */ m);
        documents.open(xml, 'background.svg');
      },
      { m: bridge, xml },
    );
    await expect(page.getByRole('button', { name: mode, exact: true }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
    await expect(page.getByRole('button', { name: '纯色', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('tab', { name: 'background.svg', exact: true }).click();
    await expect(page.getByRole('button', { name: mode, exact: true }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
}
