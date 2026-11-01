import { useHomeLocale } from './homeLocale';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw } from 'lucide-react';
import manifest from '../examples/brand-manifest.json';
import brandCopy from './home-brand-copy.json';
import { examplesHref } from '../app/routing';
import { homeRoute } from './homeRoute';
import type { HomeTheme } from './diagramModel';
import { useRecordDeck } from './useRecordDeck';
import './brand-records.css';

const assets = import.meta.glob('../examples/assets/brand-*-rag.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
// The existing catalogue is the source of the sleeves, not newly invented templates.
const first = [
  'vercel',
  'linear',
  'stripe',
  'openai',
  'figma',
  'spotify',
  'claude',
  'google',
  'dropbox',
];
const records = [...manifest].sort((a, b) => {
  const ai = first.indexOf(a.id),
    bi = first.indexOf(b.id);
  return (
    (ai < 0 ? first.length + manifest.indexOf(a) : ai) -
    (bi < 0 ? first.length + manifest.indexOf(b) : bi)
  );
});
type Brand = (typeof records)[number];
const brandDescriptions: Record<string, { label: string; description: string }> = brandCopy;
const channels = (hex: string) =>
  hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((v) => parseInt(v, 16));
const luminance = (hex: string) =>
  channels(hex)
    .map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: string, b: string) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
