import { test, expect } from '@playwright/test';
const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor#lang=zh');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
});

test('header removes redundant identity and links to the project; settings is a focused dialog', async ({
  page,
}) => {
  const header = page.locator('.topbar');
  await expect(header.locator('.file-title,.version-badge,.more-dropdown')).toHaveCount(0);
  await expect(header).not.toContainText('architecture.svg');
  await expect(header).not.toContainText('BETA');
  const github = header.getByRole('link', { name: '在 GitHub 查看源码' });
  await expect(github).toHaveAttribute('href', 'https://github.com/lwxyfer/justsvg');
  await expect(github).toHaveAttribute('target', '_blank');
  await header.getByRole('button', { name: '设置', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '设置', exact: true });
  await expect(dialog.getByRole('radio', { name: '简体中文' })).toBeChecked();
  await expect(dialog.getByRole('radio', { name: 'English' })).not.toBeChecked();
  await page.screenshot({ path: 'output/editor-settings-zh-desktop.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(header.getByRole('button', { name: '设置', exact: true })).toBeFocused();
  await page.setViewportSize({ width: 1024, height: 768 });
  await header.getByRole('button', { name: '设置', exact: true }).click();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'output/editor-settings-zh-compact.png' });
  await page.locator('.modal-backdrop').click({ position: { x: 10, y: 10 } });
  await expect(dialog).toHaveCount(0);
});

test('explicit language choice updates the editor and survives refresh and navigation without altering the SVG', async ({
  page,
}) => {
  const xml = await page.evaluate(
    async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
    bridge,
  );
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('radio', { name: 'English', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export SVG', exact: true })).toBeVisible();
  await expect(page.getByLabel('Document name', { exact: true })).toHaveValue('architecture.svg');
  await expect(page).toHaveURL(/#lang=en$/);
  expect(await page.evaluate(() => localStorage.getItem('justsvg.home.language'))).toBe('en');
  await page.screenshot({ path: 'output/editor-settings-en-desktop.png' });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Export SVG', exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(xml);
  await page.getByRole('link', { name: 'Examples', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goBack();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('radio', { name: '简体中文', exact: true }).check();
  await expect(page.getByRole('dialog', { name: '设置', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '完成', exact: true }).click();
  await expect(page.getByRole('button', { name: '导出 SVG', exact: true })).toBeVisible();
});

test('language follows hash navigation and synchronized browser preferences', async ({ page }) => {
  await page.evaluate(() => {
    location.hash = 'lang=en';
  });
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('button', { name: '设置', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'justsvg.home.language', newValue: 'zh' }),
    ),
  );
  await expect(page.getByRole('button', { name: '设置', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#lang=zh$/);
});

test('settings blocks editor shortcuts and retains keyboard help', async ({ page }) => {
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('#client-card')!]);
  }, bridge);
  const original = await page.locator('[data-svg-host] #client-card').getAttribute('transform');
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Delete');
  await expect(page.locator('[data-svg-host] #client-card')).toHaveAttribute(
    'transform',
    original!,
  );
  await page.getByRole('button', { name: '键盘快捷键', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '键盘快捷键', exact: true })).toBeVisible();
});
