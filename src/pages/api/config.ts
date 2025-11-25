import path from "node:path";
import type { APIContext } from "astro";
import { logger } from "@/services/logger";
import type { SiteConfig } from "@/types/config";
import { json200, loadData } from "@/utils/apiHelpers";

const log = logger("ApiConfig");

const UPSTREAM_URL =
	import.meta.env.CONFIG_UPSTREAM_URL ??
	(import.meta.env.API_BASE_URL
		? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, "")}/config`
		: undefined);

const LOCAL_FILE = path.resolve(process.cwd(), "src", "data", "config.json");
const CACHE_KEY = "api.config";
const PROCESS_NAME = "api/config";

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
	log.info("Request received for site configuration.");

	log.info("Attempting to load configuration data...", {
		cacheKey: CACHE_KEY,
		localFile: LOCAL_FILE,
		upstreamUrl: UPSTREAM_URL,
	});

	const bypassCache =
		import.meta.env.DEV || _ctx.url.searchParams.has("nocache");

	if (bypassCache) {
		log.info("Cache bypass enabled.");
	}

	const data = await loadData<SiteConfig>(
		CACHE_KEY,
		LOCAL_FILE,
		UPSTREAM_URL,
		PROCESS_NAME,
		{ bypassCache },
	);

	if (!data) {
		log.error("Failed to load configuration data. No data found.");
		return new Response(JSON.stringify({ error: "Config not found" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	}

	log.info("Configuration data loaded successfully. Sending response.");
	return json200(data, false);
}
