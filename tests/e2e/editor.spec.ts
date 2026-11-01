import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
// The browser loads the same engine module as the application. This gives regression tests
// direct access to native matrices and history without exposing a production debug global.
async function imported(page: Page, name: string) {
  const xml = await fs.readFile(path.resolve(`src/fixtures/${name}.svg`), 'utf8');
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(xml);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  if (name === 'security') {
    await expect(page.getByRole('dialog', { name: '导入前检查', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '清理并继续', exact: true }).click();
  }
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
  return xml;
}
async function doc(page: Page) {
  return page.locator('[data-svg-host] > svg');
}
async function selectLayer(page: Page, id: string) {
  await page.getByTestId(`layer-${id}`).locator('.layer-select').click();
}
const engineModule = '/tests/e2e/bridge.ts';
const uiModule = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
  await page.getByRole('button', { name: '显示图层面板', exact: true }).click();
});

test('full MVP: paste, move card, edit text, align, style, undo/redo, download and reimport', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await imported(page, 'architecture');
  await selectLayer(page, 'client-card');
  await expect(page.getByTestId('selection-box')).toBeVisible();
  const rect = page.locator('[data-svg-host] #client-card rect').first(),
    before = await rect.boundingBox();
  expect(before).not.toBeNull();
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height - 12);
  await page.mouse.down();
  await page.mouse.move(before!.x + before!.width / 2 + 43, before!.y + before!.height + 14, {
    steps: 8,
  });
  await page.mouse.up();
  const after = await rect.boundingBox();
  expect(after!.x - before!.x).toBeCloseTo(43, 0);
  expect(after!.y - before!.y).toBeCloseTo(26, 0);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect((await rect.boundingBox())!.x).toBeCloseTo(before!.x, 0);
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  expect((await rect.boundingBox())!.x).toBeCloseTo(after!.x, 0);
  await page.locator('[data-svg-host] #client-card text').first().dblclick();
  const editor = page.getByRole('dialog', { name: '编辑文字' });
  await expect(editor).toBeVisible();
  await editor.getByLabel('文字段落 1').fill('Refined application');
  await editor.getByRole('button', { name: '应用', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card text').first()).toHaveText(
    'Refined application',
  );
  const expandClient = page.getByTestId('layer-client-card').getByRole('button', { name: /展开/ });
  if (await expandClient.count()) await expandClient.click(); // Selecting a descendant now reveals its ancestors automatically.
  await page.getByTestId('layer-client-card').locator('.layer-select').click();
  await page
    .getByTestId('layer-model-card')
    .locator('.layer-select')
    .click({ modifiers: ['Shift'] });
  await page
    .getByRole('navigation', { name: '编辑工具栏' })
    .getByRole('button', { name: '顶对齐', exact: true })
    .click();
  const b1 = await rect.boundingBox(),
    b2 = await page.locator('[data-svg-host] #model-card rect').first().boundingBox();
  expect(b1!.y).toBeCloseTo(b2!.y, 1);
  // Choose the card background directly with Alt, then set its fill.
  await rect.click({ position: { x: 10, y: 10 }, modifiers: ['Alt'] });
  const fill = page.getByLabel('填充', { exact: true });
  await fill.fill('#fef3c7');
  await fill.press('Enter');
  await expect(rect).toHaveAttribute('fill', '#fef3c7');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card rect').first()).toHaveAttribute(
    'fill',
    '#ffffff',
  );
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  await page.locator('.export-dropdown summary').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const exported = await fs.readFile(downloadPath!, 'utf8');
  expect(exported).toContain('Refined application');
  expect(exported).toContain('#fef3c7');
  expect(exported).not.toContain('selection-box');
  expect(exported).toContain('url(#arrow)');
  const preview = await page.context().newPage();
  await preview.goto(`data:image/svg+xml,${encodeURIComponent(exported)}`);
  await expect(preview.locator('svg')).toBeVisible();
  await expect(preview.locator('parsererror')).toHaveCount(0);
  await preview.close();
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(exported);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card rect').first()).toHaveAttribute(
    'fill',
    '#fef3c7',
  );
  await selectLayer(page, 'client-card');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('selection-box')).toBeVisible();
  expect(errors).toEqual([]);
});

