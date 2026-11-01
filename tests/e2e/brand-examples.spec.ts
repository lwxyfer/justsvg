import { downloadExampleFromEditor, selectExampleOption } from './example-navigation';
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
  'dropbox',
  'spotify',
  'duolingo',
  'ibm',
  'ramp',
  'github',
  'slack',
  'cloudflare',
  'miro',
  'airbnb',
  'cursor',
  'lovable',
  'supabase',
  'n8n',
  'raycast',
  'bytedance',
  'xiaohongshu',
  'dji',
  'kimi',
  'stepfun',
  'mistral',
  'perplexity',
  'cohere',
  'huggingface',
  'elevenlabs',
  'replicate',
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
  'Dropbox',
  'Spotify',
  'Duolingo',
  'IBM',
  'Ramp',
  'GitHub',
  'Slack',
  'Cloudflare',
  'Miro',
  'Airbnb',
  'Cursor',
  'Lovable',
  'Supabase',
  'n8n',
  'Raycast',
  '字节跳动',
  '小红书',
  'DJI 大疆',
  'Kimi（月之暗面）',
  '阶跃星辰',
  'Mistral',
  'Perplexity',
  'Cohere',
  'Hugging Face',
  'ElevenLabs',
  'Replicate',
];
for (const [i, brand] of brands.entries()) {
  test(`${names[i]}: native visual, clear geometry, linked edits and real export/reimport`, async ({
    page,
  }) => {
    const id = `brand-${brand}-rag`;
    await page.goto(`/examples?example=${id}`);
    await expect(
      page
        .getByRole('combobox', { name: '选择视觉风格', exact: true })
        .filter({ hasText: names[i] }),
    ).toBeVisible();
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
        // Containment uses a 1px inset; getBBox glyph bearings vary at fractional fit scales.
        for (const t of node.querySelectorAll<SVGTextElement>('text')) {
          const b = t.getBBox();
          if (
            b.x < r.x + 1 ||
            b.y < r.y + 1 ||
            b.x + b.width > r.x + r.width - 1 ||
            b.y + b.height > r.y + r.height - 1
          )
            errors.push(`node:${t.textContent}`);
        }
      }
      const surfaces = nodes.map((n) => n.getAttribute('data-layout')!.split(' ').map(Number));
      if (root.getAttribute('data-brand-style') === 'stepfun') {
        const papers = nodes
          .slice(0, 4)
          .map((node) => node.querySelector<SVGRectElement>('rect')!.getBBox());
        const intersects = (a: DOMRect, b: DOMRect) =>
          Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x) &&
          Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y);
        for (let i = 0; i < papers.length - 1; i++) {
          if (!intersects(papers[i], papers[i + 1])) errors.push('research montage separated');
          for (const label of [...nodes[i].querySelectorAll<SVGTextElement>('text')].slice(0, 2))
            for (const foreground of papers.slice(i + 1))
              if (intersects(label.getBBox(), foreground)) errors.push('montage hides title');
        }
      }
      if (root.getAttribute('data-brand-style') === 'supabase') {
        const schema = root.querySelector('#brand-supabase-rag-node-index')!;
        const panel = schema.querySelector<SVGRectElement>('rect')!.getBBox();
        for (const line of schema.querySelectorAll<SVGTextElement>('text')) {
          const box = line.getBBox();
          if (box.x < panel.x + 16 || box.x + box.width > panel.x + panel.width - 16)
            errors.push('schema text escapes painted panel');
        }
      }
      if (root.getAttribute('data-brand-style') === 'dji') {
        const nodeId = 'brand-dji-rag-node-llm';
        const housing = root.querySelector<SVGRectElement>(`#${nodeId} rect`)!.getBBox();
        for (const edge of root.querySelectorAll<SVGPolylineElement>(
          `[data-sf-start-node="#${nodeId}"], [data-sf-end-node="#${nodeId}"]`,
        )) {
          const start = edge.getAttribute('data-sf-start-node') === `#${nodeId}`;
          const p = edge.getPointAtLength(start ? 0 : edge.getTotalLength());
          const gap = start ? p.y - housing.y - housing.height : housing.x - p.x;
          if (gap < 0 || gap > 6) errors.push(`optical housing endpoint gap: ${gap}`);
        }
      }
      if (
        [
          'cursor',
          'lovable',
          'supabase',
          'n8n',
          'raycast',
          'bytedance',
          'xiaohongshu',
          'dji',
          'kimi',
          'stepfun',
          'mistral',
          'perplexity',
          'cohere',
          'huggingface',
          'elevenlabs',
          'replicate',
        ].includes(root.getAttribute('data-brand-style')!)
      ) {
        const routes = [...root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')].map(
          (edge) => ({
            id: edge.id,
            points: Array.from({ length: edge.points.numberOfItems }, (_, i) =>
              edge.points.getItem(i),
            ),
          }),
        );
        for (let a = 0; a < routes.length; a++)
          for (let b = a + 1; b < routes.length; b++) {
            for (let i = 1; i < routes[a].points.length; i++)
              for (let j = 1; j < routes[b].points.length; j++) {
                const p = routes[a].points[i - 1],
                  q = routes[a].points[i],
                  r = routes[b].points[j - 1],
                  s = routes[b].points[j];
                const cross = (u: DOMPoint, v: DOMPoint, w: DOMPoint) =>
                  (v.x - u.x) * (w.y - u.y) - (v.y - u.y) * (w.x - u.x);
                if (cross(p, q, r) * cross(p, q, s) < 0 && cross(r, s, p) * cross(r, s, q) < 0)
                  errors.push(`crossing:${routes[a].id}:${routes[b].id}`);
              }
          }
      }
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
      // A circular node's logical rectangle must not leave visibly floating arrow tips.
      // Measure the painted circle, independently of authoring data-layout metadata.
      for (const [brand, key] of [
        ['spotify', 'llm'],
        ['lovable', 'retrieve'],
        ['elevenlabs', 'llm'],
      ]) {
        if (root.getAttribute('data-brand-style') !== brand) continue;
        const nodeId = `brand-${brand}-rag-node-${key}`;
        const record = root.querySelector<SVGCircleElement>(`#${nodeId} circle`)!;
        for (const edge of root.querySelectorAll<SVGPolylineElement>(
          `[data-sf-start-node="#${nodeId}"], [data-sf-end-node="#${nodeId}"]`,
        )) {
          const atStart = edge.getAttribute('data-sf-start-node') === `#${nodeId}`;
          const p = edge.getPointAtLength(atStart ? 0 : edge.getTotalLength());
          const gap =
            Math.hypot(p.x - record.cx.baseVal.value, p.y - record.cy.baseVal.value) -
            record.r.baseVal.value;
          if (gap < 0 || gap > 6) errors.push(`${brand} circular endpoint gap: ${gap}`);
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
    const { filename, xml } = await downloadExampleFromEditor(page);
    expect(filename).toBe(`${id}-finished.svg`);
    expect(xml).not.toMatch(/<(?:image|script|foreignObject)\b/);
    const standalone = await page.context().newPage();
    await standalone.setViewportSize({ width: 1600, height: 1100 });
    await standalone.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
    await expect(standalone.locator('[data-node]')).toHaveCount(9);
    await standalone.screenshot({ path: `tests/brand-${brand}-native.png` });
    await standalone.close();
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.getByRole('tab', { name: `${id}.svg`, exact: true })).toBeVisible();
    if (brands.indexOf(brand) >= 20) {
      const attachments = await page.evaluate(async () => {
        const bridge = '/tests/e2e/bridge.ts',
          { engine } = (await import(/* @vite-ignore */ bridge)) as typeof import('./bridge');
        const ids = [...engine.root!.querySelectorAll('[data-node]')].map((node) => node.id),
          errors: string[] = [];
        // Open paper/file objects must bind to their full painted surface, not a tiny inset icon.
        // Check both ends of every incident edge, for every node, across undo-restored DOMs.
        for (const id of ids) {
          const original = engine.exportSvg(),
            incident = [
              ...engine.root!.querySelectorAll<SVGPolylineElement>(
                `[data-sf-start-node="#${id}"], [data-sf-end-node="#${id}"]`,
              ),
            ].map((edge) => ({
              id: edge.id,
              ends: [
                edge.points.getItem(0),
                edge.points.getItem(edge.points.numberOfItems - 1),
              ].map((point) => ({ x: point.x, y: point.y })),
              moving: [
                edge.getAttribute('data-sf-start-node'),
                edge.getAttribute('data-sf-end-node'),
              ].map((ref) => ref === `#${id}`),
            }));
          engine.select([engine.root!.querySelector<SVGGElement>(`#${id}`)!]);
          engine.translate(6, 4);
          for (const before of incident) {
            const edge = engine.root!.querySelector<SVGPolylineElement>(`#${before.id}`)!;
            for (const [index, point] of [
              edge.points.getItem(0),
              edge.points.getItem(edge.points.numberOfItems - 1),
            ].entries()) {
              const dx = point.x - before.ends[index].x,
                dy = point.y - before.ends[index].y;
              if (
                Math.abs(dx - (before.moving[index] ? 6 : 0)) > 1e-4 ||
                Math.abs(dy - (before.moving[index] ? 4 : 0)) > 1e-4
              )
                errors.push(`${id}: ${before.id} endpoint ${index} jumped by ${dx},${dy}`);
            }
          }
          engine.undo();
          if (engine.exportSvg() !== original) errors.push(`${id}: undo changed document`);
          // Snapshot restoration mounts a replacement root through the canvas host.
          // The next pointer operation must use its connected coordinate system.
          for (let frame = 0; frame < 10 && !engine.root!.isConnected; frame++)
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          if (!engine.root!.isConnected) errors.push(`${id}: restored root did not mount`);
        }
        return errors;
      });
      expect(attachments).toEqual([]);
    }
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

test('brand study variants are available without replacing the selected content', async ({
  page,
}) => {
  await page.goto('/examples?example=brand-apple-rag');
  await selectExampleOption(page, '筛选风格系列', 'brand');
  await expect(page.getByRole('region', { name: '图片结果' }).getByRole('button')).toHaveCount(36);
  for (const brand of brands) {
    await selectExampleOption(page, '选择视觉风格', `brand-${brand}-rag`);
    await expect(page.getByLabel('品牌风格依据')).toContainText('非官方');
  }
});

test('thirty-six brand languages can be inspected together as real native SVGs', async ({
  page,
}) => {
  const files = await Promise.all(
    brands.map((brand) => readFile(`src/examples/assets/brand-${brand}-rag.svg`, 'utf8')),
  );
  await page.setViewportSize({ width: 1680, height: 3000 });
  await page.setContent(
    `<html><head><style>body{margin:0;padding:32px;background:#e9ecef;font:20px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0}figcaption{margin-bottom:10px}svg{display:block;width:100%;height:auto}</style></head><body><main>${files.map((xml, i) => `<figure><figcaption>${names[i]}</figcaption>${xml}</figure>`).join('')}</main></body></html>`,
  );
  await expect(page.locator('svg')).toHaveCount(brands.length);
  await page.screenshot({ path: 'tests/brands-contact-sheet.png', fullPage: true });
});

test('the four additional brands have their own inspectable native comparison', async ({
  page,
}) => {
  const subset = brands.slice(6, 10),
    labels = names.slice(6, 10);
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

test('five new brands have their own native visual comparison', async ({ page }) => {
  const added = brands.slice(10, 15),
    labels = names.slice(10, 15);
  const files = await Promise.all(
    added.map((brand) => readFile(`src/examples/assets/brand-${brand}-rag.svg`, 'utf8')),
  );
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.setContent(
    `<html><head><style>body{margin:0;padding:32px;background:#e9ecef;font:20px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0}figcaption{margin-bottom:10px}svg{display:block;width:100%;height:auto}</style></head><body><main>${files.map((svg, i) => `<figure><figcaption>${labels[i]}</figcaption>${svg}</figure>`).join('')}</main></body></html>`,
  );
  await expect(page.locator('svg')).toHaveCount(5);
  await page.screenshot({ path: 'tests/brands-five-additions.png', fullPage: true });
});

test('the next five brands have their own native visual comparison', async ({ page }) => {
  const added = brands.slice(15, 20),
    labels = names.slice(15, 20);
  const files = await Promise.all(
    added.map((brand) => readFile(`src/examples/assets/brand-${brand}-rag.svg`, 'utf8')),
  );
  await page.setViewportSize({ width: 1680, height: 1180 });
  await page.setContent(
    `<html><head><style>body{margin:0;padding:32px;background:#e9ecef;font:20px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0}figcaption{margin-bottom:10px}svg{display:block;width:100%;height:auto}</style></head><body><main>${files.map((svg, i) => `<figure><figcaption>${labels[i]}</figcaption>${svg}</figure>`).join('')}</main></body></html>`,
  );
  await expect(page.locator('svg')).toHaveCount(5);
  await page.screenshot({ path: 'tests/brands-next-five.png', fullPage: true });
});

for (const [family, start, end] of [
  ['community', 20, 25],
  ['china', 25, 30],
  ['ai', 30, 36],
] as const) {
  test(`the ${family} additions form an inspectable native comparison`, async ({ page }) => {
    const subset = brands.slice(start, end),
      labels = names.slice(start, end);
    const files = await Promise.all(
      subset.map((b) => readFile(`src/examples/assets/brand-${b}-rag.svg`, 'utf8')),
    );
    await page.setViewportSize({ width: 1680, height: 1180 });
    await page.setContent(
      `<style>body{margin:0;padding:32px;background:#e9ecef;font:20px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0}figcaption{margin-bottom:10px}svg{display:block;width:100%;height:auto}</style><main>${files.map((svg, i) => `<figure><figcaption>${labels[i]}</figcaption>${svg}</figure>`).join('')}</main>`,
    );
    await expect(page.locator('svg')).toHaveCount(end - start);
    await page.screenshot({ path: `tests/brands-${family}-ten-additions.png`, fullPage: true });
  });
}
