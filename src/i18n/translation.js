import en from './en.json';
import es from './es.json';

export const translations = {
  en: en,
  es: es,
};

export function useTranslations(lang) {
  // Set default language to 'es' if the selected lang is not available
  const langWithFallback = lang in translations ? lang : 'es';
  // Now, translationFile directly holds the content of en.json or es.json
  const translationFile = translations[langWithFallback];

  return function t(key) {
    // Our JSON files use dot-notation keys directly, so we look up the full key.
    // If the key is not found, we return the key itself as a fallback.
    return translationFile[key] || key;
  }
}
