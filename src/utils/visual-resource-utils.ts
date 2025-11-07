// src/utils/visual-resource-utils.ts
/**
 * Utilidades para el sistema de recursos visuales
 * Funciones reutilizables y optimizadas
 */

// ==================== TYPES ====================

export type ResourceType = "image" | "video" | "youtube";

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	finalSrc?: string;
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

	if (import.meta.env.DEV) {
		console.log(`[detectResourceType] Analyzing: ${src}`);
	}

	// YouTube URLs
	if (isYouTubeUrl(src)) {
		if (import.meta.env.DEV) {
			console.log(`[detectResourceType] Detected YouTube URL: ${src}`);
		}
		return "youtube";
	}

	// Video extensions
	const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
	const lowerSrc = src.toLowerCase();
	if (videoExtensions.some((ext) => lowerSrc.includes(ext))) {
		if (import.meta.env.DEV) {
			console.log(`[detectResourceType] Detected video extension: ${src}`);
		}
		return "video";
	}

	// Image extensions (default)
	if (import.meta.env.DEV) {
		console.log(`[detectResourceType] Defaulting to image: ${src}`);
	}
	return "image";
}

/**
 * Verifica si una URL es de YouTube
 */
export function isYouTubeUrl(url: string): boolean {
	if (import.meta.env.DEV) {
		console.log(`[isYouTubeUrl] Checking URL: ${url}`);
	}

	const youtubePatterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
		/youtube\.com\/shorts\/([^&\s]+)/,
	];

	const isYouTube = youtubePatterns.some((pattern) => pattern.test(url));

	if (import.meta.env.DEV) {
		console.log(`[isYouTubeUrl] URL: ${url} | Is YouTube: ${isYouTube}`);
	}

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
/**
 * Genera una URL de embed de YouTube optimizada para performance y control
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
		enablejsapi: "1", // Permite control por JS (opcional)
	});

	if (autoplay) params.set("autoplay", "1");
	if (loop) {
		params.set("loop", "1");
		params.set("playlist", videoId); // Necesario para loop en YouTube
	}
	if (muted) params.set("mute", "1");
	if (!controls) params.set("controls", "0");

	// Usamos youtube-nocookie para privacidad
	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

// ==================== VALIDATION ====================

/**
 * Valida si un recurso existe y es accesible
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

	// Recursos locales (no HTTP) - verificar existencia
	if (!src.startsWith("http")) {
		// En desarrollo, intentar validar con fetch
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
				// Si hay error de red o archivo no existe, marcar como inválido
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
		} else {
			// En producción, asumir válido pero permitir fallback en el componente
			const result = { isValid: true, finalSrc: src };
			cacheValidation(src, result);
			return result;
		}
	}

	// Validar recursos remotos
	try {
		// En producción, asumir válido para no hacer requests
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
			error instanceof Error ? error.message : "Unknown error";

		// En caso de error de red, asumir que puede estar válido
		const result = {
			isValid: true,
			finalSrc: src,
			error: errorMessage,
		};

		cacheValidation(src, result);
		return result;
	}
}

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
	console.log("[VisualResource] Cache cleared");
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

// ==================== DEV TOOLS ====================

// Exponer en desarrollo para debugging
if (import.meta.env.DEV) {
	if (typeof window !== "undefined") {
		window.__visualResourceUtils = {
			clearCache: clearValidationCache,
			getCacheStats,
			detectResourceType,
			extractYouTubeId,
			isYouTubeUrl,
			getYouTubeEmbedUrl,
		};

		console.log(
			"[VisualResource] Dev utils available at window.__visualResourceUtils",
		);
	}
}
