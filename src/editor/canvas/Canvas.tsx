import { prepareResize } from '../document/resizing';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Minus, Plus, Scan } from 'lucide-react';
import { insertAsset } from '../insert/actions';
import { run } from '../../components/shared';
import { engine } from '../document/engine';
import {
  intersects,
  snapDelta,
  transformedBounds,
  type Bounds,
  type Point,
} from '../geometry/geometry';
import { useUI } from '../../store/ui';
import { IconButton, useDocument } from '../../components/shared';
import { fitView, zoomTo } from './viewport';
import { TextEditor } from '../../components/TextEditor';
import { SelectionMenu } from '../../components/SelectionMenu';
import { detachEnd, syncConnections } from '../document/connections';
import { syncMotionGeometry } from '../document/motion';
import { useMotionPreview } from './useMotionPreview';
import { useLocale } from '../../i18n/locale';
interface Gesture {
  type: 'move' | 'resize' | 'pan' | 'marquee' | 'endpoint';
  endpoint?: number;
  originalPoints?: Point[];
  resize?: (world: DOMMatrix) => void;
  start: Point;
  last: Point;
  pan: Point;
  originals: Map<SVGGraphicsElement, DOMMatrix>;
  bounds: Bounds | null;
  others: Bounds[];
  handle?: string;
  moved: boolean;
  additive: boolean;
  before: SVGGraphicsElement[];
}
export function Canvas({ fitOnMount = true }: { fitOnMount?: boolean }) {
  const { t } = useLocale();
  const revision = useDocument();
  const ui = useUI();
  const container = useRef<HTMLDivElement>(null),
    host = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const space = useRef(false);
  const overCanvas = useRef(false);
  useMotionPreview(host, engine.root, engine.documentRevision, ui.motionPreview);
  const [selectionMenu, setSelectionMenu] = useState<{ point: Point; position: Point } | null>(
    null,
  );
  const closeSelectionMenu = useCallback(() => setSelectionMenu(null), []);
  const [hover, setHover] = useState<SVGGraphicsElement | null>(null),
    [marquee, setMarquee] = useState<Bounds | null>(null),
    [guides, setGuides] = useState<{ axis: 'x' | 'y'; value: number }[]>([]);
  const b = engine.viewBox();
  const pageSize = engine.pageSize();
  useLayoutEffect(() => {
    if (!host.current || !engine.root) return;
    const shadow = host.current.shadowRoot || host.current.attachShadow({ mode: 'open' });
    if (engine.root.parentNode !== shadow) {
      const style = document.createElement('style');
      style.textContent = `:host{all:initial;display:block} :host > svg{cursor:inherit;display:block;width:${pageSize.width}px!important;height:${pageSize.height}px!important}`;
      shadow.replaceChildren(style, engine.root);
      // Inspectors must measure the restored/imported SVG after it is attached, not its detached snapshot.
      engine.notify('geometry');
    }
  }, [revision, pageSize.width, pageSize.height]);
  useEffect(() => {
    const ro = new ResizeObserver(() => engine.notify('geometry'));
    if (container.current) ro.observe(container.current);
    const frame = fitOnMount ? requestAnimationFrame(fitView) : null;
    return () => {
      ro.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [fitOnMount]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gesture.current) {
        blur();
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (
        e.code === 'Space' &&
        !(
          e.target instanceof HTMLElement &&
          (e.target.closest('input,textarea,select,[contenteditable],[role="dialog"]') ||
            (!overCanvas.current && e.target.closest('button,summary')))
        )
      ) {
        space.current = true;
        e.preventDefault();
        if (container.current) container.current.style.cursor = 'grab';
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        space.current = false;
        if (container.current) container.current.style.cursor = '';
      }
    };
    const blur = () => {
      space.current = false;
      container.current?.removeAttribute('data-panning');
      if (container.current) container.current.style.cursor = '';
      if (gesture.current) {
        engine.cancel();
        if (gesture.current.type === 'marquee') engine.select(gesture.current.before);
        gesture.current = null;
        setMarquee(null);
        setGuides([]);
      }
    };
    const finishOutside = () => {
      if (gesture.current) blur();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    window.addEventListener('pointerup', finishOutside);
    window.addEventListener('pointercancel', finishOutside);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      window.removeEventListener('pointerup', finishOutside);
      window.removeEventListener('pointercancel', finishOutside);
    };
  }, []);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let frame = 0;
    let queue: { dx: number; dy: number; zoom: boolean; x: number; y: number }[] = [];
    const flush = () => {
      frame = 0;
      const events = queue;
      queue = [];
      const state = useUI.getState(),
        rect = el.getBoundingClientRect();
      let { zoom } = state;
      let { x, y } = state.pan;
      for (const event of events) {
        if (event.zoom) {
          const next = Math.max(0.02, Math.min(16, zoom * Math.exp(-event.dy * 0.0018)));
          const cx = event.x - rect.left,
            cy = event.y - rect.top;
          x = cx - ((cx - x) * next) / zoom;
          y = cy - ((cy - y) * next) / zoom;
          zoom = next;
        } else {
          x -= event.dx;
          y -= event.dy;
        }
      }
      if (events.length) state.set({ pan: { x, y }, zoom });
    };
    const wheel = (e: WheelEvent) => {
      if (
        e
          .composedPath()
          .some((target) => target instanceof HTMLElement && target.hasAttribute('data-ui'))
      )
        return;
      if (e.cancelable) e.preventDefault();
      const state = useUI.getState();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      queue.push({
        dx: e.deltaX * unit,
        dy: e.deltaY * unit,
        zoom: !state.wheelModifier || e.ctrlKey || e.metaKey,
        x: e.clientX,
        y: e.clientY,
      });
      if (!frame) frame = requestAnimationFrame(flush);
    };
    el.addEventListener('wheel', wheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('wheel', wheel, true);
      if (frame) cancelAnimationFrame(frame);
      queue = [];
    };
  }, []);
  const point = (p: Point) => {
    const m = engine.root?.getScreenCTM();
    return m ? new DOMPoint(p.x, p.y).matrixTransform(m.inverse()) : p;
  };
  const [overlay, setOverlay] = useState<{
    selection: Bounds | null;
    highlight: Bounds | null;
    marquee: Bounds | null;
    individual: Bounds[];
    guides: { axis: 'x' | 'y'; position: number }[];
    width: number;
    endpoints: { x: number; y: number; index: number }[];
  }>({
    selection: null,
    highlight: null,
    marquee: null,
    individual: [],
    guides: [],
    width: 800,
    endpoints: [],
  });
  useLayoutEffect(() => {
    const rect = container.current?.getBoundingClientRect(),
      ctm = engine.root?.getScreenCTM();
    if (!rect || !ctm) return;
    const matrix = new DOMMatrix().translate(-rect.left, -rect.top).multiply(ctm);
    const screen = (v: Bounds | null) => (v ? transformedBounds(v, matrix) : null);
    // Native SVG measurements must be read after React commits the viewport transform.
    setOverlay({
      selection: screen(engine.selectionBounds()),
      highlight: hover && !engine.selection.includes(hover) ? screen(engine.bounds(hover)) : null,
      marquee: screen(marquee),
      individual: engine.selection
        .map((el) => screen(engine.bounds(el)))
        .filter((v): v is Bounds => !!v),
      guides: guides.map((g) => {
        const p = new DOMPoint(
          g.axis === 'x' ? g.value : b.x,
          g.axis === 'y' ? g.value : b.y,
        ).matrixTransform(matrix);
        return { axis: g.axis, position: g.axis === 'x' ? p.x : p.y };
      }),
      width: rect.width,
      endpoints:
        engine.selection.length === 1
          ? getLinePoints(engine.selection[0]).map((point, index) => {
              const m = engine.selection[0].getScreenCTM();
              if (!m) return { x: 0, y: 0, index };
              const p = new DOMPoint(point.x, point.y).matrixTransform(m);
              return { x: p.x - rect.left, y: p.y - rect.top, index };
            })
          : [],
    });
  }, [revision, ui.zoom, ui.pan.x, ui.pan.y, hover, marquee, guides, b.x, b.y]);
  const isBackground = (el: SVGGraphicsElement | null) => {
    if (!el) return true;
    if (
      el.localName !== 'rect' ||
      el.parentNode !== engine.root ||
      engine.children()[0] !== el ||
      engine.selection.includes(el)
    )
      return false;
    const bounds = engine.bounds(el);
    const epsilon = 0.001;
    return (
      !!bounds &&
      bounds.x <= b.x + epsilon &&
      bounds.y <= b.y + epsilon &&
      bounds.x + bounds.width >= b.x + b.width - epsilon &&
      bounds.y + bounds.height >= b.y + b.height - epsilon
    );
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('[data-ui]') || e.button === 2) return;
    if (ui.textEdit) return;
    if (gesture.current) return;
    const start = { x: e.clientX, y: e.clientY };
    const handle = (e.target as Element).getAttribute('data-handle');
    const endpoint = (e.target as Element).getAttribute('data-endpoint');
    const forcePan = e.button === 1 || space.current;
    const actual = e.nativeEvent
      .composedPath()
      .find((v) => v instanceof Element && engine.root?.contains(v)) as Element | undefined;
    let hit = forcePan
      ? null
      : engine.hitAt(point({ x: e.clientX, y: e.clientY }), actual || null, e.altKey);
    if (hit && getComputedStyle(hit).display === 'none') hit = null;
    if (!e.altKey && isBackground(hit)) hit = null;
    const pan = forcePan;
    const previous = [...engine.selection];
    if (!pan && !handle && endpoint === null) {
      if (hit) {
        if (e.shiftKey) {
          engine.select(
            engine.selection.includes(hit)
              ? engine.selection.filter((el) => el !== hit)
              : [...engine.selection, hit],
          );
        } else if (!engine.selection.includes(hit)) engine.select([hit]);
      }
    }
    const type =
      endpoint !== null ? 'endpoint' : pan ? 'pan' : handle ? 'resize' : hit ? 'move' : 'marquee';
    const bounds = engine.selectionBounds();
    gesture.current = {
      type,
      start,
      last: start,
      pan: { ...ui.pan },
      handle: handle || undefined,
      bounds,
      originals: new Map(engine.selection.map((el) => [el, engine.matrix(el)])),
      others: engine
        .children(engine.scope || engine.root!)
        .filter(
          (el) =>
            !engine.selection.some((s) => s === el || s.contains(el) || el.contains(s)) &&
            !engine.isLocked(el),
        )
        .map((el) => engine.bounds(el))
        .filter((v): v is Bounds => !!v),
      moved: false,
      additive: e.shiftKey,
      before: previous,
      endpoint: endpoint !== null ? Number(endpoint) : undefined,
      originalPoints:
        engine.selection.length === 1 ? getLinePoints(engine.selection[0]) : undefined,
    };
    if (type === 'move' || type === 'resize' || type === 'endpoint') {
      try {
        engine.begin(type === 'move' ? '拖动元素' : '调整元素尺寸');
        if (type === 'resize') gesture.current.resize = prepareResize(engine);
      } catch (error) {
        gesture.current = null;
        engine.cancel();
        ui.message((error as Error).message, true);
      }
    }
    if (type === 'pan' && container.current) {
      container.current.setAttribute('data-panning', 'true');
      container.current.style.cursor = 'grabbing';
    }
    e.preventDefault();
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) {
      const actual = e.nativeEvent
        .composedPath()
        .find((v) => v instanceof Element && engine.root?.contains(v)) as Element | undefined;
      const candidate = engine.hitAt(
        point({ x: e.clientX, y: e.clientY }),
        actual || null,
        e.altKey,
      );
      const next = !e.altKey && isBackground(candidate) ? null : candidate;
      container.current?.toggleAttribute('data-over-element', !!next);
      if (next !== hover) setHover(next);
      return;
    }
    const current = { x: e.clientX, y: e.clientY };
    g.last = current;
    const distance = Math.hypot(current.x - g.start.x, current.y - g.start.y);
    if (distance > 2 && !g.moved) {
      g.moved = true;
      if (g.type === 'marquee' && !g.additive) engine.select([]);
    }
    if (!g.moved) return;
    if (!container.current?.hasPointerCapture(e.pointerId))
      container.current?.setPointerCapture(e.pointerId);
    if (g.type === 'pan') {
      ui.set({ pan: { x: g.pan.x + current.x - g.start.x, y: g.pan.y + current.y - g.start.y } });
      return;
    }
    const a = point(g.start),
      p = point(current);
    let dx = p.x - a.x,
      dy = p.y - a.y;
    if (g.type === 'marquee') {
      setMarquee({
        x: Math.min(a.x, p.x),
        y: Math.min(a.y, p.y),
        width: Math.abs(dx),
        height: Math.abs(dy),
      });
      return;
    }
    try {
      if (g.type === 'endpoint') {
        const el = engine.selection[0],
          matrix = el.getScreenCTM();
        if (!matrix || !g.originalPoints || g.endpoint === undefined) return;
        if (Math.abs(matrix.a * matrix.d - matrix.b * matrix.c) < 1e-12)
          throw new Error(t('连接线坐标不可逆，请先调整父级 Transform。'));
        const a = new DOMPoint(g.start.x, g.start.y).matrixTransform(matrix.inverse()),
          p = new DOMPoint(current.x, current.y).matrixTransform(matrix.inverse());
        const points = g.originalPoints.map((point, i) =>
          i === g.endpoint ? { x: point.x + p.x - a.x, y: point.y + p.y - a.y } : point,
        );
        if (g.endpoint === 0) detachEnd(el, 'start');
        if (g.endpoint === points.length - 1) detachEnd(el, 'end');
        if (el.localName === 'line') {
          const edited = points[g.endpoint];
          el.setAttribute(g.endpoint === 0 ? 'x1' : 'x2', String(edited.x));
          el.setAttribute(g.endpoint === 0 ? 'y1' : 'y2', String(edited.y));
        } else el.setAttribute('points', points.map((p) => `${p.x},${p.y}`).join(' '));
      } else if (g.type === 'move') {
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) dy = 0;
          else dx = 0;
        }
        if (ui.snap && g.bounds && !e.altKey) {
          const snapped = snapDelta(g.bounds, g.others, { x: dx, y: dy }, 5 / ui.zoom);
          dx = snapped.delta.x;
          dy = snapped.delta.y;
          setGuides(snapped.guides);
        }
        for (const [el, original] of g.originals)
          engine.applyWorld(el, new DOMMatrix().translate(dx, dy), original);
      } else if (g.bounds) {
        const box = g.bounds,
          h = g.handle || 'se';
        if (box.width < 0.001 || box.height < 0.001) return;
        let sx = (box.width + (h.includes('w') ? -dx : dx)) / box.width,
          sy = (box.height + (h.includes('n') ? -dy : dy)) / box.height;
        sx = Math.max(0.01, sx);
        sy = Math.max(0.01, sy);
        if (e.shiftKey || ui.aspectLocked) sx = sy = Math.max(sx, sy);
        const anchor = {
          x: h.includes('w') ? box.x + box.width : box.x,
          y: h.includes('n') ? box.y + box.height : box.y,
        };
        const m = new DOMMatrix()
          .translate(anchor.x, anchor.y)
          .scale(sx, sy)
          .translate(-anchor.x, -anchor.y);
        g.resize?.(m);
      }
      syncConnections(engine);
      if (engine.root) syncMotionGeometry(engine.root);
      engine.notify('geometry');
    } catch (error) {
      container.current?.removeAttribute('data-panning');
      gesture.current = null;
      engine.cancel();
      setGuides([]);
      ui.message(error instanceof Error ? error.message : String(error), true);
    }
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    container.current?.removeAttribute('data-panning');
    if (container.current) container.current.style.cursor = space.current ? 'grab' : '';
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    setGuides([]);
    if (g.type === 'marquee' && g.moved) {
      const a = point(g.start),
        p = point(g.last),
        box = {
          x: Math.min(a.x, p.x),
          y: Math.min(a.y, p.y),
          width: Math.abs(p.x - a.x),
          height: Math.abs(p.y - a.y),
        };
      const selected = engine.children(engine.scope || engine.root!).filter((el) => {
        const b = engine.bounds(el);
        return b && intersects(b, box) && !engine.isLocked(el) && !isBackground(el);
      });
      engine.select(g.additive ? [...g.before, ...selected] : selected);
    } else if (g.type === 'marquee' && !g.additive) {
      engine.select([]);
    }
    if (g.type === 'move' || g.type === 'resize' || g.type === 'endpoint') engine.commit();
    setMarquee(null);
    if (container.current?.hasPointerCapture(e.pointerId))
      container.current.releasePointerCapture(e.pointerId);
  };
  const dbl = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('[data-ui]')) return;
    const actual = e.nativeEvent
      .composedPath()
      .find((v) => v instanceof Element && engine.root?.contains(v)) as Element | undefined;
    const hit = engine.hitAt(point({ x: e.clientX, y: e.clientY }), actual || null);
    let text = hit && actual && (hit === actual || hit.contains(actual)) ? actual : undefined;
    while (text && text !== engine.root && text.localName !== 'text')
      text = text.parentElement || undefined;
    if (text?.localName === 'text' && !engine.isLocked(text)) {
      engine.select([text as SVGGraphicsElement]);
      ui.set({ textEdit: true });
      return;
    }
    if (hit?.localName === 'g' || hit?.localName === 'svg') {
      engine.scope = hit;
      engine.select([]);
    }
  };
  const { highlight, marquee: box } = overlay;
  const currentBounds = engine.selectionBounds();
  const selection = currentBounds ? overlay.selection : null;
  return (
    <main
      className={`canvas ${ui.grid ? `with-grid pattern-${ui.gridPattern}` : ''}`}
      data-canvas
      style={{ backgroundColor: ui.background }}
      ref={container}
      onPointerEnter={() => {
        overCanvas.current = true;
      }}
      onPointerLeave={() => {
        overCanvas.current = false;
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => {
        container.current?.removeAttribute('data-panning');
        if (container.current) container.current.style.cursor = space.current ? 'grab' : '';
        if (gesture.current?.type === 'marquee') engine.select(gesture.current.before);
        gesture.current = null;
        engine.cancel();
        setMarquee(null);
        setGuides([]);
      }}
      onDoubleClick={dbl}
      onContextMenu={(e) => {
        if ((e.target as Element).closest('[data-ui]')) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setSelectionMenu({
          point: point({ x: e.clientX, y: e.clientY }),
          position: {
            x: Math.max(8, Math.min(e.clientX - rect.left, rect.width - 290)),
            y: Math.max(8, Math.min(e.clientY - rect.top, rect.height - 330)),
          },
        });
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const assetId = e.dataTransfer.getData('application/x-svg-finisher-asset');
        if (assetId) {
          run(() => insertAsset(assetId, { x: e.clientX, y: e.clientY }));
          return;
        }
        const files = Array.from(e.dataTransfer.files);
        if (files.length) window.dispatchEvent(new CustomEvent('svg-file', { detail: files }));
      }}
    >
      <div className="canvas-document-name" data-ui>
        <span>{engine.name}</span>
        <span>
          {Math.round(pageSize.width)} × {Math.round(pageSize.height)}
        </span>
      </div>
      {engine.scope && (
        <div className="scope-bar" data-ui>
          <button
            onClick={() => {
              engine.scope = null;
              engine.select([]);
            }}
          >
            {t('文档')}
          </button>
          <span>/</span>
          <span>{engine.scope.id || t('分组')}</span>
          <button
            onClick={() => {
              engine.scope =
                engine.scope?.parentElement === engine.root
                  ? null
                  : (engine.scope?.parentElement as unknown as SVGGraphicsElement);
              engine.select([]);
            }}
          >
            {t('退出分组')} Esc
          </button>
        </div>
      )}
      <div
        className="document-stage"
        style={{
          width: pageSize.width,
          height: pageSize.height,
          transform: `translate(${ui.pan.x}px,${ui.pan.y}px) scale(${ui.zoom})`,
        }}
      >
        <div ref={host} data-svg-host />
      </div>
      <div className="canvas-overlay" aria-hidden="true">
        {highlight && (
          <div
            className="hover-box"
            style={{
              left: highlight.x,
              top: highlight.y,
              width: highlight.width,
              height: highlight.height,
            }}
          />
        )}
        {engine.selection.length > 1 &&
          overlay.individual.map((box, i) => {
            return (
              <div
                key={i}
                className="individual-box"
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
              />
            );
          })}
        {selection && (
          <div
            data-testid="selection-box"
            className="selection-box"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
            }}
          >
            {['nw', 'ne', 'sw', 'se'].map((h) => (
              <div key={h} data-handle={h} className={`resize-handle ${h}`} />
            ))}
            <span className="size-tag">
              {Math.round(currentBounds?.width || 0)} × {Math.round(currentBounds?.height || 0)}
            </span>
          </div>
        )}
        {overlay.endpoints.map((p) => (
          <div
            className="endpoint-handle"
            data-endpoint={p.index}
            key={p.index}
            style={{ left: p.x, top: p.y }}
            title={`${t('连接线控制点')} ${p.index + 1}`}
          />
        ))}
        {box && (
          <div
            className="marquee"
            style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
          />
        )}
        {overlay.guides.map((g, i) => (
          <div
            key={i}
            className={`guide guide-${g.axis}`}
            style={g.axis === 'x' ? { left: g.position } : { top: g.position }}
          />
        ))}
      </div>
      {ui.textEdit && engine.selection[0]?.localName === 'text' && (
        <TextEditor
          element={engine.selection[0]}
          position={
            selection
              ? {
                  x: Math.max(12, Math.min(selection.x, overlay.width - 360)),
                  y: Math.max(12, selection.y + selection.height + 12),
                }
              : { x: 20, y: 20 }
          }
        />
      )}
      {selectionMenu && <SelectionMenu {...selectionMenu} onClose={closeSelectionMenu} />}
      <div className="zoom-tools" data-ui>
        <IconButton label={t('缩小 (-)')} onClick={() => zoomTo(ui.zoom / 1.2)}>
          <Minus size={15} />
        </IconButton>
        <button className="zoom-percent" title={t('还原 100%')} onClick={() => zoomTo(1)}>
          {Math.round(ui.zoom * 100)}%
        </button>
        <IconButton label={t('放大 (+)')} onClick={() => zoomTo(ui.zoom * 1.2)}>
          <Plus size={15} />
        </IconButton>
        <span className="separator" />
        <IconButton label={t('适应画布 (Shift+1)')} onClick={fitView}>
          <Scan size={16} />
        </IconButton>
      </div>
      <div className="canvas-hint" data-ui>
        {t('拖动空白处框选')} <span>·</span> {t('Space + 拖动平移')} <span>·</span>{' '}
        {t('右键选择下方对象')}
      </div>
    </main>
  );
}

function getLinePoints(el: SVGGraphicsElement): Point[] {
  if (el.localName === 'line') {
    const line = el as SVGLineElement;
    return [
      { x: line.x1.baseVal.value, y: line.y1.baseVal.value },
      { x: line.x2.baseVal.value, y: line.y2.baseVal.value },
    ];
  }
  if (el.localName === 'polyline') {
    const points = (el as SVGPolylineElement).points;
    return Array.from({ length: points.numberOfItems }, (_, i) => ({
      x: points.getItem(i).x,
      y: points.getItem(i).y,
    }));
  }
  return [];
}
