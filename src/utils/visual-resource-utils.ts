// src/utils/visual-resource-utils.ts
/**
 * Utilidades para el sistema de recursos visuales
 * Funciones reutilizables y optimizadas
 * Con validación de archivos locales usando glob
 */

import { logger } from "@/services/logger";
import type { ImageMetadata } from "astro";

// Definir globs para diferentes tipos de recursos
const assets = import.meta.glob<{ default: ImageMetadata }>("/src/assets/**/*");
const localImages = import.meta.glob<{ default: ImageMetadata }>(
	"/src/resources/img/**/*.{jpeg,jpg,png,gif,webp,svg,avif}",
);
const localVideos = import.meta.glob<{ default: string }>(
	"/src/resources/vid/**/*.{mp4,webm,ogg,mov,avi}",
);

const log = logger("VisualResourceUtils");

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

	if (autoplay) params.set("autoplay", "1");
	if (loop) {
		params.set("loop", "1");
		params.set("playlist", videoId);
	}
	if (muted) params.set("mute", "1");
	if (!controls) params.set("controls", "0");

	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

// ==================== VALIDACIÓN DE ARCHIVOS LOCALES ====================

/**
 * Valida si un archivo existe en el sistema de archivos local
 * Usa import.meta.glob para recursos en /src/
 */
async function validateLocalFile(src: string): Promise<ValidationResult> {
	// Normalizar ruta para coincidir con las claves del glob
	// Asegurar que empiece con /src/ si no lo tiene
	let normalizedPath = src;
	if (!src.startsWith("/")) {
		normalizedPath = "/" + src;
	}
	if (!normalizedPath.startsWith("/src/")) {
		// Si es una ruta relativa o de alias, intentar resolverla o asumir que es relativa a src
		// Por ahora, intentamos buscarla tal cual si empieza con /src, o añadimos /src si parece estar en assets
		if (normalizedPath.startsWith("/assets/")) {
			normalizedPath = "/src" + normalizedPath;
		}
	}

	// Generar variaciones de ruta para buscar en diferentes ubicaciones
	const possibleImgPaths: string[] = [normalizedPath];
	
	// Si busca en /src/resources/img/, también buscar en /src/assets/img/
	if (normalizedPath.startsWith("/src/resources/img/")) {
		const assetsPath = normalizedPath.replace("/src/resources/img/", "/src/assets/img/");
		possibleImgPaths.push(assetsPath);
	}
	
	// Si busca en /src/assets/img/, también buscar en /src/resources/img/ (legacy)
	if (normalizedPath.startsWith("/src/assets/img/")) {
		const resourcesPath = normalizedPath.replace("/src/assets/img/", "/src/resources/img/");
		possibleImgPaths.push(resourcesPath);
	}
	
	// 1. Verificar en assets glob (general) - busca en /src/assets/**/*
	for (const p of possibleImgPaths) {
		if (assets[p]) {
			try {
				const mod = await assets[p]();
				log.info(
					`[validateLocalFile] ✓ Encontrado en assets: ${p}`,
				);
				return {
					isValid: true,
					finalSrc: mod.default,
				};
			} catch (e) {
				log.error(`[validateLocalFile] Error cargando módulo: ${p}`, e);
			}
		}
	}
	
	// 2. Verificar en /src/resources/img/ (Imágenes legacy/específicas)
	for (const p of possibleImgPaths) {
		if (localImages[p]) {
			try {
				const mod = await localImages[p]();
				log.info(
					`[validateLocalFile] ✓ Encontrado en src (img): ${p}`,
				);
				return {
					isValid: true,
					finalSrc: mod.default,
				};
			} catch (e) {
				log.error(`[validateLocalFile] Error cargando módulo: ${p}`, e);
			}
		}
	}

	// 3. Verificar en /src/resources/vid/ (Videos)
	const possibleVidPaths = [
		normalizedPath,
		`/src/resources/vid${normalizedPath.startsWith("/src/resources/vid") ? normalizedPath.replace("/src/resources/vid", "") : normalizedPath}`,
	];

	for (const p of possibleVidPaths) {
		if (localVideos[p]) {
			try {
				const mod = await localVideos[p]();
				// Para videos, el default suele ser la URL (string)
				log.info(`[validateLocalFile] ✓ Encontrado en src (vid): ${mod.default}`);
				return {
					isValid: true,
					finalSrc: mod.default,
				};
			} catch (e) {
				log.error(`[validateLocalFile] Error cargando módulo: ${p}`, e);
			}
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

	log.info(`[validateLocalFile] ✗ Archivo no encontrado en globs: ${src}`);
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
				error instanceof Error ? error.message : "Error validando archivo local";
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