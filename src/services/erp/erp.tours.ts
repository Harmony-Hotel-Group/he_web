import type { Tour } from "@/types/tour";
import { erpClient, type ErpClient } from "./erp.client";

export interface ErpTourContract {
	id: string;
	name: string;
	description: string;
	price?: number;
	image: string;
	active: boolean;
}

export interface ErpToursResponse {
	items: ErpTourContract[];
	total: number;
	source: "mock" | "real";
}

const ERP_TOURS_MOCK: ErpTourContract[] = [
	{
		id: "tour-galapagos-full-day",
		name: "Tour Galápagos Full Day",
		description: "Excursión de día completo con guía local y actividades en playa.",
		price: 120,
		image: "src/assets/img/cities/cuenca/calderon-catedral.webp",
		active: true,
	},
	{
		id: "tour-isabela-adventure",
		name: "Aventura Isabela",
		description: "Recorrido por túneles de lava, senderos y puntos de avistamiento.",
		price: 95,
		image: "src/assets/img/destinations/nature_reserves/el_cajas_park.webp",
		active: true,
	},
];

export function mapErpTourToDomain(item: ErpTourContract): Tour {
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		price: item.price,
		image: item.image,
		active: item.active,
	};
}

export async function fetchErpTours(client: ErpClient = erpClient): Promise<ErpToursResponse> {
	const data = await client.get<{ items: ErpTourContract[] }>(
		"/erp/tours",
		{ items: ERP_TOURS_MOCK },
	);

	const items = Array.isArray(data?.items) ? data.items : ERP_TOURS_MOCK;

	return {
		items,
		total: items.length,
		source: client.getMode(),
	};
}
