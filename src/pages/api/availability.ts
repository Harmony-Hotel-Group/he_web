import type { APIContext } from "astro";
import { json200 } from "@/utils/apiHelpers";
import { erpClient } from "@/services/erp/erp.client";
import { loadData } from "@/utils/apiHelpers";
import path from "node:path";

interface AvailabilityPrice {
	perNight: number;
	total: number;
	label?: string;
	discountPercent?: number;
}

interface AvailabilityRoom {
	id: string;
	name?: string;
	available: number;
	prices: {
		base: AvailabilityPrice;
		withBreakfast: AvailabilityPrice;
		promo?: AvailabilityPrice;
	};
}

interface AvailabilityResponse {
	checkin: string;
	checkout: string;
	nights: number;
	currency: string;
	rooms: AvailabilityRoom[];
	source?: "mock" | "real";
}

const ROOMS_FILE = path.resolve(process.cwd(), "src", "data", "rooms.json");

export const prerender = false; // SSR runtime

function isValidDateString(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toUtcDate(value: string): Date | null {
	if (!isValidDateString(value)) return null;
	const [y, m, d] = value.split("-").map(Number);
	if (!y || !m || !d) return null;
	const date = new Date(Date.UTC(y, m - 1, d));
	return Number.isNaN(date.getTime()) ? null : date;
}

function diffNights(checkin: Date, checkout: Date): number {
	const MS_PER_DAY = 24 * 60 * 60 * 1000;
	return Math.floor((checkout.getTime() - checkin.getTime()) / MS_PER_DAY);
}

async function buildMockResponse(
	checkin: string,
	checkout: string,
	nights: number,
	roomId?: string | null,
): Promise<AvailabilityResponse> {
	const roomsData = await loadData<any[]>(
		"api.rooms",
		ROOMS_FILE,
		undefined,
		"api/availability",
	);
	const safeRooms = Array.isArray(roomsData) ? roomsData : [];
	const filtered = roomId
		? safeRooms.filter((room) => String(room.id) === String(roomId))
		: safeRooms;

	const rooms: AvailabilityRoom[] = filtered.map((room) => {
		const basePerNight = Number(room.pricePerNight ?? 0);
		const withBreakfastPerNight = basePerNight + 8; // mock: desayuno +$8
		return {
			id: String(room.id),
			name: room.name?.es || room.name?.en,
			available: 1,
			prices: {
				base: { perNight: basePerNight, total: basePerNight * nights },
				withBreakfast: {
					perNight: withBreakfastPerNight,
					total: withBreakfastPerNight * nights,
				},
			},
		};
	});

	return {
		checkin,
		checkout,
		nights,
		currency: "USD",
		rooms,
		source: "mock",
	};
}

export async function GET(ctx: APIContext) {
	const { searchParams } = ctx.url;
	const checkin = searchParams.get("checkin") || "";
	const checkout = searchParams.get("checkout") || "";
	const roomId = searchParams.get("roomId");
	const currency = searchParams.get("currency") || undefined;

	const checkinDate = toUtcDate(checkin);
	const checkoutDate = toUtcDate(checkout);

	if (!checkinDate || !checkoutDate) {
		return new Response(
			JSON.stringify({ error: "Fechas inválidas. Usa YYYY-MM-DD." }),
			{ status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } },
		);
	}

	const nights = diffNights(checkinDate, checkoutDate);
	if (nights <= 0) {
		return new Response(
			JSON.stringify({ error: "checkout debe ser mayor a checkin." }),
			{ status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } },
		);
	}

	const mock = await buildMockResponse(checkin, checkout, nights, roomId);

	const data = await erpClient.get<AvailabilityResponse>(
		"/availability",
		mock,
		{
			params: {
				checkin,
				checkout,
				roomId: roomId || undefined,
				currency,
			},
		},
	);

	return json200(data, false);
}
