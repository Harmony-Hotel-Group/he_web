/**
 * src/composables/useDatePicker.ts
 *
 * Composable para manejar la lógica de date pickers con sincronización.
 * Extraído de DateRangePicker.astro para mantener átomos presentacionales.
 */

import type { Translations } from "@/i18n/translation.ts";
import { logger } from "@/services/logger";
import {
	calculateNights,
	formatDateRange,
	isSameDay,
	nightsLabel,
} from "@/utils/date";
import { datePickerSync } from "@/utils/date-picker-sync";

const log = logger("composables:useDatePicker");

export interface DatePickerConfig {
	lang?: string;
	syncGroup?: string;
	t?: Translations; // Función de traducción
}

/**
 * Inicializa un flatpickr en un elemento input.
 * @param inputElement Input DOM element
 * @param config Configuración del date picker
 */
export function initDatePicker(
	inputElement: HTMLInputElement,
	config: DatePickerConfig = {},
) {
	const { lang, syncGroup = "booking", t } = config;

	if (!inputElement || inputElement.dataset.flatpickrInitialized) {
		return;
	}

	const pickerId = inputElement.id;
	const syncGroupName = inputElement.dataset.syncGroup || syncGroup;

	// Import dinámico de flatpickr para no forzarlo en el bundle si no se usa
	// En Astro islands, esto se ejecuta en el cliente
	import("flatpickr")
		.then((module) => {
			const flatpickr = module.default || module;

			flatpickr(inputElement, {
				mode: "range",
				minDate: "today",
				dateFormat: "Y/m/d",
				locale: (lang as "es") || "es",
				showMonths: 1,
				enableTime: false,

				onChange: (selectedDates: Date[]) => {
					if (selectedDates.length < 2) return;

					const [start, end] = selectedDates;

					if (isSameDay(start, end)) {
						(flatpickr(inputElement) as any).clear();
						alert(
							t?.(`booking.dateRange.sameDayError`) ||
								"Debes seleccionar al menos 2 días diferentes.",
						);
						return;
					}

					const nights = calculateNights(start, end);
					const label = nightsLabel(nights, t);
					const text = formatDateRange(start, end, label);

					inputElement.value = text;
					inputElement.title = text;

					datePickerSync.sync(pickerId, text, selectedDates, syncGroupName);

					inputElement.dispatchEvent(
						new CustomEvent("datepicker:change", {
							detail: {
								pickerId,
								value: text,
								dates: selectedDates,
								nights,
								syncGroup: syncGroupName,
							},
							bubbles: true,
						}),
					);
				},

				onReady: (_selectedDates: Date[], _dateStr: string, instance: any) => {
					datePickerSync.register(pickerId, instance, syncGroupName);
					inputElement.dataset.flatpickrInitialized = "true";
					log.info(`Initialized: ${pickerId}`);

					if (!inputElement.value) {
						const start = new Date();
						const end = new Date();
						end.setDate(start.getDate() + 1);
						instance.setDate([start, end], true);
					}
				},

				onDestroy: () => {
					datePickerSync.unregister(pickerId, syncGroupName);
					delete inputElement.dataset.flatpickrInitialized;
				},
			});

			log.info(`Flatpickr loaded for ${pickerId}`);
		})
		.catch((err) => {
			log.error("Failed to load flatpickr:", err);
		});
}

/**
 * Inicializa todos los date pickers en la página.
 */
export function initAllDatePickers() {
	const inputs = document.querySelectorAll<HTMLInputElement>(
		".date-range-picker-input",
	);
	inputs.forEach((input) => {
		initDatePicker(input);
	});
	log.info(`Attempted to initialize ${inputs.length} pickers.`);
}

/**
 * Configura el MutationObserver para inicializar pickers nuevos en el DOM.
 */
export function setupDatePickerObserver() {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === "childList" && mutation.target instanceof Element) {
				const newPickers = mutation.target.querySelectorAll(
					".date-range-picker-input:not([data-flatpickr-initialized])",
				);
				if (newPickers.length > 0) {
					initAllDatePickers();
					break;
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
	return observer;
}

/**
 * Bootstraps el date picker en la página:
 * 1. Inicializa todos los existentes
 * 2. Configura el observer para futuros
 */
export function bootstrapDatePicker() {
	document.addEventListener("DOMContentLoaded", () => {
		setTimeout(initAllDatePickers, 100);
		setupDatePickerObserver();
	});
}
