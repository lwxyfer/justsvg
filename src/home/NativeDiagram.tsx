import { useHomeLocale } from './homeLocale';
import { useId, useRef } from 'react';
import type { Ref, PointerEvent as ReactPointerEvent, KeyboardEvent } from 'react';
import {
  edges,
  nodes,
  diagramGeometry,
  nodeColor,
  nodeWidth as W,
  nodeHeight as H,
  themes,
} from './diagramModel';
import type { DiagramEdits, DiagramVariant, HomeTheme, NodeId, Point } from './diagramModel';

export function NodeGlyph({ id }: { id: NodeId }) {
  if (id === 'retrieve')
    return (
      <>
        <circle cx="13" cy="13" r="10" />
        <path d="m21 21 10 10" />
      </>
    );
  if (id === 'index')
    return (
      <>
        <ellipse cx="16" cy="6" rx="13" ry="5" />
        <path d="M3 6v23c0 7 26 7 26 0V6M3 17c0 7 26 7 26 0" />
      </>
    );
  if (id === 'llm')
    return (
      <>
        <path d="m16 1 16 9-16 9L0 10ZM0 18l16 9 16-9M0 26l16 9 16-9" />
      </>
    );
  if (id === 'embed')
    return (
      <>
        <path d="m16 4-12 24M16 4l12 24" />
        <circle cx="16" cy="4" r="3" />
        <circle cx="4" cy="28" r="3" />
        <circle cx="28" cy="28" r="3" />
      </>
    );
  if (id === 'chunks')
    return (
      <>
        <rect x="1" y="2" width="30" height="5" rx="2" />
        <rect x="1" y="14" width="30" height="5" rx="2" />
        <rect x="1" y="26" width="23" height="5" rx="2" />
      </>
    );
  if (id === 'query') return <path d="M3 3h27v22H13l-10 8ZM9 10h15M9 16h10" />;
  return (
    <>
      <path d="M5 1h15l8 8v25H5ZM20 1v9h8M10 17h13M10 23h13M10 29h8" />
    </>
  );
}

