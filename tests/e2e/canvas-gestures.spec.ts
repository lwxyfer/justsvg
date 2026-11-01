import { test, expect } from '@playwright/test';
const bridge = '/tests/e2e/bridge.ts';
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="white"/><g id="a"><rect x="100" y="100" width="100" height="80" fill="none" stroke="blue"/><text x="110" y="130">A</text></g><g id="b"><rect x="400" y="100" width="100" height="80" fill="none" stroke="red"/><text x="410" y="130">B</text></g></svg>';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor#lang=zh');
  await page.evaluate(
    async ({ m, svg }) => {
      const { engine, useUI } = await import(/* @vite-ignore */ m);
      engine.importSvg(svg, 'gestures.svg');
      useUI.getState().set({ pan: { x: 80, y: 80 }, zoom: 1, snap: false, wheelModifier: true });
    },
    { m: bridge, svg },
  );
  await expect(page.locator('[data-svg-host] #a')).toBeVisible();
});

const state = (page: import('@playwright/test').Page) =>
  page.evaluate(async (m) => {
    const { engine, useUI } = await import(/* @vite-ignore */ m);
    const { zoom, pan } = useUI.getState();
    return {
      zoom,
      pan,
      history: engine.past.length,
      xml: engine.exportSvg(),
      selection: engine.selection.map((el: Element) => el.id),
    };
  }, bridge);

test('uninterrupted wheel pan follows every event while the SVG moves under a stationary pointer', async ({
  page,
}) => {
  const card = (await page.locator('[data-svg-host] #a').boundingBox())!;
  await page.mouse.move(card.x + 30, card.y + 30);
  const before = await state(page),
    root = await page.locator('[data-svg-host] > svg').elementHandle();
  for (let i = 1; i <= 30; i++) {
    await page.mouse.wheel(8, 6);
    await expect.poll(async () => (await state(page)).pan.x).toBeCloseTo(before.pan.x - i * 8, 1);
  }
  const after = await state(page);
  expect(after.pan.y).toBeCloseTo(before.pan.y - 180, 1);
  expect(after.zoom).toBe(before.zoom);
  expect(after.xml).toBe(before.xml);
  expect(after.history).toBe(0);
  expect(await root!.evaluate((el) => el.isConnected)).toBe(true);
});

test('wheel bursts retain all fractional deltas and normalize line mode', async ({ page }) => {
  const before = await state(page);
  await page.locator('[data-svg-host] #a rect').evaluate((target) => {
    for (let i = 0; i < 160; i++)
      target.dispatchEvent(
        new WheelEvent('wheel', {
          deltaX: 0.75,
          deltaY: 1.25,
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
  });
  await expect.poll(async () => (await state(page)).pan.x).toBeCloseTo(before.pan.x - 120, 1);
  expect((await state(page)).pan.y).toBeCloseTo(before.pan.y - 200, 1);
  await page
    .locator('[data-canvas]')
    .dispatchEvent('wheel', { deltaX: 2, deltaY: 3, deltaMode: 1 });
  await expect.poll(async () => (await state(page)).pan.x).toBeCloseTo(before.pan.x - 152, 1);
  expect((await state(page)).pan.y).toBeCloseTo(before.pan.y - 248, 1);
});

test('pinch zoom is modestly faster and keeps the point under the cursor fixed', async ({
  page,
}) => {
  const canvas = (await page.locator('[data-canvas]').boundingBox())!;
  const x = canvas.x + 350,
    y = canvas.y + 300;
  const before = await state(page),
    dpr = await page.evaluate(() => devicePixelRatio);
  const anchor = { x: (350 - before.pan.x) / before.zoom, y: (300 - before.pan.y) / before.zoom };
  await page
    .locator('[data-canvas]')
    .dispatchEvent('wheel', { deltaY: -100, ctrlKey: true, clientX: x, clientY: y });
  await expect.poll(async () => (await state(page)).zoom).toBeCloseTo(Math.exp(0.18), 5);
  const after = await state(page);
  expect(after.pan.x + anchor.x * after.zoom).toBeCloseTo(350, 5);
  expect(after.pan.y + anchor.y * after.zoom).toBeCloseTo(300, 5);
  expect(after.xml).toBe(before.xml);
  expect(after.history).toBe(0);
  expect(await page.evaluate(() => devicePixelRatio)).toBe(dpr);
});

test('holding and dragging empty space selects with a marquee, with Shift adding and Escape cancelling', async ({
  page,
}) => {
  const canvas = (await page.locator('[data-canvas]').boundingBox())!;
  const before = await state(page);
  const drag = async (left: number, right: number) => {
    await page.mouse.move(canvas.x + left, canvas.y + 40);
    await page.mouse.down();
    await page.mouse.move(canvas.x + right, canvas.y + 300, { steps: 8 });
    await expect(page.locator('.marquee')).toBeVisible();
    await page.screenshot({ path: 'output/canvas-marquee-drag.png' });
    await page.mouse.up();
  };
  await drag(40, 350);
  expect((await state(page)).selection).toEqual(['a']);
  expect((await state(page)).pan).toEqual(before.pan);
  await page.keyboard.down('Shift');
  await drag(440, 620);
  await page.keyboard.up('Shift');
  expect((await state(page)).selection.sort()).toEqual(['a', 'b']);
  await page.mouse.move(canvas.x + 40, canvas.y + 40);
  await page.mouse.down();
  await page.mouse.move(canvas.x + 300, canvas.y + 300, { steps: 5 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect((await state(page)).selection.sort()).toEqual(['a', 'b']);
  await page.screenshot({ path: 'output/canvas-marquee-selection.png' });
});

test('Space and middle-button drags still pan and never edit the SVG', async ({ page }) => {
  const canvas = page.locator('[data-canvas]'),
    area = (await canvas.boundingBox())!,
    before = await state(page);
  await page.mouse.move(area.x + 30, area.y + 60);
  await page.keyboard.down('Space');
  await page.mouse.down();
  await page.mouse.move(area.x + 100, area.y + 110, { steps: 5 });
  await expect(canvas).toHaveCSS('cursor', 'grabbing');
  await page.mouse.up();
  await page.keyboard.up('Space');
  await page.mouse.move(area.x + 30, area.y + 60);
  await page.mouse.down({ button: 'middle' });
  await page.mouse.move(area.x + 70, area.y + 90, { steps: 5 });
  await page.mouse.up({ button: 'middle' });
  expect((await state(page)).pan).toEqual({ x: before.pan.x + 110, y: before.pan.y + 80 });
  expect((await state(page)).xml).toBe(before.xml);
  expect((await state(page)).history).toBe(0);
});

test('element properties no longer show Details disclosures in either language', async ({
  page,
}) => {
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('#a text')!]);
  }, bridge);
  await expect(page.locator('.inspector-panel .inspector-help')).toHaveCount(0);
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('radio', { name: 'English', exact: true }).check();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.locator('.inspector-panel').getByText('Details', { exact: true })).toHaveCount(
    0,
  );
  await page.screenshot({ path: 'output/editor-properties-no-details.png' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'output/editor-properties-no-details-compact.png' });
});
