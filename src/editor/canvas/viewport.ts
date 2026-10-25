import { useUI } from '../../store/ui';
import { engine } from '../document/engine';
export function fitView() {
  const el = document.querySelector('[data-canvas]');
  if (!el) return;
  const r = el.getBoundingClientRect(),
    b = engine.pageSize();
  const zoom = Math.max(
    0.02,
    Math.min(4, Math.min((r.width - 100) / b.width, (r.height - 100) / b.height)),
  );
  useUI
    .getState()
    .set({ zoom, pan: { x: (r.width - b.width * zoom) / 2, y: (r.height - b.height * zoom) / 2 } });
}
export function zoomTo(zoom: number, client?: { x: number; y: number }) {
  const el = document.querySelector('[data-canvas]');
  if (!el) return;
  const r = el.getBoundingClientRect(),
    s = useUI.getState();
  zoom = Math.max(0.02, Math.min(16, zoom));
  const x = client ? client.x - r.left : r.width / 2,
    y = client ? client.y - r.top : r.height / 2;
  s.set({
    zoom,
    pan: { x: x - ((x - s.pan.x) * zoom) / s.zoom, y: y - ((y - s.pan.y) * zoom) / s.zoom },
  });
}
