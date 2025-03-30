'use client';

import { useI18n } from './i18nContext';

export function useTranslation(namespace?: string) {
  const { t: globalT, locale, setLocale, locales, isRtl } = useI18n();
  
  const t = (key: string): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return globalT(fullKey);
  };
  
  return {
    t,
    locale,
    setLocale,
    locales,
    isRtl
  };
} 