import { useEffect, useRef } from 'react';
import { engine } from '../editor/document/engine';
import { useUI, useChromeUI } from '../store/ui';
import { run } from './shared';
import { useLocale } from '../i18n/locale';

/** One native color-picker session is one history entry, including live changes. */
export function ColorPicker({ name, color }: { name: 'fill' | 'stroke' | 'icon'; color: string }) {
  const { t } = useLocale();
  const active = useRef(false),
    latest = useRef('');
  const ui = useChromeUI();
  const finish = () => {
    if (!active.current) return;
    active.current = false;
    engine.commit();
    if (latest.current) {
      const state = useUI.getState();
      state.set({
        recentColors: [
          latest.current,
          ...state.recentColors.filter((v) => v !== latest.current),
        ].slice(0, 8),
      });
    }
  };
  useEffect(
    () => () => {
      if (active.current) engine.commit();
    },
    [],
  );
  const label = t(
    name === 'icon' ? '图标颜色' : name === 'fill' ? '填充颜色选择器' : '描边颜色选择器',
  );
  const rgb = color.match(/^rgb\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)\s*\)$/);
  const pickerColor = rgb
    ? '#' +
      rgb
        .slice(1)
        .map((v) => Number(v).toString(16).padStart(2, '0'))
        .join('')
    : color;
  return (
    <span className="color-chip" style={{ background: color }}>
      <input
        type="color"
        aria-label={label}
        value={/^#[a-f\d]{6}$/i.test(pickerColor) ? pickerColor : '#2563eb'}
        onChange={(e) =>
          run(() => {
            active.current = true;
            latest.current = e.target.value;
            if (name === 'icon') engine.updateIcon(e.target.value, undefined, true);
            else engine.updateAttributes({ [name]: e.target.value }, true);
          })
        }
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape' && active.current) {
            active.current = false;
            latest.current = '';
            engine.cancel();
            e.currentTarget.blur();
          }
        }}
        list={ui.recentColors.length ? `recent-${name}` : undefined}
      />
      <datalist id={`recent-${name}`}>
        {ui.recentColors.map((value) => (
          <option value={value} key={value} />
        ))}
      </datalist>
    </span>
  );
}
