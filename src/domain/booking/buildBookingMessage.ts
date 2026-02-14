import type { BuildBookingMessageInput } from "./types";

function parseDateRange(dateRangeRaw: string): {
	checkIn: string;
	checkOut: string;
	nightsCount: string;
} {
	let checkIn = "N/A";
	let checkOut = "N/A";
	let nightsCount = "N/A";

	if (dateRangeRaw.includes("➜")) {
		const parts = dateRangeRaw.split("➜").map((p) => p.trim());
		checkIn = parts[0];
		const rightPart = parts[1];

		if (rightPart && rightPart.includes("(")) {
			const subParts = rightPart.split("(").map((p) => p.trim());
			checkOut = subParts[0];
			nightsCount = subParts[1]
				.replace(")", "")
				.replace("noches", "")
				.replace("noche", "")
				.trim();
		} else {
			checkOut = rightPart;
		}
	} else if (dateRangeRaw.includes(" to ")) {
		const parts = dateRangeRaw.split(" to ");
		checkIn = parts[0];
		checkOut = parts[1] || "N/A";
	} else {
		checkIn = dateRangeRaw;
	}

	return { checkIn, checkOut, nightsCount };
}

export function buildBookingMessage(input: BuildBookingMessageInput): string {
	let message = "";

	if (input.isGroupMode) {
		const parsed = parseDateRange(input.dateRangeRaw || "");
		message = `
*Estimado Hotel Ensueños por favor necesito que me ayude con una reserva de GRUPO:*

➢ Check In: ${parsed.checkIn}
➢ Check Out: ${parsed.checkOut}
➢ Cantidad de Noches: ${parsed.nightsCount}
➢ Adultos: ${input.groupAdults}
➢ Adolescentes: ${input.groupTeens}
➢ Niños: ${input.groupKids}
➢ Infantes: ${input.groupInfants}
➢ Distribución: ${input.distributionLabel}
➢ Desayuno incluido: ${input.processing?.breakfast === "on" ? "Sí" : "No"}
`;

		if (input.groupNotes) {
			message += `\n➢ Petición Especial: ${input.groupNotes}`;
		}
	} else {
		message = `
*Estimado Hotel Ensueños por favor necesito que me ayude con una reserva:*

➢ Check In: ${input.processing?.checkin}
➢ Check Out: ${input.processing?.checkout}
➢ Cantidad de Noches: ${input.processing?.nights}
➢ Adultos: ${input.processing?.adults}
➢ Niños: ${input.processing?.children}
➢ Habitaciones: ${input.processing?.rooms}
➢ Desayuno incluido: ${input.processing?.breakfast === "true" ? "Sí" : "No"}`;
	}

	if (input.isVehicleChecked && input.vehicleItems?.length) {
		message += `\n➢ *Vehículos:*`;
		input.vehicleItems.forEach((item, index) => {
			if (item.type) {
				message += `\n   ${index + 1}. Tipo: ${item.type}, Placa: ${item.plate || "N/A"}`;
			}
		});
	}

	message += `\n\nSi hace falta información adicional, por favor responder a este mensaje.`;
	return message;
}
