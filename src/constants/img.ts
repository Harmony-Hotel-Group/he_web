/**
 * @file Constantes para recursos de imagen
 * Centraliza el acceso a todas las imágenes en src/assets/img
 */

import type { ImageMetadata } from "astro";

// Definimos tipos estrictos para nuestras categorías de imágenes basados en la estructura de archivos
// Usamos 'Record<string, any>' porque TypeScript no puede conocer los nombres de archivo exactos
// en tiempo de compilación sin generación de código, pero podemos estructurar la exportación.

// Usar carga inmediata (eager loading) para banderas e íconos que son pequeños y usados frecuentemente
const GLOB_FLAGS = import.meta.glob<{ default: ImageMetadata }>("/src/assets/img/flags/*.{svg,png,jpg,jpeg,webp}", { eager: true });
const GLOB_CURRENTS = import.meta.glob<{ default: ImageMetadata }>("/src/assets/img/currents/*.{svg,png,jpg,jpeg,webp}", { eager: true });

// Usar glob estándar para colecciones más grandes si queremos soportar carga perezosa (lazy),
// pero el usuario solicitó que la información esté "cargada".
// Por simplicidad y sensación de "caché global", usamos eager por ahora.
// Dado que son "constantes", eager es lo más directo para accesos tipo IMGS.HOTEL.FACADE.
const GLOB_HOTEL = import.meta.glob<{ default: ImageMetadata }>("/src/assets/img/hotel/**/*.{svg,png,jpg,jpeg,webp}", { eager: true });
const GLOB_CITIES = import.meta.glob<{ default: ImageMetadata }>("/src/assets/img/cities/**/*.{svg,png,jpg,jpeg,webp}", { eager: true });

/**
 * Función auxiliar para limpiar rutas y extensiones, dejando claves simples
 * ej. "/src/assets/img/flags/us.svg" -> "US"
 * ej. "/src/assets/img/hotel/facade/sun.png" -> "FACADE_SUN" (dependiendo de la lógica)
 */
function formatKeys(minimized: boolean = true) {
    return (acc: Record<string, ImageMetadata>, [path, module]: [string, { default: ImageMetadata }]) => {
        const fileName = path.split('/').pop()?.split('.')[0] || '';
        // Si queremos soporte de estructura anidada, necesitaríamos lógica más compleja.
        // Por ahora, mapeamos por nombre de archivo (riesgo de colisión si es plano) o ruta relativa.

        let key = fileName;

        // Si no está minimizado, podríamos mantener estructura de carpetas (lógica futura)
        if (!minimized) {
            // Lógica para mantener estructura
        }

        acc[key.toUpperCase()] = module.default;
        return acc;
    };
}

// Procesar colecciones planas
export const FLAGS = Object.entries(GLOB_FLAGS).reduce(formatKeys(), {} as Record<string, ImageMetadata>);
export const CURRENTS = Object.entries(GLOB_CURRENTS).reduce(formatKeys(), {} as Record<string, ImageMetadata>);

// Para carpetas anidadas como hotel/facade/sun.png, el nombre simple 'SUN' podría colisionar.
// Implementamos una clave más plana con prefijo de carpeta para los anidados.
function formatNestedKeys(rootPath: string) {
    return (acc: Record<string, ImageMetadata>, [path, module]: [string, { default: ImageMetadata }]) => {
        // Remover ruta base, ej: /src/assets/img/hotel/
        const relative = path.replace(rootPath, '');
        // "facade/sun.png" -> "FACADE_SUN"
        const key = relative.replace(/\.[^/.]+$/, "").replace(/\//g, "_").toUpperCase();
        acc[key] = module.default;
        return acc;
    };
}

// Procesar colecciones anidadas
export const HOTEL = Object.entries(GLOB_HOTEL).reduce(formatNestedKeys("/src/assets/img/hotel/"), {} as Record<string, ImageMetadata>);
export const CITIES = Object.entries(GLOB_CITIES).reduce(formatNestedKeys("/src/assets/img/cities/"), {} as Record<string, ImageMetadata>);

// Colección global plana (ASSETS) que contiene TODO
// Útil si se quiere buscar dinámicamente sin saber la categoría
export const ASSETS = {
    ...FLAGS,
    ...CURRENTS,
    ...HOTEL,
    ...CITIES,
};

// Instancia Global jerárquica
export const IMGS = {
    ASSETS,
    FLAGS,
    CURRENTS,
    HOTEL,
    CITIES,
};

export default IMGS;
