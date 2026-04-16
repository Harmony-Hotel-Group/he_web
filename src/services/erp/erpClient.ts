import type {
	ErpClientConfig,
	ErpResult,
	ErpRoomRecord,
	ErpTourRecord,
} from "./erpTypes";

const DEFAULT_ERP_CONFIG: ErpClientConfig = {
	baseURL: import.meta.env.PUBLIC_ERP_BASE_URL || "",
	mode: "mock",
	timeoutMs: Number(import.meta.env.PUBLIC_ERP_TIMEOUT_MS || 8000),
};

const MOCK_TOURS: ErpTourRecord[] = [
	{
		id: "tour-city-walk",
		code: "T-001",
		name: "City Walk",
		price: 35,
		currency: "USD",
		active: true,
	},
];

const MOCK_ROOMS: ErpRoomRecord[] = [
	{
		id: "room-standard-01",
		code: "R-001",
		name: "Habitación Estándar",
		capacity: 2,
		active: true,
	},
];

export function getErpConfig(
	overrides: Partial<ErpClientConfig> = {},
): ErpClientConfig {
	return {
		...DEFAULT_ERP_CONFIG,
		...overrides,
	};
}

export async function getErpToursStub(
	configOverrides: Partial<ErpClientConfig> = {},
): Promise<ErpResult<ErpTourRecord[]>> {
	const config = getErpConfig(configOverrides);
	return {
		ok: true,
		data: MOCK_TOURS,
		source: "mock",
		message: `ERP stub mode (${config.mode}) using baseURL='${config.baseURL || "not-configured"}'`,
	};
}

export async function getErpRoomsStub(
	configOverrides: Partial<ErpClientConfig> = {},
): Promise<ErpResult<ErpRoomRecord[]>> {
	const config = getErpConfig(configOverrides);
	return {
		ok: true,
		data: MOCK_ROOMS,
		source: "mock",
		message: `ERP stub mode (${config.mode}) using baseURL='${config.baseURL || "not-configured"}'`,
	};
}
