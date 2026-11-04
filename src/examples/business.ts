import type { ExampleStyle, SvgExample } from './catalog';
import manifest from './business-manifest.json';
const vectors = import.meta.glob<string>('./assets/business-*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const prompts = import.meta.glob<string>('./prompts/business-*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});
export const businessStyles: ExampleStyle[] = [
  {
    id: 'business-review',
    name: '工作·清晰评审',
    summary: '完整信息 · 语义分区 · 责任与条件',
    tags: ['产品评审', '经营分析', '项目协作', '工作风格'],
    palette: ['#f5f7fb', '#edf3fd', '#edf6f2', '#315fa1'],
  },
  {
    id: 'business-report',
    name: '工作·正式汇报',
    summary: '结论前置 · 衬线编辑 · 判断与行动',
    tags: ['管理汇报', '机构简报', '经营分析', '工作风格'],
    palette: ['#faf8f3', '#fffefa', '#405f77', '#21354b'],
  },
];
export const businessExamples: SvgExample[] = manifest.map((item) => ({
  ...item,
  svg: vectors[`./assets/${item.id}.svg`],
  prompt: prompts[`./prompts/${item.id}.md`],
}));
export const exampleRoles = ['产品', '财务', '运营', '项目协作'] as const;
