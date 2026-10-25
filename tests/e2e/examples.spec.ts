import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Example page previews existing templates and returns without losing editor history', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('[data-svg-host] > svg')).toBeVisible();
  await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine, useUI } = await import(/* @vite-ignore */ bridge);
    engine.select([engine.root!.querySelector('#client-card') as SVGGraphicsElement]);
    engine.updateAttributes({ opacity: '.7' });
    useUI.getState().set({ zoom: 0.75, pan: { x: 22, y: 33 } });
  });
  await page.getByRole('link', { name: 'Example 示例', exact: true }).click();
  await expect(page).toHaveURL(/\/examples/);
  await expect(page.getByRole('heading', { name: 'SVG 风格库' })).toBeVisible();
  await expect(page.getByLabel('选择示例')).toHaveValue('factory-rag');
  await page.getByRole('button', { name: '选择基础风格', exact: true }).click();
  await page.getByLabel('选择示例').selectOption('template-rag');
  await expect(page.getByLabel('示例生成 Prompt')).toHaveValue(/完整、可编辑 SVG/);
  const original = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    return (await import(/* @vite-ignore */ bridge)).engine.exportSvg();
  });
  await page.locator('body').click({ position: { x: 10, y: 10 } });
  await page.keyboard.press('Delete');
  expect(
    await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts';
      return (await import(/* @vite-ignore */ bridge)).engine.exportSvg();
    }),
  ).toBe(original);
  await page.getByRole('link', { name: '返回编辑器', exact: true }).click();
  const result = await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine, useUI } = await import(/* @vite-ignore */ bridge);
    return { past: engine.past.length, pan: useUI.getState().pan, zoom: useUI.getState().zoom };
  });
  expect(result).toEqual({ past: 1, pan: { x: 22, y: 33 }, zoom: 0.75 });
});

test('all seventeen styles have safe native previews, editable nodes and correctly routed arrow references', async ({
  page,
}) => {
  await page.goto('/examples');
  const styles: { id: string; name: string }[] = await page.evaluate(async () => {
    const module = '/src/examples/styles.ts';
    return (await import(/* @vite-ignore */ module)).additionalStyles;
  });
  expect(styles).toHaveLength(17);
  for (const { id, name: label } of styles) {
    await page.getByRole('button', { name: `选择${label}`, exact: true }).click();
    await expect(page.getByLabel('示例生成 Prompt')).toHaveValue(new RegExp(label));
    const preview = page.getByRole('img', { name: 'RAG 检索增强生成架构 SVG 预览', exact: true });
    const measure = await preview.locator('svg').evaluate((root) => {
      const svg = root as SVGSVGElement,
        nodeErrors: string[] = [],
        outside: string[] = [],
        lineOverlaps: string[] = [];
      for (const node of svg.querySelectorAll<SVGGElement>('[data-node]')) {
        const box = node.querySelector('rect')!.getBBox();
        for (const text of node.querySelectorAll('text')) {
          const b = text.getBBox();
          if (
            b.x < box.x - 1 ||
            b.x + b.width > box.x + box.width + 1 ||
            b.y < box.y - 1 ||
            b.y + b.height > box.y + box.height + 1
          )
            nodeErrors.push(text.textContent || '');
          for (const line of node.querySelectorAll<SVGGeometryElement>('line,polyline')) {
            const length = line.getTotalLength();
            for (let d = 0; d <= length; d += 2) {
              const p = line.getPointAtLength(d);
              if (
                p.x > b.x + 1 &&
                p.x < b.x + b.width - 1 &&
                p.y > b.y + 1 &&
                p.y < b.y + b.height - 1
              ) {
                lineOverlaps.push(text.textContent || '');
                break;
              }
            }
          }
        }
      }
      for (const text of svg.querySelectorAll('text')) {
        const b = text.getBBox();
        if (b.x < 0 || b.y < 0 || b.x + b.width > 1201 || b.y + b.height > 801)
          outside.push(text.textContent || '');
      }
      return {
        nodes: svg.querySelectorAll('[data-node]').length,
        nodeErrors,
        outside,
        lineOverlaps,
      };
    });
    expect(measure, id).toEqual({ nodes: 9, nodeErrors: [], outside: [], lineOverlaps: [] });
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await expect(page.getByRole('tab', { name: `${id}-rag.svg`, exact: true })).toBeVisible();
    const result = await page.evaluate(async (id) => {
      const bridge = '/tests/e2e/bridge.ts',
        { engine, documents } = await import(/* @vite-ignore */ bridge);
      const node = engine.root!.querySelector(`#${id}-node-docs`) as SVGGraphicsElement,
        line = engine.root!.querySelector(`#${id}-edge-docs-chunks`)!;
      const before = line.getAttribute('points');
      engine.select([node]);
      engine.translate(15, 10);
      const moved = before !== line.getAttribute('points');
      engine.undo();
      const result = {
        moved,
        exactUndo:
          engine.root!.querySelector(`#${id}-edge-docs-chunks`)!.getAttribute('points') === before,
        warnings: engine.warnings,
      };
      documents.close(documents.activeId, true);
      return result;
    }, id);
    expect(result).toEqual({ moved: true, exactUndo: true, warnings: [] });
    await page.getByRole('link', { name: 'Example 示例', exact: true }).click();
  }
});

