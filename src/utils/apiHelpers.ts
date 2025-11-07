import { promises as fs } from "node:fs";
import path from "node:path";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

declare global {
	var __API_CACHE__: Map<string, CacheEntry<unknown>> | undefined;
}

async function loadData<T>(
	cacheKey: string,
	localFile: string,
	upstreamUrl: string | undefined,
	processName: string,
): Promise<T | null> {
	globalThis.__API_CACHE__ = globalThis.__API_CACHE__ || new Map();
	const GLOBAL_CACHE = globalThis.__API_CACHE__;
	try {
		const now = Date.now();
		const cached = GLOBAL_CACHE.get(cacheKey);
		const fresh = !!cached && now - cached.timestamp < ONE_DAY_MS;

		if (fresh && cached?.data) {
			if (import.meta.env.DEV)
				console.log(`[${processName}] Data source: Cache (fresh)`);
			return cached.data as T;
		}

		let upstreamData: T | null = null;
		if (upstreamUrl) {
			try {
				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), 5000);
				const res = await fetch(upstreamUrl, {
					signal: controller.signal,
					headers: { Accept: "application/json" },
				});
				clearTimeout(timeout);

				if (res.ok) {
					const payload: unknown = await res.json().catch(() => null);
					const dataObj = payload as { data?: T } | null;
					upstreamData = (dataObj?.data ?? payload) as T;
					if (import.meta.env.DEV)
						console.log(
							`[${processName}] Data source: Upstream API (${upstreamUrl})`,
						);
				}
			} catch (e) {
				if (import.meta.env.DEV)
					console.warn(
						`[${processName}] Upstream fetch failed. Will use fallback.`,
						e,
					);
			}
		}

		if (upstreamData) {
			await ensureLocalDir(localFile);
			const localData = await safeReadLocal<T>(localFile, processName);
			if (!deepEqual(localData, upstreamData)) {
				await safeWriteLocal(localFile, upstreamData, processName);
			}
			GLOBAL_CACHE.set(cacheKey, { data: upstreamData, timestamp: now });
			return upstreamData;
		}

		if (cached?.data) {
			if (import.meta.env.DEV)
				console.log(`[${processName}] Data source: Cache (stale)`);
			return cached.data as T;
		}

		const localData = await safeReadLocal<T>(localFile, processName);
		if (localData) {
			if (import.meta.env.DEV)
				console.log(`[${processName}] Data source: Local file`);
			GLOBAL_CACHE.set(cacheKey, { data: localData, timestamp: now });
			return localData;
		}

		console.warn(`[${processName}] No data source found.`);
		return null;
	} catch (e) {
		console.error(`[${processName}] Critical error in loadData:`, e);
		return null;
	}
}

function json200<T>(data: T, _fromCache: boolean) {
	return new Response(JSON.stringify({ data }), {
		status: 200,
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});

	// return new Response(JSON.stringify({data, meta: {fromCache, maxAgeSeconds: 86400}}), {
	//     status: 200,
	//     headers: {
	//         'Content-Type': 'application/json; charset=utf-8',
	//         'Cache-Control': 'public, max-age=86400',
	//     },
	// });
}

async function safeReadLocal<T>(
	localFile: string,
	processName: string,
): Promise<T | null> {
	try {
		const buf = await fs.readFile(localFile, "utf-8");
		const json: unknown = JSON.parse(buf);
		const dataObj = json as { data?: T } | null;
		return (dataObj?.data ?? json) as T;
	} catch (e) {
		const error = e as { code?: string; message?: string };
		if (error?.code !== "ENOENT") {
			console.warn(
				`[${processName}] Error reading local file:`,
				error?.message || e,
			);
		}
		return null;
	}
}

async function safeWriteLocal<T>(
	localFile: string,
	data: T,
	processName: string,
) {
	try {
		if (process.env.VERCEL || process.env.NETLIFY) return;
		const content = JSON.stringify(data, null, 2);
		await fs.writeFile(localFile, content, "utf-8");
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		console.warn(`[${processName}] Error writing local file:`, error);
	}
}

async function ensureLocalDir(localFile: string) {
	try {
		await fs.mkdir(path.dirname(localFile), { recursive: true });
	} catch {}
}

function deepEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export { loadData, json200 };