test('nested transforms translate and resize correctly; one drag is one undo transaction', async ({
  page,
}) => {
  await imported(page, 'complex');
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    const el = engine.root.querySelector('#nested-rect');
    engine.select([el]);
  }, engineModule);
  const target = page.locator('[data-svg-host] #nested-rect'),
    a = await target.boundingBox();
  await page.keyboard.press('ArrowRight');
  const b = await target.boundingBox();
  const zoom = await page.evaluate(async (module) => {
    const { useUI } = await import(/* @vite-ignore */ module);
    return useUI.getState().zoom;
  }, uiModule);
  expect(b!.x - a!.x).toBeCloseTo(zoom, 2);
  expect(b!.y - a!.y).toBeCloseTo(0, 2);
  const untouched = await page.locator('[data-svg-host] #matrix-group').getAttribute('transform');
  await page.getByTestId('selection-box').locator('[data-handle=se]').hover();
  const h = await page.getByTestId('selection-box').locator('[data-handle=se]').boundingBox();
  await page.mouse.move(h!.x + 3, h!.y + 3);
  await page.mouse.down();
  await page.mouse.move(h!.x + 33, h!.y + 23, { steps: 12 });
  await page.mouse.up();
  const resized = await target.boundingBox();
  expect(resized!.width).toBeGreaterThan(b!.width + 15);
  const history = await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    return engine.past.length;
  }, engineModule);
  expect(history).toBe(2);
  expect(await page.locator('[data-svg-host] #matrix-group').getAttribute('transform')).toBe(
    untouched,
  );
  await page.keyboard.press('ControlOrMeta+z');
  expect((await target.boundingBox())!.width).toBeCloseTo(b!.width, 1);
});

test('group and ungroup preserve transforms and inherited style; distribution and duplicate references', async ({
  page,
}) => {
  await imported(page, 'flowchart');
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.scope = engine.root.firstElementChild.nextElementSibling;
    engine.select([
      engine.root.querySelector('#input'),
      engine.root.querySelector('#edit'),
      engine.root.querySelector('#export'),
    ]);
    engine.align('horizontal');
  }, engineModule);
  const original = await page.locator('[data-svg-host] #input').boundingBox();
  await page.getByRole('button', { name: '组合 (⌘/Ctrl+G)', exact: true }).click();
  await page.getByRole('button', { name: '取消分组 (⌘/Ctrl+Shift+G)', exact: true }).click();
  const ungrouped = await page.locator('[data-svg-host] #input').boundingBox();
  expect(ungrouped!.x).toBeCloseTo(original!.x, 1);
  expect(ungrouped!.y).toBeCloseTo(original!.y, 1);
  await imported(page, 'architecture');
  await selectLayer(page, 'orchestrator-card');
  await page.keyboard.press('ControlOrMeta+d');
  const duplicated = page.locator('[data-svg-host] [id^="orchestrator-card-copy-"]');
  await expect(duplicated).toHaveCount(1);
  const fill = await duplicated.locator('rect').first().getAttribute('fill');
  expect(fill).toMatch(/url\(#blue-surface-copy-/);
  const id = fill!.slice(5, -1);
  await expect(page.locator(`[data-svg-host] [id="${id}"]`)).toHaveCount(1);
});

test('multi-line editing preserves tspan positions and input focus suppresses canvas shortcuts', async ({
  page,
}) => {
  await imported(page, 'architecture');
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.root.querySelector('#client-card text:last-child')]);
  }, engineModule);
  const spans = page.locator('[data-svg-host] #client-card tspan'),
    second = await spans.nth(1).getAttribute('dy');
  const field = page.getByLabel('属性文字 1');
  await field.fill('A revised first line');
  await field.press('ArrowRight');
  await field.press('Delete');
  await field.blur();
  await expect(spans.first()).toHaveText('A revised first line');
  await expect(spans.nth(1)).toHaveAttribute('dy', second!);
  await expect(spans.nth(1)).toHaveText('Prompts, files & live previews');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(spans.first()).toHaveText('Web interface');
});

