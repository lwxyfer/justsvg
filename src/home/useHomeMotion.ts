import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './motion';

export function useHomeMotion(root: RefObject<HTMLDivElement | null>) {
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.hero-diagram .graph-annotation',
          { opacity: 0.3 },
          { opacity: 1, duration: 1.2, stagger: 0.12, ease: 'power3.out' },
        );
        const hero = root.current!.querySelector<HTMLElement>('.hero-diagram')!;
        const signal = hero.querySelector<SVGCircleElement>('.hero-signal')!;
        const selection = hero.querySelector<SVGGElement>('.node-selection');
        const routes = ['query-retrieve', 'retrieve-context', 'context-llm', 'llm-answer'].map(
          (suffix) =>
            [...hero.querySelectorAll<SVGPolylineElement>('.graph-route')].find((line) =>
              line.id.endsWith(suffix),
            )!,
        );
        const travel = { progress: 0 },
          response = { opacity: 1 };
        const life = gsap.timeline({ repeat: -1, repeatDelay: 1.8, paused: true });
        life.to({}, { duration: 2 });
        routes.forEach((route, i) => {
          life.fromTo(
            travel,
            { progress: 0 },
            {
              progress: 1,
              duration: i === 2 ? 1.35 : 1.05,
              ease: 'none',
              immediateRender: false,
              onStart: () => signal.setAttribute('opacity', '1'),
              onUpdate: () => {
                const point = route.getPointAtLength(route.getTotalLength() * travel.progress);
                signal.setAttribute('cx', String(point.x));
                signal.setAttribute('cy', String(point.y));
              },
              onComplete: () => signal.setAttribute('opacity', '0'),
            },
          );
          if (i === 0 && selection)
            life.fromTo(
              response,
              { opacity: 0.45 },
              {
                opacity: 1,
                duration: 0.45,
                immediateRender: false,
                ease: 'power2.out',
                onUpdate: () => selection.setAttribute('opacity', String(response.opacity)),
              },
            );
          else life.to({}, { duration: 0.18 });
        });
        let visible = false;
        const sync = () => {
          if (visible && !document.hidden) life.play();
          else life.pause();
        };
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            sync();
          },
          { threshold: 0.12 },
        );
        observer.observe(hero);
        document.addEventListener('visibilitychange', sync);
        gsap
          .timeline({
            scrollTrigger: {
              id: 'native-svg-construction',
              trigger: '.native-chapter',
              start: 'top top',
              end: 'bottom 35%',
              scrub: 0.65,
            },
          })
          .fromTo(
            '.primitive-strip > div',
            { y: 20 },
            { y: -12, stagger: 0.08, duration: 1, ease: 'none' },
            0,
          );
        const finishScrub = (trigger: ScrollTrigger) => {
          trigger.getTween()?.progress(1);
        };
        gsap.fromTo(
          '.task-route path',
          { strokeDasharray: 1, strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            autoRound: false,
            ease: 'none',
            scrollTrigger: {
              id: 'skill-task-route',
              trigger: '.skill-chapter',
              start: 'top 70%',
              end: 'top 25%',
              scrub: 0.28,
              onLeave: finishScrub,
            },
          },
        );
        const lines = gsap.utils.toArray<SVGPolylineElement>('.skill-diagram .graph-route');
        lines.forEach((line) => {
          gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
        });
        gsap
          .timeline({
            scrollTrigger: {
              id: 'skill-svg-assembly',
              trigger: '.skill-visual',
              start: 'top 85%',
              end: 'bottom 85%',
              scrub: 0.28,
              onLeave: finishScrub,
            },
          })
          .fromTo(
            '.skill-diagram .node-shell',
            { opacity: 0.15, y: 22 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out' },
            0,
          )
          .to(
            lines,
            { strokeDashoffset: 0, autoRound: false, duration: 0.7, stagger: 0.07, ease: 'none' },
            0.25,
          )
          .fromTo(
            '.file-handoff-route path',
            { strokeDasharray: 1, strokeDashoffset: 1 },
            { strokeDashoffset: 0, autoRound: false, duration: 0.65, ease: 'none' },
            1.5,
          )
          .fromTo(
            '.skill-file',
            { clipPath: 'inset(0 0 100% 0)', y: -24 },
            { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.65, ease: 'power2.out' },
            1.95,
          );
        gsap.fromTo(
          '.export-route path',
          { strokeDasharray: 1, strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            autoRound: false,
            ease: 'none',
            scrollTrigger: {
              id: 'svg-export-route',
              trigger: '.export-bridge',
              start: 'top 110%',
              end: 'bottom 85%',
              scrub: 0.28,
              onLeave: finishScrub,
            },
          },
        );
        return () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', sync);
          life.kill();
          signal.setAttribute('opacity', '0');
          selection?.removeAttribute('opacity');
        };
      });
      let mounted = true;
      let refreshFrame = 0;
      const scheduleRefresh = () => {
        if (!refreshFrame && mounted)
          refreshFrame = requestAnimationFrame(() => {
            refreshFrame = 0;
            ScrollTrigger.refresh();
          });
      };
      const layout = new ResizeObserver(scheduleRefresh);
      layout.observe(root.current!);
      void document.fonts.ready.then(() => {
        scheduleRefresh();
      });
      return () => {
        mounted = false;
        cancelAnimationFrame(refreshFrame);
        layout.disconnect();
        media.revert();
      };
    },
    { scope: root },
  );
}
