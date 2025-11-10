// services/api.ts
import { logger } from "./logger";

const log = logger("Api");

/**
 * Opciones de configuración para el constructor de ApiService.
 */
interface ApiServiceOptions {
	baseUrl: string;
	cacheDuration?: number;
	timeout?: number;
}

/**
 * Opciones para una solicitud de `fetchData`.
 */
interface FetchOptions {
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
}

/**
 * Una clase para interactuar con la API, encapsulando la lógica de fetching,
 * timeouts y fallbacks.
 */
export class Api {
	private readonly baseUrl: string;
	private readonly apiTimeout: number;
	private readonly cacheDuration: number;
	private cache = new Map<string, { data: unknown; timestamp: number }>();

	constructor(options: ApiServiceOptions) {
		if (!options.baseUrl) {
			throw new Error("ApiService requiere una 'baseUrl' en las opciones.");
		}
		this.baseUrl = options.baseUrl;
		this.apiTimeout = options.timeout ?? 8000; // 8 segundos por defecto
		this.cacheDuration = options.cacheDuration ?? 5 * 60 * 1000; // 5 minutos por defecto
		log.info("Servicio de API inicializado con opciones:", options);
	}

	// ============== Métodos Públicos ==============

	public warmUpCache(key: string, data: unknown) {
		if (data) {
			this.cache.set(key, { data, timestamp: Date.now() });
			log.info(`Caché pre-cargado para la clave: '${key}'`);
		}
	}

	public async fetch<T>(
		key: string,
		opts: FetchOptions = {},
	): Promise<T | null> {
		const { params, headers } = opts;
		const endpoint = this.keyToEndpoint(key); // ej: "config"
		log.info(`Iniciando fetch para clave: '${key}'`, {
			endpoint,
			params,
			headers,
		});

		// 1. Revisar el caché primero
		const cachedItem = this.cache.get(key);
		if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheDuration) {
			log.info(`Retornando datos desde el caché para la clave: '${key}'`);
			return cachedItem.data as T;
		}

		// Helper para manejar el fallback y evitar duplicar código.
		const handleFallback = async (
			errorSource: string | Error,
		): Promise<T | null> => {
			const errorMessage =
				errorSource instanceof Error
					? errorSource.message
					: String(errorSource);
			log.warn(
				`El fetch para '${key}' falló. Intentando fallback local. Error:`,
				errorMessage,
			);

			const local = await this.readLocalFallback<T>(endpoint);
			if (local != null) {
				log.info(`Fallback local para '${key}' encontrado y cargado.`);
				return local;
			}

			log.error(
				`El fallback local para '${key}' también falló. No se pudieron obtener los datos.`,
			);
			return null;
		};

		if (!this.baseUrl.startsWith("http")) {
			return await handleFallback(
				new Error(
					"La URL base de la API no está configurada, usando fallback local.",
				),
			);
		}

