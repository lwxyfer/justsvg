import { test, expect, type Page } from '@playwright/test';
const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
});
async function choose(page: Page, selector: string) {
  await page.evaluate(
    async ({ module, selector }) => {
      const { engine } = await import(/* @vite-ignore */ module);
      engine.select([engine.root.querySelector(selector)]);
    },
    { module: bridge, selector },
  );
}
async function insert(page: Page, name: string) {
  await page.getByRole('button', { name: '插入', exact: true }).click();
  await page.getByRole('button', { name: `插入${name}`, exact: true }).click();
}

test('shape gallery inserts native geometry at the viewport center with one undo and no tool switch', async ({
  page,
}) => {
  const original = await page.locator('[data-svg-host] #client-card').getAttribute('transform');
  await insert(page, '圆角矩形');
  const selected = page.locator('[data-svg-host] [data-label="圆角矩形"]');
  await expect(selected).toHaveCount(1);
  expect(await selected.evaluate((el) => el.localName)).toBe('rect');
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await page.getByLabel('填充', { exact: true }).fill('#c7d2fe');
  await page.getByLabel('填充', { exact: true }).press('Enter');
  await expect(selected).toHaveCSS('fill', 'rgb(199, 210, 254)');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  const b = await selected.boundingBox(),
    canvas = await page.locator('[data-canvas]').boundingBox();
  expect(b!.x + b!.width / 2).toBeCloseTo(canvas!.x + canvas!.width / 2, 0);
  expect(b!.y + b!.height / 2).toBeCloseTo(canvas!.y + canvas!.height / 2, 0);
  expect(await page.locator('[data-svg-host] #client-card').getAttribute('transform')).toBe(
    original,
  );
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(selected).toHaveCount(0);
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  await expect(selected).toHaveCount(1);
  await page.getByRole('button', { name: '插入', exact: true }).click();
  await page.getByRole('button', { name: '插入单向箭头', exact: true }).click();
  const arrow = page.locator('[data-svg-host] [data-label="单向箭头"]');
  const reference = await arrow.getAttribute('marker-end');
  expect(reference).toContain('sf-insert-');
});

