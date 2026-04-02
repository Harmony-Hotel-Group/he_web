// src/utils/rateLimit.ts
/**
 * Rate Limiting para prevenir abuso de formularios
 * Implementa límite de peticiones por IP
 */

import { logger } from '@/services/logger';

const log = logger('RateLimit');

// Almacenamiento de intentos por IP
const requestStore = new Map<string, { count: number; resetTime: number }>();

// Limpiar store cada minuto
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestStore.entries()) {
        if (value.resetTime < now) {
            requestStore.delete(key);
        }
    }
}, 60 * 1000);

export interface RateLimitOptions {
    /** Número máximo de peticiones permitidas */
    limit: number;
    /** Ventana de tiempo en segundos */
    window: number;
    /** Mensaje de error personalizado */
    message?: string;
}

/**
 * Obtiene la IP del cliente considerando proxies
 * @param request - Request de Astro
 * @returns IP del cliente
 */
export function getClientIP(request: Request): string {
    // Verificar headers de proxy
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Tomar la primera IP (la del cliente original)
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback: IP desconocida
    return 'unknown';
}

/**
 * Verifica si una IP ha excedido el límite de peticiones
 * @param ip - IP del cliente
 * @param action - Nombre de la acción (contact, booking, etc.)
 * @param options - Opciones de rate limiting
 * @returns true si está dentro del límite, false si excedió
 */
export async function rateLimit(
    ip: string,
    action: string,
    options: RateLimitOptions = { limit: 5, window: 60 }
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
    const { limit, window: windowSeconds } = options;
    const windowMs = windowSeconds * 1000;
    
    const key = `${ip}:${action}`;
    const now = Date.now();
    
    const existing = requestStore.get(key);
    
    if (!existing) {
        // Primera petición
        requestStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        log.info(`Rate limit: ${action} - 1/${limit} para IP ${ip.substring(0, 8)}...`);
        return { allowed: true };
    }
    
    // Ventana expirada, resetear
    if (existing.resetTime < now) {
        requestStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        log.info(`Rate limit: ${action} - ventana reseteada para IP ${ip.substring(0, 8)}...`);
        return { allowed: true };
    }
    
    // Ventana activa, verificar límite
    if (existing.count >= limit) {
        const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
        log.warn(
            `Rate limit excedido: ${action} - ${existing.count}/${limit} para IP ${ip.substring(0, 8)}...`
        );
        return { allowed: false, retryAfter };
    }
    
    // Incrementar contador
    existing.count++;
    requestStore.set(key, existing);
    
    log.info(`Rate limit: ${action} - ${existing.count}/${limit} para IP ${ip.substring(0, 8)}...`);
    return { allowed: true };
}

/**
 * Middleware para aplicar rate limiting en actions
 * @param request - Request de Astro
 * @param action - Nombre de la acción
 * @param options - Opciones de rate limiting
 * @throws Error si excede el límite
 */
export async function applyRateLimit(
    request: Request,
    action: string,
    options: RateLimitOptions = { limit: 5, window: 60 }
): Promise<void> {
    const ip = getClientIP(request);
    const result = await rateLimit(ip, action, options);
    
    if (!result.allowed) {
        const message = options.message || 
            `Demasiadas peticiones. Por favor espera ${result.retryAfter} segundos antes de intentar de nuevo.`;
        throw new Error(message);
    }
}

/**
 * Decorador para aplicar rate limiting a actions
 * @param action - Nombre de la acción
 * @param options - Opciones de rate limiting
 */
export function withRateLimit(action: string, options?: RateLimitOptions) {
    return async function (request: Request) {
        await applyRateLimit(request, action, options);
    };
}

// Límites predefinidos
export const presets = {
    // Formularios generales (contacto, newsletter)
    form: { limit: 5, window: 60 } as RateLimitOptions, // 5 por minuto
    
    // Reservas (más restrictivo)
    booking: { limit: 3, window: 60 } as RateLimitOptions, // 3 por minuto
    
    // Login/autenticación
    auth: { limit: 5, window: 300 } as RateLimitOptions, // 5 por 5 minutos
    
    // API endpoints
    api: { limit: 100, window: 60 } as RateLimitOptions, // 100 por minuto
};
