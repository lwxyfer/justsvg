import { BrandIdentity } from '../components/Brand';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  FileText,
  Maximize2,
  RotateCcw,
  Save,
} from 'lucide-react';
import { examples, exampleStyles, type SvgExample } from './catalog';
import { SvgPreview, FittedSvgPreview } from './SvgPreview';
import {
  loadExampleVersions,
  saveExampleVersion,
  validateExample,
  type ExampleVersion,
} from './storage';
import { editorHref, examplesHref, navigate, useLocation } from '../app/routing';
import { importDocument } from '../app/actions';
import './examples.css';
interface Draft {
  svg: string;
  prompt: string;
  preview: string;
  savedAt: number;
}
function download(source: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([source], { type })),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ExamplesPage() {
  const location = useLocation(),
    requested = new URLSearchParams(location.split('?')[1]).get('example');
  const selected =
    examples.find((e) => e.id === requested) ||
    examples.find((e) => e.style === exampleStyles[0].id)!;
  const style = exampleStyles.find((s) => s.id === selected.style)!;
  const sameContent = selected.sourceId
    ? examples.filter((e) => e.sourceId === selected.sourceId)
    : [];
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
    [actualSize, setActualSize] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [family, setFamily] = useState<'all' | 'brand'>('all');
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const reveal = () =>
      rail
        .querySelector('[aria-pressed="true"]')
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [style.id, family]);
  const saved = versions[selected.id];
  const draft = drafts[selected.id] || {
    svg: saved?.svg || selected.svg,
    preview: saved?.svg || selected.svg,
    prompt: saved?.prompt || selected.prompt,
    savedAt: saved?.savedAt || 0,
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
  const choose = (example: SvgExample, preserveInspection = false) => {
    if (!exampleStyles.find((s) => s.id === example.style)?.brand) setFamily('all');
    navigate(`${examplesHref}?example=${encodeURIComponent(example.id)}`, true);
    setNotice('');
    if (!preserveInspection) setActualSize(false);
  };
  const preview = () => {
    try {
      const v = validateExample(draft.svg, draft.prompt);
      update({ svg: v.svg, preview: v.svg });
      report('预览已更新，尚未保存到本地版本。');
    } catch (e) {
      report((e as Error).message, true);
    }
  };
  const save = () => {
    try {
      const v = validateExample(draft.svg, draft.prompt);
      saveExampleVersion(selected.id, v);
      setVersions((all) => ({ ...all, [selected.id]: v }));
      update({ ...v, preview: v.svg });
      report('SVG 和 Prompt 已保存为本地版本。');
    } catch (e) {
      report(`保存失败：${(e as Error).message} 当前内容仍保留，请复制或下载备份。`, true);
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
      update({ svg: selected.svg, preview: selected.svg, prompt: selected.prompt, savedAt: 0 });
      report('已恢复内置示例。');
    } catch (e) {
      report((e as Error).message, true);
    }
  };
  const open = () => {
    try {
      if (importDocument(draft.preview, `${selected.id}.svg`)) navigate(editorHref);
      else report('此示例需要检查清理报告，请返回编辑器查看。', true);
    } catch (e) {
      report((e as Error).message, true);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft.prompt);
      report('Prompt 已复制，可粘贴到 AI 应用。');
    } catch {
      setTab('prompt');
      requestAnimationFrame(() => {
        promptRef.current?.focus();
        promptRef.current?.select();
      });
      report('剪贴板不可用，已选中 Prompt，请按 ⌘/Ctrl+C 复制。');
    }
  };
  return (
    <main className="examples-page">
      <header className="examples-header">
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
          Example 示例
        </span>
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
          返回编辑器
        </a>
      </header>
      <div className="examples-workbench">
        <aside className="examples-sidebar" aria-label="示例风格">
          <div className="examples-sidebar-heading">
            <h1>SVG 风格库</h1>
            <p>
              {exampleStyles.length} 种风格 · {examples.length} 个示例
            </p>
          </div>
          <nav className="example-family-filter" aria-label="风格分类">
            <button
              className="button"
              aria-pressed={family === 'all'}
              onClick={() => setFamily('all')}
            >
              全部
            </button>
            <button
              className="button"
              aria-pressed={family === 'brand'}
              onClick={() => setFamily('brand')}
            >
              品牌风格 · {exampleStyles.filter((s) => s.brand).length}
            </button>
          </nav>
          <nav aria-label="风格选择" ref={railRef}>
            {exampleStyles
              .filter((s) => family === 'all' || s.brand)
              .map((s) => {
                const items = examples.filter((e) => e.style === s.id),
                  sample = items[0];
                return (
                  <button
                    key={s.id}
                    aria-label={`选择${s.name}`}
                    className={`example-style ${s.id === style.id ? 'selected' : ''}`}
                    aria-pressed={s.id === style.id}
                    onClick={() => {
                      const matching =
                        selected.sourceId && items.find((e) => e.sourceId === selected.sourceId);
                      choose(matching || sample, !!matching);
                    }}
                  >
                    <span className="example-style-thumbnail">
                      <SvgPreview svg={sample.svg} label={`${s.name}缩略图`} />
                    </span>
                    <span>
                      <strong>{s.name}</strong>
                      {s.featured && <small className="example-featured-label">推荐构图</small>}
                      <small>{s.summary}</small>
                      <small>{items.length} 个示例</small>
                    </span>
                  </button>
                );
              })}
          </nav>
          <p className="examples-sidebar-note">
            内置示例均为原生 SVG。
            <br />
            可以编辑，也可以复制 Prompt 生成自己的图。
          </p>
        </aside>
        <section className="example-main" aria-label="示例预览区">
          <nav className="example-featured-switcher" aria-label="推荐风格">
            <span>推荐</span>
            {exampleStyles
              .filter((s) => s.featured)
              .map((s) => (
                <button
                  className="button"
                  aria-pressed={style.id === s.id}
                  key={s.id}
                  onClick={() => choose(examples.find((e) => e.style === s.id)!)}
                >
                  {s.name}
                </button>
              ))}
          </nav>
          <div className="example-heading">
            <div>
              <h2>{style.name}</h2>
              <p>{style.summary}</p>
            </div>
            <button className="button primary" onClick={open} disabled={pending}>
              在编辑器中打开
              <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="example-options">
            <label>
              示例
              <select
                aria-label="选择示例"
                value={selected.id}
                onChange={(e) => choose(examples.find((x) => x.id === e.target.value)!)}
              >
                {examples
                  .filter((e) => e.style === style.id)
                  .map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="button"
              onClick={() =>
                download(draft.preview, `${selected.id}.svg`, 'image/svg+xml;charset=utf-8')
              }
              disabled={pending}
            >
              <Download size={14} />
              下载 SVG
            </button>
          </div>
          {sameContent.length > 1 && (
            <nav className="example-featured-switcher example-style-switcher" aria-label="同图风格">
              <span>同图风格</span>
              {sameContent.map((example) => (
                <button
                  key={example.id}
                  className="button"
                  aria-pressed={example.id === selected.id}
                  title="比较同一内置内容的视觉风格，已有修改保留在各自版本中"
                  onClick={() => choose(example, true)}
                >
                  {example.style === 'base'
                    ? '标准基础'
                    : exampleStyles.find((s) => s.id === example.style)!.name.replace('基础·', '')}
                </button>
              ))}
            </nav>
          )}
          <div className="example-preview-stage">
            <FittedSvgPreview
              svg={draft.preview}
              label={`${selected.name} SVG 预览`}
              width={selected.width}
              height={selected.height}
              actualSize={actualSize}
            />
            <button
              className="button example-fit"
              aria-pressed={actualSize}
              onClick={() => setActualSize(!actualSize)}
            >
              <Maximize2 size={14} />
              {actualSize ? '适应预览' : '100% 查看'}
            </button>
          </div>
          <div className="example-caption">
            <span>
              {selected.name} · {selected.width} × {selected.height}
            </span>
            <span className="example-swatches" aria-label="风格配色">
              {style.palette.map((color) => (
                <span key={color} style={{ background: color }} title={color} />
              ))}
            </span>
          </div>
          <p className="example-explanation">
            {style.tags.join(' / ')}
            。内容为演示结构，不代表生产配置或性能数据。打开示例会新增图稿标签，当前工作继续保留。
          </p>
          {style.brand && (
            <aside className="example-brand-reference" aria-label="品牌风格依据">
              <strong>品牌灵感示例 · 非官方</strong>
              <p>{style.brand.note}</p>
              <div>
                {style.brand.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
              <small>
                字体使用本机回退；未嵌入专有字体或品牌标志。完整规则与参考链接已记入 Prompt。
              </small>
            </aside>
          )}
        </section>
        <aside className="example-source-panel" aria-label="Prompt 与 SVG 调试">
          <div className="example-source-heading">
            <h2>复用与调试</h2>
            <span>{modified ? '未保存修改' : draft.savedAt ? '本地版本已保存' : '内置原版'}</span>
          </div>
          <div
            className="example-source-tabs"
            role="tablist"
            aria-label="示例内容"
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
              生成 Prompt
            </button>
            <button
              role="tab"
              id="example-svg-tab"
              aria-selected={tab === 'svg'}
              aria-controls="example-source-content"
              onClick={() => setTab('svg')}
            >
              <Code2 size={14} />
              SVG 源码
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
                <p>
                  复制到 AI 应用即可生成同类风格。可以修改主题和内容；AI 输出可能与示例存在差异。
                </p>
                <textarea
                  ref={promptRef}
                  aria-label="示例生成 Prompt"
                  value={draft.prompt}
                  onChange={(e) => update({ prompt: e.target.value })}
                  spellCheck={false}
                />
                <button className="button primary" onClick={() => void copy()}>
                  <Copy size={15} />
                  复制 Prompt
                </button>
              </>
            ) : (
              <>
                <p>
                  修改源码后先预览，再保存本地版本或打开编辑器。无效或不安全的 SVG
                  不会替换当前预览。
                </p>
                <textarea
                  className="example-code"
                  aria-label="示例 SVG 源码"
                  value={draft.svg}
                  onChange={(e) => update({ svg: e.target.value })}
                  spellCheck={false}
                />
                <button className="button" onClick={preview}>
                  <Check size={15} />
                  预览 SVG
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
          {pending && (
            <p className="example-pending">源码有未预览的修改，请先预览或保存后再使用。</p>
          )}
          <div className="example-save-actions">
            <button className="button" onClick={save}>
              <Save size={14} />
              保存本地版本
            </button>
            <button className="text-button" onClick={reset}>
              <RotateCcw size={13} />
              恢复内置
            </button>
          </div>
          <p className="example-storage-note">
            本地版本独立于编辑器图稿，仅保存在当前浏览器。Prompt
            草稿修改后需保存；编辑器内的修改不会自动写回示例库。
          </p>
        </aside>
      </div>
    </main>
  );
}
