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

import type { SiteConfig } from "@/types/config-site";
import { initBookingSubmit } from "./useBookingSubmit";
import { initBookingValidation } from "./useBookingValidation";

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
	if (form.dataset.initialized) return;
	form.dataset.initialized = "true";

	const bookingBar = form.closest("#booking-bar");
	const vehicleSection = document.getElementById("vehicle-section-component");
	const vehicleSwitchButton = form.querySelector("button#vehicle");
	const standardFields = document.getElementById("standard-fields");
	const groupFields = document.getElementById("group-fields");
	const adultsDropdown = document.getElementById(
		"adults",
	) as HTMLSelectElement | null;
	const childrenDropdown = document.getElementById(
		"children",
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
	const childrenAgeContainer = document.getElementById(
		"children-age-container",
	);

	// --- Vehicle Section Observer ---
	if (vehicleSection) {
		const observer = new MutationObserver((mutations) => {
			const mutation = mutations[0];
			if (mutation.attributeName !== "aria-checked") return;
			// Re-query the button each time to handle DOM updates
			const vehicleSwitchButton = form.querySelector("button#vehicle");
			if (!vehicleSwitchButton) return;
			const isChecked =
				vehicleSwitchButton.getAttribute("aria-checked") === "true";
			vehicleSection.classList.toggle("hidden", !isChecked);
			bookingBar?.classList.toggle("max-h-[80vh]", isChecked);
			bookingBar?.classList.toggle("overflow-y-auto", isChecked);
		});
		observer.observe(vehicleSection, {
			attributes: true,
			attributeFilter: ["aria-checked"],
		});

		// Also observe for when the button itself might change (though less likely)
		const buttonObserver = new MutationObserver((mutations) => {
			// Re-observe the button if it changes
			const vehicleSwitchButton = form.querySelector("button#vehicle");
			if (vehicleSwitchButton) {
				// Re-setup observer on the button if needed
				// For simplicity, we'll rely on the section observer which is more stable
			}
		});
		// We could observe the form for button changes, but section observer is sufficient
	}

	// --- Special Request Observer ---
	if (specialRequestSection) {
		const specialObserver = new MutationObserver((mutations) => {
			const mutation = mutations[0];
			if (mutation.attributeName !== "aria-checked") return;
			// Re-query the button each time
			const specialRequestSwitchBtn = form.querySelector(
				'button#special_request[role="switch"]',
			);
			if (!specialRequestSwitchBtn) return;
			const isChecked =
				specialRequestSwitchBtn.getAttribute("aria-checked") === "true";
			specialRequestSection.classList.toggle("hidden", !isChecked);
		});
		specialObserver.observe(specialRequestSection, {
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
		childrenAgeContainer?.classList.add("hidden");
		if (isGroup && dateRangeStandard && dateRangeGroup) {
			dateRangeGroup.value = dateRangeStandard.value;
		}
		if (btnCancelGroup) btnCancelGroup.classList.toggle("hidden", !isGroup);
		if (isGroup && adultsDropdown) adultsDropdown.value = "group";
	}

	// --- Adults dropdown observer for group mode ---
	if (adultsDropdown) {
		adultsDropdown.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			if (target.value === "group") {
				_toggleGroupMode(true);
			}
		});
	}

	// --- Children age inputs (dynamic like vehicles) ---
	const createChildAgeHTML = (index: number, t: (key: string) => string) => {
		return `
			<div class="child-age-item bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 rounded-lg p-3">
				<label class="text-xs font-semibold text-amber-800 dark:text-amber-900 mb-1 block">Niño ${index}</label>
				<input
					type="number"
					name="childAge${index}"
					min="1"
					max="17"
					placeholder="Edad"
					class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-400 rounded bg-white dark:bg-gray-50 text-center placeholder-gray-500 dark:placeholder-gray-600"
				/>
			</div>`;
	};

	if (childrenDropdown && childrenAgeContainer) {
		const renderChildAges = () => {
			const numChildren = parseInt(childrenDropdown.value, 10) || 0;
			childrenAgeContainer.innerHTML = "";

			if (numChildren > 0) {
				childrenAgeContainer.classList.remove("hidden");
				childrenAgeContainer.classList.add(
					"grid",
					"grid-cols-2",
					"md:grid-cols-4",
					"gap-2",
				);
				for (let i = 1; i <= numChildren; i++) {
					childrenAgeContainer.insertAdjacentHTML(
						"beforeend",
						createChildAgeHTML(i, () => ""),
					);
				}
			} else {
				childrenAgeContainer.classList.add("hidden");
			}
		};

		childrenDropdown.addEventListener("change", renderChildAges);
	}

	// --- Cancel Group Button ---
	if (btnCancelGroup) {
		btnCancelGroup.addEventListener("click", () => {
			_toggleGroupMode(false);
			if (adultsDropdown) adultsDropdown.value = "1";
			// Reset children dropdown to 0
			if (childrenDropdown) childrenDropdown.value = "0";
			// Hide children age inputs
			if (childrenAgeContainer) childrenAgeContainer.classList.add("hidden");
		});
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
		groupFields,
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
