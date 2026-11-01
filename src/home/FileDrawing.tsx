import { diagramGeometry, edges, emptyEdits, nodeColor, nodes, themes } from './diagramModel';
import type { DiagramEdits, HomeTheme } from './diagramModel';

export function FileDrawing({
  closing = false,
  landscape = false,
  theme = 'native',
  edits = emptyEdits(),
}: {
  closing?: boolean;
  landscape?: boolean;
  theme?: HomeTheme;
  edits?: DiagramEdits;
}) {
  const variant = landscape ? 'skill' : 'editor';
  const ink = themes[theme].ink;
  const geometry = (id: (typeof nodes)[number]['id']) => diagramGeometry(id, variant, emptyEdits());
  return (
    <svg
      className={`file-drawing ${landscape ? 'is-landscape' : ''}`}
      viewBox={landscape ? '0 0 460 255' : '0 0 200 230'}
      aria-hidden="true"
    >
      <path
        className="file-outline"
        d={landscape ? 'M12 10H410L448 48V240H12Z' : 'M16 8H144L184 48V220H16Z'}
        fill="var(--home-panel)"
        stroke="var(--home-accent)"
        strokeWidth="2"
      />
      <path
        d={landscape ? 'M410 10V48H448' : 'M144 8V48H184'}
        fill="none"
        stroke="var(--home-accent)"
        strokeWidth="2"
      />
      {landscape && (
        <text
          x="30"
          y="40"
          fill="var(--home-ink)"
          fontFamily="Arial, sans-serif"
          fontSize="20"
          fontWeight="700"
        >
          rag-system.svg
        </text>
      )}
      <g transform={landscape ? 'translate(17 58) scale(.296)' : 'translate(27 57) scale(.143)'}>
        <g fill="none" stroke={ink} strokeWidth="2">
          {edges.map(({ from, to, vertical: initial }) => {
            const vertical = landscape && (from === 'retrieve' || from === 'llm') ? false : initial;
            const a = geometry(from),
              b = geometry(to),
              p = vertical
                ? [a.x + a.width / 2, a.y + a.height]
                : [a.x + a.width, a.y + a.height / 2],
              q = vertical ? [b.x + b.width / 2, b.y] : [b.x, b.y + b.height / 2];
            return (
              <path
                key={from + to}
                d={
                  vertical
                    ? `M${p}V${(p[1] + q[1]) / 2}H${q[0]}V${q[1]}`
                    : `M${p}H${(p[0] + q[0]) / 2}V${q[1]}H${q[0]}`
                }
              />
            );
          })}
        </g>
        {nodes.map((node) => {
          const pos = geometry(node.id);
          return (
            <g key={node.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                rx="6"
                fill={edits.colors[node.id] || nodeColor(theme, node.id)}
                stroke={themes[theme].line}
                strokeWidth="1.5"
              />
              <text
                x={pos.x + pos.width / 2}
                y={pos.y + pos.height / 2 + 6}
                fill={
                  theme === 'native' &&
                  ['retrieve', 'answer'].includes(node.id) &&
                  !edits.colors[node.id]
                    ? '#fff'
                    : ink
                }
                fontFamily="Arial, sans-serif"
                fontSize="17"
                textAnchor="middle"
              >
                {edits.labels[node.id] || node.label}
              </text>
            </g>
          );
        })}
      </g>
      {!landscape && (
        <text
          x="30"
          y="199"
          fill="var(--home-ink)"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="700"
        >
          {closing ? '</svg>' : '.svg'}
        </text>
      )}
    </svg>
  );
}
