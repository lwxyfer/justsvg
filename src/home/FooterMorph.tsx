import { useId, useRef, useState } from 'react';
import { gsap, useGSAP } from './motion';
import { useHomeLocale } from './homeLocale';

type Mode = 'svg' | 'architecture' | 'flowchart' | 'mindmap';
type Box = { x: number; y: number; w: number; h: number; kind?: 'pill' | 'diamond' };
type Scene = {
  nodes: number[][];
  edges: number[][];
  frames: number[][];
  edgeOpacity: number[];
  frameOpacity: number;
  presence: number;
};
const samples = 88;
// Each letter keeps its identity throughout the sequence: six strokes, six nodes.
const letters = [
  'M130 78L52 150L130 222',
  'M282 48L215 252',
  'M428 116C398 94 343 99 341 133C339 168 426 148 426 183C426 219 366 226 337 201',
  'M465 108L510 213L555 108',
  'M682 123C657 98 601 103 590 147C577 196 637 226 678 185L678 111L678 216C677 252 628 263 596 241',
  'M744 78L822 150L744 222',
];
const restingScale = 0.67;
const restingStroke = 13 * restingScale;
// The glyphs use absolute M/L/C coordinate pairs. Scale only their resting geometry.
const restingLetters = letters.map((d) => {
  let axis = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (value) => {
    const center = axis++ % 2 === 0 ? 430 : 153;
    return (center + (Number(value) - center) * restingScale).toFixed(3);
  });
});
const architectureFrames: Box[] = [
  { x: 172, y: 83, w: 516, h: 56 },
  { x: 172, y: 149, w: 516, h: 62 },
  { x: 172, y: 230, w: 516, h: 56 },
];
const arrangements: Record<Exclude<Mode, 'svg'>, { boxes: Box[]; edges: number[][] }> = {
  architecture: {
    // External client, access tier, parallel services, shared data tier.
    // Containment and stacked boundaries distinguish structure from a process sequence.
    boxes: [
      { x: 378, y: 22, w: 104, h: 30 },
      { x: 378, y: 96, w: 104, h: 30 },
      { x: 235, y: 164, w: 104, h: 32 },
      { x: 521, y: 164, w: 104, h: 32 },
      { x: 235, y: 244, w: 104, h: 28 },
      { x: 521, y: 244, w: 104, h: 28 },
    ],
    edges: [
      [430, 52, 430, 66, 430, 82, 430, 96],
      [430, 126, 430, 146, 287, 146, 287, 164],
      [430, 126, 430, 146, 573, 146, 573, 164],
      [287, 196, 287, 211, 287, 229, 287, 244],
      [573, 196, 573, 211, 573, 229, 573, 244],
      [339, 258, 390, 258, 470, 258, 521, 258],
    ],
  },
  flowchart: {
    boxes: [
      { x: 34, y: 132, w: 78, h: 36, kind: 'pill' },
      { x: 187, y: 132, w: 88, h: 36 },
      { x: 354, y: 114, w: 72, h: 72, kind: 'diamond' },
      { x: 532, y: 64, w: 92, h: 36 },
      { x: 532, y: 204, w: 92, h: 36 },
      { x: 739, y: 132, w: 78, h: 36, kind: 'pill' },
    ],
    edges: [
      [112, 150, 137, 150, 162, 150, 187, 150],
      [275, 150, 300, 150, 329, 150, 354, 150],
      [390, 114, 390, 82, 478, 82, 532, 82],
      [426, 150, 480, 150, 478, 222, 532, 222],
      [624, 82, 692, 82, 671, 150, 739, 150],
      [532, 222, 385, 282, 231, 252, 231, 168],
    ],
  },
  mindmap: {
    boxes: [
      { x: 372, y: 132, w: 116, h: 38 },
      { x: 118, y: 52, w: 94, h: 32 },
      { x: 118, y: 220, w: 94, h: 32 },
      { x: 646, y: 28, w: 94, h: 32 },
      { x: 646, y: 134, w: 94, h: 32 },
      { x: 646, y: 240, w: 94, h: 32 },
    ],
    edges: [
      [372, 143, 292, 143, 292, 68, 212, 68],
      [372, 159, 292, 159, 292, 236, 212, 236],
      [488, 141, 568, 141, 566, 44, 646, 44],
      [488, 151, 548, 151, 586, 150, 646, 150],
      [488, 161, 568, 161, 566, 256, 646, 256],
      [430, 151, 430, 151, 430, 151, 430, 151],
    ],
  },
};
function outline({ x, y, w, h, kind }: Box) {
  if (kind === 'diamond')
    return `M${x + w / 2} ${y}L${x + w} ${y + h / 2}L${x + w / 2} ${y + h}L${x} ${y + h / 2}Z`;
  const r = kind === 'pill' ? h / 2 : 9;
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}
function sample(d: string) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  const length = path.getTotalLength();
  return Array.from({ length: samples }, (_, i) => {
    const p = path.getPointAtLength((length * i) / (samples - 1));
    return [p.x, p.y];
  }).flat();
}
function pointPath(points: number[]) {
  return points.reduce(
    (d, n, i) => d + (i % 2 ? ` ${n.toFixed(2)}` : `${i ? 'L' : 'M'}${n.toFixed(2)}`),
    '',
  );
}
const mix = (a: number[], b: number[], p: number) => a.map((n, i) => n + (b[i] - n) * p);

