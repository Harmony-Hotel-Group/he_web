import type { Room } from "@/types/rooms";
import { type ErpClient, erpClient } from "./erp.client";

export interface ErpRoomContract {
	id: string;
	name: string;
	type: string;
	description: string;
	pricePerNight: number;
	currency: string;
	image: string;
	amenities: string[];
	category: string;
}

export interface ErpRoomsResponse {
	items: ErpRoomContract[];
	total: number;
	source: "mock" | "real";
}

const ERP_ROOMS_MOCK: ErpRoomContract[] = [
	{
		id: "room-deluxe-king",
		name: "Deluxe King",
		type: "Suite",
		description: "Habitación amplia con cama king y vista panorámica.",
		pricePerNight: 140,
		currency: "USD",
		image: "src/assets/img/hotel/rooms/suite1/1.webp",
		amenities: ["WiFi", "Aire acondicionado", "Desayuno"],
		category: "Premium",
	},
	{
		id: "room-family",
		name: "Family Room",
		type: "Familiar",
		description: "Espacio ideal para familias con camas múltiples.",
		pricePerNight: 170,
		currency: "USD",
		image: "src/assets/img/hotel/rooms/quintuple_familiar/1.webp",
		amenities: ["WiFi", "TV", "Baño privado"],
		category: "Family",
	},
];

export function mapErpRoomToDomain(item: ErpRoomContract): Room {
	const localized = (text: string) => ({ es: text, en: text });

	return {
		id: item.id,
		name: localized(item.name),
		type: localized(item.type),
		description: localized(item.description),
		pricePerNight: item.pricePerNight,
		currency: item.currency,
		images: [
			{
				src: item.image,
				alt: localized(item.name),
			},
		],
		amenities: {
			es: item.amenities,
			en: item.amenities,
		},
		category: localized(item.category),
	};
}

export async function fetchErpRooms(
	client: ErpClient = erpClient,
): Promise<ErpRoomsResponse> {
	const data = await client.get<{ items: ErpRoomContract[] }>("/erp/rooms", {
		items: ERP_ROOMS_MOCK,
	});

	const items = Array.isArray(data?.items) ? data.items : ERP_ROOMS_MOCK;

	return {
		items,
		total: items.length,
		source: client.getMode(),
	};
}
