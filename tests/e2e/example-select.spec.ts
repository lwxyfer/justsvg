import { test, expect } from '@playwright/test';
import { selectExampleOption } from './example-navigation';

test('style picker supports real keyboard selection, search, escape and outside dismissal', async ({
  page,
}) => {
  await page.goto('/examples?example=work-standard-commerce');
  const trigger = page.getByRole('combobox', { name: '选择视觉风格', exact: true });
  await expect(page.locator('.examples-page select')).toHaveCount(0);
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(
    page.getByRole('listbox', { name: '选择视觉风格', exact: true }).getByRole('option'),
  ).toHaveCount(5);
  await trigger.press('End');
  await trigger.press('Enter');
  await expect(trigger).toHaveAttribute('data-value', 'work-reference-commerce');
  await expect(trigger).toBeFocused();
  await trigger.press('ArrowRight');
  await expect(trigger).toHaveAttribute('data-value', 'work-reference-commerce');
  await trigger.click();
  await trigger.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('图片预览')).toBeVisible();

  await page.goto('/examples?example=brand-openai-rag');
  await trigger.click();
  const search = page.getByRole('searchbox', { name: '搜索示例 选择视觉风格', exact: true });
  await expect(search).toBeFocused();
  await search.fill('Notion');
  const option = page.getByRole('option', { name: 'Notion', exact: true });
  await expect(
    page.getByRole('listbox', { name: '选择视觉风格', exact: true }).getByRole('option'),
  ).toHaveCount(1);
  await search.press('Enter');
  await expect(trigger).toHaveAttribute('data-value', 'brand-notion-rag');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole('searchbox', { name: '搜索示例 选择视觉风格', exact: true })
    .fill('no-such-brand');
  await expect(page.getByText('没有匹配的风格')).toBeVisible();
  await page.getByRole('heading', { name: 'RAG 检索增强生成架构', exact: true }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(option).toHaveCount(0);
});

test('picker stays inside small viewports and brand evidence is disclosed once', async ({
  page,
}) => {
  for (const width of [1600, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/examples?example=brand-openai-rag');
    await expect(page.getByRole('button', { name: '保存本地版本', exact: true })).toHaveCount(0);
    await expect(page.locator('.example-explanation')).toHaveCount(0);
    const evidence = page.getByLabel('品牌风格依据');
    await expect(evidence).not.toHaveAttribute('open');
    await evidence.locator('summary').click();
    await expect(evidence).toHaveAttribute('open', '');
    await expect(evidence.getByRole('link').first()).toBeVisible();
    await page.locator('.image-detail').evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.getByRole('combobox', { name: '选择视觉风格', exact: true }).click();
    const box = await page.locator('.example-select-popover').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(845);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('custom filters use list options and preserve intersections', async ({ page }) => {
  await page.goto('/examples');
  await selectExampleOption(page, '筛选图形类型', '架构图');
  await selectExampleOption(page, '筛选风格系列', 'brand');
  await expect(page.locator('.image-result')).toHaveCount(39);
  await selectExampleOption(page, '筛选风格系列', 'base');
  await expect(page.locator('.image-result')).not.toHaveCount(39);
  await page.getByLabel('搜索示例').fill('commerce');
  await expect(page.locator('.image-result')).toHaveCount(5);
});
