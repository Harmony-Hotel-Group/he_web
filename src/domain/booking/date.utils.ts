/**
 * src/domain/booking/date.utils.ts
 *
 * Utilidades para el manejo de fechas en reservas.
 * Esta lógica estaba previamente en DateRangePicker.astro y ahora
 * está centralizada para mejor mantenibilidad.
 */

export interface DateRange {
	checkin: string;
	checkout: string;
}

export interface ParsedDateRange {
	checkin: string;
	checkout: string;
	nights: number;
	formatted: string;
}

/**
 * Expresión regular para validar formato de fecha
 * Acepta YYYY/MM/DD o YYYY-MM-DD
 */
export const DATE_REGEX = /\d{4}[-/]\d{2}[-/]\d{2}/;

/**
 * Expresión regular para extraer rango de fechas del formato "YYYY/MM/DD → YYYY/MM/DD (X noches)"
 */
export const DATE_RANGE_REGEX =
	/(\d{4}[-/]\d{2}[-/]\d{2})\s*➜\s*(\d{4}[-/]\d{2}[-/]\d{2})\s*\(([^)]+)\)/;

/**
 * Número mínimo de noches para una reservación
 */
export const MINIMUM_STAY_NIGHTS = 1;

/**
 * Número máximo de noches para una reservación
 */
export const MAXIMUM_STAY_NIGHTS = 30;

/**
 * Calcula el número de noches entre dos fechas
 *
 * @param checkin - Fecha de check-in (YYYY-MM-DD)
 * @param checkout - Fecha de checkout (YYYY-MM-DD)
 * @returns Número de noches
 */
export function calculateNights(checkin: string, checkout: string): number {
	const start = new Date(checkin);
	const end = new Date(checkout);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		return 0;
	}

	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Valida si un rango de fechas es válido
 *
 * @param checkin - Fecha de check-in
 * @param checkout - Fecha de checkout
 * @returns true si el rango es válido
 */
export function isValidDateRange(checkin: string, checkout: string): boolean {
	const start = new Date(checkin);
	const end = new Date(checkout);

	// Verificar que las fechas sean válidas
	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		return false;
	}

	// El check-in debe ser antes del checkout
	if (start >= end) {
		return false;
	}

	const nights = calculateNights(checkin, checkout);

	// Verificar mínimo de noches
	if (nights < MINIMUM_STAY_NIGHTS) {
		return false;
	}

	// Verificar máximo de noches
	if (nights > MAXIMUM_STAY_NIGHTS) {
		return false;
	}

	return true;
}

/**
 * Valida que la fecha de check-in no sea en el pasado
 *
 * @param checkin - Fecha de check-in
 * @returns true si el check-in es válido (hoy o futuro)
 */
export function isValidCheckin(checkin: string): boolean {
	const date = new Date(checkin);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (isNaN(date.getTime())) {
		return false;
	}

	return date >= today;
}

/**
 * Parsea un string de rango de fechas al formato requerido
 *
 * @param dateRange - String en formato "YYYY/MM/DD → YYYY/MM/DD (X noches)"
 * @returns Objeto con checkin, checkout, nights y formatted
 */
export function parseDateRange(dateRange: string): ParsedDateRange | null {
	const match = dateRange.match(DATE_RANGE_REGEX);

	if (!match) {
		return null;
	}

	const checkin = match[1].replace(/\//g, "-");
	const checkout = match[2].replace(/\//g, "-");
	const nightsStr = match[3];
	const nights = parseInt(nightsStr, 10);

	return {
		checkin,
		checkout,
		nights,
		formatted: `${checkin} ➜ ${checkout} (${nights} noches)`,
	};
}

/**
 * Formatea una fecha para mostrar al usuario
 *
 * @param dateStr - Fecha en formato YYYY-MM-DD
 * @param locale - Locale para formateo (default: es-EC)
 * @returns Fecha formateada
 */
export function formatDate(dateStr: string, locale: string = "es-EC"): string {
	const date = new Date(dateStr);

	if (isNaN(date.getTime())) {
		return dateStr;
	}

	return date.toLocaleDateString(locale, {
		weekday: "short",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

/**
 * Formatea un rango de fechas para mostrar
 *
 * @param checkin - Fecha de check-in
 * @param checkout - Fecha de checkout
 * @param nights - Número de noches
 * @returns String formateado
 */
export function formatDateRange(
	checkin: string,
	checkout: string,
	nights: number,
): string {
	return `${checkin} ➜ ${checkout} (${nights} ${nights === 1 ? "noche" : "noches"})`;
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 *
 * @returns Fecha de hoy
 */
export function getToday(): string {
	const today = new Date();
	return today.toISOString().split("T")[0];
}

/**
 * Obtiene la fecha mínima de check-in (hoy)
 *
 * @returns Fecha mínima en formato YYYY-MM-DD
 */
export function getMinCheckinDate(): string {
	return getToday();
}

/**
 * Obtiene la fecha máxima de check-in (hoy + 1 año)
 *
 * @returns Fecha máxima en formato YYYY-MM-DD
 */
export function getMaxCheckinDate(): string {
	const maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() + 1);
	return maxDate.toISOString().split("T")[0];
}

/**
 * Valida datos de fecha y retorna errores si los hay
 *
 * @param checkin - Fecha de check-in
 * @param checkout - Fecha de checkout
 * @returns Array de errores o array vacío si todo está bien
 */
export function validateDates(checkin: string, checkout: string): string[] {
	const errors: string[] = [];

	if (!checkin) {
		errors.push("La fecha de check-in es requerida");
	}

	if (!checkout) {
		errors.push("La fecha de checkout es requerida");
	}

	if (checkin && checkout) {
		if (!isValidDateRange(checkin, checkout)) {
			errors.push("El rango de fechas no es válido");
		}

		if (!isValidCheckin(checkin)) {
			errors.push("La fecha de check-in no puede ser en el pasado");
		}
	}

	return errors;
}
