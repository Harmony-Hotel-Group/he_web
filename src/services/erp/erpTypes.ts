export type ErpMode = "mock" | "real";

export interface ErpClientConfig {
	baseURL: string;
	mode: ErpMode;
	timeoutMs: number;
}

export interface ErpRoomRecord {
	id: string;
	code: string;
	name: string;
	capacity: number;
	active: boolean;
}

export interface ErpTourRecord {
	id: string;
	code: string;
	name: string;
	price: number;
	currency: "USD" | "EUR";
	active: boolean;
}

export interface ErpResult<T> {
	ok: boolean;
	data: T;
	source: "mock";
	message?: string;
}
