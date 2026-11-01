import {
  chooseContent,
  downloadExampleFromEditor,
  selectExampleOption,
  expectExampleOptionCount,
} from './example-navigation';
import { test, expect } from '@playwright/test';
const refs = [
  {
    id: 'reference-sandbox-overview',
    name: '参考复刻 · sandbox-runtime 总体分层架构',
    width: 1648,
    height: 988,
    nodes: 21,
    edges: 26,
  },
  {
    id: 'reference-linux-topology',
    name: '参考复刻 · Linux 命名空间拓扑',
    width: 1648,
    height: 1048,
    nodes: 23,
    edges: 17,
  },
];

test('both user reference reconstructions have native centered text and clear node links', async ({
  page,
}) => {
  for (const ref of refs) {
    await page.goto(`/examples?example=${ref.id}`);
    await expect(
      page
        .getByRole('combobox', { name: '选择视觉风格', exact: true })
        .filter({ hasText: '基础·技术文档' }),
    ).toBeVisible();
    const svg = page.locator('.example-artboard svg');
    await expect(svg).toBeVisible();
    const result = await svg.evaluate((root) => {
      const nodes = [...root.querySelectorAll<SVGGElement>('[data-node]')],
        edges = [...root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')],
        errors: string[] = [],
        collisions = new Set<string>();
      const view = (root as SVGSVGElement).viewBox.baseVal;
      for (const t of root.querySelectorAll<SVGTextElement>('text')) {
        const b = t.getBBox();
        if (
          b.x < 0 ||
          b.y < 0 ||
          b.x + b.width > view.width + 1 ||
          b.y + b.height > view.height + 1
        )
          errors.push(`outside:${t.textContent}`);
      }
      for (const node of nodes) {
        const box = node.querySelector<SVGRectElement>('rect')!.getBBox();
        for (const text of node.querySelectorAll<SVGTextElement>('text')) {
          const b = text.getBBox();
          if (
            b.x < box.x + 3 ||
            b.y < box.y + 3 ||
            b.x + b.width > box.x + box.width - 3 ||
            b.y + b.height > box.y + box.height - 3
          )
            errors.push(`${node.id}:${text.textContent}`);
        }
      }
      const surfaces = nodes.map((n) => n.querySelector<SVGGeometryElement>('rect')!);
      const labels = [...root.querySelectorAll<SVGTextElement>('text')].map((t) => ({
        text: t.textContent,
        b: t.getBBox(),
      }));
      for (const edge of edges)
        for (let at = 0; at <= edge.getTotalLength(); at += 2) {
          const p = edge.getPointAtLength(at);
          if (surfaces.some((s) => s.isPointInFill(p))) collisions.add(`${edge.id}:node`);
          for (const { text, b } of labels)
            if (
              p.x > b.x + 1 &&
              p.x < b.x + b.width - 1 &&
              p.y > b.y + 1 &&
              p.y < b.y + b.height - 1
            )
              collisions.add(`${edge.id}:${text}`);
        }
      return { nodes: nodes.length, edges: edges.length, errors, collisions: [...collisions] };
    });
    expect(result, ref.id).toEqual({
      nodes: ref.nodes,
      edges: ref.edges,
      errors: [],
      collisions: [],
    });
    const { xml } = await downloadExampleFromEditor(page);
    expect(xml).not.toContain('<image');
    expect(xml).not.toContain('<script');
    const standalone = await page.context().newPage();
    await standalone.setViewportSize({ width: ref.width, height: ref.height });
    await standalone.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
    await expect(standalone.locator('[data-node]')).toHaveCount(ref.nodes);
    await standalone.screenshot({ path: `tests/${ref.id}-native.png` });
    // Match the supplied reference image dimensions for an honest full-resolution comparison.
    await standalone.setViewportSize({ width: ref.width * 2, height: ref.height * 2 });
    await standalone.locator('svg').evaluate((el) => {
      el.setAttribute('width', '100%');
      el.setAttribute('height', '100%');
    });
    await standalone.screenshot({
      path:
        ref.id === 'reference-sandbox-overview'
          ? '.impeccable/review/hero-repro.png'
          : '.impeccable/review/reference-linux-repro.png',
    });
    await standalone.close();
  }
});

test('reference SVGs open for linked movement, text editing, undo and reimport', async ({
  page,
}) => {
  for (const ref of refs) {
    await page.goto(`/examples?example=${ref.id}`);
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.getByRole('tab', { name: `${ref.id}.svg`, exact: true })).toBeVisible();
    const result = await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts',
        { engine } = (await import(/* @vite-ignore */ bridge)) as typeof import('./bridge');
      const node = engine.root!.querySelector<SVGGElement>('[data-node]')!,
        id = node.id,
        edge = engine.root!.querySelector(`[data-sf-start-node="#${id}"]`)!,
        before = edge.getAttribute('points'),
        xml = engine.exportSvg();
      engine.select([node]);
      engine.translate(12, 8);
      const moved = before !== edge.getAttribute('points');
      engine.undo();
      const undo = xml === engine.exportSvg();
      engine.updateText(engine.root!.querySelector<SVGTextElement>(`#${id} text`)!, ['标题修改']);
      const edited = engine.exportSvg().includes('标题修改');
      engine.undo();
      const textUndo = engine.exportSvg() === xml;
      const safeModule = '/src/editor/security/sanitize.ts',
        sanitized = (
          (await import(
            /* @vite-ignore */ safeModule
          )) as typeof import('../../src/editor/security/sanitize')
        ).sanitizeSvg(engine.exportSvg());
      const count = sanitized.root.querySelectorAll('[data-node]').length,
        warnings = sanitized.warnings;
      engine.importSvg(engine.exportSvg(), 'reference-roundtrip.svg');
      return { moved, undo, edited, textUndo, count, warnings, id, edgeId: edge.id };
    });
    expect(result, ref.id).toMatchObject({
      moved: true,
      undo: true,
      edited: true,
      textUndo: true,
      count: ref.nodes,
      warnings: [],
    });
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const bridge = '/tests/e2e/bridge.ts';
          return ((await import(/* @vite-ignore */ bridge)) as typeof import('./bridge')).engine
            .root!.isConnected;
        }),
      )
      .toBe(true);
    const reimported = await page.evaluate(async ({ id, edgeId }) => {
      const bridge = '/tests/e2e/bridge.ts',
        { engine, documents } = (await import(
          /* @vite-ignore */ bridge
        )) as typeof import('./bridge');
      const node = engine.root!.querySelector<SVGGElement>(`#${id}`)!,
        edge = engine.root!.querySelector(`#${edgeId}`)!,
        points = edge.getAttribute('points');
      engine.select([node]);
      engine.translate(5, 3);
      const rebound = points !== edge.getAttribute('points'),
        warnings = engine.warnings;
      documents.close(documents.activeId, true);
      return { rebound, warnings };
    }, result);
    expect(reimported, ref.id).toEqual({ rebound: true, warnings: [] });
  }
});

