// src/utils/csrf.ts
/**
 * Protección CSRF (Cross-Site Request Forgery)
 * Genera y valida tokens para proteger formularios
 */

import { logger } from '@/services/logger';

const log = logger('CSRF');

// Almacenamiento de tokens en memoria (para producción usar Redis o similar)
const tokenStore = new Map<string, { token: string; expires: number }>();

// Limpiar tokens expirados cada 10 minutos
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokenStore.entries()) {
        if (value.expires < now) {
            tokenStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

/**
 * Genera un token CSRF único
 * @param sessionId - Identificador de sesión (IP + User-Agent hash)
 * @returns Token CSRF
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hora de validez

    tokenStore.set(sessionId, { token, expires });

    log.info(`Token CSRF generado para sesión: ${sessionId.substring(0, 8)}...`);

    return token;
}

/**
 * Valida un token CSRF
 * @param sessionId - Identificador de sesión
 * @param token - Token a validar
 * @returns true si es válido, false si no
 */
export async function validateCSRFToken(sessionId: string, token: string): Promise<boolean> {
    const crypto = await import('crypto');
    
    if (!sessionId || !token) {
        log.warn('Intento de validación CSRF sin sessionId o token');
        return false;
    }

    const stored = tokenStore.get(sessionId);

    if (!stored) {
        log.warn(`Token CSRF no encontrado para sesión: ${sessionId.substring(0, 8)}...`);
        return false;
    }

    if (stored.expires < Date.now()) {
        log.warn(`Token CSRF expirado para sesión: ${sessionId.substring(0, 8)}...`);
        tokenStore.delete(sessionId);
        return false;
    }

    // Comparación constante para prevenir timing attacks
    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(stored.token),
            Buffer.from(token)
        );

        if (!isValid) {
            log.warn(`Token CSRF inválido para sesión: ${sessionId.substring(0, 8)}...`);
        }

        // Invalidar token después de usarlo (one-time use)
        tokenStore.delete(sessionId);

        return isValid;
    } catch {
        // Fallback para tokens de longitud diferente
        const isValid = stored.token === token;
        if (!isValid) {
            log.warn(`Token CSRF inválido para sesión: ${sessionId.substring(0, 8)}...`);
        }
        tokenStore.delete(sessionId);
        return isValid;
    }
}

/**
 * Genera un hash de sesión basado en IP y User-Agent
 * @param request - Request de Astro
 * @returns Hash de sesión
 */
export async function getSessionHash(request: Request): Promise<string> {
    const crypto = await import('crypto');
    
    // Obtener IP del cliente (considerando proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor 
        ? forwardedFor.split(',')[0].trim() 
        : 'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Crear hash único
    const data = `${ip}:${userAgent}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    
    return hash;
}

/**
 * Middleware para validar CSRF en actions
 * @param request - Request de Astro
 * @param formData - Datos del formulario
 * @returns true si es válido, lanza error si no
 */
export async function validateCSRFInAction(
    request: Request,
    formData: FormData
): Promise<boolean> {
    const sessionId = await getSessionHash(request);
    const token = formData.get('_csrf') as string;

    const isValid = await validateCSRFToken(sessionId, token);

    if (!isValid) {
        throw new Error('Token CSRF inválido o expirado');
    }

    return true;
}