test('offline icons support bilingual search, recent items, independent vector resources and custom import', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:5173') && !r.url().startsWith('data:'))
      requests.push(r.url());
  });
  await page.getByRole('button', { name: '插入', exact: true }).click();
  await page.getByRole('tab', { name: 'Icon 图标' }).click();
  await page.getByLabel('搜索素材').fill('database');
  await page.getByRole('button', { name: '插入数据库', exact: true }).click();
  const database = page.locator('[data-svg-host] [data-label="数据库"]');
  await expect(database.locator('path,ellipse')).not.toHaveCount(0);
  await expect(database.locator('desc')).toContainText('Lucide');
  await page.getByLabel('图标颜色', { exact: true }).fill('#ef4444');
  await page.getByLabel('图标颜色', { exact: true }).press('Enter');
  await expect(database.locator('path').first()).toHaveCSS('stroke', 'rgb(239, 68, 68)');
  const iconBox = await database.boundingBox();
  if (
    (await page
      .getByRole('button', { name: '布局', exact: true })
      .getAttribute('aria-expanded')) === 'false'
  )
    await page.getByRole('button', { name: '布局', exact: true }).click();
  const width = page.getByLabel('宽度', { exact: true });
  await width.fill(String(Number(await width.inputValue()) * 1.5));
  await width.press('Enter');
  const resized = await database.boundingBox();
  expect(resized!.width / resized!.height).toBeCloseTo(iconBox!.width / iconBox!.height, 2);
  await page.getByRole('button', { name: '插入', exact: true }).click();
  await page.getByLabel('搜索素材').fill('');
  await page.getByRole('button', { name: '最近使用分类', exact: true }).click();
  await expect(page.getByRole('button', { name: '插入数据库', exact: true })).toBeVisible();
  await page.locator('.custom-icon summary').click();
  const custom =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 40 40"><defs><linearGradient id="paint"><stop stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs><circle cx="10" cy="10" r="15" fill="url(#paint)"/></svg>';
  await page.getByLabel('自定义图标 SVG').fill(custom);
  await page.getByRole('button', { name: '插入图标', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card')).toHaveCount(1);
  const first = page.locator('[data-svg-host] [data-label="自定义 SVG 图标"]');
  await expect(first.locator('circle')).toHaveCount(1);
  expect(await first.locator('circle').getAttribute('fill')).toContain('sf-insert-');
  await page.getByRole('button', { name: '插入', exact: true }).click();
  // The persistent material sidebar keeps the custom SVG section expanded.
  if (!(await page.locator('.custom-icon').evaluate((el) => el.hasAttribute('open'))))
    await page.locator('.custom-icon summary').click();
  await page.getByLabel('自定义图标 SVG').fill(custom);
  await page.getByRole('button', { name: '插入图标', exact: true }).click();
  const ids = await page
    .locator('[data-svg-host] [data-label="自定义 SVG 图标"] linearGradient')
    .evaluateAll((els) => els.map((e) => e.id));
  expect(new Set(ids).size).toBe(2);
  const exported = await page.evaluate(
    async (module) => (await import(/* @vite-ignore */ module)).engine.exportSvg(),
    bridge,
  );
  const native = await page.context().newPage();
  await native.setContent(exported);
  await expect(native.locator('[data-label="数据库"]')).toBeVisible();
  await expect(native.locator('[data-label="自定义 SVG 图标"]')).toHaveCount(2);
  await native.close();
  await page.evaluate(
    async ({ module, xml }) => (await import(/* @vite-ignore */ module)).engine.importSvg(xml),
    { module: bridge, xml: exported },
  );
  await expect(page.locator('[data-svg-host] [data-label="自定义 SVG 图标"]')).toHaveCount(2);
  expect(requests).toEqual([]);
});

test('dragging an asset into a nested transformed group maps the insertion point correctly', async ({
  page,
}) => {
  await page.evaluate(async (module) => {
    const { engine, useUI } = await import(/* @vite-ignore */ module);
    engine.scope = engine.root.querySelector('#client-card');
    engine.select([]);
    useUI.getState().set({ zoom: 1.3, pan: { x: 25, y: 30 } });
  }, bridge);
  const canvas = await page.locator('[data-canvas]').boundingBox();
  const x = canvas!.x + 300,
    y = canvas!.y + 300;
  await page.evaluate(
    ({ x, y }) => {
      const data = new DataTransfer();
      data.setData('application/x-svg-finisher-asset', 'shape-diamond');
      document
        .querySelector('[data-canvas]')!
        .dispatchEvent(
          new DragEvent('drop', { bubbles: true, clientX: x, clientY: y, dataTransfer: data }),
        );
    },
    { x, y },
  );
  const diamond = page.locator('[data-svg-host] #client-card [data-label="菱形"]');
  await expect(diamond).toHaveCount(1);
  const b = await diamond.boundingBox();
  expect(b!.x + b!.width / 2).toBeCloseTo(x, 1);
  expect(b!.y + b!.height / 2).toBeCloseTo(y, 1);
});

test('source edits sanitize atomically and preserve the undo chain and viewport', async ({
  page,
}) => {
  await choose(page, '#client-card');
  await page.keyboard.press('ArrowRight');
  const before = await page.evaluate(async (module) => {
    const { engine, useUI } = await import(/* @vite-ignore */ module);
    return { xml: engine.exportSvg(), pan: useUI.getState().pan };
  }, bridge);
  await page.getByRole('button', { name: '源码', exact: true }).click();
  const source = page.getByLabel('导出 SVG 源码');
  await source.fill('<svg><broken></svg>');
  await page.getByRole('button', { name: '应用修改', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('SVG XML 无效');
  await source.fill(before.xml.replace('Client application', 'Changed through XML'));
  await page.getByRole('button', { name: '应用修改', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card text').first()).toHaveText(
    'Changed through XML',
  );
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card text').first()).toHaveText(
    'Client application',
  );
  await expect(page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true })).toBeEnabled();
  const after = await page.evaluate(async (module) => {
    const { useUI } = await import(/* @vite-ignore */ module);
    return useUI.getState().pan;
  }, bridge);
  expect(after).toEqual(before.pan);
});

test('container dimensions preserve text size; text wrapping is explicit and reversible', async ({
  page,
}) => {
  await choose(page, '#client-card rect');
  if (
    (await page
      .getByRole('button', { name: '布局', exact: true })
      .getAttribute('aria-expanded')) === 'false'
  )
    await page.getByRole('button', { name: '布局', exact: true }).click();
  const font = await page
    .locator('[data-svg-host] #client-card text')
    .first()
    .evaluate((el) => getComputedStyle(el).fontSize);
  await page.getByLabel('外框宽度', { exact: true }).fill('280');
  await page.getByLabel('外框宽度', { exact: true }).press('Enter');
  await expect(page.locator('[data-svg-host] #client-card rect').first()).toHaveAttribute(
    'width',
    '280',
  );
  expect(
    await page
      .locator('[data-svg-host] #client-card text')
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize),
  ).toBe(font);
  await choose(page, '#client-card text');
  await page.getByLabel('排版宽度', { exact: true }).fill('65');
  await page.getByRole('button', { name: '按宽度换行', exact: true }).click();
  const spans = page.locator('[data-svg-host] #client-card text').first().locator('tspan');
  expect(await spans.count()).toBeGreaterThan(1);
  await page.getByRole('button', { name: '增加一行', exact: true }).click();
  await expect(spans.last()).toHaveText('新的一行');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect(await spans.last().textContent()).not.toBe('新的一行');
});

