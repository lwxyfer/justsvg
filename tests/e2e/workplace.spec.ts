import { selectExampleOption } from './example-navigation';
import { test, expect } from '@playwright/test';
import manifest from '../../src/examples/workplace-manifest.json' with { type: 'json' };
for (const subject of manifest.filter((e) => e.style === 'base')) {
  test(`${subject.diagramType}: all visual variants and editable roundtrip`, async ({ page }) => {
    for (const item of manifest.filter((e) => e.sourceId === subject.sourceId)) {
      await page.goto(`/examples?example=${item.id}`);
      const svg = page.locator('.example-artboard svg');
      await expect(svg).toBeVisible();
      const errors = await svg.evaluate((root) => {
        const errors: string[] = [];
        const texts = [...root.querySelectorAll<SVGTextElement>('text')].map((t) => ({
          text: t.textContent,
          b: t.getBBox(),
        }));
        for (const t of texts)
          if (t.b.x < 0 || t.b.y < 0 || t.b.x + t.b.width > 1600 || t.b.y + t.b.height > 1000)
            errors.push(`outside ${t.text}`);
        for (const edge of root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')) {
          for (let at = 0; at < edge.getTotalLength(); at += 3) {
            const p = edge.getPointAtLength(at);
            for (const t of texts)
              if (
                p.x > t.b.x + 1 &&
                p.x < t.b.x + t.b.width - 1 &&
                p.y > t.b.y + 1 &&
                p.y < t.b.y + t.b.height - 1
              )
                errors.push(`edge/text ${t.text}`);
          }
        }
        return [...new Set(errors)];
      });
      expect(errors).toEqual([]);
    }
    await page.goto(`/examples?example=${subject.id}`);
    await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', subject.id);
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
    const result = await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts';
      const { engine } = (await import(/* @vite-ignore */ bridge)) as typeof import('./bridge');
      const root = engine.root!,
        ids = [...root.querySelectorAll<SVGGElement>('[data-node]')].map((n) => n.id);
      const errors: string[] = [];
      for (const id of ids) {
        const node = engine.root!.querySelector<SVGGElement>(`#${id}`)!;
        const before = engine.exportSvg();
        const incident = [
          ...engine.root!.querySelectorAll<SVGPolylineElement>(
            `[data-sf-start-node="#${id}"],[data-sf-end-node="#${id}"]`,
          ),
        ].map((e) => ({
          id: e.id,
          refs: [e.getAttribute('data-sf-start-node'), e.getAttribute('data-sf-end-node')],
          p: [e.points.getItem(0), e.points.getItem(e.points.numberOfItems - 1)].map((p) => ({
            x: p.x,
            y: p.y,
          })),
        }));
        engine.select([node]);
        engine.translate(8, 5);
        for (const edge of incident) {
          const now = engine.root!.querySelector<SVGPolylineElement>(`#${edge.id}`)!;
          for (const [i, p] of [
            now.points.getItem(0),
            now.points.getItem(now.points.numberOfItems - 1),
          ].entries()) {
            const move = edge.refs[i] === `#${id}`;
            if (
              Math.abs(p.x - edge.p[i].x - (move ? 8 : 0)) > 0.1 ||
              Math.abs(p.y - edge.p[i].y - (move ? 5 : 0)) > 0.1
            )
              errors.push(id + ':binding');
          }
        }
        engine.undo();
        await new Promise<void>((resolve) => {
          const check = () => (engine.root?.isConnected ? resolve() : requestAnimationFrame(check));
          requestAnimationFrame(check);
        });
        if (engine.exportSvg() !== before) errors.push(id + ':undo');
      }
      const text = engine.root!.querySelector<SVGTextElement>('[data-node] text')!;
      engine.updateText(text, ['已编辑']);
      const xml = engine.exportSvg();
      engine.importSvg(xml, 'work-roundtrip.svg');
      return { errors, edited: engine.exportSvg().includes('已编辑'), nodes: ids.length };
    });
    expect(result.errors).toEqual([]);
    expect(result.edited).toBe(true);
    expect(result.nodes).toBeGreaterThanOrEqual(4);
  });
}
test('workplace discovery filters content without silently changing the preview', async ({
  page,
}) => {
  await page.goto('/examples?example=brand-mistral-rag');
  await selectExampleOption(page, '筛选图形类型', '实体关系图');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'brand-mistral-rag');
  await page.locator('#result-work-standard-entity').click();
  await selectExampleOption(page, '选择视觉风格', 'work-night-entity');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'work-night-entity');
});