test('the reference look applies to the same content and exposes both reconstructions', async ({
  page,
}) => {
  await page.goto('/examples?example=base-dense-platform');
  const signature = () =>
    page.locator('.example-artboard svg').evaluate((root) => ({
      text: [...root.querySelectorAll('text')].map((t) => t.textContent),
      nodes: [...root.querySelectorAll('[data-node]')].map((n) =>
        ['x', 'y', 'width', 'height'].map((a) => n.querySelector('rect')!.getAttribute(a)),
      ),
      edges: [...root.querySelectorAll('[data-sf-start-node]')].map((e) =>
        e.getAttribute('points'),
      ),
    }));
  const original = await signature();
  await selectExampleOption(page, '选择视觉风格', { label: '基础·技术文档' });
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'base-reference-dense-platform',
  );
  expect(await signature()).toEqual(original);
  await expectExampleOptionCount(page, '选择视觉风格', 5);
  await page.screenshot({ path: 'tests/reference-style-dense-desktop.png', fullPage: true });
  await chooseContent(page, 'reference-sandbox-overview');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'reference-sandbox-overview',
  );
  for (const ref of refs) {
    await chooseContent(page, ref.id);
    await page.screenshot({ path: `tests/${ref.id}-desktop.png`, fullPage: true });
  }
  for (const viewport of [
    { width: 633, height: 879, name: 'user-633' },
    { width: 390, height: 844, name: 'mobile' },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect
      .poll(() =>
        page
          .locator('.example-preview-scroll')
          .evaluate(
            (el) => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1,
          ),
      )
      .toBe(true);
    await page.screenshot({ path: `tests/reference-style-${viewport.name}.png`, fullPage: true });
  }
});
