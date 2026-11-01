import type { MouseEvent } from 'react';
import { navigate } from '../app/routing';

export function homeRoute(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(href);
  window.scrollTo(0, 0);
}
