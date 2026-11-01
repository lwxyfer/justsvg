import { useEffect, useRef, type ReactNode } from 'react';

/** Native disclosure with consistent dismissal for editor action menus. */
export function Dropdown({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: Event) => {
      const menu = ref.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target))
        menu.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !ref.current?.open) return;
      event.preventDefault();
      event.stopPropagation();
      ref.current.open = false;
      ref.current.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('focusin', outside);
    window.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('focusin', outside);
      window.removeEventListener('keydown', escape, true);
    };
  }, []);
  return (
    <details
      ref={ref}
      className={`dropdown ${className}`}
      onClick={(event) => {
        if ((event.target as Element).closest('.dropdown-menu button:not(:disabled)'))
          event.currentTarget.open = false;
      }}
    >
      {children}
    </details>
  );
}
