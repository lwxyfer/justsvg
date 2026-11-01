import { test, expect, type Page } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('justsvg.home.language', 'zh'));
});

const output = '.impeccable/review/home-four-screen';
async function selectBrand(page: Page, name: string) {
  const sleeve = page.locator(`.record-sleeve[data-record="${name.toLowerCase()}"]`);
  await sleeve.focus();
  await sleeve.press('Enter');
  await page.mouse.move(10, 10);
}

test('four native chapters and an independent document footer have real product entry points', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /draw.io 的\s*开源替代。/ })).toBeVisible();
  for (const name of [
    '为技术图选一种品牌风格。',
    /把画图任务\s*交给 AI。/,
    /生成之后，\s*直接改图。/,
  ])
    await expect(page.getByRole('heading', { name })).toHaveCount(1);
  await expect(page.locator('.app-shell')).toBeHidden();
  await expect(
    page.getByRole('button', { name: /下载 SVG|下载当前图稿|下载当前 SVG/ }),
  ).toHaveCount(0);
  await expect(
    page.locator('.home-header').getByRole('link', { name: 'GitHub', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/lwxyfer/justsvg');
  await expect(page.locator('.hero-diagram [data-node]')).toHaveCount(9);
  await expect(page.locator('.hero-diagram [data-sf-start-node]')).toHaveCount(8);
  await expect(page.getByRole('contentinfo')).toHaveAttribute('aria-label', 'SVG 文档的最后一行');
  await expect(page.getByRole('link', { name: '下载 SVG Skill', exact: true })).toHaveAttribute(
    'href',
    /skills\/svg-diagram-skill.zip$/,
  );
  const pendingDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载 SVG Skill', exact: true }).click();
  const skillDownload = await pendingDownload;
  expect(skillDownload.suggestedFilename()).toBe('svg-diagram-skill.zip');
  const archive = await readFile((await skillDownload.path())!);
  expect(archive.subarray(0, 2).toString()).toBe('PK');
  expect(archive.includes(Buffer.from('svg-diagram/SKILL.md'))).toBe(true);
  expect(errors).toEqual([]);
});

test('Skill instructions contain the task and chosen reference with a working clipboard fallback', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    }),
  );
  await page.goto('/');
  await selectBrand(page, 'Figma');
  await page.getByLabel('描述你想画的图', { exact: true }).fill('说明知识索引如何参与检索。');
  await page.getByRole('button', { name: '复制生成指令', exact: true }).click();
  const prompt = page.getByLabel('完整 Skill 任务指令');
  await expect(prompt).toHaveValue(/说明知识索引如何参与检索。/);
  await expect(prompt).toHaveValue(/brand-figma-rag.md/);
  await expect(prompt).toBeFocused();
  expect(
    await prompt.evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart),
  ).toBeGreaterThan(100);
  await expect(page.getByRole('status')).toContainText('Ctrl+C');
  await expect(page.locator('.skill-caption')).toContainText('生成结果示例');
});

test('native diagram edits, routes and undo transfer the actual SVG to the editor', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.home-page')).toHaveCSS('transition-duration', '0s');
  const input = page.getByLabel('节点名称', { exact: true });
  await input.fill('Knowledge retrieval');
  await page.getByRole('button', { name: '填充 #d9caff', exact: true }).click();
  const node = page.locator('.demo-canvas [data-node="retrieve"]');
  const route = page.locator('.demo-canvas [data-sf-start-node$="node-retrieve"]').first();
  const beforeNode = await node.getAttribute('transform'),
    beforeLine = await route.getAttribute('points');
  await node.focus();
  await node.press('Shift+ArrowRight');
  await expect(node).not.toHaveAttribute('transform', beforeNode!);
  await expect(route).not.toHaveAttribute('points', beforeLine!);
  await page.getByRole('button', { name: '撤销图稿修改', exact: true }).click();
  await expect(node).toHaveAttribute('transform', beforeNode!);
  await expect(route).toHaveAttribute('points', beforeLine!);
  await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
  const xml = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine } = await import(/* @vite-ignore */ bridge);
    return engine.exportSvg();
  });
  expect(xml).toContain('Knowledge retrieval');
  expect(xml).toContain('#d9caff');
  expect(xml).not.toContain('data-demo-ui');
  const counts = await page.evaluate((text) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    return {
      nodes: doc.querySelectorAll('[data-node]').length,
      links: doc.querySelectorAll('[data-sf-start-node]').length,
      errors: doc.querySelectorAll('parsererror').length,
    };
  }, xml);
  expect(counts).toEqual({ nodes: 9, links: 8, errors: 0 });
});

