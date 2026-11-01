import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = '.impeccable/review/home-refinements';

test('single-line English chapter titles and a complete workbench with space before the footer', async ({
  page,
}) => {
  await mkdir(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const language of ['en', 'zh']) {
    await page
      .getByRole('button', { name: language === 'en' ? 'English' : '中文', exact: true })
      .click();
    for (const [width, height] of [
      [1600, 900],
      [1366, 768],
      [816, 1000],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => document.fonts.ready);
      const chapter = page.locator('.editor-chapter');
      const bounds = await chapter.boundingBox();
      expect(
        bounds!.height,
        `${language} ${width}×${height}: full fourth chapter`,
      ).toBeLessThanOrEqual(height);
      const file = await page.locator('.editor-chapter .export-file').boundingBox();
      const footerTop = (await page.locator('.document-footer').boundingBox())!.y;
      expect(
        footerTop - (file!.y + file!.height),
        'the file handoff has breathing room before the blue footer',
      ).toBeGreaterThanOrEqual(47);
      if (language === 'en') {
        const headings = await page.locator('#records-title,#skill-title').evaluateAll((elements) =>
          elements.map((el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const lines = new Set(
              [...range.getClientRects()]
                .filter((rect) => rect.width > 0 && rect.height > 0)
                .map((rect) => Math.round(rect.top)),
            );
            return {
              lines: lines.size,
              right: el.getBoundingClientRect().right,
              fits: el.scrollWidth <= el.clientWidth + 1,
            };
          }),
        );
        for (const heading of headings) {
          expect(heading.lines, `one-line English title at ${width}px`).toBe(1);
          expect(heading.right).toBeLessThanOrEqual(width);
          expect(heading.fits).toBe(true);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator('.language-switch button[aria-pressed=true]')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
      await expect(page.locator('.skill-composer textarea')).toBeVisible();
      const overlap = await page.evaluate(() => {
        const chat = document.querySelector('.skill-ticket')!.getBoundingClientRect();
        const node = document
          .querySelector('.skill-diagram [data-node="docs"]')!
          .getBoundingClientRect();
        return (
          chat.left < node.right &&
          chat.right > node.left &&
          chat.top < node.bottom &&
          chat.bottom > node.top
        );
      });
      expect(overlap, `composer overlaps diagram: ${language} ${width}`).toBe(false);
      if (width === 1600 || width === 390) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page
          .locator('.home-header')
          .screenshot({ path: `${output}/${language}-${width}-header.png` });
        for (const section of ['skill-chapter', 'editor-chapter', 'document-footer'])
          await page
            .locator(`.${section}`)
            .screenshot({ path: `${output}/${language}-${width}-${section}.png` });
        await page.evaluate(() =>
          window.scrollTo({
            top: document.querySelector('.editor-chapter')!.getBoundingClientRect().top + scrollY,
            behavior: 'instant',
          }),
        );
        await page.screenshot({ path: `${output}/${language}-${width}-editor-transition.png` });
      }
    }
  }
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByLabel('描述你想画的图', { exact: true }).fill('Draw a deployment diagram.');
  await page.getByRole('button', { name: '复制生成指令', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('生成指令已复制');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'Draw a deployment diagram.',
  );
});

test('blue footer keeps content on the right and plays one text-free sequence before returning to SVG', async ({
  page,
}) => {
  test.setTimeout(35000);
  await mkdir(output, { recursive: true });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const footer = page.locator('.footer-close');
  const path = footer.locator('.footer-morph-node').first();
  const slash = footer.locator('.footer-morph-slash');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toHaveAttribute('data-morph-progress', '1.000');
  await expect(slash).toHaveCSS('animation-name', 'footer-slash-blink');
  await expect
    .poll(() => slash.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeLessThan(0.2);
  await expect
    .poll(() => slash.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.9);
  await expect(page.locator('.footer-file-note,.closing-guides,.closing-dot')).toHaveCount(0);
  expect((await footer.boundingBox())!.width).toBeGreaterThan(700);
  expect((await page.locator('.document-footer').boundingBox())!.height).toBeGreaterThanOrEqual(
    520,
  );
  await expect(page.locator('.document-footer')).toHaveCSS('background-color', 'rgb(40, 85, 238)');
  const brandBounds = await page.locator('.footer-brand').boundingBox();
  const artBounds = await page.locator('.footer-artwork').boundingBox();
  const contentBounds = await page.locator('.footer-content').boundingBox();
  expect(artBounds!.width / contentBounds!.width).toBeCloseTo(1.618, 2);
  expect(brandBounds!.x).toBeGreaterThan(800);
  expect(brandBounds!.x).toBeGreaterThan(artBounds!.x + artBounds!.width);
  await expect(page.locator('.footer-navigation .footer-link-group')).toHaveCount(2);
  await expect(page.locator('.footer-description')).toContainText('architecture diagrams');
  const original = await path.getAttribute('d');
  const restingWidth = await footer
    .locator('.footer-morph-nodes')
    .evaluate((group) => (group as SVGGElement).getBBox().width);
  const handles = await footer.locator('.footer-morph-node').elementHandles();
  await footer.hover();
  await expect
    .poll(async () => Number(await footer.getAttribute('data-morph-progress')))
    .toBeGreaterThan(0.15);
  const intermediate = await path.getAttribute('d');
  expect(intermediate).not.toBe(original);
  await expect(slash).toHaveCSS('animation-name', 'none');
  await expect(slash).toHaveCSS('opacity', '1');
  await expect(footer).toHaveAttribute('data-morph-progress', '1.000');
  const architecture = await path.getAttribute('d');
  expect(intermediate).not.toBe(architecture);
  const architectureWidth = await footer
    .locator('.footer-morph-frame')
    .first()
    .evaluate((frame) => (frame as SVGRectElement).getBBox().width);
  expect(
    restingWidth,
    'the resting SVG lettering should not overpower the architecture diagram',
  ).toBeLessThanOrEqual(architectureWidth * 1.05);
  // Parallel services and data live in separate architecture tiers.
  expect(await footer.innerText()).toBe('');
  await expect(footer.locator('text,tspan,.footer-morph-caption')).toHaveCount(0);
  const structure = await footer.evaluate((el) => {
    const nodes = [...el.querySelectorAll<SVGPathElement>('.footer-morph-node')].map((n) =>
      n.getBBox(),
    );
    const frames = [...el.querySelectorAll<SVGRectElement>('.footer-morph-frame')].map((n) =>
      n.getBBox(),
    );
    const inside = (a: DOMRect, b: DOMRect) =>
      a.x > b.x && a.y > b.y && a.x + a.width < b.x + b.width && a.y + a.height < b.y + b.height;
    return {
      smallNodes: nodes.every((n) => n.width <= 120 && n.height <= 40),
      externalClient: nodes[0].y + nodes[0].height < frames[0].y,
      stackedTiers: frames.every((f, i) => i === 0 || f.y > frames[i - 1].y + frames[i - 1].height),
      groupedComponents: [
        inside(nodes[1], frames[0]),
        inside(nodes[2], frames[1]),
        inside(nodes[3], frames[1]),
        inside(nodes[4], frames[2]),
        inside(nodes[5], frames[2]),
      ],
    };
  });
  expect(structure).toEqual({
    smallNodes: true,
    externalClient: true,
    stackedTiers: true,
    groupedComponents: [true, true, true, true, true],
  });
  await page.locator('.document-footer').screenshot({ path: `${output}/footer-architecture.png` });
  for (const mode of ['flowchart', 'mindmap', 'svg']) {
    await expect(footer).toHaveAttribute('data-morph', mode, { timeout: 6000 });
    await expect(footer).toHaveAttribute('data-morph-progress', '1.000');
    expect(await footer.innerText()).toBe('');
    await expect(footer.locator('text,tspan')).toHaveCount(0);
    expect(
      await footer
        .locator('.footer-morph-frame')
        .evaluateAll((frames) => frames.every((el) => Number(el.getAttribute('opacity')) === 0)),
    ).toBe(true);
    if (mode !== 'svg')
      await page.locator('.document-footer').screenshot({ path: `${output}/footer-${mode}.png` });
  }
  for (const handle of handles) expect(await handle.evaluate((el) => el.isConnected)).toBe(true);
  expect(await footer.locator('svg').textContent()).not.toMatch(/[\u4e00-\u9fff]/);
  await expect(footer).toHaveAttribute('data-playback', 'complete');
  await expect(slash).toHaveCSS('animation-name', 'footer-slash-blink');
  expect(await path.getAttribute('d')).toBe(original);
  await page.waitForTimeout(1600);
  expect(await path.getAttribute('d')).toBe(original);
  await expect(footer).toHaveAttribute('data-playback', 'complete');
  await page.mouse.move(2, 2);
  await expect(footer).toHaveAttribute('data-morph', 'svg');
  await expect(footer).toHaveAttribute('data-morph-progress', '1.000');
  expect(await path.getAttribute('d')).toBe(original);
  // Interrupt in either direction: no snap to a cached end state and no competing loops.
  await footer.hover();
  await expect
    .poll(async () => Number(await footer.getAttribute('data-morph-progress')))
    .toBeGreaterThan(0.1);
  await page.mouse.move(2, 2);
  await footer.hover();
  await expect(footer).toHaveAttribute('data-morph', 'architecture');
  await page.mouse.move(2, 2);
  await expect(footer).toHaveAttribute('data-morph-progress', '1.000');
  expect(await path.getAttribute('d')).toBe(original);
  expect(errors).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(footer).toHaveAttribute('data-slash-blink', 'false');
});

test('footer supports keyboard, reduced motion and touch activation', async ({ page, browser }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const footer = page.locator('.footer-close');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.locator('.footer-morph-slash')).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Tab');
  await footer.focus();
  await expect(footer).toHaveAttribute('data-morph', 'architecture');
  await expect(footer).toHaveAttribute('data-morph-progress', '1.000');
  const staticPath = await footer.locator('.footer-morph-node').first().getAttribute('d');
  await page.waitForTimeout(1600);
  expect(await footer.locator('.footer-morph-node').first().getAttribute('d')).toBe(staticPath);
  await page.locator('.back-top').focus();
  await expect(footer).toHaveAttribute('data-morph', 'svg');
  const touch = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const mobile = await touch.newPage();
  await mobile.goto('http://127.0.0.1:5173/');
  const button = mobile.locator('.footer-close');
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('data-morph', 'architecture');
  expect((await button.boundingBox())!.width).toBeGreaterThan(300);
  expect(await button.innerText()).toBe('');
  await mkdir(output, { recursive: true });
  await mobile
    .locator('.document-footer')
    .screenshot({ path: `${output}/footer-architecture-mobile.png` });
  expect((await mobile.locator('.document-footer').boundingBox())!.height).toBeGreaterThan(480);
  expect(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  );
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveAttribute('data-morph', 'svg');
  await touch.close();
});
