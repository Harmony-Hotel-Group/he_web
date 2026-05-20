// src/utils/date.ts
/**
 * Utilidades de fecha para la aplicación.
 * Centraliza cálculos y formateo usados en booking y date pickers.
 */

/**
 * Calcula el número de noches entre dos fechas
 */
export function calculateNights(
	checkin: Date | string,
	checkout: Date | string,
): number {
	const start = checkin instanceof Date ? checkin : new Date(checkin);
	const end = checkout instanceof Date ? checkout : new Date(checkout);
	const diffMs = end.getTime() - start.getTime();
	return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Formatea un Date a YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
	return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

/**
 * Verifica si dos fechas son el mismo día
 */
export function isSameDay(a: Date, b: Date): boolean {
	return a.toDateString() === b.toDateString();
}

/**
 * Genera el texto de rango de fechas para mostrar en el picker
 * Ej: "2024-03-01 ➜ 2024-03-05 (4 noches)"
 */
export function formatDateRange(
	start: Date,
	end: Date,
	nightsLabel: string,
): string {
	return `${formatDateISO(start)} ➜ ${formatDateISO(end)} (${nightsLabel})`;
}

/**
 * Genera la etiqueta de noches en español
 */
export function nightsLabel(
	nights: number,
	t?: (key: string, params?: Record<string, unknown>) => string,
): string {
	if (t) {
		return (
			t("components.dateRangePicker", {
				n: nights,
				s: nights === 1 ? "" : "s",
			}) || `${nights} noche${nights === 1 ? "" : "s"}`
		);
	}
	return `${nights} noche${nights === 1 ? "" : "s"}`;
}