test('SVG + prompt local versions preview, persist, reset, and reject unsafe source without losing the preview', async ({
  page,
}) => {
  await page.goto('/examples?example=blueprint-rag');
  await page.getByLabel('示例生成 Prompt').fill('工程蓝图：我自己的知识系统 prompt');
  await page.getByRole('tab', { name: 'SVG 源码', exact: true }).click();
  const code = page.getByLabel('示例 SVG 源码'),
    original = await code.inputValue();
  await code.fill(original.replace('RAG / RETRIEVAL SYSTEM', 'CUSTOM / KNOWLEDGE SYSTEM'));
  await expect(page.getByRole('button', { name: '在编辑器中打开', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '预览 SVG', exact: true }).click();
  await expect(
    page
      .getByRole('img', { name: 'RAG 检索增强生成架构 SVG 预览', exact: true })
      .locator('text')
      .filter({ hasText: 'CUSTOM / KNOWLEDGE SYSTEM' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '保存本地版本', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('已保存为本地版本');
  await page.reload();
  await expect(page.getByLabel('示例生成 Prompt')).toHaveValue('工程蓝图：我自己的知识系统 prompt');
  await page.getByRole('tab', { name: 'SVG 源码', exact: true }).click();
  await expect(page.getByLabel('示例 SVG 源码')).toHaveValue(/CUSTOM \/ KNOWLEDGE SYSTEM/);
  await code.fill('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  await page.getByRole('button', { name: '预览 SVG', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('需要清理');
  await expect(
    page
      .getByRole('img', { name: 'RAG 检索增强生成架构 SVG 预览', exact: true })
      .locator('text')
      .filter({ hasText: 'CUSTOM / KNOWLEDGE SYSTEM' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '恢复内置', exact: true }).click();
  await expect(code).toHaveValue(original);
  await page.reload();
  await expect(page.getByLabel('示例生成 Prompt')).not.toHaveValue(
    '工程蓝图：我自己的知识系统 prompt',
  );
});

test('prompt copy, denied clipboard fallback, SVG download and direct URL all work', async ({
  page,
}) => {
  await page.goto('/examples?example=swiss-rag');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    });
  });
  await page.getByRole('button', { name: '复制 Prompt', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain(
    '瑞士平面信息设计',
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    });
  });
  await page.getByRole('button', { name: '复制 Prompt', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('已选中 Prompt');
  expect(
    await page
      .getByLabel('示例生成 Prompt')
      .evaluate((el) => (el as HTMLTextAreaElement).selectionEnd),
  ).toBeGreaterThan(100);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
  const download = await pending,
    xml = await readFile((await download.path())!, 'utf8');
  expect(download.suggestedFilename()).toBe('swiss-rag.svg');
  expect(xml).toContain('data-node="true"');
  expect(xml).not.toContain('<script');
  await page.getByRole('link', { name: '返回编辑器', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { name: '瑞士信息设计', exact: true })).toBeVisible();
});

test('Example page and every style render at desktop, compact and mobile widths', async ({
  page,
}) => {
  await page.goto('/examples?example=editorial-rag');
  await expect(page.getByRole('heading', { name: '纸本编辑', exact: true })).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'RAG 检索增强生成架构 SVG 预览', exact: true }).locator('svg'),
  ).toBeVisible();
  await page.screenshot({ path: 'tests/examples-desktop.png', fullPage: true });
  const styles: { id: string; name: string }[] = await page.evaluate(async () => {
    const module = '/src/examples/styles.ts';
    return (await import(/* @vite-ignore */ module)).additionalStyles;
  });
  for (const { id } of styles) {
    await page.goto(`/examples?example=${id}-rag`);
    const preview = page
      .getByRole('img', { name: 'RAG 检索增强生成架构 SVG 预览', exact: true })
      .locator('svg');
    await expect(preview).toBeVisible();
    const xml = await preview.evaluate((el) => new XMLSerializer().serializeToString(el));
    const standalone = await page.context().newPage();
    await standalone.setViewportSize({ width: 1200, height: 800 });
    await standalone.goto(`data:image/svg+xml,${encodeURIComponent(xml)}`);
    await expect(standalone.locator('svg')).toBeVisible();
    await standalone.screenshot({ path: `tests/style-${id}.png` });
    await standalone.close();
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: 'tests/examples-compact.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tests/examples-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole('button', { name: '复制 Prompt', exact: true })).toBeVisible();
});

test('the selected style remains discoverable in a long desktop and mobile rail', async ({
  page,
}) => {
  await page.goto('/examples?example=handdrawn-rag');
  const selected = page.getByRole('button', { name: '选择手绘草图', exact: true });
  await expect(selected).toBeInViewport();
  await expect(page.getByRole('heading', { name: '手绘草图', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(selected).toBeInViewport();
  await page.reload();
  await expect(selected).toBeInViewport();
  await selected.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '极简线性', exact: true })).toBeVisible();
});

test('the additional vector styles have an inspectable native contact sheet', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1400 });
  await page.goto('/examples?example=paper-rag');
  await expect(page.getByRole('heading', { name: '黑白论文', exact: true })).toBeVisible();
  await page.evaluate(async () => {
    const module = '/src/examples/more-styles.ts',
      { moreStyles, moreExamples } = await import(/* @vite-ignore */ module);
    const sheet = document.createElement('main'),
      css = document.createElement('style');
    css.textContent =
      'body{margin:0;background:#e9edf1}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:20px}article{background:white;padding:12px;min-width:0}h2{font:600 17px Arial,sans-serif;margin:0 0 10px}article>svg{display:block;width:100%;height:auto}';
    for (const example of moreExamples) {
      const article = document.createElement('article'),
        heading = document.createElement('h2');
      heading.textContent = moreStyles.find(
        (s: { id: string; name: string }) => s.id === example.style,
      )!.name;
      article.append(
        heading,
        document.importNode(
          new DOMParser().parseFromString(example.svg, 'image/svg+xml').documentElement,
          true,
        ),
      );
      sheet.append(article);
    }
    document.body.replaceChildren(css, sheet);
  });
  await page.screenshot({ path: 'tests/styles-more-contact-sheet.png', fullPage: true });
});

