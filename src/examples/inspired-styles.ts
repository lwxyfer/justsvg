import starwars from './assets/starwars-rag.svg?raw';
import bikini from './assets/bikini-bottom-rag.svg?raw';
import goldman from './assets/brand-goldman-sachs-rag.svg?raw';
import morgan from './assets/brand-morgan-stanley-rag.svg?raw';
import jpmorgan from './assets/brand-jpmorgan-rag.svg?raw';
import starwarsPrompt from './prompts/starwars-rag.md?raw';
import bikiniPrompt from './prompts/bikini-bottom-rag.md?raw';
import goldmanPrompt from './prompts/brand-goldman-sachs-rag.md?raw';
import morganPrompt from './prompts/brand-morgan-stanley-rag.md?raw';
import jpmorganPrompt from './prompts/brand-jpmorgan-rag.md?raw';
import manifest from './inspired-manifest.json';
import type { ExampleStyle, SvgExample } from './catalog';
const vectors = [starwars, bikini, goldman, morgan, jpmorgan];
const prompts = [starwarsPrompt, bikiniPrompt, goldmanPrompt, morganPrompt, jpmorganPrompt];
export const inspiredStyles: ExampleStyle[] = manifest.map((entry) => ({
  id: entry.id.replace(/-rag$/, ''),
  name: entry.name,
  summary: entry.summary,
  tags: [...entry.tags, '非官方示例'],
  palette: entry.palette,
  ...(entry.brand ? { brand: { note: entry.note, sources: entry.sources } } : {}),
}));
export const inspiredExamples: SvgExample[] = manifest.map((entry, index) => ({
  id: entry.id,
  style: inspiredStyles[index].id,
  name: 'RAG 检索增强生成架构',
  diagramType: '架构图',
  width: 1600,
  height: 1100,
  svg: vectors[index],
  prompt: prompts[index],
}));