test('malicious SVG cannot execute scripts or fetch external resources; invalid input reports errors', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('example.invalid')) external.push(req.url());
  });
  await imported(page, 'security');
  expect(await page.evaluate(() => Reflect.get(window, '__svgPwned'))).toBeUndefined();
  expect(external).toEqual([]);
  await expect(page.locator('[data-svg-host] script,[data-svg-host] foreignObject')).toHaveCount(0);
  await page.getByRole('button', { name: /条提示/ }).click();
  await expect(page.getByText('导入兼容性与安全报告')).toBeVisible();
  await page.getByRole('button', { name: '关闭兼容性报告' }).click();
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill('<svg><invalid></svg>');
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('SVG XML 无效');
});

test('viewBox, CSS, clips, masks, markers and use survive export/reimport', async ({ page }) => {
  await imported(page, 'complex');
  const before = await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    return {
      xml: engine.exportSvg(),
      rect: engine.root.querySelector('#nested-rect').getBoundingClientRect().toJSON(),
    };
  }, engineModule);
  await page.evaluate(
    async ({ module, xml }) => {
      const { engine } = await import(/* @vite-ignore */ module);
      engine.importSvg(xml);
    },
    { module: engineModule, xml: before.xml },
  );
  await expect(page.locator('[data-svg-host] #instance')).toBeVisible();
  await expect(page.locator('[data-svg-host] svg')).toHaveAttribute('viewBox', '-40 -30 640 460');
  const after = await page.locator('[data-svg-host] #nested-rect').boundingBox();
  expect(after!.width).toBeCloseTo(before.rect.width, 2);
  expect(after!.x).toBeCloseTo(before.rect.x, 2);
});

test('overlay stays attached at different zoom and pan positions; small desktop remains usable', async ({
  page,
}) => {
  await selectLayer(page, 'client-card');
  for (const zoom of [0.5, 1, 1.5]) {
    await page.evaluate(
      async ({ module, zoom }) => {
        const { useUI } = await import(/* @vite-ignore */ module);
        useUI.getState().set({ zoom, pan: { x: 50, y: 50 } });
      },
      { module: uiModule, zoom },
    );
    const el = await page.locator('[data-svg-host] #client-card').boundingBox(),
      box = await page.getByTestId('selection-box').boundingBox();
    expect(Math.abs(box!.x - el!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(box!.width - el!.width)).toBeLessThanOrEqual(2);
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.getByRole('button', { name: '适应画布 (Shift+1)' }).click();
  await expect(page.locator('.export-dropdown')).toBeVisible();
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await page.getByRole('button', { name: '显示图层面板' }).click();
  await expect(page.getByRole('complementary', { name: '图层面板' })).toBeVisible();
});

test('native rendering visually matches sanitized editor import', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1800, height: 1100 });
  for (const name of ['architecture', 'complex', 'infographic', 'flowchart']) {
    const xml = await imported(page, name);
    await page.evaluate(async (module) => {
      const { useUI } = await import(/* @vite-ignore */ module);
      useUI.getState().set({ zoom: 1, pan: { x: 70, y: 80 }, grid: false });
    }, uiModule);
    await page.mouse.move(10, 10);
    const editorShot = await (await doc(page)).screenshot({ animations: 'disabled' });
    const native = await page.context().newPage();
    await native.setContent(`<style>body{margin:0}</style>${xml}`);
    const nativeShot = await native.locator('svg').screenshot({ animations: 'disabled' });
    await testInfo.attach(`${name}-editor`, { body: editorShot, contentType: 'image/png' });
    await testInfo.attach(`${name}-native`, { body: nativeShot, contentType: 'image/png' });
    const a = PNG.sync.read(editorShot),
      b = PNG.sync.read(nativeShot);
    expect(a.width).toBe(b.width);
    expect(a.height).toBe(b.height);
    const changed = pixelmatch(a.data, b.data, undefined, a.width, a.height, { threshold: 0.15 });
    expect(changed / (a.width * a.height), `${name} meaningful pixel difference`).toBeLessThan(
      0.001,
    );
    await native.close();
  }
  await page.screenshot({ path: 'tests/editor-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.getByRole('button', { name: '适应画布 (Shift+1)' }).click();
  await page.screenshot({ path: 'tests/editor-compact.png', fullPage: true });
});

test('file upload, marquee, hide/lock, clipboard paste and pan tools', async ({ page }) => {
  await page
    .locator('input[type=file]')
    .first()
    .setInputFiles(path.resolve('src/fixtures/flowchart.svg'));
  await expect(page.getByRole('tab', { name: 'flowchart.svg', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  // The authored example has a font inheritance group. Enter it, then marquee all three cards.
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.scope = engine.root.querySelector('g');
    engine.select([]);
  }, engineModule);
  const first = await page.locator('[data-svg-host] #input').boundingBox(),
    last = await page.locator('[data-svg-host] #export').boundingBox();
  await page.keyboard.down('Shift');
  await page.mouse.move(first!.x - 12, first!.y - 12);
  await page.mouse.down();
  await page.mouse.move(last!.x + last!.width + 12, last!.y + last!.height + 12, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await expect(page.getByRole('complementary', { name: '属性面板' })).toContainText('5 个元素');
  await page.keyboard.press('Escape');
  await page.getByLabel('搜索图层', { exact: true }).fill('input');
  await selectLayer(page, 'input');
  await page.getByRole('button', { name: '锁定 input', exact: true }).click();
  await expect(page.getByTestId('selection-box')).toHaveCount(0);
  await selectLayer(page, 'input');
  await expect(page.getByTestId('selection-box')).toHaveCount(0);
  await page.getByRole('button', { name: '解锁 input', exact: true }).click();
  await selectLayer(page, 'input');
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await page.getByRole('button', { name: '隐藏 input', exact: true }).click();
  await expect(page.locator('[data-svg-host] #input')).not.toBeVisible();
  await page.getByRole('button', { name: '显示 input', exact: true }).click();
  await expect(page.locator('[data-svg-host] #input')).toBeVisible();
  await page.getByLabel('搜索图层', { exact: true }).fill('');
  await page.locator('[data-canvas]').click({ position: { x: 15, y: 15 } });
  const xml = await fs.readFile(path.resolve('src/fixtures/infographic.svg'), 'utf8');
  await page.evaluate(
    (text) =>
      window.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: (() => {
            const data = new DataTransfer();
            data.setData('text/plain', text);
            return data;
          })(),
        }),
      ),
    xml,
  );
  await expect(page.locator('[data-svg-host] #stat-a')).toBeVisible();
  const a = await page.locator('[data-svg-host] #stat-a').boundingBox();
  await page.keyboard.down('Space');
  await page.mouse.move(a!.x + 100, a!.y + 100);
  await page.mouse.down();
  await page.mouse.move(a!.x + 130, a!.y + 125, { steps: 5 });
  await page.mouse.up();
  await page.keyboard.up('Space');
  const b = await page.locator('[data-svg-host] #stat-a').boundingBox();
  expect(b!.x - a!.x).toBeCloseTo(30, 0);
  expect(b!.y - a!.y).toBeCloseTo(25, 0);
});

