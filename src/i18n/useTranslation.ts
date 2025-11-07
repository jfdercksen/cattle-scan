import { useLanguage } from '@/contexts/languageContext';
import { translations, TranslationSections, TranslationKey } from './translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = <Section extends keyof TranslationSections>(
    section: Section,
    key: TranslationKey<Section>
  ) => {
    const sectionTranslations = translations[section];
    const entry = sectionTranslations[key];

    if (!entry) {
      return key as string;
    }

    return entry[language] ?? entry.en;
  };

  return { t, language };
};