test('pointer dragging moves nodes and connected endpoints', async ({ page }) => {
  await page.goto('/');
  const node = page.locator('.demo-canvas [data-node="retrieve"]');
  await node.scrollIntoViewIfNeeded();
  const box = (await node.boundingBox())!;
  const before = await node.getAttribute('transform');
  const route = page.locator('.demo-canvas [data-sf-start-node$="node-retrieve"]').first();
  const beforeRoute = await route.getAttribute('points');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 15, { steps: 5 });
  await page.mouse.up();
  await expect(node).not.toHaveAttribute('transform', before!);
  await expect(route).not.toHaveAttribute('points', beforeRoute!);
});

test('opening the edited SVG preserves native bindings and the editor workspace on home navigation', async ({
  page,
}) => {
  await page.goto('/');
  await selectBrand(page, 'Figma');
  await page.getByLabel('节点名称', { exact: true }).fill('Custom Retriever');
  await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
  await expect(page).toHaveURL(/\/editor$/);
  await expect(page.locator('[data-svg-host] [data-node]')).toHaveCount(9);
  await expect(page.locator('[data-svg-host] [data-sf-start-node]')).toHaveCount(8);
  await expect(page.locator('[data-svg-host]')).toContainText('Custom Retriever');
  const state = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine } = await import(/* @vite-ignore */ bridge);
    engine.select([engine.root!.querySelector('[data-node="retrieve"]')!]);
    engine.updateAttributes({ opacity: '.7' });
    return { xml: engine.exportSvg(), past: engine.past.length };
  });
  await page.getByRole('link', { name: 'JustSVG 首页', exact: true }).click();
  await page.keyboard.press('Delete');
  await page.locator('.native-copy').getByRole('link', { name: '打开编辑器', exact: true }).click();
  const restored = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine } = await import(/* @vite-ignore */ bridge);
    return { xml: engine.exportSvg(), past: engine.past.length };
  });
  expect(restored).toEqual(state);
});

test('exported brand SVGs retain live connections when nodes move inside the editor', async ({
  page,
}) => {
  for (const brand of ['Figma', 'Vercel', 'OpenAI']) {
    await page.goto('/');
    await selectBrand(page, brand);
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.locator('[data-svg-host] [data-node="retrieve"]')).toBeVisible();
    const result = await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts';
      const { engine } = await import(/* @vite-ignore */ bridge);
      const node = engine.root!.querySelector('[data-node="retrieve"]') as SVGGraphicsElement;
      const lines = [
        ...(engine.root!.querySelectorAll(
          'polyline[data-sf-end-node]',
        ) as NodeListOf<SVGPolylineElement>),
      ];
      const line = lines.find((item) => item.getAttribute('data-sf-end-node') === '#' + node.id)!;
      const p = line.points.getItem(line.points.numberOfItems - 1),
        before = { x: p.x, y: p.y };
      const lineId = line.id;
      engine.select([node]);
      engine.translate(20, 20);
      const updated = engine.root!.querySelector(`[id="${lineId}"]`) as SVGPolylineElement;
      const q = updated.points.getItem(updated.points.numberOfItems - 1);
      return {
        x: q.x - before.x,
        y: q.y - before.y,
        count: engine.root!.querySelectorAll('[data-sf-end-node]').length,
      };
    });
    expect(result.count).toBe(8);
    expect(result.x).toBeCloseTo(20, 3);
    expect(result.y).toBeCloseTo(20, 3);
  }
});

