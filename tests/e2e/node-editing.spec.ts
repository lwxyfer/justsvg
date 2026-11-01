import { test, expect, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
const bridge = '/tests/e2e/bridge.ts';
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><g transform="translate(60 50) scale(1.2)"><g id="node" transform="translate(40 30)"><rect id="frame" width="220" height="140" rx="12" fill="none" stroke="#123456" stroke-width="3"/><text id="label" x="25" y="40" font-size="18">Stable label</text><g id="decoration" transform="translate(25 65)"><circle r="10" fill="red"/></g></g></g><rect id="other" x="500" y="100" width="90" height="90" fill="none" stroke="blue"/></svg>';
async function setup(page: Page, xml = svg) {
  await page.goto('/editor#lang=zh');
  await page.evaluate(
    async ({ m, xml }) => {
      const { engine, useUI } = await import(/* @vite-ignore */ m);
      engine.importSvg(xml, 'nodes.svg');
      useUI.getState().set({ zoom: 1, pan: { x: 25, y: 25 }, snap: false, aspectLocked: false });
    },
    { m: bridge, xml },
  );
  await expect(page.locator('[data-svg-host] #frame')).toBeVisible();
}
async function select(page: Page, selector: string) {
  await page.evaluate(
    async ({ m, selector }) => {
      const { engine } = await import(/* @vite-ignore */ m);
      engine.select([engine.root!.querySelector(selector)!]);
    },
    { m: bridge, selector },
  );
}
for (const handle of ['se', 'nw']) {
  test(`${handle} drag changes the frame, preserves content/stroke, and is one undo transaction`, async ({
    page,
  }) => {
    await setup(page);
    await select(page, '#node');
    const frame = page.locator('[data-svg-host] #frame'),
      text = page.locator('[data-svg-host] #label'),
      icon = page.locator('[data-svg-host] #decoration');
    const oldFrame = (await frame.boundingBox())!,
      oldText = (await text.boundingBox())!,
      oldIcon = (await icon.boundingBox())!;
    const before = await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    );
    const h = (await page.locator(`[data-handle=${handle}]`).boundingBox())!;
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    const direction = handle === 'se' ? 1 : -1;
    await page.mouse.move(
      h.x + h.width / 2 + direction * 100,
      h.y + h.height / 2 + direction * 65,
      { steps: 15 },
    );
    await page.mouse.up();
    const now = (await frame.boundingBox())!,
      nowText = (await text.boundingBox())!,
      nowIcon = (await icon.boundingBox())!;
    expect(now.width).toBeCloseTo(oldFrame.width + 100, 0);
    expect(now.height).toBeCloseTo(oldFrame.height + 65, 0);
    expect(nowText.width).toBeCloseTo(oldText.width, 2);
    expect(nowText.height).toBeCloseTo(oldText.height, 2);
    expect(nowIcon.width).toBeCloseTo(oldIcon.width, 2);
    expect(nowIcon.height).toBeCloseTo(oldIcon.height, 2);
    await expect(frame).toHaveCSS('stroke-width', '3px');
    await expect(text).toHaveCSS('font-size', '18px');
    expect(
      await page.evaluate(
        async (m) => (await import(/* @vite-ignore */ m)).engine.past.length,
        bridge,
      ),
    ).toBe(1);
    await page.keyboard.press('ControlOrMeta+z');
    expect(
      await page.evaluate(
        async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
        bridge,
      ),
    ).toBe(before);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    expect((await frame.boundingBox())!.width).toBeCloseTo(now.width, 2);
  });
}

test('numeric resizing uses the same geometry behavior and a cancelled gesture restores everything', async ({
  page,
}) => {
  await setup(page);
  await select(page, '#node');
  const text = page.locator('[data-svg-host] #label'),
    oldText = (await text.boundingBox())!;
  await page.getByLabel('宽度', { exact: true }).fill('400');
  await page.getByLabel('宽度', { exact: true }).press('Enter');
  expect((await text.boundingBox())!.width).toBeCloseTo(oldText.width, 2);
  const before = await page.evaluate(
    async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
    bridge,
  );
  const h = (await page.locator('[data-handle=se]').boundingBox())!;
  await page.mouse.move(h.x + 3, h.y + 3);
  await page.mouse.down();
  await page.mouse.move(h.x + 80, h.y + 60, { steps: 5 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(before);
});

test('transparent interiors hover, select and drag; locks and frontmost order still apply', async ({
  page,
}) => {
  await setup(page);
  const frame = page.locator('[data-svg-host] #frame'),
    b = (await frame.boundingBox())!;
  await page.mouse.move(b.x + b.width - 40, b.y + b.height - 30);
  await expect(page.locator('.hover-box')).toBeVisible();
  await page.mouse.down();
  await page.mouse.move(b.x + b.width - 10, b.y + b.height - 10, { steps: 5 });
  await page.mouse.up();
  expect((await frame.boundingBox())!.x).toBeCloseTo(b.x + 30, 0);
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.lock(engine.root!.querySelector('#node')!.parentElement!);
    engine.select([]);
  }, bridge);
  await page.mouse.click(b.x + 100, b.y + 90);
  await expect(page.getByTestId('selection-box')).toHaveCount(0);
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.lock(engine.root!.querySelector('#node')!.parentElement!);
    engine.transaction('overlay', () => {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.id = 'front';
      for (const [key, value] of Object.entries({
        x: '130',
        y: '100',
        width: '150',
        height: '120',
        fill: 'none',
        stroke: 'red',
      }))
        r.setAttribute(key, value);
      engine.root!.append(r);
    });
  }, bridge);
  const front = (await page.locator('[data-svg-host] #front').boundingBox())!;
  await page.mouse.click(front.x + 70, front.y + 60);
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.selection[0]?.id,
      bridge,
    ),
  ).toBe('front');
});

