import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const bridge = '/tests/e2e/bridge.ts';
const catalog = '/src/editor/insert/catalog.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
  await page.getByRole('tab', { name: '组合图', exact: true }).click();
});

test('template categories, search and insert keep the working diagram and one undo step', async ({
  page,
}) => {
  await expect(page.getByRole('button', { name: '常用组合图分类' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.locator('.template-card')).toHaveCount(4);
  for (const category of ['技术架构', '工作流程', '技术信息图', '可复用组件'])
    await expect(page.getByRole('button', { name: `${category}分类`, exact: true })).toBeVisible();
  const original = await page
    .locator('[data-svg-host] #client-card')
    .evaluate((el) => el.outerHTML);
  await page.getByLabel('搜索素材').fill('RAG');
  await expect(page.locator('.template-card')).toHaveCount(1);
  await page.getByRole('button', { name: '插入RAG 检索增强生成', exact: true }).click();
  const inserted = page.locator('[data-svg-host] [data-label="RAG 检索增强生成"]');
  await expect(inserted).toHaveCount(1);
  await expect(inserted.locator('svg')).toHaveCount(0);
  expect(await inserted.locator('[data-node]').count()).toBe(8);
  expect(await page.locator('[data-svg-host] #client-card').evaluate((el) => el.outerHTML)).toBe(
    original,
  );
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).useUI.getState().aspectLocked,
      bridge,
    ),
  ).toBe(true);
  await page.keyboard.press('ControlOrMeta+z');
  await expect(inserted).toHaveCount(0);
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(inserted).toHaveCount(1);
});

test('all 24 templates retain native geometry, readable text, valid references and exact undo', async ({
  page,
}) => {
  const result = await page.evaluate(
    async ({ bridge, catalog }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { templates, assetSource } = await import(/* @vite-ignore */ catalog);
      const original = engine.exportSvg(),
        issues: string[] = [];
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-2000px;top:0';
      const shadow = host.attachShadow({ mode: 'open' });
      document.body.append(host);
      try {
        for (const asset of templates) {
          const xml = new DOMParser().parseFromString(asset.svg, 'image/svg+xml');
          const svg = document.importNode(xml.documentElement, true) as unknown as SVGSVGElement;
          shadow.append(svg);
          const native = svg.getBBox();
          for (const text of svg.querySelectorAll('text')) {
            const b = text.getBBox();
            if (b.x < 0 || b.y < 0 || b.x + b.width > asset.width || b.y + b.height > asset.height)
              issues.push(`${asset.id}:outside-view:${text.textContent}`);
            const card = text.closest('[data-node]')?.querySelector('rect');
            if (card) {
              const c = card.getBBox();
              if (
                b.x < c.x + 6 ||
                b.y < c.y + 3 ||
                b.x + b.width > c.x + c.width - 6 ||
                b.y + b.height > c.y + c.height - 3
              )
                issues.push(`${asset.id}:text-overflow:${text.textContent}`);
            }
          }
          svg.remove();
          engine.insertSvg(
            assetSource(asset),
            { x: 500, y: 350 },
            { label: asset.label, width: asset.width, height: asset.height, flatten: true },
          );
          const target = engine.selection[0],
            b = engine.selectionBounds();
          if (
            !b ||
            !Object.values(b).every(Number.isFinite) ||
            Math.abs(b.width - native.width) > 0.1 ||
            Math.abs(b.height - native.height) > 0.1
          )
            issues.push(asset.id + ':geometry');
          if (target.querySelector('svg')) issues.push(asset.id + ':nested-svg');
          for (const el of target.querySelectorAll('[marker-end]')) {
            const ref = el.getAttribute('marker-end')!.match(/#([^)"]+)/)?.[1];
            if (!ref || !engine.root!.querySelector(`[id="${ref}"]`))
              issues.push(asset.id + ':reference');
          }
          if (engine.warnings.length) issues.push(asset.id + ':warnings');
          engine.undo();
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          if (engine.exportSvg() !== original) issues.push(asset.id + ':undo');
        }
      } finally {
        host.remove();
      }
      return { count: templates.length, issues };
    },
    { bridge, catalog },
  );
  expect(result.count).toBe(24);
  expect(result.issues).toEqual([]);
});

test('composite nodes and text edit directly, export as standard SVG and reimport', async ({
  page,
}) => {
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700"/>',
    );
  }, bridge);
  await page.getByLabel('搜索素材').fill('双节点');
  await page.getByRole('button', { name: '插入双节点连接', exact: true }).click();
  const node = page.locator('[data-svg-host] [data-node]').first();
  await node.locator('rect').dblclick({ position: { x: 8, y: 8 } });
  await expect(page.locator('.scope-bar')).toBeVisible();
  const before = await node.boundingBox();
  await node.locator('rect').click({ position: { x: 8, y: 8 } });
  await page.keyboard.press('ArrowRight');
  expect((await node.boundingBox())!.x).toBeGreaterThan(before!.x);
  await node.locator('text').first().dblclick();
  const editor = page.getByRole('dialog', { name: '编辑文字' });
  await editor.getByLabel('文字段落 1').fill('支付服务');
  await editor.getByRole('button', { name: '应用', exact: true }).click();
  await expect(node.locator('text').first()).toHaveText('支付服务');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(node.locator('text').first()).toHaveText('上游服务');
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(node.locator('text').first()).toHaveText('支付服务');
  await page.locator('.export-dropdown summary').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
  const download = await downloadPromise,
    xml = await fs.readFile((await download.path())!, 'utf8');
  expect(xml).toContain('支付服务');
  expect(xml).not.toContain('data-selection');
  const preview = await page.context().newPage();
  await preview.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
  await expect(preview.locator('text').filter({ hasText: '支付服务' })).toBeVisible();
  await preview.close();
  await page.evaluate(
    async ({ bridge, xml }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      engine.importSvg(xml);
    },
    { bridge, xml },
  );
  await expect(page.locator('[data-svg-host] text').filter({ hasText: '支付服务' })).toBeVisible();
  await page.locator('[data-svg-host] [data-node]').first().locator('text').first().dblclick();
  await expect(editor).toBeVisible();
});

