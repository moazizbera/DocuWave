import { useLanguage } from '../contexts/LanguageContext';
import translations from '../locales';

export function useTranslations() {
  const { language } = useLanguage();
  return { t: translations[language] || translations.en };
}