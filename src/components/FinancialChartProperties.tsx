import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  readFinancialChart,
  financialSummary,
  amount,
  type FinancialChart,
} from '../editor/charts/financial';
import { updateFinancialChart } from '../editor/charts/editing';
import { engine } from '../editor/document/engine';
import './financial-chart.css';
export function FinancialChartProperties({ chart }: { chart: SVGGraphicsElement }) {
  let initial: FinancialChart;
  try {
    initial = readFinancialChart(chart);
  } catch (error) {
    return (
      <p className="notice" role="alert">
        {(error as Error).message}
      </p>
    );
  }
  return <ChartForm key={chart.getAttribute('data-sf-chart')} chart={chart} initial={initial} />;
}
function ChartForm({ chart, initial }: { chart: SVGGraphicsElement; initial: FinancialChart }) {
  const [draft, setDraft] = useState(initial),
    [error, setError] = useState('');
  const [numbers, setNumbers] = useState(() => ({
    start: String(initial.start),
    values: initial.rows.map((row) => String(row.value)),
    budgets: initial.rows.map((row) => String(row.budget ?? 0)),
  }));
  const patchRow = (i: number, name: 'values' | 'budgets', value: string) =>
    setNumbers((all) => ({ ...all, [name]: all[name].map((old, j) => (j === i ? value : old)) }));
  const summary = financialSummary(initial);
  return (
    <form
      className="financial-chart-form"
      aria-label="财务图表数据"
      onSubmit={(event) => {
        event.preventDefault();
        setError('');
        try {
          if (
            [
              numbers.start,
              ...numbers.values,
              ...(draft.kind === 'budget' ? numbers.budgets : []),
            ].some((value) => !value.trim())
          )
            throw new Error('请填完整金额，空白不能作为零。');
          updateFinancialChart(engine, chart, {
            ...draft,
            start: Number(numbers.start),
            rows: draft.rows.map((row, i) => ({
              label: row.label,
              value: Number(numbers.values[i]),
              ...(draft.kind === 'budget' ? { budget: Number(numbers.budgets[i]) } : {}),
            })),
          });
        } catch (cause) {
          setError((cause as Error).message);
        }
      }}
    >
      <p className="financial-chart-help">金额、比例与合计一起更新。应用数据会重新排列此图表。</p>
      {(['title', 'period', 'unit'] as const).map((key, i) => (
        <label key={key}>
          <span>{['图表标题', '统计期间', '金额单位'][i]}</span>
          <input
            aria-label={['图表标题', '统计期间', '金额单位'][i]}
            value={draft[key]}
            onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
          />
        </label>
      ))}
      <label>
        <span>有利方向</span>
        <select
          aria-label="有利方向"
          value={draft.direction}
          onChange={(event) =>
            setDraft({ ...draft, direction: event.target.value as 'higher' | 'lower' })
          }
        >
          <option value="higher">数值增加</option>
          <option value="lower">数值减少</option>
        </select>
      </label>
      {draft.kind === 'waterfall' && (
        <label>
          <span>期初金额</span>
          <input
            type="number"
            step="0.01"
            aria-label="期初金额"
            value={numbers.start}
            onChange={(event) => setNumbers({ ...numbers, start: event.target.value })}
          />
        </label>
      )}
      <div className={`financial-data-head ${draft.kind}`}>
        <span>项目</span>
        {draft.kind === 'budget' && <span>预算</span>}
        <span>{draft.kind === 'budget' ? '实际' : '变化'}</span>
        <span />
      </div>
      {draft.rows.map((row, i) => (
        <div className={`financial-data-row ${draft.kind}`} key={i}>
          <input
            aria-label={`项目名称 ${i + 1}`}
            value={row.label}
            onChange={(event) =>
              setDraft({
                ...draft,
                rows: draft.rows.map((old, j) =>
                  j === i ? { ...old, label: event.target.value } : old,
                ),
              })
            }
          />
          {draft.kind === 'budget' && (
            <input
              type="number"
              step="0.01"
              aria-label={`预算金额 ${i + 1}`}
              value={numbers.budgets[i]}
              onChange={(event) => patchRow(i, 'budgets', event.target.value)}
            />
          )}
          <input
            type="number"
            step="0.01"
            aria-label={`${draft.kind === 'budget' ? '实际金额' : '变化金额'} ${i + 1}`}
            value={numbers.values[i]}
            onChange={(event) => patchRow(i, 'values', event.target.value)}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={`移除数据项目 ${i + 1}`}
            disabled={draft.rows.length <= 2}
            onClick={() => {
              setDraft({ ...draft, rows: draft.rows.filter((_, j) => i !== j) });
              setNumbers({
                ...numbers,
                values: numbers.values.filter((_, j) => i !== j),
                budgets: numbers.budgets.filter((_, j) => i !== j),
              });
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        className="text-button"
        type="button"
        disabled={draft.rows.length >= 8}
        onClick={() => {
          setDraft({ ...draft, rows: [...draft.rows, { label: '新项目', value: 0, budget: 0 }] });
          setNumbers({
            ...numbers,
            values: [...numbers.values, '0'],
            budgets: [...numbers.budgets, '0'],
          });
        }}
      >
        <Plus size={13} />
        增加项目
      </button>
      <p className="financial-chart-total">
        {initial.kind === 'budget'
          ? `已应用：实际 ${amount(summary.total)} / 预算 ${amount(summary.budget)}`
          : `已应用：期末 ${amount(summary.total)}`}{' '}
        {initial.unit}
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button type="submit" className="button primary">
        应用图表数据
      </button>
    </form>
  );
}
