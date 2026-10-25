import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const bridge = '/tests/e2e/bridge.ts';
const tabsName = 'SVG 文档';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tablist', { name: tabsName })).toBeVisible();
});
test('file, paste and blank documents open as independent tabs with separate history, selection and viewport', async ({
  page,
}) => {
  const a = await page.evaluate(async (module) => {
    const { engine, useUI, documents } = await import(/* @vite-ignore */ module);
    const card = engine.root!.querySelector('#client-card') as SVGGraphicsElement;
    engine.select([card]);
    engine.scope = card;
    engine.updateAttributes({ opacity: '.7' });
    useUI.getState().set({ zoom: 0.8, pan: { x: -41, y: 79 }, aspectLocked: true });
    return { id: documents.activeId, xml: engine.exportSvg() };
  }, bridge);
  await page.locator('.topbar input[type=file]').setInputFiles('src/fixtures/flowchart.svg');
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(2);
  await expect(page.getByRole('tab', { name: 'flowchart.svg', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.evaluate(async (module) => {
    const { engine, useUI } = await import(/* @vite-ignore */ module);
    engine.transaction('B only', () => engine.root!.setAttribute('opacity', '.4'));
    useUI.getState().set({ zoom: 0.55, pan: { x: 30, y: 18 }, aspectLocked: false });
  }, bridge);
  await page.getByRole('tab', { name: 'architecture.svg', exact: true }).click();
  await expect(page.locator('[data-canvas]')).toHaveCount(1);
  const restored = await page.evaluate(async (module) => {
    const { engine, useUI, documents } = await import(/* @vite-ignore */ module);
    return {
      id: documents.activeId,
      xml: engine.exportSvg(),
      selected: engine.selection[0]?.id,
      scope: engine.scope?.id,
      past: engine.past.length,
      zoom: useUI.getState().zoom,
      pan: useUI.getState().pan,
      locked: useUI.getState().aspectLocked,
    };
  }, bridge);
  expect(restored).toEqual({
    ...a,
    selected: 'client-card',
    scope: 'client-card',
    past: 1,
    zoom: 0.8,
    pan: { x: -41, y: 79 },
    locked: true,
  });
  await expect(page.getByTestId('selection-box')).toBeVisible();
  await expect(page.locator('.scope-bar')).toBeVisible();
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card')).not.toHaveAttribute('opacity', '.7');
  await page.getByRole('tab', { name: 'flowchart.svg', exact: true }).click();
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('opacity', '.4');
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).useUI.getState().zoom,
      bridge,
    ),
  ).toBe(0.55);
  await page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true }).click();
  await expect(page.locator('[data-svg-host] > svg')).not.toHaveAttribute('opacity', '.4');
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page
    .locator('#svg-input')
    .fill(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160"><text x="20" y="40">Third drawing</text></svg>',
    );
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(3);
  await expect(page.locator('[data-svg-host] text')).toHaveText('Third drawing');
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(4);
  await expect(page.locator('[data-svg-host] > svg > *')).toHaveCount(0);
});

test('closing dirty drawings can retain, download and close, or discard without touching other tabs', async ({
  page,
}) => {
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await page.getByRole('button', { name: '插入圆角矩形', exact: true }).click();
  await page.getByRole('tab', { name: 'architecture.svg', exact: true }).click();
  await page.getByRole('button', { name: '关闭 untitled-1.svg', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '关闭有未导出修改的图稿' });
  await expect(dialog).toContainText('untitled-1.svg');
  await dialog.getByRole('button', { name: '保留图稿', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'untitled-1.svg', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '关闭 untitled-1.svg', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: '下载并关闭', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('untitled-1-finished.svg');
  expect(await fs.readFile((await download.path())!, 'utf8')).toContain('圆角矩形');
  await expect(page.getByRole('tab', { name: 'untitled-1.svg', exact: true })).toHaveCount(0);
  await expect(page.locator('[data-svg-host] #client-card')).toBeVisible();
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await page.getByRole('button', { name: '插入圆角矩形', exact: true }).click();
  await page.getByRole('button', { name: '关闭 untitled-1.svg', exact: true }).click();
  await dialog.getByRole('button', { name: '直接关闭', exact: true }).click();
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(1);
});

test('all open documents, active tab, dirty flags and views recover after refresh without cross-document undo', async ({
  page,
}) => {
  await page.evaluate(async (module) => {
    const { engine, useUI } = await import(/* @vite-ignore */ module);
    engine.transaction('A', () => engine.root!.setAttribute('opacity', '.6'));
    useUI.getState().set({ zoom: 0.65, pan: { x: 10, y: -33 } });
  }, bridge);
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await page.getByRole('button', { name: '插入圆角矩形', exact: true }).click();
  await page.evaluate(async (module) => {
    const { useUI } = await import(/* @vite-ignore */ module);
    useUI.getState().set({ zoom: 0.9, pan: { x: 25, y: 45 } });
  }, bridge);
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('svg-finisher.document') || '{}').documents?.length,
      ),
    )
    .toBe(2);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'untitled-1.svg', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.locator('[data-svg-host] [data-label="圆角矩形"]')).toBeVisible();
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).useUI.getState().pan,
      bridge,
    ),
  ).toEqual({ x: 25, y: 45 });
  await page.getByRole('tab', { name: 'architecture.svg', exact: true }).click();
  await expect(page.locator('[data-svg-host] > svg')).toHaveAttribute('opacity', '.6');
  expect(
    await page.evaluate(
      async (m) => (await import(/* @vite-ignore */ m)).useUI.getState().zoom,
      bridge,
    ),
  ).toBe(0.65);
  await expect(page.getByRole('button', { name: '撤销 (⌘/Ctrl+Z)', exact: true })).toBeDisabled();
  await page.locator('.export-dropdown summary').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 SVG', exact: true }).click();
  await downloadPromise;
  await expect
    .poll(() =>
      page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem('svg-finisher.document')!);
        return saved.documents.find((d: { name: string }) => d.name === 'architecture.svg')
          .unexported;
      }),
    )
    .toBe(false);
  await page.reload();
  const tabs = page.getByRole('tablist', { name: tabsName });
  await expect(
    tabs
      .getByRole('tab', { name: 'architecture.svg', exact: true })
      .getByRole('img', { name: '有未导出修改' }),
  ).toHaveCount(0);
  await expect(
    tabs
      .getByRole('tab', { name: 'untitled-1.svg', exact: true })
      .getByRole('img', { name: '有未导出修改' }),
  ).toHaveCount(1);
});

