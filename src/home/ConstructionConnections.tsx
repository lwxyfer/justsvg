import { useId, useLayoutEffect, useRef } from 'react';

type Kind = 'specimens' | 'task-diagram' | 'skill-file' | 'export-file';
export function ConstructionConnections({ kind }: { kind: Kind }) {
  const root = useRef<SVGSVGElement>(null);
  const id = useId();
  useLayoutEffect(() => {
    const svg = root.current!,
      section = svg.closest('section')!;
    let frame = 0,
      alive = true;
    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      const pairs =
        kind === 'specimens'
          ? [
              ['.native-copy h1 > span', '.primitive-strip > div:nth-child(1) svg > rect'],
              [
                '.hero-diagram .node-selection',
                '.primitive-strip > div:nth-child(3) svg > rect:nth-of-type(2)',
              ],
            ]
          : kind === 'task-diagram'
            ? [['.skill-send', '.skill-diagram [data-node="docs"] .node-shell']]
            : kind === 'skill-file'
              ? [['.skill-diagram [data-node="answer"] .node-shell', '.skill-file .file-outline']]
              : [['.editor-preview', '.export-file .file-outline']];
      pairs.forEach(([a, b], index) => {
        const source = section.querySelector(a)?.getBoundingClientRect(),
          target = section.querySelector(b)?.getBoundingClientRect();
        if (!source || !target) return;
        const x1 =
          kind === 'task-diagram'
            ? source.right - bounds.left
            : kind === 'specimens'
              ? source.right - bounds.left + 6
              : source.left - bounds.left + source.width * (kind === 'export-file' ? 0.2 : 0.5);
        const y1 =
          (kind === 'task-diagram' || (kind === 'specimens' && index === 1)
            ? source.top + source.height * 0.5
            : source.bottom) - bounds.top;
        const x2 =
          kind === 'specimens'
            ? target.left - bounds.left + target.width * 0.5
            : kind === 'skill-file'
              ? target.right - bounds.left
              : target.left - bounds.left;
        const y2 =
          kind === 'specimens'
            ? target.top - bounds.top
            : target.top - bounds.top + target.height * 0.55;
        const bend = kind === 'specimens' ? (y1 + y2) / 2 : Math.max(y1 + 40, y2);
        const path = svg.querySelectorAll('path')[index];
        const stackedTask = kind === 'task-diagram' && source.bottom < target.top;
        const taskX = source.left - bounds.left + source.width / 2;
        const taskY = source.bottom - bounds.top;
        const nodeX = target.left - bounds.left + target.width / 2;
        const nodeY = target.top - bounds.top;
        const exportBend = y1 + 6;
        path?.setAttribute(
          'd',
          kind === 'task-diagram'
            ? stackedTask
              ? `M${taskX} ${taskY}C${taskX} ${nodeY - 15} ${nodeX} ${nodeY - 15} ${nodeX} ${nodeY}`
              : `M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`
            : kind === 'skill-file'
              ? `M${x1} ${y1}C${x1 + 35} ${y1 + 25} ${x2 + 14} ${y1 + 35} ${x2 + 14} ${y2 - 30}Q${x2 + 14} ${y2} ${x2} ${y2}`
              : kind === 'export-file'
                ? `M${x1} ${y1}V${exportBend}Q${x1} ${exportBend + 14} ${x1 + 14} ${exportBend + 14}H${x2 - 14}Q${x2} ${exportBend + 14} ${x2} ${exportBend + 28}V${y2}`
                : `M${x1} ${y1}V${bend - 22}Q${x1} ${bend} ${x1 + (x2 >= x1 ? 24 : -24)} ${bend}C${(x1 + x2) / 2} ${bend} ${x2} ${bend} ${x2} ${y2}`,
        );
        const circles = svg.querySelectorAll('circle');
        circles[index * 2]?.setAttribute('cx', String(stackedTask ? taskX : x1));
        circles[index * 2]?.setAttribute('cy', String(stackedTask ? taskY : y1));
        circles[index * 2 + 1]?.setAttribute('cx', String(stackedTask ? nodeX : x2));
        circles[index * 2 + 1]?.setAttribute('cy', String(stackedTask ? nodeY : y2));
      });
    };
    const schedule = () => {
      if (!frame && alive) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    const mutation = new MutationObserver((records) => {
      if (records.some((r) => !svg.contains(r.target))) schedule();
    });
    mutation.observe(section, {
      subtree: true,
      attributes: true,
      attributeFilter: ['transform', 'width', 'height', 'style', 'class'],
      childList: true,
      characterData: true,
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    void document.fonts.ready.then(() => {
      if (alive) schedule();
    });
    schedule();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [kind]);
  return (
    <svg
      ref={root}
      className={`construction-connections ${kind === 'export-file' ? 'export-route' : kind === 'task-diagram' ? 'task-route' : kind === 'skill-file' ? 'file-handoff-route' : 'specimen-connections'}`}
      aria-hidden="true"
      data-connections={id}
      preserveAspectRatio="none"
    >
      <g
        fill="none"
        stroke="var(--home-accent)"
        strokeWidth={kind === 'specimens' ? 0.8 : 1.6}
        strokeDasharray={kind === 'specimens' ? '3 5' : undefined}
        opacity={kind === 'specimens' ? 0.48 : 1}
      >
        {Array.from({ length: kind === 'specimens' ? 2 : 1 }, (_, i) => (
          <path key={i} pathLength={kind === 'specimens' ? undefined : 1} />
        ))}
      </g>
      <g fill="var(--home-accent)" opacity={kind === 'specimens' ? 0.6 : 1}>
        {Array.from({ length: kind === 'specimens' ? 4 : 2 }, (_, i) => (
          <circle key={i} r={kind === 'specimens' ? 2.5 : 4} />
        ))}
      </g>
    </svg>
  );
}
