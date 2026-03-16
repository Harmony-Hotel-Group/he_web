/**
 * src/adapters/erp/erp-sync.adapter.ts
 * 
 * Adapter de sincronización para el sistema ERP.
 * Maneja la lectura de datos del ERP y los cachea en archivos JSON locales.
 * 
 * Flujo:
 * 1. Intenta obtener datos del ERP (si está disponible)
 * 2. Si el ERP falla o no está configurado, usa los datos locales JSON
 * 3. Cachea la respuesta del ERP en JSON para uso offline
 */

import type { 
  ERPRoom, 
  ERPTour, 
  ERPDestination, 
  ERPGastronomy,
  ERPHotelData,
  ERPResponse,
  ERPConfig 
} from '@/contracts/erp.contract';
import { logger } from '@/services/logger';
import fs from 'node:fs';
import path from 'node:path';

const log = logger('erp:sync');

/**
 * Configuración del ERP
 */
const erpConfig: ERPConfig = {
  baseUrl: import.meta.env.PUBLIC_ERP_BASE_URL || '',
  timeout: parseInt(import.meta.env.PUBLIC_ERP_TIMEOUT_MS || '5000'),
  mode: (import.meta.env.PUBLIC_ERP_MODE as 'mock' | 'real') || 'mock',
  cacheDuration: parseInt(import.meta.env.PUBLIC_ERP_TIMEOUT_MS || '300000'), // 5 min default
};

/**
 * Rutas de los archivos JSON locales
 */
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

const LOCAL_DATA_FILES = {
  rooms: path.join(DATA_DIR, 'rooms.json'),
  tours: path.join(DATA_DIR, 'tours.json'),
  destinations: path.join(DATA_DIR, 'destinations.json'),
  gastronomy: path.join(DATA_DIR, 'gastronomy.json'),
};

/**
 * Directorio de cache
 */
const CACHE_DIR = path.join(process.cwd(), '.cache', 'erp');

/**
 * Lee datos desde un archivo JSON local
 */
async function readLocalData<T>(filePath: string): Promise<T | null> {
  try {
    if (!fs.existsSync(filePath)) {
      log.warn(`Archivo local no encontrado: ${filePath}`);
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    log.error(`Error leyendo archivo local ${filePath}:`, error);
    return null;
  }
}

/**
 * Escribe datos al cache
 */
async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    const cacheData = {
      data,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + erpConfig.cacheDuration).toISOString(),
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    log.info(`Cache escrito para: ${key}`);
  } catch (error) {
    log.error(`Error escribiendo cache ${key}:`, error);
  }
}

/**
 * Lee datos desde el cache
 */
async function readCache<T>(key: string): Promise<T | null> {
  try {
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    
    if (!fs.existsSync(cacheFile)) {
      return null;
    }
    
    const content = fs.readFileSync(cacheFile, 'utf-8');
    const cacheData = JSON.parse(content);
    
    // Verificar si el cache ha expirado
    if (new Date(cacheData.expiresAt) < new Date()) {
      log.info(`Cache expirado para: ${key}`);
      return null;
    }
    
    log.info(`Cache leído para: ${key}`);
    return cacheData.data as T;
  } catch (error) {
    log.error(`Error leyendo cache ${key}:`, error);
    return null;
  }
}

/**
 * Obtiene datos del ERP (si está disponible)
 */
async function fetchFromERP<T>(endpoint: string): Promise<ERPResponse<T> | null> {
  if (erpConfig.mode === 'mock' || !erpConfig.baseUrl) {
    log.info(`ERP en modo mock, omitiendo llamada HTTP para: ${endpoint}`);
    return null;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), erpConfig.timeout);
    
    const response = await fetch(`${erpConfig.baseUrl}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(erpConfig.apiKey && { 'Authorization': `Bearer ${erpConfig.apiKey}` }),
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`ERP response: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    log.error(`Error fetching from ERP ${endpoint}:`, error);
    return null;
  }
}

/**
 * Obtiene habitaciones
 */
