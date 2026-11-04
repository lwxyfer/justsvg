import type { DocumentEngine } from '../document/engine';
import { renderFinancialChart, validateFinancialChart } from './financial';
export function updateFinancialChart(
  engine: DocumentEngine,
  chart: SVGGraphicsElement,
  input: unknown,
) {
  if (!engine.root?.contains(chart) || engine.isLocked(chart))
    throw new Error('请先选中可编辑的图表。');
  const model = validateFinancialChart(input);
  const parsed = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${renderFinancialChart(model)}</svg>`,
    'image/svg+xml',
  );
  if (parsed.querySelector('parsererror')) throw new Error('无法生成图表。');
  const next = parsed.documentElement.firstElementChild!;
  const replaceSelection = engine.selection.some(
    (selected) => selected !== chart && chart.contains(selected),
  );
  engine.transaction('更新财务图表数据', () => {
    if (engine.scope && chart.contains(engine.scope) && engine.scope !== chart)
      engine.scope = chart;
    chart.replaceChildren(...[...next.childNodes].map((node) => document.importNode(node, true)));
    chart.setAttribute('data-sf-chart', next.getAttribute('data-sf-chart')!);
    chart.setAttribute('data-label', model.title);
    if (replaceSelection) engine.select([chart]);
  });
}
