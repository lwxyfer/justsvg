export interface ChartRow {
  label: string;
  value: number;
  budget?: number;
}
export interface FinancialChart {
  version: 1;
  kind: 'waterfall' | 'budget';
  theme: 'review' | 'report';
  title: string;
  period: string;
  unit: string;
  direction: 'higher' | 'lower';
  start: number;
  rows: ChartRow[];
}
const plain = (value: unknown, max: number) => {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    /[<>]/.test(value) ||
    [...value].length > max ||
    [...value].some((c) => c.charCodeAt(0) < 32)
  )
    throw new Error(`请输入 1–${max} 个字符的文字。`);
  return value.trim();
};
const number = (value: unknown) => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    Math.abs(value) > 1_000_000_000 ||
    Math.abs(value * 100 - Math.round(value * 100)) > 0.0001
  )
    throw new Error('金额须为有限数字，最多两位小数，绝对值不超过十亿。');
  return value;
};
/** Untrusted SVG metadata is decoded into a small, bounded numeric model. */
export function validateFinancialChart(input: unknown): FinancialChart {
  if (!input || typeof input !== 'object') throw new Error('图表数据格式无效。');
  const m = input as Record<string, unknown>;
  if (
    m.version !== 1 ||
    !['waterfall', 'budget'].includes(String(m.kind)) ||
    !['review', 'report'].includes(String(m.theme)) ||
    !['higher', 'lower'].includes(String(m.direction))
  )
    throw new Error('不支持此图表版本或类型。');
  if (!Array.isArray(m.rows) || m.rows.length < 2 || m.rows.length > 8)
    throw new Error('图表需要 2–8 个数据项目。');
  const rows = m.rows.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('数据项目格式无效。');
    const row = item as Record<string, unknown>;
    const value = number(row.value);
    if (m.kind === 'budget') {
      const budget = number(row.budget);
      if (value < 0 || budget < 0) throw new Error('预算和实际金额不能为负数。');
      return { label: plain(row.label, 12), value, budget };
    }
    return { label: plain(row.label, 12), value };
  });
  return {
    version: 1,
    kind: m.kind as FinancialChart['kind'],
    theme: m.theme as FinancialChart['theme'],
    direction: m.direction as FinancialChart['direction'],
    title: plain(m.title, 28),
    period: plain(m.period, 28),
    unit: plain(m.unit, 12),
    start: number(m.start),
    rows,
  };
}
export function readFinancialChart(element: Element): FinancialChart {
  const source = element.getAttribute('data-sf-chart') || '';
  if (source.length > 12000) throw new Error('图表数据过大。');
  try {
    return validateFinancialChart(
      JSON.parse(source.startsWith('%7B') ? decodeURIComponent(source) : source),
    );
  } catch (error) {
    throw new Error(
      error instanceof SyntaxError ? '图表数据无法解析。' : (error as Error).message,
      { cause: error },
    );
  }
}
const cents = (value: number) => Math.round(value * 100);
export const amount = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
const chartAmount = (value: number) =>
  Math.abs(value) < 10000
    ? amount(value)
    : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(
        value,
      );
