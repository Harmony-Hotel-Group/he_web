import type { Page } from "@astrojs/sitemap";

/**
 * Genera el JSON-LD para el esquema de BreadcrumbList (schema.org/BreadcrumbList)
 * @param items - Array de objetos con { name: string, path: string }
 * @returns Objeto JSON-LD listo para ser stringificado e insertado en <script type="application/ld+json">
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
): Record<string, unknown> {
  const listItemElements = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.path, // Asumimos que ya es una URL absoluta
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItemElements,
  };
}