import { describe, expect, it } from 'vitest';
import {
  financialSummary,
  renderFinancialChart,
  validateFinancialChart,
  readFinancialChart,
  type FinancialChart,
} from '../../src/editor/charts/financial';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
import { DocumentEngine } from '../../src/editor/document/engine';
import { updateFinancialChart } from '../../src/editor/charts/editing';
const model: FinancialChart = {
  version: 1,
  kind: 'waterfall',
  theme: 'review',
  title: '利润变化',
  period: '2026 Q3',
  unit: '万元',
  direction: 'higher',
  start: 0.1,
  rows: [
    { label: '增加', value: 0.2 },
    { label: '减少', value: -0.1 },
  ],
};
describe('financial data and native chart updates', () => {
  it('reconciles amounts in integer minor units, including negative totals', () => {
    expect(financialSummary(model)).toMatchObject({ total: 0.2, change: 0.1 });
    expect(
      financialSummary({
        ...model,
        start: -10,
        rows: [
          { label: '一', value: -20 },
          { label: '二', value: 5 },
        ],
      }),
    ).toMatchObject({ total: -25, change: -15 });
    expect(
      financialSummary({
        ...model,
        kind: 'budget',
        rows: [
          { label: '一', budget: 0.1, value: 0.2 },
          { label: '二', budget: 0.2, value: 0.1 },
        ],
      }),
    ).toEqual({ budget: 0.3, total: 0.3, change: 0 });
  });
  it.each([NaN, Infinity, 1e12, 0.001])('rejects unsafe or imprecise amounts %s', (value) => {
    expect(() => validateFinancialChart({ ...model, start: value })).toThrow();
  });
  it('bounds metadata, category lengths, model versions and expense values', () => {
    for (const patch of [
      { rows: [] },
      { rows: Array(9).fill(model.rows[0]) },
      { version: 2 },
      { kind: 'pie' },
      { unit: '' },
      { rows: [{ label: '很长'.repeat(20), value: 1 }, model.rows[1]] },
      {
        kind: 'budget',
        rows: [
          { label: '一', value: -1, budget: 10 },
          { label: '二', value: 2, budget: 3 },
        ],
      },
    ])
      expect(() => validateFinancialChart({ ...model, ...patch })).toThrow();
  });
  it('escapes metadata and content and preserves native figures through sanitization', () => {
    const safe = sanitizeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${renderFinancialChart({ ...model, title: '产品 & "研发"' })}</svg>`,
    );
    expect(safe.warnings).toEqual([]);
    expect(safe.root.querySelector('script,image,foreignObject')).toBeNull();
    expect(readFinancialChart(safe.root.querySelector('[data-sf-chart]')!).title).toBe(
      '产品 & "研发"',
    );
    expect(safe.root.querySelectorAll('[data-sf-chart-bar]')).toHaveLength(4);
  });
  it('keeps finite geometry for empty values, all-negative and large-value domains', () => {
    for (const [start, value] of [
      [0, 0],
      [-100, -20],
      [1e9, -1e9],
    ]) {
      const xml = renderFinancialChart({
        ...model,
        start,
        rows: [
          { label: '一', value },
          { label: '二', value },
        ],
      });
      expect(xml).not.toMatch(/(?:NaN|Infinity)/);
      const root = new DOMParser().parseFromString(`<svg>${xml}</svg>`, 'image/svg+xml');
      for (const rect of root.querySelectorAll('rect'))
        expect(Number(rect.getAttribute('height'))).toBeGreaterThanOrEqual(0);
    }
  });
  it('updates only the chart, preserves outer transforms and uses one undo transaction', () => {
    const engine = new DocumentEngine();
    engine.importSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><g id="unrelated"><text>Keep</text></g><g transform="translate(12 8)">${renderFinancialChart(model)}</g></svg>`,
    );
    const chart = engine.root!.querySelector<SVGGElement>('[data-sf-chart]')!;
    chart.setAttribute('transform', 'scale(.8)');
    const before = engine.exportSvg();
    updateFinancialChart(engine, chart, { ...model, start: 100 });
    expect(engine.past).toHaveLength(1);
    expect(chart.getAttribute('transform')).toBe('scale(.8)');
    expect(engine.root!.querySelector('#unrelated')!.textContent).toBe('Keep');
    const changed = engine.exportSvg();
    engine.undo();
    expect(engine.exportSvg()).toBe(before);
    engine.redo();
    expect(engine.exportSvg()).toBe(changed);
    const safe = sanitizeSvg(changed);
    expect(readFinancialChart(safe.root.querySelector('[data-sf-chart]')!).start).toBe(100);
  });
  it('does not write an invalid draft and directs numeric text edits to the data panel', () => {
    const engine = new DocumentEngine();
    engine.importSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${renderFinancialChart(model)}</svg>`,
    );
    const before = engine.exportSvg(),
      chart = engine.root!.querySelector<SVGGElement>('[data-sf-chart]')!;
    expect(() => updateFinancialChart(engine, chart, { ...model, start: NaN })).toThrow();
    expect(engine.exportSvg()).toBe(before);
    expect(engine.past).toHaveLength(0);
    const text = chart.querySelector<SVGTextElement>('[data-sf-chart-managed]')!;
    expect(() => engine.updateText(text, ['999'])).toThrow(/图表数据/);
  });
});
