import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const bridge = '/tests/e2e/bridge.ts',
  motion = '/src/editor/document/motion.ts',
  connections = '/src/editor/document/connections.ts';
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#2563eb"/></marker></defs><g id="a" data-label="服务 A" transform="translate(100 200)"><rect width="160" height="90" rx="8" fill="#eff6ff" stroke="#93c5fd"/><text x="20" y="48" fill="#1e3a8a">API 服务</text></g><g id="b" data-label="服务 B" transform="translate(600 200)"><rect width="160" height="90" rx="8" fill="#ecfdf5" stroke="#6ee7b7"/><text x="20" y="48">存储服务</text></g><line id="edge" x1="260" y1="245" x2="600" y2="245" style="stroke:#2563eb!important;stroke-width:3!important;stroke-dashoffset:0!important" marker-end="url(#arrow)"/></svg>';
async function setup(page: Page, xml = svg, select = '#a') {
  await page.goto('/');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
  await page.evaluate(
    async ({ bridge, xml, select }) => {
      const { engine, useUI } = await import(/* @vite-ignore */ bridge);
      engine.importSvg(xml);
      useUI.getState().set({ snap: false });
      engine.select([engine.root!.querySelector(select) as SVGGraphicsElement]);
    },
    { bridge, xml, select },
  );
}
async function source(page: Page) {
  return page.evaluate(
    async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
    bridge,
  );
}
test('card effects configure, play, pause, edit opacity and remove without changing geometry', async ({
  page,
}) => {
  await setup(page);
  const original = await source(page),
    card = page.locator('[data-svg-host] #a');
  const box = (await card.boundingBox())!;
  await page.getByLabel('动效类型', { exact: true }).selectOption('pulse');
  const wrapper = page.locator('[data-svg-host] [data-sf-motion]');
  const opacity = await wrapper.evaluate((el) => Number(getComputedStyle(el).opacity));
  await expect
    .poll(() => wrapper.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .not.toBeCloseTo(opacity, 2);
  expect((await card.boundingBox())!.x).toBeCloseTo(box.x, 4);
  await page.getByLabel('动效周期（秒）', { exact: true }).fill('3.5');
  await page.getByLabel('动效周期（秒）', { exact: true }).press('Enter');
  await page.getByLabel('动效强度（%）', { exact: true }).fill('60');
  await page.getByLabel('动效强度（%）', { exact: true }).press('Enter');
  expect(JSON.parse((await wrapper.getAttribute('data-sf-motion'))!).duration).toBe(3.5);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect(JSON.parse((await wrapper.getAttribute('data-sf-motion'))!).amount).toBe(0.35);
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  expect(JSON.parse((await wrapper.getAttribute('data-sf-motion'))!).amount).toBe(0.6);
  const xml = await source(page);
  await page.getByRole('button', { name: '暂停全部动效预览', exact: true }).click();
  await expect(wrapper).toHaveCSS('animation-play-state', 'paused');
  const paused = await wrapper.evaluate((el) => getComputedStyle(el).opacity);
  await page.waitForTimeout(350);
  expect(await wrapper.evaluate((el) => getComputedStyle(el).opacity)).toBe(paused);
  expect(await source(page)).toBe(xml);
  await page.getByRole('button', { name: '播放全部动效预览', exact: true }).click();
  await page.getByLabel('动效类型', { exact: true }).selectOption('blink');
  await page.getByLabel('启用动效', { exact: true }).uncheck();
  await expect(wrapper).toHaveCSS('animation-name', 'none');
  await page.getByLabel('启用动效', { exact: true }).check();
  await page.getByRole('button', { name: '布局', exact: true }).click();
  await page.getByLabel('透明度', { exact: true }).fill('0.8');
  await page.getByLabel('透明度', { exact: true }).press('Enter');
  await expect(card).toHaveCSS('opacity', '0.8');
  expect(await wrapper.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
  await page.getByRole('button', { name: '移除动效', exact: true }).click();
  await expect(wrapper).toHaveCount(0);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(wrapper).toHaveCount(1);
  expect(original).not.toContain('data-sf-motion');
});

test('flow overlay animates frozen inline styles and follows a connected card drag in one undo', async ({
  page,
}) => {
  await setup(page, svg, '#edge');
  await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine } = await import(/* @vite-ignore */ bridge),
        { bindConnection } = await import(/* @vite-ignore */ connections);
      bindConnection(
        engine,
        engine.selection[0],
        'start',
        engine.root!.querySelector('#a'),
        'right',
      );
      bindConnection(engine, engine.selection[0], 'end', engine.root!.querySelector('#b'), 'left');
    },
    { bridge, connections },
  );
  await page.getByLabel('动效类型', { exact: true }).selectOption('flow');
  const overlay = page.locator('[data-svg-host] [data-sf-motion-overlay]'),
    line = page.locator('[data-svg-host] #edge');
  await expect(overlay).toHaveCSS('stroke', 'rgb(37, 99, 235)');
  const offset = await overlay.evaluate((el) => getComputedStyle(el).strokeDashoffset);
  await expect
    .poll(() => overlay.evaluate((el) => getComputedStyle(el).strokeDashoffset))
    .not.toBe(offset);
  await page.getByLabel('流动方向', { exact: true }).selectOption('reverse');
  await expect(overlay).toHaveCSS('animation-direction', 'reverse');
  await page.getByLabel('流动线段', { exact: true }).fill('14');
  await page.getByLabel('流动线段', { exact: true }).press('Enter');
  await expect(overlay).toHaveCSS('stroke-dasharray', '14px, 8px');
  await page.evaluate(
    async ({ bridge, motion }) => {
      const { engine } = await import(/* @vite-ignore */ bridge),
        { configureMotion, defaultMotion } = await import(/* @vite-ignore */ motion);
      configureMotion(
        engine,
        engine.root!.querySelector('#a') as SVGGraphicsElement,
        defaultMotion('pulse'),
      );
    },
    { bridge, motion },
  );
  const before = await source(page),
    x = Number(await line.getAttribute('x1'));
  const card = page.locator('[data-svg-host] #a rect'),
    box = (await card.boundingBox())!;
  await page.mouse.move(box.x + 8, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + 48, box.y + 33, { steps: 6 });
  await page.mouse.up();
  expect(Number(await line.getAttribute('x1'))).toBeGreaterThan(x);
  expect(await overlay.getAttribute('x1')).toBe(await line.getAttribute('x1'));
  expect(await overlay.getAttribute('y1')).toBe(await line.getAttribute('y1'));
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect(await source(page)).toBe(before);
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  expect(await overlay.getAttribute('x1')).toBe(await line.getAttribute('x1'));
});

