import { promises as fs } from 'node:fs';
import path from 'node:path';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
    data: any;
    timestamp: number
}

async function loadData<T>(
    cacheKey: string,
    localFile: string,
    upstreamUrl: string | undefined,
    processName: string
): Promise<T | null> {
    const GLOBAL_CACHE: Map<string, CacheEntry> = (globalThis as any).__API_CACHE__ || ((globalThis as any).__API_CACHE__ = new Map());
    try {
        const now = Date.now();
        const cached = GLOBAL_CACHE.get(cacheKey);
        const fresh = !!cached && (now - cached.timestamp) < ONE_DAY_MS;

        if (fresh && cached?.data) {
            if (import.meta.env.DEV) console.log(`[${processName}] Data source: Cache (fresh)`);
            return cached.data;
        }

        let upstreamData: any | null = null;
        if (upstreamUrl) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                const res = await fetch(upstreamUrl, {
                    signal: controller.signal,
                    headers: {'Accept': 'application/json'}
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const payload = await res.json().catch(() => null);
                    upstreamData = payload?.data ?? payload;
                    if (import.meta.env.DEV) console.log(`[${processName}] Data source: Upstream API (${upstreamUrl})`);
                }
            } catch (e) {
                if (import.meta.env.DEV) console.warn(`[${processName}] Upstream fetch failed. Will use fallback.`, e);
            }
        }

        if (upstreamData) {
            await ensureLocalDir(localFile);
            const localData = await safeReadLocal(localFile, processName);
            if (!deepEqual(localData, upstreamData)) {
                await safeWriteLocal(localFile, upstreamData, processName);
            }
            GLOBAL_CACHE.set(cacheKey, {data: upstreamData, timestamp: now});
            return upstreamData;
        }

        if (cached?.data) {
            if (import.meta.env.DEV) console.log(`[${processName}] Data source: Cache (stale)`);
            return cached.data;
        }

        const localData = await safeReadLocal(localFile, processName);
        if (localData) {
            if (import.meta.env.DEV) console.log(`[${processName}] Data source: Local file`);
            GLOBAL_CACHE.set(cacheKey, {data: localData, timestamp: now});
            return localData;
        }

        console.warn(`[${processName}] No data source found.`);
        return null;

    } catch (e) {
        console.error(`[${processName}] Critical error in loadData:`, e);
        return null;
    }
}

function json200(data: any, fromCache: boolean) {
    return new Response(JSON.stringify({data}), {
        status: 200,
        headers: {'Content-Type': 'application/json; charset=utf-8'}
    })

    // return new Response(JSON.stringify({data, meta: {fromCache, maxAgeSeconds: 86400}}), {
    //     status: 200,
    //     headers: {
    //         'Content-Type': 'application/json; charset=utf-8',
    //         'Cache-Control': 'public, max-age=86400',
    //     },
    // });
}

async function safeReadLocal(localFile: string, processName: string): Promise<any | null> {
    try {
        const buf = await fs.readFile(localFile, 'utf-8');
        const json = JSON.parse(buf);
        return json?.data ?? json;
    } catch (e: any) {
        if (e?.code !== 'ENOENT') {
            console.warn(`[${processName}] Error reading local file:`, e?.message || e);
        }
        return null;
    }
}

async function safeWriteLocal(localFile: string, data: any, processName: string) {
    try {
        if (process.env.VERCEL || process.env.NETLIFY) return;
        const content = JSON.stringify(data, null, 2);
        await fs.writeFile(localFile, content, 'utf-8');
    } catch (e: any) {
        console.warn(`[${processName}] Error writing local file:`, e?.message || e);
    }
}

async function ensureLocalDir(localFile: string) {
    try {
        await fs.mkdir(path.dirname(localFile), {recursive: true});
    } catch {
    }
}

function deepEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export { loadData, json200 };
