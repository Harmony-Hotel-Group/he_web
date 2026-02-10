export interface BookingIntent {
	type: "room" | "tour";
	itemId: string;
	itemName: string;
	checkIn?: string;
	checkOut?: string;
	guests?: number;
	message: string;
}
