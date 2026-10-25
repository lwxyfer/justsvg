import { engine } from '../document/engine';
import { useUI } from '../../store/ui';
import { assetById, assetSource } from './catalog';
import type { Point } from '../geometry/geometry';
import { sanitizeSvg, needsImportReview } from '../security/sanitize';
import { importDocument } from '../../app/actions';
export function insertionPoint(client?: Point): Point {
  const canvas = document.querySelector('[data-canvas]')!.getBoundingClientRect();
  const point = client || { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 };
  const matrix = engine.root?.getScreenCTM();
  if (!matrix) throw new Error('文档尚未就绪。');
  return new DOMPoint(point.x, point.y).matrixTransform(matrix.inverse());
}
export function insertAsset(id: string, client?: Point) {
  const asset = assetById(id);
  if (!asset) throw new Error('素材不存在。');
  engine.insertSvg(assetSource(asset), insertionPoint(client), {
    label: asset.label,
    width: asset.width,
    height: asset.height,
    icon: id.startsWith('icon-'),
    flatten: !id.startsWith('icon-'),
  });
  const ui = useUI.getState();
  ui.set({
    aspectLocked: id.startsWith('icon-') || asset.kind === 'template',
    recentIcons: id.startsWith('icon-')
      ? [id, ...ui.recentIcons.filter((v) => v !== id)].slice(0, 12)
      : ui.recentIcons,
  });
  ui.message(`已插入${asset.label}，可以直接编辑。`);
}
export function openTemplate(id: string) {
  const asset = assetById(id);
  if (asset?.kind !== 'template') throw new Error('组合图不存在。');
  if (importDocument(assetSource(asset), `${asset.label}.svg`))
    useUI.getState().message(`已从${asset.label}开始，双击节点或文字继续编辑。`);
}
export function insertCustom(source: string, label = '自定义 SVG 图标', confirmed = false) {
  const safe = sanitizeSvg(source);
  if (!confirmed && needsImportReview(safe.warnings)) {
    useUI.getState().set({
      pendingImport: { xml: source, name: label, warnings: safe.warnings, kind: 'icon' },
    });
    return;
  }
  engine.insertSvg(source, insertionPoint(), { label, width: 48, height: 48, icon: true });
  useUI.getState().set({ aspectLocked: true });
}
