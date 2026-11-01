import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor#lang=zh');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
});

test('multiple files open in order and invalid files do not block the others', async ({ page }) => {
  await page.locator('.topbar input[type=file]').setInputFiles([
    {
      name: 'flowchart.svg',
      mimeType: 'image/svg+xml',
      buffer: await fs.readFile('src/fixtures/flowchart.svg'),
    },
    { name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg><bad></svg>') },
    {
      name: 'infographic.svg',
      mimeType: 'image/svg+xml',
      buffer: await fs.readFile('src/fixtures/infographic.svg'),
    },
  ]);
  await expect(page.getByRole('tablist', { name: 'SVG 文档' }).getByRole('tab')).toHaveCount(3);
  await expect(page.getByRole('tab', { name: 'infographic.svg', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('alert')).toContainText('bad.svg');
});

for (const accept of [true, false]) {
  test(`batch pauses for reviews and continues after ${accept ? 'accept' : 'cancel'}`, async ({
    page,
  }) => {
    await page
      .locator('.topbar input[type=file]')
      .setInputFiles([
        'src/fixtures/flowchart.svg',
        'src/fixtures/security.svg',
        'src/fixtures/security.svg',
        'src/fixtures/infographic.svg',
      ]);
    for (let i = 0; i < 2; i++) {
      const review = page.getByRole('dialog', { name: '导入前检查', exact: true });
      await expect(review).toBeVisible();
      await review
        .getByRole('button', { name: accept ? '清理并继续' : '取消导入', exact: true })
        .click();
    }
    await expect(page.getByRole('tab', { name: 'infographic.svg', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tablist', { name: 'SVG 文档' }).getByRole('tab')).toHaveCount(
      accept ? 5 : 3,
    );
  });
}

test('import dialog and canvas drops accept multiple files', async ({ page }) => {
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page
    .getByRole('dialog')
    .locator('input[type=file]')
    .setInputFiles(['src/fixtures/flowchart.svg', 'src/fixtures/infographic.svg']);
  await expect(page.getByRole('tablist', { name: 'SVG 文档' }).getByRole('tab')).toHaveCount(3);
  const data = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    for (const name of ['one.svg', 'two.svg'])
      transfer.items.add(
        new File(['<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>'], name, {
          type: 'image/svg+xml',
        }),
      );
    return transfer;
  });
  await page.locator('[data-canvas]').dispatchEvent('drop', { dataTransfer: data });
  await expect(page.getByRole('tab', { name: 'two.svg', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tablist', { name: 'SVG 文档' }).getByRole('tab')).toHaveCount(5);
});

test('blank is untitled with white paint; rename follows tabs, recovery and export', async ({
  page,
}) => {
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'untitled', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('button', { name: '纯色', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByLabel('背景颜色', { exact: true })).toHaveValue('#ffffff');
  const name = page.getByLabel('文档名称', { exact: true });
  await name.fill('架构方案');
  await name.press('Enter');
  await expect(page.getByRole('tab', { name: '架构方案', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await name.fill('wrong');
  await name.press('Escape');
  await expect(name).toHaveValue('架构方案');
  await name.fill('');
  await name.press('Enter');
  await expect(page.getByRole('alert')).toContainText('名称需');
  await name.fill('架构方案');
  await name.press('Enter');
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await page.getByRole('tab', { name: '架构方案', exact: true }).click();
  await expect(name).toHaveValue('架构方案');
  await page.screenshot({ path: 'output/editor-document-name.png' });
  await page.reload();
  await expect(name).toHaveValue('架构方案');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出 SVG', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('架构方案-finished.svg');
  expect(await fs.readFile((await download.path())!, 'utf8')).toContain('fill="#ffffff"');
});
