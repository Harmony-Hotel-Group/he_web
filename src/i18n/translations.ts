import es from './es.json';
import en from './en.json';

export const translations = {
  es,
  en
};

export type Language = keyof typeof translations;
export type TranslationKey = string;