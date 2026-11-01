import { test, expect } from '@playwright/test';
const bridge = '/tests/e2e/bridge.ts';
const connections = '/src/editor/document/connections.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
});

test('existing SVG card associations preserve the original geometry and follow a real drag in one undo', async ({
  page,
}) => {
  const card = page.locator('[data-svg-host] #client-card rect').first();
  await card.click({ position: { x: 8, y: 8 } });
  const d = await page.locator('[data-svg-host] #connections path').first().getAttribute('d');
  await page.getByRole('button', { name: '关联相邻箭头', exact: true }).click();
  const line = page.locator('[data-svg-host] #connections path').first();
  await expect(line).toHaveAttribute('data-sf-start-node', '#client-card');
  await expect(line).toHaveAttribute('data-sf-end-node', '#orchestrator-card');
  await expect(line).toHaveAttribute('d', d!);
  const before = await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine, useUI } = await import(/* @vite-ignore */ bridge);
      const { connectionPoints } = await import(/* @vite-ignore */ connections);
      useUI.getState().set({ snap: false });
      const el = engine.root!.querySelector('#connections path') as SVGGraphicsElement;
      const pts = connectionPoints(el)!;
      return {
        xml: engine.exportSvg(),
        points: pts.map((p: { x: number; y: number }) => {
          const s = new DOMPoint(p.x, p.y).matrixTransform(el.getScreenCTM()!);
          return { x: s.x, y: s.y };
        }),
        past: engine.past.length,
      };
    },
    { bridge, connections },
  );
  const b = (await card.boundingBox())!;
  await page.mouse.move(b.x + 8, b.y + 8);
  await page.mouse.down();
  await page.mouse.move(b.x + 53, b.y + 33, { steps: 8 });
  await page.mouse.up();
  const after = await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { connectionPoints } = await import(/* @vite-ignore */ connections);
      const el = engine.root!.querySelector('#connections path') as SVGGraphicsElement;
      return {
        points: connectionPoints(el)!.map((p: { x: number; y: number }) => {
          const s = new DOMPoint(p.x, p.y).matrixTransform(el.getScreenCTM()!);
          return { x: s.x, y: s.y };
        }),
        past: engine.past.length,
      };
    },
    { bridge, connections },
  );
  expect(after.points[0].x - before.points[0].x).toBeCloseTo(45, 1);
  expect(after.points[0].y - before.points[0].y).toBeCloseTo(25, 1);
  expect(after.points.at(-1)!.x).toBeCloseTo(before.points.at(-1)!.x, 4);
  expect(after.points.at(-1)!.y).toBeCloseTo(before.points.at(-1)!.y, 4);
  expect(after.past).toBe(before.past + 1);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).engine.exportSvg(),
      bridge,
    ),
  ).toBe(before.xml);
  await page.getByRole('button', { name: '重做 (⌘/Ctrl+Shift+Z)', exact: true }).click();
  await expect(line).not.toHaveAttribute('d', d!);
});

