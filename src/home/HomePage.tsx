import { useHomeLocale } from './homeLocale';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { BrandIdentity } from '../components/Brand';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { editorHref, navigate } from '../app/routing';
import { importDocument } from '../app/actions';
import { NativeDiagram, NodeGlyph } from './NativeDiagram';
import { ConstructionConnections } from './ConstructionConnections';
import { BrandRecordsStage } from './BrandRecordsStage';
import { SkillStage } from './SkillStage';
import { EditorStage } from './EditorStage';
import { DocumentFooter } from './DocumentFooter';
import { emptyEdits, serializeDiagram } from './diagramModel';
import type { DiagramEdits, HomeTheme, NodeId, Point } from './diagramModel';
import { useHomeMotion } from './useHomeMotion';
import brandManifest from '../examples/brand-manifest.json';
import './home.css';

let savedEdits = emptyEdits();
function editorRoute(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(editorHref);
  window.scrollTo(0, 0);
}
export function HomePage() {
  return <HomeContent />;
}
function HomeContent() {
  const { locale, t } = useHomeLocale();
  const root = useRef<HTMLDivElement>(null),
    editorSvg = useRef<SVGSVGElement>(null);
  const [preview, setPreview] = useState<HomeTheme | null>(null);
  const [edits, setEdits] = useState<DiagramEdits>(savedEdits),
    [error, setError] = useState('');
  const history = useRef<DiagramEdits[]>([]),
    [undoCount, setUndoCount] = useState(0);
  const theme = preview ?? 'native';
  useEffect(() => {
    savedEdits = edits;
  }, [edits]);
  useEffect(() => {
    const id = window.location.hash
      .slice(1)
      .split('&')
      .find((part) => !/^(?:lang|language)=(?:en|zh)$/i.test(part) && !/^(?:en|zh)$/i.test(part));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);
  useHomeMotion(root);
  const remember = () => {
    history.current.push(structuredClone(edits));
    if (history.current.length > 40) history.current.shift();
    setUndoCount(history.current.length);
  };
  const undo = () => {
    const previous = history.current.pop();
    if (previous) setEdits(previous);
    setUndoCount(history.current.length);
  };
  const label = (id: NodeId, value: string) =>
    setEdits((previous) => ({ ...previous, labels: { ...previous.labels, [id]: value } }));
  const color = (id: NodeId, value: string) =>
    setEdits((previous) => ({ ...previous, colors: { ...previous.colors, [id]: value } }));
  const move = (id: NodeId, value: Point) =>
    setEdits((previous) => ({ ...previous, offsets: { ...previous.offsets, [id]: value } }));
  const xml = () => {
    if (!editorSvg.current) throw new Error(t('图稿尚未就绪，请稍后重试。'));
    return serializeDiagram(editorSvg.current);
  };
  const open = () => {
    try {
      if (importDocument(xml(), 'rag-system.svg')) {
        navigate(editorHref);
        window.scrollTo(0, 0);
      } else setError('请先处理编辑器中的导入提示，再重试。');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '打开失败，请重试。');
    }
  };
  return (
    <div
      className="home-page"
      lang={locale === 'en' ? 'en' : 'zh-CN'}
      data-theme={theme}
      ref={root}
      id="top"
    >
      <a className="home-skip" href="#home-content">
        {t('跳到主要内容')}
      </a>
      <header className="home-header home-width">
        <a className="home-brand" href="#top" aria-label={t('JustSVG 首页')}>
          <BrandIdentity />
        </a>
        <nav aria-label={t('首页导航')}>
          <a href="#brand-styles">{t('品牌风格')}</a>
          <a href="#skill">SVG Skill</a>
        </nav>
        <LanguageSwitch />
        <a
          className="home-action header-github"
          href="https://github.com/lwxyfer/justsvg"
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="github-mark"
            src={`${import.meta.env.BASE_URL}brand/github-mark.svg`}
            width="18"
            height="18"
            alt=""
          />
          GitHub <ArrowUpRight size={17} />
        </a>
      </header>
      <main id="home-content">
        <section className="native-chapter home-width" aria-labelledby="home-title">
          <ConstructionConnections kind="specimens" />
          <div className="native-hero">
            <div className="native-copy">
              <h1 id="home-title">
                {t('draw.io 的')}
                <br />
                <span>{t('开源替代。')}</span>
              </h1>
              <p>
                {t('用 SVG Skill 在 AI 工具中生成架构图、流程图和信息图，再用编辑器修改细节。')}
              </p>
              <a className="home-action" href={editorHref} onClick={editorRoute}>
                {t('打开编辑器')}
                <ArrowUpRight size={22} />
              </a>
              <a className="native-scroll" href="#skill">
                {t('了解 SVG Skill')}
                <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-diagram">
              <NativeDiagram theme={theme} edits={edits} construction variant="hero" />
            </div>
          </div>
          <div className="primitive-strip" aria-label={t('JustSVG 的三项核心能力')}>
            <div>
              <h3>
                {brandManifest.length}
                {t('种品牌风格')}
              </h3>
              <svg viewBox="0 0 340 105" aria-hidden="true">
                <rect
                  x="8"
                  y="12"
                  width="305"
                  height="65"
                  fill="none"
                  stroke="var(--home-accent)"
                  strokeWidth=".8"
                />
                <rect x="15" y="20" width="96" height="49" fill="#161616" />
                <rect x="115" y="20" width="96" height="49" fill="#e3d7ff" />
                <rect x="215" y="20" width="90" height="49" fill="#f6b5a0" />
                <g fontFamily="'JustSVG Sans', sans-serif" fontSize="19" fontWeight="750">
                  <text x="30" y="52" fill="#fff">
                    Vercel
                  </text>
                  <text x="130" y="52" fill="#242021">
                    Figma
                  </text>
                  <text x="224" y="52" fill="#421d2b">
                    OpenAI
                  </text>
                </g>
                <path
                  d="M8 85H313M8 80V90M313 80V90"
                  stroke="var(--home-muted)"
                  fill="none"
                  strokeWidth=".65"
                />
              </svg>
              <p>{t('为技术文档、演示和博客，选好配色与构图。')}</p>
            </div>
            <div>
              <h3>{t('原生 SVG')}</h3>
              <svg viewBox="0 0 340 105" aria-hidden="true">
                <g fill="none" stroke="var(--home-accent)">
                  <path
                    className="primitive-curve"
                    d="M12 22C120 22 140 85 320 85"
                    strokeWidth="1.7"
                  />
                  <path d="M12 22H120M140 85H320" strokeWidth=".65" />
                  <rect x="8" y="18" width="8" height="8" fill="var(--home-accent)" />
                  <circle cx="120" cy="22" r="4" fill="var(--home-paper)" />
                  <circle cx="140" cy="85" r="4" fill="var(--home-paper)" />
                  <circle cx="320" cy="85" r="4" fill="var(--home-accent)" />
                </g>
              </svg>
              <p>{t('导出为标准 SVG，文字和图形仍可编辑。')}</p>
            </div>
            <div>
              <h3>{t('可视化编辑')}</h3>
              <svg viewBox="0 0 470 135" aria-hidden="true">
                <rect x="20" y="15" width="205" height="65" rx="4" fill="var(--home-panel)" />
                <text
                  x="75"
                  y="56"
                  fill="var(--home-ink)"
                  fontFamily="Arial, sans-serif"
                  fontSize="24"
                  fontWeight="600"
                >
                  Retriever
                </text>
                <g
                  transform="translate(33 31) scale(.65)"
                  fill="none"
                  stroke="var(--home-ink)"
                  strokeWidth="2"
                >
                  <NodeGlyph id="retrieve" />
                </g>
                <rect
                  x="15"
                  y="10"
                  width="215"
                  height="75"
                  fill="none"
                  stroke="var(--home-accent)"
                  strokeWidth=".8"
                />
                <g fill="var(--home-paper)" stroke="var(--home-accent)">
                  {[
                    [15, 10],
                    [230, 10],
                    [15, 85],
                    [230, 85],
                  ].map(([x, y]) => (
                    <rect key={x + ',' + y} x={x - 3} y={y - 3} width="6" height="6" />
                  ))}
                </g>
                <g>
                  <rect
                    x="255"
                    y="10"
                    width="205"
                    height="112"
                    rx="3"
                    fill="var(--home-panel)"
                    stroke="var(--home-line)"
                    strokeWidth=".7"
                  />
                  <g fontFamily="'JustSVG Sans', sans-serif">
                    <text x="268" y="32" fill="var(--home-muted)" fontSize="11">
                      {t('节点名称')}
                    </text>
                    <rect
                      x="268"
                      y="41"
                      width="177"
                      height="29"
                      rx="2"
                      fill="var(--home-paper)"
                      stroke="var(--home-line)"
                    />
                    <text x="279" y="61" fill="var(--home-ink)" fontSize="13">
                      Retriever
                    </text>
                    <text x="268" y="99" fill="var(--home-muted)" fontSize="11">
                      {t('填充')}
                    </text>
                    <rect x="306" y="84" width="23" height="23" rx="3" fill="#2855ee" />
                    <rect x="339" y="84" width="23" height="23" rx="3" fill="#d9caff" />
                    <rect x="372" y="84" width="23" height="23" rx="3" fill="#b9ead5" />
                    <path d="m312 95 4 4 7-8" fill="none" stroke="#fff" strokeWidth="1.5" />
                  </g>
                </g>
              </svg>
              <p>{t('直接改文字、拖节点、换颜色，连线自动跟随。')}</p>
            </div>
          </div>
        </section>
        <BrandRecordsStage preview={setPreview} />
        <SkillStage theme={theme} edits={edits} />
        <EditorStage
          theme={theme}
          edits={edits}
          svgRef={editorSvg}
          onLabel={label}
          onColor={color}
          onMove={move}
          remember={remember}
          undo={undo}
          canUndo={undoCount > 0}
          reset={() => {
            remember();
            setEdits(emptyEdits());
          }}
          open={open}
          error={error}
        />
      </main>
      <DocumentFooter />
    </div>
  );
}
