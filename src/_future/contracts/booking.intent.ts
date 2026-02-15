// src/contracts/booking.intent.ts

export type BookingChannel = "WHATSAPP";
export type BookingSource = "WEB";
export type BookingIntentType = "ROOM_BOOKING";

export interface BookingIntentV1 {
	version: "1.0";
	type: BookingIntentType;
	source: BookingSource;
	channel: BookingChannel;

	locale: "es" | "en" | "fr";
	currency: "USD" | "EUR";

	createdAt: string; // ISO

	payload: {
		stay: {
			checkin: string; // YYYY-MM-DD
			checkout: string; // YYYY-MM-DD
			nights: number;
		};

		guests: {
			adults: number;
			children?: number;
		};

		room: {
			id?: string;
			name?: string;
			category?: string;
		};

		customer?: {
			name?: string;
			phone?: string;
			email?: string;
			country?: string;
		};

		extras?: {
			tours?: string[];
			notes?: string;
		};
	};
}
