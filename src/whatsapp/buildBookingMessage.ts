import type { BookingIntentV1 } from "@/contracts/booking.intent";

export function buildBookingMessage(intent: BookingIntentV1): string {
	const { stay, guests, room, extras } = intent.payload;

	return `
🛎️ *Solicitud de Reserva*

📅 Fechas:
- Check-in: ${stay.checkin}
- Check-out: ${stay.checkout}
- Noches: ${stay.nights}

👥 Huéspedes:
- Adultos: ${guests.adults}
${guests.children ? `- Niños: ${guests.children}` : ""}

🛏️ Habitación:
${room?.name ?? "Por definir"}

📝 Notas:
${extras?.notes ?? "Ninguna"}
`.trim();
}
