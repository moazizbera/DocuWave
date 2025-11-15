import { useLanguage } from '../contexts/LanguageContext';
import translations from '../locales';

/**
 * 🌍 USE TRANSLATIONS HOOK
 * =========================
 * Custom hook for accessing translations based on current language.
 * Returns both the raw translation dictionary (for ergonomic optional chaining)
 * and a helper to resolve dot-notation keys with interpolation support.
 */
export function useTranslations() {
  const { language } = useLanguage();

  const dictionary = translations[language] || translations.en;

  /**
   * Get translation by key path
   * @param {string} key - Dot-notation path (e.g., 'dashboard.title')
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated text or key if not found
   */
  const translate = (key, params = {}) => {
    const keys = key.split('.');
    let value = dictionary;

    for (const currentKey of keys) {
      if (value && typeof value === 'object' && currentKey in value) {
        value = value[currentKey];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, param) => (
        params[param] !== undefined ? params[param] : match
      ));
    }

    return value;
  };

  return { t: dictionary, translate };
}

export default useTranslations;