test('tab keyboard navigation does not nudge artwork and closing the final tab leaves a working blank document', async ({
  page,
}) => {
  await page.getByRole('button', { name: '新建 SVG', exact: true }).click();
  await page.getByRole('tab', { name: 'architecture.svg', exact: true }).click();
  await page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    engine.select([engine.root!.querySelector('#client-card') as SVGGraphicsElement]);
  }, bridge);
  const before = await page.locator('[data-svg-host] > svg').evaluate((svg) => svg.outerHTML);
  const a = page.getByRole('tab', { name: 'architecture.svg', exact: true });
  await a.focus();
  await a.press('ArrowRight');
  const b = page.getByRole('tab', { name: 'untitled-1.svg', exact: true });
  await expect(b).toBeFocused();
  await b.press('Home');
  await expect(a).toBeFocused();
  expect(await page.locator('[data-svg-host] > svg').evaluate((svg) => svg.outerHTML)).toBe(before);
  await b.click();
  await page.getByRole('button', { name: '关闭 architecture.svg', exact: true }).click();
  await b.focus();
  await b.press('Delete');
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(1);
  await page.getByRole('button', { name: '插入圆角矩形', exact: true }).click();
  await expect(page.locator('[data-svg-host] [data-label="圆角矩形"]')).toBeVisible();
});

test('invalid import and cleaning cancellation never add a tab; template new drawings preserve previous tabs', async ({
  page,
}) => {
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill('<svg><invalid></svg>');
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('SVG XML 无效');
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(1);
  await page
    .getByRole('dialog', { name: '导入 SVG', exact: true })
    .getByRole('button', { name: '关闭窗口' })
    .click();
  await page.getByRole('button', { name: '粘贴 SVG', exact: true }).click();
  await page.locator('#svg-input').fill(await fs.readFile('src/fixtures/security.svg', 'utf8'));
  await page.getByRole('button', { name: '导入 SVG', exact: true }).click();
  await page.getByRole('button', { name: '取消导入', exact: true }).click();
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(1);
  await page.getByRole('tab', { name: '组合图', exact: true }).click();
  await page.getByRole('button', { name: '使用三层应用架构新建图稿', exact: true }).click();
  await expect(page.getByRole('tablist', { name: tabsName }).getByRole('tab')).toHaveCount(2);
  await page.getByRole('tab', { name: 'architecture.svg', exact: true }).click();
  await expect(page.locator('[data-svg-host] #client-card')).toBeVisible();
});

test('invalid inactive recovery content is reported without overwriting the recovery record', async ({
  page,
}) => {
  const raw = JSON.stringify({
    version: 2,
    activeId: 'a',
    savedAt: 1,
    documents: [
      {
        id: 'a',
        name: 'a.svg',
        xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"/>',
        unexported: true,
        view: { zoom: 1, pan: { x: 0, y: 0 }, aspectLocked: false },
      },
      {
        id: 'b',
        name: 'b.svg',
        xml: '<svg><invalid></svg>',
        unexported: true,
        view: { zoom: 1, pan: { x: 0, y: 0 }, aspectLocked: false },
      },
    ],
  });
  await page.addInitScript((value) => localStorage.setItem('svg-finisher.document', value), raw);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('本地文档恢复失败');
  await expect(page.locator('[data-svg-host] #client-card')).toBeVisible();
  await page.waitForTimeout(1400);
  expect(await page.evaluate(() => localStorage.getItem('svg-finisher.document'))).toBe(raw);
});

test('many long-name tabs scroll within the editor and remain usable in compact windows', async ({
  page,
}) => {
  await page.evaluate(async (module) => {
    const { documents } = await import(/* @vite-ignore */ module);
    for (let i = 1; i <= 8; i++)
      documents.open(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect x="80" y="80" width="440" height="240" rx="12" fill="#eff6ff" stroke="#93b4ef"/><text x="120" y="150" font-size="24">Independent SVG drawing</text></svg>',
        `技术架构图-包含较长文件名称-${i}.svg`,
      );
  }, bridge);
  await expect(
    page.getByRole('tab', { name: '技术架构图-包含较长文件名称-8.svg', exact: true }),
  ).toBeInViewport();
  await page.screenshot({ path: 'tests/documents-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(
    page.getByRole('tab', { name: '技术架构图-包含较长文件名称-8.svg', exact: true }),
  ).toBeInViewport();
  await page.getByRole('button', { name: '适应画布 (Shift+1)', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBe(768);
  await page.screenshot({ path: 'tests/documents-compact.png', fullPage: true });
});
