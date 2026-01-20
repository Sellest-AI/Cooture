import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

// Import all translations at build time
import enCommon from './en/common.json';
import enHome from './en/home.json';
import frCommon from './fr/common.json';
import frHome from './fr/home.json';

// Import the type to use in this file
import type { IntlMessages, TranslationKeys } from './types';

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'fr'] as const;

// Initialize i18next synchronously with bundled resources
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        Home: enHome,
        Common: enCommon,
      },
    },
    fr: {
      translation: {
        Home: frHome,
        Common: frCommon,
      },
    },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

// Custom hook that mimics next-intl's useTranslations API with full deep type safety
export const useTranslations = <Namespace extends keyof IntlMessages>(namespace: Namespace) => {
  const { t } = useTranslation();

  return <Key extends TranslationKeys<Namespace>>(
    key: Key,
    values?: Record<string, any>
  ): string => {
    const fullKey = `${namespace}.${key}`;
    return t(fullKey, values);
  };
};

// Export i18n instance and hooks
export { useTranslation } from 'react-i18next';
export { i18n };

