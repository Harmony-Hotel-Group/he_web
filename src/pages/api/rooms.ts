import path from "node:path";
import type { APIContext } from "astro";
import { json200, loadData } from "@/utils/apiHelpers";

const UPSTREAM_URL =
	import.meta.env.ROOMS_UPSTREAM_URL ??
	(import.meta.env.API_BASE_URL
		? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, "")}/rooms`
		: undefined);

const LOCAL_FILE = path.resolve(process.cwd(), "src", "data", "rooms.json");
const CACHE_KEY = "api.rooms.cache.entry";
const PROCESS_NAME = "api/rooms";

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
	const data = await loadData<any>(
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

	return json200(data, false);
}