test('animated SVG plays standalone, reimports safely, and static export retains only original artwork', async ({
  page,
  context,
}, testInfo) => {
  await setup(page);
  await page.getByLabel('动效类型', { exact: true }).selectOption('blink');
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('#edge') as SVGGraphicsElement]);
  }, bridge);
  await page.getByLabel('动效类型', { exact: true }).selectOption('flow');
  await page.getByText('导出 SVG', { exact: true }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
  const download = await pending,
    path = testInfo.outputPath('animated.svg');
  await download.saveAs(path);
  const xml = await readFile(path, 'utf8');
  expect(xml).toContain('@keyframes');
  const preview = await context.newPage();
  await preview.goto(pathToFileURL(path).href);
  const effect = preview.locator('[data-sf-motion-overlay]');
  const offset = await effect.evaluate((el) => getComputedStyle(el).strokeDashoffset);
  await expect
    .poll(() => effect.evaluate((el) => getComputedStyle(el).strokeDashoffset))
    .not.toBe(offset);
  await preview.close();
  const warnings = await page.evaluate(
    async ({ bridge, xml }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      engine.importSvg(xml);
      engine.select([engine.root!.querySelector('[data-sf-motion]') as SVGGraphicsElement]);
      return engine.warnings;
    },
    { bridge, xml },
  );
  expect(warnings).toEqual([]);
  await expect(page.getByLabel('动效类型', { exact: true })).toHaveValue('blink');
  await page.getByRole('button', { name: '暂停全部动效预览', exact: true }).click();
  await page.getByText('导出 SVG', { exact: true }).click();
  const staticPending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载静态 SVG', exact: true }).click();
  const staticDownload = await staticPending,
    staticXml = await readFile((await staticDownload.path())!, 'utf8');
  expect(staticDownload.suggestedFilename()).toMatch(/-static\.svg$/);
  expect(staticXml).not.toContain('data-sf-motion');
  expect(staticXml).not.toContain('@keyframes');
  expect(staticXml).toContain('id="edge"');
  expect(await source(page)).toContain('data-sf-motion');
});