test('template associations and labels follow node resize, copy independently and survive export/reimport', async ({
  page,
}) => {
  await page.getByRole('tab', { name: '组合图', exact: true }).click();
  await page.getByLabel('搜索素材').fill('双节点');
  await page.getByRole('button', { name: /^插入\s*双节点连接$/, exact: true }).click();
  const result = await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { connectionPoints } = await import(/* @vite-ignore */ connections);
      const editing = '/src/editor/document/editing.ts';
      const { resizeRect } = await import(/* @vite-ignore */ editing);
      const group = engine.selection[0],
        line = group.querySelector('polyline')!;
      const a = group.querySelector('[data-node]') as SVGGraphicsElement;
      engine.select([a]);
      engine.translate(30, 45);
      const beforeResize = connectionPoints(line)![0];
      resizeRect(engine, a.querySelector('rect')!, 248, 88);
      const afterResize = connectionPoints(line)![0];
      const originalLine = line.outerHTML;
      engine.select([group]);
      const copy = engine.copy();
      engine.paste(copy);
      const clone = engine.selection[0],
        cloneNode = clone.querySelector('[data-node]') as SVGGraphicsElement;
      const cloneLine = clone.querySelector('polyline')!;
      const uniqueRef =
        cloneLine.getAttribute('data-sf-start-node') === `#${cloneNode.id}` &&
        cloneNode.id !== a.id;
      engine.select([cloneNode]);
      engine.translate(20, -10);
      const isolated = line.outerHTML === originalLine;
      const xml = engine.exportSvg();
      engine.importSvg(xml);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const restored = engine.root!.querySelector(`[id="${cloneNode.id}"]`) as SVGGraphicsElement;
      const restoredLine = engine.root!.querySelector(`[id="${cloneLine.id}"]`)!;
      const before = connectionPoints(restoredLine)![0];
      engine.select([restored]);
      engine.translate(10, 0);
      const after = connectionPoints(restoredLine)![0];
      return {
        widthDelta: afterResize.x - beforeResize.x,
        uniqueRef,
        isolated,
        restoredDelta: after.x - before.x,
        labels: engine.root!.querySelectorAll('[data-sf-label-for][transform]').length,
      };
    },
    { bridge, connections },
  );
  expect(result.widthDelta).toBeCloseTo(60, 3);
  expect(result.uniqueRef).toBe(true);
  expect(result.isolated).toBe(true);
  expect(result.restoredDelta).toBeCloseTo(10, 3);
  expect(result.labels).toBeGreaterThan(0);
});

test('manual ports follow transformed nodes across coordinate systems and remain editable in the inspector', async ({
  page,
}) => {
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><g transform="translate(100 100) rotate(12) scale(.9 1.2)"><g id="a" data-label="服务 A"><rect width="140" height="80" fill="#eff6ff"/><text x="15" y="30">A</text></g></g><g transform="translate(560 200) scale(1.1 .8)"><g id="b" data-label="服务 B"><rect width="140" height="80" fill="#ecfdf5"/><text x="15" y="30">B</text></g></g><g transform="translate(20 30) rotate(-8)"><polyline id="edge" points="250,130 430,130 430,230 560,230" fill="none" stroke="#64748b"/></g></svg>',
    );
    engine.select([engine.root!.querySelector('#edge') as SVGGraphicsElement]);
  }, bridge);
  await page.getByLabel('起点关联节点', { exact: true }).selectOption({ label: '服务 A' });
  await page.getByLabel('起点连接位置', { exact: true }).selectOption('right');
  await page.getByLabel('终点关联节点', { exact: true }).selectOption({ label: '服务 B' });
  await page.getByLabel('终点连接位置', { exact: true }).selectOption('left');
  const result = await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { connectionPoints } = await import(/* @vite-ignore */ connections);
      const a = engine.root!.querySelector('#a') as SVGGraphicsElement;
      engine.select([a]);
      engine.translate(36, 24);
      engine.resize(210, 140);
      const line = engine.root!.querySelector('#edge') as SVGGraphicsElement;
      const start = connectionPoints(line)![0],
        actual = new DOMPoint(start.x, start.y).matrixTransform(line.getScreenCTM()!);
      const frame = a.querySelector('rect')!;
      const expected = new DOMPoint(
        Number(frame.getAttribute('width')),
        Number(frame.getAttribute('height')) / 2,
      ).matrixTransform(a.getScreenCTM()!);
      return { distance: Math.hypot(actual.x - expected.x, actual.y - expected.y) };
    },
    { bridge, connections },
  );
  expect(result.distance).toBeLessThan(0.001);
  await page.screenshot({ path: 'tests/connections-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.getByRole('button', { name: '适应画布 (Shift+1)', exact: true }).click();
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('#edge') as SVGGraphicsElement]);
  }, bridge);
  await page.screenshot({ path: 'tests/connections-compact.png', fullPage: true });
});

