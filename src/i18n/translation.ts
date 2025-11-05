/**
 * src/i18n/translation.ts
 *
 * @file Módulo de Internacionalización (i18n)
 *
 * Este archivo gestiona todas las funcionalidades relacionadas con la traducción de textos en la aplicación.
 * Proporciona una función `Translations` que, al ser inicializada con un idioma, devuelve una función `t`
 * para obtener las traducciones correspondientes.
 *
 * Características:
 * - Carga de archivos de traducción JSON.
 * - Soporte para múltiples idiomas con un idioma por defecto (fallback).
 * - Búsqueda de traducciones anidadas mediante claves (ej: 'page.title').
 * - Reemplazo de parámetros dinámicos en las cadenas de texto (ej: 'Hola, {{name}}').
 * - Normalización de códigos de idioma.
 * - Advertencias en modo de desarrollo para traducciones faltantes.
 */

// ==================== IMPORTS ====================
const log = logger("Translation");

const flags = import.meta.glob<{ default: ImageMetadata }>(
	"/src/resources/img/flags/*.svg",
);
log.info("Buscando banderas...", Object.keys(flags));

const jsons = import.meta.glob("/src/i18n/*.json");
log.info("Buscando archivos de traducción...", Object.keys(jsons));

import { logger } from "@/services/logger.ts";
// ==================== TYPES ====================

/**
 * Representa un objeto de traducción, que es un mapa de claves de cadena a cualquier valor.
 * Usado para los archivos JSON de idioma.
 */
type TranslationObject = Record<string, any>;

/**
 * Define los idiomas soportados de forma explícita.
 */
type SupportedLang = "en" | "es";

/**
 * Define el tipo para los parámetros dinámicos que se pueden insertar en las cadenas de traducción.
 * Ejemplo: { name: 'Usuario' }
 */
type TranslationParams = Record<string, string | number>;

// ==================== CONFIG ====================
const langNames = {
	es: "Español",
	en: "English",
};

export const languages: { code: string; name: string; flag: string }[] = [];

await (async () => {
	for (const path in flags) {
		// @ts-expect-error
		const code = path.split("/").pop().replace(".svg", "");
		const mod = await flags[path]();
		languages.push({
			code,
			name: langNames[code] || code,
			flag: mod.default.src,
		});
	}
})();

log.warn("Languages cargados:", languages);

export type Language = (typeof languages)[number]["code"];
/**
 * Idioma por defecto de la aplicación.
 * Se utilizará como fallback si una traducción no está disponible en el idioma seleccionado.
 * @type {SupportedLang}
 */
export const defaultLang: SupportedLang = "es";

/**
 * Array con todos los idiomas soportados por la aplicación.
 * @type {SupportedLang[]}
 */
export const supportedLangs: SupportedLang[] = ["en", "es"];

/**
 * Objeto que almacena todos los archivos de traducción cargados.
 * Cada idioma soportado debe tener su correspondiente objeto de traducción aquí.
 * @type {Record<SupportedLang, TranslationObject>}
 */
// export const translations: Record<SupportedLang, TranslationObject> = {
// 	en: en,
// 	es: es,
// };
const translations: Record<string, any> = {};

await (async () => {
	for (const path in jsons) {
		// @ts-expect-error
		const key = path.split("/").pop().replace(".json", "") as SupportedLang;
		// @ts-expect-error
		translations[key] = (await jsons[path]()).default;
	}
})();

log.warn("Archivos de traducción cargados:", Object.keys(translations));
// log.info("Archivos de traducción cargados:", translations);

// ===================== UTILS =====================

export function getCurrentLang(
	url?: URL | string,
	request?: Request, // Este parámetro se mantiene por compatibilidad pero NO se usa en SSG
): Language {
	// EN MODO ESTÁTICO (SSG): Solo detectar por URL pathname
	// La cookie se manejará en el cliente después del hydration

	if (url) {
		const pathname = typeof url === "string" ? url : url.pathname;
		if (pathname === "/en" || pathname.startsWith("/en/")) {
			log.info("🟢 [SSR/SSG] Idioma desde pathname: en");
			return "en" as Language;
		}
		log.info("🟢 [SSR/SSG] Idioma desde pathname: es");
		return "es" as Language;
	}

	// SOLO EN EL CLIENTE: Leer cookie
	if (typeof window !== "undefined") {
		const cookieLang = getLangFromCookie();
		if (cookieLang) {
			log.info("🟢 [CLIENT] Idioma desde cookie:", cookieLang);
			return cookieLang;
		}

		const p = window.location.pathname;
		if (p === "/en" || p.startsWith("/en/")) {
			log.info("🟢 [CLIENT] Idioma desde pathname: en");
			return "en" as Language;
		}
	}

	log.info("🟢 Usando idioma por defecto:", defaultLang);
	return defaultLang;
}

