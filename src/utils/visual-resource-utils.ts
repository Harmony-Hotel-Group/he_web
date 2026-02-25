// src/utils/visual-resource-utils.ts
/**
 * Utilidades para el sistema de recursos visuales
 * Funciones reutilizables y optimizadas
 * Con validación de archivos locales usando glob
 */

import { logger } from "@/services/logger";
import type { ImageMetadata } from "astro";

// Definir globs para diferentes tipos de recursos
// Usamos rutas relativas para asegurar compatibilidad
const assets = import.meta.glob<{ default: ImageMetadata }>("/src/assets/**/*");
const localImages = import.meta.glob<{ default: ImageMetadata }>(
	"/src/assets/img/**/*.{jpeg,jpg,png,gif,webp,svg,avif}",
);
const localVideos = import.meta.glob<{ default: string }>(
	"/src/assets/vid/**/*.{mp4,webm,ogg,mov,avi}",
);

const log = logger("VisualResourceUtils");

// Debug: Log keys once to understand structure
const assetKeys = Object.keys(assets);
if (assetKeys.length > 0) {
	log.info(
		`[VisualResourceUtils] Glob keys sample: ${assetKeys.slice(0, 3).join(", ")}`,
	);
} else {
	log.warn(`[VisualResourceUtils] No assets found in glob /src/assets/**/*`);
}

// ==================== TYPES ====================

export type ResourceType = "image" | "video" | "youtube";

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	finalSrc?: string | ImageMetadata;
}

interface CacheEntry {
	result: ValidationResult;
	timestamp: number;
}

// ==================== CACHE ====================

const validationCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutos

// ==================== DETECTION ====================

/**
 * Detecta el tipo de recurso basado en la URL
 */
export function detectResourceType(src: string | ImageMetadata): ResourceType {
	if (!src) return "image";
	if (typeof src !== "string") return "image";

	// YouTube URLs
	if (isYouTubeUrl(src)) {
		return "youtube";
	}

	// Video extensions
	const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
	const lowerSrc = src.toLowerCase();
	if (videoExtensions.some((ext) => lowerSrc.includes(ext))) {
		return "video";
	}

	// Image extensions (default)
	return "image";
}
export function isYouTubeUrl(url: string): boolean {
	const youtubePatterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
		/youtube\.com\/shorts\/([^&\s]+)/,
	];

	return youtubePatterns.some((pattern) => pattern.test(url));
}

/**
 * Extrae el video ID de una URL de YouTube
 */
export function extractYouTubeId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
		/youtube\.com\/embed\/([^&\s?]+)/,
		/youtube\.com\/shorts\/([^&\s?]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}

	return null;
}

/**
 * Genera URL de embed de YouTube optimizada
 */
