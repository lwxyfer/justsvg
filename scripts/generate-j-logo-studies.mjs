import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Proposal assets only; keep the live identity until a J direction is selected.
const root = fileURLToPath(new URL('../', import.meta.url));
const out = `${root}public/brand/proposals-j/`;
const { wordmark } = JSON.parse(await readFile(`${root}public/brand/kits/source/faithful-vectors.json`, 'utf8'));
const blue = '#2855ee', ink = '#334256';
const geometric = 'M21 7H54V37C54 50 45 58 32 58C18 58 9 50 9 37H22C22 43 25 46 32 46S41 43 41 37V20H21Z';
const concepts = [
  { id: 'a', name: '直切 J', note: '平直顶横与饱满下弯，轮廓厚实、稳定。', shape: `<path d="${geometric}"/>` },
  { id: 'b', name: '圆头 J', note: '一笔弯钩，统一粗细和圆头，轻松直接。', shape: '<path d="M44 11V37C44 46 39 52 30 52S16 46 16 38" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/>' },
  { id: 'c', name: '小写 j', note: '圆点与短钩，接近日常字形，气质更亲和。', shape: '<circle cx="42" cy="10" r="6"/><path d="M42 26V41C42 49 38 54 30 54H23" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>' },
  { id: 'd', name: '前倾 J', note: '顶横与下弯一起前倾，字形更有动势。', shape: `<path d="${geometric}" transform="matrix(1 0 -.18 1 5 0)"/>` },
  { id: 'e', name: '方折 J', note: '全部由直角构成，简练、坚实，偏工具气质。', shape: '<path d="M40 7H54V57H10V36H24V43H40Z"/>' },
  { id: 'f', name: '方印 J', note: '把 J 留在负形中，形成紧凑的应用图标。', shape: '<path fill-rule="evenodd" d="M17 5H47Q59 5 59 17V47Q59 59 47 59H17Q5 59 5 47V17Q5 5 17 5ZM26 15H47V36C47 47 41 52 31 52C21 52 15 46 15 37H25C25 41 27 43 31 43S37 41 37 36V24H26Z"/>' },
];
function mark(c, color = blue, size = 64) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" color="${color}" fill="currentColor" role="img" aria-label="JustSVG ${c.name}"><title>JustSVG ${c.name}</title>${c.shape}</svg>`;
}
function nameSvg(height = 20) {
  const [x, y, w, h] = wordmark.bounds;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${height * w / h}" height="${height}" viewBox="${x} ${y} ${w} ${h}" fill="${ink}" aria-label="JustSVG"><path d="${wordmark.path}"/></svg>`;
}
await mkdir(out, { recursive: true });
for (const c of concepts) for (const [mode, color] of [['blue', blue], ['ink', ink], ['white', '#fff']]) {
  await writeFile(`${out}${c.id}-${mode}.svg`, mark(c, color));
}
const cards = concepts.map(c=>`<article><header><b>${c.id.toUpperCase()}</b><h2>${c.name}</h2></header><div class="hero">${mark(c, blue, 118)}</div><div class="lockup">${mark(c, blue, 30)}${nameSvg(19)}</div><p>${c.note}</p><div class="proofs"><div class="proof mono">${mark(c, ink, 32)}</div><div class="proof inverse">${mark(c, '#fff', 32)}</div><div class="sizes">${[16,24,32].map(s=>`<div>${mark(c, blue, s)}<span>${s}</span></div>`).join('')}</div></div><footer><a href="${c.id}-blue.svg" download>蓝色 SVG</a><a href="${c.id}-ink.svg" download>单色</a><a href="${c.id}-white.svg" download>反白</a></footer></article>`).join('');
await writeFile(`${out}index.html`, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JustSVG · J 字标志方案</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:${ink};font-family:"Helvetica Neue","PingFang SC",sans-serif;-webkit-font-smoothing:antialiased}main{max-width:1440px;margin:auto;padding:40px 44px 26px}h1{font-size:31px;font-weight:600;letter-spacing:-.025em;margin:0 0 12px}.intro{margin-bottom:28px}.intro p{font-size:14px;color:#5c6878;line-height:1.8;margin:0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}article{padding:20px 24px;background:white;border:1px solid #dbe0e7;border-radius:12px;min-width:0}header{display:flex;align-items:center;gap:10px}header b{font-size:12px;font-weight:600;border:1px solid #d4dbe5;padding:4px 7px;border-radius:4px}h2{font-size:16px;font-weight:600;margin:0}.hero{height:158px;display:flex;align-items:center;justify-content:center}.lockup{display:flex;justify-content:center;align-items:center;gap:9px;height:35px}svg{display:block;flex-shrink:0}article p{font-size:12px;color:#5c6878;line-height:1.8;margin:15px 0 20px;min-height:22px}.proofs{display:flex;gap:10px;border-top:1px solid #e6eaf0;padding-top:14px;align-items:center}.proof{width:64px;height:49px;border-radius:6px;display:flex;align-items:center;justify-content:center}.mono{background:#f1f3f6}.inverse{background:${ink}}.sizes{display:flex;justify-content:space-evenly;align-items:flex-end;flex:1;gap:10px}.sizes>div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px;height:49px}.sizes span{font-size:9px;color:#5c6878}footer{display:flex;gap:18px;margin-top:16px;padding-top:12px;border-top:1px solid #e6eaf0}a{font-size:11px;color:#5c6878;text-decoration:none;text-underline-offset:4px}a:hover{color:${blue};text-decoration:underline}a:focus-visible{outline:2px solid ${blue};outline-offset:5px}::selection{background:#d9e5ff;color:${ink}}.note{font-size:12px;color:#5c6878;margin:22px 0 0;line-height:1.8}@media(max-width:1050px){main{padding:30px 24px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){main{padding:26px 18px}.grid{grid-template-columns:1fr}h1{font-size:27px}article{padding:22px}.hero{height:165px}}
</style><main><div class="intro"><h1>JustSVG · 六种 J</h1><p>以字形为主角。统一使用主题蓝色，比较轮廓、粗细和性格。</p></div><section class="grid" aria-label="六个字母 J 标志方案">${cards}</section><p class="note">原生 SVG · 单色 / 反白 · 实际 16 / 24 / 32 px 预览。<br>回复 A–F 选择方向，选定后再替换网站。</p></main></html>`);
console.log(`Generated six J studies in ${out}`);
