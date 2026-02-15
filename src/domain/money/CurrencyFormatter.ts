/**
 * Utilidades para formateo de moneda y precios
 */

/**
 * Formatea un precio según el idioma y moneda especificados
 * @param price - Precio numérico
 * @param currency - Código ISO de moneda (USD, EUR, GTQ, etc.)
 * @param lang - Código de idioma (es, en)
 * @returns string - Precio formateado
 * 
 * @example
 * formatPrice(100, "USD", "es") // "$100"
 * formatPrice(1500.50, "GTQ", "en") // "Q1,501"
 */
export function formatPrice(
    price: number,
    currency: string,
    lang: string = "es"
): string {
    const locale = lang === "en" ? "en-US" : "es-ES";

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
}

/**
 * Formatea un rango de precios
 * @param minPrice - Precio mínimo
 * @param maxPrice - Precio máximo
 * @param currency - Código ISO de moneda
 * @param lang - Código de idioma
 * @returns string - Rango formateado (ej: "$100 - $200")
 * 
 * @example
 * formatPriceRange(100, 200, "USD", "es") // "$100 - $200"
 */
export function formatPriceRange(
    minPrice: number,
    maxPrice: number,
    currency: string,
    lang: string = "es"
): string {
    const min = formatPrice(minPrice, currency, lang);
    const max = formatPrice(maxPrice, currency, lang);
    return `${min} - ${max}`;
}
