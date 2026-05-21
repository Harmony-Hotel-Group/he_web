// src/composables/useBookingForm.ts
/**
 * Composable orquestador: inicializa la lógica completa de BookingForm.
 *
 * Delega a:
 * - useBookingValidation: validación de campos y manejo de errores
 * - useBookingSubmit: envío a actions y gestión del modal de resumen
 *
 * Responsabilidades residuales:
 * - Referencias DOM compartidas
 * - Observers (vehicle switch, special request)
 * - Toggle entre modo estándar y grupo
 */

import type { SiteConfig } from "@/types/config";
import { initBookingValidation } from "./useBookingValidation";
import { initBookingSubmit } from "./useBookingSubmit";

export interface UseBookingFormOptions {
	form: HTMLFormElement;
	lang: string;
	config: SiteConfig;
	whatsappNumber: string;
}

/**
 * Inicializa el formulario de reserva.
 * @param opts Configuración y referencias DOM
 */
export function initBookingForm(opts: UseBookingFormOptions) {
	const { form, config, whatsappNumber, lang } = opts;

	// --- DOM References ---
	const bookingBar = form.closest("#booking-bar");
	const vehicleSection = document.getElementById("vehicle-section");
	const vehicleSwitchButton = form.querySelector("button#vehicle");
	const standardFields = document.getElementById("standard-fields");
	const groupFields = document.getElementById("group-fields");
	const adultsDropdown = document.getElementById(
		"adults",
	) as HTMLSelectElement | null;
	const btnCancelGroup = document.getElementById("btn-cancel-group");
	const specialRequestSection = document.getElementById(
		"special_request-section",
	);
	const dateRangeStandard = document.getElementById(
		"dateRange",
	) as HTMLInputElement | null;
	const dateRangeGroup = document.getElementById(
		"dateRangeGroup",
	) as HTMLInputElement | null;

	// --- Vehicle Section Observer ---
	if (vehicleSwitchButton && vehicleSection) {
		const observer = new MutationObserver((mutations) => {
			const mutation = mutations[0];
			if (mutation.attributeName !== "aria-checked") return;
			const isChecked =
				vehicleSwitchButton.getAttribute("aria-checked") === "true";
			vehicleSection.classList.toggle("hidden", !isChecked);
			bookingBar?.classList.toggle("max-h-[80vh]", isChecked);
			bookingBar?.classList.toggle("overflow-y-auto", isChecked);
		});
		observer.observe(vehicleSwitchButton, {
			attributes: true,
			attributeFilter: ["aria-checked"],
		});
	}

	// --- Special Request Observer ---
	const specialRequestSwitchBtn = form.querySelector(
		'button#special_request[role="switch"]',
	);
	if (specialRequestSwitchBtn && specialRequestSection) {
		const specialObserver = new MutationObserver((mutations) => {
			const mutation = mutations[0];
			if (mutation.attributeName !== "aria-checked") return;
			const isChecked =
				specialRequestSwitchBtn.getAttribute("aria-checked") === "true";
			specialRequestSection.classList.toggle("hidden", !isChecked);
		});
		specialObserver.observe(specialRequestSwitchBtn, {
			attributes: true,
			attributeFilter: ["aria-checked"],
		});
	}

	// --- Toggle Group Mode ---
	function _toggleGroupMode(isGroup: boolean) {
		const std = standardFields;
		const grp = groupFields;
		if (!std || !grp) return;
		std.classList.toggle("hidden", isGroup);
		grp.classList.toggle("hidden", !isGroup);
		if (isGroup && dateRangeStandard && dateRangeGroup) {
			dateRangeGroup.value = dateRangeStandard.value;
		}
		if (btnCancelGroup) btnCancelGroup.classList.toggle("hidden", !isGroup);
		if (isGroup && adultsDropdown) adultsDropdown.value = "group";
	}

	// --- Delegación a sub-modulos ---
	const validation = initBookingValidation({
		form,
		groupFields,
		standardFields,
	});

	const submit = initBookingSubmit({
		form,
		whatsappNumber,
		lang,
	});

	// --- Submit Handler orquestado ---
	form.addEventListener("submit", async (e: Event) => {
		e.preventDefault();

		if (!validation.validateForm()) return;

		await submit.handleSubmit();
	});

	// Retornar API estable (por compatibilidad)
	return {
		form,
		toggleGroup: _toggleGroupMode,
		validateForm: validation.validateForm,
		...submit,
	};
}
