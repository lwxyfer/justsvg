import { lazy, Suspense, useEffect } from 'react';
import { App } from './App';
import { useLocation, examplesHref, homeHref } from './routing';
import { HomePage } from '../home/HomePage';
import { LocaleProvider, useLocale } from '../i18n/locale';
const ExamplesPage = lazy(() => import('../examples/ExamplesPage'));
export function Application() {
  return (
    <LocaleProvider>
      <ApplicationContent />
    </LocaleProvider>
  );
}
function ApplicationContent() {
  const location = useLocation(),
    path = location.split('?')[0].replace(/\/$/, ''),
    examples = path === examplesHref.replace(/\/$/, ''),
    home = path === homeHref.replace(/\/$/, '');
  const { locale, t } = useLocale();
  useEffect(() => {
    document.title = home
      ? locale === 'en'
        ? 'JustSVG — AI diagrams, editable SVG'
        : 'JustSVG — AI 生成技术图，SVG 直接编辑'
      : examples
        ? `${t('示例库')} · JustSVG`
        : `${t('编辑器')} · JustSVG`;
  }, [examples, home, locale, t]);
  return (
    <>
      <App active={!examples && !home} />
      {home && <HomePage />}
      {examples && (
        <Suspense
          fallback={
            <main className="examples-loading" role="status">
              {t('正在打开示例库…')}
            </main>
          }
        >
          <ExamplesPage />
        </Suspense>
      )}
    </>
  );
}
