import { useState, type ReactNode } from 'react';
import { Grid2X2, Magnet, MousePointer2, Frame, Palette } from 'lucide-react';
import { documents } from '../app/documents';
import { engine } from '../editor/document/engine';
import {
  pageBackground,
  setPageBackground,
  setPageSize,
  type PageFill,
} from '../editor/document/page';
import { useChromeUI } from '../store/ui';
import { run } from './shared';
import { useLocale } from '../i18n/locale';

function NumberInput({
  label,
  value,
  commit,
  unit = 'px',
}: {
  label: string;
  value: number;
  commit: (v: number) => void;
  unit?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState('');
  return (
    <label className="canvas-number">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type="number"
          value={draft ?? Number(value.toFixed(2))}
          onChange={(e) => {
            setDraft(e.target.value);
            setError('');
          }}
          onBlur={(event) => {
            if (draft === null) return;
            const next = event.currentTarget.value;
            try {
              if (!next.trim()) throw new Error('请输入有效数字');
              if (Number(next) !== value) commit(Number(next));
              setDraft(null);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              e.currentTarget.value = String(value);
              setDraft(null);
              setError('');
              e.currentTarget.blur();
            }
          }}
        />
        <span>{unit}</span>
      </div>
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
function Block({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="canvas-block">
      <h3>
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}
function DocumentName() {
  const { t } = useLocale();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState('');
  return (
    <div className="canvas-block">
      <label className="canvas-name">
        <span>{t('文档名称')}</span>
        <input
          aria-label={t('文档名称')}
          value={draft ?? engine.name}
          maxLength={120}
          spellCheck={false}
          onChange={(e) => {
            setDraft(e.target.value);
            setError('');
          }}
          onBlur={(e) => {
            try {
              documents.rename(e.currentTarget.value);
              setDraft(null);
              setError('');
            } catch (error) {
              setError((error as Error).message);
            }
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              e.currentTarget.value = engine.name;
              setDraft(null);
              setError('');
              e.currentTarget.blur();
            }
          }}
        />
        {error && <small role="alert">{t(error)}</small>}
      </label>
    </div>
  );
}
export function CanvasSettings() {
  const { t } = useLocale();
  const ui = useChromeUI();
  const size = engine.pageSize();
  const bg = pageBackground();
  const change = (patch: Partial<typeof bg>) => run(() => setPageBackground({ ...bg, ...patch }));
  const fills: [PageFill, string][] = [
    ['transparent', '透明'],
    ['solid', '纯色'],
    ['gradient', '渐变'],
    ['dots', '点阵'],
    ['grid', '网格'],
  ];
  return (
    <div className="inspector-scroll canvas-settings" role="region" aria-label={t('画布设置')}>
      <DocumentName />
      <Block title={t('画布尺寸')} icon={<Frame size={14} />}>
        <label className="canvas-preset">
          {t('尺寸预设')}
          <select
            aria-label={t('尺寸预设')}
            value={
              ['1920x1080', '1200x900', '1080x1080', '794x1123'].includes(
                `${size.width}x${size.height}`,
              )
                ? `${size.width}x${size.height}`
                : ''
            }
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number);
              run(() => setPageSize(w, h));
            }}
          >
            <option value="">{t('自定义')}</option>
            <option value="1920x1080">1920 × 1080 · 16:9</option>
            <option value="1200x900">1200 × 900 · 4:3</option>
            <option value="1080x1080">1080 × 1080 · 1:1</option>
            <option value="794x1123">A4 · 794 × 1123</option>
          </select>
        </label>
        <div className="property-grid">
          <NumberInput
            label={t('画布宽度')}
            value={size.width}
            commit={(v) => setPageSize(v, size.height)}
          />
          <NumberInput
            label={t('画布高度')}
            value={size.height}
            commit={(v) => setPageSize(size.width, v)}
          />
        </div>
        <button
          className="text-button"
          onClick={() => run(() => setPageSize(size.height, size.width))}
        >
          {t('交换宽高')}
        </button>
      </Block>
      <Block title={t('画布背景')} icon={<Palette size={14} />}>
        <div className="background-options" aria-label={t('背景类型')}>
          {fills.map(([mode, label]) => (
            <button
              key={mode}
              aria-label={t(label)}
              aria-pressed={bg.mode === mode}
              onClick={() => change({ mode })}
            >
              <span className={`background-swatch ${mode}`} />
              <span>{t(label)}</span>
            </button>
          ))}
        </div>
        {bg.mode !== 'transparent' && (
          <label className="canvas-color">
            <input
              aria-label={t('背景颜色')}
              type="color"
              value={bg.color}
              onChange={(e) => change({ color: e.target.value })}
            />
            <span>{t(bg.mode === 'gradient' ? '起始颜色' : '背景颜色')}</span>
            <code>{bg.color.toUpperCase()}</code>
          </label>
        )}
        {['gradient', 'dots', 'grid'].includes(bg.mode) && (
          <label className="canvas-color">
            <input
              aria-label={t('辅助颜色')}
              type="color"
              value={bg.secondary}
              onChange={(e) => change({ secondary: e.target.value })}
            />
            <span>{t(bg.mode === 'gradient' ? '结束颜色' : '图案颜色')}</span>
            <code>{bg.secondary.toUpperCase()}</code>
          </label>
        )}
        {bg.mode === 'gradient' && (
          <NumberInput
            label={t('渐变角度')}
            value={bg.angle}
            unit="°"
            commit={(angle) => setPageBackground({ ...bg, angle })}
          />
        )}
        {['dots', 'grid'].includes(bg.mode) && (
          <NumberInput
            label={t('图案间距')}
            value={bg.spacing}
            commit={(spacing) => setPageBackground({ ...bg, spacing })}
          />
        )}
        <p className="canvas-note">{t('背景随 SVG 和图片一起导出。')}</p>
      </Block>
      <Block title={t('工作区')} icon={<Grid2X2 size={14} />}>
        <label className="canvas-color">
          <input
            aria-label={t('工作区底色')}
            type="color"
            value={ui.background}
            onChange={(e) => ui.set({ background: e.target.value })}
          />
          <span>{t('工作区底色')}</span>
          <code>{ui.background.toUpperCase()}</code>
        </label>
        <div className="workspace-patterns">
          {(['none', 'dots', 'grid'] as const).map((mode) => (
            <button
              aria-pressed={(!ui.grid ? 'none' : ui.gridPattern) === mode}
              key={mode}
              onClick={() =>
                ui.set({ grid: mode !== 'none', gridPattern: mode === 'grid' ? 'grid' : 'dots' })
              }
            >
              {t(mode === 'none' ? '无网格' : mode === 'dots' ? '点阵' : '网格')}
            </button>
          ))}
        </div>
        <label className="canvas-check">
          <input
            type="checkbox"
            checked={ui.snap}
            onChange={(e) => ui.set({ snap: e.target.checked })}
          />
          <Magnet size={14} />
          {t('智能吸附')}
        </label>
        <label className="canvas-check">
          <input
            type="checkbox"
            checked={ui.wheelModifier}
            onChange={(e) => ui.set({ wheelModifier: e.target.checked })}
          />
          <MousePointer2 size={14} />
          {t('仅 Ctrl / Cmd + 滚轮缩放')}
        </label>
        <p className="canvas-note">{t('工作区网格仅辅助编辑，不参与导出。')}</p>
      </Block>
    </div>
  );
}
