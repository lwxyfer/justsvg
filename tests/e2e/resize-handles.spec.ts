import { test, expect, type Page } from '@playwright/test';
const bridge = '/tests/e2e/bridge.ts';
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650"><g transform="translate(50 40) scale(1.1)"><g id="card" transform="translate(60 80)"><rect id="frame" width="240" height="160" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/><text id="label" x="24" y="42" font-size="20">节点 Text<tspan x="24" dy="32" font-size="14" font-weight="bold">第二行 123</tspan></text></g></g><text id="standalone" x="450" y="350" font-size="24">Independent text</text></svg>';
async function setup(page: Page, selector = '#card') {
  await page.goto('/editor#lang=zh');
  await page.evaluate(
    async ({ m, svg, selector }) => {
      const { engine, useUI } = await import(/* @vite-ignore */ m);
      engine.importSvg(svg, 'resize.svg');
      engine.select([engine.root!.querySelector(selector)!]);
      useUI.getState().set({ zoom: 1, pan: { x: 35, y: 35 }, aspectLocked: true, snap: false });
    },
    { m: bridge, svg, selector },
  );
  await expect(page.getByTestId('selection-box')).toBeVisible();
}
async function drag(page: Page, handle: string, dx: number, dy: number) {
  const box = (await page.locator(`[data-handle=${handle}]`).boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  await page.mouse.up();
}
for (const handle of ['n', 's', 'e', 'w']) {
  test(`${handle} midpoint changes only its axis and fixes the opposite edge even with aspect lock`, async ({
    page,
  }) => {
    await setup(page);
    await expect(page.locator('.resize-handle')).toHaveCount(8);
    const frame = page.locator('[data-svg-host] #frame'),
      label = page.locator('[data-svg-host] #label');
    const old = (await frame.boundingBox())!,
      oldText = (await label.boundingBox())!;
    const horizontal = ['e', 'w'].includes(handle);
    await drag(page, handle, handle === 'w' ? -80 : 80, handle === 'n' ? -50 : 50);
    const current = (await frame.boundingBox())!;
    expect(current.width).toBeCloseTo(old.width + (horizontal ? 80 : 0), 0);
    expect(current.height).toBeCloseTo(old.height + (horizontal ? 0 : 50), 0);
    if (handle === 'w') expect(current.x + current.width).toBeCloseTo(old.x + old.width, 1);
    if (handle === 'n') expect(current.y + current.height).toBeCloseTo(old.y + old.height, 1);
    expect((await label.boundingBox())!.width).toBeCloseTo(oldText.width, 2);
    expect((await label.boundingBox())!.height).toBeCloseTo(oldText.height, 2);
    await expect(frame).toHaveCSS('stroke-width', '2px');
  });
}

async function glyph(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const text = el as unknown as SVGTextElement,
      c = text.getExtentOfChar(0),
      m = text.getScreenCTM();
    return {
      content: text.textContent,
      font: getComputedStyle(text).fontSize,
      char: [c.width, c.height],
      linear: m ? [m.a, m.b, m.c, m.d].map((v) => Number(v.toFixed(6))) : [1, 0, 0, 1],
    };
  });
}

test('direct mixed text resize changes its frame but never scales glyphs or modifies span styles', async ({
  page,
}) => {
  await setup(page, '#label');
  const text = page.locator('[data-svg-host] #label');
  const before = await glyph(page, '[data-svg-host] #label'),
    original = await text.innerHTML();
  const frame = (await page.getByTestId('selection-box').boundingBox())!;
  const xml = await page.evaluate(
    async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
    bridge,
  );
  await drag(page, 'se', 90, 40);
  expect(await glyph(page, '[data-svg-host] #label')).toEqual(before);
  expect(await text.innerHTML()).toBe(original);
  expect((await page.getByTestId('selection-box').boundingBox())!.width).toBeGreaterThan(
    frame.width + 50,
  );
  await expect(page.locator('[data-svg-host] #frame')).toHaveAttribute('width', '240');
  await page.keyboard.press('ControlOrMeta+z');
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(xml);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  expect(await glyph(page, '[data-svg-host] #label')).toEqual(before);
  await page.screenshot({ path: 'output/text-frame-fixed-glyphs.png' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.screenshot({ path: 'output/text-frame-fixed-glyphs-compact.png' });
});

test('plain text wraps in a narrower frame while side handles and numeric dimensions preserve font and glyph proportions', async ({
  page,
}) => {
  await setup(page, '#standalone');
  const text = page.locator('[data-svg-host] #standalone'),
    before = await glyph(page, '[data-svg-host] #standalone');
  await drag(page, 'w', 90, 80);
  expect(await glyph(page, '[data-svg-host] #standalone')).toEqual(before);
  expect(await text.locator('tspan').count()).toBeGreaterThan(1);
  await drag(page, 's', 80, 35);
  expect(await glyph(page, '[data-svg-host] #standalone')).toEqual(before);
  await page.getByRole('button', { name: '比例已锁定', exact: true }).click();
  await page.getByLabel('宽度', { exact: true }).fill('350');
  await page.getByLabel('宽度', { exact: true }).press('Enter');
  expect((await page.getByTestId('selection-box').boundingBox())!.width).toBeCloseTo(350, 1);
  expect(await glyph(page, '[data-svg-host] #standalone')).toEqual(before);
  await expect(text).toHaveText('Independent text');
});

test('multiselect, container resizing and same-size operations never scale any text', async ({
  page,
}) => {
  await setup(page);
  const label = await glyph(page, '[data-svg-host] #label'),
    standalone = await glyph(page, '[data-svg-host] #standalone');
  await drag(page, 'se', 100, 60);
  expect(await glyph(page, '[data-svg-host] #label')).toEqual(label);
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([
      engine.root!.querySelector('#label')!,
      engine.root!.querySelector('#standalone')!,
    ]);
    const b = engine.selectionBounds()!;
    engine.resize(b.width * 1.3, b.height * 1.3);
    engine.align('width');
  }, bridge);
  expect(await glyph(page, '[data-svg-host] #label')).toEqual(label);
  expect(await glyph(page, '[data-svg-host] #standalone')).toEqual(standalone);
});

