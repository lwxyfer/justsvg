import { useLayoutEffect, useRef } from 'react';
import { sanitizeSvg } from '../editor/security/sanitize';
export function SvgPreview({ svg, label }: { svg: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const shadow = host.current!.shadowRoot || host.current!.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent =
      ':host{display:block;width:100%;height:100%}:host>svg{display:block;width:100%!important;height:100%!important}';
    const safe = sanitizeSvg(svg);
    shadow.replaceChildren(style, safe.root);
    return () => shadow.replaceChildren();
  }, [svg]);
  return <div className="example-svg" ref={host} role="img" aria-label={label} />;
}

export function FittedSvgPreview({
  svg,
  label,
  width,
  height,
}: {
  svg: string;
  label: string;
  width: number;
  height: number;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const artboard = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const scroll = viewport.current!,
      board = artboard.current!;
    const fit = (availableWidth: number, availableHeight: number) => {
      const scale = Math.max(0, Math.min(availableWidth / width, availableHeight / height));
      board.style.width = `${width * scale}px`;
      board.style.height = `${height * scale}px`;
      scroll.scrollTop = 0;
      scroll.scrollLeft = 0;
    };
    const style = getComputedStyle(scroll);
    fit(
      scroll.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      scroll.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    );
    const observer = new ResizeObserver(([entry]) =>
      fit(entry.contentRect.width, entry.contentRect.height),
    );
    observer.observe(scroll);
    return () => observer.disconnect();
  }, [width, height]);
  return (
    <div className="example-preview-scroll" ref={viewport}>
      <div className="example-artboard" ref={artboard}>
        <SvgPreview svg={svg} label={label} />
      </div>
    </div>
  );
}
