import { Keyboard, Languages, Check } from 'lucide-react';
import { Modal } from './Modal';
import { useLocale } from '../i18n/locale';
import { useChromeUI } from '../store/ui';

export function SettingsDialog() {
  const { locale, setLocale, t } = useLocale();
  const ui = useChromeUI();
  return (
    <Modal
      title={t('设置')}
      className="settings-dialog"
      onClose={() => ui.set({ settingsOpen: false })}
    >
      <fieldset className="settings-language">
        <legend>
          <Languages size={16} />
          {t('界面语言')}
        </legend>
        <div className="settings-language-options">
          {(
            [
              ['zh', '简体中文'],
              ['en', 'English'],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={locale === value ? 'selected' : ''}
              lang={value === 'zh' ? 'zh-CN' : 'en'}
            >
              <input
                type="radio"
                name="interface-language"
                value={value}
                checked={locale === value}
                onChange={() => setLocale(value)}
              />
              <span>{label}</span>
              {locale === value && <Check size={16} aria-hidden="true" />}
            </label>
          ))}
        </div>
        <p>{t('语言切换立即生效，并保存在此浏览器。')}</p>
      </fieldset>
      <div className="modal-footer settings-footer">
        <button
          className="text-button"
          onClick={() => ui.set({ settingsOpen: false, helpOpen: true })}
        >
          <Keyboard size={14} />
          {t('键盘快捷键')}
        </button>
        <button className="button primary" onClick={() => ui.set({ settingsOpen: false })}>
          {t('完成')}
        </button>
      </div>
    </Modal>
  );
}
