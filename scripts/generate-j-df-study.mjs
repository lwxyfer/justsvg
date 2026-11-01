import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = `${root}public/brand/proposals-j-df/`;
const blue = '#2855ee', ink = '#334256';
// D's original contour, expressed with coordinate pairs so the inset is exact.
const glyph = 'M21 7L54 7L54 37C54 50 45 58 32 58C18 58 9 50 9 37L22 37C22 43 25 46 32 46S41 43 41 37L41 20L21 20Z';
const tokens = glyph.match(/[MLCSZ]|-?\d*\.?\d+/g);
let inset = '';
for (let i = 0; i < tokens.length;) {
  if (/^[MLCSZ]$/.test(tokens[i])) { inset += tokens[i++]; continue; }
  const x = Number(tokens[i++]), y = Number(tokens[i++]);
  inset += `${Number((.72 * x - .1296 * y + 11.6).toFixed(3))} ${Number((.72 * y + 10).toFixed(3))} `;
}
const badge = 'M17 5H47Q59 5 59 17V47Q59 59 47 59H17Q5 59 5 47V17Q5 5 17 5Z';
function fusion(color = blue, size = 64) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="${color}" role="img" aria-label="JustSVG 前倾方印 J"><title>JustSVG D + F</title><path fill-rule="evenodd" d="${badge}${inset}"/></svg>`;
}
await mkdir(out, { recursive: true });
for (const [name, color] of [['blue', blue], ['ink', ink], ['white', '#fff']]) await writeFile(`${out}j-df-${name}.svg`, fusion(color));
const d = (await readFile(`${root}public/brand/proposals-j/d-blue.svg`, 'utf8')).replace('width="64" height="64"', 'width="120" height="120"');
const f = (await readFile(`${root}public/brand/proposals-j/f-blue.svg`, 'utf8')).replace('width="64" height="64"', 'width="120" height="120"');
const { wordmark } = JSON.parse(await readFile(`${root}public/brand/kits/source/faithful-vectors.json`, 'utf8'));
const [x, y, w, h] = wordmark.bounds;
const name = `<svg xmlns="http://www.w3.org/2000/svg" width="${26*w/h}" height="26" viewBox="${x} ${y} ${w} ${h}" fill="${ink}" aria-label="JustSVG"><path d="${wordmark.path}"/></svg>`;
await writeFile(`${out}index.html`, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JustSVG · D + F</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:${ink};font-family:"Helvetica Neue","PingFang SC",sans-serif;-webkit-font-smoothing:antialiased}main{max-width:1280px;margin:auto;padding:42px 48px 30px}h1{font-size:31px;letter-spacing:-.025em;font-weight:600;margin:0 0 13px}.intro{font-size:14px;line-height:1.8;color:#5c6878;margin:0 0 30px}.concepts{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:22px}.panel{background:#fff;border:1px solid #dbe0e7;border-radius:12px;padding:22px;min-width:0}.panel h2{font-size:16px;font-weight:600;margin:0}.panel>div{height:205px;display:flex;align-items:center;justify-content:center}.panel p{text-align:center;font-size:13px;color:#5c6878;margin:5px 0}.panel.center{background:#edf2ff;border-color:#cbd7ff}.center h2{color:${blue}}svg{display:block;flex-shrink:0}.lockup{display:flex;align-items:center;justify-content:center;gap:13px;margin:26px 0 29px}.proofs{background:white;border:1px solid #dbe0e7;border-radius:12px;padding:24px;display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:22px}.proof{display:flex;justify-content:space-evenly;align-items:center;border-radius:7px;background:#f1f3f7;height:94px}.dark{background:${ink}}.sizes{display:flex;gap:20px;justify-content:space-evenly;align-items:flex-end}.sizes>div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:9px;height:85px}.sizes span{font-size:10px;color:#5c6878}.label{margin:13px 0 0;text-align:center;font-size:12px;color:#5c6878}footer{margin-top:25px;display:flex;align-items:center;gap:24px;flex-wrap:wrap;font-size:12px;color:#5c6878}a{color:${blue};text-underline-offset:4px}a:focus-visible{outline:2px solid ${blue};outline-offset:5px}::selection{background:#cddcff;color:${ink}}footer span{margin-left:auto}@media(max-width:760px){main{padding:28px 18px}.concepts{grid-template-columns:1fr 1fr;gap:14px}.center{grid-column:1/-1;grid-row:1}.panel{padding:17px}.panel>div{height:160px}.center>div{height:210px}.proofs{grid-template-columns:1fr 1fr;padding:18px;gap:15px}.size-proof{grid-column:1/-1}h1{font-size:27px}.sizes{justify-content:space-evenly}footer span{margin-left:0}}
</style><main><h1>D + F · 前倾方印 J</h1><p class="intro">D 的前倾字形，放入 F 的圆角方印。</p><section class="concepts"><article class="panel"><h2>D · 前倾 J</h2><div>${d}</div><p>保留字形与倾斜角度</p></article><article class="panel center"><h2>D + F · 融合版</h2><div>${fusion(blue,184)}</div><p>前倾 J × 圆角方印</p></article><article class="panel"><h2>F · 方印 J</h2><div>${f}</div><p>保留方形比例与圆角</p></article></section><div class="lockup">${fusion(blue,46)}${name}</div><section class="proofs"><div><div class="proof">${fusion(ink,55)}</div><p class="label">单色</p></div><div><div class="proof dark">${fusion('#fff',55)}</div><p class="label">反白</p></div><div class="size-proof"><div class="sizes">${[16,24,32,48].map(s=>`<div>${fusion(blue,s)}<span>${s} px</span></div>`).join('')}</div><p class="label">实际小尺寸</p></div></section><footer><a href="j-df-blue.svg" download>下载蓝色 SVG</a><a href="j-df-ink.svg" download>单色</a><a href="j-df-white.svg" download>反白</a><span>当前为融合预览，网站尚未替换。</span></footer></main></html>`);
console.log(`Generated D + F vector study in ${out}`);
