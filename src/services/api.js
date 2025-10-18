// src/utils/apiService.js
import {promises as fs} from "node:fs";
import path from "node:path";

// Configuración
const CONFIG = {
    API_BASE_URL: import.meta.env.API_BASE_URL,
    MAILGUN_API_KEY: import.meta.env.MAILGUN_API_KEY,
    ADMIN_EMAIL: import.meta.env.ADMIN_EMAIL,
    SENDER_EMAIL: import.meta.env.SENDER_EMAIL || 'no-reply@yourdomain.com',
    MAILGUN_DOMAIN: import.meta.env.MAILGUN_DOMAIN,
    IS_DEBUG_MODE: import.meta.env.DEBUG === 'true',
    STATUS_CHECK_INTERVAL: parseInt(import.meta.env.STATUS_CHECK_INTERVAL_MINUTES || '5') * 60 * 1000,
    DATA_UPDATE_INTERVAL: 60 * 60 * 1000, // 1 hora
    API_TIMEOUT: 5000, // 5 segundos timeout
    MAX_CACHE_SIZE: 50 // Máximo de items en cache
};

// Estado global con estructura mejorada
const state = {
    lastStatusCheck: {time: 0, result: null},
    apiCache: new Map(), // Usar Map para mejor performance
    localCache: new Map(),
    pendingRequests: new Map() // Para evitar duplicate requests
};

// ==================== UTILIDADES ====================

/**
 * Fetch con timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = CONFIG.API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
    }
}

/**
 * Limpia el cache si excede el tamaño máximo (LRU simple)
 */
function cleanCache(cache) {
    if (cache.size > CONFIG.MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        console.log(`Cache cleaned: removed ${firstKey}`);
    }
}

/**
 * Verifica si un cache entry está expirado
 */
function isCacheExpired(cacheEntry, maxAge) {
    if (!cacheEntry) return true;
    return Date.now() - cacheEntry.timestamp > maxAge;
}

// ==================== NOTIFICACIONES ====================

/**
 * Envía notificación al admin (con debounce para evitar spam)
 */
const notificationQueue = new Map();