export async function getRooms(): Promise<ERPRoom[]> {
  // 1. Intentar leer del cache
  const cachedRooms = await readCache<ERPRoom[]>('rooms');
  if (cachedRooms) {
    return cachedRooms;
  }
  
  // 2. Intentar obtener del ERP
  const erpResponse = await fetchFromERP<ERPRoom[]>('/rooms');
  if (erpResponse?.data) {
    await writeCache('rooms', erpResponse.data);
    return erpResponse.data;
  }
  
  // 3. Usar datos locales
  const localRooms = await readLocalData<ERPRoom[]>(LOCAL_DATA_FILES.rooms);
  return localRooms || [];
}

/**
 * Obtiene tours
 */
export async function getTours(): Promise<ERPTour[]> {
  const cachedTours = await readCache<ERPTour[]>('tours');
  if (cachedTours) {
    return cachedTours;
  }
  
  const erpResponse = await fetchFromERP<ERPTour[]>('/tours');
  if (erpResponse?.data) {
    await writeCache('tours', erpResponse.data);
    return erpResponse.data;
  }
  
  const localTours = await readLocalData<ERPTour[]>(LOCAL_DATA_FILES.tours);
  return localTours || [];
}

/**
 * Obtiene destinos
 */
export async function getDestinations(): Promise<ERPDestination[]> {
  const cached = await readCache<ERPDestination[]>('destinations');
  if (cached) {
    return cached;
  }
  
  const erpResponse = await fetchFromERP<ERPDestination[]>('/destinations');
  if (erpResponse?.data) {
    await writeCache('destinations', erpResponse.data);
    return erpResponse.data;
  }
  
  const local = await readLocalData<ERPDestination[]>(LOCAL_DATA_FILES.destinations);
  return local || [];
}

/**
 * Obtiene gastronomía
 */
export async function getGastronomy(): Promise<ERPGastronomy[]> {
  const cached = await readCache<ERPGastronomy[]>('gastronomy');
  if (cached) {
    return cached;
  }
  
  const erpResponse = await fetchFromERP<ERPGastronomy[]>('/gastronomy');
  if (erpResponse?.data) {
    await writeCache('gastronomy', erpResponse.data);
    return erpResponse.data;
  }
  
  const local = await readLocalData<ERPGastronomy[]>(LOCAL_DATA_FILES.gastronomy);
  return local || [];
}

/**
 * Obtiene todos los datos del hotel (para pre-carga)
 */
export async function getAllHotelData(): Promise<ERPHotelData> {
  const [rooms, tours, destinations, gastronomy] = await Promise.all([
    getRooms(),
    getTours(),
    getDestinations(),
    getGastronomy(),
  ]);
  
  return {
    rooms,
    tours,
    destinations,
    gastronomy,
    metadata: {
      lastSync: new Date().toISOString(),
      version: '1.0.0',
      totalRecords: rooms.length + tours.length + destinations.length + gastronomy.length,
    },
  };
}

/**
 * Fuerza la actualización del cache desde el ERP
 */
export async function refreshCache(): Promise<void> {
  log.info('Forzando actualización del cache...');
  
  const [rooms, tours, destinations, gastronomy] = await Promise.all([
    fetchFromERP<ERPRoom[]>('/rooms'),
    fetchFromERP<ERPTour[]>('/tours'),
    fetchFromERP<ERPDestination[]>('/destinations'),
    fetchFromERP<ERPGastronomy[]>('/gastronomy'),
  ]);
  
  if (rooms?.data) await writeCache('rooms', rooms.data);
  if (tours?.data) await writeCache('tours', tours.data);
  if (destinations?.data) await writeCache('destinations', destinations.data);
  if (gastronomy?.data) await writeCache('gastronomy', gastronomy.data);
  
  log.info('Cache actualizado correctamente');
}

/**
 * Obtiene el estado de sincronización
 */
export function getSyncStatus() {
  return {
    mode: erpConfig.mode,
    baseUrl: erpConfig.baseUrl,
    cacheDir: CACHE_DIR,
  };
}
