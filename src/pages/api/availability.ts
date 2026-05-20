import path from "node:path";
import type { APIContext } from "astro";
import { erpClient } from "@/services/erp/erp.client";
import { json200, loadData } from "@/utils/apiHelpers";
import { buildMockAvailabilityFromJson } from "@/domain/booking/availability.utils";

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
	const mock = buildMockAvailabilityFromJson(roomsData, checkin, checkout, roomId);

	const data = await erpClient.get<typeof mock>(
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