export function FooterMorph() {
  const { t } = useHomeLocale();
  const arrowId = `footer-arrow-${useId().replace(/[^\w-]/g, '')}`;
  const root = useRef<HTMLButtonElement>(null);
  const current = useRef<Scene | null>(null);
  const scenes = useRef<Record<Mode, Scene> | null>(null);
  const [hovered, hover] = useState(false);
  const [focused, focus] = useState(false);
  const [pinned, pin] = useState(false);
  const [replay, requestReplay] = useState(0);
  const [mode, setMode] = useState<Mode>('svg');
  const active = hovered || focused || pinned;

  useGSAP(
    () => {
      const element = root.current!;
      if (!scenes.current) {
        const rest: Scene = {
          nodes: restingLetters.map(sample),
          edges: Array.from({ length: 6 }, () => [430, 153, 430, 153, 430, 153, 430, 153]),
          frames: architectureFrames.map(() => [430, 153, 0, 0]),
          edgeOpacity: Array(6).fill(0),
          frameOpacity: 0,
          presence: 0,
        };
        scenes.current = {
          svg: rest,
          ...Object.fromEntries(
            Object.entries(arrangements).map(([name, scene]) => [
              name,
              {
                nodes: scene.boxes.map((box) => sample(outline(box))),
                edges: scene.edges,
                frames: architectureFrames.map((box) =>
                  name === 'architecture' ? [box.x, box.y, box.w, box.h] : [430, 153, 0, 0],
                ),
                edgeOpacity: scene.edges.map((_, i) => (name === 'mindmap' && i === 5 ? 0 : 1)),
                frameOpacity: name === 'architecture' ? 1 : 0,
                presence: 1,
              },
            ]),
          ),
        } as Record<Mode, Scene>;
        current.current = rest;
      }
      const nodeEls = [...element.querySelectorAll<SVGPathElement>('.footer-morph-node')];
      const edgeEls = [...element.querySelectorAll<SVGPathElement>('.footer-morph-edge')];
      const frameEls = [...element.querySelectorAll<SVGRectElement>('.footer-morph-frame')];
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      let timeline = gsap.timeline();
      let visible = true;
      function paint(from: Scene, to: Scene, p: number) {
        const presence = from.presence + (to.presence - from.presence) * p;
        const frame: Scene = {
          nodes: from.nodes.map((n, i) => mix(n, to.nodes[i], p)),
          edges: from.edges.map((n, i) => mix(n, to.edges[i], p)),
          frames: from.frames.map((n, i) => mix(n, to.frames[i], p)),
          edgeOpacity: mix(from.edgeOpacity, to.edgeOpacity, p),
          frameOpacity: from.frameOpacity + (to.frameOpacity - from.frameOpacity) * p,
          presence,
        };
        frame.nodes.forEach((points, i) => {
          nodeEls[i].setAttribute('d', pointPath(points));
          nodeEls[i].setAttribute(
            'stroke-width',
            String(restingStroke + (2 - restingStroke) * presence),
          );
          nodeEls[i].setAttribute('fill-opacity', String(presence * 0.96));
          const e = frame.edges[i];
          edgeEls[i].setAttribute('d', `M${e[0]} ${e[1]}C${e.slice(2).join(' ')}`);
          edgeEls[i].setAttribute('opacity', String(frame.edgeOpacity[i]));
        });
        frame.frames.forEach((bounds, i) => {
          ['x', 'y', 'width', 'height'].forEach((attribute, j) =>
            frameEls[i].setAttribute(attribute, String(bounds[j])),
          );
          frameEls[i].setAttribute('opacity', String(frame.frameOpacity * 0.35));
        });
        element.dataset.morphProgress = p.toFixed(3);
        current.current = frame;
        syncBlink();
      }
      function syncBlink() {
        element.dataset.slashBlink = String(
          visible &&
            !document.hidden &&
            !reduced.matches &&
            current.current!.presence === 0 &&
            element.dataset.playback !== 'playing',
        );
      }
      function append(from: Scene, target: Mode, duration: number) {
        const driver = { p: 0 };
        timeline.to(driver, {
          p: 1,
          duration,
          ease: 'power3.inOut',
          onStart: () => setMode(target),
          onUpdate: () => paint(from, scenes.current![target], driver.p),
        });
      }
      function start() {
        timeline.kill();
        timeline = gsap.timeline();
        element.dataset.playback = active ? 'playing' : 'idle';
        if (reduced.matches) {
          const target = active ? 'architecture' : 'svg';
          element.dataset.playback = active ? 'static' : 'idle';
          setMode(target);
          paint(current.current!, scenes.current![target], 1);
          return;
        }
        append(current.current!, active ? 'architecture' : 'svg', active ? 1.05 : 0.65);
        if (active) {
          for (const [from, to] of [
            ['architecture', 'flowchart'],
            ['flowchart', 'mindmap'],
            ['mindmap', 'svg'],
          ] as const) {
            timeline.to({}, { duration: 1.35 });
            append(scenes.current![from], to, to === 'svg' ? 0.8 : 1.15);
          }
          timeline.call(() => {
            element.dataset.playback = 'complete';
            syncBlink();
            pin(false);
          });
        }
        sync();
      }
      function sync() {
        if (visible && !document.hidden) timeline.play();
        else timeline.pause();
        syncBlink();
      }
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      observer.observe(element);
      document.addEventListener('visibilitychange', sync);
      reduced.addEventListener('change', start);
      start();
      return () => {
        timeline.kill();
        observer.disconnect();
        document.removeEventListener('visibilitychange', sync);
        reduced.removeEventListener('change', start);
        delete element.dataset.slashBlink;
      };
    },
    { scope: root, dependencies: [active, replay], revertOnUpdate: true },
  );

  return (
    <button
      ref={root}
      className="footer-close"
      data-morph={mode}
      aria-label={t('将 SVG 变成架构图、流程图和思维导图')}
      aria-pressed={mode !== 'svg'}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') hover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') {
          hover(false);
          pin(false);
        }
      }}
      onFocus={(e) => focus(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => {
        focus(false);
        pin(false);
      }}
      onClick={() => {
        if (pinned && mode !== 'svg') pin(false);
        else {
          pin(true);
          requestReplay((value) => value + 1);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          hover(false);
          focus(false);
          pin(false);
          e.currentTarget.blur();
        }
      }}
    >
      <svg viewBox="0 0 860 305" aria-hidden="true">
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="M1 1L9 5L1 9"
              fill="none"
              stroke="var(--home-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
          {architectureFrames.map((_, i) => (
            <rect
              key={i}
              className="footer-morph-frame"
              rx="9"
              opacity="0"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        <g fill="none" stroke="var(--home-accent)" strokeWidth="1.7" strokeLinecap="round">
          {letters.map((_, i) => (
            <path
              key={i}
              className="footer-morph-edge"
              opacity="0"
              markerEnd={mode === 'flowchart' ? `url(#${arrowId})` : undefined}
            />
          ))}
        </g>
        <g
          className="footer-morph-nodes"
          fill="var(--home-panel)"
          stroke="currentColor"
          strokeWidth={restingStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {restingLetters.map((d, i) => (
            <path
              key={i}
              className={`footer-morph-node${i === 1 ? ' footer-morph-slash' : ''}`}
              d={d}
              fillOpacity="0"
            />
          ))}
        </g>
      </svg>
    </button>
  );
}
