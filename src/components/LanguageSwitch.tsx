import { Languages } from 'lucide-react';
import { useLocale } from '../i18n/locale';

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const nextLocale = locale === 'en' ? 'zh' : 'en';
  const label = nextLocale === 'zh' ? t('切换到中文') : t('切换到英文');
  return (
    <div className={`language-switch${compact ? ' compact' : ''}`}>
      <button
        type="button"
        lang={locale === 'en' ? 'en' : 'zh-CN'}
        aria-label={label}
        title={label}
        aria-pressed={locale === 'zh'}
        onClick={() => setLocale(nextLocale)}
      >
        <Languages aria-hidden="true" size={17} strokeWidth={1.8} />
      </button>
    </div>
  );
}