test('manual endpoint edits detach only that end, line movement detaches both, and deletion can undo bindings', async ({
  page,
}) => {
  await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { bindConnection } = await import(/* @vite-ignore */ connections);
      engine.importSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect id="a" x="100" y="200" width="150" height="100" fill="#eff6ff"/><rect id="b" x="600" y="200" width="150" height="100" fill="#ecfdf5"/><line id="edge" x1="250" y1="250" x2="600" y2="250" stroke="blue"/></svg>',
      );
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const line = engine.root!.querySelector('#edge') as SVGGraphicsElement;
      bindConnection(
        engine,
        line,
        'start',
        engine.root!.querySelector('#a') as SVGGraphicsElement,
        'right',
      );
      bindConnection(
        engine,
        line,
        'end',
        engine.root!.querySelector('#b') as SVGGraphicsElement,
        'left',
      );
      engine.select([line]);
    },
    { bridge, connections },
  );
  const handle = page.locator('.endpoint-handle[data-endpoint="1"]'),
    b = (await handle.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + 40, b.y + 20);
  await page.mouse.up();
  const line = page.locator('[data-svg-host] #edge');
  await expect(line).toHaveAttribute('data-sf-start-node', '#a');
  await expect(line).not.toHaveAttribute('data-sf-end-node', '#b');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(line).toHaveAttribute('data-sf-end-node', '#b');
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.translate(10, 10);
  }, bridge);
  await expect(line).not.toHaveAttribute('data-sf-start-node', '#a');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await page.evaluate(async (m) => {
    const { engine } = await import(/* @vite-ignore */ m);
    engine.select([engine.root!.querySelector('#a') as SVGGraphicsElement]);
    engine.remove();
  }, bridge);
  await expect(line).not.toHaveAttribute('data-sf-start-node', '#a');
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(line).toHaveAttribute('data-sf-start-node', '#a');
});

test('ambiguous, hidden, unsupported and invalid references cannot deform unrelated SVG content', async ({
  page,
}) => {
  const result = await page.evaluate(
    async ({ bridge, connections }) => {
      const { engine } = await import(/* @vite-ignore */ bridge);
      const { associateNearby, bindConnection, connectionPoints } = await import(
        /* @vite-ignore */ connections
      );
      engine.importSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><style>.css-geometry{d:path(&quot;M200 140L500 140&quot;)}</style><defs><marker id="resource"/></defs><rect id="a" x="100" y="100" width="100" height="80"/><rect id="overlap" x="100" y="100" width="100" height="80"/><path id="css-edge" class="css-geometry" d="M200 140L500 140"/><path id="curve" d="M200 140C300 140 400 200 500 200" stroke="blue" fill="none"/><line id="edge" x1="200" y1="140" x2="500" y2="140" stroke="blue"/></svg>',
      );
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const a = engine.root!.querySelector('#a') as SVGGraphicsElement,
        line = engine.root!.querySelector('#edge') as SVGGraphicsElement;
      const curve = engine.root!.querySelector('#curve')!.outerHTML;
      const count = associateNearby(engine, [a]);
      bindConnection(engine, line, 'start', a, 'right');
      const x = line.getAttribute('x1');
      engine.transaction('hide', () => (a.style.display = 'none'));
      const hiddenPreserved = x === line.getAttribute('x1');
      engine.transaction('invalid metadata', () => {
        line.setAttribute('data-sf-end-node', '#resource');
        line.setAttribute('data-sf-end-anchor', '1 .5 0 0');
      });
      return {
        count,
        hiddenPreserved,
        curvePreserved: curve === engine.root!.querySelector('#curve')!.outerHTML,
        invalidRemoved: !line.hasAttribute('data-sf-end-node'),
        cssExcluded: connectionPoints(engine.root!.querySelector('#css-edge')!) === null,
      };
    },
    { bridge, connections },
  );
  expect(result).toEqual({
    count: 0,
    hiddenPreserved: true,
    curvePreserved: true,
    invalidRemoved: true,
    cssExcluded: true,
  });
});
