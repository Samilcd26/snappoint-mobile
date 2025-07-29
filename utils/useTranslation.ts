import { useTranslation as useI18nTranslation } from 'react-i18next';
import { TranslationKeys } from '@/types/translations';

export const useTranslation = () => {
  const { t: tRaw, i18n } = useI18nTranslation();

  // Return the full translation object for typesafe nested access
  const translations: TranslationKeys = i18n.getResourceBundle(i18n.language, 'translation');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Create a function that can work both ways: t('key') and t().key
  const t = (key?: string): any => {
    if (key) {
      return tRaw(key);
    }
    return translations;
  };

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language
  };
}; 