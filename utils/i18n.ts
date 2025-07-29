import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Translation files
import tr from '../locales/tr';
import en from '../locales/en';

// Get device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'tr';

// Configure i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: tr
      },
      en: {
        translation: en
      }
    },
    lng: deviceLanguage, // Default to Turkish
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    },
    compatibilityJSON: 'v4'
  });

export default i18n; 