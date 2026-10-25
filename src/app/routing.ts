import { useSyncExternalStore } from 'react';
const base = import.meta.env.BASE_URL;
export const editorHref = base;
export const examplesHref = `${base}examples`;
const changed = () => window.dispatchEvent(new PopStateEvent('popstate'));
export function navigate(href: string, replace = false) {
  if (replace) history.replaceState(null, '', href);
  else history.pushState(null, '', href);
  changed();
}
export function useLocation() {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener('popstate', listener);
      return () => window.removeEventListener('popstate', listener);
    },
    () => window.location.pathname + window.location.search,
  );
}
