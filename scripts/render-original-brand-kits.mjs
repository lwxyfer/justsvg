/* global Image, document, window, requestAnimationFrame */
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=`${root}public/brand/kits/`;
const brands=JSON.parse(await readFile(`${out}brands.json`,'utf8'));
const source=JSON.parse(await readFile(`${out}source/faithful-vectors.json`,'utf8'));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const phase=process.argv[2]||'assets';
const problems=[];
async function renderPng(page,filepath,width,height,dest){
 const s=await readFile(filepath,'utf8');
 const data=await page.evaluate(async ({s,width,height})=>{
  const img=new Image();img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(s)));await img.decode();
  const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,width,height);return c.toDataURL('image/png').split(',')[1];
 },{s,width,height});
 await writeFile(dest,Buffer.from(data,'base64'));
}
try{
if(phase==='assets'){
 const page=await browser.newPage();await page.setContent('<!doctype html><html><body></body></html>');
 for(const b of brands){
  const dir=`${out}${b.id}/`;
  for(const mode of ['ink','accent'])for(const size of [256,512,1024])await renderPng(page,`${dir}svg/mark-${mode}.svg`,size,size,`${dir}png/mark-${mode}-${size}.png`);
  for(const mode of ['white','black'])await renderPng(page,`${dir}svg/mark-${mode}.svg`,512,512,`${dir}png/mark-${mode}-512.png`);
  for(const mode of ['ink','white']){
   const s=await readFile(`${dir}svg/lockup-horizontal-${mode}.svg`,'utf8');const vb=s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);const h=Math.round(1024*Number(vb[2])/Number(vb[1]));
   await renderPng(page,`${dir}svg/lockup-horizontal-${mode}.svg`,1024,h,`${dir}png/lockup-horizontal-${mode}-1024.png`);
  }
  await renderPng(page,`${dir}svg/lockup-stacked-ink.svg`,660,630,`${dir}png/lockup-stacked-ink.png`);
  await renderPng(page,`${dir}svg/social-cover.svg`,1200,630,`${dir}png/social-cover-1200x630.png`);
  await renderPng(page,`${dir}svg/docs-cover.svg`,720,960,`${dir}png/docs-cover-720x960.png`);
  for(const size of [180,192,512,1024])await renderPng(page,`${dir}svg/app-icon-accent.svg`,size,size,`${dir}icons/app-icon-accent-${size}.png`);
  for(const mode of ['light','dark'])await renderPng(page,`${dir}svg/app-icon-${mode}.svg`,1024,1024,`${dir}icons/app-icon-${mode}-1024.png`);
  for(const size of [16,24,32,48,64,128])await renderPng(page,`${dir}svg/favicon.svg`,size,size,`${dir}icons/favicon-${size}.png`);
  const png=await readFile(`${dir}icons/favicon-32.png`);const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);await writeFile(`${dir}icons/favicon.ico`,Buffer.concat([header,png]));
  const m=source.marks.find(m=>m.id===b.id);await renderPng(page,`${dir}svg/mark-ink.svg`,m.width,m.height,`/tmp/justsvg-trace-${b.id}.png`);
  console.log(`Exported ${b.id} PNG assets and icons.`);
 }
 await page.close();
 for(const b of brands){
  const context=await browser.newContext({viewport:{width:1440,height:820},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>problems.push(`${b.id}: ${e.message}`));
  const lockup=await readFile(`${out}${b.id}/svg/lockup-horizontal-ink.svg`,'utf8');
  for(const [route,kind] of [['/','home'],['/editor','editor']]){
   await page.goto(`http://127.0.0.1:5173${route}`,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   if(kind==='home'){
    const lang=page.getByRole('button',{name:'中文',exact:true});if(await lang.count())await lang.click();
    await page.locator('.home-brand').waitFor();
   }else { await page.locator('.topbar .brand').waitFor(); const dismiss=page.getByRole('button',{name:'关闭提示',exact:true}); if(await dismiss.count())await dismiss.click(); await page.keyboard.press('Shift+1'); }
   await page.evaluate(({lockup,kind,b})=>{
    const host=document.querySelector(kind==='home'?'.home-brand':'.topbar .brand');
    const badge=host.querySelector('.version-badge')?.cloneNode(true);
    host.innerHTML=lockup;const s=host.querySelector('svg');s.setAttribute('width','148');s.setAttribute('height','34');s.style.cssText='display:block;flex-shrink:0;max-width:none;';if(badge)host.append(badge);
    // Colors change only in this ephemeral preview document.
    const override=document.createElement('style');override.textContent=`:root{--blue:${b.accent}}.home-page{--home-paper:${b.paper};--home-ink:${b.ink||'#334256'};--home-accent:${b.accent};--home-button:${b.accent};--home-on-button:#fff;--home-panel:#fff;--home-line:#dce2ea}.home-brand svg,.brand svg{overflow:visible}.home-brand svg path,.brand svg path{fill:#334256;stroke:none}`;
    document.head.append(override);
    const colorRules=[];for(const sheet of document.styleSheets){try{for(const r of sheet.cssRules){if(/#2563eb|rgb\(37, 99, 235\)/i.test(r.cssText))colorRules.push(r.cssText.replaceAll(/#2563eb/gi,b.accent).replaceAll(/rgb\(37, 99, 235\)/g,b.accent));}}catch{/* Cross-origin stylesheets are outside this local preview. */}}
    const styles=document.createElement('style');styles.textContent=colorRules.join('\n');document.head.append(styles);
    if(kind==='home')for(const node of document.querySelectorAll('svg [fill],svg [stroke]'))for(const attr of ['fill','stroke'])if(['#2563eb','#2855ee'].includes(node.getAttribute(attr)))node.setAttribute(attr,b.accent);
    window.scrollTo(0,0);
   },{lockup,kind,b});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:`${out}${b.id}/applications/${kind}.png`});
   console.log(`Captured ${b.id} actual ${kind} preview.`);
  }
  await context.close();
 }
}
if(phase==='books'||phase==='overviews'){
 for(const b of brands){
  const dir=`${out}${b.id}/`;const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
  if(phase==='books'){ await page.goto('file://'+dir+'index.html');await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({sheets:document.querySelectorAll('.sheet').length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),overflow:[...document.querySelectorAll('.sheet')].map((s,i)=>({page:i+1,scroll:s.scrollHeight,height:s.clientHeight})).filter(x=>x.scroll>x.height)}));
  console.log(b.id,state);if(state.broken.length||state.sheets!==8||state.overflow.length)throw new Error('Brand book has broken content.');
  await mkdir(`${root}output/pdf`,{recursive:true});
  await page.pdf({path:`${root}output/pdf/justsvg-${b.id}-brand-book.pdf`,width:'1280px',height:'800px',printBackground:true,preferCSSPageSize:true});
  await copyFile(`${root}output/pdf/justsvg-${b.id}-brand-book.pdf`,`${dir}brand-book.pdf`);
  for(const n of [1,2,3,4,5,6,7,8])await page.locator(`#page-${n}`).screenshot({path:`/tmp/justsvg-${b.id}-book-${n}.png`});
  }
  // A concise native-code overview, using the unchanged uploaded silhouette.
  const board=await browser.newPage({viewport:{width:1280,height:1560},deviceScaleFactor:1});await board.goto('file://'+dir+'index.html');
  const inkSvg=await readFile(`${dir}svg/mark-ink.svg`,'utf8');const horizontalSvg=await readFile(`${dir}svg/lockup-horizontal-ink.svg`,'utf8');
  await board.setContent(`<html><style>*{box-sizing:border-box}body{margin:0;color:#334256;font-family:'Helvetica Neue',sans-serif}.board{width:1280px;height:1560px;background:${b.paper};padding:70px}.top{display:flex;justify-content:space-between;font-size:22px;margin-bottom:55px}.hero{display:flex;align-items:center;justify-content:space-between;height:300px}.hero svg{width:270px;height:270px}.hero .lock svg{width:650px;height:auto}.tag{font-size:35px;margin:50px 0 35px;letter-spacing:-.5px}.palette{display:flex;gap:18px;margin-bottom:50px}.palette i{width:116px;height:55px;border-radius:5px}.proofs{display:flex;gap:24px;align-items:center;margin-bottom:55px}.proofs img{width:96px;height:96px}.shot{width:1140px;height:649px;object-fit:cover;border:1px solid #dce2ea;border-radius:8px;display:block}</style><div class="board"><div class="top"><b>JustSVG / ${b.letter}</b><span>${b.name}品牌方案</span></div><div class="hero">${inkSvg}<div class="lock">${horizontalSvg}</div></div><div class="tag">Just diagrams. Just SVG.</div><div class="palette">${['#334256',b.accent,b.soft,'#fff'].map(c=>`<i style="background:${c}"></i>`).join('')}</div><div class="proofs">${['light','accent','dark'].map(mode=>`<img src="file://${dir}svg/app-icon-${mode}.svg">`).join('')}<span style="font-size:20px;margin-left:25px;line-height:1.7">Original logo<br>Complete brand system</span></div><img class="shot" src="file://${dir}applications/home.png"></div></html>`);
  await board.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));window.scrollTo(0,0)});await board.screenshot({path:`${dir}applications/brand-overview.png`});
  await board.close();
  await page.close();
 }
 const index=await browser.newPage({viewport:{width:1456,height:1400}});await index.goto('file://'+out+'index.html');await index.evaluate(()=>document.fonts.ready);await index.screenshot({path:out+'comparison.png',fullPage:true});await index.close();
}
console.log('Browser page errors:',problems);
}finally{await browser.close()}
