// src/composables/useBookingForm.ts
/**
 * Composable: Lógica de DOM y validación para BookingForm
 * Maneja validación, toggle grupo/modo estándar, resumen y envío a WhatsApp.
 *
 * Uso:
 *   import { initBookingForm } from '@/composables/useBookingForm';
 *   initBookingForm({ form, buildBookingMessage, actions });
 */

import { actions } from "astro:actions";
import { buildBookingMessage } from "@/domain/booking/buildBookingMessage";
import type { SiteConfig } from "@/types/config";

export interface UseBookingFormOptions {
	form: HTMLFormElement;
	lang: string;
	config: SiteConfig;
	buildBookingMessage: (
		opts: Parameters<typeof buildBookingMessage>[0],
	) => ReturnType<typeof buildBookingMessage>;
	whatsappNumber: string;
}

export function initBookingForm(opts: UseBookingFormOptions) {
	const { form, config, whatsappNumber, lang } = opts;

	// --- i18n simple (reemplazar por Translations si es necesario) ---
	const _t = (key: string) => key;

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

	// --- Validation ---
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
			const inputElement = document.getElementById(
				fieldName,
			) as HTMLElement | null;
			const errorElement = document.getElementById(
				`error_${fieldName}`,
			) as HTMLElement | null;
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

		// Validate Group Date
		if (isGroupMode) {
			const dateInput = document.getElementById(
				"dateRangeGroup",
			) as HTMLInputElement | null;
			const errorElement = document.getElementById(
				"error_dateRange",
			) as HTMLElement | null;
			if (!dateInput || !dateInput.value) {
				if (errorElement) {
					errorElement.textContent =
						"Por favor, selecciona las fechas de tu grupo.";
					errorElement.classList.remove("hidden");
				}
				dateInput?.classList.add("border-red-500");
				return false;
			}
		}

		// Group Adults Min 8
		if (isGroupMode) {
			const groupAdults = document.getElementById(
				"adults",
			) as HTMLSelectElement | null;
			const errorElement = document.getElementById(
				"error_groupAdults",
			) as HTMLElement | null;
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

		// Validate Standard Date
		if (!isGroupMode) {
			const dateRange = document.getElementById(
				"dateRange",
			) as HTMLInputElement | null;
			const errorElement = document.getElementById(
				"error_dateRange",
			) as HTMLElement | null;
			if (!dateRange || !dateRange.value) {
				if (errorElement) {
					errorElement.textContent = "El grupo debe tener al menos 8 adultos.";
					errorElement.classList.remove("hidden");
				}
				dateRange?.classList.add("border-red-500");
				return false;
			}
		}

		return !form.querySelector('[id^="error_"]:not(.hidden)');
	}

	// --- Modal helpers ---
	function showBookingSummary(bookingData: unknown) {
		const modal = document.getElementById("booking-summary-modal");
		const modalContent = document.getElementById("modal-content");
		const _closeBtn = document.getElementById("modal-close");
		const _cancelBtn = document.getElementById("modal-cancel");
		const confirmBtn = document.getElementById("modal-confirm");
		const policiesCheckbox = document.getElementById(
			"summary-policies-checkbox",
		) as HTMLInputElement | null;

		if (!modal || !modalContent) return;

		fillSummaryData(bookingData);
		modal.classList.remove("hidden");
		modalContent.classList.remove("opacity-0", "scale-95");
		modalContent.classList.add("opacity-100", "scale-100");
		confirmBtn?.setAttribute("disabled", "true");
		if (policiesCheckbox) policiesCheckbox.checked = false;

		policiesCheckbox?.addEventListener("change", () => {
			confirmBtn?.toggleAttribute("disabled", !policiesCheckbox.checked);
		});
	}

	function _closeModal() {
		const modal = document.getElementById("booking-summary-modal");
		const modalContent = document.getElementById("modal-content");
		if (!modal || !modalContent) return;
		modalContent.classList.remove("opacity-100", "scale-100");
		modalContent.classList.add("opacity-0", "scale-95");
		setTimeout(() => modal.classList.add("hidden"), 300);
	}

	function fillSummaryData(bookingData: unknown) {
		const {
			processing = {},
			isGroupMode,
			isVehicleChecked,
			vehicleItems = [],
			distributionLabel,
		} = bookingData;

		// Dates
		const datesEl = document.getElementById("summary-dates");
		if (datesEl) datesEl.textContent = processing.dateRange ?? "—";

		// Nights
		const nightsEl = document.getElementById("summary-nights");
		if (nightsEl) {
			const nights = processing.nights ?? 0;
			nightsEl.textContent = `${nights} ${nights === 1 ? "noche" : "noches"}`;
		}

		// Guests
		["adults", "children", "infants", "teens"].forEach((key) => {
			const el = document.getElementById(
				`summary-${key}`,
			) as HTMLElement | null;
			if (el)
				el.textContent = String(
					processing[key as keyof typeof processing] ?? 0,
				);
		});

		// Group info
		const groupSection = document.getElementById("summary-group-section");
		if (isGroupMode && groupSection) {
			groupSection.classList.remove("hidden");
			["adults", "kids", "teens", "infants"].forEach((key) => {
				const el = document.getElementById(
					`summary-group-${key}`,
				) as HTMLElement | null;
				if (el)
					el.textContent = String(
						processing[
							`group${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof processing
						] ?? 0,
					);
			});
			const notesContainer = document.getElementById(
				"summary-group-notes-container",
			);
			const notesText = document.getElementById("summary-group-notes");
			if (notesContainer && notesText) {
				const notes = processing.groupNotes as string | undefined;
				notesContainer.classList.toggle("hidden", !notes?.trim());
				notesText.textContent = notes ?? "";
			}
		} else if (groupSection) {
			groupSection.classList.add("hidden");
		}

		// Room info
		const roomsEl = document.getElementById("summary-rooms");
		const breakfastEl = document.getElementById("summary-breakfast");
		if (roomsEl)
			roomsEl.textContent = `${processing.rooms ?? 0} habitación${(processing.rooms ?? 0) === 1 ? "" : "es"}`;
		if (breakfastEl)
			breakfastEl.textContent = processing.breakfast ? "Sí" : "No";

		// Distribution label
		const distributionEl = document.getElementById("summary-distribution");
		if (distributionEl && distributionLabel)
			distributionEl.textContent = distributionLabel;

		// Vehicle
		const vehicleSummarySection = document.getElementById(
			"summary-vehicle-section",
		);
		const vehicleList = document.getElementById("summary-vehicle-list");
		if (
			isVehicleChecked &&
			vehicleItems.length > 0 &&
			vehicleSummarySection &&
			vehicleList
		) {
			vehicleSummarySection.classList.remove("hidden");
			vehicleList.innerHTML = vehicleItems
				.map((item) => `<li>${item}</li>`)
				.join("");
		} else if (vehicleSummarySection) {
			vehicleSummarySection.classList.add("hidden");
		}

		// Total
		const totalEl = document.getElementById("summary-total");
		if (totalEl) totalEl.textContent = processing.total ?? "—";
	}

	// --- Send to WhatsApp ---
	function _sendToWhatsApp(bookingData: unknown) {
		const {
			processing,
			isGroupMode,
			isVehicleChecked,
			vehicleItems = [],
		} = bookingData;

		if (!whatsappNumber) {
			console.error("No se ha configurado el número de WhatsApp.");
			return;
		}

		const message = buildBookingMessage({
			processing,
			isGroupMode,
			isVehicleChecked,
			vehicleItems,
		});

		const encoded = encodeURIComponent(message.trim());
		window.open(
			`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encoded}`,
			"_blank",
		);
	}

	// --- Submit Handler ---
	form.addEventListener("submit", async (e: Event) => {
		e.preventDefault();

		if (!validateForm()) return;

		const btn = document.getElementById("btnSubmit") as HTMLButtonElement;
		const originalHTML = btn.innerHTML;

		try {
			btn.disabled = true;
			btn.innerHTML = '<span class="spinner"></span>';

			const formData = new FormData(form);
			const { data, error } = await actions.booking(formData);

			if (error) {
				console.error("Error en actions.booking:", error);
				btn.innerHTML = originalHTML;
				btn.disabled = false;
				return;
			}

			const { processing } = data;
			const isVehicleChecked =
				(form.querySelector("#vehicle") as HTMLInputElement)?.checked ?? false;
			const vehicleItems: string[] = [];
			const vehicleNotes =
				(form.querySelector("#vehicle-notes") as HTMLInputElement | null)
					?.value || "";

			if (isVehicleChecked && vehicleNotes) {
				const typeEl = document.getElementById(
					"vehicle-type",
				) as HTMLSelectElement | null;
				const typeLabel = typeEl?.selectedOptions?.[0]?.textContent ?? "";
				vehicleItems.push(`🚐 ${typeLabel}: ${vehicleNotes}`);
			}

			const distributionLabel =
				(
					document.getElementById(
						"distributionType",
					) as HTMLSelectElement | null
				)?.selectedOptions?.[0]?.textContent ?? "Distribución";

			const bookingData = {
				processing,
				isGroupMode: !groupFields?.classList.contains("hidden"),
				isVehicleChecked,
				vehicleItems,
				distributionLabel,
				whatsappNumber,
				lang,
				config,
			};

			showBookingSummary(bookingData);
		} catch (err) {
			console.error("Error inesperado al enviar la reserva:", err);
		} finally {
			btn.disabled = false;
			btn.innerHTML = originalHTML;
		}
	});
}
