import { useEffect, useRef } from 'react';
import type { PointerEvent, RefObject } from 'react';
import { gsap } from './motion';

type Controller = {
  move: (index: number) => void;
  center: (index: number) => void;
  point: (clientX: number) => void;
  stop: () => void;
};
const idle: Controller = { move: () => {}, center: () => {}, point: () => {}, stop: () => {} };

/** One continuous playhead drives the entire fan; hit coordinates never depend on animated covers. */
export function useRecordDeck({
  current,
  count,
  compact,
  onIndex,
}: {
  current: RefObject<number>;
  count: number;
  compact: boolean;
  onIndex: (index: number) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const covers = useRef<(HTMLButtonElement | null)[]>([]);
  const controller = useRef<Controller>(idle);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const track = el.querySelector<HTMLElement>('.record-track')!;
    const elements = covers.current;
    const size = compact ? 256 : 360,
      step = compact ? 62 : 96;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = preference.matches,
      pointerX: number | null = null;
    let edgeFrame = 0,
      edgeTime = 0,
      programmaticUntil = 0;
    const playhead = { value: current.current };
    const clamp = (value: number) => Math.max(0, Math.min(count - 1, value));

    const paint = () => {
      for (let i = 0; i < elements.length; i++) {
        const cover = elements[i];
        if (!cover) continue;
        const distance = i - playhead.value;
        const focus = Math.exp(-Math.pow(distance / 0.95, 2));
        const spread = Math.tanh(distance * 0.9);
        const x = spread * size * 0.44 - size / 2;
        const y = 25 - focus * (compact ? 36 : 52);
        const z = focus * 38 - Math.min(Math.abs(distance), 12) * 3;
        const turn = -Math.tanh(distance * 0.95) * 73;
        cover.style.transform = `perspective(1400px) translate3d(${x}px,${y}px,${z}px) rotateY(${turn}deg) rotateZ(${spread * 1.4}deg)`;
        cover.style.zIndex = String(Math.round(1000 - Math.abs(distance) * 20));
        cover.style.opacity = String(Math.max(0, Math.min(1, 11 - Math.abs(distance))));
      }
    };
    const follow = gsap.quickTo(playhead, 'value', {
      duration: 0.3,
      ease: 'power3.out',
      onUpdate: paint,
      onComplete: () =>
        elements.forEach((cover) => {
          if (cover) cover.style.willChange = '';
        }),
    });
    const move = (value: number) => {
      const next = clamp(value);
      if (reduced) {
        follow.tween.pause();
        playhead.value = next;
        paint();
      } else {
        elements.forEach((cover, i) => {
          if (cover) cover.style.willChange = Math.abs(i - next) < 6 ? 'transform' : '';
        });
        follow(next);
      }
    };
    const aim = (value: number) => {
      const next = clamp(value);
      onIndex(Math.round(next));
      move(next);
    };
    const aimAtPointer = () => {
      if (pointerX !== null) aim((el.scrollLeft + pointerX - el.clientWidth / 2) / step);
    };
    const edgeSpeed = () => {
      if (pointerX === null || reduced || document.hidden) return 0;
      const zone = compact ? 48 : 100;
      if (pointerX < zone) return -Math.pow(1 - pointerX / zone, 2) * 480;
      if (pointerX > el.clientWidth - zone)
        return Math.pow(1 - (el.clientWidth - pointerX) / zone, 2) * 480;
      return 0;
    };
    const panEdge = (time: number) => {
      edgeFrame = 0;
      const speed = edgeSpeed();
      if (!speed) return;
      const dt = edgeTime ? Math.min((time - edgeTime) / 1000, 0.04) : 1 / 60;
      edgeTime = time;
      const previous = el.scrollLeft;
      el.scrollLeft += speed * dt;
      aimAtPointer();
      if (el.scrollLeft !== previous) edgeFrame = requestAnimationFrame(panEdge);
    };
    const point = (clientX: number) => {
      programmaticUntil = 0;
      pointerX = Math.max(0, Math.min(el.clientWidth, clientX - el.getBoundingClientRect().left));
      aimAtPointer();
      if (!edgeFrame && edgeSpeed()) {
        edgeTime = 0;
        edgeFrame = requestAnimationFrame(panEdge);
      }
    };
    const stop = () => {
      pointerX = null;
      cancelAnimationFrame(edgeFrame);
      edgeFrame = 0;
      move(current.current);
    };
    const center = (index: number) => {
      programmaticUntil = performance.now() + 750;
      el.scrollTo({ left: clamp(index) * step, behavior: reduced ? 'instant' : 'smooth' });
    };
    const scroll = () => {
      if (performance.now() < programmaticUntil) return;
      if (pointerX !== null) aimAtPointer();
      else aim(el.scrollLeft / step);
    };
    const userScroll = (event: Event) => {
      programmaticUntil = 0;
      if ('pointerType' in event && event.pointerType === 'touch') stop();
    };
    const resize = () => {
      track.style.width = `${el.clientWidth + (count - 1) * step}px`;
      elements.forEach((cover, i) => {
        if (cover) cover.style.left = `${el.clientWidth / 2 + i * step}px`;
      });
      programmaticUntil = performance.now() + 50;
      el.scrollLeft = current.current * step;
      paint();
    };
    const preferenceChanged = () => {
      reduced = preference.matches;
      if (reduced) stop();
    };
    const hidden = () => {
      if (document.hidden) stop();
    };
    const observer = new ResizeObserver(resize);
    controller.current = { move, center, point, stop };
    observer.observe(el);
    resize();
    el.addEventListener('scroll', scroll, { passive: true });
    el.addEventListener('pointerdown', userScroll, { passive: true });
    el.addEventListener('wheel', userScroll, { passive: true });
    preference.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      controller.current = idle;
      observer.disconnect();
      follow.tween.kill();
      cancelAnimationFrame(edgeFrame);
      el.removeEventListener('scroll', scroll);
      el.removeEventListener('pointerdown', userScroll);
      el.removeEventListener('wheel', userScroll);
      preference.removeEventListener('change', preferenceChanged);
      document.removeEventListener('visibilitychange', hidden);
      elements.forEach((cover) => {
        if (cover) cover.style.willChange = '';
      });
    };
  }, [compact, count, covers, current, onIndex, viewport]);
  return {
    viewport,
    covers,
    move: (index: number) => controller.current.move(index),
    center: (index: number) => controller.current.center(index),
    stop: () => controller.current.stop(),
    pointer: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse') controller.current.point(event.clientX);
    },
  };
}