test('duplicate and group preserve live motion with isolated names and original styling', async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel('动效类型', { exact: true }).selectOption('pulse');
  const result = await page.evaluate(
    async ({ bridge, motion }) => {
      const { engine } = await import(/* @vite-ignore */ bridge),
        { decodeMotion } = await import(/* @vite-ignore */ motion);
      const original = engine.selection[0];
      engine.paste(engine.copy());
      const container = engine.selection[0],
        clone = container.querySelector('[data-sf-motion]') as SVGGraphicsElement;
      const before = getComputedStyle(clone).animationName;
      engine.select([original, container]);
      engine.group();
      return {
        ids: [original.id, clone.id],
        styles: [original.style.opacity, clone.style.opacity],
        before,
        after: getComputedStyle(clone).animationName,
        configs: [original, clone].map((n) => decodeMotion(n.getAttribute('data-sf-motion'))?.type),
      };
    },
    { bridge, motion },
  );
  expect(new Set(result.ids).size).toBe(2);
  expect(result.styles).toEqual(['', '']);
  expect(result.before).not.toBe('none');
  expect(result.after).toBe(result.before);
  expect(result.configs).toEqual(['pulse', 'pulse']);
});

test('reduced motion and offscreen pause work; structural CSS failures roll back without data loss', async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel('动效类型', { exact: true }).selectOption('pulse');
  const wrapper = page.locator('[data-svg-host] [data-sf-motion]');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(wrapper).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(wrapper).toHaveCSS('animation-play-state', 'paused');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(wrapper).toHaveCSS('animation-play-state', 'running');
  await page.evaluate(
    async (m) =>
      (await import(/* @vite-ignore */ m)).useUI.getState().set({ pan: { x: -10000, y: -10000 } }),
    bridge,
  );
  await expect(wrapper).toHaveCSS('animation-play-state', 'paused');
  const result = await page.evaluate(
    async ({ bridge, motion }) => {
      const { engine } = await import(/* @vite-ignore */ bridge),
        { configureMotion, defaultMotion } = await import(/* @vite-ignore */ motion);
      engine.importSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400"><style>svg>rect{fill:red}rect{fill:blue}</style><rect id="r" width="100" height="100"/></svg>',
      );
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const before = engine.exportSvg();
      let error = '';
      try {
        configureMotion(
          engine,
          engine.root!.querySelector('#r') as SVGGraphicsElement,
          defaultMotion('blink'),
        );
      } catch (e) {
        error = (e as Error).message;
      }
      return { error, unchanged: before === engine.exportSvg(), past: engine.past.length };
    },
    { bridge, motion },
  );
  expect(result.error).toContain('样式依赖父子层级');
  expect(result.unchanged).toBe(true);
  expect(result.past).toBe(0);
});