type Props = {
  theme: HomeTheme;
  edits: DiagramEdits;
  construction?: boolean;
  selected?: NodeId;
  interactive?: boolean;
  onSelect?: (id: NodeId) => void;
  onMove?: (id: NodeId, point: Point) => void;
  onStart?: () => void;
  svgRef?: Ref<SVGSVGElement>;
  className?: string;
  variant?: DiagramVariant;
};
export function NativeDiagram({
  theme,
  edits,
  construction = false,
  selected = 'retrieve',
  interactive = false,
  onSelect,
  onMove,
  onStart,
  svgRef,
  className = '',
  variant = 'editor',
}: Props) {
  const { t } = useHomeLocale();
  const prefix = 'rag' + useId().replace(/[^\w-]/g, '');
  const drag = useRef<{ id: NodeId; start: Point; offset: Point; pointer: number } | null>(null);
  const palette = themes[theme];
  const canvasWidth = variant === 'skill' ? 1440 : variant === 'hero' ? 1100 : 1040;
  const canvasHeight = variant === 'hero' ? 710 : variant === 'skill' ? 650 : 590;
  const position = (id: NodeId) => diagramGeometry(id, variant, edits);
  const point = (e: ReactPointerEvent<SVGGElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const down = (e: ReactPointerEvent<SVGGElement>, id: NodeId) => {
    if (!interactive || e.button !== 0) return;
    e.preventDefault();
    onSelect?.(id);
    onStart?.();
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      id,
      start: point(e),
      offset: edits.offsets[id] || { x: 0, y: 0 },
      pointer: e.pointerId,
    };
  };
  const move = (e: ReactPointerEvent<SVGGElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== e.pointerId) return;
    const next = point(e),
      node = nodes.find((n) => n.id === current.id)!;
    onMove?.(current.id, {
      x: Math.max(
        8 - node.x,
        Math.min(1032 - W - node.x, current.offset.x + next.x - current.start.x),
      ),
      y: Math.max(
        12 - node.y,
        Math.min(578 - H - node.y, current.offset.y + next.y - current.start.y),
      ),
    });
  };
  const key = (e: KeyboardEvent<SVGGElement>, id: NodeId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(id);
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    onStart?.();
    const value = edits.offsets[id] || { x: 0, y: 0 },
      step = e.shiftKey ? 20 : 5;
    const base = nodes.find((n) => n.id === id)!;
    onMove?.(id, {
      x: Math.max(
        8 - base.x,
        Math.min(
          1032 - W - base.x,
          value.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0),
        ),
      ),
      y: Math.max(
        12 - base.y,
        Math.min(
          578 - H - base.y,
          value.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0),
        ),
      ),
    });
  };
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      className={`native-diagram ${interactive ? 'is-editable' : ''} ${className}`}
      role={interactive ? 'group' : 'img'}
      aria-label={
        interactive
          ? t('可编辑 RAG 图稿，选中节点后可用方向键移动')
          : theme === 'native'
            ? t('原生 SVG 架构图')
            : t('{style} 风格的 SVG 架构图').replace('{style}', t(palette.name))
      }
    >
      <title>{t('RAG · 从知识到回答')}</title>
      <defs>
        <marker
          id={`${prefix}-arrow`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="m1 1 8 4-8 4" fill="none" stroke={palette.line} strokeWidth="1.5" />
        </marker>
        <linearGradient id={`${prefix}-warm`} x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#fce1b9" />
          <stop offset=".5" stopColor="#ff8f7e" />
          <stop offset="1" stopColor="#f6b4c9" />
        </linearGradient>
        <pattern
          id={`${prefix}-dots`}
          width={theme === 'vercel' ? 32 : 24}
          height={theme === 'vercel' ? 32 : 24}
          patternUnits="userSpaceOnUse"
        >
          {theme === 'vercel' ? (
            <path d="M32 0H0v32" fill="none" stroke="#35373b" strokeWidth=".65" />
          ) : (
            <circle cx="1" cy="1" r=".65" fill={theme === 'figma' ? '#bdb5a7' : '#cbd5e3'} />
          )}
        </pattern>
      </defs>
      <rect
        width={canvasWidth}
        height={canvasHeight}
        fill={theme === 'openai' ? `url(#${prefix}-warm)` : palette.paper}
      />
      {(theme === 'figma' || theme === 'vercel') && (
        <rect width={canvasWidth} height={canvasHeight} fill={`url(#${prefix}-dots)`} />
      )}
      {theme === 'openai' && (
        <g stroke="#fff3e9" opacity=".35" fill="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M${600 + i * 23} 0C${560 + i * 23} 210 890 ${250 + i * 24} 1040 ${260 + i * 24}`}
            />
          ))}
        </g>
      )}
      <g
        className="diagram-links"
        fill="none"
        stroke={palette.line}
        strokeWidth={theme === 'vercel' ? 1.1 : 1.5}
      >
        {edges.map(({ from, to, vertical: baseVertical }) => {
          const vertical =
            variant === 'skill' && (from === 'retrieve' || from === 'llm') ? false : baseVertical;
          const a = position(from),
            b = position(to);
          const start = vertical
            ? [a.x + a.width / 2, a.y + a.height]
            : [a.x + a.width, a.y + a.height / 2];
          const end = vertical ? [b.x + b.width / 2, b.y] : [b.x, b.y + b.height / 2];
          const middle = vertical ? (start[1] + end[1]) / 2 : (start[0] + end[0]) / 2;
          const points = vertical
            ? `${start} ${start[0]},${middle} ${end[0]},${middle} ${end}`
            : `${start} ${middle},${start[1]} ${middle},${end[1]} ${end}`;
          return (
            <polyline
              className="graph-route"
              pathLength={variant === 'skill' ? 1 : undefined}
              key={from + to}
              id={`${prefix}-link-${from}-${to}`}
              data-sf-start-node={`#${prefix}-node-${from}`}
              data-sf-end-node={`#${prefix}-node-${to}`}
              data-sf-start-anchor={vertical ? '0.5 1 0 0' : '1 0.5 0 0'}
              data-sf-end-anchor={vertical ? '0.5 0 0 0' : '0 0.5 0 0'}
              points={points}
              markerEnd={`url(#${prefix}-arrow)`}
              strokeLinejoin="round"
            />
          );
        })}
      </g>
      {variant === 'hero' && (
        <circle
          className="hero-signal"
          data-demo-ui="signal"
          r="4"
          fill="var(--home-accent)"
          stroke="var(--home-paper)"
          strokeWidth="1.5"
          opacity="0"
          pointerEvents="none"
        />
      )}
      {nodes.map((node) => {
        const pos = position(node.id),
          fill = edits.colors[node.id] || nodeColor(theme, node.id);
        const label = edits.labels[node.id] ?? node.label;
        const width = pos.width,
          height = pos.height;
        const stacked = node.id === 'llm' && variant === 'hero';
        const textY = height / 2 - 4;
        const textColor =
          theme === 'native' && !edits.colors[node.id] && ['retrieve', 'answer'].includes(node.id)
            ? '#ffffff'
            : palette.ink;
        const customColor = edits.colors[node.id];
        const darkText = customColor
          ? (() => {
              const r = parseInt(customColor.slice(1, 3), 16),
                g = parseInt(customColor.slice(3, 5), 16),
                b = parseInt(customColor.slice(5, 7), 16);
              return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? '#152032' : '#ffffff';
            })()
          : textColor;
        return (
          <g
            key={node.id}
            className="graph-node"
            data-home-node={node.id}
            data-node={node.id}
            id={`${prefix}-node-${node.id}`}
            transform={`translate(${pos.x} ${pos.y})`}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? (selected === node.id ? 0 : -1) : undefined}
            aria-label={interactive ? `${t('选择节点')} ${label}` : undefined}
            aria-pressed={interactive ? selected === node.id : undefined}
            onPointerDown={(e) => down(e, node.id)}
            onPointerMove={interactive ? move : undefined}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onKeyDown={interactive ? (e) => key(e, node.id) : undefined}
          >
            <g className="node-shell">
              {theme === 'figma' && node.id === 'embed' ? (
                <path
                  d={`M20 0H${width - 20}L${width} ${height / 2} ${width - 20} ${height}H20L0 ${height / 2}Z`}
                  fill={fill}
                />
              ) : (
                <rect
                  width={width}
                  height={height}
                  rx={palette.radius}
                  fill={fill}
                  fillOpacity={theme === 'openai' ? 0.5 : 1}
                  stroke={
                    theme === 'figma'
                      ? stacked
                        ? '#191a21'
                        : 'none'
                      : theme === 'openai'
                        ? '#ffffff'
                        : theme === 'native'
                          ? '#a5b2c7'
                          : '#6f747c'
                  }
                  strokeWidth={theme === 'openai' ? 1.2 : 1}
                />
              )}
              <g
                transform={
                  stacked
                    ? `translate(${width / 2 - 24} 18) scale(1.5)`
                    : `translate(17 ${height / 2 - 18}) scale(.85)`
                }
                fill="none"
                stroke={darkText}
                strokeWidth="1.65"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <NodeGlyph id={node.id} />
              </g>
              <text
                x={stacked ? width / 2 : 61}
                y={stacked ? height - 34 : textY}
                textAnchor={stacked ? 'middle' : undefined}
                fill={darkText}
                fontFamily="Arial, sans-serif"
                fontWeight={theme === 'openai' ? 500 : 600}
                fontSize={stacked ? 24 : Math.min(20, (width - 68) / (label.length * 0.53))}
              >
                {label}
              </text>
              <text
                x={stacked ? width / 2 : 61}
                y={stacked ? height - 13 : textY + 22}
                textAnchor={stacked ? 'middle' : undefined}
                fill={darkText}
                opacity=".78"
                fontFamily="Arial, 'PingFang SC', sans-serif"
                fontSize="11"
              >
                {t(node.detail)}
              </text>
              {theme === 'vercel' && (
                <text
                  x="7"
                  y="-8"
                  fill="#b3b6bc"
                  fontFamily="monospace"
                  fontSize="8"
                >{`/${node.id}.ts`}</text>
              )}
            </g>
            {(interactive || construction) && selected === node.id && (
              <g
                data-demo-ui="selection"
                className="node-selection"
                fill="none"
                stroke="#2855ee"
                strokeWidth="1.4"
                pointerEvents="none"
              >
                <rect x="-4" y="-4" width={width + 8} height={height + 8} />
                {[
                  [0, 0],
                  [width / 2, 0],
                  [width, 0],
                  [0, height / 2],
                  [width, height / 2],
                  [0, height],
                  [width / 2, height],
                  [width, height],
                ].map(([x, y], n) => (
                  <rect key={n} x={x - 4} y={y - 4} width="8" height="8" fill="#fff" />
                ))}
              </g>
            )}
          </g>
        );
      })}
      {construction && <ConstructionNotes variant={variant} theme={theme} />}
    </svg>
  );
}

