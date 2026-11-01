import { expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

export async function expectFullPagePreview(page: Page, ratio: number) {
  const panel = page.getByLabel('图片预览');
  await expect(panel).toHaveClass(/is-expanded/);
  await expect(panel).toHaveAttribute('aria-modal', 'true');
  await expect(page.getByLabel('Prompt 与 SVG 调试')).toBeHidden();
  await expect
    .poll(() =>
      panel.evaluate((el, expectedRatio) => {
        const bounds = el.getBoundingClientRect();
        const stage = el.querySelector('.example-preview-stage')!.getBoundingClientRect();
        const art = el.querySelector('.example-artboard')!.getBoundingClientRect();
        return (
          bounds.left === 0 &&
          bounds.top === 0 &&
          Math.abs(bounds.width - innerWidth) < 1 &&
          Math.abs(bounds.height - innerHeight) < 1 &&
          Math.abs(stage.bottom - innerHeight) < 1 &&
          art.left >= stage.left - 1 &&
          art.right <= stage.right + 1 &&
          art.top >= stage.top - 1 &&
          art.bottom <= stage.bottom + 1 &&
          Math.abs(art.width / art.height - expectedRatio) < 0.01 &&
          (Math.abs(art.width - stage.width) < 2 || Math.abs(art.height - stage.height) < 2)
        );
      }, ratio),
    )
    .toBe(true);
}

export async function selectExampleOption(
  page: Page,
  label: string,
  choice: string | { label: string },
) {
  const trigger = page.getByRole('combobox', { name: label, exact: true });
  await trigger.click();
  const list = page.getByRole('listbox', { name: label, exact: true });
  const option =
    typeof choice === 'string'
      ? list.locator(`[role="option"][data-value=${JSON.stringify(choice)}]`)
      : list.getByRole('option', { name: choice.label, exact: true });
  await option.click();
}

export async function expectExampleOptionCount(page: Page, label: string, count: number) {
  const trigger = page.getByRole('combobox', { name: label, exact: true });
  await trigger.click();
  await expect(
    page.getByRole('listbox', { name: label, exact: true }).getByRole('option'),
  ).toHaveCount(count);
  await page.keyboard.press('Escape');
}

// Examples have no download action; export through the real editor in a separate
// page so geometry assertions can keep inspecting the original SVG preview.
export async function downloadExampleFromEditor(page: Page) {
  const editor = await page.context().newPage();
  try {
    await editor.goto(page.url());
    await editor.getByRole('button', { name: '在编辑器中打开', exact: true }).click();
    await editor.locator('.export-dropdown > summary').click();
    const pending = editor.waitForEvent('download');
    await editor.getByRole('button', { name: '下载 SVG', exact: true }).click();
    const download = await pending;
    return {
      filename: download.suggestedFilename(),
      xml: await readFile((await download.path())!, 'utf8'),
    };
  } finally {
    await editor.close();
  }
}
export async function chooseContent(page: Page, id: string) {
  if (
    (page.viewportSize()?.width || 1600) <= 700 &&
    (await page.getByRole('button', { name: '关闭预览', exact: true }).isVisible())
  )
    await page.getByRole('button', { name: '关闭预览', exact: true }).click();
  await page.getByLabel('搜索示例').fill('');
  await selectExampleOption(page, '筛选图形类型', '');
  await selectExampleOption(page, '筛选风格系列', 'all');
  await page.locator(`#result-${id}`).click();
}
