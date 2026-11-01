import { useEffect, useRef } from 'react';
import { engine } from '../editor/document/engine';
import type { Point } from '../editor/geometry/geometry';
import { useLocale } from '../i18n/locale';

export function SelectionMenu({
  point,
  position,
  onClose,
}: {
  point: Point;
  position: Point;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const candidates = engine
    .all()
    .filter((el) => {
      if (engine.isLocked(el) || getComputedStyle(el).visibility === 'hidden') return false;
      for (let p: Element | null = el; p && p !== engine.root; p = p.parentElement)
        if (getComputedStyle(p).display === 'none') return false;
      const b = engine.bounds(el);
      return (
        b &&
        point.x >= b.x - 3 &&
        point.y >= b.y - 3 &&
        point.x <= b.x + b.width + 3 &&
        point.y <= b.y + b.height + 3
      );
    })
    .reverse()
    .slice(0, 30);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector('button')?.focus();
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="selection-menu"
      data-ui
      role="dialog"
      aria-label={t('选择下方对象')}
      style={{ left: position.x, top: position.y }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <strong>{t('选择当前位置的对象')}</strong>
      <p>{t('按图形边界列出，包含重叠对象与分组。')}</p>
      {candidates.map((el) => (
        <button
          key={engine.key(el)}
          onClick={() => {
            engine.select([el]);
            onClose();
          }}
        >
          <code>&lt;{el.localName}&gt;</code>{' '}
          {el.getAttribute('data-label') || el.id || el.textContent?.slice(0, 30) || t('未命名')}
        </button>
      ))}
      {!candidates.length && <p>{t('此位置没有可选择的对象。')}</p>}
      <button className="text-button" onClick={onClose}>
        {t('关闭')}
      </button>
    </div>
  );
}
