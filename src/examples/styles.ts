import blueprint from './assets/blueprint.svg?raw';
import editorial from './assets/editorial.svg?raw';
import terminal from './assets/terminal.svg?raw';
import swiss from './assets/swiss.svg?raw';
import soft from './assets/soft.svg?raw';
import blueprintPrompt from './prompts/blueprint.md?raw';
import editorialPrompt from './prompts/editorial.md?raw';
import terminalPrompt from './prompts/terminal.md?raw';
import swissPrompt from './prompts/swiss.md?raw';
import softPrompt from './prompts/soft.md?raw';
import type { ExampleStyle, SvgExample } from './catalog';
import { moreStyles, moreExamples } from './more-styles';
import { featuredStyles, featuredExamples } from './featured';
const originalStyles: ExampleStyle[] = [
  {
    id: 'blueprint',
    name: '工程蓝图',
    summary: '制图线框 · 精密网格',
    tags: ['系统架构', '工程文档'],
    palette: ['#102f54', '#74d8ff', '#eef7ff'],
  },
  {
    id: 'editorial',
    name: '纸本编辑',
    summary: '衬线标题 · 暖白纸本',
    tags: ['技术文章', '研究说明'],
    palette: ['#faf7ef', '#332d27', '#a83e2b'],
  },
  {
    id: 'terminal',
    name: '终端控制台',
    summary: '等宽字体 · 墨绿终端',
    tags: ['开发者演示', '运维说明'],
    palette: ['#101b1c', '#7ee4ba', '#ddf5ec'],
  },
  {
    id: 'swiss',
    name: '瑞士信息设计',
    summary: '强网格 · 大字与色块',
    tags: ['架构演示', '信息图'],
    palette: ['#f5f3ec', '#181916', '#d72f26', '#f5d95d'],
  },
  {
    id: 'soft',
    name: '柔和产品图',
    summary: '柔和彩色 · 圆角分区',
    tags: ['产品说明', '分享演示'],
    palette: ['#e9f1fc', '#eeebfa', '#e5f3f1', '#f9eddf'],
  },
];
const vectors = [blueprint, editorial, terminal, swiss, soft],
  prompts = [blueprintPrompt, editorialPrompt, terminalPrompt, swissPrompt, softPrompt];
export const additionalStyles: ExampleStyle[] = [
  ...featuredStyles,
  ...originalStyles,
  ...moreStyles,
];
export const additionalExamples: SvgExample[] = [
  ...featuredExamples,
  ...originalStyles.map((style, i) => ({
    id: `${style.id}-rag`,
    style: style.id,
    name: 'RAG 检索增强生成架构',
    width: 1200,
    height: 800,
    svg: vectors[i],
    prompt: prompts[i],
  })),
  ...moreExamples,
];
