import type { BookingIntent } from "@/types/booking";

export function createBookingIntent(params: {
	type: "room" | "tour";
	itemId: string;
	itemName: string;
	checkIn?: string;
	checkOut?: string;
	guests?: number;
}): BookingIntent {
	const message = [
		`Solicitud de ${params.type === "room" ? "Habitación" : "Tour"}`,
		`Nombre: ${params.itemName}`,
		params.checkIn ? `Check-in: ${params.checkIn}` : null,
		params.checkOut ? `Check-out: ${params.checkOut}` : null,
		params.guests ? `Huéspedes: ${params.guests}` : null,
	]
		.filter(Boolean)
		.join("\n");

	return {
		...params,
		message,
	};
}
