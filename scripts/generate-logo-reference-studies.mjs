import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Native-vector proposals based on the user's two supplied visual references.
// No production identity is replaced before a direction is selected.
const output = fileURLToPath(new URL('../public/brand/proposals-v5/', import.meta.url));
const ink = '#334155';
const diamond = '<path d="M30.2 7.7Q32 6.8 33.8 7.7L55.2 18.4Q58.4 20 55.2 21.6L33.8 32.3Q32 33.2 30.2 32.3L8.8 21.6Q5.6 20 8.8 18.4Z"/>';
const concepts = [
  { id: 'a', name: '叠放', description: '把层级关系变成两张叠放的画布，保留完整前景与开放后景。',
    shape: '<rect x="7" y="7" width="38" height="38" rx="5"/><path d="M19 54q0 3 5 3h28q5 0 5-5V24q0-5-3-5"/>' },
  { id: 'b', name: '模块', description: '一个主区域，两个小模块。用纵向排列形成紧凑的工作台。',
    shape: '<rect x="7" y="7" width="19" height="50" rx="4.5"/><rect x="38" y="7" width="19" height="19" rx="4.5"/><rect x="38" y="38" width="19" height="19" rx="4.5"/>' },
  { id: 'c', name: '叠构', description: '上方是图层，下方是模块。结合两张参考的图形语言。',
    shape: `${diamond}<rect x="7" y="41" width="19" height="16" rx="4"/><rect x="38" y="41" width="19" height="16" rx="4"/>` },
];
function svg(c, color = ink, size = 64) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" fill="none" color="${color}" role="img" aria-label="JustSVG ${c.name}"><title>JustSVG ${c.name}</title><g stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">${c.shape}</g></svg>`;
}
await mkdir(output, { recursive: true });
for (const c of concepts) {
  for (const [mode, color] of [['ink', ink], ['blue', '#2563eb'], ['inverse', '#fff']]) {
    await writeFile(`${output}${c.id}-${mode}.svg`, svg(c, color));
  }
}
const cards = concepts.map(c => `<article id="${c.id}"><header><b>${c.id.toUpperCase()}</b><h2>${c.name}</h2></header>
<div class="mark">${svg(c, ink, 160)}</div>
<div class="lockup">${svg(c, ink, 28)}<span>JustSVG</span></div>
<p>${c.description}</p>
<div class="proofs"><div class="inverse">${svg(c, '#fff', 40)}</div><div class="blue">${svg(c, '#2563eb', 40)}</div><div class="sizes">${[16,24,32].map(n=>`<div>${svg(c, ink, n)}<span>${n}</span></div>`).join('')}</div></div>
<footer><a href="${c.id}-ink.svg" download>深色 SVG</a><a href="${c.id}-blue.svg" download>蓝色 SVG</a><a href="${c.id}-inverse.svg" download>反白 SVG</a></footer></article>`).join('');
await writeFile(`${output}index.html`, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JustSVG · 参考方向</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:${ink};font-family:"Helvetica Neue","PingFang SC",sans-serif;-webkit-font-smoothing:antialiased}main{max-width:1440px;margin:auto;padding:44px 48px 30px}h1{font-size:30px;letter-spacing:-.025em;margin:0 0 12px;font-weight:600}.intro{margin-bottom:32px}.intro p{margin:0;font-size:14px;line-height:1.8;color:#5c6878}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}article{background:white;border:1px solid #dbe0e7;border-radius:14px;padding:24px;min-width:0}article header{display:flex;gap:12px;align-items:center}header b{font-size:13px;font-weight:500;border:1px solid #d4dbe5;border-radius:5px;padding:4px 8px}h2{font-size:17px;font-weight:600;margin:0}.mark{height:242px;display:flex;align-items:center;justify-content:center}.lockup{display:flex;justify-content:center;align-items:center;gap:11px}.lockup span{font-size:25px;letter-spacing:-.025em;font-weight:600}svg{display:block;flex-shrink:0}article p{margin:25px 0 26px;font-size:13px;line-height:1.8;color:#5c6878;min-height:47px}.proofs{display:flex;align-items:center;gap:10px;border-top:1px solid #e6eaf0;padding-top:18px}.inverse,.blue{height:62px;width:62px;display:flex;align-items:center;justify-content:center;border-radius:7px}.inverse{background:${ink}}.blue{background:#edf3ff}.sizes{display:flex;align-items:start;justify-content:space-around;flex:1;gap:9px;padding-left:7px}.sizes>div{height:63px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px}.sizes span{font-size:10px;color:#5c6878}footer{display:flex;justify-content:space-between;margin-top:20px;padding-top:17px;border-top:1px solid #e6eaf0}a{font-size:11px;color:#5c6878;text-underline-offset:4px;text-decoration:none}a:hover{text-decoration:underline;color:${ink}}a:focus-visible{outline:2px solid #2563eb;outline-offset:5px}::selection{background:#d7e2f0;color:${ink}}.note{font-size:12px;color:#5c6878;line-height:1.8;margin:23px 0 0}@media(max-width:1050px){main{padding:30px 24px}.grid{gap:15px}article{padding:19px}.proofs{gap:6px}.inverse,.blue{width:48px;height:56px}.sizes{padding-left:0;gap:6px}}@media(max-width:800px){.grid{grid-template-columns:1fr}main{padding:28px 18px}article{padding:24px}.mark{height:220px}article p{min-height:0}.proofs{gap:12px}.inverse,.blue{width:62px;height:62px}h1{font-size:26px}}
</style><main><div class="intro"><h1>JustSVG · 从这两个参考出发</h1><p>粗线条 / 圆角 / 清楚留白。三版使用同一套线宽与颜色，先比较图形。</p></div><section class="grid" aria-label="三个参考方向">${cards}</section><p class="note">原生 SVG · 深色 / 蓝色 / 反白 · 实际 16 / 24 / 32 px 预览。<br>A 将层级转为画布叠放；B 将分区转为纵向模块；C 尝试层与块结合。当前应用标志尚未替换。</p></main></html>`);
console.log(`Generated three vector studies in ${output}`);
