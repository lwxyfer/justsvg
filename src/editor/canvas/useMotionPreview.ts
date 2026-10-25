import { useEffect, type RefObject } from 'react';
/** Preview controls live outside the document; exporting never records an editor pause. */
export function useMotionPreview(
  host: RefObject<HTMLDivElement | null>,
  root: SVGSVGElement | null,
  revision: number,
  playing: boolean,
) {
  useEffect(() => {
    const shadow = host.current?.shadowRoot;
    if (!shadow || !root) return;
    const style = document.createElement('style');
    shadow.append(style);
    const outside = new Set<string>();
    const update = () => {
      const paused = !playing || document.hidden;
      const selectors = paused
        ? '[data-sf-motion],[data-sf-motion-overlay]'
        : [...outside].map((id) => `#${id},#${id}>[data-sf-motion-overlay]`).join(',');
      style.textContent = selectors ? `${selectors}{animation-play-state:paused!important}` : '';
    };
    update();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!/^[A-Za-z_][\w-]{0,160}$/.test(entry.target.id)) continue;
          if (entry.isIntersecting) outside.delete(entry.target.id);
          else outside.add(entry.target.id);
        }
        update();
      },
      { root: host.current?.closest('[data-canvas]') || null },
    );
    root.querySelectorAll('[data-sf-motion]').forEach((el) => observer.observe(el));
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      style.remove();
      document.removeEventListener('visibilitychange', update);
    };
  }, [host, root, revision, playing]);
}
