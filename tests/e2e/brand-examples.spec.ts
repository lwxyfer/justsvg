import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const brands = [
  'apple',
  'microsoft',
  'google',
  'openai',
  'claude',
  'notion',
  'stripe',
  'linear',
  'figma',
  'vercel',
];
const names = [
  'Apple',
  'Microsoft',
  'Google',
  'OpenAI',
  'Claude',
  'Notion',
  'Stripe',
  'Linear',
  'Figma',
  'Vercel',
];
for (const [i, brand] of brands.entries()) {
  test(`${names[i]}: native visual, clear geometry, linked edits and real export/reimport`, async ({
    page,
  }) => {
    const id = `brand-${brand}-rag`;
    await page.goto(`/examples?example=${id}`);
    await expect(page.getByRole('heading', { name: names[i], exact: true })).toBeVisible();
    await expect(page.getByLabel('品牌风格依据')).toContainText('非官方');
    const svg = page.locator('.example-artboard svg');
    await expect(svg).toBeVisible();
    const geometry = await svg.evaluate((root) => {
      const errors: string[] = [],
        overlaps = new Set<string>();
      const nodes = [...root.querySelectorAll<SVGGElement>('[data-node]')];
      const text = [...root.querySelectorAll<SVGTextElement>('text')].map((t) => ({
        s: t.textContent,
        b: t.getBBox(),
      }));
      for (const t of text)
        if (t.b.x < 0 || t.b.y < 0 || t.b.x + t.b.width > 1600 || t.b.y + t.b.height > 1100)
          errors.push(`outside:${t.s}`);
      for (const node of nodes) {
        const [x, y, width, height] = node.getAttribute('data-layout')!.split(' ').map(Number);
        const r = { x, y, width, height };
        for (const t of node.querySelectorAll<SVGTextElement>('text')) {
          const b = t.getBBox();
          if (
            b.x < r.x + 4 ||
            b.y < r.y + 4 ||
            b.x + b.width > r.x + r.width - 4 ||
            b.y + b.height > r.y + r.height - 4
          )
            errors.push(`node:${t.textContent}`);
        }
      }
      const surfaces = nodes.map((n) => n.getAttribute('data-layout')!.split(' ').map(Number));
      for (const edge of root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')) {
        for (let at = 0; at <= edge.getTotalLength(); at += 2) {
          const p = edge.getPointAtLength(at);
          if (surfaces.some(([x, y, w, h]) => p.x > x && p.x < x + w && p.y > y && p.y < y + h))
            overlaps.add(`${edge.id}:node`);
          for (const t of text)
            if (
              p.x > t.b.x + 1 &&
              p.x < t.b.x + t.b.width - 1 &&
              p.y > t.b.y + 1 &&
              p.y < t.b.y + t.b.height - 1
            )
              overlaps.add(`${edge.id}:${t.s}`);
        }
      }
      return {
        errors,
        overlaps: [...overlaps],
        nodes: nodes.length,
        edges: root.querySelectorAll('[data-sf-start-node]').length,
      };
    });
    expect(geometry).toEqual({ errors: [], overlaps: [], nodes: 9, edges: 8 });
    await page.screenshot({ path: `tests/brand-${brand}-desktop.png`, fullPage: true });
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
    const download = await pending,
      xml = await readFile((await download.path())!, 'utf8');
    expect(download.suggestedFilename()).toBe(`${id}.svg`);
    expect(xml).not.toMatch(/<(?:image|script|foreignObject)\b/);
    const standalone = await page.context().newPage();
    await standalone.setViewportSize({ width: 1600, height: 1100 });
    await standalone.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
    await expect(standalone.locator('[data-node]')).toHaveCount(9);
    await standalone.screenshot({ path: `tests/brand-${brand}-native.png` });
    await standalone.close();
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.getByRole('tab', { name: `${id}.svg`, exact: true })).toBeVisible();
    const result = await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts',
        { engine } = (await import(/* @vite-ignore */ bridge)) as typeof import('./bridge');
      const node = engine.root!.querySelector<SVGGElement>('[data-node]')!,
        nodeId = node.id;
      const edge = engine.root!.querySelector(`[data-sf-start-node="#${nodeId}"]`)!,
        edgeId = edge.id;
      const original = engine.exportSvg(),
        points = edge.getAttribute('points');
      engine.select([node]);
      engine.translate(12, 8);
      const moved = points !== edge.getAttribute('points');
      engine.undo();
      const undone = engine.exportSvg() === original;
      engine.updateText(engine.root!.querySelector<SVGTextElement>(`#${nodeId} text`)!, [
        'Editable title',
      ]);
      const edited = engine.exportSvg().includes('Editable title');
      engine.undo();
      engine.redo();
      engine.importSvg(engine.exportSvg(), 'brand-roundtrip.svg');
      return { moved, undone, edited, nodeId, edgeId };
    });
    expect(result).toMatchObject({ moved: true, undone: true, edited: true });
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const bridge = '/tests/e2e/bridge.ts';
          return ((await import(/* @vite-ignore */ bridge)) as typeof import('./bridge')).engine
            .root!.isConnected;
        }),
      )
      .toBe(true);
    const next = await page.evaluate(async ({ nodeId, edgeId }) => {
      const bridge = '/tests/e2e/bridge.ts',
        { engine, documents } = (await import(
          /* @vite-ignore */ bridge
        )) as typeof import('./bridge');
      const node = engine.root!.querySelector<SVGGElement>(`#${nodeId}`)!,
        edge = engine.root!.querySelector(`#${edgeId}`)!,
        p = edge.getAttribute('points');
      const text = node.querySelector('text')!.textContent;
      engine.select([node]);
      engine.translate(3, 2);
      const rebound = p !== edge.getAttribute('points'),
        warnings = engine.warnings;
      documents.close(documents.activeId, true);
      return { rebound, warnings, text };
    }, result);
    expect(next).toEqual({ rebound: true, warnings: [], text: 'Editable title' });
  });
}

