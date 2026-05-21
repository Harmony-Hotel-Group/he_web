/**
 * src/domain/booking/availability.utils.ts
 *
 * Utilidades centralizadas para cálculo de disponibilidad y precios.
 * Reemplaza la lógica duplicada que existía en api/availability.ts.
 */

// Tipos locales (evitan dependencias externas en capa de dominio)
export interface SiteConfigRoom {
	id: string;
	value?: number;
	currency?: string;
}

export interface SiteConfig {
	rooms?: SiteConfigRoom[];
}

export interface ConfigRoom {
	id: string;
	value?: number;
	currency?: string;
}

export interface AvailabilityPrice {
	perNight: number;
	total: number;
	label?: string;
	discountPercent?: number;
}

export interface AvailabilityRoom {
	id: string;
	name?: string;
	available: number;
	prices: {
		base: AvailabilityPrice;
		withBreakfast: AvailabilityPrice;
		promo?: AvailabilityPrice;
	};
}

export interface AvailabilityResponse {
	checkin: string;
	checkout: string;
	nights: number;
	currency: string;
	rooms: AvailabilityRoom[];
	source?: "mock" | "real";
}

/**
 * Parámetros para consulta de disponibilidad
 */
export interface AvailabilityQuery {
	checkin: string;
	checkout: string;
	currency?: string;
	roomId?: string;
}

/**
 * Resultado crudo de Sede Central con alojamiento tipo
 * para el servicio existente
 */
export interface ErpAvailabilityRecord {
	id: string;
	available: number;
	prices: {
		base: { perNight: number; total: number };
		withBreakfast: { perNight: number; total: number };
		promo?: {
			perNight: number;
			total: number;
			label?: string;
			discountPercent?: number;
		};
	};
}

/**
 * @deprecated Usar calculateNights de src/domain/booking/date.utils.ts
 * TODO: migrar llamadores internos y eliminar esta función en próxima versión
 * Calcula el número de noches entre dos fechas
 * @param checkin Fecha de check-in (YYYY-MM-DD)
 * @param checkout Fecha de check-out (YYYY-MM-DD)
 * @returns Número de noches (≥ 0)
 */
export function calculateNights(checkin: string, checkout: string): number {
	const start = new Date(checkin);
	const end = new Date(checkout);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
	const diffMs = end.getTime() - start.getTime();
	return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Deriva el símbolo de moneda a partir del código ISO o símbolo
 * @param currency Código de moneda (USD, EUR, etc.) o símbolo ($, €, etc.)
 * @returns Símbolo de moneda legible
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	MXN: "MXN $",
	COP: "COL $",
};

export function currencySymbol(currency?: string): string {
	if (!currency) return "$";
	const upper = currency.toUpperCase();
	return CURRENCY_SYMBOLS[upper] || upper.charAt(0);
}

/**
 * Construye etiqueta con precio por noche y total por habitación
 * @param perNight Precio base por noche
 * @param nights Cantidad de noches
 * @param symbol Símbolo de moneda
 * @param withBreakfast Precio con desayuno (opcional)
 * @returns Etiqueta formateada
 */
export function priceLabel(
	perNight: number,
	nights: number,
	symbol: string,
	withBreakfast?: number,
): string {
	const total = perNight * nights;
	let label = `${symbol}${perNight}/noche (${symbol}${total} total)`;
	if (withBreakfast != null) {
		label += ` | ${symbol}${withBreakfast}/noche (${symbol}${withBreakfast * nights} con desayuno)`;
	}
	return label;
}

/**
 * Construye objeto AvailabilityPrice sujeto a la estructura esperada
 * por la respuesta de disponibilidad del frontend.
 * @param perNight Precio por noche (sin desayuno)
 * @param nights Cantidad de noches
 * @param additionalPerNight Costo adicional por noche (ej: desayuno +$8)
 * @returns Objeto con precios base y opcionalmente withBreakfast
 */
