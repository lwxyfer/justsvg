import { test, expect, type Page } from '@playwright/test';

const bridge = '/tests/e2e/bridge.ts';
test.beforeEach(async ({ page }) => {
  await page.goto('/editor#lang=zh');
  await page.evaluate(async (module) => {
    const { engine, useUI } = await import(/* @vite-ignore */ module);
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><g id="a"><rect x="60" y="60" width="180" height="120" fill="#eff6ff"/><text x="80" y="100" font-size="24">节点 A</text></g><g id="b"><rect x="320" y="60" width="180" height="120" fill="#dcfce7"/><text x="340" y="100" font-size="24">节点 B</text></g><g id="c"><rect x="580" y="60" width="180" height="120" fill="none" stroke="blue"/></g></svg>',
    );
    useUI.getState().set({ zoom: 1, pan: { x: 30, y: 30 }, textEdit: false });
  }, bridge);
});

async function selection(page: Page) {
  return page.evaluate(async (module) => {
    const { engine } = await import(/* @vite-ignore */ module);
    return { ids: engine.selection.map((el: Element) => el.id), scope: engine.scope?.id || null };
  }, bridge);
}

test('clicking another node while editing text applies the draft and switches selection', async ({
  page,
}) => {
  await page.locator('[data-svg-host] #a text').dblclick();
  const dialog = page.getByRole('dialog', { name: '编辑文字', exact: true });
  await dialog.getByLabel('文字段落 1').fill('修改后的 A');
  await page.locator('[data-svg-host] #b rect').click({ position: { x: 160, y: 90 } });
  await expect(dialog).toBeHidden();
  expect(await selection(page)).toEqual({ ids: ['b'], scope: null });
  await expect(page.locator('[data-svg-host] #a text')).toHaveText('修改后的 A');
  await page.locator('[data-svg-host] #c rect').click({ position: { x: 70, y: 80 }, force: true });
  expect(await selection(page)).toEqual({ ids: ['c'], scope: null });
  await page.locator('[data-svg-host] #a rect').click({ position: { x: 20, y: 90 } });
  expect(await selection(page)).toEqual({ ids: ['a'], scope: null });
});

test('clicking a sibling outside an entered group exits the scope and selects that sibling', async ({
  page,
}) => {
  await page.locator('[data-svg-host] #a rect').dblclick({ position: { x: 20, y: 90 } });
  expect((await selection(page)).scope).toBe('a');
  await page.locator('[data-svg-host] #b rect').click({ position: { x: 20, y: 90 } });
  expect(await selection(page)).toEqual({ ids: ['b'], scope: null });
  await page.locator('[data-svg-host] #c rect').click({ position: { x: 70, y: 80 }, force: true });
  expect(await selection(page)).toEqual({ ids: ['c'], scope: null });
});

test('quick clicks on different nodes do not enter a group accidentally', async ({ page }) => {
  await page.locator('[data-svg-host] #a rect').click({ position: { x: 20, y: 90 } });
  const b = (await page.locator('[data-svg-host] #b rect').boundingBox())!;
  await page.mouse.move(b.x + 20, b.y + 90);
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  expect(await selection(page)).toEqual({ ids: ['b'], scope: null });
});
