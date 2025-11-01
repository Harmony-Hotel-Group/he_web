// api.service.ts

/**
 * Opciones de configuración para el constructor de ApiService.
 */
interface ApiServiceOptions {
    baseUrl: string;
    timeout?: number; // en milisegundos
}

/**
 * Opciones para una solicitud de `fetchData`.
 */
interface FetchOptions {
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

/**
 * Una clase para interactuar con la API, encapsulando la lógica de fetching,
 * timeouts y fallbacks.
 */
export class Api {
    private readonly baseUrl: string;
    private readonly apiTimeout: number;
    private readonly isDev: boolean;

    constructor(options: ApiServiceOptions) {
        if (!options.baseUrl) {
            throw new Error("ApiService requiere una 'baseUrl' en las opciones.");
        }
        this.baseUrl = options.baseUrl;
        this.apiTimeout = options.timeout ?? 8000; // Default a 8 segundos
        this.isDev = import.meta.env.DEV;
    }

    // ============== Métodos Públicos ==============

    /**
     * Busca un único conjunto de datos desde la API.
     * @template T El tipo esperado de los datos de respuesta.
     * @param key La clave del endpoint (ej. 'config', 'rooms').
     * @param opts Opciones adicionales como parámetros de consulta y cabeceras.
     * @returns Una promesa que resuelve con los datos o null.
     */
    public async fetchData<T>(key: string, opts: FetchOptions = {}): Promise<T | null> {
        const { params, headers } = opts;
        const endpoint = this.keyToEndpoint(key);
        const url = new URL(`/api/${endpoint}`, this.baseUrl);

        if (params && typeof params === 'object') {
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== null) {
                    url.searchParams.set(k, String(v));
                }
            }
        }

        try {
            const res = await this.fetchWithTimeout(url.toString(), {
                headers: { Accept: 'application/json', ...(headers || {}) },
            });
            if (!res.ok) {
                throw new Error(`Error HTTP ${res.status}`);
            }
            const payload = await res.json().catch(() => null);
            // Asumimos que la API envuelve los datos en una propiedad `data`
            return (payload?.data ?? payload ?? null) as T | null;
        } catch (e: any) {
            // Intenta leer un archivo local como fallback si está disponible
            const local = await this.readLocalFallback<T>(endpoint);
            if (local != null) return local;

            if (this.isDev) {
                console.warn(`[ApiService] Fallback para '${endpoint}' falló:`, e?.message || e);
            }
            return null;
        }
    }

    /**
     * Busca múltiples conjuntos de datos en paralelo.
     * @template T El tipo esperado de los datos de respuesta.
     * @param inputs Un array de claves o un mapa de clave -> opciones.
     * @returns Un objeto con los datos solicitados, usando las claves proporcionadas.
     */
    public async fetchMultipleData<T = any>(
        inputs: string[] | Record<string, FetchOptions>
    ): Promise<Record<string, T | null | Error>> {
        let entries: [string, FetchOptions][];

        if (Array.isArray(inputs)) {
            entries = inputs.map((key) => [key, {}]);
        } else if (inputs && typeof inputs === 'object' && !Array.isArray(inputs)) {
            entries = Object.entries(inputs);
        } else {
            throw new Error("fetchMultipleData espera un array o un objeto.");
        }

        const promises = entries.map(([key, opt]) =>
            this.fetchData<T>(key, opt).then(
                (data) => ({ key, data }),
                (error) => ({ key, error })
            )
        );

        const settled = await Promise.all(promises);

        return settled.reduce<Record<string, T | null | Error>>((acc, result) => {
            if ('error' in result) {
                acc[result.key] = result.error;
            } else {
                acc[result.key] = result.data;
            }
            return acc;
        }, {});
    }


    // ============== Helpers Privados ==============

    /**
     * Envuelve fetch con un timeout usando AbortController.
     */
    private async fetchWithTimeout(
        url: RequestInfo,
        options: RequestInit = {},
        timeout?: number
    ): Promise<Response> {
        const controller = new AbortController();
        const resolvedTimeout = timeout ?? this.apiTimeout;
        const id = setTimeout(() => controller.abort(), resolvedTimeout);

        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    }

    /**
     * Limpia una clave para usarla como endpoint.
     */
    private keyToEndpoint(key: string): string {
        return key.replace(/^\/+|\/+$/g, '');
    }

    /**
     * Placeholder para la lógica de fallback a datos locales.
     * Deberías implementar esto para que lea desde archivos locales si es necesario.
     */
    private async readLocalFallback<T>(endpoint: string): Promise<T | null> {
        if (this.isDev) {
            console.log(`[ApiService] Buscando fallback local para '${endpoint}'... (no implementado)`);
        }
        // Lógica para leer un archivo JSON local, ej:
        try {
          const res = await fetch(`/data/${endpoint}.json`);
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
        return null; // Retorna null si no hay fallback
    }
}

// ============== Ejemplo de Uso ==============
/*
// En algún lugar de tu aplicación (por ejemplo, un archivo de configuración central)
export const api = new ApiService({
  baseUrl: 'https://tu-dominio.com',
  timeout: 10000, // 10 segundos (opcional)
});

// En un componente o página
import { api } from './ruta/al/api.service';

interface Room {
  id: number;
  name: string;
}

async function loadRooms() {
  const rooms = await api.fetchData<Room[]>('rooms', { params: { lang: 'es' } });
  if (rooms) {
    console.log('Habitaciones cargadas:', rooms);
  }
}

async function loadInitialData() {
    const data = await api.fetchMultipleData({
        config: {},
        rooms: { params: { featured: true } },
        events: { params: { limit: 5 } }
    });
    console.log('Datos iniciales:', data);
    // data.config, data.rooms, data.events
}

loadRooms();
loadInitialData();
*/