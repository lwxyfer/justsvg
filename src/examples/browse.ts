import { templates } from '../editor/insert/templates';
import { examples, exampleStyles, type SvgExample } from './catalog';
export type VisualFamily = 'all' | 'base' | 'brand' | 'special';
export const styleById = new Map(exampleStyles.map((style) => [style.id, style]));
export function contentKey(example: SvgExample) {
  // The authored RAG studies share a subject, not geometry or a production architecture.
  return example.id.endsWith('-rag') && example.id !== 'template-rag'
    ? 'rag-studies'
    : example.sourceId || example.id;
}
const templateCategories = new Map(templates.map((t) => [t.id, t.category]));
export function diagramType(example: SvgExample): string {
  if (example.diagramType)
    return ['系统架构', '部署架构'].includes(example.diagramType) ? '架构图' : example.diagramType;
  const key = example.sourceId || example.id;
  if (/release-flow|swimlane/.test(key)) return '泳道图';
  if (/observability|infographic|metric/.test(key)) return '信息图';
  if (/sequence/.test(key)) return '时序图';
  if (/entity|schema|database/.test(key)) return '实体关系图';
  if (/pipeline|etl|lineage/.test(key)) return '数据流图';
  if (/flow|decision|approval|ci-cd/.test(key)) return '流程图';
  if (/roadmap|timeline/.test(key)) return '路线图';
  const category = templateCategories.get(example.id);
  if (category === '工作流程') return '流程图';
  if (category === '技术信息图') return '信息图';
  if (category === '可复用组件') return '组件组合';
  return '架构图';
}
export function visualFamily(example: SvgExample): Exclude<VisualFamily, 'all'> {
  return styleById.get(example.style)?.brand
    ? 'brand'
    : example.style.startsWith('base')
      ? 'base'
      : 'special';
}
export const diagramTypes = [...new Set(examples.map(diagramType))];
export interface ContentGroup {
  key: string;
  name: string;
  type: string;
  variants: SvgExample[];
}
export function browseContents(type: string, family: VisualFamily, query: string): ContentGroup[] {
  const groups = new Map<string, ContentGroup>();
  const search = query.trim().toLocaleLowerCase();
  for (const example of examples) {
    if (type && diagramType(example) !== type) continue;
    if (family !== 'all' && visualFamily(example) !== family) continue;
    const style = styleById.get(example.style)!;
    if (
      search &&
      ![example.name, example.id, style.name, style.summary, ...style.tags]
        .join(' ')
        .toLocaleLowerCase()
        .includes(search)
    )
      continue;
    const key = contentKey(example);
    if (!groups.has(key))
      groups.set(key, {
        key,
        name: key === 'rag-studies' ? 'RAG 检索增强架构 · 风格研究' : example.name,
        type: diagramType(example),
        variants: [],
      });
    groups.get(key)!.variants.push(example);
  }
  return [...groups.values()];
}
export function preferredVariant(group: ContentGroup, selected: SvgExample) {
  return (
    group.variants.find((e) => e.id === selected.id) ||
    group.variants.find((e) => e.style === selected.style) ||
    group.variants[0]
  );
}
