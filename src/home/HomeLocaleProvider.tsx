import type { ReactNode } from 'react';
import { LocaleProvider } from '../i18n/locale';

export function HomeLocaleProvider({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