test('brand filter, same-content comparison, sources and compact views remain usable', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/examples?example=brand-apple-rag');
  await page
    .getByRole('navigation', { name: '风格分类', exact: true })
    .getByRole('button', { name: '品牌风格 · 10', exact: true })
    .click();
  await expect(
    page.getByRole('navigation', { name: '风格选择', exact: true }).getByRole('button'),
  ).toHaveCount(10);
  const signature = () =>
    page
      .locator('.example-artboard svg')
      .evaluate((root) =>
        [...root.querySelectorAll('[data-node]')].map((n) => [
          n.getAttribute('data-label'),
          ...[...n.querySelectorAll('text')].slice(0, 2).map((t) => t.textContent),
        ]),
      );
  const before = await signature();
  for (const name of names) {
    await page
      .getByRole('navigation', { name: '同图风格', exact: true })
      .getByRole('button', { name, exact: true })
      .click();
    expect(await signature()).toEqual(before);
    const sources = page.getByLabel('品牌风格依据').getByRole('link');
    expect(await sources.count()).toBeGreaterThan(0);
    for (let i = 0; i < (await sources.count()); i++)
      expect(await sources.nth(i).getAttribute('href')).toMatch(/^https:/);
  }
  for (const brand of brands) {
    await page
      .getByRole('navigation', { name: '同图风格', exact: true })
      .getByRole('button', { name: names[brands.indexOf(brand)], exact: true })
      .click();
    for (const viewport of [
      { width: 1600, height: 1000, name: 'desktop' },
      { width: 633, height: 879, name: 'user-633' },
      { width: 390, height: 844, name: 'mobile' },
    ]) {
      await page.setViewportSize(viewport);
      await expect
        .poll(() =>
          page
            .locator('.example-preview-scroll')
            .evaluate(
              (el) =>
                el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1,
            ),
        )
        .toBe(true);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow).toBe(false);
      await page.screenshot({ path: `tests/brand-${brand}-${viewport.name}.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 1600, height: 1000 });
  }
  await page.getByRole('button', { name: '100% 查看', exact: true }).click();
  const native = await page
    .locator('.example-artboard')
    .evaluate((el) => ({ w: el.clientWidth, h: el.clientHeight }));
  expect(native).toEqual({ w: 1600, h: 1100 });
  await page
    .getByRole('navigation', { name: '推荐风格', exact: true })
    .getByRole('button', { name: '基础风格', exact: true })
    .click();
  await expect(
    page
      .getByRole('navigation', { name: '风格分类', exact: true })
      .getByRole('button', { name: '全部', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('navigation', { name: '风格选择', exact: true }).getByRole('button'),
  ).toHaveCount(32);
});

test('ten brand languages can be inspected together as real native SVGs', async ({ page }) => {
  const files = await Promise.all(
    brands.map((brand) => readFile(`src/examples/assets/brand-${brand}-rag.svg`, 'utf8')),
  );
  await page.setViewportSize({ width: 1680, height: 3000 });
  await page.setContent(
    `<html><head><style>body{margin:0;padding:32px;background:#e9ecef;font:20px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0}figcaption{margin-bottom:10px}svg{display:block;width:100%;height:auto}</style></head><body><main>${files.map((xml, i) => `<figure><figcaption>${names[i]}</figcaption>${xml}</figure>`).join('')}</main></body></html>`,
  );
  await expect(page.locator('svg')).toHaveCount(10);
  await page.screenshot({ path: 'tests/brands-contact-sheet.png', fullPage: true });
});

test('the four additional brands have their own inspectable native comparison', async ({
  page,
}) => {
  const subset = brands.slice(-4),
    labels = names.slice(-4);
  const files = await Promise.all(
    subset.map((b) => readFile(`src/examples/assets/brand-${b}-rag.svg`, 'utf8')),
  );
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.setContent(
    `<html><head><style>body{margin:0;padding:32px;background:#e9ecef;font:20px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0}figcaption{margin-bottom:10px}svg{display:block;width:100%;height:auto}</style></head><body><main>${files.map((svg, i) => `<figure><figcaption>${labels[i]}</figcaption>${svg}</figure>`).join('')}</main></body></html>`,
  );
  await expect(page.locator('svg')).toHaveCount(4);
  await page.screenshot({ path: 'tests/brands-stripe-linear-figma-vercel.png', fullPage: true });
});
