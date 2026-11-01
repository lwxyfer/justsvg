/* global Image, document */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const assetDir = `${root}src/assets/brand/`;
const publicDir = `${root}public/`;
const identity = JSON.parse(await readFile(`${assetDir}identity.json`, 'utf8'));
const approved = await readFile(`${assetDir}mark.svg`, 'utf8');
const path = approved.match(/\bd="([^"]+)"/)[1];
const viewBox = approved.match(/viewBox="([^"]+)"/)[1];
const accent = identity.accent;
const ink = identity.ink;
identity.scheme = 'D + F / forward J badge';
identity.mark = { viewBox, path };
identity.lockup.markTransform = identity.lockup.markTransform.replace(/scale\([^)]*\)/, 'scale(1.25)');
await writeFile(`${assetDir}identity.json`, JSON.stringify(identity, null, 2) + '\n');

const symbol = (color) => `<path fill="${color}" fill-rule="evenodd" d="${path}"/>`;
const svg = (w, h, vb, contents, title = 'JustSVG') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${contents}</svg>`;
const mark = (color, size = 256) => svg(size, size, viewBox, symbol(color), 'JustSVG forward J badge');
const lockup = (symbolColor, textColor) => svg(333, 100, identity.lockup.viewBox,
  `<g transform="${identity.lockup.markTransform}">${symbol(symbolColor)}</g><path fill="${textColor}" d="${identity.wordmark.path}" transform="${identity.lockup.wordmarkTransform}"/>`);
for (const [name, color] of [['justsvg-logo.svg', accent], ['justsvg-logo-mono.svg', '#000'], ['justsvg-logo-inverse.svg', '#fff']]) {
  await writeFile(`${publicDir}brand/${name}`, mark(color));
}
await writeFile(`${publicDir}brand/justsvg-wordmark.svg`, lockup(accent, ink));
await writeFile(`${publicDir}brand/justsvg-wordmark-inverse.svg`, lockup('#fff', '#fff'));
// Keep the J white in browser tabs, including tabs with a dark background.
const badgeOutline = path.slice(0, path.indexOf('Z') + 1);
const favicon = svg(64, 64, viewBox,
  `<path fill="#fff" d="${badgeOutline}"/>${symbol(accent)}`);
await writeFile(`${publicDir}favicon.svg`, favicon);
// The approved badge is already the icon container; do not add another badge.
const appIcon = svg(1024, 1024, viewBox, `<rect width="64" height="64" fill="#fff"/>${symbol(accent)}`);
await writeFile(`${publicDir}brand/justsvg-app-icon.svg`, appIcon);
const board = svg(1100, 580, '0 0 1100 580', `<rect width="1100" height="580" fill="#f6f8ff"/><g transform="translate(64 84) scale(3.25)">${symbol(accent)}</g><g transform="translate(340 118) scale(1.8)"><g transform="${identity.lockup.markTransform}">${symbol(accent)}</g><path fill="${ink}" d="${identity.wordmark.path}" transform="${identity.lockup.wordmarkTransform}"/></g><g transform="translate(88 400) scale(1.5)">${symbol(ink)}</g><rect x="340" y="365" width="150" height="150" rx="12" fill="${ink}"/><g transform="translate(367 392) scale(1.5)">${symbol('#fff')}</g><g transform="translate(576 400)">${symbol(accent)}</g><g transform="translate(732 400) scale(.5)">${symbol(accent)}</g><text x="64" y="45" fill="${ink}" font-family="Arial,sans-serif" font-size="20">JustSVG / D + F</text><text x="570" y="495" fill="${ink}" font-family="Arial,sans-serif" font-size="18">Just diagrams. Just SVG.</text>`);
await writeFile(`${publicDir}brand/justsvg-brand-board.svg`, board);

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage();
  const render = async (source, size) => Buffer.from(await page.evaluate(async ({ source, size }) => {
    const image = new Image();
    image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    canvas.getContext('2d').drawImage(image, 0, 0, size, size);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { source, size }), 'base64');
  const png = await render(favicon, 32);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header[6] = header[7] = 32;
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
  await writeFile(`${publicDir}favicon.ico`, Buffer.concat([header, png]));
  await writeFile(`${publicDir}apple-touch-icon.png`, await render(appIcon, 180));
  await writeFile(`${publicDir}brand/justsvg-app-icon.png`, await render(appIcon, 512));
} finally {
  await browser.close();
}
console.log('Applied D + F: canonical geometry, runtime identity, public logos, favicon and app icons.');
