import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { selectExampleOption, expectFullPagePreview } from './example-navigation';

test('arXiv methods figure is discoverable, fits the viewport and has no colliding labels', async ({ page }) => {
  await page.goto('/examples');
  await page.getByLabel('搜索示例').fill('arxiv');
  await expect(page.locator('.image-result')).toHaveCount(1);
  await page.locator('#result-arxiv-rag').click();
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'arxiv-rag');
  await expect(page.getByRole('textbox', { name: '生成 Prompt', exact: true })).toHaveValue(/arXiv 论文配图/);
  const svg = page.locator('.example-artboard svg');
  const geometry = await svg.evaluate((element) => {
    const root = element as SVGSVGElement;
    const errors: string[] = [];
    const texts = [...root.querySelectorAll('text')];
    for (const text of texts) {
      const box = text.getBBox();
      if (box.x < 0 || box.y < 0 || box.x + box.width > 1440 || box.y + box.height > 900)
        errors.push(`outside canvas: ${text.textContent}`);
      const node = text.closest('[data-node]');
      if (node) {
        const bounds = node.querySelector('rect')!.getBBox();
        if (box.x < bounds.x + 10 || box.y < bounds.y + 10 ||
            box.x + box.width > bounds.x + bounds.width - 10 ||
            box.y + box.height > bounds.y + bounds.height - 10)
          errors.push(`outside module: ${text.textContent}`);
      }
    }
    const edges = [...root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')];
    for (const edge of edges) {
      const length = edge.getTotalLength();
      for (let offset = 2; offset < length - 2; offset += 2) {
        const point = edge.getPointAtLength(offset);
        for (const text of texts) {
          const box = text.getBBox();
          if (point.x > box.x && point.x < box.x + box.width &&
              point.y > box.y && point.y < box.y + box.height)
            errors.push(`${edge.id} intersects ${text.textContent}`);
        }
      }
    }
    return { errors: [...new Set(errors)], nodes: root.querySelectorAll('[data-node]').length, edges: edges.length };
  });
  expect(geometry).toEqual({ errors: [], nodes: 9, edges: 8 });
  await page.getByRole('button', { name: '全屏预览', exact: true }).click();
  await expectFullPagePreview(page, 1440 / 900);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFullPagePreview(page, 1440 / 900);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('arXiv style supports comparison, linked movement, text edits, undo and SVG round trip', async ({ page }) => {
  await page.goto('/examples?example=paper-rag');
  await selectExampleOption(page, '选择视觉风格', 'arxiv-rag');
  await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'arxiv-rag.svg', exact: true })).toBeVisible();
  const result = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine } = await import(/* @vite-ignore */ bridge) as typeof import('./bridge');
    const original = engine.exportSvg();
    const edge = engine.root!.querySelector<SVGPolylineElement>('#arxiv-edge-docs-chunks')!;
    const point = edge.points.getItem(0);
    const before = { x: point.x, y: point.y };
    engine.select([engine.root!.querySelector<SVGGElement>('#arxiv-node-docs')!]);
    engine.translate(12, 8);
    const moved = edge.points.getItem(0);
    const delta = { x: moved.x - before.x, y: moved.y - before.y };
    engine.undo();
    const undone = engine.exportSvg() === original;
    engine.updateText(engine.root!.querySelector<SVGTextElement>('#arxiv-node-answer text')!, ['Response']);
    engine.undo();
    engine.redo();
    const xml = engine.exportSvg();
    engine.importSvg(xml, 'academic-roundtrip.svg');
    return { delta, undone, xml, warnings: engine.warnings, text: engine.root!.querySelector('#arxiv-node-answer text')!.textContent };
  });
  expect(result.delta).toEqual({ x: 12, y: 8 });
  expect(result.undone).toBe(true);
  expect(result.warnings).toEqual([]);
  expect(result.text).toBe('Response');
  expect(result.xml).not.toMatch(/<(?:image|script|foreignObject)\b/);
  await page.locator('.export-dropdown > summary').click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('academic-roundtrip-finished.svg');
  const downloadedSvg = await readFile((await download.path())!, 'utf8');
  const native = await page.context().newPage();
  await native.goto(`data:image/svg+xml,${encodeURIComponent(downloadedSvg)}`);
  await expect(native.locator('[data-node]')).toHaveCount(9);
  await expect(native.locator('#arxiv-node-answer text').first()).toHaveText('Response');
  await native.close();
});