export function getYouTubeEmbedUrl(
	videoId: string,
	options: {
		autoplay?: boolean;
		loop?: boolean;
		muted?: boolean;
		controls?: boolean;
	} = {},
): string {
	const {
		autoplay = false,
		loop = false,
		muted = false,
		controls = true,
	} = options;

	const params = new URLSearchParams({
		rel: "0", // No mostrar videos relacionados
		modestbranding: "1", // Logo minimalista
		iv_load_policy: "3", // Sin anotaciones
		playsinline: "1", // Autoplay en móviles
		enablejsapi: "1", // Permite control por JS
	});

	if (autoplay) {
		params.set("autoplay", "1");
		params.set("mute", "1"); // Mute es necesario para autoplay en la mayoría de navegadores
	}
	if (loop) {
		params.set("loop", "1");
		params.set("playlist", videoId);
	}
	if (muted) params.set("mute", "1");
	if (!controls) {
		params.set("controls", "0");
		params.set("disablekb", "1"); // Deshabilitar controles de teclado
		params.set("fs", "0"); // Deshabilitar pantalla completa
	}

	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

// ==================== VALIDACIÓN DE ARCHIVOS LOCALES ====================

/**
 * Valida si un archivo existe en el sistema de archivos local
 * Usa import.meta.glob para recursos en /src/
 */
async function validateLocalFile(src: string): Promise<ValidationResult> {
	// Normalizar ruta para coincidir con las claves del glob
	let normalizedPath = src;

	// Asegurar slash inicial
	if (!src.startsWith("/")) {
		normalizedPath = "/" + src;
	}

	// Manejar alias o rutas relativas comunes
	if (normalizedPath.startsWith("/assets/")) {
		normalizedPath = "/src" + normalizedPath;
	}

	// 1. Intento de coincidencia exacta
	if (assets[normalizedPath]) {
		try {
			const mod = await assets[normalizedPath]();
			// log.info(`[validateLocalFile] ✓ Encontrado (exacto): ${normalizedPath}`);
			return {
				isValid: true,
				finalSrc: mod.default,
			};
		} catch (e) {
			log.error(
				`[validateLocalFile] Error cargando módulo: ${normalizedPath}`,
				e,
			);
		}
	}

	// 2. Búsqueda robusta (Case insensitive y coincidencia parcial)
	const lowerTarget = normalizedPath.toLowerCase();

	// Iterar sobre todas las claves del glob
	for (const key of Object.keys(assets)) {
		const lowerKey = key.toLowerCase();

		// Coincidencia exacta insensible a mayúsculas/minúsculas
		// O si la clave termina con la ruta objetivo (para manejar prefijos faltantes)
		// O si la clave contiene la ruta objetivo (para manejar rutas relativas cortas)
		if (
			lowerKey === lowerTarget ||
			lowerKey.endsWith(lowerTarget) ||
			(lowerTarget.startsWith("/src/assets") && lowerKey.includes(lowerTarget))
		) {
			try {
				const mod = await assets[key]();
				// log.info(`[validateLocalFile] ✓ Encontrado (fuzzy): ${key} (buscado: ${normalizedPath})`);
				return {
					isValid: true,
					finalSrc: mod.default,
				};
			} catch (e) {
				log.error(`[validateLocalFile] Error cargando módulo fuzzy: ${key}`, e);
			}
		}
	}

	// 3. Verificar en /src/resources/vid/ (Videos) - Legacy support
	if (localVideos[normalizedPath]) {
		try {
			const mod = await localVideos[normalizedPath]();
			return { isValid: true, finalSrc: mod.default };
		} catch (e) {
			log.error(
				`[validateLocalFile] Error cargando video: ${normalizedPath}`,
				e,
			);
		}
	}

	// No encontrado en globs
	// Nota: Ya no verificamos 'public' con fs. Si está en public, se asume válido si no falla el fetch en dev,
	// o simplemente se devuelve como string para que el navegador intente cargarlo.

	// Si parece ser un archivo estático en public (no empieza con /src), lo devolvemos como válido
	// para que el navegador lo resuelva.
	if (!src.startsWith("/src/")) {
		return {
			isValid: true,
			finalSrc: src,
		};
	}

	log.warn(
		`[validateLocalFile] ✗ Archivo no encontrado en globs: ${src} (Norm: ${normalizedPath})`,
	);
	return {
		isValid: false,
		error: `Archivo local no encontrado en globs: ${src}`,
	};
}

// ==================== VALIDACIÓN PRINCIPAL ====================

/**
 * Valida si un recurso existe y es accesible
 * Soporta: archivos locales (vía glob), URLs remotas, YouTube
 */
export async function validateResource(
	src: string | ImageMetadata,
	type: ResourceType,
): Promise<ValidationResult> {
	// Si ya es ImageMetadata, es válido
	if (typeof src !== "string") {
		return {
			isValid: true,
			finalSrc: src,
		};
	}

	// Cache check
	const cached = getCachedValidation(src);
	if (cached) {
		return cached;
	}

	// YouTube siempre es válido si tiene ID
	if (type === "youtube") {
		const videoId = extractYouTubeId(src);
		if (videoId) {
			const result = { isValid: true, finalSrc: src };
			cacheValidation(src, result);
			return result;
		}
		return { isValid: false, error: "Invalid YouTube URL" };
	}

	// ==================== RECURSOS LOCALES ====================
	if (!src.startsWith("http://") && !src.startsWith("https://")) {
		try {
			const result = await validateLocalFile(src);
			cacheValidation(src, result);
			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error validando archivo local";
			const result = {
				isValid: false,
				error: errorMessage,
			};
			cacheValidation(src, result);
			return result;
		}
	}

	// ==================== RECURSOS REMOTOS ====================
	try {
		// En producción, asumir válido para no hacer requests externos
		if (import.meta.env.PROD) {
			const result = { isValid: true, finalSrc: src };
			cacheValidation(src, result);
			return result;
		}

		// En desarrollo, validar con HEAD request
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000);

		const response = await fetch(src, {
			method: "HEAD",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		const isValid = response.ok;
		const result = {
			isValid,
			finalSrc: isValid ? src : undefined,
			error: isValid ? undefined : `HTTP ${response.status}`,
		};

		cacheValidation(src, result);
		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		log.info(`[validateResource] Error validando ${src}:`, errorMessage);

		// Si es un error de DNS/dominio inexistente, RECHAZAR
		if (
			errorMessage.toLowerCase().includes("getaddrinfo") ||
			errorMessage.toLowerCase().includes("enotfound") ||
			errorMessage.toLowerCase().includes("failed to fetch") ||
			errorMessage.toLowerCase().includes("network error")
		) {
			const result = {
				isValid: false,
				error: `URL inválida: ${errorMessage}`,
			};
			cacheValidation(src, result);
			return result;
		}

		// Si es timeout o CORS, asumir válido (puede funcionar en navegador)
		const result = {
			isValid: true,
			finalSrc: src,
			error: errorMessage,
		};

		cacheValidation(src, result);
		return result;
	}
}

// ==================== CACHE HELPERS ====================

/**
 * Obtiene validación del cache
 */
function getCachedValidation(src: string): ValidationResult | null {
	const entry = validationCache.get(src);

	if (!entry) return null;

	// Verificar TTL
	if (Date.now() - entry.timestamp > CACHE_TTL) {
		validationCache.delete(src);
		return null;
	}

	return entry.result;
}

/**
 * Guarda validación en cache
 */
function cacheValidation(src: string, result: ValidationResult): void {
	validationCache.set(src, {
		result,
		timestamp: Date.now(),
	});

	// Limpiar cache viejo si crece mucho
	if (validationCache.size > 100) {
		const now = Date.now();
		for (const [key, entry] of validationCache.entries()) {
			if (now - entry.timestamp > CACHE_TTL) {
				validationCache.delete(key);
			}
		}
	}
}

// ==================== PLACEHOLDER ====================

/**
 * Genera URL de placeholder optimizada
 */
export function getPlaceholderUrl(
	type: ResourceType,
	width: number = 600,
	height: number = 400,
	text?: string,
): string {
	const defaultText = type === "video" ? "Video" : "Imagen";
	const finalText = text || `${defaultText}+No+Encontrado`;

	return `https://placehold.co/${width}x${height}?text=${finalText}`;
}

// ==================== UTILITIES ====================

/**
 * Limpia el cache de validaciones
 */
export function clearValidationCache(): void {
	validationCache.clear();
	log.info("[VisualResource] Cache cleared");
}

/**
 * Obtiene estadísticas del cache
 */
export function getCacheStats() {
	return {
		size: validationCache.size,
		entries: Array.from(validationCache.keys()),
	};
}

/**
 * Busca un recurso en múltiples ubicaciones
 * Útil para encontrar archivos sin saber la ruta exacta
 */
export async function findResource(
	filename: string,
	type: ResourceType,
): Promise<string | null> {
	// Buscar en los globs
	const searchGlobs = type === "image" ? [assets, localImages] : [localVideos];

	for (const glob of searchGlobs) {
		for (const key of Object.keys(glob)) {
			if (key.endsWith(filename)) {
				return key;
			}
		}
	}

	return null;
}

// ==================== DEV TOOLS ====================

// Exponer en desarrollo para debugging
if (import.meta.env.DEV) {
	if (typeof window !== "undefined") {
		(window as any).__visualResourceUtils = {
			clearCache: clearValidationCache,
			getCacheStats,
			detectResourceType,
			extractYouTubeId,
			isYouTubeUrl,
			getYouTubeEmbedUrl,
			findResource,
		};

		log.info(
			"[VisualResource] Dev utils available at window.__visualResourceUtils",
		);
	}
}

export function imagePath({ url, back = 0 }: { url: string; back?: number }) {
	let finalPath = "";
	// Si ya tiene el prefijo correcto, devolverla tal cual
	if (url.startsWith("/src/assets")) {
		return url;
	}

	// Si comienza con ~ o / eliminarlo
	const cleanPath =
		url.startsWith("~") || url.startsWith("/") ? url.substring(1) : url;

	if (back > 0) {
		for (let i = 0; i < back; i++) {
			finalPath = `../${finalPath}`;
		}
	} else {
		finalPath = `/src/assets/${cleanPath}`;
	}
	// Devolver la ruta correcta
	return finalPath;
}
