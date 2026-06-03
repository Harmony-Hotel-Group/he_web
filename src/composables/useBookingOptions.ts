// src/composables/useBookingOptions.ts
/**
 * Composable: genera las opciones de los dropdowns del formulario de reserva.
 *
 * Centraliza el mapeo de opciones para que BookingForm.astro sea
 * presentacional puro (sin lógica de generación de opciones inline).
 *
 * Usa claves separadas _one para singular y genérica para plural.
 *
 * Uso:
 *   const { adultsOptions, childrenOptions, roomsOptions, distributionOptions } =
 *       useBookingOptions(t);
 */

import type { TranslationParams } from "@/i18n/translation";
import { range } from "@/utils/math";

type TFunc = (key: string, params?: TranslationParams) => string;

/**
 * Genera las opciones del dropdown de adultos.
 * Rango 1–9; el último valor ("group") activa modo grupo.
 */
function buildAdultsOptions(t: TFunc) {
	return range(1, 9).map((i, index, array) => {
		if (index === array.length - 1) {
			return {
				value: "group",
				label: t("booking.dropdown.optGroup"),
			};
		}
		return {
			value: `${i}`,
			label: t(
				i === 1
					? "booking.dropdown.optAdults_one"
					: "booking.dropdown.optAdults",
				{ i },
			),
		};
	});
}

/**
 * Genera las opciones del dropdown de niños (0–8).
 */
function buildChildrenOptions(t: TFunc) {
	return range(0, 8).map((i) => {
		if (i === 0) {
			return {
				value: `${i}`,
				label: t("booking.dropdown.optChildren_none"),
			};
		}
		return {
			value: `${i}`,
			label: t(
				i === 1
					? "booking.dropdown.optChildren_one"
					: "booking.dropdown.optChildren",
				{ i },
			),
		};
	});
}

/**
 * Genera las opciones del dropdown de habitaciones (1–5).
 */
function buildRoomsOptions(t: TFunc) {
	return range(1, 5).map((i) => ({
		value: `${i}`,
		label: t(
			i === 1 ? "booking.dropdown.optRooms_one" : "booking.dropdown.optRooms",
			{ i },
		),
	}));
}

export interface UseBookingOptionsReturn {
	adultsOptions: ReturnType<typeof buildAdultsOptions>;
	childrenOptions: ReturnType<typeof buildChildrenOptions>;
	roomsOptions: ReturnType<typeof buildRoomsOptions>;
	distributionOptions: readonly {
		value: "shared_beds" | "shared_rooms" | "individual_rooms";
		label: string;
	}[];
}

/**
 * Export principal: genera todas las opciones de los dropdowns del booking form.
 */
export function useBookingOptions(t: TFunc): UseBookingOptionsReturn {
	return {
		adultsOptions: buildAdultsOptions(t),
		childrenOptions: buildChildrenOptions(t),
		roomsOptions: buildRoomsOptions(t),
		distributionOptions: [
			{ value: "shared_beds", label: "Camas Compartidas" },
			{ value: "shared_rooms", label: "Habitaciones Compartidas" },
			{ value: "individual_rooms", label: "Habitaciones Individuales" },
		] as const,
	};
}
