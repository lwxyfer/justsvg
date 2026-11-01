import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor#lang=zh');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
});

test('permanent panels, document order and right-side canvas preferences', async ({ page }) => {
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  const tabs = await page.locator('.document-strip').boundingBox();
  const tools = await page.locator('.actionbar').boundingBox();
  expect(tabs!.y + tabs!.height).toBeLessThanOrEqual(tools!.y);
  await expect(
    page.locator('.topbar').getByRole('button', { name: '插入', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: /收起.*面板|切换.*面板/ })).toHaveCount(0);
  const settings = page.locator('.inspector-panel').getByRole('region', { name: '画布设置' });
  await settings.getByRole('checkbox', { name: '仅 Ctrl / Cmd + 滚轮缩放' }).uncheck();
  await settings.getByLabel('工作区底色').fill('#d0d0d0');
  await expect(page.locator('[data-canvas]')).toHaveCSS('background-color', 'rgb(208, 208, 208)');
  await page.reload();
  await expect(
    settings.getByRole('checkbox', { name: '仅 Ctrl / Cmd + 滚轮缩放' }),
  ).not.toBeChecked();
  await page.screenshot({ path: 'output/editor-layout-desktop.png' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.left-sidebar')).toBeVisible();
  await expect(page.locator('.inspector-panel')).toBeVisible();
  await page.screenshot({ path: 'output/editor-layout-compact.png' });
  await page.setViewportSize({ width: 540, height: 768 });
  await expect(page.locator('.left-sidebar')).toBeAttached();
  await expect(page.locator('.inspector-panel')).toHaveCSS('display', 'flex');
});

test('all action menus dismiss outside, on action, on focus departure and Escape', async ({
  page,
}) => {
  for (const selector of [
    '.file-dropdown',
    '.export-dropdown',
    '.alignment-tools .dropdown',
  ]) {
    const menu = page.locator(selector);
    await menu.locator('summary').click();
    await expect(menu).toHaveAttribute('open', '');
    await page.locator('.document-strip').click({ position: { x: 700, y: 15 } });
    await expect(menu).not.toHaveAttribute('open');
    await menu.locator('summary').click();
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open');
    await expect(menu.locator('summary')).toBeFocused();
  }
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await expect(page.locator('.file-dropdown')).not.toHaveAttribute('open');
  await page.getByRole('dialog').getByRole('button', { name: '关闭窗口' }).click();
  await page.locator('.export-dropdown > summary').click();
  await page.getByRole('button', { name: '新建 SVG', exact: true }).focus();
  await expect(page.locator('.export-dropdown')).not.toHaveAttribute('open');
});

for (const format of ['PNG', 'JPEG', 'WEBP']) {
  test(`${format} download renders static SVG at 2x and retains unsaved vector changes`, async ({
    page,
  }) => {
    await page.evaluate(async (m) => {
      const { documents, engine } = await import(/* @vite-ignore */ m);
      documents.open(
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="-10 -10 80 40"><defs><linearGradient id="paint"><stop stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs><rect x="0" y="0" width="40" height="20" fill="url(#paint)"/></svg>',
        'raster.svg',
      );
      engine.transaction('edit', () => engine.root!.setAttribute('data-edited', 'yes'));
    }, bridge);
    await page.locator('.export-dropdown > summary').click();
    await page.getByLabel('图片倍率').selectOption('2');
    await expect(page.locator('.export-dropdown')).toHaveAttribute('open', '');
    const waiting = page.waitForEvent('download');
    await page.getByRole('button', { name: `下载 ${format}`, exact: true }).click();
    const download = await waiting;
    const extension = format === 'JPEG' ? 'jpg' : format.toLowerCase();
    expect(download.suggestedFilename()).toBe(`raster@2x.${extension}`);
    const bytes = await fs.readFile((await download.path())!);
    if (format === 'PNG') {
      const image = PNG.sync.read(bytes);
      expect([image.width, image.height]).toEqual([160, 80]);
      expect(image.data[3]).toBe(0);
      const center = (30 * image.width + 40) * 4;
      expect(image.data[center + 3]).toBe(255);
      expect(image.data[center]).toBeGreaterThan(0);
      expect(image.data[center + 2]).toBeGreaterThan(0);
    } else {
      if (format === 'JPEG') expect([...bytes.subarray(0, 3)]).toEqual([255, 216, 255]);
      else expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
      const pixels = await page.evaluate(
        async ({ data, mime }) => {
          const image = new Image();
          image.src = `data:${mime};base64,${data}`;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(image, 0, 0);
          return {
            width: image.width,
            height: image.height,
            corner: [...ctx.getImageData(0, 0, 1, 1).data],
          };
        },
        { data: bytes.toString('base64'), mime: `image/${format.toLowerCase()}` },
      );
      expect([pixels.width, pixels.height]).toEqual([160, 80]);
      expect(pixels.corner).toEqual(format === 'JPEG' ? [255, 255, 255, 255] : [0, 0, 0, 0]);
    }
    expect(
      await page.evaluate(async (m) => (await import(/* @vite-ignore */ m)).engine.dirty, bridge),
    ).toBe(true);
    await expect(page.locator('.export-dropdown')).not.toHaveAttribute('open');
  });
}

test('oversized raster export reports error without altering the document', async ({ page }) => {
  const result = await page.evaluate(async (module) => {
    const { rasterizeSvg } = await import(/* @vite-ignore */ module);
    try {
      await rasterizeSvg('<svg/>', 10000, 10000, 'png', 3);
    } catch (e) {
      return (e as Error).message;
    }
  }, '/src/app/raster.ts');
  expect(result).toContain('超出限制');
});