test('motion configuration panel stays usable at desktop and compact sizes', async ({ page }) => {
  await setup(page, svg, '#edge');
  await page.getByLabel('动效类型', { exact: true }).selectOption('flow');
  await page.getByRole('button', { name: '暂停全部动效预览', exact: true }).click();
  await page.screenshot({ path: 'tests/motion-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.getByRole('button', { name: '适应画布 (Shift+1)', exact: true }).click();
  await page.getByLabel('流动方向', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'tests/motion-compact.png', fullPage: true });
  await expect(page.getByLabel('流动方向', { exact: true })).toBeVisible();
});

test('curved paths keep native transforms, color edits sync, and copied flow remains animated', async ({
  page,
}) => {
  await setup(
    page,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><g transform="translate(130 90) rotate(12) scale(.9 1.2)"><path id="curve" d="M60 180C180 20 400 300 600 160" transform="translate(10 30)" fill="none" stroke="#2563eb" stroke-width="4"/></g></svg>',
    '#curve',
  );
  await page.getByLabel('动效类型', { exact: true }).selectOption('flow');
  const result = await page.evaluate(
    async ({ bridge, motion }) => {
      const { engine } = await import(/* @vite-ignore */ bridge),
        { motionOriginal } = await import(/* @vite-ignore */ motion);
      const wrapper = engine.selection[0],
        original = motionOriginal(wrapper)!,
        overlay = wrapper.querySelector('[data-sf-motion-overlay]') as SVGGraphicsElement;
      const a = original.getBoundingClientRect(),
        b = overlay.getBoundingClientRect();
      engine.updateAttributes({ stroke: '#ef4444' });
      const color = getComputedStyle(overlay).stroke;
      engine.paste(engine.copy());
      const copied = engine.selection[0].querySelector('[data-sf-motion]') as SVGGraphicsElement;
      const copiedOverlay = copied.querySelector('[data-sf-motion-overlay]')!;
      return {
        distance: Math.hypot(a.x - b.x, a.y - b.y, a.width - b.width, a.height - b.height),
        color,
        sameGeometry: original.getAttribute('d') === motionOriginal(copied)!.getAttribute('d'),
        animation: getComputedStyle(copiedOverlay).animationName,
        offsetImportant: (copiedOverlay as SVGElement).style.getPropertyPriority(
          'stroke-dashoffset',
        ),
        idsUnique: wrapper.id !== copied.id,
      };
    },
    { bridge, motion },
  );
  expect(result.distance).toBeLessThan(0.001);
  expect(result.color).toBe('rgb(239, 68, 68)');
  expect(result.sameGeometry).toBe(true);
  expect(result.animation).not.toBe('none');
  expect(result.offsetImportant).toBe('');
  expect(result.idsUnique).toBe(true);
});

test('SVG motion belongs to each document and survives workspace recovery', async ({ page }) => {
  await setup(page);
  await page.getByLabel('动效类型', { exact: true }).selectOption('pulse');
  const result = await page.evaluate(
    async ({ bridge, motion }) => {
      const { engine, documents } = await import(/* @vite-ignore */ bridge),
        { configureMotion, defaultMotion } = await import(/* @vite-ignore */ motion);
      const first = documents.activeId;
      documents.open(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect id="second" x="100" y="200" width="200" height="100" fill="blue"/></svg>',
        'second.svg',
      );
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      configureMotion(
        engine,
        engine.root!.querySelector('#second') as SVGGraphicsElement,
        defaultMotion('blink'),
      );
      const second = documents.activeId;
      documents.activate(first);
      const firstType = JSON.parse(
        engine.root!.querySelector('[data-sf-motion]')!.getAttribute('data-sf-motion')!,
      ).type;
      engine.undo();
      const undone = !engine.root!.querySelector('[data-sf-motion]');
      engine.redo();
      documents.activate(second);
      return {
        firstType,
        undone,
        secondType: JSON.parse(
          engine.root!.querySelector('[data-sf-motion]')!.getAttribute('data-sf-motion')!,
        ).type,
      };
    },
    { bridge, motion },
  );
  expect(result).toEqual({ firstType: 'pulse', undone: true, secondType: 'blink' });
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('svg-finisher.document') || ''))
    .toContain('data-sf-motion');
  await page.reload();
  await expect(page.locator('[data-svg-host] #second')).toBeVisible();
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('[data-sf-motion]') as SVGGraphicsElement]);
  }, bridge);
  await expect(page.getByLabel('动效类型', { exact: true })).toHaveValue('blink');
});

test('hiding or deleting the original arrow also removes its flow layer, with exact undo', async ({
  page,
}) => {
  await setup(page, svg, '#edge');
  await page.getByLabel('动效类型', { exact: true }).selectOption('flow');
  await page.getByRole('button', { name: '编辑原图形', exact: true }).click();
  const before = await source(page);
  const result = await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    const original = engine.selection[0];
    engine.hide(original);
    const hidden = getComputedStyle(
      engine.root!.querySelector('[data-sf-motion-overlay]')!,
    ).visibility;
    engine.hide(original);
    const restored = getComputedStyle(
      engine.root!.querySelector('[data-sf-motion-overlay]')!,
    ).visibility;
    engine.scope = original.parentElement!.parentElement as unknown as SVGGraphicsElement;
    engine.remove();
    return {
      hidden,
      restored,
      empty: !engine.root!.querySelector('[data-sf-motion],#edge,[data-sf-motion-overlay]'),
      scope: engine.scope,
    };
  }, bridge);
  expect(result).toEqual({ hidden: 'hidden', restored: 'visible', empty: true, scope: null });
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect(await source(page)).toBe(before);
});
