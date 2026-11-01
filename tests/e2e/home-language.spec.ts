import { test, expect } from '@playwright/test';
import { mkdir, readFile, readdir } from 'node:fs/promises';

const output = '.impeccable/review/home-language';
test('English is the default for the page, SVG text and all brand sleeves', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#home-title')).toHaveText('Open-sourcedraw.io alternative.');
  const text = await page.locator('.home-page').innerText();
  expect(text.replaceAll('中文', '')).not.toMatch(/[\u4e00-\u9fff]/);
  expect(await page.locator('.home-page svg').allTextContents()).not.toEqual(
    expect.arrayContaining([expect.stringMatching(/[\u4e00-\u9fff]/)]),
  );
  await page.getByRole('button', { name: 'View diagram prompt', exact: true }).click();
  await expect(page.getByLabel('Full Skill prompt', { exact: true })).not.toHaveValue(
    /[\u4e00-\u9fff]/,
  );
  await expect(page.getByLabel('Full Skill prompt', { exact: true })).toHaveValue(
    /Use English for all diagram text/,
  );
  await expect(page.locator('.record-sleeve img')).toHaveCount(36);
  for (const image of await page.locator('.record-sleeve img').all())
    expect(await image.getAttribute('src')).toContain('/home/brands-en/');
  const files = (await readdir('public/home/brands-en')).filter((file) => file.endsWith('.svg'));
  expect(files).toHaveLength(36);
  for (const file of files)
    expect(await readFile(`public/home/brands-en/${file}`, 'utf8')).not.toMatch(/[\u4e00-\u9fff]/);
  expect(errors).toEqual([]);
});

test('language choice persists, switches SVG annotations and preserves the edited diagram', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Node name', { exact: true }).fill('My retriever');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('#home-title')).toContainText('开源替代。');
  await expect(page.locator('.hero-diagram')).toContainText('文档与知识');
  await expect(page.getByLabel('节点名称', { exact: true })).toHaveValue('My retriever');
  await expect(page.locator('.record-sleeve img').first()).not.toHaveAttribute('src', /brands-en/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('.hero-diagram')).not.toContainText(/[\u4e00-\u9fff]/);
  await page.getByRole('button', { name: 'Open in editor', exact: true }).click();
  await expect(page).toHaveURL(/\/editor$/);
  const xml = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine } = await import(/* @vite-ignore */ bridge);
    return engine.exportSvg();
  });
  expect(xml).not.toMatch(/[\u4e00-\u9fff]/);
});

test('both languages fit desktop and mobile with complete SVG scenes', async ({ page }) => {
  await mkdir(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const language of ['en', 'zh']) {
    await page
      .getByRole('button', { name: language === 'en' ? 'English' : '中文', exact: true })
      .click();
    for (const width of [1600, 816, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const overflowing = await page
        .locator('.native-copy h1,.native-copy p,.home-header,.chapter-heading h2')
        .evaluateAll((elements) =>
          elements
            .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
            .map((el) => el.textContent),
        );
      expect(overflowing).toEqual([]);
      await page.screenshot({ path: `${output}/${language}-${width}-hero.png` });
      if (width !== 816) {
        for (const section of [
          'brand-records',
          'skill-chapter',
          'editor-chapter',
          'document-footer',
        ])
          await page
            .locator(`.${section}`)
            .screenshot({ path: `${output}/${language}-${width}-${section}.png` });
      }
    }
  }
});
