import path from "node:path";
import type { APIContext } from "astro";
import { json200, loadData } from "@/utils/apiHelpers";

const UPSTREAM_URL =
	import.meta.env.CONFIG_UPSTREAM_URL ??
	(import.meta.env.API_BASE_URL
		? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, "")}/config`
		: undefined);

const LOCAL_FILE = path.resolve(process.cwd(), "src", "data", "config.json");
const CACHE_KEY = "api.config.cache.entry";
const PROCESS_NAME = "api/config";

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
	const data = await loadData<any>(
		CACHE_KEY,
		LOCAL_FILE,
		UPSTREAM_URL,
		PROCESS_NAME,
	);

	if (!data) {
		return new Response(JSON.stringify({ error: "Config not found" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	}

	return json200(data, false);
}
