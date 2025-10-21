import en from './en.json';
import es from './es.json';

// ==================== TYPES ====================

type TranslationObject = Record<string, any>;
type SupportedLang = 'en' | 'es';
type TranslationParams = Record<string, string | number>;

// ==================== CONFIG ====================

export const defaultLang: SupportedLang = 'es';
export const supportedLangs: SupportedLang[] = ['en', 'es'];

export const translations: Record<SupportedLang, TranslationObject> = {
    en: en,
    es: es,
};

// ==================== CACHE ====================

// Cache para las funciones de traducción por idioma
const translationFunctionCache = new Map<string, (key: string, params?: TranslationParams) => string>();

// Cache para traducciones ya resueltas (key + lang)
const translationCache = new Map<string, string>();

// Cache para paths de keys (evitar split repetido)
const keyPathCache = new Map<string, string[]>();

// ==================== HELPERS ====================

/**
 * Obtiene el path de una key con cache
 */
function getKeyPath(key: string): string[] {
    if (!keyPathCache.has(key)) {
        keyPathCache.set(key, key.split('.'));
    }
    return keyPathCache.get(key)!;
}

/**
 * Busca una traducción en el objeto de forma optimizada
 */
function findTranslation(
    obj: TranslationObject,
    keyPath: string[]
): string | null {
    let result: any = obj;

    for (let i = 0; i < keyPath.length; i++) {
        if (result && typeof result === 'object' && keyPath[i] in result) {
            result = result[keyPath[i]];
        } else {
            return null;
        }
    }

    return typeof result === 'string' || typeof result === 'number'
        ? String(result)
        : null;
}

/**
 * Reemplaza parámetros en la traducción de forma eficiente
 * Pre-compila las regex comunes
 */
const paramRegexCache = new Map<string, RegExp>();

function getParamRegex(paramName: string): RegExp {
    if (!paramRegexCache.has(paramName)) {
        paramRegexCache.set(
            paramName,
            new RegExp(`\\{\\{\\s*${paramName}\\s*\\}\\}`, 'g')
        );
    }
    return paramRegexCache.get(paramName)!;
}

function replaceParams(
    translation: string,
    params: TranslationParams
): string {
    let result = translation;

    for (const [paramName, paramValue] of Object.entries(params)) {
        result = result.replace(
            getParamRegex(paramName),
            String(paramValue)
        );
    }

    return result;
}

/**
 * Normaliza el idioma con fallback
 */
function normalizeLang(lang: string): SupportedLang {
    // Normalizar lowercase
    const normalizedLang = lang.toLowerCase();

    // Si es un idioma soportado, usarlo
    if (supportedLangs.includes(normalizedLang as SupportedLang)) {
        return normalizedLang as SupportedLang;
    }

    // Intentar con solo los primeros 2 caracteres (en-US -> en)
    const shortLang = normalizedLang.substring(0, 2);
    if (supportedLangs.includes(shortLang as SupportedLang)) {
        return shortLang as SupportedLang;
    }

    // Fallback al idioma por defecto
    return defaultLang;
}

// ==================== MAIN FUNCTION ====================

/**
 * Obtiene la función de traducción para un idioma específico
 * Usa cache para evitar crear múltiples funciones
 */
export function Translations(lang: string) {
    const normalizedLang = normalizeLang(lang);

    // Cache hit: retornar función existente
    if (translationFunctionCache.has(normalizedLang)) {
        return translationFunctionCache.get(normalizedLang)!;
    }

    // Obtener el archivo de traducción
    const translationFile = translations[normalizedLang];
    const fallbackFile = translations[defaultLang];

    // Crear la función de traducción
    const t = (key: string, params?: TranslationParams): string => {
        // Validación de entrada
        if (!key || typeof key !== 'string') {
            console.error('[Translation] Invalid key:', key);
            return String(key);
        }

        // Generar cache key (incluye params para diferenciar)
        const cacheKey = params
            ? `${normalizedLang}:${key}:${JSON.stringify(params)}`
            : `${normalizedLang}:${key}`;

        // Cache hit: retornar traducción ya resuelta
        if (!params && translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey)!;
        }

        // Obtener path de la key
        const keyPath = getKeyPath(key);

        // Buscar en el idioma seleccionado
        let translation = findTranslation(translationFile, keyPath);

        // Fallback al idioma por defecto si no se encuentra
        if (translation === null && normalizedLang !== defaultLang) {
            translation = findTranslation(fallbackFile, keyPath);

            if (translation !== null && import.meta.env.DEV) {
                console.warn(
                    `[Translation] Missing '${key}' in '${normalizedLang}', using '${defaultLang}'`
                );
            }
        }

        // Si aún no se encuentra, retornar la key
        if (translation === null) {
            if (import.meta.env.DEV) {
                console.error(`[Translation] Missing translation for key: '${key}'`);
            }
            return key;
        }

        // Reemplazar parámetros si existen
        if (params) {
            translation = replaceParams(translation, params);
        } else {
            // Solo cachear si no hay params
            translationCache.set(cacheKey, translation);
        }

        return translation;
    };

    // Cachear la función
    translationFunctionCache.set(normalizedLang, t);

    return t;
}

// ==================== UTILITIES ====================

/**
 * Verifica si una key de traducción existe
 */
export function hasTranslation(lang: string, key: string): boolean {
    const normalizedLang = normalizeLang(lang);
    const translationFile = translations[normalizedLang];
    const keyPath = getKeyPath(key);

    return findTranslation(translationFile, keyPath) !== null;
}

/**
 * Obtiene todas las traducciones de un namespace
 */
export function getNamespace(lang: string, namespace: string): TranslationObject | null {
    const normalizedLang = normalizeLang(lang);
    const translationFile = translations[normalizedLang];
    const keyPath = getKeyPath(namespace);

    let result: any = translationFile;

    for (const k of keyPath) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return null;
        }
    }

    return typeof result === 'object' ? result : null;
}

/**
 * Limpia todos los caches (útil para HMR o testing)
 */
export function clearTranslationCache() {
    translationCache.clear();
    keyPathCache.clear();
    paramRegexCache.clear();
    console.log('[Translation] Cache cleared');
}

/**
 * Obtiene estadísticas del cache
 */
export function getCacheStats() {
    return {
        translationFunctions: translationFunctionCache.size,
        translations: translationCache.size,
        keyPaths: keyPathCache.size,
        paramRegexes: paramRegexCache.size,
    };
}

/**
 * Pre-carga traducciones comunes para mejorar performance inicial
 */
export function preloadCommonTranslations(lang: string, keys: string[]) {
    const t = Translations(lang);
    keys.forEach(key => t(key));
    console.log(`[Translation] Preloaded ${keys.length} translations for '${lang}'`);
}

// ==================== DEVELOPMENT HELPERS ====================

if (import.meta.env.DEV) {
    // Exponer utilidades en desarrollo
    (globalThis as any).__translationUtils = {
        getCacheStats,
        clearCache: clearTranslationCache,
        hasTranslation,
        getNamespace,
    };

    console.log('[Translation] Dev utilities available at window.__translationUtils');
}