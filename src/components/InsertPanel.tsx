import { useEffect, useRef, useState } from 'react';
import { Search, Upload, ClipboardPaste } from 'lucide-react';
import {
  shapes,
  templates,
  iconAssets,
  loadIconLibrary,
  isIconLibraryReady,
  matchesAsset,
} from '../editor/insert/catalog';
import { insertCustom } from '../editor/insert/actions';
import { useUI } from '../store/ui';
import { assetGroups, type AssetTab } from '../editor/insert/groups';
import { AssetGallery } from './AssetGallery';
export function InsertPanel() {
  const ui = useUI(),
    [tab, setTab] = useState<AssetTab>('shapes'),
    [query, setQuery] = useState(''),
    [ready, setReady] = useState(isIconLibraryReady),
    [loadError, setLoadError] = useState(''),
    [retry, setRetry] = useState(0),
    [custom, setCustom] = useState(''),
    [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (tab !== 'icons') return;
    let alive = true;
    void loadIconLibrary()
      .then(() => {
        if (alive) setReady(true);
      })
      .catch(() => {
        if (alive) setLoadError('图标库加载失败，请重试。素材随应用提供，不需要外部图标服务。');
      });
    return () => {
      alive = false;
    };
  }, [tab, retry]);
  const options = tab === 'shapes' ? shapes : tab === 'templates' ? templates : iconAssets;
  const groups = assetGroups(tab, ui.recentIcons);
  const filtered = options.filter((asset) => matchesAsset(asset, query));
  const loading = tab === 'icons' && !ready;
  const applyCustom = () => {
    try {
      insertCustom(custom);
      setCustom('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <aside className="insert-panel" aria-label="插入面板">
      <div className="insert-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'shapes'}
          onClick={() => {
            setTab('shapes');
            setQuery('');
          }}
        >
          常见图形
        </button>
        <button
          role="tab"
          aria-selected={tab === 'icons'}
          onClick={() => {
            setTab('icons');
            setQuery('');
          }}
        >
          Icon 图标
        </button>
        <button
          role="tab"
          aria-selected={tab === 'templates'}
          onClick={() => {
            setTab('templates');
            setQuery('');
          }}
        >
          组合图
        </button>
      </div>
      <div className="insert-search">
        <Search size={14} />
        <input
          aria-label="搜索素材"
          placeholder="搜索名称或关键词…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <div className="asset-results" role="status" aria-live="polite">
        {query.trim() ? `${filtered.length} 个匹配 · ` : ''}共 {options.length.toLocaleString()} 个
        {tab === 'icons' ? '图标' : tab === 'templates' ? '组合图' : '图形'}
      </div>
      <AssetGallery
        key={tab}
        groups={groups}
        filtered={filtered}
        query={query}
        loading={loading}
        loadError={loadError}
        onRetry={() => {
          setLoadError('');
          setRetry(retry + 1);
        }}
      />
      {tab === 'icons' && (
        <details className="custom-icon">
          <summary>
            <Upload size={13} />
            导入自己的 SVG 图标
          </summary>
          <p>作为新对象插入，不替换当前图稿。</p>
          <button className="button" onClick={() => file.current?.click()}>
            <Upload size={13} />
            选择 SVG 文件
          </button>
          <input
            ref={file}
            type="file"
            accept=".svg,image/svg+xml"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 5 * 1024 * 1024) {
                setError('图标超过 5 MB 限制。');
                return;
              }
              void f
                .text()
                .then((source) => {
                  try {
                    insertCustom(source, f.name.replace(/\.svg$/i, ''));
                    setError('');
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e));
                  }
                })
                .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
              e.target.value = '';
            }}
          />
          <textarea
            aria-label="自定义图标 SVG"
            placeholder="或粘贴 <svg>…</svg>"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setError('');
            }}
          />
          <button className="button primary" disabled={!custom.trim()} onClick={applyCustom}>
            <ClipboardPaste size={13} />
            插入图标
          </button>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
        </details>
      )}
      <p className="insert-footnote">
        {tab === 'templates'
          ? '点击或拖入当前图稿；双击组合深入编辑。'
          : '点击插入视口中心，或拖入指定位置。'}
        {tab === 'icons' ? ' 内置图标：Lucide · ISC / MIT。' : ''}
      </p>
    </aside>
  );
}