test('recommended compositions are visible from an old style and their SVGs export without UI', async ({
  page,
}) => {
  for (const id of ['orbital-rag', 'folded-rag']) {
    await page.goto(`/examples?example=${id}`);
    await expect(page).toHaveURL(/example=factory-rag$/);
    await expect(page.getByRole('heading', { name: '等距知识工厂', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '选择轨道星图', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '选择折纸数据流', exact: true })).toHaveCount(0);
  }
  await page.goto('/examples?example=blueprint-rag');
  const featured = page.getByRole('navigation', { name: '推荐风格', exact: true });
  await expect(featured.getByRole('button')).toHaveCount(3);
  for (const [id, label] of [['factory', '等距知识工厂']]) {
    await featured.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible();
    const svg = page
      .getByRole('img', { name: 'RAG 检索增强生成架构 SVG 预览', exact: true })
      .locator('svg');
    if (id === 'factory') {
      expect(await svg.locator('[data-solid]').count()).toBeGreaterThanOrEqual(60);
      expect(
        await svg.evaluate((root) =>
          [...root.querySelectorAll<SVGGElement>('[data-node]')].every((node) => {
            const a = node.getBBox(),
              b = node.querySelector('rect')!.getBBox();
            return (
              a.x >= b.x - 0.5 &&
              a.y >= b.y - 0.5 &&
              a.x + a.width <= b.x + b.width + 0.5 &&
              a.y + a.height <= b.y + b.height + 0.5
            );
          }),
        ),
      ).toBe(true);
      const hiddenTips = await svg.evaluate((root) => {
        const surfaces = [
          ...root.querySelectorAll<SVGGeometryElement>(
            '[data-node] path, [data-node] rect, [data-node] polygon',
          ),
        ].filter((shape) => getComputedStyle(shape).fill !== 'none');
        return [...root.querySelectorAll<SVGPolylineElement>('[data-sf-start-node]')]
          .filter((edge) => {
            const length = edge.getTotalLength();
            for (let d = Math.max(0, length - 15); d <= length; d += 1) {
              const point = edge.getPointAtLength(d);
              if (surfaces.some((shape) => shape.isPointInFill(point))) return true;
            }
            return false;
          })
          .map((edge) => edge.id);
      });
      expect(hiddenTips).toEqual([]);
    }
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
    const downloaded = await pending,
      xml = await readFile((await downloaded.path())!, 'utf8');
    expect(downloaded.suggestedFilename()).toBe(`${id}-rag.svg`);
    expect(xml).not.toContain('example-featured-switcher');
    expect(xml).toContain('data-sf-start-node');
    expect(
      await svg.evaluate((root, source) => {
        const exported = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
        const geometry = (node: Element) =>
          [
            ...node.querySelectorAll(
              '[data-node] circle, [data-node] polygon, [data-node] text, [data-sf-start-node]',
            ),
          ].map((shape) =>
            ['x', 'y', 'cx', 'cy', 'r', 'points'].map((attr) => shape.getAttribute(attr)),
          );
        return JSON.stringify(geometry(root)) === JSON.stringify(geometry(exported));
      }, xml),
    ).toBe(true);
    await page.screenshot({ path: `tests/featured-${id}-desktop.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: 'tests/featured-compact.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'tests/featured-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.setViewportSize({ width: 633, height: 879 });
  for (const [id, label] of [
    ['factory', '等距知识工厂'],
    ['editorial', '纸本编辑'],
  ]) {
    await page.getByRole('button', { name: `选择${label}`, exact: true }).click();
    const scroll = page.locator('.example-preview-scroll');
    const fits = () =>
      scroll.evaluate((el) => {
        const board = el.querySelector('.example-artboard')!.getBoundingClientRect(),
          viewport = el.getBoundingClientRect(),
          controls = el.parentElement!.querySelector('.example-fit')!.getBoundingClientRect();
        return (
          board.left >= viewport.left &&
          board.top >= viewport.top &&
          board.right <= viewport.right &&
          board.bottom <= viewport.bottom &&
          board.bottom <= controls.top &&
          Math.abs(board.width / board.height - 1.5) < 0.01 &&
          el.scrollHeight <= el.clientHeight + 1 &&
          el.scrollWidth <= el.clientWidth + 1
        );
      });
    await expect.poll(fits).toBe(true);
    await page.getByRole('button', { name: '100% 查看', exact: true }).click();
    expect(
      await page.locator('.example-artboard').evaluate((el) => ({
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      })),
    ).toEqual({ width: 1200, height: 800 });
    await page.getByRole('button', { name: '适应预览', exact: true }).click();
    await expect.poll(fits).toBe(true);
    await page.screenshot({ path: `tests/featured-${id}-user-633.png`, fullPage: true });
  }
});
