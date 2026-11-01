import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
});
async function selectText(page: Page) {
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.root.querySelector('#client-card text')]);
  }, bridge);
}
test('text fitting keeps native measurement nodes out of snapshots; invalid drafts stay local', async ({
  page,
}) => {
  await selectText(page);
  const text = page.locator('[data-svg-host] #client-card text').first();
  const count = await page.locator('[data-svg-host] text').count();
  const original = await text.getAttribute('font-size');
  await page.getByLabel('排版宽度', { exact: true }).fill('120');
  await page.getByRole('button', { name: '缩小字号适应宽度', exact: true }).click();
  expect(parseFloat((await text.getAttribute('font-size')) || '')).toBeLessThan(Number(original));
  await expect(page.locator('[data-svg-host] text')).toHaveCount(count);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(text).toHaveAttribute('font-size', original!);
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  await expect(page.locator('[data-svg-host] text')).toHaveCount(count);
  const valid = await text.getAttribute('font-size');
  const size = page.getByLabel('字号', { exact: true });
  await size.fill('-1');
  await size.press('Enter');
  await expect(size).toHaveValue('-1');
  await expect(size).toHaveAttribute('aria-invalid', 'true');
  await expect(text).toHaveAttribute('font-size', valid!);
});
test('held arrow-key nudge and continuous color changes each form a single transaction', async ({
  page,
}) => {
  await selectText(page);
  const originalFill = await page
    .locator('[data-svg-host] #client-card text')
    .first()
    .getAttribute('fill');
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 5; i++) await page.keyboard.down('ArrowRight');
  await page.keyboard.up('ArrowRight');
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.past.length,
      bridge,
    ),
  ).toBe(1);
  const color = page.getByLabel('填充颜色选择器', { exact: true });
  await color.focus();
  await color.fill('#ff0000');
  await color.fill('#00ff00');
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.past.length,
      bridge,
    ),
  ).toBe(1);
  await color.blur();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.past.length,
      bridge,
    ),
  ).toBe(2);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect(await page.locator('[data-svg-host] #client-card text').first().getAttribute('fill')).toBe(
    originalFill,
  );
});
test('cleaning review can be cancelled without replacing work, and can explicitly proceed', async ({
  page,
}) => {
  await selectText(page);
  const malicious = await fs.readFile('src/fixtures/security.svg', 'utf8');
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(malicious);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '导入前检查' })).toBeVisible();
  await expect(page.locator('[data-svg-host] #client-card')).toHaveCount(1);
  await page.getByRole('button', { name: '取消导入', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card')).toHaveCount(1);
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(malicious);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await page.getByRole('button', { name: '清理并继续', exact: true }).click();
  await expect(page.locator('[data-svg-host] #safe')).toHaveCount(1);
  await expect(page.locator('[data-svg-host] script')).toHaveCount(0);
});
test('recovery retains unexported status across refresh and new tabs preserve work when the legacy backup quota fails', async ({
  page,
}) => {
  await selectText(page);
  await page.getByLabel('字号', { exact: true }).fill('25');
  await page.getByLabel('字号', { exact: true }).press('Enter');
  await expect(page.getByText('已写入本地恢复副本', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-svg-host] #client-card text').first()).toHaveAttribute(
    'font-size',
    '25px',
  );
  await expect(page.getByText('有未导出修改', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'svg-finisher.previous') throw new DOMException('quota', 'QuotaExceededError');
      set.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(await fs.readFile('src/fixtures/flowchart.svg', 'utf8'));
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await expect(page.getByRole('tablist', { name: 'SVG 文档' }).getByRole('tab')).toHaveCount(2);
  await page.getByRole('tab', { name: 'architecture.svg', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card text').first()).toHaveAttribute(
    'font-size',
    '25px',
  );
});
test('overlap candidates select obscured objects and selected descendants reveal their layer path', async ({
  page,
}) => {
  const card = await page.locator('[data-svg-host] #client-card rect').first().boundingBox();
  await page.mouse.click(card!.x + 35, card!.y + 35, { button: 'right' });
  const menu = page.getByRole('dialog', { name: '选择下方对象' });
  await expect(menu).toBeVisible();
  await menu
    .getByRole('button', { name: /<rect>/ })
    .first()
    .click();
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await selectText(page);
  await page.getByRole('button', { name: '显示图层面板', exact: true }).click();
  await expect(page.locator('[data-testid="layer-client-card"] + .layer-row')).toBeVisible();
});
test('fifteen additional SVGs match native browser rendering at original dimensions', async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1800, height: 1100 });
  for (const filename of (await fs.readdir('src/fixtures/regression')).filter((f) =>
    f.endsWith('.svg'),
  )) {
    const xml = await fs.readFile(path.join('src/fixtures/regression', filename), 'utf8');
    await page.evaluate(
      async ({ module, xml }) => {
        const { engine, useUI } = await import(/* @vite-ignore */ module);
        engine.importSvg(xml);
        useUI.getState().set({ zoom: 1, pan: { x: 60, y: 60 }, grid: false });
      },
      { module: bridge, xml },
    );
    await page.mouse.move(10, 10);
    const actual = await page.locator('[data-svg-host] > svg').screenshot();
    const native = await page.context().newPage();
    await native.setContent(`<style>body{margin:0}</style>${xml}`);
    const expected = await native.locator('body > svg').screenshot();
    const a = PNG.sync.read(actual),
      b = PNG.sync.read(expected);
    expect([a.width, a.height], filename).toEqual([b.width, b.height]);
    const difference = pixelmatch(a.data, b.data, undefined, a.width, a.height, {
      threshold: 0.15,
    });
    await info.attach(filename + '-editor', { body: actual, contentType: 'image/png' });
    await info.attach(filename + '-native', { body: expected, contentType: 'image/png' });
    expect(difference / (a.width * a.height), filename).toBeLessThan(0.001);
    await native.close();
  }
});
test('insertion panels remain usable at desktop and compact desktop widths', async ({ page }) => {
  await page.getByRole('button', { name: '插入', exact: true }).click();
  await page.getByRole('tab', { name: 'Icon 图标', exact: true }).click();
  await expect(page.getByRole('button', { name: '插入数据库', exact: true })).toBeVisible();
  await page.screenshot({ path: 'tests/v1-insert-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole('button', { name: '插入数据库', exact: true })).toBeVisible();
  await page.screenshot({ path: 'tests/v1-insert-compact.png', fullPage: true });
  await page.getByRole('button', { name: '插入数据库', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="数据库"]')).toHaveCount(1);
});

test('endpoint movement uses the inverse nested matrix and leaves the other endpoint fixed', async ({
  page,
}) => {
  const xml = await fs.readFile('src/fixtures/regression/line-geometry.svg', 'utf8');
  await page.evaluate(
    async ({ module, xml }) => {
      const { engine } = await import(/* @vite-ignore */ module);
      engine.importSvg(xml);
      engine.select([engine.root.querySelector('#horizontal')]);
    },
    { module: bridge, xml },
  );
  const positions = () =>
    page.locator('[data-svg-host] #horizontal').evaluate((element) => {
      const line = element as SVGLineElement,
        m = line.getScreenCTM()!;
      const a = new DOMPoint(line.x1.baseVal.value, line.y1.baseVal.value).matrixTransform(m);
      const b = new DOMPoint(line.x2.baseVal.value, line.y2.baseVal.value).matrixTransform(m);
      return { a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } };
    });
  const before = await positions();
  await page.mouse.move(before.b.x, before.b.y);
  await page.mouse.down();
  await page.mouse.move(before.b.x + 30, before.b.y + 20, { steps: 5 });
  await page.mouse.up();
  const after = await positions();
  expect(after.a.x).toBeCloseTo(before.a.x, 5);
  expect(after.a.y).toBeCloseTo(before.a.y, 5);
  expect(after.b.x - before.b.x).toBeCloseTo(30, 3);
  expect(after.b.y - before.b.y).toBeCloseTo(20, 3);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect((await positions()).b.x).toBeCloseTo(before.b.x, 5);
});

test('wheel navigation pans by default and modifier-wheel zoom remains separate', async ({
  page,
}) => {
  const state = () =>
    page.evaluate(async (module) => {
      const { useUI } = await import(/* @vite-ignore */ module);
      const s = useUI.getState();
      return { pan: s.pan, zoom: s.zoom };
    }, bridge);
  const canvas = await page.locator('[data-canvas]').boundingBox();
  await page.mouse.move(canvas!.x + 15, canvas!.y + 150);
  const before = await state();
  await page.mouse.wheel(40, 80);
  await expect.poll(async () => (await state()).pan.x).toBeCloseTo(before.pan.x - 40, 1);
  expect((await state()).zoom).toBe(before.zoom);
  const dpr = await page.evaluate(() => devicePixelRatio);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -120);
  await page.keyboard.up('Control');
  await expect.poll(async () => (await state()).zoom).toBeGreaterThan(before.zoom);
  expect(await page.evaluate(() => devicePixelRatio)).toBe(dpr);
});