test('a full workspace keeps the diagram and provides a route to manage documents', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { documents } = await import(/* @vite-ignore */ bridge);
    while (documents.items.length < 20) documents.create();
  });
  await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('最多同时打开 20 张 SVG');
  await expect(page.locator('.demo-canvas [data-node]')).toHaveCount(9);
  await page.getByRole('link', { name: '前往编辑器管理图稿' }).click();
  await expect(page).toHaveURL(/\/editor$/);
});

test('GSAP scroll construction and document closure clean up on reduced motion and navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const module = '/src/home/motion.ts';
        return (await import(/* @vite-ignore */ module)).ScrollTrigger.getAll().length;
      }),
    )
    .toBe(4);
  const signal = page.locator('.hero-signal');
  await expect.poll(() => signal.getAttribute('opacity')).toBe('1');
  const start = await signal.getAttribute('cy');
  await expect.poll(() => signal.getAttribute('cy')).not.toBe(start);
  await page.locator('.document-footer').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('.footer-close')).toHaveAttribute('data-morph', 'svg');
  await expect(page.locator('.closing-guides,.closing-bracket,.closing-dot')).toHaveCount(0);
  await mkdir(output, { recursive: true });
  await page.locator('.document-footer').screenshot({ path: `${output}/footer-motion.png` });
  const paused = await signal.getAttribute('cy');
  await page.waitForTimeout(150);
  expect(await signal.getAttribute('cy')).toBe(paused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const module = '/src/home/motion.ts';
        return (await import(/* @vite-ignore */ module)).ScrollTrigger.getAll().length;
      }),
    )
    .toBe(0);
  await expect(signal).toHaveAttribute('opacity', '0');
  await page.locator('.native-copy').getByRole('link', { name: '打开编辑器', exact: true }).click();
  await expect(page).toHaveURL(/\/editor$/);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const module = '/src/home/motion.ts';
        return (await import(/* @vite-ignore */ module)).ScrollTrigger.getAll().length;
      }),
    )
    .toBe(0);
});

test('Skill and editor animations have visible intermediate phases and finish inside their chapters', async ({
  page,
}) => {
  const evidence = '.impeccable/review/home-scroll-timing';
  await mkdir(evidence, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [
    [1600, 1000],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const [chapter, ids, selectors] of [
      [
        '.skill-chapter',
        ['skill-task-route', 'skill-svg-assembly'],
        '.task-route path,.file-handoff-route path,.skill-diagram .graph-route',
      ],
      ['.editor-chapter', ['svg-export-route'], '.export-route path'],
    ] as const) {
      const primary = ids[ids.length - 1];
      await page.evaluate(async (id) => {
        const module = '/src/home/motion.ts';
        const { ScrollTrigger } = await import(/* @vite-ignore */ module);
        ScrollTrigger.refresh();
        const trigger = ScrollTrigger.getById(id)!;
        window.scrollTo({ top: (trigger.start + trigger.end) / 2, behavior: 'instant' });
        ScrollTrigger.update();
      }, primary);
      await expect
        .poll(() =>
          page.evaluate(async (id) => {
            const module = '/src/home/motion.ts';
            const { ScrollTrigger } = await import(/* @vite-ignore */ module);
            return ScrollTrigger.getById(id)!.animation!.progress();
          }, primary),
        )
        .toBeCloseTo(0.5, 1);
      if (chapter === '.skill-chapter') {
        // Node/connection assembly has its own beat before the handoff and file reveal.
        await expect(page.locator('.file-handoff-route path')).toHaveCSS(
          'stroke-dashoffset',
          '1px',
        );
        const clip = await page
          .locator('.skill-file')
          .evaluate((element) => getComputedStyle(element).clipPath);
        expect(clip).toContain('100%');
      } else {
        const offset = await page
          .locator('.export-route path')
          .evaluate((element) => parseFloat(getComputedStyle(element).strokeDashoffset));
        expect(offset).toBeGreaterThan(0.35);
        expect(offset).toBeLessThan(0.65);
      }
      await page.screenshot({ path: `${evidence}/${width}-${chapter.slice(1)}-midpoint.png` });
      const progress = await page.evaluate(
        async ({ chapter, ids }) => {
          const module = '/src/home/motion.ts';
          const { ScrollTrigger } = await import(/* @vite-ignore */ module);
          ScrollTrigger.refresh();
          const bounds = document.querySelector(chapter)!.getBoundingClientRect();
          window.scrollTo({
            top: Math.ceil(bounds.bottom + scrollY - innerHeight * 0.7),
            behavior: 'instant',
          });
          ScrollTrigger.update();
          return ids.map((id) => ScrollTrigger.getById(id)?.animation?.progress());
        },
        { chapter, ids: [...ids] },
      );
      // Boundary completion flushes only the small remaining scrub catch-up.
      expect(progress).toEqual(ids.map(() => 1));
      const paths = await page.locator(selectors).evaluateAll((elements) =>
        elements.map((element) => ({
          offset: parseFloat(getComputedStyle(element).strokeDashoffset),
          unit: (element as SVGGeometryElement).pathLength.baseVal,
        })),
      );
      expect(paths).toEqual(paths.map(() => ({ offset: 0, unit: 1 })));
      if (chapter === '.skill-chapter') {
        const finished = await page.locator('.skill-file').evaluate((element) => ({
          y: new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
          clip: getComputedStyle(element)
            .clipPath.match(/[\d.]+/g)
            ?.map(Number),
        }));
        expect(Math.abs(finished.y)).toBeLessThan(0.01);
        expect(finished.clip?.every((value) => value === 0)).toBe(true);
      }
      await page.screenshot({ path: `${evidence}/${width}-${chapter.slice(1)}.png` });
    }
    const end = await page.evaluate(async () => {
      const module = '/src/home/motion.ts';
      const { ScrollTrigger } = await import(/* @vite-ignore */ module);
      return ScrollTrigger.getById('svg-export-route')!.end;
    });
    await page.getByRole('button', { name: '查看生成指令', exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const module = '/src/home/motion.ts';
          const { ScrollTrigger } = await import(/* @vite-ignore */ module);
          return ScrollTrigger.getById('svg-export-route')!.end;
        }),
      )
      .toBeGreaterThan(end);
  }
});

