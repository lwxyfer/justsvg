import { writeFileSync } from 'node:fs';
import { brandThemes } from './brand-style-themes.mjs';
import { content, relations } from './brand-scenes/document.mjs';
const selected = process.argv[2];
if (selected && !brandThemes[selected]) throw new Error(`Unknown brand ${selected}`);
for (const key of selected ? [selected] : Object.keys(brandThemes)) {
  const t = brandThemes[key],
    build = (await import(`./brand-scenes/${key}.mjs`)).default,
    d = build(t),
    id = `brand-${key}-rag`;
  if (d.boxes.size !== 9 || d.routes.length !== 8) throw new Error(`${key}: incomplete content`);
  for (const [start, end] of relations)
    if (!d.routes.some((r) => r.start === start && r.end === end))
      throw new Error(`${key}: missing ${start}→${end}`);
  writeFileSync(`src/examples/assets/${id}.svg`, d.finish());
  const prompt = `# ${t.name} 品牌视觉研究 · RAG 架构\n\n非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。\n\n## 具体视觉方向\n${t.rules}\n\n细部规范：${t.refinement} 箭头使用markerUnits="userSpaceOnUse"，尺寸${t.arrowSize}px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。\n\n${t.evidence}\n${t.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n')}\n\n## 内容与独立构图\n画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。\n${[...d.boxes].map(([key, b]) => `${key}: ${content[key].join(' / ')} | x/y/w/h=${b.x},${b.y},${b.w},${b.h}`).join('\n')}\n\n关系与专用路线：\n${d.routes.map((r) => `${r.start} → ${r.end} | ${r.points.map((p) => p.join(',')).join(' → ')}`).join('\n')}\n\n节点ID前缀${id}-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。\n`;
  writeFileSync(`src/examples/prompts/${id}.md`, prompt);
  console.log(`${key}: independent composition / 9 nodes / 8 edges`);
}
writeFileSync(
  'src/examples/brand-manifest.json',
  JSON.stringify(
    Object.entries(brandThemes).map(([id, t]) => ({ id, ...t })),
    null,
    2,
  ) + '\n',
);
