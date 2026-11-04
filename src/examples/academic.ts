import svg from './assets/arxiv-rag.svg?raw';
import prompt from './prompts/arxiv-rag.md?raw';
import type { ExampleStyle, SvgExample } from './catalog';

export const academicStyles: ExampleStyle[] = [
  {
    id: 'arxiv',
    name: 'arXiv 论文配图',
    summary: '分面方法图 · 衬线数学排版 · 低饱和语义色',
    tags: ['学术论文', '科研配图', '机器学习', '方法架构', 'scientific figure'],
    palette: ['#e8f0fa', '#fbefd9', '#eee9f6', '#ffffff'],
  },
];

export const academicExamples: SvgExample[] = [
  {
    id: 'arxiv-rag',
    style: 'arxiv',
    name: 'RAG 检索增强生成架构',
    diagramType: '架构图',
    width: 1440,
    height: 900,
    svg,
    prompt,
  },
];
