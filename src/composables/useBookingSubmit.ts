// src/composables/useBookingSubmit.ts
/**
 * Composable: Gestión del envío del formulario de reserva.
 * Maneja el submit a Astro Actions, el llenado del modal de resumen y
 * el envío a WhatsApp.
 *
 * Responsabilidades:
 * - Enviar datos al Action de Astro (`actions.booking`)
 * - Mostrar/ocultar el modal de resumen
 * - Llenar los datos del resumen a partir de `processing`
 * - Enviar a WhatsApp con buildBookingMessage
 *
 * NO maneja validación ni toggle de modo grupo — eso es responsabilidad de
 * useBookingValidation y useBookingForm respectivamente.
 */

import { actions } from "astro:actions";
import { buildBookingMessage } from "@/adapters/booking/whatsapp.adapter";

export interface SubmitConfig {
	whatsappNumber: string;
	lang: string;
	form: HTMLFormElement;
}

/**
 * Inicializa las funciones de envío.
 * @param opts Configuración de envío
 * @returns Objeto con `handleSubmit`, `showBookingSummary`, `closeSummaryModal`
 */
export function initBookingSubmit(opts: SubmitConfig) {
	const { whatsappNumber, lang, form } = opts;

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

	// fillSummaryData necesita acceder a buildBookingMessage y a WhatsApp
	function fillSummaryData(bookingData: unknown) {
		const {
			processing = {},
			isGroupMode,
			isVehicleChecked,
			vehicleItems = [],
			distributionLabel,
		} = bookingData as Parameters<typeof buildBookingMessage>[0];

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

	async function handleSubmit() {
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
			};

			showBookingSummary(bookingData);
		} catch (err) {
			console.error("Error inesperado al enviar la reserva:", err);
		} finally {
			btn.disabled = false;
			btn.innerHTML = originalHTML;
		}
	}

	return {
		handleSubmit,
		showBookingSummary,
		_closeModal,
	};
}
