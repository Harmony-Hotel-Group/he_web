import en from './en.json';
import es from './es.json';

export const defaultLang = 'es';
type TranslationObject = Record<string, any>;

export const translations = {
    en: en,
    es: es,
};

export function Translations(lang: string) {
    // Set the default language to 'es' if the selected lang is not available
    const langWithFallback = lang in translations ? lang : defaultLang;
    // Now, the translationFile directly holds the content of en.json or es.json
    const translationFile = translations[langWithFallback];

    return function t(key: string, params?: Record<string, string | number>) {
        if (key===null || key === undefined){
            console.error("Key is null or undefined", key)
            return key
        }
        console.log(key, typeof(key))
        const keys = key.split(".");
        let result: TranslationObject | undefined = translationFile;

        for (const k of keys) {
            if (result && typeof result === "object") {
                result = result[k]; // Usar notación de corchetes en lugar de .get()
            } else {
                result = undefined;
                break;
            }
        }

        if (result === null || result === undefined) {
            // En producción, usar directamente el idioma predeterminado sin recursión
            return key;
        }

        let translation = String(result);
        // Reemplazar parámetros de manera más eficiente
        if (params) {
            for (const [paramName, paramValue] of Object.entries(params)) {
                translation = translation.replace(
                    new RegExp(`\\{\\{\\s*${paramName}\\s*\\}\\}`, "g"),
                    String(paramValue),
                );
            }
        }
        return translation;
    }
}