test('connector endpoint handles and arrow presets modify only the selected connection', async ({
  page,
}) => {
  await insert(page, '直线');
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.selection[0]]);
  }, bridge);
  const line = page.locator('[data-svg-host] [data-label="直线"]');
  const x1 = await line.getAttribute('x1'),
    x2 = Number(await line.getAttribute('x2'));
  const handle = await page.locator('[data-endpoint="1"]').boundingBox();
  await page.mouse.move(handle!.x + 5, handle!.y + 5);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 35, handle!.y + 25, { steps: 6 });
  await page.mouse.up();
  expect(Number(await line.getAttribute('x2'))).toBeGreaterThan(x2);
  expect(await line.getAttribute('x1')).toBe(x1);
  await page.getByLabel('终点箭头样式', { exact: true }).selectOption('triangle');
  expect(await line.getAttribute('marker-end')).toContain('sf-marker-');
  await expect(page.locator('[data-svg-host] #arrow')).toHaveCount(1);
});

test('computed mixed styles, precise gap and saved section preferences', async ({ page }) => {
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([
      engine.root.querySelector('#client-card'),
      engine.root.querySelector('#model-card'),
      engine.root.querySelector('#orchestrator-card'),
    ]);
  }, bridge);
  await page.getByLabel('净间距', { exact: true }).fill('24');
  await page.getByRole('button', { name: '设置水平间距', exact: true }).click();
  const boxes = await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    return engine.selection
      .map((el: SVGGraphicsElement) => engine.bounds(el))
      .sort((a: { x: number }, b: { x: number }) => a.x - b.x);
  }, bridge);
  expect(boxes[1].x - boxes[0].x - boxes[0].width).toBeCloseTo(24, 2);
  const outer = page.getByRole('button', { name: '外观', exact: true });
  await outer.click();
  await expect(outer).toHaveAttribute('aria-expanded', 'false');
  await choose(page, '#client-card text');
  await expect(outer).toHaveAttribute('aria-expanded', 'false');
});
