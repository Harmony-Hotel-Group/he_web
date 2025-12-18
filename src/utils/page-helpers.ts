/**
 * Utilidades para páginas Astro - manejo de idioma y configuración
 */
import { api } from "@/services/api.ts";
import type { SiteConfig } from "@/types/config";
import type { AstroGlobal } from "astro";

/**
 * Determina el idioma basado en la URL de Astro
 * @param astro - Objeto global de Astro
 * @returns "es" | "en" - Código de idioma detectado
 * 
 * @example
 * const lang = getLangFromUrl(Astro); // "es" o "en"
 */
export function getLangFromUrl(astro: AstroGlobal): "es" | "en" {
    return astro.url.pathname.startsWith("/en") ? "en" : "es";
}

/**
 * Obtiene la configuración del sitio con el idioma detectado automáticamente
 * @param astro - Objeto global de Astro
 * @returns Promise con idioma y configuración del sitio
 * 
 * @example
 * const { lang, config } = await getPageConfig(Astro);
 */
export async function getPageConfig(
    astro: AstroGlobal
): Promise<{ lang: "es" | "en"; config: SiteConfig }> {
    const lang = getLangFromUrl(astro);
    const config = (await api.fetch("config", { params: { lang } })) as SiteConfig;

    return { lang, config };
}

/**
 * Obtiene la configuración del sitio para un idioma específico
 * @param lang - Código de idioma ("es" | "en")
 * @returns Promise con la configuración del sitio
 * 
 * @example
 * const config = await getConfigForLang("es");
 */
export async function getConfigForLang(lang: "es" | "en"): Promise<SiteConfig> {
    return (await api.fetch("config", { params: { lang } })) as SiteConfig;
}
