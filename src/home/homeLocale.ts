import { LocaleContext, languageStorageKey, translate, useLocale } from '../i18n/locale';

export type HomeLanguage = 'en' | 'zh';
export const homeLanguageKey = languageStorageKey;
export const HomeLocaleContext = LocaleContext;
export const useHomeLocale = useLocale;
export const translateHome = translate;
