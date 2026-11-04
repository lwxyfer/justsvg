import { writeFileSync } from 'node:fs';
import { inspiredThemes } from './inspired-scenes/themes.mjs';
import { starwars, bikini } from './inspired-scenes/worlds.mjs';
import { goldman, morgan, jpmorgan } from './inspired-scenes/finance.mjs';
import { content, relations } from './brand-scenes/document.mjs';
const builders = { starwars, bikini, goldman, morgan, jpmorgan };
const requested = process.argv[2];
if (requested && !builders[requested]) throw new Error(`Unknown scene ${requested}`);
for (const t of inspiredThemes.filter((t) => !requested || t.key === requested)) {
  const d = builders[t.key](t);
  if (
    d.boxes.size !== 9 ||
    d.routes.length !== 8 ||
    relations.some(([a, b]) => !d.routes.some((r) => r.start === a && r.end === b))
  )
    throw new Error(`${t.key}: incomplete RAG graph`);
  let svg = d.finish().replace('data-brand-style=', 'data-inspired-style=');
  writeFileSync(`src/examples/assets/${t.id}.svg`, svg);
  writeFileSync(
    `src/examples/prompts/${t.id}.md`,
    `# ${t.name} · RAG 架构风格\n\n请输出完整、可编辑原生SVG。1600×1100，viewBox="0 0 1600 1100"。这是非官方视觉研究与演示架构，不是该品牌/作品真实系统；不虚构实验结果或投资结论。\n\n## 视觉方向\n${t.rules}\n\n配色：${t.palette.join('、')}。节点有不同尺寸、轮廓和信息角色，不能只替换通用卡片的颜色。${t.note}\n\n## 内容与几何\n${[...d.boxes].map(([key, b]) => `${key}: ${content[key].join(' / ')}；x/y/w/h=${b.x}/${b.y}/${b.w}/${b.h}`).join('\n')}\n\n## 关系及路线\n${d.routes.map((r) => `${r.start} → ${r.end}；${r.points.map((p) => p.join(',')).join(' → ')}`).join('\n')}\n\n## 编辑与安全约束\n保留9个data-node独立g和8条polyline；节点id前缀${t.id}-node-。每条连接保留data-sf-start-node/end-node以及归一化data-sf-start-anchor/end-anchor。文字保持text，标记使用内部defs/marker，markerUnits=userSpaceOnUse，箭头尖端refX=10。ID唯一、引用有效、连线不穿无关节点或文字，标签与画布不溢出。仅用安全SVG几何；不使用script、事件、foreignObject、外部URL、外部字体、位图或整图栅格化。字体本机回退；节点可独立移动，导出后可继续编辑。\n\n## 参考来源\n${t.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n')}\n`,
  );
  console.log(`${t.id}: 9 nodes / 8 bound edges`);
}
writeFileSync(
  'src/examples/inspired-manifest.json',
  JSON.stringify(
    inspiredThemes.map(({ key, id, name, summary, tags, palette, brand, note, sources }) => ({
      key,
      id,
      name,
      summary,
      tags,
      palette,
      brand: !!brand,
      note,
      sources,
    })),
    null,
    2,
  ) + '\n',
);