export function getLangFromCookie(): Language | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(/lang=(\w+)/);
	return match ? (match[1] as Language) : null;
}

export function setLangCookie(lang: Language) {
	document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

// ==================== HELPERS ====================

/**
 * Busca una traducción en un objeto de idioma utilizando una clave anidada.
 * @param {TranslationObject} obj - El objeto de traducciones donde buscar.
 * @param {string} key - La clave de la traducción (ej: 'nav.home' o 'site.title').
 * @returns {string | null} - El valor de la traducción si se encuentra, o null si no.
 */
function findTranslation(obj: TranslationObject, key: string): string | null {
	const keys = key.split(".");
	let result: any = obj;

	for (const k of keys) {
		if (result && typeof result === "object" && k in result) {
			result = result[k];
		} else {
			return null; // Si alguna clave intermedia no existe, retorna null.
		}
	}

	// Retorna el valor solo si es una cadena o un número.
	return typeof result === "string" || typeof result === "number"
		? String(result)
		: null;
}

/**
 * Reemplaza los parámetros en una cadena de traducción.
 * Busca placeholders con el formato {{paramName}}.
 * @param {string} translation - La cadena de traducción con placeholders.
 * @param {TranslationParams} params - Un objeto con los valores a reemplazar.
 * @returns {string} - La cadena de traducción con los parámetros reemplazados.
 */
function replaceParams(translation: string, params: TranslationParams): string {
	let result = translation;
	for (const [paramName, paramValue] of Object.entries(params)) {
		// Expresión regular para encontrar {{paramName}} con posibles espacios.
		result = result.replace(
			new RegExp(`\\{\\{\\s*${paramName}\\s*\\}\\}`, "g"),
			String(paramValue),
		);
	}
	return result;
}

/**
 * Normaliza un código de idioma a uno de los idiomas soportados.
 * Intenta hacer coincidir el idioma completo (ej: 'en-US') o su código base ('en').
 * @param {string} lang - El código de idioma a normalizar.
 * @returns {SupportedLang} - El idioma soportado o el idioma por defecto.
 */
function normalizeLang(lang: string): SupportedLang {
	const normalizedLang = lang.toLowerCase();
	if (supportedLangs.includes(normalizedLang as SupportedLang)) {
		return normalizedLang as SupportedLang;
	}
	// Si no, intenta con el código de dos letras (ej: 'en' de 'en-US').
	const shortLang = normalizedLang.substring(0, 2);
	if (supportedLangs.includes(shortLang as SupportedLang)) {
		return shortLang as SupportedLang;
	}
	// Si no se encuentra ninguna coincidencia, retorna el idioma por defecto.
	return defaultLang;
}

// ==================== MAIN FUNCTION ====================

/**
 * Fábrica de funciones de traducción (Higher-Order Function).
 * Crea y devuelve una función `t` configurada para un idioma específico.
 * @param {string} lang - El idioma para el cual se creará la función de traducción.
 * @returns {(key: string, params?: TranslationParams) => string} - La función `t` para obtener traducciones.
 */
export function Translations(lang: string) {
	const normalizedLang = normalizeLang(lang);
	const translationFile = translations[normalizedLang];
	const fallbackFile = translations[defaultLang];

	/**
	 * La función de traducción principal (`t`).
	 * @param {string} key - La clave de la traducción a obtener.
	 * @param {TranslationParams} [params] - Parámetros opcionales para reemplazar en la cadena.
	 * @returns {string} - La cadena traducida y formateada. Si no se encuentra, devuelve la clave.
	 */
	return function t(key: string, params?: TranslationParams): string {
		if (!key || typeof key !== "string") {
			log.info("La clave proporcionada no es válida:", key);
			return String(key);
		}

		// 1. Intentar obtener la traducción del idioma actual.
		let translation = findTranslation(translationFile, key);

		// 2. Si no se encuentra, intentar con el idioma por defecto (fallback).
		if (translation === null && normalizedLang !== defaultLang) {
			translation = findTranslation(fallbackFile, key);
			// En desarrollo, advertir sobre el uso del fallback.
			if (translation !== null) {
				log.warn(
					`Falta la clave '${key}' en '${normalizedLang}'. Usando fallback a '${defaultLang}'.`,
				);
			}
		}

		// 3. Si la traducción sigue sin encontrarse, devolver la clave como último recurso.
		if (translation === null) {
			log.error(`No se encontró una traducción para la clave: '${key}'`);
			return key;
		}

		// 4. Si hay parámetros, reemplazarlos en la cadena.
		if (params) {
			translation = replaceParams(translation, params);
		}

		return translation;
	};
}