test('clipboard styles stay isolated and use/gradient references remain valid after duplication', async ({
  page,
}) => {
  await imported(page, 'infographic');
  await selectLayer(page, 'stat-a');
  await page.keyboard.press('ControlOrMeta+d');
  const copy = page.locator('[data-svg-host] [id^="stat-a-copy-"]');
  await expect(copy).toBeVisible();
  const href = await copy.locator('use').getAttribute('href');
  expect(href).toMatch(/^#star-copy-/);
  await expect(page.locator(`[data-svg-host] [id="${href!.slice(1)}"]`)).toHaveCount(1);
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.paste(
      '<svg xmlns="http://www.w3.org/2000/svg"><style>rect{fill:red!important}</style><rect x="0" y="0" width="20" height="20"/></svg>',
    );
  }, engineModule);
  expect(
    await page.locator('[data-svg-host] #stat-a rect').evaluate((el) => getComputedStyle(el).fill),
  ).toBe('rgb(255, 255, 255)');
});

test('large SVG remains native and selection/export are usable', async ({ page }) => {
  const shapes = Array.from(
    { length: 2500 },
    (_, i) =>
      `<rect id="r${i}" x="${(i % 50) * 20}" y="${Math.floor(i / 50) * 20}" width="15" height="15" fill="#dbeafe"/>`,
  ).join('');
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page
    .locator('#svg-input')
    .fill(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><g id="many">${shapes}</g></svg>`,
    );
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await selectLayer(page, 'many');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await expect(page.locator('[data-svg-host] rect')).toHaveCount(2500);
  const xml = await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    return engine.exportSvg();
  }, engineModule);
  expect(xml).toContain('id="r2499"');
  expect(xml).toContain('matrix(1 0 0 1 1 0)');
});

test('different viewport and viewBox aspect ratios preserve native layout and clipping', async ({
  page,
}) => {
  const xml =
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="20 10 400 400"><rect x="-100" y="-100" width="1000" height="1000" fill="#f8fafc"/><g id="aspect-card" transform="translate(80 70)"><rect width="200" height="120" fill="#dbeafe"/><text x="10" y="40">Native viewport</text></g></svg>';
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(xml);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await page.evaluate(async (module) => {
    const { useUI } = await import(/* @vite-ignore */ module);
    useUI.getState().set({ zoom: 1, pan: { x: 50, y: 50 } });
  }, uiModule);
  await page.mouse.move(10, 10);
  const actual = PNG.sync.read(await page.locator('[data-svg-host] svg').screenshot());
  const native = await page.context().newPage();
  await native.setContent(`<style>body{margin:0}</style>${xml}`);
  const expected = PNG.sync.read(await native.locator('svg').screenshot());
  expect(actual.width).toBe(800);
  expect(actual.height).toBe(450);
  expect(
    pixelmatch(actual.data, expected.data, undefined, 800, 450, { threshold: 0.15 }) / (800 * 450),
  ).toBeLessThan(0.001);
  await native.close();
  await selectLayer(page, 'aspect-card');
  const before = await page.locator('[data-svg-host] #aspect-card').boundingBox();
  await page.keyboard.press('ArrowRight');
  const after = await page.locator('[data-svg-host] #aspect-card').boundingBox();
  expect(after!.x - before!.x).toBeCloseTo(450 / 400, 2);
});

test('root transforms/compositing do not apply twice when duplicating; CSS transform edits report limits', async ({
  page,
}) => {
  const xml =
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" transform="translate(10 20) scale(1.2)" opacity="0.8"><g id="root-card" transform="translate(40 40)"><rect width="100" height="60" fill="#3b82f6"/></g></svg>';
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(xml);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await selectLayer(page, 'root-card');
  const before = await page.locator('[data-svg-host] #root-card').boundingBox();
  await page.keyboard.press('ControlOrMeta+d');
  const copy = page.locator('[data-svg-host] [id^="root-card-copy-"]');
  const after = await copy.boundingBox();
  expect(after!.width).toBeCloseTo(before!.width, 1);
  const zoom = await page.evaluate(async (module) => {
    const { useUI } = await import(/* @vite-ignore */ module);
    return useUI.getState().zoom;
  }, uiModule);
  expect(after!.x - before!.x).toBeCloseTo(16 * 1.2 * zoom, 1);
  expect(await copy.evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe('1');
  const css =
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><style>#css-card{transform:translate(20px,30px)}</style><rect id="css-card" width="100" height="70" fill="blue"/></svg>';
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(css);
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await selectLayer(page, 'css-card');
  const original = await page.locator('[data-svg-host] #css-card').getAttribute('transform');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('alert')).toContainText('CSS Transform');
  expect(await page.locator('[data-svg-host] #css-card').getAttribute('transform')).toBe(original);
});

test('Space dragging pans immediately without a tool switch or document edit', async ({ page }) => {
  await selectLayer(page, 'client-card');
  const canvas = page.locator('[data-canvas]');
  const svg = page.locator('[data-svg-host] > svg');
  const xml = await svg.evaluate((el) => new XMLSerializer().serializeToString(el));
  const card = page.locator('[data-svg-host] #client-card');
  const before = await card.boundingBox();
  const area = await canvas.boundingBox();
  const start = { x: area!.x + 25, y: area!.y + 75 };
  await page.mouse.move(start.x, start.y);
  await page.keyboard.down('Space');
  await page.mouse.down();
  await page.mouse.move(start.x + 70, start.y + 45);
  await expect(canvas).toHaveAttribute('data-panning', 'true');
  await expect(canvas).toHaveCSS('cursor', 'grabbing');
  await expect(page.getByRole('button', { name: /选择工具|手型工具/ })).toHaveCount(0);
  await page.mouse.up();
  await page.keyboard.up('Space');
  const after = await card.boundingBox();
  expect(after!.x - before!.x).toBeCloseTo(70, 1);
  expect(after!.y - before!.y).toBeCloseTo(45, 1);
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await expect(page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true })).toBeDisabled();
  expect(await svg.evaluate((el) => new XMLSerializer().serializeToString(el))).toBe(xml);
  await expect(canvas).not.toHaveAttribute('data-panning', 'true');
});

test('a background click clears selection and blur ends a background drag', async ({ page }) => {
  const canvas = page.locator('[data-canvas]');
  const area = await canvas.boundingBox();
  const start = { x: area!.x + 25, y: area!.y + 75 };
  await selectLayer(page, 'client-card');
  await page.mouse.click(start.x, start.y);
  await expect(page.getByTestId('selection-box')).toHaveCount(0);
  await expect(canvas).not.toHaveAttribute('data-panning', 'true');
  await page.mouse.down();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.mouse.up();
  await expect(canvas).not.toHaveAttribute('data-panning', 'true');
});

test('font size edits apply in the real browser, resize the overlay, and undo/redo correctly', async ({
  page,
}) => {
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.root.querySelector('#client-card text')]);
  }, engineModule);
  const text = page.locator('[data-svg-host] #client-card text').first();
  const before = await page.getByTestId('selection-box').boundingBox();
  const fontSize = page.getByLabel('字号', { exact: true });
  await fontSize.fill('24');
  await fontSize.press('Enter');
  await expect(text).toHaveCSS('font-size', '24px');
  await expect(text).toHaveAttribute('font-size', '24px');
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect((await page.getByTestId('selection-box').boundingBox())!.width).toBeGreaterThan(
    before!.width,
  );
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(text).toHaveCSS('font-size', '16px');
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  await expect(text).toHaveCSS('font-size', '24px');
});

test('every inspector module collapses independently and layout starts expanded', async ({
  page,
}) => {
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.root.querySelector('#client-card text')]);
  }, engineModule);
  const inspector = page.getByRole('complementary', { name: '属性面板' });
  const layout = inspector.getByRole('button', { name: '布局', exact: true });
  await expect(layout).toHaveAttribute('aria-expanded', 'true');
  await expect(inspector.getByLabel('X', { exact: true })).toBeVisible();
  await layout.click();
  for (const title of ['外观', '文字', 'SVG 属性']) {
    const toggle = inspector.getByRole('button', { name: title, exact: true });
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const content = page.locator(`[id="${await toggle.getAttribute('aria-controls')}"]`);
    await toggle.click();
    await expect(content).not.toBeVisible();
    await expect(layout).toHaveAttribute('aria-expanded', 'false');
    await toggle.focus();
    await toggle.press('Enter');
    await expect(content).toBeVisible();
  }
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.root.querySelector('#connections path')]);
  }, engineModule);
  const connector = inspector.getByRole('button', { name: '连接线', exact: true });
  await connector.click();
  await expect(inspector.getByLabel('结束箭头', { exact: true })).not.toBeVisible();
  await connector.click();
  await expect(inspector.getByLabel('结束箭头', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/inspector-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: 'test-results/inspector-compact.png', fullPage: true });
});

test('the white SVG backdrop pans while cards remain directly editable', async ({ page }) => {
  const svg = page.locator('[data-svg-host] > svg');
  const xml = await svg.evaluate((el) => new XMLSerializer().serializeToString(el));
  const before = await svg.boundingBox();
  await page.locator('[data-svg-host] #paper').hover({ position: { x: 15, y: 620 } });
  await page.mouse.down();
  await page.mouse.move(before!.x + 55, before!.y + before!.height - 20);
  await page.mouse.up();
  const after = await svg.boundingBox();
  expect(after!.x - before!.x).toBeGreaterThan(10);
  expect(await svg.evaluate((el) => new XMLSerializer().serializeToString(el))).toBe(xml);
  await page.keyboard.press('h');
  const card = page.locator('[data-svg-host] #client-card rect').first();
  const cardBefore = await card.boundingBox();
  await card.hover({ position: { x: 10, y: 10 } });
  await page.mouse.down();
  await page.mouse.move(cardBefore!.x + 40, cardBefore!.y + 35, { steps: 5 });
  await page.mouse.up();
  const cardAfter = await card.boundingBox();
  expect(cardAfter!.x - cardBefore!.x).toBeGreaterThan(10);
  expect((await svg.boundingBox())!.x).toBeCloseTo(after!.x, 2);
  await expect(page.getByTestId('selection-box')).toBeVisible();
});
