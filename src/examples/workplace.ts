import type { SvgExample } from './catalog';
import manifest from './workplace-manifest.json';
const vectors = import.meta.glob<string>('./assets/work-*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const prompts = import.meta.glob<string>('./prompts/work-*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});
export const workplaceExamples: SvgExample[] = manifest.map((item) => ({
  ...item,
  svg: vectors[`./assets/${item.id}.svg`],
  prompt: prompts[`./prompts/${item.id}.md`],
}));
export const workplaceTypes = [...new Set(workplaceExamples.map((e) => e.diagramType!))];
