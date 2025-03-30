'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import en from './locales/en.json';
import pt from './locales/pt.json';

type Locale = 'en' | 'pt';
type Translations = Record<string, any>;
type LocaleResources = Record<Locale, Translations>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
  locales: Locale[];
}

const resources: LocaleResources = {
  en,
  pt,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const DEFAULT_LOCALE: Locale = 'en';
const STORAGE_KEY = 'emoto_locale';

const AVAILABLE_LOCALES: Locale[] = ['en', 'pt'];

const RTL_LOCALES: Locale[] = [];

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === testKey;
  } catch (e) {
    return false;
  }
}

const getNestedTranslation = (obj: any, path: string): string => {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }

  return typeof current === 'string' ? current : path;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const getInitialLocale = (): Locale => {
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      const storedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (storedLocale && AVAILABLE_LOCALES.includes(storedLocale)) {
        return storedLocale;
      }
    }

    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (AVAILABLE_LOCALES.includes(browserLang)) {
        return browserLang;
      }
    }

    return DEFAULT_LOCALE;
  };

  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLocaleState(getInitialLocale());
    setLoaded(true);

    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
    
    document.documentElement.lang = newLocale;
    document.documentElement.dir = RTL_LOCALES.includes(newLocale) ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    if (!key) return '';
    
    const translation = getNestedTranslation(resources[locale], key);
    
    if (translation === key) {
      if (locale !== DEFAULT_LOCALE) {
        const defaultTranslation = getNestedTranslation(resources[DEFAULT_LOCALE], key);
        if (defaultTranslation !== key) return defaultTranslation;
      }
      console.warn(`Translation missing for key: ${key}`);
    }
    
    return translation;
  };

  if (!loaded) return null;

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isRtl: RTL_LOCALES.includes(locale),
        locales: AVAILABLE_LOCALES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const detectUserLanguage = (): Locale => {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  
  const browserLang = navigator.language.split('-')[0] as Locale;
  return AVAILABLE_LOCALES.includes(browserLang) ? browserLang : DEFAULT_LOCALE;
}; 