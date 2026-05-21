import path from "node:path";
import type { APIContext } from "astro";
import { buildMockAvailabilityFromJson } from "@/domain/availability.utils";
import { diffNights, toUtcDate } from "@/domain/date.utils";
import { erpClient } from "@/services/erp/erp.client";
import { json200, loadData } from "@/utils/apiHelpers";

const ROOMS_FILE = path.resolve(process.cwd(), "src", "data", "rooms.json");

export const prerender = false; // SSR runtime

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
			{
				status: 400,
				headers: { "Content-Type": "application/json; charset=utf-8" },
			},
		);
	}

	const nights = diffNights(checkinDate, checkoutDate);
	if (nights <= 0) {
		return new Response(
			JSON.stringify({ error: "checkout debe ser mayor a checkin." }),
			{
				status: 400,
				headers: { "Content-Type": "application/json; charset=utf-8" },
			},
		);
	}

	// Mock response centralizado en dominio
	const roomsData = await loadData<any[]>(
		"api.rooms",
		ROOMS_FILE,
		undefined,
		"api/availability",
	);
	const safeRooms = roomsData ?? [];
	const mock = buildMockAvailabilityFromJson(
		safeRooms,
		checkin,
		checkout,
		roomId,
	);

	const data = await erpClient.get<typeof mock>("/availability", mock, {
		params: {
			checkin,
			checkout,
			roomId: roomId || undefined,
			currency,
		},
	});

	return json200(data, false);
}
