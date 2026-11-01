import {
  browseContents,
  contentKey,
  diagramType,
  diagramTypes,
  styleById,
  type VisualFamily,
} from './browse';
import { BrandIdentity } from '../components/Brand';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { examples, exampleStyles, type SvgExample } from './catalog';
import { SvgPreview, FittedSvgPreview } from './SvgPreview';
import { ExampleSelect } from './ExampleSelect';
import {
  loadExampleVersions,
  saveExampleVersion,
  validateExample,
  type ExampleVersion,
} from './storage';
import { editorHref, examplesHref, navigate, useLocation } from '../app/routing';
import { importDocument } from '../app/actions';
import { useLocale } from '../i18n/locale';
import { LanguageSwitch } from '../components/LanguageSwitch';
import './examples.css';
interface Draft {
  svg: string;
  prompt: string;
  preview: string;
}
export default function ExamplesPage() {
  const { t } = useLocale();
  const location = useLocation(),
    requested = new URLSearchParams(location.split('?')[1]).get('example');
  const selected =
    examples.find((e) => e.id === requested) ||
    examples.find((e) => e.style === exampleStyles[0].id)!;
  const style = exampleStyles.find((s) => s.id === selected.style)!;
  const sameContent = examples.filter((e) => contentKey(e) === contentKey(selected));
  useEffect(() => {
    if (requested && requested !== selected.id)
      navigate(`${examplesHref}?example=${encodeURIComponent(selected.id)}`, true);
  }, [requested, selected.id]);
  const [initial] = useState(() => {
    try {
      return { versions: loadExampleVersions(), error: '' };
    } catch (e) {
      return { versions: {} as Record<string, ExampleVersion>, error: (e as Error).message };
    }
  });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [versions, setVersions] = useState(initial.versions);
  const [tab, setTab] = useState<'prompt' | 'svg'>('prompt'),
    [notice, setNotice] = useState(initial.error),
    [error, setError] = useState(!!initial.error),
    [expanded, setExpanded] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(
    () => window.matchMedia('(max-width: 700px)').matches,
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const detailScroll = useRef(0);
  const wasPreviewOpen = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const update = () => setMobilePreview(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (requested && !wasPreviewOpen.current) closeRef.current?.focus({ preventScroll: true });
    wasPreviewOpen.current = !!requested;
  }, [requested]);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [family, setFamily] = useState<VisualFamily>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const groups = browseContents(typeFilter, family, search);
  const results = groups.flatMap((group) => group.variants);
  const detailOpen = !!requested;
  const fullPreview = detailOpen && expanded;
  const modalPreview = detailOpen && (mobilePreview || fullPreview);
  const resultIndex = results.findIndex((e) => e.id === selected.id);
  const currentVisible = resultIndex >= 0;
  const clearFilters = () => {
    setFamily('all');
    setTypeFilter('');
    setSearch('');
  };
  const gridRef = useRef<HTMLElement>(null);
  const resultScroll = useRef(0);
  useEffect(() => {
    if (requested && !mobilePreview && !fullPreview)
      document
        .getElementById(`result-${requested}`)
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [requested, mobilePreview, fullPreview]);
  const toggleExpanded = () => {
    if (!fullPreview) detailScroll.current = detailRef.current?.scrollTop || 0;
    setExpanded(!fullPreview);
    requestAnimationFrame(() => {
      if (detailRef.current) detailRef.current.scrollTop = fullPreview ? detailScroll.current : 0;
      expandRef.current?.focus({ preventScroll: true });
    });
  };
  const closePreview = () => {
    setExpanded(false);
    navigate(examplesHref, true);
    requestAnimationFrame(() => {
      if (gridRef.current) gridRef.current.scrollTop = resultScroll.current;
      document.getElementById(`result-${selected.id}`)?.focus({ preventScroll: true });
    });
  };
  const movePreview = (offset: number) => {
    if (resultIndex < 0) return;
    const next = results[resultIndex + offset];
    if (next) choose(next);
  };
  const saved = versions[selected.id];
  const draft = drafts[selected.id] || {
    svg: saved?.svg || selected.svg,
    preview: saved?.svg || selected.svg,
    prompt: saved?.prompt || selected.prompt,
  };
  const pending = draft.svg !== draft.preview;
  const modified =
    draft.svg !== (saved?.svg || selected.svg) ||
    draft.prompt !== (saved?.prompt || selected.prompt);
  const update = (patch: Partial<Draft>) =>
    setDrafts((all) => ({ ...all, [selected.id]: { ...draft, ...patch } }));
  const report = (message: string, failed = false) => {
    setNotice(message);
    setError(failed);
  };
  const choose = (example: SvgExample) => {
    if (!requested) {
      resultScroll.current = gridRef.current?.scrollTop || 0;
      setExpanded(false);
    }
    navigate(`${examplesHref}?example=${encodeURIComponent(example.id)}`, true);
    setNotice('');
  };
  const preview = () => {
    try {
      const v = validateExample(draft.svg, draft.prompt);
      update({ svg: v.svg, preview: v.svg });
      report(t('预览已更新。'));
    } catch (e) {
      report((e as Error).message, true);
    }
  };
  const reset = () => {
    try {
      saveExampleVersion(selected.id, null);
      setVersions((all) => {
        const next = { ...all };
        delete next[selected.id];
        return next;
      });
      update({ svg: selected.svg, preview: selected.svg, prompt: selected.prompt });
      report(t('已恢复内置示例。'));
    } catch (e) {
      report((e as Error).message, true);
    }
  };
  const open = () => {
    try {
      if (importDocument(draft.preview, `${selected.id}.svg`)) navigate(editorHref);
      else report(t('此示例需要检查清理报告，请返回编辑器查看。'), true);
    } catch (e) {
      report((e as Error).message, true);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft.prompt);
      report(t('Prompt 已复制，可粘贴到 AI 应用。'));
    } catch {
      setTab('prompt');
      requestAnimationFrame(() => {
        promptRef.current?.focus();
        promptRef.current?.select();
      });
      report(t('剪贴板不可用，已选中 Prompt，请按 ⌘/Ctrl+C 复制。'));
    }
  };
  return (
    <main
      className={`examples-page image-search-page ${detailOpen ? 'has-detail' : ''}`}
      onKeyDown={(e) => {
        if (e.defaultPrevented) return;
        if (e.key === 'Tab' && fullPreview) {
          const controls = [
            ...detailRef.current!.querySelectorAll<HTMLElement>(
              'button:not(:disabled),a[href],input,textarea',
            ),
          ].filter((control) => control.getClientRects().length > 0);
          const first = controls[0],
            last = controls.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
        if (
          e.key !== 'Escape' &&
          (e.target as HTMLElement).closest(
            'input,textarea,select,[role="combobox"],[role="listbox"]',
          )
        )
          return;
        if (e.key === 'Escape' && detailOpen) {
          e.preventDefault();
          if (fullPreview) toggleExpanded();
          else closePreview();
        }
        if (e.key === 'ArrowRight' && detailOpen) {
          e.preventDefault();
          movePreview(1);
        }
        if (e.key === 'ArrowLeft' && detailOpen) {
          e.preventDefault();
          movePreview(-1);
        }
      }}
    >
      <header className="examples-header" inert={modalPreview}>
        <a
          className="brand"
          aria-label="JustSVG"
          href={editorHref}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            navigate(editorHref);
          }}
        >
          <BrandIdentity />
        </a>
        <span className="examples-header-label">
          <BookOpen size={16} />
          {t('Example 示例')}
        </span>
        <LanguageSwitch compact />
        <a
          className="button"
          href={editorHref}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            navigate(editorHref);
          }}
        >
          <ArrowLeft size={15} />
          {t('返回编辑器')}
        </a>
      </header>
      <section className="image-search-controls" aria-label={t('搜索与筛选')} inert={modalPreview}>
        <label className="image-search-input">
          <Search size={20} />
          <input
            type="search"
            aria-label={t('搜索示例')}
            placeholder={t('搜索图形、场景或品牌，例如：架构、泳道、OpenAI')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button aria-label={t('清除筛选')} onClick={() => setSearch('')}>
              <X size={17} />
            </button>
          )}
        </label>
        <div className="image-search-filters">
          <div className="image-filter">
            <span>{t('图形类型')}</span>
            <ExampleSelect
              label={t('筛选图形类型')}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: '', label: t('全部类型') },
                ...diagramTypes.map((type) => ({ value: type, label: type })),
              ]}
            />
          </div>
          <div className="image-filter">
            <span>{t('风格系列')}</span>
            <ExampleSelect
              label={t('筛选风格系列')}
              value={family}
              onChange={(value) => setFamily(value as VisualFamily)}
              options={[
                { value: 'all', label: t('全部系列') },
                { value: 'base', label: t('基础风格') },
                { value: 'brand', label: t('品牌风格') },
                { value: 'special', label: t('专题风格') },
              ]}
            />
          </div>
          <span role="status" aria-label={t('筛选结果')}>
            {results.length} SVG
          </span>
          {(search || typeFilter || family !== 'all') && (
            <button className="text-button" onClick={clearFilters}>
              {t('清除筛选')}
            </button>
          )}
        </div>
      </section>
      <div className="examples-workbench">
        <section ref={gridRef} className="image-results" aria-label={t('图片结果')} inert={modalPreview}>
          <div className="image-grid">
            {results.map((example) => (
              <button
                id={`result-${example.id}`}
                key={example.id}
                className={`image-result ${detailOpen && selected.id === example.id ? 'selected' : ''}`}
                aria-label={`${t('预览')} ${t(styleById.get(example.style)!.name)} · ${t(example.name)}`}
                aria-pressed={detailOpen && selected.id === example.id}
                onClick={() => choose(example)}
              >
                <span
                  className="image-result-art"
                  style={{ aspectRatio: `${example.width} / ${example.height}` }}
                >
                  <SvgPreview
                    svg={versions[example.id]?.svg || example.svg}
                    label={`${t(example.name)} thumbnail`}
                  />
                </span>
                <strong>{t(styleById.get(example.style)!.name)}</strong>
                <span>{t(example.name)}</span>
              </button>
            ))}
          </div>
          {results.length === 0 && (
            <div className="image-empty">
              <h2>{t('没有找到匹配的 SVG')}</h2>
              <p>{t('试试其他关键词，或清除筛选。')}</p>
              <button className="button" onClick={clearFilters}>
                {t('显示全部示例')}
              </button>
            </div>
          )}
        </section>
        <div className="image-detail-placeholder" hidden={!fullPreview} aria-hidden="true" />
        <aside
          ref={detailRef}
          className={`image-detail ${fullPreview ? 'is-expanded' : ''}`}
          aria-label={t('图片预览')}
          role="dialog"
          aria-modal={modalPreview || undefined}
          hidden={!detailOpen}
        >
          <div className="image-detail-toolbar">
            <div className="image-detail-identity">
              <ExampleSelect
                label={t('选择视觉风格')}
                menuOffset={26}
                value={selected.id}
                onChange={(value) => choose(examples.find((item) => item.id === value)!)}
                options={sameContent.map((item) => ({
                  value: item.id,
                  label: t(styleById.get(item.style)!.name),
                  palette: styleById.get(item.style)!.palette,
                }))}
              />
            <h2 title={t(selected.name)}>{t(selected.name)}</h2>
            </div>
            <div className="image-detail-actions">
              <button
                className="button primary example-open"
                aria-label={t('在编辑器中打开')}
                title={t('在编辑器中打开')}
                onClick={open}
                disabled={pending}
              >
                <span>{t('打开编辑器')}</span>
                <ArrowUpRight size={15} />
              </button>
              <button
                className="button example-close"
                ref={closeRef}
                aria-label={t('关闭预览')}
                onClick={closePreview}
              >
                <X size={18} />
              </button>
            </div>
          </div>
            <section className="example-main" aria-label={t('示例预览区')}>
            <div
              className="example-preview-stage"
              style={{
                aspectRatio: fullPreview ? undefined : `${selected.width} / ${selected.height}`,
              }}
            >
              <FittedSvgPreview
                svg={draft.preview}
                label={`${t(selected.name)} SVG preview`}
                width={selected.width}
                height={selected.height}
              />
              <button
                className="button example-fit"
                ref={expandRef}
                aria-label={fullPreview ? t('退出全屏') : t('全屏预览')}
                title={fullPreview ? `${t('退出全屏')} (Esc)` : t('全屏预览')}
                aria-pressed={fullPreview}
                onClick={toggleExpanded}
              >
                {fullPreview ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                className="button example-nav example-previous"
                aria-label={t('上一张')}
                title={t('上一张')}
                disabled={resultIndex <= 0}
                onClick={() => movePreview(-1)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="button example-nav example-next"
                aria-label={t('下一张')}
                title={t('下一张')}
                disabled={resultIndex < 0 || resultIndex >= results.length - 1}
                onClick={() => movePreview(1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="example-caption">
              <span>
                {diagramType(selected)} · {selected.width} × {selected.height}
              </span>
              <span>
                {currentVisible
                  ? `${resultIndex + 1} / ${results.length}`
                  : t('当前图片不在筛选结果中')}
              </span>
            </div>
            {style.brand && (
              <details
                key={selected.id}
                className="example-brand-reference"
                aria-label={t('品牌风格依据')}
              >
                <summary>
                  <span>{t('品牌参考与设计依据')}</span>
                  <span>{t('非官方')}</span>
                  <ChevronDown size={14} />
                </summary>
                <p>{style.brand.note}</p>
                <div>
                  {style.brand.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                      <ArrowUpRight size={12} />
                    </a>
                  ))}
                </div>
              </details>
            )}
          </section>
          <aside className="example-source-panel" aria-label={t('复用与调试')}>
            <div className="example-source-heading">
              <h2>{t('复用与调试')}</h2>
              <span>
                {modified ? t('本页草稿') : saved ? t('历史本地版本') : t('内置示例')}
              </span>
            </div>
            <div
              className="example-source-tabs"
              role="tablist"
              aria-label={t('示例内容')}
              onKeyDown={(e) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();
                const next =
                  e.key === 'Home'
                    ? 'prompt'
                    : e.key === 'End'
                      ? 'svg'
                      : tab === 'prompt'
                        ? 'svg'
                        : 'prompt';
                setTab(next);
                document.getElementById(`example-${next}-tab`)?.focus();
              }}
            >
              <button
                role="tab"
                id="example-prompt-tab"
                aria-selected={tab === 'prompt'}
                aria-controls="example-source-content"
                onClick={() => setTab('prompt')}
              >
                <FileText size={14} />
                {t('生成 Prompt')}
              </button>
              <button
                role="tab"
                id="example-svg-tab"
                aria-selected={tab === 'svg'}
                aria-controls="example-source-content"
                onClick={() => setTab('svg')}
              >
                <Code2 size={14} />
                {t('SVG 源码')}
              </button>
            </div>
            <div
              className="example-source-content"
              id="example-source-content"
              role="tabpanel"
              aria-labelledby={tab === 'prompt' ? 'example-prompt-tab' : 'example-svg-tab'}
            >
              {tab === 'prompt' ? (
                <>
                  <p>{t('复制 Prompt 到 AI 应用，可替换主题与内容。')}</p>
                  <textarea
                    ref={promptRef}
                    aria-label={t('生成 Prompt')}
                    value={draft.prompt}
                    onChange={(e) => update({ prompt: e.target.value })}
                    spellCheck={false}
                  />
                  <button className="button" onClick={() => void copy()}>
                    <Copy size={15} />
                    {t('复制 Prompt')}
                  </button>
                </>
              ) : (
                <>
                  <p>{t('修改源码后先预览，再打开编辑器。无效或不安全的 SVG 不会替换当前预览。')}</p>
                  <textarea
                    className="example-code"
                    aria-label={t('SVG 源码')}
                    value={draft.svg}
                    onChange={(e) => update({ svg: e.target.value })}
                    spellCheck={false}
                  />
                  <button className="button" onClick={preview}>
                    <Check size={15} />
                    {t('预览 SVG')}
                  </button>
                </>
              )}
            </div>
            {notice && (
              <p
                className={`example-notice ${error ? 'error' : ''}`}
                role={error ? 'alert' : 'status'}
              >
                {notice}
              </p>
            )}
            {pending && <p className="example-pending">{t('源码有未预览的修改，请先预览后再使用。')}</p>}
            <div className="example-reset-actions">
              <button className="text-button" onClick={reset}>
                <RotateCcw size={13} />
                {t('恢复内置')}
              </button>
            </div>
            <p className="example-storage-note">{t('修改仅在本页保留，需要保存时请在编辑器中继续。')}</p>
          </aside>
        </aside>
      </div>
    </main>
  );
}
