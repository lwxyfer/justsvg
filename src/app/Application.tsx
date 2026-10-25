import { lazy, Suspense, useEffect } from 'react';
import { App } from './App';
import { useLocation, examplesHref } from './routing';
const ExamplesPage = lazy(() => import('../examples/ExamplesPage'));
export function Application() {
  const location = useLocation(),
    examples = location.split('?')[0].replace(/\/$/, '') === examplesHref.replace(/\/$/, '');
  useEffect(() => {
    document.title = examples ? 'Example 示例 · JustSVG' : 'JustSVG — SVG 原生 Diagram 工具';
  }, [examples]);
  return (
    <>
      <App active={!examples} />
      {examples && (
        <Suspense
          fallback={
            <main className="examples-loading" role="status">
              正在打开示例库…
            </main>
          }
        >
          <ExamplesPage />
        </Suspense>
      )}
    </>
  );
}
