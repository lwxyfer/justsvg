import factory from './assets/factory.svg?raw';
import factoryPrompt from './prompts/factory.md?raw';
import type { ExampleStyle, SvgExample } from './catalog';
export const featuredStyles: ExampleStyle[] = [
  {
    id: 'factory',
    name: '等距知识工厂',
    summary: '立体设备 · 机械加工隐喻',
    tags: ['空间架构', '技术插图'],
    palette: ['#edf4fa', '#80b5ed', '#f6b96f', '#9fceb1'],
    featured: true,
  },
];
const vectors = [factory],
  prompts = [factoryPrompt];
export const featuredExamples: SvgExample[] = featuredStyles.map((s, i) => ({
  id: `${s.id}-rag`,
  style: s.id,
  name: 'RAG 检索增强生成架构',
  width: 1200,
  height: 800,
  svg: vectors[i],
  prompt: prompts[i],
}));