test('cancelling a text resize or clicking a handle leaves the original SVG unchanged', async ({
  page,
}) => {
  await setup(page, '#label');
  const before = await page.evaluate(
    async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
    bridge,
  );
  const h = (await page.locator('[data-handle=e]').boundingBox())!;
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.x + 80, h.y + 10, { steps: 5 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(before);
  await page.locator('[data-handle=se]').click();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(before);
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.past.length,
      bridge,
    ),
  ).toBe(0);
});

test('automatic lines retain font size despite author tspan rules and survive export, import and editing', async ({
  page,
}) => {
  await setup(page, '#standalone');
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.transaction('author styles', () => {
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = 'tspan {font-size:99px!important; font-weight:900!important}';
      engine.root!.prepend(style);
    });
  }, bridge);
  const before = await glyph(page, '[data-svg-host] #standalone');
  await drag(page, 'w', 100, 0);
  expect(await glyph(page, '[data-svg-host] #standalone')).toEqual(before);
  for (const span of await page.locator('[data-svg-host] #standalone tspan').all())
    await expect(span).toHaveCSS('font-size', '24px');
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    const xml = engine.exportSvg();
    engine.importSvg(xml, 'wrapped.svg');
    engine.select([engine.root!.querySelector('#standalone')!]);
  }, bridge);
  await expect(page.getByTestId('selection-box')).toBeVisible();
  expect(await glyph(page, '[data-svg-host] #standalone')).toEqual(before);
  await page.getByLabel('属性文字 1', { exact: true }).fill('Updated words');
  await page.getByLabel('属性文字 1', { exact: true }).press('Tab');
  await drag(page, 'e', 50, 0);
  await expect(page.locator('[data-svg-host] #standalone')).toHaveText('Updated words');
  await expect(page.locator('[data-svg-host] #standalone')).toHaveCSS('font-size', '24px');
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.multiline(engine.root!.querySelector('#standalone')!, 'First\nSecond', 32.4);
  }, bridge);
  for (const span of await page.locator('[data-svg-host] #standalone tspan').all())
    await expect(span).toHaveCSS('font-size', '24px');
  await expect(page.locator('[data-svg-host] #standalone')).toHaveText('First\nSecond');
});

test('groups without frames and nested SVG viewports keep screen glyph sizes during resizing', async ({
  page,
}) => {
  await setup(page);
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650"><g id="outer" transform="translate(100 100)"><svg width="240" height="160" viewBox="0 0 120 80"><text id="nested" x="10" y="30" font-size="18">Nested text</text><circle cx="20" cy="60" r="5" fill="red"/></svg><text id="sibling" x="300" y="100" font-size="22">Sibling</text></g></svg>',
    );
    engine.select([engine.root!.querySelector('#outer')!]);
  }, bridge);
  await expect(page.getByTestId('selection-box')).toBeVisible();
  const nested = await glyph(page, '[data-svg-host] #nested'),
    sibling = await glyph(page, '[data-svg-host] #sibling');
  await drag(page, 'se', 90, 50);
  expect(await glyph(page, '[data-svg-host] #nested')).toEqual(nested);
  expect(await glyph(page, '[data-svg-host] #sibling')).toEqual(sibling);
});
