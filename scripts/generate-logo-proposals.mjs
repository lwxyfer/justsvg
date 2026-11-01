import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Proposal assets only. The production identity stays pending the user's choice.
const output = fileURLToPath(new URL('../public/brand/proposals/', import.meta.url));
const blue = '#2563eb';
const ink = '#19243b';
const concepts = [
  {
    id: 'a', name: '几何 J', english: 'The signature',
    description: '用完整、厚实的 J 建立记忆点。简洁稳重，小尺寸辨识度高。',
    shape: (p, s) => `<path fill="${p}" d="M27 7h28v29c0 14-8 22-23 22C17 58 8 50 8 36h14c0 7 3 10 10 10 6 0 9-3 9-10V21H27Z"/><path fill="${s}" d="M27 7h14v14H27Z"/>`,
  },
  {
    id: 'b', name: '原生代码', english: 'Native by design',
    description: '尖括号与斜线组成紧凑符号，直接表达 SVG 原生与开发者工具。',
    shape: (p, s) => `<path d="m21 14-16 18 16 18m22-36 16 18-16 18" fill="none" stroke="${p}" stroke-width="8" stroke-linejoin="miter"/><path d="m37 17-10 30" stroke="${s}" stroke-width="7"/>`,
  },
  {
    id: 'c', name: '流程模块', english: 'Ideas, connected',
    description: '三个模块串成一条路径，强调架构图、流程图与系统之间的连接。',
    shape: (p, s) => `<path d="M22 15h7q5 0 5 5v8q0 4 5 4h3M42 32h-3q-5 0-5 5v7q0 5-5 5h-7" fill="none" stroke="${s}" stroke-width="6"/><rect x="5" y="6" width="19" height="18" rx="4" fill="${p}"/><rect x="40" y="23" width="19" height="18" rx="4" fill="${s}"/><rect x="5" y="40" width="19" height="18" rx="4" fill="${p}"/>`,
  },
  {
    id: 'd', name: '折带 S', english: 'A continuous flow',
    description: '用一条折带抽象出 S。轮廓更有动感，也呼应 SVG 的首字母。',
    shape: (p, s) => `<path fill="${p}" d="M18 5h38L44 18H20l-7 8H0Z" transform="translate(4 0)"/><path fill="${s}" d="M4 26 17 13l43 25-13 13Z"/><path fill="${p}" d="M4 59 16 46h28l7-8h13L46 59Z"/>`,
  },
  {
    id: 'e', name: '曲线工坊', english: 'Made to be edited',
    description: '贝塞尔曲线与锚点构成拱形标记，让“可编辑的矢量”成为主角。',
    shape: (p, s) => `<path d="M10 48V16h44v32" fill="none" stroke="${s}" stroke-width="2.5"/><path d="M10 48C10 5 54 5 54 48" fill="none" stroke="${p}" stroke-width="8"/><rect x="4" y="42" width="12" height="12" rx="1" fill="${s}"/><rect x="48" y="42" width="12" height="12" rx="1" fill="${s}"/><circle cx="10" cy="16" r="4" fill="${s}"/><circle cx="54" cy="16" r="4" fill="${s}"/>`,
  },
  {
    id: 'f', name: '负形 J', english: 'The compact monogram',
    description: '在实心方印中切出 J 与节点，形成更紧凑、有分量的应用图标。',
    shape: (p, s) => `<path fill="${p}" fill-rule="evenodd" d="M15 5h34q10 0 10 10v34q0 10-10 10H15Q5 59 5 49V15Q5 5 15 5Zm13 10v10h12v13q0 7-7 7t-7-7H16q0 17 17 17t17-17V15Z"/><rect x="16" y="15" width="9" height="10" fill="${s}"/>`,
  },
];
await mkdir(output, { recursive: true });
const svg = (c, mode = 'color', size = 64) => {
  const p = mode === 'inverse' ? '#fff' : mode === 'mono' ? ink : blue;
  const s = mode === 'inverse' ? '#fff' : ink;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="JustSVG · ${c.name}"><title>JustSVG · ${c.name}</title>${c.shape(p, s)}</svg>`;
};
for (const c of concepts) {
  for (const mode of ['color', 'mono', 'inverse']) {
    await writeFile(`${output}${c.id}-${mode}.svg`, svg(c, mode));
  }
}
const cards = concepts.map(c => `<article id="${c.id}">
  <header><span class="letter">${c.id.toUpperCase()}</span><h2>${c.name}</h2><span class="english">${c.english}</span></header>
  <div class="hero"><div class="big">${svg(c, 'color', 114)}</div><div class="wordmark">Just<span>SVG</span></div></div>
  <p>${c.description}</p>
  <div class="specimens"><div class="mini"><span>单色</span>${svg(c, 'mono', 30)}</div><div class="mini dark"><span>反白</span>${svg(c, 'inverse', 30)}</div><div class="sizes"><span>实际尺寸</span><div>${[16,24,32].map(n => svg(c,'color',n)).join('')}</div></div></div>
  <footer><button data-choice="${c.id}" type="button" aria-pressed="false">选择 ${c.id.toUpperCase()}</button><nav aria-label="${c.name}资源"><a href="${c.id}-color.svg" download>SVG</a><a href="${c.id}-mono.svg" download>单色</a><a href="${c.id}-inverse.svg" download>反白</a></nav></footer>
</article>`).join('');
await writeFile(`${output}index.html`, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JustSVG · Logo 方案</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f5f7;color:${ink};font-family:"Helvetica Neue","PingFang SC",sans-serif;-webkit-font-smoothing:antialiased}::selection{background:#cbdcff;color:#19243b}main{max-width:1560px;margin:auto;padding:50px 54px 32px}.intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:32px}.intro h1{font-size:36px;letter-spacing:-1.1px;margin:0 0 12px;font-weight:650}.intro p{font-size:14px;color:#5a6373;margin:0;line-height:1.6}.status{font-size:12px;color:#5a6373;text-align:right;line-height:1.8;padding-bottom:2px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}article{background:#fff;border:1px solid #dce0e6;border-radius:14px;padding:24px 24px 18px;min-width:0}article.selected{outline:3px solid ${blue};outline-offset:2px}article header{display:flex;align-items:center;gap:10px}h2{font-size:16px;font-weight:600;margin:0}.letter{font-size:12px;font-weight:700;display:grid;place-items:center;width:25px;height:25px;border:1px solid #d9dfe7;border-radius:5px}.english{font-size:11px;color:#667080;margin-left:auto}.hero{height:175px;display:flex;align-items:center;justify-content:center;gap:22px}.big{display:flex;align-items:center;justify-content:center;width:120px}.wordmark{font-size:34px;font-weight:650;letter-spacing:-1.1px;white-space:nowrap}.wordmark span{font-weight:420}article p{font-size:13px;color:#586273;line-height:1.8;margin:2px 0 22px;min-height:47px}.specimens{height:65px;display:flex;border-top:1px solid #edf0f4;padding-top:14px;gap:10px;align-items:center}.mini{height:46px;display:flex;align-items:center;justify-content:space-between;padding:8px 10px;gap:12px;background:#f1f3f6;border-radius:6px;flex:1}.mini span,.sizes>span{font-size:10px;color:#616c7c}.mini.dark{background:${ink}}.dark span{color:#d8deeb}.sizes{padding-left:8px;flex:1.2}.sizes>span{display:block;margin-bottom:2px}.sizes>div{display:flex;gap:12px;align-items:center}svg{display:block;flex-shrink:0}footer{display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:14px;border-top:1px solid #edf0f4}button{font:inherit;font-size:12px;cursor:pointer;color:${ink};background:white;border:1px solid #cbd2dd;border-radius:5px;padding:7px 15px}button:hover{border-color:${blue};color:${blue}}button[aria-pressed=true]{background:${blue};color:white;border-color:${blue}}a{font-size:11px;color:#586273;text-decoration:none;text-underline-offset:3px}a:hover{text-decoration:underline;color:${blue}}nav{display:flex;gap:13px}button:focus-visible,a:focus-visible{outline:2px solid ${blue};outline-offset:4px}.bottom{display:flex;justify-content:space-between;gap:20px;font-size:12px;color:#616c7c;margin-top:24px;line-height:1.7}.bottom strong{font-weight:550;color:${ink}}@media(max-width:1150px){main{padding:30px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.english{display:none}}@media(max-width:640px){main{padding:24px 18px}.intro{display:block}.intro h1{font-size:29px}.status{text-align:left;margin-top:12px}.grid{grid-template-columns:1fr;gap:18px}article{padding:22px}.bottom{display:block}.hero{height:170px}.wordmark{font-size:32px}}
</style></head><body><main><div class="intro"><div><h1>JustSVG 的六种新面孔</h1><p>先选轮廓，再定细节。六个方向使用同一组蓝色与墨色，比较图形本身。</p></div><div class="status">LOGO STUDY · 2026.10<br>候选方案 · 等待选择</div></div><section class="grid" aria-label="六个 Logo 候选方案">${cards}</section><div class="bottom"><span><strong id="selection" aria-live="polite">你更喜欢哪一版？</strong> 点击方案可标记偏好，再在聊天里告诉我字母。</span><span>每版均附原生 SVG · 彩色 / 单色 / 反白 · 16 / 24 / 32 px 预览</span></div></main>
<script>document.querySelectorAll('[data-choice]').forEach(button=>{button.addEventListener('click',()=>{const id=button.dataset.choice;document.querySelectorAll('article').forEach(card=>card.classList.toggle('selected',card.id===id));document.querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));document.getElementById('selection').textContent='已标记 '+id.toUpperCase()+'。';});});</script></body></html>`);
console.log(`Generated six logo directions in ${output}`);
