import type { APIContext } from 'astro';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Configuración de origen opcional: si se define, se intentará refrescar 1 vez al día.
const UPSTREAM_URL = import.meta.env.CONFIG_UPSTREAM_URL
  ?? (import.meta.env.API_BASE_URL ? `${String(import.meta.env.API_BASE_URL).replace(/\/$/, '')}/config` : undefined);

// Nombre de archivo local derivado del endpoint: api/config => src/data/config.json
const LOCAL_FILE = path.resolve(process.cwd(), 'src', 'data', 'config.json');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cache en memoria por proceso
interface CacheEntry { data: any; timestamp: number }
const CACHE_KEY = 'api.config.cache.entry';
const GLOBAL_CACHE: Map<string, CacheEntry> = (globalThis as any).__API_CACHE__ || ((globalThis as any).__API_CACHE__ = new Map());

export const prerender = false; // SSR runtime

export async function GET(_ctx: APIContext) {
  try {
    const now = Date.now();
    const cached = GLOBAL_CACHE.get(CACHE_KEY);
    const fresh = !!cached && (now - cached.timestamp) < ONE_DAY_MS;

    // 1) Responder desde caché si está fresco
    if (fresh && cached?.data) {
      return json200(cached.data, true);
    }

    // 2) Intentar obtener desde el upstream si hay URL configurada
    let upstreamData: any | null = null;
    if (UPSTREAM_URL) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(UPSTREAM_URL, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
        clearTimeout(timeout);

        if (res.ok) {
          const payload = await res.json().catch(() => null);
          upstreamData = payload?.data ?? payload;
        }
      } catch (_) {
        // Ignorar, se hará fallback a caché/local
      }
    }

    if (upstreamData) {
      // 2a) Actualizar archivo local si hay cambios
      await ensureLocalDir();
      const localData = await safeReadLocal();
      if (!deepEqual(localData, upstreamData)) {
        await safeWriteLocal(upstreamData);
      }
      GLOBAL_CACHE.set(CACHE_KEY, { data: upstreamData, timestamp: now });
      return json200(upstreamData, false);
    }

    // 3) Sin upstream o falló: usar caché aunque esté vencido
    if (cached?.data) {
      return json200(cached.data, true);
    }

    // 4) Fallback definitivo: leer archivo local
    const localData = await safeReadLocal();
    if (localData) {
      GLOBAL_CACHE.set(CACHE_KEY, { data: localData, timestamp: now });
      return json200(localData, false);
    }

    // 5) Nada disponible
    return new Response(JSON.stringify({ error: 'Config not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to load config' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}

// ---------------- Helpers ----------------
function json200(data: any, fromCache: boolean) {
  return new Response(JSON.stringify({ data, meta: { fromCache, maxAgeSeconds: 86400 } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

async function safeReadLocal(): Promise<any | null> {
  try {
    const buf = await fs.readFile(LOCAL_FILE, 'utf-8');
    const json = JSON.parse(buf);
    return json?.data ?? json;
  } catch (e: any) {
    if (e?.code !== 'ENOENT') {
      console.warn('[api/config] Error reading local file:', e?.message || e);
    }
    return null;
  }
}

async function safeWriteLocal(data: any) {
  try {
    // En plataformas serverless, la escritura no es persistente; evita intentarlo
    if (process.env.VERCEL || process.env.NETLIFY) return;
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(LOCAL_FILE, content, 'utf-8');
  } catch (e: any) {
    console.warn('[api/config] Error writing local file:', e?.message || e);
  }
}

async function ensureLocalDir() {
  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  } catch {}
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}
