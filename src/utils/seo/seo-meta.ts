import type { SiteConfig } from "@/types/config-site";

/**
 * Resuelve la URL absoluta del sitio.
 * Usa Astro.site si está disponible, sino VERCEL_URL, sino un fallback.
 */
export function getSiteUrl(): string {
  // En entorno de Astro, Astro.site está disponible durante el build.
  // Pero estamos en un archivo .ts, así que usamos variables de entorno.
  // Nota: Este helper se usará en componentes .astro, donde Astro.site está disponible.
  // Sin embargo, para mantenerlo puro y reutilizable, lo dejamos así y lo adaptaremos en el componente.
  // En el componente .astro, podemos pasar Astro.site como prop o usarlo directamente.
  // Para ahora, usamos el mismo enfoque que en BaseLayout.astro.
  if (typeof Astro !== "undefined" && Astro.site) {
    return Astro.site.toString().replace(/\/$/, "");
  }
  const vercelUrl = import.meta.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return "https://hotelensuenos.com"; // fallback
}

/**
 * Construye una URL absoluta a partir de una ruta relativa y la URL del sitio.
 */
export function getAbsoluteUrl(path: string, siteUrl: string): string {
  // Aseguramos que la ruta comience con /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Evitamos doble slash
  return `${siteUrl.replace(/\/$/, "")}${cleanPath}`;
}

/**
 * Obtiene la imagen por defecto para OG/Twitter desde la configuración.
 */
export function getOgImage(
  ogImage: string | undefined,
  config: SiteConfig,
  siteUrl: string
): string {
  if (ogImage) {
    return getAbsoluteUrl(ogImage, siteUrl);
  }
  // Fallback a la primera imagen de las galerías o a un default
  // Por ahora, usamos una imagen por defecto del sitio
  return getAbsoluteUrl("/open-graph.jpg", siteUrl);
}

/**
 * Genera los meta tags básicos de SEO como un objeto para facilitar su uso.
 */
export function generateSeoMeta({
  title,
  description,
  lang,
  canonicalPath,
  ogImage,
  type = "website",
  noindex = false,
  publishedTime,
  structuredData,
}: {
  title: string;
  description: string;
  lang: "es" | "en";
  canonicalPath?: string;
  ogImage?: string;
  type?: "website" | "article" | "hotel";
  noindex?: boolean;
  publishedTime?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  const siteUrl = getSiteUrl();
  const cleanPath = canonicalPath || "/";
  const absoluteUrl = getAbsoluteUrl(cleanPath, siteUrl);
  const esUrl = `${siteUrl}${cleanPath}`;
  const enUrl = `${siteUrl}/en${cleanPath}`;
  const canonicalUrl =
    lang === "es"
      ? esUrl
      : enUrl; // Asumimos que el sitio está en es por defecto y en en la versión en inglés

  return {
    title,
    description,
    lang,
    canonicalUrl,
    esUrl,
    enUrl,
    ogImage: getOgImage(ogImage, {} as SiteConfig, siteUrl), // El config se pasará en el componente
    type,
    noindex,
    publishedTime,
    structuredData,
    siteUrl,
  };
}