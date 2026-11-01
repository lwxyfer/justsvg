import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import type { InsertAsset } from '../editor/insert/catalog';
import type { AssetGroup } from '../editor/insert/groups';
import { insertAsset, openTemplate } from '../editor/insert/actions';
import { run } from './shared';
import { useLocale } from '../i18n/locale';

function AssetTiles({ assets }: { assets: InsertAsset[] }) {
  const { t } = useLocale();
  if (assets[0]?.kind === 'template')
    return (
      <div className="template-grid">
        {assets.map((asset) => (
          <article className="template-card" key={asset.id}>
            <button
              className="template-preview"
              aria-label={`${t('插入')} ${t(asset.label)}`}
              title={`${t('插入')} ${t(asset.label)} · ${t('点击或拖入画布')}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-svg-finisher-asset', asset.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => run(() => insertAsset(asset.id))}
            >
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: asset.svg }} />
              <strong>{t(asset.label)}</strong>
            </button>
            <p>{asset.description ? t(asset.description) : null}</p>
            <button
              className="template-start"
              aria-label={`${t('使用')}${t(asset.label)}${t('新建图稿')}`}
              onClick={() => run(() => openTemplate(asset.id))}
            >
              {t('作为新图稿')} <ChevronRight size={12} />
            </button>
          </article>
        ))}
      </div>
    );
  return (
    <div className="asset-grid">
      {assets.map((asset) => (
        <button
          key={asset.id}
          className="asset-tile"
          title={`${t('插入')} ${t(asset.label)} · ${asset.keywords.split(' ')[0]} · ${t('点击或拖入画布')}`}
          aria-label={`${t('插入')} ${t(asset.label)}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/x-svg-finisher-asset', asset.id);
            e.dataTransfer.effectAllowed = 'copy';
          }}
          onClick={() => run(() => insertAsset(asset.id))}
        >
          <span dangerouslySetInnerHTML={{ __html: asset.svg }} />
          <span>{t(asset.label)}</span>
        </button>
      ))}
    </div>
  );
}
function Pagination({
  page,
  count,
  onPage,
}: {
  page: number;
  count: number;
  onPage: (page: number) => void;
}) {
  const { t } = useLocale();
  return (
    count > 1 && (
      <div className="asset-pagination" aria-label={t('素材分页')}>
        <button
          className="icon-button"
          aria-label={t('上一页素材')}
          disabled={!page}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={15} />
        </button>
        <span>
          {t('第')} {page + 1} / {count} {t('页')}
        </span>
        <button
          className="icon-button"
          aria-label={t('下一页素材')}
          disabled={page === count - 1}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    )
  );
}
export function AssetGallery({
  groups,
  filtered,
  query,
  loading,
  loadError,
  onRetry,
}: {
  groups: AssetGroup[];
  filtered: InsertAsset[];
  query: string;
  loading: boolean;
  loadError: string;
  onRetry: () => void;
}) {
  const { t } = useLocale();
  const [active, setActive] = useState('common'),
    [pages, setPages] = useState<Record<string, number>>({}),
    [searchPage, setSearchPage] = useState({ query: '', page: 0 });
  const scroller = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLButtonElement>(null);
  const id = useId(),
    searching = !!query.trim(),
    searchSize = groups[0]?.assets[0]?.kind === 'template' ? 6 : 60;
  const currentSearchPage =
    searchPage.query === query
      ? Math.min(searchPage.page, Math.max(0, Math.ceil(filtered.length / searchSize) - 1))
      : 0;
  const activePage = pages[active] || 0;
  useLayoutEffect(() => {
    const top =
      !searching && heading.current && scroller.current
        ? heading.current.getBoundingClientRect().top -
          scroller.current.getBoundingClientRect().top +
          scroller.current.scrollTop
        : 0;
    scroller.current?.scrollTo({ top });
  }, [active, activePage, currentSearchPage, query, searching]);
  const content = (assets: InsertAsset[]) =>
    loading ? (
      <div className="asset-loading">
        {loadError ? (
          <>
            <p role="alert">{loadError}</p>
            <button className="button" onClick={onRetry}>
              {t('重新加载图标')}
            </button>
          </>
        ) : (
          <p role="status">{t('正在加载图标库…')}</p>
        )}
      </div>
    ) : assets.length ? (
      <AssetTiles assets={assets} />
    ) : (
      <p className="empty-small">
        {searching ? t('没有匹配的素材，试试其他关键词。') : t('还没有最近使用的图标。')}
      </p>
    );
  return (
    <div className="asset-browser" ref={scroller}>
      {searching ? (
        <section aria-label={t('搜索结果')}>
          {content(
            filtered.slice(currentSearchPage * searchSize, (currentSearchPage + 1) * searchSize),
          )}
          <Pagination
            page={currentSearchPage}
            count={Math.ceil(filtered.length / searchSize)}
            onPage={(page) => setSearchPage({ query, page })}
          />
        </section>
      ) : (
        groups.map((group, index) => {
          const open = active === group.id,
            count = Math.max(1, Math.ceil(group.assets.length / group.pageSize)),
            page = Math.min(pages[group.id] || 0, count - 1);
          return (
            <section className="asset-group" key={group.id}>
              <h3>
                <button
                  className="asset-group-heading"
                  ref={open ? heading : undefined}
                  aria-label={`${t(group.label)}${t('分类')}`}
                  aria-expanded={open}
                  aria-controls={`${id}-${index}`}
                  onKeyDown={(e) => {
                    if (
                      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                        e.key,
                      )
                    )
                      return;
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.key === 'ArrowLeft') {
                      setActive('');
                      return;
                    }
                    if (e.key === 'ArrowRight') {
                      setActive(group.id);
                      return;
                    }
                    const buttons = [
                      ...(scroller.current?.querySelectorAll<HTMLButtonElement>(
                        '.asset-group-heading',
                      ) || []),
                    ];
                    const next =
                      e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? buttons.length - 1
                          : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) %
                            buttons.length;
                    buttons[next]?.focus();
                  }}
                  onClick={() => setActive(open ? '' : group.id)}
                >
                  {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  {group.id === 'common' && <Star size={12} className="common-star" />}
                  <span>{t(group.label)}</span>
                  <small>{group.assets.length.toLocaleString()}</small>
                </button>
              </h3>
              {open && (
                <div id={`${id}-${index}`} role="region" aria-label={t(group.label)}>
                  {content(group.assets.slice(page * group.pageSize, (page + 1) * group.pageSize))}
                  <Pagination
                    page={page}
                    count={count}
                    onPage={(value) => setPages({ ...pages, [group.id]: value })}
                  />
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
