import {
  chooseContent,
  downloadExampleFromEditor,
  selectExampleOption,
  expectExampleOptionCount,
  expectFullPagePreview,
} from './example-navigation';
import { test, expect } from '@playwright/test';
const variations = [
  {
    id: 'base-dense-platform',
    style: '基础风格',
    width: 1600,
    height: 1100,
    nodes: 38,
    edges: 30,
  },
  {
    id: 'base-layered-platform',
    style: '基础风格',
    width: 1200,
    height: 800,
    nodes: 9,
    edges: 8,
  },
  {
    id: 'base-release-flow',
    style: '基础风格',
    width: 1400,
    height: 900,
    nodes: 10,
    edges: 10,
  },
  {
    id: 'base-request-observability',
    style: '基础风格',
    width: 1400,
    height: 900,
    nodes: 12,
    edges: 5,
  },
];
const themedVariations = [
  ...variations,
  ...[
    ['wire', '基础·黑白线框'],
    ['zone', '基础·分区白卡'],
    ['night', '基础·深色工程'],
    ['reference', '基础·技术文档'],
  ].flatMap(([key, style]) =>
    variations.map((e) => ({ ...e, id: e.id.replace('base-', `base-${key}-`), style })),
  ),
];

test('base variations preserve readable native geometry, clear connectors and standalone exports', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const example of themedVariations) {
    await page.goto(`/examples?example=${example.id}`);
    const svg = page.locator('.example-artboard').locator('svg');
    await expect(svg).toBeVisible();
    await expect(
      page
        .getByRole('combobox', { name: '选择视觉风格', exact: true })
        .filter({ hasText: example.style }),
    ).toBeVisible();
    const geometry = await svg.evaluate((root) => {
      const errors: string[] = [],
        overlaps = new Set<string>();
      const nodes = [...root.querySelectorAll<SVGGElement>('[data-node]')];
      const labels = [...root.querySelectorAll<SVGTextElement>('text')].map((t) => ({
        text: t.textContent,
        b: t.getBBox(),
      }));
      const bounds = (root as SVGSVGElement).viewBox.baseVal;
      for (const { text, b } of labels)
        if (
          b.x < 0 ||
          b.y < 0 ||
          b.x + b.width > bounds.width + 1 ||
          b.y + b.height > bounds.height + 1
        )
          errors.push(`outside:${text}`);
      for (const node of nodes) {
        const box = node.querySelector<SVGRectElement>('rect')!.getBBox();
        for (const t of node.querySelectorAll<SVGTextElement>('text')) {
          const b = t.getBBox();
          if (
            b.x < box.x + 3 ||
            b.y < box.y + 3 ||
            b.x + b.width > box.x + box.width - 3 ||
            b.y + b.height > box.y + box.height - 3
          )
            errors.push(`${node.id}:${t.textContent}`);
        }
      }
      const surfaces = nodes
        .flatMap((n) => [...n.querySelectorAll<SVGGeometryElement>('rect,path,polygon')])
        .filter((s) => getComputedStyle(s).fill !== 'none');
      const edges = [...root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')];
      for (const edge of edges) {
        for (let d = 0; d <= edge.getTotalLength(); d += 2) {
          const p = edge.getPointAtLength(d);
          if (surfaces.some((s) => s.isPointInFill(p))) overlaps.add(`${edge.id}:node`);
          for (const { text, b } of labels)
            if (
              p.x > b.x + 1 &&
              p.x < b.x + b.width - 1 &&
              p.y > b.y + 1 &&
              p.y < b.y + b.height - 1
            )
              overlaps.add(`${edge.id}:${text}`);
        }
      }
      return { nodes: nodes.length, edges: edges.length, errors, overlaps: [...overlaps] };
    });
    expect(geometry, example.id).toEqual({
      nodes: example.nodes,
      edges: example.edges,
      errors: [],
      overlaps: [],
    });
    const { filename, xml } = await downloadExampleFromEditor(page);
    expect(filename).toBe(`${example.id}-finished.svg`);
    expect(xml).not.toContain('example-artboard');
    const standalone = await page.context().newPage();
    await standalone.setViewportSize({ width: example.width, height: example.height });
    await standalone.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
    await expect(standalone.locator('svg [data-node]')).toHaveCount(example.nodes);
    await standalone.screenshot({ path: `tests/style-${example.id}.png` });
    await standalone.close();
  }
});

