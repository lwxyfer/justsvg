import { test, expect } from '@playwright/test';

test('restored legacy labels with SVG descriptions remain editable in both editors', async ({
  page,
}) => {
  await page.goto('/editor#lang=zh');
  await page.evaluate(async () => {
    const bridge = '/tests/e2e/bridge.ts';
    const { engine, useUI } = await import(/* @vite-ignore */ bridge);
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><text id="legacy-label" data-label="文字标签" x="120" y="160" font-size="24"><title>文字标签</title><desc>标签说明</desc>待编辑文字</text></svg>',
      'legacy.svg',
    );
    engine.select([engine.root!.querySelector('text')!]);
    useUI.getState().set({ zoom: 1, pan: { x: 30, y: 30 } });
  });
  const property = page.getByLabel('属性文字 1', { exact: true });
  await expect(property).toHaveValue('待编辑文字');
  await property.fill('属性编辑成功');
  await property.press('Tab');
  await page.locator('[data-svg-host] #legacy-label').dblclick();
  const dialog = page.getByRole('dialog', { name: '编辑文字', exact: true });
  await expect(dialog.getByLabel('文字段落 1')).toHaveValue('属性编辑成功');
  await dialog.getByLabel('文字段落 1').fill('第一行\n第二行');
  await dialog.getByRole('button', { name: '应用', exact: true }).click();
  await expect(property).toHaveValue('第一行');
  await expect(page.getByLabel('属性文字 2', { exact: true })).toHaveValue('第二行');
  const label = page.locator('[data-svg-host] #legacy-label');
  await expect(label.locator('title')).toHaveText('文字标签');
  await expect(label.locator('desc')).toHaveText('标签说明');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(property).toHaveValue('属性编辑成功');
  await page.reload();
  await page.locator('[data-svg-host] #legacy-label').dblclick();
  await expect(dialog.getByLabel('文字段落 1')).toHaveValue('属性编辑成功');
});

for (const example of ['factory-rag', 'template-rag']) {
  test(`text labels dragged into ${example} support property and double-click editing`, async ({
    page,
  }) => {
    await page.goto(`/examples?example=${example}#lang=zh`);
    await page.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    const materials = page.getByRole('complementary', { name: '插入面板', exact: true });
    await materials.getByRole('button', { name: '全部图形分类', exact: true }).click();
    await materials.getByLabel('搜索素材').fill('文字标签');
    await materials
      .getByRole('button', { name: '插入 文字标签', exact: true })
      .dragTo(page.locator('[data-canvas]'), { targetPosition: { x: 300, y: 250 } });
    const text = page.locator('[data-svg-host] text[data-label="文字标签"]');
    await expect(text).toBeVisible();
    const property = page.getByLabel('属性文字 1', { exact: true });
    await expect(property).toBeVisible();
    await expect(property).toHaveValue('文字标签');
    await property.fill('新增标签');
    await property.press('Tab');
    await expect(text).toHaveText('新增标签');
    await text.dblclick();
    const editor = page.getByRole('dialog', { name: '编辑文字', exact: true });
    await editor.getByLabel('文字段落 1').fill('修改成功');
    await editor.getByRole('button', { name: '应用', exact: true }).click();
    await expect(text).toHaveText('修改成功');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(text).toHaveText('新增标签');
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect(text).toHaveText('修改成功');
    const xml = await page.evaluate(async () => {
      const bridge = '/tests/e2e/bridge.ts';
      const { engine } = await import(/* @vite-ignore */ bridge);
      const xml = engine.exportSvg();
      engine.importSvg(xml, 'roundtrip.svg');
      engine.select([engine.root!.querySelector('text[data-label="文字标签"]')!]);
      return xml;
    });
    expect(xml).toContain('修改成功');
    await expect(property).toHaveValue('修改成功');
  });
}
