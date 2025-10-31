import type { APIContext } from 'astro';
import path from 'node:path';
import { loadData, json200 } from '../../utils/apiHelpers';

const UPSTREAM_URL = import.meta.env.DESTINATIONS_UPSTREAM_URL
  ?? (import.meta.env.API_BASE_URL ? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, '')}/destinations` : undefined);

const LOCAL_FILE = path.resolve(process.cwd(), 'src', 'data', 'destinations.json');
const CACHE_KEY = 'api.destinations.cache.entry';
const PROCESS_NAME = 'api/destinations';

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
    const data = await loadData<any>(CACHE_KEY, LOCAL_FILE, UPSTREAM_URL, PROCESS_NAME);

    if (!data) {
        return new Response(JSON.stringify({ error: 'Destinations not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'no-store',
            },
        });
    }

    return json200(data, false);
}