function ConstructionNotes({ variant, theme }: { variant: DiagramVariant; theme: HomeTheme }) {
  const heroPanels = [
    {
      x: 255,
      y: 45,
      width: 215,
      height: 140,
      lines: [
        '<rect x="0" y="0"',
        ' width="180" height="66"',
        ' rx="7" fill="#F3F6FD" />',
        '<text x="61" y="29">',
        ' Documents</text>',
      ],
    },
    {
      x: 790,
      y: 28,
      width: 260,
      height: 145,
      lines: [
        '<g id="query">',
        ' <rect width="170"',
        '  height="68" rx="7" />',
        ' <text x="61" y="30">',
        '  Query</text>',
        '</g>',
      ],
    },
    {
      x: 435,
      y: 590,
      width: 290,
      height: 101,
      lines: [
        '<rect width="210" height="70" />',
        '<text x="61" y="31">',
        ' Context</text>',
        '<path d="M560,357 L560,495" />',
      ],
    },
  ];
  const skillPanels = [
    {
      x: 485,
      y: 65,
      width: 170,
      height: 115,
      lines: [
        '<rect x="0" y="0"',
        ' width="170" height="68"',
        ' rx="7" fill="#F3F6FD"/>',
        '<text>Documents</text>',
      ],
    },
    {
      x: 865,
      y: 75,
      width: 240,
      height: 130,
      lines: [
        '<g id="query">',
        ' <rect width="170"',
        '  height="68" rx="7" />',
        ' <text>Query</text>',
        '</g>',
      ],
    },
    {
      x: 615,
      y: 485,
      width: 210,
      height: 115,
      lines: [
        '<g id="retriever">',
        ' <rect width="200"',
        '  height="78" />',
        ' <text>Retriever</text>',
        '</g>',
      ],
    },
    {
      x: 850,
      y: 485,
      width: 190,
      height: 115,
      lines: [
        '<rect width="170"',
        ' height="78" />',
        '<text>Context</text>',
        '<path d="M1035…" />',
      ],
    },
    {
      x: 1055,
      y: 215,
      width: 170,
      height: 110,
      lines: ['<rect width="155"', ' height="78" rx="7"/>', '<text>LLM</text>'],
    },
    {
      x: 1235,
      y: 215,
      width: 180,
      height: 110,
      lines: ['<rect width="170"', ' height="78" rx="7"/>', '<text>Answer</text>'],
    },
  ];
  const panels = variant === 'hero' ? heroPanels : skillPanels;
  const ink = theme === 'vercel' ? '#b7c8eb' : '#536eaa';
  return (
    <g data-demo-ui="construction-notes" className="construction-notes" pointerEvents="none">
      <g fill="none" stroke="#6d8cd9" strokeWidth=".65" opacity=".5" strokeDasharray="3 5">
        {variant === 'hero' ? (
          <>
            <path d="M55 40V570M235 40V575M455 235V580M680 235V580M40 65H760M420 357H1050M840 485H1080" />
            <path d="M235 95H255M680 110H790M560 565V590" />
          </>
        ) : (
          <>
            <rect x="8" y="30" width="1424" height="595" />
            <path d="M470 96H485M835 115H865M730 443V485M950 443V485M1142 325V365M1330 325V365" />
          </>
        )}
      </g>
      {panels.map((panel, i) => (
        <g className="graph-annotation" key={i}>
          <rect
            x={panel.x}
            y={panel.y}
            width={panel.width}
            height={panel.height}
            rx="4"
            fill={theme === 'vercel' ? '#172132' : '#f0f5fe'}
            fillOpacity=".96"
            stroke={theme === 'vercel' ? '#3b506c' : '#dce7fb'}
            strokeWidth=".8"
          />
          <text
            fill={ink}
            fontFamily="ui-monospace, monospace"
            fontSize={variant === 'hero' ? 11 : 10}
          >
            {panel.lines.map((line, n) => (
              <tspan key={n} x={panel.x + 13} y={panel.y + 23 + n * 18}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}
      {variant === 'hero' && (
        <g fill="none" stroke="#617496" strokeWidth=".75">
          <path d="M455 370V389M680 370V389M455 381H680M1055 215H1070M1055 347H1070M1063 215V347" />
          <text x="535" y="405" fill={ink} stroke="none" fontFamily="monospace" fontSize="11">
            225 × 82
          </text>
          <text x="1070" y="287" fill={ink} stroke="none" fontFamily="monospace" fontSize="11">
            132
          </text>
        </g>
      )}
    </g>
  );
}