		try {
			// Construcción de URL segura
			const url = new URL(`/api/${endpoint}`, this.baseUrl);

			if (params && typeof params === "object") {
				for (const [k, v] of Object.entries(params)) {
					if (v !== undefined && v !== null) {
						url.searchParams.set(k, String(v));
					}
				}
			}

			const finalHeaders = { Accept: "application/json", ...(headers || {}) };
			log.info(`Petición a ${url.toString()} con headers:`, finalHeaders);

			const res = await this.fetchWithTimeout(url.toString(), {
				headers: finalHeaders,
			});
			if (!res.ok) {
				new Error(`Respuesta no exitosa de la API: ${res.status}`);
			}
			const payload = await res.json().catch(() => null);
			log.info(`Payload crudo recibido para '${key}':`, payload);

			const data = (payload?.data ?? payload ?? null) as T | null;
			log.info(`Datos finales procesados para '${key}':`, data);

			// Guardar en caché si la respuesta fue exitosa
			if (data !== null) {
				this.cache.set(key, { data, timestamp: Date.now() });
			}

			return data;
		} catch (e) {
			return await handleFallback(e);
		}
	}

	public async multiFetch<T = unknown>(
		inputs: string[] | Record<string, FetchOptions>,
	): Promise<Record<string, T | null | Error>> {
		log.info("Iniciando multi-fetch con entradas:", inputs);
		let entries: [string, FetchOptions][];

		if (Array.isArray(inputs)) {
			entries = inputs.map((key) => [key, {}]);
		} else if (inputs && typeof inputs === "object" && !Array.isArray(inputs)) {
			entries = Object.entries(inputs);
		} else {
			throw new Error(
				"multiFetch espera un array de strings o un objeto de opciones.",
			);
		}

		const promises = entries.map(([key, opt]) =>
			this.fetch<T>(key, opt)
				.then((data) => ({ key, data, status: "fulfilled" as const }))
				// Capturamos el error para que Promise.all no se detenga.
				.catch((error) => ({ key, error, status: "rejected" as const })),
		);

		const settled = await Promise.all(promises);
		log.info("Resultados de multi-fetch:", settled);

		return settled.reduce<Record<string, T | null | Error>>((acc, result) => {
			if (result.status === "rejected") {
				acc[result.key] = result.error;
			} else {
				acc[result.key] = result.data;
			}
			return acc;
		}, {});
	}

	// ============== Helpers Privados ==============

	private async fetchWithTimeout(
		url: RequestInfo,
		options: RequestInit = {},
		timeout?: number,
	): Promise<Response> {
		const controller = new AbortController();
		const resolvedTimeout = timeout ?? this.apiTimeout;
		const id = setTimeout(() => controller.abort(), resolvedTimeout);

		try {
			const res = await fetch(url, { ...options, signal: controller.signal });
			clearTimeout(id);
			return res;
		} catch (e) {
			clearTimeout(id);
			// Si el error es por AbortError, lanzamos un mensaje más claro.
			if (e instanceof DOMException && e.name === "AbortError") {
				throw new Error(
					`La solicitud excedió el tiempo de espera de ${resolvedTimeout / 1000}s.`,
				);
			}
			throw e;
		}
	}

	private keyToEndpoint(key: string): string {
		return key.replace(/^\/|\/$/g, "");
	}

	private async readLocalFallback<T>(endpoint: string): Promise<T | null> {
		// Este mitodo solo funciona en el servidor. En el cliente, fallará de forma segura.
		if (import.meta.env.SSR) {
			log.info(`[SSR] Buscando fallback local para '${endpoint}' en src/data/`);
			try {
				// Vite/Astro manejan este glob para encontrar los archivos JSON en src/data
				const modules = import.meta.glob("/src/data/*.json");
				const path = `/src/data/${endpoint}.json`;

				if (modules[path]) {
					const module = await modules[path]();
					// @ts-expect-error
					const data = module.default;
					log.info(
						`[SSR] Fallback local para '${endpoint}' cargado con éxito desde src/data.`,
					);
					return data;
				} else {
					log.warn(
						`[SSR] No se encontró el archivo de fallback en la ruta: ${path}`,
					);
					return null;
				}
			} catch (e) {
				const error = e instanceof Error ? e.message : String(e);
				log.error(
					`[SSR] Error al importar dinámicamente el fallback para '${endpoint}':`,
					error,
				);
				return null;
			}
		} else {
			log.warn(
				"readLocalFallback solo está soportado en el servidor (SSR). En el cliente, este método no hará nada.",
			);
			return null;
		}
	}
}

// --- Instancia Singleton de la API ---

// 1. Leer el intervalo de caché desde las variables de entorno.
//    El valor por defecto será 5 minutos si no se especifica.
const cacheMinutes = parseInt(
	import.meta.env.STATUS_CHECK_INTERVAL_MINUTES || "5",
	10,
);
const cacheDurationMs = cacheMinutes * 60 * 1000;

log.info(
	`Intervalo de caché configurado a ${cacheMinutes} minutos (${cacheDurationMs}ms).`,
);

export const api = new Api({
	baseUrl: import.meta.env.PUBLIC_API_BASE_URL || "",
	cacheDuration: cacheDurationMs,
});

/**
 * Función de inicialización del lado del servidor.
 * Realiza una llamada inicial para obtener datos críticos (ej. 'config')
 * y los pre-carga en el caché de la instancia de la API.
 * Esto solo se ejecuta una vez cuando el servidor de Astro arranca.
 */
async function initializeApiOnServer() {
	if (import.meta.env.SSR) {
		log.info("[SSR] Inicializando API y pre-cargando datos críticos...");
		try {
			// Obtenemos la configuración una sola vez.
			const config = await api.fetch("config");
			if (config) {
				// La guardamos en el caché para que esté disponible instantáneamente para todas las páginas.
				api.warmUpCache("config", config);
			}
		} catch (error) {
			log.error("[SSR] Falló la pre-carga de datos para la API.", error);
		}
	}
}

// Ejecutamos la inicialización.
await initializeApiOnServer();
