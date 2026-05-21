// src/composables/useBookingValidation.ts
/**
 * Composable: Validación de campos del formulario de reserva.
 */

export interface ValidationDOM {
	form: HTMLFormElement;
	groupFields: HTMLElement | null;
}

export function initBookingValidation(opts: ValidationDOM) {
	const { form, groupFields } = opts;

	function clearValidationErrors() {
		form.querySelectorAll('[id^="error_"]:not(.hidden)').forEach((el) => {
			el.classList.add("hidden");
		});
	}

	function _handleValidationErrors(
		errors: Array<{ path: string[]; message: string }>,
	) {
		errors.forEach((error) => {
			const fieldName = error.path[0];
			const inputElement = document.getElementById(fieldName) as HTMLElement | null;
			const errorElement = document.getElementById("error_" + fieldName) as HTMLElement | null;
			if (inputElement) inputElement.classList.add("border-red-500");
			if (errorElement) {
				errorElement.textContent = error.message;
				errorElement.classList.remove("hidden");
			}
		});
	}

	function validateForm(): boolean {
		clearValidationErrors();
		const isGroupMode = !groupFields?.classList.contains("hidden");

		if (isGroupMode) {
			const dateInput = document.getElementById("dateRangeGroup") as HTMLInputElement | null;
			const errorElement = document.getElementById("error_dateRange") as HTMLElement | null;
			if (!dateInput || !dateInput.value) {
				if (errorElement) {
					errorElement.textContent = "Por favor, selecciona las fechas de tu grupo.";
					errorElement.classList.remove("hidden");
				}
				dateInput?.classList.add("border-red-500");
				return false;
			}
		}

		if (isGroupMode) {
			const groupAdults = document.getElementById("adults") as HTMLSelectElement | null;
			const errorElement = document.getElementById("error_groupAdults") as HTMLElement | null;
			if (
				groupAdults &&
				groupAdults.value !== "group" &&
				Number(groupAdults.value) < 8
			) {
				if (errorElement) {
					errorElement.textContent = "El grupo debe tener al menos 8 adultos.";
					errorElement.classList.remove("hidden");
				}
				groupAdults.classList.add("border-red-500");
				return false;
			}
		}

		if (!isGroupMode) {
			const dateRange = document.getElementById("dateRange") as HTMLInputElement | null;
			const errorElement = document.getElementById("error_dateRange") as HTMLElement | null;
			if (!dateRange || !dateRange.value) {
				if (errorElement) {
					errorElement.textContent = "Por favor, selecciona las fechas.";
					errorElement.classList.remove("hidden");
				}
				dateRange?.classList.add("border-red-500");
				return false;
			}
		}

		return !form.querySelector('[id^="error_"]:not(.hidden)');
	}

	return {
		validateForm,
		clearValidationErrors,
		_handleValidationErrors,
	};
}
