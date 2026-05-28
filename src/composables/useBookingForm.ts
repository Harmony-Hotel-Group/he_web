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
	const childrenAgeContainer = document.getElementById("children-age-container");

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
	const createChildAgeHTML = (index: number) => {
		return `
			<div class="child-age-item flex flex-col gap-2">
				<label class="text-sm font-medium">Edad del Niño ${index}</label>
				<input
					type="number"
					name="childAge${index}"
					min="1"
					max="17"
					placeholder="Años"
					class="px-3 py-2 text-sm border border-gray-300 rounded-md"
				/>
			</div>`;
	};

	if (childrenDropdown && childrenAgeContainer) {
		const renderChildAges = () => {
			const numChildren = parseInt(childrenDropdown.value, 10) || 0;
			childrenAgeContainer.innerHTML = "";

			if (numChildren > 0) {
				childrenAgeContainer.classList.remove("hidden", "grid");
				childrenAgeContainer.classList.add("grid");
				for (let i = 1; i <= numChildren; i++) {
					childrenAgeContainer.insertAdjacentHTML(
						"beforeend",
						createChildAgeHTML(i),
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