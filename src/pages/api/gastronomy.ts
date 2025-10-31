import type { APIContext } from 'astro';
import path from 'node:path';
import { loadData, json200 } from '../../utils/apiHelpers';

const UPSTREAM_URL = import.meta.env.GASTRONOMY_UPSTREAM_URL
  ?? (import.meta.env.API_BASE_URL ? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, '')}/gastronomy` : undefined);

const LOCAL_FILE = path.resolve(process.cwd(), 'src', 'data', 'gastronomy.json');
const CACHE_KEY = 'api.gastronomy.cache.entry';
const PROCESS_NAME = 'api/gastronomy';

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
    const data = await loadData<any>(CACHE_KEY, LOCAL_FILE, UPSTREAM_URL, PROCESS_NAME);

    if (!data) {
        return new Response(JSON.stringify({ error: 'Gastronomy not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'no-store',
            },
        });
    }

    return json200(data, false);
}