async function sendAdminNotification(subject, text) {
    // Debounce: evitar enviar la misma notificación múltiples veces
    const key = `${subject}:${text}`;
    const lastSent = notificationQueue.get(key);
    if (lastSent && Date.now() - lastSent < 300000) { // 5 minutos
        console.log('Notification debounced:', subject);
        return;
    }

    if (CONFIG.IS_DEBUG_MODE) {
        console.log('🐛 DEBUG MODE: Skipping notification');
        console.log('📧 Subject:', subject);
        console.log('📝 Text:', text);
        return;
    }

    if (!CONFIG.MAILGUN_API_KEY || !CONFIG.ADMIN_EMAIL || !CONFIG.MAILGUN_DOMAIN) {
        console.warn('⚠️ Mailgun not configured. Skipping notification.');
        return;
    }

    const mailgunUrl = `https://api.mailgun.net/v3/${CONFIG.MAILGUN_DOMAIN}/messages`;

    try {
        const response = await fetchWithTimeout(mailgunUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`api:${CONFIG.MAILGUN_API_KEY}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                from: `Admin <${CONFIG.SENDER_EMAIL}>`,
                to: CONFIG.ADMIN_EMAIL,
                subject: subject,
                text: text
            }).toString()
        }, 10000); // 10 segundos para emails

        if (response.ok) {
            console.log('✅ Admin notification sent');
            notificationQueue.set(key, Date.now());
        } else {
            console.error('❌ Failed to send notification:', response.status);
        }
    } catch (error) {
        console.error('❌ Error sending notification:', error.message);
    }
}

// ==================== API STATUS ====================

/**
 * Verifica el status de la API con cache inteligente
 */
async function checkApiStatus() {
    const now = Date.now();
    const lastCheck = state.lastStatusCheck;

    // Cache hit: retornar resultado anterior si está dentro del intervalo
    if (now - lastCheck.time < CONFIG.STATUS_CHECK_INTERVAL && lastCheck.result !== null) {
        console.log(`📦 Using cached API status: ${lastCheck.result ? 'UP' : 'DOWN'}`);
        return lastCheck.result;
    }

    console.log('🔍 Checking API status...');

    try {
        const response = await fetchWithTimeout(`${CONFIG.API_BASE_URL}/status`);

        const isUp = response.ok;
        state.lastStatusCheck = {time: now, result: isUp};

        if (isUp) {
            console.log('✅ API Status: UP');
        } else {
            console.error(`❌ API Status: ERROR (${response.status})`);
            await sendAdminNotification(
                'Alerta: API de Servicio Caída',
                `El endpoint /status retornó código ${response.status}.\nURL: ${CONFIG.API_BASE_URL}/status\nTimestamp: ${new Date().toISOString()}`
            );
        }

        return isUp;
    } catch (error) {
        console.error('❌ API Status: Network Error', error.message);
        state.lastStatusCheck = {time: now, result: false};

        await sendAdminNotification(
            'Alerta: Error de Red con la API',
            `No se pudo conectar con la API.\nURL: ${CONFIG.API_BASE_URL}/status\nError: ${error.message}\nTimestamp: ${new Date().toISOString()}`
        );

        return false;
    }
}

// ==================== DATA LOADING ====================

/**
 * Carga datos locales de forma ASÍNCRONA
 */
async function getLocalData(dataType) {
    // Check cache primero
    const cached = state.localCache.get(dataType);
    if (cached && !isCacheExpired(cached, CONFIG.DATA_UPDATE_INTERVAL)) {
        console.log(`📦 Using cached local data for: ${dataType}`);
        return cached.data;
    }

    const localFileName = dataType.replace(/\//g, '-');
    const localFilePath = path.join(process.cwd(), "src", "data", `${localFileName}.json`);

    try {
        console.log(`📂 Reading local file: ${localFileName}.json`);

        // ASÍNCRONO - no bloquea el event loop
        const content = await fs.readFile(localFilePath, "utf-8");
        const data = JSON.parse(content);

        // Cache el resultado
        state.localCache.set(dataType, {
            data,
            timestamp: Date.now()
        });
        cleanCache(state.localCache);

        console.log(`✅ Local data loaded: ${dataType}`);
        return data;
    } catch (error) {
        console.error(`❌ Error reading local file for ${dataType}:`, error.message);
        return null;
    }
}

/**
 * Obtiene datos de la API
 */
async function getApiData(dataType) {
    try {
        console.log(`🌐 Fetching from API: ${dataType}`);

        const response = await fetchWithTimeout(`${CONFIG.API_BASE_URL}/${dataType}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache el resultado exitoso
        state.apiCache.set(dataType, {
            data,
            timestamp: Date.now()
        });
        cleanCache(state.apiCache);

        console.log(`✅ API data fetched: ${dataType}`);
        return data;
    } catch (error) {
        console.error(`❌ Error fetching from API (${dataType}):`, error.message);
        throw error;
    }
}

/**
 * Estrategia principal de fetching con fallbacks inteligentes
 */
async function fetchData(dataType) {
    // Evitar duplicate requests
    if (state.pendingRequests.has(dataType)) {
        console.log(`⏳ Waiting for pending request: ${dataType}`);
        return state.pendingRequests.get(dataType);
    }

    const fetchPromise = (async () => {
        try {
            const apiIsUp = await checkApiStatus();

            // 1. Si la API está UP, intentar obtener de la API
            if (apiIsUp) {
                const cached = state.apiCache.get(dataType);

                // Si tenemos cache válido, retornarlo
                if (cached && !isCacheExpired(cached, CONFIG.DATA_UPDATE_INTERVAL)) {
                    console.log(`📦 Using cached API data: ${dataType}`);
                    return cached.data;
                }

                // Intentar fetch de API
                try {
                    return await getApiData(dataType);
                } catch (apiError) {
                    console.warn(`⚠️ API fetch failed, falling back to cache or local`);

                    // Fallback 1: Retornar cache expirado si existe
                    if (cached) {
                        console.log(`📦 Using stale cache: ${dataType}`);
                        return cached.data;
                    }

                    // Fallback 2: Data local
                    const localData = await getLocalData(dataType);
                    if (localData) {
                        return localData;
                    }

                    throw new Error(`No data available for ${dataType}`);
                }
            }

            // 2. Si la API está DOWN, usar cache de API si existe
            const cached = state.apiCache.get(dataType);
            if (cached) {
                console.log(`📦 API down, using cached API data: ${dataType}`);
                return cached.data;
            }

            // 3. Último recurso: data local
            console.log(`📂 API down, loading local data: ${dataType}`);
            const localData = await getLocalData(dataType);
            if (localData) {
                return localData;
            }

            throw new Error(`No data available for ${dataType}`);
        } finally {
            state.pendingRequests.delete(dataType);
        }
    })();

    state.pendingRequests.set(dataType, fetchPromise);
    return fetchPromise;
}

/**
 * Fetch múltiples tipos de datos en paralelo
 */
async function fetchMultipleData(dataTypes) {
    console.log(`🔄 Fetching multiple data types: ${dataTypes.join(', ')}`);

    const results = await Promise.allSettled(
        dataTypes.map(type => fetchData(type))
    );

    return dataTypes.reduce((acc, type, index) => {
        const result = results[index];
        acc[type] = result.status === 'fulfilled' ? result.value : null;

        if (result.status === 'rejected') {
            console.error(`❌ Failed to fetch ${type}:`, result.reason);
        }

        return acc;
    }, {});
}

/**
 * Limpia todos los caches (útil para testing o mantenimiento)
 */
function clearAllCaches() {
    state.apiCache.clear();
    state.localCache.clear();
    state.pendingRequests.clear();
    state.lastStatusCheck = {time: 0, result: null};
    console.log('🧹 All caches cleared');
}

// ==================== EXPORTS ====================

export {
    fetchData,
    fetchMultipleData,
    checkApiStatus,
    clearAllCaches
};