import { useId, useLayoutEffect, useRef, useState, useEffect, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import './ExampleSelect.css';
import { useLocale } from '../i18n/locale';

interface Option {
  value: string;
  label: string;
  palette?: string[];
}

function Palette({ colors }: { colors?: string[] }) {
  return colors ? (
    <span className="example-select-palette" aria-hidden="true">
      {colors.slice(0, 3).map((color, i) => (
        <i key={i} style={{ background: color }} />
      ))}
    </span>
  ) : null;
}

export function ExampleSelect({
  label,
  value,
  options,
  onChange,
  menuOffset = 8,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  menuOffset?: number;
}) {
  const { t } = useLocale();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState({ above: false, left: 0, width: 300, height: 320 });
  const selected = options.find((option) => option.value === value);
  const filtered = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const searchable = options.length > 8;

  const reveal = (last = false) => {
    setQuery('');
    setActive(
      last
        ? options.length - 1
        : Math.max(
            0,
            options.findIndex((option) => option.value === value),
          ),
    );
    setOpen(true);
  };
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  };
  const commit = (option: Option) => {
    close(true);
    onChange(option.value);
  };
  useLayoutEffect(() => {
    if (!open) return;
    const box = trigger.current!.getBoundingClientRect();
    const pane = root.current!.closest('.image-detail')?.getBoundingClientRect();
    const below = Math.min(innerHeight, pane?.bottom ?? innerHeight) - box.bottom - menuOffset - 8;
    const above = box.top - (pane?.top ?? 0) - 16;
    const useAbove = below < 160 && above > below;
    const width = Math.min(300, innerWidth - 24, pane ? pane.width - 32 : Infinity);
    const left = Math.max(
      pane ? pane.left + 16 : 12,
      Math.min(box.left, (pane ? pane.right - 16 : innerWidth - 12) - width),
    );
    setPlacement({
      above: useAbove,
      left: left - box.left,
      width,
      height: Math.max(80, Math.min(360, useAbove ? above : below)),
    });
    if (searchable) searchRef.current?.focus({ preventScroll: true });
  }, [open, searchable, menuOffset]);
  useLayoutEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id, query]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  const keyboard = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      if (!open && ['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      if (!open) reveal(event.key === 'ArrowUp');
      else
        setActive((index) =>
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? filtered.length - 1
              : Math.max(
                  0,
                  Math.min(filtered.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)),
                ),
        );
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      event.stopPropagation();
      if (filtered[active]) commit(filtered[active]);
    } else if (event.key === 'Tab' && open) close(true);
  };

  return (
    <div
      className="example-select"
      ref={root}
      onKeyDown={keyboard}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <button
        ref={trigger}
        className="example-select-trigger"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-controls={`${id}-list`}
        aria-expanded={open}
        aria-activedescendant={open && filtered[active] ? `${id}-${active}` : undefined}
        data-value={value}
        title={selected?.label}
        onClick={() => (open ? close() : reveal())}
      >
        <Palette colors={selected?.palette} />
        <span>{selected?.label}</span>
        <ChevronDown size={13} className="example-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div
          className={`example-select-popover ${placement.above ? 'above' : ''}`}
          style={{
            maxHeight: placement.height,
            width: placement.width,
            left: placement.left,
            top: placement.above ? undefined : `calc(100% + ${menuOffset}px)`,
          }}
        >
          {searchable && (
            <div className="example-select-search">
              <Search size={14} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                aria-label={`${t('搜索示例')} ${label}`}
                placeholder={t('搜索名称…')}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                aria-controls={`${id}-list`}
                aria-activedescendant={filtered[active] ? `${id}-${active}` : undefined}
              />
            </div>
          )}
          <div role="listbox" id={`${id}-list`} aria-label={label} className="example-select-list">
            {filtered.map((option, index) => (
              <div
                key={option.value}
                id={`${id}-${index}`}
                role="option"
                aria-selected={option.value === value}
                data-value={option.value}
                className={`example-select-option ${active === index ? 'is-active' : ''}`}
                onPointerMove={() => setActive(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => commit(option)}
              >
                <Palette colors={option.palette} />
                <span>{option.label}</span>
                {option.value === value && <Check size={14} aria-hidden="true" />}
              </div>
            ))}
            {!filtered.length && (
              <p className="example-select-empty" role="status">
                {t('没有匹配的风格')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
