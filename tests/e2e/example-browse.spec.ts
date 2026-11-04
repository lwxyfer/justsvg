import { selectExampleOption, expectFullPagePreview } from './example-navigation';
import { test, expect } from '@playwright/test';
test('preview uses panel width and expands into an entire page with fitted artwork', async ({
  page,
}) => {
  for (const width of [1600, 1024, 633, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/examples?example=work-standard-commerce');
    const headerHeight = await page.locator('.example-preview-stage').evaluate((el) => {
      return (
        el.getBoundingClientRect().top - el.closest('.image-detail')!.getBoundingClientRect().top
      );
    });
    expect(headerHeight).toBeLessThanOrEqual(84);
    await expect(
      page.getByRole('heading', { name: '电商业务系统架构', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '在编辑器中打开', exact: true }),
    ).toBeInViewport();
    await expect(page.getByRole('button', { name: '下载 SVG', exact: true })).toHaveCount(0);
    const board = page.locator('.example-artboard');
    await expect
      .poll(() =>
        board.evaluate((el) => {
          const art = el.getBoundingClientRect();
          const panel = el.closest('.image-detail')!.getBoundingClientRect();
          const viewport = el.parentElement!.getBoundingClientRect();
          const toolbar = el
            .closest('.image-detail')!
            .querySelector('.example-fit')!
            .getBoundingClientRect();
          return (
            art.width >= panel.width - 2 &&
            Math.abs(art.width / art.height - 1.6) < 0.01 &&
            art.left >= viewport.left - 1 &&
            art.right <= viewport.right + 1 &&
            art.top >= viewport.top - 1 &&
            art.bottom <= viewport.bottom + 1 &&
            toolbar.top >= viewport.top &&
            toolbar.right <= viewport.right
          );
        }),
      )
      .toBe(true);
    await page.getByRole('button', { name: '全屏预览', exact: true }).click();
    await expectFullPagePreview(page, 1.6);
    await expect(page.locator('.image-results')).toHaveAttribute('inert', '');
    await page.getByRole('button', { name: '退出全屏', exact: true }).click();
    await expect
      .poll(() =>
        page
          .locator('.example-preview-scroll')
          .evaluate(
            (el) => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1,
          ),
      )
      .toBe(true);
  }
});
test('image search defaults to OpenAI and retains all variants after closing the preview', async ({
  page,
}) => {
  await page.goto('/examples');
  await expect(page).toHaveURL(/\/examples\?example=brand-openai-rag$/);
  await expect(page.locator('.image-result')).toHaveCount(169);
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'brand-openai-rag');
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await expect(page.getByLabel('图片预览')).toBeHidden();
  await expect(page).toHaveURL(/\/examples$/);
  await page.getByLabel('搜索示例').fill('Mistral');
  await expect(page.locator('.image-result')).toHaveCount(1);
  await page.locator('#result-brand-mistral-rag').click();
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'brand-mistral-rag');
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await expect(page.getByLabel('搜索示例')).toHaveValue('Mistral');
  await expect(page.locator('#result-brand-mistral-rag')).toBeFocused();
  await selectExampleOption(page, '筛选图形类型', '时序图');
  await expect(page.getByText('没有找到匹配的 SVG')).toBeVisible();
  await page.getByRole('button', { name: '显示全部示例', exact: true }).click();
  await expect(page.locator('.image-result')).toHaveCount(169);
  await page.getByRole('link', { name: '返回编辑器', exact: true }).click();
  await page.getByRole('link', { name: '示例库', exact: true }).click();
  await expect(page).toHaveURL(/\/examples\?example=brand-openai-rag$/);
  await page.reload();
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'brand-openai-rag');
});
test('full-page preview retains drafts, grid geometry and navigation with an escape-first exit', async ({
  page,
}) => {
  await page.goto('/examples?example=work-standard-commerce');
  const picker = page.getByRole('combobox', { name: '选择视觉风格', exact: true });
  const title = page.getByRole('heading', { name: '电商业务系统架构', exact: true });
  expect(
    await picker.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(18);
  const pickerBox = await picker.boundingBox(),
    titleBox = await title.boundingBox();
  expect(pickerBox!.y + pickerBox!.height).toBeLessThanOrEqual(titleBox!.y);
  await page.getByRole('textbox', { name: '生成 Prompt', exact: true }).fill('全屏测试：页面草稿保留');
  const gridBefore = await page
    .locator('.image-results')
    .evaluate((el) => [el.clientWidth, el.scrollTop]);
  await page.getByRole('button', { name: '全屏预览', exact: true }).click();
  await expectFullPagePreview(page, 1.6);
  expect(
    await page.locator('.image-results').evaluate((el) => [el.clientWidth, el.scrollTop]),
  ).toEqual(gridBefore);
  await page.getByRole('button', { name: '下一张', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(picker).toBeFocused();
  await picker.click();
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('图片预览')).toHaveClass(/is-expanded/);
  await page.locator('.example-preview-stage').hover();
  await page.getByRole('button', { name: '下一张', exact: true }).click();
  await expect(picker).not.toHaveAttribute('data-value', 'work-standard-commerce');
  await page.getByRole('button', { name: '上一张', exact: true }).click();
  await expect(picker).toHaveAttribute('data-value', 'work-standard-commerce');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('图片预览')).not.toHaveClass(/is-expanded/);
  await expect(page.getByRole('button', { name: '全屏预览', exact: true })).toBeFocused();
  await expect(page.getByRole('textbox', { name: '生成 Prompt', exact: true })).toHaveValue('全屏测试：页面草稿保留');
  await expect(page.locator('.image-results')).not.toHaveAttribute('inert');
  await page.getByRole('button', { name: '全屏预览', exact: true }).click();
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await expect(page.getByLabel('图片预览')).toBeHidden();
  await expect(page.locator('#result-work-standard-commerce')).toBeFocused();
  await expect(page.locator('.image-results')).not.toHaveAttribute('inert');
});
test('image controls float over the SVG and navigation appears on hover or keyboard focus', async ({
  page,
}) => {
  await page.goto('/examples?example=work-standard-commerce');
  const stage = page.locator('.example-preview-stage');
  const previous = page.getByRole('button', { name: '上一张', exact: true });
  const next = page.getByRole('button', { name: '下一张', exact: true });
  const fit = page.getByRole('button', { name: '全屏预览', exact: true });
  await page.getByRole('heading', { name: '电商业务系统架构', exact: true }).hover();
  await expect(previous).toHaveCSS('opacity', '0');
  await expect(next).toHaveCSS('opacity', '0');
  expect(await fit.innerText()).toBe('');
  await expect(fit).toHaveAttribute('title', '全屏预览');
  await stage.hover();
  await expect(previous).toHaveCSS('opacity', '1');
  await expect(next).toHaveCSS('opacity', '1');
  expect(
    await stage.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const fit = el.querySelector('.example-fit')!.getBoundingClientRect();
      const previous = el.querySelector('.example-previous')!.getBoundingClientRect();
      const next = el.querySelector('.example-next')!.getBoundingClientRect();
      return (
        fit.top >= box.top &&
        fit.top < box.top + 20 &&
        fit.right <= box.right &&
        previous.left >= box.left &&
        next.right <= box.right &&
        Math.abs((previous.top + previous.bottom) / 2 - (box.top + box.bottom) / 2) < 1 &&
        previous.right < next.left
      );
    }),
  ).toBe(true);
  await next.click();
  await expect(page.getByLabel('选择视觉风格')).not.toHaveAttribute(
    'data-value',
    'work-standard-commerce',
  );
  await previous.click();
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'work-standard-commerce',
  );
  await page.getByRole('heading', { name: '电商业务系统架构', exact: true }).hover();
  await expect(next).toHaveCSS('opacity', '0');
  await fit.focus();
  await page.keyboard.press('Tab');
  await expect(previous).toBeFocused();
  await expect(previous).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('选择视觉风格')).not.toHaveAttribute(
    'data-value',
    'work-standard-commerce',
  );
});
test('touch devices can use image navigation without hover', async ({ browser }) => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: 'http://127.0.0.1:5173',
  });
  try {
    await page.goto('/examples?example=work-standard-commerce');
    const next = page.getByRole('button', { name: '下一张', exact: true });
    await expect(next).toHaveCSS('opacity', '1');
    expect(await next.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(
      44,
    );
    await next.tap();
    await expect(page.getByLabel('选择视觉风格')).not.toHaveAttribute(
      'data-value',
      'work-standard-commerce',
    );
    await page.getByRole('button', { name: '上一张', exact: true }).tap();
    await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
      'data-value',
      'work-standard-commerce',
    );
  } finally {
    await page.close();
  }
});
test('preview navigation and close preserve result scroll and filters', async ({ page }) => {
  await page.goto('/examples');
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await selectExampleOption(page, '筛选风格系列', 'brand');
  await page.locator('.image-results').evaluate((el) => {
    el.scrollTop = 500;
  });
  const first = page.locator('#result-brand-mistral-rag');
  await first.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const before = await page.locator('.image-results').evaluate((el) => el.scrollTop);
  await first.click();
  await page.locator('.example-preview-stage').hover();
  await page.getByRole('button', { name: '下一张', exact: true }).click();
  await page.getByRole('button', { name: '上一张', exact: true }).click();
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'brand-mistral-rag');
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  expect(await page.locator('.image-results').evaluate((el) => el.scrollTop)).toBe(before);
  await expect(page.getByLabel('筛选风格系列')).toHaveAttribute('data-value', 'brand');
});
test('mobile opens a full preview then returns to the grid with its search', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/examples');
  await expect(page).toHaveURL(/\/examples\?example=brand-openai-rag$/);
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute('data-value', 'brand-openai-rag');
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await page.getByLabel('搜索示例').fill('work-standard');
  await page.locator('#result-work-standard-entity').click();
  await expect(page.getByLabel('图片预览')).toBeVisible();
  await expect(page.getByRole('button', { name: '关闭预览', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await expect(page.getByLabel('搜索示例')).toHaveValue('work-standard');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('selected tile is revealed and source tab arrows stay local, including filtered-out previews', async ({
  page,
}) => {
  await page.goto('/examples?example=brand-mistral-rag');
  await expect(page.locator('#result-brand-mistral-rag')).toBeInViewport();
  await page.locator('.example-preview-stage').hover();
  await page.getByRole('button', { name: '下一张', exact: true }).click();
  await expect(page.locator('#result-brand-perplexity-rag')).toBeInViewport();
  const prompt = page.getByRole('tab', { name: '生成 Prompt', exact: true });
  await prompt.focus();
  await prompt.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'SVG 源码', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'brand-perplexity-rag',
  );
  await page.getByLabel('搜索示例').fill('zzzzzz-no-result');
  await page.getByRole('button', { name: '关闭预览', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('选择视觉风格')).toHaveAttribute(
    'data-value',
    'brand-perplexity-rag',
  );
  await expect(page.getByRole('button', { name: '下一张', exact: true })).toBeDisabled();
});
