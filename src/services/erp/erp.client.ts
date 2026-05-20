import { logger } from "@/services/logger";

const log = logger("services:erp:client");

export type ErpMode = "mock" | "real";

export interface ErpClientOptions {
	mode?: ErpMode;
	baseUrl?: string;
	timeoutMs?: number;
	headers?: Record<string, string>;
}

export interface ErpRequestOptions {
	params?: Record<string, string | number | boolean | undefined | null>;
	headers?: Record<string, string>;
	body?: unknown;
}

function deepClone<T>(value: T): T {
	if (typeof structuredClone === "function") {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value));
}

/**
 * Cliente HTTP para el ERP.
 *
 * - En modo mock devuelve los datos pasados como `mockData` sin llamar red.
 * - En modo real consulta PUBLIC_ERP_BASE_URL y traduce errores a mock para
 *   mantener la resiliencia del frontend.
 */
export class ErpClient {
	private readonly mode: ErpMode;
	private readonly baseUrl: string;
	private readonly timeoutMs: number;
	private readonly headers: Record<string, string>;

	constructor(options: ErpClientOptions = {}) {
		this.mode =
			options.mode ?? ((import.meta.env.PUBLIC_ERP_MODE as ErpMode) || "mock");
		this.baseUrl =
			options.baseUrl ?? (import.meta.env.PUBLIC_ERP_BASE_URL as string) ?? "";
		this.timeoutMs =
			options.timeoutMs ??
			Number(import.meta.env.PUBLIC_ERP_TIMEOUT_MS || 8000);
		this.headers = options.headers ?? { Accept: "application/json" };
	}

	public getMode(): ErpMode {
		return this.mode;
	}

	public isReal(): boolean {
		return this.mode === "real" && this.baseUrl.length > 0;
	}

	private async request<T>(
		method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
		path: string,
		mockData: T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		if (this.mode === "mock") {
			log.info(`[MOCK] ERP ${method} ${path}`);
			return deepClone(mockData);
		}

		if (!this.baseUrl) {
			log.warn(
				`ERP mode=real pero PUBLIC_ERP_BASE_URL vacío. Retorna mock para '${path}'.`,
			);
			return deepClone(mockData);
		}

		const url = new URL(path, this.baseUrl);
		for (const [key, value] of Object.entries(options.params ?? {})) {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, String(value));
			}
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

		try {
			log.info(`[REAL] ERP ${method} ${url.toString()}`);

			const body =
				options.body !== undefined ? JSON.stringify(options.body) : undefined;

			const response = await fetch(url.toString(), {
				method,
				headers: {
					...this.headers,
					...(options.headers ?? {}),
					...(body ? { "Content-Type": "application/json" } : {}),
				},
				body,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(
					`ERP ${method} ${url.pathname} falló: ${response.status}`,
				);
			}

			// DELETE puede responder 204 No Content
			if (response.status === 204) {
				return undefined as T;
			}

			return (await response.json()) as T;
		} catch (error) {
			log.error(`Error ERP ${method} '${path}'. Retorna mock.`, error);
			return deepClone(mockData);
		} finally {
			clearTimeout(timeout);
		}
	}

	/**
	 * GET — obtiene datos del ERP o mock.
	 */
	public async get<T>(
		path: string,
		mockData: T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		return this.request("GET", path, mockData, options);
	}

	/**
	 * POST — crea un recurso en el ERP. En mock devuelve un stub con id generado.
	 */
	public async post<T>(
		path: string,
		mockData: T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		return this.request("POST", path, mockData, options);
	}

	/**
	 * PUT — actualiza un recurso completo.
	 */
	public async put<T>(
		path: string,
		mockData: T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		return this.request("PUT", path, mockData, options);
	}

	/**
	 * PATCH — actualización parcial.
	 */
	public async patch<T>(
		path: string,
		mockData: T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		return this.request("PATCH", path, mockData, options);
	}

	/**
	 * DELETE — elimina un recurso. En mock retorna undefined (simula 204).
	 */
	public async delete<T = void>(
		path: string,
		mockData: T = undefined as T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		return this.request("DELETE", path, mockData, options);
	}
}

export const erpClient = new ErpClient();