export function financialSummary(m: FinancialChart) {
  const total = m.rows.reduce((sum, row) => sum + cents(row.value), 0);
  const budget = m.rows.reduce((sum, row) => sum + cents(row.budget || 0), 0);
  return m.kind === 'waterfall'
    ? { total: (cents(m.start) + total) / 100, change: total / 100, budget: 0 }
    : { total: total / 100, budget: budget / 100, change: (total - budget) / 100 };
}
const escape = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const n = (v: number) => Number(v.toFixed(4));
export function renderFinancialChart(input: unknown): string {
  const m = validateFinancialChart(input),
    report = m.theme === 'report';
  const ink = report ? '#233749' : '#192b42',
    muted = '#526478',
    primary = '#315f88',
    favorable = '#237566',
    adverse = '#a34d35';
  const font = report ? 'Georgia, Songti SC, serif' : 'Arial, PingFang SC, sans-serif';
  const text = (x: number, y: number, label: string, size = 20, color = ink, extra = '') =>
    `<text x="${n(x)}" y="${n(y)}" font-family="${font}" font-size="${size}" fill="${color}" ${extra}>${escape(label)}</text>`;
  const category = (x: number, label: string) => {
    const chars = [...label];
    return [chars.slice(0, 6), chars.slice(6)]
      .filter((part) => part.length)
      .map((part, i) => text(x, 550 + i * 25, part.join(''), 19, ink, 'text-anchor="middle"'))
      .join('');
  };
  const numeric = (x: number, y: number, label: string, extra = '') =>
    text(x, y, label, 21, ink, `data-sf-chart-managed="true" ${extra}`);
  const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" ${extra}/>`;
  const line = (x1: number, y1: number, x2: number, y2: number, color = '#dbe2e8', extra = '') =>
    `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" ${extra}/>`;
  let out = rect(0, 0, 1472, 700, report ? '#fffefa' : '#ffffff');
  out +=
    text(28, 45, m.title, 29, ink, 'font-weight="600"') +
    text(
      28,
      82,
      `${m.period} · 单位：${m.unit} · 演示数据 · 大数 K/M/B 表示千/百万/十亿`,
      19,
      muted,
    );
  const plot = { x: 120, y: 150, w: 1280, h: 360 },
    summary = financialSummary(m);
  const values = [0];
  if (m.kind === 'waterfall') {
    let sum = cents(m.start);
    values.push(sum / 100);
    for (const row of m.rows) {
      sum += cents(row.value);
      values.push(sum / 100);
    }
  } else for (const row of m.rows) values.push(row.value, row.budget!);
  let low = Math.min(...values),
    high = Math.max(...values);
  if (low === high) high = low + 1;
  const span = high - low,
    step = 10 ** Math.floor(Math.log10(span));
  low = Math.floor(low / step) * step;
  high = Math.ceil((high + span * 0.08) / step) * step;
  const y = (value: number) => plot.y + plot.h - ((value - low) / (high - low)) * plot.h;
  for (let i = 0; i <= 4; i++) {
    const value = low + ((high - low) * i) / 4;
    out +=
      line(plot.x, y(value), plot.x + plot.w, y(value)) +
      text(
        104,
        y(value) + 6,
        chartAmount(value),
        18,
        muted,
        'text-anchor="end" data-sf-chart-managed="true"',
      );
  }
  out += line(plot.x, y(0), plot.x + plot.w, y(0), '#8191a1', 'stroke-width="1.5"');
  if (m.kind === 'waterfall') {
    const slot = plot.w / (m.rows.length + 2),
      width = Math.min(118, slot * 0.6);
    const bars = [{ label: '期初', from: 0, to: m.start, delta: m.start, total: true }];
    let running = cents(m.start);
    for (const row of m.rows) {
      const from = running;
      running += cents(row.value);
      bars.push({
        label: row.label,
        from: from / 100,
        to: running / 100,
        delta: row.value,
        total: false,
      });
    }
    bars.push({ label: '期末', from: 0, to: summary.total, delta: summary.total, total: true });
    bars.forEach((bar, i) => {
      const x = plot.x + slot * (i + 0.5) - width / 2,
        top = Math.min(y(bar.from), y(bar.to)),
        height = Math.abs(y(bar.from) - y(bar.to));
      const good = m.direction === 'higher' ? bar.delta >= 0 : bar.delta <= 0;
      out += `<g data-sf-chart-bar="${i}" data-label="${escape(bar.label)}">${rect(x, top, width, height, bar.total || bar.delta === 0 ? primary : good ? favorable : adverse, `data-value="${bar.delta}"`)}${numeric(x + width / 2, top - 12, `${bar.total || bar.delta <= 0 ? '' : '+'}${chartAmount(bar.delta)}`, 'text-anchor="middle"')}${category(x + width / 2, bar.label)}</g>`;
      if (i < bars.length - 1)
        out += line(x + width, y(bar.to), x + slot, y(bar.to), '#8191a1', 'stroke-dasharray="5 4"');
    });
    out += numeric(
      28,
      615,
      `期初 ${amount(m.start)} + 净变化 ${amount(summary.change)} = 期末 ${amount(summary.total)} ${m.unit}`,
      'font-weight="600"',
    );
  } else {
    const slot = plot.w / m.rows.length,
      width = Math.min(68, slot * 0.25);
    m.rows.forEach((row, i) => {
      const center = plot.x + slot * (i + 0.5),
        good = m.direction === 'lower' ? row.value <= row.budget! : row.value >= row.budget!;
      out += `<g data-sf-chart-bar="${i}" data-label="${escape(row.label)}">${rect(center - width - 5, y(row.budget!), width, Math.max(0, y(0) - y(row.budget!)), '#c4d2df', `data-budget="${row.budget}"`)}${rect(center + 5, y(row.value), width, Math.max(0, y(0) - y(row.value)), cents(row.value) === cents(row.budget!) ? primary : good ? favorable : adverse, `data-value="${row.value}"`)}${numeric(center - width / 2 - 5, y(row.budget!) - 12, chartAmount(row.budget!), 'text-anchor="middle"')}${numeric(center + width / 2 + 5, y(row.value) - 12, chartAmount(row.value), 'text-anchor="middle"')}${category(center, row.label)}</g>`;
    });
    out += numeric(
      28,
      615,
      `预算 ${amount(summary.budget)} · 实际 ${amount(summary.total)} · 差额 ${summary.change > 0 ? '+' : ''}${amount(summary.change)} ${m.unit}`,
      'font-weight="600"',
    );
  }
  out +=
    rect(28, 658, 18, 12, favorable) +
    text(57, 670, '有利变化', 18, muted) +
    rect(200, 658, 18, 12, adverse) +
    text(229, 670, '不利变化', 18, muted);
  if (m.kind === 'budget')
    out += rect(372, 658, 18, 12, '#c4d2df') + text(401, 670, '预算', 18, muted);
  out += rect(520, 658, 18, 12, primary) + text(549, 670, '合计 / 持平', 18, muted);
  out += text(
    1400,
    670,
    m.direction === 'higher' ? '数值增加为有利方向' : '数值减少为有利方向',
    18,
    muted,
    'text-anchor="end"',
  );
  return `<g data-sf-chart="${encodeURIComponent(JSON.stringify(m)).replaceAll('(', '%28').replaceAll(')', '%29')}" data-label="${escape(m.title)}">${out}</g>`;
}