test('all chapters remain visible and responsive across desktop, compact and phone viewports', async ({
  page,
}) => {
  await mkdir(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1513, height: 1039 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await page.screenshot({ path: `${output}/hero-repro.png` });
  await expect(page.locator('.hero-diagram .graph-annotation')).toHaveCount(3);
  await expect(page.locator('.skill-diagram .graph-annotation')).toHaveCount(6);
  await expect(page.locator('.skill-file .file-drawing rect')).toHaveCount(9);
  await expect(page.locator('.export-file .file-drawing rect')).toHaveCount(9);
  expect(
    await page.evaluate(() => document.fonts.check('900 80px "JustSVG Sans"', '原生品牌风格')),
  ).toBe(true);
  for (const [name, width, height] of [
    ['desktop', 1600, 1000],
    ['user-633', 633, 905],
    ['mobile', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    if (name === 'desktop') {
      await page.screenshot({ path: `${output}/hero.png` });
      for (const [selector, file] of [
        ['.brand-records', 'brand-default'],
        ['.skill-chapter', 'skill-native'],
        ['.editor-chapter', 'editor-native'],
        ['.document-footer', 'footer-native'],
      ] as const)
        await page.locator(selector).screenshot({ path: `${output}/${file}.png` });
      await selectBrand(page, 'Figma');
      await expect(page.locator('.home-page')).toHaveAttribute('data-theme', 'figma');
      await page.locator('.brand-records').screenshot({ path: `${output}/brand-figma.png` });
      await selectBrand(page, 'Figma');
      await page.locator('.skill-chapter').screenshot({ path: `${output}/skill-figma.png` });
      await page.locator('.editor-chapter').screenshot({ path: `${output}/editor-figma.png` });
      await page.locator('.document-footer').screenshot({ path: `${output}/footer-figma.png` });
      for (const brand of ['Vercel', 'OpenAI']) {
        await selectBrand(page, brand);
        await page
          .locator('.brand-records')
          .screenshot({ path: `${output}/brand-${brand.toLowerCase()}.png` });
      }
      await page.getByRole('button', { name: '还原首页风格', exact: true }).click();
    }
  }
});
