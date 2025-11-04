// services/api.ts
import { log, warn, error } from "./logger";
const CONTEXT = "Api";

/**
 * Opciones de configuración para el constructor de ApiService.
 */
interface ApiServiceOptions {
	baseUrl: string;
	timeout?: number;
}

/**
 * Opciones para una solicitud de `fetchData`.
 */
interface FetchOptions {
	params?: Record<string, any>;
	headers?: Record<string, string>;
}

/**
 * Una clase para interactuar con la API, encapsulando la lógica de fetching,
 * timeouts y fallbacks.
 */
export class Api {
	private readonly baseUrl: string;
	private readonly apiTimeout: number;

	constructor(options: ApiServiceOptions) {
		if (!options.baseUrl) {
			throw new Error("ApiService requiere una 'baseUrl' en las opciones.");
		}
		this.baseUrl = options.baseUrl;
		this.apiTimeout = options.timeout ?? 8000; // Default a 8 segundos
		log(CONTEXT, "Servicio de API inicializado con opciones:", options);
	}

	// ============== Métodos Públicos ==============

	public async fetch<T>(
		key: string,
		opts: FetchOptions = {},
	): Promise<T | null> {
		const { params, headers } = opts;
		log(CONTEXT, `Iniciando fetch para clave: '${key}'`, { params, headers });

		const endpoint = this.keyToEndpoint(key);
		const url = new URL(this.baseUrl);
		// Solo añadir /api si no es la raíz, para flexibilidad
		if (endpoint) {
			url.pathname += endpoint.startsWith("/") ? endpoint : `/api/${endpoint}`;
		}

		if (params && typeof params === "object") {
			for (const [k, v] of Object.entries(params)) {
				if (v !== undefined && v !== null) {
					url.searchParams.set(k, String(v));
				}
			}
		}

		const finalHeaders = { Accept: "application/json", ...(headers || {}) };
		log(CONTEXT, `Petición a ${url.toString()} con headers:`, finalHeaders);

		try {
			// Solo intentar fetch si la baseUrl no es solo "/"
			if (this.baseUrl === "/")
				throw new Error(
					"La URL base de la API no está configurada, usando fallback local.",
				);

			const res = await this.fetchWithTimeout(url.toString(), {
				headers: finalHeaders,
			});
			if (!res.ok) {
				throw new Error(`Respuesta no exitosa de la API: ${res.status}`);
			}
			const payload = await res.json().catch(() => null);
			log(CONTEXT, `Payload crudo recibido para '${key}':`, payload);

			const data = (payload?.data ?? payload ?? null) as T | null;
			log(CONTEXT, `Datos finales procesados para '${key}':`, data);

			return data;
		} catch (e: any) {
			warn(
				CONTEXT,
				`El fetch para '${key}' falló. Intentando fallback local. Error:`,
				e?.message || e,
			);

			const local = await this.readLocalFallback<T>(endpoint);
			if (local != null) {
				log(CONTEXT, `Fallback local para '${key}' encontrado y cargado.`);
				return local;
			}

			error(
				CONTEXT,
				`El fallback local para '${key}' también falló. No se pudieron obtener los datos.`,
			);
			return null;
		}
	}

	public async multiFetch<T = any>(
		inputs: string[] | Record<string, FetchOptions>,
	): Promise<Record<string, T | null | Error>> {
		log(CONTEXT, "Iniciando multi-fetch con entradas:", inputs);
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
			this.fetch<T>(key, opt).then(
				(data) => ({ key, data, status: "fulfilled" as const }),
				(error) => ({ key, error, status: "rejected" as const }),
			),
		);

		const settled = await Promise.all(promises);
		log(CONTEXT, "Resultados de multi-fetch:", settled);

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
			log(
				CONTEXT,
				`[SSR] Buscando fallback local para '${endpoint}' en src/data/`,
			);
			try {
				// Vite/Astro manejan este glob para encontrar los archivos JSON en src/data
				const modules = import.meta.glob("/src/data/*.json");
				const path = `/src/data/${endpoint}.json`;

				if (modules[path]) {
					const module = await modules[path]();
					// @ts-expect-error
					const data = module.default;
					log(
						CONTEXT,
						`[SSR] Fallback local para '${endpoint}' cargado con éxito desde src/data.`,
					);
					return data;
				} else {
					warn(
						CONTEXT,
						`[SSR] No se encontró el archivo de fallback en la ruta: ${path}`,
					);
					return null;
				}
			} catch (e: any) {
				error(
					CONTEXT,
					`[SSR] Error al importar dinámicamente el fallback para '${endpoint}':`,
					e.message,
				);
				return null;
			}
		} else {
			warn(
				CONTEXT,
				"readLocalFallback solo está soportado en el servidor (SSR). En el cliente, este método no hará nada.",
			);
			return null;
		}
	}
}

// Para que Vite incluya la variable de entorno en el cliente, debe empezar con PUBLIC_
export const api = new Api({
	baseUrl: import.meta.env.PUBLIC_API_BASE_URL || "/",
});
