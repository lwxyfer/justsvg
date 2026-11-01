import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('justsvg.home.language', 'zh'));
});

const output = '.impeccable/review/home-records';
test('default homepage uses only the record deck and previews, locks and resets the page palette', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page
    .getByRole('navigation', { name: '首页导航', exact: true })
    .getByRole('link', { name: '品牌风格', exact: true })
    .click();
  await expect(page.locator('.record-sleeve')).toHaveCount(36);
  await expect(page.locator('.style-panorama')).toHaveCount(0);
  const rack = page.locator('.record-viewport');
  const box = (await rack.boundingBox())!;
  await page.mouse.move(box.x + 800, box.y + 180);
  await expect(page.locator('.home-page')).toHaveAttribute('data-record-brand', 'figma');
  await page.mouse.move(box.x + 896, box.y + 180);
  await expect(page.locator('.home-page')).toHaveAttribute('data-record-brand', 'spotify');
  await page.locator('.record-sleeve[data-record="spotify"]').press('Enter');
  await expect(page.locator('.record-sleeve[data-record="spotify"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.mouse.move(10, 10);
  await expect(page.locator('.home-page')).toHaveAttribute('data-record-brand', 'spotify');
  await expect(page.locator('.home-page')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
  await expect(page.getByRole('link', { name: '打开风格示例', exact: true })).toHaveAttribute(
    'href',
    '/examples?example=brand-spotify-rag',
  );
  await page.getByRole('button', { name: '还原首页风格', exact: true }).click();
  await expect(page.locator('.home-page')).not.toHaveAttribute('data-record-brand');
  await expect(page.locator('.home-page')).toHaveAttribute('data-theme', 'native');
  expect(errors).toEqual([]);
});

test('a short mouse stroke continuously turns adjacent sleeves instead of waiting for a card boundary', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#brand-styles');
  const box = (await page.locator('.record-viewport').boundingBox())!;
  const cover = page.locator('.record-sleeve[data-record="figma"]');
  await page.mouse.move(box.x + 800, box.y + 180);
  const face = await cover.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(box.x + 824, box.y + 180);
  const partTurn = await cover.evaluate((el) => getComputedStyle(el).transform);
  expect(partTurn).not.toBe(face);
  await expect(page.locator('.record-current strong')).toHaveText('Figma');
  const turns = await page
    .locator('.record-sleeve')
    .evaluateAll((elements) =>
      [3, 5].map((i) => new DOMMatrixReadOnly(getComputedStyle(elements[i]).transform).m13),
    );
  expect(turns[0] * turns[1]).toBeLessThan(0);
  for (const [x, name] of [
    [608, 'Stripe'],
    [704, 'OpenAI'],
    [800, 'Figma'],
    [896, 'Spotify'],
    [992, 'Claude'],
  ] as const) {
    await page.mouse.move(box.x + x, box.y + 180);
    await expect(page.locator('.record-current strong')).toHaveText(name);
  }
  await page.mouse.move(box.x + 800, box.y + 180);
  await page.locator('.record-sleeve[data-record="figma"]').press('Enter');
  await page.mouse.move(10, 10);
  await page.evaluate(() => document.getElementById('brand-styles')!.scrollIntoView());
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/continuous-deck.png` });
});

test('hovering the deck edge keeps browsing; leaving stops the pan', async ({ page }) => {
  await page.goto('/#brand-styles');
  const viewport = page.locator('.record-viewport');
  const box = (await viewport.boundingBox())!;
  const before = await viewport.evaluate((el) => el.scrollLeft);
  await page.mouse.move(box.x + box.width - 8, box.y + 180);
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before + 150);
  await page.mouse.move(10, 10);
  const stopped = await viewport.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(200);
  expect(await viewport.evaluate((el) => el.scrollLeft)).toBeCloseTo(stopped, 0);
});

test('fast reversals redirect the moving fan without waiting for the previous flip', async ({
  page,
}) => {
  await page.goto('/#brand-styles');
  const box = (await page.locator('.record-viewport').boundingBox())!;
  const cover = page.locator('.record-sleeve[data-record="figma"]');
  await page.mouse.move(box.x + 800, box.y + 180);
  await page.mouse.move(box.x + 1040, box.y + 180, { steps: 8 });
  await page.mouse.move(box.x + 776, box.y + 180, { steps: 8 });
  await expect(page.locator('.record-current strong')).toHaveText('Figma');
  const moving = await cover.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(350);
  const settled = await cover.evaluate((el) => getComputedStyle(el).transform);
  expect(settled).not.toBe(moving);
  await page.mouse.move(box.x + 800, box.y + 180);
  await page.waitForTimeout(350);
  const rotation = await cover.evaluate(
    (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m13,
  );
  expect(Math.abs(rotation)).toBeLessThan(0.01);
});

test('keyboard reaches every record; reduced motion and mobile keep the real SVG artwork usable', async ({
  page,
}) => {
  await mkdir(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page
    .getByRole('navigation', { name: '首页导航', exact: true })
    .getByRole('link', { name: '品牌风格', exact: true })
    .click();
  await page.locator('.record-sleeve[data-record="figma"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.record-sleeve[data-record="spotify"]')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('.record-sleeve[data-record="replicate"]')).toBeFocused();
  await expect(page.getByRole('button', { name: '下一种品牌风格', exact: true })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(page.locator('.record-sleeve[data-record="vercel"]')).toBeFocused();
  await page.locator('.record-sleeve[data-record="figma"]').focus();
  await page.keyboard.press('Enter');
  await page
    .locator('.record-sleeve[data-record="figma"]')
    .evaluate((el) => (el as HTMLElement).blur());
  await page.mouse.move(10, 10);
  await page.evaluate(() => document.getElementById('brand-styles')!.scrollIntoView());
  await page.screenshot({ path: `${output}/desktop.png` });
  await expect(page.locator('.record-sleeve img')).toHaveCount(36);
  expect(
    await page
      .locator('.record-sleeve img')
      .evaluateAll((images) =>
        images.every((img) => (img as HTMLImageElement).getAttribute('src')?.includes('.svg')),
      ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.record-sleeve[data-record="figma"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await page
    .locator('.record-sleeve[data-record="figma"]')
    .evaluate((el) => (el as HTMLElement).blur());
  await page.evaluate(() => document.getElementById('brand-styles')!.scrollIntoView());
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: `${output}/mobile.png` });
  await expect(page.getByRole('link', { name: '查看原版第二屏', exact: true })).toHaveCount(0);
});

test('touch taps lock a sleeve and next-record controls keep all styles reachable', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => localStorage.setItem('justsvg.home.language', 'zh'));
  const page = await context.newPage();
  await page.goto('/#brand-styles');
  await expect(page.getByRole('heading', { name: '为技术图选一种品牌风格。' })).toBeInViewport();
  await page.locator('.record-sleeve[data-record="figma"]').tap();
  await expect(page.locator('.record-sleeve[data-record="figma"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: '下一种品牌风格', exact: true }).tap();
  await expect(page.locator('.record-current strong')).toHaveText('Spotify');
  await page.locator('.record-sleeve[data-record="spotify"]').tap();
  await expect(page.locator('.record-sleeve[data-record="spotify"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const rack = (await page.locator('.record-viewport').boundingBox())!;
  const initial = await page.locator('.record-viewport').evaluate((el) => el.scrollLeft);
  const touch = await context.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 300, y: rack.y + 140 }],
  });
  for (let x = 280; x >= 80; x -= 20)
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: rack.y + 140 }],
    });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect
    .poll(() => page.locator('.record-viewport').evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(initial + 80);
  await context.close();
});
