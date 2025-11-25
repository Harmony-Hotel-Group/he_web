import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "../services/logger";

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
	options?: { bypassCache?: boolean },
): Promise<T | null> {
	globalThis.__API_CACHE__ = globalThis.__API_CACHE__ || new Map();
	globalThis.__CACHE_CONTROL__ = globalThis.__CACHE_CONTROL__ || new Map();

	const GLOBAL_CACHE = globalThis.__API_CACHE__;
	const CACHE_CONTROL = globalThis.__CACHE_CONTROL__;
	const log = logger(processName);

	try {
		const now = Date.now();
		const cached = GLOBAL_CACHE.get(cacheKey);
		const fresh = !!cached && now - cached.timestamp < ONE_DAY_MS;

		// Check Cache Control Rules
		const globalRule = CACHE_CONTROL.get("ALL");
		const specificRule = CACHE_CONTROL.get(cacheKey);
		let controlBypass = false;

		const checkRule = (rule: CacheControlRule | undefined) => {
			if (!rule) return false;
			if (rule.disabledUntil && now < rule.disabledUntil) return true;
			if (rule.disabledCount && rule.disabledCount > 0) {
				rule.disabledCount--;
				return true;
			}
			return false;
		};

		if (checkRule(globalRule) || checkRule(specificRule)) {
			controlBypass = true;
			log.info("Cache bypass (Global/Specific Control)");
		}

		if (!controlBypass && !options?.bypassCache && fresh && cached?.data) {
			log.info("Data source: Cache (fresh)");
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
					log.info(`Data source: Upstream API (${upstreamUrl})`);
				}
			} catch (e) {
				log.warn("Upstream fetch failed. Will use fallback.", e);
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
			log.info("Data source: Cache (stale)");
			return cached.data as T;
		}

		const localData = await safeReadLocal<T>(localFile, processName);
		if (localData) {
			log.info("Data source: Local file");
			GLOBAL_CACHE.set(cacheKey, { data: localData, timestamp: now });
			return localData;
		}

		log.warn("No data source found.");
		return null;
	} catch (e) {
		log.error("Critical error in loadData:", e);
		return null;
	}
}

function json200<T>(data: T, _fromCache: boolean) {
	return new Response(JSON.stringify({ data }), {
		status: 200,
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
}

async function safeReadLocal<T>(
	localFile: string,
	processName: string,
): Promise<T | null> {
	const log = logger(processName);
	try {
		const buf = await fs.readFile(localFile, "utf-8");
		const json: unknown = JSON.parse(buf);
		const dataObj = json as { data?: T } | null;
		return (dataObj?.data ?? json) as T;
	} catch (e) {
		const error = e as { code?: string; message?: string };
		if (error?.code !== "ENOENT") {
			log.warn("Error reading local file:", error?.message || e);
		}
		return null;
	}
}

async function safeWriteLocal<T>(
	localFile: string,
	data: T,
	processName: string,
) {
	const log = logger(processName);
	try {
		if (process.env.VERCEL || process.env.NETLIFY) return;
		const content = JSON.stringify(data, null, 2);
		await fs.writeFile(localFile, content, "utf-8");
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		log.warn("Error writing local file:", error);
	}
}

async function ensureLocalDir(localFile: string) {
	try {
		await fs.mkdir(path.dirname(localFile), { recursive: true });
	} catch { }
}

function deepEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

interface CacheControlRule {
	disabledUntil?: number;
	disabledCount?: number;
}

declare global {
	var __CACHE_CONTROL__: Map<string, CacheControlRule> | undefined;
}

export function configureCacheControl(options: {
	action: "flush" | "disable";
	targets?: string[];
	duration?: number;
	count?: number;
}): { success: boolean; missingKeys?: string[] } {
	globalThis.__API_CACHE__ = globalThis.__API_CACHE__ || new Map();
	globalThis.__CACHE_CONTROL__ = globalThis.__CACHE_CONTROL__ || new Map();

	const GLOBAL_CACHE = globalThis.__API_CACHE__;
	const CACHE_CONTROL = globalThis.__CACHE_CONTROL__;

	const targets = options.targets && options.targets.length > 0 ? options.targets : ["ALL"];
	const missingKeys: string[] = [];

	// Validation: Check if targets exist (except ALL)
	for (const target of targets) {
		if (target !== "ALL" && !GLOBAL_CACHE.has(target)) {
			missingKeys.push(target);
		}
	}

	if (missingKeys.length > 0) {
		return { success: false, missingKeys };
	}

	if (options.action === "flush") {
		if (targets.includes("ALL")) {
			GLOBAL_CACHE.clear();
		} else {
			for (const target of targets) {
				GLOBAL_CACHE.delete(target);
			}
		}
		return { success: true };
	}

	if (options.action === "disable") {
		const rule: CacheControlRule = {};
		if (options.duration) {
			rule.disabledUntil = Date.now() + options.duration * 1000;
		}
		if (options.count) {
			rule.disabledCount = options.count;
		}

		for (const target of targets) {
			CACHE_CONTROL.set(target, rule);
		}
		return { success: true };
	}

	return { success: false };
}

export { loadData, json200 };
