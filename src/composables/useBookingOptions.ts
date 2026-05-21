// src/composables/useBookingOptions.ts
/**
 * Composable: genera las opciones de los dropdowns del formulario de reserva.
 *
 * Centraliza el mapeo de opciones para que BookingForm.astro sea
 * presentacional puro (sin lógica de generación de opciones inline).
 *
 * Uso:
 *   const { adultsOptions, childrenOptions, roomsOptions, distributionOptions } =
 *       useBookingOptions(t);
 */

import { range } from '@/utils/math';
import type { Translations } from '@/i18n/translation';

/**
 * Genera las opciones del dropdown de adultos.
 * Rango 1–9; el último valor ("group") activa modo grupo.
 */
function buildAdultsOptions(t: Translations) {
	return range(1, 9).map((i, index, array) => {
		if (index === array.length - 1) {
			return {
				value: 'group',
				label: t('booking.dropdown.optGroup'),
			};
		}
		return {
			value: `${i}`,
			label: `${t('booking.dropdown.optAdults', {
				i,
				s: i > 1 ? 's' : '',
			})}`,
		};
	});
}

/**
 * Genera las opciones del dropdown de niños (0–7).
 */
function buildChildrenOptions(t: Translations) {
	return range(0, 8).map((i) => {
		const s = i === 0 ? 's' : i > 1 ? 's' : '';
		return {
			value: `${i}`,
			label: `${t('booking.dropdown.optChildren', {
				i: i === 0 ? 'Sin' : i,
				s,
			})}`,
		};
	});
}

/**
 * Genera las opciones del dropdown de habitaciones (1–4).
 */
function buildRoomsOptions(t: Translations) {
	return range(1, 5).map((i) => ({
		value: `${i}`,
		label: `${t('booking.dropdown.optRooms', {
			i,
			s: i > 1 ? 'es' : '',
		})}`,
	}));
}

export interface UseBookingOptionsReturn {
	adultsOptions: ReturnType<typeof buildAdultsOptions>;
	childrenOptions: ReturnType<typeof buildChildrenOptions>;
	roomsOptions: ReturnType<typeof buildRoomsOptions>;
	distributionOptions: readonly {
		value: 'shared_beds' | 'shared_rooms' | 'individual_rooms';
		label: string;
	}[];
}

/**
 * Export principal: genera todas las opciones de los dropdowns del booking form.
 */
export function useBookingOptions(t: Translations): UseBookingOptionsReturn {
	return {
		adultsOptions: buildAdultsOptions(t),
		childrenOptions: buildChildrenOptions(t),
		roomsOptions: buildRoomsOptions(t),
		distributionOptions: [
			{ value: 'shared_beds', label: 'Camas Compartidas' },
			{ value: 'shared_rooms', label: 'Habitaciones Compartidas' },
			{ value: 'individual_rooms', label: 'Habitaciones Individuales' },
		] as const,
	};
}
