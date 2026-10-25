import index from '../../assets/icon-index.json';
import license from '../../assets/lucide-license.txt?raw';
import { shapes } from './shapes';
import { templates } from './templates';
export interface InsertAsset {
  id: string;
  label: string;
  category: string;
  keywords: string;
  svg: string;
  width: number;
  height: number;
  featured?: boolean;
  kind?: 'template';
  description?: string;
}
export { shapes, templates };
// Search metadata is small enough to keep ready; vector data is loaded only on opening Icons.
export const iconAssets: InsertAsset[] = index.map((asset) => ({ ...asset, svg: '' }));
export const assets = [...shapes, ...iconAssets, ...templates];
const byId = new Map(assets.map((asset) => [asset.id, asset]));
let loaded = false;
let loading: Promise<void> | undefined;
export const isIconLibraryReady = () => loaded;
export function loadIconLibrary(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = import('../../assets/icons.json')
      .then(({ default: vectors }) => {
        for (const vector of vectors) {
          const target = byId.get(vector.id);
          if (target) target.svg = vector.svg;
        }
        loaded = true;
      })
      .catch((error: unknown) => {
        loading = undefined;
        throw error;
      });
  }
  return loading;
}
export const assetById = (id: string) => byId.get(id);
const escapedLicense = license
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');
/** Exported icons carry the full license; gallery previews share a single bundled license. */
export function assetSource(asset: InsertAsset) {
  if (!asset.svg) throw new Error('图标库尚未加载，请在图标面板加载完成后重试。');
  return asset.id.startsWith('icon-')
    ? asset.svg.replace('</svg>', `<desc>Lucide Icons\n${escapedLicense}</desc></svg>`)
    : asset.svg;
}
export function matchesAsset(asset: InsertAsset, query: string) {
  const normalized = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, '');
  const haystack = normalized(`${asset.label} ${asset.keywords} ${asset.category}`);
  return query
    .trim()
    .split(/\s+/)
    .every((word) => haystack.includes(normalized(word)));
}
