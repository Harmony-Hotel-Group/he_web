import type { SiteConfig } from "@/types/config-site";

/**
 * Genera el JSON-LD para el esquema de Hotel (schema.org/Hotel)
 * @param siteConfig - Configuración del sitio obtenida de src/data/config.json
 * @param path - Ruta actual de la página (para generar URL canónica)
 * @returns Objeto JSON-LD listo para ser stringificado e insertado en <script type="application/ld+json">
 */
export function generateHotelSchema(
  siteConfig: SiteConfig,
  path: string = "/"
): Record<string, unknown> {
  // Construir URL base del sitio
  const baseUrl =
    typeof import.meta.env.VERCEL_URL !== "undefined" && import.meta.env.VERCEL_URL
      ? `https://${import.meta.env.VERCEL_URL}`
      : "https://hotelensuenos.com";

  // Limpiar la path para evitar doble slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl.replace(/\/$/, "")}${cleanPath}`;

  // Extraer información de contacto
  const contactInfo = siteConfig.contactInfo || {};

  // Construir el esquema Hotel según schema.org
  const hotelSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: siteConfig.siteName || "Hotel Ensueños",
    url: url,
    telephone: contactInfo.whatsapp || "+593978888020",
    email: contactInfo.email || "reservas@hotelensueños.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address
        ? contactInfo.address.split(",")[0] // Tomamos solo la primera parte antes de la coma
        : "Gran Colombia 182 y Manuel Vega",
      addressLocality: "Cuenca",
      addressRegion: "Azuay",
      addressCountry: "EC",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-2.8976",
      longitude: "-78.9973",
    },
    checkinTime: "14:00",
    checkoutTime: "12:00",
    priceRange: "$25-$160", // Basado en los valores de las habitaciones en config.json
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Desayuno", value: true },
      {
        "@type": "LocationFeatureSpecification",
        name: "Estacionamiento",
        value: true,
      },
    ],
  };

  // Añadir logo/image si está disponible en el config o assets
  // Por ahora usamos una imagen por defecto, pero podría mejorarse
  hotelSchema["image"] = `${baseUrl.replace(/\/$/, "")}/open-graph.jpg`;

  return hotelSchema;
}