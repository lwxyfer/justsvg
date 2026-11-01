import { useState } from 'react';
import { Pause, Play, Trash2 } from 'lucide-react';
import {
  configureMotion,
  decodeMotion,
  defaultMotion,
  flowTarget,
  motionAttribute,
  motionWrapper,
  motionOriginal,
  type MotionConfig,
} from '../editor/document/motion';
import { engine } from '../editor/document/engine';
import { useChromeUI } from '../store/ui';
import { run } from './shared';
import { useLocale } from '../i18n/locale';
function MotionNumber({
  label,
  value,
  min,
  max,
  step = 1,
  apply,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  apply: (n: number) => void;
}) {
  const { t } = useLocale();
  const [draft, setDraft] = useState<string | null>(null),
    [error, setError] = useState('');
  return (
    <label className="property-field">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft ?? value}
          aria-invalid={!!error}
          onChange={(e) => {
            setDraft(e.target.value);
            setError('');
          }}
          onBlur={(e) => {
            const n = Number(e.target.value);
            if (!e.target.value.trim() || !Number.isFinite(n) || n < min || n > max) {
              setError(`${t('请输入')} ${min}–${max} ${t('之间的数值。')}`);
              return;
            }
            try {
              if (n !== value) apply(n);
              setDraft(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            }
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              e.currentTarget.value = String(value);
              setDraft(null);
              setError('');
              e.currentTarget.blur();
            }
          }}
        />
      </div>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
export function MotionProperties({ el }: { el: SVGGraphicsElement }) {
  const { t } = useLocale();
  const ui = useChromeUI(),
    wrapper = motionWrapper(el),
    config = decodeMotion(wrapper?.getAttribute(motionAttribute) || null);
  const apply = (patch: Partial<MotionConfig>) => {
    if (config) configureMotion(engine, el, { ...config, ...patch });
  };
  return (
    <>
      <label className="property-field">
        <span>{t('动效类型')}</span>
        <select
          aria-label={t('动效类型')}
          value={config?.type || 'none'}
          onChange={(e) =>
            run(() =>
              configureMotion(
                engine,
                el,
                e.target.value === 'none'
                  ? null
                  : defaultMotion(e.target.value as MotionConfig['type']),
              ),
            )
          }
        >
          <option value="none">{t('无动效')}</option>
          {flowTarget(el) && <option value="flow">{t('箭头流动')}</option>}
          <option value="pulse">{t('呼吸')}</option>
          <option value="blink">{t('柔和闪动')}</option>
        </select>
      </label>
      {config && (
        <>
          <label className="motion-switch">
            <input
              type="checkbox"
              aria-label={t('启用动效')}
              checked={config.enabled}
              onChange={(e) => run(() => apply({ enabled: e.target.checked }))}
            />
            {t('启用动效')}
          </label>
          <MotionNumber
            label={t('动效周期（秒）')}
            value={config.duration}
            min={1}
            max={20}
            step={0.1}
            apply={(n) => apply({ duration: n })}
          />
          {config.type === 'flow' ? (
            <>
              <label className="property-field">
                <span>{t('流动方向')}</span>
                <select
                  aria-label={t('流动方向')}
                  value={config.reverse ? 'reverse' : 'forward'}
                  onChange={(e) => run(() => apply({ reverse: e.target.value === 'reverse' }))}
                >
                  <option value="forward">{t('沿路径正向')}</option>
                  <option value="reverse">{t('沿路径反向')}</option>
                </select>
              </label>
              <div className="property-grid">
                <MotionNumber
                  label={t('流动线段')}
                  value={config.dash}
                  min={2}
                  max={40}
                  apply={(n) => apply({ dash: n })}
                />
                <MotionNumber
                  label={t('流动间隔')}
                  value={config.gap}
                  min={2}
                  max={40}
                  apply={(n) => apply({ gap: n })}
                />
              </div>
            </>
          ) : (
            <MotionNumber
              label={t('动效强度（%）')}
              value={Math.round(config.amount * 100)}
              min={10}
              max={75}
              apply={(n) => apply({ amount: n / 100 })}
            />
          )}
          <div className="section-actions">
            <button
              className="button"
              onClick={() => wrapper && engine.select([motionOriginal(wrapper)!])}
            >
              {t('编辑原图形')}
            </button>
            <button
              className="button"
              aria-pressed={!ui.motionPreview}
              onClick={() => ui.set({ motionPreview: !ui.motionPreview })}
            >
              {ui.motionPreview ? <Pause size={13} /> : <Play size={13} />}
              {ui.motionPreview ? t('暂停预览') : t('播放预览')}
            </button>
            <button className="button" onClick={() => run(() => configureMotion(engine, el, null))}>
              <Trash2 size={13} />
              {t('移除动效')}
            </button>
          </div>
          <p className="field-note">
            {config.type === 'flow'
              ? t('周期越短流动越快，方向按 SVG 路径定义。轨道保留原线，节点关联仍可跟随。')
              : t('通过透明度变化强调状态，不改变卡片尺寸或连接位置。')}
            {t('配置随 SVG 导出；暂停仅影响编辑器预览。系统开启减少动态效果时显示静态。')}
          </p>
        </>
      )}
    </>
  );
}
