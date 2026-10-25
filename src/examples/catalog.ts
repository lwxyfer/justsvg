import { templates } from '../editor/insert/templates';
import { additionalStyles, additionalExamples } from './styles';
import { baseVariationStyles, baseVariationExamples } from './base-variations';
import { referenceExamples } from './reference-examples';
import { brandStyles, brandExamples } from './brand-styles';
export interface ExampleStyle {
  brand?: { note: string; sources: { title: string; url: string }[] };
  featured?: boolean;
  id: string;
  name: string;
  summary: string;
  tags: string[];
  palette: string[];
}
export interface SvgExample {
  sourceId?: string;
  id: string;
  style: string;
  name: string;
  svg: string;
  prompt: string;
  width: number;
  height: number;
}
export const exampleStyles: ExampleStyle[] = [
  ...additionalStyles.filter((s) => s.featured),
  {
    id: 'base',
    featured: true,
    name: '基础风格',
    summary: '清晰分组 · 技术文档',
    tags: ['常规架构', '流程图', '信息图'],
    palette: ['#2563eb', '#ecfdf5', '#f5f3ff', '#ffffff'],
  },
  ...baseVariationStyles,
  ...brandStyles,
  ...additionalStyles.filter((s) => !s.featured),
];
export const examples: SvgExample[] = [
  ...baseVariationExamples.filter((e) => e.style === 'base'),
  ...templates.map((t) => ({
    id: t.id,
    style: 'base',
    name: t.label,
    svg: t.svg,
    width: t.width,
    height: t.height,
    prompt: `请生成一张「${t.label}」的完整、可编辑 SVG。\n\n主题：${t.description}\n\n风格：浅色技术文档，白色底，蓝/绿/紫的浅填充语义分区，1.4px 细边框、8px 圆角，系统无衬线字体。标题、正文和辅助文字层次清晰，连接线为直线或正交折线，箭头使用内部 marker。节点保留命名 <g> 分组，文字不转路径。\n\n画布：${t.width} × ${t.height}，保留 viewBox，节点间留出连线与标签空间，所有文字均在边界内。不得使用脚本、foreignObject、外部字体或图片。只输出 SVG XML。\n\n以下是此示例的原始结构参考。可替换内容，并保留其视觉语言与编辑结构：\n\n${t.svg}`,
  })),
  ...referenceExamples,
  ...brandExamples,
  ...baseVariationExamples.filter((e) => e.style !== 'base'),
  ...additionalExamples,
];
export const exampleById = (id: string) => examples.find((e) => e.id === id);
