/**
 * @file Servicio de Logger para Desarrollo
 *
 * Este módulo proporciona un sistema de logging controlado que solo funciona en modo de desarrollo.
 * Se configura a través de variables de entorno en un archivo `.env`.
 *
 * Variables de Entorno:
 * - `LOG_ENABLED`: Si se establece en `false`, deshabilita todos los logs. Por defecto es `true`.
 * - `LOG_CONTEXTS`: Una cadena de contextos separados por comas (ej: "Api,Translation").
 *                    Si no se define o es `*`, se mostrarán todos los logs.
 */

// --- Configuración ---

// Lee las variables de entorno. Vite las reemplaza en tiempo de compilación.
const isDev = import.meta.env.DEV;
const logEnabled = import.meta.env.LOG_ENABLED !== 'false'; // Habilitado a menos que sea explícitamente 'false'
const allowedContexts = (import.meta.env.LOG_CONTEXTS || '*').split(',').map(c => c.trim());

// --- Lógica Principal ---

/**
 * Decide si un log para un contexto específico debe mostrarse.
 * @param context - El contexto del log (ej: 'Api', 'MyComponent').
 * @returns `true` si el log está permitido.
 */
function shouldLog(context: string): boolean {
    // Solo loguear en modo de desarrollo y si el logger está habilitado globalmente
    if (!isDev || !logEnabled) {
        return false;
    }

    // Permitir si la lista de contextos incluye '*' (todos) o el contexto específico.
    return allowedContexts.includes('*') || allowedContexts.includes(context);
}

// --- Funciones Exportadas ---

/**
 * Registra un mensaje de log estándar si está permitido.
 * En el servidor, aparece en la terminal. En el cliente, en la consola del navegador.
 * @param context - El origen del mensaje (ej: 'MyComponent').
 * @param args - Los argumentos a mostrar, igual que en `console.log`.
 */
export function log(context: string, ...args: any[]) {
    if (shouldLog(context)) {
        console.log(`[${context}]`, ...args);
    }
}

/**
 * Registra una advertencia si está permitida.
 * @param context - El origen del mensaje.
 * @param args - Los argumentos a mostrar, igual que en `console.warn`.
 */
export function warn(context: string, ...args: any[]) {
    if (shouldLog(context)) {
        console.warn(`[${context}]`, ...args);
    }
}

/**
 * Registra un error si está permitido.
 * @param context - El origen del mensaje.
 * @param args - Los argumentos a mostrar, igual que en `console.error`.
 */
export function error(context: string, ...args: any[]) {
    if (shouldLog(context)) {
        console.error(`[${context}]`, ...args);
    }
}