test('starting from a template backs up the current work and offers usable previews on desktop and compact windows', async ({
  page,
}) => {
  const original = await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.transaction('unsaved change', () => engine.root!.setAttribute('opacity', '.9'));
    return engine.exportSvg();
  }, bridge);
  await page.getByRole('button', { name: '使用三层应用架构新建图稿', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="接入层"]')).toBeVisible();
  expect(
    await page.evaluate(async (m) => (await import(/* @vite-ignore */ m)).engine.name, bridge),
  ).toBe('三层应用架构.svg');
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem('svg-finisher.previous')!).xml,
  );
  expect(saved).toBe(original);
  await page.screenshot({ path: 'tests/templates-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.getByRole('button', { name: '适应画布 (Shift+1)', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
  await page.screenshot({ path: 'tests/templates-compact.png', fullPage: true });
  await page.locator('.export-dropdown summary').click();
  await page.getByRole('button', { name: '恢复上一份文档', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card')).toBeVisible();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(original);
});

test('repeated insertion into transformed groups isolates IDs, resources and original styles', async ({
  page,
}) => {
  const result = await page.evaluate(
    async ({ bridge, catalog }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { templates, assetSource } = await import(/* @vite-ignore */ catalog);
      engine.importSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><style>text{fill:red!important;font-size:40px!important}path{fill:red!important}</style><g id="parent" transform="translate(90 40) rotate(12) scale(.8 1.2)"><rect id="original" width="20" height="20"/></g></svg>',
      );
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const parent = engine.root!.querySelector('#parent') as SVGGraphicsElement;
      engine.scope = parent;
      const original = parent.querySelector('#original')!.outerHTML;
      const asset = templates.find((a: { id: string }) => a.id === 'template-rag')!;
      const boxes: { x: number; y: number }[] = [];
      for (let i = 0; i < 2; i++) {
        engine.insertSvg(
          assetSource(asset),
          { x: 500 + i * 100, y: 350 },
          { label: asset.label, flatten: true },
        );
        const b = engine.selectionBounds()!;
        boxes.push({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
      }
      const ids = [...engine.root!.querySelectorAll('[id]')].map((el) => el.id);
      const text = engine.selection[0].querySelector('text')!;
      const exported = engine.exportSvg();
      const sanitizer = '/src/editor/security/sanitize.ts';
      const sanitized = (await import(/* @vite-ignore */ sanitizer)).sanitizeSvg(exported);
      return {
        boxes,
        unique: new Set(ids).size === ids.length,
        original: original === parent.querySelector('#original')!.outerHTML,
        fill: getComputedStyle(text).fill,
        fontSize: getComputedStyle(text).fontSize,
        warnings: sanitized.warnings,
      };
    },
    { bridge, catalog },
  );
  expect(result.unique).toBe(true);
  expect(result.original).toBe(true);
  expect(result.fill).toBe('rgb(15, 23, 42)');
  expect(result.fontSize).toBe('25px');
  expect(result.warnings).toEqual([]);
  for (const [i, box] of result.boxes.entries()) {
    expect(box.x).toBeCloseTo(500 + i * 100, 1);
    expect(box.y).toBeCloseTo(350, 1);
  }
});

test('architecture, flow, infographic and reusable component preserve native rendered appearance on insertion', async ({
  page,
}) => {
  const preview = await page.context().newPage();
  try {
    for (const id of [
      'template-three-tier',
      'template-approval',
      'template-metrics',
      'template-legend',
    ]) {
      const asset = await page.evaluate(
        async ({ catalog, id }) => (await import(/* @vite-ignore */ catalog)).assetById(id),
        { catalog, id },
      );
      await preview.setViewportSize({ width: asset.width, height: asset.height });
      await preview.setContent(
        `<html><head><style>body{margin:0;background:white}svg{display:block}</style></head><body>${asset.svg}</body></html>`,
      );
      const native = PNG.sync.read(await preview.locator('svg').screenshot());
      const center = await preview.locator('svg').evaluate((svg) => {
        const b = (svg as SVGSVGElement).getBBox();
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      });
      const exported = await page.evaluate(
        async ({ bridge, catalog, id, center, width, height }) => {
          const { engine } = await import(/* @vite-ignore */ bridge);
          const { assetById, assetSource } = await import(/* @vite-ignore */ catalog);
          engine.importSvg(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"/>`,
          );
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          engine.insertSvg(assetSource(assetById(id)), center, { flatten: true });
          return engine.exportSvg();
        },
        { bridge, catalog, id, center, width: asset.width, height: asset.height },
      );
      await preview.setContent(
        `<html><head><style>body{margin:0;background:white}svg{display:block}</style></head><body>${exported}</body></html>`,
      );
      const actual = PNG.sync.read(await preview.locator('svg').screenshot());
      const diff = pixelmatch(native.data, actual.data, undefined, native.width, native.height, {
        threshold: 0.15,
      });
      expect(diff / (native.width * native.height), id).toBeLessThan(0.001);
    }
  } finally {
    await preview.close();
  }
});

test('composite library visual contact sheet', async ({ page }) => {
  const assets = await page.evaluate(
    async (module) =>
      (await import(/* @vite-ignore */ module)).templates.map(
        (a: { svg: string; label: string }) => ({ svg: a.svg, label: a.label }),
      ),
    catalog,
  );
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.setContent(
    `<html lang="zh"><head><style>body{margin:0;padding:24px;font:16px Arial;background:#f1f5f9}main{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}article{background:#fff;border:1px solid #cbd5e1;padding:12px}h2{font-size:18px;margin:0 0 12px}svg{display:block;width:100%;height:300px}</style></head><body><main>${assets.map((a: { svg: string; label: string }) => `<article><h2>${a.label}</h2>${a.svg}</article>`).join('')}</main></body></html>`,
  );
  await page.screenshot({ path: 'tests/templates-contact-sheet.png', fullPage: true });
});
