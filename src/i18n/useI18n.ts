import { translations } from './translations';

export const useI18n = (lang: string = 'es') => {
  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[lang as keyof typeof translations];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t };
};