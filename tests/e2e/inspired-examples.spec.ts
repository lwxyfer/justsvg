import { test, expect } from '@playwright/test';
import {
  downloadExampleFromEditor,
  expectFullPagePreview,
  selectExampleOption,
} from './example-navigation';
const ids = [
  'starwars-rag',
  'bikini-bottom-rag',
  'brand-goldman-sachs-rag',
  'brand-morgan-stanley-rag',
  'brand-jpmorgan-rag',
];
for (const id of ids) {
  test(`${id} has clear geometry, editable links and a native export`, async ({ page }) => {
    await page.goto(`/examples?example=${id}`);
    await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', id);
    const svg = page.locator('.example-artboard svg');
    const geometry = await svg.evaluate((element) => {
      const root = element as SVGSVGElement;
      const errors: string[] = [];
      const texts = [...root.querySelectorAll('text')];
      for (const text of texts) {
        const b = text.getBBox();
        if (b.x < 0 || b.y < 0 || b.x + b.width > 1600 || b.y + b.height > 1100)
          errors.push(`canvas: ${text.textContent}`);
        const node = text.closest('[data-node]');
        if (node) {
          const [x, y, w, h] = node.getAttribute('data-layout')!.split(' ').map(Number);
          if (b.x < x + 6 || b.y < y + 6 || b.x + b.width > x + w - 6 || b.y + b.height > y + h - 6)
            errors.push(`module: ${node.id}: ${text.textContent}`);
        }
      }
      for (const edge of root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')) {
        const length = edge.getTotalLength();
        for (let offset = 2; offset < length - 2; offset += 3) {
          const point = edge.getPointAtLength(offset);
          for (const text of texts) {
            const b = text.getBBox();
            if (
              point.x > b.x &&
              point.x < b.x + b.width &&
              point.y > b.y &&
              point.y < b.y + b.height
            )
              errors.push(`edge/text: ${edge.id}: ${text.textContent}`);
          }
        }
      }
      return [...new Set(errors)];
    });
    expect(geometry).toEqual([]);
    const downloaded = await downloadExampleFromEditor(page);
    expect(downloaded.filename).toBe(`${id}-finished.svg`);
    const native = await page.context().newPage();
    await native.goto(`data:image/svg+xml,${encodeURIComponent(downloaded.xml)}`);
    await expect(native.locator('[data-node]')).toHaveCount(9);
    await native.close();
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    const movement = await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts';
      const { engine } = (await import(/* @vite-ignore */ bridge)) as typeof import('./bridge');
      const errors: string[] = [];
      const nodeIds = [...engine.root!.querySelectorAll('[data-node]')].map((node) => node.id);
      for (const nodeId of nodeIds) {
        const before = engine.exportSvg();
        const edges = [
          ...engine.root!.querySelectorAll<SVGPolylineElement>(
            `[data-sf-start-node="#${nodeId}"],[data-sf-end-node="#${nodeId}"]`,
          ),
        ].map((edge) => ({
          id: edge.id,
          points: [edge.points.getItem(0), edge.points.getItem(edge.points.numberOfItems - 1)].map(
            (p) => ({ x: p.x, y: p.y }),
          ),
          moving: ['start', 'end'].map(
            (end) => edge.getAttribute(`data-sf-${end}-node`) === `#${nodeId}`,
          ),
        }));
        engine.select([engine.root!.querySelector<SVGGElement>(`#${nodeId}`)!]);
        engine.translate(6, 4);
        for (const old of edges) {
          const edge = engine.root!.querySelector<SVGPolylineElement>(`#${old.id}`)!;
          const after = [
            edge.points.getItem(0),
            edge.points.getItem(edge.points.numberOfItems - 1),
          ];
          for (let i = 0; i < 2; i++)
            if (
              Math.abs(after[i].x - old.points[i].x - (old.moving[i] ? 6 : 0)) > 0.01 ||
              Math.abs(after[i].y - old.points[i].y - (old.moving[i] ? 4 : 0)) > 0.01
            )
              errors.push(`${nodeId}: ${old.id} endpoint ${i} jumped`);
        }
        engine.undo();
        if (engine.exportSvg() !== before) errors.push(`${nodeId}: undo changed document`);
        for (let i = 0; i < 10 && !engine.root!.isConnected; i++)
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      const textId = engine.root!.querySelector<SVGTextElement>('[data-node] text')!;
      engine.updateText(textId, ['Edited node']);
      engine.undo();
      engine.redo();
      engine.importSvg(engine.exportSvg(), 'inspired-roundtrip.svg');
      if (!engine.exportSvg().includes('Edited node') || engine.warnings.length)
        errors.push('roundtrip failed');
      return errors;
    });
    expect(movement).toEqual([]);
  });
}

test('worlds and finance styles remain searchable and fit mobile full-page preview', async ({
  page,
}) => {
  await page.goto('/examples?example=starwars-rag');
  await selectExampleOption(page, '选择视觉风格', 'bikini-bottom-rag');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '全屏预览', exact: true }).click();
  await expectFullPagePreview(page, 1600 / 1100);
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await page.getByLabel('搜索示例').fill('投行');
  await expect(page.locator('.image-result')).toHaveCount(3);
});
