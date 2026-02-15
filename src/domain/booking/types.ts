export interface BookingProcessingData {
	checkin: string;
	checkout: string;
	nights: string | number;
	adults: string | number;
	children: string | number;
	rooms: string | number;
	breakfast: string;
}

export interface BookingVehicleItem {
	type: string;
	plate?: string;
}

export interface BuildBookingMessageInput {
	isGroupMode: boolean;
	dateRangeRaw?: string;
	groupAdults?: FormDataEntryValue | null;
	groupTeens?: FormDataEntryValue | null;
	groupKids?: FormDataEntryValue | null;
	groupInfants?: FormDataEntryValue | null;
	distributionLabel?: string | FormDataEntryValue | null;
	groupNotes?: FormDataEntryValue | null;
	processing?: BookingProcessingData;
	isVehicleChecked?: boolean;
	vehicleItems?: BookingVehicleItem[];
}