test('direct rectangle resize keeps its border width in the rendered SVG', async ({ page }) => {
  await setup(page);
  await select(page, '#frame');
  const frame = page.locator('[data-svg-host] #frame');
  const before = (await frame.boundingBox())!;
  const h = (await page.locator('[data-handle=se]').boundingBox())!;
  await page.mouse.move(h.x + 3, h.y + 3);
  await page.mouse.down();
  await page.mouse.move(h.x + 90, h.y + 60, { steps: 8 });
  await page.mouse.up();
  expect((await frame.boundingBox())!.width).toBeGreaterThan(before.width + 70);
  await expect(frame).toHaveCSS('stroke-width', '3px');
});

test('icon color is a picker with live preview and one undo step', async ({ page }) => {
  await setup(page);
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.insertSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2"><path d="M4 4H20V20H4Z"/></svg>',
      { x: 400, y: 300 },
      { label: 'Test icon', width: 48, height: 48, icon: true, flatten: false },
    );
  }, bridge);
  const picker = page.getByLabel('图标颜色', { exact: true });
  await expect(picker).toHaveAttribute('type', 'color');
  await picker.fill('#ff0000');
  await picker.fill('#00aa55');
  await picker.press('Enter');
  const icon = page.locator('[data-svg-host] [data-monochrome=true] path');
  await expect(icon).toHaveCSS('stroke', 'rgb(0, 170, 85)');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(icon).toHaveCSS('stroke', 'rgb(51, 65, 85)');
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(icon).toHaveCSS('stroke', 'rgb(0, 170, 85)');
  expect(Number(await page.getByLabel('宽度', { exact: true }).inputValue())).toBeGreaterThan(0);
  await page.screenshot({ path: 'output/editor-icon-color.png' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'output/editor-icon-color-compact.png' });
});

test('resizing a freeform path preserves the rendered stroke width', async ({ page }) => {
  await setup(page);
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.transaction('path', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.id = 'freeform';
      path.setAttribute('d', 'M400 300H500V380H400Z');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#ff0000');
      path.setAttribute('stroke-width', '4');
      engine.root!.append(path);
    });
  }, bridge);
  const root = page.locator('[data-svg-host] > svg');
  const thickness = (bytes: Buffer) => {
    const image = PNG.sync.read(bytes);
    let count = 0;
    for (let y = 285; y < 315; y++) {
      const i = (y * image.width + 450) * 4;
      if (image.data[i] > 220 && image.data[i + 1] < 40 && image.data[i + 2] < 40) count++;
    }
    return count;
  };
  const before = thickness(await root.screenshot());
  await select(page, '#freeform');
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.resize(200, 160);
    engine.select([]);
  }, bridge);
  expect(thickness(await root.screenshot())).toBe(before);
  expect(before).toBe(4);
});

test('shrinking below content size keeps the frame as the resize target across later gestures', async ({
  page,
}) => {
  await setup(page);
  await select(page, '#node');
  const label = page.locator('[data-svg-host] #label');
  const original = (await label.boundingBox())!;
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.resize(90, 60);
  }, bridge);
  const frame = page.locator('[data-svg-host] #frame');
  expect((await page.getByTestId('selection-box').boundingBox())!.width).toBeCloseTo(90, 0);
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.resize(300, 180);
  }, bridge);
  expect((await page.getByTestId('selection-box').boundingBox())!.width).toBeCloseTo(300, 0);
  expect(Number(await frame.getAttribute('width'))).toBeCloseTo(250, 3);
  expect((await label.boundingBox())!.width).toBeCloseTo(original.width, 2);
  expect((await label.boundingBox())!.height).toBeCloseTo(original.height, 2);
});
