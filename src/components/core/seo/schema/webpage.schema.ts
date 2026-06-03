/**
 * Genera el JSON-LD para el esquema de WebPage (schema.org/WebPage)
 * @param props - Propiedades de la página: name, description, etc.
 * @returns Objeto JSON-LD listo para ser stringificado e insertado en <script type="application/ld+json">
 */
export function generateWebPageSchema(
  props: Record<string, unknown>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    ...props,
  };
}