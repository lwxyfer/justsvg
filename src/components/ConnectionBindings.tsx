import { Link, Unlink } from 'lucide-react';
import { engine } from '../editor/document/engine';
import {
  associateNearby,
  bindConnection,
  connectionNodes,
  detachEnd,
  nodeAttribute,
} from '../editor/document/connections';
import { decodeAnchor, type Port } from '../editor/geometry/connectors';
import { useUI } from '../store/ui';
import { run } from './shared';
import { motionOriginal, motionWrapper } from '../editor/document/motion';
import { useLocale } from '../i18n/locale';
const nodeLabel = (el: SVGGraphicsElement) =>
  el.getAttribute('data-label') ||
  el.querySelector('text')?.textContent?.trim().slice(0, 40) ||
  el.id ||
  el.localName;
export function ConnectionBindings({ line }: { line: SVGGraphicsElement }) {
  const { t } = useLocale();
  const nodes = connectionNodes(engine).filter((node) => node !== line && !node.contains(line));
  return (
    <>
      {(['start', 'end'] as const).map((end) => {
        const ref = line.getAttribute(nodeAttribute(end));
        const node = nodes.find((n) => `#${n.id}` === ref);
        const anchor = decodeAnchor(line.getAttribute(`data-sf-${end}-anchor`));
        const port = !anchor
          ? 'nearest'
          : anchor.u === 0 && anchor.v === 0.5
            ? 'left'
            : anchor.u === 1 && anchor.v === 0.5
              ? 'right'
              : anchor.u === 0.5 && anchor.v === 0
                ? 'top'
                : anchor.u === 0.5 && anchor.v === 1
                  ? 'bottom'
                  : 'nearest';
        const name = end === 'start' ? t('起点') : t('终点');
        return (
          <div key={end}>
            <label className="property-field">
              <span>{name}{t('关联节点')}</span>
              <select
                aria-label={`${name}关联节点`}
                value={node ? engine.key(node) : ref ? 'missing' : ''}
                onChange={(e) =>
                  run(() =>
                    bindConnection(
                      engine,
                      line,
                      end,
                      nodes.find((n) => engine.key(n) === e.target.value) || null,
                    ),
                  )
                }
              >
                <option value="">{t('未关联')}</option>
                {ref && !node && (
                  <option value="missing" disabled>
                    {t('目标已丢失或不支持')}
                  </option>
                )}
                {nodes.map((node) => (
                  <option key={engine.key(node)} value={engine.key(node)}>
                    {nodeLabel(node)}
                  </option>
                ))}
              </select>
            </label>
            {node && (
              <label className="property-field">
                <span>{name}{t('连接位置')}</span>
                <select
                  aria-label={`${name}连接位置`}
                  value={port}
                  onChange={(e) =>
                    run(() => bindConnection(engine, line, end, node, e.target.value as Port))
                  }
                >
                  <option value="nearest">{t('最近边界')}</option>
                  <option value="left">{t('左侧中心')}</option>
                  <option value="right">{t('右侧中心')}</option>
                  <option value="top">{t('顶部中心')}</option>
                  <option value="bottom">{t('底部中心')}</option>
                </select>
              </label>
            )}
          </div>
        );
      })}
      <p className="field-note">
        {t('关联后跟随节点移动、缩放和对齐。拖动端点会解除该端关联；单独移动连线会解除两端关联。折线保留原有走线，不自动避让其他节点。')}
      </p>
    </>
  );
}
export function NodeConnections() {
  const { t } = useLocale();
  const ids = new Set(
    engine.selection
      .map((n) => (motionWrapper(n) === n ? motionOriginal(n)!.id : n.id))
      .filter(Boolean),
  );
  const lines = [
    ...engine.root!.querySelectorAll('[data-sf-start-node],[data-sf-end-node]'),
  ].filter((line) =>
    (['start', 'end'] as const).some((end) =>
      ids.has(line.getAttribute(nodeAttribute(end))?.slice(1) || ''),
    ),
  );
  return (
    <>
      <div className="section-actions">
        <button
          className="button"
          onClick={() =>
            run(() => {
              const count = associateNearby(engine, engine.selection);
              useUI
                .getState()
                .message(
                  count
                    ? `${t('已建立')} ${count} ${t('个端点关联，可直接移动卡片。')}`
                    : t('没有找到可明确关联的新端点。可选中连线，手动指定节点。'),
                );
            })
          }
        >
          <Link size={13} />
          {t('关联相邻箭头')}
        </button>
        <button
          className="button"
          disabled={!lines.length}
          onClick={() =>
            run(() =>
              engine.transaction('解除节点关联', () => {
                for (const line of lines)
                  for (const end of ['start', 'end'] as const)
                    if (ids.has(line.getAttribute(nodeAttribute(end))?.slice(1) || ''))
                      detachEnd(line, end);
              }),
            )
          }
        >
          <Unlink size={13} />
          {t('解除关联')}
        </button>
      </div>
      <p className="field-note">
        {t('已有')} {lines.length} {t('条连线关联到所选节点。识别屏幕上距边界 14 px 内且目标明确的端点；不会自动修改导入的曲线或复杂 Path。')}
      </p>
    </>
  );
}
