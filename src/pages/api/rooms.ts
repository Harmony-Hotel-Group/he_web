import path from "node:path";
import type { APIContext } from "astro";
import { json200, loadData } from "@/utils/apiHelpers";

interface Room {
	id: string;
	[key: string]: unknown;
}

interface ConfigRoom {
	id: string;
	value?: number;
	currency?: string;
}

interface SiteConfig {
	rooms?: ConfigRoom[];
}

const UPSTREAM_URL =
	import.meta.env.ROOMS_UPSTREAM_URL ??
	(import.meta.env.API_BASE_URL
		? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, "")}/rooms`
		: undefined);

const LOCAL_FILE = path.resolve(process.cwd(), "src", "data", "rooms.json");
const CONFIG_FILE = path.resolve(process.cwd(), "src", "data", "config.json");
const CACHE_KEY = "api.rooms";
const CONFIG_CACHE_KEY = "api.config";
const PROCESS_NAME = "api/rooms";

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
	const data = await loadData<Room[]>(
		CACHE_KEY,
		LOCAL_FILE,
		UPSTREAM_URL,
		PROCESS_NAME,
	);

	if (!data) {
		return new Response(JSON.stringify({ error: "Rooms not found" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	}

	// Sync prices from config.json when available
	const config = await loadData<SiteConfig>(
		CONFIG_CACHE_KEY,
		CONFIG_FILE,
		undefined,
		"api/config",
	);

	if (config?.rooms && Array.isArray(config.rooms)) {
		const priceMap = new Map(
			config.rooms.map((r) => [r.id, { value: r.value, currency: r.currency }]),
		);
		const merged = data.map((room) => {
			const match = priceMap.get(String(room.id));
			if (!match) return room;
			return {
				...room,
				pricePerNight:
					typeof match.value === "number"
						? match.value
						: (room.pricePerNight as number),
				currency: match.currency || room.currency,
			};
		});
		return json200(merged, false);
	}

	return json200(data, false);
}