export function buildPrices(
	perNight: number,
	nights: number,
	withBreakfastPerNight?: number,
): { base: AvailabilityPrice; withBreakfast: AvailabilityPrice } {
	const base: AvailabilityPrice = {
		perNight,
		total: perNight * nights,
	};

	const withBreakfast: AvailabilityPrice = {
		perNight: withBreakfastPerNight ?? perNight,
		total: (withBreakfastPerNight ?? perNight) * nights,
	};

	const prices: Record<string, AvailabilityPrice> = {
		base,
		withBreakfast,
	};

	return prices as {
		base: AvailabilityPrice;
		withBreakfast: AvailabilityPrice;
	};
}

/**
 * Filtra habitaciones por ID y arma respuesta unificada.
 * Usa `roomTypes` (cualquier fuente: rooms.json o ERP) para normalizar datos.
 *
 * @param records Registros crudos de disponibilidad por habitación
 * @param query Parámetros de consulta (checkin/checkout/currency/roomId)
 * @param roomTypes Lista de tipos de habitación (config.json merge rooms.json)
 * @param source Fuente de los datos: 'mock' o 'real'
 * @returns Objeto de disponibilidad listo para exponer frenteend
 */
export function buildAvailabilityResponse(
	records: ErpAvailabilityRecord[] | AvailabilityRoom[],
	query: AvailabilityQuery,
	_roomTypes?: SiteConfig["rooms"],
	source: "mock" | "real" = "mock",
): AvailabilityResponse {
	const checkin = query.checkin;
	const checkout = query.checkout;
	const nights = calculateNights(checkin, checkout);
	const currency = query.currency || "USD";
	const _symbol = currencySymbol(currency);

	const mapped: AvailabilityRoom[] = records.map((record) => {
		const roomId =
			(record as AvailabilityRoom).id ?? (record as ErpAvailabilityRecord).id;
		const priceInfo = (record as ErpAvailabilityRecord).prices;
		const priceBase = priceInfo.base.perNight;
		const priceWithBreakfast = priceInfo.withBreakfast.perNight;

		return {
			id: String(roomId),
			available: record.available ?? 1,
			prices: {
				base: {
					perNight: priceBase,
					total: priceBase * nights,
				},
				withBreakfast: {
					perNight: priceWithBreakfast,
					total: priceWithBreakfast * nights,
				},
				...(record as ErpAvailabilityRecord).prices.promo,
			},
		} as AvailabilityRoom;
	});

	return {
		checkin,
		checkout,
		nights,
		currency,
		rooms: mapped,
		source,
	};
}

/**
 * Construye respuesta de disponibilidad en modo mock desde archivo JSON local.
 * Reemplaza la lógica inline que existía en buildMockResponse().
 *
 * @param roomsData Datos de habitaciones desde src/data/rooms.json
 * @param checkin Fecha de check-in
 * @param checkout Fecha de check-out
 * @param roomId Filtrar por ID de habitación (opcional)
 * @returns Objeto de disponibilidad mock
 */
export function buildMockAvailabilityFromJson(
	roomsData: any[],
	checkin: string,
	checkout: string,
	roomId?: string | null,
): AvailabilityResponse {
	const safeRooms = Array.isArray(roomsData) ? roomsData : [];
	const filtered = roomId
		? safeRooms.filter((r) => String(r.id) === String(roomId))
		: safeRooms;
	const nights = calculateNights(checkin, checkout);

	const records: ErpAvailabilityRecord[] = filtered.map((room) => {
		const basePerNight = Number(room.pricePerNight ?? 0);
		const withBreakfastPerNight = basePerNight + 8; // Mock: desayuno +$8
		return {
			available: 1,
			prices: {
				base: { perNight: basePerNight, total: basePerNight * nights },
				withBreakfast: {
					perNight: withBreakfastPerNight,
					total: withBreakfastPerNight * nights,
				},
			},
		} as ErpAvailabilityRecord;
	});

	return buildAvailabilityResponse(
		records,
		{ checkin, checkout, currency: "USD" },
		undefined,
		"mock",
	);
}
