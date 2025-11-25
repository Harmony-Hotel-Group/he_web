// src/utils/visual-resource-utils.ts
/**
 * Utilidades para el sistema de recursos visuales
 * Funciones reutilizables y optimizadas
 * Con validación de archivos locales usando fs y glob
 */

import { logger } from "@/services/logger";
import type { ImageMetadata } from "astro";

// Solo importar fs en servidor (build-time)
let fs: typeof import('node:fs').promises | null = null;
let path: typeof import('node:path') | null = null;

// Importar dinámicamente solo si estamos en Node.js
if (typeof process !== 'undefined' && process.versions?.node) {
	try {
		fs = await import('node:fs').then(m => m.promises);
		path = await import('node:path');
	} catch (error) {
		// Ignorar si no está disponible (navegador)
	}
}

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
export function detectResourceType(src: string): ResourceType {
	if (!src) return "image";

	log.info(`[detectResourceType] Analyzing: ${src}`);

	// YouTube URLs
	if (isYouTubeUrl(src)) {
		log.info(`[detectResourceType] Detected YouTube URL: ${src}`);
		return "youtube";
	}

	// Video extensions
	const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
	const lowerSrc = src.toLowerCase();
	if (videoExtensions.some((ext) => lowerSrc.includes(ext))) {
		log.info(`[detectResourceType] Detected video extension: ${src}`);
		return "video";
	}

	// Image extensions (default)
	log.info(`[detectResourceType] Defaulting to image: ${src}`);
	return "image";
}

/**
 * Verifica si una URL es de YouTube
 */
export function isYouTubeUrl(url: string): boolean {
	log.info(`[isYouTubeUrl] Checking URL: ${url}`);

	const youtubePatterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
		/youtube\.com\/shorts\/([^&\s]+)/,
	];

	const isYouTube = youtubePatterns.some((pattern) => pattern.test(url));

	log.info(`[isYouTubeUrl] URL: ${url} | Is YouTube: ${isYouTube}`);

	return isYouTube;
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

// ==================== GLOBS ====================

const localImages = import.meta.glob(
	"/src/resources/img/**/*.{jpeg,jpg,png,gif,webp,svg,avif}",
);

const localVideos = import.meta.glob(
	"/src/resources/vid/**/*.{mp4,webm,ogg,mov,avi}",
);

// ==================== VALIDACIÓN DE ARCHIVOS LOCALES ====================

/**
 * Valida si un archivo existe en el sistema de archivos local
 * Usa import.meta.glob para recursos en /src/
 * Usa fs para recursos en /public/ (si está disponible)
 */
async function validateLocalFile(src: string): Promise<ValidationResult> {
	// 1. Verificar en /src/resources/img/ (Imágenes)
	const possiblePaths = [
		src,
		// `/src/resources/img${src.startsWith("/") ? src : `/${src}`}`,
		// `/src/resources${src.startsWith("/") ? src : `/${src}`}`,
		// `/src${src.startsWith("/") ? src : `/${src}`}`,
	];
	log.warn(`[validateLocalFile] Posibles rutas en src: ${possiblePaths}`);
	for (const p of possiblePaths) {
		if (localImages[p]) {
			try {
				const mod = (await localImages[p]()) as { default: ImageMetadata };
				log.info(`[validateLocalFile] ✓ Encontrado en src (img): ${JSON.stringify(mod.default)}`);
				return {
					isValid: true,
					finalSrc: mod.default,
				};
			} catch (e) {
				log.error(`[validateLocalFile] Error cargando módulo: ${p}`, e);
			}
		}
	}

	// 2. Verificar en /src/resources/vid/ (Videos)
	for (const p of possiblePaths) {
		// Ajustar ruta para video si es necesario
		const videoPath = p.replace("/img/", "/vid/");

		if (localVideos[videoPath]) {
			log.info(`[validateLocalFile] ✓ Encontrado en src (vid): ${videoPath}`);
			return {
				isValid: true,
				finalSrc: videoPath,
			};
		}
		if (localVideos[p]) {
			log.info(`[validateLocalFile] ✓ Encontrado en src (vid): ${p}`);
			return {
				isValid: true,
				finalSrc: p,
			};
		}
	}

	// 3. Verificar en /public/ usando fs (solo servidor)
	if (fs && path && process.cwd) {
		try {
			const publicPath = path.join(process.cwd(), "public", src.startsWith("/") ? src.slice(1) : src);
			await fs.access(publicPath, fs.constants.F_OK);
			log.info(`[validateLocalFile] ✓ Encontrado en public: ${publicPath}`);
			return {
				isValid: true,
				finalSrc: src,
			};
		} catch {
			// No está en public
		}
	}

	// No encontrado
	log.info(`[validateLocalFile] ✗ Archivo no encontrado: ${src}`);
	return {
		isValid: false,
		error: `Archivo local no encontrado: ${src}`,
	};
}

// ==================== VALIDACIÓN PRINCIPAL ====================

/**
 * Valida si un recurso existe y es accesible
 * Soporta: archivos locales (con fs), URLs remotas, YouTube
 */
export async function validateResource(
	src: string,
	type: ResourceType,
): Promise<ValidationResult> {
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
		// Intentar validar con fs (servidor/build-time)
		if (fs && path && typeof process !== 'undefined' && typeof process.cwd === 'function') {
			try {
				const result = await validateLocalFile(src);
				cacheValidation(src, result);
				return result;
			} catch (error) {
				const errorMessage = error instanceof Error
					? error.message
					: "Error accediendo archivo local";

				log.info(`[validateResource] Error en fs: ${errorMessage}`);

				const result = {
					isValid: false,
					error: errorMessage,
				};

				cacheValidation(src, result);
				return result;
			}
		}

		// Fallback: intentar con fetch (funciona en dev server)
		if (import.meta.env.DEV) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 2000);

				const response = await fetch(src, {
					method: "HEAD",
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				const isValid = response.ok;
				const result = {
					isValid,
					finalSrc: isValid ? src : undefined,
					error: isValid
						? undefined
						: `Archivo local no encontrado: ${response.status}`,
				};

				cacheValidation(src, result);
				return result;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Archivo local no accesible";

				const result = {
					isValid: false,
					finalSrc: undefined,
					error: errorMessage,
				};

				cacheValidation(src, result);
				return result;
			}
		}

		// En producción o navegador, asumir válido
		const result = { isValid: true, finalSrc: src };
		cacheValidation(src, result);
		return result;
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
		const errorMessage =
			error instanceof Error ? error.message : String(error);

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
	if (!fs || !path || typeof process === 'undefined' || typeof process.cwd !== 'function') {
		return null;
	}

	try {
		const cwd = process.cwd();
		const searchPaths = type === 'image'
			? [
				path.join(cwd, 'public', 'images', filename),
				path.join(cwd, 'public', 'img', filename),
				path.join(cwd, 'src', 'resources', 'img', filename),
			]
			: type === 'video'
				? [
					path.join(cwd, 'public', 'videos', filename),
					path.join(cwd, 'public', 'vid', filename),
					path.join(cwd, 'src', 'resources', 'vid', filename),
				]
				: [];

		for (const filePath of searchPaths) {
			try {
				await fs.access(filePath, fs.constants.F_OK);

				// Convertir a ruta relativa desde public
				if (filePath.includes('/public/')) {
					return '/' + filePath.split('/public/')[1];
				}

				return filePath;
			} catch {
				continue;
			}
		}
	} catch (error) {
		log.info('[findResource] Error:', error);
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