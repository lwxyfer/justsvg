import { memo, useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Type,
  Square,
  Circle,
  Spline,
  Image,
  Eye,
  EyeOff,
  LockKeyhole,
  UnlockKeyhole,
  Search,
  Group,
  X,
} from 'lucide-react';
import { engine } from '../editor/document/engine';
import { run, useDocument } from './shared';
import { useLocale } from '../i18n/locale';
const symbols: Record<string, ReactNode> = {
  g: <Group size={14} />,
  text: <Type size={14} />,
  rect: <Square size={14} />,
  circle: <Circle size={14} />,
  ellipse: <Circle size={14} />,
  path: <Spline size={14} />,
  image: <Image size={14} />,
};
function label(el: Element) {
  return (
    el.getAttribute('data-label') ||
    el.id ||
    (el.localName === 'text' ? el.textContent?.slice(0, 36) : el.localName) ||
    el.localName
  );
}
function layerPath(el: Element) {
  const path = [label(el)];
  for (
    let parent: Element | null = el.parentElement;
    parent && parent !== engine.root;
    parent = parent.parentElement
  )
    path.unshift(label(parent));
  return path.join(' / ');
}
function LayerRow({
  el,
  depth = 0,
  search = false,
}: {
  el: SVGGraphicsElement;
  depth?: number;
  search?: boolean;
}) {
  const { t } = useLocale();
  const [baseOpen, setOpen] = useState(false),
    [renaming, setRenaming] = useState(false);
  const signature = engine.selection.map((v) => engine.key(v)).join(',');
  const [override, setOverride] = useState<{ signature: string; open: boolean } | null>(null);
  const open =
    override?.signature === signature
      ? override.open
      : baseOpen || engine.selection.some((v) => v !== el && el.contains(v));
  const row = useRef<HTMLDivElement>(null);
  const children = engine.children(el),
    selected = engine.selection.includes(el),
    hidden = getComputedStyle(el).display === 'none',
    locked = engine.locked(el);
  useEffect(() => {
    if (selected) row.current?.scrollIntoView({ block: 'nearest' });
  }, [selected, signature]);
  return (
    <>
      <div
        ref={row}
        draggable={!renaming && !locked}
        onDragStart={(e) => {
          e.dataTransfer.setData('application/x-svg-finisher-layer', engine.key(el));
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('application/x-svg-finisher-layer')) e.preventDefault();
        }}
        onDrop={(e) => {
          const key = e.dataTransfer.getData('application/x-svg-finisher-layer');
          if (!key) return;
          e.preventDefault();
          e.stopPropagation();
          const source = engine.all().find((v) => engine.key(v) === key);
          run(() => {
            if (!source || source === el) return;
            if (source.parentNode !== el.parentNode)
              throw new Error(t('仅支持同级图层排序，避免改变坐标和继承样式。'));
            if (engine.isLocked(source) || engine.isLocked(el)) throw new Error(t('请先解锁图层。'));
            const after =
              e.clientY >
              e.currentTarget.getBoundingClientRect().top + e.currentTarget.clientHeight / 2;
            engine.transaction(t('图层排序'), () => {
              if (after) el.after(source);
              else el.before(source);
            });
          });
        }}
        className={`layer-row ${selected ? 'selected' : ''} ${hidden ? 'hidden-layer' : ''}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        data-testid={`layer-${el.id || engine.key(el)}`}
      >
        <button
          className="layer-disclosure"
          aria-label={`${open ? t('折叠') : t('展开')} ${label(el)}`}
          onClick={() => {
            setOpen(!open);
            setOverride({ signature, open: !open });
          }}
          disabled={!children.length || search}
        >
          {children.length ? open ? <ChevronDown size={12} /> : <ChevronRight size={12} /> : null}
        </button>
        <button
          className="layer-select"
          title={`${layerPath(el)} · <${el.localName}>${locked ? ` · ${t('已锁定')}` : ''}`}
          onClick={(e) => {
            if (e.shiftKey)
              engine.select(
                selected ? engine.selection.filter((v) => v !== el) : [...engine.selection, el],
              );
            else engine.select([el]);
          }}
          onDoubleClick={() => setRenaming(true)}
        >
          <span className="layer-icon">{symbols[el.localName] || <Spline size={14} />}</span>
          {renaming ? (
            <input
              aria-label={t('图层名称')}
              autoFocus
              defaultValue={label(el)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') setRenaming(false);
              }}
              onBlur={(e) => {
                run(() => engine.rename(el, e.target.value));
                setRenaming(false);
              }}
            />
          ) : (
            <span className="layer-name">{label(el)}</span>
          )}
        </button>
        <div className="layer-actions">
          <button
            title={hidden ? t('显示图层') : t('隐藏图层')}
            aria-label={`${hidden ? t('显示') : t('隐藏')} ${label(el)}`}
            onClick={() => run(() => engine.hide(el))}
          >
            {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            title={locked ? t('解锁图层') : t('锁定图层')}
            aria-label={`${locked ? t('解锁') : t('锁定')} ${label(el)}`}
            onClick={() => engine.lock(el)}
          >
            {locked ? <LockKeyhole size={12} /> : <UnlockKeyhole size={12} />}
          </button>
        </div>
      </div>
      {search && (
        <div className="layer-search-path" title={layerPath(el)}>
          {layerPath(el)}
        </div>
      )}
      {open &&
        !search &&
        children.map((child) => <LayerRow key={engine.key(child)} el={child} depth={depth + 1} />)}
    </>
  );
}
export const Layers = memo(function Layers() {
  const { t } = useLocale();
  useDocument(true);
  const [query, setQuery] = useState('');
  const elements = query
    ? engine
        .all()
        .filter((el) =>
          `${label(el)} ${el.id} ${el.localName} ${el.textContent || ''}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
    : engine.children();
  return (
    <aside className="layers-panel" aria-label={t('图层面板')}>
      <div className="layer-search">
        <Search size={14} />
        <input
          placeholder={t('搜索图层…')}
          aria-label={t('搜索图层')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label={t('清除搜索')} onClick={() => setQuery('')}>
            <X size={12} />
          </button>
        )}
      </div>
      <div className="layers-document">
        <span className="document-dot" />
        {engine.name}
        <span>{engine.all().length}</span>
      </div>
      {engine.selection.length > 1 && (
        <div className="layer-batch section-actions">
          <button
            className="button"
            onClick={() =>
              run(() =>
                engine.transaction('隐藏所选图层', () => {
                  engine.selection.forEach((el) =>
                    el.style.setProperty('display', 'none', 'important'),
                  );
                }),
              )
            }
          >
            {t('隐藏所选')}
          </button>
          <button
            className="button"
            onClick={() => {
              [...engine.selection].forEach((el) => {
                if (!engine.locked(el)) engine.lock(el);
              });
            }}
          >
            {t('锁定所选')}
          </button>
          <button className="button" onClick={() => run(() => engine.group())}>
            {t('组合')}
          </button>
        </div>
      )}
      <div className="layer-list" role="list" aria-label={t('文档图层')}>
        {elements.map((el) => (
          <LayerRow key={engine.key(el)} el={el} search={!!query} />
        ))}
        {!elements.length && <p className="empty-small">{t('没有匹配的图层')}</p>}
      </div>
      <div className="panel-footnote">
        {t('Shift 多选 · 双击名称重命名')}
        <br />
        {t('锁定状态为会话设置，不随 SVG 导出')}
      </div>
    </aside>
  );
});
