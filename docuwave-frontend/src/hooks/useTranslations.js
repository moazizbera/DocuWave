import { useLanguage } from '../contexts/LanguageContext';
import translations from '../locales';

/**
 * 🌍 USE TRANSLATIONS HOOK
 * =========================
 * Custom hook for accessing translations based on current language
 * 
 * @returns {Function} t - Translation function
 * 
 * @example
 * const t = useTranslations();
 * <h1>{t('dashboard.title')}</h1>
 * // English: "Dashboard"
 * // Arabic: "لوحة التحكم"
 * // French: "Tableau de bord"
 */
export function useTranslations() {
  const { language } = useLanguage();

  /**
   * Get translation by key path
   * @param {string} key - Dot-notation path (e.g., 'dashboard.title')
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated text or key if not found
   */
  const t = (key, params = {}) => {
    // Split key by dots to navigate nested object
    const keys = key.split('.');
    let value = translations[language];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key; // Return key if translation not found
      }
    }

    // Handle parameter interpolation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return value;
  };

  return t;
}

export default useTranslations;