test('base variations open as new documents, move linked nodes, edit text and reimport', async ({
  page,
}) => {
  for (const example of themedVariations.filter(
    (e) => variations.some((v) => v.id === e.id) || e.id.endsWith('-dense-platform'),
  )) {
    await page.goto(`/examples?example=${example.id}`);
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.getByRole('tab', { name: `${example.id}.svg`, exact: true })).toBeVisible();
    const result = await page.evaluate(async (id) => {
      const bridge = '/tests/e2e/bridge.ts',
        { engine } = (await import(/* @vite-ignore */ bridge)) as typeof import('./bridge');
      const node = engine.root!.querySelector<SVGGElement>('[data-node]')!,
        nodeId = node.id;
      const edge = engine.root!.querySelector<SVGPolylineElement>(
          `[data-sf-start-node="#${nodeId}"]`,
        )!,
        edgeId = edge.id;
      const original = engine.exportSvg(),
        points = edge.getAttribute('points');
      engine.select([node]);
      engine.translate(18, 12);
      const moved = points !== engine.root!.querySelector(`#${edgeId}`)!.getAttribute('points');
      engine.undo();
      const undone = original === engine.exportSvg();
      const title = engine.root!.querySelector<SVGTextElement>(`#${nodeId} text`)!;
      engine.updateText(title, ['示例标题修改']);
      engine.undo();
      const textUndo = engine.exportSvg() === original;
      engine.redo();
      const exported = engine.exportSvg();
      engine.importSvg(exported, `${id}.svg`);
      const preserved =
        engine.root!.querySelector(`#${nodeId} text`)!.textContent === '示例标题修改';
      return { moved, undone, textUndo, preserved, nodeId, edgeId };
    }, example.id);
    expect(result, example.id).toMatchObject({
      moved: true,
      undone: true,
      textUndo: true,
      preserved: true,
    });
    // Reimport replaces the root; wait for the editor to mount that root before CTM-based edits.
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
      const line = engine.root!.querySelector(`#${edgeId}`)!,
        before = line.getAttribute('points');
      engine.select([engine.root!.querySelector<SVGGraphicsElement>(`#${nodeId}`)!]);
      engine.translate(4, 2);
      const rebound = before !== line.getAttribute('points'),
        warnings = engine.warnings;
      documents.close(documents.activeId, true);
      return { rebound, warnings };
    }, result);
    expect(next, example.id).toEqual({ rebound: true, warnings: [] });
  }
});

