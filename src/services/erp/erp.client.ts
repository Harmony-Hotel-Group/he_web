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
}

function deepClone<T>(value: T): T {
	if (typeof structuredClone === "function") {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value));
}

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

	public async get<T>(
		path: string,
		mockData: T,
		options: ErpRequestOptions = {},
	): Promise<T> {
		if (this.mode === "mock") {
			log.info(`[MOCK] ERP GET ${path}`);
			return deepClone(mockData);
		}

		if (!this.baseUrl) {
			log.warn(
				`ERP mode=real pero PUBLIC_ERP_BASE_URL está vacío. Se retorna mock para '${path}'.`,
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
			log.info(`[REAL] ERP GET ${url.toString()}`);
			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					...this.headers,
					...(options.headers ?? {}),
				},
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`ERP GET ${url.pathname} falló: ${response.status}`);
			}

			return (await response.json()) as T;
		} catch (error) {
			log.error(`Error ERP GET '${path}'. Se retorna mock.`, error);
			return deepClone(mockData);
		} finally {
			clearTimeout(timeout);
		}
	}
}

export const erpClient = new ErpClient();