function colors(brand: Brand) {
  const paper = brand.id === 'openai' ? '#f9d9cd' : brand.paper;
  const ink = contrast(paper, brand.ink) >= 4.5 ? brand.ink : '#17191d';
  const muted =
    '#' +
    channels(ink)
      .map((v, i) =>
        Math.round(v * 0.75 + channels(paper)[i] * 0.25)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  const accent =
    brand.palette.find((c) => {
      const rgb = channels(c);
      return Math.max(...rgb) - Math.min(...rgb) > 40 && contrast(c, paper) >= 4.5;
    }) || ink;
  return { paper, ink, muted, accent };
}
const knownTheme = (id: string): HomeTheme =>
  id === 'figma' || id === 'vercel' || id === 'openai' ? id : 'native';

export function BrandRecordsStage({ preview }: { preview: (theme: HomeTheme | null) => void }) {
  const { locale, t } = useHomeLocale();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(4),
    [locked, setLocked] = useState<number | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [compact, setCompact] = useState(() => window.innerWidth < 700);
  const brand = records[active],
    palette = colors(brand);
  const step = compact ? 62 : 96,
    size = compact ? 256 : 360;
  const current = useRef(active);
  const isBrowsing = useRef(false);
  const show = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(records.length - 1, index));
      if (current.current === next && isBrowsing.current) return;
      current.current = next;
      isBrowsing.current = true;
      setActive(next);
      setBrowsing(true);
      preview(knownTheme(records[next].id));
    },
    [preview, setActive, setBrowsing],
  );
  const deck = useRecordDeck({
    current,
    compact,
    count: records.length,
    onIndex: show,
  });
  const { viewport, covers } = deck;
  const select = (index: number) => {
    show(index);
    deck.move(index);
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 699px)');
    const sync = () => setCompact(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const root = section.current?.closest<HTMLElement>('.home-page');
    if (!root || !browsing) return;
    const variables = {
      '--home-paper': palette.paper,
      '--home-panel': palette.paper,
      '--home-ink': palette.ink,
      '--home-muted': palette.muted,
      '--home-line': `color-mix(in srgb, ${palette.ink} 25%, ${palette.paper})`,
      '--home-accent': palette.accent,
      '--home-on-accent': palette.paper,
      '--home-button': palette.ink,
      '--home-on-button': palette.paper,
      '--home-radius': ['vercel', 'ibm', 'replicate'].includes(brand.id)
        ? '0px'
        : ['figma', 'google', 'duolingo'].includes(brand.id)
          ? '14px'
          : '5px',
    };
    root.dataset.recordBrand = brand.id;
    Object.entries(variables).forEach(([key, value]) => root.style.setProperty(key, value));
    return () => {
      Object.keys(variables).forEach((key) => root.style.removeProperty(key));
      delete root.dataset.recordBrand;
    };
  }, [brand.id, browsing, palette.paper, palette.ink, palette.muted, palette.accent]);

  const leave = () => {
    deck.stop();
    if (locked !== null) select(locked);
    else {
      isBrowsing.current = false;
      setBrowsing(false);
      preview(null);
    }
  };
  const key = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next++;
    else if (event.key === 'ArrowLeft') next--;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = records.length - 1;
    else if (event.key === 'Escape') {
      event.currentTarget.blur();
      leave();
      return;
    } else return;
    event.preventDefault();
    next = Math.max(0, Math.min(records.length - 1, next));
    covers.current[next]?.focus({ preventScroll: true });
    select(next);
    deck.center(next);
  };
  const href = `${examplesHref}?example=brand-${brand.id}-rag`;
  return (
    <section
      className="brand-records chapter"
      id="brand-styles"
      ref={section}
      aria-labelledby="records-title"
    >
      <div className="chapter-heading home-width">
        <div>
          <h2 id="records-title">{t('为技术图选一种品牌风格。')}</h2>
          <p>
            {t('同一张架构图，{count} 种品牌风格。配色与构图，一起对比。').replace(
              '{count}',
              String(records.length),
            )}
          </p>
        </div>
      </div>
      <div
        className="record-collection"
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') leave();
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) leave();
        }}
      >
        <div className="record-index home-width">
          <span>SVG COLLECTION</span>
          <span>{t('RAG · 从知识到回答')}</span>
          <span>
            {String(active + 1).padStart(2, '0')} / {records.length}
          </span>
        </div>
        <div
          className="record-viewport"
          ref={viewport}
          onPointerMove={deck.pointer}
          onPointerEnter={deck.pointer}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') deck.stop();
          }}
          aria-label={t('横向翻阅品牌 SVG 唱片')}
        >
          <div
            className="record-track"
            style={
              {
                width: `calc(100vw + ${(records.length - 1) * step}px)`,
                '--record-size': `${size}px`,
              } as CSSProperties
            }
          >
            {records.map((item, i) => {
              const color = colors(item);
              return (
                <button
                  className="record-sleeve"
                  key={item.id}
                  data-record={item.id}
                  data-active={i === active}
                  aria-pressed={locked === i}
                  aria-label={t('预览 {brand} 风格，点击保留').replace('{brand}', t(item.name))}
                  tabIndex={i === active ? 0 : -1}
                  ref={(el) => {
                    covers.current[i] = el;
                  }}
                  style={
                    {
                      left: `calc(50vw + ${i * step}px)`,
                      '--sleeve-paper': color.paper,
                      '--sleeve-ink': color.ink,
                      '--sleeve-muted': color.muted,
                    } as CSSProperties
                  }
                  onFocus={() => select(i)}
                  onKeyDown={(event) => key(event, i)}
                  onClick={() => {
                    select(i);
                    setLocked(i);
                    deck.center(i);
                  }}
                >
                  <span className="record-spine">
                    {t(item.name)} <span>SVG</span>
                  </span>
                  <span className="record-front">
                    <span className="record-masthead">
                      <strong>{t(item.name)}</strong>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                    </span>
                    <span className="record-art">
                      <img
                        src={
                          locale === 'en'
                            ? `${import.meta.env.BASE_URL}home/brands-en/brand-${item.id}-rag.svg`
                            : assets[`../examples/assets/brand-${item.id}-rag.svg`]
                        }
                        alt={t('{brand} 风格的 RAG 架构图').replace('{brand}', t(item.name))}
                        loading={i < 9 ? 'eager' : 'lazy'}
                        draggable={false}
                      />
                    </span>
                    <span className="record-caption">
                      <span>
                        {t(brandDescriptions[item.id]?.label ?? item.summary.split(' · ')[0])}
                      </span>
                      <span>{t('原生 SVG')}</span>
                    </span>
                    <span className="record-palette" aria-hidden="true">
                      {item.palette.slice(0, 6).map((c, index) => (
                        <i key={index} style={{ background: c }} />
                      ))}
                    </span>
                    <span className="record-bottom">
                      <span>RAG / KNOWLEDGE → ANSWER</span>
                      {locked === i ? <Check size={16} /> : <ArrowUpRight size={16} />}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="record-shelf home-width" aria-hidden="true">
          <span /> <span>JUST DIAGRAMS. JUST SVG.</span>
          <span />
        </div>
        <div className="record-details home-width">
          <div className="record-current" aria-live="polite">
            <strong>{t(brand.name)}</strong>
            <p>{t(brandDescriptions[brand.id]?.description ?? brand.summary)}</p>
          </div>
          <div className="record-actions">
            <span className="record-status">
              {locked === active ? (
                <>
                  <Check size={13} />
                  {t('已保留此风格')}
                </>
              ) : (
                t('划过预览整页 · 点击保留')
              )}
            </span>
            <button
              className="record-reset"
              aria-label={t('还原首页风格')}
              onClick={() => {
                setLocked(null);
                isBrowsing.current = false;
                setBrowsing(false);
                preview(null);
              }}
            >
              <RotateCcw size={17} />
            </button>
            <div className="record-arrows">
              <button
                aria-label={t('上一种品牌风格')}
                disabled={active === 0}
                onClick={() => {
                  select(active - 1);
                  deck.center(active - 1);
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                aria-label={t('下一种品牌风格')}
                disabled={active === records.length - 1}
                onClick={() => {
                  select(active + 1);
                  deck.center(active + 1);
                }}
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <a className="home-action" href={href} onClick={(event) => homeRoute(event, href)}>
              {t('打开风格示例')}
              <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </div>
      <div className="record-notes home-width">
        <p>{t('品牌灵感示例，由 JustSVG 制作，非品牌官方模板。')}</p>
        <span>{t('移动鼠标翻阅 · 两端继续 · 触屏横滑 · ← →')}</span>
      </div>
    </section>
  );
}
