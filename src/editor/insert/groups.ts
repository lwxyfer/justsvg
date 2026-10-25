import { shapes, iconAssets, templates, type InsertAsset } from './catalog';
export interface AssetGroup {
  id: string;
  label: string;
  assets: InsertAsset[];
  pageSize: number;
}
const commonShapeIds = [
  'rectangle',
  'rounded',
  'circle',
  'diamond',
  'text',
  'line',
  'arrow',
  'ellipse',
  'triangle',
  'elbow',
  'terminator',
  'database',
];
export const commonShapes = commonShapeIds.map((id) =>
  shapes.find((asset) => asset.id === `shape-${id}`)!,
);
export type AssetTab = 'shapes' | 'icons' | 'templates';
const commonTemplates = ['three-tier', 'rag', 'approval', 'roadmap'].map((slug) =>
  templates.find((asset) => asset.id === `template-${slug}`)!,
);
export function assetGroups(type: AssetTab, recent: string[] = []): AssetGroup[] {
  const assets = type === 'shapes' ? shapes : type === 'templates' ? templates : iconAssets;
  const noun = type === 'shapes' ? '图形' : type === 'templates' ? '组合图' : '图标';
  const groups: AssetGroup[] = [
    {
      id: 'common',
      label: `常用${noun}`,
      assets:
        type === 'shapes'
          ? commonShapes
          : type === 'templates'
            ? commonTemplates
            : iconAssets.filter((asset) => asset.featured),
      pageSize: type === 'templates' ? 4 : 12,
    },
  ];
  if (type === 'icons') {
    const byId = new Map(iconAssets.map((asset) => [asset.id, asset]));
    groups.push({
      id: 'recent',
      label: '最近使用',
      assets: [...new Set(recent)].flatMap((id) => byId.get(id) || []),
      pageSize: 12,
    });
  }
  for (const category of new Set(assets.map((asset) => asset.category)))
    groups.push({
      id: `category-${category}`,
      label: category,
      assets: assets.filter((asset) => asset.category === category),
      pageSize: type === 'templates' ? 6 : 60,
    });
  groups.push({
    id: 'all',
    label: `全部${noun}`,
    assets,
    pageSize: type === 'templates' ? 6 : 60,
  });
  return groups;
}