test('base variations are discoverable, fit all viewport sizes and retain full-page inspection', async ({
  page,
}) => {
  await page.goto('/examples?example=factory-rag');
  await chooseContent(page, 'base-dense-platform');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'base-dense-platform',
  );
  await expectExampleOptionCount(page, '选择视觉风格', 5);
  await chooseContent(page, 'base-layered-platform');
  await expect(page).toHaveURL(/example=base-layered-platform$/);
  await chooseContent(page, 'base-dense-platform');
  for (const viewport of [
    { width: 1600, height: 1000, name: 'desktop' },
    { width: 1024, height: 768, name: 'compact' },
    { width: 633, height: 879, name: 'user-633' },
    { width: 390, height: 844, name: 'mobile' },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect
      .poll(() =>
        page.locator('.example-preview-scroll').evaluate((el) => {
          const box = el.querySelector('.example-artboard')!.getBoundingClientRect(),
            outer = el.getBoundingClientRect(),
            button = el
              .closest('.image-detail')!
              .querySelector('.example-fit')!
              .getBoundingClientRect();
          return (
            box.left >= outer.left &&
            box.right <= outer.right + 1 &&
            box.top >= outer.top &&
            box.bottom <= outer.bottom + 1 &&
            button.top >= outer.top &&
            button.right <= outer.right &&
            Math.abs(box.width / box.height - 1600 / 1100) < 0.01 &&
            el.scrollWidth <= el.clientWidth + 1 &&
            el.scrollHeight <= el.clientHeight + 1
          );
        }),
      )
      .toBe(true);
    await page.screenshot({ path: `tests/base-dense-${viewport.name}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: '全屏预览', exact: true }).click();
  await expectFullPagePreview(page, 1600 / 1100);
  await page.getByRole('button', { name: '退出全屏', exact: true }).click();
  await chooseContent(page, 'base-release-flow');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'base-release-flow');
  await chooseContent(page, 'base-request-observability');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'base-request-observability',
  );
});

test('visual variants keep the same content and inspection view while changing the visual grammar', async ({
  page,
}) => {
  const choices = [
    ['base', '标准基础'],
    ['base-wire', '黑白线框'],
    ['base-zone', '分区白卡'],
    ['base-night', '深色工程'],
    ['base-reference', '技术文档'],
  ];
  const signature = () =>
    page.locator('.example-artboard svg').evaluate((root) => ({
      text: [...root.querySelectorAll('text')].map((t) => t.textContent),
      nodes: [...root.querySelectorAll('[data-node]')].map((n) => [
        n.getAttribute('data-label'),
        ...['x', 'y', 'width', 'height'].map((a) => n.querySelector('rect')!.getAttribute(a)),
      ]),
      edges: [...root.querySelectorAll('[data-sf-start-node]')].map((e) =>
        e.getAttribute('points'),
      ),
    }));
  for (const source of variations) {
    await page.goto(`/examples?example=${source.id}`);
    const baseline = await signature();
    await expectExampleOptionCount(page, '选择视觉风格', 5);
    const presentations = [];
    for (const [style] of choices) {
      await selectExampleOption(
        page,
        '选择视觉风格',
        style === 'base' ? source.id : source.id.replace('base-', `${style}-`),
      );
      const id = style === 'base' ? source.id : source.id.replace('base-', `${style}-`);
      await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', id);
      expect(await signature(), id).toEqual(baseline);
      presentations.push(
        await page
          .locator('.example-artboard svg')
          .evaluate((root) =>
            [
              root.getAttribute('data-visual-style'),
              root.querySelector('[data-node] rect')!.getAttribute('fill'),
              root.querySelector('[data-node] rect')!.getAttribute('rx'),
              root.querySelector('[id*="-layer-"] rect')!.getAttribute('fill'),
            ].join('|'),
          ),
      );
      if (source.id === 'base-dense-platform')
        await page.screenshot({ path: `tests/base-style-${style}-desktop.png`, fullPage: true });
    }
    expect(new Set(presentations).size).toBe(5);
    // Sidebar changes must retain the chosen scene, not silently substitute the dense architecture.
    await selectExampleOption(page, '选择视觉风格', source.id.replace('base-', 'base-wire-'));
    await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
      'data-value',
      source.id.replace('base-', 'base-wire-'),
    );
  }
  await page.goto('/examples?example=base-night-dense-platform');
  await page.getByRole('button', { name: '全屏预览', exact: true }).click();
  await expectFullPagePreview(page, 1600 / 1100);
  await selectExampleOption(page, '选择视觉风格', { label: '基础·分区白卡' });
  await expect(page.getByRole('button', { name: '退出全屏', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expectFullPagePreview(page, 1600 / 1100);
  await page.getByRole('button', { name: '退出全屏', exact: true }).click();
  await page.setViewportSize({ width: 633, height: 879 });
  await page.screenshot({ path: 'tests/base-style-user-633.png', fullPage: true });
  await selectExampleOption(page, '选择视觉风格', { label: '基础·深色工程' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tests/base-style-mobile.png', fullPage: true });
});

test('the same architecture can be compared across five native visual treatments', async ({
  page,
}) => {
  await page.goto('/examples?example=base-dense-platform');
  const samples = await page.evaluate(async () => {
    const module = '/src/examples/base-variations.ts';
    return (await import(/* @vite-ignore */ module)).baseVariationExamples.filter(
      (e: { sourceId: string }) => e.sourceId === 'base-dense-platform',
    );
  });
  await page.setViewportSize({ width: 1680, height: 1270 });
  const labels = ['标准基础', '黑白线框', '分区白卡', '深色工程', '技术文档'];
  await page.setContent(
    `<style>body{margin:0;padding:24px;background:#edf0f4;font:16px Arial,'PingFang SC',sans-serif;color:#263044}h1{font-size:24px;margin:0 0 18px}main{display:grid;grid-template-columns:1fr 1fr;gap:16px}article{background:#fff;padding:12px}h2{font-size:17px;margin:0 0 10px}svg{display:block;width:100%;height:auto}</style><h1>同一张架构图 · 五种视觉风格</h1><main>${samples.map((e: { svg: string }, i: number) => `<article><h2>${labels[i]}</h2>${e.svg}</article>`).join('')}</main>`,
  );
  await expect(page.locator('svg')).toHaveCount(5);
  await page.screenshot({ path: 'tests/base-visual-comparison.png', fullPage: true });
});
